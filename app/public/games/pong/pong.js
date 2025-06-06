const canvas=document.getElementById('pong');
const ctx=canvas.getContext('2d');
const menu=document.getElementById('menu');
const pages=document.getElementById('pages');
const settings=document.getElementById('settings');
const pauseOverlay=document.getElementById('pause');
const endOverlay=document.getElementById('end');
const historyBox=document.getElementById('history');
const pauseBtn=document.getElementById('pauseBtn');
const pauseMenuBtn=document.getElementById('pauseMenuBtn');
const p1NameInput=document.getElementById('p1Name');
const p2NameInput=document.getElementById('p2Name');
const modeSelect=document.getElementById('mode');
const maxScoreInput=document.getElementById('maxScore');
const infiniteCheckbox=document.getElementById('infinite');
const accelInput=document.getElementById('accel');
const color1Input=document.getElementById('color1');
const color2Input=document.getElementById('color2');
const paddleSpeedInput=document.getElementById('paddleSpeed');
const ballSpeedInput=document.getElementById('ballSpeed');
const aiInput=document.getElementById('aiLevel');
const powerUpsInput=document.getElementById('powerUps');
let game;let currentPage=0;let names=['Joueur 1','Joueur 2'];let colors=['#fff','#fff'];
function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;if(game) game.resize();}
window.addEventListener('resize',resize);resize();
function loadPrefs(){const data=JSON.parse(localStorage.getItem('pongPrefs')||'{}');if(data.colors){colors=data.colors;color1Input.value=colors[0];color2Input.value=colors[1];}}
function savePrefs(){localStorage.setItem('pongPrefs',JSON.stringify({colors}));}
function loadHistory(){const hist=JSON.parse(localStorage.getItem('pongHistory')||'[]');historyBox.innerHTML=hist.map(h=>`<div>${h.p1} ${h.s1} - ${h.s2} ${h.p2}</div>`).join('');}
function addHistory(entry){const hist=JSON.parse(localStorage.getItem('pongHistory')||'[]');hist.unshift(entry);while(hist.length>5)hist.pop();localStorage.setItem('pongHistory',JSON.stringify(hist));}
function initGame(){game=new PongGame(canvas);document.addEventListener('keydown',e=>{game.keys[e.key]=true;if(e.key==='Escape')togglePause();});document.addEventListener('keyup',e=>{game.keys[e.key]=false;});loop();}
function startGame(){names=[p1NameInput.value||'Joueur 1',p2NameInput.value||'Joueur 2'];const opts={mode:modeSelect.value,maxScore:parseInt(maxScoreInput.value,10)||5,infinite:infiniteCheckbox.checked,accelInterval:parseInt(accelInput.value,10)||0,colors:[color1Input.value,color2Input.value],paddleSpeed:parseFloat(paddleSpeedInput.value)||6,ballSpeed:parseFloat(ballSpeedInput.value)||4,aiLevel:parseFloat(aiInput.value)||0.05,powerUps:powerUpsInput.checked};game.start(opts);menu.classList.add('hidden');pauseBtn.classList.remove('hidden');}
function endGame(){game.running=false;addHistory({p1:names[0],p2:names[1],s1:game.score1,s2:game.score2});document.getElementById('endMsg').textContent=`${names[0]} ${game.score1} - ${game.score2} ${names[1]}`;endOverlay.classList.remove('hidden');pauseBtn.classList.add('hidden');loadHistory();}
function togglePause(){if(!game.running)return;game.togglePause();pauseOverlay.classList.toggle('hidden',!game.paused);}
window.addEventListener('visibilitychange',()=>{if(document.hidden&&game.running){game.paused=true;pauseOverlay.classList.remove('hidden');}});
pauseBtn.addEventListener('click',togglePause);document.getElementById('resumeBtn').addEventListener('click',()=>{game.paused=false;pauseOverlay.classList.add('hidden');});pauseMenuBtn.addEventListener('click',()=>{game.paused=false;game.running=false;pauseOverlay.classList.add('hidden');endOverlay.classList.add('hidden');menu.classList.remove('hidden');currentPage=0;updatePage();loadHistory();});document.getElementById('quitBtn').addEventListener('click',()=>{game.paused=false;pauseOverlay.classList.add('hidden');endGame();});document.getElementById('endMenuBtn').addEventListener('click',()=>{endOverlay.classList.add('hidden');menu.classList.remove('hidden');currentPage=0;updatePage();loadHistory();});
function updatePage(){pages.style.transform=`translateX(-${currentPage*100}%)`;}
document.getElementById('startBtn').addEventListener('click',()=>{currentPage=1;updatePage();});document.querySelectorAll('.next').forEach(btn=>btn.addEventListener('click',()=>{currentPage++;updatePage();}));document.querySelectorAll('.prev').forEach(btn=>btn.addEventListener('click',()=>{currentPage=Math.max(0,currentPage-1);updatePage();}));document.getElementById('launch').addEventListener('click',startGame);infiniteCheckbox.addEventListener('change',()=>{maxScoreInput.disabled=infiniteCheckbox.checked;});document.getElementById('openSettings').addEventListener('click',()=>settings.classList.remove('hidden'));document.getElementById('closeSettings').addEventListener('click',()=>{colors=[color1Input.value,color2Input.value];savePrefs();settings.classList.add('hidden');});
function loop(){requestAnimationFrame(loop);if(!game) return;if(!game.running&&game.demo===false) return;if(game.running&&!game.infinite&&(game.score1>=game.maxScore||game.score2>=game.maxScore)) {endGame();return;}game.update();game.draw();}
loadPrefs();loadHistory();initGame();updatePage();infiniteCheckbox.dispatchEvent(new Event('change'));
