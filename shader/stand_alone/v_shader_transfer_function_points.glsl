global.V_SHADER_TRANSFER_FUNCTION_POINTS = `#version 300 es
precision highp int;
precision highp float;

uniform float size;

in vec3 a_position;

void main() {
    gl_Position = vec4(a_position, 1);
    gl_PointSize = size;
}

`;
