global.F_SHADER_FLOW_MAP_SLICE = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform sampler3D texture_flow_map;
uniform sampler3D texture_ftle_differences;

uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;


uniform int dim_x;
uniform int dim_y;
uniform int dim_z;

uniform int width;
uniform int height;
uniform int slice_index;

uniform float min_scalar;
uniform float max_scalar;

uniform bool interpolate;
uniform bool render_color_bar;
uniform int transfer_function_index;
uniform int transfer_function_index_backward;

//DATA SIZES
const int STREAMLINE_COLOR_FLOAT_COUNT = 4;
const int STREAMLINE_COLOR_INT_COUNT = 0;

uniform int start_index_int_dir_lights;
uniform int start_index_float_dir_lights;
uniform int start_index_int_streamline_color;
uniform int start_index_float_streamline_color;
uniform int start_index_int_scalar_color;
uniform int start_index_float_scalar_color;
uniform int start_index_int_cylinder;
uniform int start_index_float_cylinder;

vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax);
bool GetTextureCoordinates(bool is_forward, inout vec3 coordinates);
bool GetPointer(bool is_forward, inout ivec3 pointer);
vec4 GetTextureColor(bool is_forward, int transfer_function_index);
vec4 GetNormalColor(bool is_forward);
vec3 GetScalarColor(int index, int transfer_function_index);
ivec3 GetIndex3D(int global_index);
void RenderColorBar(int transfer_function_index, int color_bar_min_x, int color_bar_max_x);

vec3 InterpolateVec3(sampler3D texture, vec3 texture_coordinate, int z_offset);
float InterpolateFloat(sampler3D texture, vec3 texture_coordinate, int z_offset);

const int TRANSFER_FUNCTION_BINS = 512;
const int TRANSFER_FUNCTION_LAST_BIN = TRANSFER_FUNCTION_BINS-1;

uniform int draw_slice_axes_order;
const int DRAW_SLICE_AXES_ORDER_HX_VY = 0;
const int DRAW_SLICE_AXES_ORDER_HX_VZ = 1;
const int DRAW_SLICE_AXES_ORDER_HZ_VY = 2;

uniform int draw_slice_mode;
const int DRAW_SLICE_MODE_COMBINED = 0;
const int DRAW_SLICE_MODE_FORWARD = 1;
const int DRAW_SLICE_MODE_BACKWARD = 2;
const int DRAW_SLICE_MODE_FORWARD_NORMAL = 3;
const int DRAW_SLICE_MODE_BACKWARD_NORMAL = 4;

out vec4 outputColor;
//! [0]
void main()
{
    int transfer_function_index_first = transfer_function_index;
    bool allow_color_bar = true;

    if(draw_slice_mode == DRAW_SLICE_MODE_FORWARD)
        outputColor = GetTextureColor(true, transfer_function_index);
    else if (draw_slice_mode == DRAW_SLICE_MODE_BACKWARD){
        transfer_function_index_first = transfer_function_index_backward;
        outputColor = GetTextureColor(false, transfer_function_index_backward);
    }
    else if (draw_slice_mode == DRAW_SLICE_MODE_COMBINED){
        vec4 col_forward = GetTextureColor(true, transfer_function_index);
        vec4 col_backward = GetTextureColor(false, transfer_function_index_backward);
        outputColor = (col_forward + col_backward) * 0.5;
    }
    else if(draw_slice_mode == DRAW_SLICE_MODE_FORWARD_NORMAL){
        outputColor = GetNormalColor(true);
        allow_color_bar = false;
    }
    else if(draw_slice_mode == DRAW_SLICE_MODE_BACKWARD_NORMAL){
        outputColor = GetNormalColor(false);
        allow_color_bar = false;
    }

    if(render_color_bar && allow_color_bar){
        int color_bar_min_x = 16;
        int color_bar_max_x = 32;
        int index_forward = transfer_function_index;
        RenderColorBar(transfer_function_index_first, color_bar_min_x, color_bar_max_x);
        if (draw_slice_mode == DRAW_SLICE_MODE_COMBINED){
            int color_bar_min_x = 32;
            int color_bar_max_x = 48;
            RenderColorBar(transfer_function_index_backward, color_bar_min_x, color_bar_max_x);
        }
    }
}

