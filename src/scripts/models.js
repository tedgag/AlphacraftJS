//------------------------------------------------------------------------//
//                          Geometrical Models                            //
//------------------------------------------------------------------------//
function createCubeModel(color, texture) {
  color = vertexFromRGBA(color);
  var vertices = [
    new Vertex(1,1,1),   // 0
    new Vertex(-1,1,1),  // 1
    new Vertex(-1,-1,1), // 2
    new Vertex(1,-1,1),  // 3
    new Vertex(1,1,-1),  // 4
    new Vertex(-1,1,-1), // 5
    new Vertex(-1,-1,-1),// 6
    new Vertex(1,-1,-1)  // 7
  ];
  var normals = [
    [new Vertex(0, 0, 1), new Vertex(0, 0, 1), new Vertex(0, 0, 1)],
    [new Vertex(0, 0, 1), new Vertex(0, 0, 1), new Vertex(0, 0, 1)],
    [new Vertex(1, 0, 0), new Vertex(1, 0, 0), new Vertex(1, 0, 0)],
    [new Vertex(1, 0, 0), new Vertex(1, 0, 0), new Vertex(1, 0, 0)],
    [new Vertex(0, 0, -1), new Vertex(0, 0, -1), new Vertex(0, 0, -1)],
    [new Vertex(0, 0, -1), new Vertex(0, 0, -1), new Vertex(0, 0, -1)],
    [new Vertex(-1, 0, 0), new Vertex(-1, 0, 0), new Vertex(-1, 0, 0)],
    [new Vertex(-1, 0, 0), new Vertex(-1, 0, 0), new Vertex(-1, 0, 0)],
    [new Vertex(0, 1, 0), new Vertex(0, 1, 0), new Vertex(0, 1, 0)],
    [new Vertex(0, 1, 0), new Vertex(0, 1, 0), new Vertex(0, 1, 0)],
    [new Vertex(0, -1, 0), new Vertex(0, -1, 0), new Vertex(0, -1, 0)],
    [new Vertex(0, -1, 0), new Vertex(0, -1, 0), new Vertex(0, -1, 0)],
  ];
  var UVs = [
    [new Vertex(0, 0), new Vertex(1, 0), new Vertex(1, 1)],
    [new Vertex(0, 0), new Vertex(1, 1), new Vertex(0, 1)],
    [new Vertex(0, 0), new Vertex(1, 0), new Vertex(1, 1)],
    [new Vertex(0, 0), new Vertex(1, 1), new Vertex(0, 1)],
    [new Vertex(0, 0), new Vertex(1, 0), new Vertex(1, 1)],
    [new Vertex(0, 0), new Vertex(1, 1), new Vertex(0, 1)],
    [new Vertex(0, 0), new Vertex(1, 0), new Vertex(1, 1)],
    [new Vertex(0, 0), new Vertex(1, 1), new Vertex(0, 1)],
    [new Vertex(0, 0), new Vertex(1, 0), new Vertex(1, 1)],
    [new Vertex(0, 0), new Vertex(1, 1), new Vertex(0, 1)], 
    [new Vertex(0, 0), new Vertex(1, 0), new Vertex(1, 1)], 
    [new Vertex(0, 0), new Vertex(1, 1), new Vertex(0, 1)]
  ];
  var triangles = [
    new Triangle([0,1,2], normals[0], UVs[0], color, texture),
    new Triangle([0,2,3], normals[1], UVs[1], color, texture),
    new Triangle([4,0,3], normals[2], UVs[2], color, texture),
    new Triangle([4,3,7], normals[3], UVs[3], color, texture),
    new Triangle([5,4,7], normals[4], UVs[4], color, texture),
    new Triangle([5,7,6], normals[5], UVs[5], color, texture),
    new Triangle([1,5,6], normals[6], UVs[6], color, texture),
    new Triangle([1,6,2], normals[7], UVs[7], color, texture),
    new Triangle([4,5,1], normals[8], UVs[8], color, texture),
    new Triangle([4,1,0], normals[9], UVs[9], color, texture),
    new Triangle([2,6,7], normals[10], UVs[10], color, texture),
    new Triangle([2,7,3], normals[11], UVs[11], color, texture)
  ];
  return new Model("Cube", vertices, triangles);
}

