<script>
  import { markDirty, openEntry, confirmDelete } from '../../lib/store.svelte.js';
  import { uid } from '../../lib/model.js';
  let { entry, sec, others } = $props();
  const canOpen = (t) => !!t.targetId;
  const openTie = (t) => { if (t.targetId) openEntry(t.targetId); };

  $effect(() => { if (!Array.isArray(entry.data[sec.key])) entry.data[sec.key] = []; });
  const ties = $derived(entry.data[sec.key] || []);
  const KINDS = [{ v: 'liege', l: 'Sworn to (liege)' }, { v: 'vassal', l: 'Bannerman (vassal)' }, { v: 'ally', l: 'Ally' }, { v: 'rival', l: 'Rival' }];

  const lieges = $derived(ties.filter(t => t.kind === 'liege'));
  const vassals = $derived(ties.filter(t => t.kind === 'vassal'));
  const allies = $derived(ties.filter(t => t.kind === 'ally'));
  const rivals = $derived(ties.filter(t => t.kind === 'rival'));
  const hasWeb = $derived(lieges.length || vassals.length || allies.length || rivals.length);

  function add(){ ties.push({ id: uid(), name: '', targetId: '', kind: 'vassal', note: '' }); markDirty(); }
  function del(i){ const t = ties[i]; if (!confirmDelete(t.name || t.targetId, t.name ? '“' + t.name + '”' : 'this tie')) return; ties.splice(i, 1); markDirty(); }
  function onLink(t){ const o = others.find(x => x.id === t.targetId); if (o && !t.name) t.name = o.title; markDirty(); }
</script>

<div class="aw">
  {#if hasWeb}
    <div class="web">
      {#if lieges.length}
        <div class="tier top">{#each lieges as t}<span class="box liege" class:clickable={canOpen(t)} onclick={() => openTie(t)} role={canOpen(t) ? 'button' : undefined}>{t.name || 'Liege'}</span>{/each}</div>
        <div class="down"></div>
      {/if}
      <span class="box self">{entry.title || 'This house'}</span>
      {#if vassals.length}
        <div class="down"></div>
        <div class="tier">{#each vassals as t}<span class="box" class:clickable={canOpen(t)} onclick={() => openTie(t)} role={canOpen(t) ? 'button' : undefined}>{t.name || 'Bannerman'}</span>{/each}</div>
      {/if}
      {#if allies.length || rivals.length}
        <div class="sides">
          {#if allies.length}<div class="side"><span class="slbl">Allies</span>{#each allies as t}<span class="chip ally">{t.name || 'Ally'}</span>{/each}</div>{/if}
          {#if rivals.length}<div class="side"><span class="slbl">Rivals</span>{#each rivals as t}<span class="chip rival">{t.name || 'Rival'}</span>{/each}</div>{/if}
        </div>
      {/if}
    </div>
  {/if}

  <div class="list">
    {#each ties as t, i (t.id)}
      <div class="row">
        <select class="kind" bind:value={t.kind} onchange={markDirty}>
          {#each KINDS as k}<option value={k.v}>{k.l}</option>{/each}
        </select>
        <input class="nm" bind:value={t.name} oninput={markDirty} placeholder="Name" />
        <select class="lk" bind:value={t.targetId} onchange={() => onLink(t)} title="link">
          <option value="">— link —</option>
          {#each others as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
        </select>
        <button class="delx" onclick={() => del(i)} title="remove">✕</button>
      </div>
    {/each}
    <button class="addbtn" onclick={add}>＋ Add tie</button>
  </div>
</div>

<style>
  .aw{display:flex;flex-direction:column;gap:14px}
  /* diagram */
  .web{display:flex;flex-direction:column;align-items:center;padding:14px 8px;border:1px solid var(--rule);border-radius:10px;background:var(--panel)}
  .tier{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .box{border:1px solid var(--rule);border-radius:6px;padding:5px 12px;font-family:var(--head);font-size:calc(.85rem*var(--hs,1));color:var(--muted);background:var(--panel-2);white-space:nowrap}
  .box.self{border-color:var(--accent);color:var(--ink)}
  .box.liege{border-color:var(--accent-soft);color:var(--ink)}
  .box.clickable{cursor:pointer}.box.clickable:hover{border-color:var(--accent);color:var(--ink)}
  .down{width:1px;height:16px;background:var(--rule)}
  .sides{display:flex;gap:26px;justify-content:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--line);flex-wrap:wrap}
  .side{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .slbl{font-family:var(--mono);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .chip{border:1px solid var(--rule);border-radius:14px;padding:3px 10px;font-family:var(--body);font-size:.72rem;color:var(--muted)}
  .chip.rival{border-color:color-mix(in srgb,var(--accent) 45%,var(--rule));color:var(--accent-soft)}
  /* editor list */
  .list{display:flex;flex-direction:column;gap:7px}
  .row{display:grid;grid-template-columns:auto 1fr auto auto;gap:8px;align-items:center}
  .kind{font-family:var(--sans);font-size:.68rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:6px;padding:5px 7px}
  .nm{background:var(--panel);border:1px solid var(--rule);outline:none;border-radius:6px;padding:6px 9px;font-family:var(--head);font-size:.95rem;color:var(--ink);min-width:0}
  .lk{font-family:var(--sans);font-size:.68rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:5px 7px;max-width:150px}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .addbtn{align-self:flex-start;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
