const gameTiles = document.getElementById('gameTiles');

function fetchGames() {
  return fetch('games.json').then(r => r.json());
}

function renderGames(list) {
  list.forEach(game => {
    const div = document.createElement('div');
    div.className = 'tile';
    div.textContent = game.name;
    div.addEventListener('click', () => window.location.href = game.link);
    gameTiles.appendChild(div);
  });
}

fetchGames().then(data => renderGames(data.games));
