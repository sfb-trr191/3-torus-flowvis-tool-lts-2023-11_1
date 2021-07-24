global.V_SHADER_TRANSFER_FUNCTION_POINTS = `#version 300 es
precision highp int;
precision highp float;

in vec3 a_position;

void main() {
    gl_Position = vec4(a_position, 1);
    gl_PointSize = 8.0;
}

`;
