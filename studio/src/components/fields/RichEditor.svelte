<script>
  import { sanitizeRich, richToEditor } from '../../lib/richtext.js';
  import { curProject, curEntry } from '../../lib/store.svelte.js';
  import { templateFor } from '../../lib/templates.js';
  let { value = '', placeholder = '', multiline = false, oninput } = $props();
  let el;
  let menu = $state(null);   // { items, index, x, y } while the [[ autocomplete is open
  let focused = $state(false);

  function exec(cmd){ el.focus(); try { document.execCommand('styleWithCSS', false, false); } catch (_) {} document.execCommand(cmd, false, null); handleInput(); }

  // Set/sync DOM content from the model, but never while the user is typing in it.
  $effect(() => {
    const html = richToEditor(value);
    if (el && document.activeElement !== el && el.innerHTML !== html) el.innerHTML = html;
  });

  // link targets: every other entry in the current project
  const candidates = $derived.by(() => {
    const p = curProject(), cur = curEntry();
    return (p?.entries || []).filter(e => e.id !== cur?.id).map(e => ({ id: e.id, title: e.title || 'Untitled', type: e.type }));
  });
  const score = (e, q) => { const t = e.title.toLowerCase(); return t === q ? 3 : t.startsWith(q) ? 2 : 1; };

  function handleInput(){ oninput?.(sanitizeRich(el.innerHTML)); checkTrigger(); }

  // detect an unclosed "[[query" immediately before the caret and open the picker
  function checkTrigger(){
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed){ menu = null; return; }
    const range = sel.getRangeAt(0);
    if (range.startContainer.nodeType !== 3){ menu = null; return; }
    const before = range.startContainer.nodeValue.slice(0, range.startOffset);
    const m = before.match(/\[\[([^\[\]\n]*)$/);
    if (!m){ menu = null; return; }
    const q = m[1].toLowerCase();
    const items = candidates.filter(e => e.title.toLowerCase().includes(q)).sort((a, b) => score(b, q) - score(a, q)).slice(0, 8);
    let rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) rect = el.getBoundingClientRect();
    menu = { items, index: 0, x: rect.left, y: rect.bottom };
  }

  function insertLink(entry){
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount){ menu = null; return; }
    const range = sel.getRangeAt(0), node = range.startContainer, off = range.startOffset;
    if (node.nodeType !== 3){ menu = null; return; }
    const text = node.nodeValue, m = text.slice(0, off).match(/\[\[([^\[\]\n]*)$/);
    if (!m){ menu = null; return; }
    const start = off - m[0].length;
    const chip = document.createElement('a');
    chip.className = 'xref'; chip.setAttribute('data-id', entry.id); chip.setAttribute('contenteditable', 'false');
    chip.textContent = entry.title;
    const after = document.createTextNode(' ' + text.slice(off));
    node.nodeValue = text.slice(0, start);
    node.parentNode.insertBefore(after, node.nextSibling);
    node.parentNode.insertBefore(chip, after);
    const r = document.createRange(); r.setStart(after, 1); r.collapse(true);
    sel.removeAllRanges(); sel.addRange(r);
    menu = null;
    handleInput();
  }

  function keydown(e){
    if (menu){
      if (e.key === 'ArrowDown'){ e.preventDefault(); menu.index = (menu.index + 1) % menu.items.length; return; }
      if (e.key === 'ArrowUp'){ e.preventDefault(); menu.index = (menu.index - 1 + menu.items.length) % menu.items.length; return; }
      if ((e.key === 'Enter' || e.key === 'Tab') && menu.items.length){ e.preventDefault(); insertLink(menu.items[menu.index]); return; }
      if (e.key === 'Escape'){ e.preventDefault(); menu = null; return; }
    }
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey){
      if (e.code === 'Digit8'){ e.preventDefault(); exec('insertUnorderedList'); return; }
      if (e.code === 'Digit7'){ e.preventDefault(); exec('insertOrderedList'); return; }
    }
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey){
      const k = (e.key || '').toLowerCase();
      if (k === 'b' || k === 'i'){ e.preventDefault(); exec(k === 'b' ? 'bold' : 'italic'); }
    }
  }
  function paste(e){
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, t);
  }
