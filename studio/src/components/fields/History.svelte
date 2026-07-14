<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(entry.data[sec.key]);

  function add(){ list.push({ date: '', title: '', body: '', key: false }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.date && r.date.trim()) || (r.title && r.title.trim()) || (r.body && r.body.trim());
    if (!(await confirmDelete(has, r.title ? '“' + r.title + '”' : 'this event'))) return;
    list.splice(i, 1); markDirty();
  }
  function setBody(i, v){ list[i].body = v; markDirty(); }
  function toggleKey(i){ list[i].key = !list[i].key; markDirty(); }
</script>

<div class="hist">
  {#each list as r, i (i)}
    <div class="hev" class:key={r.key}>
      <div class="htop">
        <input class="hdate" bind:value={r.date} oninput={markDirty} placeholder="era / date" />
        <input class="htitle" bind:value={r.title} oninput={markDirty} placeholder="what happened" />
        <button class="hk" class:on={r.key} onclick={() => toggleKey(i)} title="mark as a key beat" aria-label="key beat">★</button>
        <Reorder {list} {i} />
        <button class="hdel" onclick={() => del(i)} title="remove" aria-label="remove event">✕</button>
      </div>
      <RichEditor value={r.body} multiline placeholder="Describe the event…" oninput={(v) => setBody(i, v)} />
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add event</button>
  <p class="hhint">Add earliest first — builds a top-to-bottom history.</p>
</div>

<style>
  .hist{position:relative;display:flex;flex-direction:column;gap:12px;padding-left:22px}
  .hist::before{content:"";position:absolute;left:4px;top:8px;bottom:40px;width:1px;background:var(--rule)}
  .hev{position:relative;border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:10px 13px;display:flex;flex-direction:column;gap:7px}
  .hev::before{content:"";position:absolute;left:-22px;top:16px;width:10px;height:10px;border-radius:50%;background:var(--panel);border:2px solid var(--rule)}
  .hev.key::before{background:var(--accent);border-color:var(--accent)}
  .hev.key{border-color:color-mix(in srgb,var(--accent) 30%,var(--rule))}
  .htop{display:grid;grid-template-columns:minmax(6em,auto) minmax(0,1fr) auto auto auto;gap:8px;align-items:center}
  .hdate{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.06em;text-transform:uppercase;color:var(--accent-soft);padding:4px 8px;field-sizing:content;min-width:6em;max-width:16em}
  .htitle{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.1rem*var(--hs,1));color:var(--ink);min-width:0}
  .hdate::placeholder,.htitle::placeholder{color:var(--faint)}
  .hk{border:1px solid var(--rule);background:var(--panel-2);color:var(--faint);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .hk.on{color:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 40%,var(--rule))}
  .hdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .hdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{align-self:flex-start;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:var(--sans);font-size:.8rem;margin-left:-22px}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  .hhint{margin:0 0 0 -22px;font-family:var(--sans);font-size:.72rem;color:var(--faint)}
</style>
