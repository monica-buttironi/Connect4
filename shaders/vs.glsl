#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;
out vec2 uvFS;
out vec3 fsPosition;
out vec3 fsNormal;

uniform mat4 matrix;
uniform mat4 pMatrix;

void main() {
  uvFS = a_uv;
  fsPosition = (matrix * vec4(a_position,1.0)).xyz;
  fsNormal = mat3(matrix) * a_normal; // we use world matrix because not non-uniform scaling
  gl_Position = pMatrix * vec4(a_position,1.0);
}