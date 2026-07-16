/* ============ STATIC READER RENDERER ============
   Pure functions: entry + template + context -> self-contained reader HTML.
   Mirrors the editor layouts (split / hero / codex / outline) read-only.
   Powers both the in-app Preview and the .zip exporter. No Svelte, no editing. */

import { esc, richToParas, richToLine } from './richtext.js';
import { layoutFamily } from './familyLayout.js';
import { templateFor, ENTRY_TYPES, FAMILIES } from './templates.js';
import { coverOf, imgSrc, imgPos, bodySectionsOf } from './model.js';
import { paletteVars, palById, fontVars, fontFaceCSS } from './theme.js';
import { embedUrl, embedHeight } from './spotify.js';
import { ARC_C, arcMode, effectiveGeom, arcLine, arcArea } from './arc.js';
import { embedInfo, EMBED_SANDBOX, EMBED_ALLOW } from './embed.js';
import { MATRIX_KINDS, MATRIX_COLOR, pairKey } from './matrix.js';
import { radarGeom, ptsAttr, labelAnchor } from './statchart.js';
import { layoutOrg, orgConnector, ORG } from './orgchart.js';
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
// standalone Timeline (Chronicle): era bands → collapsible dated beats, each with an
// inline expand-preview of its linked Event/Character/Place (Level-2 expand).
function chronicleLinkHTML(l, ctx){
  const id = l && l.targetId; if (!id) return '';
  const title = esc((ctx.title && ctx.title(id)) || l.name || 'Untitled');
  const m = ctx.meta ? ctx.meta(id) : null;
  const typeLabel = m && m.type ? templateFor(m.type).label : '';
  const href = ctx.href && ctx.href(id);
  const cover = ctx.cover && ctx.cover(id);
  const sum = m && m.summary ? richToLine(m.summary, ctx) : (m && m.subtitle ? esc(m.subtitle) : '');
  const cov = cover ? `<span class="tlcov" style="background-image:url(${esc(cover)})"></span>` : `<span class="tlcov empty">◷</span>`;
  const nameHTML = href ? `<a href="${esc(href)}">${title}</a>` : title;
  const openA = href ? `<a class="tlopen" href="${esc(href)}">Open ↗</a>` : '';
  return `<details class="tlink"><summary><span class="tlchip">${title}</span></summary><div class="tlcard">${cov}<div class="tlm">${typeLabel ? `<div class="tltype">${esc(typeLabel)}</div>` : ''}<div class="tlname">${nameHTML}</div>${sum ? `<div class="tlsum">${sum}</div>` : ''}</div>${openA}</div></details>`;
}
function chronicleNodeHTML(r, ctx){
  const key = !!r.key;
  const links = (r.links || []).map(l => chronicleLinkHTML(l, ctx)).join('');
  const body = r.body ? richToParas(r.body, ctx) : '';
  const dt = r.date ? `<span class="tldate">${esc(r.date)}</span>` : '';
  const inner = body + (links ? `<div class="tllinks">${links}</div>` : '');
  return `<details class="tlnode${key ? ' key' : ''}"${key ? ' open' : ''}><summary>${dt}<span class="tltitle">${esc(r.title || '—')}</span>${key ? '<span class="tlstar">★</span>' : ''}<span class="chev"></span></summary><div class="tlbody">${inner || '<p class="empty">—</p>'}</div></details>`;
}
function chronicleSpineHTML(v, ctx){
  const eras = Array.isArray(v.eras) ? v.eras : [];
  const entries = v.entries;
  const spine = (list) => `<div class="tspine">${list.map(e => chronicleNodeHTML(e, ctx)).join('')}</div>`;
  let out = '<div class="tline">';
  if (eras.length){
    const used = new Set();
    for (const er of eras){
      const mine = entries.filter(e => e.eraId === er.id);
      if (!mine.length) continue;
      mine.forEach(e => used.add(e));
      out += `<div class="tera"><span class="ten">${esc(er.name || '')}</span>${er.span ? `<span class="tespan">${esc(er.span)}</span>` : ''}<span class="tel"></span></div>` + spine(mine);
    }
    const orphans = entries.filter(e => !used.has(e));
    if (orphans.length) out += spine(orphans);
  } else {
    out += spine(entries);
  }
  return out + '</div>';
}

// short inline link chips (used by Tracks/Ledger, which stay compact)
function tlLinkChips(links, ctx){
  return (links || []).map(l => {
    const id = l && l.targetId; if (!id) return '';
    const nm = esc((ctx.title && ctx.title(id)) || l.name || '—');
    const href = ctx.href && ctx.href(id);
    return href ? `<a class="tchip" href="${esc(href)}">${nm}</a>` : `<span class="tchip">${nm}</span>`;
  }).join('');
}

// B · Tracks — parallel threads on a shared time axis. Rows = distinct dates
// (first-appearance order); columns = threads; unassigned beats fall into thread 1.
function tracksHTML(v, ctx){
  const threads = (Array.isArray(v.threads) ? v.threads : []).filter(t => t && t.id);
  if (!threads.length) return chronicleSpineHTML(v, ctx);   // no lanes defined → degrade to Chronicle
  const entries = v.entries;
  const colOf = (e) => (threads.some(t => t.id === e.threadId) ? e.threadId : threads[0].id);
  const rowKeys = [], seen = new Set();
  for (const e of entries){ const k = (e.date || '—'); if (!seen.has(k)){ seen.add(k); rowKeys.push(k); } }
  const gridCols = `64px repeat(${threads.length}, minmax(0,1fr))`;
  let head = `<div class="tlh time">When</div>` + threads.map((t, i) => `<div class="tlh" style="--tc:${esc(t.color || 'var(--accent)')};box-shadow:inset 3px 0 var(--tc);color:var(--tc)">${esc(t.name || ('Thread ' + (i + 1)))}</div>`).join('');
  let rows = '';
  for (const rk of rowKeys){
    rows += `<div class="tcell time">${esc(rk)}</div>`;
    for (const t of threads){
      const cellEvents = entries.filter(e => (e.date || '—') === rk && colOf(e) === t.id);
      const inner = cellEvents.map(e => {
        const chips = tlLinkChips(e.links, ctx);
        return `<div class="tev" style="--tc:${esc(t.color || 'var(--accent)')}"><div class="tevt">${esc(e.title || '—')}${e.key ? '<span class="tevstar">★</span>' : ''}</div>${e.body ? `<div class="tevb">${richToLine(e.body, ctx)}</div>` : ''}${chips ? `<div class="tevlk">${chips}</div>` : ''}</div>`;
      }).join('');
      rows += `<div class="tcell">${inner}</div>`;
    }
  }
  return `<div class="ttracks" style="grid-template-columns:${gridCols}">${head}${rows}</div>`;
}

