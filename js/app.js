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

function initUsers() {
  if (!localStorage.getItem('users')) {
    const def = [{username:'admin', password:'admin', role:'admin'}];
    localStorage.setItem('users', JSON.stringify(def));
  }
}

function getUsers(){
  return JSON.parse(localStorage.getItem('users')) || [];
}

function currentUser(){
  return JSON.parse(sessionStorage.getItem('currentUser'));
}

function setCurrentUser(u){
  sessionStorage.setItem('currentUser', JSON.stringify(u));
}

function isAdmin(){
  const u = currentUser();
  return u && u.role === 'admin';
}

function doLogin(){
  const user = getUsers().find(u => u.username===loginUser.value && u.password===loginPass.value);
  if(user){
    setCurrentUser(user);
    showApp();
  }else{
    alert('Identifiants incorrects');
  }
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
  sessionStorage.removeItem('currentUser');
  showLogin();
}

function createUser(){
  const users = getUsers();
  if(!signupUser.value || !signupPass.value){
    alert('Champs manquants');
    return;
  }
  if(users.some(u=>u.username===signupUser.value)){
    alert('Utilisateur existant');
    return;
  }
  users.push({username:signupUser.value, password:signupPass.value, role:'user'});
  localStorage.setItem('users', JSON.stringify(users));
  signupUser.value='';
  signupPass.value='';
  signupForm.classList.add('hidden');
  alert('Utilisateur créé');
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

initUsers();
if (currentUser()) {
  showApp();
} else {
  showLogin();
}
