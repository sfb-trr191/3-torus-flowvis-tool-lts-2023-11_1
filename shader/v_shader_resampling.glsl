var V_SHADER_RESAMPLING = `#version 300 es
precision highp int;
precision highp float;

attribute vec4 a_position;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

//! [0]
void main()
{
    // Pass through normalized device coordinates
    gl_Position = a_position;
    v_texcoord = a_texcoord;
}
//! [0]

`;
