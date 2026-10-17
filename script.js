/* Contact links: fill these in and the buttons appear in Contact and the footer. Leave '' to hide. */
const CONTACT={
 booking:'',   // e.g. 'https://calendly.com/your-name/20min'
 whatsapp:'',  // international number, digits only, e.g. '9613123456'
 linkedin:'',  // e.g. 'https://www.linkedin.com/in/your-name'
 github:''     // e.g. 'https://github.com/your-name'
};

const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const AR=window.I18N_AR||{};
let lang='en';
/* strings built by the script, per language */
const S={
 en:{words:['AI automations','smart workflows','custom web apps','AI agents'],h:' h',mo:'/mo',
  be:(d,be)=>be>12?'> 12 months':d<14?Math.max(1,Math.round(d))+(Math.round(d)<=1?' day':' days'):be<2?Math.round(d/7)+' weeks':be.toFixed(1)+' months',
  cap:(ahead,v)=>`Net after setup, month by month. By month 12 you are ${ahead?'ahead by '+v:'behind by '+v}.`,
  start:'start',mon:m=>'mo '+m,book:'Book a free call',wa:'WhatsApp',li:'LinkedIn',gh:'GitHub',email:'Email',copy:'Copy email',copied:'Copied',
  waText:'Hi Mohammad, I would like to talk about an automation.',langBtn:'عربي',
  send:'Send message',sending:'Sending…',sent:'Thanks! Your message was sent. I will get back to you soon.',
  invalid:'Please fill in your name, a valid email and a message.',pending:'The form is waiting for activation. Please try again later, or email me directly.',
  doneTitle:n=>`Thanks${n?', '+n:''}! Your message was sent.`,doneText:e=>`I received your message and will reply to ${e} as soon as possible, usually within 1–2 business days.`,again:'Send another message',fail:'Sorry, the message could not be sent. Please email me directly at ',langLabel:'عرض الموقع بالعربية'},
 ar:{words:['أتمتة بالذكاء الاصطناعي','سير عمل ذكي','تطبيقات ويب مخصصة','وكلاء ذكاء اصطناعي'],h:' ساعة',mo:' شهريًا',
  be:(d,be)=>be>12?'أكثر من 12 شهرًا':d<14?(Math.round(d)<=1?'يوم واحد':Math.round(d)+' أيام'):be<2?Math.round(d/7)+' أسابيع':be.toFixed(1)+' أشهر',
  cap:(ahead,v)=>`الصافي بعد كلفة الإعداد، شهرًا بشهر. في الشهر 12 تكون ${ahead?'رابحًا بمقدار '+v:'خاسرًا بمقدار '+v}.`,
  start:'البداية',mon:m=>'شهر '+m,book:'احجز مكالمة مجانية',wa:'واتساب',li:'لينكدإن',gh:'GitHub',email:'البريد الإلكتروني',copy:'انسخ البريد',copied:'تم النسخ',
  waText:'مرحبًا محمد، أودّ التحدث عن أتمتة.',langBtn:'English',
  send:'أرسل الرسالة',sending:'جارٍ الإرسال…',sent:'شكرًا! تم إرسال رسالتك، وسأعود إليك قريبًا.',
  invalid:'يرجى إدخال اسمك وبريد إلكتروني صحيح ورسالتك.',pending:'النموذج بانتظار التفعيل. يرجى المحاولة لاحقًا أو مراسلتي مباشرة بالبريد.',
  doneTitle:n=>`شكرًا${n?' '+n:''}! تم إرسال رسالتك.`,doneText:e=>`وصلتني رسالتك وسأرد عليك على ${e} في أقرب وقت، عادةً خلال يوم إلى يومي عمل.`,again:'إرسال رسالة أخرى',fail:'عذرًا، تعذّر إرسال الرسالة. يرجى مراسلتي مباشرة على ',langLabel:'View the site in English'}
};
const T=k=>S[lang][k];

