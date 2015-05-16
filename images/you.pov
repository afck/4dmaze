#include "4dmaze.inc"

camera {
	orthographic
	location <0.5, 0.5, -5>
	up <0, 1, 0>
	right <1, 0, 0>
}

#declare Eye=union {
	sphere {
		<0, 0, 0>, 1
		pigment { rgb <0.9, 0.95, 1> }
		finish { Shiny_Finish }
		scale <1/6, 1/6, 1/18>
		translate <0, 0, -0.5>
	}
	sphere {
		<0, 0, 0>, 1
		pigment { rgb <0, 0, 0.3> }
		finish { Shiny_Finish }
		scale <1/18, 1/18, 1/54>
		translate <1/12, -1/12, -0.54>
	}
}

sphere {
	<1/2, 1/2, 0>, 1/2
	pigment { rgb <1, 0.9, 0> }
	finish { Standard_Finish }
}
object { Eye rotate <25, 25, 0> translate <1/2, 1/2, 0> }
object { Eye scale <-1, 1, 1> rotate <25, -25, 0> translate <1/2, 1/2, 0> }
sphere {
	<1/2, 1/2, -1/2-1/10>, 1/10
	pigment { rgb <1, 0, 0> }
	finish { Standard_Finish }
}
sphere {
	<0, 0, 0>, 1/2
	pigment { rgb <0, 0, 0.3> }
	finish { Standard_Finish }
	scale <3/4, 3/4, 1/54>
	translate <1/2, 1/2-1/14, -1/3>
}