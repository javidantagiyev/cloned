/*
CSCI 2408 Computer Graphics Fall 2025
(c)2025 by Name Surname
Submitted in partial fulfillment of the requirements of the course.
*/

// Globals
var canvas;
var gl;
window.onload = init;
window.onkeydown = keyContols;
window.onkeyup = keyUpControls;

// Time
var deltaTime = 0;
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
var worldNormalMatrixLocation;
var worldMatrixLocation;
// Lighting
var ambientLocation;
var lightPosLocation;
var lightColorLocation;
var shininessLocation;
var viewerLocation;
// Material
var materialColorLocation;
var textureLocation;
var useTextureLocation;
var alphaLocation;

// Game
var camera;
var player;
var skybox;
var lightAngle = 0;
var lightPos = [10, 10, 0];

// Constants
const SKY_RADIUS = 60;
const GRAVITY = 0.0;
const DAMPING = 0.98;
const MOTE_COUNT = 28;
const SMALL_COLOR = [0.2, 0.7, 1.0];
const LARGE_COLOR = [1.0, 0.4, 0.3];

var sphereTexture;
var playerTexture;
var skyTexture;

function init() {
    canvas = document.getElementById("gl-canvas");
    canvas.onclick = () => {
        canvas.requestPointerLock(true);
    }

    canvas.addEventListener("mousemove", function(e){
        mouseControls(e);
    }, false);

    canvas.addEventListener("wheel", function(e){
        mouseWheelControls(e);
    }, false);

    gl = WebGLUtils.setupWebGL(canvas);
    if ( !gl ) { alert( "WebGL isn't available" ); }

    initGL();
    initTextures();

    setupScene();

    requestAnimationFrame(game);
}

function setupScene(){
    const playerGeo = generateSphereVertices(1, 12);
    const playerModel = new Model(playerGeo.vertices, null, [0.0, -SKY_RADIUS * 0.3, 5.0], playerGeo.normals, playerGeo.texCoords);
    player = new Player([0.0, -SKY_RADIUS * 0.3, 5.0], playerModel, 0.8, 3.5);
    player.camera.m_pitch = -15;
    player.camera.distance = 6.5;
    player.camera.updateView();
    player.model.setTexture(playerTexture);

    skybox = createSkybox();
    resetEnemies(player, sphereTexture);
}

function createSkybox(){
    const geo = generateSphereVertices(SKY_RADIUS, 16);
    const model = new Model(geo.vertices, null, [0,0,0], geo.normals, geo.texCoords);
    model.setTexture(skyTexture);
    return model;
}

// Game loop
function game(){
    crntFrameTime = new Date().getTime() / 1000;
    deltaTime = (crntFrameTime - prevFrameTime);
    prevFrameTime = crntFrameTime;
    if(deltaTime > 0.1) deltaTime = 0.1;

    update(deltaTime);
    render();

    requestAnimationFrame(game);
}

function update(delta){
    applyMovementControls(delta);
    player.velocity[1] -= GRAVITY * delta;
    player.integrate(delta);
    player.dampen(DAMPING);

    // Skybox collision bounce
    const len = lengthVec(player.position);
    const maxDistance = SKY_RADIUS - player.radius;
    if(len > maxDistance){
        const normal = normalize(player.position);
        const penetration = len - maxDistance;
        player.position = subtract(player.position, scale(penetration, normal));
        const velDot = dot(player.velocity, normal);
        const bounce = scale(-2 * velDot, normal);
        player.velocity = add(player.velocity, bounce);
    }

    // Enemy movement and collisions
    updateEnemies(delta, player);

    // Update models
    player.model.setPosition(player.position[0], player.position[1], player.position[2]);
    player.model.update();
    player.camera.updateView();
    player.model.setTexture(playerTexture);

    // Animate light
    lightAngle += delta * 20;
    const radius = 20;
    const lx = Math.cos(radians(lightAngle)) * radius;
    const lz = Math.sin(radians(lightAngle)) * radius;
    lightPos = [lx, 10, lz];
}

