const glMatrix = require("gl-matrix");

class DynamicStreamline {

    constructor() {
        this.position = glMatrix.vec4.fromValues(0, 0, 0, 0);
        this.linked_element_input_dynamic_position_x = document.getElementById("input_dynamic_position_x");
        this.linked_element_input_dynamic_position_y = document.getElementById("input_dynamic_position_y");
        this.linked_element_input_dynamic_position_z = document.getElementById("input_dynamic_position_z");
        this.linked_element_input_dynamic_position_w = document.getElementById("input_dynamic_position_w");
    }

    fromUI(){
        this.position = glMatrix.vec4.fromValues(
            parseFloat(this.linked_element_input_dynamic_position_x.value),
            parseFloat(this.linked_element_input_dynamic_position_y.value),
            parseFloat(this.linked_element_input_dynamic_position_z.value),
            parseFloat(this.linked_element_input_dynamic_position_w.value),)

    }
}


module.exports = DynamicStreamline;