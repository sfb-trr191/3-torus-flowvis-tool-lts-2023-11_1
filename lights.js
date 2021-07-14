const glMatrix = require("gl-matrix");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, Cylinder } = require("./data_types");

class Lights {

    constructor() {
        this.dir_lights = [];
    }

    GenerateDefaultLighting() {
        console.log("GenerateDefaultLighting");

        var l0 = new DirLight();
        l0.ambient = glMatrix.vec4.fromValues(0.04, 0.04, 0.04, 0.0);
        l0.diffuse = glMatrix.vec4.fromValues(0.6, 0.6, 0.6, 0.0);
        l0.specular = glMatrix.vec4.fromValues(0.3, 0.3, 0.3, 0.0);
        l0.direction = glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 0.0);
        this.dir_lights.push(l0)

        var l1 = new DirLight();
        l1.ambient = glMatrix.vec4.fromValues(0.04, 0.04, 0.04, 0.0);
        l1.diffuse = glMatrix.vec4.fromValues(0.6, 0.6, 0.6, 0.0);
        l1.specular = glMatrix.vec4.fromValues(0.3, 0.3, 0.3, 0.0);
        l1.direction = glMatrix.vec4.fromValues(-1.0, 1.0, 1.0, 0.0);
        this.dir_lights.push(l1)

        var l2 = new DirLight();
        l2.ambient = glMatrix.vec4.fromValues(0.04, 0.04, 0.04, 0.0);
        l2.diffuse = glMatrix.vec4.fromValues(0.6, 0.6, 0.6, 0.0);
        l2.specular = glMatrix.vec4.fromValues(0.3, 0.3, 0.3, 0.0);
        l2.direction = glMatrix.vec4.fromValues(0.0, -1.0, -1.0, 0.0);
        this.dir_lights.push(l2)
    }
}

module.exports = Lights;
