const glMatrix = require("gl-matrix");
const DummyQuad = require("./dummy_quad");
const RenderWrapper = require("./render_wrapper");
const ComputeWrapper = require("./compute_wraper");
const ShaderUniforms = require("./shader_uniforms");
const ShaderFlags = require("./shader_flags");
const Camera = require("./camera");
const module_webgl = require("./webgl");
const loadShaderProgramFromCode = module_webgl.loadShaderProgramFromCode;
const module_utilit = require("./utility");
const format4NumbersAsVectorString = module_utilit.format4NumbersAsVectorString;

class UniformLocationsRayTracing {
    constructor(gl, program, name) {
        console.log("UniformLocationsRayTracing: ", name)
        this.location_num_visual_seeds = gl.getUniformLocation(program, "num_visual_seeds");

        this.light_integrator_type = LIGHT_INTEGRATOR_LINE;//TODO why is this here?
        
        this.location_light_integrator_type = gl.getUniformLocation(program, "light_integrator_type");
        this.location_light_integration_step_size = gl.getUniformLocation(program, "light_integration_step_size");
        this.location_light_integration_max_step_count = gl.getUniformLocation(program, "light_integration_max_step_count");
        
        

        this.location_eigen_orientation_method = gl.getUniformLocation(program, "eigen_orientation_method");
        this.location_ftle_surface_use_lambda_criterion = gl.getUniformLocation(program, "ftle_surface_use_lambda_criterion");
        this.location_max_bisection_iterations_per_interval = gl.getUniformLocation(program, "max_bisection_iterations_per_interval");
        this.location_max_number_of_bisection_intervals = gl.getUniformLocation(program, "max_number_of_bisection_intervals");
        this.location_max_number_of_volume_iterations = gl.getUniformLocation(program, "max_number_of_volume_iterations");

        this.location_color_r = gl.getUniformLocation(program, "color_r");
        this.location_texture_float = gl.getUniformLocation(program, "texture_float");
        this.location_texture_int = gl.getUniformLocation(program, "texture_int");
        this.location_texture_float_global = gl.getUniformLocation(program, "texture_float_global");
        this.location_texture_int_global = gl.getUniformLocation(program, "texture_int_global");
        this.location_texture_ftle = gl.getUniformLocation(program, "texture_ftle");
        this.location_texture_ftle_gradient = gl.getUniformLocation(program, "texture_ftle_gradient");
        this.location_texture_ftle_jacoby_direction_x = gl.getUniformLocation(program, "texture_ftle_jacoby_direction_x");
        this.location_texture_ftle_jacoby_direction_y = gl.getUniformLocation(program, "texture_ftle_jacoby_direction_y");
        this.location_texture_ftle_jacoby_direction_z = gl.getUniformLocation(program, "texture_ftle_jacoby_direction_z");
        this.location_texture_dynamic_float = gl.getUniformLocation(program, "texture_dynamic_float");
        this.location_texture_dynamic_int = gl.getUniformLocation(program, "texture_dynamic_int");      

        this.location_render_dynamic_streamline = gl.getUniformLocation(program, "render_dynamic_streamline");
        this.location_render_face_border_intersections = gl.getUniformLocation(program, "render_face_border_intersections");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_get_pixel_data_results = gl.getUniformLocation(program, "get_pixel_data_results");
        this.location_output_x_percentage = gl.getUniformLocation(program, "output_x_percentage");
        this.location_output_y_percentage = gl.getUniformLocation(program, "output_y_percentage");        
        this.location_height = gl.getUniformLocation(program, "height");
        this.location_offset_x = gl.getUniformLocation(program, "offset_x");
        this.location_offset_y = gl.getUniformLocation(program, "offset_y");
        this.location_max_ray_distance = gl.getUniformLocation(program, "maxRayDistance");
        this.location_max_cost = gl.getUniformLocation(program, "max_streamline_cost");  
        this.location_fog_color = gl.getUniformLocation(program, "fog_color");  
        this.location_selected_streamline_color = gl.getUniformLocation(program, "selected_streamline_color");  
        this.location_dynamic_streamline_color = gl.getUniformLocation(program, "dynamic_streamline_color");         
        this.location_forward_ftle_surface_color = gl.getUniformLocation(program, "forward_ftle_surface_color");  
        this.location_backward_ftle_surface_color = gl.getUniformLocation(program, "backward_ftle_surface_color"); 
        this.location_dynamic_seed_position = gl.getUniformLocation(program, "dynamic_seed_position");            
        this.location_selected_streamline_id = gl.getUniformLocation(program, "selected_streamline_id");    
        this.location_gray_scale_factor = gl.getUniformLocation(program, "gray_scale_factor");  
        this.location_max_volume_distance = gl.getUniformLocation(program, "max_volume_distance");
        this.location_min_volume_distance = gl.getUniformLocation(program, "min_volume_distance");
        this.location_min_streamline_distance = gl.getUniformLocation(program, "min_streamline_distance");
        this.location_volume_skip_first_fundamental_domain = gl.getUniformLocation(program, "volume_skip_first_fundamental_domain");        
        this.location_max_iteration_count = gl.getUniformLocation(program, "maxIterationCount");
        this.location_tube_radius = gl.getUniformLocation(program, "tubeRadius");
        this.location_tube_radius_outside = gl.getUniformLocation(program, "tubeRadiusOutside");        
        this.location_fog_density = gl.getUniformLocation(program, "fog_density");
        this.location_fog_type = gl.getUniformLocation(program, "fog_type");
        this.location_face_intersection_width = gl.getUniformLocation(program, "face_intersection_width");
        this.location_projection_index = gl.getUniformLocation(program, "projection_index");
        this.location_shading_mode_streamlines = gl.getUniformLocation(program, "shading_mode_streamlines");
        this.location_shading_mode_ftle_surface = gl.getUniformLocation(program, "shading_mode_ftle_surface");        
        this.location_min_scalar = gl.getUniformLocation(program, "min_scalar");
        this.location_max_scalar = gl.getUniformLocation(program, "max_scalar");
        this.location_min_scalar_ftle_surface = gl.getUniformLocation(program, "min_scalar_ftle_surface");
        this.location_max_scalar_ftle_surface = gl.getUniformLocation(program, "max_scalar_ftle_surface");     
        this.location_ridge_surface_filter_strength = gl.getUniformLocation(program, "ridge_surface_filter_strength");
        this.location_ridge_surface_filter_ftle = gl.getUniformLocation(program, "ridge_surface_filter_ftle");   
        this.location_cut_at_cube_faces = gl.getUniformLocation(program, "cut_at_cube_faces");
        this.location_handle_inside = gl.getUniformLocation(program, "handle_inside");
        this.location_is_main_renderer = gl.getUniformLocation(program, "is_main_renderer");
        this.location_show_bounding_box = gl.getUniformLocation(program, "show_bounding_box");
        this.location_show_bounding_box_projection = gl.getUniformLocation(program, "show_bounding_box_projection");        
        this.location_show_movable_axes = gl.getUniformLocation(program, "show_movable_axes");
        this.location_show_origin_axes = gl.getUniformLocation(program, "show_origin_axes");
        this.location_show_non_origin_axes = gl.getUniformLocation(program, "show_non_origin_axes");
        this.location_show_streamlines = gl.getUniformLocation(program, "show_streamlines");
        this.location_show_streamlines_outside = gl.getUniformLocation(program, "show_streamlines_outside");        
        this.location_correct_volume_opacity = gl.getUniformLocation(program, "correct_volume_opacity");
        this.location_show_volume_rendering = gl.getUniformLocation(program, "show_volume_rendering");
        this.location_show_volume_rendering_forward = gl.getUniformLocation(program, "show_volume_rendering_forward");
        this.location_show_volume_rendering_backward = gl.getUniformLocation(program, "show_volume_rendering_backward");
        this.location_show_ridge_surface_forward = gl.getUniformLocation(program, "show_ridge_surface_forward");
        this.location_show_ridge_surface_backward = gl.getUniformLocation(program, "show_ridge_surface_backward");
        this.location_volume_rendering_mode = gl.getUniformLocation(program, "volume_rendering_mode");
        this.location_volume_rendering_distance_between_points = gl.getUniformLocation(program, "volume_rendering_distance_between_points");
        this.location_volume_rendering_termination_opacity = gl.getUniformLocation(program, "volume_rendering_termination_opacity");
        this.location_volume_rendering_opacity_factor = gl.getUniformLocation(program, "volume_rendering_opacity_factor");
        this.location_volume_rendering_clamp_scalars = gl.getUniformLocation(program, "volume_rendering_clamp_scalars");
        this.location_ridges_force_symmetric_hessian = gl.getUniformLocation(program, "ridges_force_symmetric_hessian");
        
        this.location_dim_x = gl.getUniformLocation(program, "dim_x");
        this.location_dim_y = gl.getUniformLocation(program, "dim_y");
        this.location_dim_z = gl.getUniformLocation(program, "dim_z");
        this.location_min_scalar_ftle = gl.getUniformLocation(program, "min_scalar_ftle");
        this.location_max_scalar_ftle = gl.getUniformLocation(program, "max_scalar_ftle");  
        this.location_ridge_lambda_threshold = gl.getUniformLocation(program, "ridge_lambda_threshold");
        this.location_transfer_function_index_streamline_scalar = gl.getUniformLocation(program, "transfer_function_index_streamline_scalar");
        this.location_transfer_function_index_ftle_forward = gl.getUniformLocation(program, "transfer_function_index_ftle_forward");
        this.location_transfer_function_index_ftle_backward = gl.getUniformLocation(program, "transfer_function_index_ftle_backward");
           
        this.location_debug_render_spherinder = gl.getUniformLocation(program, "debug_render_spherinder");
        this.location_debug_render_3Sphere = gl.getUniformLocation(program, "debug_render_3Sphere");
        
    }
}

