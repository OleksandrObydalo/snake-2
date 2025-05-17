const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let dx = 0;
let dy = 0;
let food = generateFood();
let score = 0;
let highScore = localStorage.getItem("snakeHighScore") || 0;
let gameSpeed = 100;
let gameInterval;
let gameActive = true;
let wallPassEnabled = true;
let soundEnabled = true;

const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".highscore");
const gameOverElement = document.querySelector(".game-over");
const finalScoreElement = document.querySelector(".final-score");
const restartButton = document.querySelector(".restart-btn");
const wallPassToggle = document.getElementById("wallPass");
const soundToggle = document.getElementById("soundToggle");

// Sound effects
const eatSound = new Audio();
eatSound.src = "eat.mp3";
const gameOverSound = new Audio();
gameOverSound.src = "game_over.mp3";

// Update scores display
function updateScoreDisplay() {
  scoreElement.textContent = `Очки: ${score}`;
  highScoreElement.textContent = `Рекорд: ${highScore}`;
}

// Initialize toggle states
wallPassToggle.checked = wallPassEnabled;
soundToggle.checked = soundEnabled;

// Add event listeners for toggles
wallPassToggle.addEventListener("change", () => {
  wallPassEnabled = wallPassToggle.checked;
});

soundToggle.addEventListener("change", () => {
  soundEnabled = soundToggle.checked;
});

function generateFood() {
  let newFood;
  let validPosition = false;
  
  while (!validPosition) {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    validPosition = true;
    for (let segment of snake) {
      if (segment.x === newFood.x && segment.y === newFood.y) {
        validPosition = false;
        break;
      }
    }
  }
  
  return newFood;
}

function gameLoop() {
  if (!gameActive) return;

  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Wall passing
  if (wallPassEnabled) {
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;
  }

  // Game over conditions
  if (
    (!wallPassEnabled && (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount)) ||
    snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver();
    return;
  }

  snake.unshift(head);

  // Eating food
  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScoreDisplay();
    food = generateFood();
    
    if (soundEnabled) {
      eatSound.play();
    }
    
    // Speed up slightly every 5 points
    if (score % 5 === 0) {
      clearInterval(gameInterval);
      gameSpeed = Math.max(50, gameSpeed - 5);
      gameInterval = setInterval(gameLoop, gameSpeed);
    }
  } else {
    snake.pop();
  }

  // Drawing
  draw();
}

function draw() {
  // Clear canvas
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw snake
  snake.forEach((segment, index) => {
    // Head is brighter green
    if (index === 0) {
      ctx.fillStyle = "#00ff00";
    } else {
      // Gradient color for body
      const colorValue = Math.max(50, 255 - (index * 10));
      ctx.fillStyle = `rgb(0, ${colorValue}, 0)`;
    }
    
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    
    // Draw eyes on head
    if (index === 0) {
      ctx.fillStyle = "#000";
      
      // Position eyes based on direction
      if (dx === 1) { // Right
        ctx.fillRect((segment.x * gridSize) + gridSize - 7, (segment.y * gridSize) + 5, 3, 3);
        ctx.fillRect((segment.x * gridSize) + gridSize - 7, (segment.y * gridSize) + gridSize - 8, 3, 3);
      } else if (dx === -1) { // Left
        ctx.fillRect((segment.x * gridSize) + 4, (segment.y * gridSize) + 5, 3, 3);
        ctx.fillRect((segment.x * gridSize) + 4, (segment.y * gridSize) + gridSize - 8, 3, 3);
      } else if (dy === 1) { // Down
        ctx.fillRect((segment.x * gridSize) + 5, (segment.y * gridSize) + gridSize - 7, 3, 3);
        ctx.fillRect((segment.x * gridSize) + gridSize - 8, (segment.y * gridSize) + gridSize - 7, 3, 3);
      } else if (dy === -1) { // Up
        ctx.fillRect((segment.x * gridSize) + 5, (segment.y * gridSize) + 4, 3, 3);
        ctx.fillRect((segment.x * gridSize) + gridSize - 8, (segment.y * gridSize) + 4, 3, 3);
      } else { // Default (not moving)
        ctx.fillRect((segment.x * gridSize) + 5, (segment.y * gridSize) + 5, 3, 3);
        ctx.fillRect((segment.x * gridSize) + gridSize - 8, (segment.y * gridSize) + 5, 3, 3);
      }
    }
  });

  // Draw food
  ctx.fillStyle = "#f00";
  ctx.beginPath();
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;
  const radius = gridSize / 2 - 2;
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw stem
  ctx.fillStyle = "#0a0";
  ctx.fillRect(centerX - 1, food.y * gridSize + 2, 2, 4);
}

function gameOver() {
  gameActive = false;
  clearInterval(gameInterval);
  
  if (soundEnabled) {
    gameOverSound.play();
  }
  
  // Update high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    updateScoreDisplay();
  }
  
  // Show game over screen
  finalScoreElement.textContent = score;
  gameOverElement.style.display = "block";
}

function resetGame() {
  snake = [{ x: 10, y: 10 }];
  dx = 0;
  dy = 0;
  score = 0;
  gameSpeed = 100;
  food = generateFood();
  gameActive = true;
  
  updateScoreDisplay();
  gameOverElement.style.display = "none";
  
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, gameSpeed);
}

// Controls
document.addEventListener("keydown", e => {
  // Prevent reversing direction
  if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && dy === 0) {
    dx = 0;
    dy = -1;
  } else if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && dy === 0) {
    dx = 0;
    dy = 1;
  } else if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && dx === 0) {
    dx = -1;
    dy = 0;
  } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && dx === 0) {
    dx = 1;
    dy = 0;
  }
});

// Restart button
restartButton.addEventListener("click", resetGame);

// Start game
gameInterval = setInterval(gameLoop, gameSpeed);