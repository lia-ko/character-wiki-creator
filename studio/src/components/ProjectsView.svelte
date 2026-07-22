<script>
  import { app, openProject, addProject, deleteProject, markDirty, toast, undo, confirmModal,
    addSeries, moveProjectToSeries, deleteSeries } from '../lib/store.svelte.js';
  import { coverOf, booksInSeries } from '../lib/model.js';
  import { resolveImg } from '../lib/imagepool.js';
  import ThemeBar from './ThemeBar.svelte';
  import FontSample from './FontSample.svelte';

  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
  const heroCover = (p) => { for (const e of (p.entries || [])){ const c = coverOf(e); if (c) return c; } return ''; };
  const coverFor = (p) => resolveImg(p.cover) || heroCover(p);
  const nEntries = (p) => (p.entries || []).length;

  const standalone = $derived((app.ws.projects || []).filter(p => !p.seriesId));
  const resume = $derived(
    (app.ws.projects || []).find(p => p.id === app.ws.lastProjectId) || app.ws.projects?.[0] || null
  );
  const resumeSeries = $derived(resume?.seriesId ? (app.ws.series || []).find(s => s.id === resume.seriesId) : null);
  const resumeOrder = $derived(resumeSeries ? booksInSeries(app.ws, resumeSeries.id).findIndex(b => b.id === resume.id) + 1 : 0);

  async function del(e, id){
    e.stopPropagation();
    const proj = app.ws.projects.find(x => x.id === id);
    if (!(await confirmModal(`Delete project “${proj?.name || ''}” and all its entries?`))) return;
    deleteProject(id);
    toast(`Deleted project “${proj?.name || ''}”`, { actionLabel: 'Undo', action: undo });
  }
  async function delSeries(id){
    const s = app.ws.series.find(x => x.id === id);
    if (!(await confirmModal(`Delete the series “${s?.name || ''}”? Its books become standalone (they aren't deleted).`))) return;
    deleteSeries(id);
  }
  // collapse state lives on the series so it survives save/load, matching how ProjectView
  // persists its collapsed entry groups
  function toggleSeries(s){ s.collapsed = !s.collapsed; markDirty(); }
  function moveTo(e, id){ e.stopPropagation(); moveProjectToSeries(id, e.currentTarget.value); }
  function onKey(e, id){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openProject(id); } }
</script>

