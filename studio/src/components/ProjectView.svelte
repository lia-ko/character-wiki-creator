<script>
  import { app, curProject, openEntry, addEntry, deleteEntry, markDirty, saveNow, toast, undo, confirmModal } from '../lib/store.svelte.js';
  import { coverOf, entriesByType } from '../lib/model.js';
  import { ENTRY_TYPES, FAMILIES, templateFor } from '../lib/templates.js';
  import ThemeBar from './ThemeBar.svelte';
  import FontSample from './FontSample.svelte';
  import Reorder from './Reorder.svelte';
  import { pickImages } from '../lib/images.js';
  import { exportEntryBundle } from '../lib/exportentry.js';
  import Spotify from './fields/Spotify.svelte';
  import NewEntryMenu from './NewEntryMenu.svelte';
  import SelectBar from './SelectBar.svelte';

  const fallbackCover = $derived.by(() => { for (const e of (p.entries || [])){ const c = coverOf(e); if (c) return c; } return ''; });
  async function setCover(){ const u = await pickImages(false); if (u && u[0]){ p.cover = u[0]; markDirty(); } }
  function clearCover(){ p.cover = ''; markDirty(); }

  // move an entry earlier/later within its own type + group (entries share one array across types)
  function moveEntry(e, dir){
    const arr = p.entries; const g = e.group || ''; const same = [];
    arr.forEach((x, k) => { if (x.type === e.type && (x.group || '') === g) same.push(k); });
    const pos = same.findIndex(k => arr[k].id === e.id); const target = pos + dir;
    if (target < 0 || target >= same.length) return;
    const a = same[pos], b = same[target]; const t = arr[a]; arr[a] = arr[b]; arr[b] = t; markDirty();
  }

  // split a type's entries into ordered group clusters; named groups (in first-seen
  // order) first, ungrouped last. A lone ungrouped cluster renders headingless (as before).
  function cluster(list){
    const map = {}, order = [];
    for (const e of list){ const g = e.group || ''; if (!(g in map)){ map[g] = []; order.push(g); } map[g].push(e); }
    const named = order.filter(g => g !== '');
    const out = named.map(g => ({ name: g, items: map[g] }));
    if (map['']) out.push({ name: '', items: map[''] });
    return out;
  }

  const p = $derived(curProject());
  const groups = $derived(entriesByType(p));

  // auto-grow the project title textarea so long names wrap instead of clipping
  let titleEl;
  function fitTitle(){ if (titleEl){ titleEl.style.height = 'auto'; titleEl.style.height = titleEl.scrollHeight + 'px'; } }
  $effect(() => { p.name; fitTitle(); });                                   // re-fit on edit / project switch
  $effect(() => { if (!titleEl) return; const ro = new ResizeObserver(fitTitle); ro.observe(titleEl); return () => ro.disconnect(); });  // re-fit on column resize

  // category filter + unified "New entry" picker
  const familyOrder = FAMILIES.flatMap(f => f.types);
  let activeCat = $state('all');
  const visibleTypes = $derived(activeCat === 'all' ? familyOrder : (FAMILIES.find(f => f.key === activeCat)?.types || []));
  const shownTypes = $derived(visibleTypes.filter(t => (groups[t] || []).length));   // hide empty type-sections
  const activeLabel = $derived(activeCat === 'all' ? 'entries' : (FAMILIES.find(f => f.key === activeCat)?.label.toLowerCase() || ''));
  const catCount = (types) => types.reduce((n, t) => n + ((groups[t] || []).length), 0);

  // multi-select export
  let selecting = $state(false);
  let selected = $state({});
  let bundleExporting = $state(false);
  const selCount = $derived(Object.values(selected).filter(Boolean).length);
  function startSelect(){ selecting = true; selected = {}; }
  function cancelSelect(){ selecting = false; selected = {}; }
  function toggleSel(id){ selected[id] = !selected[id]; }
  async function exportSelected(){
    const chosen = (p.entries || []).filter(e => selected[e.id]);
    if (!chosen.length || bundleExporting) return;
    bundleExporting = true;
    try { await exportEntryBundle(p, chosen); } catch (e) { toast('Export failed: ' + (e && e.message || e)); }
    bundleExporting = false; selecting = false; selected = {};
  }

  // per-(type, group) collapse state, persisted on the project (kept out of the "dirty" flag)
  const gkey = (type, name) => type + '\n' + name;
  const isCollapsed = (type, name) => !!(p.collapsed && p.collapsed[gkey(type, name)]);
  function toggleGroup(type, name){
    if (!p.collapsed) p.collapsed = {};
    const k = gkey(type, name);
    p.collapsed[k] = !p.collapsed[k];
    saveNow();
  }

  async function del(e, id){ e.stopPropagation(); const entry = (p.entries || []).find(x => x.id === id); if (!(await confirmModal(`Delete “${entry?.title || 'this entry'}”?`))) return; deleteEntry(id); toast(`Moved “${entry?.title || 'entry'}” to trash`, { actionLabel: 'Undo', action: undo }); }
