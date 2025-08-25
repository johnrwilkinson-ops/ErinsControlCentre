// companion.js
const ROOM = 'main'; // Default room, can be dynamic if needed
const POLL_INTERVAL = 5000; // Poll every 5 seconds
const API_URL = '/.netlify/functions/get-state';
const SAVE_API_URL = '/.netlify/functions/save-state';

let state = null;
let timerInterval = null;

// Format milliseconds to MM:SS
function formatTime(ms) {
  if (!ms || ms <= 0) return '00:00';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update timer displays based on current time and state
function updateTimers() {
  if (!state || state.isPaused) return;

  const now = Date.now();
  const prepRemaining = state.prepStartTime
    ? Math.max(0, state.prepStartTime + state.prepLength * 60 * 1000 - now)
    : 0;
  const sessionRemaining = state.sessionStartTime
    ? Math.max(0, state.sessionStartTime + state.sessionLength * 60 * 1000 - now)
    : 0;

  document.getElementById('prep-timer').textContent = formatTime(prepRemaining);
  document.getElementById('session-timer').textContent = formatTime(sessionRemaining);
}

// Fetch state from Netlify function
async function fetchState() {
  try {
    const response = await fetch(`${API_URL}?room=${ROOM}`);
    const data = await response.json();
    state = data.state || {};
    updateUI();
  } catch (err) {
    console.error('Error fetching state:', err);
  }
}

// Update UI with state data
function updateUI() {
  document.getElementById('room').textContent = ROOM指標
    .textContent = ROOM;
  document.getElementById('last-update').textContent = state.updatedAt
    ? new Date(state.updatedAt).toLocaleString()
    : '—';

  // Timer lengths
  document.getElementById('prep-length').textContent = state.prepLength
    ? `${state.prepLength} mins`
    : '—';
  document.getElementById('session-length').textContent = state.sessionLength
    ? `${state.sessionLength} mins`
    : '—';

  // Session details
  document.getElementById('difficulty').textContent = state.difficulty || '—';
  document.getElementById('d10').textContent = state.d10 || '—';
  document.getElementById('punishment').textContent = state.punishment || '—';
  document.getElementById('reward').textContent = state.reward || '—';
  document.getElementById('notes').textContent = state.notes || '—';

  // Builder picks
  document.getElementById('scenario-clothing').textContent = state.scenarioClothing || '—';
  document.getElementById('hoods').textContent = state.hoods || '—';
  document.getElementById('gags').textContent = state.gags || '—';
  document.getElementById('extras').textContent = state.extras || '—';
  document.getElementById('anal').textContent = state.anal || '—';
  document.getElementById('fucking-machine').textContent = state.fuckingMachine || '—';
  document.getElementById('location').textContent = state.location || '—';
  document.getElementById('position').textContent = state.position || '—';
  document.getElementById('vibrating-wand').textContent = state.vibratingWand || '—';
  document.getElementById('audio').textContent = state.audio || '—';
  document.getElementById('restriction').textContent = state.restriction || '—';
  document.getElementById('nipples').textContent = state.nipples || '—';
  document.getElementById('e-stim').textContent = state.eStim || '—';
  document.getElementById('collar').textContent = state.collar || '—';

  // Update timers if not paused
  updateTimers();
}

// Save state to Netlify function
async function saveState(newState) {
  try {
    const response = await fetch(SAVE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room: ROOM, state: { ...state, ...newState } }),
    });
    const data = await response.json();
    if (data.ok) {
      await fetchState(); // Refresh state after saving
    } else {
      console.error('Error saving state:', data.error);
    }
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

// Timer control functions
function startPrepSession() {
  const now = Date.now();
  saveState({
    prepStartTime: now,
    sessionStartTime: now + (state.prepLength || 0) * 60 * 1000,
    isPaused: false,
  });
}

function startSession() {
  saveState({
    sessionStartTime: Date.now(),
    isPaused: false,
  });
}

function pauseTimers() {
  saveState({ isPaused: true });
  clearInterval(timerInterval);
}

function resumeTimers() {
  saveState({ isPaused: false });
  timerInterval = setInterval(updateTimers, 1000);
}

function resetTimers() {
  saveState({
    prepStartTime: null,
    sessionStartTime: null,
    isPaused: false,
  });
  document.getElementById('prep-timer').textContent = '00:00';
  document.getElementById('session-timer').textContent = '00:00';
  clearInterval(timerInterval);
}

// Initialize
function init() {
  fetchState(); // Initial state fetch
  setInterval(fetchState, POLL_INTERVAL); // Poll every 5 seconds
  timerInterval = setInterval(updateTimers, 1000); // Update timers every second
}

window.addEventListener('load', init);