const btn=document.querySelector('.menu-btn'),links=document.querySelector('.links');
btn.addEventListener('click',()=>{const o=links.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
document.getElementById('yr').textContent=new Date().getFullYear();

/* contact + footer links from CONTACT */
function renderContact(){
 const box=document.getElementById('contact-links'),foot=document.getElementById('foot-social');
 box.querySelectorAll('[data-gen]').forEach(e=>e.remove());foot.querySelectorAll('[data-gen]').forEach(e=>e.remove());
 const add=(parent,href,label,cls,first)=>{const a=document.createElement('a');a.href=href;a.textContent=label;a.dataset.gen='';a.dataset.dyn='';
  if(/^https?:/.test(href)){a.target='_blank';a.rel='noopener'}if(cls)a.className=cls;first?parent.prepend(a):parent.append(a)};
 const wa=CONTACT.whatsapp&&'https://wa.me/'+CONTACT.whatsapp.replace(/\D/g,'')+'?text='+encodeURIComponent(T('waText'));
 if(CONTACT.linkedin)add(box,CONTACT.linkedin,T('li'),'btn btn-in');
 if(wa)add(box,wa,T('wa'),'btn btn-wa',true);
 if(CONTACT.booking)add(box,CONTACT.booking,T('book'),'btn',true);
 if(CONTACT.booking)add(foot,CONTACT.booking,T('book'));if(wa)add(foot,wa,T('wa'));if(CONTACT.linkedin)add(foot,CONTACT.linkedin,T('li'));if(CONTACT.github)add(foot,CONTACT.github,T('gh'));
}

/* ---------- language switch (English / Arabic) ---------- */
const orig=new WeakMap(),origAttr=new WeakMap();
const norm=s=>s.trim().replace(/\s+/g,' ');
function translatePage(){
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;if(!p||p.closest('script,style,[data-dyn]'))return NodeFilter.FILTER_REJECT;
  return n.nodeValue.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
 for(let n;(n=w.nextNode());){
  if(!orig.has(n))orig.set(n,n.nodeValue);
  const o=orig.get(n),k=norm(o);
  n.nodeValue=lang==='ar'&&AR[k]?o.replace(o.trim(),AR[k]):o;
 }
 document.querySelectorAll('[placeholder]').forEach(el=>{
  if(!el.dataset.ph)el.dataset.ph=el.placeholder;const o=el.dataset.ph;el.placeholder=lang==='ar'&&AR[o]?AR[o]:o});
 document.querySelectorAll('[aria-label]').forEach(el=>{
  if(!origAttr.has(el))origAttr.set(el,el.getAttribute('aria-label'));
  const o=origAttr.get(el);el.setAttribute('aria-label',lang==='ar'&&AR[norm(o)]?AR[norm(o)]:o)});
}
const titles={en:document.title,ar:'MJ Automations | محمد جعفر – أخصائي أتمتة بالذكاء الاصطناعي'};
const hooks=[];
function setLang(l,save){
 lang=l;const root=document.documentElement;
 root.lang=l;root.dir=l==='ar'?'rtl':'ltr';document.title=titles[l];
 translatePage();renderContact();
 const lb=document.getElementById('lang');lb.textContent=T('langBtn');lb.lang=l==='ar'?'en':'ar';lb.setAttribute('aria-label',T('langLabel'));
 hooks.forEach(f=>f());
 if(save)try{localStorage.setItem('mj-lang',l)}catch(e){}
}
document.getElementById('lang').addEventListener('click',()=>setLang(lang==='ar'?'en':'ar',true));

/* scroll reveal: elements are visible at rest, they only slide up */
const els=document.querySelectorAll('.card,.tool,.steps li,.panel,.flow,.avatar,.plan');
if(!still&&'IntersectionObserver' in window){
 els.forEach((e,i)=>{e.classList.add('reveal');e.style.transitionDelay=(i%3)*80+'ms'});
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1});
 els.forEach(e=>io.observe(e));
}

