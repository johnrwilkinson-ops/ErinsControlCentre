/* ecc-sync.js
   Shared helper for syncing Notes and Wheel Modifiers between index and companion pages.
   Uses localStorage (same origin required).
*/
(function () {
  const KEYS = {
    notes: 'ECC_NOTES_TEXT',        // string
    modifiers: 'ECC_MODIFIERS_JSON' // JSON array of strings
  };

  function getNotes() {
    try {
      return localStorage.getItem(KEYS.notes) || '';
    } catch (e) {
      console.warn('ECC getNotes failed', e);
      return '';
    }
  }

  function setNotes(text) {
    try {
      if (typeof text !== 'string') text = String(text ?? '');
      localStorage.setItem(KEYS.notes, text);
    } catch (e) {
      console.warn('ECC setNotes failed', e);
    }
  }

  function getModifiers() {
    try {
      const raw = localStorage.getItem(KEYS.modifiers);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('ECC getModifiers parse failed; resetting.', e);
      localStorage.removeItem(KEYS.modifiers);
      return [];
    }
  }

  function setModifiers(arr) {
    try {
      if (!Array.isArray(arr)) arr = [];
      localStorage.setItem(KEYS.modifiers, JSON.stringify(arr));
    } catch (e) {
      console.warn('ECC setModifiers failed', e);
    }
  }

  function addModifier(entry) {
    try {
      const trimmed = String(entry ?? '').trim();
      if (!trimmed) return;
      const arr = getModifiers();
      const stamp = new Date().toLocaleString();
      arr.unshift(`${stamp} — ${trimmed}`);
      // keep most recent 50 to avoid unbounded growth
      setModifiers(arr.slice(0, 50));
    } catch (e) {
      console.warn('ECC addModifier failed', e);
    }
  }

  // Expose a small API on window
  window.ECCSync = { KEYS, getNotes, setNotes, getModifiers, setModifiers, addModifier };
})();
