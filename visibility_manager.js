
class VisibilityManager {
    constructor() {
        this.AddListener("select_shading_mode_streamlines");
        this.AddListener("select_light_integrator_type");
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
        //console.warn("UpdateVisibility");
        this.UpdateInputRow("input_row_side_canvas_streamline_method", this.ShouldShow_input_row_side_canvas_streamline_method());
        this.UpdateInputRow("input_row_side_mode", this.ShouldShow_input_row_side_mode());
        this.UpdateInputRow("input_row_side_mode_s3", this.ShouldShow_input_row_side_mode_s3());
        this.UpdateInputRow("input_row_scalar_range", this.ShouldShow_input_row_scalar_range());
        
        this.UpdateInputRow("input_row_light_integration_step_size", this.ShouldShow_light_integration_steps());
        this.UpdateInputRow("input_row_light_integration_max_step_count", this.ShouldShow_light_integration_steps());
        this.UpdateInputRow("input_row_light_transport_p0", this.ShouldShow_light_integration());
        this.UpdateInputRow("input_row_light_transport_p1", this.ShouldShow_light_integration());
        this.UpdateInputRow("input_row_light_transport_p2", this.ShouldShow_light_integration());
        this.UpdateInputRow("input_row_light_transport_p3", this.ShouldShow_light_integration());
        this.UpdateInputRow("input_row_light_transport_d0", this.ShouldShow_light_integration());
        this.UpdateInputRow("input_row_light_transport_d1", this.ShouldShow_light_integration());
        this.UpdateInputRow("input_row_light_transport_d2", this.ShouldShow_light_integration());
        this.UpdateInputRow("input_row_light_transport_d3", this.ShouldShow_light_integration());
        
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
        if(document.getElementById("select_shading_mode_streamlines").value == SHADING_MODE_STREAMLINES_DISTANCE_ITERATION)
            return true;         
        if(document.getElementById("select_shading_mode_streamlines").value == SHADING_MODE_STREAMLINES_ITERATION_COUNT)
            return true;       
        if(document.getElementById("select_shading_mode_streamlines").value == SHADING_MODE_STREAMLINES_COST)
            return true;    
        return false;
    }

    ShouldShow_light_integration(){
        if(document.getElementById("select_light_integrator_type").value == LIGHT_INTEGRATOR_RK4)
            return true;
        return false;
    }

    ShouldShow_light_integration_steps(){
        if(document.getElementById("select_light_integrator_type").value == LIGHT_INTEGRATOR_RK4)
            return true;
        if(document.getElementById("select_light_integrator_type").value == LIGHT_INTEGRATOR_EXPLICIT)
            return true;
        return false;
    }

    UpdateInputRow(input_row_name, is_visible){
        var element = document.getElementById(input_row_name)
        element.className = is_visible ? "input_row" : "hidden";
    }
}


module.exports = VisibilityManager;