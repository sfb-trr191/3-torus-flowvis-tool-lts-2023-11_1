const glMatrix = require("gl-matrix");
const seedrandom = require("seedrandom");

function getMatrixFromRowMajor(row_major){
    //console.log("row_major", row_major);
    return glMatrix.mat4.fromValues(
        row_major[0], row_major[4], row_major[8], row_major[12],
        row_major[1], row_major[5], row_major[9], row_major[13],
        row_major[2], row_major[6], row_major[10], row_major[14],
        row_major[3], row_major[7], row_major[11], row_major[15],)
}

function getRxy(theta){
    var row_major = [
        Math.cos(theta), - Math.sin(theta), 0, 0,
        Math.sin(theta), Math.cos(theta), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,           
    ];
    return getMatrixFromRowMajor(row_major);
}

function getRyz(theta){
    var row_major = [
        1, 0, 0, 0,
        0, Math.cos(theta), - Math.sin(theta), 0,
        0, Math.sin(theta), Math.cos(theta), 0,
        0, 0, 0, 1,           
    ];
    return getMatrixFromRowMajor(row_major);
}

function getRzw(theta){
    var row_major = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, Math.cos(theta), - Math.sin(theta),
        0, 0, Math.sin(theta), Math.cos(theta),           
    ];
    return getMatrixFromRowMajor(row_major);
}

/**
 * Generates a rotation matrix that rotates an arbitrary point P to (0,0,0,|P|).
 * Make sure that the object was translated to origin before.
 * @param {*} point (glMatrix.vec4) The point to be rotated
 */
 function getAligned4DRotationMatrix(point){
    var point_tmp = glMatrix.vec4.create();
    //note: the function signature of atan2 is atan2(y,x) and it returns the angle between positive x-axis and the ray from origin to (x,y).


    //rotate inside xy plane so that the result is (0, y', z, w)
    var x = point[0];
    var y = point[1];
    var theta = Math.atan2(x, y);
    var Rxy = getRxy(theta);
    glMatrix.vec4.transformMat4(point_tmp, point, Rxy);

    //rotate inside yz plane so that the result is (0, 0, z', w)
    var y = point_tmp[1];
    var z = point_tmp[2];
    var theta = Math.atan2(y, z);
    var Ryz = getRyz(theta);
    glMatrix.vec4.transformMat4(point_tmp, point_tmp, Ryz);

    //rotate inside zw plane so that the result is (0, 0, 0, w')
    var z = point_tmp[2];
    var w = point_tmp[3];
    var theta = Math.atan2(z, w);
    var Rzw = getRzw(theta);
    glMatrix.vec4.transformMat4(point_tmp, point_tmp, Rzw);

    //generate combined rotation matrix
    var matrixCombined = glMatrix.mat4.create();
    glMatrix.mat4.multiply(matrixCombined, Ryz, Rxy);
    glMatrix.mat4.multiply(matrixCombined, Rzw, matrixCombined);
    return matrixCombined;
}

/**
 * Rotates a vector v by angle theta in the plane spanned by x and y.
 * 
 * x and y are assumed to be orthogonal.
 * 
 * @param {*} v Vector to be rotated [glMatrix.vec4]
 * @param {*} theta rotation angle [float]
 * @param {*} x One unit vector of the plane [glMatrix.vec4]
 * @param {*} y Other unit vector of the plane [glMatrix.vec4]
 */
function RotateVectorInPlane(v, theta, x, y){    
    var v_dot_x = glMatrix.vec4.dot(v, x);
    var v_dot_y = glMatrix.vec4.dot(v, y);
    var scalar_1 = v_dot_x * Math.cos(theta) - v_dot_y * Math.sin(theta);
    var scalar_2 = v_dot_y * Math.cos(theta) + v_dot_x * Math.sin(theta);
    var result = glMatrix.vec4.create();
    glMatrix.vec4.scale(result, x, scalar_1);
    glMatrix.vec4.scaleAndAdd(result, result, y, scalar_2);
    glMatrix.vec4.add(result, result, v);
    glMatrix.vec4.scaleAndAdd(result, result, x, -v_dot_x);
    glMatrix.vec4.scaleAndAdd(result, result, y, -v_dot_y);

    return result;
}

function PrintPointAndResult(point){
    var mat = getAligned4DRotationMatrix(point); 
    var result = glMatrix.vec4.create();
    glMatrix.vec4.transformMat4(result, point, mat);
    console.log("--------------");
    console.log("point", point);
    console.log("result", result);
    console.log("length", glMatrix.vec4.length(point), glMatrix.vec4.length(result));
}

/**
 * get rotation matrix from point1, apply to both points, check if distance stays the same.
 * @param {*} point1 
 * @param {*} point2 
 */
function TestDistanceSecondPoint(point1, point2){
    var mat = getAligned4DRotationMatrix(point1); 
    var result1 = glMatrix.vec4.create();
    var result2 = glMatrix.vec4.create();
    glMatrix.vec4.transformMat4(result1, point1, mat);
    glMatrix.vec4.transformMat4(result2, point2, mat);
    console.log("point", point1, point2);
    console.log("result", result1, result2);
    console.log("dist", glMatrix.vec4.distance(point1, point2), glMatrix.vec4.distance(result1, result2));
}

function TestRotateVectorInPlane(){
    console.log("---------------------------------------------------");
    console.log("---------------------------------------------------");
    console.log("---------------------------------------------------");
    console.log("TestRotateVectorInPlane");
    var v = glMatrix.vec4.fromValues(0,1,0.2,0);
    var x = glMatrix.vec4.fromValues(0,1,0,0);
    var y = glMatrix.vec4.fromValues(1,0,0,0);
    var theta = 2 * Math.PI / 8;
    var result = RotateVectorInPlane(v, theta, x, y);
    console.log("v", v);
    console.log("theta", theta);
    console.log("x", x);
    console.log("y", y);
    console.log("result", result);
}

function Test() {
    //random points
    var rng = seedrandom();
    for (var i = 0; i < 10; i++) {
        var point = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        PrintPointAndResult(point);
    }   

    //special case already rotated
    var point = glMatrix.vec4.fromValues(0, 0, 0, 0.25); 
    PrintPointAndResult(point);

    //special case already rotated but wrong w direction
    var point = glMatrix.vec4.fromValues(0, 0, 0, -0.25); 
    PrintPointAndResult(point);

    //check if distance stays same
    for (var i = 0; i < 10; i++) {
        var point1 = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        var point2 = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        TestDistanceSecondPoint(point1, point2);
    }   

    TestRotateVectorInPlane();

    debugger;
}


exports.getAligned4DRotationMatrix = getAligned4DRotationMatrix;
exports.RotateVectorInPlane = RotateVectorInPlane;
exports.Test = Test;