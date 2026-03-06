// Pong by Oliver791

// --- Canvas setup ---
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

// --- Constantes du jeu ---
const BALL_RADIUS = 10;
const PADDLE_HEIGHT = 70;
const PADDLE_WIDTH = 10;
const WINNING_SCORE = 10;
const BALL_SPEED = 4;
const PADDLE_SPEED = 5;
const COMPUTER_SPEED = 5;
const COMPUTER_SLOW_SPEED = 1;
const COMPUTER_TRIGGER_ZONE = 200;

// --- Sons ---
const wallSound = new Audio("./son/pingMur.ogg");
const playerSound = new Audio("./son/pingRaquette.ogg");
const lostBallSound = new Audio("./son/Whoosh 10.ogg");
const winSound = new Audio("./son/Applaudissements_Win.ogg");
const loseSound = new Audio("./son/Aaah.mp3");

// --- État du jeu ---
let x = canvas.width / 2;
let y = canvas.height / 2;
let dx = BALL_SPEED;
let dy = -BALL_SPEED;

let paddleY = (canvas.height - PADDLE_HEIGHT) / 2;
const paddleX = canvas.width - PADDLE_WIDTH - 2;

let paddle2Y = (canvas.height - PADDLE_HEIGHT) / 2;
const paddle2X = PADDLE_WIDTH - 8;

let upPressed = false;
let downPressed = false;

let computerScore = 0;
let playerScore = 0;

let move = 0;
let stop = 0;
let startBall = 1;
let gameOver = 0;
let win = 0;
let soundEnabled = 1;

// --- Contrôles ---
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  if (e.key === "ArrowUp") {
    upPressed = true;
  } else if (e.key === "ArrowDown") {
    downPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "ArrowUp") {
    upPressed = false;
  } else if (e.key === "ArrowDown") {
    downPressed = false;
  }
}

function mouseMoveHandler(e) {
  // getBoundingClientRect gère correctement le scaling CSS du canvas
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  const relativeY = (e.clientY - rect.top) * scaleY;

  if (relativeY >= 0 && relativeY <= canvas.height - PADDLE_HEIGHT + PADDLE_HEIGHT / 10) {
    paddleY = relativeY - PADDLE_HEIGHT / 10;
  }
}

