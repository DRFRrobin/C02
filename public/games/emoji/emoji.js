const startBtn = document.getElementById('startBtn');
startBtn.disabled = true; // disable button until texts load
let texts={};
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
let running=false,last=0,spawn=0;
const interval=700;
const emojis=['\u{1F34E}','\u{1F34C}','\u{1F347}','\u{1F349}','\u{1F353}','\u{1F34D}','\u{1F34B}','\u{1F351}','\u{1F352}'];

function resize(){
  width=Math.min(window.innerWidth-40,480);
  height=Math.min(window.innerHeight-200,600);
  canvas.width=width;canvas.height=height;
  basket.y=height-30;
}
window.addEventListener('resize',resize);
resize();

function move(x){basket.x=Math.max(0,Math.min(width-basket.width,x));}
canvas.addEventListener('mousemove',e=>running&&move(e.offsetX-basket.width/2));
canvas.addEventListener('touchmove',e=>{if(!running)return;e.preventDefault();const rect=canvas.getBoundingClientRect();move(e.touches[0].clientX-rect.left-basket.width/2);},{passive:false});
document.addEventListener('keydown',e=>{if(!running)return;if(e.key==='ArrowLeft')move(basket.x-20);if(e.key==='ArrowRight')move(basket.x+20);});

function spawnItem(){const emoji=emojis[Math.floor(Math.random()*emojis.length)];items.push({emoji,x:Math.random()*(width-32)+16,y:-30,size:30,speed:2+Math.random()*2});}

function update(dt){spawn+=dt;if(spawn>interval){spawnItem();spawn=0;}items.forEach(it=>{it.y+=it.speed;});items=items.filter(it=>{if(it.y>height) return false;if(it.y>basket.y-it.size && it.x>basket.x && it.x<basket.x+basket.width){if(it.emoji==='\u{1F34E}')score++;else{lives--;if(lives<=0){gameOver();}}return false;}return true;});}

function draw(){ctx.clearRect(0,0,width,height);ctx.fillStyle='#fff';ctx.fillRect(basket.x,basket.y,basket.width,basket.height);ctx.font='28px serif';items.forEach(it=>ctx.fillText(it.emoji,it.x-15,it.y));}

function loop(t){if(!running)return;requestAnimationFrame(loop);const dt=t-(last||t);last=t;update(dt);draw();updateHUD();}

function updateHUD(){document.getElementById('score').textContent=score;document.getElementById('lives').textContent=lives;document.getElementById('best').textContent=high;document.getElementById('scoreLabel').firstChild.textContent=texts.score+': ';document.getElementById('livesLabel').firstChild.textContent=texts.lives+': ';}

function start(){
  if(running)return; // avoid extra loops
  score=0;lives=3;items=[];running=true;last=0;spawn=interval;
  startBtn.textContent=texts.restart;
  startBtn.disabled=true; // disable while game active
  loop();
}

function gameOver(){
  running=false;ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,width,height);ctx.fillStyle='#fff';ctx.font='30px Arial';ctx.fillText(texts.gameOver,width/2-ctx.measureText(texts.gameOver).width/2,height/2);
  high=Math.max(high,score);localStorage.setItem('emojiHigh',high);updateHUD();
  startBtn.disabled=false;
}

startBtn.addEventListener('click',start);
