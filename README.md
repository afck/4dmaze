# Yet another 4D Maze game

This is the SDL 2 port of a four-dimensional maze game I rediscovered.
I had written it over a decade ago in undecipherable C ...


## Build it

If you have [GCC](https://gcc.gnu.org/) and [SDL 2](http://www.libsdl.org/)
installed on a Linux system,
``` sh
make
```
should create a binary file called maze.

If that doesn't work, you will have to wait until it has a proper Makefile (or
help me out and create one).


## Understand it

If you wanted to view a building with several floors in a tile-based game on a
two-dimensional monitor, you might show the different floors on top of each
other.
Thus left and right on your screen would always correspond to west and east, but
up and down would correspond to north and south within each floor, but to the
actual elevation, the "real up" and "real down", if you move between floors.
So we'd use the vertical screen dimension twice: Moving one tile up or down
means moving north or south within a floor, but movin up or down to a different
floor map means going up or down the stairs. We have split the meaning of the
vertical dimension into two parts: "minor up/down" for north and south and
"major up/down" for one floor up and one floor down, and that gave us the means
to display a three-dimensional world.
Now, if the building is big, we'll neither be able to show a complete floor, nor
to show all the floors. We would only show the floor with the player inside it,
and maybe two above and two below. And within each floor, we would only show the
tile with the player on it and maybe two more rows of tiles to the north, south,
east and west. If we moved the player, the view would scroll accordingly.

This game takes place in a four-dimensional world, so we do the same trick that
gave us two model dimensions for the vertical screen dimension with the
horizontal screen dimension, too! You could think of it as a building where the
floors aren't numbered with just one but two numbers: From floor (0, 0) you can
either go up to floor (1, 0), or you can go "the other up" to (0, 1).

Instead of shaky metaphors with floors and buildings, however, we will just
stick to what we see on the screen now and call the four dimensions
"minor horizontal", "major horizontal", "minor vertical" and "major vertical".

That's almost all you need to know about the geometry of the maze: The game is
tile-based, takes place in a four-dimensional hyper-rectangularly shaped grid
and allows you to move in eight directions between adjacent tiles. But one more
thing: The maze wraps around! That is, if you leave the maze on one side, you
enter it from the other side, just like in Pac-Man. Or equivalently: On each
side of the maze there's an identical copy of itself, creating an infinite
tiling of the four-dimensional grid. You won't notice when you wrap around that
way, though, as you are always displayed in the middle of the screen and the
maze scrolls around you.


## Play it

Select a level - the provided ones should be roughly in order of difficulty, but
feel free to inspect the text files, create your own levels and send them to me!

You now see the hypercube of 5 * 5 * 5 * 5 tiles around your position: In each
of the eight directions, you can see two tiles ahead. You can move around using
these keys:

key         | action
------------|---------------------------------------------------------------
W           | move minor-up
A           | move minor-left
S           | move minor-down
D           | move minor-right
I           | move major-up
J           | move major-left
K           | move major-down
L           | move major-right
space       | shuffle dimensions (i. e. rotate randomly for added confusion)
escape      | exit

Your goal is to reach the goal, which is shown as a rainbow-colored sphere. On
your way, you will find a few special items:

* A silver key allows you to remove one silver lock.
* A gold key allows you to remove one golden lock.
* There are some stones that can be pushed around.
* There are stone-shaped holes that can only be removed by pushing a stone into
  them.
* Yin-yang-shaped switches toggle whether the red or the green tiles can be
  passed.

Good luck, and don't get lost in hyperspace!

