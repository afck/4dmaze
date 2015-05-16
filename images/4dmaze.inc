light_source {
	<-30, 50, -100>
	color rgb <1, 1, 1>
}

#declare Standard_Finish=finish {
	ambient 0.3
	diffuse 0.8
}

#declare Shiny_Finish=finish {
	ambient 0.2
	diffuse 1
	phong 1
}

#declare Switch_Red=pigment {
	spotted
	color_map {
		[0 rgb <1, 0, 0.2>]
		[1 rgb <0.5, 0, 0>]
	}
	scale 0.1
}

#declare Switch_Green=pigment {
	spotted
	color_map {
		[0 rgb <0.2, 1, 0>]
		[1 rgb <0, 0.5, 0>]
	}
	scale 0.1
}

#declare color0=color rgb <1, 0, 0>;
#declare color1=color rgb <1, 1/3, 0>;
#declare color2=color rgb <1, 2/3, 0>;
#declare color3=color rgb <1, 1, 0>;
#declare color4=color rgb <1/2, 1, 0>;
#declare color5=color rgb <0, 1, 0>;
#declare color6=color rgb <0, 1, 1>;
#declare color7=color rgb <0, 1/2, 1>;
#declare color8=color rgb <0, 0, 1>;
#declare color9=color rgb <1, 0, 1>;

#declare Gold_Spheres=union {
	sphere { <0.1, 0.1, 0>, 0.1 }
	sphere { <0.9, 0.1, 0>, 0.1 }
	sphere { <0.1, 0.9, 0>, 0.1 }
	sphere { <0.9, 0.9, 0>, 0.1 }
	pigment { color rgb <1, 0.8, 0> }
	finish { Shiny_Finish }
}

#declare Gold_Cylinders=union {
	object { Gold_Spheres }
	cylinder { <0.1, 0.1, 0>, <0.9, 0.1, 0>, 0.1 open }
	cylinder { <0.9, 0.1, 0>, <0.9, 0.9, 0>, 0.1 open }
	cylinder { <0.9, 0.9, 0>, <0.1, 0.9, 0>, 0.1 open }
	cylinder { <0.1, 0.9, 0>, <0.1, 0.1, 0>, 0.1 open }
	pigment { color rgb <1, 0.8, 0> }
	finish { Shiny_Finish }
}

#declare Floor_Box=box {
	<0, 0, 0>, <1, 1, 1>
	finish { Standard_Finish }
}

#declare Circle=sphere {
	<0.5, 0.5, 0>, 0.5
	scale <1, 1, 0.00001>
	finish { Standard_Finish }
}

#declare Yin_Yang=union {
	difference {
		object { Circle translate <0, 0, 0> pigment { Switch_Red }}
		object { Floor_Box translate <0, 0.5, -0.001> }
	}
	object { Circle translate <0, 0, 0.0001> pigment { Switch_Green }}
	object { Circle scale 0.5 translate <0, 0.25, -0.0001> pigment { Switch_Green }}
	object { Circle scale 0.5 translate <0.5, 0.25, -0.0001> pigment { Switch_Red }}
	object { Circle scale 0.25 translate <0.625, 0.375, -0.0002> pigment { Switch_Green }}
	object { Circle scale 0.25 translate <0.125, 0.375, -0.0002> pigment { Switch_Red }}
}

#declare Key=union {
	cylinder { <1/11, 0.5, 0>, <7/11, 0.5, 0>, 1/11 }
	cylinder { <1/11, 0.5, 0>, <1/11, 1/11, 0>, 1/11 }
	cylinder { <4/11, 0.5, 0>, <4/11, 1/11, 0>, 1/11 }
	sphere { <1/11, 0.5, 0>, 1/11 }
	sphere { <1/11, 1/11, 0>, 1/11 }
	sphere { <4/11, 1/11, 0>, 1/11 }
	torus { 1.5/11, 1/11 rotate <90, 0, 0> scale <1, 11/5, 1> translate <8.5/11, 0.5, 0> }
	finish { Shiny_Finish }
}

#declare Keyhole=difference {
	superellipsoid { <0.3, 0.3> scale 0.5 translate <0.5, 0.5> }
	cylinder { <0.5, 5.5/8, -1>, <0.5, 5.5/8, 1>, 1.5/8 }
	box { <3/8, 1.5/8, -1>, <5/8, 5.5/8, 1> }
	finish { Shiny_Finish }
}

#declare Movable_Block=superellipsoid {
	<1.8, 1.8>
	scale 0.5
	translate <0.5, 0.5, -0.5>
	pigment { color rgb <0.5, 0.7, 1> }
	finish { Shiny_Finish }
}

#declare Solid_Block=superellipsoid {
	<0.3, 0.3>
	scale 0.5
	translate <0.5, 0.5, -0.5>
	normal { bumps 0.3 scale 0.06 }
	finish { Standard_Finish }
}

#declare Goal=sphere {
	<0.5, 0.5, -0.5>, 0.5
	pigment {
		wood
		color_map {
			[0 rgb <1, 0, 0>]
			[1/6 rgb <1, 1, 0>]
			[2/6 rgb <0, 1, 0>]
			[3/6 rgb <0, 1, 1>]
			[4/6 rgb <0, 0, 1>]
			[5/6 rgb <1, 0, 1>]
		}
	}
	finish { Shiny_Finish }
}
