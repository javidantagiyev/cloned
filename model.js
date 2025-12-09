const RenderMode = {
    ARRAYS: 0,
    ELEMENTS: 1
}

// It is just for some models.
// There is a chance that spheres also will be models.
class Model{
    vertexBuffer;
    normalBuffer;
    texCoordBuffer;
    indexBuffer;
    mode;
    vertexCount;
    indexCount;
    worldMatrix;
    posAttribLocation;
    normalAttribLocation;
    texCoordAttribLocation;

    texture;

    // Transformation params
    position;
    scaleFactor;
    rotateX;
    rotateY;
    rotateZ;
    
    constructor(vertices, indices = null, position = [0.0, 0.0, 0.0], normals = null, texCoords = null){
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        if(normals){
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        }

        if(texCoords){
            this.texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
        }
        
        if(indices == null){
            this.mode = RenderMode.ARRAYS;
        } else {
            this.mode = RenderMode.ELEMENTS;
            this.indexCount = indices.length;
        }

        this.posAttribLocation = gl.getAttribLocation(program, "vPosition");
        this.normalAttribLocation = gl.getAttribLocation(program, "vNormal");
        this.texCoordAttribLocation = gl.getAttribLocation(program, "vTexCoord");

        this.worldMatrix = mat4();
        this.vertexCount = vertices.length / 3;
        this.position = position;
        this.scaleFactor = 1.0;
        this.rotateX = 0.0;
        this.rotateY = 0.0;
        this.rotateZ = 0.0;
    }

    bind(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.posAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(this.posAttribLocation);

        if(this.normalBuffer && this.normalAttribLocation !== -1){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(this.normalAttribLocation);
        }

        if(this.texCoordBuffer && this.texCoordAttribLocation !== -1){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.vertexAttribPointer(this.texCoordAttribLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(this.texCoordAttribLocation);
        }
    }


    update(){
        this.worldMatrix = mat4();
        
        this.worldMatrix = mult(scalem(this.scaleFactor, this.scaleFactor, this.scaleFactor), this.worldMatrix);
        this.worldMatrix = mult(rotateX(this.rotateX), this.worldMatrix);
        this.worldMatrix = mult(rotateY(this.rotateY), this.worldMatrix);
        this.worldMatrix = mult(rotateZ(this.rotateZ), this.worldMatrix);
        this.worldMatrix = mult(translate(this.position[0], this.position[1], this.position[2]), this.worldMatrix);
    }
    
    rotate(x, y, z){
        this.rotateX = (this.rotateX + x) % 360;
        this.rotateY = (this.rotateY + y) % 360;
        this.rotateZ = (this.rotateZ + z) % 360;
    }

    translate(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
    }

    setPosition(x, y, z){
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
    }

    scale(s){
        // console.log("works");
        this.scaleFactor *= s;
    }

    setSize(s){
        this.scaleFactor = s;
    }

    setTexture(texture){
        this.texture = texture;
    }
}