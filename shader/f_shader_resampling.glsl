var F_SHADER_RESAMPLING = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;
uniform int use3D;
uniform int width;
uniform int height;

uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;

uniform float progress;
uniform bool show_progressbar;
uniform	int text_rect_width;
uniform	int text_rect_height;
uniform bool render_color_bar;

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

vec3 GetScalarColor(int index);
ivec3 GetIndex3D(int global_index);
//varying vec2 v_texcoord;

//! [0]
void main()
{
    //vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), float(1)-(gl_FragCoord[1]/float(height)));
    vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), (gl_FragCoord[1]/float(height)));
    //outputColor = vec4(v_texcoord[0],v_texcoord[1],0,1);
    outputColor = texture(texture1, v_texcoord);//center

    if(render_color_bar){
        int x = int(gl_FragCoord[0]);
        int y = int(gl_FragCoord[1]);
        int color_bar_min_x = 16;
        int color_bar_max_x = 32;
        int color_bar_min_y = 64;
        int color_bar_max_y = height-64;
        int color_bar_padding = 2;
        int color_bar_min_y_inside = color_bar_min_y + color_bar_padding;
        int color_bar_max_y_inside = color_bar_max_y - color_bar_padding;
        if(x >= color_bar_min_x && x <= color_bar_max_x && y >= color_bar_min_y && y <= color_bar_max_y){
            outputColor = vec4(1,1,1,1);
            if(x >= color_bar_min_x + color_bar_padding && x <= color_bar_max_x - color_bar_padding && y >= color_bar_min_y_inside && y <= color_bar_max_y_inside){
                float scalar = (float(y) - float(color_bar_min_y_inside)) / (float(color_bar_max_y_inside) - float(color_bar_min_y_inside));
                int bin = int(float(127) * scalar);
                bin = clamp(bin, 0, 127);
                outputColor = vec4(GetScalarColor(bin),1);
                return;
            }
        }
    }

    if(show_progressbar){
        if(v_texcoord.y < progressbar_height)
            {
                outputColor = vec4(0,0,0,1);
                if(v_texcoord.x < progress)        
                    outputColor = vec4(1,1,1,1);
                return;
            }
    }

    return;

    /*
    // Set fragment color from texture
    //gl_FragColor = texture2D(texture, v_texcoord);

    //vec4 col = vec4(col_1.r,col_1.y,col_1.z,1);
    //gl_FragColor = vec4(1,0,0,1);
    //gl_FragColor = vec4(col_2.x,col_1.y,col_1.z,1);
    //gl_FragColor = vec4(col_1.x,col_2.y,col_2.z,1);
    //gl_FragColor = vec4(col_1.x,0, 0, 1);
    //gl_FragColor = vec4(0,col_2.y,col_2.z,1);
    vec2 v_texcoord = vec2(gl_FragCoord[0]/width, 1-(gl_FragCoord[1]/height));

    if(progressbar)
    {
        if(v_texcoord.y > 1-progressbar_height)
        {
            outputColor = vec4(0,0,0,1);
            if(v_texcoord.x < progress)        
                outputColor = vec4(1,1,1,1);
            return;
        }
    }

    if(gl_FragCoord[0] < text_rect_width && height-gl_FragCoord[1] < text_rect_height)
    {
        outputColor = vec4(1,1,1,1);
        return;
    }

    if(use3D == 0)
    {
        outputColor = texture2D(texture, v_texcoord);//center
    }
    else
    {    
        vec4 col_1 = texture2D(texture, v_texcoord);//left
        vec4 col_2 = texture2D(texture2, v_texcoord);//right
        outputColor = vec4(col_1.x,col_2.y,col_2.z,1);
    }
    */
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
