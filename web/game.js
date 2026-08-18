(() => {
  'use strict';
  const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
  const W=960,H=600, bounds={l:25,r:935,t:58,b:575};
  const keys=new Set(), mouse={x:W/2,y:H/2,down:false};
  const images={}, sounds={}; let soundOn=true, state='splash', last=0, elapsed=0, corruptClock=0, score=0;
  const files={bg:'background.jpg',player:'player.jpg',virus:'virus.jpg',cell1:'cell1.jpg',cell2:'cell2.jpg',cell3:'cell3.jpg',splash:'splashScreen.png',intro:'introcard1.jpg',pause:'pauseScreenNew.png',win:'winScreen.jpg',lose:'loseScreen.jpg'};
  Object.entries(files).forEach(([k,v])=>{ const i=new Image(); i.src=v; images[k]=i; });
  for(const n of ['shoot','push','boom','virusSplat','cellSplat','corrupt','win','lose']) sounds[n]=new Audio(n+'.wav');
  const play=n=>{ if(!soundOn)return; const a=sounds[n]; a.currentTime=0; a.play().catch(()=>{}); };
  let player,cells,viruses,bullet,particles;
  const rand=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  function reset(){
    player={x:W/2,y:H/2,vx:0,vy:0,slow:0,push:0}; cells=[]; viruses=[]; bullet=null; particles=[]; elapsed=0; corruptClock=8;
    for(let y=0;y<10;y++)for(let x=0;x<10;x++)cells.push({x:70+x*91+rand(-12,12),y:85+y*48+rand(-8,8),vx:rand(-22,22),vy:rand(-22,22),hp:3,grace:2});
    for(let i=0;i<20;i++)viruses.push(makeVirus(rand(120,840),rand(110,530)));
  }
  const makeVirus=(x,y)=>({x,y,vx:rand(-35,35),vy:rand(-35,35),think:rand(.2,2)});
  function burst(x,y,color,count=16){ for(let i=0;i<count;i++)particles.push({x,y,vx:rand(-120,120),vy:rand(-120,120),life:rand(.25,.7),color}); }
  function begin(){ if(state==='splash'||state==='intro'||state==='win'||state==='lose'){reset();state='game';} }
  function fire(){
    if(state!=='game')return;
    if(bullet){ explode(); return; }
    const d=Math.hypot(mouse.x-player.x,mouse.y-player.y)||1; bullet={x:player.x,y:player.y,vx:(mouse.x-player.x)/d*520,vy:(mouse.y-player.y)/d*520}; play('shoot');
  }
  function push(){
    if(state!=='game'||player.push>0)return; player.push=1.25; play('push');
    for(const o of [...cells,...viruses]){const d=dist(player,o);if(d<145&&d>0){o.vx+=(o.x-player.x)/d*180;o.vy+=(o.y-player.y)/d*180;}}
  }
  function explode(){ if(!bullet)return; const p=bullet; bullet=null; play('boom'); burst(p.x,p.y,'#77eaff',28);
    viruses=viruses.filter(v=>{if(dist(p,v)<82){burst(v.x,v.y,'#69ff7d');play('virusSplat');return false;}return true;});
    cells=cells.filter(c=>{if(dist(p,c)<45){c.hp--;if(c.hp<=0){burst(c.x,c.y,'#e75555');play('cellSplat');return false;}}return true;});
  }
  function update(dt){ if(state!=='game')return; elapsed+=dt; corruptClock-=dt; player.push=Math.max(0,player.push-dt); player.slow=Math.max(0,player.slow-dt);
    const accel=player.slow?150:260; let ax=(keys.has('KeyD')||keys.has('ArrowRight'))-(keys.has('KeyA')||keys.has('ArrowLeft')), ay=(keys.has('KeyS')||keys.has('ArrowDown'))-(keys.has('KeyW')||keys.has('ArrowUp'));
    player.vx=(player.vx+ax*accel*dt)*Math.pow(.12,dt); player.vy=(player.vy+ay*accel*dt)*Math.pow(.12,dt); player.x=clamp(player.x+player.vx*dt,bounds.l,bounds.r); player.y=clamp(player.y+player.vy*dt,bounds.t,bounds.b);
    if(bullet){bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;if(bullet.x<bounds.l||bullet.x>bounds.r||bullet.y<bounds.t||bullet.y>bounds.b)explode();}
    for(const c of cells){c.grace-=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vx*=Math.pow(.7,dt);c.vy*=Math.pow(.7,dt);bounce(c);}
    for(const v of viruses){v.think-=dt;if(v.think<=0){let target=cells.reduce((a,c)=>!a||dist(v,c)<dist(v,a)?c:a,null)||player,d=dist(v,target)||1;v.vx+=(target.x-v.x)/d*65;v.vy+=(target.y-v.y)/d*65;v.think=rand(1,2.8);}let sp=Math.hypot(v.vx,v.vy);if(sp>85){v.vx*=85/sp;v.vy*=85/sp;}v.x+=v.vx*dt;v.y+=v.vy*dt;bounce(v);if(dist(v,player)<23)player.slow=3;}
    const dead=new Set(); for(const v of viruses)for(const c of cells)if(c.grace<=0&&dist(v,c)<18)dead.add(c); if(dead.size){cells=cells.filter(c=>!dead.has(c));play('corrupt');}
    if(corruptClock<=0&&cells.length){const c=cells[Math.floor(Math.random()*cells.length)];cells.splice(cells.indexOf(c),1);viruses.push(makeVirus(c.x,c.y));burst(c.x,c.y,'#9dff45');play('corrupt');corruptClock=rand(8,11);}
    if(bullet)for(const v of viruses)if(dist(bullet,v)<17){explode();break;}
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.life-=dt;}particles=particles.filter(p=>p.life>0);
    score=cells.length*100;if(!viruses.length){state='win';play('win');}else if(cells.length<=10){state='lose';play('lose');}
  }
  function bounce(o){if(o.x<bounds.l||o.x>bounds.r){o.x=clamp(o.x,bounds.l,bounds.r);o.vx*=-1;}if(o.y<bounds.t||o.y>bounds.b){o.y=clamp(o.y,bounds.t,bounds.b);o.vy*=-1;}}
  function textureCircle(img,x,y,r,tint){ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();if(img.complete&&img.naturalWidth)ctx.drawImage(img,x-r,y-r,r*2,r*2);else{ctx.fillStyle=tint;ctx.fill();}ctx.restore();ctx.strokeStyle='#ffffff55';ctx.stroke();}
  function screen(img,title,sub){ctx.fillStyle='#02070c';ctx.fillRect(0,0,W,H);if(img&&img.complete&&img.naturalWidth){ctx.globalAlpha=.8;ctx.drawImage(img,0,0,W,H);ctx.globalAlpha=1;}ctx.textAlign='center';ctx.fillStyle='#eafcff';ctx.shadowColor='#00bfff';ctx.shadowBlur=12;ctx.font='bold 44px Arial';ctx.fillText(title,W/2,H*.78);ctx.shadowBlur=0;ctx.font='20px Arial';ctx.fillText(sub,W/2,H*.86);}
  function draw(){
    if(state==='splash'){screen(images.splash,'CLICK TO PLAY','WASD / arrows move · mouse aims · click fires/detonates · Space pushes');return;} if(state==='intro'){screen(images.intro,'SAVE THE CELLS','WASD / arrows move · mouse aims · click fires/detonates · Space pushes');return;}
    if(state==='pause'){screen(images.pause,'PAUSED','Press P to resume');return;} if(state==='win'||state==='lose'){screen(images[state],state==='win'?'BODY SAVED':'INFECTION WINS',`Score ${score} · ${Math.floor(elapsed)} seconds · click or Space to retry`);return;}
    const pat=images.bg.naturalWidth?ctx.createPattern(images.bg,'repeat'):null;ctx.fillStyle=pat||'#0b1820';ctx.fillRect(0,0,W,H);ctx.fillStyle='#02070c88';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#5fe7ff55';ctx.strokeRect(bounds.l,bounds.t,bounds.r-bounds.l,bounds.b-bounds.t);
    for(const c of cells)textureCircle(images['cell'+c.hp],c.x,c.y,11,'#c75151');for(const v of viruses)textureCircle(images.virus,v.x,v.y,13,'#62d95b');
    const ang=Math.atan2(mouse.y-player.y,mouse.x-player.x);ctx.save();ctx.translate(player.x,player.y);ctx.rotate(ang);textureCircle(images.player,0,0,17,'#55cfff');ctx.strokeStyle='#bff7ff';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(27,0);ctx.stroke();ctx.restore();
    if(player.push>0){ctx.strokeStyle=`rgba(70,220,255,${player.push/1.25})`;ctx.beginPath();ctx.arc(player.x,player.y,145*(1-player.push/1.25),0,Math.PI*2);ctx.stroke();}
    if(bullet){ctx.fillStyle='#bffcff';ctx.beginPath();ctx.arc(bullet.x,bullet.y,7,0,Math.PI*2);ctx.fill();}
    for(const p of particles){ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);}ctx.globalAlpha=1;
    ctx.fillStyle='#031018dd';ctx.fillRect(0,0,W,48);ctx.fillStyle='#ecfbff';ctx.font='bold 17px Arial';ctx.textAlign='left';ctx.fillText(`SCORE ${score}`,24,30);ctx.textAlign='center';ctx.fillText(`CELLS ${cells.length}`,W/2-100,30);ctx.fillText(`VIRUSES ${viruses.length}`,W/2+110,30);ctx.textAlign='right';ctx.fillStyle=player.slow?'#ffcf54':'#aeeaff';ctx.fillText(player.slow?'SLOWED':'P: PAUSE',W-24,30);
  }
  function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;update(dt);draw();requestAnimationFrame(loop);} reset();if(new URLSearchParams(location.search).has('autostart'))state='game';requestAnimationFrame(loop);
  addEventListener('keydown',e=>{keys.add(e.code);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Space'){if(state==='game')push();else begin();}if(e.code==='KeyP'&&(state==='game'||state==='pause'))state=state==='game'?'pause':'game';});addEventListener('keyup',e=>keys.delete(e.code));
  function point(e){const r=canvas.getBoundingClientRect();mouse.x=(e.clientX-r.left)*W/r.width;mouse.y=(e.clientY-r.top)*H/r.height;}
  canvas.addEventListener('pointermove',point);canvas.addEventListener('pointerdown',e=>{point(e);if(state==='game')fire();else begin();});canvas.addEventListener('contextmenu',e=>{e.preventDefault();push();});
  document.querySelector('#sound').onclick=e=>{soundOn=!soundOn;e.currentTarget.textContent='Sound: '+(soundOn?'on':'off');};
})();
