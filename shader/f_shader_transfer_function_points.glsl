global.F_SHADER_TRANSFER_FUNCTION_POINTS = `#version 300 es
precision highp int;
precision highp float;

in vec4 a_position;
out vec4 outputColor;

void main() {
    outputColor = vec4(0.0, 0.0, 0.0, 0.75);
}

`;
