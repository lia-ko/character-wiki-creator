<script>
  import { markDirty } from '../../lib/store.svelte.js';
  import RichEditor from './RichEditor.svelte';
  import Stats from './Stats.svelte';
  import Gallery from './Gallery.svelte';
  import RichSections from './RichSections.svelte';
  import Relations from './Relations.svelte';
  import TagGroups from './TagGroups.svelte';
  import Excerpts from './Excerpts.svelte';
  import Outline from './Outline.svelte';
  import Lineage from './Lineage.svelte';
  import AllegianceWeb from './AllegianceWeb.svelte';
  import EventTimeline from './EventTimeline.svelte';
  import Spotify from './Spotify.svelte';

  let { entry, sec, others } = $props();
  function setRichline(v){ entry.data[sec.key] = v; markDirty(); }
</script>

{#if sec.type === 'richline'}
  <div class="lead"><RichEditor value={entry.data[sec.key]} multiline placeholder={sec.label + '… (⌘B / ⌘I)'} oninput={setRichline} /></div>
{:else if sec.type === 'stats'}
  <Stats {entry} {sec} />
{:else if sec.type === 'gallery'}
  <Gallery {entry} {sec} />
{:else if sec.type === 'richsections'}
  <RichSections {entry} {sec} />
{:else if sec.type === 'relations'}
  <Relations {entry} {sec} {others} />
{:else if sec.type === 'taggroups'}
  <TagGroups {entry} {sec} />
{:else if sec.type === 'excerpts'}
  <Excerpts {entry} {sec} />
{:else if sec.type === 'outline'}
  <Outline {entry} {sec} {others} />
{:else if sec.type === 'lineage'}
  <Lineage {entry} {sec} {others} />
{:else if sec.type === 'allegianceweb'}
  <AllegianceWeb {entry} {sec} {others} />
{:else if sec.type === 'eventtimeline'}
  <EventTimeline {entry} {sec} />
{:else if sec.type === 'spotify'}
  <Spotify items={entry.data[sec.key]} />
{/if}

<style>
  .lead{border-left:3px solid var(--accent);padding-left:16px}
</style>
