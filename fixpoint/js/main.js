const nav = document.querySelector("nav"),
  menu = document.querySelector(".menu");
menu.addEventListener("click", () => nav.classList.toggle("open"));
nav
  .querySelectorAll("a")
  .forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open")),
  );
document.querySelector("#year").textContent = new Date().getFullYear();
const box = document.querySelector("#products");
function render(filter = "all") {
  box.innerHTML = PRODUCTS.filter(
    (p) => filter === "all" || p.category === filter,
  )
    .map(
      (p) =>
        `<article class="product"><div class="visual">${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : p.icon}</div><div class="body"><span class="cat">${p.category}</span><h3>${p.name}</h3><div class="price">${p.price}</div><a href="https://wa.me/254700000000?text=${encodeURIComponent("Hello FixPoint Mobile, I am interested in " + p.name)}" target="_blank">Ask on WhatsApp →</a></div></article>`,
    )
    .join("");
}
render();
document.querySelectorAll(".filters button").forEach((b) =>
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".filters button")
      .forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.filter);
  }),
);
