<script>
  import { markDirty, confirmDelete, openEntry } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);
  const chars = $derived((others || []).filter(o => o.type === 'character'));
  const clueEntries = $derived((others || []).filter(o => o.type === 'clue'));
  const nameOf = (id) => { const o = (others || []).find(x => x.id === id); return o ? (o.title || 'Untitled') : ''; };

  function add(){ list.push({ name: '', kind: 'genuine', reads: '', means: '', implicates: '', planted: '', targetId: '' }); markDirty(); }
  async function del(i){ const r = list[i]; if (!(await confirmDelete(r.name && r.name.trim(), r.name ? '“' + r.name + '”' : 'this clue'))) return; list.splice(i, 1); markDirty(); }
</script>

<div class="clues">
  {#each list as r, i (i)}
    <div class="ccard" class:herring={r.kind === 'herring'}>
      <div class="chead">
        <input class="cnm" bind:value={r.name} oninput={markDirty} placeholder="the clue / evidence" />
        <span class="kseg">
          <button class:on={r.kind !== 'herring'} onclick={() => { r.kind = 'genuine'; markDirty(); }} title="genuine">genuine</button>
          <button class:on={r.kind === 'herring'} onclick={() => { r.kind = 'herring'; markDirty(); }} title="red herring">✕ herring</button>
        </span>
        {#if r.targetId}<button class="mini" onclick={() => openEntry(r.targetId)} title="open linked Clue entry">↗</button>{/if}
        <Reorder {list} {i} />
        <button class="del" onclick={() => del(i)} title="remove" aria-label="remove clue">✕</button>
      </div>
      <div class="faces">
        <label class="face reads">Reads as<input bind:value={r.reads} oninput={markDirty} placeholder="what it seems to say" /></label>
        <label class="face means">Actually means<input bind:value={r.means} oninput={markDirty} placeholder="what it really tells you" /></label>
      </div>
      <div class="cfoot">
        <label class="fl">Implicates
          <select bind:value={r.implicates} onchange={markDirty}>
            <option value="">—</option>
            {#each chars as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}
          </select>
        </label>
        <label class="fl">Planted<input bind:value={r.planted} oninput={markDirty} placeholder="where the reader sees it" /></label>
        {#if clueEntries.length}
          <label class="fl">Deep entry
            <select bind:value={r.targetId} onchange={markDirty}>
              <option value="">— none —</option>
              {#each clueEntries as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}
            </select>
          </label>
        {/if}
      </div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add clue</button>
</div>

<style>
  .clues{display:flex;flex-direction:column;gap:10px}
  .ccard{border:1px solid var(--rule);border-left:3px solid #5f9fb0;border-radius:11px;background:var(--panel);padding:11px 13px;display:flex;flex-direction:column;gap:9px}
  .ccard.herring{border-left-color:#8a86c9}
  .chead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .cnm{flex:1;min-width:0;background:none;border:none;outline:none;font-family:var(--head);font-size:1.1rem;color:var(--ink)}
  .cnm::placeholder{color:var(--faint)}
  .kseg{display:inline-flex;border:1px solid var(--rule);border-radius:7px;overflow:hidden}
  .kseg button{border:none;background:var(--panel-2);color:var(--faint);cursor:pointer;padding:4px 10px;font-family:var(--mono);font-size:.52rem;letter-spacing:.05em;text-transform:uppercase;border-right:1px solid var(--rule)}
  .kseg button:last-child{border-right:none}
  .kseg button:first-child.on{background:#5f9fb0;color:#fff}
  .kseg button:last-child.on{background:#8a86c9;color:#fff}
  .mini,.del{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .mini:hover{border-color:var(--accent);color:var(--ink)}
  .del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .faces{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .face{display:flex;flex-direction:column;gap:3px;font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase}
  .face.reads{color:#8a86c9} .face.means{color:#5f9fb0}
  .face input{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font-family:var(--body);font-size:.9rem;letter-spacing:0;text-transform:none;padding:6px 8px}
  .face input:focus{border-color:var(--accent)}
  .cfoot{display:flex;gap:10px;flex-wrap:wrap}
  .fl{display:flex;flex-direction:column;gap:3px;font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);flex:1;min-width:130px}
  .fl input,.fl select{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font-family:var(--body);font-size:.9rem;letter-spacing:0;text-transform:none;padding:6px 8px}
  .fl input:focus,.fl select:focus{border-color:var(--accent)}
  .addbtn{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:560px){.faces{grid-template-columns:1fr}}
</style>
