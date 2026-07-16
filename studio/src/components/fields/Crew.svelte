<script>
  import { markDirty, confirmDelete, openEntry } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);
  const chars = $derived((others || []).filter(o => o.type === 'character'));
  const rest = $derived((others || []).filter(o => o.type !== 'character'));
  const linkedOf = (id) => (others || []).find(o => o.id === id);
  const nameOf = (id) => { const o = linkedOf(id); return o ? (o.title || 'Untitled') : ''; };
  const coverOf = (id) => linkedOf(id)?.cover || '';

  const STATUS = [{ v: '', l: '—' }, { v: 'in', l: 'in' }, { v: 'wildcard', l: 'wildcard' }, { v: 'burned', l: 'burned' }, { v: 'lost', l: 'lost' }];
  function add(){ list.push({ targetId: '', name: '', role: '', cover: '', job: '', angle: '', status: 'in', readin: false }); markDirty(); }
  async function del(i){ const r = list[i]; if (!(await confirmDelete(nameOf(r.targetId) || r.name, 'this operative'))) return; list.splice(i, 1); markDirty(); }
</script>

<div class="crew">
  {#each list as r, i (i)}
    <div class="op" class:wild={r.status === 'wildcard'}>
      <button class="portrait" style={coverOf(r.targetId) ? `background-image:url(${coverOf(r.targetId)})` : ''} onclick={() => r.targetId && openEntry(r.targetId)} title={r.targetId ? 'open character' : ''}>
        {#if !coverOf(r.targetId)}<span class="ini">{(nameOf(r.targetId) || r.name || '?').slice(0, 1).toUpperCase()}</span>{/if}
      </button>
      <div class="opmain">
        <div class="optop">
          <select class="pick" bind:value={r.targetId} onchange={markDirty}>
            <option value="">— pick a character —</option>
            {#if chars.length}<optgroup label="Characters">{#each chars as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}</optgroup>{/if}
            {#if rest.length}<optgroup label="Other">{#each rest as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>{/if}
          </select>
          {#if !r.targetId}<input class="freenm" bind:value={r.name} oninput={markDirty} placeholder="…or a name" />{/if}
          <input class="role" bind:value={r.role} oninput={markDirty} placeholder="role" />
          <span class="grow"></span>
          <Reorder {list} {i} />
          <button class="del" onclick={() => del(i)} title="remove" aria-label="remove operative">✕</button>
        </div>
        <div class="rows">
          <label class="r cover"><span class="k">cover</span><input bind:value={r.cover} oninput={markDirty} placeholder="their false identity" /></label>
          <label class="r"><span class="k">job</span><input bind:value={r.job} oninput={markDirty} placeholder="their part in the op" /></label>
          <label class="r angle"><span class="k">the angle</span><input bind:value={r.angle} oninput={markDirty} placeholder="what makes them right for it" /></label>
        </div>
        <div class="opfoot">
          <label class="stat">status
            <select bind:value={r.status} onchange={markDirty}>{#each STATUS as s}<option value={s.v}>{s.l}</option>{/each}</select>
          </label>
          <button class="readin" class:on={r.readin} onclick={() => { r.readin = !r.readin; markDirty(); }} title="is this operative in on the real plan? (writer-only)">{r.readin ? '✓ in on the real plan' : 'read in?'}</button>
        </div>
      </div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add operative</button>
</div>

<style>
  .crew{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .op{display:grid;grid-template-columns:74px 1fr;gap:13px;border:1px solid var(--rule);border-radius:13px;background:var(--panel-2);padding:12px}
  .op.wild{border-color:color-mix(in srgb,#b0413a 35%,var(--rule))}
  .portrait{width:74px;height:92px;border-radius:9px;border:1px solid var(--rule);background:var(--panel-3,#20272e) center/cover;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
  .portrait:hover{border-color:var(--accent)}
  .portrait .ini{font-family:var(--head);font-size:1.6rem;color:var(--faint)}
  .opmain{min-width:0;display:flex;flex-direction:column;gap:8px}
  .optop{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .pick{font-family:var(--head);font-size:1.05rem;background:none;border:none;color:var(--ink);outline:none;cursor:pointer;min-width:0;max-width:100%}
  .pick option{background:var(--panel);color:var(--ink)}
  .freenm{background:var(--panel);border:1px solid var(--rule);border-radius:6px;color:var(--ink);font:inherit;font-size:.9rem;padding:4px 7px;outline:none;min-width:0;width:8em}
  .role{background:var(--panel);border:1px solid var(--rule);border-radius:20px;outline:none;font-family:var(--mono);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:#6f8296;padding:3px 9px;field-sizing:content;min-width:4em;max-width:10em}
  .role::placeholder{color:var(--faint)}
  .grow{flex:1}
  .rows{display:flex;flex-direction:column;gap:5px}
  .r{display:flex;align-items:center;gap:8px}
  .r .k{font-family:var(--mono);font-size:.46rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);width:56px;flex:0 0 56px;text-align:right}
  .r input{flex:1;min-width:0;background:var(--panel);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font:inherit;font-size:.88rem;padding:5px 8px}
  .r input:focus{border-color:var(--accent)}
  .r.cover input{color:#7fae90}
  .r input::placeholder{color:var(--faint)}
  .opfoot{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .stat{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
  .stat select{font-family:var(--mono);font-size:.6rem;background:var(--panel);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:3px 6px;text-transform:none;letter-spacing:0}
  .readin{border:1px solid var(--rule);background:var(--panel);color:var(--faint);border-radius:20px;cursor:pointer;padding:3px 10px;font-family:var(--mono);font-size:.5rem;letter-spacing:.05em;text-transform:uppercase}
  .readin.on{color:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 40%,var(--rule))}
  .del{border:1px solid var(--rule);background:var(--panel);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{grid-column:1 / -1;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:600px){.crew{grid-template-columns:1fr}}
</style>
