const dynamicTiles = document.getElementById('appTiles');
const settingsBtn = document.getElementById('settingsBtn');
const usersBtn = document.getElementById('usersBtn');
const tilesContainer = dynamicTiles;
const settingsModal = document.getElementById('settings');
const autoUpdateCheckbox = document.getElementById('autoUpdate');
const manualUpdateButton = document.getElementById('manualUpdate');
const closeSettingsButton = document.getElementById('closeSettings');
const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const appContainer = document.getElementById('app');
const openSignup = document.getElementById('openSignup');
const signupForm = document.getElementById('signupForm');
const signupUser = document.getElementById('signupUser');
const signupPass = document.getElementById('signupPass');
const createUserBtn = document.getElementById('createUserBtn');
const cancelSignup = document.getElementById('cancelSignup');
const logoutBtn = document.getElementById('logoutBtn');
const updateOverlay = document.getElementById('updateOverlay');
const updateBar = document.querySelector('#updateProgress div');
const updateMessage = document.getElementById('updateMessage');

let currentUser = null;
let autoUpdateInterval = null;

async function checkUpdate(){
  updateMessage.textContent = 'Importation en cours...';
  updateOverlay.classList.remove('hidden');
  updateBar.style.width = '0%';
  try {
    const r = await fetch('/api/update', {method:'POST'});
    if(r.ok){
      await r.json();
      let w = 0;
      const intv = setInterval(() => {
        w += 10;
        updateBar.style.width = w + '%';
        if(w >= 100) clearInterval(intv);
      }, 100);
      await new Promise(res => setTimeout(res, 1100));
      updateBar.style.width = '100%';
      updateMessage.textContent = 'Importation terminée';
      await new Promise(res => setTimeout(res, 1000));
    }
  } catch(e) {}
  updateOverlay.classList.add('hidden');
  updateMessage.textContent = 'Recherche de mise à jour...';
}

async function fetchCurrent() {
  const r = await fetch('/api/current');
  if (r.ok) {
    const data = await r.json();
    currentUser = data.user;
  } else {
    currentUser = null;
  }
}

function isAdmin(){
  return currentUser && currentUser.role === 'admin';
}

function doLogin(){
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: loginUser.value, password: loginPass.value })
  }).then(r => {
    if (r.ok) {
      return r.json();
    } else {
      throw new Error('auth');
    }
  }).then(data => {
    currentUser = data.user;
    showApp();
  }).catch(() => alert('Identifiants incorrects'));
}

async function showApp(){
  loginForm.classList.add('hidden');
  appContainer.classList.remove('hidden');
  await checkUpdate();
  const prefs = await fetchPreferences();
  autoUpdateCheckbox.checked = prefs.autoUpdate;
  await load();
  setupAutoUpdate(prefs.autoUpdate);
  updateAdminTile();
}

function showLogin(){
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
    autoUpdateInterval = null;
  }
  updateAdminTile();
  appContainer.classList.add('hidden');
  loginForm.classList.remove('hidden');
}

function logout(){
  fetch('/api/logout', {method:'POST'}).then(() => {
    currentUser = null;
    showLogin();
  });
}

function createUser(){
  if(!signupUser.value || !signupPass.value){
    alert('Champs manquants');
    return;
  }
  fetch('/api/users', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username:signupUser.value, password:signupPass.value, role:'user'})
  }).then(r => {
    if(r.status===400){
      alert('Utilisateur existant');
      return Promise.reject();
    }
    return r.json();
  }).then(()=>{
    signupUser.value='';
    signupPass.value='';
    signupForm.classList.add('hidden');
    alert('Utilisateur créé');
  }).catch(()=>{});
}

function fetchApps() {
  return fetch('apps.json').then(r => r.json());
}

function fetchPreferences() {
  return fetch('/api/preferences').then(r => r.json());
}

function savePreferences(value) {
  return fetch('/api/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autoUpdate: value })
  });
}

function renderTiles(apps) {
  tilesContainer.innerHTML = '';
  apps.forEach(app => {
    if (app.admin && !isAdmin()) return;
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = app.name;
    div.addEventListener('click', () => navigate(app.link));
    tilesContainer.appendChild(div);
  });
}

function load() {
  return fetchApps().then(data => renderTiles(data.apps));
}

function setupAutoUpdate(enabled){
  if (autoUpdateInterval){
    clearInterval(autoUpdateInterval);
    autoUpdateInterval = null;
  }
  if(enabled){
    autoUpdateInterval = setInterval(load, 30000);
  }
}

function updateAdminTile(){
  if(isAdmin()){
    usersBtn.classList.remove('hidden');
  } else {
    usersBtn.classList.add('hidden');
  }
}

manualUpdateButton.addEventListener('click', load);
autoUpdateCheckbox.addEventListener('change', e => {
  savePreferences(e.target.checked);
  setupAutoUpdate(e.target.checked);
});
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
usersBtn.addEventListener('click', () => navigate('users.html'));
closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));

loginBtn.addEventListener('click', doLogin);
loginUser.addEventListener('keydown', e => { if(e.key === 'Enter') doLogin(); });
loginPass.addEventListener('keydown', e => { if(e.key === 'Enter') doLogin(); });
openSignup.addEventListener('click', () => signupForm.classList.remove('hidden'));
cancelSignup.addEventListener('click', () => signupForm.classList.add('hidden'));
createUserBtn.addEventListener('click', createUser);
logoutBtn.addEventListener('click', logout);

fetchCurrent().then(() => {
  if (currentUser) {
    showApp();
  } else {
    showLogin();
  }
});
