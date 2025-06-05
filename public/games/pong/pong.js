// Récupération du canvas de jeu
const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const menu = document.getElementById('menu');
const pages = document.getElementById('pages');
const settings = document.getElementById('settings');
const pauseOverlay = document.getElementById('pause');
const endOverlay = document.getElementById('end');
const historyBox = document.getElementById('history');
const pauseBtn = document.getElementById('pauseBtn');
const pauseMenuBtn = document.getElementById('pauseMenuBtn');

const p1NameInput = document.getElementById('p1Name');
const p2NameInput = document.getElementById('p2Name');
const modeSelect = document.getElementById('mode');
const maxScoreInput = document.getElementById('maxScore');
const infiniteCheckbox = document.getElementById('infinite');
const accelInput = document.getElementById('accel');
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');

// Variables de jeu
let width, height;
let p1Y, p2Y, ballX, ballY, ballVX, ballVY;
let score1, score2;
let running = false;
let paused = false;
let demo = true;
let maxScore = 5;
let infinite = false;
let mode = 'pvp';
let accelInterval = 0;
let bounceCount = 0;
let names = ['Joueur 1', 'Joueur 2'];
let colors = ['#ffffff', '#ffffff'];
let currentPage = 0;

// Ajuste la taille du canvas lors du redimensionnement
function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  width = canvas.width;
  height = canvas.height;
}
window.addEventListener('resize', resize);
resize();

// Charge les préférences de couleur depuis le stockage local
function loadPrefs(){
  const data = JSON.parse(localStorage.getItem('pongPrefs')||'{}');
  if(data.colors){ colors = data.colors; color1Input.value = colors[0]; color2Input.value = colors[1]; }
}
function savePrefs(){
  localStorage.setItem('pongPrefs', JSON.stringify({colors}));
}

// Affiche l'historique des scores
function loadHistory(){
  const hist = JSON.parse(localStorage.getItem('pongHistory')||'[]');
  historyBox.innerHTML = hist.map(h=>`<div>${h.p1} ${h.s1} - ${h.s2} ${h.p2}</div>`).join('');
}
// Sauvegarde un nouveau résultat dans l'historique
function addHistory(entry){
  const hist = JSON.parse(localStorage.getItem('pongHistory')||'[]');
  hist.unshift(entry);
  while(hist.length>5) hist.pop();
  localStorage.setItem('pongHistory', JSON.stringify(hist));
}

// Place les raquettes et la balle au centre
function initPositions(){
  p1Y = height/2 - 40;
  p2Y = height/2 - 40;
  ballX = width/2;
  ballY = height/2;
  ballVX = Math.random()<0.5?4:-4;
  ballVY = (Math.random()*4-2);
}

// Démarre la partie avec les options choisies
function startGame(){
  names = [p1NameInput.value||'Joueur 1', p2NameInput.value||'Joueur 2'];
  mode = modeSelect.value;
  maxScore = parseInt(maxScoreInput.value,10)||5;
  infinite = infiniteCheckbox.checked;
  accelInterval = parseInt(accelInput.value,10)||0;
  score1 = 0; score2 = 0;
  running = true; demo = false; paused = false;
  menu.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  initPositions();
  bounceCount = 0;
}

// Affiche l'écran de fin de partie
function endGame(){
  running = false;
  addHistory({p1:names[0],p2:names[1],s1:score1,s2:score2});
  document.getElementById('endMsg').textContent = `${names[0]} ${score1} - ${score2} ${names[1]}`;
  endOverlay.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  loadHistory();
}

// Met la partie en pause ou la reprend
function togglePause(){
  if(!running) return;
  paused = !paused;
  pauseOverlay.classList.toggle('hidden', !paused);
}

// Mise en pause automatique si la page perd le focus
window.addEventListener('visibilitychange', () => {
  if(document.hidden && running){
    paused = true;
    pauseOverlay.classList.remove('hidden');
  }
});

// Gestion des boutons de pause et de menu
pauseBtn.addEventListener('click', togglePause);
document.getElementById('resumeBtn').addEventListener('click', () => {paused=false;pauseOverlay.classList.add('hidden');});
pauseMenuBtn.addEventListener('click', () => {
  paused=false;
  running=false;
  pauseOverlay.classList.add('hidden');
  endOverlay.classList.add('hidden');
  menu.classList.remove('hidden');
  demo=true;
  currentPage=0;
  updatePage();
  loadHistory();
});
document.getElementById('quitBtn').addEventListener('click', () => {paused=false;pauseOverlay.classList.add('hidden');endGame();});
// Navigation dans le menu multi-pages
function updatePage(){
  pages.style.transform = `translateX(-${currentPage*100}%)`;
}

