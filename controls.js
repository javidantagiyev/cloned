function keyContols(e){
    if(e.key == 'w'){
        player.moveForward(deltaTime);
    }
    if(e.key == 'a'){
        player.moveLeft(deltaTime);
    }
    if(e.key == 's'){
        player.moveBack(deltaTime);
    }
    if(e.key == 'd'){
        player.moveRight(deltaTime);
    }
    if(e.key == ' '){ // It is space button
        player.move(0.0, player.speed * deltaTime, 0.0);
    }
    if(e.key == 'Shift'){
        player.move(0.0, -player.speed * deltaTime, 0.0);
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