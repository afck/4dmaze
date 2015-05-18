mazegame = {};

// TODO: Show the number of keys.
// TODO: Generate the level selection buttons from the levels that are actually
//       present.

mazegame.Maze = function(level) {
  this.size = [];
  this.size.push(level.indexOf("+"));
  this.size.push(Math.floor(level.indexOf("\n") / (this.size[0] + 1)));
  this.size.push(Math.floor(
      (level.search(/\+\+/) + 1) / ((this.size[0] + 1) * this.size[1] + 1)));
  this.size.push(level.match(/\n\+\+/g).length);
  this.grid = [];
  for (var i = 0; i < level.length; i++) {
    var ch = level[i];
    var n = parseInt(ch);
    if (!isNaN(n)) {
      this.grid.push(n + SOLIDBLOCK);
    } else switch (ch) {
      case "k":
        this.grid.push(SKEY);
        break;
      case "K":
        this.grid.push(GKEY);
        break;
      case "h":
        this.grid.push(SKEYHOLE);
        break;
      case "H":
        this.grid.push(GKEYHOLE);
        break;
      case "r":
        this.grid.push(RED);
        break;
      case "g":
        this.grid.push(GREEN);
        break;
      case "s":
        this.grid.push(RGSWITCH);
        break;
      case "S":
        this.grid.push("S"); // Start
        break;
      case "b":
        this.grid.push(MOVEBLOCK);
        break;
      case "B":
        this.grid.push(MOVEHOLE);
        break;
      case "G":
        this.grid.push(GOAL);
        break;
      case " ":
        this.grid.push(EMPTY);
        break;
    }
  }
  if (this.size[0] * this.size[1] * this.size[2] * this.size[3]
      != this.grid.length) {
    alert("Level file corrupted!");
  }
  var start_i = this.grid.indexOf("S");
  this.grid[start_i] = EMPTY;
  this.pos = [start_i % this.size[0],
              Math.floor(start_i / this.size[0]) % this.size[1],
              Math.floor(start_i / this.size[0] / this.size[1]) % this.size[2],
              Math.floor(start_i / this.size[0] / this.size[1] / this.size[2])];
  this.pass = RED;
  this.skeys = 0;
  this.gkeys = 0;
  this.steps = 0;
}

mazegame.Maze.prototype.normalized = function(x) {
  var nx = [x[0] % this.size[0],
            x[1] % this.size[1],
            x[2] % this.size[2],
            x[3] % this.size[3]];
  if (nx[0] < 0) { nx[0] += this.size[0]; }
  if (nx[1] < 0) { nx[1] += this.size[1]; }
  if (nx[2] < 0) { nx[2] += this.size[2]; }
  if (nx[3] < 0) { nx[3] += this.size[3]; }
  return nx;
}

mazegame.Maze.prototype.sum = function(x, y) {
  return this.normalized([x[0] + y[0],
                          x[1] + y[1],
                          x[2] + y[2],
                          x[3] + y[3]]);
}

mazegame.Maze.prototype.get = function(x) {
  var nx = this.normalized(x);
  return this.grid[nx[0] + this.size[0] * (
      nx[1] + this.size[1] * (nx[2] + this.size[2] * nx[3]))];
}

mazegame.Maze.prototype.set = function(x, v) {
  var nx = this.normalized(x);
  this.grid[nx[0] + this.size[0] * (
      nx[1] + this.size[1] * (nx[2] + this.size[2] * nx[3]))] = v;
}

mazegame.Maze.prototype.getRel = function(rx) {
  return this.get(this.sum(rx, this.pos));
}

