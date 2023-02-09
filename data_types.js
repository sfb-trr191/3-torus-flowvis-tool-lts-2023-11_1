const glMatrix = require("gl-matrix");

/*
Requirements for use in the data container:
The class must implement:
- getFloatCount()
- getIntCount()
- writeToArrays()
*/

var POSITION_DATA_FLOAT_COUNT = 8;
var POSITION_DATA_INT_COUNT = 0;
var LINE_SEGMENT_FLOAT_COUNT = 160//128;//32 for two matrices
var LINE_SEGMENT_INT_COUNT = 8;
var TREE_NODE_FLOAT_COUNT = 8;
var TREE_NODE_INT_COUNT = 4;
var DIR_LIGHT_FLOAT_COUNT = 16;
var DIR_LIGHT_INT_COUNT = 0;
var STREAMLINE_COLOR_FLOAT_COUNT = 4;
var STREAMLINE_COLOR_INT_COUNT = 0;
var STREAMLINE_SEED_FLOAT_COUNT = 4;
var STREAMLINE_SEED_INT_COUNT = 0;
var CYLINDER_FLOAT_COUNT = 64;
var CYLINDER_INT_COUNT = 0;

class PositionData {

    //integer based
    //nothing

    //float based
    x = 0.0;
    y = 0.0;
    z = 0.0;
    w = 0.0;
    cost = 0.0;

    constructor() { }

    print() {
        console.log("x: " + this.x);
        console.log("y: " + this.y);
        console.log("z: " + this.z);
        console.log("w: " + this.w);
        console.log("cost: " + this.cost);
    }

    getFloatCount() {
        return POSITION_DATA_FLOAT_COUNT;
    }

    getIntCount() {
        return POSITION_DATA_INT_COUNT;
    }

    writeToArrays(arrayf, arrayi, start_index_f, start_index_i) {
        var index = start_index_f;
        arrayf[index++] = this.x;
        arrayf[index++] = this.y;
        arrayf[index++] = this.z;
        arrayf[index++] = this.w;
        arrayf[index++] = this.cost;
    }
}

class LineSegment {

    //integer based
    indexA = 0;
    indexB = 0;
    multiPolyID = 0;
    copy = 0;
    beginning = 0;
    //float based
    matrix = glMatrix.mat4.create();
    matrix_inv = glMatrix.mat4.create();

    list_matrix_projection = [];
    list_matrix_projection_inv = [];


    constructor() {
        //this.matrix[0] = 2;//TODO remove: test inverse
        //glMatrix.mat4.invert(this.matrix_inv, this.matrix);//TODO remove: test inverse
        for (var i=0; i<4; i++){
            this.list_matrix_projection.push(glMatrix.mat4.create());
            this.list_matrix_projection_inv.push(glMatrix.mat4.create());
        }
    }

    print() {
        console.log("indexA: " + this.indexA);
        console.log("indexB: " + this.indexB);
        console.log("multiPolyID: " + this.multiPolyID);
        console.log("matrix: " + this.matrix);
        console.log("matrix_inv: " + this.matrix_inv);
    }

    getFloatCount() {
        return LINE_SEGMENT_FLOAT_COUNT;
    }

    getIntCount() {
        return LINE_SEGMENT_INT_COUNT;
    }

    writeToArrays(arrayf, arrayi, start_index_f, start_index_i) {
        var index = start_index_i;
        arrayi[index++] = this.indexA;
        arrayi[index++] = this.indexB;
        arrayi[index++] = this.multiPolyID;
        arrayi[index++] = this.copy;
        arrayi[index++] = this.beginning;

        for (var i = 0; i < 16; i++) {
            arrayf[start_index_f + i] = this.matrix[i];
            arrayf[start_index_f + i + 16] = this.matrix_inv[i];
        }
        for (var m = 0; m < 4; m++) {
            start_index_f += 32;
            for (var i = 0; i < 16; i++) {
                arrayf[start_index_f + i] = this.list_matrix_projection[m][i];
                arrayf[start_index_f + i + 16] = this.list_matrix_projection_inv[m][i];
            }
        }
    }
}

class TreeNode {

    //integer based
    hitLink = 0;
    missLink = 0;
    segmentIndex = 0;
    type = 0;//0 if not leaf
    //float based
    min = glMatrix.vec4.create();
    max = glMatrix.vec4.create();

    constructor() { }

    print() {
        console.log("hitLink: " + this.hitLink);
        console.log("missLink: " + this.missLink);
        console.log("segmentIndex: " + this.segmentIndex);
        console.log("min: " + this.min);
        console.log("max: " + this.max);
    }

    getFloatCount() {
        return TREE_NODE_FLOAT_COUNT;
    }

