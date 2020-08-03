//------------------------------------------------------------------------//
//                               Clipping                                 //
//------------------------------------------------------------------------//
// Checks if the bounding sphere is inside the view frustum defined by the camera.
function checkForClipping(sphere, camera) {
    for (let p of camera.clippingPlanes) {
        let d = dotProduct(p.normal, sphere.position) + p.distance;
        if (d < -sphere.radius) {
        return true;
        }
    }
    return false;
}
// Clip the individual triangles in the model.
function clipModel(model, plane) {
    var newTriangles = [];
    var newVertices = model.vertices;
    for (let triangle of model.triangles) {
        let iIn = [];
        let iOut = [];
        let indices = triangle.indices;
        for (let i = 0; i<indices.length; i++) {
        let v = newVertices[indices[i]];
        if (dotProduct(plane.normal, v) + plane.distance > 0) {
            iIn.push(i);
        } else {
            iOut.push(i);
        }
        }
        if (iIn.length == 0) {
        // Do nothing
        } else if (iIn.length == 3) {
        newTriangles.push(triangle);
        } else if (iIn.length == 1) {
        // Compute plane intersections between A and C and B and C
        let A = newVertices[indices[iIn[0]]];
        let B = newVertices[indices[iOut[0]]];
        let C = newVertices[indices[iOut[1]]];
        let [q1, t1] = planeIntersection(A,B, plane);
        let [q2, t2] = planeIntersection(A,C, plane);
        // Compute new indices
        let newIndices = [];
        newIndices[iIn[0]] = newVertices.length;
        newVertices.push(q1);
        newIndices[iOut[0]] = newVertices.length;
        newVertices.push(q2);
        newIndices[iOut[1]] = indices[iIn[0]];
        // Compute new UVs
        let newUVs = [];
        newUVs[iIn[0]] = triangle.UVs[iIn[0]];
        newUVs[iOut[0]] = computeAttribute(triangle.UVs[iIn[0]],triangle.UVs[iOut[0]], t1);
        newUVs[iOut[1]] = computeAttribute(triangle.UVs[iIn[0]],triangle.UVs[iOut[1]], t2);
        newTriangles.push(new Triangle(newIndices, triangle.normals,newUVs, triangle.color, triangle.texture));
        } else if (iIn.length == 2) {
        let [q1, t1] = planeIntersection(newVertices[indices[iIn[0]]],newVertices[indices[iOut[0]]], plane);
        // Compute new indices for 1st triangle
        let newIndices1 = [];
        let newIndices2 = [];
        newIndices1[iOut[0]] = newVertices.length;
        newIndices2[iOut[0]] = newVertices.length;
        newVertices.push(q1);
        newIndices1[iIn[0]] = indices[iIn[0]];
        newIndices1[iIn[1]] = indices[iIn[1]];
            // Compute new UVs for 1st triangle
        let newUVs1 = [];
        newUVs1[iIn[0]] = triangle.UVs[iIn[0]];
        newUVs1[iIn[1]] = triangle.UVs[iIn[1]];
        newUVs1[iOut[0]] = computeAttribute(triangle.UVs[iIn[0]],triangle.UVs[iOut[0]], t1);
        newTriangles.push(new Triangle(newIndices1, triangle.normals, newUVs1, triangle.color, triangle.texture));
        
        let [q2, t2] = planeIntersection(newVertices[indices[iIn[1]]],newVertices[indices[iOut[0]]], plane); 

        // Compute new indices for 2nd triangle
        newIndices2[iIn[1]] = newVertices.length;
        newVertices.push(q2);
        newIndices2[iIn[0]] = indices[iIn[1]];
        // Compute new UVs for 2nd triangle
        let newUVs2 = [];
        newUVs2[iIn[0]] = triangle.UVs[iIn[1]];
        newUVs2[iIn[1]] = computeAttribute(triangle.UVs[iIn[1]],triangle.UVs[iOut[0]], t2);
        newUVs2[iOut[0]] = computeAttribute(triangle.UVs[iIn[0]],triangle.UVs[iOut[0]], t2);
        newTriangles.push(new Triangle(newIndices2, triangle.normals, newUVs2, triangle.color, triangle.texture));
        
        }
    }

    return new Model(model.name, newVertices, newTriangles);
}
//------------------------------------------------------------------------//
//                        Hidden surfaces removal                         //
//------------------------------------------------------------------------//