class UniformLocationsCompare {
    constructor(gl, program, name) {
        console.log("UniformLocationsCompare: ", name)
        this.location_texture1 = gl.getUniformLocation(program, "texture1");
        this.location_texture2 = gl.getUniformLocation(program, "texture2");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class UniformLocationsAverage {
    constructor(gl, program, name) {
        console.log("UniformLocationsAverage: ", name)
        this.location_aliasing_index = gl.getUniformLocation(program, "aliasing_index");
        this.location_texture1 = gl.getUniformLocation(program, "texture1");
        this.location_texture2 = gl.getUniformLocation(program, "texture2");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class UniformLocationsCopy {
    constructor(gl, program, name) {
        console.log("UniformLocationsCopy: ", name)
        this.location_color_r = gl.getUniformLocation(program, "color_r");
        this.location_texture1 = gl.getUniformLocation(program, "texture1");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class UniformLocationsResampling {
    constructor(gl, program, name) {
        console.log("UniformLocationsResampling: ", name)
        this.location_show_comparison_marker = gl.getUniformLocation(program, "show_comparison_marker");
        this.location_quality_marker_index = gl.getUniformLocation(program, "quality_marker_index");
        this.location_show_progressbar = gl.getUniformLocation(program, "show_progressbar");
        this.location_progress = gl.getUniformLocation(program, "progress");
        this.location_texture1 = gl.getUniformLocation(program, "texture1");
        this.location_texture2 = gl.getUniformLocation(program, "texture2");
        this.location_texture_float_global = gl.getUniformLocation(program, "texture_float_global");
        this.location_texture_int_global = gl.getUniformLocation(program, "texture_int_global");
        this.location_texture_compare = gl.getUniformLocation(program, "texture_compare");
        this.location_quality_marker_color = gl.getUniformLocation(program, "quality_marker_color"); 
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
        this.location_render_color_bar = gl.getUniformLocation(program, "render_color_bar");
    }
}

class UniformLocationsFTLESlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsFTLESlice: ", name)
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
        this.location_dim_x = gl.getUniformLocation(program, "dim_x");
        this.location_dim_y = gl.getUniformLocation(program, "dim_y");
        this.location_dim_z = gl.getUniformLocation(program, "dim_z");
        this.location_texture_flow_map = gl.getUniformLocation(program, "texture_flow_map");
        this.location_texture_ftle_differences = gl.getUniformLocation(program, "texture_ftle_differences");
        this.location_texture_float_global = gl.getUniformLocation(program, "texture_float_global");
        this.location_texture_int_global = gl.getUniformLocation(program, "texture_int_global");
        this.location_slice_index = gl.getUniformLocation(program, "slice_index");
        this.location_draw_slice_axes_order = gl.getUniformLocation(program, "draw_slice_axes_order");       
        this.location_draw_slice_mode = gl.getUniformLocation(program, "draw_slice_mode");                
        this.location_min_scalar = gl.getUniformLocation(program, "min_scalar");
        this.location_max_scalar = gl.getUniformLocation(program, "max_scalar");
        this.location_render_color_bar = gl.getUniformLocation(program, "render_color_bar");
        this.location_transfer_function_index = gl.getUniformLocation(program, "transfer_function_index");
        this.location_transfer_function_index_backward = gl.getUniformLocation(program, "transfer_function_index_backward");    
        this.location_interpolate = gl.getUniformLocation(program, "interpolate");    
        
    }
}

class CanvasWrapper {

    constructor(gl, streamline_context_static, streamline_context_dynamic, ftle_manager, name, canvas, canvas_width, canvas_height, thumbnail, camera, aliasing, shader_manager, global_data, tree_view, pixel_results) {
        console.log("Construct CanvasWrapper: ", name)
        this.name = name;
        this.canvas = canvas;
        this.pixel_results = pixel_results;
        this.thumbnail = thumbnail;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.camera = camera;
        this.cameraAreaProjection0 = new Camera(camera.name+"AreaProjection0", "special_data_camera_main", "current_state_name_main", null);
        this.cameraAreaProjection1 = new Camera(camera.name+"AreaProjection1", "special_data_camera_main", "current_state_name_main", null);
        this.cameraAreaProjection2 = new Camera(camera.name+"AreaProjection2", "special_data_camera_main", "current_state_name_main", null);
        this.cameraAreaProjection3 = new Camera(camera.name+"AreaProjection3", "special_data_camera_main", "current_state_name_main", null);
        this.aliasing = aliasing;
        this.shader_manager = shader_manager;
        this.global_data = global_data;
        this.streamline_context_static = streamline_context_static;
        this.streamline_context_dynamic = streamline_context_dynamic;
        this.p_ftle_manager = ftle_manager;
        this.tree_view = tree_view;
        this.aliasing_index = 0;
        this.repeat_same_aliasing_index = false;//for comparison mode (e.g. hole detection)
        this.show_comparison_marker = false;
        this.quality_marker_index = 16;
        this.max_ray_distance = 0;
        this.tube_radius_fundamental = 0.005;
        this.max_radius_factor_highlight = 2.0;
        this.tube_radius_factor = 1.0;
        this.tube_radius_factor_projection = 1.0;
        this.tube_radius_factor_projection_highlight = 2.0;
        this.lod_index_panning = 0;
        this.lod_index_still = 0;
        this.fog_density = 0;
        this.face_intersection_width = 0.05;
        this.fog_type = 0;
        this.shading_mode_streamlines = 0;
        this.shading_mode_ftle_surface = 0;
        this.projection_index = -1;
        this.streamline_method = STREAMLINE_DRAW_METHOD_FUNDAMENTAL;
        this.streamline_method_projection = STREAMLINE_DRAW_METHOD_FUNDAMENTAL;        
        this.limited_max_distance = 0;
        this.light_integration_step_size = 0;
        this.light_integration_max_step_count = 0;
        this.max_iteration_count = 1;
        this.min_scalar = 0;
        this.max_scalar = 0;
        this.force_overrite_ftle_limits = false;//usually the min max values of the ftle field are used, this allows to use overrides
        this.min_scalar_ftle_surface = 0;
        this.max_scalar_ftle_surface = 0;
        this.ridge_surface_filter_strength = 0;
        this.ridge_surface_filter_ftle = 0;
        this.show_bounding_box = false;
        this.show_bounding_box_projection = false;
        this.show_movable_axes = false;
        this.show_origin_axes = false;
        this.show_non_origin_axes = false;
        this.debug_render_spherinder = true;
        this.debug_render_3Sphere = true;
        this.draw_mode = DRAW_MODE_DEFAULT;
        this.draw_slice_index = 0;
        this.draw_slice_axes_order = DRAW_SLICE_AXES_ORDER_HX_VY;
        this.draw_slice_mode = DRAW_SLICE_MODE_COMBINED;
        this.ftle_min_scalar = 0;
        this.ftle_max_scalar = 1;
        this.ftle_slice_interpolate = true;
        this.volume_rendering_directions = FTLE_DIRECTIONS_NONE;
        this.ridge_surface_directions = FTLE_DIRECTIONS_NONE;
        this.correct_volume_opacity = false;
        //this.show_volume_rendering_forward = false;
        //this.show_volume_rendering_backward = false;
        //this.show_ridge_surface_forward = false;
        //this.show_ridge_surface_backward = false;
        this.ftle_surface_use_lambda_criterion = true;
        this.eigen_orientation_method = 0;
        this.max_bisection_iterations_per_interval = 1;
        this.max_number_of_bisection_intervals = 100;
        this.max_number_of_volume_iterations = 10000;
        this.volume_rendering_mode = VOLUME_RENDERING_MODE_ORIGINAL_FTLE;
        this.volume_rendering_clamp_scalars = true;
        this.ridges_force_symmetric_hessian = true;
        this.overrite_min_scalar_ftle = 0;
        this.overrite_max_scalar_ftle = 1;
        this.volume_rendering_distance_between_points = 0.01;
        this.volume_rendering_termination_opacity = 0.99;
        this.volume_rendering_opacity_factor = 1.0;
        this.ridge_lambda_threshold = 0.0;
        this.transfer_function_index_streamline_scalar = 0;
        this.transfer_function_index_ftle_forward = 3;
        this.transfer_function_index_ftle_backward = 4;
        this.max_volume_distance = 0;// 0=same as limited_max_distance
        this.min_volume_distance = 0;// 0=same as limited_max_distance
        this.volume_skip_first_fundamental_domain = false;
        this.max_cost = 0;
        this.seed_visualization_mode = SEED_VISUALIZATION_MODE_NONE;
        this.is_exporting = false;
        this.did_update_clicked_position = false;
        this.show_dynamic_streamline = false;//set by ui --> does not mean that render_dynamic_streamline is true
        this.render_face_border_intersections = false;//only allowed in main view

        this.output_x_percentage = 0;
        this.output_y_percentage = 0;
        this.output_x_percentage_old = 0;
        this.output_y_percentage_old = 0;
        this.update_clicked_position = false;
        this.update_clicked_position_control_mode = CONTROL_MODE_SELECT_STREAMLINE;

        this.quality_marker_color = glMatrix.vec3.fromValues(1,0,1);
        this.fog_color = glMatrix.vec3.fromValues(1,1,1);
        this.selected_streamline_color = glMatrix.vec3.fromValues(1,0,0);
        this.dynamic_streamline_color = glMatrix.vec3.fromValues(1,1,0);
        this.forward_ftle_surface_color = glMatrix.vec3.fromValues(1,0,0);//overwritten by ui anyways
        this.backward_ftle_surface_color = glMatrix.vec3.fromValues(0,0,1);//overwritten by ui anyways
        this.selected_streamline_id = -1;
        this.gray_scale_factor = 0.0;

        this.last_shader_formula_scalar = "";
        this.last_touch_ms = 0;

        this.render_wrapper_raytracing_still_left = new RenderWrapper(gl, name + "_raytracing_still_left", camera.width_still, camera.height_still);
        this.render_wrapper_raytracing_still_right = new RenderWrapper(gl, name + "_raytracing_still_right", camera.width_still, camera.height_still);
        this.render_wrapper_raytracing_panning_left = new RenderWrapper(gl, name + "_raytracing_panning_left", camera.width_panning, camera.height_panning);
        this.render_wrapper_raytracing_panning_right = new RenderWrapper(gl, name + "_raytracing_panning_right", camera.width_panning, camera.height_panning);

        console.log("CanvasWrapper: ", name, "create program")
        console.log("CanvasWrapper gl: ", gl)

        //this.InitializeShaders(gl);

        //this.GenerateDummyBuffer(gl);
        this.dummy_quad = new DummyQuad(gl);

        this.shader_flags = new ShaderFlags();

        //this.ResultBuffer = new ResultBuffer(gl, 10);
        this.compute_wrapper_pixel_results = new ComputeWrapper(gl, "pixel results", 10, 1);
        //this.compute_wrapper_pixel_results.

        this.LinkElementsFromName();
        this.force_draw_retrieve_once = false;

        this.adaptive_resolution = true;
        this.adaptive_resolution_current_t = 1.0;
        this.adaptive_resolution_snap_t = 1.0;
        //this.adaptive_resolution_next_t = 1.0;
        this.adaptive_resolution_step_size = 0.5;
        this.adaptive_resolution_last_time_stamp = 0;
        this.adaptive_resolution_cooldown = 500;
    
        this.adaptive_frame_counter = 0;
        this.adaptive_alternating_counter = 0;
        this.adaptive_alternating_number_changes = 0;
        this.adaptive_last_change = ADAPTIVE_CHANGE_NONE;
        this.adaptive_resolution_decimals = 3;

        this.fps_threschold_increase_quality = 20;
        this.fps_threschold_decrease_quality = 10;

        if(name == "main"){
            this.element_legend_associated_view = document.getElementById("legend_main_view");
            this.view_name = "Main View";
        }else if(name == "side"){
            this.element_legend_associated_view = document.getElementById("legend_aux_view");
            this.view_name = "Aux View";
        }
        var quality_string = this.adaptive_resolution_current_t.toFixed(this.adaptive_resolution_decimals);
        this.element_legend_associated_view.innerHTML = this.view_name+" [quality:" + quality_string+"]";
    }

    setRetreiveOnce(){
        this.force_draw_retrieve_once = true;
    }

    InitAreaProjectionCameras(){
        var forward_dist = 1.5;
        var side_dist = 1.75;
        var up_dist = 0.5;
        var theta_x = 50;
        var theta_y = 10;

        /*
        if(false){//frontal view, no angle
            var forward_dist = 1.75;
            var side_dist = 0;
            var up_dist = 0;
            var theta_x = 0;
            var theta_y = 0;
        }
        */

        this.cameraAreaProjection0.position = glMatrix.vec4.fromValues(0.0, up_dist, forward_dist, -side_dist);
        this.cameraAreaProjection0.forward = glMatrix.vec4.fromValues(0.0, 0.0, -1.0, 0.0);
        this.cameraAreaProjection0.up = glMatrix.vec4.fromValues(0.0, -1.0, 0.0, 0.0);
        this.cameraAreaProjection0.right = glMatrix.vec4.fromValues(0.0, 0.0, 0.0, 1.0);
        this.cameraAreaProjection0.RotateAroundCamera4DinDegrees(theta_x, theta_y);       
        this.cameraAreaProjection0.width = this.camera.width;
        this.cameraAreaProjection0.height = this.camera.height;
        this.cameraAreaProjection0.UpdateShaderValues4D();

        this.cameraAreaProjection1.position = glMatrix.vec4.fromValues(-side_dist, 0.0, up_dist, forward_dist);
        this.cameraAreaProjection1.forward = glMatrix.vec4.fromValues(0.0, 0.0, 0.0, -1.0);
        this.cameraAreaProjection1.up = glMatrix.vec4.fromValues(0.0, 0.0, -1.0, 0.0);
        this.cameraAreaProjection1.right = glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 0.0);
        this.cameraAreaProjection1.RotateAroundCamera4DinDegrees(theta_x, theta_y);       
        this.cameraAreaProjection1.width = this.camera.width;
        this.cameraAreaProjection1.height = this.camera.height;
        this.cameraAreaProjection1.UpdateShaderValues4D();
     
        this.cameraAreaProjection2.position = glMatrix.vec4.fromValues(-side_dist, up_dist, 0.0, forward_dist);
        this.cameraAreaProjection2.forward = glMatrix.vec4.fromValues(0.0, 0.0, 0.0, -1.0);
        this.cameraAreaProjection2.up = glMatrix.vec4.fromValues(0.0, -1.0, 0.0, 0.0);
        this.cameraAreaProjection2.right = glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 0.0);
        this.cameraAreaProjection2.RotateAroundCamera4DinDegrees(theta_x, theta_y);       
        this.cameraAreaProjection2.width = this.camera.width;
        this.cameraAreaProjection2.height = this.camera.height;
        this.cameraAreaProjection2.UpdateShaderValues4D();

        this.cameraAreaProjection3.position = glMatrix.vec4.fromValues(-side_dist, up_dist, forward_dist, 0.0);
        this.cameraAreaProjection3.forward = glMatrix.vec4.fromValues(0.0, 0.0, -1.0, 0.0);
        this.cameraAreaProjection3.up = glMatrix.vec4.fromValues(0.0, -1.0, 0.0, 0.0);
        this.cameraAreaProjection3.right = glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 0.0);
        this.cameraAreaProjection3.RotateAroundCamera4DinDegrees(theta_x, theta_y);    
        this.cameraAreaProjection3.width = this.camera.width;
        this.cameraAreaProjection3.height = this.camera.height;
        this.cameraAreaProjection3.UpdateShaderValues4D();
    }

    ShowThumbnail(show){
        if(show){
            this.canvas.className = "hidden";
            this.thumbnail.className = "thumbnail";
        }
        else{
            this.canvas.className = "canvas";
            this.thumbnail.className = "hidden";
        }
    }

    LinkElementsFromName(){           
        this.linked_element_input_dynamic_position_x = document.getElementById("input_dynamic_position_x");
        this.linked_element_input_dynamic_position_y = document.getElementById("input_dynamic_position_y");
        this.linked_element_input_dynamic_position_z = document.getElementById("input_dynamic_position_z");
        this.linked_element_input_dynamic_position_w = document.getElementById("input_dynamic_position_w");
        if(this.name == "main"){
            this.linked_element_input_clicked_position_x = document.getElementById("input_clicked_position_main_x")
            this.linked_element_input_clicked_position_y = document.getElementById("input_clicked_position_main_y")
            this.linked_element_input_clicked_position_z = document.getElementById("input_clicked_position_main_z")
            this.linked_element_input_clicked_position_w = document.getElementById("input_clicked_position_main_w")

            this.linked_element_input_clicked_center_x = document.getElementById("input_clicked_center_main_x")
            this.linked_element_input_clicked_center_y = document.getElementById("input_clicked_center_main_y")
            this.linked_element_input_clicked_center_z = document.getElementById("input_clicked_center_main_z")
            this.linked_element_input_clicked_center_w = document.getElementById("input_clicked_center_main_w")

            this.linked_element_input_clicked_id = document.getElementById("input_clicked_streamline_id_main")
        }
        else if (this.name == "side"){
            this.linked_element_input_clicked_position_x = document.getElementById("input_clicked_position_aux_x")
            this.linked_element_input_clicked_position_y = document.getElementById("input_clicked_position_aux_y")
            this.linked_element_input_clicked_position_z = document.getElementById("input_clicked_position_aux_z")
            this.linked_element_input_clicked_position_w = document.getElementById("input_clicked_position_aux_w")

            this.linked_element_input_clicked_center_x = document.getElementById("input_clicked_center_aux_x")
            this.linked_element_input_clicked_center_y = document.getElementById("input_clicked_center_aux_y")
            this.linked_element_input_clicked_center_z = document.getElementById("input_clicked_center_aux_z")
            this.linked_element_input_clicked_center_w = document.getElementById("input_clicked_center_aux_w")

            this.linked_element_input_clicked_id = document.getElementById("input_clicked_streamline_id_aux")
        }
        else{
            console.warn("UNKNOWN NAME:", this.name)
        }
    }

    InitializeShaders(gl){    
        this.program_compare = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compare, V_SHADER_RAYTRACING, F_SHADER_COMPARE);
        this.location_compare = new UniformLocationsCompare(gl, this.program_compare);
        this.shader_uniforms_compare = this.loadShaderUniformsCompare(gl, this.program_compare);
        this.attribute_location_dummy_program_compare = gl.getAttribLocation(this.program_compare, "a_position");

        this.program_average = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_average, V_SHADER_RAYTRACING, F_SHADER_AVERAGE);
        this.location_average = new UniformLocationsAverage(gl, this.program_average);
        this.shader_uniforms_average = this.loadShaderUniformsAverage(gl, this.program_average);
        this.attribute_location_dummy_program_average = gl.getAttribLocation(this.program_average, "a_position");