/* typing effect */
const t=document.getElementById('type');
if(t){
 let w=0,i=T('words')[0].length,del=true;
 t.textContent=T('words')[0];
 hooks.push(()=>{w=0;i=T('words')[0].length;del=true;t.textContent=T('words')[0]});
 if(!still)(function tick(){const words=T('words');
  if(del){i--;if(i<=0){del=false;w=(w+1)%words.length}}else{i++;if(i>=words[w].length)del=true}
  t.textContent=words[w].slice(0,Math.max(i,0));
  setTimeout(tick,del?(i===words[w].length-1?1600:40):90)})();
}

/* particle network behind the hero */
const cv=document.getElementById('net');
if(cv&&!still){
 const cx=cv.getContext('2d');let W,H,pts=[],m={x:-999,y:-999};
 const size=()=>{const r=cv.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);W=cv.width=r.width*d;H=cv.height=r.height*d;cx.setTransform(1,0,0,1,0,0);cx.scale(d,d);W=r.width;H=r.height;
  const n=Math.round(Math.min(70,W*H/16000));pts=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35}))};
 size();addEventListener('resize',size);
 cv.parentElement.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();m.x=e.clientX-r.left;m.y=e.clientY-r.top});
 cv.parentElement.addEventListener('pointerleave',()=>{m.x=m.y=-999});
 let vis=true;new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(cv);
 (function draw(){requestAnimationFrame(draw);if(!vis)return;cx.clearRect(0,0,W,H);
  for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1}
  for(let a=0;a<pts.length;a++){const p=pts[a];
   cx.fillStyle='rgba(56,225,192,.8)';cx.beginPath();cx.arc(p.x,p.y,1.6,0,6.3);cx.fill();
   for(let b=a+1;b<pts.length;b++){const q=pts[b],d=Math.hypot(p.x-q.x,p.y-q.y);
    if(d<120){cx.strokeStyle='rgba(91,140,255,'+(1-d/120)*.35+')';cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke()}}
   const dm=Math.hypot(p.x-m.x,p.y-m.y);if(dm<150){cx.strokeStyle='rgba(56,225,192,'+(1-dm/150)*.6+')';cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(m.x,m.y);cx.stroke()}}
 })();
}

