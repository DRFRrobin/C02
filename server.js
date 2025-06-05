const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const USERS_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    const def = [{ username: 'admin', password: 'admin', role: 'admin' }];
    fs.writeFileSync(USERS_FILE, JSON.stringify(def, null, 2));
    return def;
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.use(express.json());
app.use(
  session({
    secret: 'c02secret',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(__dirname));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (user) {
    req.session.user = { username: user.username, role: user.role };
    res.json({ ok: true, user: req.session.user });
  } else {
    res.status(401).json({ ok: false });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/current', (req, res) => {
  res.json({ user: req.session.user || null });
});

app.get('/api/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  res.json({ users: loadUsers() });
});

app.post('/api/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const { username, password, role } = req.body;
  const users = loadUsers();
  if (users.some((u) => u.username === username)) {
    return res.status(400).json({ error: 'exists' });
  }
  users.push({ username, password, role });
  saveUsers(users);
  res.json({ ok: true });
});

app.put('/api/users/:username', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.username === req.params.username);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  users[idx] = {
    username: req.params.username,
    password: req.body.password,
    role: req.body.role,
  };
  saveUsers(users);
  res.json({ ok: true });
});

app.delete('/api/users/:username', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.username === req.params.username);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  users.splice(idx, 1);
  saveUsers(users);
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on ' + PORT));
