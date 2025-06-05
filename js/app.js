const tilesContainer = document.getElementById('tiles');
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

let currentUser = null;

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

function showApp(){
  loginForm.classList.add('hidden');
  appContainer.classList.remove('hidden');
  if (localStorage.getItem('autoUpdate') !== 'false') {
    load();
  } else {
    renderTiles([]);
  }
}

function showLogin(){
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

function renderTiles(apps) {
  tilesContainer.innerHTML = '';
  apps.forEach(app => {
    if (app.admin && !isAdmin()) return;
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

loginBtn.addEventListener('click', doLogin);
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
