all:
	make 4dmaze you numbers
4dmaze:
	povray Display=false Width=644 Height=28 Antialias=true Output_File_Type=N 4dmaze.pov
	convert 4dmaze.png 4dmaze.bmp
you:
	povray Display=false Width=28 Height=28 Antialias=true Output_File_Type=N you.pov
	convert you.png you.bmp
numbers:
	povray Display=false Width=616 Height=56 Antialias=true Output_File_Type=N numbers.pov
	convert numbers.png numbers.bmp
clean:
	rm *.bmp *.png
