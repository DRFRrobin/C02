const express = require('express');
const path = require('path');
const simpleGit = require('simple-git');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const git = simpleGit(path.join(__dirname, '..', 'app'));
const REMOTE = 'https://github.com/DRFRrobin/C02.git';

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
    } else {
      const target = branch ? `origin/${branch}` : 'origin/main';
      await git.reset(['--hard', target]);
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
