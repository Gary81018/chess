const canvas = document.querySelector("#board");
const ctx = canvas.getContext("2d");
const statusText = document.querySelector("#statusText");
const turnPill = document.querySelector("#turnPill");
const blackScoreEl = document.querySelector("#blackScore");
const whiteScoreEl = document.querySelector("#whiteScore");
const undoBtn = document.querySelector("#undoBtn");
const restartBtn = document.querySelector("#restartBtn");
const swapBtn = document.querySelector("#swapBtn");
const aiToggle = document.querySelector("#aiToggle");
const winBanner = document.querySelector("#winBanner");
const winText = document.querySelector("#winText");
const nextRoundBtn = document.querySelector("#nextRoundBtn");
const moveList = document.querySelector("#moveList");
const moveCount = document.querySelector("#moveCount");
const loveNote = document.querySelector("#loveNote");

const size = 15;
const cell = canvas.width / (size + 1);
const margin = cell;
const notes = [
  "赢的人可以提一个小愿望。",
  "这一步下得漂亮，适合被夸一下。",
  "输赢先放一边，今天也要偏爱你。",
  "五颗连成线，心动也连成线。",
  "悔棋可以，耍赖也可以，反正是你。"
];

let board;
let current;
let winner;
let moves;
let scores = { black: 0, white: 0 };
let firstPlayer = "black";
let aiThinking = false;

function resetGame(keepFirst = true) {
  board = Array.from({ length: size }, () => Array(size).fill(null));
  current = keepFirst ? firstPlayer : "black";
  winner = null;
  moves = [];
  aiThinking = false;
  winBanner.classList.add("hidden");
  updateStatus();
  updateMoves();
  drawBoard();
  maybeAiMove();
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWood();
  drawGrid();
  drawStarPoints();
  drawStones();
}

function drawWood() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#f2cd8d");
  gradient.addColorStop(0.52, "#e2b36d");
  gradient.addColorStop(1, "#c98743");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 18; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 24 + i * 42);
    ctx.bezierCurveTo(180, 8 + i * 40, 420, 72 + i * 38, canvas.width, 22 + i * 42);
    ctx.strokeStyle = i % 2 ? "#6f421f" : "#fff1cf";
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawGrid() {
  ctx.strokeStyle = "rgba(54, 35, 22, 0.72)";
  ctx.lineWidth = 1.7;
  for (let i = 0; i < size; i += 1) {
    const p = margin + i * cell;
    ctx.beginPath();
    ctx.moveTo(margin, p);
    ctx.lineTo(margin + (size - 1) * cell, p);
    ctx.moveTo(p, margin);
    ctx.lineTo(p, margin + (size - 1) * cell);
    ctx.stroke();
  }
}

