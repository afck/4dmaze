all:
	gcc -c game.c
	gcc -c main.c `sdl2-config --cflags`
	gcc -o maze main.o game.o `sdl2-config --libs` -lSDL2_image
clean:
	rm *.o maze
