const prInput = document.getElementById('prNumber');
const applyBtn = document.getElementById('applyPr');

applyBtn.addEventListener('click', async () => {
  const pr = prInput.value.trim();
  if (!pr) {
    alert('Veuillez saisir un numéro de pull request');
    return;
  }
  await fetch(`/api/update?pr=${encodeURIComponent(pr)}`, { method: 'POST' });
  navigate('index.html');
});
