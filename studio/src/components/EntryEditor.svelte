<script>
  import { curProject, curEntry, openProject, openEntry, markDirty, toast, addFeatureSection, delSection, hideSection, restoreSection, moveSection } from '../lib/store.svelte.js';
  import { FEATURE_GROUPS } from '../lib/features.js';
  import { dismissable } from '../lib/dismissable.js';
  import { templateFor } from '../lib/templates.js';
  import { coverOf, backlinksFor, ensureEntryData, bodySectionsOf } from '../lib/model.js';
  import { suggestedSections } from '../lib/kinds.js';
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
  // media-toggle templates select their layout FORMAT per entry: Side reuses the
  // character `split` format, Top reuses the location/business `hero` (feature) format.
  const layout = $derived.by(() => {
    const base = tpl?.layout || 'infobox';
    if (tpl?.mediaToggle) return (entry?.mediaPos || 'side') === 'side' ? 'split' : 'hero';
    return base;
  });

  const others = $derived((project?.entries || []).filter(e => e.id !== entry?.id).map(e => ({ id: e.id, title: e.title, type: e.type, cover: coverOf(e) })));

  // existing group labels in this project, for the group autocomplete
  const groupOptions = $derived([...new Set((project?.entries || []).map(e => (e.group || '').trim()).filter(Boolean))].sort());

  // per-entry image placement (templates with mediaToggle) — defaults to the side rail
  const mediaSide = $derived((entry?.mediaPos || 'side') === 'side');
  function setMediaPos(p){ if (entry){ entry.mediaPos = p; markDirty(); } }

  const gallerySec = $derived(tpl?.sections.find(s => s.type === 'gallery') || null);
  const statsSec = $derived(tpl?.sections.find(s => s.type === 'stats') || null);
  // codex layout: the rail is every non-hidden aside-slot section (the composable infobox),
  // ordered by the per-entry asideOrder so widgets can be reordered
  const asideSecs = $derived.by(() => {
    if (!tpl || !entry) return [];
    const secs = tpl.sections.filter(s => s.slot === 'aside' && !(entry.hidden || []).includes(s.key));
    const ord = entry.asideOrder;
    if (!ord || !ord.length) return secs;
    const idx = k => { const i = ord.indexOf(k); return i === -1 ? Infinity : i; };
    return secs.slice().sort((a, b) => idx(a.key) - idx(b.key));
  });
  const hiddenAside = $derived(tpl && entry ? tpl.sections.filter(s => s.slot === 'aside' && (entry.hidden || []).includes(s.key)) : []);
  let railMenu = $state(false);
  function moveAside(key, dir){
    const cur = asideSecs.map(s => s.key); const i = cur.indexOf(key), j = i + dir;
    if (i < 0 || j < 0 || j >= cur.length) return;
    [cur[i], cur[j]] = [cur[j], cur[i]]; entry.asideOrder = cur; markDirty();
  }
  const bodySecs = $derived(entry ? bodySectionsOf(entry) : []);
  // sidebar features only get a real rail in `codex`; in other layouts they fall back into
  // the main column so nothing the user placed in the sidebar vanishes from the editor
  const orphanAside = $derived.by(() => {
    if (!tpl || !entry || layout === 'codex') return [];
    return tpl.sections.filter(s => s.slot === 'aside' && !(entry.hidden || []).includes(s.key) && s !== gallerySec && s !== statsSec);
  });
  // `band`-slot sections render full-width below the columns (codex); the rest are the article body
  const mainSecs = $derived([...bodySecs.filter(s => s.slot !== 'band'), ...orphanAside]);
  const bandSecs = $derived(bodySecs.filter(s => s.slot === 'band'));
  const hiddenSecs = $derived(tpl && entry?.hidden?.length ? tpl.sections.filter(s => s.slot !== 'aside' && !s.lead && entry.hidden.includes(s.key)) : []);
  // addable (currently-hidden template) sections, grouped by their zone for the add menu
  const addableGroups = $derived.by(() => {
    const groups = [], byZone = {};
    for (const s of hiddenSecs){ const z = s.zone || (s.slot === 'aside' ? 'Infobox blocks' : 'More sections'); if (!byZone[z]){ byZone[z] = []; groups.push(z); } byZone[z].push(s); }
    return groups.map(z => ({ zone: z, secs: byZone[z] }));
  });
  const backlinks = $derived(entry ? backlinksFor(entry, project) : []);
  // sections the current Kind suggests — highlighted in the Add menu (green in the mock)
  const suggested = $derived(entry ? suggestedSections(entry) : new Set());

  // add / remove custom sections (headings) on this entry — the full builder feature palette,
  // so any sheet (built-in or custom) can be enriched with any feature
  let secMenu = $state(false);
  function doAddFeature(feat){ addFeatureSection(entry, feat); secMenu = false; }

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
    {#if tpl.mediaToggle && gallerySec}
      <span class="mtoggle" title="where the image sits">
        <span class="mtl">Image</span>
        <button class:on={!mediaSide} onclick={() => setMediaPos('top')}>Top</button>
        <button class:on={mediaSide} onclick={() => setMediaPos('side')}>Side</button>
      </span>
    {/if}
    <button class="expbtn" onclick={exportSheet} disabled={exporting}>{exporting ? 'Exporting…' : 'Export ↓'}</button>
    <button class="pvbtn btn-primary" onclick={previewEntry}>Preview ↗</button>
  </div>

  {#key entry.id}
    <!-- section list: template sections + per-entry custom sections, then the add control -->
    {#snippet bodyList()}
      {#each mainSecs as sec, i (sec.key)}
        {#if sec.zone && sec.zone !== mainSecs[i - 1]?.zone}
          <div class="zonebar"><span class="zt">{sec.zone}</span><span class="zl"></span></div>
        {/if}
        {#if sec.lead}
          <Field {entry} {sec} {others} />
        {:else if sec.custom}
          <div class="csh">
            <input class="cshin" bind:value={sec.label} oninput={markDirty} placeholder="Heading…" />
            <div class="seccc">
              <button class="csmv" onclick={() => moveSection(entry, sec.key, -1)} title="move section up">▲</button>
              <button class="csmv" onclick={() => moveSection(entry, sec.key, 1)} title="move section down">▼</button>
              <button class="csx" onclick={() => delSection(entry, sec.key)} title="delete section">✕</button>
            </div>
          </div>
          <Field {entry} {sec} {others} />
        {:else}
          <div class="secwrap">
            <h2>{sec.label}</h2>
            <div class="seccc onhover">
              <button class="csmv" onclick={() => moveSection(entry, sec.key, -1)} title="move section up">▲</button>
              <button class="csmv" onclick={() => moveSection(entry, sec.key, 1)} title="move section down">▼</button>
              <button class="csx" onclick={() => hideSection(entry, sec)} title="remove section">✕</button>
            </div>
          </div>
          <Field {entry} {sec} {others} />
        {/if}
      {/each}
      <div class="addsec" use:dismissable={() => secMenu = false}>
        <button class="addsecbtn" onclick={() => secMenu = !secMenu}>＋ Add section</button>
        {#if secMenu}
          <div class="addmenu">
            {#if hiddenSecs.length}
              {#each addableGroups as g}
                <div class="addlabel">{g.zone}</div>
                {#each g.secs as s}
                  <button class="addopt" class:suggested={suggested.has(s.key)} onclick={() => { restoreSection(entry, s.key); secMenu = false; }}><span>{s.label}</span><small>{suggested.has(s.key) ? 'suggested' : 'section'}</small></button>
                {/each}
              {/each}
              <div class="addsep"></div>
            {/if}
            {#each FEATURE_GROUPS as g}
              <div class="addlabel">{g.group}</div>
              {#each g.features as feat}
                <button class="addopt" onclick={() => doAddFeature(feat)}><span>{feat.name}</span><small>{feat.desc}</small></button>
              {/each}
            {/each}
          </div>
        {/if}
      </div>
    {/snippet}

    <!-- ============ OUTLINE (plot) ============ -->
    {#if layout === 'outline'}
      <div class="wrap-narrow">
        {@render bodyList()}
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
          {@render bodyList()}
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

        {@render bodyList()}
      </div>

    <!-- ============ CODEX (species) — article + composable infobox rail ============ -->
    {:else if layout === 'codex'}
      <div class="wbody">
        <main class="article">
          <EntryTitle {entry} {tpl} />
          {@render bodyList()}
        </main>
        <aside class="infobox codexrail">
          {#each asideSecs as sec, i (sec.key)}
            <div class="railw">
              <div class="rwh"><span>{sec.label}</span>
                <span class="rwctl">
                  <button class="rwm" onclick={() => moveAside(sec.key, -1)} disabled={i === 0} title="move up">▲</button>
                  <button class="rwm" onclick={() => moveAside(sec.key, 1)} disabled={i === asideSecs.length - 1} title="move down">▼</button>
                  {#if sec.optional}<button class="rwx" onclick={() => hideSection(entry, sec)} title="remove from infobox">✕</button>{/if}
                </span>
              </div>
              <Field {entry} {sec} {others} />
            </div>
          {/each}
          {#if hiddenAside.length}
            <div class="railadd" use:dismissable={() => railMenu = false}>
              <button class="railaddbtn" onclick={() => railMenu = !railMenu}>＋ Add block</button>
              {#if railMenu}
                <div class="addmenu">
                  <div class="addlabel">Infobox blocks</div>
                  {#each hiddenAside as s}
                    <button class="addopt" class:suggested={suggested.has(s.key)} onclick={() => { restoreSection(entry, s.key); railMenu = false; }}><span>{s.label}</span><small>{suggested.has(s.key) ? 'suggested' : 'block'}</small></button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </aside>
      </div>
      {#if bandSecs.length}
        <div class="bands">
          {#each bandSecs as sec (sec.key)}
            <div class="secwrap"><h2>{sec.label}</h2>
              <div class="seccc onhover">
                <button class="csmv" onclick={() => moveSection(entry, sec.key, -1)} title="move up">▲</button>
                <button class="csmv" onclick={() => moveSection(entry, sec.key, 1)} title="move down">▼</button>
                <button class="csx" onclick={() => hideSection(entry, sec)} title="remove section">✕</button>
              </div>
            </div>
            <Field {entry} {sec} {others} />
          {/each}
        </div>
      {/if}

    <!-- ============ INFOBOX (lore) ============ -->
    {:else}
      <div class="wbody">
        <main class="article">
          {@render bodyList()}
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
  .mtoggle{display:inline-flex;align-items:center;gap:6px}
  .mtoggle .mtl{font-family:var(--mono);font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
  .mtoggle button{font:inherit;font-size:.68rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);padding:5px 10px;cursor:pointer;border-radius:0}
  .mtoggle button:first-of-type{border-radius:7px 0 0 7px}
  .mtoggle button:last-of-type{border-radius:0 7px 7px 0;border-left:none}
  .mtoggle button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
  .expbtn{font:inherit;font-size:.74rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer}
  .expbtn:hover{border-color:var(--accent)}
  .expbtn:disabled{opacity:.6;cursor:default}

  /* shared section heading + details label */
  h2{font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));font-weight:400;color:var(--ink);margin:20px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
  .blk-h{font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:4px 0 -4px}

  /* custom (user-added) section heading: editable, deletable */
  .csh{display:flex;align-items:center;gap:8px;margin:20px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--rule)}
  .cshin{flex:1;min-width:0;font-family:var(--head);font-size:calc(1.5rem*var(--hs,1));font-weight:400;color:var(--ink);background:none;border:none;outline:none;padding:0}
  .cshin::placeholder{color:var(--faint)}
  .csh:focus-within{border-bottom-color:var(--accent)}
  .csx{flex:none;border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 9px;font-size:.72rem;line-height:1}
  .csx:hover{background:var(--accent);color:#fff;border-color:var(--accent)}

  /* section controls: move up/down + delete. Cluster shows on hover for template
     sections, and is always visible on custom (editable-heading) sections. */
  .seccc{display:flex;align-items:center;gap:6px}
  .secwrap{position:relative}
  .secwrap .seccc{position:absolute;right:0;top:12px}
  .seccc.onhover{opacity:0;transition:opacity .12s}
  .secwrap:hover .seccc.onhover,.seccc.onhover:focus-within{opacity:1}
  .csmv{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:6px;cursor:pointer;padding:4px 7px;font-size:.6rem;line-height:1}
  .csmv:hover{border-color:var(--accent);color:var(--ink)}

  /* zone divider (research grouped zones) */
  .zonebar{display:flex;align-items:center;gap:12px;margin:28px 0 6px}
  .zonebar .zt{font-family:var(--mono);font-size:.62rem;letter-spacing:.2em;text-transform:uppercase;color:var(--accent-soft);white-space:nowrap}
  .zonebar .zl{flex:1;height:1px;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 50%,transparent),transparent)}

  /* add-section control */
  .addsec{position:relative;margin-top:16px}
  .addsep{height:1px;background:var(--rule);margin:5px 2px}
  .addlabel{font-family:var(--mono);font-size:.54rem;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);padding:4px 11px 2px}
  .addsecbtn{border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:9px 14px;cursor:pointer;font-family:var(--sans);font-size:.82rem}
  .addsecbtn:hover{border-color:var(--accent);color:var(--ink)}
  .addmenu{position:absolute;z-index:var(--z-dropdown);top:calc(100% + 6px);left:0;min-width:240px;max-height:min(64vh,520px);overflow:auto;background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:6px;box-shadow:0 18px 44px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:2px}
  .addopt{display:flex;flex-direction:column;gap:1px;text-align:left;background:none;border:none;border-radius:7px;padding:8px 11px;cursor:pointer;color:var(--ink)}
  .addopt:hover{background:var(--panel-2)}
  .addopt span{font-family:var(--sans);font-size:.84rem}
  .addopt small{font-family:var(--mono);font-size:.56rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
  .addopt.suggested span{color:var(--ok,#4aa579)}
  .addopt.suggested small{color:var(--ok,#4aa579)}

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
  /* codex rail widgets */
  .codexrail .railw{margin-bottom:16px}
  .codexrail .rwh{display:flex;align-items:center;justify-content:space-between;gap:8px;font-family:var(--mono);font-size:.58rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 7px;padding-bottom:5px;border-bottom:1px solid var(--line)}
  .codexrail .rwctl{display:flex;align-items:center;gap:4px;opacity:0;transition:opacity .12s}
  .codexrail .railw:hover .rwctl,.codexrail .rwctl:focus-within{opacity:1}
  .codexrail .rwm{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);border-radius:5px;cursor:pointer;padding:2px 5px;font-size:.5rem;line-height:1}
  .codexrail .rwm:hover:not(:disabled){border-color:var(--accent);color:var(--ink)}
  .codexrail .rwm:disabled{opacity:.35;cursor:default}
  .codexrail .rwx{border:1px solid var(--rule);background:var(--panel-2);color:var(--muted);cursor:pointer;font-size:.62rem;line-height:1;border-radius:5px;padding:2px 6px}
  .codexrail .rwx:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
  .codexrail .railadd{position:relative;margin-top:4px}
  .codexrail .railaddbtn{width:100%;border:1px dashed var(--rule);background:none;color:var(--muted);border-radius:8px;padding:8px;cursor:pointer;font-family:var(--sans);font-size:.78rem}
  .codexrail .railaddbtn:hover{border-color:var(--accent);color:var(--ink)}
  /* full-width bands (below the codex columns) */
  .bands{max-width:1140px;margin:8px auto 0;padding:0 26px;display:flex;flex-direction:column;gap:4px}
  @media(max-width:640px){ .bands{padding:0 14px} }

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
    /* single column: cap the portrait so it doesn't balloon to full-width (3:4 gets huge) */
    .wsplit .media{position:static;max-width:min(calc(300px * var(--ps,1)), 78vw);margin:0 auto}
    .wbody{grid-template-columns:1fr;gap:8px}
  }
  @media(max-width:640px){
    .charbar{padding:8px 12px;gap:8px}
    .wsplit{padding:20px 14px 70px}
    .whero{padding:20px 14px 70px}
    .wbody{padding:0 14px}
    .wrap-narrow{padding:20px 14px 70px}
    .backrefs{padding:8px 14px 70px}
  }
</style>
