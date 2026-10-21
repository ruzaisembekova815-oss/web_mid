// ===== Task 2: Seat map (a 2D array of seat objects, drawn by render()) =====
const COLS = 10;          // seats in a row
const AISLE_AFTER = 5;    // the aisle is after this seat
const MAX_SEATS = 6;      // limit of selected seats
const ZONES = [
  { id: "stand", name: "Grandstand", price: 250, rows: ["A", "B", "C"] },
  { id: "ga", name: "General admission", price: 120, rows: ["D", "E", "F"] }
];
const TAKEN = ["A4", "A5", "B1", "B6", "C3", "D2", "D3", "E5", "E6", "F8", "F9"];

// seats[row][column] = { id, row, number, zone, price, taken, selected }
const seats = [];
for (const zone of ZONES) {
  for (const letter of zone.rows) {
    const line = [];
    for (let n = 1; n <= COLS; n++) {
      const id = letter + n;
      line.push({ id, row: letter, number: n, zone: zone.id, price: zone.price, taken: TAKEN.includes(id), selected: false });
    }
    seats.push(line);
  }
}

const byId = (id) => document.getElementById(id);
const hall = byId("hall"), seatSearch = byId("seat-search"), zoneFilter = byId("zone-filter"), bestCount = byId("best-count");
let activeZone = null;   // the zone of the chosen ticket type (set from the form)

function makeEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function seatSay(text, kind) {
  byId("seat-message").textContent = text;
  byId("seat-message").className = kind ? "msg msg-" + kind : "msg";
}
const zoneName = (id) => ZONES.find((z) => z.id === id).name;
const allSeats = () => seats.flat();
const selectedSeats = () => allSeats().filter((s) => s.selected);

// zone filter and legend are built from the data
for (const z of ZONES) {
  const o = makeEl("option", "", z.name);
  o.value = z.id;
  zoneFilter.append(o);
}
for (const [cls, text] of [["key-stand", "Grandstand $250"], ["key-ga", "General admission $120"], ["key-selected", "Selected"], ["key-taken", "Taken"]]) {
  byId("legend").append(makeEl("li", cls, text));
}

// the only function that draws the map: call it after every change of the data
function render() {
  const q = seatSearch.value.trim().toUpperCase();
  const zf = zoneFilter.value;
  const filtering = q !== "" || zf !== "all";
  let matches = 0;

  hall.replaceChildren();
  hall.append(makeEl("div", "track-label", "Pit straight"));
  for (const line of seats) {
    const rowEl = makeEl("div", "seat-row");
    rowEl.append(makeEl("span", "row-label", line[0].row));
    for (const seat of line) {
      const match = (zf === "all" || seat.zone === zf) && seat.id.includes(q);
      if (match) matches++;
      const btn = makeEl("button", "seat zone-" + seat.zone, String(seat.number));
      btn.type = "button";
      btn.dataset.seat = seat.id;
      btn.classList.toggle("is-selected", seat.selected);
      btn.classList.toggle("is-taken", seat.taken);
      btn.classList.toggle("is-locked", !seat.taken && seat.zone !== activeZone);
      btn.classList.toggle("is-dim", filtering && !match);
      btn.setAttribute("aria-pressed", String(seat.selected));
      btn.setAttribute("aria-label", `Seat ${seat.id}, ${zoneName(seat.zone)}, $${seat.price}, ${seat.taken ? "taken" : seat.selected ? "selected" : "free"}`);
      rowEl.append(btn);
      if (seat.number === AISLE_AFTER) rowEl.append(makeEl("span", "aisle"));
    }
    hall.append(rowEl);
  }
  byId("seat-empty").textContent = filtering && matches === 0 ? "No seats found. Change the search or the zone." : "";

  // own loop: the live total of the selected seats
  let total = 0;
  const picked = selectedSeats();
  for (const s of picked) total += s.price;
  byId("seat-summary").textContent = picked.length > 0
    ? `Selected: ${picked.map((s) => s.id).join(", ")} · Total $${total}`
    : "No seats selected.";
  document.dispatchEvent(new CustomEvent("seats-change"));
}

function toggleSeat(id) {
  const seat = allSeats().find((s) => s.id === id);
  if (!seat) return;
  if (seat.taken) return seatSay(`Seat ${id} is already taken.`, "bad");
  if (activeZone === null) return seatSay("Choose Grandstand or General admission in the form first.", "bad");
  if (seat.zone !== activeZone) return seatSay(`Seat ${id} is in ${zoneName(seat.zone)}. Change the ticket type to choose it.`, "bad");
  if (!seat.selected && selectedSeats().length >= MAX_SEATS) return seatSay(`You can select at most ${MAX_SEATS} seats.`, "bad");
  seat.selected = !seat.selected;   // change the data first ...
  seatSay("", "");
  render();                         // ... then draw it
}

// free seats together, closest to the center of the hall
function bestSeats() {
  const n = Number(bestCount.value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_SEATS) return seatSay(`Enter a number from 1 to ${MAX_SEATS}.`, "bad");
  if (activeZone === null) return seatSay("Choose Grandstand or General admission in the form first.", "bad");
  const midCol = (COLS - 1) / 2;
  const midRow = (seats.length - 1) / 2;
  let best = null;
  seats.forEach((line, r) => {
    if (line[0].zone !== activeZone) return;
    for (let c = 0; c + n <= COLS; c++) {
      const block = line.slice(c, c + n);
      if (block.some((s) => s.taken)) continue;
      if (c < AISLE_AFTER && c + n > AISLE_AFTER && n <= AISLE_AFTER) continue;   // not across the aisle
      const score = Math.abs(c + (n - 1) / 2 - midCol) + Math.abs(r - midRow);
      if (best === null || score < best.score) best = { score, block };
    }
  });
  if (best === null) return seatSay(`There are no ${n} free seats together in this zone.`, "bad");
  for (const s of allSeats()) s.selected = false;
  for (const s of best.block) s.selected = true;
  seatSay(`Best seats: ${best.block.map((s) => s.id).join(", ")}.`, "ok");
  render();
}

// one listener on the container for all seats (event delegation)
hall.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-seat]");
  if (btn) toggleSeat(btn.dataset.seat);
});
byId("best-btn").addEventListener("click", bestSeats);
for (const control of [seatSearch, zoneFilter]) control.addEventListener("input", render);
// Enter in these fields must not submit the booking form
for (const control of [seatSearch, bestCount]) {
  control.addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });
}

// small API for the booking form (tickets.js)
window.SeatMap = {
  zones: ZONES,
  selected: selectedSeats,
  freeCount: (zoneId) => allSeats().filter((s) => s.zone === zoneId && !s.taken).length,
  setZone(zoneId) {
    if (zoneId === activeZone) return;
    for (const s of allSeats()) s.selected = false;
    activeZone = zoneId;
    seatSay(zoneId ? `Choose up to ${MAX_SEATS} ${zoneName(zoneId)} seats.` : "Choose Grandstand or General admission to pick seats.", "");
    render();
  },
  bookSelected() {
    for (const s of selectedSeats()) { s.taken = true; s.selected = false; }
    render();
  }
};
seatSay("Choose Grandstand or General admission to pick seats.", "");
render();
