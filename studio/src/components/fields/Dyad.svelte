<script>
  import { markDirty, openEntry } from '../../lib/store.svelte.js';
  let { entry, sec, others } = $props();
  // guarantee shape
  $effect(() => {
    const d = entry.data[sec.key];
    if (!d || typeof d !== 'object' || Array.isArray(d)) entry.data[sec.key] = { a: { targetId: '', role: '' }, b: { targetId: '', role: '' }, dynamic: '', status: '', tension: '', sides: { a: { wants: '', fears: '', hides: '', sees: '' }, b: { wants: '', fears: '', hides: '', sees: '' } } };
    else { if (!d.a) d.a = { targetId: '', role: '' }; if (!d.b) d.b = { targetId: '', role: '' }; if (!d.sides) d.sides = { a: {}, b: {} }; if (!d.sides.a) d.sides.a = {}; if (!d.sides.b) d.sides.b = {}; }
  });
  const d = $derived(entry.data[sec.key] || {});
  const chars = $derived((others || []).filter(o => o.type === 'character'));
  const rest = $derived((others || []).filter(o => o.type !== 'character'));
  const linkedOf = (id) => (others || []).find(o => o.id === id);
  const nameOf = (id) => { const o = linkedOf(id); return o ? (o.title || 'Untitled') : ''; };
  const coverOf = (id) => linkedOf(id)?.cover || '';
  const ini = (id) => (nameOf(id) || '?').slice(0, 1).toUpperCase();

  // two steps on purpose: `(d.clash ||= {})[k] = v` would write to the raw object the assignment
  // returns rather than the reactive proxy, and the change would be silently lost
  function toggleClash(k){
    if (!d.clash) d.clash = {};
    d.clash[k] = !d.clash[k];
    markDirty();
  }

  const ROWS = [
    { key: 'wants', label: 'Wants from them' },
    { key: 'fears', label: 'Fears' },
    { key: 'hides', label: 'Won’t admit' },
    { key: 'sees', label: 'Sees them as' },
  ];
</script>

