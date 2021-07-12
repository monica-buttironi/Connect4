#version 300 es

precision mediump float;

in vec2 uvFS;
in vec3 fsPosition;
in vec3 fsNormal;
out vec4 outColor;
uniform sampler2D u_texture;
uniform vec3 eyePosition;

float SpecShine = 0.5;		// specular coefficient for both Blinn and Phong

vec4 diffColor = vec4(0.53, 0.31, 0.13, 1.0);		// diffuse color
vec4 ambColor = vec4(0.33, 0.33, 0.33, 1.0);		// material ambient color
vec4 specularColor = vec4(0.76, 0.57, 0.41, 1.0);		// specular color

// Lighr directions can be found into:
vec3 lightDirA = vec3(1.0, 0.0, 0.0);
vec3 lightDirB = vec3(0.0, 1.0, 0.0);
vec3 lightDirC = vec3(0.0, 0.0, 1.0);
//
//and intensity is returned into:
//
vec4 lightColorA = vec4(0.9, 0.0, 0.0, 0.3);
vec4 lightColorB = vec4(0.0, 0.9, 0.0, 0.3);
vec4 lightColorC = vec4(0.0, 0.0, 0.9, 0.3);
//
// Ambient light contribution can be found intop
//
vec4 ambientLight = vec4(0.9, 0.0, 0.0, 0.3);

void main() {
  vec3 nEyeDirection = normalize(eyePosition - fsPosition);
  vec3 nLightDirectionA = normalize(-lightDirA);
  vec3 nLightDirectionB = normalize(-lightDirB);
  vec3 nLightDirectionC = normalize(-lightDirC);
  vec3 nNormal = normalize(fsNormal);

  vec4 LAcontr = clamp(dot(lightDirA, nNormal),0.0,1.0) * lightColorA;
  vec4 LBcontr = clamp(dot(lightDirB, nNormal),0.0,1.0) * lightColorB;
  vec4 LCcontr = clamp(dot(lightDirC, nNormal),0.0,1.0) * lightColorC;
  vec4 SpecA = specularColor * pow(clamp(dot(nEyeDirection, -reflect(nLightDirectionA, nNormal )), 0.0, 1.0), SpecShine) * lightColorA;
  vec4 SpecB = specularColor * pow(clamp(dot(nEyeDirection, -reflect(nLightDirectionB, nNormal )), 0.0, 1.0), SpecShine) * lightColorB;
  vec4 SpecC = specularColor * pow(clamp(dot(nEyeDirection, -reflect(nLightDirectionC, nNormal )), 0.0, 1.0), SpecShine) * lightColorC;

  outColor = clamp(diffColor * (LAcontr + LBcontr + LCcontr) + SpecA + SpecB + SpecC + ambientLight * ambColor, 0.0, 1.0) * texture(u_texture, uvFS);
  //outColor = texture(u_texture, uvFS);
}