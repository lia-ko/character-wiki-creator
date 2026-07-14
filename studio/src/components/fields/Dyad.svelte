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

  <!-- mirrored sides -->
  <div class="sides">
    {#each ['a', 'b'] as side}
      <div class="side {side}">
        <div class="sh">{nameOf(d[side].targetId) || (side === 'a' ? 'Person A' : 'Person B')}<span>· their side</span></div>
        {#each ROWS as r}
          <label class="k">{r.label}</label>
          <input bind:value={d.sides[side][r.key]} oninput={markDirty} placeholder="…" />
        {/each}
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
  .sides{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .side{border:1px solid var(--rule);border-radius:11px;background:var(--panel-2);padding:12px 14px}
  .side.a{border-top:2px solid #c99a5a} .side.b{border-top:2px solid #5f9fb0}
  .side .sh{font-family:var(--head);font-size:1.02rem;color:var(--ink);margin-bottom:9px}
  .side .sh span{font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin-left:6px}
  .side .k{display:block;font-family:var(--mono);font-size:.5rem;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin:9px 0 3px}
  .side .k:first-of-type{margin-top:0}
  .side input{width:100%;background:var(--panel);border:1px solid var(--rule);border-radius:6px;outline:none;color:var(--ink);font:inherit;font-size:.92rem;padding:6px 8px}
  .side input:focus{border-color:var(--accent)}
  .side input::placeholder{color:var(--faint)}
  @media(max-width:600px){.head{grid-template-columns:1fr}.who.b{flex-direction:row;text-align:left}.who.b .role{text-align:left}.sides{grid-template-columns:1fr}}
</style>
