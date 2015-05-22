var KEY_CODE = {
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
};

var DIR_MAP = {
  87: [0, 0, -1, 0], // W -> minor-up
  65: [-1, 0, 0, 0], // A -> minor-left
  83: [0, 0, 1, 0],  // S -> minor-down
  68: [1, 0, 0, 0],  // D -> minor-right
  73: [0, 0, 0, -1], // I -> major-up
  74: [0, -1, 0, 0], // J -> major-left
  75: [0, 0, 0, 1],  // K -> major-down
  76: [0, 1, 0, 0],  // L -> major-right
  38: [0, 0, 0, -1], // up arrow    -> major-up
  37: [0, -1, 0, 0], // left arrow  -> major-left
  40: [0, 0, 0, 1],  // down arrow  -> major-down
  39: [0, 1, 0, 0],  // right arrow -> major-right
};

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
var SLOCK = 8;
var GLOCK = 9;
var MOVEBLOCK = 10;
var MOVEHOLE = 11;
var GOAL = 12;
var SOLIDBLOCK = 13;

var COLLECTIBLE = [SKEY, GKEY];
var PASSABLE = [EMPTY, GOAL, RED, GREEN, RGSWITCH];
var MOVABLE = [MOVEBLOCK];

var CONSUME = {};
CONSUME[SLOCK] = SKEY;
CONSUME[GLOCK] = GKEY;
CONSUME[MOVEHOLE] = MOVEBLOCK;

var TILE_MAP = {
  "k": SKEY,
  "K": GKEY,
  "h": SLOCK,
  "H": GLOCK,
  "r": RED,
  "g": GREEN,
  "s": RGSWITCH,
  "S": EMPTY,
  "b": MOVEBLOCK,
  "B": MOVEHOLE,
  "G": GOAL,
  " ": EMPTY,
};
for (var i = 0; i < 10; i++) {
  TILE_MAP[i.toString()] = SOLIDBLOCK + i;
}

var WIN_TEXT = "CONGRATS! YOU DID IT!";

