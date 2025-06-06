class Paddle {
  constructor(x, color, speed, height) {
    this.x = x;
    this.y = 0;
    this.width = 10;
    this.height = 80;
    this.color = color;
    this.speed = speed;
    this.canvasHeight = height;
  }

  move(dir) {
    this.y += dir * this.speed;
    this.clamp();
  }

  aiMove(targetY, diff) {
    this.y += (targetY - (this.y + this.height / 2)) * diff;
    this.clamp();
  }

  clamp() {
    this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Ball {
  constructor(speed) {
    this.radius = 8;
    this.baseSpeed = speed;
    this.vx = speed;
    this.vy = speed;
    this.x = 0;
    this.y = 0;
  }

  reset(w, h) {
    this.x = w / 2;
    this.y = h / 2;
    const dir = Math.random() < 0.5 ? 1 : -1;
    this.vx = dir * this.baseSpeed;
    this.vy = (Math.random() * 2 - 1) * this.baseSpeed;
  }

  update(game) {
    this.x += this.vx;
    this.y += this.vy;
    const h = game.height;
    if (this.y <= 0 || this.y >= h) this.vy *= -1;
  }

  draw(ctx) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

class PowerUp {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.active = false;
    this.radius = 6;
    this.x = 0;
    this.y = 0;
    this.timer = 0;
  }

  spawn() {
    this.x = Math.random() * (this.w - 40) + 20;
    this.y = Math.random() * (this.h - 40) + 20;
    this.active = true;
    this.timer = Date.now();
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  update() {
    if (this.active && Date.now() - this.timer > 8000) this.active = false;
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.keys = {};
    this.running = false;
    this.paused = false;
    this.demo = true;
    this.mode = 'pvp';

    this.paddleSpeed = 6;
    this.ballSpeed = 4;
    this.aiLevel = 0.05;
    this.powerUps = false;
    this.lastPower = 0;
    this.maxScore = 5;
    this.infinite = false;
    this.accelInterval = 0;
    this.bounce = 0;

    this.p1 = new Paddle(20, '#fff', this.paddleSpeed, this.height);
    this.p2 = new Paddle(this.width - 30, '#fff', this.paddleSpeed, this.height);
    this.ball = new Ball(this.ballSpeed);
    this.ball.reset(this.width, this.height);
    this.powerUp = new PowerUp(this.width, this.height);
    this.score1 = 0;
    this.score2 = 0;
  }

  resize() {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.p1.canvasHeight = this.height;
    this.p2.canvasHeight = this.height;
    this.p2.x = this.width - 30;
  }

  start(opts) {
    this.running = true;
    this.demo = false;
    this.paused = false;
    Object.assign(this, opts);
    this.p1.color = opts.colors[0];
    this.p2.color = opts.colors[1];
    this.p1.speed = this.paddleSpeed;
    this.p2.speed = this.paddleSpeed;
    this.ball.baseSpeed = this.ballSpeed;
    this.ball.reset(this.width, this.height);
    this.score1 = 0;
    this.score2 = 0;
    this.bounce = 0;
  }

  togglePause() {
    if (!this.running) return;
    this.paused = !this.paused;
  }

  handleInput() {
    if (this.demo) return;
    const k = this.keys;
    if (k['z'] || k['Z']) this.p1.move(-1);
    if (k['s'] || k['S']) this.p1.move(1);
    if (this.mode === 'pvp') {
      if (k['ArrowUp']) this.p2.move(-1);
      if (k['ArrowDown']) this.p2.move(1);
    } else {
      this.p2.aiMove(this.ball.y, this.aiLevel);
    }
  }

  update() {
    if (this.paused) return;
    this.handleInput();
    if (this.demo) {
      this.p1.aiMove(this.ball.y, 0.05);
      this.p2.aiMove(this.ball.y, 0.05);
    }
    this.ball.update(this);

    if (
      this.ball.x <= this.p1.x + 10 &&
      this.ball.y > this.p1.y &&
      this.ball.y < this.p1.y + this.p1.height
    ) {
      this.ball.vx = Math.abs(this.ball.vx);
      this.onBounce();
    }

    if (
      this.ball.x >= this.p2.x - 2 &&
      this.ball.y > this.p2.y &&
      this.ball.y < this.p2.y + this.p2.height
    ) {
      this.ball.vx = -Math.abs(this.ball.vx);
      this.onBounce();
    }

    if (this.ball.x < 0) {
      this.score2++;
      this.ball.reset(this.width, this.height);
    }
    if (this.ball.x > this.width) {
      this.score1++;
      this.ball.reset(this.width, this.height);
    }

    if (this.powerUps) {
      if (!this.powerUp.active && Date.now() - this.lastPower > 10000) {
        this.powerUp.spawn();
        this.lastPower = Date.now();
      }
      if (
        this.powerUp.active &&
        Math.hypot(this.ball.x - this.powerUp.x, this.ball.y - this.powerUp.y) <
          this.ball.radius + this.powerUp.radius
      ) {
        this.powerUp.active = false;
        this.p1.height = 120;
        this.p2.height = 120;
        setTimeout(() => {
          this.p1.height = 80;
          this.p2.height = 80;
        }, 5000);
      }
    }

    this.powerUp.update();
    if (!this.infinite && (this.score1 >= this.maxScore || this.score2 >= this.maxScore))
      this.end();
  }

  onBounce() {
    this.bounce++;
    if (this.accelInterval && this.bounce % this.accelInterval === 0) {
      this.ball.vx *= 1.1;
      this.ball.vy *= 1.1;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.p1.draw(this.ctx);
    this.p2.draw(this.ctx);
    this.ball.draw(this.ctx);
    this.powerUp.draw(this.ctx);
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(this.score1, this.width / 4, 30);
    this.ctx.fillText(this.score2, (3 * this.width) / 4, 30);
  }

  end() {
    this.running = false;
  }
}

window.PongGame = Game;
