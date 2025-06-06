const prList = document.getElementById('prList');
const loadBtn = document.getElementById('loadPr');
const unloadBtn = document.getElementById('unloadPr');
let selectedPr = null;

async function loadPRs() {
  try {
    const r = await fetch('/api/prs');
    if (!r.ok) return;
    const data = await r.json();
    prList.innerHTML = '';
    data.prs.forEach((pr) => {
      const div = document.createElement('div');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'pr';
      radio.value = pr.number;
      radio.id = 'pr' + pr.number;
      radio.addEventListener('change', () => (selectedPr = pr.number));
      const label = document.createElement('label');
      label.htmlFor = radio.id;
      label.textContent = '#' + pr.number + ' ' + pr.title;
      div.appendChild(radio);
      div.appendChild(label);
      prList.appendChild(div);
    });
  } catch (e) {}
}

loadBtn.addEventListener('click', async () => {
  if (!selectedPr) {
    alert('Sélectionnez une pull request');
    return;
  }
  await fetch('/api/update?pr=' + encodeURIComponent(selectedPr), { method: 'POST' });
  navigate('index.html');
});

unloadBtn.addEventListener('click', async () => {
  await fetch('/api/update', { method: 'POST' });
  navigate('index.html');
});

loadPRs();
