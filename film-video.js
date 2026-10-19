/* ===== Hero film =====
   A sticky stage inside a tall section; scroll progress p (0..1) picks the frame of a
   pre-rendered clip, drawn on a canvas. Frames are WebP stills kept as blobs;
   only a small window around the playhead is decoded into ImageBitmaps at any time. */
window.__holdReady=true;
const VFILM=(function(){
 const sec=document.getElementById('film'),cv=document.getElementById('film-canvas');
 if(!sec||!cv){window.__ready=true;return null}
 const stage=sec.querySelector('.film-stage'),ctx=cv.getContext('2d'),$=id=>document.getElementById(id);
 const N=240,FPS=24,HAS_HD=true;let DIR='frames';const src=i=>`${DIR}/f${String(i+1).padStart(3,'0')}.webp`;
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
    MATS[k-M0] maps the flattened screen (1200x780) to clip pixels in frame k (0-based). */
 const M0=195,MATS=[[0.295893,-0.00879809,455.702,-0.0618315,0.414003,195.172,-0.00016327,-1.26969e-05],[0.298935,-0.00851703,454.781,-0.0611365,0.415308,194.665,-0.000161695,-1.23408e-05],[0.301963,-0.00831297,453.888,-0.0604778,0.416498,194.225,-0.000160189,-1.19213e-05],[0.305163,-0.00816194,452.958,-0.0598444,0.417682,193.79,-0.00015857,-1.16239e-05],[0.307862,-0.00805592,452.068,-0.059362,0.418649,193.404,-0.000157415,-1.14692e-05],[0.31074,-0.00762908,451.088,-0.0588627,0.419923,192.988,-0.000156149,-1.0862e-05],[0.313245,-0.00727997,450.173,-0.0584837,0.42095,192.649,-0.00015515,-1.04704e-05],[0.315909,-0.00721596,449.322,-0.0579834,0.421878,192.272,-0.000153846,-1.04292e-05],[0.318602,-0.00718919,448.5,-0.0574801,0.422872,191.896,-0.000152467,-1.03219e-05],[0.321288,-0.00688246,447.657,-0.0569628,0.424026,191.511,-0.000151064,-9.93437e-06],[0.323642,-0.00698109,446.933,-0.056516,0.424817,191.163,-0.000149867,-1.00619e-05],[0.325978,-0.00699156,446.197,-0.0561037,0.425623,190.823,-0.000148747,-1.01113e-05],[0.328244,-0.00696627,445.517,-0.0556899,0.426495,190.484,-0.000147604,-1.00221e-05],[0.330842,-0.0067762,444.774,-0.0551451,0.42758,190.083,-0.000146133,-9.7921e-06],[0.333079,-0.00676216,444.09,-0.0547337,0.428416,189.751,-0.000145008,-9.74617e-06],[0.335265,-0.0067032,443.42,-0.0543317,0.429234,189.425,-0.000143912,-9.70158e-06],[0.337288,-0.00674819,442.802,-0.0539685,0.429954,189.119,-0.000142932,-9.74889e-06],[0.339573,-0.00663778,442.118,-0.0535351,0.430925,188.761,-0.000141705,-9.58296e-06],[0.341593,-0.00672786,441.513,-0.0531457,0.431623,188.457,-0.000140668,-9.68328e-06],[0.343595,-0.00669139,440.908,-0.0527889,0.432371,188.165,-0.000139673,-9.65586e-06],[0.345625,-0.00665932,440.323,-0.0524066,0.433158,187.862,-0.000138609,-9.55753e-06],[0.34756,-0.00675421,439.781,-0.0520588,0.433925,187.54,-0.000137579,-9.66704e-06],[0.34937,-0.00667734,439.186,-0.0517193,0.434692,187.245,-0.000136692,-9.55895e-06],[0.3511,-0.00677202,438.666,-0.0514027,0.435344,186.963,-0.000135838,-9.63612e-06],[0.352922,-0.00673861,438.113,-0.0510495,0.43608,186.664,-0.000134901,-9.59023e-06],[0.354817,-0.00682447,437.571,-0.0506433,0.43683,186.322,-0.000133825,-9.75062e-06],[0.356473,-0.00686058,437.065,-0.0503298,0.437486,186.052,-0.000132995,-9.75206e-06],[0.358149,-0.00679635,436.558,-0.050038,0.438185,185.788,-0.000132152,-9.66379e-06],[0.359752,-0.00673813,436.065,-0.0497416,0.43887,185.52,-0.000131351,-9.5869e-06],[0.36153,-0.00671719,435.565,-0.0494033,0.439635,185.234,-0.000130377,-9.50889e-06],[0.362921,-0.00675425,435.11,-0.0491808,0.440175,185.005,-0.000129734,-9.59056e-06],[0.36438,-0.00670027,434.659,-0.0489344,0.440787,184.768,-0.000129019,-9.56477e-06],[0.365686,-0.00672965,434.257,-0.0486853,0.441341,184.517,-0.000128396,-9.62164e-06],[0.367118,-0.00686042,433.853,-0.0483876,0.441991,184.227,-0.000127654,-9.71863e-06],[0.368379,-0.00676394,433.44,-0.0481585,0.442574,184.001,-0.000127059,-9.62159e-06],[0.369625,-0.00671884,433.044,-0.0479493,0.443106,183.785,-0.000126483,-9.58912e-06],[0.370895,-0.00663417,432.656,-0.0477239,0.443711,183.559,-0.000125858,-9.45213e-06],[0.372222,-0.00668775,432.277,-0.0474932,0.444316,183.315,-0.000125181,-9.46041e-06],[0.373287,-0.00662939,431.899,-0.0473172,0.444844,183.103,-0.000124716,-9.42229e-06],[0.37429,-0.00668417,431.568,-0.047181,0.44528,182.922,-0.000124331,-9.44528e-06],[0.37528,-0.0067219,431.224,-0.0469978,0.445688,182.717,-0.000123899,-9.57604e-06],[0.376723,-0.00647726,430.792,-0.0467781,0.446429,182.511,-0.000123124,-9.24935e-06],[0.377406,-0.00650208,430.509,-0.0467234,0.446758,182.372,-0.000122954,-9.31858e-06],[0.378299,-0.00652407,430.228,-0.0465353,0.447161,182.174,-0.00012256,-9.40326e-06],[0.378924,-0.00665208,430,-0.0464457,0.447454,182,-0.000122381,-9.55134e-06]];
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
   if(fa){const g=ctx.createLinearGradient(0,0,0,bh);g.addColorStop(0,'rgb(142,242,255)');g.addColorStop(1,'rgb(128,228,248)');
    ctx.globalAlpha=fa;ctx.fillStyle=g;ctx.beginPath();ctx.roundRect?ctx.roundRect(-3,-3,bw+6,bh+6,15):ctx.rect(-3,-3,bw+6,bh+6);ctx.fill()}
   ctx.globalAlpha=a;
   for(const [dx,dy,font,col,text,align] of lines){ctx.font=font;ctx.fillStyle=col;ctx.textAlign=align||'left';ctx.fillText(text,dx,dy)}}
  ctx.restore()}

 /* the papers on the desk carry garbled AI lettering; clean titles are tracked onto them until each paper lifts.
    Per title: [text, paper colour on its left and right, patch spread, page turned round, per frame from 0: [tl.x,tl.y, tr.x,tr.y, bl.x,bl.y] of the title in clip pixels] */
 const TITLES=[["INVOICE","rgb(241,219,190)","rgb(245,224,196)",1,0,[[87.3,437.3,147.3,437.3,87.3,445.3],[87.6,437.7,147.5,437.8,87.6,445.7],[87.7,438.2,147.7,438.2,87.7,446.2],[87.9,438.7,147.9,438.7,87.9,446.7],[88.1,439.2,148.0,439.2,88.1,447.2],[88.2,439.9,148.1,439.9,88.2,447.9],[88.5,440.6,148.3,440.7,88.5,448.7],[88.7,441.4,148.5,441.5,88.7,449.5],[89.0,442.4,148.8,442.5,89.0,450.5],[89.3,443.5,149.0,443.6,89.3,451.6],[89.7,444.8,149.4,444.8,89.7,452.8],[89.8,446.1,149.5,446.1,89.9,454.1],[90.4,447.5,150.0,447.6,90.5,455.5],[90.8,449.1,150.3,449.2,90.9,457.2],[91.1,450.8,150.6,450.8,91.2,458.8],[91.5,452.6,150.9,452.7,91.6,460.7],[92.1,454.5,151.7,454.6,92.3,462.7],[92.7,456.6,152.1,456.6,92.9,464.8],[93.2,458.8,152.6,458.9,93.4,467.0],[93.6,461.2,152.8,461.3,93.8,469.4],[94.3,463.7,153.5,463.8,94.5,472.0],[95.0,466.3,154.0,466.4,95.2,474.6],[95.7,469.0,154.7,469.2,95.9,477.3],[96.3,472.0,155.3,472.1,96.5,480.3],[97.3,475.0,156.1,475.1,97.4,483.4]]],["INVOICE","rgb(248,238,225)","rgb(246,231,212)",1,0,[[482.0,452.0,541.3,445.3,482.0,458.7],[482.0,452.4,541.4,445.8,482.0,459.1],[482.0,452.8,541.4,446.2,482.0,459.5],[482.0,453.3,541.4,446.7,482.0,459.9],[482.0,453.9,541.5,447.3,482.0,460.6],[482.1,454.6,541.5,447.9,482.1,461.3],[482.1,455.3,541.6,448.7,482.0,462.0],[482.1,456.1,541.6,449.5,482.1,462.8],[482.3,457.1,541.7,450.5,482.2,463.8],[482.3,458.2,541.7,451.5,482.2,464.9],[482.3,459.4,541.7,452.7,482.3,466.1],[482.3,460.7,541.7,454.0,482.2,467.4],[482.4,462.1,541.8,455.4,482.3,468.8],[482.5,463.7,541.8,457.0,482.4,470.4],[482.6,465.3,541.8,458.6,482.5,472.0],[482.6,467.1,541.8,460.5,482.5,473.9],[482.8,469.1,541.8,462.4,482.8,475.8],[483.1,471.1,541.8,464.5,483.2,477.9],[483.2,473.3,542.1,466.6,483.0,480.1],[483.6,475.7,541.7,469.1,483.9,482.2],[483.8,478.2,541.4,471.7,484.2,484.6]]],["REPORT","rgb(170,152,128)","rgb(162,143,120)",0.6,0,[[967.3,470.0,1013.3,462.7,967.3,477.3],[967.3,470.5,1013.3,463.1,967.2,477.8],[967.2,470.9,1013.1,463.6,967.1,478.3],[967.1,471.5,1013.0,464.1,967.0,478.8],[966.9,472.0,1012.9,464.6,966.9,479.3],[966.9,472.7,1012.7,465.4,966.8,480.0],[966.7,473.5,1012.6,466.1,966.6,480.8],[966.4,474.3,1012.4,467.0,966.4,481.7],[966.3,475.3,1012.0,468.0,966.2,482.6],[966.0,476.4,1011.8,469.0,966.0,483.8],[965.9,477.6,1011.6,470.3,965.8,485.0],[965.7,479.0,1011.4,471.6,965.6,486.3],[965.6,480.3,1011.4,472.9,965.5,487.7],[965.4,481.9,1011.1,474.5,965.3,489.3],[965.1,483.7,1010.8,476.2,965.0,491.0],[964.8,485.5,1010.4,478.0,964.7,492.9],[964.4,487.4,1010.1,479.9,964.3,494.9]]],["STATEMENT","rgb(135,129,121)","rgb(122,116,110)",0.8,1,[[1105.3,363.3,1160.0,356.7,1105.3,369.3],[1105.2,363.8,1160.0,357.1,1105.2,369.8],[1105.2,364.2,1159.8,357.5,1105.2,370.2],[1105.0,364.7,1159.6,358.0,1105.1,370.7],[1104.9,365.2,1159.5,358.5,1104.9,371.3],[1104.8,366.0,1159.3,359.3,1104.8,372.0],[1104.6,366.7,1159.1,359.9,1104.6,372.7],[1104.5,367.5,1158.8,360.8,1104.4,373.5],[1104.3,368.5,1158.6,361.7,1104.2,374.5],[1103.9,369.5,1158.2,362.8,1103.7,375.5],[1103.7,370.6,1158.1,363.9,1103.7,376.7],[1103.4,371.9,1157.9,365.1,1103.3,378.0],[1102.9,373.3,1157.3,366.5,1102.8,379.4],[1102.4,374.9,1157.0,368.1,1102.4,381.0],[1102.1,376.5,1156.6,369.8,1102.0,382.6],[1101.7,378.3,1156.2,371.5,1101.6,384.4],[1100.7,380.4,1156.1,373.5,1100.8,386.6],[1100.6,382.3,1155.3,375.4,1100.4,388.4],[1100.2,384.4,1154.8,377.6,1100.0,390.6],[1098.5,387.3,1154.4,379.7,1098.2,393.7]]],["RECEIPT","rgb(210,186,162)","rgb(215,190,171)",0.5,0,[[859.7,448.7,893.7,448.7,859.7,453.3],[859.6,449.1,893.7,449.1,859.6,453.8],[859.6,449.5,893.7,449.5,859.6,454.2],[859.6,450.0,893.6,450.0,859.6,454.7],[859.3,450.6,893.2,450.6,859.3,455.3],[859.2,451.4,893.2,451.3,859.2,456.0],[858.9,452.1,892.8,452.1,858.9,456.8],[858.9,452.9,892.8,452.9,859.0,457.6],[858.7,454.0,892.7,454.0,858.8,458.7],[858.7,455.0,892.6,455.0,858.7,459.7],[858.6,456.3,892.5,456.2,858.6,460.9]]]];
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
 if(HAS_HD&&!mobile&&Math.max(W/1280,H/720)*1280*dpr>1500&&!(navigator.connection&&navigator.connection.saveData))DIR='frames-hd';
 if(still)fetchAll([N-1]);else fetchAll(order);
 // screenshots wait until the frame for the current scroll position is on the canvas
 (document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{refresh();
  const done=()=>requestAnimationFrame(()=>{window.__ready=true});
  if(bmps.has(want))done();else onFrame=i=>{if(i===want){onFrame=null;paint();done()}};slide()});
 return {refresh,render};
})();
