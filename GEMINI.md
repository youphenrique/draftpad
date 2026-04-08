# Project Overview: Draftpad

Draftpad is a minimal, fast, and local-first Markdown scratchpad. It is implemented as a **browser extension (Manifest V3)**.

## Core Technologies
- **Browser Extension:** Manifest V3, Vanilla JavaScript, CSS.
- **Markdown Rendering:** `marked.min.js` (loaded dynamically for preview).
- **Storage:** Browser `storage.local` API for persistent notes.

## Project Structure
- `extension/`: Contains the source code for the browser extension.
    - `manifest.json`: Extension configuration (Chrome/Edge optimized).
    - `index.html`: The main UI of the scratchpad.
    - `main.js`: Core application logic and DOM handling.
    - `notes.js`: Logic for creating, updating, and deleting notes.
    - `storage.js`: Wrapper for the browser's storage API.
    - `preview.js`: Logic for toggling and rendering Markdown preview.
    - `styles.css`: Application styling.
- `package.json`: Project dependencies and scripts. Note: Currently configured for a React app that expects a `src/` directory.
- `vite.config.ts`: Configuration for the Vite build tool.
- `download.ts`: Utility script to download `marked.min.js` into the `extension/` folder.

## Building and Running

### Browser Extension
1.  **Preparation:** Run `npx tsx download.ts` to ensure `extension/marked.min.js` is present.
2.  **Chrome/Edge:** 
    - Go to `chrome://extensions/`.
    - Enable "Developer mode".
    - Click "Load unpacked" and select the `extension/` folder.
3.  **Firefox:**
    - Note: Firefox compatibility requires a manifest change. See `README.md` for instructions on swapping `service_worker` for `scripts`.
    - Go to `about:debugging#/runtime/this-firefox`.
    - Click "Load Temporary Add-on..." and select the `extension/manifest.json` file.

## Development Conventions
- **Browser Compatibility:** When working on the extension, ensure compatibility between Chrome's `service_worker` and Firefox's non-persistent background scripts.
- **Local-First:** All data should be stored locally in the browser's storage unless explicitly syncing with a cloud service.
- **Clean Logic:** Keep DOM manipulation (`main.js`) separate from business logic (`notes.js`) and data persistence (`storage.js`).
