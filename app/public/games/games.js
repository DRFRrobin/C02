// Conteneur des tuiles de jeux
const gameTiles = document.getElementById('gameTiles');

// Récupère la liste des jeux auprès du serveur
function fetchGames() {
  return fetch('/api/games').then(r => r.json());
}

// Génère les tuiles de jeu dans la page
function renderGames(list) {
  list.forEach(game => {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = game.name;
    div.addEventListener('click', () => navigate(game.link));
    gameTiles.appendChild(div);
  });
}

// Chargement initial de la liste
fetchGames().then(data => renderGames(data.games));
