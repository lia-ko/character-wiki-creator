<script>
  import { curProject, curEntry, openProject, openEntry, markDirty, toast } from '../lib/store.svelte.js';
  import { templateFor } from '../lib/templates.js';
  import { coverOf, backlinksFor, ensureEntryData } from '../lib/model.js';
  import { exportSingleEntry } from '../lib/exportentry.js';

  let exporting = $state(false);
  async function exportSheet(){
    if (exporting) return; exporting = true;
    try { await exportSingleEntry(entry, project); }
    catch (e) { toast('Export failed: ' + (e && e.message || e)); }
    exporting = false;
  }
  import { renderEntry, docShell } from '../lib/render.js';
  import { readerMaps, baseCtx } from '../lib/readerctx.js';

  function previewEntry(){
    const p = curProject();
    const ctx = baseCtx(p, readerMaps(p), { href: () => null, entry });
    const html = docShell({ title: entry.title || 'Entry', palette: p.palette, headFont: p.headFont, bodyFont: p.bodyFont, headScale: p.headScale, bodyScale: p.bodyScale, portraitScale: p.portraitScale, fontPrefix: location.origin + '/fonts/', bodyHTML: renderEntry(entry, ctx) });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 6000);
  }
  import Field from './fields/Field.svelte';
  import Gallery from './fields/Gallery.svelte';
  import Stats from './fields/Stats.svelte';
  import EntryTitle from './EntryTitle.svelte';

  const project = $derived(curProject());
  const entry = $derived(curEntry());
  const tpl = $derived(entry ? templateFor(entry.type) : null);
  const layout = $derived(tpl?.layout || 'infobox');

  const others = $derived((project?.entries || []).filter(e => e.id !== entry?.id).map(e => ({ id: e.id, title: e.title, type: e.type, cover: coverOf(e) })));

  // existing group labels in this project, for the group autocomplete
  const groupOptions = $derived([...new Set((project?.entries || []).map(e => (e.group || '').trim()).filter(Boolean))].sort());

  const gallerySec = $derived(tpl?.sections.find(s => s.type === 'gallery') || null);
  const statsSec = $derived(tpl?.sections.find(s => s.type === 'stats') || null);
  const bodySecs = $derived(tpl ? tpl.sections.filter(s => s.slot !== 'aside') : []);
  const backlinks = $derived(entry ? backlinksFor(entry, project) : []);

  // Backfill section keys added to the template after this entry was created (e.g. Soundtrack),
  // so their fields have a value to bind to. Silent — persists on the next real edit.
  $effect(() => { if (entry) ensureEntryData(entry); });
</script>

