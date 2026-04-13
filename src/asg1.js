//Sett Paing Htin
//shtin@ucsc.edu

// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

// UI Global States
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedType = 'POINT';
let g_selectedSegments = 10;

// The array to store our shape objects
let g_shapesList = [];
let g_showPicture = false;

function setupWebGL() {
  canvas = document.getElementById('webgl');
  // Initialize GL context with preserveDrawingBuffer to prevent clearing/lag
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function addActionsForHtmlUI() {
  // Button Events
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; g_showPicture = false; renderAllShapes(); };
  document.getElementById('pointButton').onclick = function() { g_selectedType = 'POINT'; };
  document.getElementById('triangleButton').onclick = function() { g_selectedType = 'TRIANGLE'; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = 'CIRCLE'; };
  document.getElementById('pictureButton').onclick = function() { 
    g_showPicture = true; 
    renderAllShapes(); 
  };

  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });

  document.getElementById('alphaSlide').addEventListener('mouseup', function() { 
    g_selectedColor[3] = this.value / 100; 
  });

  // Size and Segment Sliders
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = this.value; });
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register function to be called on a mouse press and drag
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev); } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev) {
  // Extract the event coordinate and convert to WebGL canvas space
  let [x, y] = convertCoordinatesEventToGL(ev);

  // Create the selected shape
  let shape;
  if (g_selectedType == 'POINT') {
    shape = new Point();
  } else if (g_selectedType == 'TRIANGLE') {
    shape = new Triangle();
  } else if (g_selectedType == 'CIRCLE') {
    shape = new Circle();
    shape.segments = g_selectedSegments;
  }

  shape.position = [x, y];
  shape.color = g_selectedColor.slice(); // Copy array
  shape.size = g_selectedSize;

  g_shapesList.push(shape);
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [x, y];
}

function renderAllShapes() {

  gl.clear(gl.COLOR_BUFFER_BIT);

  if (g_showPicture) {
    drawMyPicture();
  }

  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function drawMyPicture() {
  gl.uniform4f(u_FragColor, 0.2, 0.8, 0.2, 1.0);
  drawTriangle([-1.0, -0.6, 1.0, -0.6, -1.0, -1.0]);
  gl.uniform4f(u_FragColor, 0.15, 0.75, 0.15, 1.0);
  drawTriangle([1.0, -0.6, 1.0, -1.0, -1.0, -1.0]);

  gl.uniform4f(u_FragColor, 0.9, 0.8, 0.6, 1.0);
  drawTriangle([-0.6, 0.2, 0.6, 0.2, -0.6, -0.6]);
  gl.uniform4f(u_FragColor, 0.85, 0.75, 0.55, 1.0);
  drawTriangle([0.6, 0.2, 0.6, -0.6, -0.6, -0.6]);

  gl.uniform4f(u_FragColor, 0.3, 0.3, 0.3, 1.0);
  drawTriangle([0.4, 0.8, 0.55, 0.8, 0.4, 0.4]);
  gl.uniform4f(u_FragColor, 0.25, 0.25, 0.25, 1.0);
  drawTriangle([0.55, 0.8, 0.55, 0.4, 0.4, 0.4]);

  gl.uniform4f(u_FragColor, 1.0, 0.1, 0.1, 1.0);
  drawTriangle([-0.7, 0.2, 0.0, 0.2, 0.0, 0.7]);
  gl.uniform4f(u_FragColor, 0.4, 0.0, 0.0, 1.0);
  drawTriangle([0.0, 0.2, 0.7, 0.2, 0.0, 0.7]);

  gl.uniform4f(u_FragColor, 0.4, 0.2, 0.1, 1.0);
  drawTriangle([-0.15, -0.1, 0.15, -0.1, -0.15, -0.6]);
  gl.uniform4f(u_FragColor, 0.35, 0.15, 0.05, 1.0);
  drawTriangle([0.15, -0.1, 0.15, -0.6, -0.15, -0.6]);

  gl.uniform4f(u_FragColor, 1.0, 0.9, 0.1, 1.0);
  drawTriangle([-0.8, 0.9, -0.7, 0.8, -0.9, 0.8]);
  gl.uniform4f(u_FragColor, 0.95, 0.85, 0.05, 1.0);
  drawTriangle([-0.7, 0.8, -0.8, 0.7, -0.9, 0.8]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([-0.45, 0.0, -0.25, 0.0, -0.45, -0.05]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([-0.25, 0.0, -0.25, -0.05, -0.45, -0.05]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([-0.45, -0.05, -0.40, -0.05, -0.45, -0.15]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([-0.40, -0.05, -0.40, -0.15, -0.45, -0.15]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([-0.45, -0.15, -0.25, -0.15, -0.45, -0.20]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([-0.25, -0.15, -0.25, -0.20, -0.45, -0.20]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([-0.30, -0.20, -0.25, -0.20, -0.30, -0.30]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([-0.25, -0.20, -0.25, -0.30, -0.30, -0.30]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([-0.45, -0.30, -0.25, -0.30, -0.45, -0.35]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([-0.25, -0.30, -0.25, -0.35, -0.45, -0.35]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([0.25, 0.0, 0.30, 0.0, 0.25, -0.35]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([0.30, 0.0, 0.30, -0.35, 0.25, -0.35]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([0.40, 0.0, 0.45, 0.0, 0.40, -0.35]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([0.45, 0.0, 0.45, -0.35, 0.40, -0.35]);

  gl.uniform4f(u_FragColor, 0.0, 0.1, 0.4, 1.0);
  drawTriangle([0.30, -0.15, 0.40, -0.15, 0.30, -0.20]);
  gl.uniform4f(u_FragColor, 0.1, 0.4, 0.9, 1.0);
  drawTriangle([0.40, -0.15, 0.40, -0.20, 0.30, -0.20]);
}