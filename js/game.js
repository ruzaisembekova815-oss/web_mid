const LIVES = 3;
const LOG_SIZE = 5;
const CIRCUITS = [
  { name: "Monaco", turns: 19 }, { name: "Spa-Francorchamps", turns: 19 }, { name: "Monza", turns: 11 },
  { name: "Silverstone", turns: 18 }, { name: "Suzuka", turns: 18 }, { name: "Interlagos", turns: 15 },
  { name: "Baku", turns: 20 }, { name: "Marina Bay", turns: 19 }, { name: "Red Bull Ring", turns: 10 },
  { name: "Hungaroring", turns: 14 }, { name: "Zandvoort", turns: 14 }, { name: "Albert Park", turns: 14 },
  { name: "Bahrain", turns: 15 }, { name: "Jeddah", turns: 27 }, { name: "Imola", turns: 19 },
  { name: "Barcelona", turns: 14 }, { name: "Montreal", turns: 14 }, { name: "Yas Marina", turns: 16 }
];

const $ = (id) => document.getElementById(id);
let state = null;   
let best = 0;       


function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function takeRandom(list) {
  return list.splice(randInt(0, list.length - 1), 1)[0];
}

function say(text, kind) {
  const m = $("message");
  m.textContent = text;
  m.className = kind ? "msg msg-" + kind : "msg";
}

function newGame() {
  const pool = [...CIRCUITS];
  const current = takeRandom(pool);
  const next = takeRandom(pool);
  state = { lives: LIVES, streak: 0, pool, current, next, over: false, log: [] };
  say("Does the next circuit have more or fewer turns?", "");
  draw();
}

function guess(choice) {
  if (state.over) return say("The game is over. Press New game.", "bad");
  if (choice !== "higher" && choice !== "lower") return say("Choose Higher or Lower.", "bad");

  const { current, next } = state;
  const rightHigher = choice === "higher" && next.turns >= current.turns;
  const rightLower = choice === "lower" && next.turns <= current.turns;
  const correct = rightHigher || rightLower;

  if (correct) {
    state.streak++;
    best = Math.max(best, state.streak);
  } else {
    state.lives--;
    state.streak = 0;
  }
  state.log.unshift(`${next.name} has ${next.turns} turns, ${current.name} has ${current.turns}: ${correct ? "right" : "wrong"}`);
  state.log = state.log.slice(0, LOG_SIZE);
  state.current = next;

  if (state.lives === 0) {
    state.over = true; state.next = null;
    say("Game over: you have no lives left. Press New game.", "bad");
  } else if (state.pool.length === 0) {
    state.over = true; state.next = null;
    say("You win! You went through all circuits.", "ok");
  } else {
    state.next = takeRandom(state.pool);
    correct ? say("Right!", "ok") : say("Wrong! You lose a life.", "bad");
  }
  draw();
}

function draw() {
  const lives = $("lives");
  lives.replaceChildren();
  for (let i = 0; i < LIVES; i++) {
    const heart = document.createElement("span");
    heart.textContent = "♥";
    heart.className = i < state.lives ? "life" : "life-lost";
    lives.append(heart);
  }
  $("streak").textContent = state.streak;
  $("best").textContent = best;
  $("cur-name").textContent = state.current.name;
  $("cur-value").textContent = state.current.turns + " turns";
  $("next-name").textContent = state.next ? state.next.name : "—";
  $("next-value").textContent = "?";

  const log = $("log");
  log.replaceChildren();
  for (const line of state.log) {
    const li = document.createElement("li");
    li.textContent = line;
    log.append(li);
  }
  $("game").classList.toggle("is-win", state.over && state.lives > 0);
  $("game").classList.toggle("is-lose", state.over && state.lives === 0);
  for (const b of $("controls").querySelectorAll("[data-guess]")) b.disabled = state.over;
}

$("controls").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-guess]");
  if (btn) guess(btn.dataset.guess);
});
$("restart").addEventListener("click", newGame);
newGame();
