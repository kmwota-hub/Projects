// CLIENT SETTINGS — edit these details before publishing.
const SETTINGS = { whatsapp: '254700000000', business: 'Velvet Glow Salon' };
const services = [
  ['Braids','From KSh 1,500','Neat protective styles tailored to your preferred look.'],
  ['Hair Dressing','From KSh 800','Professional styling and finishing for everyday or special occasions.'],
  ['Weaving','From KSh 1,200','Clean, comfortable installation with a polished finish.'],
  ['Blow Dry','From KSh 500','Smooth blow-dry service to refresh and style your hair.'],
  ['Hair Treatment','From KSh 700','Care-focused treatment to nourish and refresh your hair.'],
  ['Special Occasion','Ask for quote','A personalized look for weddings, graduations and events.']
];
const box=document.getElementById('serviceCards');
services.forEach(([name,price,desc])=>{const a=document.createElement('article');a.className='service';a.innerHTML=`<div class="service-top"><h3>${name}</h3><span class="price">${price}</span></div><p>${desc}</p><a target="_blank" rel="noopener" href="https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(`Hello ${SETTINGS.business}, I would like to ask about ${name}.`)}">Ask about this service →</a>`;box.appendChild(a)});
document.querySelectorAll('.wa').forEach(a=>{a.href=`https://wa.me/${SETTINGS.whatsapp}?text=${encodeURIComponent(`Hello ${SETTINGS.business}, I'd like to book an appointment.`)}`;a.target='_blank';a.rel='noopener'});
const header=document.querySelector('.header'),menu=document.querySelector('.menu');menu.addEventListener('click',()=>{header.classList.toggle('open');menu.setAttribute('aria-expanded',header.classList.contains('open'))});document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>header.classList.remove('open')));document.getElementById('year').textContent=new Date().getFullYear();
