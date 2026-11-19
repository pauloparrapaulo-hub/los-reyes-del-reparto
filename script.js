/* =========================================================
   Configuración — edita estos valores
   ========================================================= */
const CONFIG = {
  // Correo donde llegan los pedidos (servicio gratuito FormSubmit.co).
  // El primer pedido envía un correo de activación a esta dirección:
  // hay que abrirlo y pulsar "Activate Form" una sola vez.
  emailPedidos: "pauloparra.paulo@gmail.com",

  // Formato de moneda
  locale: "es-CL",
  moneda: "CLP",

  // Costo de envío (0 = gratis)
  costoEnvio: 0,

  // Días de reparto: 0 = domingo, 1 = lunes … 6 = sábado
  diasReparto: [1, 2, 3, 4, 5, 6],

  // Días mínimos de anticipación para agendar
  anticipacion: 1,
};

/* ---------------------------------------------------------
   Catálogo — agrega, quita o cambia productos y precios
   cat:  "canastas" | "frutas" | "verduras"
   foto: id de la foto en Unsplash (images.unsplash.com/<foto>)
   mix:  (solo canastas) productos cuyas fotos forman el mosaico;
         el primero se muestra grande
   --------------------------------------------------------- */
const PRODUCTOS = [
  { id: "canasta-basica",   cat: "canastas", nombre: "Canasta Básica",   detalle: "Para 1–2 personas · 6 verduras y 3 frutas, aprox. 6 kg", precio: 12990, unidad: "un.", colores: ["#d94a38"], ancho: true, mix: ["tomates", "lechuga", "zanahorias", "manzanas", "platanos"] },
  { id: "canasta-familiar", cat: "canastas", nombre: "Canasta Familiar", detalle: "Para 3–5 personas · 10 verduras y 5 frutas, aprox. 12 kg", precio: 22990, unidad: "un.", colores: ["#e98a2f"], ancho: true, etiqueta: "Más pedida", mix: ["zanahorias", "paltas", "naranjas", "pimentones", "papas"] },

  { id: "manzanas", cat: "frutas", nombre: "Manzanas", detalle: "Rojas, dulces y crujientes", precio: 1490, unidad: "kg", colores: ["#c8333a"], foto: "photo-1560806887-1e4cd0b6cbd6" },
  { id: "platanos", cat: "frutas", nombre: "Plátanos", detalle: "En su punto justo", precio: 1290, unidad: "kg", colores: ["#f1c84b"], foto: "photo-1571771894821-ce9b6c11b08e" },
  { id: "naranjas", cat: "frutas", nombre: "Naranjas", detalle: "Ideales para jugo", precio: 1190, unidad: "kg", colores: ["#f39a2b"], foto: "photo-1611080626919-7cf5a9dbab5b" },
  { id: "limones",  cat: "frutas", nombre: "Limones",  detalle: "Jugosos y aromáticos", precio: 1590, unidad: "kg", colores: ["#d9d64a"], foto: "photo-1590502593747-42a996133562" },
  { id: "paltas",   cat: "frutas", nombre: "Paltas",   detalle: "Cremosas, listas para comer", precio: 4990, unidad: "kg", colores: ["#5c7a2e"], foto: "photo-1523049673857-eb18f1d7b578" },

  { id: "tomates",    cat: "verduras", nombre: "Tomates",    detalle: "Maduros y firmes", precio: 1690, unidad: "kg", colores: ["#d94a38"], foto: "photo-1582284540020-8acbe03f4924" },
  { id: "lechuga",    cat: "verduras", nombre: "Lechuga",    detalle: "Fresca y crujiente", precio: 990, unidad: "un.", colores: ["#7fb04a"], foto: "photo-1640958904159-51ae08bd3412" },
  { id: "zanahorias", cat: "verduras", nombre: "Zanahorias", detalle: "Dulces, de la temporada", precio: 990, unidad: "kg", colores: ["#e98a2f"], foto: "photo-1598170845058-32b9d6a5da37" },
  { id: "papas",      cat: "verduras", nombre: "Papas",      detalle: "Para cocer, freír u hornear", precio: 1190, unidad: "kg", colores: ["#c9a26b"], foto: "photo-1518977676601-b53f82aba655" },
  { id: "cebollas",   cat: "verduras", nombre: "Cebollas",   detalle: "Firmes y de buen calibre", precio: 1090, unidad: "kg", colores: ["#d8b98f"], foto: "photo-1757813027601-49030d3162ae" },
  { id: "pimentones", cat: "verduras", nombre: "Pimentones", detalle: "De colores variados", precio: 690, unidad: "un.", colores: ["#b8322a"], foto: "photo-1563565375-f3fdfdbefa83" },
];

