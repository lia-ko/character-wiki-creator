# Character Wiki Creator

A single-file, offline web app for building character wikis (originally for *Vampire: The Masquerade* OCs). Open `index.html` in a browser — no server, no accounts, no build step. **Nothing is stored in the browser** — your work lives entirely in the files you save.

## The shape of it

Three levels:

```
Projects  →  Characters  →  Editor
```

- **Projects** — your workspace. Each project (VTM, SciFi, …) keeps its own characters, theme, and files.
- **Characters** — a project's roster of character cards. Click one to edit.
- **Editor** — the inline-edit wiki: click any text to edit, ＋/✕ to add/remove, upload portraits, link characters to each other.

A breadcrumb (Projects / Project / Cbaracter) lets you jump back up.

## Files

**Save .zip** bundles everything into one downloadable zip — a small self-contained static site:

```
your-projects.zip
├─ index.html            ← the projects hub
├─ vtm/
│   ├─ main.html         ← that project's character hub
│   ├─ character-a.html  ← one page per character (self-contained)
│   └─ character-b.html
└─ scifi/
    ├─ main.html
    └─ …
```

Every page works when opened directly: `index.html` links to each project, each `main.html` links to its characters, and a relationship on one character links straight to another character's page. Unzip and browse, or host the folder anywhere.

**Open folder / zip** reads a folder (pick the unzipped folder) or a `.zip` back in, so you can keep editing. Each file carries its own data, so nothing is lost.

## Details

- **Per-project theme** — 18 palettes, plus **independent Heading and Body fonts** chosen from ~30 self-hosted families in `./fonts` (Playfair Display, Cinzel, EB Garamond, blackletter, and more). Theme + fonts apply to that project's hub and character pages and restore on import.
- **Fonts in exports** — exported pages reference the fonts by relative path, and **Save bundles the used font files into the zip**. This requires the app to be able to read the font files, which browsers only allow when it's **served over http** (a local server or a deployment) — not opened as a bare `file://`. Running from `file://`, the app still *displays* the fonts fine, but exports will fall back unless the `fonts/` folder is deployed alongside them. Tip: `python3 -m http.server` in this folder, then open `http://localhost:8000`.
- **Images** — portraits are embedded in the character files (self-contained). Big JPEG/PNG stills are downscaled on upload to keep files small; **GIF and WebP are kept untouched so animation is preserved**.
- **Unsaved-changes warning** — since nothing autosaves, the app warns before you leave with unsaved edits. Save often.
- **Cross-browser** — the zip approach works in any modern browser (no File System Access API needed).

## Roadmap

Reorder items, undo, rich text in write-ups, a build-your-own palette, per-image cropping, and Spotify embeds.