/* profit / ROI calculator */
(function(){
 const $=id=>document.getElementById(id),ins={h:$('in-h'),r:$('in-r'),p:$('in-p'),s:$('in-s')};
 if(!ins.h)return;
 const money=n=>'$'+Math.round(n).toLocaleString('en-US');
 const cur={year:0,hours:0,roi:0};
 function tween(key,to,el,fmt){const from=cur[key];cur[key]=to;
  if(still){el.textContent=fmt(to);return}
  const t0=performance.now();(function f(t){const k=Math.min((t-t0)/600,1),e=1-Math.pow(1-k,3);el.textContent=fmt(from+(to-from)*e);if(k<1)requestAnimationFrame(f)})(t0)}
 function chart(save,setup,animate){
  const svg=$('chart'),W=520,H=300,L=58,R=18,T0=18,B=34,N=12;
  const end=save*N-setup,ymin=Math.min(-setup,0),ymax=Math.max(end,0)*1.08||1;
  const x=m=>L+(W-L-R)*m/N,y=v=>T0+(H-T0-B)*(1-(v-ymin)/(ymax-ymin));
  const pts=[];for(let m=0;m<=N;m++)pts.push([x(m),y(save*m-setup)]);
  const d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' L');
  const area=d+' L'+x(N)+' '+y(0)+' L'+x(0)+' '+y(0)+' Z';
  const be=setup/save,bx=be<=N?x(be):null,len=Math.ceil(pts.reduce((s,p,i)=>i?s+Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1]):0,0))+4;
  const lab=v=>(v<0?'-':'')+'$'+(Math.abs(v)>=1000?(Math.abs(v)/1000).toFixed(Math.abs(v)>=10000?0:1)+'k':Math.round(Math.abs(v)));
  let s='<defs><linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38e1c0" stop-opacity=".32"/><stop offset="1" stop-color="#38e1c0" stop-opacity="0"/></linearGradient></defs>';
  [ymin,0,end].forEach(v=>{if(v===0||Math.abs(y(v)-y(0))>14||v===end&&end>0)s+=`<line class="${v===0?'zero':'grid'}" x1="${L}" x2="${W-R}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text x="${L-8}" y="${(y(v)+4).toFixed(1)}" text-anchor="end">${lab(v)}</text>`});
  [0,3,6,9,12].forEach(m=>s+=`<text x="${x(m)}" y="${H-10}" text-anchor="${m===0?'start':m===12?'end':'middle'}">${m===0?T('start'):T('mon')(m)}</text>`);
  s+=`<path class="area ${animate?'draw':''}" d="${area}"/><path class="line ${animate?'draw':''}" style="--len:${len}" d="${d}"/>`;
  s+=`<circle class="end" cx="${pts[N][0]}" cy="${pts[N][1].toFixed(1)}" r="5"/>`;
  if(bx!==null)s+=`<g class="be"><circle class="halo" cx="${bx.toFixed(1)}" cy="${y(0).toFixed(1)}" r="6"/><circle cx="${bx.toFixed(1)}" cy="${y(0).toFixed(1)}" r="6"/></g>`;
  svg.innerHTML=s;
 }
 function run(animate){
  const h=+ins.h.value,r=+ins.r.value,p=+ins.p.value/100,setup=+ins.s.value;
  Object.values(ins).forEach(i=>i.style.setProperty('--fill',((i.value-i.min)/(i.max-i.min)*100).toFixed(1)+'%'));
  $('o-h').textContent=h+T('h');$('o-r').textContent='$'+r;$('o-p').textContent=Math.round(p*100)+'%';$('o-s').textContent=money(setup);
  const before=h*52/12*r,save=before*p,after=before-save,year=save*12,hours=h*52/12*p,net=year-setup,be=setup/save;
  tween('year',year,$('k-year'),money);
  tween('hours',hours,$('k-hours'),v=>Math.round(v)+T('h'));
  tween('roi',net/setup*100,$('k-roi'),v=>Math.round(v).toLocaleString('en-US')+'%');
  $('k-be').textContent=T('be')(be*30.4,be);
  $('b-before').style.width='100%';$('b-after').style.width=(after/before*100).toFixed(1)+'%';
  $('e-before').textContent=money(before)+T('mo');$('e-after').textContent=money(after)+T('mo');
  chart(save,setup,animate);
  $('cap').textContent=T('cap')(net>=0,money(Math.abs(net)));
 }
 Object.values(ins).forEach(i=>i.addEventListener('input',()=>run(false)));
 Object.values(ins).forEach(i=>i.addEventListener('change',()=>run(true)));
 hooks.push(()=>run(false));
 run(false);
 /* replay the drawing when the section scrolls into view */
 if('IntersectionObserver' in window)new IntersectionObserver((e,o)=>{if(e[0].isIntersecting){run(true);o.disconnect()}},{threshold:.35}).observe($('chart'));
})();

