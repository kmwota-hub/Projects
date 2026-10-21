const WHATSAPP = "254700000000";
const products = [
  [1, "Velvet Red Rose Bouquet", "Roses", 1450, "🌹"],
  [2, "Blush Pink Rose Bouquet", "Roses", 1350, "🌷"],
  [3, "Ivory Rose Arrangement", "Roses", 1600, "🤍"],
  [4, "Luxury Rose Box", "Roses", 2200, "🌹"],
  [5, "Spring Tulip Bundle", "Tulips", 1200, "🌷"],
  [6, "Pastel Tulip Vase", "Tulips", 1750, "🌷"],
  [7, "White Tulip Bouquet", "Tulips", 1300, "🤍"],
  [8, "Mixed Tulip Basket", "Tulips", 1850, "🌷"],
  [9, "Golden Sunflower Bouquet", "Sunflowers", 1500, "🌻"],
  [10, "Sunflower Table Pot", "Sunflowers", 1250, "🌻"],
  [11, "Rustic Sunflower Basket", "Sunflowers", 1900, "🌻"],
  [12, "Elegant White Lily Vase", "Lilies", 1850, "🌸"],
  [13, "Pink Lily Bouquet", "Lilies", 1550, "🌸"],
  [14, "Lily & Rose Mix", "Lilies", 2100, "💐"],
  [15, "Purple Orchid Pot", "Orchids", 1950, "🌺"],
  [16, "White Orchid Display", "Orchids", 2100, "🌺"],
  [17, "Hydrangea Cloud Bouquet", "Mixed", 1650, "💐"],
  [18, "Peony Romance Arrangement", "Mixed", 1800, "🌸"],
  [19, "Eucalyptus & Blossom Stems", "Greenery", 1150, "🌿"],
  [20, "Artificial Hanging Fern", "Greenery", 1300, "🌿"],
];
const cats = ["All", ...new Set(products.map((p) => p[2]))];
let active = "All";
let cart = JSON.parse(localStorage.getItem("everbloom-cart") || "{}");
const $ = (s) => document.querySelector(s),
  money = (n) => "KSh " + n.toLocaleString();
function renderCats() {
  $("#categoryGrid").innerHTML = cats
    .slice(1)
    .map(
      (c) =>
        `<div class="category" onclick="filterCat('${c}')"><div class="emoji">${products.find((p) => p[2] === c)?.[4] || "💐"}</div><b>${c}</b><small>${products.filter((p) => p[2] === c).length} products</small></div>`,
    )
    .join("");
  $("#filters").innerHTML = cats
    .map(
      (c) =>
        `<button class="${c === active ? "active" : ""}" onclick="filterCat('${c}')">${c}</button>`,
    )
    .join("");
}
function renderProducts() {
  let q = $("#search").value.toLowerCase();
  let list = products.filter(
    (p) =>
      (active === "All" || p[2] === active) && p[1].toLowerCase().includes(q),
  );
  $("#products").innerHTML =
    list
      .map(
        (p) =>
          `<article class="card"><div class="productVisual">${p[4]}</div><div class="cardBody"><small>${p[2]}</small><h3>${p[1]}</h3><span class="price">${money(p[3])}</span><button onclick="add(${p[0]})">Add to Cart</button></div></article>`,
      )
      .join("") || "<p>No products found.</p>";
}
window.filterCat = (c) => {
  active = c;
  renderCats();
  renderProducts();
  document.querySelector("#shop").scrollIntoView();
};
window.add = (id) => {
  cart[id] = (cart[id] || 0) + 1;
  save();
  toast("Added to cart");
  openCart();
};
window.changeQty = (id, d) => {
  cart[id] = (cart[id] || 0) + d;
  if (cart[id] <= 0) delete cart[id];
  save();
};
window.removeItem = (id) => {
  delete cart[id];
  save();
};
function save() {
  localStorage.setItem("everbloom-cart", JSON.stringify(cart));
  renderCart();
}
function renderCart() {
  let entries = Object.entries(cart);
  let total = 0,
    count = 0;
  $("#cartItems").innerHTML = entries.length
    ? entries
        .map(([id, q]) => {
          let p = products.find((x) => x[0] == id);
          total += p[3] * q;
          count += q;
          return `<div class="cartRow"><div class="mini">${p[4]}</div><div><b>${p[1]}</b><br><small>${money(p[3])}</small><div class="qty"><button onclick="changeQty(${id},-1)">−</button><span>${q}</span><button onclick="changeQty(${id},1)">+</button></div></div><button class="remove" onclick="removeItem(${id})">✕</button></div>`;
        })
        .join("")
    : "<p>Your cart is empty. Add some lasting beauty 🌿</p>";
  $("#subtotal").textContent = money(total);
  $("#cartCount").textContent = count;
  const dc = $("#dockCount");
  if (dc) dc.textContent = count;
}
function openCart() {
  $("#cart").classList.add("open");
  $("#overlay").classList.add("show");
}
function closeCart() {
  $("#cart").classList.remove("open");
  $("#overlay").classList.remove("show");
}
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 1500);
}
$("#openCart").onclick = openCart;
const dock = $("#dockCart");
if (dock) dock.onclick = openCart;
$("#closeCart").onclick = closeCart;
$("#overlay").onclick = closeCart;
$("#clearCart").onclick = () => {
  cart = {};
  save();
};
$("#search").oninput = renderProducts;
$("#menuBtn").onclick = () => $("#nav").classList.toggle("open");
function wa(text) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
}
$("#floatingWA").href = wa(
  "Hello EverBloom, I would like to ask about your artificial flowers.",
);
$("#quoteLink").href = wa(
  "Hello EverBloom, I would like a custom artificial flower arrangement.",
);
$("#checkout").onclick = () => {
  let es = Object.entries(cart);
  if (!es.length) return toast("Your cart is empty");
  let total = 0;
  let lines = es.map(([id, q]) => {
    let p = products.find((x) => x[0] == id);
    total += p[3] * q;
    return `• ${p[1]} x${q} — ${money(p[3] * q)}`;
  });
  window.open(
    wa(
      `Hello EverBloom, I would like to order:\n\n${lines.join("\n")}\n\nSubtotal: ${money(total)}\n\nPlease confirm availability and delivery charges.`,
    ),
    "_blank",
  );
};
$("#year").textContent = new Date().getFullYear();
renderCats();
renderProducts();
renderCart();
// Mobile UX: close menu after navigation and prevent background scrolling behind cart.
document
  .querySelectorAll("#nav a")
  .forEach((a) =>
    a.addEventListener("click", () => $("#nav").classList.remove("open")),
  );
const originalOpenCart = openCart,
  originalCloseCart = closeCart;
openCart = function () {
  originalOpenCart();
  document.body.style.overflow = "hidden";
};
closeCart = function () {
  originalCloseCart();
  document.body.style.overflow = "";
};
$("#openCart").onclick = openCart;
if (dock) dock.onclick = openCart;
$("#closeCart").onclick = closeCart;
$("#overlay").onclick = closeCart;
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});
