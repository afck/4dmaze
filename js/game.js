"use strict";

var maze = null;

function toPx(xmin, xmaj) {
  return (xmin + VIEW) * BLOCK
      + (DIAMETER * BLOCK + SPACING) * (xmaj + VIEW)
      + SPACING;
}

var SCALE_FN = [
  function(t) { return t / Math.sqrt(1 + t * t); },
  function(t) { return (Math.exp(2 * t) - 1) / (Math.exp(2 * t) + 1); },
  function(t) { return t / Math.sqrt(Math.sqrt(1 + t * t * t * t)); },
  function(t) { return Math.min(1, Math.max(-1, 2 * t / (VIEW + 0.5))); },
];

var scale_fn = SCALE_FN[1];
var scale = 0.5;

var coords = function(t0, t1) {
  var bl = function(t) { return [scale_fn(scale * (t - 0.5)),
                                 scale_fn(scale * (t + 0.5))]; };
  var inner = bl(t0);
  inner = [inner[0] * 0.47 + 0.5, inner[1] * 0.47 + 0.5];
  var outer = bl(t1);
  var toScr = function(t) { return Math.round(SIZE * (t + 1) / 2); };
  return [toScr(inner[0] * outer[1] + (1 - inner[0]) * outer[0]),
          toScr(inner[1] * outer[1] + (1 - inner[1]) * outer[0])];
};

function drawTile(img, t, x) {
  var xc = coords(x[0], x[1]);
  var yc = coords(x[2], x[3]);
  context.drawImage(img, t * BLOCK, 0, BLOCK, BLOCK,
                    xc[0], yc[0], xc[1] - xc[0], yc[1] - yc[0]);
}

var drawId = null;

function draw(opt_x) {
  if (maze == null) {
    return; // Not yet loaded.
  }
  var time = performance.now();

  var increase = function(x) {
    for (var j = 0; j < 4; j++) {
      if (x[j] != 0) { x[j] = -x[j]; }
      if (x[j] < 0) { return x; }
    }
    var i = x.findIndex(function(xi) { return xi > 0; });
    if (i === -1 || i === 3) {
      x[0] = x[3] + 1;
      x[3] = 0;
    } else {
      x[i + 1] += 1;
      x[0] -= 1;
      for (var j = 1; j <= i; j++) {
        x[0] += x[j];
        x[j] = 0;
      }
    }
    return x;
  };

  if (!opt_x) {
    //Clear canvas
    var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "rgb(0, 64, 192)");
    gradient.addColorStop(1, "rgb(0, 0, 64)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Status bar
    var y = SIZE + SPACING;
    maze.getInventory().forEach(function(t, i) {
      context.drawImage(blocksImage, t * BLOCK, 0, BLOCK, BLOCK,
                                     SPACING + i * BLOCK, y, BLOCK, BLOCK);
    });
    context.textAlign="right";
    context.font = "bold 30px sans-serif";
    context.textBaseline = "top";
    context.fillStyle = "rgb(192, 192, 192)";
    context.fillText(maze.getSteps() + " STEPS", toPx(VIEW + 1, VIEW), y);
  }
  // The maze
  var x = opt_x || [0, 0, 0, 0];
  while (performance.now() < time + 40 && x[0] < 10) {
    var t = maze.getRel(x);
    if (t == maze.getBlocked()) {
      t += 2;
    }
    drawTile(blocksImage, t, x);
    if (maze.isZero(x)) {
      drawTile(youImage, 0, x);
    }
    increase(x);
  }
  window.clearTimeout(drawId);
  if (x[0] < 10) {
    drawId = window.setTimeout(draw, 0, x);
  }
  // "Congrats" text
  if (maze.isWon() && !maze.getReverseMode()) {
    var x = toPx(0, 0) + BLOCK / 2;
    var y = toPx(0, 0) + BLOCK / 2;
    context.textAlign="center";
    context.font = "bold 50px sans-serif";
    context.textBaseline = "middle";
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillText(WIN_TEXT, x + 2, y + 5);
    context.fillStyle = "rgb(255, 255, 255)";
    context.fillText(WIN_TEXT, x, y);
    context.lineWidth = 2;
    context.strokeStyle = "rgb(0, 64, 128)";
    context.strokeText(WIN_TEXT, x, y);
  }
}