function updateDepthBuffer(x, y, zInv, canvas) {
    var x = canvas.width/2 + Math.trunc(x);
    var y = canvas.height/2 - Math.trunc(y) - 1;

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
        return false;
    }

    var offset = x + canvas.width*y;
    var data = depthBuffer[offset];
    if (data == undefined || data < zInv) {
        depthBuffer[offset] = zInv;
        return true;
    }

    return false;
}

function checkForCulling(transformed, indices) {
    var p0 = transformed[indices[0]];
    var p1 = transformed[indices[1]];
    var p2 = transformed[indices[2]];
    // Triangle normal
    var normal = getTriangleNormal(p0,p1,p2);
    // Triangle center
    var center = getCentroid(p0,p1,p2);
    // Direction vector from triangle to origin
    var vto = multiply(-1,center);
    return dotProduct(vto,normal) < 0;
}
//----------------------------------------------------------  --------------//
//                         Lighting and shadows                           //
//------------------------------------------------------------------------//

function computeLighting(vertex, normal,  scene, reflectivity) {
    if (reflectivity == -1) {
        return new Vertex(1,1,1);
    }
    //var totalLight = 0;
    var totalLight = new Vertex(0,0,0);

    for (let i = 0 ; i<scene.lights.length; i++) {
        
        light = scene.lights[i];
        let lightColor = light.color;
        
        if (light.type == lightType.AMBIENT) {
        let ambient = light.intensity;
        totalLight = add(totalLight, multiply(ambient, lightColor));
        } else {
        var vl;
        if (light.type == lightType.POINT) {
            vl = subtract(light.mat, vertex);
        } else if (light.type == lightType.DIRECTIONAL){
            vl = light.vl;
        }
        // Diffuse light
        let nDotL = dotProduct(normal, vl);
        var diffuse = 0;
        if (nDotL>0.2) { 
            if (light.type == lightType.POINT) {
            diffuse= 1/vectorLength(vl) * (light.intensity * nDotL / (vectorLength(normal) * vectorLength(vl)));
            } else {
            diffuse = light.intensity * nDotL / (vectorLength(normal) * vectorLength(vl));
            }
        }
        //Specular light
        var specular = 0;
        if (reflectivity != 0) {
            let vecR = subtract(multiply(2.0*dotProduct(normal, vl), normal), vl);
            let view = subtract(camera.position, vertex);
            let rDotV = dotProduct(vecR, view);
            if (rDotV > 0) {
            specular = light.intensity * Math.pow(rDotV / (vectorLength(vecR) * vectorLength(view)), reflectivity); 
            }
        }
        totalLight = add(totalLight, multiply(specular+diffuse, lightColor));
        
        }
    }
    return totalLight;
}
//------------------------------------------------------------------------//
//                              Rendering                                 //
//------------------------------------------------------------------------//
function viewportToCanvas(x,y, canvas) {
    return new Vertex(Math.trunc(x*canvas.width/viewportWidth), Math.trunc(y*canvas.height/viewportHeight));
}
function canvasToViewport(x,y, canvas) {
    return new Vertex(x*viewportWidth/canvas.width, y*viewportHeight/canvas.height);
}
function projectVertex(v, canvas) {
    return viewportToCanvas(v.x*zProjectionPlane/v.z,v.y*zProjectionPlane/v.z, canvas);
}
function unProjectVertex(x,y,z,canvas) {
    x = x*z / zProjectionPlane;
    y = y*z / zProjectionPlane;
    var p = canvasToViewport(x,y, canvas);
    return new Vertex(p.x, p.y, z);
}
function renderTriangle(triangle, transformed, projected, instance, scene, canvas, rotationMat) {
    
    
    // Sorted indices
    var [i0,i1,i2] = sortIndices(triangle.indices, projected);
    // Transformed vertices
    var t0 = transformed[triangle.indices[i0]];
    var t1 = transformed[triangle.indices[i1]];
    var t2 = transformed[triangle.indices[i2]];
    // Projected vertices
    var p0 = projected[triangle.indices[i0]];
    var p1 = projected[triangle.indices[i1]];
    var p2 = projected[triangle.indices[i2]];
    
    // Vertex normals 
    var transform = multiplyMM(transpose(makeRotationMatrix(scene.camera.orientation)), rotationMat);

    var n0 = arrayToVertex(multiplyMV(transform, triangle.normals[i0]));
    var n1 = arrayToVertex(multiplyMV(transform, triangle.normals[i1]));
    var n2 = arrayToVertex(multiplyMV(transform, triangle.normals[i2]));
    //Interpolated normal vectors for Phong shading
    var [nx02, nx012] = interpolateEdges(p0.y, n0.x, p1.y, n1.x, p2.y, n2.x);
    var [ny02, ny012] = interpolateEdges(p0.y, n0.y, p1.y, n1.y, p2.y, n2.y);
    var [nz02, nz012] = interpolateEdges(p0.y, n0.z, p1.y, n1.z, p2.y, n2.z);
    // Vertexs of the triangle edges
    var [x02, x012]   = interpolateEdges(p0.y,p0.x,p1.y,p1.x,p2.y,p2.x);
    var [iz02, iz012] = interpolateEdges(p0.y, 1.0/t0.z, p1.y, 1.0/t1.z, p2.y, 1.0/t2.z);
    // UV coordinates for textures
    var hasTexture = typeof triangle.texture === 'undefined' ? false : true; 
    if (hasTexture ) {
        var [uz02, uz012] = interpolateEdges(p0.y, triangle.UVs[i0].x / t0.z,p1.y, triangle.UVs[i1].x / t1.z,p2.y, triangle.UVs[i2].x / t2.z);
        var [vz02, vz012] = interpolateEdges(p0.y, triangle.UVs[i0].y / t0.z,p1.y, triangle.UVs[i1].y / t1.z,p2.y, triangle.UVs[i2].y / t2.z);
    }
    // Determine left and right sides
    var m = Math.trunc(x012.length/2);
    if (x02[m] < x012[m]) {
        var [xLeft, xRight] = [x02, x012];
        var [izLeft, izRight] = [iz02, iz012];
        var [nxLeft, nxRight] = [nx02, nx012];
        var [nyLeft, nyRight] = [ny02, ny012];
        var [nzLeft, nzRight] = [nz02, nz012];
        if (hasTexture) {
        var [uzLeft, uzRight] = [uz02, uz012];
        var [vzLeft, vzRight] = [vz02, vz012];
        }
    } else {
        var [xLeft, xRight] = [x012, x02];
        var [izLeft, izRight] = [iz012, iz02];
        var [nxLeft, nxRight] = [nx012, nx02];
        var [nyLeft, nyRight] = [ny012, ny02];
        var [nzLeft, nzRight] = [nz012, nz02];
        if (hasTexture) {
        var [uzLeft, uzRight] = [uz012, uz02];
        var [vzLeft, vzRight] = [vz012, vz02];
        }
    }
    
    // Draw the segments
    for (let y = p0.y, l1=p2.y; y <= l1; y++) {
        let y0 = p0.y;
        let xL = Math.trunc(xLeft[y-y0]);
        let xR = Math.trunc(xRight[y-y0]);
        
        let izSegment = interpolate(xL, izLeft[y - y0], xR, izRight[y - y0]);
        let nxSegment = interpolate(xL, nxLeft[y - y0], xR, nxRight[y - y0]);
        let nySegment = interpolate(xL, nyLeft[y - y0], xR, nyRight[y - y0]);
        let nzSegment = interpolate(xL, nzLeft[y - y0], xR, nzRight[y - y0]);
        let uzSegment, vzSegment;
        if (hasTexture) {
            uzSegment = interpolate(xL, uzLeft[y - y0], xR, uzRight[y - y0]);
            vzSegment = interpolate(xL, vzLeft[y - y0], xR, vzRight[y - y0]);
        }
        for (let x = xL, l2 = xR; x <= l2; x++) {
            if(instance.position.x == -1.1){
            }
            let iz = izSegment[x - xL];
            if (updateDepthBuffer(x, y, iz, canvas)) {  
                let vertex = unProjectVertex(x, y, 1.0/iz, canvas);
                let normal = new Vertex(nxSegment[x - xL], nySegment[x - xL], nzSegment[x - xL]);
                let totalLight = computeLighting(vertex, normal, scene, instance.reflectivity);
                let color;
                if (hasTexture) {
                    color = triangle.texture.getTexel(uzSegment[x - xL] / iz, vzSegment[x - xL] / iz);
                } else {
                    color = triangle.color;
                }
                color = addColors(color, instance.colorShift);
                let shadedColor = multiplyColors(totalLight, color);
                putPixel(x,y,shadedColor.toRGBA(), canvas);
            }
        }
    }
}
function renderInstance(instance, scene, canvas, parentMatrix, parentRotation) {
    if(instance == null) {
        return null;
    }
    var model = instance.model;
    var camera  = scene.camera;
    // Get the model matrix
    var translationMat = makeTranslationMatrix(instance.position);
    var rotationMat = makeRotationMatrix(instance.rotation);
    var scaleMat = makeScaleMatrix(instance.scaling);
    var modelMat, rotation;
    modelMat = multiplyMM(translationMat, multiplyMM(rotationMat,scaleMat));
    if (parentMatrix) {
        modelMat = multiplyMM(parentMatrix, modelMat);
        rotation = multiplyMM(parentRotation, rotationMat);
    } else {
        rotation = rotationMat;
    }

    var transformedVertices = [];
    // Get the vertices in world space
    for (let i = 0; i<model.vertices.length; i++) {
        transformedVertices[i] = arrayToVertex(multiplyMV(modelMat, model.vertices[i]));
    }
    // Check the model for clipping
    var boundingSphere = instance.getBoundingSphere(transformedVertices);
    if (checkForClipping(boundingSphere, camera)) {
        return null;
    }
    // Get the view matrix
    var viewMatrix = makeCameraMatrix(camera);
    // Getting the vertices in view space
    for (let i = 0; i<model.vertices.length; i++) {
        transformedVertices[i] = arrayToVertex(multiplyMV(viewMatrix, transformedVertices[i]));
    }

    var transformedModel = new Model(model.name, transformedVertices, model.triangles);

    // Check the individual model triangles for clipping
    for (let plane of camera.clippingPlanes) {
        transformedModel = clipModel(transformedModel, plane);
    }
    // Projecting the vertices in world space
    var projectedVertices = [];
    transformedVertices = transformedModel.vertices;
    for (let v of transformedVertices) {
        projectedVertices.push(projectVertex(v, canvas));
    }

    // Rendering the triangles
    for (let t of transformedModel.triangles) {
        if (!checkForCulling(transformedVertices, t.indices)) {
            renderTriangle(t, transformedVertices,projectedVertices, instance, scene, canvas, rotation);
        }
    }
    // Rendering any children instances
    if (instance.children) {
        for (let childrenInstance of instance.children) {
            renderInstance(childrenInstance,scene,canvas, modelMat, rotation);
        }
    }
}
function renderScene(scene, canvas) {
    for (var light of scene.lights) {
        if (light.type == lightType.DIRECTIONAL) {
        let mat =  makeRotationMatrix(scene.camera.orientation);
        light.vl = arrayToVertex(multiplyMV(mat, light.direction));
        } else if(light.type == lightType.POINT) {
        let cameraMat = makeCameraMatrix(camera);
        light.mat= arrayToVertex(multiplyMV(cameraMat, light.position));
        }
    }
    var instances = scene.instances;

    for (let i=0; i<instances.length; i++) {
        if (Array.isArray(instances[i])) {
        for (let j=0; j<instances[i].length; j++) {
            if (instances[i][j]!= null){
            renderInstance(instances[i][j], scene, canvas);
            }
        }
        } else {
        renderInstance(instances[i], scene, canvas);
        }
    }
}