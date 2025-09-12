# ECC — Companion Notes & Wheel Modifiers (Drop‑in Package)

This package lets your **Companion** page display the **actual note text** typed on the **index** page plus a running list of **wheel modifiers** produced by your wheel logic.

It uses `localStorage` under the same origin (e.g., `erinscontrol.netlify.app`) so both pages can sync without a server.

---

## Files

- `ecc-sync.js` — shared helper you must include on **both** pages.
- `index-notes-hook.js` — drop-in for **index**: saves notes as you type and exposes `window.applyWheelModifier(modText)`.
- `companion-notes-render.js` — drop-in for **Companion**: renders notes and a live-updating list of modifiers.

---

## Integration — Index Page

1) Include **ecc-sync.js** and **index-notes-hook.js** (in that order), e.g.:

```html
<script src="/path/to/ecc-sync.js"></script>
<script src="/path/to/index-notes-hook.js"></script>
```

2) Ensure your notes input exists. Default selector is `#notesInput` (change inside `index-notes-hook.js` if needed):

```html
<textarea id="notesInput" placeholder="Notes…"></textarea>
```

3) Wherever your wheel finalizes a modifier, call:

```js
window.applyWheelModifier(finalText);
```

That will persist the modifier to storage for Companion (and you can still do any UI updates you want locally).

---

## Integration — Companion Page

1) Include **ecc-sync.js** and **companion-notes-render.js** (in that order):

```html
<script src="/path/to/ecc-sync.js"></script>
<script src="/path/to/companion-notes-render.js"></script>
```

2) Provide containers for rendering:

```html
<section id="companionNotes" style="display:grid; gap:1rem;">
  <div>
    <h3 style="margin:0 0 .25rem 0;">Notes</h3>
    <pre id="notesDisplay" style="white-space:pre-wrap;word-wrap:break-word;margin:0;background:#0b0b0b12;padding:.75rem;border-radius:.5rem;min-height:3rem;"></pre>
  </div>
  <div>
    <h3 style="margin:0 0 .25rem 0;">Wheel Modifiers</h3>
    <ul id="modifiersDisplay" style="margin:0;padding-left:1.25rem;list-style:disc;"></ul>
  </div>
</section>
```

3) That’s it. Companion listens for `storage` events and also refreshes every 5 seconds as a safety net.

---

## Notes & Tips

- **Same origin is required** for `localStorage` sync across tabs/windows.
- `applyWheelModifier()` prepends a timestamp and keeps the most recent **50** entries.
- If your selectors differ, change them at the top of the respective files.
- If you want the Companion list to cap at a different number, adjust the slice in `ecc-sync.js` > `addModifier`.

---

_Updated: 2025-09-07T07:14:46_
