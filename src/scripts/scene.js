//------------------------------------------------------------------------//
//                              Scenes setup                              //
//------------------------------------------------------------------------//
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
var projectiles = [];

var player = createPlayer();

var realFPS = 0;
var lastLoop = (new Date()).getMilliseconds();
var count = 1;
//------------------------------------------------------------------------//
//                             Scene rendering                            //
//------------------------------------------------------------------------//
function frameLoop() {
    requestAnimationFrame(frameLoop);
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
    frameCount++;
    then = now - (elapsed % fpsInterval);
    clearBuffers(mainCanvas);
    let playerPosX = player.instance.position.x + playerTranslate.x;
    let playerAngleY = player.instance.rotation.y + playerRotate.y;
    if (playerPosX > -1.45 && playerPosX < 1.45) {
        player.instance.translate(playerTranslate);
        if (player.lights!= null) {
        player.lights.translate(playerTranslate);
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

    enemies = animateEnemies(enemies, frameCount);
    projectiles  = animateProjectiles(projectiles, playerPosX);
    [enemies, projectiles] = checkEnemiesDamage(enemies,projectiles);

    let newLights = lights.slice();
    let newForegroundInstances = dynamicForegroundInstances.slice();
    let newBackgroundInstances = dynamicBackgroundInstances.slice();
    let entities = [];
    entities.push(player);
    entities.push(enemies);
    entities.push(projectiles);
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
    updateHUD(mainCanvas, realFPS, player);
    
    }
}