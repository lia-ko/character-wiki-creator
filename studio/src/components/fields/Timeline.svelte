<script>
  import { markDirty, confirmDelete } from '../../lib/store.svelte.js';
  import RichEditor from './RichEditor.svelte';
  import Reorder from '../Reorder.svelte';

  let { entry, sec, others } = $props();

  // guarantee shape for entries that predate this field
  $effect(() => {
    const d = entry.data[sec.key];
    if (!d || typeof d !== 'object' || Array.isArray(d)) entry.data[sec.key] = { eras: [], threads: [], entries: [], view: 'chronicle' };
    else { if (!Array.isArray(d.eras)) d.eras = []; if (!Array.isArray(d.threads)) d.threads = []; if (!Array.isArray(d.entries)) d.entries = []; if (!d.view) d.view = 'chronicle'; }
  });
  const data = $derived(entry.data[sec.key] || { eras: [], threads: [], entries: [], view: 'chronicle' });
  const eras = $derived(Array.isArray(data.eras) ? data.eras : []);
  const threads = $derived(Array.isArray(data.threads) ? data.threads : []);
  const entries = $derived(Array.isArray(data.entries) ? data.entries : []);
  const view = $derived(data.view || 'chronicle');

  const VIEWS = [
    { id: 'chronicle', label: 'Chronicle', hint: 'One vertical spine through era bands.' },
    { id: 'tracks', label: 'Tracks', hint: 'Parallel threads on a shared time axis — assign each beat a thread.' },
    { id: 'ledger', label: 'Ledger', hint: 'Scannable tables by era — set each beat a weight.' },
  ];
  function setView(id){ data.view = id; markDirty(); }
  const THREAD_COLORS = ['#c99a5a', '#5f9fb0', '#8a86c9', '#5aa06f', '#c2564a', '#b07a4a'];
  function addThread(){ threads.push({ id: nid(), name: 'New thread', color: THREAD_COLORS[threads.length % THREAD_COLORS.length] }); markDirty(); }
  function delThread(i){ const id = threads[i].id; threads.splice(i, 1); entries.forEach(e => { if (e.threadId === id) e.threadId = ''; }); markDirty(); }
  function setWeight(r, n){ r.weight = (r.weight === n ? 0 : n); markDirty(); }

  // link picker: surface Event entries first, then everything else
  const evts = $derived((others || []).filter(o => o.type === 'event'));
  const rest = $derived((others || []).filter(o => o.type !== 'event'));
  const nameOf = (id) => { const o = (others || []).find(x => x.id === id); return o ? (o.title || 'Untitled') : '— missing —'; };
  const threadColor = (id) => { const t = threads.find(x => x.id === id); return t ? t.color : ''; };

  const nid = () => 'b' + Math.random().toString(36).slice(2, 9);
  let open = $state(new Set());   // beat ids expanded for editing

  function addEra(){ eras.push({ id: nid(), name: 'New era', span: '' }); markDirty(); }
  function delEra(i){ const id = eras[i].id; eras.splice(i, 1); entries.forEach(e => { if (e.eraId === id) e.eraId = ''; }); markDirty(); }

  function addEntry(){
    const id = nid();
    entries.push({ id, eraId: eras.length ? eras[eras.length - 1].id : '', threadId: threads.length ? threads[0].id : '', date: '', title: '', body: '', key: false, weight: 0, links: [] });
    open.add(id); open = new Set(open); markDirty();
  }
  async function delEntry(i){
    const r = entries[i]; const has = (r.date && r.date.trim()) || (r.title && r.title.trim()) || (r.body && r.body.trim());
    if (!(await confirmDelete(has, r.title ? '“' + r.title + '”' : 'this beat'))) return;
    entries.splice(i, 1); markDirty();
  }
  function toggle(id){ if (open.has(id)) open.delete(id); else open.add(id); open = new Set(open); }
  function setBody(i, v){ entries[i].body = v; markDirty(); }
  function addLink(i, id){ if (!id) return; const e = entries[i]; if (!Array.isArray(e.links)) e.links = []; if (!e.links.some(l => l.targetId === id)) e.links.push({ targetId: id }); markDirty(); }
  function delLink(i, j){ entries[i].links.splice(j, 1); markDirty(); }
</script>