function drawStarPoints() {
  const points = [
    [3, 3],
    [11, 3],
    [7, 7],
    [3, 11],
    [11, 11]
  ];
  ctx.fillStyle = "rgba(54, 35, 22, 0.78)";
  points.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(margin + x * cell, margin + y * cell, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawStones() {
  moves.forEach((move, index) => {
    drawStone(move.x, move.y, move.color);
    if (index === moves.length - 1 && !winner) {
      drawLastMoveMark(move.x, move.y, move.color);
    }
  });
}

function drawStone(x, y, color) {
  const px = margin + x * cell;
  const py = margin + y * cell;
  const radius = cell * 0.38;
  const gradient = ctx.createRadialGradient(
    px - radius * 0.3,
    py - radius * 0.34,
    radius * 0.2,
    px,
    py,
    radius
  );

  if (color === "black") {
    gradient.addColorStop(0, "#5c5550");
    gradient.addColorStop(0.45, "#262321");
    gradient.addColorStop(1, "#090807");
  } else {
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.52, "#fff7eb");
    gradient.addColorStop(1, "#d7c8b5");
  }

  ctx.save();
  ctx.shadowColor = "rgba(30, 20, 14, 0.28)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLastMoveMark(x, y, color) {
  const px = margin + x * cell;
  const py = margin + y * cell;
  ctx.fillStyle = color === "black" ? "rgba(255,255,255,0.86)" : "rgba(20,18,16,0.72)";
  ctx.beginPath();
  ctx.arc(px, py, 4, 0, Math.PI * 2);
  ctx.fill();
}

function placeStone(x, y, color = current, forced = false) {
  if (winner || board[y][x] || (aiThinking && !forced)) return false;
  board[y][x] = color;
  moves.push({ x, y, color });

  if (hasWon(x, y, color)) {
    winner = color;
    scores[color] += 1;
    updateScore();
    showWinner(color);
  } else if (moves.length === size * size) {
    winner = "draw";
    showDraw();
  } else {
    current = color === "black" ? "white" : "black";
    updateStatus();
  }

  updateMoves();
  drawBoard();
  maybeAiMove();
  return true;
}

function hasWon(x, y, color) {
  return [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ].some(([dx, dy]) => countLine(x, y, dx, dy, color) + countLine(x, y, -dx, -dy, color) + 1 >= 5);
}

function countLine(x, y, dx, dy, color) {
  let total = 0;
  let nx = x + dx;
  let ny = y + dy;
  while (inside(nx, ny) && board[ny][nx] === color) {
    total += 1;
    nx += dx;
    ny += dy;
  }
  return total;
}

function inside(x, y) {
  return x >= 0 && x < size && y >= 0 && y < size;
}

function updateStatus() {
  const label = current === "black" ? "黑棋回合" : "白棋回合";
  const dotClass = current === "black" ? "black" : "white";
  turnPill.innerHTML = `<span class="stone-dot ${dotClass}"></span><span id="statusText">${label}</span>`;
}

function updateScore() {
  blackScoreEl.textContent = scores.black;
  whiteScoreEl.textContent = scores.white;
}

function showWinner(color) {
  const text = color === "black" ? "黑棋赢啦" : "白棋赢啦";
  winText.textContent = `${text}，许个小愿望吧`;
  winBanner.classList.remove("hidden");
  loveNote.textContent = color === "black" ? "黑棋这局气势很足。" : "白棋这局温柔又厉害。";
}

function showDraw() {
  winText.textContent = "平局，也算默契满分";
  winBanner.classList.remove("hidden");
  loveNote.textContent = "棋盘都下满了，刚好适合一起去喝点什么。";
}

function updateMoves() {
  moveCount.textContent = `${moves.length} 手`;
  moveList.innerHTML = "";
  moves.slice(-24).forEach((move, index) => {
    const li = document.createElement("li");
    const number = moves.length > 24 ? moves.length - 23 + index : index + 1;
    const color = move.color === "black" ? "黑棋" : "白棋";
    li.innerHTML = `<strong>${number}. ${color}</strong>　${String.fromCharCode(65 + move.x)}${move.y + 1}`;
    moveList.appendChild(li);
  });
}

function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scale = canvas.width / rect.width;
  const x = (event.clientX - rect.left) * scale;
  const y = (event.clientY - rect.top) * scale;
  return {
    x: Math.round((x - margin) / cell),
    y: Math.round((y - margin) / cell)
  };
}

function maybeAiMove() {
  if (!aiToggle.checked || winner || current !== "white" || aiThinking) return;
  aiThinking = true;
  loveNote.textContent = notes[Math.floor(Math.random() * notes.length)];
  setTimeout(() => {
    const move = chooseAiMove();
    aiThinking = false;
    if (move) placeStone(move.x, move.y, "white", true);
  }, 360);
}

function chooseAiMove() {
  const empty = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!board[y][x]) empty.push({ x, y });
    }
  }
  if (!empty.length) return null;

  return empty
    .map((move) => ({
      ...move,
      score: scoreMove(move.x, move.y, "white") + scoreMove(move.x, move.y, "black") * 0.92
    }))
    .sort((a, b) => b.score - a.score)[0];
}

function scoreMove(x, y, color) {
  const center = 7 - (Math.abs(7 - x) + Math.abs(7 - y)) * 0.08;
  const patterns = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1]
  ];
  return patterns.reduce((score, [dx, dy]) => {
    const length = countLine(x, y, dx, dy, color) + countLine(x, y, -dx, -dy, color) + 1;
    return score + Math.pow(10, Math.min(length, 5));
  }, center);
}

canvas.addEventListener("click", (event) => {
  if (aiToggle.checked && current === "white") return;
  const { x, y } = getPointerPosition(event);
  if (!inside(x, y)) return;
  placeStone(x, y);
});

undoBtn.addEventListener("click", () => {
  if (!moves.length || aiThinking) return;
  if (winner === "black" || winner === "white") {
    scores[winner] = Math.max(0, scores[winner] - 1);
    updateScore();
  }
  const steps = aiToggle.checked && moves.length > 1 ? 2 : 1;
  for (let i = 0; i < steps; i += 1) {
    const move = moves.pop();
    if (move) board[move.y][move.x] = null;
  }
  winner = null;
  current = moves.length ? (moves[moves.length - 1].color === "black" ? "white" : "black") : firstPlayer;
  winBanner.classList.add("hidden");
  updateStatus();
  updateMoves();
  drawBoard();
});

restartBtn.addEventListener("click", () => resetGame());
nextRoundBtn.addEventListener("click", () => resetGame());

swapBtn.addEventListener("click", () => {
  if (moves.length) return;
  firstPlayer = firstPlayer === "black" ? "white" : "black";
  resetGame();
});

aiToggle.addEventListener("change", () => {
  if (aiToggle.checked && firstPlayer === "white") {
    firstPlayer = "black";
  }
  resetGame();
});

resetGame();
