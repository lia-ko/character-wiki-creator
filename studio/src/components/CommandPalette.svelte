<script>
  import { onMount } from 'svelte';
  import { app, openAnyEntry, openProject, closeSearch, toggleSearch } from '../lib/store.svelte.js';
  import { templateFor } from '../lib/templates.js';

  let query = $state('');
  let sel = $state(0);
  let inputEl;
  let rowEls = [];
  let prevOpen = false;

  // flat candidate list: every project + every entry across the workspace
  const candidates = $derived.by(() => {
    const list = [];
    for (const p of app.ws.projects){
      list.push({ kind: 'project', id: p.id, projectId: p.id, title: p.name || 'Untitled project', sub: (p.entries || []).length + ' entries', typeLabel: 'Project', icon: '▤', project: p.name || '', group: '' });
      for (const e of (p.entries || [])){
        const tpl = templateFor(e.type);
        list.push({ kind: 'entry', id: e.id, projectId: p.id, title: e.title || 'Untitled', sub: e.subtitle || '', typeLabel: tpl.label, icon: tpl.icon, project: p.name || '', group: e.group || '' });
      }
    }
    return list;
  });

  function fieldScore(text, q){
    if (!text) return 0;
    const t = String(text).toLowerCase();
    if (t === q) return 10;
    if (t.startsWith(q)) return 8;
    const i = t.indexOf(q);
    if (i === -1) return 0;
    if (t.indexOf(' ' + q) !== -1) return 6;        // matches at a word boundary
    return 4 - Math.min(i, 20) * 0.05;              // later matches rank lower
  }
  const scoreOf = (c, q) => Math.max(
    fieldScore(c.title, q) * 1.0,
    fieldScore(c.sub, q) * 0.7,
    fieldScore(c.typeLabel, q) * 0.6,
    fieldScore(c.group, q) * 0.6,
    fieldScore(c.project, q) * 0.5,
  );

  const results = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates.filter(c => c.kind === 'entry' && c.projectId === app.projectId).slice(0, 50);
    return candidates.map(c => ({ c, s: scoreOf(c, q) })).filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s).slice(0, 50).map(x => x.c);
  });

  // reset + focus on open; keep selection valid; scroll active row into view
  $effect(() => { const o = app.searchOpen; if (o && !prevOpen){ query = ''; sel = 0; } prevOpen = o; if (o && inputEl) inputEl.focus(); });
  $effect(() => { if (sel >= results.length) sel = Math.max(0, results.length - 1); });
  $effect(() => { const el = rowEls[sel]; if (app.searchOpen && el) el.scrollIntoView({ block: 'nearest' }); });

  function choose(c){ closeSearch(); if (!c) return; if (c.kind === 'entry') openAnyEntry(c.id); else openProject(c.id); }
  function onKey(e){
    if (e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(sel + 1, results.length - 1); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(sel - 1, 0); }
    else if (e.key === 'Enter'){ e.preventDefault(); choose(results[sel]); }
    else if (e.key === 'Escape'){ e.preventDefault(); closeSearch(); }
  }

  onMount(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')){ e.preventDefault(); toggleSearch(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
</script>

{#if app.searchOpen}
  <div class="cmdk">
    <button class="cmdk-back" onclick={closeSearch} aria-label="close search"></button>
    <div class="cmdk-panel" role="dialog" aria-modal="true">
      <div class="cmdk-in">
        <span class="cmdk-ic">⌕</span>
        <input bind:this={inputEl} bind:value={query} onkeydown={onKey} placeholder="Search entries and projects…" spellcheck="false" autocomplete="off" />
        <kbd>esc</kbd>
      </div>
      <div class="cmdk-res">
        {#if results.length}
          {#each results as c, i (c.kind + c.id)}
            <button class="cmdk-row" class:on={i === sel} bind:this={rowEls[i]} onclick={() => choose(c)} onmousemove={() => sel = i}>
              <span class="cmdk-ric">{c.icon}</span>
              <span class="cmdk-rmid">
                <span class="cmdk-rtitle">{c.title}</span>
                {#if c.sub}<span class="cmdk-rsub">{c.sub}</span>{/if}
              </span>
              <span class="cmdk-rtag">{c.typeLabel}{#if c.kind === 'entry' && c.project} · {c.project}{/if}</span>
            </button>
          {/each}
        {:else}
          <div class="cmdk-empty">No matches for “{query}”.</div>
        {/if}
      </div>
      <div class="cmdk-foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        <span class="cmdk-count">{query.trim() ? results.length + (results.length === 1 ? ' result' : ' results') : 'this project'}</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .cmdk{position:fixed;inset:0;z-index:200;display:flex;align-items:flex-start;justify-content:center;padding-top:12vh}
  .cmdk-back{position:absolute;inset:0;background:rgba(0,0,0,.55);border:none;cursor:default;backdrop-filter:blur(2px)}
  .cmdk-panel{position:relative;z-index:1;width:min(620px,92vw);max-height:70vh;display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--rule);border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.6);overflow:hidden}
  .cmdk-in{display:flex;align-items:center;gap:12px;padding:15px 18px;border-bottom:1px solid var(--rule)}
  .cmdk-ic{color:var(--accent-soft);font-size:1.1rem}
  .cmdk-in input{flex:1;font:inherit;font-size:1.05rem;background:none;border:none;outline:none;color:var(--ink)}
  .cmdk-in input::placeholder{color:var(--faint)}
  .cmdk-res{overflow-y:auto;padding:6px}
  .cmdk-row{display:flex;align-items:center;gap:13px;width:100%;text-align:left;font:inherit;background:none;border:none;border-radius:9px;padding:10px 12px;cursor:pointer;color:var(--ink)}
  .cmdk-row.on{background:var(--panel-2)}
  .cmdk-ric{color:var(--accent-soft);flex:none;width:1.3em;text-align:center;font-size:1rem}
  .cmdk-rmid{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
  .cmdk-rtitle{font-family:var(--head);font-size:1.05rem;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cmdk-rsub{font-size:.74rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cmdk-rtag{flex:none;font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);text-align:right;max-width:42%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .cmdk-row.on .cmdk-rtag{color:var(--accent-soft)}
  .cmdk-empty{padding:26px 16px;text-align:center;color:var(--faint);font-style:italic;font-size:.9rem}
  .cmdk-foot{display:flex;align-items:center;gap:16px;padding:9px 16px;border-top:1px solid var(--rule);font-family:var(--mono);font-size:.6rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
  .cmdk-count{margin-left:auto}
  kbd{font-family:var(--mono);font-size:.62rem;background:var(--panel-2);border:1px solid var(--rule);border-radius:5px;padding:2px 6px;color:var(--muted);margin:0 1px}
</style>
