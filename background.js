// This function updates the badge text on the extension icon.
async function updateBadge() {
  const { isActive } = await chrome.storage.local.get({ isActive: false });
  const badgeText = isActive ? 'ON' : 'OFF';
  await chrome.action.setBadgeText({ text: badgeText });
}

// When the extension is installed, initialize the state.
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isActive: false });
});

// Toggle state and update badge on icon click.
chrome.action.onClicked.addListener(async (tab) => {
  const { isActive } = await chrome.storage.local.get({ isActive: false });
  await chrome.storage.local.set({ isActive: !isActive });
  await updateBadge();
});

// Update the badge when the service worker starts up.
// This handles browser startup and extension reloads.
updateBadge();
