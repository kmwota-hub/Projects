const SHOP = { name: "Bloom Haven", whatsapp: "254700000000" };

const products = [
  {
    id: 1,
    name: "Classic Red Roses",
    category: "Roses",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Blush Pink Roses",
    category: "Roses",
    price: 2700,
    image:
      "https://images.unsplash.com/photo-1494336934272-fc5e936bd2fd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Cream Rose Elegance",
    category: "Roses",
    price: 2900,
    image:
      "https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Rose & Baby’s Breath",
    category: "Roses",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Sunshine Sunflowers",
    category: "Bright & Cheerful",
    price: 2200,
    image:
      "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Colourful Garden Mix",
    category: "Bright & Cheerful",
    price: 2400,
    image:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Gerbera Joy Bouquet",
    category: "Bright & Cheerful",
    price: 2100,
    image:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Golden Celebration Mix",
    category: "Bright & Cheerful",
    price: 2600,
    image:
      "https://images.unsplash.com/photo-1487070183336-b863922373d4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 9,
    name: "White Lily Grace",
    category: "Elegant",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1501973931234-5ac2964cd94a?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 10,
    name: "Pink Lily Charm",
    category: "Elegant",
    price: 3100,
    image:
      "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 11,
    name: "Orchid Luxe",
    category: "Elegant",
    price: 3800,
    image:
      "https://images.unsplash.com/photo-1566907225472-4cb0fbe6b98d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 12,
    name: "White Hydrangea Cloud",
    category: "Elegant",
    price: 3500,
    image:
      "https://images.unsplash.com/photo-1567696153798-9111f9cd3d0d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 13,
    name: "Pink Tulip Wrap",
    category: "Seasonal",
    price: 2600,
    image:
      "https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 14,
    name: "Purple Tulip Bundle",
    category: "Seasonal",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 15,
    name: "Daisy Daydream",
    category: "Seasonal",
    price: 1900,
    image:
      "https://images.unsplash.com/photo-1495231916356-a86217efff12?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 16,
    name: "Lavender Calm",
    category: "Seasonal",
    price: 2300,
    image:
      "https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 17,
    name: "Bridal White Bouquet",
    category: "Special Occasion",
    price: 4500,
    image:
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 18,
    name: "Romantic Anniversary Mix",
    category: "Special Occasion",
    price: 3600,
    image:
      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 19,
    name: "Birthday Bloom Box",
    category: "Special Occasion",
    price: 3300,
    image:
      "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 20,
    name: "Gentle Sympathy Whites",
    category: "Special Occasion",
    price: 3400,
    image:
      "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=900&q=80",
  },
];

const $ = (s) => document.querySelector(s);
const money = (n) => `KSh ${n.toLocaleString("en-KE")}`;
let activeCategory = "All";
let cart = JSON.parse(localStorage.getItem("bloomHavenCart") || "{}");

