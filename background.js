// When the extension is installed, initialize settings.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    unmutedTimeMin: 30,
    unmutedTimeMax: 60,
    mutedTimeMin: 5,
    mutedTimeMax: 15
  });
  // Use session storage for tab-specific state, which is cleared when the browser closes.
  chrome.storage.session.set({ activeTabs: {} });
});

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
  const newActiveTabs = { ...activeTabs };
  newActiveTabs[tab.id] = !newActiveTabs[tab.id];
  await chrome.storage.session.set({ activeTabs: newActiveTabs });
  updateBadge(tab.id);
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
  const { activeTabs } = await chrome.storage.session.get('activeTabs');
  if (activeTabs && activeTabs.hasOwnProperty(tabId)) {
    const newActiveTabs = { ...activeTabs };
    delete newActiveTabs[tabId];
    await chrome.storage.session.set({ activeTabs: newActiveTabs });
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
