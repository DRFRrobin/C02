// Petites animations de transition entre les pages
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

// Lance la transition puis change de page
function navigate(url) {
  document.body.classList.remove('loaded');
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}
