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
  // a single declared linkType → create-and-link is one click; otherwise offer a type picker
  const createType = $derived(linkTypes && linkTypes.length === 1 ? linkTypes[0] : null);
  // create a new entry (titled from the row's name) and link this relation to it, without navigating away
  function createAndLink(i, type){
    const r = list[i];
    const title = (r.name && r.name !== 'New relation') ? r.name.trim() : '';
    const e = createLinkedEntry(type, title);
    if (!e) return;
    r.targetId = e.id;
    if (!title) r.name = e.title;   // reflect the generated name back into the row
    markDirty();
  }
  const primary = $derived(linkTypes ? others.filter(o => linkTypes.includes(o.type)) : others);
  const secondary = $derived(linkTypes ? others.filter(o => !linkTypes.includes(o.type)) : []);

  const linkedOf = (r) => others.find(o => o.id === r.targetId);
  const imgOf = (r) => resolveImg(r.img) || linkedOf(r)?.cover || '';   // pull the linked entry's cover if none set

  let open = $state({ 0: true });
  function toggle(i){ open[i] = !open[i]; }
  function add(){ list.push({ name: 'New relation', role: '', status: '', targetId: '', img: '', body: '' }); open[list.length - 1] = true; markDirty(); }
  async function del(i){ const r = list[i]; const named = r.name && r.name !== 'New relation'; const has = named || r.body || r.role || r.status || r.img; if (!(await confirmDelete(has, named ? '“' + r.name + '”' : 'this entry'))) return; list.splice(i, 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
  async function setImg(i){ const u = await pickImages(false); if (u && u[0]){ list[i].img = u[0]; markDirty(); } }
</script>

<div class="rels">
  {#each list as r, i (i)}
    <div class="rcard" class:open={open[i]}>
      <div class="rhead">
        <button class="rthumb" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''} onclick={() => setImg(i)} title="set image">{#if !imgOf(r)}<span class="ph">img</span>{/if}</button>
        <div class="rwho">
          <input class="rnm" bind:value={r.name} oninput={markDirty} placeholder="Name" />
          <div class="rtags"><input bind:value={r.role} oninput={markDirty} placeholder="role" /><span>·</span><input bind:value={r.status} oninput={markDirty} placeholder="status" /></div>
        </div>
        {#if r.targetId}<button class="rmini" onclick={() => openEntry(r.targetId)} title="open linked entry">↗</button>{/if}
        <Reorder list={list} {i} />
        <button class="rmini" onclick={() => toggle(i)} title={open[i] ? 'collapse' : 'expand'}>{open[i] ? '▾' : '▸'}</button>
        <button class="rmini del" onclick={() => del(i)} title="remove">✕</button>
      </div>
      {#if open[i]}
        <div class="rbody">
          <button class="rport" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''} onclick={() => setImg(i)} title="set image">
            {#if !imgOf(r)}<span class="ph">click to add image</span>{/if}
          </button>
          <div class="rmain">
            <RichEditor value={r.body} multiline placeholder="Write-up…" oninput={(v) => setBody(i, v)} />
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
                  <button class="rcreate" onclick={() => createAndLink(i, createType)} title="create a new entry and link it here">＋ Create &amp; link {templateFor(createType).label.toLowerCase()}</button>
                {:else}
                  <NewEntryMenu oncreate={(type) => createAndLink(i, type)} align="left" label="Create &amp; link" subtle />
                {/if}
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add {sec.label.toLowerCase()}</button>
</div>

<style>
  .rels{display:flex;flex-direction:column;gap:10px}
  .rcard{border:1px solid var(--rule);border-radius:10px;background:var(--panel);overflow:hidden}
  .rcard.open{border-color:color-mix(in srgb,var(--accent) 40%,var(--rule))}
  .rhead{display:grid;grid-template-columns:48px minmax(0,1fr) auto auto auto auto;gap:10px;align-items:center;padding:9px 12px}
  .rthumb{width:48px;height:60px;border-radius:6px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;color:var(--faint);font-family:var(--mono);font-size:.44rem;text-transform:uppercase}
  .rthumb:hover{border-color:var(--accent)}
  .rwho{min-width:0}
  .rnm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.2rem*var(--hs,1));color:var(--ink);width:100%}
  .rtags{display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap}
  .rtags input{background:none;border:none;outline:none;font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-soft);field-sizing:content;min-width:2.5em;max-width:16em}
  .rtags input::placeholder{color:var(--faint)}
  .rtags span{color:var(--faint)}
  .rmini{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .rmini:hover{border-color:var(--accent);color:var(--ink)}
  .rmini.del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .rbody{display:grid;grid-template-columns:180px 1fr;gap:18px;align-items:start;padding:2px 14px 16px;border-top:1px solid var(--rule)}
  .rport{width:100%;aspect-ratio:3/4;border-radius:9px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;position:relative;display:block;align-self:start}
  .rport:hover{border-color:var(--accent)}
  .ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);text-align:center;padding:8px}
  .rthumb .ph{position:static;padding:0}
  .rmain{display:flex;flex-direction:column;gap:10px;min-width:0}
  .rlinkrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .rlink{font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:6px 9px}
  .rcreate{font:inherit;font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:6px 11px;cursor:pointer}
  .rcreate:hover{border-color:var(--accent);color:var(--ink)}
  .addbtn{width:100%;margin-top:4px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  @media(max-width:640px){.rbody{grid-template-columns:1fr}}
</style>