<div class="tl">
  <!-- reader-view switcher -->
  <div class="views">
    <span class="vlabel">Reader view</span>
    <div class="vseg">
      {#each VIEWS as vw}
        <button class:on={view === vw.id} onclick={() => setView(vw.id)}>{vw.label}</button>
      {/each}
    </div>
    <span class="vhint">{VIEWS.find(v => v.id === view)?.hint}</span>
  </div>

  <!-- threads (Tracks view only) -->
  {#if view === 'tracks'}
    <div class="eras threads">
      <div class="erahd">Threads <span>the parallel lanes — a POV, faction, or “true vs known”</span></div>
      {#each threads as th, i (th.id)}
        <div class="erow trow">
          <span class="tdot" style="background:{th.color}"></span>
          <input class="ename" bind:value={th.name} oninput={markDirty} placeholder="thread name" />
          <Reorder list={threads} {i} />
          <button class="x" onclick={() => delThread(i)} title="remove thread" aria-label="remove thread">✕</button>
        </div>
      {/each}
      <button class="addbtn sm" onclick={addThread}>＋ thread</button>
    </div>
  {/if}

  <!-- era bands (optional) -->
  <div class="eras">
    <div class="erahd">Eras <span>optional — bands that group the beats</span></div>
    {#each eras as er, i (er.id)}
      <div class="erow">
        <input class="ename" bind:value={er.name} oninput={markDirty} placeholder="era name" />
        <input class="espan" bind:value={er.span} oninput={markDirty} placeholder="span (e.g. Y.R. 1–340)" />
        <Reorder list={eras} {i} />
        <button class="x" onclick={() => delEra(i)} title="remove era" aria-label="remove era">✕</button>
      </div>
    {/each}
    <button class="addbtn sm" onclick={addEra}>＋ era</button>
  </div>

  <!-- beats -->
  <div class="beats">
    {#each entries as r, i (r.id)}
      <div class="beat" class:key={r.key} class:open={open.has(r.id)}>
        <div class="bhd" onclick={() => toggle(r.id)} role="button" tabindex="0" onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(r.id))}>
          <span class="car">▸</span>
          {#if view === 'tracks' && threadColor(r.threadId)}<span class="hdot" style="background:{threadColor(r.threadId)}"></span>{/if}
          <span class="bdate" class:ph={!r.date}>{r.date || 'date'}</span>
          <span class="btitle" class:ph={!r.title}>{r.title || 'Untitled beat'}</span>
          {#if r.key}<span class="kstar">★</span>{/if}
          <span class="grow"></span>
          <span class="bctl" onclick={(e) => e.stopPropagation()} role="presentation">
            <Reorder list={entries} {i} />
            <button class="x" onclick={() => delEntry(i)} title="remove beat" aria-label="remove beat">✕</button>
          </span>
        </div>
        {#if open.has(r.id)}
          <div class="bbody">
            <div class="brow">
              <select class="erasel" bind:value={r.eraId} onchange={markDirty} title="assign to an era">
                <option value="">— no era —</option>
                {#each eras as er}<option value={er.id}>{er.name}</option>{/each}
              </select>
              <input class="indate" bind:value={r.date} oninput={markDirty} placeholder="date" />
              <input class="intitle" bind:value={r.title} oninput={markDirty} placeholder="what happened" />
              <button class="hk" class:on={r.key} onclick={() => { r.key = !r.key; markDirty(); }} title="mark as a key beat" aria-label="key beat">★</button>
            </div>
            {#if view === 'tracks' || view === 'ledger'}
              <div class="brow2">
                {#if view === 'tracks'}
                  <label class="mini">Thread
                    <select bind:value={r.threadId} onchange={markDirty}>
                      <option value="">— none —</option>
                      {#each threads as th}<option value={th.id}>{th.name}</option>{/each}
                    </select>
                  </label>
                {/if}
                {#if view === 'ledger'}
                  <span class="mini">Weight
                    <span class="wpips">
                      {#each [1, 2, 3, 4] as n}
                        <button class="wpip" class:on={(r.weight || 0) >= n} onclick={() => setWeight(r, n)} title={'weight ' + n} aria-label={'weight ' + n}></button>
                      {/each}
                    </span>
                  </span>
                {/if}
              </div>
            {/if}
            <RichEditor value={r.body} multiline placeholder="Describe the beat…" oninput={(v) => setBody(i, v)} />
            <div class="links">
              {#each (r.links || []) as l, j (j)}
                <span class="lchip">{nameOf(l.targetId)}<button onclick={() => delLink(i, j)} title="unlink" aria-label="unlink">✕</button></span>
              {/each}
              <select class="linkadd" value="" onchange={(e) => { addLink(i, e.target.value); e.target.value = ''; }} title="link an entry">
                <option value="">＋ link…</option>
                {#if evts.length}<optgroup label="Events">{#each evts as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}</optgroup>{/if}
                {#if rest.length}<optgroup label="Other entries">{#each rest as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>{/if}
              </select>
            </div>
          </div>
        {/if}
      </div>
    {/each}
    <button class="addbtn" onclick={addEntry}>＋ Add beat</button>
    <p class="hint">Add earliest first. Assign an era to group beats into bands; ★ marks a key beat; link to Events, characters or places.</p>
  </div>
</div>

<style>
  .tl{display:flex;flex-direction:column;gap:16px}
  /* view switcher */
  .views{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .vlabel{font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
  .vseg{display:inline-flex;border:1px solid var(--rule);border-radius:8px;overflow:hidden}
  .vseg button{border:none;background:var(--panel-2);color:var(--muted);font-family:var(--sans);font-size:.78rem;padding:6px 14px;cursor:pointer;border-right:1px solid var(--rule)}
  .vseg button:last-child{border-right:none}
  .vseg button:hover{color:var(--ink)}
  .vseg button.on{background:var(--accent);color:#fff}
  .vhint{font-family:var(--sans);font-size:.74rem;color:var(--faint)}
  .threads .tdot,.hdot{width:9px;height:9px;border-radius:50%;flex:0 0 auto}
  .trow{grid-template-columns:auto minmax(0,1fr) auto auto}
  .brow2{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .mini{font-family:var(--mono);font-size:.56rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);display:inline-flex;align-items:center;gap:7px}
  .mini select{font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:4px 7px;text-transform:none;letter-spacing:0}
  .wpips{display:inline-flex;gap:4px}
  .wpip{width:16px;height:8px;border-radius:3px;border:1px solid var(--rule);background:var(--panel-2);cursor:pointer;padding:0}
  .wpip.on{background:var(--accent);border-color:var(--accent)}
  /* eras */
  .eras{border:1px solid var(--rule-soft,var(--rule));border-radius:10px;background:var(--panel-2);padding:11px 13px}
  .erahd{font-family:var(--mono);font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-bottom:9px}
  .erahd span{text-transform:none;letter-spacing:0;font-family:var(--sans);font-size:.72rem;margin-left:8px}
  .erow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr) auto auto;gap:8px;align-items:center;margin-bottom:6px}
  .ename{background:var(--panel);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--head);font-size:.98rem;color:var(--ink);padding:5px 9px;min-width:0}
  .espan{background:var(--panel);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.62rem;color:var(--accent-soft);padding:5px 9px;min-width:0}
  .ename:focus,.espan:focus{border-color:var(--accent)}
  /* beats spine */
  .beats{position:relative;padding-left:22px}
  .beats::before{content:'';position:absolute;left:4px;top:8px;bottom:44px;width:1px;background:var(--rule)}
  .beat{position:relative;border:1px solid var(--rule);border-radius:10px;background:var(--panel);margin-bottom:10px}
  .beat::before{content:'';position:absolute;left:-22px;top:15px;width:10px;height:10px;border-radius:50%;background:var(--panel);border:2px solid var(--rule);z-index:1}
  .beat.key::before{background:var(--accent);border-color:var(--accent)}
  .beat.key{border-color:color-mix(in srgb,var(--accent) 30%,var(--rule))}
  .bhd{display:flex;align-items:center;gap:9px;padding:9px 12px;cursor:pointer;user-select:none}
  .car{color:var(--faint);font-size:.7rem;transition:transform .15s;flex:0 0 auto}
  .beat.open .car{transform:rotate(90deg);color:var(--accent-soft)}
  .bdate{font-family:var(--mono);font-size:.6rem;letter-spacing:.04em;text-transform:uppercase;color:var(--accent-soft);white-space:nowrap}
  .btitle{font-family:var(--head);font-size:1.06rem;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .bdate.ph,.btitle.ph{color:var(--faint)}
  .kstar{color:var(--accent-soft);font-size:.68rem}
  .grow{flex:1}
  .bctl{display:flex;align-items:center;gap:4px}
  .bbody{padding:2px 12px 12px 12px;display:flex;flex-direction:column;gap:9px}
  .brow{display:grid;grid-template-columns:auto minmax(6em,auto) minmax(0,1fr) auto;gap:8px;align-items:center}
  .erasel{font-family:var(--sans);font-size:.72rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:5px 7px;max-width:11em}
  .indate{background:var(--panel-2);border:1px solid var(--rule);border-radius:6px;outline:none;font-family:var(--mono);font-size:.6rem;letter-spacing:.05em;text-transform:uppercase;color:var(--accent-soft);padding:5px 8px;field-sizing:content;min-width:6em;max-width:16em}
  .intitle{background:none;border:none;outline:none;font-family:var(--head);font-size:1.08rem;color:var(--ink);min-width:0}
  .indate::placeholder,.intitle::placeholder{color:var(--faint)}
  .indate:focus{border-color:var(--accent)}
  .hk{border:1px solid var(--rule);background:var(--panel-2);color:var(--faint);border-radius:6px;cursor:pointer;padding:5px 9px;font-size:.72rem;line-height:1}
  .hk.on{color:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 40%,var(--rule))}
  .links{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  .lchip{display:inline-flex;align-items:center;gap:5px;font-family:var(--mono);font-size:.6rem;color:var(--accent-soft);border:1px solid var(--rule);border-radius:6px;padding:3px 4px 3px 9px;background:var(--panel-2)}
  .lchip button{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.66rem;line-height:1;padding:0 2px}
  .lchip button:hover{color:var(--accent)}
  .linkadd{font-family:var(--sans);font-size:.7rem;background:var(--panel-2);color:var(--muted);border:1px dashed var(--rule);border-radius:6px;padding:4px 8px;cursor:pointer}
  .linkadd:hover{border-color:var(--accent);color:var(--ink)}
  .x{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 8px;font-size:.72rem;line-height:1}
  .x:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .addbtn{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px 14px;cursor:pointer;font-family:var(--sans);font-size:.8rem}
  .addbtn.sm{padding:6px 12px;font-size:.74rem}
  .addbtn:not(.sm){margin-left:-22px}
  .addbtn:hover{border-color:var(--accent);color:var(--ink)}
  .hint{margin:6px 0 0 -22px;font-family:var(--sans);font-size:.72rem;color:var(--faint)}
</style>