        this.program_copy = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_copy, V_SHADER_RAYTRACING, F_SHADER_COPY);
        this.location_copy = new UniformLocationsCopy(gl, this.program_copy);
        this.shader_uniforms_copy = this.loadShaderUniformsCopy(gl, this.program_copy);
        this.attribute_location_dummy_program_copy = gl.getAttribLocation(this.program_copy, "a_position");

        this.program_resampling = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_resampling, V_SHADER_RAYTRACING, F_SHADER_RESAMPLING);
        this.location_resampling = new UniformLocationsResampling(gl, this.program_resampling);
        this.shader_uniforms_resampling = this.loadShaderUniformsResampling(gl, this.program_resampling);
        this.attribute_location_dummy_program_resampling = gl.getAttribLocation(this.program_resampling, "a_position");

        this.program_ftle_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_ftle_slice, V_SHADER_RAYTRACING, F_SHADER_FLOW_MAP_SLICE);
        this.location_ftle_slice = new UniformLocationsFTLESlice(gl, this.program_ftle_slice);
        this.shader_uniforms_ftle_slice = this.loadShaderUniformsFTLESlice(gl, this.program_ftle_slice);
        this.attribute_location_dummy_program_ftle_slice = gl.getAttribLocation(this.program_ftle_slice, "a_position");
    }

    SetRayTracingProgram(gl, shader_container){
        console.log("SetRayTracingProgram");
        this.shader_container_ray_tracing = shader_container;
        this.program_raytracing = shader_container.program;
        this.location_raytracing = new UniformLocationsRayTracing(gl, this.program_raytracing);
        this.shader_uniforms_raytracing = this.loadShaderUniformsRayTracing(gl, this.program_raytracing);
        this.attribute_location_dummy_program_raytracing = gl.getAttribLocation(this.program_raytracing, "a_position"); 
    }

    CalculateLimitedMaxRayDistance(max_ray_distance) {
        var d = this.fog_density;
        this.max_ray_distance = max_ray_distance;
        this.limited_max_distance = max_ray_distance;
        if (this.fog_type == FOG_EXPONENTIAL) {
            this.limited_max_distance = Math.min(this.max_ray_distance, 6.90776 / d);//js allows division by zero;
        }
        else if (this.fog_type == FOG_EXPONENTIAL_SQUARED) {
            //see https://www.wolframalpha.com/input/?i=e%5E%28-%28d*z%29%5E2%29+%3E+0.001
            this.limited_max_distance = Math.min(this.max_ray_distance, 2.62826 * Math.sqrt(1 / (d * d)));//js allows division by zero;
        }
    }

    SetLightIntegratorParameters(max_ray_distance, light_integrator_type, light_integration_step_size, light_integration_max_step_count){
        this.CalculateLimitedMaxRayDistance(max_ray_distance);
        this.light_integrator_type = light_integrator_type;        
        this.light_integration_step_size = light_integration_step_size;
        this.light_integration_max_step_count = light_integration_max_step_count;
        /*
        if(light_integrator_type == LIGHT_INTEGRATOR_LINE){
            this.light_integration_step_size = this.limited_max_distance;
        }
        else if(light_integrator_type == LIGHT_INTEGRATOR_RK4){
            this.light_integration_step_size = light_integration_step_size;
        }
        */
        this.integrate_light = (light_integrator_type == LIGHT_INTEGRATOR_RK4) || (light_integrator_type == LIGHT_INTEGRATOR_EXPLICIT);
        

    }

    SetRenderSizes(width, height, width_panning, height_panning) {
        this.camera.SetRenderSizes(width, height, width_panning, height_panning);
    }

    SetCanvasSize(width, height) {

    }

    ShouldRenderColorBar() {
        return this.shading_mode_streamlines == SHADING_MODE_STREAMLINES_SCALAR;
    }

    ScheduleClickedPosition(control_mode){
        console.warn("canvas_wrapper: ScheduleClickedPosition:", this.name)
        this.update_clicked_position = true;
        this.update_clicked_position_control_mode = control_mode
    }

    ScheduleClickedDynamicPosition(){
        console.warn("canvas_wrapper: ScheduleClickedDynamicPosition:", this.name)
        this.update_clicked_dynamic_position = true;
    }

    UpdateResolutionFactor(gl, still_resolution_factor, panning_resolution_factor) {
        this.still_resolution_factor = still_resolution_factor;
        this.panning_resolution_factor = panning_resolution_factor;
        /*
        var width_still = Math.round(this.camera.width_original * still_resolution_factor);
        var height_still = Math.round(this.camera.height_original * still_resolution_factor);
        var width_panning = Math.round(this.camera.width_original * panning_resolution_factor);
        var height_panning = Math.round(this.camera.height_original * panning_resolution_factor);

        var changed = (width_still != this.camera.width_still) || (height_still != this.camera.height_still);
        if (changed) {
            this.camera.width_still = width_still;
            this.camera.height_still = height_still;
            this.render_wrapper_raytracing_still_left.resize(gl, width_still, height_still);
            this.render_wrapper_raytracing_still_right.resize(gl, width_still, height_still);
            this.camera.SetCorrectResolution();
        }

        var changed = (width_panning != this.camera.width_panning) || (height_panning != this.camera.height_panning);
        if (changed) {
            this.camera.width_panning = width_panning;
            this.camera.height_panning = height_panning;
            this.render_wrapper_raytracing_panning_left.resize(gl, width_panning, height_panning);
            this.render_wrapper_raytracing_panning_right.resize(gl, width_panning, height_panning);
            this.camera.SetCorrectResolution();
        }
        */
    }

    AutoUpdateResolution(gl){
        //var width = this.canvas.offsetWidth;
        //var height = this.canvas.offsetHeight;
        var width = this.canvas.clientWidth;
        var height = this.canvas.clientHeight;        
        this.UpdateResolution(gl, width, height);
    }

    UpdateResolution(gl, width, height){
        this.canvas_width = width;
        this.canvas_height = height;

        this.canvas.width = width;
        this.canvas.height = height;

        var width_still = Math.round(width * this.still_resolution_factor);
        var height_still = Math.round(height * this.still_resolution_factor);
        var width_panning = Math.round(width * this.panning_resolution_factor);
        var height_panning = Math.round(height * this.panning_resolution_factor);


        var changed = (width_still != this.camera.width_still) || (height_still != this.camera.height_still);
        if (changed) {
            console.log("12345", width, "x", height);
            this.camera.width_still = width_still;
            this.camera.height_still = height_still;
            this.render_wrapper_raytracing_still_left.resize(gl, width_still, height_still);
            this.render_wrapper_raytracing_still_right.resize(gl, width_still, height_still);
            this.camera.SetCorrectResolution();
            this.camera.changed = true;
            this.aliasing_index = -1;//skip extra frames when changiong resolution
        }

        if(this.adaptive_resolution){
            //this.adaptive_resolution_current_t = this.adaptive_resolution_next_t;
            width_panning = Math.round(module_utilit.lerp(width_panning, width_still, this.adaptive_resolution_snap_t));
            height_panning = Math.round(module_utilit.lerp(height_panning, height_still, this.adaptive_resolution_snap_t));
        }

        var changed = (width_panning != this.camera.width_panning) || (height_panning != this.camera.height_panning);

        if (changed) {
            console.log(width, "x", height);
            this.camera.width_panning = width_panning;
            this.camera.height_panning = height_panning;
            this.render_wrapper_raytracing_panning_left.resize(gl, width_panning, height_panning);
            this.render_wrapper_raytracing_panning_right.resize(gl, width_panning, height_panning);
            this.camera.SetCorrectResolution();
            this.camera.changed = true;
            this.aliasing_index = -1;//skip extra frames when changiong resolution
            //console.warn(width_panning, "x", height_panning, "(", this.adaptive_resolution_next_t, ")");
        }
    }

    startExport(gl, width, height){
        this.aliasing_index = -1;
        this.is_exporting = true;
        this.UpdateResolution(gl, width, height);     
        this.camera.repositionCamera(this.draw_mode == DRAW_MODE_PROJECTION, this.projection_index, this.is_main_renderer);
        this.camera.UpdateShaderValues(); 
        this.camera.changed = false;  
    }

    does_allow_dynamic_changes(){
        return this.draw_mode == DRAW_MODE_DEFAULT
    }
    
    get_did_update_clicked_position_and_reset(){
        var state = this.did_update_clicked_position;
        this.did_update_clicked_position = false;
        return state;
    }

    should_draw_retrieve(){
        if(this.update_clicked_position){
            return true;
        }
        if(this.force_draw_retrieve_once){
            return true;
        }
        //console.warn(this.name + ": " + this.output_y_percentage)
        //do not draw if the position didnt change
        if(this.output_x_percentage == this.output_x_percentage_old && this.output_y_percentage == this.output_y_percentage_old){
            return false;
        }
        this.output_x_percentage_old = this.output_x_percentage;
        this.output_y_percentage_old = this.output_y_percentage;

        //do not draw if not inside the canvas
        if(this.output_x_percentage < 0 || this.output_x_percentage > 1 || this.output_y_percentage < 0 || this.output_y_percentage > 1)
            return false;

        return true;
    }

    draw_retrieve(gl){
        if(!this.should_draw_retrieve())
            return;
        this.force_draw_retrieve_once = false;


        var left_render_wrapper = this.camera.IsPanningOrForced() ? this.render_wrapper_raytracing_panning_left : this.render_wrapper_raytracing_still_left
        switch (this.draw_mode) {
            case DRAW_MODE_DEFAULT:
                break;
            case DRAW_MODE_FTLE_SLICE:
                return;//STOP HERE
            case DRAW_MODE_PROJECTION:
                break;
            case DRAW_MODE_STEREOGRAPHIC_PROJECTION:
                break;
            case DRAW_MODE_R4:
                break;
            case DRAW_MODE_S3:
                break;
            default:
                console.log("DRAW MODE ERROR", this.draw_mode);
                return;//STOP HERE
        }
        var get_pixel_data_results = true;
        this.drawTextureRaytracing(gl, left_render_wrapper, get_pixel_data_results);
    }

    //current_fps is used for resolution factor
    draw(gl, data_changed, settings_changed, time_now, current_fps) {
        //automatically change resolution if not exporting
        if(!this.is_exporting){
            this.AutoUpdateResolution(gl);                      
        }
        
        //skip extra frames when changiong resolution
        if(this.aliasing_index < 0){
            this.aliasing_index += 1;
            console.log("skip: ", this.aliasing_index);
            return;
        }

        if (this.camera.changed || data_changed || settings_changed)
            this.aliasing_index = 0;

        if (this.aliasing_index == this.aliasing.num_rays_per_pixel){
            if(!this.finished){
                this.finished = true;
                this.t_stop = performance.now();
                var t = Math.ceil(this.t_stop-this.t_start) 
                console.log("#Paper Performance render in: ", t, "ms", Math.ceil(t/64));       
            }
            return;
        }

        if(settings_changed){
            console.warn("settings_changed");
            this.adaptive_frame_counter = 0;
            this.adaptive_alternating_counter = 0;
            this.adaptive_number_changes = 0;
            this.adaptive_alternating_counter_since_last_change = 0;
            this.adaptive_last_change = ADAPTIVE_CHANGE_NONE;

            this.adaptive_min_t = 0;
            this.adaptive_resolution_current_t = 1;
            this.adaptive_max_t = 1;
        }

        if(this.camera.IsPanningOrForced()){
            this.adaptive_frame_counter += 1; 
        }
        
        if(this.adaptive_resolution){
            var flag = this.adaptive_frame_counter >= 3
                //&& this.adaptive_alternating_counter <= 3 
                && this.adaptive_number_changes <= 8;
            if(flag){
                if(time_now > this.adaptive_resolution_last_time_stamp + this.adaptive_resolution_cooldown){
                    if(current_fps > this.fps_threschold_increase_quality && this.adaptive_resolution_current_t < 1.0){
                        /*
                        if(this.adaptive_last_change == ADAPTIVE_CHANGE_NEGATIVE){
                            this.adaptive_alternating_counter += 1;
                        }
                        this.adaptive_last_change = ADAPTIVE_CHANGE_POSITIVE;
                        */
                        this.adaptive_min_t = this.adaptive_resolution_current_t;
                        this.adaptive_resolution_current_t = 0.5 * (this.adaptive_resolution_current_t + this.adaptive_max_t);

                        this.adaptive_frame_counter = 0;
                        this.adaptive_number_changes += 1;
                        this.adaptive_resolution_last_time_stamp = time_now;
    
                        this.adaptive_resolution_snap_t = this.adaptive_resolution_current_t > 0.95 ? 1 : this.adaptive_resolution_current_t < 0.05 ? 0 : this.adaptive_resolution_current_t;
                        var quality_string = this.adaptive_resolution_snap_t.toFixed(this.adaptive_resolution_decimals);
                        this.element_legend_associated_view.innerHTML = this.view_name+" [quality:" + quality_string+"]";
                        console.warn("fps: ", current_fps, " ---> INCREASE to", this.adaptive_resolution_current_t, "snap:", this.adaptive_resolution_snap_t);
                    }
                    else if(current_fps < this.fps_threschold_decrease_quality && this.adaptive_resolution_current_t > 0.0){
                         /*
                        if(this.adaptive_last_change == ADAPTIVE_CHANGE_POSITIVE){
                            this.adaptive_alternating_counter += 1;
                        }
                        this.adaptive_last_change = ADAPTIVE_CHANGE_NEGATIVE;
                        */
                        this.adaptive_max_t = this.adaptive_resolution_current_t;
                        this.adaptive_resolution_current_t = 0.5 * (this.adaptive_resolution_current_t + this.adaptive_min_t);

                        this.adaptive_frame_counter = 0;
                        this.adaptive_number_changes += 1;
                        this.adaptive_resolution_last_time_stamp = time_now;
                        
                        this.adaptive_resolution_snap_t = this.adaptive_resolution_current_t > 0.95 ? 1 : this.adaptive_resolution_current_t < 0.05 ? 0 : this.adaptive_resolution_current_t;
                        var quality_string = this.adaptive_resolution_snap_t.toFixed(this.adaptive_resolution_decimals);
                        this.element_legend_associated_view.innerHTML = this.view_name+" [quality:" + quality_string+"]";
                        console.warn("fps: ", current_fps, " ---> REDUCE to", this.adaptive_resolution_current_t, "snap:", this.adaptive_resolution_snap_t);
                    }    
                }
            }
        }
        /*
        if(this.adaptive_resolution){
            var flag = this.adaptive_frame_counter >= 3
                && this.adaptive_alternating_counter <= 3 
                && this.adaptive_alternating_number_changes <= 8;
            if(flag){
                if(time_now > this.adaptive_resolution_last_time_stamp + this.adaptive_resolution_cooldown){
                    if(current_fps > 30 && this.adaptive_resolution_current_t < 1.0){
                        if(this.adaptive_last_change == ADAPTIVE_CHANGE_NEGATIVE){
                            this.adaptive_alternating_counter += 1;
                        }
                        this.adaptive_frame_counter = 0;
                        this.adaptive_alternating_number_changes += 1;
                        this.adaptive_last_change = ADAPTIVE_CHANGE_POSITIVE;
                        var current_step_size = this.adaptive_resolution_step_size / Math.pow(2, this.adaptive_alternating_counter);
                        this.adaptive_resolution_last_time_stamp = time_now;
                        this.adaptive_resolution_current_t = Math.min(1.0, this.adaptive_resolution_current_t + current_step_size);
    
                        var quality_string = this.adaptive_resolution_current_t.toFixed(this.adaptive_resolution_decimals);
                        this.element_legend_associated_view.innerHTML = this.view_name+" [quality:" + quality_string+"]";
                        console.warn("fps: ", current_fps, " ---> INCREASE to", this.adaptive_resolution_current_t);
                    }
                    else if(current_fps < 15 && this.adaptive_resolution_current_t > 0.0){
                        if(this.adaptive_last_change == ADAPTIVE_CHANGE_POSITIVE){
                            this.adaptive_alternating_counter += 1;
                        }
                        this.adaptive_frame_counter = 0;
                        this.adaptive_alternating_number_changes += 1;
                        this.adaptive_last_change = ADAPTIVE_CHANGE_NEGATIVE;
                        var current_step_size = this.adaptive_resolution_step_size / Math.pow(2, this.adaptive_alternating_counter);
                        this.adaptive_resolution_last_time_stamp = time_now;
                        this.adaptive_resolution_current_t = Math.max(0.0, this.adaptive_resolution_current_t - current_step_size);
                        
                        var quality_string = this.adaptive_resolution_current_t.toFixed(this.adaptive_resolution_decimals);
                        this.element_legend_associated_view.innerHTML = this.view_name+" [quality:" + quality_string+"]";
                        console.warn("fps: ", current_fps, " ---> REDUCE to", this.adaptive_resolution_current_t);
                    }    
                }
            }
        }
        */


        if (this.aliasing_index == 0){
            this.finished = false;
            this.t_start = performance.now();
        }

        //if at least one frame is drawn, check if progressive drawing is allowed
        if (this.aliasing_index > 0){
            //panning camera has priority
            if(this.camera.other_camera_is_panning)
                return;   
                         
            var continue_drawing = this.camera.mouse_in_canvas || this.camera.panning || this.is_exporting;
            if(!continue_drawing)
                return;
        }        

        //console.log("aliasing_index: ", this.aliasing_index, "panning:", this.camera.panning);
        //console.log("offset_x: ", this.aliasing.offset_x[this.aliasing_index]);
        //console.log("offset_y: ", this.aliasing.offset_y[this.aliasing_index]);
        //console.log("draw CanvasWrapper: ", this.name);
        //console.log("CanvasWrapper gl: ", gl)
        //console.log("CanvasWrapper canvas: ", this.canvas)
        var left_render_wrapper = this.camera.IsPanningOrForced() ? this.render_wrapper_raytracing_panning_left : this.render_wrapper_raytracing_still_left

        switch (this.draw_mode) {
            case DRAW_MODE_DEFAULT:
                this.draw_mode_raytracing(gl, left_render_wrapper);
                break;
            case DRAW_MODE_FTLE_SLICE:
                this.draw_mode_ftle_slice(gl, left_render_wrapper);
                break;
            case DRAW_MODE_PROJECTION:
                this.draw_mode_raytracing(gl, left_render_wrapper);
                break;
            case DRAW_MODE_STEREOGRAPHIC_PROJECTION:
                this.draw_mode_raytracing(gl, left_render_wrapper);
                break;
            case DRAW_MODE_R4:
                this.draw_mode_raytracing(gl, left_render_wrapper);
                break;
            case DRAW_MODE_S3:
                this.draw_mode_raytracing(gl, left_render_wrapper);
                break;
            default:
                console.log("DRAW MODE ERROR", this.draw_mode);
                break;
        }

        if(this.repeat_same_aliasing_index){
            //it was already repeated --> continue normally
            this.repeat_same_aliasing_index = false;
            this.aliasing_index += 1;
        }else if(this.show_comparison_marker && this.aliasing_index == this.quality_marker_index){
            //not yet repeated --> repeat this index once
            this.repeat_same_aliasing_index = true;
        }
        else{
            this.aliasing_index += 1;//normal case, increment after each iteration
        }

    }

    //only for aux view
    update_draw_mode_aux(){
        var draw_mode_default = parseInt(document.getElementById("select_side_mode").value);//3 torus
        var draw_mode_s3 = parseInt(document.getElementById("select_side_mode_s3").value);//s3
        var projection_index = parseInt(document.getElementById("select_projection_index").value);
        var show_streamlines = this.tree_view.IsVisibleInHierarchy(9);
        var streamline_method = show_streamlines ? parseInt(document.getElementById("select_side_canvas_streamline_method").value) : STREAMLINE_DRAW_METHOD_NONE;
        var streamline_method_projection = show_streamlines ? parseInt(document.getElementById("select_side_canvas_streamline_method_projection").value) : STREAMLINE_DRAW_METHOD_NONE;
    
        var space = this.streamline_context_static.streamline_generator.space;

        var draw_mode = space == SPACE_3_SPHERE_4_PLUS_4D ? draw_mode_s3 : draw_mode_default;
        this.set_draw_mode(draw_mode, projection_index, streamline_method, streamline_method_projection)
        
        this.camera.OnUpdateBehavior(space, draw_mode);

    }

    set_draw_mode(draw_mode, projection_index, streamline_method, streamline_method_projection) {
        if (this.draw_mode == draw_mode && this.projection_index == projection_index && this.streamline_method == streamline_method && this.streamline_method_projection == streamline_method_projection)
            return;
        console.log("change draw mode: ", draw_mode, projection_index, streamline_method);
        this.draw_mode = draw_mode;
        this.projection_index = projection_index;
        this.streamline_method = streamline_method;
        this.streamline_method_projection = streamline_method_projection;
        this.aliasing_index = 0;
        this.camera.changed = true;

        var save_old_state = true;
        switch (this.draw_mode) {
            case DRAW_MODE_DEFAULT:
                this.camera.loadState("state_default", save_old_state);
                break;
            case DRAW_MODE_R4:
                this.camera.loadState("state_default", save_old_state);
                if(this.streamline_method != STREAMLINE_DRAW_METHOD_NONE)
                    this.streamline_method = STREAMLINE_DRAW_METHOD_FUNDAMENTAL;//overrides the part index
                break;
            case DRAW_MODE_S3:
                //this.camera.loadState("state_default", save_old_state);
                break;
            case DRAW_MODE_STEREOGRAPHIC_PROJECTION:
                this.camera.loadState("state_default", save_old_state);
                if(this.streamline_method != STREAMLINE_DRAW_METHOD_NONE)
                    this.streamline_method = STREAMLINE_DRAW_METHOD_R3;//overrides the part index
                break;
            case DRAW_MODE_FTLE_SLICE:
                break;
            case DRAW_MODE_PROJECTION:
                switch (this.projection_index) {
                    case 0:
                        this.camera.loadState("state_projection_x", save_old_state);
                        break;
                    case 1:
                        this.camera.loadState("state_projection_y", save_old_state);
                        break;
                    case 2:
                        this.camera.loadState("state_projection_z", save_old_state);
                        break;
                    default:
                        console.warn("PROJECTION INDEX ERROR", this.projection_index);
                        break;
                }
                break;
            default:
                console.warn("DRAW MODE ERROR", this.draw_mode);
                break;
        }
    }

    UpdateShaderFlags(){
        this.shader_flags.Update(
            this.streamline_context_static.streamline_generator.space,
            this.projection_index, 
            this.draw_mode, 
            this.max_iteration_count, 
            this.tube_radius_fundamental,
            this.tube_radius_factor, 
            this.tube_radius_factor_projection, 
            this.tube_radius_factor_projection_highlight,
            this.show_bounding_box,
            this.show_bounding_box_projection,
            this.streamline_method,
            this.streamline_method_projection, 
            this.volume_rendering_directions,
            this.show_movable_axes,
            this.cut_at_cube_faces,
            this.handle_inside,
            this.seed_visualization_mode,
            this.integrate_light,
            this.ridge_surface_directions);
    }

    draw_mode_raytracing(gl, left_render_wrapper) {        
        var get_pixel_data_results = false;

        if(this.repeat_same_aliasing_index){
            console.log("#Paper REPEAT", this.aliasing_index)
            this.drawTextureRaytracing(gl, left_render_wrapper, get_pixel_data_results);
            this.drawTextureCompare(gl, left_render_wrapper);
        }else{
            this.drawTextureRaytracing(gl, left_render_wrapper, get_pixel_data_results);
            this.drawTextureAverage(gl, left_render_wrapper);
            this.drawResampling(gl, left_render_wrapper);
            this.drawTextureSumCopy(gl, left_render_wrapper);
        }
    }

    draw_mode_ftle_slice(gl, left_render_wrapper) {
        this.drawFTLESlice(gl, left_render_wrapper);
    }

    should_render_dynamic_streamline(){
        var flag1 = this.show_dynamic_streamline;
        var flag2 = this.streamline_context_dynamic.has_streamline_calculation_finished;

        //disable render_dynamic_streamline if a streamline is selected
        //render_dynamic_streamline = render_dynamic_streamline && this.selected_streamline_id < 0;
        return flag1 && flag2
    }

    drawTextureRaytracing(gl, render_wrapper, get_pixel_data_results) {
        var fog_type = this.fog_type;
        var projection_index = -1;
        var max_iteration_count = this.max_iteration_count;
        var tube_radius_factor_active = this.tube_radius_factor;
        var tube_radius_factor_active_outside = this.tube_radius_factor;

        var render_face_border_intersections = this.render_face_border_intersections;
        var show_bounding_box = this.show_bounding_box;
        var show_bounding_box_projection = this.show_bounding_box_projection;

        var streamline_method = this.draw_mode == DRAW_MODE_PROJECTION ? this.streamline_method_projection : this.streamline_method;
        var show_streamlines = false;
        var show_streamlines_outside = false;
        switch (streamline_method) {
            case STREAMLINE_DRAW_METHOD_FUNDAMENTAL:
                show_streamlines = true;
                break;
            case STREAMLINE_DRAW_METHOD_R3:
                show_streamlines_outside = true;
                break;
            case STREAMLINE_DRAW_METHOD_BOTH:
                show_streamlines = true;
                show_streamlines_outside = true;
                break;
            default:
                break;
        }

        
        var show_volume_rendering = false;
        var show_volume_rendering_forward = false;
        var show_volume_rendering_backward = false;
        switch (this.volume_rendering_directions) {
            case FTLE_DIRECTIONS_BOTH:
                show_volume_rendering = true;
                show_volume_rendering_forward = true;
                show_volume_rendering_backward = true;
                break;
            case FTLE_DIRECTIONS_FORWARD:
                show_volume_rendering = true;
                show_volume_rendering_forward = true;
                break;
            case FTLE_DIRECTIONS_BACKWARD:
                show_volume_rendering = true;
                show_volume_rendering_backward = true;
                break;
            default:
                break;
        }

        if(this.draw_mode == DRAW_MODE_PROJECTION){            
            projection_index = this.projection_index;
            max_iteration_count = 1000;
            tube_radius_factor_active = this.tube_radius_factor_projection;
            tube_radius_factor_active_outside = this.tube_radius_factor_projection_highlight;
            //deactivate volume rendering in projection mode
            show_volume_rendering = false;
            show_bounding_box = false;
            render_face_border_intersections = false;
            //no fog in projection
            fog_type = FOG_NONE;
        }
        else{
            show_bounding_box_projection = false;
        }

        var tube_radius_active = this.tube_radius_fundamental * tube_radius_factor_active;
        var tube_radius_active_outside = this.tube_radius_fundamental * tube_radius_factor_active_outside;        

        if(get_pixel_data_results){
            //console.warn("get_pixel_data_results", 
            //    this.compute_wrapper_pixel_results.render_texture.texture_settings.width, 
            //    this.compute_wrapper_pixel_results.render_texture.texture_settings.height)
            //console.warn(this.compute_wrapper_pixel_results.frame_buffer)
            //this.compute_wrapper_pixel_results
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper_pixel_results.frame_buffer);
            gl.viewport(0, 0, 
                this.compute_wrapper_pixel_results.render_texture.texture_settings.width, 
                this.compute_wrapper_pixel_results.render_texture.texture_settings.height);
        }
        else{
            var use_alternative_buffer = this.repeat_same_aliasing_index;
            var buffer = use_alternative_buffer ? render_wrapper.frame_buffer_alternative : render_wrapper.frame_buffer;
            gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
            //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, this.camera.width, this.camera.height);
        }

        //use different distance for alternative frame
        var distance_between_points = this.volume_rendering_distance_between_points;
        if(this.repeat_same_aliasing_index){
            distance_between_points *= 0.1;
        } 

        //console.log(this.camera.width, this.camera.height);
        //console.warn("xy", this.output_x_percentage, this.output_y_percentage);
        gl.useProgram(this.program_raytracing);
        gl.uniform1i(this.location_raytracing.location_get_pixel_data_results, get_pixel_data_results);
        gl.uniform1f(this.location_raytracing.location_output_x_percentage, this.output_x_percentage);
        gl.uniform1f(this.location_raytracing.location_output_y_percentage, this.output_y_percentage);
        
        
        this.camera.WriteToUniform(gl, this.program_raytracing, "active_camera");
        this.InitAreaProjectionCameras();
        this.cameraAreaProjection0.WriteToUniform(gl, this.program_raytracing, "cameraAreaProjection0");
        this.cameraAreaProjection1.WriteToUniform(gl, this.program_raytracing, "cameraAreaProjection1");
        this.cameraAreaProjection2.WriteToUniform(gl, this.program_raytracing, "cameraAreaProjection2");
        this.cameraAreaProjection3.WriteToUniform(gl, this.program_raytracing, "cameraAreaProjection3");
        gl.uniform1i(this.location_raytracing.location_width, this.camera.width);
        gl.uniform1i(this.location_raytracing.location_height, this.camera.height);
        gl.uniform1i(this.location_raytracing.location_max_iteration_count, max_iteration_count);

        gl.uniform1i(this.location_raytracing.location_num_visual_seeds, this.global_data.GetNumVisualSeeds());        

        gl.uniform1f(this.location_raytracing.location_offset_x, this.aliasing.offset_x[this.aliasing_index]);
        gl.uniform1f(this.location_raytracing.location_offset_y, this.aliasing.offset_y[this.aliasing_index]);
        gl.uniform1f(this.location_raytracing.location_max_ray_distance, this.limited_max_distance);
        gl.uniform1f(this.location_raytracing.location_light_integration_step_size, this.light_integration_step_size);  
        gl.uniform1i(this.location_raytracing.location_light_integration_max_step_count, this.light_integration_max_step_count);       

        gl.uniform1i(this.location_raytracing.location_selected_streamline_id, this.selected_streamline_id);
        gl.uniform1f(this.location_raytracing.location_gray_scale_factor, this.gray_scale_factor);
        gl.uniform3f(this.location_raytracing.location_fog_color, this.fog_color[0], this.fog_color[1], this.fog_color[2]);
        gl.uniform3f(this.location_raytracing.location_selected_streamline_color, this.selected_streamline_color[0], this.selected_streamline_color[1], this.selected_streamline_color[2]);
        gl.uniform3f(this.location_raytracing.location_dynamic_streamline_color, this.dynamic_streamline_color[0], this.dynamic_streamline_color[1], this.dynamic_streamline_color[2]);
        gl.uniform3f(this.location_raytracing.location_forward_ftle_surface_color, this.forward_ftle_surface_color[0], this.forward_ftle_surface_color[1], this.forward_ftle_surface_color[2]);
        gl.uniform3f(this.location_raytracing.location_backward_ftle_surface_color, this.backward_ftle_surface_color[0], this.backward_ftle_surface_color[1], this.backward_ftle_surface_color[2]);
               
        gl.uniform4f(this.location_raytracing.location_dynamic_seed_position, 
            this.streamline_context_dynamic.streamline_generator.p_dynamic_streamline.position[0], 
            this.streamline_context_dynamic.streamline_generator.p_dynamic_streamline.position[1], 
            this.streamline_context_dynamic.streamline_generator.p_dynamic_streamline.position[2], 
            this.streamline_context_dynamic.streamline_generator.p_dynamic_streamline.position[3]);        
        gl.uniform1f(this.location_raytracing.location_max_cost, this.max_cost);
        gl.uniform1f(this.location_raytracing.location_max_volume_distance, this.max_volume_distance == 0 ? this.limited_max_distance : this.max_volume_distance);
        gl.uniform1f(this.location_raytracing.location_min_volume_distance, this.min_volume_distance);
        gl.uniform1f(this.location_raytracing.location_min_streamline_distance, this.min_streamline_distance);        
        gl.uniform1f(this.location_raytracing.location_volume_skip_first_fundamental_domain, this.volume_skip_first_fundamental_domain);        
        gl.uniform1f(this.location_raytracing.location_tube_radius, tube_radius_active);
        gl.uniform1f(this.location_raytracing.location_tube_radius_outside, tube_radius_active_outside);
        gl.uniform1f(this.location_raytracing.location_fog_density, this.fog_density);
        gl.uniform1f(this.location_raytracing.location_face_intersection_width, this.face_intersection_width);
        gl.uniform1i(this.location_raytracing.location_fog_type, fog_type);
        gl.uniform1i(this.location_raytracing.location_projection_index, projection_index);
        gl.uniform1i(this.location_raytracing.location_shading_mode_streamlines, this.shading_mode_streamlines);
        gl.uniform1i(this.location_raytracing.location_shading_mode_ftle_surface, this.shading_mode_ftle_surface);        
        gl.uniform1f(this.location_raytracing.location_min_scalar, this.min_scalar);
        gl.uniform1f(this.location_raytracing.location_max_scalar, this.max_scalar);
        gl.uniform1f(this.location_raytracing.location_min_scalar_ftle_surface, this.min_scalar_ftle_surface);
        gl.uniform1f(this.location_raytracing.location_max_scalar_ftle_surface, this.max_scalar_ftle_surface);
        gl.uniform1f(this.location_raytracing.location_ridge_surface_filter_strength, this.ridge_surface_filter_strength);
        gl.uniform1f(this.location_raytracing.location_ridge_surface_filter_ftle, this.ridge_surface_filter_ftle);    

        gl.uniform1i(this.location_raytracing.location_cut_at_cube_faces, this.cut_at_cube_faces);
        gl.uniform1i(this.location_raytracing.location_handle_inside, this.handle_inside);
        gl.uniform1i(this.location_raytracing.location_is_main_renderer, this.is_main_renderer);
        gl.uniform1i(this.location_raytracing.location_show_bounding_box, show_bounding_box);
        gl.uniform1i(this.location_raytracing.location_show_bounding_box_projection, show_bounding_box_projection);
        gl.uniform1i(this.location_raytracing.location_show_movable_axes, this.show_movable_axes);
        gl.uniform1i(this.location_raytracing.location_show_origin_axes, this.show_origin_axes);
        gl.uniform1i(this.location_raytracing.location_show_non_origin_axes, this.show_non_origin_axes);        
        gl.uniform1i(this.location_raytracing.location_show_streamlines, show_streamlines);
        gl.uniform1i(this.location_raytracing.location_show_streamlines_outside, show_streamlines_outside);
        
        var render_dynamic_streamline = this.should_render_dynamic_streamline();
        gl.uniform1i(this.location_raytracing.location_render_dynamic_streamline, render_dynamic_streamline);
        gl.uniform1i(this.location_raytracing.location_render_face_border_intersections, render_face_border_intersections);
        gl.uniform1i(this.location_raytracing.location_show_volume_rendering, show_volume_rendering);
        gl.uniform1i(this.location_raytracing.location_correct_volume_opacity, this.correct_volume_opacity);
        gl.uniform1i(this.location_raytracing.location_show_volume_rendering_forward, show_volume_rendering_forward);
        gl.uniform1i(this.location_raytracing.location_show_volume_rendering_backward, show_volume_rendering_backward);
        gl.uniform1f(this.location_raytracing.location_volume_rendering_distance_between_points, distance_between_points);
        gl.uniform1f(this.location_raytracing.location_volume_rendering_termination_opacity, this.volume_rendering_termination_opacity);
        gl.uniform1f(this.location_raytracing.location_volume_rendering_opacity_factor, this.volume_rendering_opacity_factor);
        
        var min_scalar_ftle = this.volume_rendering_mode == VOLUME_RENDERING_MODE_ORIGINAL_FTLE && (!this.force_overrite_ftle_limits) ? this.p_ftle_manager.ftle_min_value : this.overrite_min_scalar_ftle;
        var max_scalar_ftle = this.volume_rendering_mode == VOLUME_RENDERING_MODE_ORIGINAL_FTLE && (!this.force_overrite_ftle_limits) ? this.p_ftle_manager.ftle_max_value : this.overrite_max_scalar_ftle;

        gl.uniform1i(this.location_raytracing.location_volume_rendering_mode, this.volume_rendering_mode);
        gl.uniform1i(this.location_raytracing.location_volume_rendering_clamp_scalars, this.volume_rendering_clamp_scalars);
        gl.uniform1i(this.location_raytracing.location_ridges_force_symmetric_hessian, this.ridges_force_symmetric_hessian);        
        gl.uniform1i(this.location_raytracing.location_dim_x, this.p_ftle_manager.dim_x);
        gl.uniform1i(this.location_raytracing.location_dim_y, this.p_ftle_manager.dim_y);
        gl.uniform1i(this.location_raytracing.location_dim_z, this.p_ftle_manager.dim_z);
        gl.uniform1f(this.location_raytracing.location_min_scalar_ftle, min_scalar_ftle);
        gl.uniform1f(this.location_raytracing.location_max_scalar_ftle, max_scalar_ftle);
        gl.uniform1f(this.location_raytracing.location_ridge_lambda_threshold, this.ridge_lambda_threshold);
        gl.uniform1i(this.location_raytracing.location_transfer_function_index_streamline_scalar, this.transfer_function_index_streamline_scalar);
        gl.uniform1i(this.location_raytracing.location_transfer_function_index_ftle_forward, this.transfer_function_index_ftle_forward);
        gl.uniform1i(this.location_raytracing.location_transfer_function_index_ftle_backward, this.transfer_function_index_ftle_backward);
        
        gl.uniform1i(this.location_raytracing.location_eigen_orientation_method, this.eigen_orientation_method);
        gl.uniform1i(this.location_raytracing.location_ftle_surface_use_lambda_criterion, this.ftle_surface_use_lambda_criterion);
        gl.uniform1i(this.location_raytracing.location_max_bisection_iterations_per_interval, this.max_bisection_iterations_per_interval);
        gl.uniform1i(this.location_raytracing.location_max_number_of_bisection_intervals, this.max_number_of_bisection_intervals);
        gl.uniform1i(this.location_raytracing.location_max_number_of_volume_iterations, this.max_number_of_volume_iterations);
        
        gl.uniform1i(this.location_raytracing.location_debug_render_spherinder, this.debug_render_spherinder);
        gl.uniform1i(this.location_raytracing.location_debug_render_3Sphere, this.debug_render_3Sphere);

        gl.uniform1i(this.location_raytracing.location_light_integrator_type, this.light_integrator_type);
        
        var panning = this.camera.IsPanningOrForced();
        var active_lod = panning ? this.lod_index_panning : this.lod_index_still;
        this.streamline_context_static.bind_lod(this.name, active_lod, gl,
            this.shader_uniforms_raytracing,
            this.location_raytracing.location_texture_float,
            this.location_raytracing.location_texture_int);

        this.global_data.bind(this.name, gl,
            this.shader_uniforms_raytracing,
            this.location_raytracing.location_texture_float_global, gl.TEXTURE2, 2,
            this.location_raytracing.location_texture_int_global, gl.TEXTURE3, 3);

        this.p_ftle_manager.bind(this.name, gl,
            this.location_raytracing.location_texture_ftle, 4,
            this.location_raytracing.location_texture_ftle_gradient, 5,
            this.location_raytracing.location_texture_ftle_jacoby_direction_x, 8,
            this.location_raytracing.location_texture_ftle_jacoby_direction_y, 9,
            this.location_raytracing.location_texture_ftle_jacoby_direction_z, 10);

        this.streamline_context_dynamic.bind_lod(this.name, active_lod, gl,
            this.shader_uniforms_raytracing,
            this.location_raytracing.location_texture_dynamic_float,
            this.location_raytracing.location_texture_dynamic_int);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_raytracing);

        if(get_pixel_data_results){
            this.readPixelsRGBA(gl, this.compute_wrapper_pixel_results.render_texture.texture_settings.width, this.compute_wrapper_pixel_results.render_texture.texture_settings.height);
            this.pixel_results.setHitString(
                this.streamline_context_static.streamline_generator.termination_condition,
                this.streamline_context_static.streamline_generator.termination_max_value);
            if(this.update_clicked_position){
                if(this.update_clicked_position_control_mode == CONTROL_MODE_SELECT_STREAMLINE){
                    this.updateClickedPositionSelectStreamline()
                }
                else if(this.update_clicked_position_control_mode == CONTROL_MODE_DYNAMIC_STREAMLINE){
                    this.updateClickedPositionDynamicStreamline()
                }
                this.update_clicked_position = false;
            }
        }
    }

    SetOutputPositionPercentage(output_x_percentage, output_y_percentage){
        //console.warn("output ", this.name, output_x_percentage, output_y_percentage)
        this.output_x_percentage = output_x_percentage;
        this.output_y_percentage = output_y_percentage;
    }

    readPixelsRGBA(gl, dim_x, dim_y) {
        var pixels = new Float32Array(dim_x * dim_y * 4);
        var format = gl.RGBA;
        var type = gl.FLOAT;
        gl.readPixels(0, 0, dim_x, dim_y, format, type, pixels);
        this.pixel_results.setData(pixels);        
    }

    updateClickedPositionSelectStreamline(){
        this.did_update_clicked_position = true;
        var decimals = 6
        this.linked_element_input_clicked_position_x.value = this.pixel_results.position[0].toFixed(decimals);
        this.linked_element_input_clicked_position_y.value = this.pixel_results.position[1].toFixed(decimals);
        this.linked_element_input_clicked_position_z.value = this.pixel_results.position[2].toFixed(decimals);
        this.linked_element_input_clicked_position_w.value = this.pixel_results.position[3].toFixed(decimals);
        
        this.linked_element_input_clicked_center_x.value = this.pixel_results.center[0].toFixed(decimals);
        this.linked_element_input_clicked_center_y.value = this.pixel_results.center[1].toFixed(decimals);
        this.linked_element_input_clicked_center_z.value = this.pixel_results.center[2].toFixed(decimals);
        this.linked_element_input_clicked_center_w.value = this.pixel_results.center[3].toFixed(decimals);

        this.linked_element_input_clicked_id.value = this.pixel_results.streamline_id;
    }

    updateClickedPositionDynamicStreamline(){
        this.did_update_clicked_position = true;
        var decimals = 6
        this.linked_element_input_dynamic_position_x.value = this.pixel_results.position[0].toFixed(decimals);
        this.linked_element_input_dynamic_position_y.value = this.pixel_results.position[1].toFixed(decimals);
        this.linked_element_input_dynamic_position_z.value = this.pixel_results.position[2].toFixed(decimals);
        this.linked_element_input_dynamic_position_w.value = this.pixel_results.position[3].toFixed(decimals);
    }

    drawTextureCompare(gl, render_wrapper, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_wrapper.frame_buffer_compare);
        gl.viewport(0, 0, this.camera.width, this.camera.height);
        gl.useProgram(this.program_compare);
        gl.uniform1i(this.location_compare.location_width, this.camera.width);
        gl.uniform1i(this.location_compare.location_height, this.camera.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture.texture);
        gl.uniform1i(this.location_compare.location_texture1, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_alternative.texture);
        gl.uniform1i(this.location_compare.location_texture2, 1);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compare);
    }

    drawTextureAverage(gl, render_wrapper, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_wrapper.frame_buffer_average);
        gl.viewport(0, 0, this.camera.width, this.camera.height);
        gl.useProgram(this.program_average);
        gl.uniform1i(this.location_average.location_aliasing_index, this.aliasing_index);
        gl.uniform1i(this.location_average.location_width, this.camera.width);
        gl.uniform1i(this.location_average.location_height, this.camera.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture.texture);
        gl.uniform1i(this.location_average.location_texture1, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_average_in.texture);
        gl.uniform1i(this.location_average.location_texture2, 1);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_average);
    }

    //copies data from render_texture_average_out to render_texture_average_in to prepare next frame
    drawTextureSumCopy(gl, render_wrapper, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_wrapper.frame_buffer_average_copy);
        gl.viewport(0, 0, this.camera.width, this.camera.height);
        gl.useProgram(this.program_copy);
        gl.uniform1i(this.location_copy.location_width, this.camera.width);
        gl.uniform1i(this.location_copy.location_height, this.camera.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_average_out.texture);
        gl.uniform1i(this.location_copy.location_texture1, 0);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_copy);
    }

    drawResampling(gl, render_wrapper) {
        var show_progressbar = this.isRenderingIncomplete();
        var progress = this.aliasing_index / (this.aliasing.num_rays_per_pixel - 1);
        //console.log("drawResampling draw size", this.canvas_width, "x", this.canvas_height);
        //console.log("drawResampling draw size", this.canvas.width, "x", this.canvas.height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //gl.viewport(0, 0, this.canvas_width, this.canvas_height);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.useProgram(this.program_resampling);
        gl.uniform3f(this.location_resampling.location_quality_marker_color, this.quality_marker_color[0], this.quality_marker_color[1], this.quality_marker_color[2]);
        gl.uniform1i(this.location_resampling.location_show_comparison_marker, this.show_comparison_marker);  
        gl.uniform1i(this.location_resampling.location_quality_marker_index, this.quality_marker_index);          
        gl.uniform1f(this.location_resampling.location_show_progressbar, show_progressbar);      
        gl.uniform1f(this.location_resampling.location_progress, progress);
        //gl.uniform1i(this.location_resampling.location_width, this.canvas_width);
        //gl.uniform1i(this.location_resampling.location_height, this.canvas_height);
        gl.uniform1i(this.location_resampling.location_width, this.canvas.width);
        gl.uniform1i(this.location_resampling.location_height, this.canvas.height);
        gl.uniform1i(this.location_resampling.location_render_color_bar, this.ShouldRenderColorBar());

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_average_out.texture);
        gl.uniform1i(this.location_resampling.location_texture1, 0);
        /*
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_average_out.texture);
        gl.uniform1i(this.location_resampling.location_texture2, 1);
        */
        this.global_data.bind(this.name, gl,
            this.shader_uniforms_resampling,
            this.location_resampling.location_texture_float_global, gl.TEXTURE2, 2,
            this.location_resampling.location_texture_int_global, gl.TEXTURE3, 3);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_compare.texture);
        gl.uniform1i(this.location_resampling.location_texture_compare, 4);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_resampling);
    }

    drawFTLESlice(gl, render_wrapper) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas_width, this.canvas_height);
        gl.useProgram(this.program_ftle_slice);
        gl.uniform1i(this.location_ftle_slice.location_width, this.canvas_width);
        gl.uniform1i(this.location_ftle_slice.location_height, this.canvas_height);
        gl.uniform1i(this.location_ftle_slice.location_dim_x, this.p_ftle_manager.dim_x);
        gl.uniform1i(this.location_ftle_slice.location_dim_y, this.p_ftle_manager.dim_y);
        gl.uniform1i(this.location_ftle_slice.location_dim_z, this.p_ftle_manager.dim_z);
        gl.uniform1i(this.location_ftle_slice.location_slice_index, this.draw_slice_index);
        gl.uniform1i(this.location_ftle_slice.location_draw_slice_axes_order, this.draw_slice_axes_order);
        gl.uniform1i(this.location_ftle_slice.location_draw_slice_mode, this.draw_slice_mode);
        gl.uniform1f(this.location_ftle_slice.location_min_scalar, this.p_ftle_manager.ftle_min_value);
        gl.uniform1f(this.location_ftle_slice.location_max_scalar, this.p_ftle_manager.ftle_max_value);
        gl.uniform1i(this.location_ftle_slice.location_render_color_bar, true);
        gl.uniform1i(this.location_ftle_slice.location_transfer_function_index, this.transfer_function_index_ftle_forward);
        gl.uniform1i(this.location_ftle_slice.location_transfer_function_index_backward, this.transfer_function_index_ftle_backward);
        gl.uniform1i(this.location_ftle_slice.location_interpolate, this.ftle_slice_interpolate);
           
        /*
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, this.p_ftle_manager.data_texture_ftle.texture.texture);
        gl.uniform1i(this.location_ftle_slice.location_texture_flow_map, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, this.p_ftle_manager.data_texture_ftle_gradient.texture.texture);
        gl.uniform1i(this.location_ftle_slice.location_texture_ftle_differences, 1);
        */
        this.global_data.bind(this.name, gl,
            this.shader_uniforms_ftle_slice,
            this.location_ftle_slice.location_texture_float_global, gl.TEXTURE2, 2,
            this.location_ftle_slice.location_texture_int_global, gl.TEXTURE3, 3);
        
        this.p_ftle_manager.bind(this.name, gl,
            this.location_ftle_slice.location_texture_ftle, gl.TEXTURE0, 0,
            this.location_ftle_slice.location_texture_ftle_differences, gl.TEXTURE1, 1);
        /*
         this.p_ftle_manager.bind(this.name, gl,
             this.shader_uniforms_ftle_slice,
             this.location_ftle_slice.location_texture_flow_map);
        */


        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_ftle_slice);
    }

    isRenderingIncomplete() {
        return this.aliasing_index < this.aliasing.num_rays_per_pixel - 1;
    }

    loadShaderUniformsRayTracing(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        for(var part_index=0; part_index<NUMBER_OF_LOD_PARTS; part_index++){
            program_shader_uniforms.registerUniform("start_index_int_position_data"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_float_position_data"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_int_line_segments"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_float_line_segments"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_int_tree_nodes"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_float_tree_nodes"+part_index, "INT", -1);

            program_shader_uniforms.registerUniform("start_index_dynamic_int_position_data"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_dynamic_float_position_data"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_dynamic_int_line_segments"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_dynamic_float_line_segments"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_dynamic_int_tree_nodes"+part_index, "INT", -1);
            program_shader_uniforms.registerUniform("start_index_dynamic_float_tree_nodes"+part_index, "INT", -1);
        }

        program_shader_uniforms.registerUniform("start_index_int_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_cylinder", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_cylinder", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_seeds", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_seeds", "INT", -1);

        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsCompare(gl, program){
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        return program_shader_uniforms;
    }

    loadShaderUniformsAverage(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsCopy(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsResampling(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.registerUniform("start_index_int_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_cylinder", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_cylinder", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_seeds", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_seeds", "INT", -1);

        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsFTLESlice(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.registerUniform("start_index_int_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_cylinder", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_cylinder", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_seeds", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_seeds", "INT", -1);

        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

}

module.exports = CanvasWrapper;