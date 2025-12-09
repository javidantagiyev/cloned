class Renderer{

}

function calcCTM(world, view, proj){
    var worldView = mult(view, world);
    var ctm = mult(proj, worldView);
    return ctm;
}

function draw(model, camera, material){
    var ctm = calcCTM(model.worldMatrix, camera.view, camera.proj);
    gl.uniformMatrix4fv(ctmMatrixLocation, false, flatten(ctm));
    gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(model.worldMatrix));
    var normalMatrix = normalMatrixFromWorld(model.worldMatrix, camera.view);
    gl.uniformMatrix3fv(worldNormalMatrixLocation, false, flatten(normalMatrix));

    var viewPosition = camera.eyePosition ?? camera.position;
    gl.uniform3fv(viewerLocation, new Float32Array(viewPosition));

    if(material){
        gl.uniform3fv(materialColorLocation, new Float32Array(material.color));
        gl.uniform1f(alphaLocation, material.alpha ?? 1.0);
        gl.uniform1i(useTextureLocation, material.texture ? 1 : 0);
        if(material.texture){
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, material.texture);
            gl.uniform1i(textureLocation, 0);
        }
        gl.uniform1f(shininessLocation, material.shininess ?? 32.0);
    }

    model.bind();

    if(model.mode == RenderMode.ARRAYS){
        gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
    } else {
        gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}

function normalMatrixFromWorld(world, view){
    // Compute normal matrix from world-view
    var worldView = mult(view, world);
    var normalMatrix = mat3();
    var m = transpose(worldView);
    // Extract upper-left 3x3 and invert
    normalMatrix = inverse(mat3(
        m[0][0], m[0][1], m[0][2],
        m[1][0], m[1][1], m[1][2],
        m[2][0], m[2][1], m[2][2]
    ));
    return normalMatrix;
}