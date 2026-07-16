<script>
  import { app, curProject, curEntry, openProject, openEntry, markDirty, toast, addFeatureSection, delSection, hideSection, restoreSection, moveSection, moveSectionTo, stepEntry, orderedEntries, toggleNav } from '../lib/store.svelte.js';
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
  const gallerySec = $derived(tpl?.sections.find(s => s.type === 'gallery') || null);
  const statsSec = $derived(tpl?.sections.find(s => s.type === 'stats') || null);

  // ---- per-entry image placement (universal) ----
  // Any sheet with a gallery can move its image between a Top banner, a Side column, or the
  // details Rail — the position simply selects which rendering FORMAT to use: side→`split`,
  // top→`hero`, rail→`codex` (composable rail) or `infobox` (simple aside). Each sheet defaults
  // to its layout's native slot, so nothing changes until the reader picks a different position.
  // Plot (outline) keeps its own dedicated control below.
  const NATIVE_POS = { split: 'side', hero: 'top', codex: 'rail', infobox: 'rail' };
  const canPlace = $derived(!!gallerySec && tpl?.layout !== 'outline');
  // mediaToggle sheets (Research) historically defaulted to Side — preserve that so existing entries don't shift
  const nativePos = $derived(tpl?.mediaToggle ? 'side' : (NATIVE_POS[tpl?.layout] || 'rail'));
  const imgPos = $derived(canPlace ? (entry?.mediaPos || nativePos) : nativePos);
  function setMediaPos(p){ if (entry){ entry.mediaPos = p; markDirty(); } }
  const layout = $derived.by(() => {
    if (tpl?.layout === 'outline') return 'outline';
    // 'infobox' is retired — the composable rail (codex) supersedes it everywhere
    if (!canPlace) return tpl?.layout === 'infobox' ? 'codex' : (tpl?.layout || 'codex');
    if (imgPos === 'side') return 'split';
    if (imgPos === 'top') return 'hero';
    return 'codex';   // 'rail' → the composable rail for every sheet: heading + body left, widgets right
  });
  // a sheet shown as a Top banner uses a feature image, except sigil sheets (house/org) which
  // keep their emblem-beside-title treatment
  const heroMedia = $derived(tpl?.media === 'sigil' ? 'sigil' : 'feature');
  // outline templates (plot) support a 3-way image placement: top banner / side / right rail
  const mpos = $derived(entry?.mediaPos || 'top');

  const others = $derived((project?.entries || []).filter(e => e.id !== entry?.id).map(e => ({ id: e.id, title: e.title, type: e.type, cover: coverOf(e) })));

  // existing group labels in this project, for the group autocomplete
  const groupOptions = $derived([...new Set((project?.entries || []).map(e => (e.group || '').trim()).filter(Boolean))].sort());
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
  const navList = $derived(project ? orderedEntries(project) : []);
  const navIdx = $derived(navList.findIndex(e => e.id === entry?.id));

  // collapse sections + jump-to (long-sheet ergonomics) — ephemeral per entry
  let collapsed = $state(new Set());
  let lastEntryId = null;
  $effect(() => { if (entry && entry.id !== lastEntryId){ lastEntryId = entry.id; collapsed = new Set(); } });
  function toggleCollapse(k){ const c = new Set(collapsed); c.has(k) ? c.delete(k) : c.add(k); collapsed = c; }
  const jumpSecs = $derived([...mainSecs.filter(s => !s.lead), ...bandSecs]);
  let jumpMenu = $state(false);
  function collapseAll(){ collapsed = new Set(jumpSecs.map(s => s.key)); jumpMenu = false; }
  function expandAll(){ collapsed = new Set(); jumpMenu = false; }
  function jumpTo(k){ jumpMenu = false; if (collapsed.has(k)) toggleCollapse(k); requestAnimationFrame(() => document.getElementById('sec-' + k)?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
  // sections the current Kind suggests — highlighted in the Add menu (green in the mock)
  const suggested = $derived(entry ? suggestedSections(entry) : new Set());

  // drag-to-reorder body sections (mirrors the field-list Reorder; grip on each header).
  // A registry of key→header element lets us hit-test the nearest header while dragging.
  const secReg = new Map();
  function secRegister(el, key){ secReg.set(key, el); return { destroy(){ if (secReg.get(key) === el) secReg.delete(key); } }; }
  let secDragging = $state(false);
  let secFrom = null, secTarget = null;
  function secDown(e, key){
    e.preventDefault(); e.stopPropagation();
    secFrom = key; secTarget = null; secDragging = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.classList.add('ro-dragging');
  }
  function secMove(e){
    if (!secDragging) return;
    let best = null, bd = Infinity;
    for (const [k, el] of secReg){ const b = el.getBoundingClientRect(); const d = Math.abs((b.top + b.bottom) / 2 - e.clientY); if (d < bd){ bd = d; best = k; } }
    for (const [, el] of secReg) el.classList.remove('secdrop');
    secTarget = best && best !== secFrom ? best : null;
    if (secTarget) secReg.get(secTarget)?.classList.add('secdrop');
  }
  function secUp(){
    if (!secDragging) return;
    secDragging = false; document.body.classList.remove('ro-dragging');
    for (const [, el] of secReg) el.classList.remove('secdrop');
    if (secTarget && secTarget !== secFrom) moveSectionTo(entry, secFrom, secTarget);
    secFrom = null; secTarget = null;
  }

  // add / remove custom sections (headings) on this entry — the full builder feature palette,
  // so any sheet (built-in or custom) can be enriched with any feature
  let secMenu = $state(false);
  function doAddFeature(feat){ addFeatureSection(entry, feat); secMenu = false; }
  // filter the (now large) add menu — matches hidden template sections + palette features
  let secQuery = $state('');
  const secQ = $derived(secQuery.trim().toLowerCase());
  const filteredAddable = $derived(secQ ? addableGroups.map(g => ({ zone: g.zone, secs: g.secs.filter(s => (s.label || '').toLowerCase().includes(secQ)) })).filter(g => g.secs.length) : addableGroups);
  const filteredFeatures = $derived(secQ ? FEATURE_GROUPS.map(g => ({ ...g, features: g.features.filter(f => (f.name + ' ' + f.desc).toLowerCase().includes(secQ)) })).filter(g => g.features.length) : FEATURE_GROUPS);
  function focusOnMount(node){ node.focus(); }
  // add-menu organization: a left category rail + a right items pane (search falls back to flat)
  const hasSheetSecs = $derived(addableGroups.some(g => g.secs.length));
  let secCat = $state('');
  const activeGroup = $derived(FEATURE_GROUPS.find(g => g.group === secCat) || null);
  function openAddMenu(){ secQuery = ''; secMenu = !secMenu; if (secMenu) secCat = hasSheetSecs ? 'sheet' : (FEATURE_GROUPS[0]?.group || ''); }
  $effect(() => { if (!secMenu) secQuery = ''; });

  // Backfill section keys added to the template after this entry was created (e.g. Soundtrack),
  // so their fields have a value to bind to. Silent — persists on the next real edit.
  $effect(() => { if (entry) ensureEntryData(entry); });
</script>

{#if entry && tpl}
  <div class="charbar">
    {#if !app.navOpen}<button class="navtgl" onclick={toggleNav} title="show entries panel" aria-label="show entries">☰</button>{/if}
    <button onclick={() => openProject(project.id)}>← {project.name || 'project'}</button>
    <span class="stepper">
      <button onclick={() => stepEntry(-1)} disabled={navIdx <= 0} title="previous entry" aria-label="previous entry">‹</button>
      <button onclick={() => stepEntry(1)} disabled={navIdx < 0 || navIdx >= navList.length - 1} title="next entry" aria-label="next entry">›</button>
    </span>
    <span class="cbt">{entry.title || 'Untitled'}</span>
    <span class="badge">{tpl.label}</span>
    <label class="grp" title="organize this entry under a group">
      <span class="grpic">◱</span>
      <input class="grpin" list="entry-groups" bind:value={entry.group} oninput={markDirty} placeholder="group…" />
    </label>
    <datalist id="entry-groups">{#each groupOptions as g}<option value={g}></option>{/each}</datalist>
    <span class="grow"></span>
    {#if tpl.mediaPlace && gallerySec}
      <!-- plot (outline): its own top / side / rail control -->
      <span class="mtoggle" title="where the image sits">
        <span class="mtl">Image</span>
        <button class:on={mpos === 'top'} onclick={() => setMediaPos('top')}>Top</button>
        <button class:on={mpos === 'side'} onclick={() => setMediaPos('side')}>Side</button>
        <button class:on={mpos === 'rail'} onclick={() => setMediaPos('rail')}>Rail</button>
      </span>
    {:else if canPlace}
      <!-- universal image placement — every gallery sheet gets top / side / rail -->
      <span class="mtoggle" title="where the image sits">
        <span class="mtl">Image</span>
        <button class:on={imgPos === 'top'} onclick={() => setMediaPos('top')}>Top</button>
        <button class:on={imgPos === 'side'} onclick={() => setMediaPos('side')}>Side</button>
        <button class:on={imgPos === 'rail'} onclick={() => setMediaPos('rail')}>Rail</button>
      </span>
    {/if}
    {#if jumpSecs.length > 3}
      <div class="jumpwrap" use:dismissable={() => jumpMenu = false}>
        <button class="jumpbtn" onclick={() => jumpMenu = !jumpMenu} title="jump to a section" aria-expanded={jumpMenu}>☰ Sections</button>
        {#if jumpMenu}
          <div class="jumpmenu">
            <div class="jumphd"><button onclick={collapseAll}>Collapse all</button><button onclick={expandAll}>Expand all</button></div>
            {#each jumpSecs as s (s.key)}
              <button class="jumpitem" onclick={() => jumpTo(s.key)}>{#if collapsed.has(s.key)}<span class="jc">▸</span>{/if}{s.label}</button>
            {/each}
          </div>
        {/if}
      </div>
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
          <div class="csh" id="sec-{sec.key}" use:secRegister={sec.key}>
            <button class="secgrip" onpointerdown={(e) => secDown(e, sec.key)} onpointermove={secMove} onpointerup={secUp} onpointercancel={secUp} title="drag to reorder" aria-label="drag to reorder section" tabindex="-1">⠿</button>
            <button class="seccol" onclick={() => toggleCollapse(sec.key)} title={collapsed.has(sec.key) ? 'expand' : 'collapse'} aria-label="collapse section">{collapsed.has(sec.key) ? '▸' : '▾'}</button>
            <input class="cshin" bind:value={sec.label} oninput={markDirty} placeholder="Heading…" />
            <div class="seccc">
              <button class="csmv" onclick={() => moveSection(entry, sec.key, -1)} title="move section up">▲</button>
              <button class="csmv" onclick={() => moveSection(entry, sec.key, 1)} title="move section down">▼</button>
              <button class="csx" onclick={() => delSection(entry, sec.key)} title="delete section">✕</button>
            </div>
          </div>
          {#if !collapsed.has(sec.key)}<Field {entry} {sec} {others} />{/if}
        {:else}
          <div class="secwrap" id="sec-{sec.key}" use:secRegister={sec.key}>
            <button class="seccol" onclick={() => toggleCollapse(sec.key)} title={collapsed.has(sec.key) ? 'expand' : 'collapse'} aria-label="collapse section">{collapsed.has(sec.key) ? '▸' : '▾'}</button>
            <h2 class="sechd" onpointerdown={(e) => secDown(e, sec.key)} onpointermove={secMove} onpointerup={secUp} onpointercancel={secUp} title="drag to reorder"><span class="secgrip" aria-hidden="true">⠿</span>{sec.label}</h2>
            <div class="seccc onhover">
              <button class="csmv" onclick={() => moveSection(entry, sec.key, -1)} title="move section up">▲</button>
              <button class="csmv" onclick={() => moveSection(entry, sec.key, 1)} title="move section down">▼</button>
              <button class="csx" onclick={() => hideSection(entry, sec)} title="remove section">✕</button>
            </div>
          </div>
          {#if !collapsed.has(sec.key)}<Field {entry} {sec} {others} />{/if}
        {/if}
      {/each}
      <div class="addsec" use:dismissable={() => secMenu = false}>
        <button class="addsecbtn" onclick={openAddMenu}>＋ Add section</button>
        {#if secMenu}
          <div class="addmenu">
            <input class="addsearch" use:focusOnMount bind:value={secQuery} placeholder="Filter — timeline, radar, table…" spellcheck="false" />
            {#if secQ}
              <!-- text search: flat matches across sheet sections + every feature -->
              <div class="addflat">
                {#each filteredAddable as g}
                  <div class="addlabel">{g.zone}</div>
                  {#each g.secs as s}
                    <button class="addopt" class:suggested={suggested.has(s.key)} onclick={() => { restoreSection(entry, s.key); secMenu = false; }}><span>{s.label}</span><small>{suggested.has(s.key) ? 'suggested' : 'section'}</small></button>
                  {/each}
                {/each}
                {#each filteredFeatures as g}
                  <div class="addlabel">{g.group}</div>
                  {#each g.features as feat}
                    <button class="addopt" onclick={() => doAddFeature(feat)}><span>{feat.name}</span><small>{feat.desc}</small></button>
                  {/each}
                {/each}
                {#if !filteredAddable.length && !filteredFeatures.length}<div class="addnone">No features match “{secQuery}”.</div>{/if}
              </div>
            {:else}
              <!-- browse: category rail on the left, items on the right -->
              <div class="addpanes">
                <div class="addcats">
                  {#if hasSheetSecs}<button class:on={secCat === 'sheet'} onclick={() => secCat = 'sheet'}><span class="cico sug">✦</span>On this sheet</button>{/if}
                  {#each FEATURE_GROUPS as g}
                    <button class:on={secCat === g.group} onclick={() => secCat = g.group}><span class="cico" style="color:{g.color}">{g.icon}</span>{g.group}</button>
                  {/each}
                </div>
                <div class="addpane">
                  {#if secCat === 'sheet'}
                    {#each addableGroups as g}
                      <div class="addlabel">{g.zone}</div>
                      {#each g.secs as s}
                        <button class="addopt" class:suggested={suggested.has(s.key)} onclick={() => { restoreSection(entry, s.key); secMenu = false; }}><span>{s.label}</span><small>{suggested.has(s.key) ? 'suggested' : 'section'}</small></button>
                      {/each}
                    {/each}
                  {:else if activeGroup}
                    {#each activeGroup.features as feat}
                      <button class="addopt" onclick={() => doAddFeature(feat)}><span>{feat.name}</span><small>{feat.desc}</small></button>
                    {/each}
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/snippet}

    <!-- ============ OUTLINE (plot) ============ -->
    {#if layout === 'outline'}
      {#if tpl.mediaPlace && gallerySec && mpos === 'side'}
        <div class="wsplit">
          <div class="media"><Gallery {entry} sec={gallerySec} variant="feature" aspect="3/4" /></div>
          <div class="col">
            <EntryTitle {entry} {tpl} />
            {@render bodyList()}
          </div>
        </div>
      {:else if tpl.mediaPlace && gallerySec && mpos === 'rail'}
        <div class="wbody">
          <main class="article">
            <EntryTitle {entry} {tpl} />
            {@render bodyList()}
          </main>
          <aside class="infobox"><Gallery {entry} sec={gallerySec} variant="feature" aspect="3/4" /></aside>
        </div>
      {:else}
        <div class="wrap-narrow">
          {#if tpl.mediaPlace && gallerySec}<Gallery {entry} sec={gallerySec} variant="feature" aspect="16/9" />{/if}
          <EntryTitle {entry} {tpl} />
          {@render bodyList()}
        </div>
      {/if}

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
        {#if heroMedia === 'sigil'}
          <div class="herohead">
            {#if gallerySec}<Gallery {entry} sec={gallerySec} variant="sigil" />{/if}
            <EntryTitle {entry} {tpl} />
          </div>
        {:else}
          <EntryTitle {entry} {tpl} />
          {#if gallerySec}<Gallery {entry} sec={gallerySec} variant="feature" mapStyle={tpl.mapStyle} aspect="16/10" />{/if}
        {/if}

        {#if statsSec}<div class="blk-h">{statsSec.label}</div><Stats {entry} sec={statsSec} />{/if}

        {@render bodyList()}
      </div>

    <!-- ============ RAIL / CODEX — article + composable sidebar (also the catch-all) ============ -->
    {:else}
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
            <div class="secwrap" id="sec-{sec.key}">
              <button class="seccol" onclick={() => toggleCollapse(sec.key)} title={collapsed.has(sec.key) ? 'expand' : 'collapse'} aria-label="collapse section">{collapsed.has(sec.key) ? '▸' : '▾'}</button>
              <h2>{sec.label}</h2>
              <div class="seccc onhover">
                <button class="csmv" onclick={() => moveSection(entry, sec.key, -1)} title="move up">▲</button>
                <button class="csmv" onclick={() => moveSection(entry, sec.key, 1)} title="move down">▼</button>
                <button class="csx" onclick={() => hideSection(entry, sec)} title="remove section">✕</button>
              </div>
            </div>
            {#if !collapsed.has(sec.key)}<Field {entry} {sec} {others} />{/if}
          {/each}
        </div>
      {/if}
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
  .navtgl{padding:6px 9px !important;font-size:.9rem !important;line-height:1}
  .stepper{display:inline-flex;margin-left:-4px}
  .stepper button{padding:6px 9px;font-size:.9rem;line-height:1;border-radius:0}
  .stepper button:first-child{border-radius:7px 0 0 7px}
  .stepper button:last-child{border-radius:0 7px 7px 0;border-left:none}
  .stepper button:disabled{opacity:.35;cursor:default;border-color:var(--rule)}
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
  .mtoggle button:last-of-type{border-radius:0 7px 7px 0}
  .mtoggle button:not(:first-of-type){border-left:none}
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
  /* collapse chevron + jump-to (long-sheet ergonomics) */
  .seccol{border:none;background:none;color:var(--faint);cursor:pointer;font-size:.72rem;line-height:1;padding:3px;border-radius:4px;flex:0 0 auto}
  .seccol:hover{color:var(--ink);background:var(--panel-2)}
  .secwrap>.seccol{position:absolute;left:-24px;top:19px}
  /* drag-to-reorder: the heading itself is the drag handle (template sections);
     custom-heading sections use the inline grip button before the input */
  .sechd{cursor:grab}
  .sechd:active{cursor:grabbing}
  .secgrip{color:var(--faint);font-size:.72em;letter-spacing:-2px;margin-right:9px;opacity:0;transition:opacity .12s;vertical-align:middle}
  .secwrap:hover .sechd .secgrip{opacity:.85}
  .sechd:active .secgrip{color:var(--accent);opacity:1}
  button.secgrip{border:none;background:none;color:var(--faint);cursor:grab;font-size:.8rem;line-height:1;padding:3px 2px;margin:0;border-radius:4px;letter-spacing:-2px;touch-action:none;flex:0 0 auto;opacity:1}
  button.secgrip:hover{color:var(--muted)}
  button.secgrip:active{cursor:grabbing;color:var(--accent)}
  .secdrop{position:relative}
  .secdrop::after{content:'';position:absolute;left:0;right:0;top:-6px;height:2px;background:var(--accent);border-radius:2px;box-shadow:0 0 6px var(--accent);pointer-events:none}
  .secwrap,.csh{scroll-margin-top:calc(var(--appbar-h) + 64px)}
  .jumpwrap{position:relative}
  .jumpbtn{font:inherit;font-size:.74rem;background:var(--panel-2);color:var(--ink);border:1px solid var(--rule);border-radius:7px;padding:6px 11px;cursor:pointer}
  .jumpbtn:hover{border-color:var(--accent)}
  .jumpmenu{position:absolute;z-index:var(--z-dropdown);top:calc(100% + 6px);right:0;min-width:220px;max-height:min(60vh,460px);overflow:auto;background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:6px;box-shadow:0 18px 44px rgba(0,0,0,.35)}
  .jumphd{display:flex;gap:6px;padding:2px 2px 6px;border-bottom:1px solid var(--rule);margin-bottom:4px}
  .jumphd button{flex:1;font:inherit;font-size:.7rem;background:var(--panel-2);color:var(--muted);border:1px solid var(--rule);border-radius:6px;padding:5px;cursor:pointer}
  .jumphd button:hover{border-color:var(--accent);color:var(--ink)}
  .jumpitem{display:flex;align-items:center;gap:6px;width:100%;text-align:left;font:inherit;font-size:.82rem;color:var(--muted);background:none;border:none;border-radius:6px;padding:6px 9px;cursor:pointer}
  .jumpitem:hover{background:var(--panel-2);color:var(--ink)}
  .jumpitem .jc{color:var(--faint);font-size:.6rem}

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
  .addmenu{position:absolute;z-index:var(--z-dropdown);top:calc(100% + 6px);left:0;width:460px;max-width:92vw;max-height:min(70vh,540px);overflow:hidden;background:var(--panel);border:1px solid var(--rule);border-radius:10px;box-shadow:0 18px 44px rgba(0,0,0,.35);display:flex;flex-direction:column}
  .addsearch{flex:none;padding:10px 12px;background:var(--panel);border:none;border-bottom:1px solid var(--rule);color:var(--ink);font:inherit;font-size:.84rem;outline:none}
  .addsearch::placeholder{color:var(--faint)}
  .addflat{flex:1;min-height:0;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:2px}
  .addpanes{display:flex;flex:1;min-height:0}
  .addcats{flex:none;width:150px;border-right:1px solid var(--rule);padding:6px;display:flex;flex-direction:column;gap:1px;overflow:auto}
  .addcats button{display:flex;align-items:center;gap:9px;text-align:left;font:inherit;font-size:.77rem;color:var(--muted);background:none;border:none;border-radius:6px;padding:6px 9px;cursor:pointer;white-space:nowrap}
  .addcats button:hover{background:var(--panel-2);color:var(--ink)}
  .addcats button.on{background:var(--panel-2);color:var(--ink);box-shadow:inset 2px 0 var(--accent)}
  .cico{width:16px;flex:none;text-align:center;font-size:.9rem;line-height:1;color:var(--faint)}
  .cico.sug{color:var(--ok,#4aa579)}
  .addpane{flex:1;min-width:0;overflow:auto;padding:6px;display:flex;flex-direction:column;gap:2px}
  .addnone{padding:10px 11px;color:var(--faint);font-size:.82rem}
  .addopt{display:flex;flex-direction:column;gap:1px;text-align:left;background:none;border:none;border-radius:7px;padding:8px 11px;cursor:pointer;color:var(--ink)}
  .addopt:hover{background:var(--panel-2)}
  .addopt span{font-family:var(--sans);font-size:.84rem}
  .addopt small{font-family:var(--mono);font-size:.56rem;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
  .addopt.suggested span{color:var(--ok,#4aa579)}
  .addopt.suggested small{color:var(--ok,#4aa579)}

  /* outline (plot) */
  .wrap-narrow{max-width:calc(760px * var(--cw,1));margin:0 auto;padding:28px 26px 90px;display:flex;flex-direction:column;gap:10px}

  /* split (character, item) */
  .wsplit{max-width:calc(1160px * var(--cw,1));margin:0 auto;padding:28px 30px 90px;display:grid;grid-template-columns:minmax(180px,calc(340px * var(--ps,1))) 1fr;gap:36px;align-items:start}
  .wsplit .media{position:sticky;top:calc(var(--appbar-h) + 52px)}
  .wsplit .col{display:flex;flex-direction:column;gap:12px;min-width:0}

  /* hero (house, org, realm, location, event) */
  .whero{max-width:calc(900px * var(--cw,1));margin:0 auto;padding:28px 26px 90px;display:flex;flex-direction:column;gap:14px}
  .herohead{display:flex;gap:18px;align-items:center}

  /* infobox (lore) */
  .wbody{display:grid;grid-template-columns:1fr 300px;max-width:calc(1140px * var(--cw,1));margin:0 auto;gap:34px;padding:0 26px}
  .article{padding:26px 0;min-width:0;display:flex;flex-direction:column;gap:10px}
  .infobox{padding:26px 0;display:flex;flex-direction:column;gap:10px}
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
  .bands{max-width:calc(1140px * var(--cw,1));margin:8px auto 0;padding:0 26px;display:flex;flex-direction:column;gap:4px}
  @media(max-width:640px){ .bands{padding:0 14px} }

  /* backlinks ("Linked from") */
  .backrefs{max-width:calc(900px * var(--cw,1));margin:8px auto 0;padding:8px 26px 90px}
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
