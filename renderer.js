class Renderer{

}

function calcCTM(world, view, proj){
    var worldView = mult(view, world);
    var ctm = mult(proj, worldView);
    return ctm;
}

function draw(model, camera){
    model.bind();
    var ctm = calcCTM(model.worldMatrix, camera.view, camera.proj);
    var normalMatrix = transpose(inverse(model.worldMatrix));

    gl.uniformMatrix4fv(ctmMatrixLocation, false, flatten(ctm));
    gl.uniformMatrix4fv(worldMatrixLocation, false, flatten(model.worldMatrix));
    gl.uniformMatrix4fv(worldNormalMatrixLocation, false, flatten(normalMatrix));
    gl.uniform3fv(materialDiffuseLocation, flatten(model.color));
    gl.uniform1f(materialAlphaLocation, model.alpha);
    gl.uniform1i(useTextureLocation, model.useTexture);

    if(model.useTexture){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, model.texture);
        gl.uniform1i(textureLocation, 0);
    }

    if(model.isSkybox){
        gl.disable(gl.CULL_FACE);
    }

    if(model.mode == RenderMode.ARRAYS){
        gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
    } else {
        gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    if(model.isSkybox){
        gl.enable(gl.CULL_FACE);
    }
}
