const ROWS = 6, COLS = 7;
let board = [];
let currentPlayer = 1;
let vsAI = false;
const statusEl = document.getElementById('status');
const boardContainer = document.getElementById('boardContainer');
const restartBtn = document.getElementById('restart');

function initBoard() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function renderBoard() {
  const table = document.createElement('table');
  for (let r = 0; r < ROWS; r++) {
    const tr = document.createElement('tr');
    for (let c = 0; c < COLS; c++) {
      const td = document.createElement('td');
      td.dataset.col = c;
      if (board[r][c] === 1) td.classList.add('p1');
      else if (board[r][c] === 2) td.classList.add('p2');
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  boardContainer.innerHTML = '';
  boardContainer.appendChild(table);
}

function makeMove(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = currentPlayer;
      return r;
    }
  }
  return -1;
}

function countInDirection(r, c, dr, dc) {
  const player = board[r][c];
  let n = 0;
  for (let i = 1; i < 4; i++) {
    const y = r + dr * i;
    const x = c + dc * i;
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS || board[y][x] !== player) break;
    n++;
  }
  return n;
}

function checkWin(r, c) {
  const dirs = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  return dirs.some(([dx, dy]) =>
    countInDirection(r, c, dy, dx) + countInDirection(r, c, -dy, -dx) >= 3
  );
}

function isBoardFull() {
  return board.every((row) => row.every((cell) => cell !== 0));
}

function getNextOpenRow(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

function getAvailableCols() {
  const cols = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) cols.push(c);
  }
  return cols;
}

function findWinningMove(player) {
  for (let c = 0; c < COLS; c++) {
    const r = getNextOpenRow(c);
    if (r === -1) continue;
    board[r][c] = player;
    const win = checkWin(r, c);
    board[r][c] = 0;
    if (win) return c;
  }
  return -1;
}

function endGame(message) {
  statusEl.textContent = message;
  boardContainer.removeEventListener('click', handleClick);
  restartBtn.classList.remove('hidden');
}

function handleClick(e) {
  const col = parseInt(e.target.dataset.col, 10);
  if (isNaN(col)) return;
  const row = makeMove(col);
  if (row === -1) return;
  renderBoard();
  if (checkWin(row, col)) {
    endGame('Joueur ' + currentPlayer + ' a gagné !');
    return;
  }
  if (isBoardFull()) {
    endGame('Match nul');
    return;
  }
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  statusEl.textContent = vsAI && currentPlayer === 2 ? "Tour de l'ordinateur" : 'Joueur ' + currentPlayer;
  if (vsAI && currentPlayer === 2) {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  let col = findWinningMove(2);
  if (col === -1) {
    col = findWinningMove(1); // block player
  }
  if (col === -1) {
    const center = Math.floor(COLS / 2);
    if (board[0][center] === 0) {
      col = center;
    }
  }
  if (col === -1) {
    const available = getAvailableCols();
    col = available[Math.floor(Math.random() * available.length)];
  }
  const row = makeMove(col);
  renderBoard();
  if (checkWin(row, col)) {
    endGame("L'ordinateur a gagné !");
    return;
  }
  if (isBoardFull()) {
    endGame('Match nul');
    return;
  }
  currentPlayer = 1;
  statusEl.textContent = 'Joueur 1';
}

function startGame(ai) {
  vsAI = ai;
  initBoard();
  currentPlayer = 1;
  document.getElementById('menu').classList.add('hidden');
  boardContainer.classList.remove('hidden');
  restartBtn.classList.add('hidden');
  statusEl.textContent = 'Joueur 1';
  renderBoard();
  boardContainer.addEventListener('click', handleClick);
}

function backToMenu() {
  boardContainer.classList.add('hidden');
  document.getElementById('menu').classList.remove('hidden');
  restartBtn.classList.add('hidden');
  statusEl.textContent = '';
}

restartBtn.addEventListener('click', backToMenu);
document.getElementById('pvp').addEventListener('click', () => startGame(false));
document.getElementById('pvai').addEventListener('click', () => startGame(true));

