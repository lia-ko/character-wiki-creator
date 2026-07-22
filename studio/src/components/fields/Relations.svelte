<script>
  import { markDirty, openEntry, confirmDelete, createLinkedEntry } from '../../lib/store.svelte.js';
  import { templateFor } from '../../lib/templates.js';
  import { pickImages } from '../../lib/images.js';
  import { resolveImg } from '../../lib/imagepool.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';
  import NewEntryMenu from '../NewEntryMenu.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(entry.data[sec.key]);

  // when a section declares linkTypes (e.g. Sources → 'source'), surface those entries first
  const linkTypes = sec.linkTypes || null;
  const createType = $derived(linkTypes && linkTypes.length === 1 ? linkTypes[0] : null);
  function createAndLink(i, type){
    const r = list[i];
    const title = (r.name && r.name !== 'New relation') ? r.name.trim() : '';
    const e = createLinkedEntry(type, title);
    if (!e) return;
    r.targetId = e.id;
    if (!title) r.name = e.title;
    markDirty();
  }
  const primary = $derived(linkTypes ? others.filter(o => linkTypes.includes(o.type)) : others);
  const secondary = $derived(linkTypes ? others.filter(o => !linkTypes.includes(o.type)) : []);

  const linkedOf = (r) => others.find(o => o.id === r.targetId);
  const imgOf = (r) => resolveImg(r.img) || linkedOf(r)?.cover || '';   // pull the linked entry's cover if none set

  // master–detail: `sel` is the relation being edited on the right
  let sel = $state(0);
  $effect(() => { if (sel > list.length - 1) sel = Math.max(0, list.length - 1); });
  function add(){ list.push({ name: 'New relation', role: '', status: '', targetId: '', img: '', body: '' }); sel = list.length - 1; markDirty(); }
  async function del(i){ const r = list[i]; const named = r.name && r.name !== 'New relation'; const has = named || r.body || r.role || r.status || r.img; if (!(await confirmDelete(has, named ? '“' + r.name + '”' : 'this entry'))) return; list.splice(i, 1); if (sel >= list.length) sel = Math.max(0, list.length - 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
  async function setImg(i){ const u = await pickImages(false); if (u && u[0]){ list[i].img = u[0]; markDirty(); } }
</script>

<div class="relmd">
  <div class="rellist">
    {#each list as r, i (i)}
      <button type="button" class="reli" class:on={sel === i} onclick={() => sel = i}>
        <span class="rethumb" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''}></span>
        <span class="rewho">
          <span class="rn">{r.name || 'New relation'}</span>
          {#if r.role || r.status}<span class="rr">{[r.role, r.status].filter(Boolean).join(' · ')}</span>{/if}
        </span>
      </button>
    {/each}
    <button type="button" class="reladd" onclick={add}>＋ Add {sec.label.toLowerCase()}</button>
  </div>

  {#if list.length && list[sel]}
    {@const r = list[sel]}
    <div class="reldetail">
      <button class="report" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''} onclick={() => setImg(sel)} title="set image">
        {#if !imgOf(r)}<span class="ph">click to add image</span>{/if}
      </button>
      <div class="remain">
        <div class="redhead">
          <input class="ren-in" bind:value={r.name} oninput={markDirty} placeholder="Name" />
          <div class="redctl">
            {#if r.targetId}<button class="rmini" onclick={() => openEntry(r.targetId)} title="open linked entry">↗</button>{/if}
            <Reorder list={list} i={sel} />
            <button class="rmini del" onclick={() => del(sel)} title="remove">✕</button>
          </div>
        </div>
        <div class="retags"><input bind:value={r.role} oninput={markDirty} placeholder="role" /><span>·</span><input bind:value={r.status} oninput={markDirty} placeholder="status" /></div>
        {#key sel}
          <RichEditor value={r.body} multiline placeholder="Write-up…" oninput={(v) => setBody(sel, v)} />
        {/key}
        <div class="rlinkrow">
          <select class="rlink" bind:value={r.targetId} onchange={markDirty}>
            <option value="">— link to another entry —</option>
            {#if linkTypes}
              <optgroup label={sec.label}>
                {#each primary as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
              </optgroup>
              {#if secondary.length}
                <optgroup label="Other entries">
                  {#each secondary as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
                </optgroup>
              {/if}
            {:else}
              {#each others as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
            {/if}
          </select>
          {#if !r.targetId}
            {#if createType}
              <button class="rcreate" onclick={() => createAndLink(sel, createType)} title="create a new entry and link it here">＋ Create &amp; link {templateFor(createType).label.toLowerCase()}</button>
            {:else}
              <NewEntryMenu oncreate={(type) => createAndLink(sel, type)} align="left" label="Create &amp; link" subtle />
            {/if}
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .relmd{display:grid;grid-template-columns:210px 1fr;gap:16px;align-items:start;margin-top:6px}
  @media(max-width:640px){.relmd{grid-template-columns:1fr}}
  .rellist{display:flex;flex-direction:column;gap:8px}
  .reli{display:flex;align-items:center;gap:11px;border:1px solid var(--rule);border-radius:10px;background:var(--panel);padding:8px;cursor:pointer;text-align:left;font:inherit;transition:border-color .12s}
  .reli:hover{border-color:var(--accent-soft)}
  .reli.on{border-color:var(--accent);background:var(--panel-2)}
  .reli .rethumb{width:38px;height:48px;border-radius:6px;flex:none;background:var(--panel-2) center/cover;border:1px solid var(--rule)}
  .reli .rewho{display:block;min-width:0}
  .reli .rn{font-family:var(--head);font-size:calc(1rem*var(--hs,1));color:var(--ink);display:block;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .reli .rr{font-family:var(--mono);font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-top:3px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .reladd{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:10px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.78rem}
  .reladd:hover{border-color:var(--accent);color:var(--ink)}

  .reldetail{display:grid;grid-template-columns:130px 1fr;gap:18px;align-items:start;border:1px solid var(--rule);border-radius:14px;background:var(--panel);padding:16px}
  @media(max-width:640px){.reldetail{grid-template-columns:110px 1fr}}
  .report{width:100%;aspect-ratio:3/4;border-radius:10px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;position:relative;display:block}
  .report:hover{border-color:var(--accent)}
  .ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);text-align:center;padding:8px}
  .remain{display:flex;flex-direction:column;gap:10px;min-width:0}
  .redhead{display:flex;align-items:center;gap:10px}
  .ren-in{flex:1;min-width:0;background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));color:var(--ink)}
  .redctl{display:flex;align-items:center;gap:6px;flex:none}
  .rmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .rmini:hover{border-color:var(--accent);color:var(--ink)}
  .rmini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .retags{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .retags input{background:none;border:none;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-soft);field-sizing:content;min-width:2.5em;max-width:16em}
  .retags input::placeholder{color:var(--faint)}
  .retags span{color:var(--faint)}
  .rlinkrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .rlink{font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:6px 9px}
  .rcreate{font:inherit;font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:6px 11px;cursor:pointer}
  .rcreate:hover{border-color:var(--accent);color:var(--ink)}
</style>
