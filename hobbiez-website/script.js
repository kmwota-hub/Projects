document.getElementById("year").textContent = new Date().getFullYear();
const menu = document.querySelector(".menu"),
  nav = document.querySelector(".nav nav");
menu.addEventListener("click", () => nav.classList.toggle("open"));
nav
  .querySelectorAll("a")
  .forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open")),
  );