</script>

<div class="wrap">
  <div class="hero">
    <div class="hleft">
      <div class="covwrap">
        <button class="covpick" style={(p.cover || fallbackCover) ? `background-image:url(${p.cover || fallbackCover})` : ''} onclick={setCover} title="set project cover">
          {#if !(p.cover || fallbackCover)}<span class="covph">＋<br>cover</span>{/if}
        </button>
        {#if p.cover}<button class="covclear" onclick={clearCover} title="clear cover (use first entry)">✕</button>{/if}
      </div>
    <div>
      <div class="eyebrow">Project</div>
      <textarea class="htitle" rows="1" bind:this={titleEl} bind:value={p.name} oninput={markDirty} placeholder="Project name"></textarea>
      <div class="count">
        <input class="genre" bind:value={p.genre} oninput={markDirty} placeholder="genre / setting" />
        · {(p.entries || []).length} {(p.entries || []).length === 1 ? 'entry' : 'entries'}
      </div>
    </div>
    </div>
    <ThemeBar target={p} showPortrait />
  </div>

  <FontSample />

  {#if p.spotify}
    <details class="psound">
      <summary><span class="ic">♪</span> Soundtrack {#if p.spotify.length}<span class="tcount">{p.spotify.length}</span>{/if}</summary>
      <div class="psoundbody"><Spotify items={p.spotify} /></div>
    </details>
  {/if}

  <div class="typebar">
    <div class="cats">
      <button class="cat" class:on={activeCat === 'all'} onclick={() => activeCat = 'all'}>
        All <span class="cc">{(p.entries || []).length}</span>
      </button>
      {#each FAMILIES as f}
        <button class="cat" class:on={activeCat === f.key} onclick={() => activeCat = f.key}>
          {f.label} <span class="cc">{catCount(f.types)}</span>
        </button>
      {/each}
    </div>
    <div class="tbactions">
      <button class="selstart" onclick={startSelect} title="select sheets to export">☑ Select</button>
      <NewEntryMenu oncreate={addEntry} />
    </div>
  </div>

  {#each shownTypes as type}
    {@const tpl = templateFor(type)}
    {@const list = groups[type] || []}
    <section class="typesec">
      <div class="typehead">
        <h2><span class="ic">{tpl.icon}</span> {tpl.plural} <span class="tcount">{list.length}</span></h2>
      </div>
      {#if list.length}
        {@const clusters = cluster(list)}
        {#each clusters as cl (cl.name)}
          {@const hd = clusters.length > 1 || cl.name}
          {@const collapsed = hd && isCollapsed(type, cl.name)}
          {#if hd}
            <button class="grouphd" onclick={() => toggleGroup(type, cl.name)} aria-expanded={!collapsed}>
              <span class="chev">{collapsed ? '▸' : '▾'}</span>
              {cl.name || 'Ungrouped'} <span class="gcount">{cl.items.length}</span>
            </button>
          {/if}
          {#if !collapsed}
          <div class="grid">
            {#each cl.items as e, ei (e.id)}
              {@const cover = coverOf(e)}
              <div class="card" class:sel={selecting && selected[e.id]} role="button" tabindex="0"
                   aria-label={e.title || 'Untitled'}
                   onclick={() => selecting ? toggleSel(e.id) : openEntry(e.id)}
                   onkeydown={(ev) => { if (ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); selecting ? toggleSel(e.id) : openEntry(e.id); } }}>
                {#if selecting}
                  <span class="selck" class:on={selected[e.id]}>{selected[e.id] ? '✓' : ''}</span>
                {:else}
                  <div class="cardctl">
                    <Reorder horizontal onmove={(d) => moveEntry(e, d)} first={ei === 0} last={ei === cl.items.length - 1} />
                    <button class="kebab" onclick={(ev) => del(ev, e.id)} title="delete">✕</button>
                  </div>
                {/if}
                <div class="portrait" style={cover ? `background-image:url(${cover})` : ''}>
                  {#if !cover}<span class="ini">{(e.title || '?').slice(0, 2)}</span>{/if}
                </div>
                <div class="meta">
                  <div class="nm">{e.title || 'Untitled'}</div>
                  {#if e.subtitle}<div class="sub">{e.subtitle}</div>{/if}
                </div>
              </div>
            {/each}
          </div>
          {/if}
        {/each}
      {/if}
    </section>
  {/each}

  {#if !shownTypes.length}
    <div class="emptyall">
      {#if (p.entries || []).length}
        No {activeLabel} to show. Try another category, or add one with <b>＋ New entry</b>.
      {:else}
        Nothing here yet — create your first entry with <b>＋ New entry</b> above.
      {/if}
    </div>
  {/if}
</div>

{#if selecting}
  <SelectBar count={selCount} busy={bundleExporting} oncancel={cancelSelect} onexport={exportSelected} />
{/if}

<style>
  .wrap{max-width:1180px;margin:0 auto;padding:40px 26px 90px}
  .hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--rule)}
  .hleft{display:flex;align-items:stretch;gap:20px;min-width:0}
  .covwrap{position:relative;flex:none}
  .covpick{width:150px;height:100%;min-height:104px;border-radius:10px;border:1px solid var(--rule);background:var(--panel-2) center/cover;cursor:pointer;color:var(--muted);display:flex;align-items:center;justify-content:center}
  .covpick:hover{border-color:var(--accent);color:var(--ink)}
  .covph{font-family:var(--mono);font-size:.54rem;letter-spacing:.1em;text-transform:uppercase;text-align:center;line-height:1.5}
  .covclear{position:absolute;top:-7px;right:-7px;width:20px;height:20px;border-radius:50%;border:1px solid var(--rule);background:var(--panel);color:var(--muted);cursor:pointer;font-size:.65rem;line-height:1}
  .covclear:hover{border-color:var(--accent);color:#fff;background:var(--accent)}
  .eyebrow{font-family:var(--mono);font-size:.64rem;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
  .htitle{font-family:var(--head);font-weight:400;font-size:calc(clamp(2rem,5vw,3.2rem)*var(--hs,1));line-height:1.05;margin:0;color:var(--ink);background:none;border:none;outline:none;width:clamp(280px,44vw,760px);max-width:100%;box-sizing:border-box;resize:none;overflow:hidden;display:block}
  .count{font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:11px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;max-width:100%}
  .genre{background:none;border:none;outline:none;color:var(--muted);font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;border-bottom:1px solid transparent;field-sizing:content;min-width:9em;max-width:100%}
  .genre:focus{border-bottom-color:var(--rule)}
  .psound{margin:20px 0}
  .psound > summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;font-family:var(--head);font-weight:400;font-size:calc(1.4rem*var(--hs,1));color:var(--ink);padding-bottom:8px;border-bottom:1px solid var(--line)}
  .psound > summary::-webkit-details-marker{display:none}
  .psound > summary .ic{color:var(--accent-soft)}
  .psound > summary:hover{color:var(--accent)}
  .psoundbody{padding:16px 0;max-width:720px}
  .typebar{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin:22px 0 6px;padding-bottom:12px;border-bottom:1px solid var(--rule)}
  .cats{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
  .cat{font:inherit;font-size:.78rem;background:none;color:var(--muted);border:1px solid transparent;border-radius:20px;padding:6px 13px;cursor:pointer;display:flex;align-items:center;gap:7px}
  .cat:hover{color:var(--ink);border-color:var(--rule)}
  .cat.on{background:var(--panel-2);color:var(--ink);border-color:var(--rule)}
  .cat .cc{font-family:var(--mono);font-size:.6rem;letter-spacing:.06em;color:var(--faint)}
  .cat.on .cc{color:var(--accent-soft)}
  .tbactions{display:flex;align-items:center;gap:10px}
  .selstart{font:inherit;font-size:.78rem;background:none;color:var(--muted);border:1px solid var(--rule);border-radius:8px;padding:7px 12px;cursor:pointer;white-space:nowrap}
  .selstart:hover{border-color:var(--accent);color:var(--ink)}
  .typesec{margin:30px 0}
  .typehead{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid var(--line)}
  h2{font-family:var(--head);font-weight:400;font-size:calc(1.4rem*var(--hs,1));color:var(--ink);margin:0;display:flex;align-items:center;gap:10px}
  .ic{color:var(--accent-soft)}
  .tcount{font-family:var(--mono);font-size:.62rem;letter-spacing:.06em;color:var(--faint);vertical-align:middle}
  .grouphd{font:inherit;font-family:var(--mono);font-size:.66rem;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin:18px 0 10px;display:flex;align-items:center;gap:8px;width:100%;padding:5px 0;background:none;border:none;border-bottom:1px solid transparent;cursor:pointer;text-align:left}
  .grouphd:hover{color:var(--ink);border-bottom-color:var(--line)}
  .chev{color:var(--accent-soft);font-size:.7rem;width:.9em;flex:none;display:inline-block}
  .gcount{color:var(--faint);font-size:.6rem;letter-spacing:.1em}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
  .grid + .grouphd{margin-top:24px}
  .card{position:relative;background:var(--panel);border:1px solid var(--rule);border-radius:14px;overflow:hidden;cursor:pointer;transition:transform .12s,border-color .12s,box-shadow .12s}
  .card:hover{transform:translateY(-3px);border-color:var(--accent);box-shadow:0 14px 32px rgba(0,0,0,.4)}
  .card.sel{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent) inset}
  .card:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  .selck{position:absolute;top:9px;left:9px;z-index:3;width:24px;height:24px;border-radius:50%;border:2px solid #fff;background:rgba(0,0,0,.5);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;line-height:1}
  .selck.on{background:var(--accent);border-color:var(--accent)}
  .portrait{aspect-ratio:3/4;background:var(--panel-2) center/cover;position:relative;display:flex;align-items:center;justify-content:center}
  .portrait::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(0,0,0,.72))}
  .ini{font-family:var(--head);font-size:2.6rem;color:var(--line);text-transform:uppercase}
  .meta{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:12px 13px}
  .nm{font-family:var(--head);font-size:calc(1.2rem*var(--hs,1));line-height:1.05;color:#fff}
  .sub{font-family:var(--mono);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);margin-top:5px}
  .cardctl{position:absolute;top:9px;right:9px;z-index:3;display:flex;align-items:center;gap:6px;opacity:0;transition:opacity .12s}
  .card:hover .cardctl{opacity:1}
  .kebab{width:24px;height:24px;border-radius:7px;border:none;background:rgba(0,0,0,.5);color:#fff;cursor:pointer;font-size:.9rem;line-height:1}
  .kebab:hover{background:var(--accent)}
  .emptyall{color:var(--faint);font-style:italic;font-size:.9rem;text-align:center;padding:48px 20px}
  .emptyall b{color:var(--muted);font-style:normal}
</style>
