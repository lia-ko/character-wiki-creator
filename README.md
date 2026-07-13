# Wiki / Bible Studio

A **template-driven wiki & story-bible maker** for writers, DMs, and anyone building
a personal knowledge project. Each entry (character, location, faction, lore, item,
event, plot outline…) is a template of typed sections — not a hardcoded screen — with
long-form prose editing alongside structured metadata.

The web app is the current focus: ship functionality, get real users, find the pain
points. A desktop app follows in parallel. This document records the **target
architecture** so today's decisions keep that path open.

---

## Product vision

A tool that sits between "Notion feels like a database" and "Word is one giant file":

- **Structured like a wiki** — a rearrangeable tree (binder) of entries, each with
  typed sections and relationships to other entries.
- **Writes like a document** — first-class long-form prose per entry (Scrivener's
  binder × Google Docs' editing surface).
- **Local-first and yours** — on the desktop, your work lives as plain files in a
  folder *you* control. No forced cloud. How you back up, sync, or version them is
  your freedom.

### Audience
Novelists and worldbuilders, TTRPG game masters, and developers/hobbyists keeping a
personal knowledge base.

---

## Guiding principles

1. **Your data is safe and yours.** Nothing is ever silently lost; on desktop nothing
   is locked inside a proprietary blob or a server you don't own.
2. **The shell is ~5% of the code.** The UI must not know or care whether it's running
   in a browser tab or a native window. Everything platform-specific hides behind one
   storage boundary.
3. **Ship the local-first promise first.** Features that would compromise "your files,
   no server" (notably live real-time co-editing) are deferred, not designed-in.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| UI framework | **Svelte 5 + Vite** | Runs unchanged in the browser and inside the desktop shell |
| Prose editor | **TipTap** (ProseMirror) *(planned)* | Google-Docs-feel long-form editing; serializes to Markdown **and** JSON |
| Structure | Binder tree of entries + per-entry typed sections | `model.js` + the `templates.js` registry |
| **Storage boundary** | **`StorageAdapter` interface** | The seam that makes web → desktop a swap, not a rewrite |
| Durable format (desktop) | **Markdown file per entry + a JSON/YAML manifest** | Plain, portable, user-owned, diffable |
| Versioning + collaboration | **Git as the substrate** *(planned)* | History = safety; branch/merge = async collaboration |
| Desktop shell | **Electron** *(future; Tauri stays viable)* | Chosen for maturity + WebRTC headroom if live media ever lands. See "Shell choice" below. |

### Shell choice — Electron vs Tauri
Deferred, and deliberately kept swappable. Tauri wins on download size (~5 MB vs
~120 MB) and local-first file ergonomics; Electron wins on distribution maturity,
app-store paths, and bundled-Chromium WebRTC (only relevant if live audio/video is
ever added). Because the frontend is shell-agnostic, this can be decided late — even
prototyped both ways — without reworking the app. Code signing (Apple Developer cert,
Windows Authenticode) is an OS-imposed cost either way, and CI-matrix builds
(GitHub Actions: mac/windows/linux) will be needed regardless.

---

## The `StorageAdapter` boundary (the key seam)

All persistence flows through one interface. The web build fakes what it can; the
desktop build backs it with real files + git. Today's `persist.js` (`idbSet`/`idbGet`)
and the plain-serializable workspace object in `store.svelte.js` are already this seam
in embryo — the workspace is a pure data tree, not tied to any storage mechanism.

```
UI (Svelte)  ──▶  StorageAdapter  ──▶  { WebAdapter | DesktopAdapter }
```

Rough contract (to firm up when TipTap lands):

```
listEntries()            readEntry(id)         writeEntry(id, content)
history(id)              branch(name)          merge(from, into)
```

| | Web adapter (now) | Desktop adapter (later) |
|---|---|---|
| Persistence | IndexedDB (`persist.js`), optionally File System Access API to write a real folder | Markdown files + JSON manifest on disk |
| History | Whole-workspace snapshots (current undo/redo + trash) | git commits |
| Collaboration | — | git branch / merge |

---

## Collaboration model

**Async branch-and-merge, git-backed** — the model Ellipsus uses, and the one that
fits "local files, no cloud, your freedom" without contradiction:

- **"Work is safe"** → git keeps a complete, recoverable history of every save.
- **"Files are their freedom"** → plain `.md` files in a normal folder; open in any
  editor, back up any way, move to any drive.
- **"No cloud sync"** → git works fully offline with *any* remote, or none — GitHub, a
  self-hosted server, a shared drive, or nothing. The user chooses.
- **"Collaboration on projects"** → two people fork a project, edit independently,
  compare, and merge. Async, no always-on server.

Git can be presented **invisibly** (friendly "versions" / "drafts" language, most
users never see the word "git") or **exposed** for power users — an open UX decision.

### Shelved: live real-time co-editing
Google-Docs-style simultaneous typing in one document is **out of scope for now**. It
requires Y.js/CRDT as the live document model *plus* a live connection between machines
— which, with no cloud, forces fragile P2P (a signaling server + both users online at
once). That directly fights the local-first promise. It can be added later as an
**optional Y.js layer on top of** the Markdown+git foundation (TipTap supports it
natively, and Y.js can persist to the same Markdown files), so shelving it now costs no
rework.

---

## Roadmap

**Phase 1 — Web app (now):** template-driven editor, prose editing (TipTap), binder
tree, theming, IndexedDB autosave, export. All persistence behind `StorageAdapter`.
Ship and gather feedback.

**Phase 2 — Desktop app (in parallel):** same frontend, wrapped in Electron. New
`DesktopAdapter` reads/writes Markdown files and runs git (via `isomorphic-git` or
system git) for history + branch/merge. Native menus, file dialogs, "open project
folder."

**Phase 3 — Optional live collaboration:** Y.js layer for real-time co-editing, added
only if users ask for it; durable format stays Markdown + git.

---

## Repository layout

```
studio/          the Svelte + Vite app (current focus) — see studio/README.md
index.html       the original single-file tool (legacy, kept during migration)
fonts/           shared font files (symlinked into studio/public/fonts)
```

See **`studio/README.md`** for how to run the app and add new sheet types.
