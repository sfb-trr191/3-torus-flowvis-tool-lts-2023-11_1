const glMatrix = require("gl-matrix");
const module_utilit = require("./utility");
const format4NumbersAsVectorString = module_utilit.format4NumbersAsVectorString;

class PixelResults {

    constructor() {
        this.hit_type = 0;
        this.streamline_id = -1;
        this.position = glMatrix.vec4.fromValues(0, 0, 0, 0);
        this.center = glMatrix.vec4.fromValues(0, 0, 0, 0);
    }


    setData(pixels) {
        this.hit_type = pixels[0];
        this.streamline_id = pixels[4];
        this.position = glMatrix.vec4.fromValues(pixels[8], pixels[9], pixels[10], pixels[11]);
        this.center = glMatrix.vec4.fromValues(pixels[12], pixels[13], pixels[14], pixels[15]);
    }

    setHitString(){
        var start_string = ""
        if (this.hit_type == TYPE_STREAMLINE_SEGMENT){
            start_string += "Streamline: " + this.streamline_id + "     "
        }
        document.getElementById("paragraph_mouse_data_string").textContent = 
            start_string
            + "intersection: "
            + format4NumbersAsVectorString(this.position[0], this.position[1], this.position[2], this.position[3])
            + "   center: "
            + format4NumbersAsVectorString(this.center[0], this.center[1], this.center[2], this.center[3]);
    }
}


module.exports = PixelResults;