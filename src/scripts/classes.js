//------------------------------------------------------------------------//
//                                 Enums                                  //
//------------------------------------------------------------------------//
const colors = {
        RED : [255, 0, 0],
        DARKRED : [155, 0, 0],
        GREEN : [0, 255, 0],
        GREENYELLOW : [153,235,17],
        BLUE : [0, 0, 255],
        YELLOW : [255, 255, 0],
        PURPLE : [255, 0, 255],
        CYAN : [0, 255, 255],
        INDIGO : [70,0,130],
        LIGHTINDIGO : [ 120,0,185],
        CORNFLOWER : [76,82,112],
        WHITE : [255,255,255],
        GREY : [80,80,80],
        DARKGREY : [40,40,40],
        LIGHTGREY : [120,120,120],
        BLACK : [0,0,0],
        ORANGE : [255,165,0],
        DARKPURPLE : [102,51,153],
        DEEPPINK : [255,20,147],
        CHARTREUSE : [127, 255, 0],
        DARKORANGE: [255, 140, 0]
    }
    const lightType = {
        AMBIENT : "ambient",
        POINT : "point",
        DIRECTIONAL : "directional"
    }

//------------------------------------------------------------------------//
//                                Classes                                 //
//------------------------------------------------------------------------//
class Vertex {
constructor(x,y,z=0,w=1) {
    this.x=x;
    this.y=y;
    this.z=z;
    this.w=w;
}
toString() {
    return "<" + this.x + ", " + this.y + ", " + this.z + ", " + this.w ;
}
toArray() {
    return [this.x,this.y,this.z,this.w];
}
toRGBA() {
    return [
    this.x * 255,
    this.y * 255,
    this.z * 255,
    this.w * 255
    ]
}
}
class Mat {
constructor(values) {
    this.values = values;
}
}
class Canvas {
constructor(canvas) {
    this.element = canvas;
    this.context=canvas.getContext("2d");
    this.buffer= this.context.getImageData(0, 0, canvas.width, canvas.height);
    this.pitch = this.buffer.width * 4;
    this.width = canvas.width;
    this.height= canvas.height;
}
}
class Triangle {
constructor(indices, normals, UVs, color, texture) {
    this.indices = indices;
    this.normals = normals;
    this.UVs = UVs;
    this.color = color;
    this.texture=texture;
}
}
class Scene {
constructor(instances, camera, lights) {
    this.instances = instances;
    this.camera = camera;
    this.lights =  lights;
}
}
class Model {
constructor(name,vertices,triangles, boundingSphere) {
    this.name=name;
    this.vertices=vertices;
    this.triangles=triangles;
}
}
class Instance {
constructor(model,position,rotation,scaling,reflectivity, children) {
    this.model=model;
    this.position = position;
    this.rotation = rotation;
    this.scaling = scaling;
    this.reflectivity = reflectivity;
    this.children = children;
    this.boundingSphere = new BoundingSphere(this.position, 0);
    this.colorShift = new Vertex (0,0,0);
}

translate (vector) {
    this.position.x += vector.x;
    this.position.y += vector.y;
    this.position.z += vector.z;
}
rotate (vector) {
    this.rotation.x += vector.x;
    this.rotation.y += vector.y;
    this.rotation.z += vector.z;
}
getBoundingSphere(vertices) {
    
    var highestX = vertices[0].x;
    var lowestX = vertices[0].x;
    var highestY = vertices[0].y;
    var lowestY = vertices[0].y;
    var highestZ = vertices[0].z;
    var lowestZ = vertices[0].z;
    for (let v of vertices) {
    if (v.x > highestX) {
        highestX = v.x;
    }
    if (v.x < lowestX) {
        lowestX = v.x;
    }
    if (v.y > highestY) {
        highestY = v.y;
    }
    if (v.y < lowestY) {
        lowestY = v.y;
    }
    if (v.z > highestZ) {
        highestZ = v.z;
    }
    if (v.z < lowestZ) {
        lowestZ = v.z;
    }
    }
    
    var mid = new Vertex((highestX+lowestX)/2,(highestY+lowestY)/2,(highestZ+lowestZ)/2);

    var radius=0;
    for (let v of vertices) {
    let d = distance(mid,v);
    if(d>radius) {
        radius=d;
    }
    }
    this.boundingSphere = new BoundingSphere(mid,radius);
    return this.boundingSphere;
}
}
class Camera {
constructor(position, orientation, clippingPlanes) {
    this.position = position;
    this.orientation = orientation;
    this.clippingPlanes = clippingPlanes
}
translate (vector) {
    this.position.x += vector.x;
    this.position.y += vector.y;
    this.position.z += vector.z;
}
}
class Plane {
constructor(normal, distance) {
    this.normal = normal;
    // distance from origin to plane. Same thing as D in plane equation.
    this.distance = distance;
}
}
class BoundingSphere {
constructor(position,radius) {
    this.position = position;
    this.radius = radius;
}
}
class Light {
    constructor(type, intensity, position, direction, color = vertexFromRGBA(colors.WHITE)) {
        this.type = type;
        this.intensity = intensity;
        this.position = position;
        this.direction = direction;
        this.color = color;
    }
    translate (vector) {
        this.position.x += vector.x;
        this.position.y += vector.y;
        this.position.z += vector.z;
    }
}
class Texture{
    constructor(source) {
        this.image = new Image();
        var texture = this;
        this.image.addEventListener('load', function() {
            texture.iw = texture.image.width;
            texture.ih = texture.image.height;

            texture.canvas = document.createElement("canvas");
            texture.canvas.width = texture.iw;
            texture.canvas.height = texture.ih;
            var ctx = texture.canvas.getContext("2d");
            ctx.drawImage(texture.image, 0, 0, texture.iw, texture.ih);
            texture.pixel_data = ctx.getImageData(0, 0, texture.iw, texture.ih);
        }, false);
        this.image.src = source;
    }
    getTexel(u, v) {
        var iu = Math.trunc(u*this.iw);
        var iv = Math.trunc(v*this.ih);

        var offset = (iv*this.iw*4 + iu*4);

        return new Vertex(
        this.pixel_data.data[offset + 0]/255,
        this.pixel_data.data[offset + 1]/255,
        this.pixel_data.data[offset + 2]/255
        );
    }
}
class GameEntity {
    constructor(name, instance, lights, hp, attackDelay, projDamage, projCount) {
        this.name = name;
        this.instance = instance;
        this.lights = lights;
        this.hp = hp;
        this.attackDelay = attackDelay;
        this.frameCount = 0;
        this.projDamage = projDamage;
        this.projCount = projCount;
    }
}
class Projectile {
    constructor(instance, lights, damage, speed) {
        this.instance = instance;
        this.lights = lights;
        this.damage = damage;
        this.speed = speed;
    }
}
