<script>
  import { app, curProject, openEntry, addEntry, toggleNav, renameGroup } from '../lib/store.svelte.js';
  import { ENTRY_TYPES, templateFor } from '../lib/templates.js';
  import NewEntryMenu from './NewEntryMenu.svelte';
  const p = $derived(curProject());
  let q = $state('');
  let collapsed = $state(new Set());
  function toggleGroup(key){
    const n = new Set(collapsed);
    n.has(key) ? n.delete(key) : n.add(key);
    collapsed = n;
  }

  // inline group rename
  let editKey = $state(null);
  let editVal = $state('');
  let editInput = $state(null);
  function startRename(type, name){ editKey = type + '::' + name; editVal = name; }
  function commitRename(type, name){
    if (editKey !== type + '::' + name) return;
    renameGroup(type, name, editVal);
    editKey = null;
  }
  function onRenameKey(e, type, name){
    if (e.key === 'Enter'){ e.preventDefault(); commitRename(type, name); }
    else if (e.key === 'Escape'){ e.preventDefault(); editKey = null; }
  }
  $effect(() => { if (editKey && editInput) editInput.select(); });
  const groups = $derived.by(() => {
    if (!p) return [];
    const order = [...ENTRY_TYPES, ...(p.types || []).map(t => t.type)];
    const byType = {}; (p.entries || []).forEach(e => (byType[e.type] || (byType[e.type] = [])).push(e));
    const ql = q.trim().toLowerCase();
    return order.filter(t => byType[t]?.length).map(t => {
      const items = byType[t].filter(e => !ql || (e.title || '').toLowerCase().includes(ql));
      if (!items.length) return null;
      // sub-cluster by the per-entry `group` field, matching the project grid (named first, ungrouped last)
      const map = {}, ord = [];
      for (const e of items){ const g = e.group || ''; if (!(g in map)){ map[g] = []; ord.push(g); } map[g].push(e); }
      const clusters = ord.filter(g => g !== '').map(g => ({ name: g, items: map[g] }));
      if (map['']) clusters.push({ name: '', items: map[''] });
      const showGroups = clusters.length > 1 || (clusters[0] && clusters[0].name);
      return { type: t, tpl: templateFor(t), count: items.length, clusters, showGroups };
    }).filter(Boolean);
  });
</script>

