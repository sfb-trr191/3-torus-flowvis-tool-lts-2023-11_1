const glMatrix = require("gl-matrix");
const module_utilit = require("./utility");
const format4NumbersAsVectorString = module_utilit.format4NumbersAsVectorString;

class PixelResults {

    constructor() {
        this.SEPARATOR = "&nbsp;&nbsp;&nbsp;&nbsp;"
        this.hit_type = 0;
        this.hit_distance = -1;
        this.streamline_id = -1;
        this.cost = 0;
        this.position = glMatrix.vec4.fromValues(0, 0, 0, 0);
        this.center = glMatrix.vec4.fromValues(0, 0, 0, 0);
        this.light_direction = glMatrix.vec4.fromValues(0, 0, 0, 0);
        this.ftle_value = -1;
        this.ftle_ridge_strength = -1;
    }


    setData(pixels) {
        this.hit_type = pixels[0];
        this.hit_distance = pixels[3];
        this.streamline_id = pixels[4];
        this.cost = pixels[5];
        this.position = glMatrix.vec4.fromValues(pixels[8], pixels[9], pixels[10], pixels[11]);
        this.center = glMatrix.vec4.fromValues(pixels[12], pixels[13], pixels[14], pixels[15]);
        this.light_direction = glMatrix.vec4.fromValues(pixels[16], pixels[17], pixels[18], pixels[19]);
        //debugging:
        this.ftle_value = pixels[20];
        this.ftle_ridge_strength = pixels[21];
        //this.test_value = glMatrix.vec4.fromValues(pixels[20], pixels[21], pixels[22], pixels[23]);
        //console.warn("TEST", this.test_value);
    }

    //WARNING: uses innerHTML, do not allow user input
    setHitString(termination_condition, termination_max_value){
        if(this.hit_type == TYPE_NONE){
            this.UpdateUIHitString("");
            return;
        }
        switch (this.hit_type) {
            case TYPE_STREAMLINE_SEGMENT:
                this.setHitStringStreamline(termination_condition, termination_max_value);
                break;      
            case TYPE_FTLE_SURFACE_FORWARD:
                this.setHitStringFTLESurface("Forward FTLE");
                break;            
            case TYPE_FTLE_SURFACE_BACKWARD:
                this.setHitStringFTLESurface("Backward FTLE");
                break;   
            default:
                this.setHitStringGenericPosition("");
                break;
        }            
    }

    setHitStringStreamline(termination_condition, termination_max_value){
        var start_string = "streamline: " + this.streamline_id + this.SEPARATOR
        var stop_string = ""
        var position_string = this.getPositionString();
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
        stop_string += this.SEPARATOR
        stop_string += termination_string
        stop_string += (this.cost * termination_max_value).toFixed(3)
        stop_string += this.SEPARATOR
        stop_string += termination_string_normalized
        stop_string += this.cost.toFixed(3)
        
        if (this.hit_type == TYPE_NONE){
            position_string = ""
        }

        var vertical_separator = this.SEPARATOR+"|"+this.SEPARATOR;
        
        this.UpdateUIHitString(
            start_string
            + stop_string            
            + vertical_separator
            + position_string);
    }

    setHitStringFTLESurface(ftle_type){
        var vertical_separator = this.SEPARATOR+"|"+this.SEPARATOR;
        var position_string = this.getPositionString();
        var stop_string = this.SEPARATOR
        stop_string += "ftle value:"
        stop_string += this.ftle_value.toFixed(3)
        stop_string += this.SEPARATOR
        stop_string += "strength:"
        stop_string += this.ftle_ridge_strength.toFixed(3)
        this.UpdateUIHitString(ftle_type + stop_string + vertical_separator + position_string);
    }

    setHitStringGenericPosition(){
        var position_string = this.getPositionString();
        this.UpdateUIHitString(position_string);
    }

    UpdateUIHitString(value){
        document.getElementById("paragraph_mouse_data_string").innerHTML = value;//WARNING: uses innerHTML, do not allow user input
    }

    getPositionString(){
        var position_string = "position: " + format4NumbersAsVectorString(this.center[0], this.center[1], this.center[2], this.center[3]);
        position_string += this.SEPARATOR + "dist: " + (this.hit_distance).toFixed(3);
        return position_string;
    }
}


module.exports = PixelResults;