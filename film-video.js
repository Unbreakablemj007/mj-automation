/* ===== Hero film, video version (test page /video.html) =====
   The same sticky stage and scroll progress p (0..1) as the coded film, but the picture is a
   pre-rendered clip drawn frame by frame on a canvas. Frames are WebP stills kept as blobs;
   only a small window around the playhead is decoded into ImageBitmaps at any time. */
window.__holdReady=true;
const VFILM=(function(){
 const sec=document.getElementById('film'),cv=document.getElementById('film-canvas');
 if(!sec||!cv){window.__ready=true;return null}
 const stage=sec.querySelector('.film-stage'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
 const N=240,FPS=24,HAS_HD=false;let DIR='frames';const src=i=>`${DIR}/f${String(i+1).padStart(3,'0')}.webp`;
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
 function nearest(i){if(bmps.has(i))return i;for(let d=1;d<N;d++){if(bmps.has(i-d))return i-d;if(bmps.has(i+d))return i+d}return -1}

 /* the dashboard's blank fields get sample data, tracked onto the screen frame by frame.
    MATS[k-M0] maps the flattened screen (1200x780) to clip pixels in frame k. */
 const M0=196,MATS=[[0.295893,-0.00879809,455.702,-0.0618315,0.414003,195.172,-0.00016327,-1.26969e-05],[0.298935,-0.00851703,454.781,-0.0611365,0.415308,194.665,-0.000161695,-1.23408e-05],[0.301963,-0.00831297,453.888,-0.0604778,0.416498,194.225,-0.000160189,-1.19213e-05],[0.305163,-0.00816194,452.958,-0.0598444,0.417682,193.79,-0.00015857,-1.16239e-05],[0.307862,-0.00805592,452.068,-0.059362,0.418649,193.404,-0.000157415,-1.14692e-05],[0.31074,-0.00762908,451.088,-0.0588627,0.419923,192.988,-0.000156149,-1.0862e-05],[0.313245,-0.00727997,450.173,-0.0584837,0.42095,192.649,-0.00015515,-1.04704e-05],[0.315909,-0.00721596,449.322,-0.0579834,0.421878,192.272,-0.000153846,-1.04292e-05],[0.318602,-0.00718919,448.5,-0.0574801,0.422872,191.896,-0.000152467,-1.03219e-05],[0.321288,-0.00688246,447.657,-0.0569628,0.424026,191.511,-0.000151064,-9.93437e-06],[0.323642,-0.00698109,446.933,-0.056516,0.424817,191.163,-0.000149867,-1.00619e-05],[0.325978,-0.00699156,446.197,-0.0561037,0.425623,190.823,-0.000148747,-1.01113e-05],[0.328244,-0.00696627,445.517,-0.0556899,0.426495,190.484,-0.000147604,-1.00221e-05],[0.330842,-0.0067762,444.774,-0.0551451,0.42758,190.083,-0.000146133,-9.7921e-06],[0.333079,-0.00676216,444.09,-0.0547337,0.428416,189.751,-0.000145008,-9.74617e-06],[0.335265,-0.0067032,443.42,-0.0543317,0.429234,189.425,-0.000143912,-9.70158e-06],[0.337288,-0.00674819,442.802,-0.0539685,0.429954,189.119,-0.000142932,-9.74889e-06],[0.339573,-0.00663778,442.118,-0.0535351,0.430925,188.761,-0.000141705,-9.58296e-06],[0.341593,-0.00672786,441.513,-0.0531457,0.431623,188.457,-0.000140668,-9.68328e-06],[0.343595,-0.00669139,440.908,-0.0527889,0.432371,188.165,-0.000139673,-9.65586e-06],[0.345625,-0.00665932,440.323,-0.0524066,0.433158,187.862,-0.000138609,-9.55753e-06],[0.34756,-0.00675421,439.781,-0.0520588,0.433925,187.54,-0.000137579,-9.66704e-06],[0.34937,-0.00667734,439.186,-0.0517193,0.434692,187.245,-0.000136692,-9.55895e-06],[0.3511,-0.00677202,438.666,-0.0514027,0.435344,186.963,-0.000135838,-9.63612e-06],[0.352922,-0.00673861,438.113,-0.0510495,0.43608,186.664,-0.000134901,-9.59023e-06],[0.354817,-0.00682447,437.571,-0.0506433,0.43683,186.322,-0.000133825,-9.75062e-06],[0.356473,-0.00686058,437.065,-0.0503298,0.437486,186.052,-0.000132995,-9.75206e-06],[0.358149,-0.00679635,436.558,-0.050038,0.438185,185.788,-0.000132152,-9.66379e-06],[0.359752,-0.00673813,436.065,-0.0497416,0.43887,185.52,-0.000131351,-9.5869e-06],[0.36153,-0.00671719,435.565,-0.0494033,0.439635,185.234,-0.000130377,-9.50889e-06],[0.362921,-0.00675425,435.11,-0.0491808,0.440175,185.005,-0.000129734,-9.59056e-06],[0.36438,-0.00670027,434.659,-0.0489344,0.440787,184.768,-0.000129019,-9.56477e-06],[0.365686,-0.00672965,434.257,-0.0486853,0.441341,184.517,-0.000128396,-9.62164e-06],[0.367118,-0.00686042,433.853,-0.0483876,0.441991,184.227,-0.000127654,-9.71863e-06],[0.368379,-0.00676394,433.44,-0.0481585,0.442574,184.001,-0.000127059,-9.62159e-06],[0.369625,-0.00671884,433.044,-0.0479493,0.443106,183.785,-0.000126483,-9.58912e-06],[0.370895,-0.00663417,432.656,-0.0477239,0.443711,183.559,-0.000125858,-9.45213e-06],[0.372222,-0.00668775,432.277,-0.0474932,0.444316,183.315,-0.000125181,-9.46041e-06],[0.373287,-0.00662939,431.899,-0.0473172,0.444844,183.103,-0.000124716,-9.42229e-06],[0.37429,-0.00668417,431.568,-0.047181,0.44528,182.922,-0.000124331,-9.44528e-06],[0.37528,-0.0067219,431.224,-0.0469978,0.445688,182.717,-0.000123899,-9.57604e-06],[0.376723,-0.00647726,430.792,-0.0467781,0.446429,182.511,-0.000123124,-9.24935e-06],[0.377406,-0.00650208,430.509,-0.0467234,0.446758,182.372,-0.000122954,-9.31858e-06],[0.378299,-0.00652407,430.228,-0.0465353,0.447161,182.174,-0.00012256,-9.40326e-06],[0.378924,-0.00665208,430,-0.0464457,0.447454,182,-0.000122381,-9.55134e-06]];
 const MONO='500 16px "JetBrains Mono",monospace',INK='#06141a',LBL='rgba(6,20,26,.68)';
 const tile=(x,y,w,h,k,label,value)=>[x,y,w,h,k,[[18,38,MONO,LBL,label],[18,82,'800 31px Inter,sans-serif',INK,value]],1];
 // [x,y,w,h on the flat screen, first frame, [[dx,dy,font,colour,text,align]], repaint]
 // the clip lights its four tiles unevenly (two teal, two grey-blue); repainted tiles all share one colour
 const FIELDS=[
  [76,63,410,55,197,[[20,38,'700 29px Inter,sans-serif',INK,'Business pulse']]],
  [79,136,255,41,199,[[16,28,'600 19px Inter,sans-serif','#0b1d26','Synced · 19 Oct 2026']]],
  [987,68,61,44,199,[[30.5,28,'500 16px "JetBrains Mono",monospace',INK,'LIVE','center']]],
  [1067,69,58,39,200,[[29,26,'500 16px "JetBrains Mono",monospace',INK,'AI','center']]],
  [96,212,120,40,201,[[0,24,MONO,'rgba(214,236,255,.75)','REVENUE']]],
  tile(81,613,240,109,203,'AMOUNT','$4,250.00'),
  tile(346,618,230,106,207,'INVOICE','#INV-2048'),
  tile(614,620,236,110,211,'DUE DATE','24 Oct 2026'),
  tile(887,626,235,106,215,'STATUS','Paid ✓')
 ];
 function screenData(k,x,y,w,rtl){
  if(k<M0)return;const m=MATS[k-M0],sc=w/1280;
  const P=(u,v)=>{const z=m[6]*u+m[7]*v+1,fx=(m[0]*u+m[1]*v+m[2])/z*sc;return [rtl?x+w-fx:x+fx,y+(m[3]*u+m[4]*v+m[5])/z*sc]};
  ctx.save();ctx.direction='ltr';
  for(const [u,v,bw,bh,k0,lines,repaint] of FIELDS){const a=seg(k,k0,k0+5),fa=repaint?seg(k,M0,M0+4):0;if(!a&&!fa)continue;
   // a local affine per field; in Arabic the clip is mirrored, so the field is entered from its other side and the text stays readable
   const A=P(rtl?u+bw:u,v),B=P(rtl?u:u+bw,v),C=P(rtl?u+bw:u,v+bh);
   ctx.setTransform(dpr*(B[0]-A[0])/bw,dpr*(B[1]-A[1])/bw,dpr*(C[0]-A[0])/bh,dpr*(C[1]-A[1])/bh,dpr*A[0],dpr*A[1]);
   if(fa){const g=ctx.createLinearGradient(0,0,0,bh);g.addColorStop(0,'rgb(154,230,234)');g.addColorStop(1,'rgb(138,215,224)');
    ctx.globalAlpha=fa;ctx.fillStyle=g;ctx.beginPath();ctx.roundRect?ctx.roundRect(-3,-3,bw+6,bh+6,15):ctx.rect(-3,-3,bw+6,bh+6);ctx.fill()}
   ctx.globalAlpha=a;
   for(const [dx,dy,font,col,text,align] of lines){ctx.font=font;ctx.fillStyle=col;ctx.textAlign=align||'left';ctx.fillText(text,dx,dy)}}
  ctx.restore()}

 /* drawing */
 let W=0,H=0,dpr=1,mobile=false,p=0,cur=0,target=0,raf=0;
 const BG='#08121a';
 function layout(){dpr=Math.min(devicePixelRatio||1,2);W=stage.clientWidth;H=stage.clientHeight;mobile=W<=760;
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px'}
 function paint(){
  const k=nearest(want),img=bmps.get(k);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle=BG;ctx.fillRect(0,0,W,H);if(!img)return;
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
  screenData(k,x,y,w,rtl);
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
 if(HAS_HD&&!mobile&&Math.max(W/1280,H/720)*1280*dpr>1500&&!(navigator.connection&&navigator.connection.saveData))DIR='frames-hd';
 if(still)fetchAll([N-1]);else fetchAll(order);
 // screenshots wait until the frame for the current scroll position is on the canvas
 (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{refresh();
  const done=()=>requestAnimationFrame(()=>{window.__ready=true});
  if(bmps.has(want))done();else onFrame=i=>{if(i===want){onFrame=null;paint();done()}};slide()});
 return {refresh,render};
})();