<!-- tap-away backdrop — only rendered as a visible layer where the nav overlays the sheet (mobile) -->
<button class="enav-scrim" onclick={toggleNav} aria-label="close entries panel" tabindex="-1"></button>
<aside class="enav">
  <div class="ehd">
    <input class="efilter" bind:value={q} placeholder="Filter entries…" spellcheck="false" />
    <button class="ecollapse" onclick={toggleNav} title="hide panel" aria-label="hide entries panel">«</button>
  </div>
  <!-- create a new entry (any type) without leaving the editor — it opens in place -->
  <div class="enav-new"><NewEntryMenu oncreate={addEntry} align="left" block /></div>
  <div class="elist">
    {#each groups as g (g.type)}
      <div class="etype"><span class="eic">{g.tpl.icon}</span><span class="etl">{g.tpl.plural}</span><span class="ect">{g.count}</span></div>
      {#each g.clusters as cl (cl.name)}
        {@const gkey = g.type + '::' + cl.name}
        {@const isc = g.showGroups && collapsed.has(gkey)}
        {#if g.showGroups}
          {#if editKey === gkey}
            <div class="egedit">
              <input bind:this={editInput} bind:value={editVal}
                onkeydown={(e) => onRenameKey(e, g.type, cl.name)}
                onblur={() => commitRename(g.type, cl.name)} spellcheck="false" />
            </div>
          {:else}
            <div class="egroup" class:col={isc}>
              <button class="egtog" onclick={() => toggleGroup(gkey)} aria-expanded={!isc} title={isc ? 'expand' : 'collapse'}>
                <span class="egchev">▾</span><span class="egname">{cl.name || 'Ungrouped'}</span><span class="egct">{cl.items.length}</span>
              </button>
              {#if cl.name}<button class="egren" onclick={() => startRename(g.type, cl.name)} title="rename group" aria-label="rename group">✎</button>{/if}
            </div>
          {/if}
        {/if}
        {#if !isc}
          {#each cl.items as e (e.id)}
            <button class="eitem" class:nested={g.showGroups} class:cur={e.id === app.entryId} onclick={() => openEntry(e.id)} title={e.title || 'Untitled'}>{e.title || 'Untitled'}</button>
          {/each}
        {/if}
      {/each}
    {/each}
    {#if !groups.length}<div class="enone">{q ? 'No matches.' : 'No entries yet.'}</div>{/if}
  </div>
</aside>

<style>
  .enav{position:fixed;left:0;top:var(--appbar-h);bottom:0;width:250px;z-index:calc(var(--z-appbar) - 1);background:var(--panel);border-right:1px solid var(--rule);display:flex;flex-direction:column}
  .ehd{display:flex;align-items:center;gap:6px;padding:10px;border-bottom:1px solid var(--rule)}
  .enav-new{padding:10px 10px 0}
  .efilter{flex:1;min-width:0;background:var(--panel-2);border:1px solid var(--rule);border-radius:7px;color:var(--ink);font:inherit;font-size:.82rem;padding:6px 9px;outline:none}
  .efilter:focus{border-color:var(--accent)}
  .efilter::placeholder{color:var(--faint)}
  .ecollapse{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:7px;cursor:pointer;padding:6px 9px;font-size:.85rem;line-height:1}
  .ecollapse:hover{border-color:var(--accent);color:var(--ink)}
  .elist{flex:1;overflow:auto;padding:8px 8px 40px}
  .etype{display:flex;align-items:center;gap:7px;font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);padding:11px 8px 5px}
  .etype .eic{color:var(--accent-soft)}
  .etype .etl{flex:1}
  .etype .ect{color:var(--faint)}
  .egroup{display:flex;align-items:center;gap:2px;padding:3px 6px 3px 4px;margin-top:5px;border-radius:6px}
  .egroup:hover{background:color-mix(in srgb,var(--panel-2) 55%,transparent)}
  .egtog{display:flex;align-items:center;gap:6px;flex:1;min-width:0;font:inherit;font-size:.78rem;color:var(--muted);background:none;border:none;outline:none;text-align:left;cursor:pointer;padding:4px 2px}
  .egtog:hover,.egroup:hover .egtog{color:var(--ink)}
  .egtog .egchev{color:var(--faint);font-size:.62em;transition:transform .12s;display:inline-block;width:9px;text-align:center}
  .egroup.col .egchev{transform:rotate(-90deg)}
  .egtog .egname{flex:0 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}
  .egtog .egct{color:var(--faint);font-size:.72rem;font-family:var(--mono)}
  .egren{flex:none;background:none;border:none;outline:none;color:var(--faint);cursor:pointer;font-size:.72rem;line-height:1;padding:3px 5px;border-radius:5px;opacity:0}
  .egroup:hover .egren{opacity:.75}
  .egren:hover{color:var(--ink);background:var(--panel);opacity:1}
  .egedit{padding:4px 6px 3px 20px;margin-top:5px}
  .egedit input{width:100%;box-sizing:border-box;font:inherit;font-size:.78rem;font-weight:500;color:var(--ink);background:var(--panel-2);border:1px solid var(--accent);border-radius:6px;padding:4px 8px;outline:none}
  .eitem{display:block;width:100%;text-align:left;font:inherit;font-size:.86rem;color:var(--muted);background:none;border:none;border-radius:6px;padding:6px 9px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .eitem.nested{margin-left:9px;padding-left:12px;border-left:1px solid var(--rule)}
  .eitem.nested:hover,.eitem.nested.cur{border-left-color:transparent}
  .eitem:hover{background:var(--panel-2);color:var(--ink)}
  .eitem.cur{background:color-mix(in srgb,var(--accent) 16%,var(--panel-2));color:var(--ink);box-shadow:inset 2px 0 var(--accent)}
  .enone{color:var(--faint);font-size:.82rem;padding:12px 8px}
  /* scrim sits behind the panel; hidden on wide screens where the nav shifts the content instead of overlaying it */
  .enav-scrim{display:none}
  @media(max-width:900px){
    .enav{box-shadow:0 0 40px rgba(0,0,0,.5)}
    .enav-scrim{display:block;position:fixed;inset:var(--appbar-h) 0 0 0;z-index:calc(var(--z-appbar) - 2);border:none;padding:0;cursor:pointer;background:rgba(0,0,0,.5)}
  }
</style>