function saveCart() {
  localStorage.setItem("bloomHavenCart", JSON.stringify(cart));
  updateCart();
}
function categories() {
  return ["All", ...new Set(products.map((p) => p.category))];
}
function renderFilters() {
  $("#filters").innerHTML = categories()
    .map(
      (c) =>
        `<button class="filter ${c === activeCategory ? "active" : ""}" data-category="${c}">${c}</button>`,
    )
    .join("");
}
function renderProducts() {
  const q = $("#searchInput").value.trim().toLowerCase();
  const shown = products.filter(
    (p) =>
      (activeCategory === "All" || p.category === activeCategory) &&
      `${p.name} ${p.category}`.toLowerCase().includes(q),
  );
  $("#products").innerHTML = shown
    .map(
      (p) =>
        `<article class="product"><div class="pic"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='assets/hero.png'"><span>${p.category}</span></div><div class="info"><h3>${p.name}</h3><div class="product-bottom"><p class="price">${money(p.price)}</p><button class="add-btn" data-id="${p.id}">Add to cart</button></div></div></article>`,
    )
    .join("");
  $("#empty").hidden = shown.length > 0;
}
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  showToast(`${products.find((p) => p.id === id).name} added to cart`);
}
function changeQty(id, delta) {
  const next = (cart[id] || 0) + delta;
  if (next <= 0) delete cart[id];
  else cart[id] = next;
  saveCart();
}
function removeItem(id) {
  delete cart[id];
  saveCart();
}
function updateCart() {
  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  const totalQty = entries.reduce((s, [, q]) => s + q, 0);
  const subtotal = entries.reduce(
    (s, [id, q]) =>
      s + (products.find((p) => p.id === Number(id))?.price || 0) * q,
    0,
  );
  $("#count").textContent = totalQty;
  $("#subtotal").textContent = money(subtotal);
  $("#cartEmpty").hidden = entries.length > 0;
  $(".cart-summary").style.display = entries.length ? "block" : "none";
  $("#cartItems").innerHTML = entries
    .map(([id, q]) => {
      const p = products.find((x) => x.id === Number(id));
      if (!p) return "";
      return `<div class="cart-item"><img src="${p.image}" alt="${p.name}" onerror="this.src='assets/hero.png'"><div class="cart-item-info"><h4>${p.name}</h4><p>${money(p.price)}</p><div class="qty"><button data-action="minus" data-id="${p.id}" aria-label="Decrease quantity">−</button><span>${q}</span><button data-action="plus" data-id="${p.id}" aria-label="Increase quantity">+</button></div></div><button class="remove" data-action="remove" data-id="${p.id}" aria-label="Remove ${p.name}">×</button></div>`;
    })
    .join("");
}
function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#backdrop").hidden = false;
  requestAnimationFrame(() => $("#backdrop").classList.add("show"));
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#backdrop").classList.remove("show");
  setTimeout(() => ($("#backdrop").hidden = true), 200);
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.classList.remove("no-scroll");
}
function checkout() {
  const entries = Object.entries(cart).filter(([, q]) => q > 0);
  if (!entries.length) {
    showToast("Your cart is empty");
    return;
  }
  let total = 0;
  const lines = entries.map(([id, q]) => {
    const p = products.find((x) => x.id === Number(id));
    const line = p.price * q;
    total += line;
    return `• ${p.name} × ${q} — ${money(line)}`;
  });
  const message = `Hello ${SHOP.name}! I would like to order:\n\n${lines.join("\n")}\n\nSubtotal: ${money(total)}\n\nPlease confirm availability and delivery fee. Thank you.`;
  window.open(
    `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener",
  );
}
let toastTimer;
function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

$("#filters").addEventListener("click", (e) => {
  const b = e.target.closest("[data-category]");
  if (!b) return;
  activeCategory = b.dataset.category;
  renderFilters();
  renderProducts();
});
$("#products").addEventListener("click", (e) => {
  const b = e.target.closest(".add-btn");
  if (b) addToCart(Number(b.dataset.id));
});
$("#cartItems").addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const id = Number(b.dataset.id);
  if (b.dataset.action === "plus") changeQty(id, 1);
  if (b.dataset.action === "minus") changeQty(id, -1);
  if (b.dataset.action === "remove") removeItem(id);
});
$("#searchInput").addEventListener("input", renderProducts);
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#backdrop").addEventListener("click", closeCart);
$("#checkoutBtn").addEventListener("click", checkout);
$("#clearCart").addEventListener("click", () => {
  cart = {};
  saveCart();
  showToast("Cart cleared");
});
$("#menuBtn").addEventListener("click", () => {
  const nav = $("#nav");
  nav.classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", nav.classList.contains("open"));
});
$("#nav").addEventListener("click", () => $("#nav").classList.remove("open"));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});
$("#year").textContent = new Date().getFullYear();
renderFilters();
renderProducts();
updateCart();
