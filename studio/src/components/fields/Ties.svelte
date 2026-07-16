<script>
  import { markDirty, confirmDelete, openEntry } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(entry.data[sec.key]);

  // default relationship kinds; a section can override with sec.kinds = [{v,l,c}]
  const DEFAULT_KINDS = [
    { v: 'ally', c: '#5aa06f' }, { v: 'enemy', c: '#c05348' }, { v: 'rival', c: '#b9853a' }, { v: 'wary', c: '#b9853a' },
    { v: 'kin', c: '#5f8fb0' }, { v: 'patron', c: '#5f8fb0' }, { v: 'subject', c: '#9aa1a8' }, { v: 'other', c: '#9aa1a8' },
  ];
  const KINDDEFS = $derived(Array.isArray(sec.kinds) && sec.kinds.length ? sec.kinds : DEFAULT_KINDS);
  const KINDS = $derived(KINDDEFS.map(k => k.v));
  const COLOR = $derived(Object.fromEntries(KINDDEFS.map(k => [k.v, k.c])));
  const namePh = $derived(sec.namePh || 'Group / people');
  const notePh = $derived(sec.notePh || 'how they stand — a note');
  const linkTypes = sec.linkTypes || null;
  const primary = $derived(linkTypes ? (others || []).filter(o => linkTypes.includes(o.type)) : (others || []));
  const secondary = $derived(linkTypes ? (others || []).filter(o => !linkTypes.includes(o.type)) : []);

  function add(){ list.push({ name: '', targetId: '', kind: KINDS[0], note: '' }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.name && r.name.trim()) || (r.note && r.note.trim()) || r.targetId;
    if (!(await confirmDelete(has, r.name ? '“' + r.name + '”' : 'this tie'))) return;
    list.splice(i, 1); markDirty();
  }
  function link(i, tid){ const c = (others || []).find(o => o.id === tid); list[i].targetId = tid; if (c && !list[i].name) list[i].name = c.title; markDirty(); }
</script>

<div class="ties">
  {#each list as r, i (i)}
    <div class="tie" style={`--tc:${COLOR[r.kind] || COLOR.other}`}>
      <div class="ttop">
        <input class="tnm" bind:value={r.name} oninput={markDirty} placeholder={namePh} />
        <select class="tkind" bind:value={r.kind} onchange={markDirty} title="relationship">{#each KINDS as k}<option value={k}>{k}</option>{/each}</select>
        {#if r.targetId}<button class="tmini" onclick={() => openEntry(r.targetId)} title="open">↗</button>{/if}
        <Reorder {list} {i} />
        <button class="tmini del" onclick={() => del(i)} title="remove" aria-label="remove tie">✕</button>
      </div>
      <input class="tnote" bind:value={r.note} oninput={markDirty} placeholder={notePh} />
      <select class="tlink" value={r.targetId || ''} onchange={(e) => link(i, e.target.value)} title="link the group's entry (optional)">
        <option value="">— link a group (optional) —</option>
        {#if linkTypes}
          <optgroup label="Groups">{#each primary as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>
          {#if secondary.length}<optgroup label="Other entries">{#each secondary as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>{/if}
        {:else}
          {#each primary as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
        {/if}
      </select>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add tie</button>
</div>

<style>
  .ties{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:11px}
  .tie{border:1px solid var(--rule);border-left:3px solid var(--tc);border-radius:10px;background:var(--panel);padding:9px 12px;display:flex;flex-direction:column;gap:6px}
  .ttop{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:6px;align-items:center}
  .tnm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.05rem*var(--hs,1));color:var(--ink);min-width:0}
  .tnm::placeholder{color:var(--faint)}
  .tkind{font-family:var(--mono);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:var(--tc);background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;padding:3px 5px;cursor:pointer}
  .tmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:3px 7px;font-size:.68rem;line-height:1}
  .tmini:hover{border-color:var(--accent);color:var(--ink)}
  .tmini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .tnote{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--sans);font-size:.8rem;color:var(--muted);padding:5px 8px}
  .tnote::placeholder{color:var(--faint)}
  .tnote:focus{border-color:var(--accent);color:var(--ink)}
  .tlink{font-family:var(--sans);font-size:.68rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:4px 6px}
  .addbtn{grid-column:1/-1;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
