global.F_SHADER_COMPARE = `#version 300 es
precision highp int;
precision highp float;

uniform int width;
uniform int height;

uniform sampler2D texture1;//input of render_texture
uniform sampler2D texture2;//input of render_texture_alternative

out vec4 outputColor;//average new

//! [0]
void main()
{
    vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), (gl_FragCoord[1]/float(height)));
    float z_1 = texture(texture1, v_texcoord).w;
    float z_2 = texture(texture2, v_texcoord).w;
    float z_diff = abs(z_2 - z_1);
    outputColor = vec4(z_diff, 1, 1, 1);//combine new frame with old frames
    /*
    //TEST:
    if(v_texcoord.x > 0.5){
        outputColor = vec4(1, 1, 1, 1);//combine new frame with old frames
    }
    */
}
//! [0]

`;