// Interface de gestion des comptes utilisateurs
async function checkAdmin() {
  const r = await fetch('/api/current');
  const data = await r.json();
  if (!data.user || data.user.role !== 'admin') {
    navigate('index.html');
  }
}

let users = [];
const table = document.getElementById('userTable');
const nameInput = document.getElementById('userName');
const passInput = document.getElementById('userPass');
const roleInput = document.getElementById('userRole');
const saveBtn = document.getElementById('saveUser');
let editIndex = null;

// Met à jour le tableau HTML avec la liste des comptes
function render() {
  table.innerHTML = '';
  users.forEach((u, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${u.username}</td><td>${u.role}</td><td><button data-edit="${i}">Edit</button> <button data-del="${i}">Supprimer</button></td>`;
    table.appendChild(row);
  });
}

// Récupère la liste des utilisateurs depuis le serveur
async function loadUsers() {
  const r = await fetch('/api/users');
  if (r.ok) {
    const data = await r.json();
    users = data.users;
    render();
  } else {
    navigate('index.html');
  }
}

// Gestion des boutons Edit et Supprimer dans le tableau
table.addEventListener('click', e => {
  if (e.target.dataset.edit) {
    const u = users[e.target.dataset.edit];
    nameInput.value = u.username;
    passInput.value = '';
    roleInput.value = u.role;
    editIndex = e.target.dataset.edit;
  } else if (e.target.dataset.del) {
    const u = users[e.target.dataset.del];
    fetch(`/api/users/${encodeURIComponent(u.username)}`, { method: 'DELETE' })
      .then(loadUsers);
  }
});

// Sauvegarde (création ou modification) d'un utilisateur
saveBtn.addEventListener('click', () => {
  const u = {
    username: nameInput.value,
    password: passInput.value,
    role: roleInput.value
  };
  if (editIndex === null) {
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u)
    }).then(loadUsers);
  } else {
    const username = users[editIndex].username;
    fetch(`/api/users/${encodeURIComponent(username)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u)
    }).then(() => { editIndex = null; loadUsers(); });
  }
  nameInput.value = '';
  passInput.value = '';
  roleInput.value = 'user';
});

// Vérifie les droits puis charge la liste des utilisateurs
checkAdmin().then(loadUsers);
