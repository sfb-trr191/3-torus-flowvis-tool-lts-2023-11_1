const glMatrix = require("gl-matrix");

class RawDataEntry {

    constructor() {
        this.position = glMatrix.vec4.create();//using 3 components for position and 1 component for flag (at seed points flag is equal to signum)
        this.u_v_w_signum = glMatrix.vec4.create();//using 3 components for uvw and 1 component for signum
        this.time = 0.0;
    }
}

module.exports = RawDataEntry;