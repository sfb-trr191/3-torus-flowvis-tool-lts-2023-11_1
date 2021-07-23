global.F_SHADER_TRANSFER_FUNCTION = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;
uniform int use3D;
uniform int width;
uniform int height;

uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;


out vec4 outputColor;

const float progressbar_height = 0.02;

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

vec4 GetScalarColor(int index, int transfer_function_index);
ivec3 GetIndex3D(int global_index);
//varying vec2 v_texcoord;

const int TRANSFER_FUNCTION_BINS = 512;
const int TRANSFER_FUNCTION_LAST_BIN = TRANSFER_FUNCTION_BINS-1;
//! [0]
void main()
{
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    float t_x = float(x) / float(width);
    float t_y = float(y) / float(height);

    int padding = 8;
    int padding_bottom = 24;
    int gap = 8;
    int bar_height = 16;
    int min_x = padding-1;
    int max_x = width-padding-1;
    int min_y = padding_bottom-1;
    int max_y = height-padding-1;
    int max_y_bottom = min_y + bar_height;
    int min_y_center = max_y_bottom + gap;
    int min_y_top = max_y - bar_height;
    int max_y_center = min_y_top - gap;
    bool inside_x = x >= min_x && x <= max_x;
    bool inside_y = y >= min_y && y <= max_y;
    bool inside_top_y = y >= min_y_top;
    bool inside_center_y = y >= min_y_center && y <= max_y_center;
    bool inside_bottom_y = y <= max_y_bottom;
    bool inside_top_area = inside_x && inside_y && inside_top_y;
    bool inside_center_area = inside_x && inside_y && inside_center_y;
    bool inside_bottom_area = inside_x && inside_y && inside_bottom_y;
    
    if(inside_top_area){
        t_x = (float(x)-float(min_x)) / (float(max_x)-float(min_x));
        t_y = (float(y)-float(min_y_top)) / (float(max_y)-float(min_y_top));
        float scalar = t_x;
        int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * scalar);
        bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
        vec4 rgba = vec4(GetScalarColor(bin, 0));
        //vec3 color = mix(vec3(1,1,1), rgba.rgb * rgba.a, rgba.a);
        vec3 color = (vec3(1,1,1) - rgba.rgb) * (1.0-rgba.a) + rgba.rgb;
        //CInt((255 - R) * (A / 255.0) + R)
        outputColor = vec4(color, 1);
        //outputColor = rgba;
    }
    else if(inside_center_area){
        t_x = (float(x)-float(min_x)) / (float(max_x)-float(min_x));
        t_y = (float(y)-float(min_y_center)) / (float(max_y_center)-float(min_y_center));
        float scalar = t_x;
        int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * scalar);
        bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
        vec4 rgba = vec4(GetScalarColor(bin, 0));
        if(t_y <= rgba.a)
            outputColor = vec4(rgba.rgb, 1);
        else
            outputColor = vec4(1, 1, 1, 1);
    }
    else if(inside_bottom_area){
        t_x = (float(x)-float(min_x)) / (float(max_x)-float(min_x));
        t_y = (float(y)-float(min_y)) / (float(max_y_bottom)-float(min_y));
        float scalar = t_x;
        int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * scalar);
        bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
        vec4 rgba = vec4(GetScalarColor(bin, 0));
        outputColor = vec4(rgba.rgb, 1); 
    }
    else{
        float intensity = 0.9;
        outputColor = vec4(intensity,intensity,intensity, 1); 
    }
}
//! [0]

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

vec4 GetScalarColor(int index, int transfer_function_index)
{
    ivec3 pointer = GetIndex3D(start_index_float_scalar_color 
        + transfer_function_index * TRANSFER_FUNCTION_BINS * STREAMLINE_COLOR_FLOAT_COUNT
        + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec4 color = vec4(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(3,0,0), 0).r
	);
	return color;
}

`;