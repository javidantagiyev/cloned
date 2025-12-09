class Renderer{

}

function calcCTM(world, view, proj){
    var worldView = mult(view, world);
    var ctm = mult(proj, worldView);
    return ctm;
}

function draw(model, camera){
    var ctm = calcCTM(model.worldMatrix, camera.view, camera.proj);
    gl.uniformMatrix4fv(ctmMatrixLocation, false, flatten(ctm));
    model.bind();
    
    if(model.mode == RenderMode.ARRAYS){
        gl.drawArrays(gl.TRIANGLES, 0, model.vertexCount);
    } else {
        gl.drawElements(gl.TRIANGLES, model.indexCount, gl.UNSIGNED_SHORT, 0);
    }
}