class Player{
    // Player's params
    position;
    speed;
    velocity;
    radius;

    // Video settings
    fov;

    // Player's body(Player also is a sphere)
    model;
    camera;

    alive = true;

    constructor(position, model, radius = 0.5, speed = 6){
        this.model = model;
        this.position = position;
        this.radius = radius;
        model.setPosition(position[0], position[1], position[2]);
        model.setSize(radius);
        var cameraPos = position;
        var cameraTarget = add(cameraPos, [0.0, 0.0, -5.0]);
        this.fov = 90;
        this.camera = new Camera(cameraPos, cameraTarget, this.fov, 0.1, 1000, 0.08, 6);
        this.speed = speed;
        this.velocity = [0, 0, 0];
    }

    // Move player's position
    move(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
        this.camera.moveTo(this.position[0], this.position[1], this.position[2]);
        this.model.setPosition(this.position[0], this.position[1], this.position[2]);
    }

    update(delta){
        if(!this.alive) return;
        this.move(this.velocity[0] * delta, this.velocity[1] * delta, this.velocity[2] * delta);
        // Apply damping to slow down if no input
        this.velocity = this.velocity.map(v => v * 0.9);
    }

    accelerate(forward, delta){
        if(!this.alive) return;
        const direct = this.camera.direction;
        this.velocity[0] += direct[0] * forward * this.speed * delta;
        this.velocity[1] += direct[1] * forward * this.speed * delta;
        this.velocity[2] += direct[2] * forward * this.speed * delta;
    }

    strafe(amount, delta){
        if(!this.alive) return;
        const right = cross(this.camera.direction, this.camera.cameraUp);
        this.velocity[0] += right[0] * amount * this.speed * delta;
        this.velocity[1] += right[1] * amount * this.speed * delta;
        this.velocity[2] += right[2] * amount * this.speed * delta;
    }

    moveUp(amount, delta){
        this.velocity[1] += amount * this.speed * delta;
    }

    grow(radius){
        this.radius = radius;
        this.model.setSize(radius);
    }
}
