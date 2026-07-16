<script>
  import { markDirty, confirmDelete, openEntry } from '../../lib/store.svelte.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);

  // a twist's life: brainstormed → considered → foreshadowed → in the story (or cut)
  const STATUS = [
    { v: 'idea', l: 'Idea', c: '#9aa1a8' },
    { v: 'maybe', l: 'Maybe', c: '#c9a24a' },
    { v: 'planted', l: 'Planted', c: '#5f8fb0' },
    { v: 'used', l: 'Used', c: '#5aa06f' },
    { v: 'cut', l: 'Cut', c: '#b0596a' },
  ];
  const stOf = (v) => STATUS.find(s => s.v === v) || STATUS[0];

  function add(){ list.push({ hook: '', status: 'idea', setup: '', payoff: '', targetId: '' }); markDirty(); }
  async function del(i){
    const r = list[i]; const has = (r.hook || r.setup || r.payoff || '').trim();
    if (!(await confirmDelete(has, r.hook ? '“' + r.hook + '”' : 'this twist'))) return;
    list.splice(i, 1); markDirty();
  }
</script>

<div class="twists">
  {#each list as r, i (i)}
    {@const st = stOf(r.status)}
    <div class="twist" class:cut={r.status === 'cut'} style="--st:{st.c}">
      <div class="thead">
        <span class="tnum">{i + 1}</span>
        <input class="thook" bind:value={r.hook} oninput={markDirty} placeholder="The twist — e.g. the mentor is the traitor" />
        <select class="tstatus" bind:value={r.status} onchange={markDirty} style="color:{st.c};border-color:{st.c}" title="where this idea stands">
          {#each STATUS as s}<option value={s.v}>{s.l}</option>{/each}
        </select>
        {#if r.targetId}<button class="tmini" onclick={() => openEntry(r.targetId)} title="open linked entry">↗</button>{/if}
        <Reorder {list} {i} />
        <button class="tdel" onclick={() => del(i)} title="remove" aria-label="remove twist">✕</button>
      </div>
      <div class="tfaces">
        <label class="tface"><span class="tfl">Setup / plant</span><input bind:value={r.setup} oninput={markDirty} placeholder="what to foreshadow so it lands" /></label>
        <label class="tface"><span class="tfl">Payoff / why it lands</span><input bind:value={r.payoff} oninput={markDirty} placeholder="the impact — what it recontextualizes" /></label>
      </div>
      {#if others && others.length}
        <div class="tfoot">
          <label class="tl">Hinges on
            <select bind:value={r.targetId} onchange={markDirty}>
              <option value="">— an entry (optional) —</option>
              {#each others as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
            </select>
          </label>
        </div>
      {/if}
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add twist</button>
</div>

<style>
  .twists{display:flex;flex-direction:column;gap:10px}
  .twist{border:1px solid var(--rule);border-left:3px solid var(--st,var(--rule));border-radius:10px;background:var(--panel);padding:10px 13px;display:flex;flex-direction:column;gap:9px}
  .twist.cut{opacity:.62}
  .thead{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto auto;gap:8px;align-items:center}
  .tnum{font-family:var(--mono);font-size:.62rem;color:var(--st,var(--faint));border:1px solid var(--st,var(--rule));border-radius:5px;padding:2px 6px;line-height:1;flex:none}
  .thook{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.12rem*var(--hs,1));color:var(--ink);min-width:0;width:100%}
  .thook::placeholder{color:var(--faint)}
  .tstatus{font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;background:var(--panel-2);border:1px solid var(--rule);border-radius:20px;padding:4px 8px;cursor:pointer;outline:none}
  .tmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .tmini:hover{border-color:var(--accent);color:var(--ink)}
  .tdel{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .tdel:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .tfaces{display:grid;grid-template-columns:1fr 1fr;gap:9px}
  .tface{display:flex;flex-direction:column;gap:3px;min-width:0}
  .tfl{font-family:var(--mono);font-size:.52rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .tface input{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font-family:var(--body);font-size:.9rem;padding:6px 9px;min-width:0;width:100%}
  .tface input:focus{border-color:var(--accent)}
  .tface input::placeholder{color:var(--faint)}
  .tfoot{display:flex;gap:12px;flex-wrap:wrap}
  .tl{display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:.54rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
  .tl select{font-family:var(--sans);font-size:.72rem;text-transform:none;letter-spacing:0;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:5px 8px;outline:none}
  .addbtn{width:100%;margin-top:2px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){ .tfaces{grid-template-columns:1fr} }
</style>
