
function toPx(xmin, xmaj) {
  return (xmin + VIEW) * BLOCK
      + (DIAMETER * BLOCK + SPACING) * (xmaj + VIEW)
      + SPACING;
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

function draw() {
  var drawBlock = function(img, t, x, y) {
    context.drawImage(img, t * BLOCK, 0, BLOCK, BLOCK, x, y, BLOCK, BLOCK);
  };

  if (typeof(maze) === "undefined") {
    return; // Not yet loaded.
  }
  //Clear canvas
  context.fillStyle = "#444488";
  context.fillRect(0, 0, canvas.width, canvas.height);
  // The maze
  for (var x0 = -VIEW; x0 <= VIEW; x0++) {
    for (var x1 = -VIEW; x1 <= VIEW; x1++) {
      for (var x2 = -VIEW; x2 <= VIEW; x2++) {
        for (var x3 = -VIEW; x3 <= VIEW; x3++) {
          var t = maze.getRel([x0, x1, x2, x3]);
          if (t == maze.getBlocked()) {
            t += 2;
          }
          var x = toPx(x0, x1);
          var y = toPx(x2, x3);
          drawBlock(blocksImage, t, x, y);
          if (maze.isZero([x0, x1, x2, x3])) {
            drawBlock(youImage, 0, x, y);
          }
        }
      }
    }
  }
  // Status bar
  var y = toPx(VIEW + 1, VIEW) + SPACING;
  maze.getInventory().forEach(function(t, i) {
    drawBlock(blocksImage, t, SPACING + i * BLOCK, y);
  });
  context.textAlign="right";
  context.font = "bold 30px sans-serif";
  context.textBaseline = "top";
  context.fillStyle = "#000000";
  context.fillText(maze.getSteps() + " STEPS", toPx(VIEW + 1, VIEW), y);
  // "Congrats" text
  if (maze.isWon() && !maze.getReverseMode()) {
    var x = toPx(0, 0) + BLOCK / 2;
    var y = toPx(0, 0) + BLOCK / 2;
    context.textAlign="center";
    context.font = "bold 50px sans-serif";
    context.textBaseline = "middle";
    context.fillStyle = "#000000";
    context.fillText(WIN_TEXT, x + 2, y + 5);
    context.fillStyle = "#FFFFFF";
    context.fillText(WIN_TEXT, x, y);
    context.lineWidth = 2;
    context.strokeStyle = "#004488";
    context.strokeText(WIN_TEXT, x, y);
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

function keyDownHandler(event) {
  if (document.activeElement.id == "levelText") {
    return;
  }
  if (event.keyCode in DIR_MAP) {
    maze.move(DIR_MAP[event.keyCode]);
  } else switch (event.keyCode) {
    case 32: // Space
      maze.shuffle();
      break;
  }
  draw();
}

// Configure canvas.
var canvas = document.getElementById("mazeCanvas");
canvas.width = toPx(VIEW + 1, VIEW) + SPACING;
canvas.height = toPx(VIEW + 1, VIEW) + 2 * SPACING + BLOCK;
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

