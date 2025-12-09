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
// Dont touch it. It is for lighting
var worldNormalMatrixLocation;

var worldMatrixLocation;

// Game
var camera;
var player;
var motes = [];
var skybox;
var moteTexture;
var skyTexture;

var WORLD_RADIUS = 30;
var MOTE_COUNT = 20;
var smallerColor = [0.4, 0.8, 0.6];
var largerColor = [0.9, 0.4, 0.4];

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
    worldMatrixLocation = gl.getUniformLocation(program, "world");
    worldNormalMatrixLocation = gl.getUniformLocation(program, "normalMatrix");

    ambientLocation = gl.getUniformLocation(program, "ambient");
    lightPosLocation = gl.getUniformLocation(program, "lightPos");
    lightColorLocation = gl.getUniformLocation(program, "lightColor");
    shininessLocation = gl.getUniformLocation(program, "shininess");
    viewerLocation = gl.getUniformLocation(program, "viewPos");
    materialDiffuseLocation = gl.getUniformLocation(program, "material.diffuse");
    materialAlphaLocation = gl.getUniformLocation(program, "material.alpha");
    textureLocation = gl.getUniformLocation(program, "uTexture");
    useTextureLocation = gl.getUniformLocation(program, "useTexture");

    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    moteTexture = createNoiseTexture("#7ec8e3", "#2a6592");
    skyTexture = createNoiseTexture("#0b0d1a", "#1b2b4b", true);

    // Create player and camera
    const playerSphere = generateSphere(1, 8);
    player = new Player([0.0, 0.0, 5.0], new Model(playerSphere.vertices, { normals: playerSphere.normals, texCoords: playerSphere.texCoords, color: [0.2, 0.7, 1.0], useTexture: true, texture: moteTexture }), 1.2, 7);

    generateMotes();
    createSkybox();

    prevFrameTime = new Date().getTime() / 1000;
    window.requestAnimationFrame(game);
}

function createSkybox(){
    const sphereData = generateSphere(WORLD_RADIUS, 6);
    skybox = new Model(sphereData.vertices, { normals: sphereData.normals, texCoords: sphereData.texCoords, color: [1.0, 1.0, 1.0], useTexture: true, texture: skyTexture });
    skybox.isSkybox = true;
}

function generateMotes(){
    const sphereData = generateSphere(1, 4);
    let attempts = 0;
    while(motes.length < MOTE_COUNT && attempts < MOTE_COUNT * 10){
        const radius = 0.4 + Math.random() * 1.5;
        const position = randomPosition(radius);
        if(!position) { attempts++; continue; }
        const model = new Model(sphereData.vertices, { normals: sphereData.normals, texCoords: sphereData.texCoords, color: smallerColor, useTexture: true, texture: moteTexture });
        model.setSize(radius);
        model.setPosition(position[0], position[1], position[2]);
        motes.push({ position, radius, model });
        attempts++;
    }
}

function randomPosition(radius){
    for(let i=0;i<10;i++){
        const angle1 = Math.random() * Math.PI * 2;
        const angle2 = Math.random() * Math.PI;
        const dist = Math.random() * (WORLD_RADIUS - radius - 2) - (WORLD_RADIUS/2);
        const r = WORLD_RADIUS - radius - 2;
        const x = (Math.random()*2-1) * r;
        const y = (Math.random()*2-1) * r * 0.5;
        const z = (Math.random()*2-1) * r;
        const position = [x,y,z];
        if(length(position) + radius > WORLD_RADIUS - 1) continue;
        if(distance(position, player.position) < player.radius + radius + 2) continue;
        let intersects = false;
        for(const mote of motes){
            if(distance(position, mote.position) < mote.radius + radius + 0.5){
                intersects = true;
                break;
            }
        }
        if(!intersects) return position;
    }
    return null;
}

// Our gameplay will be here
function game(){
    // Delta
    crntFrameTime = new Date().getTime() / 1000;
    deltaTime = (crntFrameTime - prevFrameTime);
    prevFrameTime = crntFrameTime;

    updateLight(crntFrameTime);
    updateGame(deltaTime);
    render();

    window.requestAnimationFrame(game);
}

function updateGame(delta){
    handleMovement(delta);
    player.camera.updateView();
    player.update(delta);
    handleSkyboxBounce();
    handleMoteCollisions();
}

function handleSkyboxBounce(){
    const dist = length(player.position);
    if(dist + player.radius > WORLD_RADIUS){
        const normal = normalize(player.position);
        const overlap = dist + player.radius - WORLD_RADIUS;
        player.move(-normal[0] * overlap, -normal[1] * overlap, -normal[2] * overlap);
        const v = player.velocity;
        const dotp = v[0]*normal[0] + v[1]*normal[1] + v[2]*normal[2];
        player.velocity = [v[0] - 2*dotp*normal[0], v[1] - 2*dotp*normal[1], v[2] - 2*dotp*normal[2]];
    }
}

function handleMoteCollisions(){
    motes = motes.filter(mote => {
        const dist = distance(player.position, mote.position);
        if(dist < player.radius + mote.radius){
            if(player.radius >= mote.radius){
                // absorb
                const newRadius = Math.pow(Math.pow(player.radius, 3) + Math.pow(mote.radius, 3), 1/3);
                player.grow(newRadius);
                return false;
            } else {
                // player absorbed
                player.alive = false;
                player.model.alpha = 0.0;
            }
        }
        return true;
    });
}

// Rendering function. IT IS NOT THE GAME LOOP
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update uniforms common to all draws
    gl.uniform3fv(ambientLocation, flatten(ambient));
    gl.uniform3fv(lightPosLocation, flatten(lightPos));
    gl.uniform3fv(lightColorLocation, flatten(lightColor));
    gl.uniform1f(shininessLocation, shininess);
    gl.uniform3fv(viewerLocation, flatten(player.camera.position));

    // Update models
    skybox.update();
    player.model.update();
    for(const mote of motes){
        mote.model.color = mote.radius > player.radius ? largerColor : smallerColor;
        mote.model.update();
    }

    // Draw skybox first
    draw(skybox, player.camera);

    // Draw motes
    for(const mote of motes){
        draw(mote.model, player.camera);
    }

    // Draw player
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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

function createNoiseTexture(colorA, colorB, transparent){
    var size = 64;
    var canvasTex = document.createElement('canvas');
    canvasTex.width = size;
    canvasTex.height = size;
    var ctx = canvasTex.getContext('2d');
    var gradient = ctx.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
    gradient.addColorStop(0, colorA + (transparent ? '00' : '')); 
    gradient.addColorStop(1, colorB + (transparent ? '88' : ''));
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,size,size);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvasTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return texture;
}

function distance(a, b){
    return Math.sqrt(Math.pow(a[0]-b[0],2) + Math.pow(a[1]-b[1],2) + Math.pow(a[2]-b[2],2));
}

