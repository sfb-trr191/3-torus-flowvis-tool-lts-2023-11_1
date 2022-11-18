global.V_SHADER_RAYTRACING = `#version 300 es
precision highp int;
precision highp float;

in vec4 a_position;

void main() {
    gl_Position = a_position;
}

`;
