<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);
  const chars = $derived((others || []).filter(o => o.type === 'character'));
  const rest = $derived((others || []).filter(o => o.type !== 'character'));
  const nameOf = (id) => { const o = (others || []).find(x => x.id === id); return o ? (o.title || 'Untitled') : ''; };

  const ALIBI = [{ v: '', l: '—' }, { v: 'ok', l: 'confirmed' }, { v: 'unc', l: 'unconfirmed' }, { v: 'broken', l: 'broken' }];
  function add(){ list.push({ targetId: '', name: '', motive: '', means: '', opportunity: '', alibi: '', alibiStatus: '', suspicion: 0, guilty: false }); markDirty(); }
  async function del(i){ const r = list[i]; if (!(await confirmDelete(nameOf(r.targetId) || r.name, 'this suspect'))) return; list.splice(i, 1); markDirty(); }
  function setSusp(r, n){ r.suspicion = (r.suspicion === n ? n - 1 : n); markDirty(); }
</script>

<div class="susp">
  {#each list as r, i (i)}
    <div class="scard" class:guilty={r.guilty}>
      <div class="shead">
        <select class="pick" bind:value={r.targetId} onchange={markDirty}>
          <option value="">— pick a suspect —</option>
          {#if chars.length}<optgroup label="Characters">{#each chars as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}</optgroup>{/if}
          {#if rest.length}<optgroup label="Other">{#each rest as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>{/if}
        </select>
        {#if !r.targetId}<input class="freenm" bind:value={r.name} oninput={markDirty} placeholder="…or type a name" />{/if}
        <button class="gtog" class:on={r.guilty} onclick={() => { r.guilty = !r.guilty; markDirty(); }} title="mark as the culprit (writer-only, sealed in export)">{r.guilty ? 'guilty' : 'mark guilty'}</button>
        <Reorder {list} {i} />
        <button class="del" onclick={() => del(i)} title="remove" aria-label="remove suspect">✕</button>
      </div>
      <div class="mmo">
        <label>Motive<input bind:value={r.motive} oninput={markDirty} placeholder="why they'd do it" /></label>
        <label>Means<input bind:value={r.means} oninput={markDirty} placeholder="how they could" /></label>
        <label>Opportunity<input bind:value={r.opportunity} oninput={markDirty} placeholder="when / access" /></label>
      </div>
      <div class="arow">
        <label class="ali">Alibi<input bind:value={r.alibi} oninput={markDirty} placeholder="what they claim" /></label>
        <select class="astat {r.alibiStatus}" bind:value={r.alibiStatus} onchange={markDirty} title="alibi status">
          {#each ALIBI as a}<option value={a.v}>{a.l}</option>{/each}
        </select>
        <span class="susp-set" title="suspicion">
          <span class="sl">Suspicion</span>
          {#each [1, 2, 3, 4] as n}
            <button class="pip" class:on={(r.suspicion || 0) >= n} onclick={() => setSusp(r, n)} aria-label={'suspicion ' + n}></button>
          {/each}
        </span>
      </div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add suspect</button>
</div>

<style>
  .susp{display:flex;flex-direction:column;gap:10px}
  .scard{border:1px solid var(--rule);border-radius:11px;background:var(--panel);padding:11px 13px;display:flex;flex-direction:column;gap:9px}
  .scard.guilty{border-color:color-mix(in srgb,#b0413a 45%,var(--rule));background:color-mix(in srgb,#b0413a 6%,var(--panel))}
  .shead{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .pick{font-family:var(--head);font-size:1.08rem;background:none;border:none;color:var(--ink);outline:none;cursor:pointer;flex:1;min-width:0}
  .pick option{background:var(--panel);color:var(--ink)}
  .freenm{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font:inherit;font-size:.9rem;padding:5px 8px}
  .gtog{border:1px solid var(--rule);background:var(--panel-2);color:var(--faint);border-radius:20px;cursor:pointer;padding:3px 11px;font-family:var(--mono);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase}
  .gtog.on{background:#b0413a;color:#fff;border-color:#b0413a}
  .del{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .mmo{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .mmo label,.arow label{display:flex;flex-direction:column;gap:3px;font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
  .mmo input,.arow input{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font:inherit;font-size:.9rem;padding:6px 8px}
  .mmo input:focus,.arow input:focus{border-color:var(--accent)}
  .arow{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
  .ali{flex:1;min-width:160px}
  .astat{align-self:flex-end;font-family:var(--mono);font-size:.62rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:6px 8px}
  .astat.ok{color:#5aa06f;border-color:color-mix(in srgb,#5aa06f 45%,var(--rule))}
  .astat.unc{color:#c9a24a;border-color:color-mix(in srgb,#c9a24a 45%,var(--rule))}
  .astat.broken{color:#b0413a;border-color:color-mix(in srgb,#b0413a 45%,var(--rule))}
  .susp-set{display:inline-flex;align-items:center;gap:5px;align-self:flex-end;padding-bottom:6px}
  .susp-set .sl{font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint)}
  .pip{width:12px;height:12px;border-radius:50%;border:1px solid var(--rule);background:var(--panel-2);cursor:pointer;padding:0}
  .pip.on{background:var(--accent);border-color:var(--accent)}
  .addbtn{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:560px){.mmo{grid-template-columns:1fr}}
</style>
