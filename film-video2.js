/* ===== Hero film, Seedance cut (test page /video2.html) =====
   Same engine as film-video.js with this clip's frames, timing, tracking data and framing.
   A sticky stage inside a tall section; scroll progress p (0..1) picks the frame of a
   pre-rendered clip, drawn on a canvas. Frames are WebP stills kept as blobs;
   only a small window around the playhead is decoded into ImageBitmaps at any time. */
window.__holdReady=true;
const VFILM=(function(){
 const sec=document.getElementById('film'),cv=document.getElementById('film-canvas');
 if(!sec||!cv){window.__ready=true;return null}
 const stage=sec.querySelector('.film-stage'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
 const N=121,FPS=24,HAS_HD=true;let DIR='frames2';const src=i=>`${DIR}/f${String(i+1).padStart(3,'0')}.webp`;
 const cl=v=>Math.max(0,Math.min(1,v)),seg=(p,a,b)=>cl((p-a)/(b-a)),sm=v=>v*v*(3-2*v);
 const beats=[...sec.querySelectorAll('.beat')].map(el=>({el,in:+el.dataset.in,peak:+el.dataset.peak,out:+el.dataset.out}));
 // scroll progress -> clip seconds: the desk, the lift, the flight into the screen and the chart each get
 // their stretch of scroll; the last frame holds while the headline settles.
 const KEYS=[[0,0],[.2,1],[.42,2.3],[.65,3.5],[.82,4.4],[.92,5],[1,5]];
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
 function nearest(i){if(bmps.has(i))return i;for(let d=1;d<N;d++){if(bmps.has(i-d))return i-d;if(bmps.has(i+d))return i+d}return -1}

 /* the dashboard's blank fields get sample data, tracked onto the screen frame by frame.
    MATS[k-M0] maps the flattened screen (1200x900) to clip pixels in frame k (0-based). */
 const M0=111,MATS=[[0.622508,0.00681907,499.021,0.033721,0.524785,152.204,0.000118089,1.33743e-05],[0.621149,0.00680289,499.034,0.0333838,0.524643,153.175,0.000117262,1.32239e-05],[0.620292,0.00648205,499.115,0.0333509,0.523938,154.174,0.000117018,1.25703e-05],[0.619407,0.00607813,499.209,0.0333176,0.523091,154.988,0.000116697,1.1838e-05],[0.618883,0.00602691,499.318,0.0333031,0.522647,155.647,0.000116653,1.17219e-05],[0.618319,0.00593487,499.426,0.0332418,0.522103,156.025,0.000116486,1.15249e-05],[0.617804,0.00559835,499.599,0.0332735,0.521478,156.156,0.000116442,1.10446e-05],[0.617139,0.00549335,499.711,0.0332337,0.520961,156.148,0.000116135,1.08573e-05],[0.616652,0.00544282,499.853,0.0332479,0.520619,156.11,0.000116047,1.08212e-05],[0.61593,0.0054264,500,0.0332414,0.52004,156,0.000115744,1.08528e-05]];
 const MONO='500 16px "JetBrains Mono",monospace',INK='#06141a',LBL='rgba(6,20,26,.68)';
 const LBL2='rgba(160,226,236,.8)',BTN=['rgb(214,246,250)','rgb(176,232,242)'];
 const label=(x,k,text)=>[x,722,200,30,k,[[2,22,'500 18px "JetBrains Mono",monospace',LBL2,text]]];
 const btn=(x,w,k,value)=>[x,766,w,57,k,[[w/2,40,'800 30px Inter,sans-serif',INK,value,'center']],BTN];
 // [x,y,w,h on the flat screen, first frame, [[dx,dy,font,colour,text,align]], repaint colours]
 // the clip's three buttons are thin bars in outlined boxes: each box is filled in one colour to carry a value
 const FIELDS=[
  [100,104,640,110,111,[[10,52,'700 50px Inter,sans-serif','rgba(236,250,255,.96)','Business pulse'],[12,96,'500 26px Inter,sans-serif','rgba(160,226,236,.82)','Synced · 19 Oct 2026']]],
  label(119,113,'AMOUNT'),label(470,113,'INVOICE'),label(824,113,'STATUS'),
  btn(121,251,113,'$4,250.00'),btn(472,254,115,'#INV-2048'),btn(826,256,117,'Paid ✓')
 ];
 function screenData(k,x,y,w,rtl){
  if(k<M0)return;const m=MATS[k-M0],sc=w/1280;
  const P=(u,v)=>{const z=m[6]*u+m[7]*v+1,fx=(m[0]*u+m[1]*v+m[2])/z*sc;return [rtl?x+w-fx:x+fx,y+(m[3]*u+m[4]*v+m[5])/z*sc]};
  ctx.save();ctx.direction='ltr';
  for(const [u,v,bw,bh,k0,lines,repaint] of FIELDS){const a=seg(k,k0,k0+3),fa=repaint?a:0;if(!a)continue;
   // a local affine per field; in Arabic the clip is mirrored, so the field is entered from its other side and the text stays readable
   const A=P(rtl?u+bw:u,v),B=P(rtl?u:u+bw,v),C=P(rtl?u+bw:u,v+bh);
   ctx.setTransform(dpr*(B[0]-A[0])/bw,dpr*(B[1]-A[1])/bw,dpr*(C[0]-A[0])/bh,dpr*(C[1]-A[1])/bh,dpr*A[0],dpr*A[1]);
   if(fa){const g=ctx.createLinearGradient(0,0,0,bh);g.addColorStop(0,repaint[0]);g.addColorStop(1,repaint[1]);
    ctx.globalAlpha=fa;ctx.fillStyle=g;ctx.beginPath();ctx.roundRect?ctx.roundRect(0,0,bw,bh,12):ctx.rect(0,0,bw,bh);ctx.fill()}
   ctx.globalAlpha=a;
   for(const [dx,dy,font,col,text,align] of lines){ctx.font=font;ctx.fillStyle=col;ctx.textAlign=align||'left';ctx.fillText(text,dx,dy)}}
  ctx.restore()}

 /* the papers on the desk carry garbled AI lettering; clean titles are tracked onto them until each paper lifts.
    Per title: [text, paper colour on its left and right, patch spread, page turned round, per frame from 0: [tl.x,tl.y, tr.x,tr.y, bl.x,bl.y] of the title in clip pixels] */
 const TITLES=[["INVOICE","rgb(192,154,123)","rgb(182,146,117)",1,0,[[643.4,330.3,703.4,328.7,643.6,338.3],[643.0,329.1,702.8,327.8,643.2,337.1],[643.2,331.2,702.8,329.4,643.5,339.1],[642.6,330.8,702.3,329.0,642.9,338.8],[642.6,332.4,701.9,330.3,642.9,340.3],[642.4,332.9,701.5,330.8,642.7,340.8],[642.2,333.9,701.0,331.5,642.5,341.7],[642.3,334.3,700.9,331.9,642.7,342.1],[642.1,334.1,700.6,332.4,642.4,341.9],[642.4,332.0,700.3,331.4,642.5,339.8],[642.7,330.0,700.2,330.5,642.6,337.7],[642.8,328.5,700.0,330.2,642.5,336.1],[642.7,328.9,699.9,331.7,642.3,336.5],[642.9,329.0,699.9,333.0,642.3,336.7],[643.1,330.0,700.0,334.6,642.5,337.6],[643.3,331.3,700.2,336.3,642.6,338.9],[642.9,333.7,699.9,338.8,642.2,341.3],[642.4,336.8,699.5,342.0,641.7,344.4],[642.6,340.9,700.0,346.3,641.9,348.6],[642.6,346.1,700.5,352.0,641.8,353.8]]],["STATEMENT","rgb(161,131,106)","rgb(158,128,105)",1,0,[[672.7,494.9,738.6,497.2,672.4,502.8],[672.0,494.0,737.8,496.3,671.7,501.9],[671.6,493.1,737.1,495.8,671.2,501.1],[671.3,492.5,736.4,495.1,671.0,500.4],[670.7,492.3,735.6,495.0,670.4,500.1],[670.2,492.0,734.8,494.7,669.8,499.8],[669.7,492.1,734.1,494.8,669.4,499.9],[669.2,492.5,733.4,495.2,668.9,500.3],[668.6,492.9,732.6,495.5,668.3,500.7],[668.3,493.9,732.1,496.5,668.0,501.7],[667.7,495.0,731.2,497.6,667.4,502.7],[667.2,496.1,730.5,498.7,666.9,503.8],[666.8,497.6,729.7,500.3,666.5,505.2],[666.5,499.2,728.9,502.1,666.1,506.8],[666.2,500.4,728.3,503.7,665.8,507.9],[666.0,501.8,727.3,505.4,665.5,509.2],[667.8,504.5,728.0,508.5,667.3,511.8]]],["REPORT","rgb(205,167,132)","rgb(199,160,126)",1,0,[[398.5,503.0,464.5,503.0,398.5,511.0],[399.1,502.2,465.1,502.0,399.1,510.2],[400.1,502.0,465.7,501.6,400.1,510.0],[400.4,501.4,465.5,500.8,400.4,509.3],[401.0,501.0,466.1,500.7,401.1,508.9],[401.9,500.7,466.7,500.4,401.9,508.5],[402.3,500.7,467.0,500.6,402.3,508.5],[402.7,500.9,467.1,500.7,402.7,508.7]]],["INVOICE","rgb(233,197,161)","rgb(232,195,159)",1,0,[[376.8,345.4,425.2,357.9,374.8,353.1],[376.4,345.2,425.4,357.8,374.4,353.1],[376.8,346.1,426.1,358.4,374.8,354.0],[377.6,346.8,426.3,358.9,375.7,354.6],[378.3,348.6,426.3,360.5,376.4,356.2]]]];
 function deskTitles(k,x,y,w,rtl){
  const sc=w/1280,P=(fx,fy)=>[rtl?x+w-fx*sc:x+fx*sc,y+fy*sc];
  ctx.save();ctx.direction='ltr';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  for(const [text,pl0,pr0,pad,turned,fr] of TITLES){const n=fr.length;if(k>=n)continue;
   const a=cl((n-k)/3),[ax,ay,bx,by,cx,cy]=fr[k],bw=Math.hypot(bx-ax,by-ay),bh=Math.hypot(cx-ax,cy-ay);
   // the title's local frame: origin, end of its baseline direction, end of its height direction (clip pixels).
   // A page lying the other way round reads from its far corner; in Arabic the mirrored clip is entered from the other side.
   let O=[ax,ay],X=[bx,by],Y=[cx,cy];if(turned)[O,X,Y]=[[bx+cx-ax,by+cy-ay],Y,X];
   if(rtl)[O,X,Y]=[X,O,[X[0]+Y[0]-O[0],X[1]+Y[1]-O[1]]];
   const A=P(...O),B=P(...X),C=P(...Y),sw=!!turned!==rtl,pl=sw?pr0:pl0,pr=sw?pl0:pr0;
   ctx.setTransform(dpr*(B[0]-A[0])/bw,dpr*(B[1]-A[1])/bw,dpr*(C[0]-A[0])/bh,dpr*(C[1]-A[1])/bh,dpr*A[0],dpr*A[1]);
   // cover the old lettering with a soft-edged patch of the paper's own colour
   const g=ctx.createLinearGradient(0,0,bw,0);g.addColorStop(0,pl);g.addColorStop(1,pr);ctx.fillStyle=g;
   const top=text==='RECEIPT'?.15:1;  // the receipt's title sits right at its top edge
   for(const [m,o] of [[1.1,.12],[.85,.2],[.6,.35],[.4,.6],[.22,1]]){const e=m*bh*pad;ctx.globalAlpha=a*o;ctx.fillRect(-e,-e*top,bw+2*e,bh+e+e*top)}
   // the new title fills the old one's width; a longer word shrinks to fit
   const fs=bh/.73;ctx.font=`700 ${fs}px Inter,sans-serif`;if('letterSpacing' in ctx)ctx.letterSpacing=(fs*.06)+'px';
   const tw=ctx.measureText(text).width,s=Math.min(bw/tw,1.2);
   ctx.globalAlpha=a*.92;ctx.fillStyle='rgb(38,28,22)';
   ctx.translate(0,bh/2+(bh/2)*Math.min(s,1));ctx.scale(s,Math.min(s,1));ctx.fillText(text,0,0)}
  ctx.restore()}

 /* drawing */
 let W=0,H=0,dpr=1,mobile=false,p=0,cur=0,target=0,raf=0,textEdge=0;
 const BG='#08121a',SX=[.39,.85],SY=[.22,.86];  // where the screen sits in the clip's last frame
 const bf=sec.querySelector('.bf');
 function layout(){dpr=Math.min(devicePixelRatio||1,2);W=stage.clientWidth;H=stage.clientHeight;mobile=W<=760;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px';
  // the finale's text block: the screen settles in the space beside it
  const r=bf.getBoundingClientRect(),rtl=document.documentElement.dir==='rtl';textEdge=rtl?r.left:r.right}
 function paint(){
  const k=nearest(want),img=bmps.get(k);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);if(!img)return;
  const rtl=document.documentElement.dir==='rtl',fin=sm(seg(p,.8,.93));  // the screen is aside before the headline arrives
  let w,h,x,y;
  if(mobile){ // the picture sits in the upper part of the screen; captions get the lower part
   h=H*.6+(Math.min(H*.5,W)-H*.6)*sm(seg(p,.6,.9));w=h*16/9;const fx=.45+(((SX[0]+SX[1])/2)-.45)*sm(seg(p,.25,.8)),f=rtl?1-fx:fx;
   x=W/2-w*f;y=H*.28-h/2-fin*H*.03}
  else{ // cover, then in the finale step back so the screen sits beside the headline, never under it
   const s0=Math.max(W/1280,H/720),L=rtl?40:textEdge+40,R=rtl?textEdge-40:W-40;
   const s1=Math.max(s0*.45,Math.min(s0*.85,(R-L)/((SX[1]-SX[0])*1280))),cf=(SX[0]+SX[1])/2;
   const x1=(L+R)/2-(rtl?1-cf:cf)*1280*s1,y1=H*.5-(SY[0]+SY[1])/2*720*s1;
   const s=s0+(s1-s0)*fin;w=1280*s;h=720*s;x=(W-1280*s0)/2*(1-fin)+x1*fin;y=(H-720*s0)/2*(1-fin)+y1*fin}
  ctx.save();if(rtl){ctx.translate(W,0);ctx.scale(-1,1)}
  ctx.drawImage(img,rtl?W-x-w:x,y,w,h);ctx.restore();
  deskTitles(k,x,y,w,rtl);screenData(k,x,y,w,rtl);
  // feather any picture edge that lands inside the stage
  const F=Math.min(140,w*.12);
  const edge=(x0,y0,x1,y1,rx,ry,rw,rh)=>{const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,BG);g.addColorStop(1,'rgba(8,18,26,0)');ctx.fillStyle=g;ctx.fillRect(rx,ry,rw,rh)};
  if(x>-F)edge(x,0,x+F,0,x-1,0,F+1,H);
  if(x+w<W+F)edge(x+w,0,x+w-F,0,x+w-F,0,F+1,H);
  if(y>-F)edge(0,y,0,y+F,0,y-1,W,F+1);
  if(y+h<H+F)edge(0,y+h,0,y+h-F,0,y+h-F,W,F+1);
  if(x>0)ctx.fillStyle=BG,ctx.fillRect(0,0,x,H);if(x+w<W)ctx.fillStyle=BG,ctx.fillRect(x+w,0,W-x-w,H);
  if(y>0)ctx.fillStyle=BG,ctx.fillRect(0,0,W,y);if(y+h<H)ctx.fillStyle=BG,ctx.fillRect(0,y+h,W,H-y-h);
  // a light vignette pulls the eye to the centre
  const v=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.75);
  v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.3)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
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

 refresh();
 // 1080p frames where the picture is drawn wide on a large screen; phones keep the lighter 1280 set
 if(HAS_HD&&!mobile&&Math.max(W/1280,H/720)*1280*dpr>1500&&!(navigator.connection&&navigator.connection.saveData))DIR='frames2-hd';
 if(still)fetchAll([N-1]);else fetchAll(order);
 // screenshots wait until the frame for the current scroll position is on the canvas
 (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{refresh();
  const done=()=>requestAnimationFrame(()=>{window.__ready=true});
  if(bmps.has(want))done();else onFrame=i=>{if(i===want){onFrame=null;paint();done()}};slide()});
 return {refresh,render};
})();
