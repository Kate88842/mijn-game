const startBtn = document.getElementById("startBtn");
const infoBtn = document.getElementById("infoBtn");
const restartBtn = document.getElementById("restartBtn");
const nextBtn = document.getElementById("nextBtn");
const startScreen = document.getElementById("startScreen");
const instructionsBox = document.getElementById("instructionsBox");
const gameInfo = document.getElementById("gameInfo");
const gameOverScreen = document.getElementById("gameOverScreen");
const winScreen = document.getElementById("winScreen");
const winScore = document.getElementById("winScore");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let player = { x: 80, y: 250, w: 78, h: 42 };
let enemy = { x: 620, y: 260, w: 48, h: 34, speed: 2, dir: 1 };
let coin = { x: 360, y: 140, r: 12 };

let level = 1;
let coinGoal = 10;
let score = 0;
let lives = 3;
let time = 0;

let started = false;
let gameOver = false;
let won = false;
let paused = false;
let levelComplete = false;

let vy = 0;
let gravity = 0.6;
let jumps = 0;
let maxJumps = 2;
let facingRight = true;

let waterY = 360;
let waveOffset = 0;
let timer;
let splashes = [];
let hitFlash = 0;

const keys = {
  left: false,
  right: false
};

const level1Platforms = [
  { x: 0, y: 300, w: 180, h: 20 },
  { x: 220, y: 220, w: 160, h: 20 },
  { x: 430, y: 160, w: 160, h: 20 },
  { x: 640, y: 280, w: 160, h: 20 }
];

const level2Platforms = [
  { x: 0, y: 300, w: 120, h: 20 },
  { x: 170, y: 240, w: 120, h: 20 },
  { x: 340, y: 190, w: 120, h: 20 },
  { x: 510, y: 240, w: 120, h: 20 },
  { x: 680, y: 170, w: 120, h: 20 }
];

const level3Platforms = [
  { x: 0, y: 300, w: 100, h: 20 },
  { x: 140, y: 250, w: 110, h: 20 },
  { x: 290, y: 200, w: 110, h: 20 },
  { x: 440, y: 150, w: 110, h: 20 },
  { x: 590, y: 220, w: 110, h: 20 },
  { x: 720, y: 170, w: 80, h: 20 }
];

const level4Platforms = [
  { x: 0, y: 300, w: 90, h: 20 },
  { x: 130, y: 260, w: 90, h: 20 },
  { x: 260, y: 210, w: 90, h: 20 },
  { x: 390, y: 160, w: 90, h: 20 },
  { x: 520, y: 210, w: 90, h: 20 },
  { x: 650, y: 170, w: 90, h: 20 }
];

const level5Platforms = [
  { x: 0, y: 300, w: 80, h: 20 },
  { x: 120, y: 250, w: 80, h: 20 },
  { x: 240, y: 200, w: 80, h: 20 },
  { x: 360, y: 150, w: 80, h: 20 },
  { x: 480, y: 200, w: 80, h: 20 },
  { x: 600, y: 150, w: 80, h: 20 },
  { x: 720, y: 100, w: 60, h: 20 }
];

let platforms = level1Platforms;

// ---------- UI ----------
function formatTime(seconds) {
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
}

function updateUI() {
  document.getElementById("score").innerText = "🪙 " + score;
  document.getElementById("lives").innerText = "❤️".repeat(lives);
  document.getElementById("time").innerText = "⏱️ " + formatTime(time);
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (started && !gameOver && !won && !paused && !levelComplete) {
      time++;
      updateUI();
    }
  }, 1000);
}

