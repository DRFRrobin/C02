class Paddle{
  constructor(x,color){
    this.x=x;
    this.y=0;
    this.width=10;
    this.height=80;
    this.color=color;
    this.speed=6;
  }
  update(keys,up,down){
    if(keys[up]) this.y-=this.speed;
    if(keys[down]) this.y+=this.speed;
  }
  aiUpdate(target,diff){
    const center=this.y+this.height/2;
    this.y+=((target-center)/20)*diff;
  }
  constrain(h){
    this.y=Math.max(0,Math.min(h-this.height,this.y));
  }
  draw(ctx){
    ctx.fillStyle=this.color;
    ctx.fillRect(this.x,this.y,this.width,this.height);
  }
}

class Ball{
  constructor(w,h){
    this.w=w;this.h=h;
    this.baseSpeed=4;
    this.reset();
  }
  reset(){
    this.x=this.w/2;
    this.y=this.h/2;
    const dir=Math.random()<0.5?1:-1;
    this.vx=this.baseSpeed*dir;
    this.vy=(Math.random()*2-1)*this.baseSpeed/2;
  }
  update(p1,p2){
    this.x+=this.vx;
    this.y+=this.vy;
    if(this.y<=0||this.y>=this.h) this.vy*=-1;
    if(this.x<=p1.x+p1.width && this.y>p1.y && this.y<p1.y+p1.height){
      this.vx=Math.abs(this.vx);
    }
    if(this.x>=p2.x-8 && this.y>p2.y && this.y<p2.y+p2.height){
      this.vx=-Math.abs(this.vx);
    }
  }
  draw(ctx){
    ctx.fillStyle='#fff';
    ctx.beginPath();
    ctx.arc(this.x,this.y,8,0,Math.PI*2);
    ctx.fill();
  }
}

class Game{
  constructor(canvas){
    this.canvas=canvas;
    this.ctx=canvas.getContext('2d');
    this.width=canvas.width=window.innerWidth;
    this.height=canvas.height=window.innerHeight;
    this.p1=new Paddle(20,'#fff');
    this.p2=new Paddle(this.width-30,'#fff');
    this.ball=new Ball(this.width,this.height);
    this.running=false;
    this.keys={};
    this.aiLevel=0.5;
    this.paddleSpeed=6;
    this.ballSpeed=4;
    this.powerUps=[];
    window.addEventListener('keydown',e=>this.keys[e.key]=true);
    window.addEventListener('keyup',e=>this.keys[e.key]=false);
  }
  options(opts){
    this.paddleSpeed=opts.paddleSpeed||6;
    this.ballSpeed=opts.ballSpeed||4;
    this.aiLevel=(opts.aiLevel||5)/10;
    this.p1.speed=this.paddleSpeed;
    this.p2.speed=this.paddleSpeed;
    this.ball.baseSpeed=this.ballSpeed;
  }
  start(){
    this.running=true;
    this.ball.reset();
    this.loop();
    this.nextPower();
  }
  nextPower(){
    setTimeout(()=>{
      if(!this.running) return;
      this.spawnPower();
      this.nextPower();
    },8000);
  }
  spawnPower(){
    const p={x:Math.random()*this.width,y:Math.random()*this.height,type:'grow',time:Date.now()};
    this.powerUps.push(p);
  }
  update(){
    if(!this.running) return;
    this.p1.update(this.keys,'z','s');
    if(this.mode==='pvp') this.p2.update(this.keys,'ArrowUp','ArrowDown');
    else this.p2.aiUpdate(this.ball.y,this.aiLevel);
    this.p1.constrain(this.height);
    this.p2.constrain(this.height);
    this.ball.update(this.p1,this.p2);
    this.checkPower();
    if(this.ball.x<0||this.ball.x>this.width){
      this.running=false;
    }
  }
  checkPower(){
    this.powerUps=this.powerUps.filter(p=>Date.now()-p.time<7000);
    for(const p of this.powerUps){
      if(Math.abs(this.ball.x-p.x)<10 && Math.abs(this.ball.y-p.y)<10){
        this.p1.height=120;
        p.time=0;
      }
    }
  }
  draw(){
    this.ctx.fillStyle='rgba(0,0,0,0.3)';
    this.ctx.fillRect(0,0,this.width,this.height);
    this.p1.draw(this.ctx);
    this.p2.draw(this.ctx);
    this.ball.draw(this.ctx);
    for(const p of this.powerUps){
      this.ctx.fillStyle='#ff0';
      this.ctx.fillRect(p.x-7,p.y-7,14,14);
    }
  }
  loop(){
    requestAnimationFrame(()=>this.loop());
    this.update();
    this.draw();
  }
}

export {Game};
