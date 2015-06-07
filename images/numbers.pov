#include "4dmaze.inc"

background { rgb <1/255, 1/255, 0> }

camera {
	orthographic
	location <5.5, 0.5, -5>
	up <0, 1, 0>
	right <11, 0, 0>
}

box {
	<0, 0, 10>, <10, 1, 11>
	pigment { color rgb <0, 0, 0> }
	finish {
		ambient 0
		diffuse 0
	}
}

#macro Text(text_string, number, text_color1, text_color2)
text {
	ttf "/usr/share/fonts/truetype/ttf-dejavu/DejaVuSans-Bold.ttf" text_string, 1, 0
	pigment {
		spotted
		frequency 2
		color_map {
			[0 rgb text_color1]
			[1 rgb text_color2]
		}
		scale 0.1
	}
	finish { Shiny_Finish }
	rotate <-2, -8, 0>
	translate <number+1/4, 1/8, 0>
}
#end

Text("0", 0, color0, color1)
Text("1", 1, color1, color2)
Text("2", 2, color2, color3)
Text("3", 3, color3, color4)
Text("4", 4, color4, color5)
Text("5", 5, color5, color6)
Text("6", 6, color6, color7)
Text("7", 7, color7, color8)
Text("8", 8, color8, color9)
Text("9", 9, color9, color0)

object { Gold_Spheres translate <10, 0, 0> }
object { Gold_Cylinders translate <10, 0, 0> }
