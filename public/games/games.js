const gameTiles = document.getElementById('gameTiles');

function fetchGames() {
  return fetch('/api/games').then(r => r.json());
}

function renderGames(list) {
  list.forEach(game => {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = game.name;
    div.addEventListener('click', () => navigate(game.link));
    gameTiles.appendChild(div);
  });
}

fetchGames().then(data => renderGames(data.games));
