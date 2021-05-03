#version 100
#ifdef GL_ES
precision mediump int;
precision mediump float;
#endif
void main() {
	float i = gl_FragCoord[0];//x
	float j = gl_FragCoord[1];//y
	gl_FragColor = vec4(i/float(800), j/float(600), 0, 1);		   
}