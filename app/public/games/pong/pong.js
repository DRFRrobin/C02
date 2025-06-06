import {Game} from './engine.js';

const canvas=document.getElementById('pong');
const menu=document.getElementById('menu');
const pauseOverlay=document.getElementById('pause');
const endOverlay=document.getElementById('end');
const pages=document.getElementById('pages');
const historyBox=document.getElementById('history');
const pauseBtn=document.getElementById('pauseBtn');
const color1Input=document.getElementById('color1');
const color2Input=document.getElementById('color2');
const trailColorInput=document.getElementById('trailColor');
const scoreBox=document.getElementById('score');
const timerBox=document.getElementById('timer');
const mapSelect=document.getElementById('mapSelect');

async function loadMapList(){
  const res=await fetch('maps/maps.json');
  const maps=await res.json();
  mapSelect.innerHTML='';
  maps.forEach(m=>{
    const opt=document.createElement('option');
    opt.value=m.file;opt.textContent=m.name;mapSelect.appendChild(opt);
  });
}

async function loadMap(file){
  if(!file) return game.loadMap({});
  const res=await fetch('maps/'+file);
  const data=await res.json();
  game.loadMap(data);
}

const p1NameInput=document.getElementById('p1Name');
const p2NameInput=document.getElementById('p2Name');
const modeSelect=document.getElementById('mode');
const maxScoreInput=document.getElementById('maxScore');
const infiniteCheckbox=document.getElementById('infinite');
const accelInput=document.getElementById('accel');
const paddleSpeedInput=document.getElementById('paddleSpeed');
const ballSpeedInput=document.getElementById('ballSpeed');
const aiLevelInput=document.getElementById('aiLevel');

let game=new Game(canvas);
let running=false;
let paused=false;
let demo=true;
let currentPage=0;

function loadPrefs(){
  const data=JSON.parse(localStorage.getItem('pongPrefs')||'{}');
  if(data.colors){color1Input.value=data.colors[0];color2Input.value=data.colors[1];}
  if(data.trail) trailColorInput.value=data.trail;
}
function savePrefs(){
  localStorage.setItem('pongPrefs',JSON.stringify({colors:[color1Input.value,color2Input.value],trail:trailColorInput.value}));
}
function loadHistory(){
  const hist=JSON.parse(localStorage.getItem('pongHistory')||'[]');
  historyBox.innerHTML='';
  hist.forEach(h=>{
    const div=document.createElement('div');
    div.textContent=`${h.p1} ${h.s1} - ${h.s2} ${h.p2}`;
    historyBox.appendChild(div);
  });
}
function addHistory(entry){
  const hist=JSON.parse(localStorage.getItem('pongHistory')||'[]');
  hist.unshift(entry);while(hist.length>5)hist.pop();
  localStorage.setItem('pongHistory',JSON.stringify(hist));
}

function startGame(){
  running=true;demo=false;paused=false;
  menu.classList.add('hidden');
  pauseBtn.classList.remove('hidden');
  game.options({
    paddleSpeed:parseInt(paddleSpeedInput.value,10)||6,
    ballSpeed:parseInt(ballSpeedInput.value,10)||4,
    aiLevel:parseInt(aiLevelInput.value,10)||5,
    maxScore:parseInt(maxScoreInput.value,10)||5,
    infinite:infiniteCheckbox.checked,
    trailColor:trailColorInput.value
  });
  game.mode=modeSelect.value;
  game.p1.color=color1Input.value;
  game.p2.color=color2Input.value;
  loadMap(mapSelect.value).then(()=>game.start());
}

function endGame(){
  running=false;
  addHistory({p1:p1NameInput.value,p2:p2NameInput.value,s1:game.score1,s2:game.score2});
  document.getElementById('endMsg').textContent=`${p1NameInput.value} ${game.score1} - ${game.score2} ${p2NameInput.value}`;
  endOverlay.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
  loadHistory();
}

function togglePause(){
  if(!running)return;
  paused=!paused;
  pauseOverlay.classList.toggle('hidden',!paused);
  if(paused) game.running=false; else {game.running=true;}
}

window.addEventListener('visibilitychange',()=>{if(document.hidden&&running){togglePause();}});

pauseBtn.addEventListener('click',togglePause);
document.getElementById('resumeBtn').addEventListener('click',()=>{paused=false;pauseOverlay.classList.add('hidden');game.running=true;});
document.getElementById('pauseMenuBtn').addEventListener('click',()=>{paused=false;running=false;game.running=false;pauseOverlay.classList.add('hidden');endOverlay.classList.add('hidden');menu.classList.remove('hidden');demo=true;currentPage=0;updatePage();loadHistory();});
document.getElementById('quitBtn').addEventListener('click',()=>{paused=false;pauseOverlay.classList.add('hidden');endGame();});
document.getElementById('startBtn').addEventListener('click',()=>{currentPage=1;updatePage();});
document.querySelectorAll('.next').forEach(btn=>btn.addEventListener('click',()=>{currentPage++;updatePage();}));
document.querySelectorAll('.prev').forEach(btn=>btn.addEventListener('click',()=>{currentPage=Math.max(0,currentPage-1);updatePage();}));
document.getElementById('launch').addEventListener('click',startGame);

document.getElementById('openSettings').addEventListener('click',()=>{savePrefs();document.getElementById('settings').classList.remove('hidden');});
document.getElementById('closeSettings').addEventListener('click',()=>{savePrefs();document.getElementById('settings').classList.add('hidden');});
document.getElementById('endMenuBtn').addEventListener('click',()=>{endOverlay.classList.add('hidden');menu.classList.remove('hidden');demo=true;currentPage=0;updatePage();loadHistory();});

function updatePage(){
  pages.style.transform=`translateX(-${currentPage*100}%)`;
}

function updateHud(){
  scoreBox.textContent=`${game.score1} - ${game.score2}`;
  const t=game.getElapsedTime();
  const m=Math.floor(t/60).toString();
  const s=(t%60).toString().padStart(2,'0');
  timerBox.textContent=`${m}:${s}`;
  if(running && !game.running) endGame();
  requestAnimationFrame(updateHud);
}

function startDemo(){
  game.mode='demo';
  game.options({});
  loadMap('classic.json').then(()=>game.start());
}

loadPrefs();
loadHistory();
updatePage();
loadMapList().then(startDemo);
updateHud();
game.loop();
