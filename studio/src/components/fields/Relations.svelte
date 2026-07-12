<script>
  import { markDirty, openEntry } from '../../lib/store.svelte.js';
  import { pickImages } from '../../lib/images.js';
  import RichEditor from './RichEditor.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(entry.data[sec.key]);
  const expand = $derived(sec.display === 'expand');

  const linkedOf = (r) => others.find(o => o.id === r.targetId);
  const imgOf = (r) => r.img || linkedOf(r)?.cover || '';   // pull the linked entry's cover if none set

  // in expand mode, track which cards are open (first one open by default)
  let open = $state({ 0: true });
  function toggle(i){ open[i] = !open[i]; }

  function add(){ list.push({ name: 'New entry', role: '', status: '', targetId: '', img: '', body: '' }); if (expand) open[list.length - 1] = true; markDirty(); }
  function del(i){ list.splice(i, 1); markDirty(); }
  function setBody(i, v){ list[i].body = v; markDirty(); }
  async function setImg(i){ const u = await pickImages(false); if (u && u[0]){ list[i].img = u[0]; markDirty(); } }
</script>

<div class="rels" class:expandmode={expand}>
  {#each list as r, i (i)}
    {#if expand}
      <div class="xcard" class:open={open[i]}>
        <div class="xhead" onclick={() => toggle(i)} role="button" tabindex="0">
          <span class="xthumb" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''}></span>
          <span class="xwho"><span class="xn">{r.name || 'Untitled'}</span>{#if r.role || r.status}<span class="xr">{[r.role, r.status].filter(Boolean).join(' · ')}</span>{/if}</span>
          {#if r.targetId}<button class="openbtn" onclick={(e) => { e.stopPropagation(); openEntry(r.targetId); }} title="open linked entry">open ↗</button>{/if}
          <span class="chev">{open[i] ? '▾' : '▸'}</span>
        </div>
        {#if open[i]}
          <div class="xbody">
            <button class="ximg" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''} onclick={() => setImg(i)} title="set image">
              {#if !imgOf(r)}<span class="pickhint">click to add image</span>
              {:else if !r.img}<span class="pickhint pulled">from linked entry · click to override</span>{/if}
            </button>
            <div class="xfields">
              <input class="xname" bind:value={r.name} oninput={markDirty} placeholder="Name" />
              <div class="tags"><input bind:value={r.role} oninput={markDirty} placeholder="role" /><span>·</span><input bind:value={r.status} oninput={markDirty} placeholder="status" /></div>
              <RichEditor value={r.body} multiline placeholder="Write-up…" oninput={(v) => setBody(i, v)} />
              <select class="link" bind:value={r.targetId} onchange={markDirty}>
                <option value="">— link to another entry —</option>
                {#each others as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
              </select>
              <button class="del" onclick={() => del(i)}>Remove</button>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="rel">
        <div class="head">
          <button class="port" style={imgOf(r) ? `background-image:url(${imgOf(r)})` : ''} onclick={() => setImg(i)} title="set image">{#if !imgOf(r)}<span>img</span>{/if}</button>
          <div class="who">
            <input class="nm" bind:value={r.name} oninput={markDirty} placeholder="Name" />
            <div class="tags"><input bind:value={r.role} oninput={markDirty} placeholder="role" /><span>·</span><input bind:value={r.status} oninput={markDirty} placeholder="status" /></div>
          </div>
          {#if r.targetId}<button class="openbtn" onclick={() => openEntry(r.targetId)} title="open linked entry">open ↗</button>{/if}
          <button class="delx" onclick={() => del(i)} title="remove">✕</button>
        </div>
        <RichEditor value={r.body} multiline placeholder="Write-up…" oninput={(v) => setBody(i, v)} />
        <select class="link" bind:value={r.targetId} onchange={markDirty}>
          <option value="">— link to another entry —</option>
          {#each others as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}
        </select>
      </div>
    {/if}
  {/each}
  <button class="addbtn" onclick={add}>＋ Add {sec.label.toLowerCase()}</button>
</div>

<style>
  .rels{display:flex;flex-direction:column;gap:10px}
  /* -------- compact (default) -------- */
  .rel{border:1px solid var(--rule);border-radius:9px;background:var(--panel);padding:10px 12px}
  .head{display:grid;grid-template-columns:52px 1fr auto auto;gap:12px;align-items:center;margin-bottom:8px}
  .openbtn{font-family:var(--mono);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-soft);background:none;border:1px solid var(--rule);border-radius:6px;padding:4px 8px;cursor:pointer;white-space:nowrap}
  .openbtn:hover{border-color:var(--accent);color:var(--ink);background:var(--line)}
  .pulled{font-style:italic;opacity:.85}
  .port{width:52px;height:66px;border-radius:6px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;color:var(--faint);font-family:var(--mono);font-size:.44rem;text-transform:uppercase}
  .port:hover{border-color:var(--accent)}
  .nm{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.1rem*var(--hs,1));color:var(--ink);width:100%}
  .tags{display:flex;align-items:center;gap:6px;margin-top:4px}
  .tags input{background:none;border:none;outline:none;font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-soft);width:6.5em}
  .tags span{color:var(--faint)}
  .delx{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:2px 6px;border-radius:4px}
  .delx:hover{color:#fff;background:var(--accent)}
  .link{margin-top:8px;font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:5px 8px}
  .addbtn{width:100%;margin-top:4px;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}

  /* -------- expandable (Realm locations / Location notable) -------- */
  .xcard{border:1px solid var(--rule);border-radius:10px;background:var(--panel);overflow:hidden}
  .xcard.open{border-color:color-mix(in srgb,var(--accent) 45%,var(--rule))}
  .xhead{display:grid;grid-template-columns:44px 1fr auto auto;gap:12px;align-items:center;padding:9px 13px;cursor:pointer}
  .xhead .openbtn{font-family:var(--mono);font-size:.54rem;letter-spacing:.08em;text-transform:uppercase;color:var(--accent-soft);background:none;border:1px solid var(--rule);border-radius:6px;padding:4px 8px;cursor:pointer;white-space:nowrap}
  .xhead .openbtn:hover{border-color:var(--accent);color:var(--ink);background:var(--line)}
  .xhead:hover{background:var(--line)}
  .xthumb{width:44px;height:44px;border-radius:7px;background:var(--panel-2) center/cover;border:1px solid var(--rule)}
  .xwho{display:flex;flex-direction:column;gap:3px;min-width:0}
  .xn{font-family:var(--head);font-size:calc(1.05rem*var(--hs,1));color:var(--ink);line-height:1.1}
  .xr{font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-soft)}
  .chev{color:var(--faint);font-size:.7rem}
  .xbody{padding:0 14px 14px}
  .ximg{display:block;width:100%;aspect-ratio:16/9;border-radius:9px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;margin-bottom:12px;position:relative}
  .ximg:hover{border-color:var(--accent)}
  .pickhint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
  .xfields{display:flex;flex-direction:column;gap:8px}
  .xname{background:none;border:none;outline:none;font-family:var(--head);font-size:calc(1.35rem*var(--hs,1));color:var(--ink)}
  .del{align-self:flex-start;margin-top:2px;font-family:var(--mono);font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);background:none;border:1px solid var(--rule);border-radius:6px;padding:5px 11px;cursor:pointer}
  .del:hover{color:#fff;background:var(--accent);border-color:var(--accent)}
</style>
