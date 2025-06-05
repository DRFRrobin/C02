// Affichage dynamique des jeux disponibles
const gameTiles = document.getElementById('gameTiles');

// Récupère la liste des jeux depuis le serveur
function fetchGames() {
  return fetch('/api/games').then(r => r.json());
}

// Construit les tuiles de jeux dans la page
function renderGames(list) {
  list.forEach(game => {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = game.name;
    div.addEventListener('click', () => navigate(game.link));
    gameTiles.appendChild(div);
  });
}

// Chargement initial
fetchGames().then(data => renderGames(data.games));
