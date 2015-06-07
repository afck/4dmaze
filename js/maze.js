"use strict";

var mazegame = {};

/** Create a new maze from the given level string. */
mazegame.Maze = function(level) {
  level = level.replace(/\r|\n/g, "");
  var errors = "";
  var sepRe = /\+(\++)/;
  var size = [level.indexOf("+")];
  size.push(Math.floor(sepRe.exec(level)[1].length / (size[0] + 1)));
  size.push(Math.floor((level.search(sepRe) + 1) / (size[0] + 1) / size[1]));
  var level = level.replace(/\+/g, "");
  size.push(Math.floor(level.length / size[0] / size[1] / size[2]));
  var start_i = level.indexOf("S");
  var pos = [0, 0, 0, 0];
  if (start_i == -1) {
    errors += "Starting position 'S' not found. ";
  } else {
    pos = [start_i % size[0],
           Math.floor(start_i / size[0]) % size[1],
           Math.floor(start_i / size[0] / size[1]) % size[2],
           Math.floor(start_i / size[0] / size[1] / size[2])];
  }
  var grid = level.split("").map(function(ch) {
    if (!(ch in TILE_MAP)) {
      errors += "Character '" + ch + "' is not a valid level element! ";
      return EMPTY;
    }
    return TILE_MAP[ch];
  });
  if (size[0] * size[1] * size[2] * size[3] != grid.length) {
    errors += "The level file is invalid! It's computed dimensions are "
              + size[0] + " * " + size[1] + " * " + size[2] + " * " + size[3]
              + ", but it contains " + grid.length + " blocks.";
  }
  var blocked = GREEN;
  var steps = 0;
  var inventory = [];
  var reverseMode = false;
  var previousDx = null;
  var won = false;

  /** Returns the value between 0 and m-1 that is equal to x modulo m. */
  var mod = function(x, m) {
    while (x < 0) { x += m; }
    return x % m;
  }

  /** Returns the normalized position vector: x modulo size. */
  var normalized = function(x) {
    return x.map(function(c, i) { return mod(c, size[i]); });
  };

  /** Returns the grid index of the tile with the given coordinates. */
  var toIndex = function(x) {
    var nx = normalized(x);
    return nx[0] + size[0] * (nx[1] + size[1] * (nx[2] + size[2] * nx[3]));
  };

  /** Sets the value of the tile at x. */
  var set = function(x, v) {
    grid[toIndex(x)] = v;
  };

  /** Returns the sum of the two positions, modulo the maze's size. */
  var sum = function(x, y) {
    return normalized([x[0] + y[0], x[1] + y[1], x[2] + y[2], x[3] + y[3]]);
  };

  /** Returns the negative of x, modulo the maze's size. */
  var neg = function(x) {
    return normalized([-x[0], -x[1], -x[2], -x[3]]);
  }

  /** Returns the value of the tile at x. */
  var get = function(x) {
    return grid[toIndex(x)];
  };

  /** Tries to remove or collect the item in position x, if any. */
  var grabObstacle = function(x) {
    var t = get(x);
    if (COLLECTIBLE.indexOf(t) != -1) {
      inventory.push(t);
      set(x, EMPTY);
    } else if (t in CONSUME) {
      var index = inventory.indexOf(CONSUME[t]);
      if (index != -1) {
        inventory.splice(index, 1);
        set(x, EMPTY);
      }
    }
  };

  /** Tries to push the item in position x in direction dx, if any. */
  var pushObstacle = function(x, dx) {
    var t = get(x);
    if (MOVABLE.indexOf(t) != -1) {
      var newx = sum(x, dx);
      var obj = get(newx);
      if (obj in CONSUME && CONSUME[obj] == t) {
          set(newx, EMPTY);
          set(x, EMPTY);
      } else if (obj == EMPTY) {
          set(newx, t);
          set(x, EMPTY);
      }
    }
  };

  /** Returns true if x is a position where the player is allowed to be. */
  var isPassable = function(x) {
    return PASSABLE.indexOf(get(x)) != -1 && get(x) != blocked;
  };

  /** Returns RED or GREEN: the color which is not currently blocked. */
  var getOpenColor = function() {
    return (blocked == RED) ? GREEN : RED;
  };

  var toggleRedGreen = function() {
    blocked = getOpenColor();
    if (reverseMode) {
      inventory = inventory.map(function(item) {
        if (item == blocked) {
          return getOpenColor();
        }
        return item;
      });
    }
  }

  /** Moves the player into position x, triggering switches if any. */
  var stepOnto = function(x) {
    if (get(x) == RGSWITCH) {
      toggleRedGreen();
    } else if (GOAL == get(x)) {
      won = true;
    }
    pos = x;
    steps++;
  };

  /** Returns true if the given coordinate is zero modulo the grid size. */
  this.isZero = function(x) {
    return normalized(x).every(function(xi) { return xi == 0; });
  };

  /** Tries to move the player in direction dx. */
  this.move = function(dx) {
    var x = sum(pos, dx);
    if (reverseMode) {
      if (get(x) >= SOLIDBLOCK) {
        set(x, EMPTY);
      }
      if (isPassable(x) || get(x) >= SOLIDBLOCK) {
        if (get(x) == RGSWITCH) {
          toggleRedGreen();
        }
        pos = x;
        steps--;
        previousDx = dx;
      }
    } else {
      grabObstacle(x);
      pushObstacle(x, dx);
      if (isPassable(x)) {
        stepOnto(x);
      }
    }
  };

  /** Puts the given item into the maze in a way that guarantees that the
   *  previous state can still be reached. */
  this.dropFromInventory = function(i) {
    if (!reverseMode) {
      return;
    }
    var item = inventory[i];
    if ([RGSWITCH, RED, GREEN, GOAL].concat(COLLECTIBLE).indexOf(item) != -1) {
      if (get(pos) == EMPTY) {
        set(pos, item);
        if (COLLECTIBLE.indexOf(item) != -1) {
          inventory.splice(i, 1);
        } else if (item == RGSWITCH) {
          toggleRedGreen();
        }
      }
    } else if (previousDx != null) {
      var prevPos = sum(pos, neg(previousDx));
      if (get(prevPos) == EMPTY) {
        if (item == SLOCK || item == GLOCK) {
          set(prevPos, item);
          inventory.push(CONSUME[item]);
        } else if (item == MOVEBLOCK) {
          var furtherPos = sum(prevPos, neg(previousDx));
          if (get(furtherPos) == EMPTY || get(furtherPos) >= SOLIDBLOCK) {
            set(prevPos, MOVEBLOCK);
            set(furtherPos, MOVEHOLE);
          } else if (get(furtherPos) == MOVEBLOCK) {
            set(prevPos, MOVEBLOCK);
            set(furtherPos, EMPTY);
          }
        }
      }
    }
  };

  /** Returns the value of the tile at rx, relative to the player's position. */
  this.getRel = function(rx) {
    return get(sum(rx, pos));
  };

  /** Rotates the maze randomly. */
  this.shuffle = function() {
    var map = [0, 1, 2, 3];
    var swap = function(i, j) {
      var t = map[i];
      map[i] = map[j];
      map[j] = t;
    };
    while (map.every(function(v, k) { return v == k; })) {
      swap(3, Math.floor(Math.random() * 4));
      swap(2, Math.floor(Math.random() * 3));
      swap(1, Math.floor(Math.random() * 2));
    }
    var switchDim = function(x) {
      return [x[map[0]], x[map[1]], x[map[2]], x[map[3]]];
    }
    pos = switchDim(pos);
    var newsize = switchDim(size);
    var newgrid = grid.slice(0);
    for (var x0 = 0; x0 < size[0]; x0++) {
      for (var x1 = 0; x1 < size[1]; x1++) {
        for (var x2 = 0; x2 < size[2]; x2++) {
          for (var x3 = 0; x3 < size[3]; x3++) {
            var x = [x0, x1, x2, x3];
            var newx = switchDim(x);
            var newindex = newx[0] + newsize[0] * (
                newx[1] + newsize[1] * (newx[2] + newsize[2] * newx[3]));
            newgrid[newindex] = get(x);
          }
        }
      }
    }
    size = newsize;
    grid = newgrid;
  };

  /** Returns true if the player is in the goal. */
  this.isWon = function() {
    return won;
  };

  /** Returns the number of steps taken so far. */
  this.getSteps = function() {
    return steps;
  };

  /** Returns a list of all collected items. */
  this.getInventory = function() {
    return inventory.slice();
  };

  /** Returns RED or GREEN, depending on which is currently blocked. */
  this.getBlocked = function() {
    return blocked;
  };

  /** Returns all error messages concerning the level file syntax. */
  this.getErrors = function() {
    return errors;
  };

  this.toggleReverseMode = function() {
    reverseMode = !reverseMode;
    if (reverseMode) {
      inventory.splice(
          0, 0, SLOCK, GLOCK, RGSWITCH, MOVEBLOCK, GOAL, getOpenColor());
    } else {
      inventory = inventory.filter(function(i) {
        return i == GKEY || i == SKEY;
      });
    }
  };

  this.getReverseMode = function() {
    return reverseMode;
  };

  /** Returns the current state of the game as a level file. */
  this.serialize = function() {
    errors = "";
    if (inventory.some(function(item) {
      return COLLECTIBLE.indexOf(item) != -1;
    })) {
      errors = "Cannot possess keys in the beginning.";
      return null;
    }
    var level = "";
    var ch_map = {};
    for (ch in TILE_MAP) {
      ch_map[TILE_MAP[ch]] = ch;
    }
    ch_map[EMPTY] = " ";
    ch_map[blocked] = "g";
    ch_map[getOpenColor()] = "r";
    for (var x3 = 0; x3 < size[3]; x3++) {
      for (var x2 = 0; x2 < size[2]; x2++) {
        for (var x1 = 0; x1 < size[1]; x1++) {
          for (var x0 = 0; x0 < size[0]; x0++) {
            var x = [x0, x1, x2, x3];
            if (pos.every(function(xi, i) { return xi == x[i]; })) {
              if (get(x) != EMPTY) {
                errors = "Must start on an empty field!";
                return none;
              }
              level += "S";
            } else {
              level += ch_map[get(x)];
            }
          }
          level += "+";
        }
        level += "\n";
      }
      level += Array((size[0] + 1) * size[1] + 1).join("+") + "\n";
    }
    return level;
  };
};

