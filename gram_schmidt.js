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

    var base = {};
    base.v1 = v1;
    base.v2 = v2;
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

    debugger;
}


exports.GramSchmidt2Vectors4Dimensions = GramSchmidt2Vectors4Dimensions;
exports.Test = Test;