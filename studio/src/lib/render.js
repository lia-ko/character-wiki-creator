/* ============ STATIC READER RENDERER ============
   Pure functions: entry + template + context -> self-contained reader HTML.
   Mirrors the editor layouts (split / hero / infobox / outline) read-only.
   Powers both the in-app Preview and the .zip exporter. No Svelte, no editing. */

import { esc, richToParas, richToLine } from './richtext.js';
import { templateFor, ENTRY_TYPES } from './templates.js';
import { coverOf } from './model.js';
import { paletteVars, palById, fontVars, fontFaceCSS } from './theme.js';
import { READER_CSS } from './exportcss.js';

const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'sec';

/* ctx: { href(id)->string|null, cover(id)->string|null, events:[{id,title,date,year}], hubHref, crumb } */

function galleryHTML(imgs){
  if (!imgs || !imgs.length) return '';
  const slides = imgs.map((s, i) => `<div class="cslide${i === 0 ? ' on' : ''}"><img src="${esc(s)}" alt=""></div>`).join('');
  const nav = imgs.length > 1 ? `<div class="cnav"><button type="button" class="cbtn cprev">&lsaquo;</button><span class="ccount">1 / ${imgs.length}</span><button type="button" class="cbtn cnext">&rsaquo;</button></div>` : '';
  return `<div class="carousel"><div class="cstage" data-idx="0">${slides}</div>${nav}</div>`;
}
function statsHTML(rows){
  const r = (rows || []).filter(s => s && s.k).map(s => `<div class="r"><span class="k">${esc(s.k)}</span><span class="v">${s.v ? esc(s.v) : '<span class="empty">—</span>'}</span></div>`).join('');
  return r ? `<div class="stats">${r}</div>` : '';
}
function sectionsHTML(list){
  return (list || []).map(s => `<h3 id="${esc(slug(s.h))}">${esc(s.h || 'Section')}</h3>${richToParas(s.body)}`).join('');
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
    return `<details class="rel"${i === 0 ? ' open' : ''}><summary>${thumb}<span class="rwho"><span class="rnm">${relName(r, ctx)}</span>${meta ? `<span class="rmeta">${meta}</span>` : ''}</span><span class="chev"></span></summary><div class="rbody">${port}<div class="rtxt">${richToParas(r.body)}</div></div></details>`;
  }).join('') + `</div>`;
}
function tagsHTML(cats){
  if (!cats || !cats.length) return '<p class="empty">Nothing here yet.</p>';
  return cats.map(c => {
    const chips = (c.items || []).map(t => t.note && t.note.trim()
      ? `<details class="chip"><summary>${esc(t.name)}</summary><span class="note">${esc(t.note)}</span></details>`
      : `<span class="chip static">${esc(t.name)}</span>`).join('');
    return `<div class="tcat"><h4>${esc(c.name || 'Category')}</h4><div class="chips">${chips}</div></div>`;
  }).join('');
}
function excerptsHTML(list){
  if (!list || !list.length) return '<p class="empty">Nothing here yet.</p>';
  return list.map((e, i) => `<details class="exc"${i === 0 ? ' open' : ''}><summary>${esc(e.title || 'Excerpt')}</summary><div class="eb">${richToParas(e.body)}${e.source ? `<div class="src">${esc(e.source)}</div>` : ''}</div></details>`).join('');
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

function fieldHTML(entry, sec, ctx){
  const v = entry.data ? entry.data[sec.key] : undefined;
  switch (sec.type){
    case 'richline': return v && String(v).trim() ? `<div class="lead">${richToLine(v)}</div>` : '';
    case 'stats': return statsHTML(v);
    case 'gallery': return galleryHTML(v);
    case 'richsections': return sectionsHTML(v);
    case 'relations': return relationsHTML(v, sec, ctx);
    case 'taggroups': return tagsHTML(v);
    case 'excerpts': return excerptsHTML(v);
    case 'outline': return outlineHTML(v);
    case 'lineage': return lineageHTML(v, ctx);
    case 'allegianceweb': return webHTML(v, entry, ctx);
    case 'eventtimeline': return timelineHTML(entry, ctx);
    default: return '';
  }
}

const heading = (sec, inner) => sec.lead ? inner : `<h2 id="${esc(slug(sec.label))}">${esc(sec.label)}</h2>${inner}`;

export function renderEntry(entry, ctx){
  const tpl = templateFor(entry.type);
  const layout = tpl.layout || 'infobox';
  const gallerySec = tpl.sections.find(s => s.type === 'gallery');
  const statsSec = tpl.sections.find(s => s.type === 'stats');
  const bodySecs = tpl.sections.filter(s => s.slot !== 'aside');
  const body = bodySecs.map(sec => { const inner = fieldHTML(entry, sec, ctx); return inner ? heading(sec, inner) : (sec.lead ? '' : ''); }).join('');
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
  const topbar = `<div class="topbar"><span class="crumb">${crumb}</span><span class="tbadge">${esc(tpl.label)}</span></div>`;
  return topbar + main;
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
  return `<div class="hubwrap"><div class="hhero">${ctx.upHref ? `<a class="hup" href="${esc(ctx.upHref)}">&larr; All projects</a>` : ''}<div class="eyebrow">Project</div><h1>${esc(project.name || 'Project')}</h1><div class="hcount">${(project.entries || []).length} entries${project.genre ? ' · ' + esc(project.genre) : ''}</div></div>${secs}</div>`;
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
export const READER_JS = `(function(){document.querySelectorAll('.carousel').forEach(function(c){var st=c.querySelector('.cstage');var sl=[].slice.call(st.querySelectorAll('.cslide'));if(sl.length<2)return;var cnt=c.querySelector('.ccount');var i=0;function s(){sl.forEach(function(x,k){x.className='cslide'+(k===i?' on':'');});if(cnt)cnt.textContent=(i+1)+' / '+sl.length;}var p=c.querySelector('.cprev'),n=c.querySelector('.cnext');if(p)p.onclick=function(){i=(i-1+sl.length)%sl.length;s();};if(n)n.onclick=function(){i=(i+1)%sl.length;s();};});})();`;

export function docShell({ title, palette, headFont, bodyFont, headScale, bodyScale, portraitScale, fontPrefix, bodyHTML }){
  const faces = fontFaceCSS(fontPrefix || '/fonts/', [headFont, bodyFont]);
  const head = paletteVars(palById(palette)) + fontVars(headFont, bodyFont, headScale, bodyScale, portraitScale) + '\n' + faces + '\n' + READER_CSS;
  return `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(title)}</title><style>${head}</style></head><body>${bodyHTML}<script>${READER_JS}</script></body></html>`;
}
