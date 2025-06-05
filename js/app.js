const tilesContainer = document.getElementById('tiles');
const settingsModal = document.getElementById('settings');
const autoUpdateCheckbox = document.getElementById('autoUpdate');
const manualUpdateButton = document.getElementById('manualUpdate');
const closeSettingsButton = document.getElementById('closeSettings');

function fetchApps() {
  return fetch('apps.json').then(r => r.json());
}

function renderTiles(apps) {
  tilesContainer.innerHTML = '';
  apps.forEach(app => {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = app.name;
    if (app.settings) {
      div.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    } else {
      div.addEventListener('click', () => window.location.href = app.link);
    }
    tilesContainer.appendChild(div);
  });
}

function load() {
  autoUpdateCheckbox.checked = localStorage.getItem('autoUpdate') !== 'false';
  fetchApps().then(data => renderTiles(data.apps));
}

manualUpdateButton.addEventListener('click', load);
autoUpdateCheckbox.addEventListener('change', e => {
  localStorage.setItem('autoUpdate', e.target.checked);
});
closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));

if (localStorage.getItem('autoUpdate') !== 'false') {
  load();
} else {
  renderTiles([]);
}
