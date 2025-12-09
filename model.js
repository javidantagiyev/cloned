const RenderMode = {
    ARRAYS: 0,
    ELEMENTS: 1
}

// A renderable model containing buffers for position, normals and texture coordinates.
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
    texAttribLocation;

    // Transformation params
    position;
    scaleFactor;
    rotateX;
    rotateY;
    rotateZ;

    texture;
    color;
    alpha;
    useTexture;
    isSkybox = false;

    constructor(vertices, options = {}){
        const { indices = null, normals = null, texCoords = null, position = [0.0, 0.0, 0.0], color = [1.0, 1.0, 1.0], alpha = 1.0, useTexture = false, texture = null } = options;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Normals
        if (normals && normals.length > 0){
            this.normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        }

        // Texture coordinates
        if (texCoords && texCoords.length > 0){
            this.texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
        }

        if(indices == null){
            this.mode = RenderMode.ARRAYS;
        } else {
            this.mode = RenderMode.ELEMENTS;
            this.indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
            this.indexCount = indices.length;
        }

        this.posAttribLocation = gl.getAttribLocation(program, "vPosition");
        this.normalAttribLocation = gl.getAttribLocation(program, "vNormal");
        this.texAttribLocation = gl.getAttribLocation(program, "vTexCoord");

        this.worldMatrix = mat4();
        this.vertexCount = vertices.length / 3;
        this.position = position;
        this.scaleFactor = 1.0;
        this.rotateX = 0.0;
        this.rotateY = 0.0;
        this.rotateZ = 0.0;

        this.texture = texture;
        this.color = color;
        this.alpha = alpha;
        this.useTexture = useTexture && !!texture;
    }

    bind(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.posAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(this.posAttribLocation);

        if(this.normalBuffer){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(this.normalAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(this.normalAttribLocation);
        }

        if(this.texCoordBuffer){
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.vertexAttribPointer(this.texAttribLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(this.texAttribLocation);
        }

        if(this.mode === RenderMode.ELEMENTS){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
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
        this.scaleFactor *= s;
    }

    setSize(s){
        this.scaleFactor = s;
    }
}