{#if entry && tpl}
  <div class="charbar">
    <button onclick={() => openProject(project.id)}>← {project.name || 'project'}</button>
    <span class="cbt">{entry.title || 'Untitled'}</span>
    <span class="badge">{tpl.label}</span>
    <label class="grp" title="organize this entry under a group">
      <span class="grpic">◱</span>
      <input class="grpin" list="entry-groups" bind:value={entry.group} oninput={markDirty} placeholder="group…" />
    </label>
    <datalist id="entry-groups">{#each groupOptions as g}<option value={g}></option>{/each}</datalist>
    <span class="grow"></span>
    <button class="expbtn" onclick={exportSheet} disabled={exporting}>{exporting ? 'Exporting…' : 'Export ↓'}</button>
    <button class="pvbtn btn-primary" onclick={previewEntry}>Preview ↗</button>
  </div>

  {#key entry.id}
    <!-- ============ OUTLINE (plot) ============ -->
    {#if layout === 'outline'}
      <div class="wrap-narrow">
        {#each bodySecs as sec (sec.key)}
          {#if sec.lead}<Field {entry} {sec} {others} />
          {:else}<h2>{sec.label}</h2><Field {entry} {sec} {others} />{/if}
        {/each}
      </div>

    <!-- ============ SPLIT (character, item) ============ -->
    {:else if layout === 'split'}
      <div class="wsplit">
        <div class="media">
          {#if gallerySec}<Gallery {entry} sec={gallerySec} variant="feature" mapStyle={tpl.mapStyle} aspect={layout === 'split' ? '3/4' : '16/10'} />{/if}
        </div>
        <div class="col">
          <EntryTitle {entry} {tpl} />
          {#if statsSec}<div class="blk-h">{statsSec.label}</div><Stats {entry} sec={statsSec} />{/if}
          {#each bodySecs as sec (sec.key)}
            {#if sec.lead}<Field {entry} {sec} {others} />
            {:else}<h2>{sec.label}</h2><Field {entry} {sec} {others} />{/if}
          {/each}
        </div>
      </div>

    <!-- ============ HERO (house, organization, realm, location, event) ============ -->
    {:else if layout === 'hero'}
      <div class="whero">
        {#if tpl.media === 'feature'}
          <EntryTitle {entry} {tpl} />
          {#if gallerySec}<Gallery {entry} sec={gallerySec} variant="feature" mapStyle={tpl.mapStyle} aspect={layout === 'split' ? '3/4' : '16/10'} />{/if}
        {:else if tpl.media === 'sigil'}
          <div class="herohead">
            {#if gallerySec}<Gallery {entry} sec={gallerySec} variant="sigil" />{/if}
            <EntryTitle {entry} {tpl} />
          </div>
        {:else}
          <EntryTitle {entry} {tpl} />
        {/if}

        {#if statsSec}<div class="blk-h">{statsSec.label}</div><Stats {entry} sec={statsSec} />{/if}
        {#if tpl.media === 'none' && gallerySec}<div class="blk-h">{gallerySec.label}</div><Gallery {entry} sec={gallerySec} variant="grid" />{/if}

        {#each bodySecs as sec (sec.key)}
          {#if sec.lead}<Field {entry} {sec} {others} />
          {:else}<h2>{sec.label}</h2><Field {entry} {sec} {others} />{/if}
        {/each}
      </div>

    <!-- ============ INFOBOX (lore) ============ -->
    {:else}
      <div class="wbody">
        <main class="article">
          {#each bodySecs as sec (sec.key)}
            {#if sec.lead}<Field {entry} {sec} {others} />
            {:else}<h2>{sec.label}</h2><Field {entry} {sec} {others} />{/if}
          {/each}
        </main>
        <aside class="infobox">
          <EntryTitle {entry} {tpl} center />
          {#if gallerySec}<div class="ib-h">{gallerySec.label}</div><Gallery {entry} sec={gallerySec} variant="grid" />{/if}
          {#if statsSec}<div class="ib-h">{statsSec.label}</div><Stats {entry} sec={statsSec} />{/if}
        </aside>
      </div>
    {/if}

    {#if backlinks.length}
      <div class="backrefs">
        <h2>Linked from</h2>
        <p class="brhint">Entries that link to this one — automatic, and read-only.</p>
        <div class="brlist">
          {#each backlinks as b (b.id + b.section + b.role)}
            <button class="brrow" onclick={() => openEntry(b.id)} title="open {b.title}">
              <span class="bric">{templateFor(b.type).icon}</span>
              <span class="brnm">{b.title || 'Untitled'}</span>
              <span class="brmeta">{[b.section, b.role].filter(Boolean).join(' · ')}</span>
              <span class="brgo">↗</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/key}
{/if}

<style>
  .charbar{position:sticky;top:var(--appbar-h);z-index:var(--z-sticky);display:flex;align-items:center;gap:12px;padding:10px 22px;border-bottom:1px solid var(--rule);background:var(--panel);flex-wrap:wrap}
  .charbar button{font:inherit;font-size:.74rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer}
  .charbar button:hover{border-color:var(--accent)}
  .cbt{font-family:var(--head);font-size:1.1rem;color:var(--ink)}
  .badge{font-family:var(--mono);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);border:1px solid var(--rule);border-radius:20px;padding:2px 9px}
  .grp{display:flex;align-items:center;gap:6px;border:1px solid var(--rule);border-radius:7px;padding:3px 9px;background:var(--panel-2)}
  .grp:focus-within{border-color:var(--accent)}
  .grpic{color:var(--accent-soft);font-size:.8rem;line-height:1}
  .grpin{font:inherit;font-size:.74rem;background:none;border:none;outline:none;color:var(--ink);width:9em;field-sizing:content;min-width:5em}
  .grpin::placeholder{color:var(--faint)}
  .grow{flex:1}
  .pvbtn{font:inherit;font-size:.74rem;border-radius:7px;padding:6px 13px}
  .expbtn{font:inherit;font-size:.74rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer}
  .expbtn:hover{border-color:var(--accent)}
  .expbtn:disabled{opacity:.6;cursor:default}

  /* shared section heading + details label */
  h2{font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));font-weight:400;color:var(--ink);margin:20px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
  .blk-h{font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:4px 0 -4px}

  /* outline (plot) */
  .wrap-narrow{max-width:760px;margin:0 auto;padding:28px 26px 90px;display:flex;flex-direction:column;gap:10px}

  /* split (character, item) */
  .wsplit{max-width:1160px;margin:0 auto;padding:28px 30px 90px;display:grid;grid-template-columns:minmax(180px,calc(340px * var(--ps,1))) 1fr;gap:36px;align-items:start}
  .wsplit .media{position:sticky;top:calc(var(--appbar-h) + 52px)}
  .wsplit .col{display:flex;flex-direction:column;gap:12px;min-width:0}

  /* hero (house, org, realm, location, event) */
  .whero{max-width:900px;margin:0 auto;padding:28px 26px 90px;display:flex;flex-direction:column;gap:14px}
  .herohead{display:flex;gap:18px;align-items:center}

  /* infobox (lore) */
  .wbody{display:grid;grid-template-columns:1fr 300px;max-width:1140px;margin:0 auto;gap:34px;padding:0 26px}
  .article{padding:26px 0;min-width:0;display:flex;flex-direction:column;gap:10px}
  .infobox{padding:26px 0;display:flex;flex-direction:column;gap:10px}
  .ib-h{font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:8px 0 -2px}

  /* backlinks ("Linked from") */
  .backrefs{max-width:900px;margin:8px auto 0;padding:8px 26px 90px}
  .backrefs h2{margin-bottom:4px}
  .brhint{color:var(--faint);font-size:.76rem;font-style:italic;margin:0 0 14px}
  .brlist{display:flex;flex-direction:column;gap:8px}
  .brrow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;font:inherit;background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:10px 14px;cursor:pointer;color:var(--ink)}
  .brrow:hover{border-color:var(--accent);transform:translateX(2px);transition:transform .1s,border-color .1s}
  .bric{color:var(--accent-soft);flex:none;width:1.2em;text-align:center}
  .brnm{font-family:var(--head);font-size:1.05rem}
  .brmeta{font-family:var(--mono);font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
  .brgo{margin-left:auto;color:var(--faint);flex:none}
  .brrow:hover .brgo{color:var(--accent)}

  @media(max-width:820px){
    .wsplit{grid-template-columns:1fr;gap:20px}
    .wsplit .media{position:static}
    .wbody{grid-template-columns:1fr;gap:8px}
  }
</style>
