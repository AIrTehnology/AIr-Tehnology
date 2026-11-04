const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
const setMenu=open=>{toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Zatvori navigaciju':'Otvori navigaciju');nav.classList.toggle('open',open);};
toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
nav.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false);});
document.addEventListener('click',e=>{if(!nav.contains(e.target)&&!toggle.contains(e.target))setMenu(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){setMenu(false);toggle.focus();}});
matchMedia('(max-width:900px)').addEventListener('change',()=>setMenu(false));
// One frame per scroll update; no continuous JavaScript animation loop.
const factory=document.querySelector('.factory-background');
if(factory){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const parts=[...factory.querySelectorAll('.factory-part')];
 const stageLabel=document.querySelector('#factory-stage-label');
 const progressBar=document.querySelector('.factory-progress span');
 let scheduled=false;
 const clamp=v=>Math.min(1,Math.max(0,v));
 const updateFactory=()=>{
  scheduled=false;
  const range=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  const progress=clamp(scrollY/range);
  const svg=factory.querySelector('.factory-svg');
  const mobile=innerWidth<=900;
  const viewBox=mobile?'400 200 1200 620':'0 0 1600 900';
  if(svg.getAttribute('viewBox')!==viewBox){svg.setAttribute('viewBox',viewBox);svg.setAttribute('preserveAspectRatio',mobile?'xMidYMid meet':'xMidYMid slice');}
  for(const part of parts){
   const value=reduced.matches?1:clamp((progress-Number(part.dataset.stage))/.13);
   const eased=1-Math.pow(1-value,3);
   part.style.opacity=String(eased);
   part.style.transform=`translate(${(1-eased)*Number(part.dataset.fromX)}px,${(1-eased)*Number(part.dataset.fromY)}px)`;
  }
  const labels=['01 / PROIZVODNA MAŠINA','02 / ROBOTSKA MANIPULACIJA','03 / ULAZNA TRANSPORTNA TRAKA','04 / POVEZIVANJE TOKA PROIZVODNJE','05 / AUTOMATSKA LINIJA'];
  const stage=progress<.12?0:progress<.38?1:progress<.52?2:progress<.78?3:4;
  stageLabel.textContent=reduced.matches?'AUTOMATSKA LINIJA / STATIČKI PRIKAZ':labels[stage];
  progressBar.style.transform=`scaleX(${reduced.matches?1:progress})`;
  factory.classList.toggle('line-complete',progress>=.78||reduced.matches);
 };
 const requestUpdate=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateFactory);}};
 addEventListener('scroll',requestUpdate,{passive:true});
 addEventListener('resize',requestUpdate);
 reduced.addEventListener('change',requestUpdate);
 new ResizeObserver(requestUpdate).observe(document.body);
 updateFactory();
}
const machine=document.querySelector('#machine');if(machine){const data=[['U radu','248','42 s','18 min',[24,36,31,42,35,38,28,14]],['Zastoj','172','58 s','46 min',[20,28,24,30,20,13,22,15]],['U radu','306','31 s','9 min',[30,38,42,37,46,41,39,33]]];const render=()=>{const d=data[Number(machine.value)];['state','cycles','cycle','stop'].forEach((id,i)=>document.getElementById(id).textContent=d[i]);document.getElementById('bars').innerHTML=d[4].map((v,i)=>`<div class="bar-col"><span>${v}</span><div style="height:${v*2.3}px"></div><small>${String(i+6).padStart(2,'0')}:00</small></div>`).join('');};machine.addEventListener('change',render);render();}
const form=document.querySelector('#contact-form');if(form)form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);const text=`UPIT ZA AIr TECHNOLOGY\n\nIme i kompanija: ${d.get('name')}\nEmail: ${d.get('email')}\nInteresovanje: ${d.get('product')}\n\nOprema i cilj:\n${d.get('message')}\n\nOvaj upit je pripremljen lokalno. Nije poslat.`;const url=URL.createObjectURL(new Blob(['\uFEFF'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='AIr-Technology-upit.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#form-status').textContent='Upit je pripremljen za preuzimanje. Podaci nisu poslati.';});


/* Product concept windows: autoplay only while visible, with manual controls. */
document.querySelectorAll('[data-showcase]').forEach(windowEl=>{
 const slides=[...windowEl.querySelectorAll('[data-slide]')];
 const buttons=[...windowEl.querySelectorAll('[data-index]')];
 const pauseButton=windowEl.querySelector('[data-pause]');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,paused=motion.matches,visible=false,hovered=false,focused=false,timer;
 const render=(next,manual=false)=>{
  index=(next+slides.length)%slides.length;
  slides.forEach((slide,i)=>slide.hidden=i!==index);
  buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
  if(manual)windowEl.querySelector('[data-announcement]').textContent=`Scenario ${index+1} od ${slides.length}: ${slides[index].querySelector('.window-section-label').textContent}`;
 };
 const sync=()=>{
  clearInterval(timer);
  pauseButton.textContent=paused?'Pokreni':'Pauziraj';
  pauseButton.setAttribute('aria-pressed',String(paused));
  windowEl.classList.toggle('showcase-paused',paused||motion.matches||!visible||document.hidden);
  if(!paused&&!motion.matches&&visible&&!hovered&&!focused&&!document.hidden)timer=setInterval(()=>render(index+1),5500);
 };
 buttons.forEach(button=>button.addEventListener('click',()=>{render(Number(button.dataset.index),true);sync();}));
 windowEl.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>{render(index+Number(button.dataset.direction),true);sync();}));
 pauseButton.addEventListener('click',()=>{paused=!paused;sync();});
 windowEl.addEventListener('mouseenter',()=>{hovered=true;sync();});
 windowEl.addEventListener('mouseleave',()=>{hovered=false;sync();});
 windowEl.addEventListener('focusin',()=>{focused=true;sync();});
 windowEl.addEventListener('focusout',e=>{focused=windowEl.contains(e.relatedTarget);sync();});
 document.addEventListener('visibilitychange',sync);
 motion.addEventListener('change',()=>{paused=motion.matches;sync();});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.2}).observe(windowEl);
 sync();
});
if(form){const selected=new URLSearchParams(location.search).get('proizvod');const names={monitor:'AIr Monitor',maintenance:'AIr Maintenance',analytics:'AIr Analytics',intelligence:'AIr Intelligence'};if(names[selected])form.elements.product.value=names[selected];}


