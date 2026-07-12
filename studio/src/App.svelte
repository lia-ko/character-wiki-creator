<script>
  import { app, themeFor } from './lib/store.svelte.js';
  import { paletteVars, palById, fontVars, fontFaceCSS } from './lib/theme.js';
  import TopBar from './components/TopBar.svelte';
  import ProjectsView from './components/ProjectsView.svelte';
  import ProjectView from './components/ProjectView.svelte';
  import EntryEditor from './components/EntryEditor.svelte';
  import MapLab from './components/MapLab.svelte';

  // Load every font face once (editor preview needs them all available).
  const faceCSS = fontFaceCSS('/fonts/');

  // Reactive palette + font variables for the current view.
  const themeCSS = $derived.by(() => {
    const t = themeFor();
    return paletteVars(palById(t.palette)) + fontVars(t.head, t.body, t.hs, t.bs);
  });
</script>

<svelte:head>
  {@html '<style>' + faceCSS + '</style>'}
  {@html '<style>' + themeCSS + '</style>'}
</svelte:head>

<TopBar />

<div class="stage">
  {#if app.view === 'projects'}
    <ProjectsView />
  {:else if app.view === 'project'}
    <ProjectView />
  {:else if app.view === 'maplab'}
    <MapLab />
  {:else}
    <EntryEditor />
  {/if}
</div>

<style>
  .stage{ padding-top: 52px; min-height: 100vh; }
</style>
