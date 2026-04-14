// =============================================
//  NitroType AutoTyper — Background Script (Absolute Time Sync)
// =============================================

let isTyping = false;
let typingTimeout = null;
let startTime = 0;
let charsTyped = 0;

function getBaseDelay(wpm) { 
  return 60000 / (wpm * 5); 
}

async function sendKeystroke(tabId, char) {
  try {
    const keyCode = char.toUpperCase().charCodeAt(0);
    await chrome.debugger.sendCommand({ tabId: tabId }, "Input.dispatchKeyEvent", {
      type: "keyDown",
      text: char,
      unmodifiedText: char,
      key: char,
      windowsVirtualKeyCode: keyCode
    });
    await chrome.debugger.sendCommand({ tabId: tabId }, "Input.dispatchKeyEvent", {
      type: "keyUp",
      key: char,
      windowsVirtualKeyCode: keyCode
    });
  } catch (e) {
    console.error("Debugger error:", e);
  }
}

async function typeLoop(tabId, text, idx, wpm, errorRate) {
  if (!isTyping) return;
  
  if (idx >= text.length) {
    stopTyping(tabId);
    return;
  }

  const correctChar = text[idx];
  let charToType = correctChar;
  let advanceIdx = true;

  if (errorRate > 0 && Math.random() < errorRate) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    charToType = chars.charAt(Math.floor(Math.random() * chars.length));
    advanceIdx = false;
  }

  // If this is the very first character, start the absolute clock NOW
  if (charsTyped === 0) {
    startTime = Date.now();
  }

  // Send the keystroke
  await sendKeystroke(tabId, charToType);
  charsTyped++;

  const nextIdx = advanceIdx ? idx + 1 : idx;
  
  // --- ABSOLUTE TIME SYNC ---
  // Calculate exactly what time it SHOULD be right now if we were typing 
  // at perfect WPM, and adjust the delay to catch up if Chrome lagged.
  const baseDelay = getBaseDelay(wpm);
  const expectedTime = startTime + (charsTyped * baseDelay);
  const now = Date.now();
  
  let delay = expectedTime - now;
  
  // Add a tiny bit of jitter (+/- 10%) so it doesn't look like a robot, 
  // but keep it anchored to the absolute time so it never falls behind.
  const jitter = (Math.random() - 0.5) * (baseDelay * 0.2);
  delay += jitter;

  // If Chrome lagged so much that we are behind schedule, fire immediately
  if (delay < 0) delay = 0; 

  typingTimeout = setTimeout(() => typeLoop(tabId, text, nextIdx, wpm, errorRate), delay);
}

async function startTyping(tabId, text, wpm, errorRate) {
  if (isTyping) return;
  isTyping = true;
  charsTyped = 0;
  
  try {
    await chrome.debugger.attach({ tabId: tabId }, "1.3");
  } catch (e) {
    if (!e.message.includes("Already attached")) {
      console.error("Failed to attach debugger:", e);
      isTyping = false;
      chrome.runtime.sendMessage({ type: 'STATUS', state: 'error', msg: 'Debugger failed to attach.' });
      return;
    }
  }

  // Tell popup we successfully started
  chrome.runtime.sendMessage({ type: 'STATUS', state: 'running', msg: 'Typing in progress...' });

  typeLoop(tabId, text, 0, wpm, errorRate);
}

function stopTyping(tabId) {
  isTyping = false;
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  try {
    chrome.debugger.detach({ tabId: tabId });
  } catch (e) {}
  
  // Tell popup we stopped
  chrome.runtime.sendMessage({ type: 'STATUS', state: 'idle', msg: 'Idle — open a race to begin' });
}

chrome.runtime.onMessage.addListener((msg, sender, respond) => {
  if (msg.type === 'START_DEBUGGER_TYPING') {
    startTyping(sender.tab.id, msg.text, msg.wpm, msg.errorRate);
    respond({ ok: true });
  } else if (msg.type === 'STOP_DEBUGGER_TYPING') {
    stopTyping(sender.tab.id);
    respond({ ok: true });
  }
  return true;
});

// Clean up if the tab closes or the user navigates away
chrome.debugger.onDetach.addListener((source, reason) => {
  isTyping = false;
  if (typingTimeout) clearTimeout(typingTimeout);
  chrome.runtime.sendMessage({ type: 'STATUS', state: 'idle', msg: 'Idle — open a race to begin' });
});