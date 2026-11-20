(() => {
  const config = window.BUSINESS_CONFIG || {};
  const name = config.name || "Your Business";
  document
    .querySelectorAll("[data-business-name]")
    .forEach((el) => (el.textContent = name));
  document
    .querySelectorAll("[data-location]")
    .forEach(
      (el) => (el.textContent = config.location || "Add business location"),
    );
  document
    .querySelectorAll("[data-hours]")
    .forEach(
      (el) => (el.textContent = config.hours || "Contact us for opening hours"),
    );
  document
    .querySelectorAll("[data-phone-display]")
    .forEach(
      (el) => (el.textContent = config.phoneDisplay || "Add phone number"),
    );

  const makeWhatsAppUrl = (message) => {
    const number = (config.whatsapp || "").replace(/\D/g, "");
    if (!number) {
      alert(
        "Demo setup: please add the client's real WhatsApp number in config.js before using this button.",
      );
      return null;
    }
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };
  const defaultMessage = `Hi ${name}, I found your website and would like to make an enquiry.`;
  document.querySelectorAll("[data-wa-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const url = makeWhatsAppUrl(defaultMessage);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    });
  });
  document.querySelectorAll("[data-map-link]").forEach((link) => {
    link.href =
      config.googleMapsUrl ||
      "https://www.google.com/maps/search/?api=1&query=Juja%2C%20Kenya";
  });
  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const service = link.dataset.service;
      document.querySelector("#service").value = service;
      document.querySelector("#booking").scrollIntoView({ behavior: "smooth" });
    });
  });
  const form = document.querySelector("#booking-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = [
      `Hello ${name}, I'd like to request an appointment.`,
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Service: ${data.get("service")}`,
      `Preferred date: ${data.get("date") || "Flexible"}`,
      `Additional details: ${data.get("message") || "None"}`,
    ].join("\n");
    const url = makeWhatsAppUrl(message);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  });
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }),
  );
  document.querySelector("#year").textContent = new Date().getFullYear();
})();
