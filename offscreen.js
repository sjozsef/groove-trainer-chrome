const timers = {};

chrome.runtime.onMessage.addListener(handleMessages);

function handleMessages(message) {
  const { type, tabId, scheduledTime, cycleId } = message;

  if (type === 'start-timer') {
    if (timers[tabId]) {
      clearInterval(timers[tabId]);
    }

    const intervalId = setInterval(() => {
      const remaining = Math.round((scheduledTime - Date.now()) / 1000);
      if (remaining >= 0) {
        chrome.runtime.sendMessage({ type: 'timer-tick', tabId, remaining, cycleId });
      } else {
        clearInterval(intervalId);
        delete timers[tabId];
      }
    }, 1000);
    timers[tabId] = intervalId;

  } else if (type === 'stop-timer') {
    if (timers[tabId]) {
      clearInterval(timers[tabId]);
      delete timers[tabId];
    }
  }
}
