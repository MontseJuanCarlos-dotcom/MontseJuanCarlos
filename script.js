const weddingDate = new Date("2027-05-01T17:30:00+02:00");

function updateCountdown(){
  const now = new Date();
  let diff = weddingDate - now;
  if(diff < 0) diff = 0;
  const sec = Math.floor(diff/1000);
  const days = Math.floor(sec/86400);
  const hours = Math.floor((sec%86400)/3600);
  const minutes = Math.floor((sec%3600)/60);
  const seconds = sec%60;
  document.querySelector('[data-unit="days"]').textContent = String(days);
  document.querySelector('[data-unit="hours"]').textContent = String(hours).padStart(2,'0');
  document.querySelector('[data-unit="minutes"]').textContent = String(minutes).padStart(2,'0');
  document.querySelector('[data-unit="seconds"]').textContent = String(seconds).padStart(2,'0');
}
updateCountdown(); setInterval(updateCountdown,1000);

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
toggle?.addEventListener('click',()=>nav.classList.toggle('open'));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const asistencia = document.querySelector('#asistencia');
const guestFields = document.querySelector('#guestFields');
const acompanante = document.querySelector('#acompanante');
const guestNameWrap = document.querySelector('#guestNameWrap');

function updateConditional(){
  const attending = asistencia.value.startsWith('Sí');
  guestFields.style.display = attending ? 'grid' : 'none';
}
asistencia.addEventListener('change', updateConditional);
acompanante.addEventListener('change',()=>{
  guestNameWrap.classList.toggle('hidden', acompanante.value !== 'Sí');
});

const form = document.querySelector('#rsvpForm');
const note = document.querySelector('#formNote');

function formDataText(){
  const fd = new FormData(form);
  const lines = [
    `NOMBRE: ${fd.get('nombre') || ''}`,
    `ASISTENCIA: ${fd.get('asistencia') || ''}`,
    `ACOMPAÑANTE: ${fd.get('nombre_acompanante') || '—'}`,
    `ALERGIAS/INTOLERANCIAS: ${fd.get('alergias') || '—'}`,
    `MENÚ: ${fd.get('menu') || '—'}`,
    `HOTEL: ${fd.get('hotel') || '—'}`,
    `NECESIDADES ESPECIALES: ${fd.get('necesidades') || '—'}`,
    `CANCIÓN 1: ${fd.get('cancion1') || '—'}`,
    `CANCIÓN 2: ${fd.get('cancion2') || '—'}`,
    `CANCIÓN 3: ${fd.get('cancion3') || '—'}`,
    `COMENTARIOS: ${fd.get('comentarios') || '—'}`
  ];
  return lines.join('\n');
}

form.addEventListener('submit',(e)=>{
  e.preventDefault();
  const text = formDataText();
  navigator.clipboard?.writeText(text);
  note.textContent = '¡Listo! Hemos preparado y copiado la respuesta. En el siguiente paso podemos conectarla a Google Forms/Sheets para que las respuestas os lleguen automáticamente.';
  note.style.fontWeight = '600';
});

document.querySelector('#copyRsvp').addEventListener('click',async()=>{
  const text = formDataText();
  try{
    await navigator.clipboard.writeText(text);
    note.textContent = 'Respuesta copiada al portapapeles ♡';
  }catch{
    note.textContent = 'No se pudo copiar automáticamente. Pulsa “Preparar mi confirmación” para ver el contenido.';
  }
});
