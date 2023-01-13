const glMatrix = require("gl-matrix");
const seedrandom = require("seedrandom");

function GramSchmidt2Vectors4Dimensions(w1, w2){
    //https://de.wikipedia.org/wiki/Gram-Schmidtsches_Orthogonalisierungsverfahren
    //formula: v1 = w1
    var v1 = w1;

    //formula: v2 = w2 - <v1,w2>/<v1,v1> with dot product "<>"
    var v2 = glMatrix.vec4.create();

    var dot_v1_w2 = glMatrix.vec4.dot(v1, w2);
    var dot_v1_v1 = glMatrix.vec4.dot(v1, v1);
    var fraction = dot_v1_w2 / dot_v1_v1;

    glMatrix.vec4.scaleAndAdd(v2, w2, v1, -fraction);

    glMatrix.vec4.normalize(v1, v1);
    glMatrix.vec4.normalize(v2, v2);
    var base = {};
    base.v1 = v1;
    base.v2 = v2;
    return base;
}

function GramSchmidt3Vectors4Dimensions(w1, w2, w3){
    //https://de.wikipedia.org/wiki/Gram-Schmidtsches_Orthogonalisierungsverfahren
    //formula: v1 = w1
    var v1 = w1;

    //formula: v2 = w2 - <v1,w2>/<v1,v1> v1                         | with dot product "<>"
    var v2 = glMatrix.vec4.create();
    var dot_v1_w2 = glMatrix.vec4.dot(v1, w2);
    var dot_v1_v1 = glMatrix.vec4.dot(v1, v1);
    var fraction = dot_v1_w2 / dot_v1_v1;
    glMatrix.vec4.scaleAndAdd(v2, w2, v1, -fraction);

    //formula: v3 = w3 - <v1,w3>/<v1,v1> v1 - <v2,w3>/<v2,v2> v2    | with dot product "<>"
    var v3 = glMatrix.vec4.create();
    var dot_v1_w3 = glMatrix.vec4.dot(v1, w3);
    var dot_v2_w3 = glMatrix.vec4.dot(v2, w3);
    var dot_v2_v2 = glMatrix.vec4.dot(v2, v2);
    var fraction_1 = dot_v1_w3 / dot_v1_v1;
    var fraction_2 = dot_v2_w3 / dot_v2_v2;
    glMatrix.vec4.scaleAndAdd(v3, w3, v1, -fraction_1);
    glMatrix.vec4.scaleAndAdd(v3, v3, v2, -fraction_2);

    glMatrix.vec4.normalize(v1, v1);
    glMatrix.vec4.normalize(v2, v2);
    glMatrix.vec4.normalize(v3, v3);
    var base = {};
    base.v1 = v1;
    base.v2 = v2;
    base.v3 = v3;
    return base;
}

