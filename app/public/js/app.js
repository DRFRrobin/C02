// Sélection des éléments de l'interface
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
const versionInfo = document.getElementById('versionInfo');

// Utilisateur connecté et timer de mise à jour
let currentUser = null;
let autoUpdateInterval = null;

// Lance la mise à jour via l'API et affiche une barre de progression
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

// Récupère l'utilisateur connecté auprès du serveur
async function fetchCurrent() {
  const r = await fetch('/api/current');
  if (r.ok) {
    const data = await r.json();
    currentUser = data.user;
  } else {
    currentUser = null;
  }
}

// Vérifie si l'utilisateur courant est administrateur
function isAdmin(){
  return currentUser && currentUser.role === 'admin';
}

// Envoie les informations de connexion au serveur
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

// Affiche l'application après connexion
async function showApp(){
  loginForm.classList.add('hidden');
  appContainer.classList.remove('hidden');
  await checkUpdate();
  await updateVersionInfo();
  const prefs = await fetchPreferences();
  autoUpdateCheckbox.checked = prefs.autoUpdate;
  await load();
  setupAutoUpdate(prefs.autoUpdate);
  updateAdminTile();
}

// Retour à l'écran de connexion
function showLogin(){
  if (autoUpdateInterval) {
    clearInterval(autoUpdateInterval);
    autoUpdateInterval = null;
  }
  updateAdminTile();
  appContainer.classList.add('hidden');
  loginForm.classList.remove('hidden');
}

// Déconnexion manuelle
function logout(){
  fetch('/api/logout', {method:'POST'}).then(() => {
    currentUser = null;
    showLogin();
  });
}

// Création d'un compte utilisateur depuis l'écran d'inscription
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

// Charge la liste des applications disponibles
function fetchApps() {
  return fetch('apps.json').then(r => r.json());
}

// Vérifie si YouTube est accessible
function checkYoutube() {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => resolve(false), 3000);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.src = 'https://www.youtube.com/favicon.ico?' + Date.now();
  });
}

// Lit les préférences utilisateur
function fetchPreferences() {
  return fetch('/api/preferences').then(r => r.json());
}

// Sauvegarde la préférence de mise à jour automatique
function savePreferences(value) {
  return fetch('/api/preferences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autoUpdate: value })
  });
}

// Récupère les informations de version
function fetchStatus() {
  return fetch('/api/status').then(r => r.json()).catch(() => ({}));
}

async function updateVersionInfo() {
  const info = await fetchStatus();
  if (info.pr) {
    versionInfo.textContent = 'PR #' + info.pr;
  } else if (info.branch) {
    versionInfo.textContent = 'Branche ' + info.branch;
  } else {
    versionInfo.textContent = '';
  }
}

// Affiche dynamiquement les tuiles des applications
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

// Recharge la liste des applications
async function load() {
  const data = await fetchApps();
  let apps = data.apps;
  const ytIndex = apps.findIndex(a => a.id === 'youtube');
  if (ytIndex !== -1) {
    const accessible = await checkYoutube();
    if (!accessible) {
      apps = apps.filter(a => a.id !== 'youtube');
    }
  }
  renderTiles(apps);
}

// Active ou désactive la mise à jour automatique
function setupAutoUpdate(enabled){
  if (autoUpdateInterval){
    clearInterval(autoUpdateInterval);
    autoUpdateInterval = null;
  }
  if(enabled){
    autoUpdateInterval = setInterval(load, 30000);
  }
}

// Affiche le bouton d'administration si besoin
function updateAdminTile(){
  if(isAdmin()){
    usersBtn.classList.remove('hidden');
  } else {
    usersBtn.classList.add('hidden');
  }
}

// Gestion des différents boutons de l'interface
manualUpdateButton.addEventListener('click', async () => {
  await checkUpdate();
  await updateVersionInfo();
  await load();
});
autoUpdateCheckbox.addEventListener('change', e => {
  savePreferences(e.target.checked);
  setupAutoUpdate(e.target.checked);
});
settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
usersBtn.addEventListener('click', () => navigate('users.html'));
closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));

// Raccourcis clavier et boutons de connexion
loginBtn.addEventListener('click', doLogin);
loginUser.addEventListener('keydown', e => { if(e.key === 'Enter') doLogin(); });
loginPass.addEventListener('keydown', e => { if(e.key === 'Enter') doLogin(); });
// Gestion du formulaire d'inscription
openSignup.addEventListener('click', () => signupForm.classList.remove('hidden'));
cancelSignup.addEventListener('click', () => signupForm.classList.add('hidden'));
createUserBtn.addEventListener('click', createUser);
logoutBtn.addEventListener('click', logout);

// Au chargement, on vérifie si l'utilisateur est déjà connecté
fetchCurrent().then(() => {
  if (currentUser) {
    showApp();
  } else {
    showLogin();
  }
});
