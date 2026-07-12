# Wiki Studio (Svelte + Vite)

The next-generation editor. A **template-driven** worldbuilding tool: characters,
locations, factions, lore, items, events, and nested plot outlines — all defined as
templates, not hardcoded screens.

## Run it

```bash
cd studio
npm install
npm run dev      # http://localhost:5173  — live dev server
npm run build    # → dist/  (static, deploy to AWS Amplify)
npm run preview  # serve the production build locally
```

Fonts live in the repo's top-level `/fonts` and are symlinked into `public/fonts`.
If the symlink is missing, recreate it: `ln -sfn ../../fonts public/fonts`.

## Architecture

```
src/
  lib/
    theme.js        palettes + font faces + CSS-var generators
    richtext.js     bold/italic sanitize + render helpers (DOMParser-safe)
    images.js       image pick + downscale
    model.js        Workspace → Project → Entry factories (type-agnostic)
    templates.js    THE REGISTRY — every sheet type is a template of typed sections
    store.svelte.js reactive app state (Svelte 5 runes)
  components/
    TopBar, ProjectsView, ProjectView, EntryEditor, ThemeBar
    fields/         one component per section type; Field.svelte dispatches by type
```

### Adding a new sheet type
Add an entry to `TEMPLATES` in `src/lib/templates.js` (title, subtitle, and an
ordered list of typed sections) and list its key in `ENTRY_TYPES`. No other code
changes — the editor and (upcoming) exporter render it generically.

### Field/section types
`richline` · `stats` · `gallery` · `richsections` · `relations` · `taggroups` ·
`excerpts` · `outline` (acts → chapters → beats, with cross-links to any entry).

## Status
- ✅ Editor: create/edit/delete projects & entries of all 7 types; theming; rich
  text (⌘B/⌘I); JSON save/open.
- ⏳ Next: static-HTML exporter (port `renderWiki` → self-contained `.zip`),
  in-app preview, IndexedDB autosave, reordering.

The original single-file app remains at `../index.html` during the migration.