</script>

<div class="rewrap">
  {#if focused && multiline}
    <div class="retb" role="toolbar" tabindex="-1" aria-label="Formatting" onmousedown={(e) => e.preventDefault()}>
      <button type="button" onclick={() => exec('bold')} title="Bold (⌘B)"><b>B</b></button>
      <button type="button" onclick={() => exec('italic')} title="Italic (⌘I)"><i>I</i></button>
      <span class="tbsep"></span>
      <button type="button" onclick={() => exec('insertUnorderedList')} title="Bullet list (⌘⇧8)">•&nbsp;–</button>
      <button type="button" onclick={() => exec('insertOrderedList')} title="Numbered list (⌘⇧7)">1.</button>
    </div>
  {/if}
  <div class="ce" class:ml={multiline} contenteditable="true" role="textbox" aria-multiline="true" aria-label={placeholder || 'Text'} tabindex="0" bind:this={el}
       data-ph={placeholder} oninput={handleInput} onkeydown={keydown} onpaste={paste}
       onfocus={() => focused = true}
       onblur={() => { setTimeout(() => menu = null, 120); setTimeout(() => focused = false, 150); }}></div>
  {#if menu}
    <div class="xmenu" style="left:{menu.x}px;top:calc({menu.y}px + 4px)">
      {#if menu.items.length}
        {#each menu.items as it, i (it.id)}
          <button type="button" class="xitem" class:on={i === menu.index}
                  onmousedown={(e) => { e.preventDefault(); insertLink(it); }}
                  onmousemove={() => menu.index = i}>
            <span class="xic">{templateFor(it.type).icon}</span>
            <span class="xtt">{it.title}</span>
          </button>
        {/each}
      {:else}
        <div class="xnone">No entry matches — keep typing</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .rewrap{position:relative}
  .ce{outline:none;border-radius:3px;cursor:text;transition:background .1s,box-shadow .1s;font-family:var(--body);font-size:calc(1rem*var(--bs,1));line-height:1.6;color:var(--ink)}
  .ce:hover{background:var(--line)}
  .ce:focus{background:var(--line);box-shadow:0 0 0 1px var(--accent)}
  .ce.ml{white-space:pre-wrap;display:block;min-height:1.4em}
  .ce:empty:before{content:attr(data-ph);color:var(--faint);font-style:italic}
  .ce :global(a.xref){color:var(--accent);font-weight:500;background:var(--panel-2);border:1px solid var(--rule);border-radius:4px;padding:0 5px;white-space:nowrap;cursor:default}
  .ce :global(ul),.ce :global(ol){margin:.3em 0;padding-left:1.4em}
  .ce :global(li){margin:.15em 0}

  .retb{position:absolute;top:-32px;right:0;z-index:20;display:flex;align-items:center;gap:3px;background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:3px;box-shadow:0 6px 18px rgba(0,0,0,.35)}
  .retb button{font:inherit;font-size:.72rem;min-width:24px;height:24px;padding:0 6px;background:none;border:none;border-radius:6px;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center}
  .retb button:hover{background:var(--panel-2);color:var(--ink)}
  .retb b,.retb i{font-size:.82rem;color:var(--ink)}
  .tbsep{width:1px;height:16px;background:var(--rule);margin:0 2px}

  .xmenu{position:fixed;z-index:var(--z-overlay);min-width:210px;max-width:280px;max-height:260px;overflow:auto;background:var(--panel);border:1px solid var(--rule);border-radius:10px;box-shadow:0 16px 40px rgba(0,0,0,.5);padding:5px}
  .xitem{display:flex;align-items:center;gap:9px;width:100%;text-align:left;font:inherit;font-size:.9rem;background:none;border:none;border-radius:7px;padding:7px 9px;cursor:pointer;color:var(--ink)}
  .xitem.on{background:var(--panel-2)}
  .xic{color:var(--accent-soft);width:1.1em;text-align:center;flex:none}
  .xtt{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .xnone{padding:9px 10px;font-size:.8rem;color:var(--faint);font-style:italic}
</style>
