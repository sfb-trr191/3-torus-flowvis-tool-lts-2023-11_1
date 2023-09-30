//const GROUP_NAME_CALCULATE = require("./const");

class InputChangedGroup{

    constructor(name, button_list){
        this.name = name;
        this.input_list = [];
        this.checkbox_list = [];
        this.additional_check_list = [];
        this.button_list = button_list;
    }

    AddInput(input){
        this.input_list.push(input);
    }

    AddCheckbox(input){
        this.checkbox_list.push(input);
        this.input_list.push(input);
    }

    AddAdditionalCheck(input){
        this.additional_check_list.push(input);
    }

    UpdateDefaultValues(){
        this.SynchronizeCheckBoxValues();
        for(var i=0; i<this.input_list.length; i++){
            this.input_list[i].default_value = this.input_list[i].value;
        }
        for(var i=0; i<this.additional_check_list.length; i++){
            this.additional_check_list[i].UpdateDefaultValues(this.name);
        }
    }

    CheckValuesChanged(){
        var changed = this.HasValueChanged();
        for(var i=0; i<this.additional_check_list.length; i++){
            changed = changed || this.additional_check_list[i].HasValueChanged(this.name);
        }
        for(var i=0; i<this.button_list.length; i++){
            this.button_list[i].className = changed ? "button_changed" : "button";
        }
    }

    SynchronizeCheckBoxValues(){
        for(var i=0; i<this.checkbox_list.length; i++){
            this.checkbox_list[i].value = this.checkbox_list[i].checked;
        }
    }

    HasValueChanged(){
        this.SynchronizeCheckBoxValues();
        for(var i=0; i<this.input_list.length; i++){
            if(this.input_list[i].value != this.input_list[i].default_value){
                return true;
            }
        }
        return false;
    }

}

class InputChangedManager{

    constructor(){
        this.groups = [];
        this.group_calculate = new InputChangedGroup(GROUP_NAME_CALCULATE, [document.getElementById("button_request_data")]);
        this.group_camera = new InputChangedGroup(GROUP_NAME_CAMERA, [document.getElementById("button_update_camera")]);
        this.group_render_settings = new InputChangedGroup(GROUP_NAME_RENDER_SETTINGS, 
            [document.getElementById("button_render_settings"), document.getElementById("button_data_update_render_settings")]);
        this.groups.push(this.group_calculate);
        this.groups.push(this.group_camera);
        this.groups.push(this.group_render_settings);
        this.GenerateGroupCalculate();
        this.GenerateGroupCamera();
        this.GenerateGroupRenderSettings();
    }

