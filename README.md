# Draftpad

Draftpad is a minimal, fast, local-first Markdown scratchpad browser extension.

> **Note:** This project is currently under active development and will soon release a stable, polished version.

## Troubleshooting

### Problem:

Error: "background.service_worker is currently disabled. Add background.scripts" when trying to install and test the extension in Mozilla Firefox.

### Solution:

This is a known compatibility quirk with Manifest V3 between Chrome and Firefox.

Here is what's happening:

- Chrome strictly requires background scripts to run as a "service_worker" in Manifest V3. It will throw an error if you try to use the old "scripts" array.
- Firefox historically used "scripts" (which creates a non-persistent background page) for Manifest V3. While newer versions of Firefox (121+) do support "service_worker", older versions, specific configurations, or Firefox forks (like Waterfox/LibreWolf) have it disabled by default.

Because Chrome will reject the manifest if it sees "scripts", and your Firefox is rejecting it because it sees "service_worker", the standard industry practice is to maintain a separate manifest file for Firefox.

**How to fix it:**

Created a manifest-firefox.json file in your /extension folder with the same contents as manifest.json, except for the "background" block.

**Option 1: Swap the files (Recommended)**

When you want to load the extension in Firefox, simply rename manifest-firefox.json to manifest.json (overwriting the Chrome one).

**Option 2: Manually edit your manifest.json**

If you just want to edit your existing manifest.json right now to make it work in Firefox, change the "background" block from this:

```json
"background": {
  "service_worker": "background.js"
},
```

To this:

```json
"background": {
  "scripts": ["background.js"]
},
```

(Note: If you do Option 2, you will need to change it back to "service_worker" when you want to load it in Chrome).

Once you make this swap, click Load Temporary Add-on... in Firefox again, and it will load perfectly!
