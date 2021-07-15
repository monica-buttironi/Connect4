#version 300 es

precision mediump float;

in vec2 uvFS;
in vec3 fsPosition;
in vec3 fsNormal;
out vec4 outColor;
uniform sampler2D u_texture;
uniform vec3 eyePosition;

float SpecShine = 10.0;		// specular coefficient for both Blinn and Phong

vec4 diffColor = vec4(0.53, 0.31, 0.13, 1.0);		// diffuse color
vec4 ambColor = vec4(0.33, 0.33, 0.33, 1.0);		// material ambient color
vec4 specularColor = vec4(0.76, 0.57, 0.41, 1.0);		// specular color

// Lighr directions can be found into:
uniform vec3 lightDirA;
uniform vec3 lightPosB;
uniform vec3 lightDirC;
uniform vec3 lightPosC;
//
//and intensity is returned into:
//
uniform vec4 lightColorA;
uniform vec4 lightColorB;
uniform vec4 lightColorC;
//
// Ambient light contribution can be found intop
//
vec4 ambientLight = vec4(1.0, 1.0, 1.0, 0.1);

// light decays
uniform float decayB;
uniform float decayC;

// cones
uniform float ConeInC;
uniform float ConeOutC;

// on off
uniform float isLightOnA;
uniform float isLightOnB;
uniform float isLightOnC;

float Target = 4.0;

void main() {
  vec3 nEyeDirection = normalize(eyePosition - fsPosition);
  // direct
  vec3 nLightDirectionA = normalize(lightDirA);
  // point
  vec3 nLightDirectionB = normalize(lightPosB - fsPosition);
  // spot
  vec3 nLightDirectionC = normalize(lightPosC - fsPosition);
  
  vec3 nNormal = normalize(fsNormal);

  // direct
  vec4 LAcontr = isLightOnA * (clamp(dot(nLightDirectionA, nNormal),0.0,1.0) * lightColorA);
  // spot
  vec4 LBcontr = isLightOnB * pow((Target / length(lightPosB - fsPosition)), decayB) * lightColorB * clamp(dot(nLightDirectionB, nNormal),0.0,1.0);
  // point
  float cosa = dot(nLightDirectionC, lightDirC);
	float cout = cos(radians(ConeOutC/2.0));
	float cin = cos(radians(ConeInC * ConeOutC/2.0));
	float res = (cosa - cout)/(cin - cout);
  vec4 LCcontr = isLightOnC * lightColorC * pow((Target / length(lightPosC - fsPosition)), decayC) * clamp(res, 0.0, 1.0) * clamp(dot(nLightDirectionC, nNormal),0.0,1.0);
  
  vec4 SpecA = isLightOnA * specularColor * pow(clamp(dot(nEyeDirection, -reflect(nLightDirectionA, nNormal )), 0.0, 1.0), SpecShine) * lightColorA;
  vec4 SpecB = isLightOnB * specularColor * pow(clamp(dot(nEyeDirection, -reflect(nLightDirectionB, nNormal )), 0.0, 1.0), SpecShine) * pow((Target / length(lightPosB - fsPosition)), decayB) * lightColorB;
  vec4 SpecC = isLightOnC * specularColor * pow(clamp(dot(nEyeDirection, -reflect(nLightDirectionC, nNormal )), 0.0, 1.0), SpecShine) * lightColorC * pow((Target / length(lightPosC - fsPosition)), decayC) * clamp(res, 0.0, 1.0);

  outColor = vec4(clamp(diffColor * (LAcontr + LBcontr + LCcontr) + SpecA + SpecB + SpecC + ambientLight * ambColor, 0.0, 1.0).rgb, 1.0) * texture(u_texture, uvFS);
  //outColor = texture(u_texture, uvFS);
}