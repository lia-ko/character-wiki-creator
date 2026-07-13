/* ============ STATIC READER RENDERER ============
   Pure functions: entry + template + context -> self-contained reader HTML.
   Mirrors the editor layouts (split / hero / infobox / outline) read-only.
   Powers both the in-app Preview and the .zip exporter. No Svelte, no editing. */

import { esc, richToParas, richToLine } from './richtext.js';
import { templateFor, ENTRY_TYPES, FAMILIES } from './templates.js';
import { coverOf, imgSrc, imgPos, bodySectionsOf } from './model.js';
import { paletteVars, palById, fontVars, fontFaceCSS } from './theme.js';
import { embedUrl, embedHeight } from './spotify.js';
import { READER_CSS } from './exportcss.js';

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'sec';

/* ctx: { href(id)->string|null, cover(id)->string|null, events:[{id,title,date,year}], hubHref, crumb } */

function galleryHTML(imgs){
  if (!imgs || !imgs.length) return '';
  const slides = imgs.map((s, i) => `<div class="cslide${i === 0 ? ' on' : ''}"><img src="${esc(imgSrc(s))}" alt="" style="object-position:${esc(imgPos(s))}"></div>`).join('');
  const nav = imgs.length > 1 ? `<div class="cnav"><button type="button" class="cbtn cprev">&lsaquo;</button><span class="ccount">1 / ${imgs.length}</span><button type="button" class="cbtn cnext">&rsaquo;</button></div>` : '';
  return `<div class="carousel"><div class="cstage" data-idx="0">${slides}</div>${nav}</div>`;
}
function statsHTML(rows){
  const r = (rows || []).filter(s => s && s.k).map(s => `<div class="r"><span class="k">${esc(s.k)}</span><span class="v">${s.v ? esc(s.v) : '<span class="empty">—</span>'}</span></div>`).join('');
  return r ? `<div class="stats">${r}</div>` : '';
}
function sectionsHTML(list, ctx){
  return (list || []).map(s => `<h3 id="${esc(slug(s.h))}">${esc(s.h || 'Section')}</h3>${richToParas(s.body, ctx)}`).join('');
}
function relName(r, ctx){ const nm = esc(r.name || '—'); const h = r.targetId && ctx.href(r.targetId); return h ? `<a href="${esc(h)}">${nm}</a>` : nm; }
function relImg(r, ctx){ return r.img || (r.targetId && ctx.cover && ctx.cover(r.targetId)) || ''; }

