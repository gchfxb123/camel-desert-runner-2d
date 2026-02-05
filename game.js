const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

/* ------------------ 游戏状态 ------------------ */
let running = true;
let score = 0;
let speed = 6;

/* ------------------ 地面 ------------------ */
const groundY = () => H * 0.75;

/* ------------------ 骆驼（帧动画） ------------------ */
const camel = {
  x: W * 0.2,
  y: groundY() - 60,
  w: 70,
  h: 50,
  vy: 0,
  gravity: 1.1,
  jumpPower: -18,
  frame: 0,
  frameTick: 0,
  frameSpeed: 6,
  onGround: true
};

/* ------------------ 障碍 ------------------ */
const obstacles = [];

/* ------------------ 输入 ------------------ */
function jump() {
  if (camel.onGround) {
    camel.vy = camel.jumpPower;
    camel.onGround = false;
  }
}

window.addEventListener("touchstart", jump);
window.addEventListener("keydown", e => {
  if (e.code === "Space") jump();
});

/* ------------------ UI ------------------ */
const scoreEl = document.getElementById("score");
const pauseBtn = document.getElementById("pauseBtn");
const pauseMenu = document.getElementById("pauseMenu");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");

pauseBtn.onclick = () => {
  running = false;
  pauseMenu.classList.remove("hidden");
};

resumeBtn.onclick = () => {
  running = true;
  pauseMenu.classList.add("hidden");
  loop();
};

restartBtn.onclick = () => {
  obstacles.length = 0;
  score = 0;
  speed = 6;
  camel.y = groundY() - camel.h;
  camel.vy = 0;
  running = true;
  pauseMenu.classList.add("hidden");
  loop();
};

/* ------------------ 生成障碍 ------------------ */
function spawnObstacle() {
  const h = 40 + Math.random() * 40;
  obstacles.push({
    x: W + 40,
    y: groundY() - h,
    w: 30,
    h
  });
}

/* ------------------ 碰撞 ------------------ */
function hit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/* ------------------ 绘制背景 ------------------ */
function drawBackground() {
  // 天空
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, W, H);

  // 太阳
  ctx.fillStyle = "#f5c542";
  ctx.beginPath();
  ctx.arc(W * 0.85, H * 0.2, 40, 0, Math.PI * 2);
  ctx.fill();

  // 沙漠
  ctx.fillStyle = "#c2a06b";
  ctx.fillRect(0, groundY(), W, H);
}

/* ------------------ 绘制骆驼 ------------------ */
function drawCamel() {
  ctx.save();
  ctx.translate(camel.x, camel.y);

  // 身体
  ctx.fillStyle = "#8b6b3f";
  ctx.fillRect(0, 20, camel.w, 25);

  // 驼峰
  ctx.fillRect(20, 0, 20, 20);

  // 腿动画
  const legOffset = Math.sin(camel.frame * 0.5) * 6;
  ctx.fillRect(10, 45, 6, 15 + legOffset);
  ctx.fillRect(30, 45, 6, 15 - legOffset);
  ctx.fillRect(50, 45, 6, 15 + legOffset);

  ctx.restore();
}

/* ------------------ 主循环 ------------------ */
let obstacleTimer = 0;

function loop() {
  if (!running) return;

  ctx.clearRect(0, 0, W, H);

  drawBackground();

  // 骆驼物理
  camel.vy += camel.gravity;
  camel.y += camel.vy;

  if (camel.y >= groundY() - camel.h) {
    camel.y = groundY() - camel.h;
    camel.vy = 0;
    camel.onGround = true;
  }

  camel.frameTick++;
  if (camel.frameTick > camel.frameSpeed) {
    camel.frame++;
    camel.frameTick = 0;
  }

  drawCamel();

  // 障碍
  obstacleTimer++;
  if (obstacleTimer > 90) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= speed;

    ctx.fillStyle = "#2f4f2f";
    ctx.fillRect(o.x, o.y, o.w, o.h);

    if (hit(camel, o)) {
      running = false;
      pauseMenu.classList.remove("hidden");
    }

    if (o.x + o.w < 0) obstacles.splice(i, 1);
  }

  // 分数 & 速度
  score++;
  speed += 0.0008;
  scoreEl.textContent = "Score: " + score;

  requestAnimationFrame(loop);
}

loop();
