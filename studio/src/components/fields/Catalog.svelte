<script>
  import { markDirty, openEntry, confirmDelete } from '../../lib/store.svelte.js';
  import { pickImages } from '../../lib/images.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(entry.data[sec.key]);
  const scaleLabel = $derived(sec.scale || 'Scale');
  const RAMP = ['var(--faint)', 'var(--faint)', '#3f9d6d', '#8a5a2b', '#9a3324'];

  const linkedOf = (r) => others.find(o => o.id === r.targetId);
  const imgOf = (r) => r.img || linkedOf(r)?.cover || '';   // pull the linked entry's cover if none set
  const groups = $derived([...new Set(list.map(r => (r.group || '').trim()).filter(Boolean))]);

  let open = $state({ 0: true });
  function toggle(i){ open[i] = !open[i]; }
  function add(){ list.push({ name: 'New entry', kind: '', group: '', level: 0, badge: '', targetId: '', img: '', body: '' }); open[list.length - 1] = true; markDirty(); }
  async function del(i){ const r = list[i]; const named = r.name && r.name !== 'New entry'; const has = named || r.body || r.kind || r.badge || r.img; if (!(await confirmDelete(has, named ? '“' + r.name + '”' : 'this item'))) return; list.splice(i, 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
  async function setImg(i){ const u = await pickImages(false); if (u && u[0]){ list[i].img = u[0]; markDirty(); } }
  function setLevel(i, lv){ list[i].level = (list[i].level === lv) ? lv - 1 : lv; markDirty(); }   // click current top pip to clear
</script>

<div class="cat">
  {#each list as r, i (i)}
    <div class="ccard" class:open={open[i]}>
      <div class="chead">
        <button class="cthumb" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''} onclick={() => setImg(i)} title="set image">{#if !imgOf(r)}<span class="ph">img</span>{/if}</button>
        <div class="cwho">
          <input class="cnm" bind:value={r.name} oninput={markDirty} placeholder="Name" />
          <div class="cmeta">
            <input class="cgroup" list="catgrp-{sec.key}" bind:value={r.group} oninput={markDirty} placeholder="group" />
            <input class="ckind" bind:value={r.kind} oninput={markDirty} placeholder="kind" />
            <span class="cbadge">
              <span class="pips" title={scaleLabel}>
                {#each [1, 2, 3, 4] as lv}
                  <button class="pip" class:on={(r.level || 0) >= lv} style={`--bc:${RAMP[Math.max(0, Math.min(4, r.level || 0))]}`} onclick={() => setLevel(i, lv)} title="{scaleLabel} {lv}/4" aria-label="{scaleLabel} {lv} of 4"></button>
                {/each}
              </span>
              <input class="blabel" bind:value={r.badge} oninput={markDirty} placeholder={scaleLabel.toLowerCase()} />
            </span>
          </div>
        </div>
        {#if r.targetId}<button class="cmini" onclick={() => openEntry(r.targetId)} title="open linked entry">↗</button>{/if}
        <Reorder {list} {i} />
        <button class="cmini" onclick={() => toggle(i)} title={open[i] ? 'collapse' : 'expand'}>{open[i] ? '▾' : '▸'}</button>
        <button class="cmini del" onclick={() => del(i)} title="remove">✕</button>
      </div>
      {#if open[i]}
        <div class="cbody">
          <button class="cport" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''} onclick={() => setImg(i)} title="set image">
            {#if !imgOf(r)}<span class="ph">click to add image</span>{/if}
          </button>
          <div class="cmain">
            <RichEditor value={r.body} multiline placeholder="Description…" oninput={(v) => setBody(i, v)} />
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
  .ccard{border:1px solid var(--rule);border-radius:10px;background:var(--panel);overflow:hidden}
  .ccard.open{border-color:color-mix(in srgb,var(--accent) 40%,var(--rule))}
  .chead{display:grid;grid-template-columns:48px minmax(0,1fr) auto auto auto auto;gap:10px;align-items:center;padding:9px 12px}
  .cthumb{width:48px;height:52px;border-radius:6px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;color:var(--faint);font-family:var(--mono);font-size:.44rem;text-transform:uppercase}
  .cthumb:hover{border-color:var(--accent)}
  .cwho{min-width:0}
  .cnm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.15rem*var(--hs,1));color:var(--ink);width:100%}
  .cmeta{display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap}
  .cgroup,.ckind{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-soft);padding:3px 7px;field-sizing:content;min-width:4em;max-width:14em}
  .cgroup::placeholder,.ckind::placeholder{color:var(--faint)}
  .cgroup{color:var(--ink)}
  .cbadge{display:inline-flex;align-items:center;gap:6px}
  .pips{display:inline-flex;gap:3px}
  .pip{width:11px;height:11px;padding:0;border-radius:50%;border:1px solid var(--bc);background:none;cursor:pointer}
  .pip.on{background:var(--bc)}
  .blabel{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);padding:3px 7px;field-sizing:content;min-width:4em;max-width:12em}
  .blabel::placeholder{color:var(--faint)}
  .cmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .cmini:hover{border-color:var(--accent);color:var(--ink)}
  .cmini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .cbody{display:grid;grid-template-columns:180px 1fr;gap:18px;align-items:start;padding:2px 14px 16px;border-top:1px solid var(--rule)}
  .cport{width:100%;aspect-ratio:4/3;border-radius:9px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;position:relative;display:block;align-self:start}
  .cport:hover{border-color:var(--accent)}
  .ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);text-align:center;padding:8px}
  .cthumb .ph{position:static;padding:0}
  .cmain{display:flex;flex-direction:column;gap:10px;min-width:0}
  .clink{align-self:flex-start;font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:6px 9px}
  .addbtn{width:100%;margin-top:4px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){.cbody{grid-template-columns:1fr}}
</style>