function relationsHTML(list, sec, ctx){
  if (!list || !list.length) return '<p class="empty">Nothing here yet.</p>';
  return `<div class="rels">` + list.map((r, i) => {
    const img = relImg(r, ctx);
    const thumb = `<span class="rthumb"${img ? ` style="background-image:url(${esc(img)})"` : ''}></span>`;
    const port = `<div class="rport"${img ? ` style="background-image:url(${esc(img)})"` : ''}></div>`;
    const meta = esc([r.role, r.status].filter(Boolean).join(' · '));
    return `<details class="rel"${i === 0 ? ' open' : ''}><summary>${thumb}<span class="rwho"><span class="rnm">${relName(r, ctx)}</span>${meta ? `<span class="rmeta">${meta}</span>` : ''}</span><span class="chev"></span></summary><div class="rbody">${port}<div class="rtxt">${richToParas(r.body, ctx)}</div></div></details>`;
  }).join('') + `</div>`;
}
// scale badge: `level` pips (0–4) on a rarity ramp + a free-text label
const BADGE_RAMP = ['var(--faint)', 'var(--faint)', '#3f9d6d', '#8a5a2b', '#9a3324'];
function badgeHTML(level, label){
  const lv = Math.max(0, Math.min(4, level | 0));
  const has = label && String(label).trim();
  if (!lv && !has) return '';
  const pips = [0, 1, 2, 3].map(i => `<i class="pip${i < lv ? ' on' : ''}"></i>`).join('');
  return `<span class="fgbadge" style="--bc:${BADGE_RAMP[lv] || 'var(--faint)'}"><span class="pips">${pips}</span>${has ? `<span class="blabel">${esc(label)}</span>` : ''}</span>`;
}
// field-guide catalog: cards grouped by `group`, each with a scale badge + link-out
function catalogHTML(list, ctx){
  if (!list || !list.length) return '<p class="empty">Nothing here yet.</p>';
  const order = [], groups = {};
  for (const it of list){ const g = (it.group || '').trim(); if (!(g in groups)){ groups[g] = []; order.push(g); } groups[g].push(it); }
  const card = (r) => {
    const img = relImg(r, ctx);
    const link = r.targetId && ctx.href(r.targetId);
    return `<article class="fgc">`
      + `<div class="fgthumb"${img ? ` style="background-image:url(${esc(img)})"` : ''}></div>`
      + `<div class="fgbody"><div class="fgtop"><span class="fgname">${relName(r, ctx)}</span>${badgeHTML(r.level, r.badge)}</div>`
      + (r.kind ? `<div class="fgkind">${esc(r.kind)}</div>` : '')
      + `<div class="fgdesc">${richToParas(r.body, ctx)}</div>`
      + (link ? `<a class="fglink" href="${esc(link)}">Open entry &rarr;</a>` : '')
      + `</div></article>`;
  };
  return order.map(g => {
    const head = g ? `<h3 class="fggh">${esc(g)} <span class="fgct">${groups[g].length}</span></h3>` : '';
    return `<div class="fggroup">${head}<div class="fggrid">${groups[g].map(card).join('')}</div></div>`;
  }).join('');
}
// header scale: labelled cells with one marked current
function meterHTML(v, sec){
  const levels = (v && v.levels) || []; if (!levels.length) return '';
  const at = (v.at | 0);
  const label = sec && sec.label ? `<span class="mlabel">${esc(sec.label)}</span>` : '';
  return `<div class="meter">${label}<div class="mcells">${levels.map((l, i) => `<span class="mcell${i === at ? ' on' : ''}${i < at ? ' below' : ''}">${esc(l)}</span>`).join('')}</div></div>`;
}
// source notes: chapter spine → typed notes + placeable plates
const NOTE_META = {
  quote:    { label: 'Quote',              c: '#d98d82' },
  fact:     { label: 'Fact',               c: '#4aa579' },
  summary:  { label: 'Summary',            c: '#9aa1a8' },
  question: { label: 'Question',           c: '#c2564a' },
  idea:     { label: 'Idea · for the story', c: '#b9853a' },
  plate:    { label: 'Plate',              c: '#5f8fb0' },
};
function noteHTML(n, ctx){
  const t = NOTE_META[n.type] || NOTE_META.fact;
  const tags = (n.tags || []).map(x => `<span>${esc(x)}</span>`).join('');
  const top = `<div class="sntop"><span class="sntype" style="--nc:${t.c}">${t.label}${n.page ? ` · p.${esc(n.page)}` : ''}</span>${tags ? `<span class="sntags">${tags}</span>` : ''}</div>`;
  if (n.type === 'plate'){
    const fig = (n.images && n.images.length) ? `<div class="snfig">${galleryHTML(n.images)}</div>` : '';
    const cap = (n.body && String(n.body).trim()) ? `<div class="sncap">${richToParas(n.body, ctx)}</div>` : '';
    return `<div class="snnote plate place-${n.placement || 'top'}" style="--nc:${t.c}">${top}<div class="pcontent">${fig}<div class="ptext">${cap}</div></div></div>`;
  }
  return `<div class="snnote type-${esc(n.type)}" style="--nc:${t.c}">${top}<div class="snbody">${richToParas(n.body, ctx)}</div></div>`;
}
function sourceNotesHTML(v, ctx){
  const chapters = (v && v.chapters) || [];
  if (!chapters.length) return '<p class="empty">No notes yet.</p>';
  // theme index from all note tags
  const tmap = {};
  for (const c of chapters) for (const n of (c.notes || [])) for (const t of (n.tags || [])) tmap[t] = (tmap[t] || 0) + 1;
  const themeKeys = Object.keys(tmap).sort((a, b) => tmap[b] - tmap[a]);
  const themes = themeKeys.length ? `<div class="snthemes"><span class="thlbl">Themes</span>${themeKeys.map(t => `<span class="thm">${esc(t)} <span class="c">${tmap[t]}</span></span>`).join('')}</div>` : '';
  const chaps = chapters.map((c, i) => {
    const notes = (c.notes || []).map(n => noteHTML(n, ctx)).join('') || '<p class="empty">No notes in this chapter.</p>';
    const open = (c.state === 'now' || i === 0) ? ' open' : '';
    const st = c.state || 'todo';
    const sum = c.summary ? `<span class="chsum">${esc(c.summary)}</span>` : '';
    return `<details class="snchap"${open}><summary><span class="snstate ${st}"></span><span class="snchmid"><span class="snchtitle">${esc(c.title || 'Chapter')}</span>${sum}</span>${c.pages ? `<span class="snpp">${esc(c.pages)}</span>` : ''}<span class="snchn">${(c.notes || []).length}</span></summary><div class="snnotes">${notes}</div></details>`;
  }).join('');
  return `<div class="snbook">${themes}${chaps}</div>`;
}
// references / bibliography: kind badge · linked title · reliability pips · note
const REF_KINDS = { book: 'Book', article: 'Article', web: 'Web', video: 'Video', other: 'Source' };
function referencesHTML(list){
  if (!list || !list.length) return '<p class="empty">Nothing here yet.</p>';
  return `<ul class="refs">` + list.map(r => {
    const kind = REF_KINDS[r.kind] || 'Source';
    const url = /^https?:\/\//i.test(r.url || '') ? r.url : '';
    const lv = Math.max(0, Math.min(4, r.level | 0));
    const title = esc(r.title || 'Untitled');
    const titleHTML = url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${title}</a>` : title;
    const pips = lv ? `<span class="rrel" title="reliability">${[0, 1, 2, 3].map(i => `<i class="pip${i < lv ? ' on' : ''}"></i>`).join('')}</span>` : '';
    const note = r.note && String(r.note).trim() ? `<span class="rnote">${esc(r.note)}</span>` : '';
    return `<li class="ref"><span class="rkind">${esc(kind)}</span><span class="rbody"><span class="rtop">${titleHTML}${pips}</span>${note}</span></li>`;
  }).join('') + `</ul>`;
}
// lexicon: terms grouped by category, each a card with definition + usage example
function lexiconHTML(list){
  if (!list || !list.length) return '<p class="empty">No terms yet.</p>';
  const order = [], groups = {};
  for (const t of list){ const g = (t.group || '').trim(); if (!(g in groups)){ groups[g] = []; order.push(g); } groups[g].push(t); }
  const card = (t) => {
    if (!(t.term && t.term.trim()) && !(t.def && t.def.trim())) return '';
    const pron = t.pron && t.pron.trim() ? `<span class="pron">${esc(t.pron)}</span>` : '';
    const def = t.def && t.def.trim() ? `<div class="td">${esc(t.def)}</div>` : '';
    const ex = t.example && t.example.trim() ? `<div class="ex"><b>In a sentence</b>${esc(t.example)}</div>` : '';
    const src = t.source && t.source.trim() ? `<div class="ts">${esc(t.source)}</div>` : '';
    return `<div class="term"><div class="tt">${esc(t.term || '—')}${pron ? ' ' + pron : ''}</div>${def}${ex}${src}</div>`;
  };
  const cats = order.map(g => {
    const cards = groups[g].map(card).join('');
    if (!cards) return '';
    const head = g ? `<h4 class="lexcat-h">${esc(g)}</h4>` : '';
    return `<div class="lexcat">${head}<div class="lexgrid">${cards}</div></div>`;
  }).join('');
  return cats ? `<div class="lex">${cats}</div>` : '<p class="empty">No terms yet.</p>';
}
// definition list: term · value · optional source — serves Quick facts and Avoid (avoid variant)
function deflistHTML(list, sec){
  if (!list || !list.length) return '<p class="empty">Nothing here yet.</p>';
  const avoid = sec && sec.variant === 'avoid';
  const rows = list.map(r => {
    const term = esc(r.term || ''), def = esc(r.def || '');
    if (!term && !def) return '';
    const note = r.note && String(r.note).trim() ? `<span class="dnote">${esc(r.note)}</span>` : '';
    const mark = avoid ? '<span class="dx">✗</span>' : '';
    return `<div class="drow${avoid ? ' avoid' : ''}">${mark}<dt>${term || '—'}</dt><dd>${def}${note}</dd></div>`;
  }).join('');
  return rows ? `<dl class="deflist${avoid ? ' avoidlist' : ''}">${rows}</dl>` : '<p class="empty">Nothing here yet.</p>';
}
// chronology: a vertical timeline of date · event, each optionally linking an Event entry
function chronologyHTML(list, ctx){
  if (!list || !list.length) return '<p class="empty">No dates yet.</p>';
  const rows = list.map(r => {
    if (!(r.date && r.date.trim()) && !(r.text && r.text.trim())) return '';
    const h = r.targetId && ctx.href(r.targetId);
    const txt = esc(r.text || '');
    const ev = h ? `<a href="${esc(h)}">${txt}</a>` : txt;
    return `<div class="cnode"><span class="cdate">${esc(r.date || '—')}</span><span class="cev">${ev}</span></div>`;
  }).join('');
  return rows ? `<div class="chron">${rows}</div>` : '<p class="empty">No dates yet.</p>';
}
// real-vs-invented ledger: colour-keyed rows (element · standing · note)
const LEDGER_VERDICTS = { real: { label: 'Real', c: '#3f9d6d' }, adapted: { label: 'Adapted', c: '#8a5a2b' }, invented: { label: 'Invented', c: '#9a3324' } };
function ledgerHTML(list){
  if (!list || !list.length) return '<p class="empty">Nothing here yet.</p>';
  return `<div class="ledger">` + list.map(r => {
    const vd = LEDGER_VERDICTS[r.verdict] || LEDGER_VERDICTS.real;
    const note = r.note && String(r.note).trim() ? `<span class="ldnote">${esc(r.note)}</span>` : '';
    return `<div class="ldrow" style="--vc:${vd.c}"><span class="ldclaim">${esc(r.claim || '—')}</span><span class="ldverd">${esc(vd.label)}</span>${note}</div>`;
  }).join('') + `</div>`;
}
function tagsHTML(cats, ctx){
  if (!cats || !cats.length) return '<p class="empty">Nothing here yet.</p>';
  return cats.map(c => {
    const chips = (c.items || []).map(t => t.note && String(t.note).trim()
      ? `<details class="chip"><summary>${esc(t.name)}</summary><div class="note">${richToParas(t.note, ctx)}</div></details>`
      : `<span class="chip static">${esc(t.name)}</span>`).join('');
    return `<div class="tcat"><h4>${esc(c.name || 'Category')}</h4><div class="chips">${chips}</div></div>`;
  }).join('');
}
function excerptsHTML(list, ctx){
  if (!list || !list.length) return '<p class="empty">Nothing here yet.</p>';
  return list.map((e, i) => `<details class="exc"${i === 0 ? ' open' : ''}><summary>${esc(e.title || 'Excerpt')}</summary><div class="eb">${richToParas(e.body, ctx)}${e.source ? `<div class="src">${esc(e.source)}</div>` : ''}</div></details>`).join('');
}
function outlineHTML(o){
  const acts = (o && o.acts) || [];
  if (!acts.length) return '<p class="empty">No structure yet.</p>';
  return `<div class="outline">` + acts.map(a => `<div class="act"><div class="at">${esc(a.title || 'Act')}</div>` + (a.chapters || []).map(ch => `<div class="chap"><div class="ct">${esc(ch.title || 'Chapter')}</div>` + (ch.beats || []).map(bt => `<div class="beat"><span class="dot">•</span> ${esc(bt.text || '')}</div>`).join('') + `</div>`).join('') + `</div>`).join('') + `</div>`;
}
function lineageHTML(d, ctx){
  const nodes = (d && d.nodes) || [];
  if (!nodes.length) return '<p class="empty">No lineage yet.</p>';
  const kids = (id) => nodes.filter(n => n.parentId === id);
  const roots = nodes.filter(n => !n.parentId || !nodes.some(x => x.id === n.parentId));
  const nm = (o) => { const h = o.targetId && ctx.href(o.targetId); const t = esc(o.name || '—'); return h ? `<a href="${esc(h)}">${t}</a>` : t; };
  const sub = (n) => {
    const k = kids(n.id);
    const partners = (n.partners || []).map(p => `<div class="bond${p.kind === 'affair' ? ' affair' : ''}"><span class="line"></span><span class="lbl">${p.kind === 'affair' ? 'affair' : 'm.'}</span></div><div class="pnode">${nm(p)}</div>`).join('');
    return `<div class="subtree"><div class="union"><div class="lnode">${nm(n)}</div>${partners}</div>${k.length ? `<div class="vline"></div><div class="kids${k.length === 1 ? ' single' : ''}">${k.map(c => `<div class="branch">${sub(c)}</div>`).join('')}</div>` : ''}</div>`;
  };
  return `<div class="lineage"><div class="lcanvas">${roots.map(r => `<div class="branch root">${sub(r)}</div>`).join('')}</div></div>`;
}
function webHTML(ties, entry, ctx){
  if (!ties || !ties.length) return '<p class="empty">No ties yet.</p>';
  const nm = (t) => { const h = t.targetId && ctx.href(t.targetId); const x = esc(t.name || '—'); return h ? `<a href="${esc(h)}">${x}</a>` : x; };
  const by = (k) => ties.filter(t => t.kind === k);
  const L = by('liege'), V = by('vassal'), A = by('ally'), R = by('rival');
  let h = '<div class="web">';
  if (L.length) h += `<div class="tier">${L.map(t => `<span class="box liege">${nm(t)}</span>`).join('')}</div><div class="down"></div>`;
  h += `<span class="box self">${esc(entry.title || 'This house')}</span>`;
  if (V.length) h += `<div class="down"></div><div class="tier">${V.map(t => `<span class="box">${nm(t)}</span>`).join('')}</div>`;
  if (A.length || R.length){ h += '<div class="sides">'; if (A.length) h += `<div class="side"><span class="slbl">Allies</span>${A.map(t => `<span class="wchip">${nm(t)}</span>`).join('')}</div>`; if (R.length) h += `<div class="side"><span class="slbl">Rivals</span>${R.map(t => `<span class="wchip rival">${nm(t)}</span>`).join('')}</div>`; h += '</div>'; }
  return h + '</div>';
}
function timelineHTML(entry, ctx){
  const evs = ctx.events || [];
  if (evs.length <= 1) return '<p class="empty">A lone event — add more to see a timeline.</p>';
  return `<div class="etl"><div class="track"><div class="line"></div>` + evs.map(ev => {
    const h = ctx.href(ev.id); const cur = ev.id === entry.id;
    const inner = `<span class="date">${esc(ev.date || '—')}</span><span class="edot"></span><span class="ettl">${esc(ev.title || 'Untitled')}</span>`;
    return h && !cur ? `<a class="enode" href="${esc(h)}">${inner}</a>` : `<span class="enode${cur ? ' current' : ''}">${inner}</span>`;
  }).join('') + `</div></div>`;
}

function spotifyHTML(list){
  if (!list || !list.length) return '';
  return `<div class="embeds">` + list.map(it =>
    `<iframe class="spembed" title="Spotify ${esc(it.type)}" src="${esc(embedUrl(it))}" width="100%" height="${embedHeight(it)}" loading="lazy" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>`
  ).join('') + `</div>`;
}

function fieldHTML(entry, sec, ctx){
  const v = entry.data ? entry.data[sec.key] : undefined;
  switch (sec.type){
    case 'richline': return v && String(v).trim() ? `<div class="lead">${richToLine(v, ctx)}</div>` : '';
    case 'stats': return statsHTML(v);
    case 'gallery': return galleryHTML(v);
    case 'richsections': return sectionsHTML(v, ctx);
    case 'relations': return relationsHTML(v, sec, ctx);
    case 'catalog': return catalogHTML(v, ctx);
    case 'meter': return meterHTML(v, sec);
    case 'references': return referencesHTML(v);
    case 'deflist': return deflistHTML(v, sec);
    case 'lexicon': return lexiconHTML(v);
    case 'chronology': return chronologyHTML(v, ctx);
    case 'sourcenotes': return sourceNotesHTML(v, ctx);
    case 'ledger': return ledgerHTML(v);
    case 'taggroups': return tagsHTML(v, ctx);
    case 'excerpts': return excerptsHTML(v, ctx);
    case 'outline': return outlineHTML(v);
    case 'lineage': return lineageHTML(v, ctx);
    case 'allegianceweb': return webHTML(v, entry, ctx);
    case 'eventtimeline': return timelineHTML(entry, ctx);
    case 'spotify': return spotifyHTML(v);
    default: return '';
  }
}

// persistent site sidebar: families -> types (collapsible) -> entry links, current highlighted
function sidenavHTML(project, ctx){
  const byType = {};
  (project.entries || []).forEach(e => { (byType[e.type] || (byType[e.type] = [])).push(e); });
  const fams = FAMILIES.map(f => {
    const types = f.types.filter(t => (byType[t] || []).length);
    if (!types.length) return '';
    const blocks = types.map(t => {
      const tpl = templateFor(t);
      const items = byType[t].map(e => {
        const cur = e.id === ctx.currentId; const label = esc(e.title || 'Untitled'); const h = ctx.href(e.id);
        return `<li class="${cur ? 'cur' : ''}">${cur || !h ? `<span>${label}</span>` : `<a href="${esc(h)}">${label}</a>`}</li>`;
      }).join('');
      const open = byType[t].some(e => e.id === ctx.currentId) ? ' open' : '';
      return `<details class="ntype"${open}><summary><span class="nic">${tpl.icon}</span><span class="nlbl">${esc(tpl.plural)}</span><span class="nct">${byType[t].length}</span></summary><ul>${items}</ul></details>`;
    }).join('');
    return `<div class="nfam"><div class="nfamh">${esc(f.label)}</div>${blocks}</div>`;
  }).join('');
  const hub = ctx.hubHref ? `<a class="nhub" href="${esc(ctx.hubHref)}">${esc(project.name || 'Project')}</a>` : `<span class="nhub cur">${esc(project.name || 'Project')}</span>`;
  return `<aside class="sidenav"><div class="navhead">${hub}</div><nav class="navtree">${fams}</nav></aside>`;
}
const NAV_TOGGLE = `<button class="navtoggle" data-navtoggle aria-label="Toggle navigation">☰</button>`;
const shell = (nav, content) => `<div class="shell">${nav}<button class="navback" data-navtoggle aria-label="Close navigation"></button><div class="content">${content}</div></div>`;

const heading = (sec, inner) => (sec.lead || sec.type === 'meter') ? inner : `<h2 id="${esc(slug(sec.label))}">${esc(sec.label)}</h2>${inner}`;

// read-only reverse links: "who points at this entry" (ctx.backlinks precomputed by the caller)
function backlinksHTML(backlinks, ctx){
  if (!backlinks || !backlinks.length) return '';
  const rows = backlinks.map(b => {
    const tpl = templateFor(b.type);
    const h = ctx.href(b.id); const nm = esc(b.title || 'Untitled');
    const name = h ? `<a href="${esc(h)}">${nm}</a>` : nm;
    const meta = esc([b.section, b.role].filter(Boolean).join(' · '));
    return `<li class="bl"><span class="blic">${tpl.icon}</span><span class="blnm">${name}</span>${meta ? `<span class="blmeta">${meta}</span>` : ''}</li>`;
  }).join('');
  return `<h2 id="linked-from" class="blh">Linked from</h2><ul class="bllist">${rows}</ul>`;
}

export function renderEntry(entry, ctx){
  const tpl = templateFor(entry.type);
  const layout = tpl.layout || 'infobox';
  const gallerySec = tpl.sections.find(s => s.type === 'gallery');
  const statsSec = tpl.sections.find(s => s.type === 'stats');
  const bodySecs = bodySectionsOf(entry);
  // build the body, injecting a zone divider before the first non-empty section of each zone
  let body = '', lastZone = null;
  for (const sec of bodySecs){
    const inner = fieldHTML(entry, sec, ctx);
    if (!inner) continue;
    if (sec.zone && sec.zone !== lastZone){ body += `<div class="zonebar"><span class="zt">${esc(sec.zone)}</span><span class="zl"></span></div>`; lastZone = sec.zone; }
    body += heading(sec, inner);
  }
  body += backlinksHTML(ctx.backlinks, ctx);
  const title = `<div class="etitle"><h1>${esc(entry.title || 'Untitled')}</h1>${entry.subtitle ? (tpl.motto ? `<div class="words"><span>${esc(entry.subtitle)}</span></div>` : `<div class="esub">${esc(entry.subtitle)}</div>`) : ''}</div>`;
  const stats = statsSec ? fieldHTML(entry, statsSec, ctx) : '';
  const gal = gallerySec ? fieldHTML(entry, gallerySec, ctx) : '';

  let main = '';
  if (layout === 'outline'){
    main = `<div class="wrap-narrow">${title}${body}</div>`;
  } else if (layout === 'split'){
    main = `<div class="wsplit"><div class="media">${gal}</div><div class="col">${title}${stats}${body}</div></div>`;
  } else if (layout === 'hero'){
    let head;
    if (tpl.media === 'feature') head = `${title}${gal}`;
    else if (tpl.media === 'sigil') head = `<div class="herohead">${gal ? `<div class="sig">${gal}</div>` : ''}${title}</div>`;
    else head = title;
    main = `<div class="whero">${head}${stats}${body}</div>`;
  } else {
    main = `<div class="wbody"><main class="article">${title}${body}</main><aside class="infobox">${gal}${stats}</aside></div>`;
  }

  const crumb = ctx.hubHref ? `<a href="${esc(ctx.hubHref)}">&larr; ${esc(ctx.crumb || 'Back')}</a>` : `<span>${esc(ctx.crumb || '')}</span>`;
  const nav = ctx.project ? sidenavHTML(ctx.project, ctx) : '';
  const topbar = `<div class="topbar">${nav ? NAV_TOGGLE : ''}<span class="crumb">${crumb}</span><span class="tbadge">${esc(tpl.label)}</span></div>`;
  const content = topbar + main;
  return nav ? shell(nav, content) : content;
}

function entryCard(e, href){
  const cover = coverOf(e);
  const img = cover ? `<div class="portrait" style="background-image:url(${esc(cover)})"></div>` : `<div class="portrait"><span class="ini">${esc((e.title || '?').slice(0, 2))}</span></div>`;
  return `<a class="ecard" href="${esc(href || '#')}">${img}<div class="cmeta"><div class="cnm">${esc(e.title || 'Untitled')}</div>${e.subtitle ? `<div class="csub">${esc(e.subtitle)}</div>` : ''}</div></a>`;
}
export function renderHub(project, ctx){
  const hrefs = ctx.hrefs || {};
  const groups = {}; ENTRY_TYPES.forEach(t => groups[t] = []);
  (project.entries || []).forEach(e => (groups[e.type] || (groups[e.type] = [])).push(e));
  const secs = ENTRY_TYPES.filter(t => (groups[t] || []).length).map(t => {
    const tpl = templateFor(t);
    return `<section class="hsec"><h2><span class="hic">${tpl.icon}</span> ${esc(tpl.plural)}</h2><div class="hgrid">${groups[t].map(e => entryCard(e, hrefs[e.id])).join('')}</div></section>`;
  }).join('');
  const sound = (project.spotify && project.spotify.length) ? `<section class="hsec"><h2><span class="hic">♪</span> Soundtrack</h2>${spotifyHTML(project.spotify)}</section>` : '';
  const hub = `<div class="hubwrap"><div class="hhero">${ctx.upHref ? `<a class="hup" href="${esc(ctx.upHref)}">&larr; All projects</a>` : ''}<div class="eyebrow">Project</div><h1>${esc(project.name || 'Project')}</h1><div class="hcount">${(project.entries || []).length} entries${project.genre ? ' · ' + esc(project.genre) : ''}</div></div>${sound}${secs}</div>`;
  const nav = sidenavHTML(project, { href: (id) => hrefs[id], currentId: null, hubHref: null });
  return shell(nav, NAV_TOGGLE + hub);
}
export function renderIndex(ws, ctx){
  const hrefs = ctx.hrefs || {};
  const cards = (ws.projects || []).map(p => {
    const es = p.entries || [];
    let hero = p.cover || ''; if (!hero){ for (const e of es){ const c = coverOf(e); if (c){ hero = c; break; } } }
    const heroDiv = `<div class="phero"${hero ? ` style="background-image:url(${esc(hero)})"` : ''}>${!hero ? `<span class="pini">${esc((p.name || '?').slice(0, 2))}</span>` : ''}</div>`;
    return `<a class="pcard" href="${esc(hrefs[p.id] || '#')}">${heroDiv}<div class="pbody"><div class="pt">${esc(p.name || 'Project')}</div><div class="pmeta">${p.genre ? esc(p.genre) + ' · ' : ''}${es.length} entr${es.length === 1 ? 'y' : 'ies'}</div></div></a>`;
  }).join('');
  return `<div class="hubwrap"><div class="hhero"><div class="eyebrow">Workspace</div><h1>${esc(ws.title || 'Your World')}</h1><div class="hcount">${(ws.projects || []).length} projects</div></div><div class="pgrid">${cards}</div></div>`;
}

/* ---- reader JS: carousels + collapsibles are native <details>; only carousels need JS ---- */
export const READER_JS = `(function(){document.querySelectorAll('.carousel').forEach(function(c){var st=c.querySelector('.cstage');var sl=[].slice.call(st.querySelectorAll('.cslide'));if(sl.length<2)return;var cnt=c.querySelector('.ccount');var i=0;function s(){sl.forEach(function(x,k){x.className='cslide'+(k===i?' on':'');});if(cnt)cnt.textContent=(i+1)+' / '+sl.length;}var p=c.querySelector('.cprev'),n=c.querySelector('.cnext');if(p)p.onclick=function(){i=(i-1+sl.length)%sl.length;s();};if(n)n.onclick=function(){i=(i+1)%sl.length;s();};});var sh=document.querySelector('.shell');if(sh){document.querySelectorAll('[data-navtoggle]').forEach(function(b){b.onclick=function(){sh.classList.toggle('nav-open');};});}})();`;

export function docShell({ title, palette, headFont, bodyFont, headScale, bodyScale, portraitScale, fontPrefix, faceCSS, bodyHTML }){
  const faces = faceCSS != null ? faceCSS : fontFaceCSS(fontPrefix || '/fonts/', [headFont, bodyFont]);
  const head = paletteVars(palById(palette)) + fontVars(headFont, bodyFont, headScale, bodyScale, portraitScale) + '\n' + faces + '\n' + READER_CSS;
  return `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(title)}</title><style>${head}</style></head><body>${bodyHTML}<script>${READER_JS}</script></body></html>`;
}
