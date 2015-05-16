#include "4dmaze.inc"

camera {
	orthographic
	location <11.5, 0.5, -5>
	up <0, 1, 0>
	right <23, 0, 0>
}

object { Floor_Box translate <1, 0, 0> pigment { Switch_Red }}
object { Floor_Box translate <2, 0, 0> pigment { Switch_Green }}
object { Floor_Box translate <3, 0, 0> pigment { Switch_Red }}
object { Floor_Box translate <4, 0, 0> pigment { Switch_Green }}
object { Gold_Spheres translate <1, 0, 0> }
object { Gold_Spheres translate <2, 0, 0> }
object { Gold_Spheres translate <5, 0, 0> }
object { Gold_Cylinders translate <3, 0, 0> }
object { Gold_Cylinders translate <4, 0, 0> }
object { Yin_Yang translate <5, 0, 0> }

object { Key translate <6, 0, 0> pigment { color rgb <0.8, 0.8, 0.9> }}
object { Key translate <7, 0, 0> pigment { color rgb <1, 0.6, 0> }}
object { Keyhole translate <8, 0, 0> pigment { color rgb <0.8, 0.8, 0.9> }}
object { Keyhole translate <9, 0, 0> pigment { color rgb <1, 0.6, 0> }}

object { Movable_Block translate <10, 0, 0> }
difference {
	object { Movable_Block translate <11, 0, 0> }
	object { Movable_Block scale <1, 1, 5> translate <11, 0, 1> }
}

object { Goal translate <12, 0, 0> }

object { Solid_Block translate <13, 0, 0> pigment { color0 }}
object { Solid_Block translate <14, 0, 0> pigment { color1 }}
object { Solid_Block translate <15, 0, 0> pigment { color2 }}
object { Solid_Block translate <16, 0, 0> pigment { color3 }}
object { Solid_Block translate <17, 0, 0> pigment { color4 }}
object { Solid_Block translate <18, 0, 0> pigment { color5 }}
object { Solid_Block translate <19, 0, 0> pigment { color6 }}
object { Solid_Block translate <20, 0, 0> pigment { color7 }}
object { Solid_Block translate <21, 0, 0> pigment { color8 }}
object { Solid_Block translate <22, 0, 0> pigment { color9 }}
