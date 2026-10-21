const $ = (s) => document.querySelector(s),
  $$ = (s) => document.querySelectorAll(s);
let cart = JSON.parse(localStorage.getItem("royalscent-cart") || "{}");
function money(n) {
  return "KSh " + n.toLocaleString();
}
function render(list = PRODUCTS) {
  $("#products").innerHTML = list
    .map(
      (p) =>
        `<article class="card"><div class="pic">${p.emoji}</div><div class="card-body"><h3>${p.name}</h3><div class="meta">${p.category} · ${p.notes}</div><div class="stars">★★★★★</div><div class="price">${money(p.price)}</div><button class="add" onclick="add(${p.id})">🛍 Add to Cart</button></div></article>`,
    )
    .join("");
}
function add(id) {
  cart[id] = (cart[id] || 0) + 1;
  save();
  openCart();
}
function save() {
  localStorage.setItem("royalscent-cart", JSON.stringify(cart));
  renderCart();
}
function renderCart() {
  let ids = Object.keys(cart);
  let total = 0,
    count = 0;
  $("#cartItems").innerHTML = ids.length
    ? ids
        .map((id) => {
          let p = PRODUCTS.find((x) => x.id == id),
            q = cart[id];
          total += p.price * q;
          count += q;
          return `<div class="cartrow"><div class="mini">${p.emoji}</div><div><h4>${p.name}</h4><p>${money(p.price)}</p><div class="qty"><button onclick="change(${id},-1)">−</button><span>${q}</span><button onclick="change(${id},1)">+</button></div></div><button class="remove" onclick="removeItem(${id})">×</button></div>`;
        })
        .join("")
    : '<p style="text-align:center;color:#777;padding:35px">Your cart is empty.</p>';
  $("#subtotal").textContent = money(total);
  $$(".badge").forEach((x) => (x.textContent = count));
}
function change(id, d) {
  cart[id] += d;
  if (cart[id] <= 0) delete cart[id];
  save();
}
function removeItem(id) {
  delete cart[id];
  save();
}
function openCart() {
  $("#cart").classList.add("show");
  $("#overlay").classList.add("show");
}
function closeCart() {
  $("#cart").classList.remove("show");
  $("#overlay").classList.remove("show");
}
$$(".cart-open").forEach((b) => (b.onclick = openCart));
$("#closeCart").onclick = closeCart;
$("#overlay").onclick = closeCart;
$("#clearCart").onclick = () => {
  cart = {};
  save();
};
function filter() {
  let q = $("#search").value.toLowerCase(),
    cat = $("#filter").value;
  render(
    PRODUCTS.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (p.name + " " + p.notes + " " + p.category).toLowerCase().includes(q),
    ),
  );
}
$("#search").oninput = filter;
$("#filter").onchange = filter;
$("#searchBtn").onclick = () => {
  location.hash = "shop";
  setTimeout(() => $("#search").focus(), 100);
};
$$(".cats button").forEach(
  (b) =>
    (b.onclick = () => {
      $("#filter").value = b.dataset.cat;
      filter();
      location.hash = "shop";
    }),
);
$("#menuBtn").onclick = () => $("#nav").classList.toggle("open");
$$("#nav a").forEach(
  (a) => (a.onclick = () => $("#nav").classList.remove("open")),
);
$("#checkout").onclick = () => {
  let ids = Object.keys(cart);
  if (!ids.length) return alert("Your cart is empty.");
  let total = 0;
  let lines = ids.map((id) => {
    let p = PRODUCTS.find((x) => x.id == id),
      q = cart[id];
    total += p.price * q;
    return `• ${p.name} x${q} — ${money(p.price * q)}`;
  });
  let msg = `Hello RoyalScent, I'd like to place an order:\n\n${lines.join("\n")}\n\nSubtotal: ${money(total)}\n\nPlease confirm delivery fee and availability.`;
  window.open(
    "https://wa.me/254748804805?text=" + encodeURIComponent(msg),
    "_blank",
  );
};
render();
renderCart();
