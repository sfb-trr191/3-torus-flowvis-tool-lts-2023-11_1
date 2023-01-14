
class VisibilityManager {
    constructor() {
        
    }

    Link(streamline_context_static){
        this.streamline_context_static = streamline_context_static;
    }

    UpdateVisibility() {        
        console.warn("UpdateVisibility");
        this.UpdateInputRow("input_row_side_canvas_streamline_method", this.ShouldShow_input_row_side_canvas_streamline_method())

    }

    ShouldShow_input_row_side_canvas_streamline_method(){
        if(this.streamline_context_static.streamline_generator.space == SPACE_3_SPHERE_4_PLUS_4D){
            return false;
        }
        return true;
    }

    UpdateInputRow(input_row_name, is_visible){
        var element = document.getElementById(input_row_name)
        element.className = is_visible ? "input_row" : "hidden";
    }
}


module.exports = VisibilityManager;