document.getElementById('quitBtn').addEventListener('click', () => {paused=false;pauseOverlay.classList.add('hidden');endGame();});

// Navigation et paramètres
document.getElementById('startBtn').addEventListener('click', () => {currentPage=1;updatePage();});
document.querySelectorAll('.next').forEach(btn=>btn.addEventListener('click',()=>{currentPage++;updatePage();}));
document.querySelectorAll('.prev').forEach(btn=>btn.addEventListener('click',()=>{currentPage=Math.max(0,currentPage-1);updatePage();}));
document.getElementById('launch').addEventListener('click', startGame);
infiniteCheckbox.addEventListener('change',()=>{maxScoreInput.disabled=infiniteCheckbox.checked;});
document.getElementById('openSettings').addEventListener('click', () => settings.classList.remove('hidden'));
document.getElementById('closeSettings').addEventListener('click', () => {colors=[color1Input.value,color2Input.value];savePrefs();settings.classList.add('hidden');});
document.getElementById('endMenuBtn').addEventListener('click', ()=>{endOverlay.classList.add('hidden');menu.classList.remove('hidden');demo=true;currentPage=0;updatePage();loadHistory();});

// État des touches pressées
const keys = {};
// Suivi des touches pour déplacer les raquettes
document.addEventListener('keydown', e=>{keys[e.key]=true;if(e.key==='Escape')togglePause();});
document.addEventListener('keyup', e=>{keys[e.key]=false;});

// Logique de déplacement des éléments
function update(){
  if(paused) return;
  const speed=6;
  if(running || demo){
    if(demo){
      p1Y+=(ballY-p1Y-40)*0.05;
      p2Y+=(ballY-p2Y-40)*0.05;
    }else{
      if(keys['z']||keys['Z']) p1Y-=speed;
      if(keys['s']||keys['S']) p1Y+=speed;

      if(mode==='pvp'){
        if(keys['ArrowUp']) p2Y-=speed;
        if(keys['ArrowDown']) p2Y+=speed;
      }else{
        p2Y+=(ballY-p2Y-40)*0.05;
      }
    }
    p1Y=Math.max(0,Math.min(height-80,p1Y));
    p2Y=Math.max(0,Math.min(height-80,p2Y));
    ballX+=ballVX;
    ballY+=ballVY;
    if(ballY<=0||ballY>=height) ballVY*=-1;
    if(ballX<=30&&ballY>p1Y&&ballY<p1Y+80){ballVX=Math.abs(ballVX);bounce();}
    if(ballX>=width-30&&ballY>p2Y&&ballY<p2Y+80){ballVX=-Math.abs(ballVX);bounce();}
    if(ballX<0){score2++;resetBall();}
    if(ballX>width){score1++;resetBall();}
    if(running&&!infinite&&(score1>=maxScore||score2>=maxScore)) endGame();
  }
}

// Replace la balle au centre
function resetBall(){
  ballX=width/2;ballY=height/2;ballVX*=-1;ballVY=(Math.random()*4-2);bounceCount=0;
}

// Accélère la balle après plusieurs rebonds
function bounce(){
  bounceCount++;
  if(accelInterval && bounceCount % accelInterval === 0){
    ballVX*=1.1;
    ballVY*=1.1;
  }
}

// Dessine l'état actuel du jeu
function draw(){
  ctx.clearRect(0,0,width,height);
  ctx.fillStyle=colors[0];
  ctx.fillRect(20,p1Y,10,80);
  ctx.fillStyle=colors[1];
  ctx.fillRect(width-30,p2Y,10,80);
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(ballX,ballY,8,0,Math.PI*2);ctx.fill();
  ctx.font='20px Arial';
  ctx.fillText(score1||0,width/4,30);
  ctx.fillText(score2||0,3*width/4,30);
}

// Boucle de rendu appelée en continu
function loop(){
  requestAnimationFrame(loop);
  update();
  draw();
}

// Initialisation du jeu au chargement
loadPrefs();
loadHistory();
initPositions();
updatePage();
infiniteCheckbox.dispatchEvent(new Event('change'));
loop();
