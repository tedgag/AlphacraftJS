//------------------------------------------------------------------------------------------------//
//                                         Event Handling                                         //
//------------------------------------------------------------------------------------------------//
var playerTranslate = new Vertex(0,0,0);
var playerRotate = new Vertex(0,0,0);
var speed = 0.1;
var shoot = false;

// Laser projectile
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
    }
}

document.addEventListener('keydown', handleKeyPress, true);
document.addEventListener('keyup', handleKeyRelease, true);
//------------------------------------------------------------------------------------------------//
//                                         Animations                                             //
//------------------------------------------------------------------------------------------------//
// Limiting frame rate to 60 fps
var stop = false;
var fps =  30;
var fpsInterval, startTime, now, then, elapsed;

var attackDisableTimeout = 0;
var playerCanShoot = true;

var movementDisableTimeout = 0;
var playerCanMove =  true;
fpsInterval = 1000 / fps;
then = Date.now();
startTime = then;



function generateEnemySequence(difficulty, length) {
    var arrayLength = length;
    var sequenceArray = new Array(arrayLength).fill(0).map(() => new Array(3).fill(0));
    var oddsArray = [];
    switch (difficulty) {
        case 1:
            oddsArray[0] = 1;
            oddsArray[1] = 0;
            oddsArray[2] = 0;
            break;
        case 2:
            oddsArray[0] = 0.8;
            oddsArray[1] = 0;
            oddsArray[2] = 0.2;
            break;
        case 3:
            oddsArray[0] = 0.5;
            oddsArray[1] = 0.2;
            oddsArray[2] = 0.3;
            break;
    }
    
    for (let i=0; i<arrayLength; i+=2) {
        let numberOfEnemies = getRandomInt(difficulty);
       
        switch (++numberOfEnemies) {
            case 1:
                let total = 0;
                let threshold = Math.random();
                for (let j=0; j< 4; j++) {
                    total += oddsArray[j];
                    if (total > threshold) {
                            sequenceArray[i][getRandomInt(3)] = j+1;
                            break;
                    }
                }
                break;
            case 2:
                let emptyIndex = getRandomInt(3);
                for (let j=0; j< 3; j++) {
                    if (j != emptyIndex) {
                        let total = 0;
                        let threshold = Math.random();
                        for (let k=0; k<4; k++) {
                            total += oddsArray[k];
                            if (total > threshold) {
                                    sequenceArray[i][j] = k+1;
                                    break;                    
                            }
                        }
                    }
                }
                break;
            case 3:
                for (let j=0; j< 3; j++) {
                    let total = 0;
                    let threshold = Math.random();
                    for (let k=0; k<4; k++) {
                        total += oddsArray[k];
                        if (total > threshold) {
                                sequenceArray[i][j] = k+1;
                                break;                    
                        }
                    }
                }
                break;  
                
        }
    }
    for (let i=0; i<difficulty*2; i++) {
        sequenceArray[getRandomInt(arrayLength)][getRandomInt(3)] = 4;
    }
    sequenceArray[getRandomInt(arrayLength/2) + arrayLength/2][getRandomInt(3)] = 5;

    return sequenceArray;

}
function generateEnemies (entityArray,enemiesSequence, sequenceIndex) {
    let enemies = entityArray;
    let row = enemiesSequence[sequenceIndex];
    let position;
    for (let i=0; i<row.length; i++) {
        switch (row[i]) {
        case 0:
            continue;
        case 1:
            position = new Vertex(i-1, 0.5, 20);
            enemies.push(createDrone(position));
            break;
        case 2:
            position = new Vertex(i-1, 0.5, 20);
            enemies.push(createHunter(position));
            break;
        case 3:
            position = new Vertex(i-1, 0.5, 20);
            enemies.push(createCaster(position));
            break;
        case 4:
            position = new Vertex(i-1, 0.5, 20);
            enemies.push(createCarrier(position, "Health"));
            break;
        case 5:
            position = new Vertex(i-1, 0.5, 20);
            enemies.push(createCarrier(position, "Buff"));
            break;
        };
        
    }

    return enemies;
}
function animateEnemies(entityArray) {
    let enemies = entityArray;
    for (let i=0; i<enemies.length; i++) {
        if (enemies[i]!= null) {
            if  (enemies[i].instance.position.z < 1) {
                enemies.splice(i,1);
            } else {
                enemies[i].instance.translate(new Vertex(0,0,-0.075));
                    if (enemies[i].lights!= null) {
                    enemies[i].lights.translate(new Vertex(0,0,-0.1));
                }
            }
        }
    }
    return enemies;
}
function animatePlayer (player) {
    let playerPosX = player.instance.position.x + playerTranslate.x;
    let playerAngleY = player.instance.rotation.y + playerRotate.y;
    if(playerCanMove) {
        if (playerPosX > -1.45 && playerPosX < 1.45) {
                player.instance.translate(playerTranslate);
            if (player.lights!= null) {
                player.lights.translate(playerTranslate);
            }
        }
    } else {
        movementDisableTimeout++;
        if (movementDisableTimeout>60) {
            playerCanMove = true;
            movementDisableTimeout = 0;
            setColorShift(player.instance, new Vertex(0,0,0));
        }
    }
    if (playerAngleY >= -20 && playerAngleY <= 20 && playerRotate.y != 0){
        player.instance.rotate(new Vertex(0, playerRotate.y, 0));
    } else {
        if (playerAngleY < 0 && playerRotate.y == 0) {
            player.instance.rotate(new Vertex(0,20*speed,0));
        } else if (playerAngleY > 0 && playerRotate.y == 0) {
            player.instance.rotate(new Vertex(0,-20*speed,0));
        }
    }
    player.instance.rotate(new Vertex(0, 0, playerRotate.z));
    return player;
        
}
// true = right, false = left
var translateDirection = false;
function animateBoss(boss) {
    if (boss.instance.position.z > 15) {
        boss.instance.translate(new Vertex(0,0,-0.075));
    } else {
        if (translateDirection) {
            let bossPosX = boss.instance.position.x + 0.025;
            let bossAngleY = boss.instance.rotation.y - 1;
            if (bossPosX < 1.45 ) {
                boss.instance.translate(new Vertex(0.025, 0,0));
            } else {
                translateDirection = false;
                boss.instance.translate(new Vertex(-0.025, 0,0));
            }
            if (bossAngleY >= -10) {
                boss.instance.rotate(new Vertex(0, -1,0));
            }
        } else {
            let bossPosX = boss.instance.position.x - 0.025;
            let bossAngleY = boss.instance.rotation.y + 1;
            if (bossPosX > -1.45 ) {
                boss.instance.translate(new Vertex(-0.025, 0,0));
            } else {
                translateDirection = true;
                boss.instance.translate(new Vertex(0.025, 0,0));
            }
            if (bossAngleY <= 10) {
                boss.instance.rotate(new Vertex(0, 1,0));
            }
        }
        
    }
    return boss;
}
function animateBuffs(buffs){
    for (let i=0; i<buffs.length; i++) {
        if (buffs[i]!= null) {
            if  (buffs[i].instance.position.z < 1) {
                buffs.splice(i,1);
            } else {
                buffs[i].instance.translate(new Vertex(0,0,-0.075));
                buffs[i].instance.rotate(new Vertex(0,-5,0));
                    if (buffs[i].lights!= null) {
                        buffs[i].lights.translate(new Vertex(0,0,-0.075));
                }
            }
        }
    }
    return buffs;
}
function animateEnemyProjectiles(projectilesArray, enemyArray) {
    var enemies = enemyArray;
    var projectiles = projectilesArray;
    for (let i=0; i<enemies.length; i++) {
        let shoot = true;
        let enemyPosX = enemies[i].instance.position.x;
        let enemyPosZ = enemies[i].instance.position.z;
        if ( enemies[i].instance.position.z > 18) {
            shoot=false;
        } 
        for (let j=0; j<enemies.length; j++) {
            // Check if there is an ennemy in front of the shooting ennemy
            if (enemies[j].instance.position.x == enemyPosX &&
                enemies[j].instance.position.z < enemyPosZ) {
                shoot=false;
                break;
            }
        }
        if (shoot) {
            if (enemies[i].frameCount % enemies[i].attackDelay == 0) {
                switch(enemies[i].name) {
                    case "Drone": {
                        let projInstance = new Instance (
                            redCube, 
                            new Vertex(enemyPosX, 0.5, enemyPosZ-0.5), 
                            new Vertex(0, 0, 0), 
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        let projLight =  new Light (
                            lightType.POINT, 
                            0.1, 
                            projInstance.position, 
                            null, 
                            vertexFromRGBA(colors.RED)
                        );
                        projectiles.push(new Projectile("Normal", projInstance, projLight, 2, 0.2));
                        break;
                    }
                    case "Hunter": {
                        let projInstance = new Instance (
                            lightIndigoCube, 
                            new Vertex(enemyPosX, 0.5, enemyPosZ-0.5), 
                            new Vertex(0, 0, 0), 
                            new Vertex(0.02, 0.02, 0.3),
                            -1
                        );
                        let projLight =  new Light (
                            lightType.POINT, 
                            0.1, 
                            projInstance.position, 
                            null, 
                            vertexFromRGBA(colors.INDIGO)
                        );
                        projectiles.push(new Projectile("MovementDisable", projInstance, projLight, 7, 0.1));
                        break;
                    }
                    case "Caster": {
                        let projInstance = new Instance (
                            cyanSphere, 
                            new Vertex(enemyPosX, 0.5, enemyPosZ-0.5), 
                            new Vertex(0, 0, 0), 
                            new Vertex(0.1, 0.1, 0.1),
                            -1
                        );
                        let projLight =  new Light (
                            lightType.POINT, 
                            0.1, 
                            projInstance.position, 
                            null, 
                            vertexFromRGBA(colors.CYAN)
                        );
                        projectiles.push(new Projectile("ShootDisable", projInstance, projLight, 15, 0.1));
                        break;
                    }
                    case "Boss" : {
                        if (enemies[i].frameCount % (enemies[i].attackDelay * 7) == 0) {
                            let projInstance = new Instance (
                                cyanSphere, 
                                new Vertex(enemyPosX, 0.5, enemyPosZ-0.5), 
                                new Vertex(0, 0, 0), 
                                new Vertex(0.1, 0.1, 0.1),
                                -1
                            );
                            let projLight =  new Light (
                                lightType.POINT, 
                                0.1, 
                                projInstance.position, 
                                null, 
                                vertexFromRGBA(colors.CYAN)
                            );
                            projectiles.push(new Projectile("ShootDisable", projInstance, projLight, 10, 0.1));
                            break;
                        } else if (enemies[i].frameCount % (enemies[i].attackDelay * 13) == 0){
                            let projInstance = new Instance (
                                lightIndigoCube, 
                                new Vertex(enemyPosX, 0.5, enemyPosZ-0.5), 
                                new Vertex(0, 0, 0), 
                                new Vertex(0.02, 0.02, 0.3),
                                -1
                            );
                            let projLight =  new Light (
                                lightType.POINT, 
                                0.1, 
                                projInstance.position, 
                                null, 
                                vertexFromRGBA(colors.INDIGO)
                            );
                            projectiles.push(new Projectile("MovementDisable", projInstance, projLight, 5, 0.3));
                            break;
                        }
                        let projInstance = new Instance (
                            redCube, 
                            new Vertex(enemyPosX, 0.5, enemyPosZ-0.5), 
                            new Vertex(0, 0, 0), 
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        let projLight =  new Light (
                            lightType.POINT, 
                            0.1, 
                            projInstance.position, 
                            null, 
                            vertexFromRGBA(colors.RED)
                        );
                        projectiles.push(new Projectile("Normal", projInstance, projLight, 2, 0.2));
                        break;
                        
                    }
                };
                
            }
            enemies[i].frameCount++;
        }
    }
    for (let i=0; i<projectiles.length; i++) {
        if (projectiles[i] && projectiles[i]!= null) {
            if (projectiles[i].instance.position.z < 0) {
                projectiles.splice(i,1);
            } else {
                projectiles[i].instance.translate(new Vertex(0,0, -projectiles[i].speed));
                projectiles[i].lights.translate(new Vertex(0,0, -projectiles[i].speed));
            }
        }
    }
    
    return projectiles;
}

var lastPlayerShot = 0;

function animatePlayerProjectiles(projectiles, player) {
    var playerPosX = player.instance.position.x;
    if (playerCanShoot) {
        if (shoot) {  
            if (lastPlayerShot + player.attackDelay < player.frameCount ||
                player.frameCount++ % player.attackDelay == 0) {
                lastPlayerShot = player.frameCount;
                
                switch(player.projCount) {
                    case 1:
                        var projInstance = new Instance (
                            greenCube,
                            new Vertex(playerPosX, 0.5, 3),
                            new Vertex(0,  0, 0),
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        var projLight =  new Light(
                            lightType.POINT,
                            0.1,
                            projInstance.position,
                            null,
                            vertexFromRGBA(colors.GREEN)
                        );
                        var projectile = new Projectile("Player",
                            projInstance,
                            projLight,
                            player.projDamage,
                            0.3
                        );
                        projectiles.push(projectile);
                        break;
                    case 2: 
                        var projInstance1 = new Instance (
                            greenCube,
                            new Vertex(playerPosX-0.2, 0.5, 3),
                            new Vertex(0,  0, 0),
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        var projLight1 =  new Light(
                            lightType.POINT,
                            0.1,
                            projInstance1.position,
                            null,
                            vertexFromRGBA(colors.GREEN)
                        );
                        var projInstance2 = new Instance (
                            greenCube,
                            new Vertex(playerPosX+0.2, 0.5, 3),
                            new Vertex(0,  0, 0),
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        var projLight2 =  new Light(
                            lightType.POINT,
                            0.1,
                            projInstance2.position,
                            null,
                            vertexFromRGBA(colors.GREEN)
                        );
                        var projectile1 = new Projectile("Player", projInstance1, projLight1, player.projDamage, 0.3);
                        projectiles.push(projectile1);
                        var projectile2 = new Projectile("Player", projInstance2, projLight2, player.projDamage, 0.3);
                        projectiles.push(projectile2);
                        break;
                    case 3:
                        var projInstance1 = new Instance (
                            greenCube,
                            new Vertex(playerPosX-0.2, 0.5, 3),
                            new Vertex(0,  0, 0),
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        var projLight1 =  new Light(
                            lightType.POINT,
                            0.1,
                            projInstance1.position,
                            null,
                            vertexFromRGBA(colors.GREEN)
                        );
                        var projInstance2 = new Instance (
                            greenCube,
                            new Vertex(playerPosX+0.2, 0.5, 3),
                            new Vertex(0,  0, 0),
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        var projLight2 =  new Light(
                            lightType.POINT,
                            0.1,
                            projInstance2.position,
                            null,
                            vertexFromRGBA(colors.GREEN)
                        );
                        var projInstance3 = new Instance (
                            greenCube,
                            new Vertex(playerPosX, 0.5, 3),
                            new Vertex(0,  0, 0),
                            new Vertex(0.02, 0.02, 0.2),
                            -1
                        );
                        var projLight3 =  new Light(
                            lightType.POINT,
                            0.1,
                            projInstance3.position,
                            null,
                            vertexFromRGBA(colors.GREEN)
                        );
                        var projectile1 = new Projectile("Player", projInstance1, projLight1, player.projDamage, 0.3);
                        projectiles.push(projectile1);
                        var projectile2 = new Projectile("Player", projInstance2, projLight2, player.projDamage, 0.3);
                        projectiles.push(projectile2);
                        var projectile3 = new Projectile("Player", projInstance3, projLight3, player.projDamage, 0.3);
                        projectiles.push(projectile3);
                        break;
                        
                } 
            }
        }
    } else {
        attackDisableTimeout++;
        if (attackDisableTimeout>60) {
            playerCanShoot = true;
            attackDisableTimeout = 0;
            setColorShift(player.instance, new Vertex(0,0,0));
        }
    }
    for (let i=0; i<projectiles.length; i++) {
        if (projectiles[i] && projectiles[i]!= null) {
            if  (projectiles[i].instance.position.z > 20) {
                projectiles.splice(i,1);
            } else {
                projectiles[i].instance.translate(new Vertex(0, 0, projectiles[i].speed));
                projectiles[i].lights.translate(new Vertex(0, 0, projectiles[i].speed));
            }
        }
    }
    return projectiles;
}

//------------------------------------------------------------------------------------------------//
//                                          Collisions                                            //
//------------------------------------------------------------------------------------------------//

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
        for (let i=0; i<instance.children.length; i++) {
            let index = checkForCollision(instance.children[i], instanceArray);
            if (index!=null) {
                return index;
            }
        }
    } else {
        return null;
    }
    
}
// Detect and handle damages between all enemies and the player projectiles
function checkEnemiesDamage(enemies, projectiles, player, buffs) {
    var projectilesInstances = [];
    for (let i = 0; i<projectiles.length; i++) {
        projectilesInstances.push(projectiles[i].instance);
    }
    for (let i = 0; i<enemies.length; i++) {
        if(enemies[i].instance.position.z < 18) {
            let projIndex = checkForCollision(enemies[i].instance, projectilesInstances);
            if (projIndex!= null && projectiles[projIndex]) {
                enemies[i].hp -= projectiles[projIndex].damage;
                projectiles.splice(projIndex,1);
                if (enemies[i].hp <=0) {
                    let position = enemies[i].instance.position;
                    switch (enemies[i].name) {
                        case "healthCarrier":
                            buffs.push(createBuff(position,"HP"));
                            break;
                        case "buffCarrier":
                            let type = generateBuffType(player);
                            if (type != null) {
                                buffs.push(createBuff(position,type));
                            } else {
                                buffs.push(createBuff(position,"HP"));
                            }
                            break;
                    }
                    enemies.splice(i,1);
                    
                } else {
                    setColorShift(enemies[i].instance, new Vertex(0.5 * 1/enemies[i].hp,0,0));
                }
            }
        }
    }
    return [enemies, projectiles, player, buffs];
}

// Detect and handle damages between the player and all enemies projectiles and all enemies
function checkPlayerDamage(player, projectiles, enemies) {
    var projectilesInstances = [];
    for (let i = 0; i<projectiles.length; i++) {
        projectilesInstances.push(projectiles[i].instance);
    }
    let projIndex = checkForCollision(player.instance, projectilesInstances);
    if (projIndex!= null) {
        player.hp -= projectiles[projIndex].damage;
        if (projectiles[projIndex].type == "ShootDisable") {
            playerCanShoot = false;
            attackDisableTimeout = 0;
            setColorShift(player.instance, new Vertex(0,0.25,0.25));
        }
        if (projectiles[projIndex].type == "MovementDisable") {
            playerCanMove = false;
            movementDisableTimeout = 0
            setColorShift(player.instance, new Vertex(0.25,0,0.25));
        }
        projectiles.splice(projIndex,1);
        
    }
    var enemyInstances = [];
    for (let i = 0; i<enemies.length; i++) {
        enemyInstances.push(enemies[i].instance);
    }
    let enemyIndex = checkForCollision(player.instance, enemyInstances);
    if (enemyIndex!= null) {
        player.hp -= 20;
        enemies.splice(enemyIndex,1);
    }
    
    return [player, projectiles, enemies];
}
function checkBuffsCollision(player, buffs) {
    var buffsInstances = [];
    for (let i = 0; i<buffs.length; i++) {
        if (buffs[i]) {
            buffsInstances.push(buffs[i].instance);
        }
    }
    let buffIndex = checkForCollision(player.instance, buffsInstances);
    if (buffIndex!= null) {
        switch (buffs[buffIndex].name) {
            case "HPBuff":
                player.hp += 25;
                if (player.hp > 100) {
                    player.hp = 100;
                }
                break;
            case "DMGBuff":
                player.projDamage += 1;
                if (player.projDamage > 3) {
                    player.projDamage = 3;
                }
                break;
            case "PROJBuff":
                player.projCount += 1;
                if (player.projCount > 3) {
                    player.projCount = 3;
                }
                break;
            case "FRBuff":
                player.attackDelay -= 2;
                if (player.attackDelay < 4) {
                    player.attackDelay = 4;
                }
                break;
        }
        buffs.splice(buffIndex,1);
    }
    
    return [player, buffs];
}
//------------------------------------------------------------------------------------------------//
//                                      Update Functions                                          //
//------------------------------------------------------------------------------------------------//
function setColorShift(instance, color){
    instance.colorShift = color;
    if (instance.children) {
        for (let i=0; i<instance.children.length; i++) {
            setColorShift(instance.children[i], color);
        }
    }
}
function updateHUD(canvas, FPS, player, difficulty, enemies) {
    // Game Over message
    if(player.hp <=0) {
        mainCanvas.context.fillStyle = "red";
        mainCanvas.context.font = "32px Lucida Console";
        mainCanvas.context.fillText("GAME OVER", canvas.width/2-85, canvas.height/2);
        mainCanvas.context.fillStyle = "yellow";
        mainCanvas.context.font = "12px Lucida Console";
        mainCanvas.context.fillText("refresh to try again", canvas.width/2-73, canvas.height/2+30);
    } else if (difficulty > 4 && enemies.length == 0) {
        mainCanvas.context.fillStyle = "green";
        mainCanvas.context.font = "32px Lucida Console";
        mainCanvas.context.fillText("VICTORY", canvas.width/2-67, canvas.height/2);
        mainCanvas.context.fillStyle = "yellow";
        mainCanvas.context.font = "12px Lucida Console";
        mainCanvas.context.fillText("refresh to play again", canvas.width/2-73, canvas.height/2+30);
    } else {
        // Player HP Counter
        switch (Math.ceil(player.hp/25)) {
            case 4:
                mainCanvas.context.fillStyle = "lightgreen";
                break;
            case 3:
                mainCanvas.context.fillStyle = "yellow";
                break;
            case 2: 
                mainCanvas.context.fillStyle = "orange";
                break;
            case 1:
                mainCanvas.context.fillStyle = "red";
                break;
        }
        
        mainCanvas.context.font = "14px Lucida Console";
        mainCanvas.context.fillText("HP:" + player.hp, 5, 15);
        // Boss HP
        if (difficulty == 4 && enemies[0]) {
            mainCanvas.context.fillStyle = "cyan";
            mainCanvas.context.font = "14 px Lucida Console";
            mainCanvas.context.fillText("BOSS HP:"  + enemies[0].hp, 5, 30);
        }
        // DMG Counter
        mainCanvas.context.fillStyle = "deeppink";
        mainCanvas.context.fillText("DMG:" + player.projDamage, 5, canvas.height-35);
        // PROJ Counter
        mainCanvas.context.fillStyle = "chartreuse";
        mainCanvas.context.fillText("PROJ:" + player.projCount, 5, canvas.height-20);
        // FR Counter
        mainCanvas.context.fillStyle = "darkorange";
        switch (player.attackDelay) {
            case 10:
                mainCanvas.context.fillText("FR:" + 1, 5, canvas.height-5);
                break;
            case 8:
                mainCanvas.context.fillText("FR:" + 2, 5, canvas.height-5);
                break;
            case 6:
                mainCanvas.context.fillText("FR:" + 3, 5, canvas.height-5);
                break;
        }
        // Current wave
        if (difficulty < 4) {
            mainCanvas.context.fillStyle = "cyan";
            mainCanvas.context.font = "14 px Lucida Console";
            mainCanvas.context.fillText("Wave " + currentDifficulty, canvas.width/2-21, 16);
        } else if (difficulty == 4) {
            mainCanvas.context.fillStyle = "red";
            mainCanvas.context.font = "14 px Lucida Console";
            mainCanvas.context.fillText("FINAL WAVE", canvas.width/2-42, 16);
        }
        // FPS Counter
        mainCanvas.context.fillStyle = "yellow";
        mainCanvas.context.font = "16px Lucida Console";
        mainCanvas.context.fillText(FPS, canvas.width -22, 15);
    }
}
function generateBuffType (player) {
    var types = []
    if (player.projDamage < 3) {
        types.push("DMG");
    }
    if (player.projCount < 3) {
        types.push("PROJ");
    }
    if (player.attackDelay > 6) {
        types.push("FR");
    }
    if( types.length != 0) {
        var type = types[Math.floor(Math.random() * types.length)];
        return type;
    } else {
        return null;
    }
}