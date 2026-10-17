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
  send:'Send message',aiRead:'Reading the message',aiWrite:'Writing the reply',aiDone:'Reply ready ✓',newLead:'New lead',booked:'Booked ✓',mailWait:'Preparing confirmation',mailSent:'Confirmation sent ✓',sending:'Sending…',sent:'Thanks! Your message was sent. I will get back to you soon.',
  invalid:'Please fill in your name, a valid email and a message.',pending:'The form is waiting for activation. Please try again later, or email me directly.',
  doneTitle:n=>`Thanks${n?', '+n:''}! Your message was sent.`,doneText:e=>`I received your message and will reply to ${e} as soon as possible, usually within 1–2 business days.`,again:'Send another message',fail:'Sorry, the message could not be sent. Please email me directly at ',langLabel:'عرض الموقع بالعربية'},
 ar:{words:['أتمتة بالذكاء الاصطناعي','سير عمل ذكي','تطبيقات ويب مخصصة','وكلاء ذكاء اصطناعي'],h:' ساعة',mo:' شهريًا',
  be:(d,be)=>be>12?'أكثر من 12 شهرًا':d<14?(Math.round(d)<=1?'يوم واحد':Math.round(d)+' أيام'):be<2?Math.round(d/7)+' أسابيع':be.toFixed(1)+' أشهر',
  cap:(ahead,v)=>`الصافي بعد كلفة الإعداد، شهرًا بشهر. في الشهر 12 تكون ${ahead?'رابحًا بمقدار '+v:'خاسرًا بمقدار '+v}.`,
  start:'البداية',mon:m=>'شهر '+m,book:'احجز مكالمة مجانية',wa:'واتساب',li:'لينكدإن',gh:'GitHub',email:'البريد الإلكتروني',copy:'انسخ البريد',copied:'تم النسخ',
  waText:'مرحبًا محمد، أودّ التحدث عن أتمتة.',langBtn:'English',
  send:'أرسل الرسالة',aiRead:'يقرأ الرسالة',aiWrite:'يكتب الرد',aiDone:'الرد جاهز ✓',newLead:'عميل جديد',booked:'تم الحجز ✓',mailWait:'يجهّز التأكيد',mailSent:'تم إرسال التأكيد ✓',sending:'جارٍ الإرسال…',sent:'شكرًا! تم إرسال رسالتك، وسأعود إليك قريبًا.',
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


/* ===== Hero film: "The Midnight Reply" =====
   A sticky stage inside a tall section. Scroll progress p (0..1) drives one render(p):
   the camera only ever pulls back, from the customer's message to the whole workflow. */
const FILM=(function(){
 const sec=document.getElementById('film');if(!sec)return null;
 const $=id=>document.getElementById(id),stage=sec.querySelector('.film-stage'),world=$('world'),svg=$('wires');
 const NS='http://www.w3.org/2000/svg',cl=v=>Math.max(0,Math.min(1,v)),ease=v=>v<.5?4*v*v*v:1-Math.pow(-2*v+2,3)/2,eo=v=>1-Math.pow(1-v,3);
 const seg=(p,a,b)=>cl((p-a)/(b-a)),E=k=>S.en[k];   // the film layer stays in English in both languages
 const beats=[...sec.querySelectorAll('.beat')].map(el=>({el,in:+el.dataset.in,peak:+el.dataset.peak,out:+el.dataset.out}));
 const cards={phone:$('w-phone'),ai:$('w-ai'),crm:$('w-crm'),cal:$('w-cal'),mail:$('w-mail')};
 let W=0,H=0,paths=[],lens=[],focus0={x:0,y:0},cur=0,target=0,raf=0;
 const box=el=>({x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight});
 function layout(){
  W=world.offsetWidth;H=world.offsetHeight;
  const mobile=innerWidth<=760,P=box(cards.phone),A=box(cards.ai),C=box(cards.crm),K=box(cards.cal),M=box(cards.mail);
  const pt=(b,sx,sy)=>[b.x+b.w*sx,b.y+b.h*sy];
  let d=[];
  if(!mobile){
   const p1=pt(P,1,.38),a1=pt(A,0,.4),a2=pt(A,1,.5);
   d.push(`M${p1} C${p1[0]+90},${p1[1]} ${a1[0]-90},${a1[1]} ${a1}`);
   [C,K,M].forEach(b=>{const o=pt(b,0,.5);d.push(`M${a2} C${a2[0]+80},${a2[1]} ${o[0]-80},${o[1]} ${o}`)});
   const a3=pt(A,.5,1),p2=pt(P,1,.78);d.push(`M${a3} C${a3[0]},${a3[1]+120} ${p2[0]+160},${p2[1]+40} ${p2}`);
  }else{
   const p1=pt(P,.5,1),a1=pt(A,.5,0),a2=pt(A,.5,1);
   d.push(`M${p1} L${a1}`);
   [C,K,M].forEach(b=>{const o=pt(b,.5,0);d.push(`M${a2} C${a2[0]},${a2[1]+30} ${o[0]},${o[1]-30} ${o}`)});
   const a3=pt(A,0,.5),p2=pt(P,0,.8);d.push(`M${a3} C${a3[0]-14},${a3[1]-120} ${p2[0]-60},${p2[1]+40} ${p2}`);
  }
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.innerHTML='<defs><linearGradient id="wireGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="'+W+'" y2="0"><stop offset="0" stop-color="#38e1c0"/><stop offset="1" stop-color="#5b8cff"/></linearGradient></defs>'+
   d.map(s=>`<path class="track" d="${s}"/>`).join('')+d.map(s=>`<path class="lit" d="${s}"/>`).join('');
  paths=[...svg.querySelectorAll('path.lit')];lens=paths.map(pa=>pa.getTotalLength());
  paths.forEach((pa,i)=>{pa.style.strokeDasharray=lens[i];pa.style.strokeDashoffset=lens[i]});
  const m=$('msg-in'),bx=P.x+m.offsetLeft+m.offsetWidth/2,by=P.y+m.offsetTop+m.offsetHeight/2;
  focus0={x:bx,y:mobile?by+40:by};
 }
 // camera keyframes: [progress, scale, focus]. Scale only ever falls (one direction: pulling back);
 // the focus glides message → AI → outputs → whole system so each step is framed clear of the captions.
 let KEYS=[];
 function buildKeys(){
  const vw=stage.clientWidth,vh=stage.clientHeight,top=68,mobile=vw<=760;
  const s1=Math.min(vw*(mobile?.94:.9)/W,(vh-top)*(mobile?.9:.86)/H);
  const A=box(cards.ai),C=box(cards.crm),M=box(cards.mail),K=box(cards.cal);
  const ai={x:A.x+A.w/2,y:A.y+A.h/2},outs=mobile?{x:(C.x+M.x+M.w)/2,y:C.y+C.h/2-20}:{x:C.x+C.w/2-120,y:(C.y+M.y+M.h)/2},mid={x:W/2,y:H/2};
  const fitAI=Math.min((vw-40)/A.w,(vh-top)*.5/A.h),fitOut=mobile?Math.min((vw-24)/(M.x+M.w-C.x),1):Math.min((vw*.55)/(C.w+A.w+260),(vh-top)*.85/(M.y+M.h-C.y));
  const s0=mobile?Math.min(1.65,(vw-30)/box(cards.phone).w):2.1;
  const sAI=Math.min(s0*.82,mobile?fitAI*.96:1.3),sOut=Math.min(sAI*.9,Math.max(s1*1.05,fitOut));
  KEYS=[[0,s0,focus0],[.3,sAI,ai],[.56,sOut,outs],[.84,s1,mid],[1,mobile?s1:s1*.82,mid]];
 }
 const sm=v=>v*v*(3-2*v);
 function camera(p){
  const vw=stage.clientWidth,vh=stage.clientHeight,top=68,mobile=vw<=760;
  let i=0;while(i<KEYS.length-2&&p>KEYS[i+1][0])i++;
  const [pa,sa,fa]=KEYS[i],[pb,sb,fb]=KEYS[i+1],k=sm(cl((p-pa)/(pb-pa)));
  const s=sa*Math.pow(sb/sa,k),fx=fa.x+(fb.x-fa.x)*k,fy=fa.y+(fb.y-fa.y)*k;
  const fin=seg(p,.84,1);
  let cx=mobile?vw/2:vw*(.6+.12*sm(fin));if(!mobile&&document.documentElement.dir==='rtl')cx=vw-cx;
  const cy=top+(vh-top)*(mobile?.37:.5);
  world.style.transform=`translate(${(cx-fx*s).toFixed(1)}px,${(cy-fy*s).toFixed(1)}px) scale(${s.toFixed(4)})`;
  world.style.opacity=(1-(mobile?.85:.72)*seg(p,.82,.9)).toFixed(3);
 }
 const wire=(i,a,b,p)=>{const k=seg(p,a,b);paths[i].style.strokeDashoffset=(lens[i]*(1-k)).toFixed(1);return k};
 function signal(i,el,a,b,p){const k=seg(p,a,b);if(k<=0||k>=1){el.style.opacity=0;return}
  const q=paths[i].getPointAtLength(lens[i]*eo(k));el.style.opacity=1;el.style.transform=`translate(${q.x}px,${q.y}px)`}
 const show=(el,k,dy=6)=>{el.style.opacity=k.toFixed(3);el.style.transform=`translateY(${((1-k)*dy).toFixed(1)}px)`};
 const pop=(el,k)=>{el.style.opacity=k.toFixed(3);el.style.transform=`scale(${(.4+.6*eo(k)).toFixed(3)})`};
 function render(p){
  if(!paths.length)return;
  camera(p);
  // 1 message → AI
  wire(0,.12,.24,p);signal(0,$('sig0'),.13,.27,p);
  cards.phone.classList.toggle('live',p<.16||(p>.74&&p<.86));
  cards.ai.classList.toggle('live',p>.26&&p<.56);
  show($('chip1'),seg(p,.28,.31));show($('chip2'),seg(p,.31,.34));
  $('type-en').style.clipPath=`inset(0 ${(100-100*seg(p,.33,.48)).toFixed(1)}% 0 0)`;
  $('ai-state').textContent=E(p<.28?'aiRead':p<.5?'aiWrite':'aiDone');
  // 2 AI → CRM, calendar, inbox
  [1,2,3].forEach((i,n)=>{wire(i,.5+n*.02,.58+n*.02,p);signal(i,$('sig'+i),.52+n*.025,.61+n*.025,p)});
  show($('crm-row'),seg(p,.6,.64),8);const crmOk=p>.66;$('crm-tag').textContent=E(crmOk?'booked':'newLead');$('crm-tag').classList.toggle('ok',crmOk);
  const slot=seg(p,.63,.67);$('cal-slot').style.background=`rgba(56,225,192,${(slot*.9).toFixed(3)})`;$('cal-slot').firstElementChild.style.opacity=slot;
  $('mail-line').textContent=E(p>.68?'mailSent':'mailWait');$('mail-line').style.color=p>.68?'var(--acc)':'';
  pop($('ok-crm'),seg(p,.64,.67));pop($('ok-cal'),seg(p,.66,.69));pop($('ok-mail'),seg(p,.68,.71));
  [cards.crm,cards.cal,cards.mail].forEach((c,n)=>c.classList.toggle('live',p>.61+n*.025&&p<.8));
  // 3 reply back to the phone
  wire(4,.7,.77,p);signal(4,$('sig4'),.71,.79,p);
  $('ph-typing').style.opacity=(p>.72&&p<.79)?1:0;$('ph-typing').style.display=p<.79?'flex':'none';
  show($('msg-out'),seg(p,.79,.82));show($('ph-stamp'),seg(p,.81,.84),0);
  // beats
  beats.forEach(b=>{let a=0;if(p>=b.in&&p<=b.out){a=p<b.peak?(p-b.in)/Math.max(1e-4,b.peak-b.in):(b.out>1.5?1:1-(p-b.peak)/Math.max(1e-4,b.out-b.peak))}
   a=cl(a);b.el.style.opacity=a.toFixed(3);b.el.style.visibility=a<.01?'hidden':'visible';
   if(!b.el.classList.contains('bf'))b.el.style.transform=`translateY(${((1-a)*14*(p<b.peak?1:-1)).toFixed(1)}px)`});
  $('film-hint').style.opacity=(1-seg(p,0,.05)).toFixed(3);
  $('film-fade').style.opacity=seg(p,.92,1).toFixed(3);
 }
 const progress=()=>{const r=sec.getBoundingClientRect(),span=sec.offsetHeight-stage.offsetHeight;return span>0?cl(-r.top/span):1};
 function loop(){cur+=(target-cur)*.14;if(Math.abs(target-cur)<.0005)cur=target;render(cur);raf=Math.abs(target-cur)>0?requestAnimationFrame(loop):0}
 const onScroll=()=>{target=progress();if(still){cur=target;render(cur)}else if(!raf)raf=requestAnimationFrame(loop)};
 function refresh(){layout();buildKeys();cur=target=progress();render(cur)}
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',refresh);
 hooks.push(refresh);
 if(document.fonts)document.fonts.ready.then(refresh);
 return {refresh,render,settle(){cur=target=progress();render(cur)}};
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
