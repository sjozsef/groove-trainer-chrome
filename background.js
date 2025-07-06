// When the extension is installed, initialize settings.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    unmutedTimeMin: 30,
    unmutedTimeMax: 60,
    mutedTimeMin: 5,
    mutedTimeMax: 15
  });
  // Use session storage for tab-specific state, which is cleared when the browser closes.
  chrome.storage.session.set({ activeTabs: {}, tabStates: {} });
});

// A utility to get a random integer within a range.
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function stopCycleForTab(tabId) {
  await chrome.alarms.clear(`groove-cycle-${tabId}`);
  // Also clean up tab state storage
  const { tabStates } = await chrome.storage.session.get('tabStates');
  if (tabStates && tabStates.hasOwnProperty(tabId)) {
    const newTabStates = { ...tabStates };
    delete newTabStates[tabId];
    await chrome.storage.session.set({ tabStates: newTabStates });
  }
  // Ensure tab is unmuted when cycle stops.
  try {
    await chrome.tabs.update(tabId, { muted: false });
  } catch (error) {
    // Ignore error, tab might have been closed.
    console.log(`Could not unmute tab ${tabId}, it might be closed.`, error.message);
  }
}

async function startCycleForTab(tabId) {
  // This function starts the cycle. It assumes the initial state is 'unmuted'.
  // It will schedule the first transition to 'muted'.
  try {
    await chrome.tabs.update(tabId, { muted: false });
  } catch (error) {
    console.log(`Could not unmute tab ${tabId}, it might be closed.`, error.message);
    // If we can't update the tab, stop.
    return;
  }

  const { unmutedTimeMin, unmutedTimeMax } = await chrome.storage.local.get(['unmutedTimeMin', 'unmutedTimeMax']);
  const delayInSeconds = getRandomInt(parseInt(unmutedTimeMin, 10), parseInt(unmutedTimeMax, 10));

  // Set next state in storage
  const { tabStates } = await chrome.storage.session.get('tabStates');
  const newTabStates = { ...tabStates, [tabId]: { nextState: 'muted' } };
  await chrome.storage.session.set({ tabStates: newTabStates });

  chrome.alarms.create(`groove-cycle-${tabId}`, { when: Date.now() + delayInSeconds * 1000 });
}

// A helper to update the badge for a given tab.
async function updateBadge(tabId) {
  // Get the state for the tab. Default to false (inactive).
  const { activeTabs } = await chrome.storage.session.get('activeTabs');
  const isActive = activeTabs && activeTabs[tabId];
  const badgeText = isActive ? 'ON' : 'OFF';
  await chrome.action.setBadgeText({ tabId, text: badgeText });
}

// Toggle state on icon click.
chrome.action.onClicked.addListener(async (tab) => {
  // Retrieve the active tabs, toggle the state for the current tab.
  const { activeTabs } = await chrome.storage.session.get('activeTabs');
  const wasActive = !!activeTabs[tab.id];

  const newActiveTabs = { ...activeTabs };
  newActiveTabs[tab.id] = !wasActive;

  await chrome.storage.session.set({ activeTabs: newActiveTabs });
  await updateBadge(tab.id);

  if (!wasActive) {
    // Becoming active
    startCycleForTab(tab.id);
  } else {
    // Becoming inactive
    stopCycleForTab(tab.id);
  }
});

// When the active tab changes, update the badge.
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateBadge(activeInfo.tabId);
});

// When a tab is updated (e.g., reloaded), update the badge.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Badge text can be cleared on navigation, so we restore it.
  if (changeInfo.status === 'complete' && tab.url) {
    updateBadge(tabId);
  }
});

// Clean up storage when a tab is closed to prevent memory leaks.
chrome.tabs.onRemoved.addListener(async (tabId) => {
  stopCycleForTab(tabId); // This clears alarm and tabStates for the cycle.

  // Also remove it from the list of active tabs.
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

  // Check if tab is still active for the plugin
  const { activeTabs, tabStates } = await chrome.storage.session.get(['activeTabs', 'tabStates']);
  if (!activeTabs[tabId]) {
    // Tab is no longer active, so we stop.
    // The alarm might have fired after deactivation.
    return;
  }

  const currentState = tabStates[tabId];
  if (!currentState) {
    // No state, should not happen if active. Stop.
    return;
  }

  const settings = await chrome.storage.local.get(['unmutedTimeMin', 'unmutedTimeMax', 'mutedTimeMin', 'mutedTimeMax']);

  if (currentState.nextState === 'muted') {
    // We were unmuted, now we mute.
    try {
      await chrome.tabs.update(tabId, { muted: true });
    } catch (error) {
      console.log(`Could not mute tab ${tabId}, it might be closed.`, error.message);
      stopCycleForTab(tabId);
      return;
    }

    const delayInSeconds = getRandomInt(parseInt(settings.mutedTimeMin, 10), parseInt(settings.mutedTimeMax, 10));
    const newTabStates = { ...tabStates, [tabId]: { nextState: 'unmuted' } };
    await chrome.storage.session.set({ tabStates: newTabStates });
    chrome.alarms.create(`groove-cycle-${tabId}`, { when: Date.now() + delayInSeconds * 1000 });
  } else if (currentState.nextState === 'unmuted') {
    // We were muted, now we unmute.
    try {
      await chrome.tabs.update(tabId, { muted: false });
    } catch (error) {
      console.log(`Could not unmute tab ${tabId}, it might be closed.`, error.message);
      stopCycleForTab(tabId);
      return;
    }

    const delayInSeconds = getRandomInt(parseInt(settings.unmutedTimeMin, 10), parseInt(settings.unmutedTimeMax, 10));
    const newTabStates = { ...tabStates, [tabId]: { nextState: 'muted' } };
    await chrome.storage.session.set({ tabStates: newTabStates });
    chrome.alarms.create(`groove-cycle-${tabId}`, { when: Date.now() + delayInSeconds * 1000 });
  }
});

// Set initial badge for all tabs when the extension is loaded.
async function initializeBadges() {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.id) {
            updateBadge(tab.id);
        }
    }
}
initializeBadges();
