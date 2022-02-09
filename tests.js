const glMatrix = require("gl-matrix");

class Tests {
    constructor() {
        console.log("running tests");
        this.testAtan2([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
        this.testAtan2([0, 0.25, 0.5, 0.75, 1]);//0=1=right, 0.25=up, 0.5=left, 0.75=down
        console.log("tests completed");
        //x = 1;
    }


    testAtan2(list_z){
        console.log(list_z);
        var list_velocity = []
        var list_atan2 = []
        var list_angle = []
        for(var i=0; i<list_z.length; i++){
            list_velocity.push(this.getVelocity(list_z[i]));
            list_atan2.push(this.getAtan2(list_velocity[i]));
            list_angle.push(this.getAngle(list_velocity[i]));
        }
        console.log(list_velocity);
        console.log(list_atan2);
        console.log(list_angle);
    }


    getVelocity(z){
        return glMatrix.vec2.fromValues(Math.cos(2*Math.PI*z), Math.sin(2*Math.PI*z));
    }

    getAtan2(velocity){
        return Math.atan2(velocity[1], velocity[0]);
    }

    getAngle(velocity){
        var angle = Math.atan2(velocity[1], velocity[0]);
        angle = angle / (2 * Math.PI)
        angle = angle >= 0 ? angle : 1 + angle;
        return angle;
    }
}


module.exports = Tests;