// C · Era ledger — grouped scannable tables (date · event · who/where · weight dots).
function ledgerRowsHTML(list, ctx){
  return list.map(e => {
    const who = tlLinkChips(e.links, ctx);
    const w = Math.max(0, Math.min(4, e.weight | 0));
    const dots = [0, 1, 2, 3].map(i => `<span class="${i < w ? 'on' : 'off'}">●</span>`).join('');
    return `<div class="tlrow"><span class="tld">${esc(e.date || '')}</span><span class="tle">${esc(e.title || '—')}${e.key ? ' <span class="tlestar">★</span>' : ''}</span><span class="tlw">${who}</span><span class="tlsig">${dots}</span></div>`;
  }).join('');
}
function ledgerTLHTML(v, ctx){
  const eras = Array.isArray(v.eras) ? v.eras : [];
  const entries = v.entries;
  const colhead = `<div class="tlcolhead"><span>Date</span><span>Event</span><span>Who · where</span><span class="r">Weight</span></div>`;
  const group = (name, span, list) => `<div class="tlg"><div class="tlgh"><span class="tlgn">${esc(name)}</span>${span ? `<span class="tlgspan">${esc(span)}</span>` : ''}<span class="tlgc">${list.length} entr${list.length === 1 ? 'y' : 'ies'}</span></div>${colhead}${ledgerRowsHTML(list, ctx)}</div>`;
  let out = '<div class="tledger">';
  if (eras.length){
    const used = new Set();
    for (const er of eras){
      const mine = entries.filter(e => e.eraId === er.id);
      if (!mine.length) continue;
      mine.forEach(e => used.add(e));
      out += group(er.name || '', er.span || '', mine);
    }
    const orphans = entries.filter(e => !used.has(e));
    if (orphans.length) out += group('Unsorted', '', orphans);
  } else {
    out += group('All entries', '', entries);
  }
  return out + '</div>';
}

