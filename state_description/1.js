const Entry = require("./state_description");

exports.state_description_dict = {
    "default" : [
        new Entry("select_side_mode", "field", "UI8"),
        new Entry("select_projection_index", "field", "UI8"),        
        new Entry("select_slice_axes_order", "field", "UI8"),
        new Entry("select_side_canvas_streamline_method", "field", "UI8"),
        new Entry("select_side_canvas_streamline_method_projection", "field", "UI8"),

        //data
        //data - equations
        new Entry("input_field_equation_u", "field", "STR"),
        new Entry("input_field_equation_v", "field", "STR"),
        new Entry("input_field_equation_w", "field", "STR"),
        //data - parameters  
        new Entry("select_data_paramaters_mode", "field", "UI8"),
        new Entry("select_streamline_calculation_method", "field", "UI8"),
        new Entry("select_streamline_calculation_direction", "field", "UI8"),
        new Entry("input_num_points_per_streamline", "field", "F32"),
        new Entry("input_step_size", "field", "F32"),
        new Entry("segment_duplicator_iterations", "field", "F32"),
        new Entry("input_tube_radius_fundamental", "field", "F32"),
        new Entry("input_max_radius_factor_highlight", "field", "F32"),
        //FTLE data
        //FTLE data - slice
        //TODO SLICE INDEX
        new Entry("checkbox_animate_slice_index", "checkbox", "UI8"),
        new Entry("checkbox_ftle_slice_interpolate", "checkbox", "UI8"),
        new Entry("select_slice_mode", "field", "UI8"),
        //FTLE data - resolution
        new Entry("input_ftle_dim_x", "field", "UI16"),
        new Entry("input_ftle_dim_y", "field", "UI16"),
        new Entry("input_ftle_dim_z", "field", "UI16"),
        //FTLE data - parameters
        new Entry("input_ftle_advection_time", "field", "F32"),
        new Entry("input_ftle_step_size", "field", "F32"),
        //settings
        //settings - general
        new Entry("select_settings_mode", "field", "UI8"),
        new Entry("input_max_ray_distance", "field", "F32"),
        new Entry("input_tube_radius_factor", "field", "F32"), 
        //settings - projection
        new Entry("input_tube_radius_factor_projection", "field", "F32"),
        new Entry("input_tube_radius_factor_projection_highlight", "field", "F32"), 
        //settings - streamline shading
        new Entry("checkbox_show_streamlines_main", "checkbox", "UI8"),
        new Entry("select_shading_mode_streamlines", "field", "UI8"),
        new Entry("input_formula_scalar", "field", "STR"),
        new Entry("input_min_scalar", "field", "F32"),
        new Entry("input_max_scalar", "field", "F32"),
        //settings - fog
        new Entry("select_fog_type", "field", "UI8"),
        new Entry("input_fog_density", "field", "F32"),
        //settings - axes   
        new Entry("checkbox_show_movable_axes_main", "checkbox", "UI8"),
        new Entry("checkbox_show_movable_axes_side", "checkbox", "UI8"),
        new Entry("checkbox_show_bounding_axes_main", "checkbox", "UI8"),
        new Entry("checkbox_show_bounding_axes_side", "checkbox", "UI8"),
        new Entry("checkbox_show_bounding_axes_projection_side", "checkbox", "UI8"),
        new Entry("input_cube_axes_length_main", "field", "F32"), 
        new Entry("input_cube_axes_length_side", "field", "F32"), 
        new Entry("input_cube_axes_radius_main", "field", "F32"),
        new Entry("input_cube_axes_radius_side", "field", "F32"),
        new Entry("checkbox_show_origin_axes_side", "checkbox", "UI8"),
        new Entry("input_cube_axes_origin_length_side", "field", "F32"),
        new Entry("input_cube_axes_origin_radius_side", "field", "F32"), 
        //settings - volume rendering
        new Entry("select_show_volume_main", "field", "UI8"),
        new Entry("select_show_volume_side", "field", "UI8"),
        new Entry("input_volume_rendering_max_distance", "field", "F32"),
        new Entry("input_volume_rendering_distance_between_points", "field", "F32"),
        new Entry("input_volume_rendering_termination_opacity", "field", "F32"),
        //settings - quality        
        new Entry("input_still_resolution_factor", "field", "F32"),
        new Entry("input_panning_resolution_factor", "field", "F32"),
        new Entry("select_lod_still", "field", "UI8"),
        new Entry("select_lod_panning", "field", "UI8"),
        //settings - cameras
        new Entry("select_camera_control_3d_left", "field", "UI8"),
        new Entry("select_camera_control_3d_right", "field", "UI8"),
        //settings - trackball
        new Entry("input_trackball_rotation_sensitivity", "field", "F32"),
        new Entry("input_trackball_translation_sensitivity", "field", "F32"),
        new Entry("input_trackball_wheel_sensitivity", "field", "F32"),  
        new Entry("input_trackball_focus_distance_left", "field", "F32"),
        new Entry("input_trackball_focus_distance_right", "field", "F32"),
        //transfer function
        new Entry("select_transfer_function_id", "field", "UI8"),
        new Entry("select_transfer_function_index_scalar", "field", "UI8"),
        new Entry("select_transfer_function_index_ftle_forward", "field", "UI8"),
        new Entry("select_transfer_function_index_ftle_backward", "field", "UI8"),


        
        new Entry("current_state_name_main", "global", "STR"),
        new Entry("current_state_name_aux", "global", "STR"),
    ],
    //list of special data
    "special" : [
        "special_data_seeds",
        "special_data_camera_main",
        "special_data_camera_aux",
        "special_data_transfer_function_manager",
    ],
    //special data
    "special_data_seeds" : new Entry("special_data_seeds", "list", "seed"),
    "special_data_camera_main" : new Entry("special_data_camera_main", "list", "camera_state"),
    "special_data_camera_aux" : new Entry("special_data_camera_aux", "list", "camera_state"),
    //
    "seed" : [
        new Entry("position_x", "variable", "F32"),
        new Entry("position_y", "variable", "F32"),
        new Entry("position_z", "variable", "F32"),
        new Entry("color_byte_r", "variable", "UI8"),
        new Entry("color_byte_g", "variable", "UI8"),
        new Entry("color_byte_b", "variable", "UI8"),
    ],
    "camera_state" : [
        new Entry("position_x", "variable", "F32"),
        new Entry("position_y", "variable", "F32"),
        new Entry("position_z", "variable", "F32"),
        new Entry("forward_x", "variable", "F32"),
        new Entry("forward_y", "variable", "F32"),
        new Entry("forward_z", "variable", "F32"),
        new Entry("up_x", "variable", "F32"),
        new Entry("up_y", "variable", "F32"),
        new Entry("up_z", "variable", "F32"),
    ],
    "color_point" : [
        new Entry("t", "variable", "F32"),
        new Entry("color_r", "variable", "UI8_N"),
        new Entry("color_g", "variable", "UI8_N"),
        new Entry("color_b", "variable", "UI8_N"),
    ],
    "opacity_point" : [
        new Entry("t", "variable", "F32"),
        new Entry("a", "variable", "F32"),
    ],
    
}