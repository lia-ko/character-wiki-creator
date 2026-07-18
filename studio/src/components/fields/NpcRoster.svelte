<script>
  import { markDirty, confirmDelete, openEntry } from '../../lib/store.svelte.js';
  import { pickImages } from '../../lib/images.js';
  import { resolveImg } from '../../lib/imagepool.js';
  import Reorder from '../Reorder.svelte';
  let { entry, sec, others } = $props();
  const list = $derived(Array.isArray(entry.data[sec.key]) ? entry.data[sec.key] : []);
  const people = $derived((others || []).filter(o => o.type === 'character'));
  const rest = $derived((others || []).filter(o => o.type !== 'character'));
  const linkedOf = (id) => (others || []).find(o => o.id === id);
  const coverOf = (r) => (r.targetId && linkedOf(r.targetId)?.cover) || resolveImg(r.img) || '';
  const nameOf = (r) => r.name || (r.targetId && linkedOf(r.targetId)?.title) || '';

  const DISP = [{ v: '', l: '—' }, { v: 'friendly', l: 'friendly' }, { v: 'neutral', l: 'neutral' }, { v: 'wary', l: 'wary' }, { v: 'hostile', l: 'hostile' }];
  function add(){ list.push({ name: '', role: '', disp: '', where: '', want: '', quirk: '', secret: '', targetId: '', img: '' }); markDirty(); }
  async function del(i){ const r = list[i]; if (!(await confirmDelete(nameOf(r), 'this NPC'))) return; list.splice(i, 1); markDirty(); }
  async function portrait(r){
    if (r.targetId){ openEntry(r.targetId); return; }
    const urls = await pickImages(false); if (urls && urls[0]){ r.img = urls[0]; markDirty(); }
  }
</script>

<div class="roster">
  {#each list as r, i (i)}
    <div class="npc" data-disp={r.disp}>
      <button class="port" style={coverOf(r) ? `background-image:url(${coverOf(r)})` : ''} onclick={() => portrait(r)} title={r.targetId ? 'open full sheet' : 'add a portrait'}>
        {#if !coverOf(r)}<span class="ini">{(nameOf(r) || '?').slice(0, 1).toUpperCase()}</span>{/if}
      </button>
      <div class="main">
        <div class="top">
          <input class="nm" bind:value={r.name} oninput={markDirty} placeholder="Name" />
          <input class="role" bind:value={r.role} oninput={markDirty} placeholder="role" />
          <select class="disp" bind:value={r.disp} onchange={markDirty} title="disposition">{#each DISP as d}<option value={d.v}>{d.l}</option>{/each}</select>
          <span class="grow"></span>
          <select class="link" bind:value={r.targetId} onchange={markDirty} title="link a full sheet (optional)">
            <option value="">no full sheet</option>
            {#if people.length}<optgroup label="Characters">{#each people as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}</optgroup>{/if}
            {#if rest.length}<optgroup label="Other">{#each rest as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>{/if}
          </select>
          <Reorder {list} {i} />
          <button class="del" onclick={() => del(i)} title="remove" aria-label="remove NPC">✕</button>
        </div>
        <div class="rows">
          <label class="r"><span class="k">wants</span><input bind:value={r.want} oninput={markDirty} placeholder="what they're after" /></label>
          <label class="r"><span class="k">quirk</span><input bind:value={r.quirk} oninput={markDirty} placeholder="voice / mannerism to play them" /></label>
          <label class="r"><span class="k">where</span><input bind:value={r.where} oninput={markDirty} placeholder="where they're found" /></label>
          <label class="r sec"><span class="k">secret</span><input bind:value={r.secret} oninput={markDirty} placeholder="GM only — what they're hiding" /></label>
        </div>
      </div>
    </div>
  {/each}
  <button class="addbtn" onclick={add}>＋ Add NPC</button>
</div>

<style>
  .roster{display:flex;flex-direction:column;gap:10px}
  .npc{display:grid;grid-template-columns:56px 1fr;gap:12px;border:1px solid var(--rule);border-left:3px solid var(--rule);border-radius:11px;background:var(--panel);padding:11px}
  .npc[data-disp="friendly"]{border-left-color:#4aa579}
  .npc[data-disp="neutral"]{border-left-color:#6f8296}
  .npc[data-disp="wary"]{border-left-color:#c99a5a}
  .npc[data-disp="hostile"]{border-left-color:#c05348}
  .port{width:56px;height:56px;border-radius:9px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
  .port:hover{border-color:var(--accent)}
  .port .ini{font-family:var(--head);font-size:1.4rem;color:var(--faint)}
  .main{min-width:0;display:flex;flex-direction:column;gap:8px}
  .top{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .nm{background:none;border:none;outline:none;font-family:var(--head);font-size:1.1rem;color:var(--ink);min-width:6em;flex:0 1 auto}
  .nm::placeholder{color:var(--faint)}
  .role{background:var(--panel-2);border:1px solid var(--rule);border-radius:20px;outline:none;font-family:var(--mono);font-size:.54rem;letter-spacing:.06em;text-transform:uppercase;color:#6f8296;padding:3px 9px;field-sizing:content;min-width:4em;max-width:12em}
  .role::placeholder{color:var(--faint)}
  .disp{font-family:var(--mono);font-size:.6rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:20px;padding:3px 7px;outline:none;cursor:pointer}
  .grow{flex:1}
  .link{font-family:var(--mono);font-size:.58rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:3px 6px;outline:none;cursor:pointer;max-width:11em}
  .del{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .del:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .rows{display:flex;flex-direction:column;gap:5px}
  .r{display:flex;align-items:center;gap:8px}
  .r .k{font-family:var(--mono);font-size:.48rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);width:48px;flex:0 0 48px;text-align:right}
  .r input{flex:1;min-width:0;background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font:inherit;font-size:.9rem;padding:5px 8px}
  .r input:focus{border-color:var(--accent)}
  .r input::placeholder{color:var(--faint)}
  .r.sec .k{color:#b0596a}
  .r.sec input{color:#c98a9a;border-color:color-mix(in srgb,#b0596a 30%,var(--rule))}
  .addbtn{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
</style>