function chronicleHTML(v, ctx){
  if (!v || !Array.isArray(v.entries) || !v.entries.length) return '';
  if (v.view === 'tracks') return tracksHTML(v, ctx);
  if (v.view === 'ledger') return ledgerTLHTML(v, ctx);
  return chronicleSpineHTML(v, ctx);
}
// Character arc line — the refined transformation curve (shared geometry with the editor)
function arcHTML(v, ctx, sec){
  if (!v || typeof v !== 'object') return '';
  const has = ['believes', 'is', 'turn', 'learns', 'becomes', 'want', 'need'].some(k => v[k] && String(v[k]).trim());
  if (!has) return '';
  const mode = (sec && sec.mode) || 'character';
  const cfg = arcMode(mode);
  const g = effectiveGeom(v, mode);
  const uid = 'a' + Math.abs((JSON.stringify(v).length * 2654435761) % 100000);
  const nl = (x, y, fill, t) => `<text x="${x}" y="${y}" text-anchor="middle" style="fill:${fill};font-family:var(--mono);font-size:10px;letter-spacing:1px">${esc(t)}</text>`;
  const svg = `<svg class="arccurve" viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="${esc(v.type || 'positive')} arc">`
    + `<defs><linearGradient id="af-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g.top}" stop-opacity=".16"/><stop offset="1" stop-color="${g.bottom}" stop-opacity=".05"/></linearGradient>`
    + `<linearGradient id="al-${uid}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${g.bottom}"/><stop offset=".5" stop-color="${ARC_C.accent}"/><stop offset="1" stop-color="${g.endColor}"/></linearGradient></defs>`
    + `<line x1="90" y1="34" x2="620" y2="34" stroke="${ARC_C.rule}" stroke-dasharray="3 5"/><line x1="90" y1="186" x2="620" y2="186" stroke="${ARC_C.rule}" stroke-dasharray="3 5"/>`
    + `<path d="${arcArea(g)}" fill="url(#af-${uid})"/><path d="${arcLine(g)}" fill="none" stroke="url(#al-${uid})" stroke-width="3.5" stroke-linecap="round"/>`
    + `<line x1="90" y1="205" x2="600" y2="205" stroke="${ARC_C.want}" stroke-width="1.5" stroke-opacity=".45"/><path d="M600 205 l-9 -4 M600 205 l-9 4" fill="none" stroke="${ARC_C.want}" stroke-width="1.5" stroke-opacity=".65"/>`
    + `<circle cx="${g.start.x}" cy="${g.start.y}" r="6.5" fill="${ARC_C.node}" stroke="${g.bottom}" stroke-width="3"/>`
    + `<circle cx="${g.turn.x}" cy="${g.turn.y}" r="7" fill="${ARC_C.accent}" stroke="${ARC_C.node}" stroke-width="2"/>`
    + `<circle cx="${g.end.x}" cy="${g.end.y}" r="6.5" fill="${g.endColor}" stroke="${ARC_C.node}" stroke-width="2"/>`
    + nl(g.start.x, g.start.y - 12, ARC_C.muted, 'START')
    + nl(g.turn.x, g.turn.y > 120 ? g.turn.y + 20 : g.turn.y - 12, ARC_C.accent, g.turnLabel)
    + nl(g.end.x, g.end.y - 12, g.endColor, 'END')
    + `</svg>`;
  const row = (lbl, val, color) => val && val.trim() ? `<div class="arow"><div class="ak">${esc(lbl)}</div><div class="av"${color ? ` style="color:${color}"` : ''}>${esc(val)}</div></div>` : '';
  const capRows = (arr) => arr.map(r => row(r.label, v[r.key], r.color === 'hi' ? g.top : r.color === 'lo' ? g.bottom : '')).join('');
  const caps = `<div class="acaps">`
    + `<div class="acap start" style="--ac:${g.bottom}"><div class="acph">${esc(cfg.startLabel)}</div>${capRows(cfg.start)}</div>`
    + `<div class="acap turn"><div class="acph">${esc(cfg.turn.label)}</div>${row(cfg.turn.label, v[cfg.turn.key])}</div>`
    + `<div class="acap end" style="--ac:${g.top}"><div class="acph">${esc(cfg.endLabel)}</div>${capRows(cfg.end)}</div>`
    + `</div>`;
  const forceHTML = cfg.forces.map(f => (v[f.key] && v[f.key].trim())
    ? `<div class="aforce ${f.color}"><div class="afk">${esc(f.label)}${f.sub ? ' ' + esc(f.sub) : ''}</div><div class="afv">${esc(v[f.key])}</div><div class="afx">${esc(f.foot)}</div></div>` : '').join('');
  const forces = forceHTML.trim() ? `<div class="aforces">${forceHTML}</div>` : '';
  return `<div class="arcbox"><div class="arcchart"><span class="aax top" style="color:${g.top}">${esc(cfg.axisTop)}</span><span class="aax bot" style="color:${g.bottom}">${esc(cfg.axisBottom)}</span>${svg}</div>${caps}${forces}</div>`;
}
// relationship dyad — pairing header + central tension + mirrored his/her columns
function dyadHTML(v, ctx){
  if (!v || typeof v !== 'object') return '';
  const a = v.a || {}, b = v.b || {}, sa = (v.sides && v.sides.a) || {}, sb = (v.sides && v.sides.b) || {};
  const anyText = [v.dynamic, v.status, v.tension, a.role, b.role, sa.wants, sa.fears, sa.hides, sa.sees, sb.wants, sb.fears, sb.hides, sb.sees].some(x => x && String(x).trim());
  if (!a.targetId && !b.targetId && !anyText) return '';
  const nameOf = (id) => (ctx.title && ctx.title(id)) || '';
  const who = (p, side) => {
    const nm = nameOf(p.targetId);
    const cover = p.targetId && ctx.cover && ctx.cover(p.targetId);
    const href = p.targetId && ctx.href && ctx.href(p.targetId);
    const av = cover ? `<span class="dav" style="background-image:url(${esc(cover)})"></span>` : `<span class="dav empty">${esc((nm || '?').slice(0, 1))}</span>`;
    const label = nm ? (href ? `<a href="${esc(href)}">${esc(nm)}</a>` : esc(nm)) : (side === 'a' ? 'Person A' : 'Person B');
    return `<div class="dwho ${side}">${av}<span class="dwm"><span class="dnm">${label}</span>${p.role ? `<span class="drl">${esc(p.role)}</span>` : ''}</span></div>`;
  };
  const bond = `<div class="dbond"><span class="dlink">↔</span>${v.dynamic ? `<span class="ddyn">${esc(v.dynamic)}</span>` : ''}${v.status ? `<span class="dstatus">${esc(v.status)}</span>` : ''}</div>`;
  const head = `<div class="dhead">${who(a, 'a')}${bond}${who(b, 'b')}</div>`;
  const tension = v.tension && v.tension.trim() ? `<div class="dtension"><div class="dtl">The tension</div><p>${esc(v.tension)}</p></div>` : '';
  const ROWS = [['wants', 'Wants from them'], ['fears', 'Fears'], ['hides', 'Won’t admit'], ['sees', 'Sees them as']];
  const sideHTML = (p, s, side) => {
    const rows = ROWS.filter(([k]) => s[k] && s[k].trim()).map(([k, lbl]) => `<div class="drow"><div class="dk">${lbl}</div><div class="dv">${esc(s[k])}</div></div>`).join('');
    if (!rows && !p.targetId) return '';
    return `<div class="dside ${side}"><div class="dsh">${esc(nameOf(p.targetId) || (side === 'a' ? 'Person A' : 'Person B'))}<span>· their side</span></div>${rows}</div>`;
  };
  const sa2 = sideHTML(a, sa, 'a'), sb2 = sideHTML(b, sb, 'b');
  const sides = (sa2 || sb2) ? `<div class="dsides">${sa2}${sb2}</div>` : '';
  return `<div class="dyad">${head}${tension}${sides}</div>`;
}
// two-column dialectic (Theme statement↔counter, Setting then→now)
function dialecticHTML(v, sec){
  if (!v || typeof v !== 'object') return '';
  const left = (v.left || '').trim(), right = (v.right || '').trim();
  if (!left && !right) return '';
  const ll = (sec && sec.leftLabel) || 'On one hand', rl = (sec && sec.rightLabel) || 'On the other';
  const lt = (sec && sec.leftTint) || '#7f9ac9', rt = (sec && sec.rightTint) || '#c98a6a';
  const sep = (sec && sec.sep) || '↔';
  const side = (label, tint, text) => `<div class="dside" style="--dt:${tint}"><div class="dsh">${esc(label)}</div><p>${esc(text)}</p></div>`;
  return `<div class="dialecticbox">${side(ll, lt, left)}<div class="dvs">${esc(sep)}</div>${side(rl, rt, right)}</div>`;
}
// operation crew — roster cards with portraits (pulled from the linked Character), role,
// cover identity, job, and "the angle". The read-in flag is writer-only (not rendered here).
const CREW_STATUS = { in: 'in', wildcard: 'wildcard', burned: 'burned', lost: 'lost' };
function crewHTML(list, ctx){
  if (!Array.isArray(list) || !list.length) return '';
  const cards = list.map(r => {
    const nm = (r.targetId && ctx.title && ctx.title(r.targetId)) || r.name || 'Operative';
    const href = r.targetId && ctx.href && ctx.href(r.targetId);
    const cover = r.targetId && ctx.cover && ctx.cover(r.targetId);
    const port = cover ? `<span class="oport" style="background-image:url(${esc(cover)})"></span>` : `<span class="oport empty">${esc((nm || '?').slice(0, 1))}</span>`;
    const name = href ? `<a href="${esc(href)}">${esc(nm)}</a>` : esc(nm);
    const st = r.status && CREW_STATUS[r.status] ? `<span class="ostatus ${r.status}">${CREW_STATUS[r.status]}</span>` : '';
    const row = (k, v, cls = '') => v && v.trim() ? `<div class="orow ${cls}"><span class="ok">${k}</span><span class="ov">${esc(v)}</span></div>` : '';
    const rows = row('cover', r.cover, 'cover') + row('job', r.job) + row('the angle', r.angle, 'angle');
    return `<div class="op${r.status === 'wildcard' ? ' wild' : ''}">${st}${port}<div class="opm"><div class="optop"><span class="onm">${name}</span>${r.role ? `<span class="orole">${esc(r.role)}</span>` : ''}</div>${rows ? `<div class="orows">${rows}</div>` : ''}</div></div>`;
  }).join('');
  return `<div class="crewgrid">${cards}</div>`;
}
// case suspects grid — motive/means/opportunity/alibi(+status)/suspicion. The guilty flag is
// writer-only and is NOT rendered here (the reveal lives in the sealed solution).
const ALIBI_LABEL = { ok: 'confirmed', unc: 'unconfirmed', broken: 'broken' };
function suspectsHTML(list, ctx){
  if (!Array.isArray(list) || !list.length) return '';
  const rows = list.map(r => {
    const nm = (r.targetId && ctx.title && ctx.title(r.targetId)) || r.name || 'Unknown';
    const href = r.targetId && ctx.href && ctx.href(r.targetId);
    const name = href ? `<a href="${esc(href)}">${esc(nm)}</a>` : esc(nm);
    const st = r.alibiStatus && ALIBI_LABEL[r.alibiStatus] ? `<span class="astat ${r.alibiStatus}">${ALIBI_LABEL[r.alibiStatus]}</span>` : '';
    const alibi = (r.alibi || st) ? `${esc(r.alibi || '')} ${st}` : '';
    const s = Math.max(0, Math.min(4, r.suspicion | 0));
    const pips = [0, 1, 2, 3].map(i => `<i class="${i < s ? 'on' : ''}"></i>`).join('');
    return `<tr><td class="sn">${name}</td><td>${esc(r.motive || '')}</td><td>${esc(r.means || '')}</td><td>${esc(r.opportunity || '')}</td><td class="al">${alibi}</td><td><span class="spips">${pips}</span></td></tr>`;
  }).join('');
  return `<div class="suspwrap"><table class="susptbl"><thead><tr><th>Suspect</th><th>Motive</th><th>Means</th><th>Opportunity</th><th>Alibi</th><th>Suspicion</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
// case clues — two-faced cards (reads-as vs means · genuine/red-herring · implicates · planted)
function cluesHTML(list, ctx){
  if (!Array.isArray(list) || !list.length) return '';
  return `<div class="cluelist">` + list.map(r => {
    const herring = r.kind === 'herring';
    const badge = herring ? `<span class="clh">✕ red herring</span>` : `<span class="clg">genuine</span>`;
    const link = r.targetId && ctx.href && ctx.href(r.targetId);
    const title = link ? `<a href="${esc(link)}">${esc(r.name || 'Clue')}</a>` : esc(r.name || 'Clue');
    const faces = (r.reads || r.means)
      ? `<div class="clfaces">${r.reads ? `<div class="clface reads"><div class="clk">Reads as</div><div class="clv">${esc(r.reads)}</div></div>` : ''}${r.means ? `<div class="clface means"><div class="clk">Actually means</div><div class="clv">${esc(r.means)}</div></div>` : ''}</div>` : '';
    const impNm = r.implicates && ctx.title && ctx.title(r.implicates);
    const impHref = r.implicates && ctx.href && ctx.href(r.implicates);
    const foot = [];
    if (impNm) foot.push(`<span><b>implicates</b> ${impHref ? `<a href="${esc(impHref)}">${esc(impNm)}</a>` : esc(impNm)}</span>`);
    if (r.planted && r.planted.trim()) foot.push(`<span><b>planted</b> ${esc(r.planted)}</span>`);
    const footHTML = foot.length ? `<div class="clfoot">${foot.join('')}</div>` : '';
    return `<div class="cluecard${herring ? ' herring' : ''}"><div class="clt">${title} ${badge}</div>${faces}${footHTML}</div>`;
  }).join('') + `</div>`;
}
// system rules — the numbered Laws, or the Can/Can't consistency block (one field, two variants)
function rulelistHTML(list, sec){
  if (!Array.isArray(list)) return '';
  const items = list.filter(r => r && r.text && r.text.trim());
  if (!items.length) return '';
  if ((sec && sec.variant) === 'cancant'){
    const can = items.filter(r => r.kind !== 'cant'), cant = items.filter(r => r.kind === 'cant');
    const canL = (sec && sec.canLabel) || 'It can', cantL = (sec && sec.cantLabel) || 'It can’t';
    const col = (h, arr, cls) => arr.length ? `<div class="rcc ${cls}"><div class="rcch">${esc(h)}</div><ul>${arr.map(r => `<li>${esc(r.text)}</li>`).join('')}</ul></div>` : '';
    return `<div class="rcancant">${col('✓ ' + canL, can, 'can')}${col('✕ ' + cantL, cant, 'cant')}</div>`;
  }
  return `<ol class="rlaws">${items.map(r => `<li>${esc(r.text)}</li>`).join('')}</ol>`;
}
// safe embeds — YouTube/Vimeo/Spotify/map/3D iframes (generic ones sandboxed)
function embedHTML(list){
  if (!Array.isArray(list) || !list.length) return '';
  const items = list.map(e => {
    const info = embedInfo(e && e.url);
    const cap = e && e.caption && e.caption.trim() ? `<div class="emcap">${esc(e.caption)}</div>` : '';
    if (!info.ok) return (e && e.url && e.url.trim()) ? `<div class="embed"><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.url)}</a>${cap}</div>` : '';
    const style = info.height ? `height:${info.height}px` : `aspect-ratio:${info.aspect || '16 / 9'}`;
    const sandbox = info.generic ? ` sandbox="${EMBED_SANDBOX}"` : '';
    return `<div class="embed"><div class="emframe" style="${style}"><iframe src="${esc(info.src)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="${EMBED_ALLOW}" allowfullscreen${sandbox}></iframe></div>${cap}</div>`;
  }).join('');
  return items.trim() ? `<div class="embeds">${items}</div>` : '';
}
// org / hierarchy chart — a top-down command tree
function orgchartHTML(v, ctx){
  const L = layoutOrg(v);
  if (!L.nodes.length) return '';
  const personName = (n) => n.name || (n.targetId && ctx.title && ctx.title(n.targetId)) || '';
  const edges = L.edges.map(e => { const p = L.nodes.find(n => n.id === e.from), c = L.nodes.find(n => n.id === e.to); return p && c ? `<path d="${orgConnector(p, c)}" fill="none" stroke="#2b3239" stroke-width="1.5"/>` : ''; }).join('');
  const nodes = L.nodes.map(n => {
    const nm = personName(n), href = n.targetId && ctx.href && ctx.href(n.targetId);
    const inner = nm
      ? `<text x="12" y="20" style="font-family:var(--head);font-size:14px;fill:var(--ink)">${esc(nm)}</text>${n.title ? `<text x="12" y="36" style="font-family:var(--mono);font-size:9px;letter-spacing:.6px;text-transform:uppercase;fill:var(--faint)">${esc(n.title)}</text>` : ''}`
      : `<text x="12" y="29" style="font-family:var(--head);font-size:14px;fill:var(--ink)">${esc(n.title || '—')}</text>`;
    const box = `<rect width="${ORG.NW}" height="${ORG.NH}" rx="9" fill="var(--panel-2,#1c2228)" stroke="${n.targetId ? '#7f3a34' : '#2b3239'}"/>${inner}`;
    const g = `<g transform="translate(${n.x},${n.y})">${box}</g>`;
    return href ? `<a href="${esc(href)}">${g}</a>` : g;
  }).join('');
  return `<div class="orgchart"><svg viewBox="0 0 ${L.width} ${L.height}" width="${L.width}" style="max-width:100%;height:auto">${edges}${nodes}</svg></div>`;
}
// stat chart — a radar (spider) shape or horizontal bars of numeric attributes
const SC_ACCENT = '#c2564a', SC_RULE = '#2b3239', SC_LABEL = '#9aa1a8';
function statchartHTML(v){
  if (!v || !Array.isArray(v.stats)) return '';
  const stats = v.stats.filter(s => s && (s.label || s.value != null && s.value !== ''));
  if (!stats.length) return '';
  const max = Number(v.max) > 0 ? Number(v.max) : 10;
  if (v.view === 'radar' && stats.length >= 3){
    const size = 260;
    const g = radarGeom(stats.map(s => Number(s.value) || 0), max, size);
    const rings = g.rings.map(r => `<polygon points="${ptsAttr(r)}" fill="none" stroke="${SC_RULE}" stroke-width="1"/>`).join('');
    const axes = g.axisEnds.map(a => `<line x1="${g.cx}" y1="${g.cy}" x2="${a.x.toFixed(1)}" y2="${a.y.toFixed(1)}" stroke="${SC_RULE}" stroke-width="1"/>`).join('');
    const dots = g.data.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6" fill="${SC_ACCENT}"/>`).join('');
    const labels = stats.map((s, i) => `<text x="${g.labelPts[i].x.toFixed(1)}" y="${g.labelPts[i].y.toFixed(1)}" text-anchor="${labelAnchor(g.labelPts[i].x, g.cx)}" dominant-baseline="middle" style="fill:${SC_LABEL};font-family:var(--mono);font-size:10px;letter-spacing:.4px">${esc(s.label || '')}</text>`).join('');
    const shape = `<polygon points="${ptsAttr(g.data)}" fill="${SC_ACCENT}" fill-opacity=".2" stroke="${SC_ACCENT}" stroke-width="2" stroke-linejoin="round"/>`;
    return `<div class="statchart"><svg viewBox="0 0 ${size} ${size}" class="scradar">${rings}${axes}${shape}${dots}${labels}</svg></div>`;
  }
  const bars = stats.map(s => {
    const w = Math.max(0, Math.min(100, (Number(s.value) || 0) / max * 100));
    return `<div class="scbar"><span class="scl">${esc(s.label || '')}</span><span class="sct"><i style="width:${w.toFixed(1)}%"></i></span><span class="scv">${esc(String(s.value ?? ''))}</span></div>`;
  }).join('');
  return `<div class="statchart"><div class="scbars">${bars}</div></div>`;
}
// relationship matrix — symmetric N×N cast grid, colour-coded at a glance
function matrixHTML(v, ctx){
  if (!v || !Array.isArray(v.people) || v.people.length < 2) return '';
  const people = v.people, pairs = v.pairs || {};
  const nameOf = (p) => esc(p.name || (p.targetId && ctx.title && ctx.title(p.targetId)) || 'Unknown');
  const head = '<tr><th class="mcorner"></th>' + people.map(p => `<th class="mcol"><span>${nameOf(p)}</span></th>`).join('') + '</tr>';
  const rows = people.map(pi => {
    const cells = people.map(pj => {
      if (pi.id === pj.id) return '<td class="mself"></td>';
      const kd = MATRIX_COLOR[pairs[pairKey(pi.id, pj.id)]];
      return kd ? `<td class="mcell" style="background:${kd.c}" title="${nameOf(pi)} · ${esc(kd.l)} · ${nameOf(pj)}"></td>` : '<td class="mcell"></td>';
    }).join('');
    return `<tr><th class="mrow">${nameOf(pi)}</th>${cells}</tr>`;
  }).join('');
  const used = new Set(Object.values(pairs));
  const legend = MATRIX_KINDS.filter(k => used.has(k.v)).map(k => `<span class="mlg"><i style="background:${k.c}"></i>${esc(k.l)}</span>`).join('');
  return `<div class="matrix"><div class="mtxscroll"><table class="mtx"><thead>${head}</thead><tbody>${rows}</tbody></table></div>${legend ? `<div class="mlegend">${legend}</div>` : ''}</div>`;
}
// generic table — user-defined columns × rows
function tableHTML(v){
  if (!v || !Array.isArray(v.cols) || !v.cols.length) return '';
  const cols = v.cols, rows = Array.isArray(v.rows) ? v.rows : [];
  const anyContent = cols.some(c => (c || '').trim()) || rows.some(r => (r || []).some(c => (c || '').trim()));
  if (!anyContent) return '';
  const head = '<tr>' + cols.map(c => `<th>${esc(c || '')}</th>`).join('') + '</tr>';
  const body = rows.map(r => '<tr>' + cols.map((_, i) => `<td>${esc((r && r[i]) || '')}</td>`).join('') + '</tr>').join('');
  return `<div class="dtblwrap"><table class="dtbl"><thead>${head}</thead><tbody>${body}</tbody></table></div>`;
}
function kindHTML(v){
  if (!v || !v.id) return '';
  const genre = v.genre ? `<span class="kgenre">${esc(v.genre.split(' · ')[0])}</span>` : '';
  return `<div class="kindchip"><span class="klabel">${esc(v.label || '')}</span>${genre}</div>`;
}
function gaugesHTML(list){
  if (!Array.isArray(list) || !list.length) return '';
  const tiles = list.map(g => {
    if (g.text){ if (!g.value) return ''; return `<div class="gtile"><div class="gl">${esc(g.label || '')}</div><div class="gv">${esc(g.value)}</div></div>`; }
    const levels = Array.isArray(g.levels) ? g.levels : []; if (!levels.length) return '';
    const at = (g.at | 0);
    const pips = levels.map((l, i) => `<span class="gpip${i <= at ? ' on' : ''}"></span>`).join('');
    return `<div class="gtile"><div class="gl">${esc(g.label || '')}</div><div class="gpips">${pips}</div><div class="gnow">${esc(levels[at] || '')}</div></div>`;
  }).join('');
  if (!tiles.trim()) return '';
  return `<div class="gauges">${tiles}</div>`;
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
// history: a vertical, buildable timeline (era/date · title · description)
function historyHTML(list, ctx){
  if (!list || !list.length) return '<p class="empty">No history yet.</p>';
  const rows = list.map(r => {
    if (!(r.date && r.date.trim()) && !(r.title && r.title.trim()) && !(r.body && r.body.trim())) return '';
    return `<div class="vnode${r.key ? ' key' : ''}"><div class="vdate">${esc(r.date || '—')}</div><div class="vb">${r.title ? `<h4>${esc(r.title)}</h4>` : ''}${richToParas(r.body, ctx)}</div></div>`;
  }).join('');
  return rows ? `<div class="vtl">${rows}</div>` : '<p class="empty">No history yet.</p>';
}
// ties: relations with other groups (linked, colour-keyed by kind)
const TIE_KINDS = { ally: { l: 'Ally', c: '#5aa06f' }, enemy: { l: 'Enemy', c: '#c05348' }, rival: { l: 'Rival', c: '#b9853a' }, wary: { l: 'Wary', c: '#b9853a' }, kin: { l: 'Kin', c: '#5f8fb0' }, patron: { l: 'Patron', c: '#5f8fb0' }, subject: { l: 'Subject', c: '#9aa1a8' }, other: { l: 'Tie', c: '#9aa1a8' } };
const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
function tiesHTML(list, sec, ctx){
  if (!list || !list.length) return '<p class="empty">No ties yet.</p>';
  const kmap = (sec && Array.isArray(sec.kinds) && sec.kinds.length)
    ? Object.fromEntries(sec.kinds.map(k => [k.v, { l: k.l || cap(k.v), c: k.c || '#9aa1a8' }]))
    : TIE_KINDS;
  const fallback = Object.values(kmap)[0] || { l: 'Tie', c: '#9aa1a8' };
  const cards = list.map(r => {
    if (!(r.name && r.name.trim()) && !r.targetId) return '';
    const t = kmap[r.kind] || fallback;
    const h = r.targetId && ctx.href && ctx.href(r.targetId);
    const nm = esc(r.name || (ctx.title && ctx.title(r.targetId)) || '—');
    const name = h ? `<a href="${esc(h)}">${nm}</a>` : nm;
    const note = r.note && r.note.trim() ? `<span class="tn">${esc(r.note)}</span>` : '';
    return `<div class="tie" style="--tc:${t.c}"><span class="tg">${name}</span><span class="tt">${t.l}</span>${note}</div>`;
  }).join('');
  return cards ? `<div class="tiegrid">${cards}</div>` : '<p class="empty">No ties yet.</p>';
}
// family tree: auto-laid-out structured genealogy chart (static SVG)
function familyTreeHTML(data, ctx){
  if (!data || !((data.people) || []).length) return '<p class="empty">No family recorded.</p>';
  const L = layoutFamily(data), NW = L.NW, NH = L.NH, pos = L.pos;
  let wires = '', bars = '', marks = '', nodes = '';
  (L.marrs || []).forEach(m => { const A = pos[m.a], B = pos[m.b]; if (!A || !B) return;
    const Lf = A.x < B.x ? A : B, R = A.x < B.x ? B : A, y = Lf.y + NH / 2;
    bars += `<path class="fmarr${m.kind === 'affair' ? ' affair' : ''}" d="M ${Lf.x + NW} ${y} L ${R.x} ${y}"/>`;
    marks += `<text class="fmlbl" x="${(Lf.x + NW + R.x) / 2}" y="${y - 6}">${m.kind === 'affair' ? '~' : 'm'}</text>`; });
  (L.links || []).forEach(k => { const ps = k.parents.map(p => pos[p]).filter(Boolean), cs = k.children.map(c => pos[c]).filter(Boolean);
    if (!ps.length || !cs.length) return;
    const jx = ps.reduce((a, p) => a + p.x + NW / 2, 0) / ps.length, py = Math.max(...ps.map(p => p.y)) + NH / 2;
    const cxs = cs.map(c => c.x + NW / 2), cy = Math.min(...cs.map(c => c.y)), bus = cy - 30;
    wires += `<path class="fwire" d="M ${jx} ${py} L ${jx} ${bus}"/><path class="fwire" d="M ${Math.min(...cxs)} ${bus} L ${Math.max(...cxs)} ${bus}"/>`;
    cxs.forEach(cx => { wires += `<path class="fwire" d="M ${cx} ${bus} L ${cx} ${cy}"/>`; }); });
  L.nodes.forEach(n => { const s = (n.name || '').indexOf(' ');
    const first = esc(s < 0 ? (n.name || '—') : n.name.slice(0, s)), sur = s < 0 ? '' : esc(n.name.slice(s + 1));
    const inner = `<g class="fnode" transform="translate(${n.x} ${n.y})"><rect width="${NW}" height="${NH}" rx="8"/><text class="fnm" x="${NW / 2}" y="22">${first}</text>${sur ? `<text class="fsur" x="${NW / 2}" y="39">${sur}</text>` : ''}</g>`;
    const h = n.targetId && ctx.href && ctx.href(n.targetId);
    nodes += h ? `<a href="${esc(h)}">${inner}</a>` : inner; });
  const vbw = Math.round(L.width + 80), vbh = Math.round(L.height + 80);
  return `<div class="famwrap"><svg class="fam" viewBox="-40 -40 ${vbw} ${vbh}" preserveAspectRatio="xMidYMid meet" style="max-width:${Math.min(vbw, 980)}px">${wires}${bars}${marks}${nodes}</svg></div>`;
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
    case 'kind': return kindHTML(v);
    case 'gauges': return gaugesHTML(v);
    case 'timeline': return chronicleHTML(v, ctx);
    case 'arc': return arcHTML(v, ctx, sec);
    case 'rulelist': return rulelistHTML(v, sec);
    case 'dyad': return dyadHTML(v, ctx);
    case 'crew': return crewHTML(v, ctx);
    case 'dialectic': return dialecticHTML(v, sec);
    case 'table': return tableHTML(v);
    case 'embed': return embedHTML(v);
    case 'matrix': return matrixHTML(v, ctx);
    case 'statchart': return statchartHTML(v);
    case 'orgchart': return orgchartHTML(v, ctx);
    case 'suspects': return suspectsHTML(v, ctx);
    case 'clues': return cluesHTML(v, ctx);
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
    case 'familytree': return familyTreeHTML(v, ctx);
    case 'history': return historyHTML(v, ctx);
    case 'ties': return tiesHTML(v, sec, ctx);
    case 'allegianceweb': return webHTML(v, entry, ctx);
    case 'eventtimeline': return timelineHTML(entry, ctx);
    case 'spotify': return spotifyHTML(v);
    case 'abilityscores': return abilityScoresHTML(v);
    case 'rolltable': return rolltableHTML(v);
    case 'checklist': return checklistHTML(v);
    case 'clocks': return clocksHTML(v);
    case 'npcroster': return npcRosterHTML(v, ctx);
    case 'twists': return twistsHTML(v, ctx);
    default: return '';
  }
}

