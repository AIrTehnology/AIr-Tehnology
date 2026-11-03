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
 survey.addEventListener('submit',e=>{
  if(location.protocol==='file:'){e.preventDefault();status.textContent='Za slanje otvorite upitnik na objavljenom sajtu ili pokrenite lokalni sajt komandom npm start. Kopiju odgovora možete preuzeti i poslati direktno emailom.';return;}
  // Send one readable value per question, preserving all multiple selections.
  survey.querySelectorAll('[data-answer-copy]').forEach(el=>el.remove());
  for(const answer of answers()){const hidden=document.createElement('input');hidden.type='hidden';hidden.name=answer.title;hidden.value=answer.text;hidden.dataset.answerCopy='';survey.append(hidden);}
  if(context){const hidden=document.createElement('input');hidden.type='hidden';hidden.name='Interesovanje';hidden.value=context;hidden.dataset.answerCopy='';survey.append(hidden);}
  // The complete readable answers above replace the raw q1/q2/... fields.
  const raw=[...survey.querySelectorAll('[name]')].filter(el=>/^q\d/.test(el.name));
  raw.forEach(el=>el.disabled=true);
  setTimeout(()=>raw.forEach(el=>{el.disabled=Boolean(el.closest('.survey-other')?.hidden);}),0);
 });
}