function createPlaneModel(color, texture) {
  color = vertexFromRGBA(color);
  var vertices = [
    new Vertex(1,0,1),   // 0
    new Vertex(-1,0,1),  // 1
    new Vertex(1,0,-1), // 2
    new Vertex(-1,0,-1),  // 3
  ]
  var normals = [
    [new Vertex(0, 1, 0), new Vertex(0, 1, 0), new Vertex(0, 1, 0)],
    [new Vertex(0, 1, 0), new Vertex(0, 1, 0), new Vertex(0, 1, 0)],
  ];
  var UVs = [
    [new Vertex(0, 1), new Vertex(1, 1), new Vertex(1, 0)],
    [new Vertex(0, 1), new Vertex(1, 0), new Vertex(0, 0)],
  ]
  var triangles = [
    new Triangle([2,3,1], normals[0], UVs[0], color, texture),
    new Triangle([2,1,0], normals[1], UVs[1], color, texture)
  ]
  return new Model("Plane", vertices, triangles);
}

function createPolyPlaneModel(sides, color, texture) {
  color = vertexFromRGBA(color);
  var angle = 360/sides;
  var vertices = [
    new Vertex(0,0,0), 
    new Vertex(Math.cos(toRad(0)), 0, Math.sin(toRad(0)))
  ];
  var triangles = [];
  var normals = [new Vertex(0, 1, 0), new Vertex(0, 1, 0), new Vertex(0, 1, 0)];
  for (var i=1; i<sides;i++) {
    vertices.push(new Vertex(Math.cos(toRad(angle*i)), 0, Math.sin(toRad(angle*i))));
    let UVs = [toUV(vertices[0]), toUV(vertices[i+1]), toUV(vertices[i]) ];
    triangles.push(new Triangle([0, i+1, i], normals, UVs, color, texture));
    
  }
  let UVs = [toUV(vertices[0]), toUV(vertices[1]), toUV(vertices[vertices.length-1])];

  triangles.push(new Triangle([0, 1, vertices.length-1], normals, UVs, color, texture));
  
  return new Model("PolyPlane", vertices, triangles);
}
// #TODO Compute UVs for textures
function createPyramidModel(sides, color) {
  color = vertexFromRGBA(color);
  var angle = 360/sides;
  var vertices = [
    new Vertex(0,0,0), // Center point of base
    new Vertex(0,1,0), // Apex
    new Vertex(Math.cos(toRad(0)), 0, Math.sin(toRad(0)))
  ];

  var triangles = [];
  var baseNormals = [new Vertex(0, -1, 0), new Vertex(0, -1, 0), new Vertex(0, -1, 0)];
  
  let UVs = [new Vertex(0, 0, 0), new Vertex(0, 0, 0), new Vertex(0, 0, 0)];
  for (var i=2; i<=sides;i++) {
    vertices.push(new Vertex(Math.cos(toRad(angle*(i-1))), 0, Math.sin(toRad(angle*(i-1)))));
    triangles.push(new Triangle([0, i, i+1], baseNormals, UVs, color));
    let normalAngle = toRad((angle*(i-1) - angle*(i-2))/2 + angle*(i-2));
    let sideNormal = new Vertex(Math.cos(normalAngle), 1, Math.sin(normalAngle));
    triangles.push(new Triangle([i, 1 , i+1], [sideNormal, sideNormal, sideNormal], UVs, color));
  }
  var normalAngle = toRad(360 - angle/2);
  var sideNormal = new Vertex(Math.cos(normalAngle), 1, Math.sin(normalAngle));
  triangles.push(new Triangle([0, vertices.length-1, 2], baseNormals, UVs, color));
  triangles.push(new Triangle([vertices.length-1, 1, 2], [sideNormal, sideNormal, sideNormal], UVs, color));

  return new Model("Pyramid", vertices, triangles);
}
function createPrismModel(sides, color) {
  color = vertexFromRGBA(color);
  var angle = 360/sides;
  var vertices = [
    new Vertex(0,0,0), // Center point of bottom base
    new Vertex(0,1,0), // Center point of top base
    new Vertex(Math.cos(toRad(0)), 0, Math.sin(toRad(0))),
    new Vertex(Math.cos(toRad(0)), 1, Math.sin(toRad(0)))
  ];

  var triangles = [];
  var bottomBaseNormals = [new Vertex(0, -1, 0), new Vertex(0, -1, 0), new Vertex(0, -1, 0)];
  var topBaseNormals = [new Vertex(0, 1, 0), new Vertex(0, 1, 0), new Vertex(0, 1, 0)];
  let UVs = [new Vertex(0, 0, 0), new Vertex(0, 0, 0), new Vertex(0, 0, 0)];

  for (var i=2; i<sides*2; i+=2) {
    vertices.push(new Vertex(Math.cos(toRad(angle*(i/2))), 0, Math.sin(toRad(angle*(i/2))))); // i+2
    vertices.push(new Vertex(Math.cos(toRad(angle*(i/2))), 1, Math.sin(toRad(angle*(i/2))))); // i+3
    triangles.push(new Triangle([0, i, i+2], bottomBaseNormals, UVs, color));
    triangles.push(new Triangle([1, i+3, i+1], topBaseNormals, UVs, color));
    let normalAngle = toRad((angle*(i/2) - angle*(i/2-1))/2 + angle*(i/2-1));
    let sideNormal = new Vertex(Math.cos(normalAngle), 0, Math.sin(normalAngle));
    triangles.push(new Triangle([i+1, i+2 , i], [sideNormal, sideNormal, sideNormal], UVs, color));
    triangles.push(new Triangle([i+1, i+3 , i+2], [sideNormal, sideNormal, sideNormal], UVs, color));
  }
  var normalAngle = toRad(360 - angle/2);
  var sideNormal = new Vertex(Math.cos(normalAngle), 0, Math.sin(normalAngle));
  triangles.push(new Triangle([0, vertices.length-2, 2], bottomBaseNormals, UVs, color));
  triangles.push(new Triangle([1, 3, vertices.length-1], topBaseNormals, UVs, color));
  triangles.push(new Triangle([vertices.length-2, vertices.length-1, 2], [sideNormal, sideNormal, sideNormal], UVs, color));
  triangles.push(new Triangle([ vertices.length-1, 3, 2], [sideNormal, sideNormal, sideNormal], UVs, color));

  return new Model("Prism", vertices, triangles);
}
// #TODO Compute UVs for textures
function createSphereModel(divs, color) {
  color = vertexFromRGBA(color);
  var vertices = [];
  var triangles = [];

  var delta_angle = 2.0*Math.PI / divs;

  // Generate vertices and normals.
  for (var d = 0; d < divs + 2; d++) {
    var y = (2.0 / divs) * (d - divs/2);
    var radius = Math.sqrt(1.0 - y*y);
    for (var i = 0; i < divs; i++) {
      var vertex = new Vertex(radius*Math.cos(i*delta_angle), y, radius*Math.sin(i*delta_angle));
      vertices.push(vertex);
    }
  }

  // Generate triangles.
  for (var d = 0; d < divs; d++) {
    for (var i = 0; i < divs; i++) {
      var i0 = d*divs + i;
      // Indices, normals, UVs, color, texture
      // Indices, color, normals
      let indices = [i0, i0+divs+1, i0+1];
      let normals = [vertices[i0], vertices[i0+divs+1], vertices[i0+1]];
      let UVs = [new Vertex(0,0,0), new Vertex(0,0,0), new Vertex(0,0,0)];
      triangles.push(new Triangle(indices,normals, UVs, color));
      indices = [i0, i0+divs, i0+divs+1];
      normals = [vertices[i0], vertices[i0+divs], vertices[i0+divs+1]];
      triangles.push(new Triangle(indices, normals, UVs, color));
    }
  }
  return new Model("Sphere", vertices, triangles);
}

