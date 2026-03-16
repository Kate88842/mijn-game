let element = document.getElementById("startBtn");

element.addEventListener("click", () => {
  console.log("AquaDash game started");

  const startBtn = document.getElementById("startBtn");
const infoBtn = document.getElementById("infoBtn");
const startScreen = document.getElementById("startScreen");
const instructionsBox = document.getElementById("instructionsBox");
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let crocodile = {
  x: 100,
  y: 300,
  width: 50,
  height: 50,
  color: "green"
};

function drawCrocodile() {
  ctx.fillStyle = crocodile.color;
  ctx.fillRect(crocodile.x, crocodile.y, crocodile.width, crocodile.height);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCrocodile();
  requestAnimationFrame(gameLoop);
}

infoBtn.addEventListener("click", function () {
  instructionsBox.classList.toggle("hidden");
});

startBtn.addEventListener("click", function () {
  startScreen.classList.add("hidden");
  instructionsBox.classList.add("hidden");
  canvas.classList.remove("hidden");
  gameLoop();
});

document.addEventListener("keydown", function(event) {

  if (event.key === "ArrowRight") {
    crocodile.x += 20;
  }

  if (event.key === "ArrowLeft") {
    crocodile.x -= 20;
  }

});
startBtn.addEventListener("click", function () {
    instructionsBox.classList.add("hidden");
    canvas.classList.remove("hidden");

    document.getElementById("gameInfo").classList.remove("hidden");

    gameLoop();
});

let time = 0; 
setInterval(function() {
  time++;
  document.getElementById("time").innerText = "Time: " + time;
}, 1000)

 



  
  //     console.log("AquaDash game started");
  // const ctx = canvas.getContext("2d");

  // let crocodile = {
  // x: 50,
  // y: 300,
  // width: 50,
  // height: 50,
  // color: "green"
  // };
});