// Plot twists — idea cards with a tracked status, setup → payoff, and an optional "hinges on" link.
function twistsHTML(list, ctx){
  if (!Array.isArray(list)) return '';
  const STATUS = { idea: ['Idea', '#9aa1a8'], maybe: ['Maybe', '#c9a24a'], planted: ['Planted', '#5f8fb0'], used: ['Used', '#5aa06f'], cut: ['Cut', '#b0596a'] };
  const cards = list.filter(r => (r.hook || r.setup || r.payoff || '').trim()).map((r, i) => {
    const st = STATUS[r.status] || STATUS.idea;
    const face = (label, val) => val && val.trim() ? `<div class="twface"><span class="twl">${label}</span><span>${esc(val)}</span></div>` : '';
    const hinge = r.targetId && ctx.title && ctx.title(r.targetId);
    const href = r.targetId && ctx.href && ctx.href(r.targetId);
    const hingeHTML = hinge ? `<div class="twhinge">Hinges on ${href ? `<a href="${esc(href)}">${esc(hinge)}</a>` : esc(hinge)}</div>` : '';
    return `<div class="twist${r.status === 'cut' ? ' cut' : ''}" style="--st:${st[1]}"><div class="twtop"><span class="twnum">${i + 1}</span><span class="twhook">${esc(r.hook || 'Untitled twist')}</span><span class="twbadge" style="color:${st[1]};border-color:${st[1]}">${esc(st[0])}</span></div>${face('Setup', r.setup)}${face('Payoff', r.payoff)}${hingeHTML}</div>`;
  }).join('');
  return cards ? `<div class="twists">${cards}</div>` : '';
}

