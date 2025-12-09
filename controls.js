const keyStates = {};

function keyContols(e){
    keyStates[e.key] = true;
}

function keyUpControls(e){
    keyStates[e.key] = false;
}

function applyMovementControls(delta){
    if(keyStates['w']){
        player.moveForward(delta);
    }
    if(keyStates['a']){
        player.moveLeft(delta);
    }
    if(keyStates['s']){
        player.moveBack(delta);
    }
    if(keyStates['d']){
        player.moveRight(delta);
    }
    if(keyStates[' ']){ // space
        player.addVelocity(0.0, player.speed * delta, 0.0);
    }
    if(keyStates['Shift']){
        player.addVelocity(0.0, -player.speed * delta, 0.0);
    }
}


function mouseControls(e){
    // Only rotate when locked
    if (document.pointerLockElement !== canvas) return;

    const dx = e.movementX;
    const dy = e.movementY;

    player.camera.yaw(dx);
    player.camera.pitch(-dy);
}

function mouseWheelControls(e){
    if(e.deltaY > 0){
        player.camera.increaseDistance();
    } else {
        player.camera.decreaseDistance();
    }
}