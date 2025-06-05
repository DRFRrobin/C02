document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});

function navigate(url) {
  document.body.classList.remove('loaded');
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}
