global.F_SHADER_COPY = `#version 300 es
precision highp int;
precision highp float;

uniform int width;
uniform int height;

uniform sampler2D texture1;//texture to be copied

out vec4 outputColor;

//! [0]
void main()
{
    vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), (gl_FragCoord[1]/float(height)));
    outputColor = texture(texture1, v_texcoord);
}
//! [0]

`;