<script>
  import { markDirty, openEntry, confirmDelete } from '../../lib/store.svelte.js';
  import { pickImages } from '../../lib/images.js';
  import { resolveImg } from '../../lib/imagepool.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(entry.data[sec.key]);
  const scaleLabel = $derived(sec.scale || 'Scale');
  const RAMP = ['var(--faint)', 'var(--faint)', '#3f9d6d', '#8a5a2b', '#9a3324'];
  const RAMP_COLOR = { gold: 'var(--gold)', accent: 'var(--accent-soft)' };
  // a section can pin one ramp colour for its whole scale (see badgeHTML in render.js) — mirror it
  const pipColor = (lv) => RAMP_COLOR[sec.ramp] || RAMP[Math.max(0, Math.min(4, lv || 0))];
  // per-item extras are opt-in so a plain catalog card stays plain; `cost` only where the
  // section defines what breaking an item means (customs & rites), not on every catalog
  const whyLabel = $derived(sec.whyLabel || 'Why');
  const costLabel = $derived(sec.costLabel || '');

  const linkedOf = (r) => others.find(o => o.id === r.targetId);
  const imgOf = (r) => resolveImg(r.img) || linkedOf(r)?.cover || '';   // pull the linked entry's cover if none set
  const groups = $derived([...new Set(list.map(r => (r.group || '').trim()).filter(Boolean))]);

  let open = $state({ 0: true });
  function toggle(i){ open[i] = !open[i]; }
  function add(){ list.push({ name: 'New entry', kind: '', group: '', level: 0, badge: '', targetId: '', img: '', body: '', why: '', whyLabel: '', meta: [], cost: '' }); open[list.length - 1] = true; markDirty(); }
  async function del(i){ const r = list[i]; const named = r.name && r.name !== 'New entry'; const has = named || r.body || r.kind || r.badge || r.img || (r.why || '').trim() || (r.cost || '').trim() || (r.meta || []).some(m => m.k || m.v); if (!(await confirmDelete(has, named ? '“' + r.name + '”' : 'this item'))) return; list.splice(i, 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
  async function setImg(i){ const u = await pickImages(false); if (u && u[0]){ list[i].img = u[0]; markDirty(); } }
  function setLevel(i, lv){ list[i].level = (list[i].level === lv) ? lv - 1 : lv; markDirty(); }   // click current top pip to clear
  function setWhy(i, v){ list[i].why = v; markDirty(); }
  function setCost(i, v){ list[i].cost = v; markDirty(); }
  function addWhy(i){ list[i].why = ' '; list[i].whyLabel = list[i].whyLabel || whyLabel; markDirty(); }
  function dropWhy(i){ list[i].why = ''; list[i].whyLabel = ''; markDirty(); }
  function addMeta(i){ (list[i].meta ||= []).push({ k: '', v: '' }); markDirty(); }
  function dropMeta(i, j){ list[i].meta.splice(j, 1); markDirty(); }
</script>

<div class="cat">
  {#each list as r, i (i)}
    <div class="ccard" class:open={open[i]}>
      <!-- image is a top band when there is one (as the reader draws it), never an empty well -->
      {#if imgOf(r)}
        <button class="cimg" style={`background-image:url(${imgOf(r)})`} onclick={() => setImg(i)} title="change image" aria-label="change image"></button>
      {/if}
      <div class="chead">
        <div class="cwho">
          <input class="cnm" bind:value={r.name} oninput={markDirty} placeholder="Name" />
          <div class="cmeta">
            <input class="cgroup" list="catgrp-{sec.key}" bind:value={r.group} oninput={markDirty} placeholder="group" />
            <input class="ckind" bind:value={r.kind} oninput={markDirty} placeholder="kind" />
          </div>
        </div>
        <span class="cbadge" class:stacked={!!sec.ramp} style={`--bc:${pipColor(r.level)}`}>
          {#snippet pipRow()}
            <span class="pips" title={scaleLabel}>
              {#each [1, 2, 3, 4] as lv}
                <button class="pip" class:on={(r.level || 0) >= lv} class:max={lv === 4 && (r.level || 0) === 4 && sec.ramp === 'accent'} onclick={() => setLevel(i, lv)} title="{scaleLabel} {lv}/4" aria-label="{scaleLabel} {lv} of 4"></button>
              {/each}
            </span>
          {/snippet}
          {#snippet badgeInput()}
            <input class="blabel" bind:value={r.badge} oninput={markDirty} placeholder={scaleLabel.toLowerCase()} />
          {/snippet}
          <!-- pinned ramp puts the label above the pips; the default keeps pips-then-label inline -->
          {#if sec.ramp}{@render badgeInput()}{@render pipRow()}{:else}{@render pipRow()}{@render badgeInput()}{/if}
        </span>
        <span class="cctl">
          {#if r.targetId}<button class="cmini" onclick={() => openEntry(r.targetId)} title="open linked entry">↗</button>{/if}
          <Reorder {list} {i} />
          <button class="cmini" onclick={() => toggle(i)} title={open[i] ? 'collapse' : 'expand'}>{open[i] ? '▾' : '▸'}</button>
          <button class="cmini del" onclick={() => del(i)} title="remove">✕</button>
        </span>
      </div>
      {#if open[i]}
        <div class="cbody">
          <div class="cmain">
            <RichEditor value={r.body} multiline placeholder="Description…" oninput={(v) => setBody(i, v)} />

            {#if r.why !== undefined && r.why !== ''}
              <div class="xblk">
                <div class="xhd">
                  <input class="xlab" bind:value={r.whyLabel} oninput={markDirty} placeholder={whyLabel} />
                  <button class="cmini del" onclick={() => dropWhy(i)} title="remove">✕</button>
                </div>
                <RichEditor value={r.why} multiline placeholder="Why it's held — or who doubts it…" oninput={(v) => setWhy(i, v)} />
              </div>
            {/if}

            {#if (r.meta || []).length}
              <div class="xblk">
                <div class="xhd"><span class="xcap">Meta</span></div>
                <div class="mrows">
                  {#each r.meta as m, j (j)}
                    <div class="mrow">
                      <input class="mk" bind:value={m.k} oninput={markDirty} placeholder="When" />
                      <input class="mv" bind:value={m.v} oninput={markDirty} placeholder="every launch" />
                      <button class="cmini del" onclick={() => dropMeta(i, j)} title="remove">✕</button>
                    </div>
                  {/each}
                </div>
                <button class="xadd" onclick={() => addMeta(i)}>＋ pair</button>
              </div>
            {/if}

            {#if costLabel && r.cost !== undefined && r.cost !== ''}
              <div class="xblk cost">
                <div class="xhd"><span class="xcap">{costLabel}</span><button class="cmini del" onclick={() => setCost(i, '')} title="remove">✕</button></div>
                <RichEditor value={r.cost} multiline placeholder="What breaking it costs…" oninput={(v) => setCost(i, v)} />
              </div>
            {/if}

            <div class="xbar">
              {#if !r.why}<button class="xadd" onclick={() => addWhy(i)}>＋ {whyLabel.toLowerCase()}</button>{/if}
              {#if !(r.meta || []).length}<button class="xadd" onclick={() => addMeta(i)}>＋ meta</button>{/if}
              {#if costLabel && !r.cost}<button class="xadd" onclick={() => setCost(i, ' ')}>＋ consequence</button>{/if}
              {#if !imgOf(r)}<button class="xadd" onclick={() => setImg(i)}>＋ image</button>{/if}
            </div>

            <select class="clink" bind:value={r.targetId} onchange={markDirty}>
              <option value="">— link to a deep entry (optional) —</option>
              {#each others as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
            </select>
          </div>
        </div>
      {/if}
    </div>
  {/each}
  <datalist id="catgrp-{sec.key}">{#each groups as g}<option value={g}></option>{/each}</datalist>
  <button class="addbtn" onclick={add}>＋ Add {sec.label.toLowerCase()}</button>
</div>

<style>
  .cat{display:flex;flex-direction:column;gap:10px}
  /* card mirrors the reader's .fgc: optional image band, name + badge row, then the body */
  .ccard{border:1px solid var(--rule);border-radius:13px;background:var(--panel);overflow:hidden}
  .ccard.open{border-color:color-mix(in srgb,var(--accent) 40%,var(--rule))}
  .cimg{display:block;width:100%;height:116px;padding:0;border:none;border-bottom:1px solid var(--rule);background:var(--panel-2) center/cover no-repeat;cursor:pointer}
  .chead{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:12px;align-items:flex-start;padding:16px 18px 10px}
  .cctl{display:flex;align-items:center;gap:4px}
  .cwho{min-width:0}
  .cnm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.1rem*var(--hs,1));line-height:1.12;color:var(--ink);width:100%}
  .cmeta{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap}
  .cgroup,.ckind{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-soft);padding:3px 7px;field-sizing:content;min-width:4em;max-width:14em}
  .cgroup::placeholder,.ckind::placeholder{color:var(--faint)}
  .cgroup{color:var(--ink)}
  .cbadge{display:inline-flex;align-items:center;gap:6px;flex:none}
  /* pinned-ramp badge stacks label above pips and right-aligns, as the reader draws it */
  .cbadge.stacked{flex-direction:column;align-items:flex-end;gap:5px}
  .cbadge.stacked .blabel{text-align:right;border-color:transparent;background:none;color:var(--bc,var(--ink));padding:0}
  .cbadge.stacked .pips{gap:4px}
  .cbadge.stacked .pip{width:9px;height:9px;border:none;background:var(--rule)}
  .cbadge.stacked .pip.on{background:var(--bc)}
  .cbadge.stacked .pip.max{box-shadow:0 0 6px color-mix(in srgb,var(--bc) 70%,transparent)}
  .pips{display:inline-flex;gap:3px}
  .pip{width:11px;height:11px;padding:0;border-radius:50%;border:1px solid var(--bc);background:none;cursor:pointer}
  .pip.on{background:var(--bc)}
  .blabel{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);padding:3px 7px;field-sizing:content;min-width:4em;max-width:12em}
  .blabel::placeholder{color:var(--faint)}
  .cmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .cmini:hover{border-color:var(--accent);color:var(--ink)}
  .cmini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .cbody{padding:0 18px 16px}
  .cmain{display:flex;flex-direction:column;gap:10px;min-width:0}
  /* opt-in per-item extras (why / meta pairs / consequence) */
  .xblk{border:1px solid var(--rule);border-radius:8px;padding:8px 10px;background:var(--panel-2)}
  .xblk.cost{border-color:color-mix(in srgb,var(--accent) 30%,var(--rule));background:color-mix(in srgb,var(--accent) 7%,transparent)}
  .xhd{display:flex;align-items:center;gap:8px;margin-bottom:6px}
  .xcap,.xlab{font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-soft)}
  .xlab{flex:1;min-width:0;background:none;border:none;outline:none;padding:0}
  .xlab::placeholder{color:var(--faint)}
  .xcap{flex:1}
  .xblk.cost .xcap{color:var(--accent)}
  .mrows{display:flex;flex-direction:column;gap:6px}
  .mrow{display:grid;grid-template-columns:8em 1fr auto;gap:6px;align-items:center}
  .mk,.mv{background:var(--panel);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);padding:4px 8px;font-family:var(--mono);font-size:.62rem;min-width:0}
  .mk{text-transform:uppercase;letter-spacing:.06em}
  .mk::placeholder,.mv::placeholder{color:var(--faint)}
  .xbar{display:flex;flex-wrap:wrap;gap:6px}
  .xadd{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:6px;padding:4px 9px;cursor:pointer;font-family:var(--sans);font-size:.72rem}
  .xadd:hover{border-color:var(--accent);color:var(--ink)}
  .clink{align-self:flex-start;font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:6px 9px}
  .addbtn{width:100%;margin-top:4px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){.chead{grid-template-columns:minmax(0,1fr) auto;row-gap:8px}.cctl{grid-column:2}}
</style>
