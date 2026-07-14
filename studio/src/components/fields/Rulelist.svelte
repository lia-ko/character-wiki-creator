<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec } = $props();
  const list = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);
  const variant = $derived(sec.variant || 'laws');

  function add(){ list.push({ text: '', kind: variant === 'cancant' ? 'can' : '' }); markDirty(); }
  async function del(i){ const r = list[i]; if (!(await confirmDelete(r.text && r.text.trim(), r.text ? '“' + r.text + '”' : 'this rule'))) return; list.splice(i, 1); markDirty(); }
  function setKind(i, k){ list[i].kind = k; markDirty(); }
</script>

{#if variant === 'cancant'}
  <div class="rl cancant">
    {#each list as r, i (i)}
      <div class="rrow">
        <span class="seg">
          <button class:on={r.kind !== 'cant'} data-k="can" onclick={() => setKind(i, 'can')} title="it can" aria-label="it can">✓</button>
          <button class:on={r.kind === 'cant'} data-k="cant" onclick={() => setKind(i, 'cant')} title="it can’t" aria-label="it can’t">✕</button>
        </span>
        <input class={r.kind === 'cant' ? 'cant' : 'can'} bind:value={r.text} oninput={markDirty} placeholder={r.kind === 'cant' ? 'it can’t…' : 'it can…'} />
        <Reorder {list} {i} />
        <button class="del" onclick={() => del(i)} title="remove" aria-label="remove">✕</button>
      </div>
    {/each}
    <button class="addbtn" onclick={add}>＋ rule</button>
  </div>
{:else}
  <div class="rl laws">
    {#each list as r, i (i)}
      <div class="lrow">
        <span class="num">{i + 1}</span>
        <input bind:value={r.text} oninput={markDirty} placeholder="a hard rule of the system" />
        <Reorder {list} {i} />
        <button class="del" onclick={() => del(i)} title="remove" aria-label="remove">✕</button>
      </div>
    {/each}
    <button class="addbtn" onclick={add}>＋ law</button>
  </div>
{/if}

<style>
  .rl{display:flex;flex-direction:column;gap:7px}
  /* laws — numbered */
  .lrow{display:grid;grid-template-columns:auto 1fr auto auto;gap:9px;align-items:center}
  .num{width:22px;height:22px;border-radius:50%;border:1px solid color-mix(in srgb,var(--accent) 45%,var(--rule));color:var(--accent-soft);font-family:var(--mono);font-size:.7rem;display:flex;align-items:center;justify-content:center;flex:0 0 auto}
  .laws input{background:var(--panel);border:1px solid var(--rule);border-radius:8px;outline:none;color:var(--ink);font:inherit;font-size:.96rem;padding:7px 10px;min-width:0}
  .laws input:focus{border-color:var(--accent)}
  /* can / can’t */
  .rrow{display:grid;grid-template-columns:auto 1fr auto auto;gap:9px;align-items:center}
  .seg{display:inline-flex;border:1px solid var(--rule);border-radius:7px;overflow:hidden}
  .seg button{border:none;background:var(--panel-2);color:var(--faint);cursor:pointer;padding:5px 9px;font-size:.8rem;line-height:1;border-right:1px solid var(--rule)}
  .seg button:last-child{border-right:none}
  .seg button[data-k="can"].on{background:#5aa06f;color:#fff}
  .seg button[data-k="cant"].on{background:#b0596a;color:#fff}
  .cancant input{background:var(--panel);border:1px solid var(--rule);border-radius:8px;outline:none;color:var(--ink);font:inherit;font-size:.95rem;padding:7px 10px;min-width:0}
  .cancant input:focus{border-color:var(--accent)}
  .cancant input.can{border-left:3px solid #5aa06f} .cancant input.cant{border-left:3px solid #b0596a}
  input::placeholder{color:var(--faint)}
  .del{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1;flex:0 0 auto}
  .del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{align-self:flex-start;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:7px 13px;cursor:pointer;font-family:var(--sans);font-size:.78rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
