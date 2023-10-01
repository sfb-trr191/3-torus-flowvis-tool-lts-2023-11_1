
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
        console.warn("UpdateVisibility");
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
        

        this.UpdateInputRow("input_row_field_equation_u", this.ShouldShow_flow_quotiont_x1x2());
        this.UpdateInputRow("input_row_field_equation_v", this.ShouldShow_flow_quotiont_x1x2());
        this.UpdateInputRow("input_row_field_equation_w", this.ShouldShow_flow_quotiont_x3());


        
        this.UpdateInputRow("input_row_dummy_autonomous_x1", this.ShouldShow_flow_quotiont_x1x2_autonomous_dummy());
        this.UpdateInputRow("input_row_dummy_autonomous_x2", this.ShouldShow_flow_quotiont_x1x2_autonomous_dummy());
        this.UpdateInputRow("input_row_field_equation_a", this.ShouldShow_flow_quotiont_v1v2());
        this.UpdateInputRow("input_row_field_equation_b", this.ShouldShow_flow_quotiont_v1v2());
        
        this.UpdateInputRow("input_row_equation_p0", this.ShouldShow_flow_implicit_x());
        this.UpdateInputRow("input_row_equation_p1", this.ShouldShow_flow_implicit_x());
        this.UpdateInputRow("input_row_equation_p2", this.ShouldShow_flow_implicit_x());
        this.UpdateInputRow("input_row_equation_p3", this.ShouldShow_flow_implicit_x());

        this.UpdateInputRow("input_row_equation_d0", this.ShouldShow_flow_implicit_v());
        this.UpdateInputRow("input_row_equation_d1", this.ShouldShow_flow_implicit_v());
        this.UpdateInputRow("input_row_equation_d2", this.ShouldShow_flow_implicit_v());
        this.UpdateInputRow("input_row_equation_d3", this.ShouldShow_flow_implicit_v());
        
        this.UpdateInputRow("input_row_space", this.ShowOnDebug());
    }

    ShowOnDebug(){
        var settings = document.getElementById("select_settings_mode").value;
        return settings == 3;//DEBUG = 3
    }

    ShouldShow_flow_quotiont_x1x2(){
        var space = document.getElementById("select_space").value;
        return space == SPACE_3_TORUS;// || space == SPACE_2_PLUS_2D;
    }

    ShouldShow_flow_quotiont_x1x2_autonomous_dummy(){
        var space = document.getElementById("select_space").value;
        return space == SPACE_2_PLUS_2D;
    }

    ShouldShow_flow_quotiont_x3(){
        var space = document.getElementById("select_space").value;
        return space == SPACE_3_TORUS;
    }

    ShouldShow_flow_quotiont_v1v2(){
        var space = document.getElementById("select_space").value;
        return space == SPACE_2_PLUS_2D;
    }

    ShouldShow_flow_implicit_x(){
        var manifold_formulation = document.getElementById("select_manifold_type").value;
        var flow_formulation = document.getElementById("select_data_order").value;
        return manifold_formulation == MANIFOLD_TYPE_IMPLICIT;
    }

    ShouldShow_flow_implicit_v(){
        var manifold_formulation = document.getElementById("select_manifold_type").value;
        var flow_formulation = document.getElementById("select_data_order").value;
        return manifold_formulation == MANIFOLD_TYPE_IMPLICIT && flow_formulation == DATA_ORDER_SECOND_ORDER;
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