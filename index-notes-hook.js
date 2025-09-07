/* index-notes-hook.js
   Wire up the Notes textarea and hook your wheel logic to persist modifiers.
   Requires ecc-sync.js to be loaded before this file.
*/

(function () {
  // ===== Notes text area wiring =====
  // Change this selector if your textarea has a different id/class.
  const NOTES_SELECTOR = '#notesInput';

  const el = document.querySelector(NOTES_SELECTOR);
  if (el) {
    // Initialize from storage
    try { el.value = (window.ECCSync && ECCSync.getNotes()) || ''; } catch {}
    // Debounced save to storage
    let t;
    el.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        try { window.ECCSync && ECCSync.setNotes(el.value); } catch (e) { console.warn(e); }
      }, 250);
    });
  } else {
    console.warn('index-notes-hook: Notes input not found at selector', NOTES_SELECTOR);
  }

  // ===== Wheel modifier hook =====
  // Call window.applyWheelModifier(modText) from your wheel completion/finalizer.
  window.applyWheelModifier = function (modText) {
    try {
      if (modText) {
        // Your UI update can go here if you want to reflect on index page:
        // const out = document.querySelector('#modifierResult');
        // if (out) out.textContent = modText;

        // Persist for Companion
        window.ECCSync && ECCSync.addModifier(modText);
      }
    } catch (e) {
      console.error('applyWheelModifier failed', e);
    }
  };
})();
