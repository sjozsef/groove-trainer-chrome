chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    unmutedTimeMin: 6,
    unmutedTimeMax: 6,
    mutedTimeMin: 4,
    mutedTimeMax: 4
  });
  chrome.storage.session.set({ activeTabs: {}, tabStates: {} });
  initializeBadges();
});

chrome.runtime.onStartup.addListener(() => {
  initializeBadges();
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function stopCycleForTab(tabId) {
  await chrome.alarms.clear(`groove-cycle-${tabId}`);
  const { tabStates } = await chrome.storage.session.get('tabStates');
  if (tabStates && tabStates.hasOwnProperty(tabId)) {
    const newTabStates = { ...tabStates };
    delete newTabStates[tabId];
    await chrome.storage.session.set({ tabStates: newTabStates });
  }
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'setVolume', volume: 1 });
  } catch (error) {
    console.log(`Could not send message to tab ${tabId}, it might be closed or not a YouTube page.`, error.message);
  }
}

async function startCycleForTab(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'setVolume', volume: 1 });
  } catch (error) {
    console.log(`Could not send message to tab ${tabId}, it might be closed or not a YouTube page.`, error.message);
    return;
  }

  const { unmutedTimeMin, unmutedTimeMax } = await chrome.storage.local.get(['unmutedTimeMin', 'unmutedTimeMax']);
  const delayInSeconds = getRandomInt(parseInt(unmutedTimeMin, 10), parseInt(unmutedTimeMax, 10));

  const { tabStates } = await chrome.storage.session.get('tabStates');
  const newTabStates = { ...tabStates, [tabId]: { nextState: 'muted' } };
  await chrome.storage.session.set({ tabStates: newTabStates });

  chrome.alarms.create(`groove-cycle-${tabId}`, { when: Date.now() + delayInSeconds * 1000 });
}

async function updateBadge(tabId) {
  const { activeTabs } = await chrome.storage.session.get('activeTabs');
  const isActive = activeTabs && activeTabs[tabId];
  const badgeText = isActive ? 'ON' : 'OFF';
  const color = isActive ? 'red' : '#777';
  await chrome.action.setBadgeBackgroundColor({ tabId, color: color });
  await chrome.action.setBadgeText({ tabId, text: badgeText });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || !tab.url.includes('youtube.com/watch')) {
    return;
  }
  const { activeTabs } = await chrome.storage.session.get('activeTabs');
  const wasActive = !!activeTabs[tab.id];

  const newActiveTabs = { ...activeTabs };
  newActiveTabs[tab.id] = !wasActive;

  await chrome.storage.session.set({ activeTabs: newActiveTabs });
  await updateBadge(tab.id);

  if (!wasActive) {
    startCycleForTab(tab.id);
  } else {
    stopCycleForTab(tab.id);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateBadge(tabId);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  stopCycleForTab(tabId);

  const { activeTabs } = await chrome.storage.session.get('activeTabs');
  if (activeTabs && activeTabs.hasOwnProperty(tabId)) {
    const newActiveTabs = { ...activeTabs };
    delete newActiveTabs[tabId];
    await chrome.storage.session.set({ activeTabs: newActiveTabs });
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith('groove-cycle-')) {
    return;
  }
  const tabId = parseInt(alarm.name.split('-').pop(), 10);

  const { activeTabs, tabStates } = await chrome.storage.session.get(['activeTabs', 'tabStates']);
  if (!activeTabs[tabId]) {
    return;
  }

  const currentState = tabStates[tabId];
  if (!currentState) {
    return;
  }

  const settings = await chrome.storage.local.get(['unmutedTimeMin', 'unmutedTimeMax', 'mutedTimeMin', 'mutedTimeMax']);

  if (currentState.nextState === 'muted') {
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'setVolume', volume: 0 });
    } catch (error) {
      console.log(`Could not send message to tab ${tabId}, it might be closed or not a YouTube page.`, error.message);
      stopCycleForTab(tabId);
      return;
    }

    const delayInSeconds = getRandomInt(parseInt(settings.mutedTimeMin, 10), parseInt(settings.mutedTimeMax, 10));
    const newTabStates = { ...tabStates, [tabId]: { nextState: 'unmuted' } };
    await chrome.storage.session.set({ tabStates: newTabStates });
    chrome.alarms.create(`groove-cycle-${tabId}`, { when: Date.now() + delayInSeconds * 1000 });
  } else if (currentState.nextState === 'unmuted') {
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'setVolume', volume: 1 });
    } catch (error) {
      console.log(`Could not send message to tab ${tabId}, it might be closed or not a YouTube page.`, error.message);
      stopCycleForTab(tabId);
      return;
    }

    const delayInSeconds = getRandomInt(parseInt(settings.unmutedTimeMin, 10), parseInt(settings.unmutedTimeMax, 10));
    const newTabStates = { ...tabStates, [tabId]: { nextState: 'muted' } };
    await chrome.storage.session.set({ tabStates: newTabStates });
    chrome.alarms.create(`groove-cycle-${tabId}`, { when: Date.now() + delayInSeconds * 1000 });
  }
});

async function initializeBadges() {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.id) {
            updateBadge(tab.id);
        }
    }
}
