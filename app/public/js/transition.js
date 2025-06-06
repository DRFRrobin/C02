document.addEventListener('DOMContentLoaded', () => {
  // Affiche la page une fois le DOM prêt
  document.body.classList.add('loaded');
});

// Transition visuelle lors d'un changement de page
function navigate(url) {
  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'navigate', url })
  }).catch(() => {});
  document.body.classList.remove('loaded');
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}
