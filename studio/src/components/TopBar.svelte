<script>
  import { app, curProject, curEntry, openProjects, openProject, openSearch, openTrash, undo, redo, clearDirty, markDirty, saveNow, toast, setContentWidth } from '../lib/store.svelte.js';
  import { slugify, migrateWorkspace } from '../lib/model.js';
  import { inlineReplacer, deImageWorkspace } from '../lib/imagepool.js';
  import { buildWorkspace } from '../lib/build.js';
  import { download } from '../lib/download.js';
  import { dismissable } from '../lib/dismissable.js';

  let fileInput;
  let exporting = $state(false);
  let moreOpen = $state(false);

  async function exportZip(){
    if (exporting) return; exporting = true;
    try {
      const blob = await buildWorkspace(app.ws);
      download(blob, (slugify(app.ws.title) || 'world') + '-wiki.zip');
      clearDirty();
    } catch (e) { toast('Export failed: ' + (e && e.message || e)); }
    exporting = false;
  }

  function saveJson(){
    // inline image refs back to data URLs so the backup file is self-contained / portable
    download(new Blob([JSON.stringify(app.ws, inlineReplacer)], { type: 'application/json' }), (slugify(app.ws.title) || 'world') + '.json');
    clearDirty();
  }
  function openJson(e){
    const f = e.target.files[0]; if (!f) return;
    f.text().then(txt => {
      try {
        const data = JSON.parse(txt);
        if (data && Array.isArray(data.projects)){
          app.ws = migrateWorkspace(data);
          deImageWorkspace(app.ws);   // pull the file's inline images into the pool as refs
          app.projectId = data.projects[0]?.id || null;
          app.entryId = null; app.view = 'projects'; clearDirty(); saveNow();
        } else toast('That does not look like a workspace file.');
      } catch (_) { toast('Could not read that file.'); }
    });
    e.target.value = '';
  }
</script>

