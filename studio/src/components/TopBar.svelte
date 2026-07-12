<script>
  import { app, curProject, curEntry, openProjects, openProject, openMapLab, openSearch, clearDirty, markDirty, saveNow } from '../lib/store.svelte.js';
  import { slugify, migrateWorkspace } from '../lib/model.js';
  import { buildWorkspace } from '../lib/build.js';

  let fileInput;
  let exporting = $state(false);

  async function exportZip(){
    if (exporting) return; exporting = true;
    try {
      const blob = await buildWorkspace(app.ws);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (slugify(app.ws.title) || 'world') + '-wiki.zip';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      clearDirty();
    } catch (e) { alert('Export failed: ' + (e && e.message || e)); }
    exporting = false;
  }

  function saveJson(){
    const blob = new Blob([JSON.stringify(app.ws)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (slugify(app.ws.title) || 'world') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    clearDirty();
  }
  function openJson(e){
    const f = e.target.files[0]; if (!f) return;
    f.text().then(txt => {
      try {
        const data = JSON.parse(txt);
        if (data && Array.isArray(data.projects)){
          app.ws = migrateWorkspace(data);
          app.projectId = data.projects[0]?.id || null;
          app.entryId = null; app.view = 'projects'; clearDirty(); saveNow();
        } else alert('That does not look like a workspace file.');
      } catch (_) { alert('Could not read that file.'); }
    });
    e.target.value = '';
  }
</script>

<div class="appbar">
  <span class="brand"><span class="mk">✦</span> Wiki <span>Studio</span></span>
  <span class="crumbs">
    <a onclick={openProjects}>World</a>
    {#if app.view !== 'projects' && curProject()}
      <span class="sep">/</span>
      {#if app.view === 'project'}<b>{curProject().name}</b>
      {:else}<a onclick={() => openProject(curProject().id)}>{curProject().name}</a>{/if}
    {/if}
    {#if app.view === 'entry' && curEntry()}
      <span class="sep">/</span><b>{curEntry().title || 'Untitled'}</b>
    {/if}
  </span>
  <span class="grow"></span>
  <button class="search" onclick={openSearch} title="Search (⌘K)"><span class="si">⌕</span> Search <kbd>⌘K</kbd></button>
  {#if app.dirty}<span class="unsaved"><span class="u"></span> unsaved</span>{/if}
  <button class="abtn" class:on={app.view === 'maplab'} onclick={openMapLab}>⬡ Map Lab</button>
  <button class="abtn" onclick={() => fileInput.click()}>Open</button>
  <button class="abtn" onclick={saveJson}>Save</button>
  <button class="abtn primary" onclick={exportZip} disabled={exporting}>{exporting ? 'Exporting…' : 'Export .zip'}</button>
  <input type="file" accept=".json,application/json" bind:this={fileInput} onchange={openJson} style="display:none" />
</div>

<style>
  .appbar{position:fixed;top:0;left:0;right:0;height:52px;z-index:100;display:flex;align-items:center;gap:14px;padding:0 18px;background:var(--panel);border-bottom:1px solid var(--rule);overflow-x:auto}
  .brand{display:flex;align-items:center;gap:9px;font-weight:700;white-space:nowrap}
  .brand .mk{color:var(--accent-soft);font-family:var(--head);font-size:1.1rem}
  .brand span{color:var(--accent)}
  .crumbs{display:flex;align-items:center;gap:8px;font-family:var(--mono);font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);white-space:nowrap}
  .crumbs a{color:var(--muted);cursor:pointer}.crumbs a:hover{color:var(--ink)}
  .crumbs b{color:var(--ink);font-weight:400}
  .sep{opacity:.5}
  .grow{flex:1}
  .search{display:flex;align-items:center;gap:8px;font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:8px;padding:6px 10px 6px 12px;cursor:pointer;white-space:nowrap}
  .search:hover{border-color:var(--accent);color:var(--ink)}
  .search .si{color:var(--accent-soft);font-size:.95rem}
  .search kbd{font-family:var(--mono);font-size:.6rem;background:var(--panel);border:1px solid var(--rule);border-radius:4px;padding:1px 5px;color:var(--faint)}
  .unsaved{font-family:var(--mono);font-size:.6rem;letter-spacing:.08em;color:var(--faint);display:flex;align-items:center;gap:6px;white-space:nowrap}
  .unsaved .u{width:7px;height:7px;border-radius:50%;background:var(--accent)}
  .abtn{font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:8px;padding:7px 13px;cursor:pointer;white-space:nowrap}
  .abtn:hover{border-color:var(--accent)}
  .abtn.on{border-color:var(--accent);color:var(--ink)}
  .abtn.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
</style>
