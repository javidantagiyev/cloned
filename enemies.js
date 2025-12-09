class Enemy {
    constructor(position, radius, texture){
        this.position = [...position];
        this.radius = radius;
        this.velocity = randomVelocity();
        const geo = generateSphereVertices(radius, 8);
        this.model = new Model(geo.vertices, null, this.position, geo.normals, geo.texCoords);
        this.setTexture(texture);
    }

    setTexture(texture){
        this.model.setTexture(texture);
    }

    integrate(delta){
        this.position = add(this.position, scale(delta, this.velocity));
        const len = lengthVec(this.position);
        const maxDistance = SKY_RADIUS - this.radius - 0.5;
        if(len > maxDistance){
            const normal = normalize(this.position);
            const penetration = len - maxDistance;
            this.position = subtract(this.position, scale(penetration, normal));
            const velDot = dot(this.velocity, normal);
            const bounce = scale(-2 * velDot, normal);
            this.velocity = add(this.velocity, bounce);
        }
    }

    updateModel(){
        this.model.setPosition(this.position[0], this.position[1], this.position[2]);
        this.model.setSize(this.radius);
        this.model.update();
    }
}

var enemies = [];

function resetEnemies(player, texture){
    enemies = [];
    createEnemies(player, texture);
}

function createEnemies(player, texture){
    const attempts = 600;
    let created = 0;
    let tries = 0;
    while(created < MOTE_COUNT && tries < attempts){
        const radius = 0.4 + Math.random() * 1.8;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * (SKY_RADIUS * 0.9);
        const dist = Math.random() * (SKY_RADIUS - radius - 4);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        const position = [x, height, z];

        const intersects = enemies.some(e => distance(position, e.position) < (radius + e.radius + 0.5)) ||
            distance(position, player.position) < (radius + player.radius + 1.5);
        if(intersects){
            tries++;
            continue;
        }

        const enemy = new Enemy(position, radius, texture);
        enemies.push(enemy);
        created++;
    }
}

function updateEnemies(delta, player){
    enemies.forEach(enemy => {
        enemy.integrate(delta);
    });
    resolveEnemyCollisions();
    enemies = enemies.filter(enemy => resolvePlayerEnemyCollision(player, enemy));
    enemies.forEach(enemy => enemy.updateModel());
}

function setEnemyTexture(texture){
    enemies.forEach(enemy => enemy.setTexture(texture));
}

function detectCollision(entityA, entityB){
    const distanceBetween = distance(entityA.position, entityB.position);
    return distanceBetween < (entityA.radius + entityB.radius);
}

function resolveEnemyCollisions(){
    const removed = new Set();
    for(let i = 0; i < enemies.length; i++){
        if(removed.has(i)) continue;
        for(let j = i + 1; j < enemies.length; j++){
            if(removed.has(j)) continue;
            const enemyA = enemies[i];
            const enemyB = enemies[j];
            if(!detectCollision(enemyA, enemyB)) continue;

            const larger = enemyA.radius >= enemyB.radius ? enemyA : enemyB;
            const smallerIndex = larger === enemyA ? j : i;
            const smaller = enemies[smallerIndex];

            mergeEnemies(larger, smaller);
            removed.add(smallerIndex);
        }
    }

    enemies = enemies.filter((_, idx) => !removed.has(idx));
}

function mergeEnemies(larger, smaller){
    const largerMass = Math.pow(larger.radius, 3);
    const smallerMass = Math.pow(smaller.radius, 3);
    const combinedMass = largerMass + smallerMass;

    const combinedVelocity = [
        (larger.velocity[0] * largerMass + smaller.velocity[0] * smallerMass) / combinedMass,
        (larger.velocity[1] * largerMass + smaller.velocity[1] * smallerMass) / combinedMass,
        (larger.velocity[2] * largerMass + smaller.velocity[2] * smallerMass) / combinedMass,
    ];

    larger.radius = Math.cbrt(combinedMass);
    larger.velocity = combinedVelocity;
}

function resolvePlayerEnemyCollision(player, enemy){
    if(!detectCollision(player, enemy)){
        return true;
    }

    const playerMass = Math.pow(player.radius, 3);
    const enemyMass = Math.pow(enemy.radius, 3);
    const combinedMass = playerMass + enemyMass;
    const combinedVelocity = [
        (player.velocity[0] * playerMass + enemy.velocity[0] * enemyMass) / combinedMass,
        (player.velocity[1] * playerMass + enemy.velocity[1] * enemyMass) / combinedMass,
        (player.velocity[2] * playerMass + enemy.velocity[2] * enemyMass) / combinedMass,
    ];

    if(player.radius >= enemy.radius){
        player.setRadius(Math.cbrt(combinedMass));
        player.velocity = combinedVelocity;
        return false;
    }

    player.setRadius(0);
    player.velocity = [0, 0, 0];
    return false;
}

function randomVelocity(){
    const speed = 0.6 + Math.random() * 0.6;
    const direction = normalize([
        Math.random() - 0.5,
        (Math.random() - 0.5) * 0.3,
        Math.random() - 0.5,
    ]);
    return scale(speed, direction);
}