void RenderColorBar(int transfer_function_index, int color_bar_min_x, int color_bar_max_x){
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    int color_bar_min_y = 64;
    int color_bar_max_y = height-64;
    int color_bar_padding = 2;
    int color_bar_min_x_inside = color_bar_min_x + 2 * color_bar_padding;
    int color_bar_max_x_inside = color_bar_max_x - 2 * color_bar_padding;
    int color_bar_min_y_inside = color_bar_min_y + 2 * color_bar_padding;
    int color_bar_max_y_inside = color_bar_max_y - 2 * color_bar_padding;
    if(x >= color_bar_min_x && x <= color_bar_max_x && y >= color_bar_min_y && y <= color_bar_max_y){
        outputColor = vec4(0,0,0,1);
        if(x >= color_bar_min_x + color_bar_padding && x <= color_bar_max_x - color_bar_padding && y >= color_bar_min_y + color_bar_padding && y <= color_bar_max_y - color_bar_padding ){
            outputColor = vec4(1,1,1,1);
            if(x >= color_bar_min_x_inside && x <= color_bar_max_x_inside && y >= color_bar_min_y_inside && y <= color_bar_max_y_inside){
                float scalar = (float(y) - float(color_bar_min_y_inside)) / (float(color_bar_max_y_inside) - float(color_bar_min_y_inside));
                int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * scalar);
                bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
                outputColor = vec4(GetScalarColor(bin, transfer_function_index),1);
                return;
            }
        }
    }
}

vec4 GetTextureColor(bool is_forward, int transfer_function_index)
{
    float scalar;
    if(interpolate){
        vec3 texture_coordinate;
        bool is_inside = GetTextureCoordinates(is_forward, texture_coordinate);
        if(!is_inside){
            return vec4(0,0,0,1);
        }
        int z_offset = is_forward ? 0 : dim_z;
        scalar = InterpolateFloat(texture_flow_map, texture_coordinate, z_offset);
    }
    else{
        ivec3 pointer;
        bool is_inside = GetPointer(is_forward, pointer);
        if(!is_inside){
            return vec4(0,0,0,1);
        }
        scalar = texelFetch(texture_flow_map, pointer, 0).r;        
    }
    float t = (scalar - min_scalar) / (max_scalar - min_scalar);
    int bin = int(floor(0.5 + float(TRANSFER_FUNCTION_LAST_BIN) * t));
    bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
    return vec4(GetScalarColor(bin, transfer_function_index),1);
}

vec4 GetNormalColor(bool is_forward)
{
    vec3 normal;
    if(interpolate){
        vec3 texture_coordinate;
        bool is_inside = GetTextureCoordinates(is_forward, texture_coordinate);
        if(!is_inside){
            return vec4(0,0,0,1);
        }
        int z_offset = is_forward ? 0 : dim_z;
        normal = normalize(InterpolateVec3(texture_ftle_differences, texture_coordinate, z_offset));

    }
    else{
        ivec3 pointer;
        bool is_inside = GetPointer(is_forward, pointer);
        if(!is_inside){
            return vec4(0,0,0,1);
        }
        normal = texelFetch(texture_ftle_differences, pointer, 0).rgb;
    }
    vec3 normal_mapped = map(normal, vec3(-1,-1,-1), vec3(1,1,1), vec3(0,0,0), vec3(1,1,1));
    return vec4(normal_mapped, 1);
}

