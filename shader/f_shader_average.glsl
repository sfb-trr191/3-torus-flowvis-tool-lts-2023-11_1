global.F_SHADER_AVERAGE = `#version 300 es
precision highp int;
precision highp float;

uniform int width;
uniform int height;
uniform int aliasing_index;

uniform sampler2D texture1;//input of last frame
uniform sampler2D texture2;//average old

out vec4 outputColor;//average new

//! [0]
void main()
{
    vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), (gl_FragCoord[1]/float(height)));
    if(aliasing_index == 0)
        outputColor = texture(texture1, v_texcoord);//only use new frame
    else{
        vec3 col_new_frame = texture(texture1, v_texcoord).xyz;
        vec3 col_average_old = texture(texture2, v_texcoord).xyz;
        float count_old = float(aliasing_index);
        float count_new = count_old + 1.0;
        vec3 col_sum_old = col_average_old * count_old;
        vec3 col_sum_new = col_sum_old + col_new_frame;
        vec3 col_average_new = col_sum_new / count_new;
        outputColor = vec4(col_average_new, 1);//combine new frame with old frames
    }
}
//! [0]

`;