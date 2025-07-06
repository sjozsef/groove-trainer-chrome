const form = document.getElementById('settingsForm');
const statusDiv = document.getElementById('status');
const settings = [
  'unmutedTimeMin',
  'unmutedTimeMax',
  'mutedTimeMin',
  'mutedTimeMax'
];

// Saves options to chrome.storage.
function save_options(e) {
  e.preventDefault();
  const values = {};
  for (const setting of settings) {
    values[setting] = document.getElementById(setting).value;
  }

  chrome.storage.local.set(values, () => {
    // Update status to let user know options were saved.
    statusDiv.textContent = 'Options saved.';
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 750);
  });
}

// Restores settings using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.local.get(settings, (items) => {
    for (const setting of settings) {
      document.getElementById(setting).value = items[setting];
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
form.addEventListener('submit', save_options);
