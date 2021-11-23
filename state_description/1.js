const Entry = require("./state_description");

exports.addEntries_1 = function (list) {    
    console.log("addEntries_1");

    //top right select
    list.push(new Entry("select_side_mode", "field", "UI8"));
    list.push(new Entry("select_projection_index", "field", "UI8"));
    list.push(new Entry("select_slice_axes_order", "field", "UI8"));
    list.push(new Entry("select_side_canvas_streamline_method", "field", "UI8"));
    list.push(new Entry("select_side_canvas_streamline_method_projection", "field", "UI8"));

    //data
    //data - equations
    list.push(new Entry("input_field_equation_u", "field", "STR"));
    list.push(new Entry("input_field_equation_v", "field", "STR"));
    list.push(new Entry("input_field_equation_w", "field", "STR"));
    //data - parameters  
    list.push(new Entry("select_data_paramaters_mode", "field", "UI8"));
    list.push(new Entry("select_streamline_calculation_method", "field", "UI8"));
    list.push(new Entry("select_streamline_calculation_direction", "field", "UI8"));
    list.push(new Entry("input_num_points_per_streamline", "field", "F32"));
    list.push(new Entry("input_step_size", "field", "F32"));
    list.push(new Entry("segment_duplicator_iterations", "field", "F32"));
    list.push(new Entry("input_tube_radius_fundamental", "field", "F32"));
    list.push(new Entry("input_max_radius_factor_highlight", "field", "F32"));
    //FTLE data
    //FTLE data - slice
    //TODO SLICE INDEX
    list.push(new Entry("checkbox_animate_slice_index", "checkbox", "UI8"));
    list.push(new Entry("checkbox_ftle_slice_interpolate", "checkbox", "UI8"));
    list.push(new Entry("select_slice_mode", "field", "UI8"));
    //FTLE data - resolution
    list.push(new Entry("input_ftle_dim_x", "field", "UI16"));
    list.push(new Entry("input_ftle_dim_y", "field", "UI16"));
    list.push(new Entry("input_ftle_dim_z", "field", "UI16"));
    //FTLE data - parameters
    list.push(new Entry("input_ftle_advection_time", "field", "F32"));
    list.push(new Entry("input_ftle_step_size", "field", "F32"));  
    //settings
    //settings - general
    list.push(new Entry("select_settings_mode", "field", "UI8"));
    list.push(new Entry("input_max_ray_distance", "field", "F32"));  
    list.push(new Entry("input_tube_radius_factor", "field", "F32"));  
    //settings - projection
    list.push(new Entry("input_tube_radius_factor_projection", "field", "F32"));  
    list.push(new Entry("input_tube_radius_factor_projection_highlight", "field", "F32"));  
    //settings - streamline shading
    list.push(new Entry("checkbox_show_streamlines_main", "checkbox", "UI8"));
    list.push(new Entry("select_shading_mode_streamlines", "field", "UI8"));
    list.push(new Entry("input_formula_scalar", "field", "STR"));
    list.push(new Entry("input_min_scalar", "field", "F32"));  
    list.push(new Entry("input_max_scalar", "field", "F32"));  
    //settings - fog
    list.push(new Entry("select_fog_type", "field", "UI8"));
    list.push(new Entry("input_fog_density", "field", "F32"));  
    //settings - axes   
    list.push(new Entry("checkbox_show_movable_axes_main", "checkbox", "UI8"));
    list.push(new Entry("checkbox_show_movable_axes_side", "checkbox", "UI8"));
    list.push(new Entry("checkbox_show_bounding_axes_main", "checkbox", "UI8"));
    list.push(new Entry("checkbox_show_bounding_axes_side", "checkbox", "UI8"));
    list.push(new Entry("checkbox_show_bounding_axes_projection_side", "checkbox", "UI8"));
    list.push(new Entry("input_cube_axes_length_main", "field", "F32"));  
    list.push(new Entry("input_cube_axes_length_side", "field", "F32"));  
    list.push(new Entry("input_cube_axes_radius_main", "field", "F32"));  
    list.push(new Entry("input_cube_axes_radius_side", "field", "F32"));  
    list.push(new Entry("checkbox_show_origin_axes_side", "checkbox", "UI8"));
    list.push(new Entry("input_cube_axes_origin_length_side", "field", "F32"));  
    list.push(new Entry("input_cube_axes_origin_radius_side", "field", "F32"));  
    //settings - volume rendering
    list.push(new Entry("select_show_volume_main", "field", "UI8"));
    list.push(new Entry("select_show_volume_side", "field", "UI8"));
    list.push(new Entry("input_volume_rendering_max_distance", "field", "F32"));  
    list.push(new Entry("input_volume_rendering_distance_between_points", "field", "F32"));  
    list.push(new Entry("input_volume_rendering_termination_opacity", "field", "F32")); 
    //settings - quality        
    list.push(new Entry("input_still_resolution_factor", "field", "F32"));  
    list.push(new Entry("input_panning_resolution_factor", "field", "F32"));  
    list.push(new Entry("select_lod_still", "field", "UI8"));
    list.push(new Entry("select_lod_panning", "field", "UI8"));
    //settings - cameras
    list.push(new Entry("select_camera_control_3d_left", "field", "UI8"));
    list.push(new Entry("select_camera_control_3d_right", "field", "UI8"));
    //settings - trackball
    list.push(new Entry("input_trackball_rotation_sensitivity", "field", "F32"));  
    list.push(new Entry("input_trackball_translation_sensitivity", "field", "F32"));  
    list.push(new Entry("input_trackball_wheel_sensitivity", "field", "F32"));  
    list.push(new Entry("input_trackball_focus_distance_left", "field", "F32"));  
    list.push(new Entry("input_trackball_focus_distance_right", "field", "F32"));  
    //transfer function
    list.push(new Entry("select_transfer_function_id", "field", "UI8"));
    list.push(new Entry("select_transfer_function_index_scalar", "field", "UI8"));
    list.push(new Entry("select_transfer_function_index_ftle_forward", "field", "UI8"));
    list.push(new Entry("select_transfer_function_index_ftle_backward", "field", "UI8"));
}
