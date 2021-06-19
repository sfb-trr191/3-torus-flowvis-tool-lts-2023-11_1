var V_SHADER_RAYTRACING = `#version 300 es
precision highp int;
precision highp float;

void main() {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 1280.0;
}
//! [0]

`;
