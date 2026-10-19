/* ===== Hero film, video version (test page /video.html) =====
   The same sticky stage and scroll progress p (0..1) as the coded film, but the picture is a
   pre-rendered clip drawn frame by frame on a canvas. Frames are WebP stills kept as blobs;
   only a small window around the playhead is decoded into ImageBitmaps at any time. */
window.__holdReady=true;
const VFILM=(function(){
 const sec=document.getElementById('film'),cv=document.getElementById('film-canvas');
 if(!sec||!cv){window.__ready=true;return null}
 const stage=sec.querySelector('.film-stage'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
 const N=240,FPS=24,src=i=>`frames/f${String(i+1).padStart(3,'0')}.webp`;
 const cl=v=>Math.max(0,Math.min(1,v)),seg=(p,a,b)=>cl((p-a)/(b-a)),sm=v=>v*v*(3-2*v);
 const beats=[...sec.querySelectorAll('.beat')].map(el=>({el,in:+el.dataset.in,peak:+el.dataset.peak,out:+el.dataset.out}));
 // scroll progress -> clip seconds. The burst (4.5s-6.5s) gets more scroll so it doesn't flash past;
 // the last frame holds while the headline settles.
 const KEYS=[[0,0],[.2,2],[.42,4.5],[.65,6.5],[.82,8],[.92,10],[1,10]];
 const frameAt=p=>{for(let k=1;k<KEYS.length;k++){const[a,s0]=KEYS[k-1],[b,s1]=KEYS[k];
  if(p<=b){const t=sm(seg(p,a,b));return Math.min(N-1,Math.round((s0+(s1-s0)*t)*FPS))}}return N-1};

 /* frames: fetch every blob (frame 0 first, then a coarse pass, then the gaps), decode near the playhead */
 const blobs=new Array(N),bmps=new Map(),pending=new Set(),WIN=10;
 let want=0,onFrame=null;
 const order=[];{const seen=new Set();[N-1,0].forEach(i=>{seen.add(i);order.push(i)});
  for(const step of [8,4,2,1])for(let i=0;i<N;i+=step)if(!seen.has(i)){seen.add(i);order.push(i)}}
 function fetchAll(list){let next=0;const run=()=>{if(next>=list.length)return;const i=list[next++];
   // blob via fetch; where fetch is blocked, fall back to a plain image element
   const viaImg=()=>{const im=new Image();im.src=src(i);return im.decode().then(()=>im)};
   fetch(src(i)).then(r=>r.ok?r.blob():viaImg()).catch(viaImg).then(b=>{blobs[i]=b;if(Math.abs(i-want)<=WIN)decode(i)}).catch(()=>{}).finally(run)};
  for(let k=0;k<6;k++)run()}
 function decode(i){if(bmps.has(i)||pending.has(i)||!blobs[i])return;pending.add(i);
  createImageBitmap(blobs[i]).then(b=>{pending.delete(i);
   if(Math.abs(i-want)>WIN+4&&i!==N-1){b.close();return}
   bmps.set(i,b);if(onFrame)onFrame(i);if(i===want||!bmps.has(want))paint()}).catch(()=>pending.delete(i))}
 function slide(){for(let d=0;d<=WIN;d++){decode(want+d);decode(want-d)}
  for(const [i,b] of bmps)if(Math.abs(i-want)>WIN+4&&i!==N-1){b.close();bmps.delete(i)}}
 function nearest(i){if(bmps.has(i))return bmps.get(i);for(let d=1;d<N;d++){if(bmps.has(i-d))return bmps.get(i-d);if(bmps.has(i+d))return bmps.get(i+d)}return null}

 /* drawing */
 let W=0,H=0,dpr=1,mobile=false,p=0,cur=0,target=0,raf=0;
 const BG='#08121a';
 function layout(){dpr=Math.min(devicePixelRatio||1,2);W=stage.clientWidth;H=stage.clientHeight;mobile=W<=760;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px'}
 function paint(){
  const img=nearest(want);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);if(!img)return;
  const rtl=document.documentElement.dir==='rtl',fin=sm(seg(p,.84,.96));
  let w,h,x,y;
  if(mobile){ // the picture sits in the upper part of the screen; captions get the lower part
   h=H*.6+(Math.min(H*.5,W)-H*.6)*sm(seg(p,.6,.9));w=h*16/9;const fx=.42+.15*sm(seg(p,.25,.8)),f=rtl?1-fx:fx;
   x=W/2-w*f;y=H*.28-h/2-fin*H*.03}
  else{ // cover, then in the finale step back and aside so the headline has room
   const s=Math.max(W/1280,H/720)*(1-fin*.25);w=1280*s;h=720*s;
   x=(W-w)/2+fin*Math.min(W*.22,360)*(rtl?-1:1);y=(H-h)/2}
  ctx.save();if(rtl){ctx.translate(W,0);ctx.scale(-1,1)}
  ctx.drawImage(img,rtl?W-x-w:x,y,w,h);ctx.restore();
  // feather any picture edge that lands inside the stage
  const F=Math.min(140,w*.12);
  const edge=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,BG);g.addColorStop(1,'rgba(8,18,26,0)');ctx.fillStyle=g;ctx.fillRect(rx,ry,rw,rh)};
  if(x>-F)edge(x,0,x+F,0,x-1,0,F+1,H);
  if(x+w<W+F)edge(x+w,0,x+w-F,0,x+w-F,0,F+1,H);
  if(y>-F)edge(0,y,0,y+F,0,y-1,W,F+1);
  if(y+h<H+F)edge(0,y+h,0,y+h-F,0,y+h-F,W,F+1);
  if(x>0)ctx.fillStyle=BG,ctx.fillRect(0,0,x,H);if(x+w<W)ctx.fillStyle=BG,ctx.fillRect(x+w,0,W-x-w,H);
  if(y>0)ctx.fillStyle=BG,ctx.fillRect(0,0,W,y);if(y+h<H)ctx.fillStyle=BG,ctx.fillRect(0,y+h,W,H-y-h);
  // vignette softens the 720p source and pulls the eye to the centre
  const v=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
 }
 function render(q){p=q;const f=frameAt(p);if(f!==want){want=f;slide()}paint();
  beats.forEach(b=>{let a=0;if(p>=b.in&&p<=b.out){a=p<b.peak?(p-b.in)/Math.max(1e-4,b.peak-b.in):(b.out>1.5?1:1-(p-b.peak)/Math.max(1e-4,b.out-b.peak))}
   a=cl(a);b.el.style.opacity=a.toFixed(3);b.el.style.visibility=a<.01?'hidden':'visible';
   if(!b.el.classList.contains('bf'))b.el.style.transform=`translateY(${((1-a)*14*(p<b.peak?1:-1)).toFixed(1)}px)`});
  $('film-hint').style.opacity=(1-seg(p,0,.05)).toFixed(3);
  $('film-fade').style.opacity=seg(p,.92,1).toFixed(3);
 }
 const progress=()=>{const r=sec.getBoundingClientRect(),span=sec.offsetHeight-stage.offsetHeight;return span>0?cl(-r.top/span):1};
 function loop(){cur+=(target-cur)*.14;if(Math.abs(target-cur)<.0005)cur=target;render(cur);raf=Math.abs(target-cur)>0?requestAnimationFrame(loop):0}
 const onScroll=()=>{target=progress();if(still){cur=target;render(cur)}else if(!raf)raf=requestAnimationFrame(loop)};
 function refresh(){layout();cur=target=progress();render(cur)}
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',refresh);
 hooks.push(refresh);

 // grain: one small noise tile, laid over the canvas by CSS
 (function(){const g=document.createElement('canvas');g.width=g.height=128;const c=g.getContext('2d'),d=c.createImageData(128,128);
  for(let i=0;i<d.data.length;i+=4){const n=Math.random()*255|0;d.data[i]=d.data[i+1]=d.data[i+2]=n;d.data[i+3]=255}
  c.putImageData(d,0,0);const el=sec.querySelector('.film-grain');if(el)el.style.backgroundImage=`url(${g.toDataURL()})`})();

 refresh();
 if(still)fetchAll([N-1]);else fetchAll(order);
 // screenshots wait until the frame for the current scroll position is on the canvas
 (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{refresh();
  const done=()=>requestAnimationFrame(()=>{window.__ready=true});
  if(bmps.has(want))done();else onFrame=i=>{if(i===want){onFrame=null;paint();done()}};slide()});
 return {refresh,render};
})();