// ---------- LEVEL ----------
function applyLevel() {
  if (level === 1) {
    coinGoal = 5;
    platforms = level1Platforms;
    enemy.speed = 2;
    enemy.x = 620;
  } else if (level === 2) {
    coinGoal = 10;
    platforms = level2Platforms;
    enemy.speed = 3.5;
    enemy.x = 520;
  } else if (level === 3) {
    coinGoal = 15;
    platforms = level3Platforms;
    enemy.speed = 4.5;
    enemy.x = 500;
  } else if (level === 4) {
    coinGoal = 20;
    platforms = level4Platforms;
    enemy.speed = 5;
    enemy.x = 450;
  } else if (level === 5) {
    coinGoal = 25;
    platforms = level5Platforms;
    enemy.speed = 5.5;
    enemy.x = 400;
  }

  enemy.dir = 1;
  enemy.y = 260;
  resetPlayer();
  spawnCoinOnPlatform();
  updateUI();
}

function showLevelScreen(final = false) {
  started = false;
  levelComplete = !final;
  won = final;
  clearInterval(timer);
  canvas.classList.add("hidden");
  winScreen.classList.remove("hidden");

  if (final) {
    winScore.innerText = "You finished all 5 levels!";
    nextBtn.innerText = "PLAY AGAIN";
  } else {
    winScore.innerText = `Level ${level} complete! Next: ${level + 1}`;
    nextBtn.innerText = "NEXT LEVEL";
  }
}

// ---------- DRAW ----------
function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, "#0b2454");
  sky.addColorStop(1, "#123f84");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawWater() {
 ctx.fillStyle = "#1e90ff";
  ctx.fillStyle = "#67d4ff";
  ctx.beginPath();
ctx.moveTo(0, waterY);
for (let i = 0; i <= canvas.width; i += 10) {
  let wave = Math.sin((i + waveOffset) * 0.04) * 6;
  ctx.lineTo(i, waterY + wave);
}

ctx.lineTo(canvas.width, canvas.height);
ctx.lineTo(0, canvas.height);
ctx.closePath();

ctx.fillStyle = "#1e90ff";
ctx.fill();
ctx.globalAlpha = 0.9;
ctx.strokeStyle = "#67d4ff";
ctx.lineWidth = 2;
ctx.stroke();
  waveOffset += 0.8;
  if (waveOffset >= 40) waveOffset = 0;
}

function drawPlatforms() {
  for (let p of platforms) {
    ctx.fillStyle = "#a64b2a";
    ctx.fillRect(p.x, p.y, p.w, p.h);

    ctx.fillStyle = "#d66b3a";
    ctx.fillRect(p.x, p.y, p.w, 6);

    ctx.fillStyle = "#7a3218";
    ctx.fillRect(p.x, p.y + p.h - 4, p.w, 4);
  }
}