    GenerateGroupCalculate(){
        this.group_calculate.AddInput(document.getElementById("select_space"));
        this.group_calculate.AddInput(document.getElementById("select_streamline_termination_method"));
        this.group_calculate.AddInput(document.getElementById("input_streamline_calculation_advection_time"));
        this.group_calculate.AddInput(document.getElementById("input_streamline_calculation_arc_length"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_u"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_v"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_w"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_a"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_b"));        
        this.group_calculate.AddInput(document.getElementById("input_field_equation_parameter_s"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_p0"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_p1"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_p2"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_p3"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_d0"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_d1"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_d2"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_d3"));
        this.group_calculate.AddInput(document.getElementById("input_num_points_per_streamline"));
        this.group_calculate.AddInput(document.getElementById("input_step_size"));
        this.group_calculate.AddInput(document.getElementById("input_streamline_calculation_inbetweens"));
        this.group_calculate.AddInput(document.getElementById("segment_duplicator_iterations"));
        this.group_calculate.AddCheckbox(document.getElementById("checkbox_correct_seeds_s3"));
        this.group_calculate.AddInput(document.getElementById("select_streamline_calculation_method"));
        this.group_calculate.AddInput(document.getElementById("select_streamline_calculation_direction"));        
        this.group_calculate.AddInput(document.getElementById("input_tube_radius_fundamental"));
        this.group_calculate.AddInput(document.getElementById("input_max_radius_factor_highlight"));  
        
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_x_pos_x"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_x_pos_y"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_x_pos_z"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_x_neg_x"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_x_neg_y"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_x_neg_z"));

        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_y_pos_x"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_y_pos_y"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_y_pos_z"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_y_neg_x"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_y_neg_y"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_y_neg_z"));

        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_z_pos_x"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_z_pos_y"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_z_pos_z"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_z_neg_x"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_z_neg_y"));
        this.group_calculate.AddInput(document.getElementById("input_field_shader_rule_z_neg_z"));
    }
    
    GenerateGroupCamera(){
        this.group_camera.AddInput(document.getElementById("input_camera_position_x"));
        this.group_camera.AddInput(document.getElementById("input_camera_position_y"));
        this.group_camera.AddInput(document.getElementById("input_camera_position_z"));
        this.group_camera.AddInput(document.getElementById("input_camera_forward_x"));
        this.group_camera.AddInput(document.getElementById("input_camera_forward_y"));
        this.group_camera.AddInput(document.getElementById("input_camera_forward_z"));
        this.group_camera.AddInput(document.getElementById("input_camera_up_x"));
        this.group_camera.AddInput(document.getElementById("input_camera_up_y"));
        this.group_camera.AddInput(document.getElementById("input_camera_up_z"));

        this.group_camera.AddInput(document.getElementById("input_side_camera_position_x"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_position_y"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_position_z"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_forward_x"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_forward_y"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_forward_z"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_up_x"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_up_y"));
        this.group_camera.AddInput(document.getElementById("input_side_camera_up_z"));        
    }

    GenerateGroupRenderSettings(){
        this.group_render_settings.AddInput(document.getElementById("input_still_resolution_factor"));
        this.group_render_settings.AddInput(document.getElementById("input_panning_resolution_factor"));
        this.group_render_settings.AddInput(document.getElementById("input_max_ray_distance"));
        this.group_render_settings.AddInput(document.getElementById("input_max_ray_distance_aux"));
        this.group_render_settings.AddInput(document.getElementById("select_fog_type"));
        this.group_render_settings.AddInput(document.getElementById("input_fog_density"));
        this.group_render_settings.AddInput(document.getElementById("select_fog_type_aux"));
        this.group_render_settings.AddInput(document.getElementById("input_fog_density_aux"));
        this.group_render_settings.AddInput(document.getElementById("select_shading_mode_streamlines"));
        this.group_render_settings.AddInput(document.getElementById("input_formula_scalar"));
        this.group_render_settings.AddInput(document.getElementById("input_min_scalar"));
        this.group_render_settings.AddInput(document.getElementById("input_max_scalar"));
        this.group_render_settings.AddInput(document.getElementById("input_tube_radius_factor"));
        this.group_render_settings.AddInput(document.getElementById("input_tube_radius_factor_aux"));
        this.group_render_settings.AddInput(document.getElementById("input_tube_radius_factor_projection"));
        this.group_render_settings.AddInput(document.getElementById("input_tube_radius_factor_projection_highlight"));        
        this.group_render_settings.AddInput(document.getElementById("select_lod_still"));
        this.group_render_settings.AddInput(document.getElementById("select_lod_panning"));    
        this.group_render_settings.AddInput(document.getElementById("input_face_intersection_width"));   
        this.group_render_settings.AddInput(document.getElementById("input_cube_axes_length_main"));   
        this.group_render_settings.AddInput(document.getElementById("input_cube_axes_length_side"));     
        this.group_render_settings.AddInput(document.getElementById("input_cube_axes_radius_main"));           
        this.group_render_settings.AddInput(document.getElementById("input_cube_axes_radius_side"));   
        this.group_render_settings.AddInput(document.getElementById("input_cube_axes_origin_length_side"));   
        this.group_render_settings.AddInput(document.getElementById("input_cube_axes_origin_radius_side"));   
        this.group_render_settings.AddInput(document.getElementById("select_ftle_direction_main"));     
        this.group_render_settings.AddInput(document.getElementById("select_ftle_direction_side"));     
        this.group_render_settings.AddInput(document.getElementById("select_transfer_function_index_scalar"));  
        this.group_render_settings.AddInput(document.getElementById("select_transfer_function_index_ftle_forward"));  
        this.group_render_settings.AddInput(document.getElementById("select_transfer_function_index_ftle_backward")); 
        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_correct_volume_opacity"));
        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_volume_skip_first_fundamental_domain_main"));
        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_volume_rendering_clamp_scalars"));
        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_ridges_force_symmetric_hessian"));
        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_show_comparison_marker"));  
        this.group_render_settings.AddInput(document.getElementById("input_quality_marker_index"));                
        this.group_render_settings.AddInput(document.getElementById("select_volume_rendering_mode"));    
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_max_number_of_volume_iterations"));
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_overrite_min_scalar_ftle"));    
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_overrite_max_scalar_ftle"));   
        this.group_render_settings.AddInput(document.getElementById("input_ridge_lambda_threshold")); 
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_max_distance"));    
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_min_distance_main"));    
        this.group_render_settings.AddInput(document.getElementById("input_streamlines_min_distance_main"));            
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_distance_between_points"));    
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_termination_opacity"));       
        this.group_render_settings.AddInput(document.getElementById("input_volume_rendering_opacity_factor"));     
        this.group_render_settings.AddInput(document.getElementById("select_seed_mode_side"));     
        
        this.group_render_settings.AddInput(document.getElementById("input_camera_speed")); 
        this.group_render_settings.AddInput(document.getElementById("input_camera_roll_speed"));         
        this.group_render_settings.AddInput(document.getElementById("input_trackball_rotation_sensitivity"));  
        this.group_render_settings.AddInput(document.getElementById("input_trackball_translation_sensitivity"));  
        this.group_render_settings.AddInput(document.getElementById("input_trackball_wheel_sensitivity"));  
        this.group_render_settings.AddInput(document.getElementById("input_trackball_focus_distance_left"));     
        this.group_render_settings.AddInput(document.getElementById("input_trackball_focus_distance_right"));  

        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_transfer_function_log_scale"));  
        this.group_render_settings.AddInput(document.getElementById("input_transfer_function_log_scale_d"));    
        
        this.group_render_settings.AddInput(document.getElementById("input_ridge_surface_max_number_of_bisection_intervals"));
        this.group_render_settings.AddInput(document.getElementById("input_ridge_surface_max_bisection_iterations_per_interval"));
        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_ftle_surface_use_lambda_criterion"));
        this.group_render_settings.AddCheckbox(document.getElementById("checkbox_volume_rendering_force_overrite_ftle_limits"));
        this.group_render_settings.AddInput(document.getElementById("select_eigen_orientation_method"));
        this.group_render_settings.AddInput(document.getElementById("select_shading_mode_ftle_surface"));
        this.group_render_settings.AddInput(document.getElementById("input_min_scalar_ftle_surface"));
        this.group_render_settings.AddInput(document.getElementById("input_max_scalar_ftle_surface"));        
        this.group_render_settings.AddInput(document.getElementById("input_ridge_surface_filter_strength"));
        this.group_render_settings.AddInput(document.getElementById("input_ridge_surface_filter_ftle"));

        
        this.group_render_settings.AddInput(document.getElementById("select_light_integrator_type"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_integration_step_size"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_integration_max_step_count"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_p0"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_p1"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_p2"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_p3"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_d0"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_d1"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_d2"));
        this.group_render_settings.AddInput(document.getElementById("input_field_light_transport_d3"));


        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_x_pos_u"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_x_pos_v"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_x_pos_w"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_x_neg_u"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_x_neg_v"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_x_neg_w"));

        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_y_pos_u"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_y_pos_v"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_y_pos_w"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_y_neg_u"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_y_neg_v"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_y_neg_w"));

        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_z_pos_u"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_z_pos_v"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_z_pos_w"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_z_neg_u"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_z_neg_v"));
        this.group_render_settings.AddInput(document.getElementById("input_field_shader_rule_z_neg_w"));
        
    }

    LinkUISeeds(ui_seeds){
        this.group_calculate.AddAdditionalCheck(ui_seeds);
        this.group_render_settings.AddAdditionalCheck(ui_seeds);
    }

    UpdateDefaultValuesCalculate(){ 
        this.group_calculate.UpdateDefaultValues();
    }

    UpdateDefaultValuesRenderSettings(){ 
        this.group_render_settings.UpdateDefaultValues();
    }

    UpdateDefaultValuesCamera(){ 
        this.group_camera.UpdateDefaultValues();
    }

    CheckValuesChanged(){
        for(var i=0; i<this.groups.length; i++){
            this.groups[i].CheckValuesChanged();
        }  
    }
}

module.exports = InputChangedManager;