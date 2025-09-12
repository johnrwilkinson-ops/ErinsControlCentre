/* index-notes-hook.js (v2 hotfix)
   - Targets #notesText (your existing textarea)
   - Mirrors Add/Clear actions into ECCSync so Companion displays manual notes
   Requires ecc-sync.js to be loaded before this file.
*/
(function () {
  const NOTES_SELECTOR = '#notesText';
  const ADD_BTN_ID = 'btnAddNote';
  const CLEAR_BTN_ID = 'btnClearNotes';

  function stamp(){
    try { return new Date().toLocaleString(); } catch(_) { return ''; }
  }

  // Ensure ECCSync exists
  if (!window.ECCSync) { console.warn('index-notes-hook: ECCSync not found'); }

  // Live mirror of textarea content (so Companion can show current text)
  const el = document.querySelector(NOTES_SELECTOR);
  if (el) {
    // Initialize from storage (optional: start empty if you prefer)
    try { el.value = (window.ECCSync && ECCSync.getNotes()) || el.value || ''; } catch {}

    let t;
    el.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        try { window.ECCSync && ECCSync.setNotes(el.value || ''); } catch (e) { console.warn(e); }
      }, 200);
    });
  } else {
    console.warn('index-notes-hook: Notes input not found at selector', NOTES_SELECTOR);
  }

  // Hook Add Note: append a timestamped line into ECCSync notes log
  const addBtn = document.getElementById(ADD_BTN_ID);
  if (addBtn && el) {
    addBtn.addEventListener('click', () => {
      try {
        const text = (el.value || '').trim();
        if (!text) return;
        const prev = (window.ECCSync && ECCSync.getNotes()) || '';
        const joined = prev ? (prev + '\n' + stamp() + ' — ' + text) : (stamp() + ' — ' + text);
        window.ECCSync && ECCSync.setNotes(joined);
      } catch (e) { console.warn('index-notes-hook: add mirror failed', e); }
    });
  }

  // Hook Clear Notes: clear ECCSync notes
  const clearBtn = document.getElementById(CLEAR_BTN_ID);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      try { window.ECCSync && ECCSync.setNotes(''); } catch (e) { console.warn('index-notes-hook: clear mirror failed', e); }
    });
  }
})();
