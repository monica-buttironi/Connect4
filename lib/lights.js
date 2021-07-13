// Light A directional
var isLightAOn;
var lightDirPhiA;
var lightDirThetaA;
var lightColorA;

var lightDirA;

// Light B point
var isLightBOn;
var lightPosXB;
var lightPosYB;
var lightPosZB;
var lightDecayB;
var lightColorB;

var lightPosB;

// Light C spot
var isLightCOn;
var lightDirPhiC;
var lightDirThetaC;
var lightPosXC;
var lightPosYC;
var lightPosZC;
var lightConeInC;
var lightConeOutC;
var lightDecayC;
var lightColorC;

var lightDirC;
var lightPosC;

function initializeLights() {
  lightPosB = [0.0, 0.0, 0.0];
  lightPosC = [0.0, 0.0, 0.0];

  // A
  var isLightAOnInput = document.getElementById("isLightAOn");
  isLightAOn = isLightAOnInput.checked;
  isLightAOnInput.addEventListener("change", (e) => {
    isLightAOn = e.target.checked;
  });

  var lightDirPhiAInput = document.getElementById("lightDirPhiA");
  lightDirPhiA = lightDirPhiAInput.value;
  document.getElementById("phiA").innerText = lightDirPhiA + "°";
  lightDirA = fromSphericalToCartesian(0, lightDirPhiA);
  lightDirPhiAInput.addEventListener("change", (e) => {
    lightDirPhiA = e.target.value;
    document.getElementById("phiA").innerText = lightDirPhiA + "°";
    lightDirA = fromSphericalToCartesian(lightDirThetaA, lightDirPhiA);
  });

  var lightDirThetaAInput = document.getElementById("lightDirThetaA");
  lightDirThetaA = lightDirThetaAInput.value;
  document.getElementById("thetaA").innerText = lightDirThetaA + "°";
  lightDirA = fromSphericalToCartesian(lightDirThetaA, lightDirPhiA);
  lightDirThetaAInput.addEventListener("change", (e) => {
    lightDirThetaA = e.target.value;
    document.getElementById("thetaA").innerText = lightDirThetaA + "°";
    lightDirA = fromSphericalToCartesian(lightDirThetaA, lightDirPhiA);
  });

  var lightColorAInput = document.getElementById("lightColorA");
  lightColorA = fromHexToRGBVec(lightColorAInput.value);
  lightColorAInput.addEventListener("change", (e) => {
    lightColorA = fromHexToRGBVec(e.target.value);
  });

  //B
  var isLightBOnInput = document.getElementById("isLightBOn");
  isLightBOn = isLightBOnInput.checked;
  isLightBOnInput.addEventListener("change", (e) => {
    isLightBOn = e.target.checked;
  });

  var lightPosXBInput = document.getElementById("lightPosXB");
  lightPosXB = lightPosXBInput.value / 10;
  document.getElementById("posXB").innerText = lightPosXB;
  lightPosB[0] = lightPosXB;
  lightPosXBInput.addEventListener("change", (e) => {
    lightPosXB = e.target.value / 10;
    document.getElementById("posXB").innerText = lightPosXB;
    lightPosB[0] = lightPosXB;
  });

  var lightPosYBInput = document.getElementById("lightPosYB");
  lightPosYB = lightPosYBInput.value / 10;
  document.getElementById("posYB").innerText = lightPosYB;
  lightPosB[1] = lightPosYB;
  lightPosYBInput.addEventListener("change", (e) => {
    lightPosYB = e.target.value / 10;
    document.getElementById("posYB").innerText = lightPosYB;
    lightPosB[1] = lightPosYB;
  });

  var lightPosZBInput = document.getElementById("lightPosZB");
  lightPosZB = lightPosZBInput.value / 10;
  document.getElementById("posZB").innerText = lightPosZB;
  lightPosB[2] = lightPosZB;
  lightPosZBInput.addEventListener("change", (e) => {
    lightPosZB = e.target.value / 10;
    document.getElementById("posZB").innerText = lightPosZB;
    lightPosB[2] = lightPosZB;
  });

  var lightDecayBInput = document.getElementById("lightDecayB");
  lightDecayB = lightDecayBInput.value;
  document.getElementById("decayB").innerText = lightDecayB;
  lightDecayBInput.addEventListener("change", (e) => {
    lightDecayB = e.target.value;
    document.getElementById("decayB").innerText = lightDecayB;
  });

  var lightColorBInput = document.getElementById("lightColorB");
  lightColorB = fromHexToRGBVec(lightColorBInput.value);
  lightColorBInput.addEventListener("change", (e) => {
    lightColorB = fromHexToRGBVec(e.target.value);
  });

  // C
  var isLightCOnInput = document.getElementById("isLightCOn");
  isLightCOn = isLightCOnInput.checked;
  isLightCOnInput.addEventListener("change", (e) => {
    isLightCOn = e.target.checked;
  });

  var lightDirPhiCInput = document.getElementById("lightDirPhiC");
  lightDirPhiC = lightDirPhiCInput.value;
  document.getElementById("phiC").innerText = lightDirPhiC + "°";
  lightDirC = fromSphericalToCartesian(0, lightDirPhiC);
  lightDirPhiCInput.addEventListener("change", (e) => {
    lightDirPhiC = e.target.value;
    document.getElementById("phiC").innerText = lightDirPhiC + "°";
    lightDirC = fromSphericalToCartesian(lightDirThetaC, lightDirPhiC);
  });

  var lightDirThetaCInput = document.getElementById("lightDirThetaC");
  lightDirThetaC = lightDirThetaCInput.value;
  document.getElementById("thetaC").innerText = lightDirThetaC + "°";
  lightDirC = fromSphericalToCartesian(lightDirThetaC, lightDirPhiC);
  lightDirThetaCInput.addEventListener("change", (e) => {
    lightDirThetaC = e.target.value;
    document.getElementById("thetaC").innerText = lightDirThetaC + "°";
    lightDirC = fromSphericalToCartesian(lightDirThetaC, lightDirPhiC);
  });

  var lightPosXCInput = document.getElementById("lightPosXC");
  lightPosXC = lightPosXCInput.value / 10;
  document.getElementById("posXC").innerText = lightPosXC;
  lightPosC[0] = lightPosXC;
  lightPosXCInput.addEventListener("change", (e) => {
    lightPosXC = e.target.value / 10;
    document.getElementById("posXC").innerText = lightPosXC;
    lightPosC[0] = lightPosXC;
  });

  var lightPosYCInput = document.getElementById("lightPosYC");
  lightPosYC = lightPosYCInput.value / 10;
  document.getElementById("posYC").innerText = lightPosYC;
  lightPosC[1] = lightPosYC;
  lightPosYCInput.addEventListener("change", (e) => {
    lightPosYC = e.target.value / 10;
    document.getElementById("posYC").innerText = lightPosYC;
    lightPosC[1] = lightPosYC;
  });

  var lightPosZCInput = document.getElementById("lightPosZC");
  lightPosZC = lightPosZCInput.value / 10;
  document.getElementById("posZC").innerText = lightPosZC;
  lightPosC[2] = lightPosZC;
  lightPosZCInput.addEventListener("change", (e) => {
    lightPosZC = e.target.value / 10;
    document.getElementById("posZC").innerText = lightPosZC;
    lightPosC[2] = lightPosZC;
  });

  var lightDecayCInput = document.getElementById("lightDecayC");
  lightDecayC = lightDecayCInput.value;
  document.getElementById("decayC").innerText = lightDecayC;
  lightDecayCInput.addEventListener("change", (e) => {
    lightDecayC = e.target.value;
    document.getElementById("decayC").innerText = lightDecayC;
  });

  var lightConeInCInput = document.getElementById("lightConeInC");
  lightConeInC = (lightConeInCInput.value / 100).toFixed(2);
  document.getElementById("coneInC").innerText = lightConeInC * 100 + "%";
  lightConeInCInput.addEventListener("change", (e) => {
    lightConeInC = (e.target.value / 100).toFixed(2);
    document.getElementById("coneInC").innerText = lightConeInC * 100 + "%";
  });

  var lightConeOutCInput = document.getElementById("lightConeOutC");
  lightConeOutC = lightConeOutCInput.value;
  document.getElementById("coneOutC").innerText = lightConeOutC;
  lightConeOutCInput.addEventListener("change", (e) => {
    lightConeOutC = e.target.value;
    document.getElementById("coneOutC").innerText = lightConeOutC;
  });

  var lightColorCInput = document.getElementById("lightColorC");
  lightColorC = fromHexToRGBVec(lightColorCInput.value);
  lightColorCInput.addEventListener("change", (e) => {
    lightColorC = fromHexToRGBVec(e.target.value);
  });
}

function fromSphericalToCartesian(theta, phi) {
  //	dx = Math.sin(t)*Math.sin(p);
  //	dy = Math.cos(t);
  //	dz = Math.sin(t)*Math.cos(p);
  return [
    Math.sin(utils.degToRad(theta)) * Math.sin(utils.degToRad(phi)),
    Math.cos(utils.degToRad(theta)),
    Math.sin(utils.degToRad(theta)) * Math.cos(utils.degToRad(phi)),
  ];
}

function fromHexToRGBVec(hex) {
  col = hex.substring(1, 7);
  R = parseInt(col.substring(0, 2), 16) / 255;
  G = parseInt(col.substring(2, 4), 16) / 255;
  B = parseInt(col.substring(4, 6), 16) / 255;
  return [R, G, B];
}