{#snippet card(p, order)}
  {@const cover = coverFor(p)}
  <div class="bcard" role="button" tabindex="0" aria-label={p.name || 'Untitled project'}
       onclick={() => openProject(p.id)} onkeydown={(e) => onKey(e, p.id)}>
    <div class="bctl">
      <select class="bmove" title="Move to…" value={p.seriesId || ''} onclick={(e) => e.stopPropagation()} onchange={(e) => moveTo(e, p.id)}>
        <option value="">Standalone</option>
        {#each app.ws.series as s (s.id)}<option value={s.id}>{s.name || 'Series'}</option>{/each}
      </select>
      <button class="kebab" title="Delete" onclick={(e) => del(e, p.id)}>✕</button>
    </div>
    <div class="cover" style={cover ? `background-image:url(${cover})` : ''}>
      {#if !cover}<span class="ini">{(p.name || '?').slice(0, 2)}</span>{/if}
      {#if order}<span class="ord">{ROMAN[order] || order}</span>{/if}
      <div class="ov">
        <div class="bt">{p.name || 'Project'}</div>
        <div class="bm">{[p.genre || '', `${nEntries(p)} ${nEntries(p) === 1 ? 'entry' : 'entries'}`].filter(Boolean).join(' · ')}</div>
      </div>
    </div>
  </div>
{/snippet}

<div class="wrap">
  <div class="whead">
    <div class="hleft">
      <div class="eyebrow">Workspace</div>
      <input class="htitle" bind:value={app.ws.title} oninput={markDirty} placeholder="World title" />
      <div class="count">{app.ws.projects.length} project{app.ws.projects.length === 1 ? '' : 's'}{app.ws.series.length ? ` · ${app.ws.series.length} series` : ''} · nothing leaves your machine</div>
    </div>
    <div class="hact">
      <ThemeBar target={app.ws} />
      <button class="nbtn" onclick={() => addSeries()}>＋ New series</button>
    </div>
  </div>

  <FontSample />

  {#if resume}
    {@const rc = coverFor(resume)}
    <button class="spot" onclick={() => openProject(resume.id)} aria-label={`Resume ${resume.name}`}>
      <div class="sbg" style={rc ? `background-image:url(${rc})` : ''}></div>
      <div class="sinner">
        <div class="skick">Continue{#if resumeSeries} · {resumeSeries.name}{/if}</div>
        <div class="stitle">{resume.name || 'Project'}</div>
        <div class="smeta">{[resumeOrder ? `Book ${ROMAN[resumeOrder] || resumeOrder}` : '', resume.genre || '', `${nEntries(resume)} ${nEntries(resume) === 1 ? 'entry' : 'entries'}`].filter(Boolean).join(' · ')}</div>
        <span class="sresume">Resume →</span>
      </div>
    </button>
  {/if}

  {#each app.ws.series as s (s.id)}
    {@const books = booksInSeries(app.ws, s.id)}
    <div class="shead">
      <button class="schev" onclick={() => toggleSeries(s)} aria-expanded={!s.collapsed}
        title={s.collapsed ? 'Expand series' : 'Collapse series'}>{s.collapsed ? '▸' : '▾'}</button>
      <input class="sname" bind:value={s.name} oninput={markDirty} placeholder="Series name" />
      <span class="scount">{books.length} book{books.length === 1 ? '' : 's'}</span>
      <span class="sact">
        <button class="sbtn" title="Add book" aria-label="Add book" onclick={() => addProject(s.id)}>＋</button>
        <button class="sbtn del" title="Delete series" aria-label="Delete series" onclick={() => delSeries(s.id)}>✕</button>
      </span>
    </div>
    {#if !s.collapsed}
      <div class="prow">
        {#each books as p, i (p.id)}{@render card(p, i + 1)}{/each}
      </div>
    {/if}
  {/each}

  {#if standalone.length || !app.ws.series.length}
    {#if app.ws.series.length}<div class="rowlabel">Standalone</div>{/if}
    <div class="prow">
      {#each standalone as p (p.id)}{@render card(p, 0)}{/each}
      <button class="addcard" onclick={() => addProject()}><span class="plus">＋</span><small>New project</small></button>
    </div>
  {/if}
</div>

<style>
  .wrap{max-width:1180px;margin:0 auto;padding:38px 26px 90px}
  @media(min-width:1700px){ .wrap{max-width:1460px} }
  @media(max-width:640px){ .wrap{padding:24px 14px 70px} }

  .whead{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--rule)}
  .eyebrow{font-family:var(--mono);font-size:.64rem;letter-spacing:.32em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
  .htitle{font-family:var(--head);font-weight:400;font-size:calc(clamp(2rem,5vw,3.2rem)*var(--hs,1));line-height:1;margin:0;color:var(--ink);background:none;border:none;outline:none;width:100%;max-width:640px}
  .htitle:focus{border-bottom:1px solid var(--rule)}
  .count{font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:11px}
  .hact{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
  .nbtn{font:inherit;font-size:.78rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:9px;padding:9px 14px;cursor:pointer;white-space:nowrap}
  .nbtn:hover{border-color:var(--accent)}

  /* ---- Spotlight resume hero ---- */
  .spot{position:relative;display:block;width:100%;text-align:left;border:1px solid var(--rule);border-radius:16px;overflow:hidden;cursor:pointer;padding:0;margin:14px 0 8px;box-shadow:0 18px 40px rgba(0,0,0,.4);transition:transform .12s,box-shadow .12s}
  .spot:hover{transform:translateY(-2px);box-shadow:0 24px 52px rgba(0,0,0,.52)}
  .spot .sbg{position:absolute;inset:0;background:var(--panel-2) center/cover}
  .spot::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,6,10,.9) 20%,rgba(8,6,10,.28) 62%,transparent),linear-gradient(180deg,transparent 42%,rgba(8,6,10,.8))}
  .sinner{position:relative;z-index:2;min-height:340px;display:flex;flex-direction:column;justify-content:flex-end;padding:40px 44px;max-width:580px}
  @media(max-width:640px){ .sinner{min-height:260px;padding:26px 24px} }
  .skick{font-family:var(--mono);font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent-soft)}
  .stitle{font-family:var(--head);font-size:calc(2.8rem*var(--hs,1));line-height:1;color:#fff;margin:12px 0 0}
  .smeta{font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:#d8cdd6;margin-top:13px}
  .sresume{margin-top:20px;display:inline-block;background:var(--accent);color:#fff;font-weight:600;border-radius:9px;padding:10px 18px;font-size:.85rem;width:max-content}

  /* ---- series + standalone rows ---- */
  .shead{display:flex;align-items:baseline;gap:12px;margin:34px 0 14px;padding-bottom:7px;border-bottom:1px solid var(--rule)}
  .sname{font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));color:var(--ink);background:none;border:none;outline:none;font-weight:400;min-width:0;flex:0 1 auto;field-sizing:content;max-width:60vw}
  .sname:focus{border-bottom:1px solid var(--rule)}
  .scount{font-family:var(--mono);font-size:.6rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .schev{align-self:center;background:none;border:none;cursor:pointer;color:var(--accent-soft);font-size:.7rem;
    line-height:1;padding:2px 0;width:1em;flex:none}
  .sact{margin-left:auto;display:flex;align-items:center;gap:6px;align-self:center}
  .sbtn{width:26px;height:26px;border-radius:7px;border:1px solid var(--rule);background:none;color:var(--faint);
    cursor:pointer;font-size:.8rem;line-height:1;display:flex;align-items:center;justify-content:center}
  .sbtn:hover{border-color:var(--accent);color:var(--ink)}
  .sbtn.del:hover{color:#fff;background:var(--accent)}
  .rowlabel{font-family:var(--mono);font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);margin:34px 0 14px}

  .prow{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px}
  @media(max-width:640px){ .prow{grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px} }

  /* ---- Cinematic card ---- */
  .bcard{position:relative;cursor:pointer;border-radius:12px;overflow:hidden;border:1px solid var(--rule);box-shadow:0 8px 22px rgba(0,0,0,.42);transition:transform .12s,box-shadow .12s,border-color .12s}
  .bcard:hover{transform:translateY(-4px);box-shadow:0 24px 50px rgba(0,0,0,.6);border-color:var(--accent)}
  .bcard:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  .cover{position:relative;aspect-ratio:2/3;background:var(--panel-2) center/cover;display:flex;align-items:center;justify-content:center}
  .cover::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 42%,rgba(6,5,8,.92))}
  .ini{font-family:var(--head);font-size:3rem;color:var(--line);text-transform:uppercase}
  .ord{position:absolute;top:10px;left:12px;z-index:2;font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;color:#fff;background:rgba(6,5,8,.55);border:1px solid rgba(255,255,255,.18);border-radius:5px;padding:2px 8px}
  .ov{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:34px 15px 15px}
  .bt{font-family:var(--head);font-size:calc(1.4rem*var(--hs,1));line-height:1.06;color:#fff}
  .bm{font-family:var(--mono);font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:#d8cdd6;margin-top:7px}
  .bctl{position:absolute;top:10px;right:10px;z-index:5;display:flex;gap:6px;opacity:0;transition:opacity .12s}
  .bcard:hover .bctl,.bcard:focus-within .bctl{opacity:1}
  .kebab{width:24px;height:24px;border-radius:7px;border:none;background:rgba(6,5,8,.6);color:#fff;cursor:pointer;font-size:.85rem;line-height:1}
  .kebab:hover{background:var(--accent)}
  .bmove{font:inherit;font-size:.62rem;max-width:110px;background:rgba(6,5,8,.7);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:7px;padding:3px 5px;cursor:pointer}

  .addcard{font:inherit;background:none;border:1px dashed var(--rule);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--muted);cursor:pointer;aspect-ratio:2/3}
  .addcard:hover{border-color:var(--accent);color:var(--ink);background:var(--line)}
  .plus{font-size:1.8rem;font-family:var(--head)}
  .addcard small{font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase}
</style>
