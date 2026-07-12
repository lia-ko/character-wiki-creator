/* Rich prose fields store "safe HTML": escaped text + <b>/<i> tags, with \n for line breaks.
   sanitizeRich() is the ONLY entry point for untrusted content (typing/paste/import) — it
   whitelists bold + italic, drops everything else, and uses DOMParser so no scripts/resources run. */

export function esc(s){
  return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

export function sanitizeRich(html){
  const e2 = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const doc = new DOMParser().parseFromString('<body>' + String(html == null ? '' : html) + '</body>', 'text/html');
  let out = '';
  (function walk(node, list){
    for (let n = node.firstChild; n; n = n.nextSibling){
      if (n.nodeType === 3){ out += e2(n.nodeValue); }
      else if (n.nodeType === 1){
        const tag = n.nodeName.toLowerCase();
        if (tag === 'br'){ out += '\n'; }
        else if (tag === 'a' && n.getAttribute('data-id')){       // entry link chip -> [[id|label]] token
          out += '[[' + n.getAttribute('data-id').replace(/[^\w-]/g,'') + '|' + e2((n.textContent || '').replace(/\u00a0/g,' ').trim()) + ']]';
        }
        else if (tag === 'b' || tag === 'strong'){ out += '<b>'; walk(n, list); out += '</b>'; }
        else if (tag === 'i' || tag === 'em'){ out += '<i>'; walk(n, list); out += '</i>'; }
        else if (tag === 'ul' || tag === 'ol'){ if (out && !/\n$/.test(out)) out += '\n'; walk(n, { ol: tag === 'ol', n: 0 }); if (!/\n$/.test(out)) out += '\n'; }
        else if (tag === 'li'){ if (out && !/\n$/.test(out)) out += '\n'; out += (list && list.ol) ? (++list.n) + '. ' : '- '; walk(n, null); }
        else if (tag === 'div' || tag === 'p'){ if (out && !/\n$/.test(out)) out += '\n'; walk(n, list); out += '\n'; }
        else { walk(n, list); }
      }
    }
  })(doc.body, null);
  return out.replace(/\u00a0/g,' ').replace(/<(b|i)>\s*<\/\1>/g,'').replace(/\n{3,}/g,'\n\n').replace(/^\n+|\n+$/g,'');
}

// Regex for a stored entry-link token: [[entryId|label]]  (label already escaped in storage).
export const LINK_RE = /\[\[([\w-]+)\|([^\]]*)\]\]/g;

/* Turn [[id|label]] tokens into <a> links (or a dead span). ctx supplies href(id) + title(id);
   with no ctx the label renders as plain text. Live title wins over the stored label snapshot. */
export function resolveLinks(t, ctx){
  return String(t == null ? '' : t).replace(LINK_RE, (_, id, label) => {
    if (!ctx) return label;
    const live = ctx.title ? ctx.title(id) : null;
    const text = live != null ? esc(live) : label;
    const href = ctx.href ? ctx.href(id) : null;
    return href ? `<a class="xref" href="${esc(href)}">${text}</a>` : `<span class="xref dead">${text}</span>`;
  });
}

/* Group stored lines into blocks: bullet lists ("- x"), numbered lists ("N. x"), and text
   runs. Lists are stored as markdown-ish line markers so the format stays plain text. */
const isBullet = (l) => /^-\s+/.test(l);
const isNumber = (l) => /^\d+\.\s+/.test(l);
function parseBlocks(s){
  const lines = String(s).split('\n'), blocks = []; let i = 0;
  while (i < lines.length){
    if (isBullet(lines[i])){ const items = []; while (i < lines.length && isBullet(lines[i])){ items.push(lines[i].replace(/^-\s+/, '')); i++; } blocks.push({ t: 'ul', items }); }
    else if (isNumber(lines[i])){ const items = []; while (i < lines.length && isNumber(lines[i])){ items.push(lines[i].replace(/^\d+\.\s+/, '')); i++; } blocks.push({ t: 'ol', items }); }
    else {
      const buf = []; while (i < lines.length && !isBullet(lines[i]) && !isNumber(lines[i])){ buf.push(lines[i]); i++; }
      while (buf.length && buf[0].trim() === '') buf.shift();               // drop blank lines adjacent to a list
      while (buf.length && buf[buf.length - 1].trim() === '') buf.pop();
      if (buf.length) blocks.push({ t: 'text', text: buf.join('\n') });
    }
  }
  return blocks;
}

/* stored safe-HTML -> what goes inside a contenteditable (tokens -> chips, lists -> <ul>/<ol>) */
export function richToEditor(val){
  const s = String(val || '').replace(LINK_RE, (_, id, label) => `<a class="xref" data-id="${id}" contenteditable="false">${label}</a>`);
  return parseBlocks(s).map(b => {
    if (b.t === 'ul') return '<ul>' + b.items.map(x => `<li>${x || '<br>'}</li>`).join('') + '</ul>';
    if (b.t === 'ol') return '<ol>' + b.items.map(x => `<li>${x || '<br>'}</li>`).join('') + '</ol>';
    return b.text.replace(/\n/g, '<br>');
  }).join('');
}

/* stored safe-HTML -> rendered paragraphs for preview/export (already escaped; keep <b>/<i>) */
export function richToParas(t, ctx){
  if (!t || !String(t).trim()) return '<p class="empty">—</p>';
  const out = parseBlocks(resolveLinks(String(t), ctx)).map(b => {
    if (b.t === 'ul') return '<ul>' + b.items.map(x => `<li>${x}</li>`).join('') + '</ul>';
    if (b.t === 'ol') return '<ol>' + b.items.map(x => `<li>${x}</li>`).join('') + '</ol>';
    return b.text.split(/\n\s*\n/).filter(x => x.trim()).map(x => '<p>' + x.replace(/\n/g, '<br>') + '</p>').join('');
  }).join('');
  return out || '<p class="empty">—</p>';
}

/* one line, newlines -> <br> (for leads / summaries — no list parsing) */
export function richToLine(t, ctx){ return resolveLinks(String(t || ''), ctx).replace(/\n/g, '<br>'); }
