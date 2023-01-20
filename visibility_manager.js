
class VisibilityManager {
    constructor() {
        this.AddListener("select_shading_mode_streamlines");
    }

    Link(streamline_context_static){
        this.streamline_context_static = streamline_context_static;
    }

    AddListener(element_id){
        document.getElementById(element_id).addEventListener("change", (event) => {
            this.UpdateVisibility();
        });        
    }

    UpdateVisibility() {        
        console.warn("UpdateVisibility");
        this.UpdateInputRow("input_row_side_canvas_streamline_method", this.ShouldShow_input_row_side_canvas_streamline_method());
        this.UpdateInputRow("input_row_side_mode", this.ShouldShow_input_row_side_mode());
        this.UpdateInputRow("input_row_side_mode_s3", this.ShouldShow_input_row_side_mode_s3());
        this.UpdateInputRow("input_row_scalar_range", this.ShouldShow_input_row_scalar_range());
        
    }

    ShouldShow_input_row_side_canvas_streamline_method(){
        if(this.streamline_context_static.streamline_generator.space == SPACE_3_SPHERE_4_PLUS_4D){
            return false;
        }
        return true;
    }

    ShouldShow_input_row_side_mode(){
        if(this.streamline_context_static.streamline_generator.space == SPACE_3_SPHERE_4_PLUS_4D){
            return false;
        }
        return true;
    }

    ShouldShow_input_row_side_mode_s3(){
        if(this.streamline_context_static.streamline_generator.space == SPACE_3_SPHERE_4_PLUS_4D){
            return true;
        }
        return false;
    }

    ShouldShow_input_row_scalar_range(){
        if(document.getElementById("select_shading_mode_streamlines").value == SHADING_MODE_STREAMLINES_SCALAR)
            return true;
        if(document.getElementById("select_shading_mode_streamlines").value == SHADING_MODE_STREAMLINES_DISTANCE)
            return true;
        return false;
    }

    UpdateInputRow(input_row_name, is_visible){
        var element = document.getElementById(input_row_name)
        element.className = is_visible ? "input_row" : "hidden";
    }
}


module.exports = VisibilityManager;