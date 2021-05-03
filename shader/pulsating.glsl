var SHADER_PULSATING = `#version 300 es
precision mediump int;
precision mediump float;
precision mediump sampler3D;

uniform float color_r;
uniform sampler3D texture_0;
out vec4 outputColor;

vec4 getTestColor(int x, int y, int z);

void main() {
	float i = gl_FragCoord[0];//x
	float j = gl_FragCoord[1];//y
	//gl_FragColor = vec4(i/float(800), j/float(600), 0, 1);		
	outputColor = vec4(color_r, 0, 0, 1);	   

  if (int(i) < 100)
  {
    if(int(j) < 100)
      outputColor = getTestColor(0,0,0); 
    else if (int(j) < 200)
      outputColor = getTestColor(4,0,0); 
    else if (int(j) < 300)
      outputColor = getTestColor(8,0,0);
    else if (int(j) < 400)
      outputColor = getTestColor(12,0,0);
    else if (int(j) < 500)
      outputColor = getTestColor(0,1,0);
    else
      outputColor = getTestColor(0,0,1);
  }
}

vec4 getTestColor(int x, int y, int z)
{
  float value_r = texelFetch(texture_0, ivec3(x+0,y,z), 0).r;
  float value_g = texelFetch(texture_0, ivec3(x+1,y,z), 0).r;
  float value_b = texelFetch(texture_0, ivec3(x+2,y,z), 0).r;
  return vec4(value_r, value_g, value_b, 1.0);
}
`;