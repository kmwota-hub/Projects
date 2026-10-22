const phone='254700000000';
const products=[
{name:'Pilau Masala',cat:'blends',emoji:'🥘',price:120,desc:'Aromatic blend for rich, flavourful pilau.'},
{name:'Cinnamon',cat:'whole',emoji:'🪵',price:100,desc:'Warm, sweet aroma for tea, baking and meals.'},
{name:'Turmeric',cat:'everyday',emoji:'🟡',price:80,desc:'Earthy golden spice for curries, rice and stews.'},
{name:'Chilli Flakes',cat:'everyday',emoji:'🌶️',price:100,desc:'A bold kick of heat for your favourite dishes.'},
{name:'Cumin',cat:'everyday',emoji:'🌾',price:100,desc:'Deep earthy flavour for meat, rice and sauces.'},
{name:'Black Pepper',cat:'whole',emoji:'⚫',price:120,desc:'Classic peppery heat, freshly packed.'},
{name:'Mixed Herbs',cat:'herbs',emoji:'🌿',price:100,desc:'A fragrant herb mix for pasta, meat and sauces.'},
{name:'Tea Masala',cat:'blends',emoji:'☕',price:120,desc:'Warming aromatic spices for Kenyan chai.'},
{name:'Ginger Powder',cat:'everyday',emoji:'🫚',price:100,desc:'Convenient warm ginger flavour for food and tea.'},
{name:'Coriander',cat:'whole',emoji:'🫘',price:80,desc:'Fragrant coriander for curries, stews and marinades.'},
{name:'Rosemary',cat:'herbs',emoji:'🌱',price:100,desc:'Aromatic herb ideal for roast meat and potatoes.'},
{name:'Curry Powder',cat:'blends',emoji:'🍛',price:100,desc:'Balanced everyday curry blend for easy cooking.'}
];
const grid=document.querySelector('#productGrid');
function render(filter='all'){grid.innerHTML=products.filter(p=>filter==='all'||p.cat===filter).map(p=>`<article class="card"><div class="product-img">${p.emoji}</div><div class="card-body"><span class="cat">${p.cat}</span><h3>${p.name}</h3><div class="desc">${p.desc}</div><div class="price-row"><span class="price">KSh ${p.price}</span><a class="order" target="_blank" href="https://wa.me/${phone}?text=${encodeURIComponent(`Hello Juja Spice Market, I'd like to order ${p.name} (KSh ${p.price}).`)}">Order</a></div></div></article>`).join('')}
render();
document.querySelectorAll('.filters button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filters button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.filter)}));
document.querySelector('.menu').addEventListener('click',()=>document.querySelector('nav').classList.toggle('open'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('nav').classList.remove('open')));
document.querySelector('#year').textContent=new Date().getFullYear();
