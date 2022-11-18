global.SHADER_MODULE_SHARED_UNIFORMS = `

uniform float light_integration_step_size;
uniform int light_integration_max_step_count;

uniform int num_visual_seeds;
uniform int visualize_seeds_mode;

uniform float color_r;
uniform sampler3D texture_float;
uniform isampler3D texture_int;
uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;
uniform sampler3D texture_ftle;
uniform sampler3D texture_ftle_differences;
uniform float offset_x;
uniform float offset_y;
uniform float maxRayDistance;
uniform float max_volume_distance;
uniform int maxIterationCount;
uniform float tubeRadius;
uniform float tubeRadiusOutside;
uniform float fog_density;
uniform int fog_type;
uniform int shading_mode_streamlines;
uniform float min_scalar;
uniform float max_scalar;
uniform int projection_index;

uniform bool is_main_renderer;
uniform bool show_origin_axes;
uniform float volume_rendering_distance_between_points;
uniform float volume_rendering_termination_opacity;
uniform float volume_rendering_opacity_factor;
uniform float min_scalar_ftle;
uniform float max_scalar_ftle;

uniform int transfer_function_index_streamline_scalar;
uniform int transfer_function_index_ftle_forward;
uniform int transfer_function_index_ftle_backward;

uniform int width;
uniform int height;
uniform int dim_x;//dim of volume texture
uniform int dim_y;//dim of volume texture
uniform int dim_z;//dim of volume texture


uniform float max_streamline_cost;

uniform GL_CameraData active_camera;

//************************** redundant because of compiler directives ********************************

uniform bool show_volume_rendering;
uniform bool show_volume_rendering_forward;
uniform bool show_volume_rendering_backward;
uniform bool show_movable_axes;
uniform bool show_streamlines;//not yet entirely redundant
uniform bool show_streamlines_outside;//not yet entirely redundant
uniform bool show_bounding_box;
uniform bool show_bounding_box_projection;
uniform bool cut_at_cube_faces;
uniform bool handle_inside;

//**********************************************************

`;