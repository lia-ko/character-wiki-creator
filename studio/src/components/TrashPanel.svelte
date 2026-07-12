<script>
  import { app, closeTrash, restoreTrash, deleteForever, emptyTrash, trashKind } from '../lib/store.svelte.js';
  import { templateFor } from '../lib/templates.js';
  const trash = $derived(app.ws.trash || []);
  const iconOf = (t) => trashKind(t) === 'project' ? '▤' : templateFor(t.entry.type).icon;
  const nameOf = (t) => trashKind(t) === 'project' ? (t.project.name || 'Untitled project') : (t.entry.title || 'Untitled');
  const metaOf = (t) => trashKind(t) === 'project'
    ? `Project · ${(t.project.entries || []).length} entries · ${ago(t.at)}`
    : `${templateFor(t.entry.type).label} · ${t.projectName || 'project'} · ${ago(t.at)}`;
  function ago(ts){
    if (!ts) return '';
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  }
</script>

{#if app.trashOpen}
  <div class="tk">
    <button class="tkback" onclick={closeTrash} aria-label="close trash"></button>
    <div class="tkpanel" role="dialog" aria-modal="true">
      <div class="tkhead">
        <div>
          <h2>Trash</h2>
          <div class="tksub">{trash.length} deleted {trash.length === 1 ? 'item' : 'items'} · restorable</div>
        </div>
        <span class="grow"></span>
        {#if trash.length}<button class="tkempty" onclick={emptyTrash}>Empty trash</button>{/if}
        <button class="tkx" onclick={closeTrash} aria-label="close">✕</button>
      </div>
      <div class="tklist">
        {#if trash.length}
          {#each trash as t, i (i)}
            <div class="tkrow">
              <span class="tkic">{iconOf(t)}</span>
              <div class="tkmid">
                <div class="tknm">{nameOf(t)}</div>
                <div class="tkmeta">{metaOf(t)}</div>
              </div>
              <button class="tkrestore" onclick={() => restoreTrash(i)}>Restore</button>
              <button class="tkdel" onclick={() => deleteForever(i)} title="delete forever">✕</button>
            </div>
          {/each}
        {:else}
          <div class="tkzero">Nothing here. Deleted entries land in the trash and can be restored.</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .tk{position:fixed;inset:0;z-index:210;display:flex;align-items:flex-start;justify-content:center;padding-top:10vh}
  .tkback{position:absolute;inset:0;background:rgba(0,0,0,.55);border:none;cursor:default;backdrop-filter:blur(2px)}
  .tkpanel{position:relative;z-index:1;width:min(560px,92vw);max-height:74vh;display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--rule);border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}
  .tkhead{display:flex;align-items:center;gap:12px;padding:16px 18px;border-bottom:1px solid var(--rule)}
  .tkhead h2{font-family:var(--head);font-weight:400;font-size:1.4rem;color:var(--ink);margin:0}
  .tksub{font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-top:4px}
  .grow{flex:1}
  .tkempty{font:inherit;font-size:.74rem;background:none;color:var(--muted);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer}
  .tkempty:hover{border-color:var(--accent);color:var(--ink)}
  .tkx{background:none;border:none;color:var(--faint);font-size:1rem;cursor:pointer;padding:4px 6px}
  .tkx:hover{color:var(--ink)}
  .tklist{overflow-y:auto;padding:8px}
  .tkrow{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px}
  .tkrow:hover{background:var(--panel-2)}
  .tkic{color:var(--accent-soft);width:1.3em;text-align:center;flex:none}
  .tkmid{flex:1;min-width:0}
  .tknm{font-family:var(--head);font-size:1.05rem;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tkmeta{font-family:var(--mono);font-size:.56rem;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin-top:3px}
  .tkrestore{font:inherit;font-size:.76rem;font-weight:600;background:var(--accent);color:#fff;border:none;border-radius:7px;padding:6px 13px;cursor:pointer;flex:none}
  .tkrestore:hover{opacity:.92}
  .tkdel{background:none;border:none;color:var(--faint);cursor:pointer;font-size:.85rem;padding:4px 7px;border-radius:6px;flex:none}
  .tkdel:hover{color:#fff;background:var(--accent)}
  .tkzero{padding:34px 20px;text-align:center;color:var(--faint);font-style:italic;font-size:.9rem}
</style>
