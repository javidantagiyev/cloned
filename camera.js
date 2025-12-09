// Our camera class
class Camera{
    // Basic camera params
    position;
    cameraUp;
    direction;
    
    // Perspective view params
    fov;
    near;
    far;
    
    // Matrices
    view;
    proj;
    
    // Transformations
    m_yaw;
    m_pitch;
    m_roll;
    sensitivity;

    // Camera's distance from its position
    // Used for third person view
    // If it is 0 camera become first person
    distance;
    
    // Consts
    ZOOM_FACTOR = 0.3;
    MAX_FOV = 170;
    MIN_FOV = 10;
    MAX_PITCH = 89.9;
    MIN_PITCH = -89.9;
    DISTANCE_FACTOR = 0.2;
    MAX_DISTANCE = 10;
    MIN_DISTANCE = 0.1;

    constructor(cameraPos, cameraTarget, fov, near, far, sensitivity = 0.05, distance = 5){
        // View
        this.position = cameraPos;
        this.cameraUp = [0.0, 1.0, 0.0];
        this.view = lookAt(this.position, cameraTarget, this.cameraUp);

        // Projection
        this.fov = fov;
        this.near = near;
        this.far = far;
        this.proj = perspective(fov, 2, near, far);

        this.m_yaw = -90.0;
        this.m_pitch = 0.0;
        this.m_roll = 0.0;
        this.sensitivity = sensitivity;
        this.distance = distance;
    }

    // Recalculates projection matrix
    updateProjection(){
        this.proj = perspective(this.fov, 2, this.near, this.far);
    }
    
    // Recalculates view matrix
    updateView(){
        this.direction = this.calcDirection();
        var cameraTarget = add(this.calcDirection(), this.position);
        var direct = scale(this.distance, this.direction);
        var newPos = subtract(this.position, direct);

        this.view = lookAt(
            newPos,
            this.position,
            this.cameraUp
        );
    }
    
    // Calculated the direction that camera is looking at
    // (To use it normally we have to add mouse movement)
    calcDirection(){
        var calculatedDirection = [0.0, 0.0, 0.0];
        calculatedDirection[0] = Math.cos(radians(this.m_yaw)) * Math.cos(radians(this.m_pitch));
        calculatedDirection[1] = Math.sin(radians(this.m_pitch));
        calculatedDirection[2] = Math.sin(radians(this.m_yaw)) * Math.cos(radians(this.m_pitch));
        return normalize(calculatedDirection);
    }

    increaseDistance(){
        this.distance += this.DISTANCE_FACTOR
        if(this.distance >= this.MAX_DISTANCE){
            this.distance = this.MAX_DISTANCE;
        }
    }

    decreaseDistance(){
        this.distance -= this.DISTANCE_FACTOR
        if(this.distance <= this.MIN_DISTANCE){
            this.distance = this.MIN_DISTANCE; 
        }
    }


    // Zooming
    zoomIn(){
        if(this.fov <= this.MIN_FOV){
            this.fov = this.MIN_FOV;
            return;
        }
        this.fov -= this.ZOOM_FACTOR;
    }

    zoomOut(){
        if(this.fov >= this.MAX_FOV){
            this.fov = this.MAX_FOV;
            return;
        }
        this.fov += this.ZOOM_FACTOR;
    }

    // Basic camera transformations
    yaw(a){
        this.m_yaw += a * this.sensitivity
    }

    pitch(a){
        this.m_pitch += a * this.sensitivity;

        if(this.m_pitch >= this.MAX_PITCH){
            this.m_pitch = this.MAX_PITCH;
            return;
        }
        if(this.m_pitch <= this.MIN_PITCH){ 
            this.m_pitch = this.MIN_PITCH;
            return;
        }
    }

    // Roll does not do anything yet
    roll(a){
        this.m_roll += a * this.sensitivity;
    }

    move(x, y, z){
        this.position[0] += x;
        this.position[1] += y;
        this.position[2] += z;
    }

    moveTo(x, y, z){
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
    }
}