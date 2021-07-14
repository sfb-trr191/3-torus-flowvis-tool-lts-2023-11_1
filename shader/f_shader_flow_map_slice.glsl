global.F_SHADER_FLOW_MAP_SLICE = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform sampler3D texture_flow_map;

uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;

uniform int width;
uniform int height;
uniform int slice_index;

uniform float min_scalar;
uniform float max_scalar;


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

vec3 GetScalarColor(int index);
ivec3 GetIndex3D(int global_index);

const int TRANSFER_FUNCTION_BINS = 512;
const int TRANSFER_FUNCTION_LAST_BIN = TRANSFER_FUNCTION_BINS-1;

out vec4 outputColor;
//! [0]
void main()
{
    int min_canvas_dim = min(width, height);
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    int x_start = 0;
    if(width > height){
        x_start = (width - height) / 2;
    }

    float t_x = float(x-x_start) / float(min_canvas_dim-1);
    float t_y = float(y) / float(min_canvas_dim-1);

    int x_index = int(float(100) * t_x);
    int y_index = int(float(100) * t_y);

    ivec3 pointer = ivec3(x_index,y_index,slice_index);
    vec4 value = texelFetch(texture_flow_map, pointer, 0);

    float scalar = value[3];
    float t = (scalar - min_scalar) / (max_scalar - min_scalar);
    int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
    bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
    outputColor = vec4(GetScalarColor(bin),1);
    //outputColor = vec4(scalar,0,0,1);
    //outputColor = vec4(t_x,t_y,0,1);
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

vec3 GetScalarColor(int index)
{
	ivec3 pointer = GetIndex3D(start_index_float_scalar_color + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec3 color = vec3(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r
	);
	return color;
}

`;