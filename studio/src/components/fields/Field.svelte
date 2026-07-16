<script module>
  const warned = new Set();   // field types already dev-warned about, so the guard fires once each
</script>

<script>
  import { markDirty } from '../../lib/store.svelte.js';
  import RichEditor from './RichEditor.svelte';
  import Stats from './Stats.svelte';
  import Gallery from './Gallery.svelte';
  import RichSections from './RichSections.svelte';
  import Relations from './Relations.svelte';
  import Catalog from './Catalog.svelte';
  import Meter from './Meter.svelte';
  import Kind from './Kind.svelte';
  import Gauges from './Gauges.svelte';
  import Arc from './Arc.svelte';
  import Rulelist from './Rulelist.svelte';
  import Dyad from './Dyad.svelte';
  import Suspects from './Suspects.svelte';
  import Clues from './Clues.svelte';
  import Crew from './Crew.svelte';
  import Dialectic from './Dialectic.svelte';
  import Table from './Table.svelte';
  import Embed from './Embed.svelte';
  import Matrix from './Matrix.svelte';
  import Statchart from './Statchart.svelte';
  import Orgchart from './Orgchart.svelte';
  import Ledger from './Ledger.svelte';
  import References from './References.svelte';
  import SourceNotes from './SourceNotes.svelte';
  import DefList from './DefList.svelte';
  import Lexicon from './Lexicon.svelte';
  import Chronology from './Chronology.svelte';
  import TagGroups from './TagGroups.svelte';
  import Excerpts from './Excerpts.svelte';
  import Outline from './Outline.svelte';
  import Lineage from './Lineage.svelte';
  import FamilyTree from './FamilyTree.svelte';
  import History from './History.svelte';
  import Ties from './Ties.svelte';
  import AllegianceWeb from './AllegianceWeb.svelte';
  import EventTimeline from './EventTimeline.svelte';
  import Timeline from './Timeline.svelte';
  import Spotify from './Spotify.svelte';
  import AbilityScores from './AbilityScores.svelte';
  import RollTable from './RollTable.svelte';
  import Checklist from './Checklist.svelte';
  import Clocks from './Clocks.svelte';
  import NpcRoster from './NpcRoster.svelte';
  import Twists from './Twists.svelte';

  // Edit-widget registry: field type → its editor component. Every widget here takes the
  // uniform ({entry, sec, others}) prop shape (components ignore props they don't declare),
  // so adding a field type's editor = one import + one line below. The few widgets that need
  // a different prop shape (richline, gallery, spotify) are handled as explicit cases in the
  // markup instead of going through this map.
  const COMPONENTS = {
    stats: Stats, richsections: RichSections, relations: Relations, catalog: Catalog,
    meter: Meter, kind: Kind, gauges: Gauges, arc: Arc, rulelist: Rulelist, dyad: Dyad,
    suspects: Suspects, clues: Clues, crew: Crew, dialectic: Dialectic, table: Table,
    embed: Embed, matrix: Matrix, statchart: Statchart, orgchart: Orgchart, ledger: Ledger,
    references: References, sourcenotes: SourceNotes, deflist: DefList, lexicon: Lexicon,
    chronology: Chronology, taggroups: TagGroups, excerpts: Excerpts, outline: Outline,
    lineage: Lineage, familytree: FamilyTree, history: History, ties: Ties,
    allegianceweb: AllegianceWeb, eventtimeline: EventTimeline, timeline: Timeline,
    abilityscores: AbilityScores, rolltable: RollTable, checklist: Checklist,
    clocks: Clocks, npcroster: NpcRoster, twists: Twists,
  };

  const SPECIAL = ['richline', 'gallery', 'spotify'];   // handled explicitly below, not via the map

  let { entry, sec, others } = $props();
  function setRichline(v){ entry.data[sec.key] = v; markDirty(); }
  const Cmp = $derived(COMPONENTS[sec.type] || null);

  // Dev-only drift guard: a field type that renders here with no editor (and isn't a SPECIAL
  // case) means this map fell out of sync — e.g. a type was wired into render.js/emptyValue but
  // its editor was never added. Warn once per type so the omission is loud instead of a blank field.
  $effect(() => {
    if (import.meta.env.DEV && !Cmp && !SPECIAL.includes(sec.type) && !warned.has(sec.type)){
      warned.add(sec.type);
      console.warn(`[Field] no editor component registered for field type "${sec.type}"`);
    }
  });
</script>

<!-- special prop shapes: richline (lead wrapper), gallery (variant/aspect), spotify (items) -->
{#if sec.type === 'richline'}
  <div class="lead"><RichEditor value={entry.data[sec.key]} multiline placeholder={sec.label + '… (⌘B / ⌘I)'} oninput={setRichline} /></div>
{:else if sec.type === 'gallery'}
  <Gallery {entry} {sec} variant="feature" aspect="16/10" />
{:else if sec.type === 'spotify'}
  <Spotify items={entry.data[sec.key]} />
{:else if Cmp}
  <Cmp {entry} {sec} {others} />
{/if}

<style>
  .lead{border-left:3px solid var(--accent);padding-left:16px}
</style>
