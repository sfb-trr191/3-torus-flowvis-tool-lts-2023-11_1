var F_SHADER_SUM = `#version 300 es
precision highp int;
precision highp float;

uniform int width;
uniform int height;
uniform int aliasing_index;

uniform sampler2D texture1;//input of last frame
uniform sampler2D texture2;//sum old

out vec4 outputColor;//sum new

//! [0]
void main()
{
    vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), (gl_FragCoord[1]/float(height)));
    if(aliasing_index == 0)
        outputColor = texture(texture1, v_texcoord);//only use new frame
    else
        outputColor = texture(texture1, v_texcoord) + texture(texture2, v_texcoord);//combine new frame with old frames
}
//! [0]

`;
