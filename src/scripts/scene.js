//------------------------------------------------------------------------------------------------//
//                                         Scenes setup                                           //
//------------------------------------------------------------------------------------------------//
var dynamicForegroundInstances = [];
var dynamicBackgroundInstances = [
    new Instance(greyPolyPlane, new Vertex(0, 1.5, 18),new Vertex(-90, 0, 0), new Vertex(3, 0, 3), -1),
];
var staticForegroundInstances = [
    //new Instance(greyPlane, new Vertex(0, 0.2, 7.5),new Vertex(0, 0, 0), new Vertex(1.75, 0, 10), 0),
    //new Instance(whiteCube, new Vertex(1.75, 0.2, 2),new Vertex(0, 180, 0), new Vertex(0.1, 0.1, 5), -1),
    //new Instance(whiteCube, new Vertex(-1.75, 0.2, 2),new Vertex(0, 180, 0), new Vertex(0.1, 0.1, 5), -1),
];
var staticBackgroundInstances = [
    new Instance(whitePlane, new Vertex(0, -2, 15),new Vertex(-90, 0, 0), new Vertex(10, 0, 10), 0),
];

// Distance between near plane and origin
var zProjectionPlane = 1;
//Viewport info
var viewportWidth = 1;
var viewportHeight = 1;
// #TODO Compute the planes normals for any fovs.
var clippingPlanes = [
    new Plane(new Vertex(0, 0, 1), -zProjectionPlane), // Near
    new Plane(new Vertex(Math.sqrt(2) , 0, Math.sqrt(2)), 0), // Left
    new Plane(new Vertex(-Math.sqrt(2), 0, Math.sqrt(2)), 0), // Right
    new Plane(new Vertex(0, -Math.sqrt(2), Math.sqrt(2)), 0), // Top
    new Plane(new Vertex(0, Math.sqrt(2),Math.sqrt(2)), 0),
];
// Position, rotation, clipping planes
var camera = new Camera(new Vertex(0, 2, 0), new Vertex(15, 0, 0), clippingPlanes);
// type, totalLight, position, direction
var lights = [
    new Light(lightType.AMBIENT, 0.8),
    new Light(lightType.POINT, 10, new Vertex(0, 3, 18)),
    //new Light(lightType.DIRECTIONAL, 0.8, null, new Vertex(4,2,-3)),
];
var foregroundStatic = new Scene(staticForegroundInstances , camera, lights);
var backgroundStatic = new Scene(staticBackgroundInstances , camera, lights);

var enemies = [];
var playerProjectiles = [];
var enemyProjectiles = [];
var buffs = [];
var globalFrameCount = 0;
var player = createPlayer();
var boss = null;
var gameOver = false;
var realFPS = 0;
var lastLoop = (new Date()).getMilliseconds();
var count = 1;
var arrayEndFrame = 0;
var timeoutFrames = 0;
var currentDifficulty = 0;
var sequenceLength = 40;
var enemiesSequence = generateEnemySequence(currentDifficulty, sequenceLength);
var sequenceIndex = sequenceLength;
//------------------------------------------------------------------------------------------------//
//                                      Scenes Rendering                                          //
//------------------------------------------------------------------------------------------------//
function frameLoop() {
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        var currentLoop = (new Date()).getMilliseconds();
        if (lastLoop > currentLoop) {
            realFPS = count;
            count = 1;
        } else {
            count += 1;
        }
        lastLoop = currentLoop;
        globalFrameCount++;
        then = now - (elapsed % fpsInterval);
        clearBuffers(mainCanvas);
        // Enemy generation
        if (boss == null) {
            if (sequenceIndex == -1) {
                arrayEndFrame = frames;
                timeoutFrames++;
                if (timeoutFrames > 120 || currentDifficulty == 1) {
                    timeoutFrames = 0;
                    sequenceIndex = 0;
                }
            } else if (enemiesSequence.length == sequenceIndex) {
                if (enemies.length == 0) {
                    sequenceIndex = -1;
                    currentDifficulty++;
                    if (currentDifficulty != 4) {
                        enemiesSequence = generateEnemySequence(currentDifficulty, sequenceLength);
                    } else {
                        boss = createBoss();
                        enemies.push(boss);
                    }
                }
            } else {
                if ( globalFrameCount % 30 == 0) {
                    enemies = generateEnemies(enemies, enemiesSequence, sequenceIndex);
                    sequenceIndex++;
                }
            }
            enemies = animateEnemies(enemies);
        } else {
            if (boss.hp >0) {
                boss = animateBoss(boss);
            } else {
                currentDifficulty++
            } 
        }
        // Animations
        buffs = animateBuffs(buffs);
        player = animatePlayer(player);
        playerProjectiles  = animatePlayerProjectiles(playerProjectiles, player);
        enemyProjectiles  = animateEnemyProjectiles(enemyProjectiles, enemies);
        // Collision checks
        [enemies, playerProjectiles, player, buffs] = checkEnemiesDamage(enemies,playerProjectiles,player, buffs);
        [player, enemyProjectiles, enemies] = checkPlayerDamage(player,enemyProjectiles, enemies);
        [player, buffs] = checkBuffsCollision(player, buffs);

        let newLights = lights.slice();
        let newForegroundInstances = dynamicForegroundInstances.slice();
        let newBackgroundInstances = dynamicBackgroundInstances.slice();
        let entities = [];
        if (player.hp > 0) {
            entities.push(player);
        }
        entities.push(enemies);
        entities.push(playerProjectiles);
        entities.push(enemyProjectiles);
        entities.push(buffs);

        for (let i = 0; i< entities.length; i++) {
            if (Array.isArray(entities[i])) {
            for (let j=0; j<entities[i].length; j++) {
                if (entities[i][j].lights != null) {
                    if (Array.isArray(entities[i][j].lights)) {
                        for (let k = 0; k<entities[i][j].lights.length; k=0){
                        newLights.push(entities[i][j].lights[k]);
                        }
                    } else {
                        newLights.push(entities[i][j].lights);
                    }
                }
                newForegroundInstances.push(entities[i][j].instance);
            }
            } else {
                if (entities[i].lights != null) {
                    if (Array.isArray(entities[i].lights)) {
                    for (let k = 0; k<entities[i].lights.length; k=0){
                        newLights.push(entities[i].lights[k]);
                    }
                    } else {
                    newLights.push(entities[i].lights);
                    }
                } 
                newForegroundInstances.push(entities[i].instance);
            }
        }
        // Setting up the scenes
        let foregroundDynamic = new Scene(newForegroundInstances, camera, newLights);
        let backgroundDynamic = new Scene(newBackgroundInstances, camera, newLights);

        // Drawing the scenes
        mainCanvas.context.drawImage(offScreenBackCanvas.element, 0, 0);  
        mainCanvas.buffer = mainCanvas.context.getImageData(0, 0, canvas.width, canvas.height);
        backgroundDynamic.instances[0].rotate(new Vertex(0,0.3,0));
        renderScene(backgroundDynamic,mainCanvas);
        updateCanvas(mainCanvas);
        mainCanvas.context.drawImage(offScreenFrontCanvas.element, 0, 0);  
        mainCanvas.buffer = mainCanvas.context.getImageData(0, 0, canvas.width, canvas.height);
        renderScene(foregroundDynamic,mainCanvas);
        updateCanvas(mainCanvas);
        updateHUD(mainCanvas, realFPS, player, currentDifficulty, enemies);
    }
    if (player.hp>0 && (currentDifficulty < 5 || enemies.length != 0)) {
        requestAnimationFrame(frameLoop);
    }
}