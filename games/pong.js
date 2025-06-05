const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const menu = document.getElementById('menu');
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
const color1Input = document.getElementById('color1');
const color2Input = document.getElementById('color2');

let width, height;
let p1Y, p2Y, ballX, ballY, ballVX, ballVY;
let score1, score2;
let running = false;
let paused = false;
let demo = true;
let maxScore = 5;
let infinite = false;
let mode = 'pvp';
let names = ['Joueur 1', 'Joueur 2'];
let colors = ['#ffffff', '#ffffff'];

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  width = canvas.width;
  height = canvas.height;
}
window.addEventListener('resize', resize);
resize();

function loadPrefs(){
  const data = JSON.parse(localStorage.getItem('pongPrefs')||'{}');
  if(data.colors){ colors = data.colors; color1Input.value = colors[0]; color2Input.value = colors[1]; }
}
function savePrefs(){
  localStorage.setItem('pongPrefs', JSON.stringify({colors}));
}

function loadHistory(){
  const hist = JSON.parse(localStorage.getItem('pongHistory')||'[]');
  historyBox.innerHTML = hist.map(h=>`<div>${h.p1} ${h.s1} - ${h.s2} ${h.p2}</div>`).join('');
}
function addHistory(entry){
  const hist = JSON.parse(localStorage.getItem('pongHistory')||'[]');
  hist.unshift(entry);
  while(hist.length>5) hist.pop();
  localStorage.setItem('pongHistory', JSON.stringify(hist));
}

function initPositions(){
  p1Y = height/2 - 40;
  p2Y = height/2 - 40;
  ballX = width/2;
  ballY = height/2;
  ballVX = Math.random()<0.5?4:-4;
  ballVY = (Math.random()*4-2);
}

function startGame(){
  names = [p1NameInput.value||'Joueur 1', p2NameInput.value||'Joueur 2'];
  mode = modeSelect.value;
  maxScore = parseInt(maxScoreInput.value,10)||5;
  infinite = infiniteCheckbox.checked;
  score1 = 0; score2 = 0;
  running = true; demo = false; paused = false;
  menu.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  initPositions();
}

function endGame(){
  running = false;
  addHistory({p1:names[0],p2:names[1],s1:score1,s2:score2});
  document.getElementById('endMsg').textContent = `${names[0]} ${score1} - ${score2} ${names[1]}`;
  endOverlay.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  loadHistory();
}

function togglePause(){
  if(!running) return;
  paused = !paused;
  pauseOverlay.classList.toggle('hidden', !paused);
}

window.addEventListener('visibilitychange', () => {
  if(document.hidden && running){
    paused = true;
    pauseOverlay.classList.remove('hidden');
  }
});

pauseBtn.addEventListener('click', togglePause);
document.getElementById('resumeBtn').addEventListener('click', () => {paused=false;pauseOverlay.classList.add('hidden');});
pauseMenuBtn.addEventListener('click', () => {
  paused=false;
  running=false;
  pauseOverlay.classList.add('hidden');
  endOverlay.classList.add('hidden');
  menu.classList.remove('hidden');
  demo=true;
  loadHistory();
});
document.getElementById('quitBtn').addEventListener('click', () => {paused=false;pauseOverlay.classList.add('hidden');endGame();});
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('openSettings').addEventListener('click', () => settings.classList.remove('hidden'));
document.getElementById('closeSettings').addEventListener('click', () => {colors=[color1Input.value,color2Input.value];savePrefs();settings.classList.add('hidden');});
document.getElementById('endMenuBtn').addEventListener('click', ()=>{endOverlay.classList.add('hidden');menu.classList.remove('hidden');demo=true;loadHistory();});

const keys = {};
document.addEventListener('keydown', e=>{keys[e.key]=true;if(e.key==='Escape')togglePause();});
document.addEventListener('keyup', e=>{keys[e.key]=false;});

function update(){
  if(paused) return;
  const speed=6;
  if(running || demo){
    if(demo){
      p1Y+=(ballY-p1Y-40)*0.05;
    }else{
      if(keys['z']||keys['Z']) p1Y-=speed;
      if(keys['s']||keys['S']) p1Y+=speed;
    }

    if(mode==='pvp'){
      if(keys['ArrowUp']) p2Y-=speed;
      if(keys['ArrowDown']) p2Y+=speed;
    }else{
      p2Y+=(ballY-p2Y-40)*0.05;
    }
    p1Y=Math.max(0,Math.min(height-80,p1Y));
    p2Y=Math.max(0,Math.min(height-80,p2Y));
    ballX+=ballVX;
    ballY+=ballVY;
    if(ballY<=0||ballY>=height) ballVY*=-1;
    if(ballX<=30&&ballY>p1Y&&ballY<p1Y+80){ballVX=Math.abs(ballVX);}
    if(ballX>=width-30&&ballY>p2Y&&ballY<p2Y+80){ballVX=-Math.abs(ballVX);}
    if(ballX<0){score2++;resetBall();}
    if(ballX>width){score1++;resetBall();}
    if(running&&!infinite&&(score1>=maxScore||score2>=maxScore)) endGame();
  }
}

function resetBall(){
  ballX=width/2;ballY=height/2;ballVX*=-1;ballVY=(Math.random()*4-2);
}

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

function loop(){
  requestAnimationFrame(loop);
  update();
  draw();
}

loadPrefs();
loadHistory();
initPositions();
loop();
