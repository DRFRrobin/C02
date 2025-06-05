/**
 * Point d'entrée du serveur Express.
 * Gère l'authentification, les préférences et la mise à jour du dépôt.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const simpleGit = require('simple-git');
const helmet = require('helmet');
const SALT_ROUNDS = 10;

const GAMES_DIR = path.join(__dirname, 'public', 'games');

const app = express();
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"]
      },
    },
  })
);
const USERS_FILE = path.join(__dirname, 'users.json');

/**
 * Lit la liste des utilisateurs depuis le disque.
 * Les mots de passe non chiffrés sont convertis lors du chargement.
 */
function loadUsers() {
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    let changed = false;
    users.forEach((u) => {
      if (!u.password || !u.password.startsWith('$2')) {
        u.password = bcrypt.hashSync(u.password || '', SALT_ROUNDS);
        changed = true;
      }
    });
    if (changed) saveUsers(users);
    return users;
  } catch (e) {
    const def = [
      { username: 'admin', password: bcrypt.hashSync('admin', SALT_ROUNDS), role: 'admin' },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(def, null, 2));
    return def;
  }
}

/**
 * Sauvegarde la liste des utilisateurs sur le disque.
 */
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

app.use(express.json());
// Utilise la clef fournie ou en génère une pour la session Express
const SESSION_SECRET = process.env.SESSION_SECRET ||
  crypto.randomBytes(16).toString('hex');

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Redirige vers la page de connexion si l'utilisateur n'est pas authentifié
app.use((req, res, next) => {
  if (
    req.path.endsWith('.html') &&
    req.path !== '/index.html' &&
    !req.session.user
  ) {
    return res.redirect('/index.html');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// Authentifie un utilisateur et crée la session
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (user && user.password) {
    try {
      const ok = await bcrypt.compare(password, user.password);
      if (ok) {
        req.session.user = { username: user.username, role: user.role };
        return res.json({ ok: true, user: req.session.user });
      }
    } catch (e) {}
  }
  res.status(401).json({ ok: false });
});

// Détruit la session courante
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// Renvoie l'utilisateur actuellement connecté
app.get('/api/current', (req, res) => {
  res.json({ user: req.session.user || null });
});

// Préférences de l'utilisateur
app.get('/api/preferences', (req, res) => {
  res.json({ autoUpdate: req.session.autoUpdate !== false });
});

app.post('/api/preferences', (req, res) => {
  req.session.autoUpdate = !!req.body.autoUpdate;
  res.json({ ok: true });
});

const git = simpleGit();
const REMOTE = 'https://github.com/DRFRrobin/C02.git';

// Met à jour les fichiers du dépôt local
app.post('/api/update', async (req, res) => {
  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin');
    if (!origin) {
      await git.addRemote('origin', REMOTE);
    }
    await git.fetch(['--all']);
    await git.reset(['--hard', 'origin/main']);
    res.json({ updated: true });
  } catch (e) {
    console.error('update error', e);
    res.status(500).json({ error: 'git' });
  }
});

// Liste les utilisateurs (administrateur uniquement)
app.get('/api/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const users = loadUsers().map((u) => ({ username: u.username, role: u.role }));
  res.json({ users });
});

// Ajoute un utilisateur (administrateur uniquement)
app.post('/api/users', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const { username, password, role } = req.body;
  const users = loadUsers();
  if (users.some((u) => u.username === username)) {
    return res.status(400).json({ error: 'exists' });
  }
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  users.push({ username, password: hashed, role });
  saveUsers(users);
  res.json({ ok: true });
});

// Modifie un utilisateur existant
app.put('/api/users/:username', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const users = loadUsers();
  const idx = users.findIndex((u) => u.username === req.params.username);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  users[idx].role = req.body.role;
  if (req.body.password) {
    users[idx].password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  }
  saveUsers(users);
  res.json({ ok: true });
});

// Supprime un utilisateur
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

// Retourne la liste des jeux présents dans le dossier public/games
app.get('/api/games', (req, res) => {
  fs.readdir(GAMES_DIR, { withFileTypes: true }, (err, entries) => {
    if (err) return res.status(500).json({ error: 'fs' });
    const games = [];
    entries
      .filter((e) => e.isDirectory())
      .forEach((dir) => {
        const indexFile = path.join(GAMES_DIR, dir.name, 'index.html');
        if (!fs.existsSync(indexFile)) return;
        let title = dir.name;
        try {
          const contents = fs.readFileSync(indexFile, 'utf8');
          const m = contents.match(/<title>([^<]+)<\/title>/i);
          if (m) title = m[1];
        } catch (e) {}
        games.push({
          id: dir.name,
          name: title,
          link: path.join(dir.name, 'index.html'),
        });
      });
    res.json({ games });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server listening on ' + PORT));
