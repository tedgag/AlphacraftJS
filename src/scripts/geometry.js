//------------------------------------------------------------------------//
//                     Linear algebra and helpers                         //
//------------------------------------------------------------------------//
function add(v1, v2) {
    return new Vertex(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}
function subtract(v1, v2) {
    return new Vertex(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}
// Multiply a vector by a scalar
function multiply(s,v) {
    return new Vertex(s*v.x, s*v.y, s*v.z);
}
// Dot product between two vectors
function dotProduct(vec1, vec2) {
    return vec1.x*vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
}
// Cross product between two vectors
function crossProduct(vec1, vec2) {
    let i = vec1.y * vec2.z - vec1.z * vec2.y;
    let j = vec1.x * vec2.z - vec1.z * vec2.x;
    let k = vec1.x * vec2.y - vec1.y * vec2.x;
    return new Vertex(i, -j, k);
}
// Distance between two points.
function distance(p1,p2) {
    let d = Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2)
    if (p1.z && p2.z) {
        d += Math.pow(p2.z-p1.z,2)
    }
    return Math.sqrt(d);
}

// Mid point between two points.
function midVertex(p1,p2) {
    let x = Math.trunc((p1.x+p2.x)/2);
    let y = Math.trunc((p1.y+p2.y)/2);
    if (p1.z && p2.z) {
        let z = Math.trunc((p1.z+p2.z)/2);
        return new Vertex(x,y,z);
    } else {
        return new Vertex(x,y);
    }
}

// Return the transpose of the given matrix
function transpose(mat) {
    let result = [];
    let values = mat.values;
    for (let i=0;i<values.length;i++) {
        result[i]=[];
        for (let j=0;j<values[0].length;j++) {
            result[i][j]=values[j][i];
        }
    }
    return new Mat(result);
}
// Multiply a matrix by a vector.
function multiplyMV(mat,vec) {
    let v = vec.toArray();
    if (mat.values[0].length!=v.length) {
        return null;
    }
    let result=[];
    for (let i=0;i<v.length;i++) {
        result.push(0);
    }
    let values = mat.values;
    for (let i=0; i<values.length; i++) {
        for (let j=0; j<values[i].length; j++) {
        result[i] += values[i][j] * v[j];
        }
    }
    return result;
}
// Multiply a matrix by another matrix
function multiplyMM(mat1,mat2) {
    mat1Data = mat1.values;
    mat2Data = mat2.values;
    if (mat1Data[0].length!=mat2Data.length) {
        return null;
    }
    let result = [];
    for (let i=0;i<mat1Data.length;i++) {
        result[i]=[];
        for (let j=0;j<mat2Data[0].length;j++) {
        result[i][j]=0;
        }
    }
    for (let i=0; i<mat1Data.length; i++) {
        for (let j=0; j<mat2Data[i].length; j++){
        let dot=0;
        for (let k=0; k<mat1Data[i].length; k++){
            dot+= mat1Data[i][k] * mat2Data[k][j];
        }
        result[i][j] = dot;
        }
    }
    return new Mat(result);
}
function arrayToVertex(array) {
    return new Vertex(array[0], array[1], array[2]);
}
function interpolate(x0,y0,x1,y1) {
    if (x0==x1){
        return [ y0 ];
        
    }
    var values = [];
    var a = (y1-y0) / (x1-x0);
    var y = y0;
    for (let i = x0; i <= x1; i++) {
        values.push(y);
        y=y+a;
    }
    return values;
}
function interpolateEdges(x0,y0,x1,y1,x2,y2) {
    var y01 = interpolate(x0,y0,x1,y1);
    var y12 = interpolate(x1,y1,x2,y2);
    var y02 = interpolate(x0,y0,x2,y2);
    y01.pop();
    var y012 = y01.concat(y12);
    return [y02, y012];
}
// Get the normal of a triangle
function getTriangleNormal(v0,v1,v2){
    let v01 = subtract(v1, v0);
    let v02 = subtract(v2, v0);
    return crossProduct(v01,v02);
}
// Find the centroid of a triangle
function getCentroid(v0,v1,v2) {
    return multiply(1/3, add(add(v0, v1), v2));
}
// Find the point where the line defined by a and b intersect the plane
function planeIntersection(a,b, plane) {
    let bMinusA = subtract(a, b);
    let num = - plane.distance - dotProduct(plane.normal, a);
    let denum = dotProduct(plane.normal, bMinusA);
    let t = num/denum;
    let q =  add(a, multiply(t, bMinusA));
    return [q, t];
}
// Compute the value of an attribute at t
function computeAttribute(alphaA,alphaB,t) {
    return add(alphaA, multiply(t, subtract(alphaA, alphaB)));
}
function sortIndices(indices, vertices) {
    var i0 = 0;
    var i1 = 1; 
    var i2 = 2;
    // p0.y <= p1.y <= p2.y
    if (vertices[indices[i1]].y < vertices[indices[i0]].y) { 
        var i = i0; 
        i0 = i1; 
        i1 = i; 
    }
    if (vertices[indices[i2]].y < vertices[indices[i0]].y) { 
        var i = i0; 
        i0 = i2; 
        i2 = i; 
    }
    if (vertices[indices[i2]].y < vertices[indices[i1]].y) { 
        var i = i1; 
        i1 = i2; 
        i2 = i; 
    }
    return [i0,i1,i2];
}
function vectorLength(vec) {
    return Math.sqrt(Math.pow(vec.x, 2) + Math.pow(vec.y,2) + Math.pow(vec.z, 2));
}
function clamp(value) {
    if (value < 0) { return 0; }
    if (value > 1) { return 1; }
    return value;
}
function multiplyColors(color1, color2) {
    let r = clamp(color1.x * color2.x);
    let g = clamp(color1.y * color2.y);
    let b = clamp(color1.z * color2.z);
    let a = clamp(color1.w * color2.w);
    return new Vertex(r,g,b,a);
}
function addColors(color1, color2) {
    let r = color1.x + color2.x;
    let g = clamp(color1.y + color2.y);
    let b = clamp(color1.z + color2.z);
    let a = clamp(color1.w + color2.w);
    return new Vertex(r,g,b,a);
}
function toRad(angle) {
    return angle*Math.PI/180;
}
function toDeg(angle) {
    return angle*180/Math.PI;
}
function toUV(vertex) {
    let v = multiply(0.5, add(vertex, new Vertex(1,0,1)));
    return new Vertex(v.x,v.z);
}
function vertexFromRGBA(color) {
    if (colors.length == 4) {
        return new Vertex(color[0]/255, color[1]/255, color[2]/255, color[3]/255);
    } else {
        return new Vertex(color[0]/255, color[1]/255, color[2]/255, 1);
    }
}
//------------------------------------------------------------------------//
//                        Transformation Matrices                         //
//------------------------------------------------------------------------//

// Translation matrix to the given position vector
function makeTranslationMatrix(position) {
    let m = [
        [1,0,0,position.x],
        [0,1,0,position.y],
        [0,0,1,position.z],
        [0,0,0,1]
    ];
    return new Mat(m);
}
// Scale matrix for the given scaling vector
function makeScaleMatrix(scaling) {
    let m = [
        [scaling.x,0,0,0],
        [0,scaling.y,0,0],
        [0,0,scaling.z,0],
        [0,0,0,1]
    ];
    return new Mat(m);
}
// Rotation matrix around x by the given angle (in degrees)
function makeXRotationMatrix(angle) {
    let a = toRad(angle);
    let m = [
        [1,0,0,0],
        [0,Math.cos(a),-Math.sin(a),0],
        [0,Math.sin(a),Math.cos(a),0],
        [0,0,0,1]
    ];
    return new Mat(m);
}
// Rotation matrix around y by the given angle (in degrees)
function makeYRotationMatrix(angle) {
    let a = toRad(angle);
    let m = [
        [Math.cos(a),0,Math.sin(a),0],
        [0,1,0,0],
        [-Math.sin(a),0,Math.cos(a),0],
        [0,0,0,1]
    ];
    return new Mat(m);
}
// Rotation matrix around z by the given angle (in degrees)
function makeZRotationMatrix(angle) {
    let a = toRad(angle);
    let m = [
        [Math.cos(a),-Math.sin(a),0,0],
        [Math.sin(a),Math.cos(a),0,0],
        [0,0,1,0],
        [0,0,0,1]
    ];
    return new Mat(m);
}
function makeRotationMatrix(orientation) {
    let yRotationMat = makeYRotationMatrix(orientation.y);
    let xRotationMat = makeXRotationMatrix(orientation.x);
    let zRotationMat = makeZRotationMatrix(orientation.z);
    return multiplyMM(xRotationMat, multiplyMM(yRotationMat, zRotationMat));
}
function makeTransformMatrix(translationMat, rotationMat, scaleMat) {
    let mat = multiplyMM(rotationMat,scaleMat);
    return multiplyMM(translationMat,mat);
}
function makeCameraMatrix(camera) {
    let rotationMat = transpose(makeRotationMatrix(camera.orientation));
    let translationMat = makeTranslationMatrix(multiply(-1,camera.position));
    return multiplyMM(rotationMat,translationMat);
}