"use strict";

/** Create a new view to draw into the given canvas. */
mazegame.View = function(canvas, size) {
  canvas.width = size;
  canvas.height = size + 2 * SPACING + BLOCK;
  var context = canvas.getContext("2d");

  var SCALE_FN = [
    function(t) { return Math.min(1, Math.max(-1, 2 * t / (VIEW + 0.5))); },
    function(t) { return t / Math.sqrt(1 + t * t); },
    function(t) { return (Math.exp(2 * t) - 1) / (Math.exp(2 * t) + 1); },
    function(t) { return t / Math.sqrt(Math.sqrt(1 + t * t * t * t)); },
  ];

  var scaleFn = SCALE_FN[0];
  var scale = 0.5;
  var scaleMax = null;
  var scaleSpacingMin = 0.05;
  var scaleSpacingMaj = 0.01;

  var scaleChanged = function() {
    scaleMax = 2;
    while (Math.abs(scaleFn(scale * (scaleMax + 0.5))
          - scaleFn(scale * (scaleMax + 1.5))) > 0.03) {
      scaleMax++;
    }
    this.drawBackground();
    this.draw();
  }.bind(this);

  this.setScaleFn = function(i) {
    scaleFn = SCALE_FN[i] || scaleFn;
    scaleChanged();
  };

  this.multScale = function(s) {
    scale = Math.min(1.5, Math.max(0.3, scale * s));
    scaleChanged();
  };

  var coords = function(t0, t1) {
    var bl = function(t, m) { return [
      (scaleFn(scale * (t - 0.5)) * m + 1) / 2,
      (scaleFn(scale * (t + 0.5)) * m + 1) / 2
    ]; };
    var min = bl(t0, 1 - scaleSpacingMin);
    var maj = bl(t1, 1 - scaleSpacingMaj);
    return [Math.round(size * (min[0] * maj[1] + (1 - min[0]) * maj[0])),
            Math.round(size * (min[1] * maj[1] + (1 - min[1]) * maj[0]))];
  };

  var drawTile = function(img, t, x, opt_bg) {
    var xc = coords(x[0], x[1]);
    var yc = coords(x[2], x[3]);
    if (opt_bg === true) {
      context.fillStyle = "black";
      context.fillRect(xc[0], yc[0], xc[1] - xc[0], yc[1] - yc[0]);
    }
    // Workaround for Firefox drawImage scaling bug:
    // https://stackoverflow.com/questions/17725840
    var w = img.height - ((xc[1] - xc[0] > img.height) ? 0.5 : 0);
    context.drawImage(img, t * img.height, 0, w, img.height,
                      xc[0], yc[0], xc[1] - xc[0], yc[1] - yc[0]);
  };

  var drawId = null;

  this.draw = function(opt_x) {
    if (maze == null) {
      return; // Not yet loaded.
    }
    var time = performance.now();

    var increment = function(x) {
      var m = 0; // Max abs value
      var c = 0; // Number of occurrences of m.
      for (var i = 0; i < 4; i++) {
        var a = Math.abs(x[i]);
        if (a == m) {
          c++;
        } else if (a > m) {
          c = 1;
          m = a;
        }
      }
      if (c == 1 && x[0] == -m) {
        x[0] = m;
        return x;
      }
      for (var i = 0; i < 4; i++) {
        if (x[i] == m) {
          x[i] = -m;
        } else {
          x[i]++;
          return x;
        }
      }
      for (var i = 0; i < 4; i++) {
        x[i] -= 1;
      }
      return x;
    };

    if (!opt_x) {
      this.drawBackground(true);
      // Status bar
      var y = size + SPACING;
      maze.getInventory().forEach(function(t, i) {
        var unit = blocksImage.height;
        context.drawImage(blocksImage, t * unit, 0, unit, unit,
                                       SPACING + i * BLOCK, y, BLOCK, BLOCK);
      });
      context.textAlign="right";
      context.font = "bold 30px sans-serif";
      context.textBaseline = "top";
      context.fillStyle = "rgb(192, 192, 192)";
      context.fillText(maze.getSteps() + " STEPS", size, y);
    }
    // The maze
    var x = opt_x || [0, 0, 0, 0];
    window.clearTimeout(drawId);
    drawId = window.setTimeout(this.draw.bind(this), 0, x);
    while (performance.now() < time + 20 && x[0] >= -scaleMax) {
      var t = maze.getRel(x);
      if (t == maze.getBlocked()) {
        t += 2;
      }
      drawTile(blocksImage, t, x, true);
      if (maze.isZero(x)) {
        drawTile(youImage, 0, x);
      }
      increment(x);
    }
    if (x[0] < -scaleMax) {
      window.clearTimeout(drawId);
    }
    // "Congrats" text
    if (maze.isWon() && !maze.getReverseMode()) {
      var x = SIZE / 2;
      var y = SIZE / 2;
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
  };

  this.drawBackground = function(opt_onlyStatusbar) {
      //Clear canvas
      var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgb(0, 64, 192)");
      gradient.addColorStop(1, "rgb(0, 0, 64)");
      context.fillStyle = gradient;
      if (opt_onlyStatusbar) {
        context.fillRect(0, size, canvas.width, canvas.height - size);
      } else {
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
  };

  this.drawHelp = function() {
    for (var k in KEY_CODE) {
      var dx = DIR_MAP[KEY_CODE[k]];
      var xRange = coords(dx[0], dx[1]);
      var yRange = coords(dx[2], dx[3]);
      var x = (xRange[0] + xRange[1]) / 2;
      var y = (yRange[0] + yRange[1]) / 2;
      var r = Math.abs(xRange[1] - xRange[0]);
      var gradient = context.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, r, 0, 2 * Math.PI);
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
  };

  this.getSquare = function(x, y) {
    for (var k in DIR_MAP) {
      var dx = DIR_MAP[k];
      var dirX = coords(dx[0], dx[1]);
      var dirY = coords(dx[2], dx[3]);
      if (x >= dirX[0] && y >= dirY[0] && x < dirX[1] && y < dirY[1]) {
        return dx;
      }
    }
    return null;
  };

  this.getStatusBarIndex = function(x, y) {
    var statusBarY = SIZE + SPACING;
    if (y >= statusBarY && y < statusBarY + BLOCK) {
      return Math.floor((x - SPACING) / BLOCK);
    }
    return null;
  };

  // Load graphics.
  var youImage = new Image();
  var blocksImage = new Image();
  youImage.onload = this.draw.bind(this);
  blocksImage.onload = this.draw.bind(this);
  youImage.src = "images/you.png";
  blocksImage.src = "images/blocks.png";

  scaleChanged();
};
