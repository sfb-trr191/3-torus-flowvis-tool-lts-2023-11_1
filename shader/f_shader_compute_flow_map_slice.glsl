global.F_SHADER_COMPUTE_FLOW_MAP_SLICE = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform int dim_x_extended;
uniform int dim_y_extended;
uniform int dim_z_extended;

uniform float extended_min_x;
uniform float extended_min_y;
uniform float extended_min_z;
uniform float extended_max_x;
uniform float extended_max_y;
uniform float extended_max_z;

uniform int slice_index;
uniform float sign_f;//1.0 for forward direction, -1.0 for backward direction
uniform float step_size;
uniform float advection_time;//T
out vec4 outputColor;
const int max_iterations = 10000;

vec3 f(vec3 vector);

const float PI = 3.1415926535897932384626433832795;
//! [0]
void main()
{
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    float t_x = float(x) / float(dim_x_extended-1);
    float t_y = float(y) / float(dim_y_extended-1);
    float t_z = float(slice_index) / float(dim_z_extended-1);

    float val_x = mix(extended_min_x, extended_max_x, t_x);
    float val_y = mix(extended_min_y, extended_max_y, t_y);
    float val_z = mix(extended_min_z, extended_max_z, t_z);

    vec3 previous_position = vec3(val_x, val_y, val_z);

    vec3 previous_f = f(previous_position);
    float previous_speed = length(previous_f);
    float previous_cost = 0.0;//cost = time

    vec3 current_position;
    vec3 current_f;
    float current_speed = 0.0;
    float current_cost = 0.0;//cost = time

    float segment_length = 0.0;
    float average_speed = 0.0;
    float arc_length = 0.0;
    int iteration_count = 0;
    for (int i=0; i<max_iterations; i++){
        vec3 k1 = step_size * f(previous_position);
		vec3 k2 = step_size * f(previous_position + k1/2.0);
		vec3 k3 = step_size * f(previous_position + k2/2.0);
		vec3 k4 = step_size * f(previous_position + k3);
				
		current_position = previous_position + k1 / 6.0 + k2 / 3.0 + k3 / 3.0 + k4 / 6.0;
        current_f = f(current_position);
        current_speed = length(current_f);
        vec3 difference = current_position - previous_position;
        segment_length = length(difference);
        arc_length += segment_length;
        average_speed = (previous_speed + current_speed) * 0.5;
        current_cost = previous_cost + (segment_length / average_speed);

        //stop if speed is below threshold or advection time is reached
        if(current_cost > advection_time)
            break;

        //prepare next iteration
        previous_position = current_position;
        previous_f = current_f;
        previous_cost = current_cost;
        previous_speed = current_speed;
        iteration_count = i;
    }
    outputColor = vec4(current_position,iteration_count);
}

vec3 f(vec3 vector)
{
	float x = vector.x;
	float y = vector.y;
	float z = vector.z;
	float u = shader_formula_u;
	float v = shader_formula_v;
	float w = shader_formula_w;
	return vec3(u*sign_f, v*sign_f, w*sign_f);	
}

`;