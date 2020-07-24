//------------------------------------------------------------------------//
//                            Event Handling                              //
//------------------------------------------------------------------------//
var playerTranslate = new Vertex(0,0,0);
var playerRotate = new Vertex(0,0,0);
var speed = 0.1;
var shoot = false;

// Laser projectile
var laserSpeed = 0.3;
var laserFrameCount = 0;

function handleKeyPress(event) {
    if(event.keyCode == 37) {
        playerTranslate.x = -speed;
        playerRotate.y =  100 *speed;
    }
    else if(event.keyCode == 39) {
        playerTranslate.x = speed;
        playerRotate.y = - 100 * speed;
    }
    if (event.keyCode == 32) {
    shoot=true;
    }
}
function handleKeyRelease(event) {
    if(event.keyCode == 37) {
        playerTranslate.x = 0;
        playerRotate.y = 0;
    }
    else if(event.keyCode == 39) {
        playerTranslate.x = 0;
        playerRotate.y = 0;
    }
    if (event.keyCode == 32) {
        shoot= false;
        laserFrameCount = 0;
    }
}

document.addEventListener('keydown', handleKeyPress, true);
document.addEventListener('keyup', handleKeyRelease, true);
//------------------------------------------------------------------------//
//                               Animations                               //
//------------------------------------------------------------------------//
// Limiting frame rate to 60 fps
var stop = false;
var frameCount = 0;
var fps =  30;
var fpsInterval, startTime, now, then, elapsed;

fpsInterval = 1000 / fps;
then = Date.now();
startTime = then;

// Frame count since the start of the game
var frameCount = 0;
// Array containing the sequence of enemies in the level. 0 = nothing, 1 = cube
var enemiesSequence = [
    [1,0,1],
    [0,1,0],
    [1,0,1],
    [0,1,0],
    [1,0,1],
];
var sequenceIndex = 0;

function animateEnemies(entityArray, frames) {
    let enemies = entityArray;

    if ( frames % 30 == 0 && enemiesSequence.length != sequenceIndex) {
    let row = enemiesSequence[sequenceIndex++];
    let position;
    let newLight;
    for (let i=0; i<row.length; i++) {
        switch (row[i]) {
        case 0:
            continue;
        case 1:
            position = new Vertex(i-1, 0.5, 20);
            break;
        };
        enemies.push(createGrunt(position));
    }
    
    }

    
    for (let i=0; i<enemies.length; i++) {
    if (enemies[i]!= null) {
        if  (enemies[i].instance.position.z < 1) {
        enemies.splice(i,1);
        } else {
        enemies[i].instance.translate(new Vertex(0,0,-0.1));
            if (enemies[i].lights!= null) {
            enemies[i].lights.translate(new Vertex(0,0,-0.1));
        }
        }
    }
    }
    return enemies;
}
function animateProjectiles(entityArray, pos) {
    let projectiles = entityArray;
    if (shoot) {
        if (laserFrameCount++ % 4 == 0) {
        let projInstance = new Instance(greenCube, new Vertex(pos, 0.5, 3), new Vertex(0,  0, 0), new Vertex(0.02, 0.02, 0.2), -1);
        let projLight =  new Light(lightType.POINT, 0.1, projInstance.position, null, vertexFromRGBA(colors.GREEN));
        projectiles.push(new GameEntity("Laser", projInstance, projLight, 0));
        }
    }
    for (let i=0; i<projectiles.length; i++) {
    if (projectiles[i] && projectiles[i]!= null) {
        if  (projectiles[i].instance.position.z > 20) {
        projectiles.splice(i,1);
        } else {
        let yAngle = projectiles[i].instance.rotation.y;
        projectiles[i].instance.translate(new Vertex(Math.sin(toRad(yAngle)) * 0.30,0, Math.cos(toRad(yAngle)) * 0.30));
        projectiles[i].lights.translate(new Vertex(Math.sin(toRad(yAngle)) * 0.30,0, Math.cos(toRad(yAngle)) * 0.30));
        }
    }
    }
    return projectiles;
}
//------------------------------------------------------------------------//
//                          Update functions                              //
//------------------------------------------------------------------------//
function redShift(instance, hp){
    instance.colorShift = new Vertex(0.5 * 1/hp,0,0);
    if (instance.children) {
    for (let i=0; i<instance.children.length; i++) {
        redShift(instance.children[i], hp);
    }
    }
}
function updateHUD(canvas, FPS, player) {
    // HP Counter
    if (player.hp >= 75 ) {
    mainCanvas.context.fillStyle = "lightgreen";
    } else if (player.hp >= 50) {
    mainCanvas.context.fillStyle = "yellow";
    } else if (player.hp >= 25) {
    mainCanvas.context.fillStyle = "orange";
    } else {
    mainCanvas.context.fillStyle = "red";
    }
    mainCanvas.context.font = "16px Lucida Console";
    mainCanvas.context.fillText(player.hp, 5, 15);
    // FPS Counter
    mainCanvas.context.fillStyle = "yellow";
    mainCanvas.context.font = "16px Lucida Console";
    mainCanvas.context.fillText(FPS, canvas.width -22, 15);
}
// Detect collision between an instance and all the instances in an array
function checkForCollision(instance, instanceArray) {
    var sphere = instance.boundingSphere;
    for (let i=0; i<instanceArray.length; i++) {
    let d = distance(sphere.position, instanceArray[i].position);
    if (d<sphere.radius) {
        return i;
    }
    }
    if (instance.children) {
    for (let i=0; i<instance.children.length; i++){
        checkForCollision(instance.children[i], instanceArray);
    }
    } else {
    return null;
    }
    
}
// Detect and handle damages between all enemies and the player projectiles
function checkEnemiesDamage(enemies, projectiles) {
    var projectilesInstances = [];
    for (let i = 0; i<projectiles.length; i++) {
    projectilesInstances.push(projectiles[i].instance);
    }
    for (let i = 0; i<enemies.length; i++) {
    let projIndex = checkForCollision(enemies[i].instance, projectilesInstances);
    if (projIndex!= null) {
        enemies[i].hp -= 1;
        projectiles.splice(projIndex,1);
        if (enemies[i].hp <=0) {
        enemies.splice(i,1);
        } else {
        redShift(enemies[i].instance, enemies[i].hp);
        }
    }
    
    }
    return [enemies, projectiles];
}
