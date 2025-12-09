/*
CSCI 2408 Computer Graphics Fall 2025 
(c)2025 by Name Surname 
Submitted in partial fulfillment of the requirements of the course.
*/

// Inits
var canvas;
var gl;
window.onload = init;
window.onkeydown = keyContols;

var mousex;
var mousey;

// Program flow
var delay = 10;

// Time
var delta = 0;
var crntFrameTime = 0;
var prevFrameTime = 0;

// Shaders
var program;

var posAttribLocation;
var colorAttribLocation;
var textureAttribLocation;
var normalAttribLocation;
// Transformation
var ctmMatrixLocation;
// Dont touch it. It is for lighting
var worldNormalMatrixLocation;


// Game
var box;
var triangle;
var triangle1;
var sphereModel;
var camera;
var player;
var sphere;
var cube;

// Triangle
var triangleVertices = 
[
    0.0, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5
];

var triangleColors = 
[
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
];


function init() {
    // Get reference to the context of the canvas
    canvas = document.getElementById("gl-canvas");
    // Mouse cursor lock (for 3d movement)
    canvas.onclick = () => {
        canvas.requestPointerLock(true);
    }

    // Listens mouse movement event
    canvas.addEventListener("mousemove", function(e){
        mouseControls(e);
    }, false);

    canvas.addEventListener("wheel", function(e){
        mouseWheelControls(e);
    }, false);

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    initGL();
    ctmMatrixLocation = gl.getUniformLocation(program, "ctm");

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    triangle = new Model(triangleVertices);
    triangle1 = new Model(triangleVertices, null, [2, 2, 2]);
    cube = new Model(cubeVertices, null, [5, 5, 5]);
    sphere = new Model(generateSphereVertices(1, 1));
    player = new Player([0.0, 0.0, 5.0], new Model(generateSphereVertices(0.5, 10)));
    
    window.setInterval(game, delay);
}

// Our gameplay will be here
function game(){
    // Delta
    crntFrameTime = new Date().getTime() / 1000;
    deltaTime = (crntFrameTime - prevFrameTime);
    prevFrameTime = crntFrameTime;

    render();
}

// Rendering function. IT IS NOT THE GAME LOOP
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    triangle.update();
    triangle1.update();
    cube.update();
    player.model.update();
    player.camera.updateView();
    
    draw(triangle, player.camera);
    draw(triangle1, player.camera);
    draw(cube, player.camera);
    draw(sphere, player.camera);
    draw(player.model, player.camera);
}


// Initializing some OpenGL parameters
function initGL(){
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Just backface-culling, hidden surface removal and e.g.
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
}
