var F_SHADER_PLACEHOLDER = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform int width;
uniform int height;

out vec4 outputColor;

//! [0]
void main()
{
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    float t_x = float(x) / float(width);
    float t_y = float(y) / float(height);
    outputColor = vec4(t_x,t_y,0,1);
}

`;
