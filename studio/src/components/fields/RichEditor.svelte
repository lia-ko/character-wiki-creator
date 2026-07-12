<script>
  import { sanitizeRich, richToEditor } from '../../lib/richtext.js';
  let { value = '', placeholder = '', multiline = false, oninput } = $props();
  let el;

  // Set/sync DOM content from the model, but never while the user is typing in it.
  $effect(() => {
    const html = richToEditor(value);
    if (el && document.activeElement !== el && el.innerHTML !== html) el.innerHTML = html;
  });

  function handleInput(){ oninput?.(sanitizeRich(el.innerHTML)); }
  function keydown(e){
    if ((e.metaKey || e.ctrlKey) && !e.altKey){
      const k = (e.key || '').toLowerCase();
      if (k === 'b' || k === 'i'){
        e.preventDefault();
        try { document.execCommand('styleWithCSS', false, false); } catch (_) {}
        document.execCommand(k === 'b' ? 'bold' : 'italic', false, null);
        handleInput();
      }
    }
  }
  function paste(e){
    e.preventDefault();
    const t = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, t);
  }
</script>

<div class="ce" class:ml={multiline} contenteditable="true" bind:this={el}
     data-ph={placeholder} oninput={handleInput} onkeydown={keydown} onpaste={paste}></div>

<style>
  .ce{outline:none;border-radius:3px;cursor:text;transition:background .1s,box-shadow .1s;font-family:var(--body);font-size:calc(1rem*var(--bs,1));line-height:1.6;color:var(--ink)}
  .ce:hover{background:var(--line)}
  .ce:focus{background:var(--line);box-shadow:0 0 0 1px var(--accent)}
  .ce.ml{white-space:pre-wrap;display:block;min-height:1.4em}
  .ce:empty:before{content:attr(data-ph);color:var(--faint);font-style:italic}
</style>