    getIntCount() {
        return TREE_NODE_INT_COUNT;
    }

    writeToArrays(arrayf, arrayi, start_index_f, start_index_i) {
        //this.print()
        var index = start_index_i;
        arrayi[index++] = this.hitLink;
        arrayi[index++] = this.missLink;
        arrayi[index++] = this.segmentIndex;
        arrayi[index++] = this.type;

        for (var i = 0; i < 4; i++) {
            arrayf[start_index_f + i] = this.min[i];
            arrayf[start_index_f + i + 4] = this.max[i];
        }
    }
}

class DirLight {

    //integer based
    //float based
    ambient = glMatrix.vec4.create();
    diffuse = glMatrix.vec4.create();
    specular = glMatrix.vec4.create();
    direction = glMatrix.vec4.create();

    constructor() { }

    print() {
        console.log("ambient: " + this.ambient);
        console.log("diffuse: " + this.diffuse);
        console.log("specular: " + this.specular);
        console.log("direction: " + this.direction);
    }

    getFloatCount() {
        return DIR_LIGHT_FLOAT_COUNT;
    }

    getIntCount() {
        return DIR_LIGHT_INT_COUNT;
    }

    writeToArrays(arrayf, arrayi, start_index_f, start_index_i) {
        for (var i = 0; i < 4; i++) {
            arrayf[start_index_f + i] = this.ambient[i];
            arrayf[start_index_f + i + 4] = this.diffuse[i];
            arrayf[start_index_f + i + 8] = this.specular[i];
            arrayf[start_index_f + i + 12] = this.direction[i];
        }
    }
}

class StreamlineColor {

    //integer based
    //float based
    color = glMatrix.vec3.create();
    opacity = 1;

    constructor() { }

    print() {
        console.log("color: " + this.color);
    }

    getFloatCount() {
        return STREAMLINE_COLOR_FLOAT_COUNT;
    }

    getIntCount() {
        return STREAMLINE_COLOR_INT_COUNT;
    }

    writeToArrays(arrayf, arrayi, start_index_f, start_index_i) {
        for (var i = 0; i < 3; i++) {
            arrayf[start_index_f + i] = this.color[i];
        }
        arrayf[start_index_f + 3] = this.opacity;
    }
}

class StreamlineSeed {

    //integer based
    //float based
    position = glMatrix.vec3.create();

    constructor() { }

    print() {
        console.log("position: " + this.position);
    }

    getFloatCount() {
        return STREAMLINE_SEED_FLOAT_COUNT;
    }

    getIntCount() {
        return STREAMLINE_SEED_INT_COUNT;
    }

    writeToArrays(arrayf, arrayi, start_index_f, start_index_i) {
        for (var i = 0; i < 3; i++) {
            arrayf[start_index_f + i] = this.position[i];
        }
    }
}

class Cylinder {

    //integer based
    
    //float based
    matrix = glMatrix.mat4.create();
    matrix_inv = glMatrix.mat4.create();
    position_a = glMatrix.vec4.create();
    position_b = glMatrix.vec4.create();
    color = glMatrix.vec4.create();
    radius = 0.01;


    constructor() {
        //this.matrix[0] = 2;//TODO remove: test inverse
        //glMatrix.mat4.invert(this.matrix_inv, this.matrix);//TODO remove: test inverse
    }

    print() {
        console.log("matrix: " + this.matrix);
        console.log("matrix_inv: " + this.matrix_inv);
        console.log("position_a: " + this.position_a);
        console.log("position_b: " + this.position_b);
        console.log("color: " + this.color);
        console.log("radius: " + this.radius);
    }

    getFloatCount() {
        return CYLINDER_FLOAT_COUNT;
    }

    getIntCount() {
        return CYLINDER_INT_COUNT;
    }

    writeToArrays(arrayf, arrayi, start_index_f, start_index_i) {
        var index = start_index_i;
        arrayi[index++] = this.indexA;
        arrayi[index++] = this.indexB;
        arrayi[index++] = this.multiPolyID;
        arrayi[index++] = this.copy;
        arrayi[index++] = this.beginning;

        var index_f = start_index_f;
        for (var i = 0; i < 16; i++) {
            arrayf[index_f + i] = this.matrix[i];
            arrayf[index_f + i + 16] = this.matrix_inv[i];
        }
        index_f += 32;
        for (var i = 0; i < 4; i++) {
            arrayf[index_f + i] = this.position_a[i];
            arrayf[index_f + i + 4] = this.position_b[i];
            arrayf[index_f + i + 8] = this.color[i];
        }
        index_f += 12;
        arrayf[index_f++] = this.radius;
    }
}

module.exports = { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder }