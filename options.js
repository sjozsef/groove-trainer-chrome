const form = document.getElementById('settingsForm');
const statusDiv = document.getElementById('status');
const settings = [
  'unmutedTimeMin',
  'unmutedTimeMax',
  'mutedTimeMin',
  'mutedTimeMax'
];

function save_options(e) {
  e.preventDefault();
  const values = {};
  for (const setting of settings) {
    values[setting] = document.getElementById(setting).value;
  }

  chrome.storage.local.set(values, () => {
    statusDiv.textContent = 'Options saved.';
    setTimeout(() => {
      statusDiv.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.local.get(settings, (items) => {
    for (const setting of settings) {
      document.getElementById(setting).value = items[setting];
    }
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
form.addEventListener('submit', save_options);
