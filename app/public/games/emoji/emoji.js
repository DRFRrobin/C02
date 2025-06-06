// Récupération des éléments de l'interface
const startBtn = document.getElementById('startBtn');
const diffSelect = document.getElementById('difficulty');
diffSelect.value = localStorage.getItem('emojiDifficulty') || 'normal';
startBtn.disabled = true; // disable button until texts load
let texts={};
// Chargement des textes en fonction de la langue
fetch('emoji-texts.json').then(r=>r.json()).then(data=>{
  const lang=navigator.language.startsWith('fr')?'fr':'en';
  texts=data[lang];
  document.title=texts.title;
  document.getElementById('title').textContent=texts.title;
  startBtn.textContent=texts.start;
  startBtn.disabled=false; // re-enable after texts are ready
  updateHUD();
});

const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
let width=canvas.width, height=canvas.height;
let basket={x:width/2-40,y:height-30,width:80,height:20};
let items=[];
let score=0,lives=3,high=Number(localStorage.getItem('emojiHigh')||0);
let running=false,last=0,spawn=0,paused=false;
let interval=700;
let speedMult=1;
const emojis=['\u{1F34E}','\u{1F34C}','\u{1F347}','\u{1F349}','\u{1F353}','\u{1F34D}','\u{1F34B}','\u{1F351}','\u{1F352}'];

// Adapte la taille du canvas à la fenêtre
function resize(){
  width=Math.min(window.innerWidth-40,480);
  height=Math.min(window.innerHeight-200,600);
  canvas.width=width;canvas.height=height;
  basket.y=height-30;
}
window.addEventListener('resize',resize);
resize();

// Déplace le panier horizontalement
function move(x){basket.x=Math.max(0,Math.min(width-basket.width,x));}
canvas.addEventListener('mousemove',e=>running&&move(e.offsetX-basket.width/2));
canvas.addEventListener('touchmove',e=>{if(!running)return;e.preventDefault();const rect=canvas.getBoundingClientRect();move(e.touches[0].clientX-rect.left-basket.width/2);},{passive:false});
document.addEventListener('keydown',e=>{
  if(e.key==='p' || e.key==='Escape'){
    if(running) paused=!paused;
    return;
  }
  if(!running || paused) return;
  if(e.key==='ArrowLeft') move(basket.x-20);
  if(e.key==='ArrowRight') move(basket.x+20);
});

// Ajoute un nouvel emoji en haut de l'écran
function spawnItem(){const emoji=emojis[Math.floor(Math.random()*emojis.length)];items.push({emoji,x:Math.random()*(width-32)+16,y:-30,size:30,speed:(2+Math.random()*2)*speedMult});}

// Met à jour la position des éléments et gère les collisions
function update(dt){spawn+=dt;if(spawn>interval){spawnItem();spawn=0;}items.forEach(it=>{it.y+=it.speed;});items=items.filter(it=>{if(it.y>height) return false;if(it.y>basket.y-it.size && it.x>basket.x && it.x<basket.x+basket.width){if(it.emoji==='\u{1F34E}')score++;else{lives--;if(lives<=0){gameOver();}}return false;}return true;});}

// Dessine le panier et les emojis
function draw(){ctx.clearRect(0,0,width,height);ctx.fillStyle='#fff';ctx.fillRect(basket.x,basket.y,basket.width,basket.height);ctx.font='28px serif';items.forEach(it=>ctx.fillText(it.emoji,it.x-15,it.y));}

function drawPauseOverlay(){
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,width,height);
  ctx.fillStyle='#fff';
  ctx.font='30px Arial';
  const msg='Paused';
  ctx.fillText(msg,width/2-ctx.measureText(msg).width/2,height/2);
}

// Boucle principale du jeu
function loop(t){
  if(!running) return;
  requestAnimationFrame(loop);
  if(paused){
    drawPauseOverlay();
    return;
  }
  const dt=t-(last||t);
  last=t;
  update(dt);
  draw();
  updateHUD();
}

// Met à jour les indicateurs à l'écran
function updateHUD(){document.getElementById('score').textContent=score;document.getElementById('lives').textContent=lives;document.getElementById('best').textContent=high;document.getElementById('scoreLabel').firstChild.textContent=texts.score+': ';document.getElementById('livesLabel').firstChild.textContent=texts.lives+': ';}

// Démarre une nouvelle partie
function start(){
  if(running)return; // avoid extra loops
  const diff=diffSelect.value;
  if(diff==='easy'){interval=900;speedMult=0.8;}else if(diff==='hard'){interval=500;speedMult=1.4;}else{interval=700;speedMult=1;}
  localStorage.setItem('emojiDifficulty',diff);
  score=0;lives=3;items=[];running=true;paused=false;last=0;spawn=interval;
  startBtn.textContent=texts.restart;
  startBtn.disabled=true; // disable while game active
  loop();
}

// Affiche l'écran de fin et sauvegarde le meilleur score
function gameOver(){
  running=false;paused=false;ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,width,height);ctx.fillStyle='#fff';ctx.font='30px Arial';ctx.fillText(texts.gameOver,width/2-ctx.measureText(texts.gameOver).width/2,height/2);
  high=Math.max(high,score);localStorage.setItem('emojiHigh',high);updateHUD();
  startBtn.disabled=false;
}

// Bouton principal pour démarrer la partie
startBtn.addEventListener('click',start);
