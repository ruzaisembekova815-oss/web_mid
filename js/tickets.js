// ===== Task 3: Ticket builder with live validation (uses the seat map from seatmap.js) =====
// Types with a "zone" are booked on the seat map, the others only by quantity.
const TYPES = [
  { id: "ga", name: "General admission", zone: "ga" },
  { id: "stand", name: "Grandstand", zone: "stand" },
  { id: "paddock", name: "Paddock Club", price: 900, left: 2 }
];
const EVENTS = [
  { id: "suzuka", name: "Japanese GP, Suzuka", dates: ["2027-04-02", "2027-04-03", "2027-04-04"] },
  { id: "monaco", name: "Monaco GP", dates: ["2027-05-28", "2027-05-29", "2027-05-30"] },
  { id: "monza", name: "Italian GP, Monza", dates: ["2027-09-03", "2027-09-04", "2027-09-05"] }
];
const SOLD_OUT = ["2027-05-30", "2027-09-04"];
const PROMOS = [{ code: "LIGHTS10", percent: 10 }, { code: "PITSTOP15", percent: 15 }];
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const $ = (id) => document.getElementById(id);
const form = $("ticket-form");
form.noValidate = true;     // turns off only the browser messages; checkValidity() still works
const fields = [...form.querySelectorAll("[data-field]")];   // only the booking fields, not the seat map controls
const touched = new Set();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

for (const [select, list] of [[$("event"), EVENTS], [$("type"), TYPES]]) {
  for (const item of list) {
    const o = el("option", "", item.name);
    o.value = item.id;
    select.append(o);
  }
}

const findEvent = () => EVENTS.find((e) => e.id === $("event").value);
const findType = () => TYPES.find((t) => t.id === $("type").value);
const findPromo = () => PROMOS.find((p) => p.code === $("promo").value.trim().toUpperCase());
const priceOf = (t) => t.zone ? SeatMap.zones.find((z) => z.id === t.zone).price : t.price;
const leftOf = (t) => t.zone ? SeatMap.freeCount(t.zone) : t.left;