function drawCoin() {
  ctx.fillStyle = "#f8c400";
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffe27a";
  ctx.beginPath();
  ctx.arc(coin.x - 3, coin.y - 3, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#d29d00";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawEnemy() {
  const x = enemy.x;
  const y = enemy.y;

  ctx.fillStyle = "#ff553d";
  ctx.fillRect(x + 4, y + 8, 38, 18);

  ctx.fillStyle = "#d93b26";
  ctx.fillRect(x, y + 12, 48, 16);

  ctx.fillStyle = "white";
  ctx.fillRect(x + 8, y + 10, 8, 8);
  ctx.fillRect(x + 30, y + 10, 8, 8);

  ctx.fillStyle = "black";
  ctx.fillRect(x + 11, y + 12, 3, 4);
  ctx.fillRect(x + 33, y + 12, 3, 4);

  ctx.fillStyle = "#7a1208";
  ctx.fillRect(x + 4, y + 28, 4, 6);
  ctx.fillRect(x + 14, y + 28, 4, 6);
  ctx.fillRect(x + 30, y + 28, 4, 6);
  ctx.fillRect(x + 40, y + 28, 4, 6);
}

function drawCrocodile() {
  ctx.save();

  if (!facingRight) {
    ctx.translate(player.x + player.w / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(player.x + player.w / 2), 0);
  }

  const x = player.x;
  const y = player.y;
  const jumpOffset = vy < 0 ? -4 : vy > 0 ? 4 : 0;

  ctx.fillStyle = "#3a8f08";
  ctx.fillRect(x - 16, y + 18 + jumpOffset, 16, 7);

  ctx.fillStyle = "#59d10b";
  ctx.fillRect(x, y + 12 + jumpOffset, 52, 22);

  ctx.fillStyle = "#3ea108";
  ctx.fillRect(x + 6, y + 8 + jumpOffset, 8, 6);
  ctx.fillRect(x + 18, y + 5 + jumpOffset, 8, 7);
  ctx.fillRect(x + 30, y + 8 + jumpOffset, 8, 6);

  ctx.fillStyle = "#63e20e";
  ctx.fillRect(x + 42, y + 2 + jumpOffset, 30, 16);

  ctx.fillStyle = "#4fb40d";
  ctx.fillRect(x + 50, y + 15 + jumpOffset, 22, 8);

  ctx.fillStyle = "white";
  ctx.fillRect(x + 54, y + 5 + jumpOffset, 9, 9);

  ctx.fillStyle = "black";
  ctx.fillRect(x + 58, y + 8 + jumpOffset, 3, 4);

  ctx.fillStyle = "white";
  ctx.fillRect(x + 55, y + 18 + jumpOffset, 4, 4);
  ctx.fillRect(x + 63, y + 18 + jumpOffset, 4, 4);

  ctx.fillStyle = "#2d7806";
  ctx.fillRect(x + 8, y + 32 + jumpOffset, 8, 8);
  ctx.fillRect(x + 28, y + 32 + jumpOffset, 8, 8);

  ctx.restore();
}

function drawSplashes() {
  ctx.fillStyle = "#8fe9ff";
  for (let s of splashes) {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLevelText() {
  ctx.fillStyle = "white";
  ctx.font = "bold 22px Arial";
  ctx.fillText(`Level ${level}`, 20, 32);
}

function drawPauseIcon() {
  if (paused) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "60px Arial";
    ctx.fillText("⏸", 370, 220);
  }
}

function draw() {
  drawBackground();
  drawWater();
  drawPlatforms();
  drawCoin();
  drawEnemy();
  drawCrocodile();
  drawSplashes();
  drawLevelText();
  drawPauseIcon();
}

// ---------- LOGIC ----------
function rectHit(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function coinHit() {
  return (
    player.x < coin.x + coin.r &&
    player.x + player.w > coin.x - coin.r &&
    player.y < coin.
    y + coin.r &&
    player.y + player.h > coin.y - coin.r
  );
}

function resetPlayer() {
  player.x = 80;
  player.y = 250;
  vy = 0;
  jumps = 0;
}

function spawnCoinOnPlatform() {
  let p = platforms[Math.floor(Math.random() * platforms.length)];
  coin.x = p.x + p.w / 2 + (Math.random() * 40 - 20);
  coin.y = p.y - 15;
}

function makeSplash() {
  for (let i = 0; i < 8; i++) {
    splashes.push({
      x: player.x + player.w / 2,
      y: waterY,
      dx: (Math.random() - 0.5) * 6,
      dy: Math.random() * -5,
      life: 25
    });
  }
}

function loseLife(fromWater = false) {
  hitFlash = 15;
  if (fromWater) makeSplash();

  lives--;
  updateUI();

  if (lives <= 0) {
    lives = 0;
    gameOver = true;
    started = false;
    clearInterval(timer);
    updateUI();

    canvas.classList.add("hidden");
    if (gameOverScreen) gameOverScreen.classList.remove("hidden");

    const finalScore = document.getElementById("finalScore");
    if (finalScore) finalScore.innerText = `Your Score: ${score}`;
  } else {
    resetPlayer();
  }
}

function checkPlatforms() {
  for (let p of platforms) {
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h >= p.y &&
      player.y + player.h <= p.y + 18 &&
      vy > 0
    ) {
      player.y = p.y - player.h;
      vy = 0;
      jumps = 0;
    }
  }
}

function nextLevel() {
  if (level >= 5) {
    showLevelScreen(true);
    return;
  }
  showLevelScreen(false);
}

function startNextLevel() {
  level++;
  score = 0;
  lives = 3;
  time = 0;
  paused = false;
  levelComplete = false;
  started = true;

  applyLevel();

  winScreen.classList.add("hidden");
  canvas.classList.remove("hidden");
  gameInfo.classList.remove("hidden");

  startTimer();
  loop();
}

function checkCoin() {
  if (coinHit()) {
    score++;
    updateUI();
    spawnCoinOnPlatform();

    if (score >= coinGoal) {
      nextLevel();
    }
  }
}

function checkEnemy() {
  if (rectHit(player, enemy)) {
    vy = -8;
    loseLife(false);
  }
}

function checkWater() {
  if (player.y + player.h > waterY) {
    loseLife(true);
  }
}

function moveEnemy() {
  enemy.y = platforms[2].y - enemy.h; // ← ВОТ ЭТА СТРОКА

  enemy.x += enemy.speed * enemy.dir;

  if (enemy.x <= 0 || enemy.x + enemy.w >= canvas.width) {
    enemy.dir *= -1;
  }
}

function updateSplashes() {
  for (let s of splashes) {
    s.x += s.dx;
    s.y += s.dy;
    s.dy += 0.3;
    s.life--;
  }
  splashes = splashes.filter(s => s.life > 0);
}

function updateMovement() {
  let speed = 4 + level; // скорость растёт с уровнем

  if (keys.right) {
    player.x += speed;
    facingRight = true;
  }

  if (keys.left) {
    player.x -= speed;
    facingRight = false;
  }
}
function loop() {
  updateSplashes();

  if (!started || gameOver || won || levelComplete) {
    draw();
    return;
  }

  if (paused) {
    draw();
    requestAnimationFrame(loop);
    return;
  }

  updateMovement();

  vy += gravity;
  player.y += vy;
  vy *= 0.98;
  

  if (player.y < 0) {
    player.y = 0;
    vy = 0;
  }

  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) {
    player.x = canvas.width - player.w;
  }

  checkPlatforms();
  moveEnemy();
  checkCoin();
  checkEnemy();
  checkWater();

  draw();

  if (hitFlash > 0) {
    ctx.fillStyle = "rgba(255,0,0,0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    hitFlash--;
  }

  requestAnimationFrame(loop);
}

// ---------- RESET ----------
function resetGame() {
  level = 1;
  coinGoal = 10;
  score = 0;
  lives = 3;
  time = 0;
  started = true;
  gameOver = false;
  won = false;
  paused = false;
  levelComplete = false;
  facingRight = true;
  splashes = [];
  keys.left = false;
  keys.right = false;

  applyLevel();
  updateUI();

  if (gameOverScreen) gameOverScreen.classList.add("hidden");
  if (winScreen) winScreen.classList.add("hidden");

  canvas.classList.remove("hidden");
  gameInfo.classList.remove("hidden");

  startTimer();
  loop();
}

// ---------- BUTTONS ----------
if (infoBtn) {
  infoBtn.addEventListener("click", () => {
    instructionsBox.classList.toggle("hidden");
  });
}

if (startBtn) {
  startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    instructionsBox.classList.add("hidden");
    canvas.classList.remove("hidden");
    gameInfo.classList.remove("hidden");

    if (!started) {
      started = true;
      gameOver = false;
      won = false;
      paused = false;
      levelComplete = false;
      applyLevel();
      updateUI();
      startTimer();
      loop();
    }
  });
}

if (restartBtn) {
  restartBtn.addEventListener("click", resetGame);
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (won) {
      resetGame();
    } else if (levelComplete) {
      startNextLevel();
    }
  });
}

// ---------- KEYS ----------
document.addEventListener("keydown", (event) => {
  if (!started || gameOver || won || levelComplete) return;

  if (event.key === "ArrowRight") keys.right = true;
  if (event.key === "ArrowLeft") keys.left = true;

  if (event.key === "Escape") {
    paused = !paused;
    if (!paused) loop();
  }

  if (event.key === " " && jumps < maxJumps && !paused) {
    vy = -12;
    jumps++;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "ArrowRight") keys.right = false;
  if (event.key === "ArrowLeft") keys.left = false;
});