function GramSchmidt4Vectors4Dimensions(w1, w2, w3, w4){
    //https://de.wikipedia.org/wiki/Gram-Schmidtsches_Orthogonalisierungsverfahren
    //formula: v1 = w1
    var v1 = w1;

    //formula: v2 = w2 - <v1,w2>/<v1,v1> v1                         | with dot product "<>"
    var v2 = glMatrix.vec4.create();
    var dot_v1_w2 = glMatrix.vec4.dot(v1, w2);
    var dot_v1_v1 = glMatrix.vec4.dot(v1, v1);
    var fraction = dot_v1_w2 / dot_v1_v1;
    glMatrix.vec4.scaleAndAdd(v2, w2, v1, -fraction);

    //formula: v3 = w3 - <v1,w3>/<v1,v1> v1 - <v2,w3>/<v2,v2> v2    | with dot product "<>"
    var v3 = glMatrix.vec4.create();
    var dot_v1_w3 = glMatrix.vec4.dot(v1, w3);
    var dot_v2_w3 = glMatrix.vec4.dot(v2, w3);
    var dot_v2_v2 = glMatrix.vec4.dot(v2, v2);
    var fraction_1 = dot_v1_w3 / dot_v1_v1;
    var fraction_2 = dot_v2_w3 / dot_v2_v2;
    glMatrix.vec4.scaleAndAdd(v3, w3, v1, -fraction_1);
    glMatrix.vec4.scaleAndAdd(v3, v3, v2, -fraction_2);

    //formula: v4 = w4 - <v1,w4>/<v1,v1> v1 - <v2,w4>/<v2,v2> v2 - <v3,w4>/<v3,v3> v3   | with dot product "<>"
    var v4 = glMatrix.vec4.create();
    var dot_v1_w4 = glMatrix.vec4.dot(v1, w4);
    var dot_v2_w4 = glMatrix.vec4.dot(v2, w4);
    var dot_v3_w4 = glMatrix.vec4.dot(v3, w4);
    var dot_v3_v3 = glMatrix.vec4.dot(v3, v3);    
    var fraction_1 = dot_v1_w4 / dot_v1_v1;
    var fraction_2 = dot_v2_w4 / dot_v2_v2;
    var fraction_3 = dot_v3_w4 / dot_v3_v3;
    glMatrix.vec4.scaleAndAdd(v4, w4, v1, -fraction_1);
    glMatrix.vec4.scaleAndAdd(v4, v4, v2, -fraction_2);
    glMatrix.vec4.scaleAndAdd(v4, v4, v3, -fraction_3);

    glMatrix.vec4.normalize(v1, v1);
    glMatrix.vec4.normalize(v2, v2);
    glMatrix.vec4.normalize(v3, v3);
    glMatrix.vec4.normalize(v4, v4);
    var base = {};
    base.v1 = v1;
    base.v2 = v2;
    base.v3 = v3;
    base.v4 = v4;
    return base;
}

function Test() {
    //random points
    var rng = seedrandom();
    for (var i = 0; i < 10; i++) {
        var point = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        var direction = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        var point_normalized = glMatrix.vec4.create();
        var direction_normalized = glMatrix.vec4.create();
        glMatrix.vec4.normalize(point_normalized, point);
        glMatrix.vec4.normalize(direction_normalized, direction);
        var base = GramSchmidt2Vectors4Dimensions(point_normalized, direction_normalized);
        var dot = glMatrix.vec4.dot(base.v1, base.v2);
        console.log("-----------------------------------");
        console.log("point", point);
        console.log("point_normalized", point_normalized);
        console.log("direction", direction);
        console.log("direction_normalized", direction_normalized);
        console.log("base", base);
        console.log("dot", dot);
    }   

    console.log("-----------------------------------");
    console.log("GramSchmidt3Vectors4Dimensions");
    console.log("-----------------------------------");
    
    for (var i = 0; i < 10; i++) {
        var w1 = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        var w2 = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        var w3 = glMatrix.vec4.fromValues(rng()-0.5, rng()-0.5, rng()-0.5, rng()-0.5); 
        var w1_normalized = glMatrix.vec4.create();
        var w2_normalized = glMatrix.vec4.create();
        var w3_normalized = glMatrix.vec4.create();
        glMatrix.vec4.normalize(w1_normalized, w1);
        glMatrix.vec4.normalize(w2_normalized, w2);
        glMatrix.vec4.normalize(w3_normalized, w3);
        var base = GramSchmidt3Vectors4Dimensions(w1_normalized, w2_normalized, w3_normalized);
        var dot12 = glMatrix.vec4.dot(base.v1, base.v2);
        var dot23 = glMatrix.vec4.dot(base.v2, base.v3);
        var dot13 = glMatrix.vec4.dot(base.v1, base.v3);
        console.log("-----------------------------------");
        console.log("w1_normalized", w1_normalized);
        console.log("w2_normalized", w2_normalized);
        console.log("w3_normalized", w3_normalized);
        console.log("base", base);
        console.log("dot12", dot12);
        console.log("dot23", dot23);
        console.log("dot13", dot13);
    }   

    
    debugger;
}


exports.GramSchmidt2Vectors4Dimensions = GramSchmidt2Vectors4Dimensions;
exports.GramSchmidt4Vectors4Dimensions = GramSchmidt4Vectors4Dimensions;
exports.Test = Test;