// NPC roster — quick minor-NPC cards. The `secret` field is GM-only and is NOT exported.
function npcRosterHTML(list, ctx){
  if (!Array.isArray(list)) return '';
  const cards = list.filter(r => (r.name || '').trim() || r.targetId).map(r => {
    const nm = r.name || (r.targetId && ctx.title && ctx.title(r.targetId)) || 'NPC';
    const href = r.targetId && ctx.href && ctx.href(r.targetId);
    const cover = (r.targetId && ctx.cover && ctx.cover(r.targetId)) || r.img || '';
    const port = cover ? `<span class="nport" style="background-image:url(${esc(cover)})"></span>` : `<span class="nport empty">${esc((nm || '?').slice(0, 1))}</span>`;
    const name = href ? `<a href="${esc(href)}">${esc(nm)}</a>` : esc(nm);
    const row = (k, v) => v && v.trim() ? `<div class="nrow"><span class="nk">${k}</span><span class="nv">${esc(v)}</span></div>` : '';
    const rows = row('wants', r.want) + row('quirk', r.quirk) + row('where', r.where);
    const disp = r.disp ? `<span class="ndisp ${esc(r.disp)}">${esc(r.disp)}</span>` : '';
    return `<div class="npc" data-disp="${esc(r.disp || '')}">${port}<div class="nmain"><div class="ntop"><span class="nnm">${name}</span>${r.role ? `<span class="nrole">${esc(r.role)}</span>` : ''}${disp}</div>${rows ? `<div class="nrows">${rows}</div>` : ''}</div></div>`;
  }).join('');
  return cards ? `<div class="roster">${cards}</div>` : '';
}