function drawHelp() {
  for (k in KEY_CODE) {
    var dx = DIR_MAP[KEY_CODE[k]];
    // TODO
    var x = toPx(dx[0], dx[1]) + BLOCK / 2;
    var y = toPx(dx[2], dx[3]) + BLOCK / 2;
    var gradient = context.createRadialGradient(x, y, 0, x, y, BLOCK);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, BLOCK, 0, 2 * Math.PI);
    context.fill();
    context.textAlign="center";
    context.textBaseline = "middle";
    context.font = "bold 30px sans-serif";
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillText(k, x, y + 3);
    context.lineWidth = 1;
    context.strokeStyle = "rgb(0, 0, 192)";
    context.strokeText(k, x, y + 3);
  }
}

function editLevel() {
  document.getElementById("editLevel").style.display = "block";
  document.getElementById("editLevelButton").style.display = "none";
}

function playLevel() {
  var contents = document.getElementById("levelText").value;
  maze = new mazegame.Maze(contents);
  document.getElementById("errorMessage").textContent = maze.getErrors();
  draw();
}

function loadMaze() {
  var levelFrame = document.getElementById("levelFile");
  var contents = levelFrame.contentWindow.document.body.childNodes[0].innerHTML;
  document.getElementById("levelText").value = contents;
  playLevel();
}

function loadLevel(filename) {
  document.getElementById("editLevel").style.display = "none";
  document.getElementById("editLevelButton").style.display = "inline-block";
  document.getElementById("levelFile").src = filename;
}

function loadCurrent() {
  var level = maze.serialize();
  if (level != null) {
    document.getElementById("levelText").value = level;
  }
}

function onClickHandler(event) {
  var canvasRect = canvas.getBoundingClientRect();
  var x = event.clientX - canvasRect.left;
  var y = event.clientY - canvasRect.top;
  for (var k in DIR_MAP) {
    var dx = DIR_MAP[k];
    var dirX = toPx(dx[0], dx[1]);
    var dirY = toPx(dx[2], dx[3]);
    if (x >= dirX && y >= dirY && x < dirX + BLOCK && y < dirY + BLOCK) {
      maze.move(dx);
      draw();
      return;
    }
  }
  var statusBarY = toPx(VIEW + 1, VIEW) + SPACING;
  if (y >= statusBarY && y < statusBarY + BLOCK) {
    maze.dropFromInventory(Math.floor((x - SPACING) / BLOCK));
    draw();
  }
}

function keyDownHandler(event) {
  if (document.activeElement.id == "levelText") {
    return;
  }
  if (event.keyCode in DIR_MAP) {
    maze.move(DIR_MAP[event.keyCode]);
    draw();
  } else switch (event.keyCode) {
    case 32: // Space
      maze.shuffle();
      draw();
      break;
    case 72: // H
      draw();
      drawHelp();
    case 48: // 0
    case 49: // 1
    case 50: // 2
    case 51: // 3
      scale_fn = SCALE_FN[event.keyCode - 48];
      draw();
      break;
  }
}

// Configure canvas.
var canvas = document.getElementById("mazeCanvas");
canvas.width = SIZE;
canvas.height = SIZE + 2 * SPACING + BLOCK;
var context = canvas.getContext("2d");

// Load graphics.
var youImage = new Image();
youImage.onload = function() { draw(); };
youImage.src = "images/you.png";
var blocksImage = new Image();
blocksImage.onload = function() { draw(); };
blocksImage.src = "images/blocks.png";

// Add keyboard input listener.
document.addEventListener("keydown", keyDownHandler, false);
canvas.addEventListener("click", onClickHandler, false);

draw();