<div class="dyad">
  <!-- pairing header -->
  <div class="head">
    {#each ['a', 'b'] as side}
      <div class="who {side}">
        <button class="av" style={coverOf(d[side].targetId) ? `background-image:url(${coverOf(d[side].targetId)})` : ''} onclick={() => d[side].targetId && openEntry(d[side].targetId)} title={d[side].targetId ? 'open entry' : ''}>
          {#if !coverOf(d[side].targetId)}<span>{d[side].targetId ? ini(d[side].targetId) : '?'}</span>{/if}
        </button>
        <div class="wm">
          <select bind:value={d[side].targetId} onchange={markDirty} class="pick">
            <option value="">— pick {side === 'a' ? 'person A' : 'person B'} —</option>
            {#if chars.length}<optgroup label="Characters">{#each chars as o}<option value={o.id}>{o.title || 'Untitled'}</option>{/each}</optgroup>{/if}
            {#if rest.length}<optgroup label="Other">{#each rest as o}<option value={o.id}>{o.title || 'Untitled'} ({o.type})</option>{/each}</optgroup>{/if}
          </select>
          <input class="role" bind:value={d[side].role} oninput={markDirty} placeholder="epithet (optional)" />
        </div>
      </div>
      {#if side === 'a'}
        <div class="bond">
          <span class="link">↔</span>
          <input class="dyn" bind:value={d.dynamic} oninput={markDirty} placeholder="dynamic" />
          <input class="status" bind:value={d.status} oninput={markDirty} placeholder="status" />
        </div>
      {/if}
    {/each}
  </div>

  <!-- central tension -->
  <div class="tension">
    <div class="tl">The tension</div>
    <textarea rows="2" bind:value={d.tension} oninput={markDirty} placeholder="the central conflict between them — what pulls them together and what keeps them apart"></textarea>
  </div>

  <!-- the gap: mirrored ledger, label in the spine, so asymmetry reads across (mirrors the reader) -->
  <div class="gap spined">
    <div class="gh a">{nameOf(d.a.targetId) || 'Person A'}</div>
    <div class="gh mid">reads across &rarr;</div>
    <div class="gh b">{nameOf(d.b.targetId) || 'Person B'}</div>
    {#each ROWS as r}
      <!-- wrapped so the label can lead its own pair when stacked; flattened it would sit between them -->
      <div class="gaprow">
        <input class="gc a" bind:value={d.sides.a[r.key]} oninput={markDirty} placeholder="…" />
        <button class="gk" class:clash={d.clash?.[r.key]}
          onclick={() => toggleClash(r.key)}
          title={d.clash?.[r.key] ? 'marked as a clash — click to clear' : 'mark this row as a real disagreement'}>{r.label}</button>
        <input class="gc b" bind:value={d.sides.b[r.key]} oninput={markDirty} placeholder="…" />
      </div>
    {/each}
  </div>
</div>

<style>
  .dyad{display:flex;flex-direction:column;gap:14px}
  .head{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center}
  .who{display:flex;align-items:center;gap:11px;min-width:0}
  .who.b{flex-direction:row-reverse;text-align:right}
  .av{width:52px;height:52px;border-radius:50%;flex:0 0 auto;background:var(--panel-2) center/cover;border:2px solid var(--rule);display:flex;align-items:center;justify-content:center;font-family:var(--head);font-size:1.2rem;color:var(--muted);cursor:pointer}
  .who.a .av{border-color:color-mix(in srgb,#c99a5a 60%,var(--rule))}
  .who.b .av{border-color:color-mix(in srgb,#5f9fb0 60%,var(--rule))}
  .wm{display:flex;flex-direction:column;gap:4px;min-width:0}
  .pick{font-family:var(--head);font-size:1.05rem;background:none;border:none;color:var(--ink);outline:none;cursor:pointer;max-width:100%}
  .pick option{background:var(--panel);color:var(--ink)}
  .role{background:none;border:none;outline:none;font-family:var(--mono);font-size:.56rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);min-width:0}
  .who.a .role{color:#c99a5a} .who.b .role{color:#5f9fb0;text-align:right}
  .role::placeholder{color:var(--faint)}
  .bond{display:flex;flex-direction:column;align-items:center;gap:5px}
  .bond .link{font-size:1.2rem;color:var(--accent-soft)}
  .dyn,.status{background:var(--panel-2);border:1px solid var(--rule);border-radius:20px;outline:none;text-align:center;font-family:var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--ink);field-sizing:content;min-width:7em;max-width:14em}
  .dyn{font-size:.56rem;color:var(--accent-soft);border-color:color-mix(in srgb,var(--accent) 35%,var(--rule));padding:3px 10px}
  .status{font-size:.5rem;color:var(--faint);padding:2px 9px}
  .dyn::placeholder,.status::placeholder{color:var(--faint)}
  .dyn:focus,.status:focus{border-color:var(--accent)}
  .tension{border:1px solid color-mix(in srgb,var(--accent) 28%,var(--rule));border-radius:11px;background:color-mix(in srgb,var(--accent) 6%,transparent);padding:10px 13px}
  .tension .tl{font-family:var(--mono);font-size:.52rem;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-soft);margin-bottom:5px}
  .tension textarea{width:100%;background:none;border:none;outline:none;color:var(--ink);font:inherit;font-size:.98rem;resize:vertical}
  .tension textarea::placeholder{color:var(--faint)}
  /* the gap — mirrors the reader ledger; --pa/--pb come from the reader token block */
  .gap{display:grid;grid-template-columns:1fr 150px 1fr;align-items:stretch;position:relative}
  .spined::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:1px;z-index:0;transform:translateX(-.5px);
    background:linear-gradient(180deg,transparent,var(--rule) 8%,var(--rule) 92%,transparent)}
  .gaprow{display:contents}
  .gh{font-family:var(--mono);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;padding-bottom:9px}
  .gh.a{text-align:right;color:var(--pa,#5f9fb0)} .gh.b{color:var(--pb,#d98d82)}
  .gh.mid{text-align:center;color:var(--faint);background:var(--bg)}
  .gc{background:none;border:none;border-top:1px solid var(--line);outline:none;color:var(--ink);font:inherit;
    font-size:.94rem;padding:12px 14px;min-width:0;width:100%}
  .gc.a{text-align:right}
  .gc::placeholder{color:var(--faint)}
  .gc:focus{background:var(--panel-2)}
  /* the clash tick marks rows where the two sides genuinely disagree — the rows worth reading */
  .gk{position:relative;border:none;border-top:1px solid var(--line);background:var(--bg);cursor:pointer;
    font-family:var(--mono);font-size:.54rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);padding:12px 6px}
  .gk:hover{color:var(--ink)}
  .gk.clash{color:var(--gold,#b9924d)}
  .gk.clash::after{content:"";position:absolute;top:5px;left:50%;width:5px;height:5px;margin-left:-2.5px;
    border-radius:50%;background:var(--gold,#b9924d)}
  @media(max-width:700px){
    .head{grid-template-columns:1fr}.who.b{flex-direction:row;text-align:left}.who.b .role{text-align:left}
    .spined::before{display:none}
    .gap{grid-template-columns:1fr}
    .gh.a,.gh.b{display:none}.gh.mid{display:none}
    .gaprow{display:flex;flex-direction:column;margin-bottom:10px}
    .gk{order:-1;text-align:left;padding:12px 0 4px;border-top:1px solid var(--rule)}
    .gk.clash::after{display:none}
    .gc{border-top:none;text-align:left!important;border-left:2px solid var(--rule);padding:6px 0 6px 12px;margin-bottom:4px}
    .gc.a{border-color:var(--pa,#5f9fb0)} .gc.b{border-color:var(--pb,#d98d82)}
  }
</style>
