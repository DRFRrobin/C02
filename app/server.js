// Modules nécessaires au serveur
const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const simpleGit = require('simple-git');
const helmet = require('helmet');
const https = require('https');
const { log } = require('../logger');
// Nombre de tours pour le hachage des mots de passe
const SALT_ROUNDS = 10;

// Répertoire contenant les jeux
const GAMES_DIR = path.join(__dirname, 'public', 'games');

const app = express();
// Désactive l'en-tête "X-Powered-By" et applique quelques règles de sécurité
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
// Fichier de stockage des utilisateurs
const USERS_FILE = path.join(__dirname, 'users.json');
// Fichier stockant la branche ou la PR actuellement testée
const STATUS_FILE = path.join(__dirname, '..', 'current.json');

function saveStatus(info) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(info));
}

function loadStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function getLatestPRs() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/DRFRrobin/C02/pulls?per_page=5',
      headers: { 'User-Agent': 'c02-app' }
    };
    https
      .get(options, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            const list = Array.isArray(json) ? json : [];
            const prs = list.map((p) => ({ number: p.number, title: p.title }));
            resolve(prs);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

// Lit le fichier d'utilisateurs et convertit les mots de passe en hachés si besoin
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
    // S'il n'existe pas encore, on crée un fichier avec un compte administrateur
    const def = [
      { username: 'admin', password: bcrypt.hashSync('admin', SALT_ROUNDS), role: 'admin' },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(def, null, 2));
    return def;
  }
}

// Sauvegarde la liste des utilisateurs sur disque
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Permet de lire les corps JSON des requêtes
app.use(express.json());
// Secret utilisé pour signer les cookies de session
const SESSION_SECRET = process.env.SESSION_SECRET ||
  crypto.randomBytes(16).toString('hex');

// Configuration de la session Express
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

// Journalise chaque requête avec le nom de l'utilisateur
app.use((req, res, next) => {
  const user = req.session && req.session.user ? req.session.user.username : 'guest';
  log(`${user} ${req.method} ${req.url}`);
  next();
});

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

// Sert les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Authentifie un utilisateur et démarre sa session
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (user && user.password) {
    try {
      const ok = await bcrypt.compare(password, user.password);
      if (ok) {
        req.session.user = { username: user.username, role: user.role };
        log(`login success ${username}`);
        return res.json({ ok: true, user: req.session.user });
      }
    } catch (e) {}
  }
  log(`login failed ${username}`);
  res.status(401).json({ ok: false });
});

// Termine la session courante
app.post('/api/logout', (req, res) => {
  const u = req.session.user && req.session.user.username;
  req.session.destroy(() => {
    log(`logout ${u || 'unknown'}`);
    res.json({ ok: true });
  });
});

// Retourne l'utilisateur actuellement connecté
app.get('/api/current', (req, res) => {
  res.json({ user: req.session.user || null });
});

// Préférences stockées en session
app.get('/api/preferences', (req, res) => {
  res.json({ autoUpdate: req.session.autoUpdate !== false });
});

// Enregistre la préférence de mise à jour automatique
app.post('/api/preferences', (req, res) => {
  req.session.autoUpdate = !!req.body.autoUpdate;
  res.json({ ok: true });
});

// Informations sur la branche ou la PR en cours
app.get('/api/status', (req, res) => {
  res.json(loadStatus());
});

// Point d'enregistrement d'une action côté client
app.post('/api/log', (req, res) => {
  const user = req.session && req.session.user ? req.session.user.username : 'guest';
  const action = req.body && req.body.action ? req.body.action : 'event';
  const detail = req.body && req.body.url ? req.body.url : '';
  log(`${user} ${action} ${detail}`.trim());
  res.json({ ok: true });
});

// Liste les cinq dernières pull requests du dépôt
app.get('/api/prs', async (req, res) => {
  try {
    const prs = await getLatestPRs();
    res.json({ prs });
  } catch (e) {
    console.error('prs fetch', e);
    res.status(500).json({ error: 'github' });
  }
});

// Dépôt à partir duquel récupérer les mises à jour
const git = simpleGit();
const REMOTE = 'https://github.com/DRFRrobin/C02.git';

// Met à jour l'application depuis le dépôt distant
app.post('/api/update', async (req, res) => {
  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === 'origin');
    if (!origin) {
      await git.addRemote('origin', REMOTE);
    }

    const branch = req.body.branch || req.query.branch;
    const pr = req.body.pr || req.query.pr;
    if (pr && !/^\d+$/.test(pr)) {
      return res.status(400).json({ error: 'invalid pr' });
    }

    await git.fetch(['--all']);
    if (pr) {
      await git.fetch('origin', `pull/${pr}/head`);
      await git.reset(['--hard', 'FETCH_HEAD']);
      saveStatus({ pr: Number(pr) });
    } else {
      const target = branch ? `origin/${branch}` : 'origin/main';
      await git.reset(['--hard', target]);
      saveStatus({ branch: branch || 'main' });
    }

    log('update success ' + (pr ? 'pr ' + pr : branch ? 'branch ' + branch : 'main'));
    res.json({ updated: true });
  } catch (e) {
    console.error('update error', e);
    log('update error');
    res.status(500).json({ error: 'git' });
  }
});

// Liste tous les utilisateurs (admin uniquement)
app.get('/api/users', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  const users = loadUsers().map((u) => ({ username: u.username, role: u.role }));
  res.json({ users });
});

// Création d'un nouvel utilisateur
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

// Modification d'un utilisateur existant
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

// Suppression d'un utilisateur
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

// Renvoie la liste des jeux disponibles
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
// Démarrage du serveur HTTP
app.listen(PORT, () => {
  log('Server listening on ' + PORT);
  console.log('Server listening on ' + PORT);
});
