var program;
var gl;
var shaderDir;
var baseDir;

var baseMesh;
var pieceMesh;

var baseMatrix;
var pieceMatrixes = [];

var baseVao;
var pieceVaos = [];

var baseTexture;
var lightPieceTexture;
var darkPieceTexture;

var nextX = 0;
var nextZ = 0;
var nextColor = LIGHT;

var state = [];

//Parameters for Camera
var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = 0.0;
var angle = 0.0;

var lookRadius = 10.0;

const heightPreview = 5;

function main() {
  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);

  // setup everything else
  var canvas = document.getElementById("c");
  canvas.addEventListener("mousedown", doMouseDown, false);
  canvas.addEventListener("mouseup", doMouseUp, false);
  canvas.addEventListener("mousemove", doMouseMove, false);
  canvas.addEventListener("mousewheel", doMouseWheel, false);

  initializeLights();

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
  var normalAttributeLocation = gl.getAttribLocation(program, "a_normal");
  var pMatrixLocation = gl.getUniformLocation(program, "pMatrix");
  var matrixLocation = gl.getUniformLocation(program, "matrix");
  var textLocation = gl.getUniformLocation(program, "u_texture");
  var eyePositionLocation = gl.getUniformLocation(program, "eyePosition");

  var lightColorALocation = gl.getUniformLocation(program, "lightColorA");
  var lightDirALocation = gl.getUniformLocation(program, "lightDirA");
  var lightOnALocation = gl.getUniformLocation(program, "isLightOnA");

  var lightColorBLocation = gl.getUniformLocation(program, "lightColorB");
  var lightPosBLocation = gl.getUniformLocation(program, "lightPosB");
  var decayBLocation = gl.getUniformLocation(program, "decayB");
  var lightOnBLocation = gl.getUniformLocation(program, "isLightOnB");

  var lightColorCLocation = gl.getUniformLocation(program, "lightColorC");
  var lightDirCLocation = gl.getUniformLocation(program, "lightDirC");
  var lightPosCLocation = gl.getUniformLocation(program, "lightPosC");
  var decayCLocation = gl.getUniformLocation(program, "decayC");
  var coneInCLocation = gl.getUniformLocation(program, "ConeInC");
  var coneOutCLocation = gl.getUniformLocation(program, "ConeOutC");
  var lightOnCLocation = gl.getUniformLocation(program, "isLightOnC");

  var perspectiveMatrix = utils.MakePerspective(
    90,
    gl.canvas.width / gl.canvas.height,
    0.1,
    100.0
  );

  loadTexture("./assets/WoodM1.jpg", true, false);
  loadTexture("./assets/WoodL1.png", false, false);
  loadTexture("./assets/WoodD1.jpg", false, true);

  loadSceneComponent(baseMesh, true);
  const { x, y, z } = convertFromBoardCoordinates(nextX, heightPreview, nextZ);
  loadSceneComponent(pieceMesh, false, x, y, z);
  drawScene();

  function loadTexture(texturePath, isBase = false, isDark = false) {
    // Create a texture.
    var texture = gl.createTexture();
    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // bind to the TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Asynchronously load an image
    var image = new Image();
    image.src = texturePath;
    image.onload = function () {
      //Make sure this is the active one
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

      gl.generateMipmap(gl.TEXTURE_2D);
    };

    if (isBase) {
      baseTexture = texture;
    } else if (isDark) {
      darkPieceTexture = texture;
    } else if (!isDark) {
      lightPieceTexture = texture;
    }
  }

  // to be called on piece addition
  function loadSceneComponent(mesh, isBase = false, tx = 0, ty = 0, tz = 0) {
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(mesh.vertices),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(mesh.vertexNormals),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(normalAttributeLocation);
    gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(mesh.textures),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(uvAttributeLocation);
    gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(mesh.indices),
      gl.STATIC_DRAW
    );

    if (isBase) {
      baseVao = vao;
      baseMatrix = utils.MakeWorld(tx, ty, tz, 0, 0, 0, 1);
    } else {
      pieceVaos.push(vao);
      pieceMatrixes.push(utils.MakeWorld(tx, ty, tz, 0, 0, 0, 1));
    }
  }

  function drawScene() {
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    cz =
      lookRadius *
      Math.cos(utils.degToRad(-angle)) *
      Math.cos(utils.degToRad(-elevation));
    cx =
      lookRadius *
      Math.sin(utils.degToRad(-angle)) *
      Math.cos(utils.degToRad(-elevation));
    cy = lookRadius * Math.sin(utils.degToRad(-elevation));

    var viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);

    //LIGHT A
    gl.uniform3fv(lightDirALocation, lightDirA);
    gl.uniform4fv(lightColorALocation, [...lightColorA, 1.0]);
    gl.uniform1f(lightOnALocation, isLightAOn ? 1.0 : 0.0);

    //LIGHT B
    gl.uniform3fv(lightPosBLocation, lightPosB);
    gl.uniform1f(decayBLocation, lightDecayB);
    gl.uniform4fv(lightColorBLocation, [...lightColorB, 1.0]);
    gl.uniform1f(lightOnBLocation, isLightBOn ? 1.0 : 0.0);

    //LIGHT C
    gl.uniform3fv(lightPosCLocation, lightPosC);
    gl.uniform3fv(lightDirCLocation, lightDirC);
    gl.uniform1f(decayCLocation, lightDecayC);
    gl.uniform1f(coneInCLocation, lightConeInC);
    gl.uniform1f(coneOutCLocation, lightConeOutC);
    gl.uniform4fv(lightColorCLocation, [...lightColorC, 1.0]);
    gl.uniform1f(lightOnCLocation, isLightCOn ? 1.0 : 0.0);

    var baseWorldViewMatrix = utils.multiplyMatrices(viewMatrix, baseMatrix);
    var baseProjectionMatrix = utils.multiplyMatrices(
      perspectiveMatrix,
      baseWorldViewMatrix
    );

    gl.uniformMatrix4fv(
      pMatrixLocation,
      gl.FALSE,
      utils.transposeMatrix(baseProjectionMatrix)
    );

    gl.uniformMatrix4fv(
      matrixLocation,
      gl.FALSE,
      utils.transposeMatrix(baseMatrix)
    );

    gl.uniform3f(eyePositionLocation, cx, cy, cz);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, baseTexture);
    gl.uniform1i(textLocation, 0);

    gl.bindVertexArray(baseVao);
    gl.drawElements(
      gl.TRIANGLES,
      baseMesh.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );

    for (i = 0; i < pieceMatrixes.length; i++) {
      let pieceWorldViewMatrix = utils.multiplyMatrices(
        viewMatrix,
        pieceMatrixes[i]
      );

      let pieceProjectionMatrix = utils.multiplyMatrices(
        perspectiveMatrix,
        pieceWorldViewMatrix
      );

      gl.uniformMatrix4fv(
        pMatrixLocation,
        gl.FALSE,
        utils.transposeMatrix(pieceProjectionMatrix)
      );

      gl.uniformMatrix4fv(
        matrixLocation,
        gl.FALSE,
        utils.transposeMatrix(pieceMatrixes[i])
      );

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(
        gl.TEXTURE_2D,
        i % 2 === 0 ? lightPieceTexture : darkPieceTexture
      );
      gl.uniform1i(textLocation, 0);

      gl.bindVertexArray(pieceVaos[i]);
      gl.drawElements(
        gl.TRIANGLES,
        pieceMesh.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    }

    window.requestAnimationFrame(drawScene);
  }

  function handleInsert() {
    const nextY = calcNextY(nextX, nextZ, state);
    if (nextY >= 4) {
      alert("Wrong move!");
      return;
    }
    unloadLastPieceComponent();
    state.push(new Piece(nextX, nextY, nextZ, nextColor));
    const { x, y, z } = convertFromBoardCoordinates(nextX, nextY, nextZ);
    loadSceneComponent(pieceMesh, false, x, y, z);
    //console.log("XYZ", x, y, z);
    if (checkEndConditions(state)) {
      console.log("WIN");
      return;
    }
    nextX = 0;
    nextZ = 0;
    nextColor = nextColor === DARK ? LIGHT : DARK;
    const {
      x: new_x,
      y: new_y,
      z: new_z,
    } = convertFromBoardCoordinates(nextX, heightPreview, nextZ);
    loadSceneComponent(pieceMesh, false, new_x, new_y, new_z);
  }

  window.addEventListener("keydown", keyFunctionDown);

  function unloadLastPieceComponent() {
    pieceVaos.pop();
    pieceMatrixes.pop();
  }

  function keyFunctionDown(e) {
    switch (e.key) {
      case "ArrowDown":
        nextZ = (nextZ + 1) % 4;
        //console.log("NEXT", nextX, nextZ);
        break;

      case "ArrowUp":
        nextZ = (nextZ - 1) % 4;
        if (nextZ < 0) {
          nextZ = 4 + nextZ;
        }
        //console.log("NEXT", nextX, nextZ);
        break;

      case "ArrowRight":
        nextX = (nextX + 1) % 4;
        //console.log("NEXT", nextX, nextZ);
        break;

      case "ArrowLeft":
        nextX = (nextX - 1) % 4;
        if (nextX < 0) {
          nextX = 4 + nextX;
        }
        //console.log("NEXT", nextX, nextZ);
        break;

      case "Enter":
        //console.log("ENTER", nextX, nextZ);
        handleInsert();
        return;

      default:
        break;
    }
    unloadLastPieceComponent();
    const coordinates = convertFromBoardCoordinates(
      nextX,
      heightPreview,
      nextZ
    );
    loadSceneComponent(
      pieceMesh,
      false,
      coordinates.x,
      coordinates.y,
      coordinates.z
    );
  }
}

