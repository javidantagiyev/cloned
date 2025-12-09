// Lighting uniforms
var ambientLocation;
var lightPosLocation;
var lightColorLocation;
var shininessLocation;
var viewerLocation;
var materialDiffuseLocation;
var materialAlphaLocation;
var textureLocation;
var useTextureLocation;
var worldMatrixLocation;

var ambient = [0.1, 0.1, 0.15];
var lightPos = [10.0, 10.0, 10.0];
var lightColor = [1.0, 0.95, 0.9];
var shininess = 32.0;

function updateLight(time){
    // Orbit light around the origin
    var radius = 25.0;
    lightPos[0] = Math.cos(time * 0.3) * radius;
    lightPos[2] = Math.sin(time * 0.3) * radius;
    lightPos[1] = 15.0 + Math.sin(time * 0.5) * 5.0;
}
