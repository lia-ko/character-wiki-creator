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

  let { entry, sec, others } = $props();
  function setRichline(v){ entry.data[sec.key] = v; markDirty(); }
</script>

{#if sec.type === 'richline'}
  <div class="lead"><RichEditor value={entry.data[sec.key]} multiline placeholder={sec.label + '… (⌘B / ⌘I)'} oninput={setRichline} /></div>
{:else if sec.type === 'stats'}
  <Stats {entry} {sec} />
{:else if sec.type === 'gallery'}
  <Gallery {entry} {sec} variant="feature" aspect="16/10" />
{:else if sec.type === 'richsections'}
  <RichSections {entry} {sec} />
{:else if sec.type === 'relations'}
  <Relations {entry} {sec} {others} />
{:else if sec.type === 'catalog'}
  <Catalog {entry} {sec} {others} />
{:else if sec.type === 'meter'}
  <Meter {entry} {sec} />
{:else if sec.type === 'kind'}
  <Kind {entry} {sec} />
{:else if sec.type === 'gauges'}
  <Gauges {entry} {sec} />
{:else if sec.type === 'arc'}
  <Arc {entry} {sec} />
{:else if sec.type === 'rulelist'}
  <Rulelist {entry} {sec} />
{:else if sec.type === 'dyad'}
  <Dyad {entry} {sec} {others} />
{:else if sec.type === 'suspects'}
  <Suspects {entry} {sec} {others} />
{:else if sec.type === 'clues'}
  <Clues {entry} {sec} {others} />
{:else if sec.type === 'crew'}
  <Crew {entry} {sec} {others} />
{:else if sec.type === 'dialectic'}
  <Dialectic {entry} {sec} />
{:else if sec.type === 'ledger'}
  <Ledger {entry} {sec} />
{:else if sec.type === 'references'}
  <References {entry} {sec} />
{:else if sec.type === 'sourcenotes'}
  <SourceNotes {entry} {sec} />
{:else if sec.type === 'deflist'}
  <DefList {entry} {sec} />
{:else if sec.type === 'lexicon'}
  <Lexicon {entry} {sec} />
{:else if sec.type === 'chronology'}
  <Chronology {entry} {sec} {others} />
{:else if sec.type === 'taggroups'}
  <TagGroups {entry} {sec} />
{:else if sec.type === 'excerpts'}
  <Excerpts {entry} {sec} />
{:else if sec.type === 'outline'}
  <Outline {entry} {sec} {others} />
{:else if sec.type === 'lineage'}
  <Lineage {entry} {sec} {others} />
{:else if sec.type === 'familytree'}
  <FamilyTree {entry} {sec} {others} />
{:else if sec.type === 'history'}
  <History {entry} {sec} />
{:else if sec.type === 'ties'}
  <Ties {entry} {sec} {others} />
{:else if sec.type === 'allegianceweb'}
  <AllegianceWeb {entry} {sec} {others} />
{:else if sec.type === 'eventtimeline'}
  <EventTimeline {entry} {sec} />
{:else if sec.type === 'timeline'}
  <Timeline {entry} {sec} {others} />
{:else if sec.type === 'spotify'}
  <Spotify items={entry.data[sec.key]} />
{/if}

<style>
  .lead{border-left:3px solid var(--accent);padding-left:16px}
</style>