// rules that HTML attributes cannot express
function customRule(f) {
  const v = f.value.trim();
  if (f.id === "date" && v) {
    const ev = findEvent();
    if (ev && !ev.dates.includes(v)) return `${ev.name} is on ${ev.dates[0]} to ${ev.dates[ev.dates.length - 1]}.`;
    if (SOLD_OUT.includes(v)) return "This date is sold out. Choose another day.";
  }
  if (f.id === "qty") {
    const t = findType();
    if (t && t.zone) {   // seat types: quantity = selected seats on the map
      const n = SeatMap.selected().length;
      if (n === 0) return "Choose your seats on the map first.";
      if (Number(v) !== n) return `You selected ${n} ${n === 1 ? "seat" : "seats"}. Quantity must be ${n}.`;
    } else if (t && v && Number(v) > t.left) {
      return t.left === 0 ? "This ticket type is sold out." : `Only ${t.left} ${t.name} tickets are left.`;
    }
  }
  if (f.id === "fullname" && v && !/^\p{L}+([ '-]\p{L}+)+$/u.test(v)) return "Enter first and last name, letters only.";
  if (f.id === "email" && v && !(v.split("@")[1] || "").includes(".")) return "The email domain must contain a dot, like example.com.";
  if (f.id === "promo" && v && !findPromo()) return "Unknown promo code.";
  return "";
}

function builtIn(f) {
  const v = f.validity;
  if (v.valueMissing) return "This field is required.";
  if (v.typeMismatch) return "Enter an email like name@example.com.";
  if (v.tooShort) return `Use at least ${f.minLength} characters.`;
  if (v.tooLong) return `Use at most ${f.maxLength} characters.`;
  if (v.rangeUnderflow || v.rangeOverflow) return `Allowed range: ${f.min} to ${f.max}.`;
  if (v.stepMismatch || v.badInput) return "Enter a whole number.";
  return "Check this value.";
}

function show(f, message) {
  $(f.id + "-error").textContent = message;
  f.classList.toggle("is-invalid", message !== "");
  f.classList.toggle("is-valid", message === "" && f.value !== "");
  f.setAttribute("aria-invalid", message === "" ? "false" : "true");
}

function check(f) {
  f.setCustomValidity("");
  const custom = customRule(f);
  if (custom) f.setCustomValidity(custom);
  const ok = f.checkValidity();
  show(f, ok ? "" : custom || builtIn(f));
  return ok;
}

function preview() {
  const ev = findEvent(), t = findType(), qty = Number($("qty").value), promo = findPromo();
  const ids = t && t.zone ? SeatMap.selected().map((s) => s.id) : [];
  $("pv-event").textContent = ev ? ev.name : "—";
  $("pv-date").textContent = $("date").value || "—";
  $("pv-type").textContent = t ? t.name : "—";
  $("pv-seats").textContent = ids.length > 0 ? ids.join(", ") : "—";
  $("pv-qty").textContent = qty > 0 ? qty : "—";
  $("pv-name").textContent = $("fullname").value.trim() || "—";
  $("type-hint").textContent = !t ? "" : t.zone ? `Free seats: ${leftOf(t)}. Pick them on the map below.` : `Seats left: ${t.left}`;
  if (t && qty > 0) {
    const total = priceOf(t) * qty * (1 - (promo ? promo.percent : 0) / 100);
    $("pv-total").textContent = `$${total.toFixed(2)}` + (promo ? ` (-${promo.percent}%)` : "");
  } else {
    $("pv-total").textContent = "—";
  }
}

// blur does not bubble, so listen in the capture phase
form.addEventListener("blur", (e) => {
  if (fields.includes(e.target)) { touched.add(e.target); check(e.target); }
}, true);
form.addEventListener("input", (e) => {
  if (e.target.id === "type") {
    const t = findType();
    SeatMap.setZone(t && t.zone ? t.zone : null);   // the map unlocks the zone of this type
  }
  preview();
  if (touched.has(e.target) && fields.includes(e.target)) check(e.target);
  // fields that depend on this one are checked again
  if (e.target.id === "event" && touched.has($("date"))) check($("date"));
  if (e.target.id === "type" && touched.has($("qty"))) check($("qty"));
});

// the seat map changed: the quantity follows the selected seats
document.addEventListener("seats-change", () => {
  const t = findType();
  if (t && t.zone) $("qty").value = SeatMap.selected().length || "";
  preview();
  if (touched.has($("qty"))) check($("qty"));
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const invalid = [];
  for (const f of fields) {
    touched.add(f);
    if (!check(f)) invalid.push(f);
  }
  const summary = $("summary");
  if (invalid.length > 0) {
    summary.textContent = `Please fix ${invalid.length} ${invalid.length === 1 ? "error" : "errors"} below.`;
    summary.classList.remove("d-none");
    invalid[0].focus();
    return;
  }
  summary.classList.add("d-none");
  const ev = findEvent(), t = findType(), qty = Number($("qty").value), promo = findPromo();
  const ids = t.zone ? SeatMap.selected().map((s) => s.id) : [];
  const total = priceOf(t) * qty * (1 - (promo ? promo.percent : 0) / 100);
  let code = "LO-";
  for (let i = 0; i < 6; i++) code += CODE_CHARS[randInt(0, CODE_CHARS.length - 1)];

  const ticket = el("article", "ticket-done");
  ticket.append(el("h2", "h4", "Your ticket is booked"));
  ticket.append(el("p", "code", code));
  ticket.append(el("p", "mb-1", `${ev.name}, ${$("date").value}`));
  ticket.append(el("p", "mb-1", `${qty} × ${t.name}` + (ids.length > 0 ? ` (seats ${ids.join(", ")})` : "") + ` for ${$("fullname").value.trim()}`));
  ticket.append(el("p", "mb-0", `Total: $${total.toFixed(2)}`));
  $("result").replaceChildren(ticket);

  if (t.zone) SeatMap.bookSelected(); else t.left -= qty;   // the seats are really taken
  form.reset();
  touched.clear();
  for (const f of fields) show(f, "");
  SeatMap.setZone(null);
  preview();
  $("result").focus();
});
preview();
