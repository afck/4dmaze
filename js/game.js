"use strict";

var maze = null;

function editLevel() {
  document.getElementById("editLevel").style.display = "block";
  document.getElementById("editLevelButton").style.display = "none";
}

function playLevel() {
  var contents = document.getElementById("levelText").value;
  maze = new mazegame.Maze(contents);
  document.getElementById("errorMessage").textContent = maze.getErrors();
  view.drawBackground();
  view.draw();
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
  var dx = view.getSquare(x, y);
  if (dx !== null) {
    maze.move(dx);
    view.draw();
    return;
  }
  var i = view.getStatusBarIndex(x, y);
  if (i !== null) {
    maze.dropFromInventory(i);
    view.draw();
  }
}

function keyDownHandler(event) {
  if (document.activeElement.id == "levelText") {
    return;
  }
  if (event.keyCode in DIR_MAP) {
    maze.move(DIR_MAP[event.keyCode]);
    view.draw();
  } else switch (event.keyCode) {
    case 32: // Space
      maze.shuffle();
      view.draw();
      break;
    case 72: // H
      view.drawHelp();
      break;
    case 48: // 0
    case 49: // 1
    case 50: // 2
    case 51: // 3
      view.setScaleFn(event.keyCode - 48);
      break;
    case 107: // +
      view.setScaleFn(undefined, 1.1);
      break;
    case 109: // -
      view.setScaleFn(undefined, 1 / 1.1);
      break;
  }
}

var canvas = document.getElementById("mazeCanvas");
var view = new mazegame.View(canvas, SIZE);
document.addEventListener("keydown", keyDownHandler, false);
canvas.addEventListener("click", onClickHandler, false);

