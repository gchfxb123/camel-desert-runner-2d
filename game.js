const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ===== GAME STATE ===== */
let running = true;
let score = 0;
let speed = 6;
let gravity = 0.9;

/* ===== PLAYER ===== */
const camel = {
  x: W * 0.2,
  y: 0,
  w: 90,
  h: 60,
  vy: 0,
  onGround: false,
  anim: 0
};

/* ===== GROUND ===== */
const groundY = () => H * 0.78;

/* ===== OBSTACLES ===== */
let obstacles = [];

/* ===== INPUT ===== */
function jump() {
  if (camel.onGround) {
    camel.vy = -18;
    camel.onGround = false;
  }
}
window.addEventListener("touchstart", jump);
window.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

/* ===== UI ===== */
document.getElementById("pauseBtn").onclick = pauseGame;

function pauseGame() {
  running = false;
  document.getElementById("pauseScreen").classList.remove("hidden");
}

function resumeGame() {
  running = true;
  document.getElementById("pauseScreen").classList.add("hidden");
}

function restartGame() {
  score = 0;
  speed = 6;
  obstacles = [];
  camel.y = groundY() - camel.h;
  camel.vy = 0;
  resumeGame();
}

/* ===== SPAWN ===== */
function spawnObstacle() {
  obstacles.push({
    x: W + 40,
    w: 30 + Math.random() * 20,
    h: 40 + Math.random() * 30
  });
}
setInterval(spawnObstacle, 1400);

/* ===== DRAW BACKGROUND ===== */
function drawBackground() {
  // Sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#6ec6ff");
  g.addColorStop(1, "#cfefff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Sun
  ctx.fillStyle = "#ffcc33";
  ctx.beginPath();
  ctx.arc(W * 0.8, H * 0.2, 50, 0, Math.PI * 2);
  ctx.fill();

  // Far dunes
  ctx.fillStyle = "#d6b97b";
  ctx.beginPath();
  ctx.moveTo(0, H * 0.65);
  ctx.quadraticCurveTo(W * 0.3, H * 0.6, W * 0.6, H * 0.65);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.fill();
}

/* ===== DRAW CAMEL (ANIMATED) ===== */
function drawCamel() {
  camel.anim += 0.25;

  const legOffset = Math.sin(camel.anim) * 8;
  const bodyBob = Math.sin(camel.anim * 2) * 4;

  ctx.fillStyle = "#c49a6c";

  // Body
  ctx.fillRect(camel.x, camel.y + bodyBob, camel.w, camel.h);

  // Head
  ctx.fillRect(camel.x + camel.w - 10, camel.y - 20 + bodyBob, 30, 20);

  // Legs
  ctx.fillRect(camel.x + 10, camel.y + camel.h, 10, 30 + legOffset);
  ctx.fillRect(camel.x + 30, camel.y + camel.h, 10, 30 - legOffset);
  ctx.fillRect(camel.x + 60, camel.y + camel.h, 10, 30 + legOffset);
}

/* ===== UPDATE ===== */
function update() {
  camel.vy += gravity;
  camel.y += camel.vy;

  if (camel.y + camel.h >= groundY()) {
    camel.y = groundY() - camel.h;
    camel.vy = 0;
    camel.onGround = true;
  }

  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x + o.w > 0);

  obstacles.forEach(o => {
    if (
      camel.x < o.x + o.w &&
      camel.x + camel.w > o.x &&
      camel.y + camel.h > groundY() - o.h
    ) {
      pauseGame();
    }
  });

  speed += 0.0005;
  score++;
}

/* ===== DRAW ===== */
function draw() {
  drawBackground();

  // Ground
  ctx.fillStyle = "#c2a46d";
  ctx.fillRect(0, groundY(), W, H);

  // Obstacles
  ctx.fillStyle = "#2e5f2e";
  obstacles.forEach(o => {
    ctx.fillRect(o.x, groundY() - o.h, o.w, o.h);
  });

  drawCamel();

  document.getElementById("score").innerText = `Score: ${score}`;
}

/* ===== LOOP ===== */
function loop() {
  if (running) {
    update();
    draw();
  }
  requestAnimationFrame(loop);
}

camel.y = groundY() - camel.h;
loop();