function clocksHTML(v){
  if (!Array.isArray(v) || !v.length) return '';
  const wedge = (i, n) => {
    const cx = 24, cy = 24, r = 22;
    const a0 = (-90 + i * 360 / n) * Math.PI / 180, a1 = (-90 + (i + 1) * 360 / n) * Math.PI / 180;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const large = (360 / n) > 180 ? 1 : 0;
    return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
  };
  const clocks = v.filter(c => c && c.segments).map(c => {
    const segs = Array.from({ length: c.segments }, (_, s) => `<path class="seg${s < (c.filled || 0) ? ' fill' : ''}" d="${wedge(s, c.segments)}"/>`).join('');
    return `<div class="clk"><svg class="clkface" viewBox="0 0 48 48">${segs}<circle class="clkring" cx="24" cy="24" r="22"/></svg><div class="clklbl">${esc(c.label || '')}</div><div class="clkctl">${c.filled || 0}/${c.segments}</div></div>`;
  }).join('');
  return `<div class="clocks">${clocks}</div>`;
}

function checklistHTML(v){
  if (!Array.isArray(v)) return '';
  const rows = v.filter(r => r.text && String(r.text).trim());
  if (!rows.length) return '';
  const done = rows.filter(r => r.done).length;
  const items = rows.map(r => `<div class="ckrow${r.done ? ' done' : ''}"><span class="ckbox">${r.done ? '☑' : '☐'}</span><span class="cktext">${esc(r.text)}</span></div>`).join('');
  return `<div class="checklist"><div class="ckhd">${done}/${rows.length}</div>${items}</div>`;
}

