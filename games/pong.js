const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

const paddleWidth = 10, paddleHeight = 60;
let playerY = canvas.height/2 - paddleHeight/2;
let aiY = playerY;
let ballX = canvas.width/2, ballY = canvas.height/2;
let ballVX = 4, ballVY = 4;

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#fff';
  // player paddle
  ctx.fillRect(10, playerY, paddleWidth, paddleHeight);
  // ai paddle
  ctx.fillRect(canvas.width-20, aiY, paddleWidth, paddleHeight);
  // ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, 8, 0, Math.PI*2);
  ctx.fill();
}

function update() {
  ballX += ballVX;
  ballY += ballVY;
  if (ballY <=0 || ballY >= canvas.height) ballVY *= -1;
  if (ballX <=20 && ballY>playerY && ballY<playerY+paddleHeight) ballVX *= -1;
  if (ballX >=canvas.width-20 && ballY>aiY && ballY<aiY+paddleHeight) ballVX *= -1;
  if (ballX<0 || ballX>canvas.width){ ballX=canvas.width/2; ballY=canvas.height/2; }
  aiY += (ballY - aiY - paddleHeight/2)*0.05;
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }
loop();

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  playerY = e.clientY - rect.top - paddleHeight/2;
});
