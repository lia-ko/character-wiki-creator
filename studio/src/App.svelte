<script>
  import { onMount } from 'svelte';
  import { app, themeFor, restoreWorkspace, saveNow, undo, redo } from './lib/store.svelte.js';
  import { paletteVars, palById, fontVars, fontFaceCSS } from './lib/theme.js';

  const isEditable = (el) => el && (el.isContentEditable || /^(input|textarea|select)$/i.test(el.tagName));

  onMount(() => {
    restoreWorkspace();
    const flush = () => saveNow();
    // ⌘Z / ⌘⇧Z (⌘Y) undo-redo — but let the browser handle native undo while typing in a field
    const onKey = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
      const k = (e.key || '').toLowerCase();
      if (k !== 'z' && k !== 'y') return;
      if (isEditable(document.activeElement)) return;
      e.preventDefault();
      if (k === 'y' || (k === 'z' && e.shiftKey)) redo(); else undo();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });
    return () => { window.removeEventListener('beforeunload', flush); window.removeEventListener('keydown', onKey); };
  });
  import TopBar from './components/TopBar.svelte';
  import ProjectsView from './components/ProjectsView.svelte';
  import ProjectView from './components/ProjectView.svelte';
  import EntryEditor from './components/EntryEditor.svelte';
  import CommandPalette from './components/CommandPalette.svelte';
  import TrashPanel from './components/TrashPanel.svelte';
  import Toast from './components/Toast.svelte';
  import ConfirmDialog from './components/ConfirmDialog.svelte';

  // Load every font face once (editor preview needs them all available).
  const faceCSS = fontFaceCSS('/fonts/');

  // Reactive palette + font variables for the current view.
  const themeCSS = $derived.by(() => {
    const t = themeFor();
    return paletteVars(palById(t.palette)) + fontVars(t.head, t.body, t.hs, t.bs, t.ps);
  });
</script>

<svelte:head>
  {@html '<style>' + faceCSS + '</style>'}
  {@html '<style>' + themeCSS + '</style>'}
</svelte:head>

<TopBar />
<CommandPalette />
<TrashPanel />
<Toast />
<ConfirmDialog />

<div class="stage">
  {#if app.view === 'projects'}
    <ProjectsView />
  {:else if app.view === 'project'}
    <ProjectView />
  {:else}
    <EntryEditor />
  {/if}
</div>

<style>
  .stage{ padding-top: var(--appbar-h); min-height: 100vh; }
</style>
