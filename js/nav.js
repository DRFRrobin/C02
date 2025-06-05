document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('visible');
});

window.navigate = function(url) {
  document.body.classList.remove('visible');
  setTimeout(() => {
    window.location.href = url;
  }, 300);
};
