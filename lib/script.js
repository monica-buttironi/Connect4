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

var test = 1;

//Parameters for Camera
var cx = 4.5;
var cy = 0.0;
var cz = 10.0;
var elevation = 0.0;
var angle = 0.0;

// var vy = 0;
// var vx = 0;

var lookRadius = 10.0;

//var q = Quaternion.fromEuler(0.0, angle, elevation, "ZXY");

var piecesOnBase;

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

  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var uvAttributeLocation = gl.getAttribLocation(program, "a_uv");
  var matrixLocation = gl.getUniformLocation(program, "matrix");
  var textLocation = gl.getUniformLocation(program, "u_texture");
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
  // loadSceneComponent(pieceMesh, false, 3, 1, 3);
  // loadSceneComponent(pieceMesh, false, 1, 1, 3);
  // loadSceneComponent(pieceMesh, false, -1, 1, 3);
  // loadSceneComponent(pieceMesh, false, 3, 2, 3);
  // loadSceneComponent(pieceMesh, false, 1, 2, 3);
  // loadSceneComponent(pieceMesh, false, -1, 2, 3);
  drawScene();
  //drawScene([pieceMesh], [texturePiece], [vaoPiece]);

  // function animate() {
  //   // if(lastUpdateTime){
  //   //   var deltaC = (30 * (currentTime - lastUpdateTime)) / 1000.0;
  //   //   cubeRx += deltaC;
  //   //   cubeRy -= deltaC;
  //   //   cubeRz += deltaC;
  //   // }
  //   worldMatrix = utils.MakeWorld(-3.0, 1.0, -10, 30.0, 30.0, 30.0, 1.0);
  // }

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

    if(isBase) {
      baseTexture = texture;
    } else if(isDark) {
      darkPieceTexture = texture;
    } else if(!isDark) {
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

    if(isBase) {
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

    cz = lookRadius * Math.cos(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    cx = lookRadius * Math.sin(utils.degToRad(-angle)) * Math.cos(utils.degToRad(-elevation));
    cy = lookRadius * Math.sin(utils.degToRad(-elevation));

    var viewMatrix = utils.MakeView(cx, cy, cz, elevation, angle);
    
    var baseWorldViewMatrix = utils.multiplyMatrices(
      viewMatrix,
      baseMatrix
    )
    var baseProjectionMatrix = utils.multiplyMatrices(
      perspectiveMatrix,
      baseWorldViewMatrix
    )

    //projectionMatrix = utils.multiplyMatrices(perspectiveMatrix, viewMatrix);

    gl.uniformMatrix4fv(
      matrixLocation,
      gl.FALSE,
      utils.transposeMatrix(baseProjectionMatrix)
    );

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

    for(i=0; i<pieceMatrixes.length; i++) {
      let pieceWorldViewMatrix = utils.multiplyMatrices(
        viewMatrix,
        pieceMatrixes[i]
      )

      let pieceProjectionMatrix = utils.multiplyMatrices(
        perspectiveMatrix,
        pieceWorldViewMatrix
      )

      gl.uniformMatrix4fv(
        matrixLocation,
        gl.FALSE,
        utils.transposeMatrix(pieceProjectionMatrix)
      );
  
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, i % 2 === 0 ? lightPieceTexture : darkPieceTexture);
      gl.uniform1i(textLocation, 0);
  
      gl.bindVertexArray(pieceVaos[i]);
      gl.drawElements(
        gl.TRIANGLES,
        pieceMesh.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );
    }

    // for (i = 0; i < textures.length; i++) {
    //   gl.activeTexture(gl.TEXTURE0);
    //   gl.bindTexture(gl.TEXTURE_2D, textures[i]);
    //   gl.uniform1i(textLocation, 0);

    //   gl.bindVertexArray(vaos[i]);
    //   gl.drawElements(
    //     gl.TRIANGLES,
    //     meshes[i].indices.length,
    //     gl.UNSIGNED_SHORT,
    //     0
    //   );
    // }

    window.requestAnimationFrame(drawScene);
  }

  window.addEventListener("keydown", keyFunctionDown);

  function keyFunctionDown(e) {
    switch (e.key) {

      case "ArrowUp":
        loadSceneComponent(pieceMesh, false, 3, test, 3);
        test++;
        break;

      // case "ArrowDown":
      //   vy -= 0.1;
      //   break;

      // case "ArrowRight":
      //   vx -= 0.1;
      //   break;

      // case "ArrowLeft":
      //   vx += 0.1;
      //   break;

      default:
        break;
    }
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
var lastMouseX = -100, lastMouseY = -100;
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
  if(mouseState) {
    var dx = event.pageX - lastMouseX;
    var dy = lastMouseY - event.pageY;
    lastMouseX = event.pageX;
    lastMouseY = event.pageY;
    if((dx !== 0) || (dy !== 0)) {
      angle = angle + 0.5 * dx;
      elevation = elevation + 0.5 * dy;
    }
  }
}
function doMouseWheel(event) {
  var nLookRadius = lookRadius - event.wheelDelta/1000.0;
  if((nLookRadius > 2.0) && (nLookRadius < 20.0)) {
    lookRadius = nLookRadius;
  }
}

window.onload = init;