/* opportunity radar */
(function(){
 const sweep=document.getElementById('sweep'),g=document.getElementById('blips');if(!sweep)return;
 const spots=[[40,.55],[110,.78],[168,.4],[228,.82],[290,.62],[336,.34]],NS='http://www.w3.org/2000/svg';
 const lis=[...document.querySelectorAll('#finds li')],detail=document.getElementById('find-detail');let shown=-1;
 const bl=spots.map(([a,r],i)=>{const x=100+r*96*Math.sin(a*Math.PI/180),y=100-r*96*Math.cos(a*Math.PI/180);
  const e=document.createElementNS(NS,'g');e.setAttribute('class','blip');
  e.innerHTML=`<circle class="ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5"/><circle class="dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6.5"/><text x="${x.toFixed(1)}" y="${(y+2.6).toFixed(1)}" text-anchor="middle">${i+1}</text>`;
  g.appendChild(e);return {a,e,hit:false}});
 const showDetail=i=>{if(detail&&i>=0)detail.textContent=lis[i].querySelector('p').textContent};
 hooks.push(()=>showDetail(shown));
 function frame(ang){
  sweep.style.transform='rotate('+ang+'deg)';let best=-1,min=999;
  bl.forEach((b,i)=>{const behind=(ang-b.a+360)%360;
   b.e.style.opacity=(.3+.7*Math.max(0,1-behind/260)).toFixed(2);
   if(behind<10&&!b.hit){b.hit=true;b.e.classList.remove('hit');void b.e.getBoundingClientRect();b.e.classList.add('hit')}
   if(behind>40)b.hit=false;
   if(behind<min){min=behind;best=i}});
  lis.forEach((l,i)=>l.classList.toggle('on',i===best));
  if(best!==shown){shown=best;showDetail(best)}
 }
 if(still){bl.forEach(b=>b.e.style.opacity=1);frame(0);lis.forEach(l=>l.classList.remove('on'));document.getElementById('finds').classList.add('static');return}
 let vis=true;new IntersectionObserver(e=>vis=e[0].isIntersecting).observe(document.getElementById('scope'));
 (function loop(t){requestAnimationFrame(loop);if(vis)frame((t/7000*360)%360)})(0);
})();

/* replay case-study animation on hover or tap */
document.querySelectorAll('.case').forEach(c=>{
 const replay=()=>{c.classList.remove('play');void c.offsetWidth;c.classList.add('play')};
 c.addEventListener('mouseenter',replay);c.addEventListener('click',replay);
 c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();replay()}});
});


/* contact form: sent through FormSubmit to the address below */
(function(){
 const MAIL_TO='mohammad_ja3far@hotmail.com';
 const f=document.getElementById('cform');if(!f)return;
 const send=document.getElementById('f-send'),st=document.getElementById('f-status');
 const setBtn=()=>{if(!send.disabled)send.textContent=T('send')};setBtn();hooks.push(setBtn);
 const say=(cls,html)=>{st.className='fstatus '+cls;st.innerHTML=html};
 const done=document.getElementById('f-done'),again=document.getElementById('f-again');let last=null;
 const fillDone=()=>{if(!last)return;const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  document.getElementById('f-done-title').textContent=T('doneTitle')(last.name);
  document.getElementById('f-done-text').innerHTML=T('doneText')('<b dir="ltr">'+esc(last.email)+'</b>');
  again.textContent=T('again')};
 const showDone=(name,email)=>{last={name:name.split(' ')[0],email};fillDone();f.hidden=true;done.hidden=false;
  done.scrollIntoView({block:'center',behavior:still?'auto':'smooth'});done.focus({preventScroll:true})};
 hooks.push(fillDone);
 again.addEventListener('click',()=>{done.hidden=true;f.hidden=false;last=null;f.elements.name.focus()});
 f.addEventListener('submit',async e=>{
  e.preventDefault();
  const el=f.elements,name=el.name.value.trim(),email=el.email.value.trim(),msg=el.message.value.trim();
  const bad=[[el.name,!name],[el.email,!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)],[el.message,!msg]];
  bad.forEach(([el,b])=>el.setAttribute('aria-invalid',b));
  if(bad.some(([,b])=>b)){say('err',T('invalid'));bad.find(([,b])=>b)[0].focus();return}
  if(el._honey.value){showDone(name,email);f.reset();return}
  send.disabled=true;send.textContent=T('sending');say('','');
  try{
   const r=await fetch('https://formsubmit.co/ajax/'+MAIL_TO,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({name,email,message:msg,_subject:'New enquiry from MJ Automations website: '+name,_template:'table',_captcha:'false'})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok||String(d.success)!=='true')throw new Error(d.message||('HTTP '+r.status));
   showDone(name,email);f.reset();say('','');
  }catch(err){
   const why=String(err&&err.message||err);console.error('Contact form:',why);
   const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
   if(/activat/i.test(why))say('err',T('pending'));
   else say('err',T('fail')+'<a href="mailto:'+MAIL_TO+'" dir="ltr">'+MAIL_TO+'</a><br><small dir="ltr">'+esc(why).slice(0,200)+'</small>');
  }finally{send.disabled=false;send.textContent=T('send')}
 });
})();


