// =============================================
//  NitroType AutoTyper — Content Script v16 (Debugger Relay)
// =============================================
(function () {
  'use strict';

  let isRunning = false;

  function getRaceTextFromDOM() {
    const dashCopy = document.querySelector('.dash-copy, .dash-copyContainer');
    if (dashCopy) {
      const text = dashCopy.textContent.replace(/\u00a0/g, ' ').replace(/🏁/g, '').trim();
      if (text.length > 10) return text;
    }

    const allDivs = document.querySelectorAll('div');
    let bestContainer = null;
    let maxSpans = 0;

    for (const div of allDivs) {
      const spanCount = div.querySelectorAll('span').length;
      const divCount = div.querySelectorAll('div').length;
      if (spanCount > 15 && spanCount > maxSpans && divCount < spanCount) {
        maxSpans = spanCount;
        bestContainer = div;
      }
    }

    if (bestContainer) {
      let words = [];
      for (const child of bestContainer.children) {
        let text = child.textContent.replace(/\u00a0/g, ' ').replace(/🏁/g, '').trim();
        if (text) words.push(text);
      }
      let final = words.join(' ').replace(/\s+/g, ' ').trim();
      if (final.length > 15) return final;
    }
    return null;
  }

  chrome.runtime.onMessage.addListener((msg, _, respond) => {
    if (msg.type === 'START') {
      const domText = getRaceTextFromDOM();
      if (!domText) {
        respond({ ok: false });
        return true;
      }

      isRunning = true;
      console.log(`[AutoTyper] Found text, sending to Debugger: ${domText.substring(0, 30)}...`);
      
      // Tell the background script to start typing using the Debugger API
      chrome.runtime.sendMessage({
        type: 'START_DEBUGGER_TYPING',
        text: domText,
        wpm: msg.wpm ?? 120,
        errorRate: msg.errorRate ?? 0
      });
      
      respond({ ok: true });
      
    } else if (msg.type === 'STOP') {
      isRunning = false;
      chrome.runtime.sendMessage({ type: 'STOP_DEBUGGER_TYPING' });
      respond({ ok: true });
    } else if (msg.type === 'GET_STATE') {
      respond({ running: isRunning });
    }
    return true;
  });

  if (getRaceTextFromDOM()) {
     console.log(`[NitroType AutoTyper] v16 (Debugger Relay) loaded in iframe! ✓`);
  }
})();