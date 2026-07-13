<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);

  const KINDS = ['book', 'article', 'web', 'video', 'other'];
  const safeUrl = (u) => /^https?:\/\//i.test(u || '') ? u : '';

  function add(){ list.push({ title: '', kind: 'book', url: '', level: 0, note: '' }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.title && r.title.trim()) || (r.url && r.url.trim()) || (r.note && r.note.trim());
    if (!(await confirmDelete(has, r.title ? '“' + r.title + '”' : 'this reference'))) return;
    list.splice(i, 1); markDirty();
  }
  function setLevel(i, lv){ list[i].level = (list[i].level === lv) ? lv - 1 : lv; markDirty(); }   // click current top to clear
  function open(u){ const s = safeUrl(u); if (s) window.open(s, '_blank', 'noopener'); }
</script>

<div class="refs">
  {#each list as r, i (i)}
    <div class="ref">
      <select class="rkind" bind:value={r.kind} onchange={markDirty} aria-label="reference kind">
        {#each KINDS as k}<option value={k}>{k}</option>{/each}
      </select>
      <div class="rmain">
        <input class="rtitle" bind:value={r.title} oninput={markDirty} placeholder="Title / author" />
        <div class="rurlrow">
          <input class="rurl" bind:value={r.url} oninput={markDirty} placeholder="https://…  (link, optional)" />
          {#if safeUrl(r.url)}<button class="ropen" onclick={() => open(r.url)} title="open link">↗</button>{/if}
          <span class="rrel" title="reliability">
            {#each [1, 2, 3, 4] as lv}
              <button class="pip" class:on={(r.level || 0) >= lv} onclick={() => setLevel(i, lv)} title="reliability {lv}/4" aria-label="reliability {lv} of 4"></button>
            {/each}
          </span>
        </div>
        <input class="rnote" bind:value={r.note} oninput={markDirty} placeholder="note (edition, timestamp, why it matters…)" />
      </div>
      <div class="racts"><Reorder {list} {i} /><button class="rdel" onclick={() => del(i)} title="remove" aria-label="remove reference">✕</button></div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add reference</button>
</div>

<style>
  .refs{display:flex;flex-direction:column;gap:9px}
  .ref{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:11px;align-items:start;border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:10px 12px}
  .rkind{align-self:start;margin-top:2px;font-family:var(--mono);font-size:.56rem;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-soft);background:var(--panel-2);border:1px solid var(--rule);border-radius:20px;padding:4px 8px;cursor:pointer}
  .rmain{display:flex;flex-direction:column;gap:6px;min-width:0}
  .rtitle{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.05rem*var(--hs,1));color:var(--ink);width:100%}
  .rtitle::placeholder{color:var(--faint)}
  .rurlrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .rurl{flex:1;min-width:10em;background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.66rem;color:var(--accent-soft);padding:4px 8px}
  .rurl::placeholder{color:var(--faint)}
  .rurl:focus{border-color:var(--accent)}
  .ropen{flex:none;border:1px solid var(--rule);background:var(--panel-2);color:var(--accent-soft);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .ropen:hover{border-color:var(--accent);color:var(--ink)}
  .rrel{display:inline-flex;gap:3px;flex:none}
  .pip{width:11px;height:11px;padding:0;border-radius:50%;border:1px solid var(--accent-soft);background:none;cursor:pointer}
  .pip.on{background:var(--accent-soft)}
  .rnote{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--sans);font-size:.78rem;color:var(--muted);padding:5px 9px;width:100%}
  .rnote::placeholder{color:var(--faint)}
  .rnote:focus{border-color:var(--accent);color:var(--ink)}
  .racts{display:inline-flex;align-items:center;gap:4px;flex:none}
  .rdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .rdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{width:100%;margin-top:2px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){.ref{grid-template-columns:1fr auto}.rkind{grid-column:1}.rmain{grid-column:1 / -1;order:3}}
</style>