async function init() {
  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, "");
  shaderDir = baseDir + "shaders/";

  var canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    document.write("GL context not opened");
    return;
  }

  baseMesh = await utils.loadMesh("./assets/base.obj");
  pieceMesh = await utils.loadMesh("./assets/piece.obj");

  await utils.loadFiles(
    [shaderDir + "vs.glsl", shaderDir + "fs.glsl"],
    function (shaderText) {
      var vertexShader = utils.createShader(
        gl,
        gl.VERTEX_SHADER,
        shaderText[0]
      );
      var fragmentShader = utils.createShader(
        gl,
        gl.FRAGMENT_SHADER,
        shaderText[1]
      );
      program = utils.createProgram(gl, vertexShader, fragmentShader);
    }
  );
  gl.useProgram(program);

  main();
}

// event handler

var mouseState = false;
var lastMouseX = -100,
  lastMouseY = -100;
function doMouseDown(event) {
  lastMouseX = event.pageX;
  lastMouseY = event.pageY;
  mouseState = true;
}
function doMouseUp(event) {
  lastMouseX = -100;
  lastMouseY = -100;
  mouseState = false;
}
function doMouseMove(event) {
  if (mouseState) {
    var dx = event.pageX - lastMouseX;
    var dy = lastMouseY - event.pageY;
    lastMouseX = event.pageX;
    lastMouseY = event.pageY;
    if (dx !== 0 || dy !== 0) {
      angle = angle + 0.5 * dx;
      elevation = elevation + 0.5 * dy;
    }
  }
}
function doMouseWheel(event) {
  var nLookRadius = lookRadius - event.wheelDelta / 1000.0;
  if (nLookRadius > 2.0 && nLookRadius < 20.0) {
    lookRadius = nLookRadius;
  }
}

window.onload = init;
