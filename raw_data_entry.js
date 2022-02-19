const glMatrix = require("gl-matrix");

class RawDataEntry {

    constructor() {
        this.position = glMatrix.vec4.create();//using 3 components for position and 1 component for flag (at seed points flag is equal to signum)
        this.u_v_w_signum = glMatrix.vec4.create();//using 3 components for uvw and 1 component for signum
        this.time = 0.0;
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
}

module.exports = RawDataEntry;