// --- Dessin ---
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = "#FF007F";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddleComputer() {
  ctx.beginPath();
  ctx.rect(paddle2X, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawSeparation() {
  ctx.beginPath();
  ctx.rect(canvas.width / 2 - 0.5, 1, 1, canvas.height - 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function updateScore() {
  document.getElementById("scoreIA").textContent = computerScore;
  document.getElementById("scorePlayer").textContent = playerScore;
}

function drawEndMessage() {
  ctx.font = "48px serif";
  ctx.textAlign = "center";

  if (gameOver === 1) {
    ctx.strokeStyle = "red";
    ctx.strokeText("Game Over", canvas.width / 2, 200);
  }
  if (win === 1) {
    ctx.strokeStyle = "green";
    ctx.strokeText("You Win !!", canvas.width / 2, 200);
  }
}

// --- IA du computer ---
function moveComputer() {
  if (x < canvas.width / 2 + COMPUTER_TRIGGER_ZONE && dx < 0) {
    const paddleCenter = paddle2Y + PADDLE_HEIGHT / 2;
    let speed = COMPUTER_SPEED;

    if (Math.abs(y - paddle2Y) < 10 && x < canvas.width / 20) {
      speed = COMPUTER_SLOW_SPEED;
    }

    if (y > paddleCenter) {
      paddle2Y += speed;
    } else if (y < paddleCenter) {
      paddle2Y -= speed;
    }
  }
}

// --- Physique de la balle ---
function startMoveBall() {
  if (startBall === 1) {
    let angle = (Math.PI / 4) * Math.random();
    angle *= Math.random() < 0.5 ? 1 : -1;

    dx = BALL_SPEED * Math.cos(angle);
    dy = BALL_SPEED * Math.sin(angle);
  }
  startBall = 0;

  if (move === 1) {
    x += dx;
    y += dy;
  }
}

function anglePaddleRight() {
  const speed = 1.2;
  const offset = (y + 20 - paddleY) / (PADDLE_HEIGHT + 20);
  const phi = 0.25 * Math.PI * (2 * offset - 1);

  dx = (dx * -1) * speed;
  dy = BALL_SPEED * Math.sin(phi);
}

function anglePaddleLeft() {
  const offset = (y + 20 - paddleY) / (PADDLE_HEIGHT + 20);
  const phi = 0.25 * Math.PI * (2 * offset - 1);

  dx = dx * -1;
  dy = BALL_SPEED * Math.sin(phi);
}

function playSound(sound) {
  if (soundEnabled === 1) {
    sound.currentTime = 0;
    sound.play();
  }
}

// --- Gestion des scores et fin de partie ---
function removeControls() {
  document.removeEventListener("mousemove", mouseMoveHandler, false);
  document.removeEventListener("keydown", keyDownHandler, false);
  document.removeEventListener("keyup", keyUpHandler, false);
}

function restart() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  dx = BALL_SPEED;
  dy = -BALL_SPEED;
  paddleY = (canvas.height - PADDLE_HEIGHT) / 2;
  move = 0;
  startBall = 1;
}

function checkGameOver() {
  if (computerScore === WINNING_SCORE) {
    move = 0;
    gameOver = 1;
    stop = 1;
    removeControls();
    playSound(loseSound);
  } else {
    restart();
  }
}

function checkWin() {
  if (playerScore === WINNING_SCORE) {
    move = 0;
    stop = 1;
    win = 1;
    removeControls();
    playSound(winSound);
  } else {
    restart();
  }
}

// --- Contrôles UI ---
function pause() {
  move = 0;
}

function start() {
  move = 1;
}

function audio() {
  if (soundEnabled === 1) {
    soundEnabled = 0;
    document.getElementById("son").value = "No Sound";
  } else {
    soundEnabled = 1;
    document.getElementById("son").value = "Sound";
  }
}

// --- Boucle principale ---
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBall();
  drawPaddle();
  drawPaddleComputer();
  drawSeparation();
  moveComputer();
  updateScore();
  drawEndMessage();

  if (stop === 0) {
    // Rebond sur le paddle du joueur (droite)
    if (x + dx >= canvas.width - BALL_RADIUS && y >= paddleY && y <= paddleY + PADDLE_HEIGHT) {
      anglePaddleRight();
      x = paddleX + PADDLE_WIDTH / 2 - BALL_RADIUS;
      playSound(playerSound);
    } else if (x + dx > canvas.width) {
      playSound(lostBallSound);
      computerScore++;
      checkGameOver();
    }

    // Rebond sur le paddle du computer (gauche)
    if (x + dx <= BALL_RADIUS && y >= paddle2Y && y <= paddle2Y + PADDLE_HEIGHT) {
      anglePaddleLeft();
      x = paddle2X + PADDLE_WIDTH / 2 + BALL_RADIUS;
      playSound(playerSound);
    } else if (x + dx < BALL_RADIUS) {
      playSound(lostBallSound);
      playerScore++;
      checkWin();
    }

    // Rebond haut et bas
    if (y + dy < BALL_RADIUS || y + dy > canvas.height - BALL_RADIUS) {
      playSound(wallSound);
      dy = -dy;
    }

    // Déplacement du paddle avec le clavier
    if (downPressed && paddleY < canvas.height - PADDLE_HEIGHT) {
      paddleY += PADDLE_SPEED;
    } else if (upPressed && paddleY > 0) {
      paddleY -= PADDLE_SPEED;
    }

    startMoveBall();
  }

  requestAnimationFrame(draw);
}

// Lancement
draw();