var portalTexture = new Texture("ressources/textures/portal-texture.jpg");
var spaceTexture = new Texture("ressources/textures/space-texture-2.jpg");

var greyCube = createCubeModel(colors.GREY);
var whiteCube = createCubeModel(colors.WHITE);
var greenCube = createCubeModel(colors.GREEN);
var whitePlane = createCubeModel(colors.WHITE, spaceTexture);
var purplePolyPlane = createPolyPlaneModel(16, colors.PURPLE, );
var greyPlane = createPlaneModel(colors.GREY);
var whiteSphere = createSphereModel(5, colors.WHITE);
var darkRedSphere = createSphereModel(10, colors.DARKRED);
var lightGreySphere = createSphereModel(8, colors.LIGHTGREY);
var greySphere = createSphereModel(15, colors.GREY);
var orangeSphere = createSphereModel(6, colors.ORANGE);
var greyPolyPlane = createPolyPlaneModel(16, colors.WHITE, portalTexture);
var lightGrey6Pyramid = createPyramidModel(6, colors.LIGHTGREY);
var whitePrism = createPrismModel(6, colors.WHITE);
var grey8Prism = createPrismModel(8, colors.GREY);
var darkRed8Prism = createPrismModel(8, colors.DARKRED);
var indigo8Prism = createPrismModel(8, colors.INDIGO)
var grey3Prism = createPrismModel(3, colors.GREY);
var indigoPrism = createPrismModel(3, colors.INDIGO);
//------------------------------------------------------------------------//
//                              Game Models                               //
//------------------------------------------------------------------------//
function createPlayer() {
  var leftFlame = new Instance(orangeSphere, new Vertex(-0.4, -0.05, -0.1),new Vertex(0, 0, 0), new Vertex(0.15,0.05,0.3), -1);
  var rightFlame = new Instance(orangeSphere, new Vertex(0.4, -0.05, -0.1),new Vertex(0, 0, 0), new Vertex(0.15,0.05,0.3), -1);
  var rightReactor = new Instance(grey8Prism, new Vertex(0.4, -0.05, -0.1),new Vertex(0, 0, 0), new Vertex(0.25,0.05,0.5), 1000);
  var leftReactor = new Instance(grey8Prism, new Vertex(-0.4, -0.05, -0.1),new Vertex(0, 0, 0), new Vertex(0.25,0.05,0.5), 1000);
  var leftWing = new Instance(indigoPrism, new Vertex(-0.9, 0.17, 0),new Vertex(90, 192, 15), new Vertex(1,0.6,0.3), 1000);
  var rightWing = new Instance(indigoPrism, new Vertex(0.9, 0.17, 0),new Vertex(90, -14, 15), new Vertex(1,0.6,0.3), 1000);
  var cockpit = new Instance(whiteSphere, new Vertex(0, 0.2, -1),new Vertex(-90, 0, 0), new Vertex(0.3,0.75,0.1), 1000);
  var bodyParts = [cockpit, rightWing, leftWing,  rightReactor, leftReactor, leftFlame, rightFlame];
  var instance = new Instance(lightGrey6Pyramid, new Vertex(0, 0.5, 2.5),new Vertex(90,0, 0), new Vertex(0.25, 1, 0.1), 1000, bodyParts);
  var lightPosition = add(instance.position, new Vertex(0,-0.5,-0.4));
  var light = new Light(lightType.POINT, 0.2, lightPosition , null, vertexFromRGBA(colors.ORANGE));
  var player = new GameEntity("Player", instance, light, 100);
  return player;
}
function createGrunt(position) {
  var flame = new Instance(indigo8Prism, new Vertex(0, 1, 0),new Vertex(0, 0, 0), new Vertex(0.75,0.5,0.75), -1);
  var reactor = new Instance(grey8Prism, new Vertex(0, 0, 0.75),new Vertex(90, 0, 0), new Vertex(0.4,0.4,0.4), 1000, [flame]);
  var gun = new Instance(grey8Prism, new Vertex(0, -0.35, -1.1),new Vertex(90, 0, 0), new Vertex(0.2,0.2,0.2), 1000.);
  var leftWingTip = new Instance(grey3Prism, new Vertex(0.75, 0, -0.45),new Vertex(0,90, 0), new Vertex(1,1,0.3), 1000);
  var leftWing = new Instance(grey3Prism, new Vertex(-1, -0.27, 0),new Vertex(0, 0, 205), new Vertex(1.5,0.2,0.7), 1000, [leftWingTip]);
  var rightWingTip = new Instance(grey3Prism, new Vertex(0.75, 0, -0.45),new Vertex(0,90, 0), new Vertex(1,1,0.3), 1000);
  var rightWing = new Instance(grey3Prism, new Vertex(1, -0.5, 0),new Vertex(0, 0, -30), new Vertex(1.5,0.2,0.7), 1000, [rightWingTip]);
  var cockpit = new Instance(darkRedSphere, new Vertex(0, 0.3, -0.6),new Vertex(0, 0, 0), new Vertex(0.7,0.2,0.4), 0);
  var bodyParts = [leftWing, rightWing, cockpit, gun,reactor];
  var instance = new Instance(lightGreySphere, position,new Vertex(0,0, 0), new Vertex(0.25, 0.25, 0.4), 1000, bodyParts);
  var grunt = new GameEntity("Grunt", instance, null, 5);
  return grunt;
}