<div class="appbar">
  <span class="brand"><span class="mk">✦</span><span class="bname"> Wiki <span class="accent">Studio</span></span></span>
  <span class="crumbs">
    <button type="button" class="crumb-link" onclick={openProjects}>World</button>
    {#if app.view !== 'projects' && curProject()}
      <span class="sep">/</span>
      {#if app.view === 'project'}<b>{curProject().name}</b>
      {:else}<button type="button" class="crumb-link" onclick={() => openProject(curProject().id)}>{curProject().name}</button>{/if}
    {/if}
    {#if app.view === 'entry' && curEntry()}
      <span class="sep">/</span><b>{curEntry().title || 'Untitled'}</b>
    {/if}
  </span>
  <span class="grow"></span>
  <span class="wctl wideact" role="group" aria-label="content width" title="content width">
    <button class:on={app.ws.contentWidth === 'focused'} onclick={() => setContentWidth('focused')} title="Focused — a narrow reading column" aria-label="focused width"><svg width="18" height="10"><rect x="5" y="3" width="8" height="4" rx="1" fill="currentColor"/></svg></button>
    <button class:on={(app.ws.contentWidth || 'normal') === 'normal'} onclick={() => setContentWidth('normal')} title="Default width" aria-label="default width"><svg width="18" height="10"><rect x="2" y="3" width="14" height="4" rx="1" fill="currentColor"/></svg></button>
    <button class:on={app.ws.contentWidth === 'full'} onclick={() => setContentWidth('full')} title="Full width" aria-label="full-width content"><svg width="18" height="10"><rect x="0" y="3" width="18" height="4" rx="1" fill="currentColor"/></svg></button>
  </span>
  <button class="search" onclick={openSearch} title="Search (⌘K)"><span class="si">⌕</span><span class="slabel"> Search </span><kbd>⌘K</kbd></button>
  {#if app.dirty}<span class="unsaved"><span class="u"></span> unsaved</span>{/if}
  <button class="abtn ico" onclick={undo} disabled={app.histIndex <= 0} title="Undo (⌘Z)">↶</button>
  <button class="abtn ico" onclick={redo} disabled={app.histIndex >= app.histLen - 1} title="Redo (⌘⇧Z)">↷</button>
  <button class="abtn" onclick={openTrash} title="Trash — restore deleted entries">Trash{#if app.ws.trash?.length} <span class="tcount">{app.ws.trash.length}</span>{/if}</button>
  <button class="abtn wideact" onclick={() => fileInput.click()}>Open</button>
  <button class="abtn wideact" onclick={saveJson}>Save</button>
  <div class="morewrap narrowact" use:dismissable={() => moreOpen = false}>
    <button class="abtn ico" class:on={moreOpen} onclick={() => moreOpen = !moreOpen} title="More" aria-expanded={moreOpen}>⋯</button>
    {#if moreOpen}
      <div class="moremenu">
        <button class="moreitem" onclick={() => { moreOpen = false; fileInput.click(); }}>Open workspace…</button>
        <button class="moreitem" onclick={() => { moreOpen = false; saveJson(); }}>Save workspace</button>
      </div>
    {/if}
  </div>
  <button class="abtn primary" onclick={exportZip} disabled={exporting}>{exporting ? 'Exporting…' : 'Export .zip'}</button>
  <input type="file" accept=".json,application/json" bind:this={fileInput} onchange={openJson} style="display:none" />
</div>

<style>
  .appbar{position:fixed;top:0;left:0;right:0;height:var(--appbar-h);z-index:var(--z-appbar);display:flex;align-items:center;gap:12px;padding:0 16px;background:var(--panel);border-bottom:1px solid var(--rule)}
  .brand{display:flex;align-items:center;gap:9px;font-weight:700;white-space:nowrap}
  .brand .mk{color:var(--accent-soft);font-family:var(--head);font-size:1.1rem}
  .brand .accent{color:var(--accent)}
  .crumbs{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);white-space:nowrap;min-width:0;flex-shrink:1;overflow:hidden}
  .crumbs b{display:inline-block;max-width:32vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
  .crumb-link{font:inherit;letter-spacing:inherit;text-transform:inherit;background:none;border:none;padding:0;color:var(--muted);cursor:pointer}.crumb-link:hover{color:var(--ink)}
  .crumbs b{color:var(--ink);font-weight:400}
  .sep{opacity:.5}
  .grow{flex:1}
  .search{display:flex;align-items:center;gap:8px;font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:8px;padding:6px 10px 6px 12px;cursor:pointer;white-space:nowrap}
  .search:hover{border-color:var(--accent);color:var(--ink)}
  .search .si{color:var(--accent-soft);font-size:.95rem}
  .search kbd{font-family:var(--mono);font-size:.6rem;background:var(--panel);border:1px solid var(--rule);border-radius:4px;padding:1px 5px;color:var(--faint)}
  .wctl{display:inline-flex;border:1px solid var(--rule);border-radius:8px;overflow:hidden}
  .wctl button{border:none;background:var(--panel-2);color:var(--faint);cursor:pointer;padding:6px 7px;border-right:1px solid var(--rule);display:flex;align-items:center}
  .wctl button:last-child{border-right:none}
  .wctl button:hover{color:var(--muted)}
  .wctl button.on{color:#fff;background:var(--accent)}
  .unsaved{font-family:var(--mono);font-size:.6rem;letter-spacing:.08em;color:var(--faint);display:flex;align-items:center;gap:6px;white-space:nowrap}
  .unsaved .u{width:7px;height:7px;border-radius:50%;background:var(--accent)}
  .abtn{font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:8px;padding:7px 13px;cursor:pointer;white-space:nowrap}
  .abtn:hover{border-color:var(--accent)}
  .abtn.on{border-color:var(--accent);color:var(--ink)}
  .abtn.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
  .abtn.ico{padding:7px 10px;font-size:.95rem;line-height:1}
  .abtn:disabled{opacity:.4;cursor:default}
  .abtn:disabled:hover{border-color:var(--rule)}
  .tcount{font-family:var(--mono);font-size:.6rem;color:var(--accent-soft)}
  /* responsive overflow: file actions inline when there's room, collapse into ⋯ when tight */
  .narrowact{display:none}
  @media(max-width:1100px){ .wideact{display:none} .narrowact{display:block} }
  .morewrap{position:relative;flex:none}
  .moremenu{position:absolute;top:calc(100% + 6px);right:0;z-index:var(--z-dropdown);min-width:190px;background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:6px;box-shadow:0 18px 44px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:2px}
  .moreitem{font:inherit;font-size:.8rem;text-align:left;background:none;border:none;border-radius:7px;padding:8px 11px;cursor:pointer;color:var(--ink);white-space:nowrap}
  .moreitem:hover{background:var(--panel-2)}

  /* compact top bar on small screens (still horizontally scrollable as a fallback) */
  @media(max-width:720px){
    .appbar{gap:7px;padding:0 10px}
    .bname{display:none}
    .crumbs{display:none}
    .search .slabel,.search kbd{display:none}
    .search{padding:6px 9px}
    .unsaved{display:none}
    .abtn{padding:6px 9px;font-size:.72rem}
    .abtn.ico{padding:6px 8px}
  }
</style>
