global.F_SHADER_TRANSFER_FUNCTION_POINTS = `#version 300 es
precision highp int;
precision highp float;

uniform int type;

in vec4 a_position;
out vec4 outputColor;

void main() {
    if(type == 0){
        outputColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
    else if(type == 1){
        outputColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    else{
        outputColor = vec4(0.0, 1.0, 0.0, 1.0);
    }
}

`;