bool GetPointer(bool is_forward, inout ivec3 pointer){
    int min_canvas_dim = min(width, height);
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    int x_start = 0;
    if(width > height){
        x_start = (width - height) / 2;
    }

    float t_x = float(x-x_start) / float(min_canvas_dim-1);
    float t_y = float(y) / float(min_canvas_dim-1);

    bool outside = t_x < 0.0 || t_x > 1.0 || t_y < 0.0 || t_y > 1.0;
    if(outside)
        return false;

    int x_index = int(floor(0.5 + float(dim_x-1) * t_x));
    int y_index = int(floor(0.5 + float(dim_y-1) * t_y));
    int z_index = slice_index;
    if(draw_slice_axes_order == DRAW_SLICE_AXES_ORDER_HX_VZ){
        x_index = int(floor(0.5 + float(dim_x-1) * t_x));
        y_index = slice_index;
        z_index = int(floor(0.5 + float(dim_z-1) * t_y));
    }
    else if(draw_slice_axes_order == DRAW_SLICE_AXES_ORDER_HZ_VY){
        x_index = slice_index;
        y_index = int(floor(0.5 + float(dim_y-1) * t_y));
        z_index = int(floor(0.5 + float(dim_z-1) * t_x));
    }

    z_index = clamp(z_index, 0, dim_z-1);
    if(!is_forward)
        z_index += dim_z;
    pointer = ivec3(x_index,y_index,z_index);
    return true;
}

bool GetTextureCoordinates(bool is_forward, inout vec3 coordinates){
    int min_canvas_dim = min(width, height);
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    int x_start = 0;
    if(width > height){
        x_start = (width - height) / 2;
    }

    float t_x = float(x-x_start) / float(min_canvas_dim-1);
    float t_y = float(y) / float(min_canvas_dim-1);

    bool outside = t_x < 0.0 || t_x > 1.0 || t_y < 0.0 || t_y > 1.0;
    if(outside)
        return false;

    float x_coordinate = t_x;
    float y_coordinate = t_y;
    float z_coordinate = float(slice_index) / float(dim_z-1);
    if(draw_slice_axes_order == DRAW_SLICE_AXES_ORDER_HX_VZ){
        x_coordinate = t_x;
        y_coordinate = float(slice_index) / float(dim_y-1);
        z_coordinate = t_y;
    }
    else if(draw_slice_axes_order == DRAW_SLICE_AXES_ORDER_HZ_VY){
        x_coordinate = float(slice_index) / float(dim_x-1);
        y_coordinate = t_y;
        z_coordinate = t_x;
    }

    coordinates = vec3(x_coordinate,y_coordinate,z_coordinate);
    return true;
}

vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

//TEXTURE
const int tex_n_x = 512;
const int tex_n_y = 512;
const int tex_ny_nx = tex_n_y * tex_n_x;
ivec3 GetIndex3D(int global_index)
{  
  int z = global_index / tex_ny_nx;
  int y = (global_index % tex_ny_nx) / tex_n_x;
  int x = (global_index % tex_ny_nx) % tex_n_x;
  return ivec3(x,y,z);
}

