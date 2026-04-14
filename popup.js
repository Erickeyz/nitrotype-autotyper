// =============================================
//  NitroType AutoTyper — Popup Script (Fixed Slider Lag)
// =============================================

const wpmSlider   = document.getElementById('wpmSlider');
const errorSlider = document.getElementById('errorSlider');
const wpmVal      = document.getElementById('wpmVal');
const errorVal    = document.getElementById('errorVal');
const startBtn    = document.getElementById('startBtn');
const stopBtn     = document.getElementById('stopBtn');
const statusBar   = document.getElementById('statusBar');
const statusText  = document.getElementById('statusText');

// Load saved settings when popup opens
chrome.storage.local.get(['wpm', 'errorRate'], (data) => {
  if (data.wpm)       { wpmSlider.value = data.wpm; wpmVal.textContent = data.wpm; }
  if (data.errorRate !== undefined) {
    errorSlider.value = data.errorRate;
    errorVal.textContent = data.errorRate + '%';
  }
});

// 1. UPDATE DISPLAY WHILE DRAGGING (Fast, no lag)
wpmSlider.addEventListener('input', () => {
  wpmVal.textContent = wpmSlider.value;
});
errorSlider.addEventListener('input', () => {
  errorVal.textContent = errorSlider.value + '%';
});

// 2. SAVE TO STORAGE ONLY WHEN YOU LET GO (Prevents freezing)
wpmSlider.addEventListener('change', () => {
  chrome.storage.local.set({ wpm: parseInt(wpmSlider.value) });
});
errorSlider.addEventListener('change', () => {
  chrome.storage.local.set({ errorRate: parseInt(errorSlider.value) });
});

function setStatus(state, text) {
  statusBar.className = 'status-bar ' + state;
  statusText.textContent = text;
}

function setRunning(running) {
  startBtn.disabled = running;
  stopBtn.disabled  = !running;
  setStatus(running ? 'running' : 'idle', running ? 'Typing in progress…' : 'Idle — open a race to begin');
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToContent(message) {
  const tab = await getActiveTab();
  if (!tab) { setStatus('error', 'No active tab found.'); return; }

  if (!tab.url?.includes('nitrotype.com')) {
    setStatus('error', 'Go to nitrotype.com first!');
    return;
  }

  // Inject into ALL frames
  try {
    await chrome.scripting.executeScript({ 
      target: { tabId: tab.id, allFrames: true },
      files: ['content.js'] 
    });
  } catch (err) {}

  // Broadcast to all frames
  chrome.tabs.sendMessage(tab.id, message);
}

startBtn.addEventListener('click', () => {
  setStatus('idle', 'Connecting…');
  sendToContent({
    type: 'START',
    wpm: parseInt(wpmSlider.value),
    errorRate: parseInt(errorSlider.value) / 100,
  });
});

stopBtn.addEventListener('click', () => {
  sendToContent({ type: 'STOP' });
  setRunning(false);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'STATUS') return;
  if (message.state === 'running') setRunning(true);
  if (message.state === 'idle')    setRunning(false);
  if (message.state === 'error')   setStatus('error', message.msg || 'Error');
});

(async () => {
  const tab = await getActiveTab();
  if (!tab?.url?.includes('nitrotype.com')) return;
  chrome.tabs.sendMessage(tab.id, { type: 'GET_STATE' });
})();

document.getElementById('diagBtn')?.addEventListener('click', () => {
  setStatus('idle', 'Check the DevTools console…');
  sendToContent({ type: 'DIAGNOSE' });
});