// Rotates the maze randomly.
mazegame.Maze.prototype.shuffle = function() {
  var map = [0, 1, 2, 3];
  var swap = function(i, j) {
    var t = map[i];
    map[i] = map[j];
    map[j] = t;
  };
  swap(3, Math.floor(Math.random() * 4));
  swap(2, Math.floor(Math.random() * 3));
  swap(1, Math.floor(Math.random() * 2));
  var move = function(x) {
    return [x[map[0]], x[map[1]], x[map[2]], x[map[3]]];
  }
  this.pos = move(this.pos);
  var newsize = move(this.size);
  var newgrid = this.grid.slice(0);
  for (var x0 = 0; x0 < this.size[0]; x0++) {
    for (var x1 = 0; x1 < this.size[1]; x1++) {
      for (var x2 = 0; x2 < this.size[2]; x2++) {
        for (var x3 = 0; x3 < this.size[3]; x3++) {
          var x = [x0, x1, x2, x3];
          var newx = move(x);
          newgrid[newx[0] + newsize[0] * (
              newx[1] + newsize[1] * (newx[2] + newsize[2] * newx[3]))] =
            this.get(x);
        }
      }
    }
  }
  this.size = newsize;
  this.grid = newgrid;
}

mazegame.Maze.prototype.isWon = function() {
  return GOAL == this.get(this.pos);
}

mazegame.Maze.prototype.move = function(dx) {
  var newpos = this.sum(this.pos, dx);
  switch (this.get(newpos)) {
    case EMPTY:
    case GOAL:
      break;
    case RED:
    case GREEN:
      if (this.pass != this.get(newpos)) {
        return;
      }
      break;
    case SKEYHOLE:
      if (this.skeys == 0) {
        return;
      }
      this.skeys--;
      this.set(newpos, EMPTY);
      break;
    case GKEYHOLE:
      if (this.gkeys == 0) {
        return;
      }
      this.gkeys--;
      this.set(newpos, EMPTY);
      break;
    case SKEY:
      this.skeys++;
      this.set(newpos, EMPTY);
      break;
    case GKEY:
      this.gkeys++;
      this.set(newpos, EMPTY);
      break;
    case RGSWITCH:
      this.pass = (this.pass == RED) ? GREEN : RED;
      break;
    case MOVEBLOCK:
      var blockpos = this.sum(newpos, dx);
      switch (this.get(blockpos)) {
        case EMPTY:
          this.set(blockpos, MOVEBLOCK);
          this.set(newpos, EMPTY);
          break;
        case MOVEHOLE:
          this.set(blockpos, EMPTY);
          this.set(newpos, EMPTY);
          break;
        default:
          return;
      }
      break;
    default: // Blocks, holes ...
      return;
  }
  this.pos = newpos;
  this.steps++;
}

function draw() {	
  if (typeof(maze) === "undefined") {
    return; // Not yet loaded.
  }
  //Clear Canvas
  ctx.fillStyle = "#444488";
  ctx.fillRect(0, 0, stage.width, stage.height);
  // The maze
  for (var x0 = -VIEW; x0 <= VIEW; x0++) {
    for (var x1 = -VIEW; x1 <= VIEW; x1++) {
      for (var x2 = -VIEW; x2 <= VIEW; x2++) {
        for (var x3 = -VIEW; x3 <= VIEW; x3++) {
          var t = maze.getRel([x0, x1, x2, x3]);
          if ((t == RED || t == GREEN) && t != maze.pass) {
            t += 2;
          }
          var offset = BLOCK * t;
          var x = (x0 + VIEW) * BLOCK
                  + (DIAMETER * BLOCK + SPACING) * (x1 + VIEW)
                  + SPACING;
          var y = (x2 + VIEW) * BLOCK
                  + (DIAMETER * BLOCK + SPACING) * (x3 + VIEW)
                  + SPACING;
          ctx.drawImage(blocksImage, offset, 0, BLOCK, BLOCK,
                                          x, y, BLOCK, BLOCK);
        }
      }
    }
  }
  // Status bar
  var y = DIAMETER * DIAMETER * BLOCK + (DIAMETER + 1) * SPACING;
  for (var i = 0; i < maze.gkeys + maze.skeys; i++) {
    var offset = ((i < maze.gkeys) ? GKEY : SKEY) * BLOCK;
    var x = SPACING + i * BLOCK;
    ctx.drawImage(blocksImage, offset, 0, BLOCK, BLOCK,
                                    x, y, BLOCK, BLOCK);
  }
  var x = DIAMETER * DIAMETER * BLOCK + DIAMETER * SPACING;
  ctx.textAlign="right";
  ctx.font = "bold 30px sans-serif";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000000";
  ctx.fillText(maze.steps + " STEPS", x, y);
  // Player sprite
  x = VIEW * BLOCK + VIEW * (DIAMETER * BLOCK + SPACING) + SPACING;
  y = VIEW * BLOCK + VIEW * (DIAMETER * BLOCK + SPACING) + SPACING;
  ctx.drawImage(youImage, 0, 0, BLOCK, BLOCK,
                          x, y, BLOCK, BLOCK);
  // "Congrats" text
  if (maze.isWon()) {
    x += BLOCK / 2;
    y += BLOCK / 2;
    ctx.textAlign="center"; 
    ctx.font = "bold 50px sans-serif";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#004488";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = "#000000";
    var text = "CONGRATS! YOU DID IT!";
    ctx.fillText(text, x + 2, y + 5);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(text, x, y);
    ctx.strokeText(text, x, y);
  }
}