vec3 GetScalarColor(int index, int transfer_function_index)
{
	ivec3 pointer = GetIndex3D(start_index_float_scalar_color 
        + transfer_function_index * TRANSFER_FUNCTION_BINS * STREAMLINE_COLOR_FLOAT_COUNT
        + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec3 color = vec3(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r
	);
	return color;
}

vec3 InterpolateVec3(sampler3D texture, vec3 texture_coordinate, int z_offset)
{
    float dx = 1.0 / float(dim_x-1);
    float dy = 1.0 / float(dim_y-1);
    float dz = 1.0 / float(dim_z-1);

    float x = texture_coordinate.r;
    float y = texture_coordinate.g;
    float z = texture_coordinate.b;

    int i = int(floor(x / dx));
    int j = int(floor(y / dy));
    int k = int(floor(z / dz));

    float t_x = (x - (float(i) * dx)) / dx;
    float t_y = (y - (float(j) * dy)) / dy;
    float t_z = (z - (float(k) * dz)) / dz;

    //get the 8 cell vertices
    vec3 v_000 = texelFetch(texture, ivec3(i+0, j+0, k+0+z_offset), 0).rgb;
    vec3 v_001 = texelFetch(texture, ivec3(i+0, j+0, k+1+z_offset), 0).rgb;
    vec3 v_010 = texelFetch(texture, ivec3(i+0, j+1, k+0+z_offset), 0).rgb;
    vec3 v_011 = texelFetch(texture, ivec3(i+0, j+1, k+1+z_offset), 0).rgb;
    vec3 v_100 = texelFetch(texture, ivec3(i+1, j+0, k+0+z_offset), 0).rgb;
    vec3 v_101 = texelFetch(texture, ivec3(i+1, j+0, k+1+z_offset), 0).rgb;
    vec3 v_110 = texelFetch(texture, ivec3(i+1, j+1, k+0+z_offset), 0).rgb;
    vec3 v_111 = texelFetch(texture, ivec3(i+1, j+1, k+1+z_offset), 0).rgb;

    //interpolate 4 points along x axis using t_x
    vec3 v_00 = mix(v_000, v_100, t_x);
    vec3 v_10 = mix(v_010, v_110, t_x);
    vec3 v_01 = mix(v_001, v_101, t_x);
    vec3 v_11 = mix(v_011, v_111, t_x);

    //interpolate 2 points along y axis using t_y
    vec3 v_0 = mix(v_00, v_10, t_y);
    vec3 v_1 = mix(v_01, v_11, t_y);

    //interpolate 1 points along z axis using t_z
    vec3 v = mix(v_0, v_1, t_z);

    return v;
}

float InterpolateFloat(sampler3D texture, vec3 texture_coordinate, int z_offset)
{
    float dx = 1.0 / float(dim_x-1);
    float dy = 1.0 / float(dim_y-1);
    float dz = 1.0 / float(dim_z-1);

    float x = texture_coordinate.r;
    float y = texture_coordinate.g;
    float z = texture_coordinate.b;

    int i = int(floor(x / dx));
    int j = int(floor(y / dy));
    int k = int(floor(z / dz));

    float t_x = (x - (float(i) * dx)) / dx;
    float t_y = (y - (float(j) * dy)) / dy;
    float t_z = (z - (float(k) * dz)) / dz;

    //get the 8 cell vertices
    float v_000 = texelFetch(texture, ivec3(i+0, j+0, k+0+z_offset), 0).r;
    float v_001 = texelFetch(texture, ivec3(i+0, j+0, k+1+z_offset), 0).r;
    float v_010 = texelFetch(texture, ivec3(i+0, j+1, k+0+z_offset), 0).r;
    float v_011 = texelFetch(texture, ivec3(i+0, j+1, k+1+z_offset), 0).r;
    float v_100 = texelFetch(texture, ivec3(i+1, j+0, k+0+z_offset), 0).r;
    float v_101 = texelFetch(texture, ivec3(i+1, j+0, k+1+z_offset), 0).r;
    float v_110 = texelFetch(texture, ivec3(i+1, j+1, k+0+z_offset), 0).r;
    float v_111 = texelFetch(texture, ivec3(i+1, j+1, k+1+z_offset), 0).r;

    //interpolate 4 points along x axis using t_x
    float v_00 = mix(v_000, v_100, t_x);
    float v_10 = mix(v_010, v_110, t_x);
    float v_01 = mix(v_001, v_101, t_x);
    float v_11 = mix(v_011, v_111, t_x);

    //interpolate 2 points along y axis using t_y
    float v_0 = mix(v_00, v_10, t_y);
    float v_1 = mix(v_01, v_11, t_y);

    //interpolate 1 points along z axis using t_z
    float v = mix(v_0, v_1, t_z);

    return v;
}

`;

