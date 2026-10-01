
(function(){
  const canvas=document.getElementById('particleCanvas'),ctx=canvas.getContext('2d');
  const src={standard:'assets/particles/strawberry.webp',halloween:'assets/particles/leaf.webp',christmas:'assets/particles/snowflake.webp'};
  const images={},bits=[];let theme='standard',last=0,acc=0;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(d,0,0,d,0,0)}
  function imageFor(t){if(!images[t]){const im=new Image();im.src=src[t];images[t]=im}return images[t]}
  function setTheme(t){theme=t||'standard';bits.length=0;imageFor(theme)}
  function spawn(){const snow=theme==='christmas',leaf=theme==='halloween';bits.push({x:Math.random()*innerWidth,y:-60,size:(snow?12:18)+Math.random()*(snow?23:28),vx:(Math.random()-.5)*(leaf?35:15),vy:(snow?16:26)+Math.random()*(snow?26:34),rot:Math.random()*Math.PI*2,spin:(Math.random()-.5)*(leaf?3.2:1.4),phase:Math.random()*6.2,sway:(snow?14:leaf?52:26)+Math.random()*28,alpha:(snow?.55:.48)+Math.random()*.25})}
  function frame(t){const dt=Math.min((t-last)/1000||0,.035);last=t;if(reduce.matches){ctx.clearRect(0,0,innerWidth,innerHeight);requestAnimationFrame(frame);return}acc+=dt;const every=theme==='christmas'?.12:theme==='halloween'?.28:.42;while(acc>every){spawn();acc-=every}ctx.clearRect(0,0,innerWidth,innerHeight);const im=imageFor(theme);for(let i=bits.length-1;i>=0;i--){const p=bits[i];p.phase+=dt*(1.2+p.size/40);const wind=Math.sin(p.phase)*p.sway;p.vx+=wind*dt*.08;p.vx*=.996;p.vy+=(theme==='christmas'?1.3:9)*dt;p.x+=(p.vx+wind*.16)*dt;p.y+=p.vy*dt;p.rot+=p.spin*dt;if(im.complete){ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.drawImage(im,-p.size/2,-p.size/2,p.size,p.size);ctx.restore()}if(p.y>innerHeight+100||p.x<-120||p.x>innerWidth+120)bits.splice(i,1)}requestAnimationFrame(frame)}
  addEventListener('resize',resize);resize();requestAnimationFrame(frame);window.BBParticles={setTheme};
})();
