const glMatrix = require("gl-matrix");
const module_utilit = require("./utility");
const format4NumbersAsVectorString = module_utilit.format4NumbersAsVectorString;

class PixelResults {

    constructor() {
        this.hit_type = 0;
        this.streamline_id = -1;
        this.cost = 0;
        this.position = glMatrix.vec4.fromValues(0, 0, 0, 0);
        this.center = glMatrix.vec4.fromValues(0, 0, 0, 0);
    }


    setData(pixels) {
        this.hit_type = pixels[0];
        this.streamline_id = pixels[4];
        this.cost = pixels[5];
        this.position = glMatrix.vec4.fromValues(pixels[8], pixels[9], pixels[10], pixels[11]);
        this.center = glMatrix.vec4.fromValues(pixels[12], pixels[13], pixels[14], pixels[15]);
    }

    //WARNING: uses innerHTML, do not allow user input
    setHitString(termination_condition, termination_max_value){
        var SEPARATOR = "&nbsp;&nbsp;&nbsp;&nbsp;"
        var start_string = ""
        var stop_string = ""
        if (this.hit_type == TYPE_STREAMLINE_SEGMENT){
            start_string += "Streamline: " + this.streamline_id + SEPARATOR
        }
        var position_string = "position: " + format4NumbersAsVectorString(this.center[0], this.center[1], this.center[2], this.center[3]);
        if (this.hit_type == TYPE_STREAMLINE_SEGMENT){
            var termination_string = ""
            if(termination_condition == STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME){
                termination_string = "time: "
            }
            if(termination_condition == STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH){
                termination_string = "length: "
            }
            if(termination_condition == STREAMLINE_TERMINATION_CONDITION_POINTS){
                termination_string = "points: "
            }
            var termination_string_normalized = "normalized " + termination_string
            stop_string += SEPARATOR
            stop_string += termination_string
            stop_string += (this.cost * termination_max_value).toFixed(3)
            stop_string += SEPARATOR
            stop_string += termination_string_normalized
            stop_string += this.cost.toFixed(3)
        }
        if (this.hit_type == TYPE_NONE){
            var position_string = ""
        }
        document.getElementById("paragraph_mouse_data_string").innerHTML = //WARNING: uses innerHTML, do not allow user input
            start_string
            + position_string
            + stop_string
    }
}


module.exports = PixelResults;