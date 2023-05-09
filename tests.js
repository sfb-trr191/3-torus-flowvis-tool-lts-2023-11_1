const glMatrix = require("gl-matrix");

class Tests {
    constructor() {
        console.log("running tests");
        this.testAtan2([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]);
        this.testAtan2([0, 0.25, 0.5, 0.75, 1]);//0=1=right, 0.25=up, 0.5=left, 0.75=down
        this.TestSnapToOld();
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

    TestSnapToOld(){
        console.log("TestSnapToOld");
        this.SnapToOld(0.1, 0.0);
        this.SnapToOld(0.9, 0.0);
        this.SnapToOld(0.1, 0.9);
        this.SnapToOld(0.9, 0.9);
        this.SnapToOld(0.1, 5.9);
        this.SnapToOld(0.9, 5.9);
        this.SnapToOld(0.1, -2.2);
        this.SnapToOld(0.9, -2.2);

        for(var i=0; i<100; i++){
            var new_r = Math.random();
            var old_r = -5 + Math.random() * 10;//-5 to 5
            var result = this.SnapToOld(new_r, old_r);
            var result_v2 = this.SnapToOldV2(new_r, old_r);
            var dist = Math.abs(result-old_r);
            var dist_versions = Math.abs(result-result_v2);
            console.log("STO: dist_versions:", dist_versions, "dist:", dist, "old_r:", old_r, "new_r:", new_r, "result:", result);
        }
    }

    SnapToOld(new_value, old_value){
        var old_floor = Math.floor(old_value);
        var old_ceil = old_floor + 1;

        var new_a = new_value + old_floor;
        var new_b = new_value + old_ceil;

        var new_c = (new_value - 1) + old_floor;
        var new_d = (new_value - 1) + old_ceil;

        var result_ab = Math.abs(old_value-new_a) < Math.abs(old_value-new_b) ? new_a : new_b;
        var result_cd = Math.abs(old_value-new_c) < Math.abs(old_value-new_d) ? new_c : new_d;
        var result = Math.abs(old_value-result_ab) < Math.abs(old_value-result_cd) ? result_ab : result_cd;

        //console.log("STO: new:", new_value, "old:", old_value, "result:", result, "new_a:", new_a, "new_b:", new_b, "new_c:", new_c, "new_d:", new_d);
        return result;
    }

    SnapToOldV2(new_value, old_value){
        var old_floor = Math.floor(old_value);

        var new_a = new_value + old_floor - 1;
        var new_b = new_value + old_floor;
        var new_c = new_value + old_floor + 1;

        var result_ab = Math.abs(old_value-new_a) < Math.abs(old_value-new_b) ? new_a : new_b;
        var result = Math.abs(old_value-result_ab) < Math.abs(old_value-new_c) ? result_ab : new_c;

        return result;
    }

    LogarithmicScaling(){
        var d = 100;
        var a = Math.max(Math.log(d),1);

        var alpha_log = 0;
        for(var i=0; i<11; i++){
            alpha_log = (i/10.0);
            var term_1 = Math.pow(Math.E, -a*(1-alpha_log));
            var term_2 = Math.pow(Math.E, -a);
            var alpha_linear = (term_1 - term_2) / (1 - term_2);
            console.log(alpha_log, alpha_linear);
        }  
    }
}


module.exports = Tests;