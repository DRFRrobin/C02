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
    this.trail=[];
    this.reset();
  }
  reset(){
    this.x=this.w/2;
    this.y=this.h/2;
    const dir=Math.random()<0.5?1:-1;
    this.vx=this.baseSpeed*dir;
    this.vy=(Math.random()*2-1)*this.baseSpeed/2;
    this.trail=[];
  }
  update(p1,p2,obstacles){
    this.x+=this.vx;
    this.y+=this.vy;
    if(this.y<=0||this.y>=this.h) this.vy*=-1;
    if(this.x<=p1.x+p1.width && this.y>p1.y && this.y<p1.y+p1.height){
      this.vx=Math.abs(this.vx);
    }
    if(this.x>=p2.x-8 && this.y>p2.y && this.y<p2.y+p2.height){
      this.vx=-Math.abs(this.vx);
    }
    for(const o of obstacles){
      const ox=o.x*this.w, oy=o.y*this.h, ow=o.w*this.w, oh=o.h*this.h;
      if(this.x>ox-8 && this.x<ox+ow+8 && this.y>oy && this.y<oy+oh){
        this.vx*=-1;this.x+=this.vx;break;
      }
      if(this.y>oy-8 && this.y<oy+oh+8 && this.x>ox && this.x<ox+ow){
        this.vy*=-1;this.y+=this.vy;break;
      }
    }
    this.trail.push({x:this.x,y:this.y});
    while(this.trail.length>10) this.trail.shift();
  }
  draw(ctx,color){
    for(let i=0;i<this.trail.length;i++){
      const t=this.trail[i];
      const alpha=(i+1)/this.trail.length;
      ctx.fillStyle=`${color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`;
      ctx.beginPath();
      ctx.arc(t.x,t.y,8,0,Math.PI*2);
      ctx.fill();
    }
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
    this.score1=0;
    this.score2=0;
    this.maxScore=5;
    this.infinite=false;
    this.startTime=0;
    this.obstacles=[];
    this.background='#000';
    this.trailColor='#ffffff';
    window.addEventListener('keydown',e=>this.keys[e.key]=true);
    window.addEventListener('keyup',e=>this.keys[e.key]=false);
  }
  options(opts){
    this.paddleSpeed=opts.paddleSpeed||6;
    this.ballSpeed=opts.ballSpeed||4;
    this.aiLevel=(opts.aiLevel||5)/10;
    this.maxScore=opts.maxScore||5;
    this.infinite=opts.infinite||false;
    if(opts.trailColor) this.trailColor=opts.trailColor;
    this.p1.speed=this.paddleSpeed;
    this.p2.speed=this.paddleSpeed;
    this.ball.baseSpeed=this.ballSpeed;
  }
  loadMap(map){
    this.obstacles=map.obstacles||[];
    this.background=map.background||'#000';
  }
  start(){
    this.running=true;
    this.score1=0;
    this.score2=0;
    this.startTime=Date.now();
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
    else if(this.mode==='demo') this.p2.aiUpdate(this.ball.y,this.aiLevel),this.p1.aiUpdate(this.ball.y,this.aiLevel);
    else this.p2.aiUpdate(this.ball.y,this.aiLevel);
    this.p1.constrain(this.height);
    this.p2.constrain(this.height);
    this.ball.update(this.p1,this.p2,this.obstacles);
    this.checkPower();
    if(this.ball.x<0){
      this.score2++;this.ball.reset();
    }
    if(this.ball.x>this.width){
      this.score1++;this.ball.reset();
    }
    if(!this.infinite && (this.score1>=this.maxScore || this.score2>=this.maxScore)){
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
    this.ctx.fillStyle=this.background;
    this.ctx.fillRect(0,0,this.width,this.height);
    for(const o of this.obstacles){
      this.ctx.fillStyle='rgba(255,255,255,0.3)';
      this.ctx.fillRect(o.x*this.width,o.y*this.height,o.w*this.width,o.h*this.height);
    }
    this.p1.draw(this.ctx);
    this.p2.draw(this.ctx);
    this.ball.draw(this.ctx,this.trailColor);
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

  getElapsedTime(){
    return Math.floor((Date.now()-this.startTime)/1000);
  }
}

export {Game};
