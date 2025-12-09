var keysDown = {};

function keyContols(e){
    keysDown[e.key] = true;
}

window.onkeyup = function(e){
    keysDown[e.key] = false;
}

function handleMovement(delta){
    if(keysDown['w']){
        player.accelerate(1, delta);
    }
    if(keysDown['s']){
        player.accelerate(-1, delta);
    }
    if(keysDown['a']){
        player.strafe(-1, delta);
    }
    if(keysDown['d']){
        player.strafe(1, delta);
    }
    if(keysDown[' ']){
        player.moveUp(1, delta);
    }
    if(keysDown['Shift']){
        player.moveUp(-1, delta);
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
