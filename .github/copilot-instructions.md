# Copilot Instructions

## Project Overview

Draftpad is a minimal, local-first Markdown scratchpad browser extension. It is made with pure vanilla JS, no build step, loads directly in Chrome/Firefox as an unpacked extension.

## Commands

```bash
pnpm dev          # Start Vite dev server on port 3000
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # Type-check only (tsc --noEmit) — no separate test suite
pnpm clean        # Remove dist/

# Download marked.min.js for the extension (run once after cloning)
npx tsx download.ts
```

## Architecture

### Browser Extension (`extension/`)

Plain HTML/JS with no bundler. Scripts are loaded in order via `<script>` tags in `extension/index.html`:

- `storage.js` — Browser-agnostic wrapper around `chrome.storage.local` / `browser.storage.local`
- `notes.js` — `NotesManager` singleton: in-memory notes array + persistence via `Storage`
- `preview.js` — `Preview` singleton: lazy-loads `marked.min.js` on first toggle
- `main.js` — DOM bindings and event wiring; calls into `NotesManager` and `Preview`
- `background.js` — Service worker: opens `index.html` as a new tab on toolbar click or keyboard shortcut

State flows: `main.js` → `NotesManager` (mutates in-memory state, persists via `Storage`) → `chrome.storage.local`.

## Key Conventions

### Environment Variables

- `GEMINI_API_KEY` — Required for Gemini AI calls. Copy `.env.example` to `.env` locally. In Google AI Studio, this is injected automatically from the Secrets panel.
- `APP_URL` — The hosted URL; AI Studio injects this at runtime.
- `DISABLE_HMR=true` — Disables Vite HMR (used by AI Studio to prevent flickering during agent edits).

### Extension: Cross-Browser Compatibility

The `Storage` wrapper detects Firefox vs Chrome at runtime:

```js
const api = typeof browser !== "undefined" ? browser : chrome;
```

For Firefox Manifest V3 compatibility, `background.scripts` must replace `background.service_worker` in `manifest.json`. See `README.md` for the swap procedure. Chrome requires `service_worker`; Firefox (older/forks) requires `scripts`.

### Extension: Note Model

Notes are plain objects `{ id, title, content, updatedAt }`. `id` is `Date.now().toString()`. Title is derived from the first non-empty line of content, truncated to 50 characters. Updated notes are moved to the front of the array. Saves are debounced at 250ms.
