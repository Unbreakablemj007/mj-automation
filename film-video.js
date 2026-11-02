/* ===== Hero film: "Paper to System" =====
   A sticky stage inside a tall section; scroll progress p (0..1) picks the frame of a
   pre-rendered clip, drawn on a canvas. Frames are WebP stills kept as blobs;
   only a small window around the playhead is decoded into ImageBitmaps at any time.
   The clip has 497 frames; KEEP lists the ones shipped, picked so each step between them changes the picture by
   about the same amount (dense in the fast opening, sparse in the still ending). Between two kept frames the
   player blends them, so the motion stays fluid at roughly half the download. */
window.__holdReady=true;
const VFILM=(function(){
 const sec=document.getElementById('film'),cv=document.getElementById('film-canvas');
 if(!sec||!cv){window.__ready=true;return null}
 const stage=sec.querySelector('.film-stage'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
 const N=497,FPS=24,HAS_HD=true,KEEP=[0,2,4,5,6,8,9,10,12,13,15,16,17,19,20,21,23,24,25,27,28,29,31,32,33,35,36,37,39,40,41,42,44,45,46,48,49,50,52,53,55,56,58,59,61,62,64,65,66,67,68,69,70,71,73,74,75,76,78,79,80,81,83,84,85,86,88,89,91,92,93,94,95,96,97,98,99,100,101,103,104,106,107,109,111,112,114,116,117,119,120,122,124,125,127,128,130,132,134,136,138,140,142,144,146,149,151,153,155,157,160,162,164,166,169,171,173,175,178,180,182,185,187,190,192,194,197,199,202,204,206,208,210,213,215,218,221,224,228,231,235,236,240,244,245,249,253,257,258,262,266,268,272,273,277,279,283,284,288,290,294,295,299,301,305,307,311,314,318,320,324,327,331,333,337,340,344,347,351,355,359,360,364,366,370,371,375,379,383,387,391,395,399,400,404,408,410,412,414,415,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,440,441,443,444,446,448,450,453,456,459,463,464,468,469,473,496],M=KEEP.length;
 let DIR='frames';const src=j=>`${DIR}/f${String(KEEP[j]+1).padStart(3,'0')}.webp`;
 const cl=v=>Math.max(0,Math.min(1,v)),seg=(p,a,b)=>cl((p-a)/(b-a)),sm=v=>v*v*(3-2*v);
 const beats=[...sec.querySelectorAll('.beat')].map(el=>({el,in:+el.dataset.in,peak:+el.dataset.peak,out:+el.dataset.out}));
 // scroll progress -> clip seconds, linear between keys so the push never pauses mid-film (the clip itself
 // eases out at the end): the desk mess, papers turning into cards, the running workflow, the cards flying into
 // the laptop; the last frame holds while the headline settles.
 const KEYS=[[0,0],[.18,2],[.42,7.5],[.62,12],[.8,17],[.88,20.2],[1,20.67]];
 const frameAt=p=>{for(let k=1;k<KEYS.length;k++){const[a,s0]=KEYS[k-1],[b,s1]=KEYS[k];
  if(p<=b)return Math.min(N-1,(s0+(s1-s0)*seg(p,a,b))*FPS)}return N-1};
 // a clip frame position -> the kept frame at or before it, and how far it is toward the next kept one
 const posOf=f=>{let lo=0,hi=M-1;while(hi-lo>1){const m=(lo+hi)>>1;if(KEEP[m]<=f)lo=m;else hi=m}
  if(f>=KEEP[M-1])return [M-1,0];return [lo,cl((f-KEEP[lo])/(KEEP[lo+1]-KEEP[lo]))]};

 /* frames: fetch every blob (frame 0 first, then a coarse pass, then the gaps), decode near the playhead */
 const blobs=new Array(M),bmps=new Map(),pending=new Set(),WIN=8;
 let want=0,mix=0,fpos=0,onFrame=null;   // want: kept frame at the playhead; mix: blend toward the next one
 const order=[];{const seen=new Set();[M-1,0].forEach(i=>{seen.add(i);order.push(i)});
  for(const step of [8,4,2,1])for(let i=0;i<M;i+=step)if(!seen.has(i)){seen.add(i);order.push(i)}}
 function fetchAll(list){let next=0;const run=()=>{if(next>=list.length)return;const i=list[next++];
   // blob via fetch; where fetch is blocked, fall back to a plain image element
   const viaImg=()=>{const im=new Image();im.src=src(i);return im.decode().then(()=>im)};
   fetch(src(i)).then(r=>r.ok?r.blob():viaImg()).catch(viaImg).then(b=>{blobs[i]=b;if(Math.abs(i-want)<=WIN)decode(i)}).catch(()=>{}).finally(run)};
  for(let k=0;k<6;k++)run()}
 function decode(i){if(bmps.has(i)||pending.has(i)||!blobs[i])return;pending.add(i);
  createImageBitmap(blobs[i]).then(b=>{pending.delete(i);
   if(Math.abs(i-want)>WIN+4&&i!==M-1){b.close();return}
   bmps.set(i,b);if(onFrame)onFrame(i);if(i===want||i===want+1||!bmps.has(want))paint()}).catch(()=>pending.delete(i))}
 function slide(){for(let d=0;d<=WIN;d++){decode(want+d);decode(want-d)}
  for(const [i,b] of bmps)if(Math.abs(i-want)>WIN+4&&i!==M-1){b.close();bmps.delete(i)}}
 function nearest(i){if(bmps.has(i))return i;for(let d=1;d<M;d++){if(bmps.has(i-d))return i-d;if(bmps.has(i+d))return i+d}return -1}

 /* the laptop's screen becomes a real dashboard once the last cards have flown in. The dashboard is HTML
    (#film-dash, 1600x960) mapped onto the tracked screen with a CSS homography, so its text stays sharp.
    QUADS[k-Q0]: screen corners TL,TR,BR,BL in frame k, as fractions of the frame. */
 const Q0=449 ,QUADS=[[0.53702,0.26016,0.92422,0.27499,0.91135,0.70919,0.52061,0.66329],[0.5367,0.26023,0.92406,0.27507,0.91116,0.70941,0.52027,0.6635],[0.53629,0.26032,0.92389,0.27517,0.91097,0.70963,0.51994,0.66374],[0.5359,0.2604,0.92372,0.27525,0.91079,0.70982,0.51966,0.66399],[0.53557,0.2605,0.92356,0.27534,0.91061,0.71008,0.51935,0.66422],[0.53527,0.2606,0.92339,0.27539,0.91043,0.71031,0.51903,0.66445],[0.53501,0.26067,0.92322,0.27543,0.91026,0.71047,0.51872,0.6646],[0.53482,0.2607,0.92307,0.27544,0.91011,0.71056,0.51846,0.66471],[0.5346,0.26072,0.92286,0.27547,0.90996,0.71066,0.51822,0.6648],[0.53439,0.26073,0.92269,0.27547,0.9098,0.71077,0.51798,0.66489],[0.53421,0.26076,0.92253,0.27545,0.90966,0.71084,0.51778,0.66493],[0.53401,0.26079,0.92235,0.27545,0.9095,0.71096,0.51756,0.66501],[0.53385,0.26079,0.92218,0.27544,0.90938,0.71097,0.51738,0.66504],[0.53375,0.26078,0.92207,0.27539,0.90924,0.71095,0.51724,0.66501],[0.53356,0.26073,0.92195,0.27537,0.90913,0.71087,0.51712,0.66498],[0.53344,0.26065,0.92184,0.2753,0.90905,0.71075,0.51705,0.66489],[0.53334,0.26061,0.92174,0.27525,0.90891,0.71066,0.51693,0.66483],[0.53319,0.2606,0.92162,0.27523,0.90877,0.71067,0.51679,0.66483],[0.53304,0.26058,0.92148,0.27522,0.90863,0.71068,0.51662,0.66483],[0.53291,0.26056,0.92136,0.27519,0.90853,0.71066,0.51647,0.66481],[0.53274,0.26053,0.92126,0.27516,0.9084,0.71064,0.51634,0.66477],[0.53256,0.2605,0.92115,0.27514,0.90828,0.71061,0.51621,0.66475],[0.53244,0.26049,0.92104,0.27512,0.90817,0.71057,0.5161,0.66472],[0.53227,0.26047,0.92088,0.27509,0.90803,0.71054,0.51593,0.6647],[0.53216,0.26044,0.92082,0.27507,0.90795,0.71048,0.51583,0.66468],[0.53207,0.26042,0.92074,0.27505,0.90787,0.71045,0.51575,0.66464],[0.53199,0.2604,0.92067,0.27504,0.90779,0.71042,0.51566,0.66461],[0.53193,0.26039,0.92061,0.27502,0.90775,0.7104,0.5156,0.66458],[0.53187,0.26039,0.92056,0.27501,0.9077,0.71039,0.51554,0.66457],[0.53182,0.26038,0.92052,0.27499,0.90766,0.71037,0.51549,0.66455],[0.53176,0.26039,0.92047,0.27498,0.90761,0.71037,0.51543,0.66455],[0.53174,0.26039,0.92044,0.27498,0.90758,0.71037,0.51538,0.66454],[0.53171,0.26039,0.9204,0.27498,0.90755,0.71036,0.51534,0.66456],[0.53169,0.26038,0.92038,0.27498,0.90753,0.71036,0.51531,0.66456],[0.53168,0.26038,0.92037,0.27499,0.9075,0.71036,0.51529,0.66457],[0.53167,0.26038,0.92037,0.27498,0.9075,0.71037,0.51528,0.66456],[0.53166,0.26039,0.92038,0.27498,0.90751,0.71037,0.51528,0.66455],[0.53165,0.26039,0.92038,0.27498,0.9075,0.71037,0.51527,0.66455],[0.53164,0.2604,0.92037,0.27499,0.9075,0.71038,0.51526,0.66456],[0.53164,0.2604,0.92037,0.27499,0.9075,0.71038,0.51526,0.66456],[0.53163,0.2604,0.92037,0.27499,0.9075,0.71039,0.51526,0.66456],[0.53162,0.2604,0.92037,0.27499,0.9075,0.71039,0.51526,0.66457],[0.53162,0.2604,0.92037,0.27499,0.90749,0.71039,0.51525,0.66457],[0.53162,0.26041,0.92037,0.27499,0.90749,0.71039,0.51524,0.66457],[0.53162,0.26041,0.92037,0.27499,0.9075,0.7104,0.51524,0.66457],[0.53162,0.26041,0.92038,0.275,0.90749,0.71041,0.51523,0.66458],[0.53161,0.26041,0.92038,0.275,0.9075,0.71041,0.51523,0.66458],[0.53162,0.26042,0.92037,0.275,0.90749,0.71042,0.51522,0.66458]];
 const dash=$('film-dash'),DW=1600,DH=960,DASH_IN=465,DASH_FULL=490;
 function quadToCss(q){  // unit square -> quad (Heckbert), scaled to the dashboard's box
  const [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=q,sx=x0-x1+x2-x3,sy=y0-y1+y2-y3,dx1=x1-x2,dx2=x3-x2,dy1=y1-y2,dy2=y3-y2,det=dx1*dy2-dx2*dy1;
  const g=(sx*dy2-dx2*sy)/det,h=(dx1*sy-sx*dy1)/det,a=x1-x0+g*x1,b=x3-x0+h*x3,d=y1-y0+g*y1,e=y3-y0+h*y3;
  return `matrix3d(${a/DW},${d/DW},0,${g/DW},${b/DH},${e/DH},0,${h/DH},0,0,1,0,${x0},${y0},0,1)`}
 function placeDash(k,x,y,w,h,rtl){
  if(!dash)return;const on=k>=DASH_IN&&k>=Q0;dash.style.visibility=on?'visible':'hidden';if(!on)return;
  const c=QUADS[Math.min(k-Q0,QUADS.length-1)],P=i=>[rtl?x+w-c[i*2]*w:x+c[i*2]*w,y+c[i*2+1]*h];
  // in Arabic the clip is mirrored: map the dashboard's corners to the mirrored ones so its text still reads
  const q=rtl?[P(1),P(0),P(3),P(2)]:[P(0),P(1),P(2),P(3)];
  dash.style.transform=quadToCss(q);
  dash.style.opacity=seg(k,DASH_IN,DASH_IN+6).toFixed(3);   // the screen refreshes first, then its parts appear
  dash.style.setProperty('--u',seg(k,DASH_IN+3,DASH_FULL).toFixed(3))}

 /* drawing */
 let W=0,H=0,dpr=1,mobile=false,p=0,cur=0,target=0,raf=0,textEdge=0;
 const BG='#08121a',SX=[.515,.92],SY=[.26,.71];  // where the screen sits in the clip's last frame
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
   const s0=Math.max(W/1280,H/720),L=rtl?32:textEdge+32,R=rtl?textEdge-32:W-32;
   const s1=Math.max(s0*.45,Math.min(s0*.85,(R-L)/((SX[1]-SX[0])*1280))),cf=(SX[0]+SX[1])/2;
   const x1=(L+R)/2-(rtl?1-cf:cf)*1280*s1,y1=H*.5-(SY[0]+SY[1])/2*720*s1;
   const s=s0+(s1-s0)*fin;w=1280*s;h=720*s;x=(W-1280*s0)/2*(1-fin)+x1*fin;y=(H-720*s0)/2*(1-fin)+y1*fin}
  ctx.save();if(rtl){ctx.translate(W,0);ctx.scale(-1,1)}
  ctx.drawImage(img,rtl?W-x-w:x,y,w,h);
  const nx=k===want&&mix>.02?bmps.get(want+1):null;if(nx){ctx.globalAlpha=mix;ctx.drawImage(nx,rtl?W-x-w:x,y,w,h);ctx.globalAlpha=1}
  ctx.restore();
  placeDash(k===want?Math.round(fpos):KEEP[k],x,y,w,h,rtl);
  // in the finale, settle the room behind the headline (the mug sits there) so nothing competes with the words
  if(!mobile&&fin>0){const e=rtl?W-textEdge:textEdge,g=ctx.createLinearGradient(rtl?W:0,0,rtl?W-e-160:e+160,0);
   g.addColorStop(0,`rgba(8,18,26,${(.85*fin).toFixed(3)})`);g.addColorStop(e/(e+160),`rgba(8,18,26,${(.7*fin).toFixed(3)})`);g.addColorStop(1,'rgba(8,18,26,0)');
   ctx.fillStyle=g;ctx.fillRect(0,0,W,H)}
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
 function render(q){p=q;fpos=frameAt(p);const [j,t]=posOf(fpos);mix=t;if(j!==want){want=j;slide()}paint();
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
 if(HAS_HD&&!mobile&&Math.max(W/1280,H/720)*1280*dpr>1500&&!(navigator.connection&&navigator.connection.saveData))DIR='frames-hd';
 if(still)fetchAll([M-1]);else fetchAll(order);
 // screenshots wait until the frame for the current scroll position is on the canvas
 (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{refresh();
  const done=()=>requestAnimationFrame(()=>{window.__ready=true});
  if(bmps.has(want))done();else onFrame=i=>{if(i===want){onFrame=null;paint();done()}};slide()});
 return {refresh,render};
})();