/* ========================================================= */

const $ = (sel) => document.querySelector(sel);
const byId = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p]));
const money = new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: CONFIG.moneda, maximumFractionDigits: 0 });
const fmt = (n) => money.format(n);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

$("#year").textContent = new Date().getFullYear();

/* ---------- Estado del carrito (se guarda en el navegador) ---------- */
const STORAGE_KEY = "reyes-reparto-carrito";
let cart = {};
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  for (const [id, qty] of Object.entries(saved)) if (byId[id] && qty > 0) cart[id] = Math.min(99, qty | 0);
} catch { cart = {}; }

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch { /* sin almacenamiento */ }
}

function setQty(id, qty) {
  qty = Math.max(0, Math.min(99, qty));
  if (qty === 0) delete cart[id];
  else cart[id] = qty;
  saveCart();
  renderAll(id);
}

const cartLines = () => Object.entries(cart).map(([id, qty]) => ({ ...byId[id], qty, total: byId[id].precio * qty }));
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
const subtotal = () => cartLines().reduce((a, l) => a + l.total, 0);

/* ---------- Catálogo ---------- */
const grid = $("#productGrid");

const fotoURL = (foto, w, h) =>
  `https://images.unsplash.com/${foto}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

const imgTag = (p, w, h) =>
  `<img src="${fotoURL(p.foto, w, h)}" alt="${esc(p.nombre)}" width="${w}" height="${h}" loading="lazy" decoding="async">`;

// Miniatura para el carrito: la foto del producto o, en canastas, la del primer producto del mix
const thumb = (p) => imgTag(p.foto ? p : byId[p.mix[0]], 96, 96);

const swatch = (p) => p.mix
  ? `<div class="product__media product__media--mix" style="--c:${p.colores[0]}">${p.mix.map((id, i) => imgTag(byId[id], i ? 300 : 600, i ? 200 : 400)).join("")}</div>`
  : `<div class="product__media" style="--c:${p.colores[0]}">${imgTag(p, 600, 450)}</div>`;

grid.innerHTML = PRODUCTOS.map((p) => `
  <article class="product${p.ancho ? " product--wide" : ""}" data-id="${p.id}" data-cat="${p.cat}">
    ${swatch(p)}
    <div class="product__body">
      ${p.etiqueta ? `<span class="product__tag">${esc(p.etiqueta)}</span>` : ""}
      <h3>${esc(p.nombre)}</h3>
      <p>${esc(p.detalle)}</p>
      <div class="product__foot">
        <div class="price"><strong>${fmt(p.precio)}</strong> <span>/ ${p.unidad}</span></div>
        <button type="button" class="add-btn" data-action="add" data-id="${p.id}">Agregar</button>
        <div class="stepper" hidden>
          <button type="button" data-action="dec" data-id="${p.id}" aria-label="Quitar ${esc(p.nombre)}">−</button>
          <output aria-live="polite">0</output>
          <button type="button" data-action="inc" data-id="${p.id}" aria-label="Agregar ${esc(p.nombre)}">+</button>
        </div>
      </div>
    </div>
  </article>`).join("");

function renderCard(id) {
  const card = grid.querySelector(`[data-id="${id}"]`);
  if (!card) return;
  const qty = cart[id] || 0;
  card.classList.toggle("in-cart", qty > 0);
  card.querySelector(".add-btn").hidden = qty > 0;
  card.querySelector(".stepper").hidden = qty === 0;
  card.querySelector("output").textContent = qty;
}

/* Filtros */
document.querySelectorAll("[data-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    const f = chip.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", c === chip);
    });
    grid.querySelectorAll(".product").forEach((card) => {
      card.hidden = f !== "todo" && card.dataset.cat !== f;
    });
  });
});

/* ---------- Carrito y resumen ---------- */
const emptyHTML = `
  <div class="empty">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
    <p>Tu carrito está vacío.</p>
    <p><a href="#productos" data-close-cart>Ver productos</a></p>
  </div>`;

function lineItemsHTML(editable) {
  return `<ul class="line-items">${cartLines().map((l) => `
    <li class="line-item">
      <span class="line-item__thumb">${thumb(l)}</span>
      <span class="line-item__name">${editable ? "" : `${l.qty} × `}${esc(l.nombre)}</span>
      <span class="line-item__total">${fmt(l.total)}</span>
      <span class="line-item__meta">${fmt(l.precio)} / ${l.unidad}</span>
      ${editable ? `
      <div class="line-item__controls">
        <div class="stepper">
          <button type="button" data-action="dec" data-id="${l.id}" aria-label="Quitar ${esc(l.nombre)}">−</button>
          <output>${l.qty}</output>
          <button type="button" data-action="inc" data-id="${l.id}" aria-label="Agregar ${esc(l.nombre)}">+</button>
        </div>
        <button type="button" class="link-btn" data-action="remove" data-id="${l.id}">Eliminar</button>
      </div>` : ""}
    </li>`).join("")}</ul>`;
}

function totalsHTML() {
  const sub = subtotal();
  const envio = CONFIG.costoEnvio;
  return `
    <div><dt>Subtotal</dt><dd>${fmt(sub)}</dd></div>
    <div><dt>Envío</dt><dd>${envio ? fmt(envio) : "Gratis"}</dd></div>
    <div class="totals__grand"><dt>Total</dt><dd>${fmt(sub + envio)}</dd></div>`;
}

function renderAll(changedId) {
  if (changedId) renderCard(changedId);
  else PRODUCTOS.forEach((p) => renderCard(p.id));

  const empty = cartCount() === 0;
  const count = $("#cartCount");
  if (count.textContent !== String(cartCount())) {
    count.textContent = cartCount();
    const btn = $("#cartOpen");
    btn.classList.remove("bump"); void btn.offsetWidth; btn.classList.add("bump");
  }
  $("#cartOpen").setAttribute("aria-label", `Abrir carrito, ${cartCount()} productos`);

  $("#cartItems").innerHTML = empty ? emptyHTML : lineItemsHTML(true);
  $("#cartTotals").innerHTML = empty ? "" : totalsHTML();
  $("#checkoutBtn").hidden = empty;

  $("#summaryItems").innerHTML = empty ? emptyHTML : lineItemsHTML(false);
  $("#summaryTotals").innerHTML = empty ? "" : totalsHTML();
}

/* Acciones de los botones (+, −, agregar, eliminar) */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const qty = cart[id] || 0;
  switch (btn.dataset.action) {
    case "add":
      setQty(id, 1);
      grid.querySelector(`[data-id="${id}"] [data-action="inc"]`)?.focus();
      toast(`Agregado al carrito: ${byId[id].nombre}`);
      break;
    case "inc": setQty(id, qty + 1); break;
    case "dec":
      setQty(id, qty - 1);
      if (!cart[id] && btn.closest(".product")) grid.querySelector(`[data-id="${id}"] .add-btn`)?.focus();
      break;
    case "remove": setQty(id, 0); break;
  }
});

/* Panel del carrito */
const drawer = $("#cartDrawer");
$("#cartOpen").addEventListener("click", () => drawer.showModal());
$("#cartClose").addEventListener("click", () => drawer.close());
drawer.addEventListener("click", (e) => {
  if (e.target === drawer || e.target.closest("[data-close-cart]") || e.target.closest("#checkoutBtn")) drawer.close();
});

/* Aviso breve */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2200);
}

renderAll();

/* ---------- Fechas ---------- */
const fecha = $("#fecha");
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

function primeraFechaDisponible() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + CONFIG.anticipacion);
  while (!CONFIG.diasReparto.includes(d.getDay())) d.setDate(d.getDate() + 1);
  return d;
}
const minDate = primeraFechaDisponible();
fecha.min = toISO(minDate);
fecha.value = toISO(minDate);

const formatoFecha = (s) =>
  fromISO(s).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

/* ---------- Validación ---------- */
const form = $("#orderForm");
const statusEl = $("#formStatus");

function setError(input, msg) {
  const field = input.closest(".field");
  field.classList.add("is-invalid");
  let el = field.querySelector(".error");
  if (!el) {
    el = document.createElement("span");
    el.className = "error";
    field.appendChild(el);
  }
  el.textContent = msg;
}
function clearErrors() {
  form.querySelectorAll(".field.is-invalid").forEach((f) => f.classList.remove("is-invalid"));
  form.querySelectorAll(".error").forEach((e) => e.remove());
  showStatus("");
}
function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.hidden = !msg;
}

function validar() {
  clearErrors();
  let first = null;
  const fail = (input, msg) => { setError(input, msg); first ??= input; };

  if (form.nombre.value.trim().length < 3) fail(form.nombre, "Ingresa tu nombre.");
  if (form.telefono.value.replace(/\D/g, "").length < 8) fail(form.telefono, "Ingresa un teléfono válido.");
  const email = form.email.value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(form.email, "Revisa el formato del email.");
  if (form.direccion.value.trim().length < 5) fail(form.direccion, "Ingresa la dirección de entrega.");

  if (!fecha.value) fail(fecha, "Elige una fecha.");
  else {
    const f = fromISO(fecha.value);
    if (f < minDate) fail(fecha, "Agenda con al menos un día de anticipación.");
    else if (!CONFIG.diasReparto.includes(f.getDay())) fail(fecha, "Ese día no hacemos reparto.");
  }

  if (cartCount() === 0) {
    showStatus("Tu carrito está vacío. Agrega productos antes de confirmar.");
    if (!first) { $("#productos").scrollIntoView(); return false; }
  }

  if (first) { first.focus(); return false; }
  return true;
}

form.addEventListener("input", (e) => {
  const field = e.target.closest(".field.is-invalid");
  if (field) { field.classList.remove("is-invalid"); field.querySelector(".error")?.remove(); }
});

/* ---------- Envío del pedido por email ---------- */
function numeroPedido() {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `RR-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validar()) return;

  if (location.protocol === "file:") {
    showStatus("Para enviar pedidos la página debe estar publicada en internet (no funciona abriendo el archivo directamente).");
    return;
  }

  const num = numeroPedido();
  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const lines = cartLines();
  const sub = subtotal();

  const datos = {
    _subject: `Nuevo pedido ${num} · ${nombre}`,
    _template: "table",
    _captcha: "false",
    "N° de pedido": num,
    "Cliente": nombre,
    "Teléfono": form.telefono.value.trim(),
    "Email": email || "No indicado",
    "Dirección": form.direccion.value.trim(),
    "Fecha de entrega": formatoFecha(fecha.value),
    "Turno": form.turno.value,
    "Forma de pago": form.pago.value,
  };
  lines.forEach((l, i) => {
    datos[`Producto ${i + 1}`] = `${l.qty} ${l.unidad} · ${l.nombre} · ${fmt(l.total)}`;
  });
  datos["Subtotal"] = fmt(sub);
  datos["Envío"] = CONFIG.costoEnvio ? fmt(CONFIG.costoEnvio) : "Gratis";
  datos["TOTAL"] = fmt(sub + CONFIG.costoEnvio);
  datos["Comentarios"] = form.comentarios.value.trim() || "Sin comentarios";
  if (email) datos._replyto = email;

  const btn = $("#submitBtn");
  btn.disabled = true;
  btn.textContent = "Enviando pedido…";
  showStatus("");

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${CONFIG.emailPedidos.trim()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || String(data.success) !== "true") {
      const msg = String(data.message || "");
      throw new Error(/activat/i.test(msg)
        ? "El formulario aún no está activado. Revisa el correo del negocio y pulsa “Activate Form”; luego vuelve a intentarlo."
        : "No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo.");
    }

    // Éxito
    $("#orderNumber").textContent = num;
    $("#modalText").textContent = `Gracias, ${nombre.split(" ")[0]}. Te contactaremos al ${datos["Teléfono"]} para confirmar la entrega del ${datos["Fecha de entrega"]}.`;
    $("#confirmModal").showModal();
    cart = {};
    saveCart();
    renderAll();
    form.reset();
    fecha.value = toISO(minDate);
  } catch (err) {
    showStatus(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Confirmar compra";
  }
});

$("#closeModal").addEventListener("click", () => {
  $("#confirmModal").close();
  window.scrollTo({ top: 0 });
});
