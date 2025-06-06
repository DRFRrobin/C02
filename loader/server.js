const express = require('express');
const path = require('path');
const simpleGit = require('simple-git');
const { spawn } = require('child_process');
const fs = require('fs');
const https = require('https');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const git = simpleGit(path.join(__dirname, '..', 'app'));
const REMOTE = 'https://github.com/DRFRrobin/C02.git';
const STATUS_FILE = path.join(__dirname, '..', 'current.json');

function saveStatus(info) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(info));
}

function getLatestPRs() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: '/repos/DRFRrobin/C02/pulls?per_page=5',
      headers: { 'User-Agent': 'c02-loader' },
    };
    https
      .get(options, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const prs = JSON.parse(data).map((p) => ({
              number: p.number,
              title: p.title,
            }));
            resolve(prs);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on('error', reject);
  });
}

app.get('/api/prs', async (req, res) => {
  try {
    const prs = await getLatestPRs();
    res.json({ prs });
  } catch (e) {
    console.error('prs fetch', e);
    res.status(500).json({ error: 'github' });
  }
});

app.post('/api/update', async (req, res) => {
  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === 'origin');
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

    res.json({ updated: true });
    res.on('finish', startMainServer);
  } catch (e) {
    console.error('update error', e);
    res.status(500).json({ error: 'git' });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log('Loader listening on ' + PORT));

function startMainServer() {
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'app', 'server.js')], {
    detached: true,
    stdio: 'inherit'
  });
  child.unref();
  server.close(() => process.exit(0));
}