function rolltableHTML(v){
  if (!v || !Array.isArray(v.rows)) return '';
  const rows = v.rows.filter(r => (r.range && String(r.range).trim()) || (r.text && String(r.text).trim()));
  if (!rows.length) return '';
  const die = parseInt(v.die, 10) || rows.length || 1;
  const pr = (s) => { if (s == null) return null; s = String(s).trim(); const m = s.match(/^(\d+)\s*[-–]\s*(\d+)$/); if (m) return [+m[1], +m[2]]; if (/^\d+$/.test(s)) return [+s, +s]; return null; };
  const body = rows.map(r => {
    const rg = pr(r.range); const attrs = rg ? ` data-min="${rg[0]}" data-max="${rg[1]}"` : '';
    return `<div class="rtrow"${attrs}><span class="rtrange">${esc(r.range || '')}</span><span class="rttext">${esc(r.text || '')}</span></div>`;
  }).join('');
  return `<div class="rolltable" data-die="${die}"><div class="rtrows">${body}</div><div class="rtbar"><button type="button" class="rtroll">🎲 Roll d${die}</button><span class="rtresult"></span></div></div>`;
}

function abilityScoresHTML(v){
  if (!v) return '';
  let rows, mode;
  if (Array.isArray(v.rows)){ rows = v.rows; mode = v.mode; }
  else if (typeof v === 'object'){   // legacy fixed-key shape
    rows = [['str', 'STR'], ['dex', 'DEX'], ['con', 'CON'], ['int', 'INT'], ['wis', 'WIS'], ['cha', 'CHA']].map(([k, l]) => ({ label: l, value: v[k] }));
    mode = 'dnd';
  } else return '';
  rows = rows.filter(r => (r.label && String(r.label).trim()) || (r.value !== undefined && r.value !== null && r.value !== ''));
  if (!rows.length) return '';
  const dnd = mode === 'dnd', dots = mode === 'dots', dmax = v.max || 5;
  const mod = (x) => { const n = parseInt(x, 10); if (Number.isNaN(n)) return '—'; const m = Math.floor((n - 10) / 2); return (m >= 0 ? '+' : '') + m; };
  const dotRow = (val) => `<div class="dots">${Array.from({ length: dmax }, (_, i) => `<span class="dot${(parseInt(val, 10) || 0) > i ? ' fill' : ''}"></span>`).join('')}</div>`;
  const cells = rows.map(r => {
    let inner;
    if (dots) inner = dotRow(r.value);
    else {
      const shown = (r.value === undefined || r.value === null || r.value === '') ? '—' : esc(String(r.value));
      inner = `<div class="absc">${shown}</div>${dnd ? `<div class="abmod">${mod(r.value)}</div>` : ''}`;
    }
    return `<div class="ab${dots ? ' isdots' : ''}"><div class="abl">${esc(r.label || '')}</div>${inner}</div>`;
  }).join('');
  return `<div class="abil">${cells}</div>`;
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
  // custom types aren't in any built-in family — group them under "Your types"
  const inFamily = new Set(FAMILIES.flatMap(f => f.types));
  const customPresent = ((project.types || []).map(t => t.type)).concat(Object.keys(byType))
    .filter((t, i, a) => a.indexOf(t) === i && !inFamily.has(t) && (byType[t] || []).length);
  const customBlocks = customPresent.map(t => {
    const tpl = templateFor(t);
    const items = byType[t].map(e => {
      const cur = e.id === ctx.currentId; const label = esc(e.title || 'Untitled'); const h = ctx.href(e.id);
      return `<li class="${cur ? 'cur' : ''}">${cur || !h ? `<span>${label}</span>` : `<a href="${esc(h)}">${label}</a>`}</li>`;
    }).join('');
    const open = byType[t].some(e => e.id === ctx.currentId) ? ' open' : '';
    return `<details class="ntype"${open}><summary><span class="nic">${tpl.icon}</span><span class="nlbl">${esc(tpl.plural)}</span><span class="nct">${byType[t].length}</span></summary><ul>${items}</ul></details>`;
  }).join('');
  const customFam = customBlocks ? `<div class="nfam"><div class="nfamh">Your types</div>${customBlocks}</div>` : '';
  const hub = ctx.hubHref ? `<a class="nhub" href="${esc(ctx.hubHref)}">${esc(project.name || 'Project')}</a>` : `<span class="nhub cur">${esc(project.name || 'Project')}</span>`;
  return `<aside class="sidenav"><div class="navhead">${hub}</div><nav class="navtree">${fams}${customFam}</nav></aside>`;
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
  const gallerySec = tpl.sections.find(s => s.type === 'gallery');
  const statsSec = tpl.sections.find(s => s.type === 'stats');
  // Universal per-entry image placement: any gallery sheet (except outline/plot) can move its
  // image between a top banner, a side column, or the details rail — the position selects the
  // rendering format (side→split, top→hero, rail→codex/infobox), defaulting to the layout's
  // native slot. Mirrors the editor's placement logic so export matches the edit view.
  const NATIVE_POS = { split: 'side', hero: 'top', codex: 'rail', infobox: 'rail' };
  // 'infobox' is retired — the composable rail (codex) supersedes it everywhere
  let layout = tpl.layout === 'infobox' ? 'codex' : (tpl.layout || 'codex');
  if (gallerySec && layout !== 'outline'){
    // mediaToggle sheets (Research) historically defaulted to Side — preserve that
    const pos = entry.mediaPos || (tpl.mediaToggle ? 'side' : NATIVE_POS[tpl.layout]) || 'rail';
    layout = pos === 'side' ? 'split' : pos === 'top' ? 'hero' : 'codex';   // 'rail' → composable rail for every sheet
  }
  const bodySecs = bodySectionsOf(entry);
  // build the body, injecting a zone divider before the first non-empty section of each zone;
  // `band`-slot sections are collected separately to render full-width below the columns
  let body = '', bandInner = '', lastZone = null;
  for (const sec of bodySecs){
    const inner = fieldHTML(entry, sec, ctx);
    if (!inner) continue;
    // `sealed` sections (e.g. a Case's solution) tuck behind a spoiler in the read/export view
    if (sec.sealed){ body += `<details class="sealed"><summary>⚠ ${esc(sec.label)} — unseal</summary><div class="sealedb">${inner}</div></details>`; continue; }
    if (sec.slot === 'band'){ bandInner += heading(sec, inner); continue; }
    if (sec.zone && sec.zone !== lastZone){ body += `<div class="zonebar"><span class="zt">${esc(sec.zone)}</span><span class="zl"></span></div>`; lastZone = sec.zone; }
    body += heading(sec, inner);
  }
  // sidebar features fall back into the main column when the layout has no general rail
  // (only `codex` renders arbitrary aside sections) — so nothing the user added ever vanishes
  if (layout !== 'codex'){
    const hidden = entry.hidden || [];
    for (const sec of tpl.sections){
      if (sec.slot !== 'aside' || hidden.includes(sec.key) || sec === gallerySec || sec === statsSec) continue;
      const inner = fieldHTML(entry, sec, ctx); if (!inner) continue;
      body += heading(sec, inner);
    }
  }
  body += backlinksHTML(ctx.backlinks, ctx);
  const bandsHTML = bandInner ? `<div class="bands">${bandInner}</div>` : '';
  const title = `<div class="etitle"><h1>${esc(entry.title || 'Untitled')}</h1>${entry.subtitle ? (tpl.motto ? `<div class="words"><span>${esc(entry.subtitle)}</span></div>` : `<div class="esub">${esc(entry.subtitle)}</div>`) : ''}</div>`;
  const stats = statsSec ? fieldHTML(entry, statsSec, ctx) : '';
  const gal = gallerySec ? fieldHTML(entry, gallerySec, ctx) : '';

  let main = '';
  if (layout === 'outline'){
    if (tpl.mediaPlace && gal && entry.mediaPos === 'side'){
      main = `<div class="wsplit"><div class="media">${gal}</div><div class="col">${title}${body}</div></div>`;
    } else if (tpl.mediaPlace && gal && entry.mediaPos === 'rail'){
      main = `<div class="wbody"><main class="article">${title}${body}</main><aside class="infobox">${gal}</aside></div>`;
    } else {
      main = `<div class="wrap-narrow">${gal}${title}${body}</div>`;
    }
  } else if (layout === 'split'){
    // with no image the portrait column would just be empty space stranding the content to one
    // side — collapse to a centered single column (the hero format) instead
    main = gal
      ? `<div class="wsplit"><div class="media">${gal}</div><div class="col">${title}${stats}${body}</div></div>`
      : `<div class="whero">${title}${stats}${body}</div>`;
  } else if (layout === 'hero'){
    // a sheet shown as a top banner uses a feature image; sigil sheets keep emblem-beside-title
    const head = tpl.media === 'sigil'
      ? `<div class="herohead">${gal ? `<div class="sig">${gal}</div>` : ''}${title}</div>`
      : `${title}${gal}`;
    main = `<div class="whero">${head}${stats}${body}</div>`;
  } else {
    // rail / codex — article in the main column; the aside rail renders every non-hidden aside
    // section as a titled widget (the composable sidebar), in the reader's chosen order. Also the catch-all.
    const asideList = tpl.sections.filter(s => s.slot === 'aside' && !(entry.hidden || []).includes(s.key));
    if (entry.asideOrder && entry.asideOrder.length){ const oi = k => { const i = entry.asideOrder.indexOf(k); return i === -1 ? Infinity : i; }; asideList.sort((a, b) => oi(a.key) - oi(b.key)); }
    const rail = asideList.map(sec => {
      const inner = fieldHTML(entry, sec, ctx); if (!inner) return '';
      return `<div class="railw"><div class="rwh">${esc(sec.label)}</div>${inner}</div>`;
    }).join('');
    main = `<div class="wbody"><main class="article">${title}${body}</main><aside class="infobox codexrail">${rail}</aside></div>${bandsHTML}`;
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
  // built-in order, then any custom types present (in the project's type order)
  const customOrder = (project.types || []).map(t => t.type).filter(t => !ENTRY_TYPES.includes(t));
  const extras = Object.keys(groups).filter(t => !ENTRY_TYPES.includes(t) && !customOrder.includes(t));
  const order = [...ENTRY_TYPES, ...customOrder, ...extras];
  const secs = order.filter(t => (groups[t] || []).length).map(t => {
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
export const READER_JS = `(function(){document.querySelectorAll('.carousel').forEach(function(c){var st=c.querySelector('.cstage');var sl=[].slice.call(st.querySelectorAll('.cslide'));if(sl.length<2)return;var cnt=c.querySelector('.ccount');var i=0;function s(){sl.forEach(function(x,k){x.className='cslide'+(k===i?' on':'');});if(cnt)cnt.textContent=(i+1)+' / '+sl.length;}var p=c.querySelector('.cprev'),n=c.querySelector('.cnext');if(p)p.onclick=function(){i=(i-1+sl.length)%sl.length;s();};if(n)n.onclick=function(){i=(i+1)%sl.length;s();};});var sh=document.querySelector('.shell');if(sh){document.querySelectorAll('[data-navtoggle]').forEach(function(b){b.onclick=function(){sh.classList.toggle('nav-open');};});}document.querySelectorAll('.rolltable').forEach(function(t){var die=+t.getAttribute('data-die')||20;var btn=t.querySelector('.rtroll');var out=t.querySelector('.rtresult');var rows=[].slice.call(t.querySelectorAll('.rtrow'));if(!btn)return;btn.onclick=function(){var r=1+Math.floor(Math.random()*die);var hit=-1;rows.forEach(function(row,idx){row.classList.remove('hit');var mn=+row.getAttribute('data-min'),mx=+row.getAttribute('data-max');if(hit<0&&!isNaN(mn)&&r>=mn&&r<=mx)hit=idx;});if(hit>=0)rows[hit].classList.add('hit');if(out)out.textContent='Rolled '+r+(hit<0?' · no match':'');};});})();`;

export function docShell({ title, palette, headFont, bodyFont, headScale, bodyScale, portraitScale, fontPrefix, faceCSS, bodyHTML }){
  const faces = faceCSS != null ? faceCSS : fontFaceCSS(fontPrefix || '/fonts/', [headFont, bodyFont]);
  const head = paletteVars(palById(palette)) + fontVars(headFont, bodyFont, headScale, bodyScale, portraitScale) + '\n' + faces + '\n' + READER_CSS;
  return `<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(title)}</title><style>${head}</style></head><body>${bodyHTML}<script>${READER_JS}</script></body></html>`;
}
