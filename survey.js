const survey=document.querySelector('#survey-form');
if(survey){
 const questions=[...survey.querySelectorAll('[data-question]')];
 const status=document.querySelector('#survey-status');
 const contextNames={monitor:'AIr Monitor',maintenance:'AIr Maintenance',analytics:'AIr Analytics',intelligence:'AIr Intelligence'};
 const context=contextNames[new URLSearchParams(location.search).get('proizvod')];
 if(context){const p=document.querySelector('#survey-context');p.textContent=`Dolazite sa stranice ${context}. Upitnik možete popuniti za sve potrebe vašeg pogona.`;p.hidden=false;}
 for(const q of questions){
  const choices=[...q.querySelectorAll('input[type="checkbox"]')];
  const validate=()=>{if(choices.length)choices[0].setCustomValidity(choices.some(c=>c.checked)?'':'Označite najmanje jedan odgovor na ovo pitanje.');};
  q.addEventListener('change',()=>{
   validate();
   const other=q.querySelector('[data-other-toggle]'),detail=q.querySelector('.survey-other');
   if(other&&detail){detail.hidden=!other.checked;detail.querySelector('textarea').disabled=!other.checked;}
  });
  validate();
 }
 const answers=()=>questions.map(q=>{
  const selected=[...q.querySelectorAll('input:checked')].map(c=>c.value);
  const notes=[...q.querySelectorAll('textarea:not(:disabled)')].map(t=>({name:t.name,text:t.value.trim()})).filter(t=>t.text);
  const text=[...selected,...notes.map(n=>n.name.endsWith('_uticaj')?'Uticaj na proizvodnju: '+n.text:n.name.endsWith('_drugo')?'Drugo: '+n.text:n.text)].join('\n');
  return {title:`${q.dataset.question}. ${q.dataset.title}`,text:text||'Bez odgovora'};
 });
 document.querySelector('#survey-download').addEventListener('click',()=>{
  const rows=['AIr Tehnology — Upitnik',...(context?['Interesovanje: '+context]:[]),'',...answers().flatMap(a=>[a.title,a.text,'']),'Ime i kompanija: '+survey.elements['Ime i kompanija'].value,'Email: '+survey.elements.email.value,'','Lokalna kopija odgovora. Ovaj fajl nije potvrda slanja.'];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.join('\n')],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='AIr-Tehnology-upitnik.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  status.textContent='Kopija je pripremljena za preuzimanje. Odgovori nisu poslati ovom radnjom.';
 });
 const sendButton=document.querySelector('#survey-send');
 const fallback=document.querySelector('#survey-email-fallback');
 const accessKey=survey.dataset.accessKey.trim();
 let pending=false;
 function makePayload(){
  const payload={access_key:accessKey,subject:'AIr Tehnology — novi odgovor na upitnik',from_name:'AIr Tehnology upitnik'};
  for(const answer of answers())payload[answer.title]=answer.text;
  if(context)payload.Interesovanje=context;
  const name=survey.elements['Ime i kompanija'].value.trim(),email=survey.elements.email.value.trim();
  if(name)payload['Ime i kompanija']=name;
  if(email)payload.email=email;
  return payload;
 }
 function prepareFallback(){
  const lines=['AIr Tehnology — Upitnik',...(context?['Interesovanje: '+context]:[]),'',...answers().flatMap(a=>[a.title,a.text,'']),'Ime i kompanija: '+survey.elements['Ime i kompanija'].value,'Email: '+survey.elements.email.value];
  fallback.href='mailto:'+survey.dataset.recipient+'?subject='+encodeURIComponent('AIr Tehnology — odgovor na upitnik')+'&body='+encodeURIComponent(lines.join('\n'));
  fallback.hidden=false;
 }
 survey.addEventListener('input',()=>{if(!fallback.hidden)prepareFallback();});
 survey.addEventListener('change',()=>{if(!fallback.hidden)prepareFallback();});
 survey.addEventListener('submit',async e=>{
  e.preventDefault();
  if(pending)return;
  prepareFallback();
  if(!accessKey){status.textContent='Odgovori su pripremljeni, ali nisu poslati. Otvorite email sa odgovorima i pošaljite ga iz svog email programa, ili preuzmite kopiju i priložite je poruci.';return;}
  if(survey.elements._honey.value)return;
  pending=true;sendButton.disabled=true;sendButton.textContent='Slanje je u toku…';survey.setAttribute('aria-busy','true');status.textContent='Sačekajte potvrdu slanja. Odgovori ostaju na stranici.';
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(makePayload()),signal:controller.signal});
   const result=await response.json();
   if(!response.ok||result.success!==true)throw new Error('Delivery not confirmed');
   status.textContent='Servis je potvrdio prijem odgovora za slanje našem timu. Hvala na vremenu i podršci!';
  }catch(error){
   status.textContent='Nismo dobili potvrdu slanja. Vaši odgovori su sačuvani na ovoj stranici. Možete pokušati ponovo ili ih poslati preko email programa / preuzete kopije. Ako je prethodni pokušaj ipak stigao, ponovno slanje može napraviti duplikat.';
  }finally{
   clearTimeout(timeout);pending=false;sendButton.disabled=false;sendButton.textContent='Pošalji odgovore ↗';survey.removeAttribute('aria-busy');
  }
 });
}
