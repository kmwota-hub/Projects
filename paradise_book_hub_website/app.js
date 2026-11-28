// DEMO STORE SETTINGS — update the WhatsApp number and catalogue before launch.
const STORE = {
  whatsappNumber: "", // Example: "2547XXXXXXXX" (country code, no + or spaces)
  currency: "KSh"
};

// Sample listings are for presentation only. Replace with Paradise Book Hub's verified stock.
const books = [
  {id:1,title:"The Art of Strategy",author:"A practical thinking guide",category:"Business",price:350,cover:["#263d37","#d5b17d"],kicker:"THINK WITH PURPOSE"},
  {id:2,title:"The Power Within",author:"A guide to personal growth",category:"Personal Growth",price:350,cover:["#9a563d","#f1d6b0"],kicker:"GROW EVERY DAY"},
  {id:3,title:"Beyond the Pages",author:"A collection of stories",category:"Fiction",price:350,cover:["#354b68","#d6c4a0"],kicker:"A STORY TO REMEMBER"},
  {id:4,title:"A Life of Purpose",author:"Words for the journey",category:"Faith",price:350,cover:["#d6c7a8","#314438"],kicker:"FAITH • HOPE • LOVE"},
  {id:5,title:"The Focus Habit",author:"Build better daily routines",category:"Personal Growth",price:350,cover:["#d0a64e","#263a32"],kicker:"SMALL STEPS. BIG CHANGE."},
  {id:6,title:"Ideas That Build",author:"Business and leadership",category:"Business",price:350,cover:["#394c59","#e3d4b8"],kicker:"LEARN • LEAD • CREATE"},
  {id:7,title:"The Quiet Journey",author:"A novel of discovery",category:"Fiction",price:350,cover:["#6b6655","#e5d7b9"],kicker:"EVERY JOURNEY BEGINS"},
  {id:8,title:"Strength for Today",author:"Daily inspiration",category:"Faith",price:350,cover:["#526d61","#e8d7ae"],kicker:"A MOMENT OF REFLECTION"}
];
let cart = [];
const grid = document.getElementById("book-grid");
const money = n => `${STORE.currency} ${n.toLocaleString("en-KE")}`;

function renderBooks(){
  const term = document.getElementById("book-search").value.toLowerCase().trim();
  const category = document.getElementById("category-filter").value;
  const filtered = books.filter(b => (category==="All" || b.category===category) && `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(term));
  grid.innerHTML = filtered.length ? filtered.map(b => `
    <article class="book-card">
      <div class="book-cover" style="background:linear-gradient(145deg,${b.cover[0]},${b.cover[1]});color:${b.cover[1]}">
        <div class="cover-inner"><span class="cover-kicker">${b.kicker}</span><span class="cover-title">${b.title}</span><span class="cover-author">PARADISE BOOK HUB • SAMPLE</span></div>
      </div>
      <div class="book-meta"><span class="book-category">${b.category}</span><h3 class="book-title">${b.title}</h3><div class="book-author">${b.author}</div>
        <div class="book-bottom"><span class="book-price">${money(b.price)}</span><button class="add-button" data-add="${b.id}">+ Add</button></div>
      </div>
    </article>`).join("") : `<p class="no-results">No matching books found. Try another search or category.</p>`;
}
function updateCart(){
  document.getElementById("cart-count").textContent = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById("cart-total").textContent = money(cart.reduce((s,i)=>s+i.price*i.qty,0));
  document.getElementById("cart-items").innerHTML = cart.length ? cart.map(i=>`<div class="cart-line"><div><b>${i.title}</b><small>${money(i.price)} × ${i.qty}</small></div><div><b>${money(i.price*i.qty)}</b><br><button class="remove-item" data-remove="${i.id}">Remove</button></div></div>`).join("") : `<p class="empty-cart">Your bag is waiting for a good book.</p>`;
}
function openCart(){document.getElementById("cart-overlay").classList.add("open");document.getElementById("cart-overlay").setAttribute("aria-hidden","false");}
function closeCart(){document.getElementById("cart-overlay").classList.remove("open");document.getElementById("cart-overlay").setAttribute("aria-hidden","true");}
grid.addEventListener("click",e=>{const id=Number(e.target.dataset.add);if(!id)return;const book=books.find(b=>b.id===id);const found=cart.find(i=>i.id===id);if(found)found.qty++;else cart.push({...book,qty:1});updateCart();});
document.getElementById("cart-items").addEventListener("click",e=>{const id=Number(e.target.dataset.remove);if(!id)return;cart=cart.filter(i=>i.id!==id);updateCart();});
document.getElementById("book-search").addEventListener("input",renderBooks);
document.getElementById("category-filter").addEventListener("change",renderBooks);
document.querySelectorAll(".category-card").forEach(btn=>btn.addEventListener("click",()=>{document.getElementById("category-filter").value=btn.dataset.category;renderBooks();document.getElementById("books").scrollIntoView({behavior:"smooth"});}));
document.getElementById("open-cart").addEventListener("click",openCart);
document.getElementById("close-cart").addEventListener("click",closeCart);
document.getElementById("cart-overlay").addEventListener("click",e=>{if(e.target.id==="cart-overlay")closeCart();});
document.getElementById("checkout").addEventListener("click",()=>{
  if(!cart.length){alert("Add a book to your bag first.");return;}
  if(!STORE.whatsappNumber){alert("This is a demo checkout. Add the store's WhatsApp number in app.js to activate ordering.");return;}
  const lines=cart.map(i=>`• ${i.title} x${i.qty} — ${money(i.price*i.qty)}`).join("%0A");
  const total=money(cart.reduce((s,i)=>s+i.price*i.qty,0));
  const message=`Hello Paradise Book Hub! I'd like to order:%0A${lines}%0AEstimated total: ${total}%0APlease confirm availability and delivery details.`;
  window.open(`https://wa.me/${STORE.whatsappNumber}?text=${message}`,"_blank");
});
document.getElementById("contact-whatsapp").addEventListener("click",e=>{e.preventDefault();if(!STORE.whatsappNumber){alert("Add the store's WhatsApp number in app.js to activate this contact button.");return;}window.open(`https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent("Hello Paradise Book Hub, I'd like to enquire about your books.")}`,"_blank");});
document.getElementById("menu-toggle").addEventListener("click",()=>document.body.classList.toggle("menu-open"));
document.querySelectorAll(".desktop-nav a").forEach(a=>a.addEventListener("click",()=>document.body.classList.remove("menu-open")));
document.querySelector(".search-toggle").addEventListener("click",()=>{document.getElementById("books").scrollIntoView({behavior:"smooth"});setTimeout(()=>document.getElementById("book-search").focus(),450);});
document.getElementById("year").textContent=new Date().getFullYear();
renderBooks();updateCart();