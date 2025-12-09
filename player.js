class Player{
    // Player's params
    position;
    speed;
    velocity;
    radius;

    // Video settings
    fov;

    // Player's body(Player also is a sphere)
    sphereModel;
    model;
    camera;

    constructor(position, model, radius = 0.5, speed = 5){
        this.model = model;
        this.position = position;
        model.setPosition(position[0], position[1], position[2]);
        this.radius = radius;
        model.setSize(radius);
        // var cameraPos = add(position, [0.0, 1.0, 2.0]);
        var cameraPos = position;
        var cameraTarget = add(cameraPos, [0.0, 0.0, -5.0]);
        this.fov = 90;
        this.camera = new Camera(cameraPos, cameraTarget, this.fov, 0.1, 1000, 0.05, 6, radius * 0.5, radius * 0.8);
        this.speed = speed;
        this.velocity = [0.0, 0.0, 0.0];
    }

    // Move player's position
    move(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.camera.moveTo(this.position[0], this.position[1], this.position[2]);
        this.model.setPosition(this.position[0], this.position[1], this.position[2]);
    }

    // Moving player in camera directions
    moveForward(delta){
        const direct = this.camera.direction;
        const x = (direct[0] * this.speed);
        const y = (direct[1] * this.speed);
        const z = (direct[2] * this.speed);
        this.addVelocity(x, y, z);
    }

    moveBack(delta){
        const direct = this.camera.direction;
        const x = -(direct[0] * this.speed);
        const y = -(direct[1] * this.speed);
        const z = -(direct[2] * this.speed);
        this.addVelocity(x, y, z);
    }

    moveRight(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        const x = (right[0] * this.speed);
        const y = (right[1] * this.speed);
        const z = (right[2] * this.speed);
        this.addVelocity(x, y, z);
    }

    moveLeft(delta){
        const right = cross(this.camera.direction, this.camera.cameraUp);
        const x = -(right[0] * this.speed);
        const y = -(right[1] * this.speed);
        const z = -(right[2] * this.speed);
        this.addVelocity(x, y, z);
    }

    moveUp(){

    }

    addVelocity(x, y, z){
        this.velocity[0] += x;
        this.velocity[1] += y;
        this.velocity[2] += z;
    }

    integrate(delta){
        this.move(this.velocity[0] * delta, this.velocity[1] * delta, this.velocity[2] * delta);
    }

    dampen(factor){
        this.velocity[0] *= factor;
        this.velocity[1] *= factor;
        this.velocity[2] *= factor;
    }

    setRadius(r){
        this.radius = r;
        this.model.setSize(r);
    }
}