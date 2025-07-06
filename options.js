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

  if (parseInt(values.unmutedTimeMin) > parseInt(values.unmutedTimeMax)) {
    statusDiv.textContent = 'Unmuted Min cannot be greater than Max.';
    statusDiv.style.color = 'red';
    setTimeout(() => { statusDiv.textContent = ''; statusDiv.style.color = ''; }, 3000);
    return;
  }

  if (parseInt(values.mutedTimeMin) > parseInt(values.mutedTimeMax)) {
    statusDiv.textContent = 'Muted Min cannot be greater than Max.';
    statusDiv.style.color = 'red';
    setTimeout(() => { statusDiv.textContent = ''; statusDiv.style.color = ''; }, 3000);
    return;
  }

  chrome.storage.local.set(values, () => {
    statusDiv.textContent = 'Options saved.';
    statusDiv.style.color = '#28a745';
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.style.color = '';
    }, 1500);
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
