/* companion-notes-render.js
   Render Notes and Wheel Modifiers on the Companion page with live updates.
   Requires ecc-sync.js to be loaded before this file.
*/

(function () {
  // Change selectors if your containers differ
  const NOTES_DISPLAY_SELECTOR = '#notesDisplay';
  const MODS_DISPLAY_SELECTOR  = '#modifiersDisplay';

  const notesEl = document.querySelector(NOTES_DISPLAY_SELECTOR);
  const modsEl  = document.querySelector(MODS_DISPLAY_SELECTOR);

  function renderNotes() {
    if (!notesEl) return;
    try {
      const txt = (window.ECCSync && ECCSync.getNotes()) || '';
      notesEl.textContent = txt || '—';
    } catch (e) {
      console.warn('renderNotes failed', e);
    }
  }

  function renderModifiers() {
    if (!modsEl) return;
    try {
      const arr = (window.ECCSync && ECCSync.getModifiers()) || [];
      modsEl.innerHTML = '';
      if (!arr.length) {
        const li = document.createElement('li');
        li.textContent = '—';
        modsEl.appendChild(li);
        return;
      }
      for (const item of arr) {
        const li = document.createElement('li');
        li.textContent = item;
        modsEl.appendChild(li);
      }
    } catch (e) {
      console.warn('renderModifiers failed', e);
    }
  }

  function refreshAll() {
    renderNotes();
    renderModifiers();
  }

  // Initial paint
  refreshAll();

  // Live updates when index changes values (cross-tab via storage)
  window.addEventListener('storage', (ev) => {
    const keys = (window.ECCSync && ECCSync.KEYS) || {};
    if (ev && (ev.key === keys.notes || ev.key === keys.modifiers || ev.key === null)) {
      refreshAll();
    }
  });

  // Periodic safety refresh in case a storage event is missed
  setInterval(refreshAll, 5000);
})();
