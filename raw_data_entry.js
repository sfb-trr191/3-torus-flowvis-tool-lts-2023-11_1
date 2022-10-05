const glMatrix = require("gl-matrix");

class RawDataEntry {

    constructor() {
        this.position = glMatrix.vec4.create();//using 3 components for position and 1 component for flag (at seed points flag is equal to signum)
        this.u_v_w_signum = glMatrix.vec4.create();//using 3 components for uvw and 1 component for signum
        this.time = 0.0;
        this.arc_length = 0.0;
        this.flag = 0; // (at seed points flag is equal to signum)
        this.angle = 0; //
    }

    CalculateAngleFromPosition_3_2(){
        var angle = Math.atan2(this.position[3], this.position[2]);
        angle = angle / (2 * Math.PI)
        angle = angle >= 0 ? angle : 1 + angle;

        this.angle = angle;
    }

    IsAngleJumping(other_entry){
        var a = this.angle;
        var b = other_entry.angle;
        return Math.abs(a-b) > 0.5;
    }

    //requires that this.angle is already calculated
    SnapToOld(old_value){
        var new_value = this.angle;
        var old_floor = Math.floor(old_value);

        var new_a = new_value + old_floor - 1;
        var new_b = new_value + old_floor;
        var new_c = new_value + old_floor + 1;

        var result_ab = Math.abs(old_value-new_a) < Math.abs(old_value-new_b) ? new_a : new_b;
        var result = Math.abs(old_value-result_ab) < Math.abs(old_value-new_c) ? result_ab : new_c;

        //console.log("STO: new:", new_value, "old:", old_value, "result:", result, "new_a:", new_a, "new_b:", new_b, "new_c:", new_c, "new_d:", new_d);
        this.angle = result;
    }
}

module.exports = RawDataEntry;