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
  (function walk(node){
    for (let n = node.firstChild; n; n = n.nextSibling){
      if (n.nodeType === 3){ out += e2(n.nodeValue); }
      else if (n.nodeType === 1){
        const tag = n.nodeName.toLowerCase();
        if (tag === 'br'){ out += '\n'; }
        else if (tag === 'b' || tag === 'strong'){ out += '<b>'; walk(n); out += '</b>'; }
        else if (tag === 'i' || tag === 'em'){ out += '<i>'; walk(n); out += '</i>'; }
        else if (tag === 'div' || tag === 'p'){ if (out && !/\n$/.test(out)) out += '\n'; walk(n); out += '\n'; }
        else { walk(n); }
      }
    }
  })(doc.body);
  return out.replace(/\u00a0/g,' ').replace(/<(b|i)>\s*<\/\1>/g,'').replace(/\n{3,}/g,'\n\n').replace(/^\n+|\n+$/g,'');
}

/* stored safe-HTML -> what goes inside a contenteditable (newlines become <br>) */
export function richToEditor(val){ return String(val || '').replace(/\n/g, '<br>'); }

/* stored safe-HTML -> rendered paragraphs for preview/export (already escaped; keep <b>/<i>) */
export function richToParas(t){
  if (!t || !String(t).trim()) return '<p class="empty">—</p>';
  return String(t).split(/\n\s*\n/).filter(x => x.trim())
    .map(x => "<p>" + x.replace(/\n/g, "<br>") + "</p>").join("");
}

/* one line, newlines -> <br> (for leads / summaries) */
export function richToLine(t){ return String(t || '').replace(/\n/g, '<br>'); }