function loadMaze() {
  var levelFrame = document.getElementById("levelFile");
  var contents = levelFrame.contentWindow.document.body.childNodes[0].innerHTML;
  contents.replace(/\r/g, ""); // Now all line breaks are just \n.
  maze = new mazegame.Maze(contents);
  draw();
}

function loadLevel(filename) {
  var levelFrame = document.getElementById("levelFile");
  levelFrame.src = filename;
}

function keyDownHandler(event) {
  switch (event.keyCode) {
    case 87: // W
      maze.move([0, 0, -1, 0]);
      break;
    case 65: // A
      maze.move([-1, 0, 0, 0]);
      break;
    case 83: // S
      maze.move([0, 0, 1, 0]);
      break;
    case 68: // D
      maze.move([1, 0, 0, 0]);
      break;
    case 38: // up
    case 73: // I
      maze.move([0, 0, 0, -1]);
      break;
    case 37: // left
    case 74: // J
      maze.move([0, -1, 0, 0]);
      break;
    case 40: // down
    case 75: // K
      maze.move([0, 0, 0, 1]);
      break;
    case 39: // right
    case 76: // L
      maze.move([0, 1, 0, 0]);
      break;
    case 32: // space
      maze.shuffle();
      break;
    default:
      return;
  }
  draw();
}

var BLOCK = 28;
var SPACING = 10;
var VIEW = 2;
var DIAMETER = 2 * VIEW + 1;

var EMPTY = 0;
var RED = 1;
var GREEN = 2;
var RGSWITCH = 5;
var SKEY = 6;
var GKEY = 7;
var SKEYHOLE = 8;
var GKEYHOLE = 9;
var MOVEBLOCK = 10;
var MOVEHOLE = 11;
var GOAL = 12;
var SOLIDBLOCK = 13;

// Configure canvas.
var stage = document.getElementById("mazeCanvas");
//stage.width = DIAMETER * DIAMETER * BLOCK + (DIAMETER + 1) * SPACING;
//stage.height = DIAMETER * DIAMETER * BLOCK + (DIAMETER + 1) * SPACING;
stage.width = DIAMETER * DIAMETER * BLOCK + (DIAMETER + 1) * SPACING;
stage.height = DIAMETER * DIAMETER * BLOCK + (DIAMETER + 1) * SPACING
               + SPACING + BLOCK;
var ctx = stage.getContext("2d");
ctx.fillStyle = "black";

// Load graphics.
var youImage = new Image();
youImage.onload = function() { draw(); };
youImage.src = "images/you.png";
var blocksImage = new Image();
blocksImage.onload = function() { draw(); };
blocksImage.src = "images/blocks.png";

// Add keyboard input listener.
document.addEventListener("keydown",keyDownHandler, false);	

draw();

