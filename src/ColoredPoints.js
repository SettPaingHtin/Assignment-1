// ColoredPoints.js
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = 10.0;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + // uniform variable
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

function main() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    return;
  }

  // Get the storage location of a_Position variable
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

  // Get the storage location of u_FragColor variable
  var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev) {
    click(ev, gl, canvas, a_Position, u_FragColor);
  };

  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_points = []; // The array for a mouse press
var g_colors = []; // The array to store the color of a point

function click(ev, gl, canvas, a_Position, u_FragColor) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  // Store the coordinates
  g_points.push([x, y]);

  // Store the color
  if (x >= 0.0 && y >= 0.0) {
    // First quadrant → Red
    g_colors.push([1.0, 0.0, 0.0, 1.0]);
  } else if (x < 0.0 && y < 0.0) {
    // Third quadrant → Green
    g_colors.push([0.0, 1.0, 0.0, 1.0]);
  } else {
    // Others → White
    g_colors.push([1.0, 1.0, 1.0, 1.0]);
  }

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_points.length;
  for (var i = 0; i < len; i++) {
    var xy = g_points[i];
    var rgba = g_colors[i];

    // Pass position
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);

    // Pass color
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}