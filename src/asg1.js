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
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };
  document.getElementById('pointButton').onclick = function() { g_selectedType = 'POINT'; };
  document.getElementById('triangleButton').onclick = function() { g_selectedType = 'TRIANGLE'; };
  document.getElementById('circleButton').onclick = function() { g_selectedType = 'CIRCLE'; };
  document.getElementById('pictureButton').onclick = drawMyPicture;

  // Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value / 100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value / 100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value / 100; });

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
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Iterate and render every shape in the global list
  var len = g_shapesList.length;
  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

function drawMyPicture() {
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    
    gl.uniform4f(u_FragColor, 0.2, 0.5, 1.0, 1.0);
    drawTriangle([-0.3, 0.1, 0.3, 0.1, -0.3, -0.2]);
    drawTriangle([0.3, 0.1, 0.3, -0.2, -0.3, -0.2]);
  
    gl.uniform4f(u_FragColor, 0.8, 0.1, 0.1, 1.0);
    drawTriangle([-0.6, -0.2, 0.6, -0.2, -0.6, -0.5]);
    drawTriangle([0.6, -0.2, 0.6, -0.5, -0.6, -0.5]);
  
    gl.uniform4f(u_FragColor, 0.2, 0.2, 0.2, 1.0);

    drawTriangle([-0.45, -0.5, -0.25, -0.5, -0.45, -0.7]);
    drawTriangle([-0.25, -0.5, -0.25, -0.7, -0.45, -0.7]);

    drawTriangle([0.25, -0.5, 0.45, -0.5, 0.25, -0.7]);
    drawTriangle([0.45, -0.5, 0.45, -0.7, 0.25, -0.7]);
  
    gl.uniform4f(u_FragColor, 1.0, 0.9, 0.1, 1.0);

    drawTriangle([-0.35, -0.25, -0.15, -0.25, -0.35, -0.29]);
    drawTriangle([-0.15, -0.25, -0.15, -0.29, -0.35, -0.29]);

    drawTriangle([-0.35, -0.29, -0.31, -0.29, -0.35, -0.33]);
    drawTriangle([-0.31, -0.29, -0.31, -0.33, -0.35, -0.33]);

    drawTriangle([-0.35, -0.33, -0.15, -0.33, -0.35, -0.37]);
    drawTriangle([-0.15, -0.33, -0.15, -0.37, -0.35, -0.37]);

    drawTriangle([-0.19, -0.37, -0.15, -0.37, -0.19, -0.41]);
    drawTriangle([-0.15, -0.37, -0.15, -0.41, -0.19, -0.41]);

    drawTriangle([-0.35, -0.41, -0.15, -0.41, -0.35, -0.45]);
    drawTriangle([-0.15, -0.41, -0.15, -0.45, -0.35, -0.45]);

    drawTriangle([0.15, -0.25, 0.19, -0.25, 0.15, -0.45]);
    drawTriangle([0.19, -0.25, 0.19, -0.45, 0.15, -0.45]);

    drawTriangle([0.31, -0.25, 0.35, -0.25, 0.31, -0.45]);
    drawTriangle([0.35, -0.25, 0.35, -0.45, 0.31, -0.45]);

    drawTriangle([0.19, -0.33, 0.31, -0.33, 0.19, -0.37]);
    drawTriangle([0.31, -0.33, 0.31, -0.37, 0.19, -0.37]);
  }