// Rendering
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set lighting uniforms
    gl.uniform3fv(ambientLocation, new Float32Array([0.08, 0.08, 0.1]));
    gl.uniform3fv(lightPosLocation, new Float32Array(lightPos));
    gl.uniform3fv(lightColorLocation, new Float32Array([1.0, 0.95, 0.9]));

    // Skybox first - disable culling so we can see inside
    gl.disable(gl.CULL_FACE);
    skybox.update();
    draw(skybox, player.camera, {
        color: [0.7, 0.9, 1.0],
        texture: skyTexture,
        alpha: 1.0,
        shininess: 4.0
    });
    gl.enable(gl.CULL_FACE);

    // Draw enemies
    enemies.forEach(mote => {
        const color = pickColor(mote.radius);
        draw(mote.model, player.camera, {
            color,
            texture: sphereTexture,
            alpha: 0.95,
            shininess: 24.0
        });
    });

    // Draw player
    draw(player.model, player.camera, {
        color: [1.0, 1.0, 1.0],
        texture: playerTexture,
        alpha: 0.9,
        shininess: 64.0
    });
}

// GL setup
function initGL(){
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    ctmMatrixLocation = gl.getUniformLocation(program, "ctm");
    worldMatrixLocation = gl.getUniformLocation(program, "world");
    worldNormalMatrixLocation = gl.getUniformLocation(program, "worldNormal");
    ambientLocation = gl.getUniformLocation(program, "ambient");
    lightPosLocation = gl.getUniformLocation(program, "lightPos");
    lightColorLocation = gl.getUniformLocation(program, "lightColor");
    shininessLocation = gl.getUniformLocation(program, "shininess");
    viewerLocation = gl.getUniformLocation(program, "viewPos");
    materialColorLocation = gl.getUniformLocation(program, "baseColor");
    textureLocation = gl.getUniformLocation(program, "tex");
    useTextureLocation = gl.getUniformLocation(program, "useTexture");
    alphaLocation = gl.getUniformLocation(program, "alpha");

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function initTextures(){
    sphereTexture = createCheckerTexture([200, 230, 255, 255], [180, 210, 245, 255]);
    playerTexture = createCheckerTexture([255, 200, 200, 255], [240, 150, 150, 255]);
    skyTexture = createStarTexture();

    loadTextureFromImage('enemies.png', (texture) => {
        sphereTexture = texture;
        setEnemyTexture(sphereTexture);
    });

    loadTextureFromImage('player.png', (texture) => {
        playerTexture = texture;
        if(player){
            player.model.setTexture(playerTexture);
        }
    });

    loadTextureFromImage('cosmos.png', (texture) => {
        skyTexture = texture;
        if(skybox){
            skybox.setTexture(skyTexture);
        }
    });
}

// Utils
function distance(a, b){
    return Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2)+Math.pow(a[2]-b[2],2));
}

function lengthVec(a){
    return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
}

function pickColor(radius){
    const ratio = Math.max(0.0, Math.min(1.0, radius / Math.max(player.radius, 0.001)));
    return mixColors(SMALL_COLOR, LARGE_COLOR, ratio);
}

function mixColors(a, b, t){
    return [
        a[0] * (1-t) + b[0] * t,
        a[1] * (1-t) + b[1] * t,
        a[2] * (1-t) + b[2] * t,
    ];
}

function createCheckerTexture(colorA, colorB){
    const size = 4;
    const data = new Uint8Array(size * size * 4);
    for(let y=0;y<size;y++){
        for(let x=0;x<size;x++){
            const index = (y*size + x) * 4;
            const useA = ((x + y) % 2) === 0;
            const src = useA ? colorA : colorB;
            data[index] = src[0];
            data[index+1] = src[1];
            data[index+2] = src[2];
            data[index+3] = src[3];
        }
    }
    return buildTexture(data, size, size);
}

function createStarTexture(){
    const size = 8;
    const data = new Uint8Array(size * size * 4);
    for(let y=0;y<size;y++){
        for(let x=0;x<size;x++){
            const idx = (y*size + x) * 4;
            const brightness = Math.random() > 0.85 ? 255 : 50;
            data[idx] = data[idx+1] = data[idx+2] = brightness;
            data[idx+3] = 255;
        }
    }
    return buildTexture(data, size, size);
}

function loadTextureFromImage(src, onLoad){
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const image = new Image();
    image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        const isPot = isPowerOfTwo(image.width) && isPowerOfTwo(image.height);
        if(isPot){
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        if(onLoad){
            onLoad(texture);
        }
    };
    image.onerror = function(){
        console.warn('Texture failed to load:', src);
    };
    image.src = src;

    return texture;
}

function isPowerOfTwo(value){
    return (value & (value - 1)) === 0;
}

function buildTexture(data, width, height){
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}
