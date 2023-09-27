global.SHADER_MODULE_SHARED_UNIFORMS = `

uniform bool render_dynamic_streamline;
uniform bool get_pixel_data_results;
uniform float output_x_percentage;
uniform float output_y_percentage;


uniform int light_integrator_type;
uniform float light_integration_step_size;
uniform int light_integration_max_step_count;

uniform int num_visual_seeds;
uniform int visualize_seeds_mode;

uniform float color_r;
//TEXTURE0 = static streamline floats
//TEXTURE1 = static streamline ints
//TEXTURE2 = global data floats
//TEXTURE3 = global data ints
//TEXTURE4 = ftle 
//TEXTURE5 = ftle gradient
//TEXTURE6 = dynamic streamline floats
//TEXTURE7 = dynamic streamline ints
//TEXTURE8 = ftle jacobi direction x
//TEXTURE9 = ftle jacobi direction y
//TEXTURE10 = ftle jacobi direction z
uniform sampler3D texture_float;
uniform isampler3D texture_int;
uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;
uniform sampler3D texture_ftle;
uniform sampler3D texture_ftle_gradient;
uniform sampler3D texture_dynamic_float;
uniform isampler3D texture_dynamic_int;
uniform sampler3D texture_ftle_jacoby_direction_x;
uniform sampler3D texture_ftle_jacoby_direction_y;
uniform sampler3D texture_ftle_jacoby_direction_z;


uniform float offset_x;
uniform float offset_y;
uniform float maxRayDistance;
uniform float max_volume_distance;
uniform float min_volume_distance;
uniform float min_streamline_distance;
uniform bool volume_skip_first_fundamental_domain;
uniform int maxIterationCount;
uniform float tubeRadius;
uniform float tubeRadiusOutside;
uniform float fog_density;
uniform int fog_type;
uniform int shading_mode_streamlines;
uniform int shading_mode_ftle_surface;
uniform float min_scalar;
uniform float max_scalar;
uniform float min_scalar_ftle_surface;
uniform float max_scalar_ftle_surface;
uniform float ridge_surface_filter_strength;
uniform float ridge_surface_filter_ftle;
uniform int projection_index;

uniform bool is_main_renderer;
uniform bool show_origin_axes;
uniform bool show_non_origin_axes;
uniform bool correct_volume_opacity;
uniform float volume_rendering_distance_between_points;
uniform float volume_rendering_termination_opacity;
uniform float volume_rendering_opacity_factor;
uniform float min_scalar_ftle;
uniform float max_scalar_ftle;
uniform int volume_rendering_mode;
uniform float ridge_lambda_threshold;
uniform bool volume_rendering_clamp_scalars;
uniform bool ridges_force_symmetric_hessian;

uniform int max_bisection_iterations_per_interval;
uniform int max_number_of_bisection_intervals;
uniform int max_number_of_volume_iterations;
uniform bool ftle_surface_use_lambda_criterion;
uniform int eigen_orientation_method;

uniform int transfer_function_index_streamline_scalar;
uniform int transfer_function_index_ftle_forward;
uniform int transfer_function_index_ftle_backward;

uniform int width;
uniform int height;
uniform int dim_x;//dim of volume texture
uniform int dim_y;//dim of volume texture
uniform int dim_z;//dim of volume texture

uniform int selected_streamline_id;
uniform float gray_scale_factor;
uniform vec3 selected_streamline_color;
uniform vec3 dynamic_streamline_color;
uniform vec3 forward_ftle_surface_color;
uniform vec3 backward_ftle_surface_color;

uniform vec4 dynamic_seed_position;
uniform float max_streamline_cost;

uniform GL_CameraData active_camera;
uniform GL_CameraData cameraAreaProjection0;
uniform GL_CameraData cameraAreaProjection1;
uniform GL_CameraData cameraAreaProjection2;
uniform GL_CameraData cameraAreaProjection3;


//************************** redundant because of compiler directives ********************************

uniform bool show_volume_rendering;
uniform bool show_volume_rendering_forward;
uniform bool show_volume_rendering_backward;
uniform bool show_ridge_surface_forward;
uniform bool show_ridge_surface_backward;
uniform bool show_movable_axes;
uniform bool show_streamlines;//not yet entirely redundant
uniform bool show_streamlines_outside;//not yet entirely redundant
uniform bool show_bounding_box;
uniform bool show_bounding_box_projection;
uniform bool cut_at_cube_faces;
uniform bool handle_inside;

//**********************************************************

uniform bool debug_render_spherinder;
uniform bool debug_render_3Sphere;

`;