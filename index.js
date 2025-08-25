// index.js
const ROOM = 'main'; // Default room
const API_URL = '/.netlify/functions/get-state';
const SAVE_API_URL = '/.netlify/functions/save-state';

let state = {};

// Mock options for spinning (replace with your actual options)
const spinOptions = {
  difficulty: ['Easy', 'Medium', 'Hard'],
  scenarioClothing: ['Casual', 'Formal', 'Themed'],
  hoods: ['None', 'Light', 'Heavy'],
  gags: ['None', 'Ball', 'Tape'],
  extras: ['None', 'Toys', 'Accessories'],
  anal: ['None', 'Light', 'Intense'],
  fuckingMachine: ['Off', 'Slow', 'Fast'],
  location: ['Bedroom', 'Living Room', 'Dungeon'],
  position: ['Standing', 'Kneeling', 'Bound'],
  vibratingWand: ['Off', 'Low', 'High'],
  audio: ['None', 'Music', 'Instructions'],
  restriction: ['None', 'Light', 'Heavy'],
  nipples: ['None', 'Clamps', 'Suction'],
  eStim: ['Off', 'Low', 'High'],
  collar: ['None', 'Leather', 'Metal'],
  punishment: ['None', 'Task', 'Challenge'],
  reward: ['None', 'Treat', 'Privilege'],
};

// Format milliseconds to MM:SS
function formatTime(ms) {
  if (!ms || ms <= 0) return '00:00';
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / 1000 / 60) % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Update timer displays
function updateTimers() {
  if (!state || state.isPaused) return;

  const now = Date.now();
  const prepRemaining = state.prepStartTime
    ? Math.max(0, state.prepStartTime + (state.prepLength || 0) * 60 * 1000 - now)
    : 0;
  const sessionRemaining = state.sessionStartTime
    ? Math.max(0, state.sessionStartTime + (state.sessionLength || 0) * 60 * 1000 - now)
    : 0;

  document.getElementById('prep-timer').textContent = formatTime(prepRemaining);
  document.getElementById('session-timer').textContent = formatTime(sessionRemaining);
}

// Fetch state from Netlify function
async function fetchState() {
  try {
    const response = await fetch(`${API_URL}?room=${ROOM}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      console.error(`Fetch state failed: ${response.status} ${response.statusText}`);
      return;
    }
    const data = await response.json();
    state = data.state || {};
    updateUI();
  } catch (err) {
    console.error('Error fetching state:', err);
  }
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
      console.log('State saved successfully:', newState);
      await fetchState(); // Refresh state
    } else {
      console.error('Error saving state:', data.error);
    }
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

// Update UI with state data
function updateUI() {
  if (!state) return;

  // Timer lengths
  document.getElementById('prep-length').value = state.prepLength || '';
  document.getElementById('session-length').value = state.sessionLength || '';
  document.getElementById('prep-timer').textContent = state.prepStartTime ? formatTime(state.prepStartTime + (state.prepLength || 0) * 60 * 1000 - Date.now()) : '00:00';
  document.getElementById('session-timer').textContent = state.sessionStartTime ? formatTime(state.sessionStartTime + (state.sessionLength || 0) * 60 * 1000 - Date.now()) : '00:00';

  // Dice and wheel results
  document.getElementById('d10-result').textContent = state.d10 || '—';
  document.getElementById('wheel-result').textContent = state.wheelResult || '—';
  document.getElementById('builder-status').textContent = state.builderStatus || 'Ready';
}

// Timer control functions
function startPrepSession() {
  const prepLength = parseInt(document.getElementById('prep-length').value) || 0;
  const sessionLength = parseInt(document.getElementById('session-length').value) || 0;
  const now = Date.now();
  saveState({
    prepLength,
    sessionLength,
    prepStartTime: now,
    sessionStartTime: now + prepLength * 60 * 1000,
    isPaused: false,
  });
}

function startSession() {
  const sessionLength = parseInt(document.getElementById('session-length').value) || 0;
  saveState({
    sessionLength,
    sessionStartTime: Date.now(),
    isPaused: false,
  });
}

function pauseTimers() {
  saveState({ isPaused: true });
}

function resumeTimers() {
  saveState({ isPaused: false });
}

function resetTimers() {
  saveState({
    prepStartTime: null,
    sessionStartTime: null,
    isPaused: false,
  });
  document.getElementById('prep-timer').textContent = '00:00';
  document.getElementById('session-timer').textContent = '00:00';
}

// Spin function for wheels
function spin(field) {
  const options = spinOptions[field] || ['None'];
  const result = options[Math.floor(Math.random() * options.length)];
  saveState({ [field]: result });
}

// Roll d10
function rollD10() {
  const result = Math.floor(Math.random() * 10) + 1;
  saveState({ d10: result });
}

// Placeholder functions (implement as needed)
function openCompanion() {
  window.open('companion.html', '_blank');
}

function lock() {
  const passcode = document.getElementById('passcode').value;
  saveState({ passcode });
  alert('Passcode set');
}

function unlock() {
  const passcode = document.getElementById('passcode').value;
  if (passcode === state.passcode) {
    alert('Unlocked');
  } else {
    alert('Invalid passcode');
  }
}

function panic() {
  saveState({ isPaused: true, panic: true });
  alert('Panic mode activated');
}

function resetLock() {
  saveState({ passcode: null });
  alert('Lock reset');
}

function spin12sWheel() {
  const result = Math.floor(Math.random() * 12) + 1;
  saveState({ wheelResult: result });
}

function spinSessionBuilder() {
  const newState = {};
  Object.keys(spinOptions).forEach(field => {
    if (field !== 'punishment' && field !== 'reward') {
      newState[field] = spinOptions[field][Math.floor(Math.random() * spinOptions[field].length)];
    }
  });
  newState.builderStatus = 'Spun';
  saveState(newState);
}

// Initialize
function init() {
  console.log('Initializing Builder...');
  fetchState();
  setInterval(updateTimers, 1000); // Update timers every second
  // Add event listeners for input changes
  document.getElementById('prep-length').addEventListener('change', () => {
    saveState({ prepLength: parseInt(document.getElementById('prep-length').value) || 0 });
  });
  document.getElementById('session-length').addEventListener('change', () => {
    saveState({ sessionLength: parseInt(document.getElementById('session-length').value) || 0 });
  });
}

window.addEventListener('load', init);
