<script>
  import { curProject, curEntry, openProject, markDirty } from '../lib/store.svelte.js';
  import { templateFor } from '../lib/templates.js';
  import { coverOf } from '../lib/model.js';
  import { renderEntry, docShell } from '../lib/render.js';
  import { projectEvents } from '../lib/build.js';

  function previewEntry(){
    const p = curProject();
    const coverMap = {}; p.entries.forEach(e => coverMap[e.id] = coverOf(e));
    const ctx = { href: () => null, cover: (id) => coverMap[id] || null, events: projectEvents(p), hubHref: null, crumb: p.name };
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

  const gallerySec = $derived(tpl?.sections.find(s => s.type === 'gallery') || null);
  const statsSec = $derived(tpl?.sections.find(s => s.type === 'stats') || null);
  const bodySecs = $derived(tpl ? tpl.sections.filter(s => s.slot !== 'aside') : []);
</script>

{#if entry && tpl}
  <div class="charbar">
    <button onclick={() => openProject(project.id)}>← {project.name || 'project'}</button>
    <span class="cbt">{entry.title || 'Untitled'}</span>
    <span class="badge">{tpl.label}</span>
    <span class="grow"></span>
    <button class="pvbtn" onclick={previewEntry}>Preview ↗</button>
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
  {/key}
{/if}

<style>
  .charbar{display:flex;align-items:center;gap:12px;padding:10px 22px;border-bottom:1px solid var(--rule);background:var(--panel);flex-wrap:wrap}
  .charbar button{font:inherit;font-size:.74rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer}
  .charbar button:hover{border-color:var(--accent)}
  .cbt{font-family:var(--head);font-size:1.1rem;color:var(--ink)}
  .badge{font-family:var(--mono);font-size:.54rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-soft);border:1px solid var(--rule);border-radius:20px;padding:2px 9px}
  .grow{flex:1}
  .pvbtn{font:inherit;font-size:.74rem;background:var(--accent);color:#fff;border:none;border-radius:7px;padding:6px 13px;cursor:pointer;font-weight:600}
  .pvbtn:hover{opacity:.92}

  /* shared section heading + details label */
  h2{font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));font-weight:400;color:var(--ink);margin:20px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
  .blk-h{font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:4px 0 -4px}

  /* outline (plot) */
  .wrap-narrow{max-width:760px;margin:0 auto;padding:28px 26px 90px;display:flex;flex-direction:column;gap:10px}

  /* split (character, item) */
  .wsplit{max-width:1160px;margin:0 auto;padding:28px 30px 90px;display:grid;grid-template-columns:minmax(180px,calc(340px * var(--ps,1))) 1fr;gap:36px;align-items:start}
  .wsplit .media{position:sticky;top:64px}
  .wsplit .col{display:flex;flex-direction:column;gap:12px;min-width:0}

  /* hero (house, org, realm, location, event) */
  .whero{max-width:900px;margin:0 auto;padding:28px 26px 90px;display:flex;flex-direction:column;gap:14px}
  .herohead{display:flex;gap:18px;align-items:center}

  /* infobox (lore) */
  .wbody{display:grid;grid-template-columns:1fr 300px;max-width:1140px;margin:0 auto;gap:34px;padding:0 26px}
  .article{padding:26px 0;min-width:0;display:flex;flex-direction:column;gap:10px}
  .infobox{padding:26px 0;display:flex;flex-direction:column;gap:10px}
  .ib-h{font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:8px 0 -2px}

  @media(max-width:820px){
    .wsplit{grid-template-columns:1fr;gap:20px}
    .wsplit .media{position:static}
    .wbody{grid-template-columns:1fr;gap:8px}
  }
</style>