/* ===== Hero film: "Paper to Pulse" =====
   A sticky stage inside a tall section. Scroll progress p (0..1) drives one render(p).
   One direction only: the camera rises. The desk sinks away, its paperwork lifts, folds into
   light and streams up into a live dashboard that comes down into view. */
const FILM=(function(){
 const sec=document.getElementById('film');if(!sec)return null;
 const $=id=>document.getElementById(id),stage=sec.querySelector('.film-stage'),desk=$('desk'),dash=$('dash');
 const cl=v=>Math.max(0,Math.min(1,v)),seg=(p,a,b)=>cl((p-a)/(b-a)),sm=v=>v*v*(3-2*v),eo=v=>1-Math.pow(1-v,3),ei=v=>v*v*v;
 const beats=[...sec.querySelectorAll('.beat')].map(el=>({el,in:+el.dataset.in,peak:+el.dataset.peak,out:+el.dataset.out}));
 // desk items: [kind, x, y, rotation, w, h, html, flies]
 const L=(n)=>'<i></i>'.repeat(n);
 const ITEMS=[
  ['paper',-360,-110,-9,150,196,'<b>INVOICE</b>'+L(2)+'<i class="s"></i>'+L(3)+'<i class="t"></i><em>OVERDUE</em>',1],
  ['paper',-150,-175,5,150,196,'<b>INVOICE</b>'+L(3)+'<i class="s"></i>'+L(2)+'<i class="t"></i>',1],
  ['sticky y',-250,95,-5,112,112,'Call back<br>Sara!!',1],
  ['paper',40,-70,-13,172,222,'<b>MONTHLY REPORT</b>'+L(2)+'<i class="s"></i>'+L(4)+'<i class="s"></i>',1],
  ['receipt',225,-160,11,92,190,'TOTAL'+L(6)+'<i class="s"></i>',1],
  ['sticky p',70,120,8,112,112,'Follow up<br>on quote',1],
  ['envelope',335,45,-9,176,112,'<em>UNPAID</em>',1],
  ['sticky g',395,-150,5,104,104,'Update<br>CRM',1],
  ['paper',-445,110,11,140,186,'<b>INVOICE</b>'+L(2)+'<i class="s"></i>'+L(2)+'<i class="t"></i>',1],
  ['phone',180,165,-17,86,164,'<span class="badge">248</span>',0],
  ['mug',-60,205,0,86,86,'',0]
 ];
 const items=ITEMS.map(([k,x,y,r,w,h,html,fly],i)=>{const el=document.createElement('div');el.className='it '+k;
  el.style.width=w+'px';el.style.height=h+'px';el.style.margin=`${-h/2}px 0 0 ${-w/2}px`;el.innerHTML=`<div class="face">${html}</div>`;
  desk.appendChild(el);const order=[3,0,5,1,7,2,6,4,8][i]??i;return {el,x,y,r,fly,t:fly?.2+order*.022:0}});
 const tiles=[0,1,2,3].map(i=>$('t'+i)),line=$('pulse-line'),area=$('pulse-area'),dot=$('pulse-dot');
 let base=1,cur=0,target=0,raf=0,mobile=false;
 function layout(){const vw=stage.clientWidth,vh=stage.clientHeight;mobile=vw<=760;base=mobile?Math.min(vw/560,1.2):Math.min(vw/1250,vh/760,1.1)}
 function render(p){
  const vh=stage.clientHeight;
  // camera rises: the desk sinks and tilts away, then fades out
  const rise=sm(seg(p,.06,.72));
  const rtl=document.documentElement.dir==='rtl',side=mobile?0:stage.clientWidth*.14*(rtl?-1:1)*(1-rise);
  desk.style.transform=`translate3d(${side.toFixed(1)}px,${(rise*vh*.62).toFixed(1)}px,${(-rise*420).toFixed(1)}px) rotateX(${(50+rise*14).toFixed(2)}deg) scale(${(base*(mobile?1.05:1)).toFixed(3)})`;
  desk.style.opacity=(1-seg(p,.6,.74)).toFixed(3);
  // paperwork lifts, turns to face us, folds into a thin strip of light, then streams upward
  items.forEach(o=>{
   if(!o.fly){o.el.style.transform=`translate3d(${o.x}px,${o.y}px,1px) rotate(${o.r}deg)`;return}
   const lift=eo(seg(p,o.t,o.t+.1)),fold=sm(seg(p,o.t+.07,o.t+.13)),fly=ei(seg(p,o.t+.12,o.t+.26));
   o.el.classList.toggle('glow',fold>.55);
   const sx=1-.96*fold;
   o.el.style.transform=`translate3d(${o.x*(1-.35*lift)}px,${o.y*(1-.35*lift)}px,${(lift*170+fly*260).toFixed(1)}px) rotateX(${(-50*lift).toFixed(2)}deg) rotate(${(o.r*(1-lift)).toFixed(2)}deg) translateY(${(-fly*2200).toFixed(1)}px) scale(${sx.toFixed(3)},${(1+fold*.5).toFixed(3)})`;
   o.el.style.opacity=(1-seg(p,o.t+.22,o.t+.27)).toFixed(3);
  });
  // the dashboard comes down into view from above and settles; in the finale it steps aside for the headline
  const arrive=eo(seg(p,.34,.62)),fin=sm(seg(p,.84,.96));
  const dy=(-1+arrive)*vh*.95+(mobile?-vh*.06-fin*vh*.16:0),dx=mobile?0:fin*Math.min(stage.clientWidth*.27,380)*(rtl?-1:1);
  const ds=1-fin*(mobile?.12:.3);
  dash.style.transform=`translate(calc(-50% + ${dx.toFixed(1)}px),calc(-50% + ${dy.toFixed(1)}px)) scale(${ds.toFixed(3)})`;
  dash.style.opacity=(seg(p,.32,.4)*(1-fin*(mobile?.75:.55))).toFixed(3);
  tiles.forEach((t,i)=>{const k=seg(p,.5+i*.035,.53+i*.035);t.classList.toggle('on',k>.5);const c=t.querySelector('i');c.style.opacity=k;c.style.transform=`scale(${(.4+.6*eo(k)).toFixed(3)})`});
  const draw=sm(seg(p,.56,.78));line.style.strokeDashoffset=(1-draw).toFixed(3);area.style.opacity=(draw*.9).toFixed(3);dot.style.opacity=seg(p,.76,.8);
  // copy beats
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
 return {refresh,render};
})();

/* smooth wheel scrolling (desktop) — touch stays native */
let lenis=null;
const JUMP=new URLSearchParams(location.search).get('jump');
if(!still&&JUMP===null&&window.Lenis&&matchMedia('(pointer:fine)').matches){
 lenis=new Lenis({lerp:.1,smoothWheel:true});
 (function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(performance.now());
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');
  if(id.length<2)return;const el=document.querySelector(id);if(!el)return;e.preventDefault();lenis.scrollTo(id==='#top'?0:el,{offset:-70})}));
}

/* start in the saved language, or Arabic when the link ends in #ar */
(function(){let l='en';try{l=localStorage.getItem('mj-lang')||'en'}catch(e){}
 if(location.hash==='#ar')l='ar';setLang(l==='ar'?'ar':'en',false)})();

/* dev contract: ?jump=<scrollY> lands pre-scrolled with the film settled; __ready gates screenshots */
(function(){const go=()=>{if(JUMP!==null){history.scrollRestoration='manual';scrollTo(0,+JUMP||0)}if(FILM)FILM.refresh();requestAnimationFrame(()=>{window.__ready=true})};
 (document.fonts?document.fonts.ready:Promise.resolve()).then(go)})();
