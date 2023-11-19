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
uniform float termination_arc_length;
out vec4 outputColor;
const int max_iterations = 100000;

uniform int termination_condition;
const int FTLE_TERMINATION_CONDITION_ADVECTION_TIME = 1;
const int FTLE_TERMINATION_CONDITION_ARC_LENGTH = 2;

vec3 f(vec3 vector);
int CountBorderDimensions(int x_index_extended, int y_index_extended, int z_index_extended);
vec3 GetStartPosition(int count, int x_index_extended, int y_index_extended, int z_index_extended);
int CalculateFinalPositionRelative(vec3 start_position, inout vec3 final_position);

const float PI = 3.1415926535897932384626433832795;

$SHADER_MODULE_COMPUTE_BOUNDS$
$SHADER_MODULE_COMPUTE_PHI$
//! [0]
void main()
{    
    int x_index_extended = int(gl_FragCoord[0]);
    int y_index_extended = int(gl_FragCoord[1]);
    int z_index_extended = slice_index;
    
    int count = CountBorderDimensions(x_index_extended, y_index_extended, z_index_extended);
    if(count > 1){
        outputColor = vec4(0,0,0,0);
        return;
    }

    vec3 start_position = GetStartPosition(count, x_index_extended, y_index_extended, z_index_extended);
    vec3 final_position = vec3(0,0,0);
    int iteration_count = CalculateFinalPositionRelative(start_position, final_position);
    
    outputColor = vec4(final_position,iteration_count);
}

vec3 f(vec3 vector)
{
    //MARKER_RENAME_SYMBOLS DONE FTLE
	float x1 = vector.x;
	float x2 = vector.y;
	float x3 = vector.z;
	float u = shader_formula_u;
	float v = shader_formula_v;
	float w = shader_formula_w;
	return vec3(u*sign_f, v*sign_f, w*sign_f);	
}

//returns 0 for any node inside the FD
//returns 1 for a node that is interesting (i.e. requires boundary rules)
//returns 2 for edges --> no computation required
//returns 3 for corners --> no computation required
int CountBorderDimensions(int x_index_extended, int y_index_extended, int z_index_extended)
{
    int count = 0;
    count += (x_index_extended == 0 || x_index_extended == dim_x_extended-1) ? 1 : 0;
    count += (y_index_extended == 0 || y_index_extended == dim_y_extended-1) ? 1 : 0;
    count += (z_index_extended == 0 || z_index_extended == dim_z_extended-1) ? 1 : 0;
    return count;
}

vec3 GetPosition(int x_index, int y_index, int z_index)
{
    int dim_x = dim_x_extended - 2;
    int dim_y = dim_y_extended - 2;
    int dim_z = dim_z_extended - 2;
    float t_x = float(x_index) / float(dim_x-1);
    float t_y = float(y_index) / float(dim_y-1);
    float t_z = float(z_index) / float(dim_z-1);
    float val_x = mix(0.0, 1.0, t_x);
    float val_y = mix(0.0, 1.0, t_y);
    float val_z = mix(0.0, 1.0, t_z);

    vec3 position = vec3(val_x, val_y, val_z);
    return position;
}

vec3 GetStartPosition(int count, int x_index_extended, int y_index_extended, int z_index_extended){
    vec3 start_position = vec3(0,0,0);

    int dim_x = dim_x_extended - 2;
    int dim_y = dim_y_extended - 2;
    int dim_z = dim_z_extended - 2;
    float d_x = 1.0 / float(dim_x - 1);
    float d_y = 1.0 / float(dim_y - 1);
    float d_z = 1.0 / float(dim_z - 1);

    if(count == 0){
        int x_index = x_index_extended - 1;
        int y_index = y_index_extended - 1;
        int z_index = z_index_extended - 1;
        start_position = GetPosition(x_index, y_index, z_index);        
    }
    else{
        int x_index_extended_border = x_index_extended;
        int y_index_extended_border = y_index_extended;
        int z_index_extended_border = z_index_extended;
        vec3 vector_from_border_to_this = vec3(0,0,0);

        if(x_index_extended == 0){
            x_index_extended_border = 1;
            vector_from_border_to_this[0] = - d_x;
        }
        else if(x_index_extended == dim_x_extended - 1){
            x_index_extended_border = dim_x_extended - 2;
            vector_from_border_to_this[0] = d_x;
        }

        if(y_index_extended == 0){
            y_index_extended_border = 1;
            vector_from_border_to_this[1] = - d_y;
        }
        else if(y_index_extended == dim_y_extended - 1){
            y_index_extended_border = dim_y_extended - 2;
            vector_from_border_to_this[1] = d_y;
        }

        if(z_index_extended == 0){
            z_index_extended_border = 1;
            vector_from_border_to_this[2] = - d_z;
        }
        else if(z_index_extended == dim_z_extended - 1){
            z_index_extended_border = dim_z_extended - 2;
            vector_from_border_to_this[2] = d_z;
        }

        int x_index_border = x_index_extended_border - 1;
        int y_index_border = y_index_extended_border - 1;
        int z_index_border = z_index_extended_border - 1;
        vec3 border_position = GetPosition(x_index_border, y_index_border, z_index_border);
        //this results in a point outside the FD:
        //start_position = border_position + vector_from_border_to_this;
        //this results in a point inside the FD:
        start_position = phi(border_position, vector_from_border_to_this);
    }
    return start_position;
}

int CalculateFinalPositionRelative(vec3 start_position, inout vec3 final_position)    
{
    vec3 previous_position = start_position;
    vec3 pos_r3 = final_position;//this is the vector that tracks the flow

    vec3 previous_f = f(previous_position);
    float previous_speed = length(previous_f);
    float previous_cost = 0.0;//cost = time or length depending on termination_condition

    vec3 current_position;
    vec3 current_f;
    float current_speed = 0.0;
    float current_cost = 0.0;//cost = time or length depending on termination_condition

    float segment_length = 0.0;
    float average_speed = 0.0;
    float arc_length = 0.0;
    int iteration_count = 0;
    for (int i=0; i<max_iterations; i++){
        vec3 k1 = step_size * f(previous_position);
		vec3 k2 = step_size * f(phi(previous_position, k1/2.0));
		vec3 k3 = step_size * f(phi(previous_position, k2/2.0));
		vec3 k4 = step_size * f(phi(previous_position, k3));
				
        vec3 dir = k1 / 6.0 + k2 / 3.0 + k3 / 3.0 + k4 / 6.0;
		current_position = previous_position + dir;//this is the new position if we do NOT check out of bounds
        vec3 difference = current_position - previous_position;//used later but needs to be calculated before applying rules
        current_position = phi_track(previous_position, dir, pos_r3);//this is the new position if we DO check out of bounds

        current_f = f(current_position);
        current_speed = length(current_f);
        segment_length = length(difference);
        arc_length += segment_length;
        average_speed = (previous_speed + current_speed) * 0.5;


        //cost = time or length depending on termination_condition
        if(termination_condition == FTLE_TERMINATION_CONDITION_ADVECTION_TIME){
            current_cost = previous_cost + (segment_length / average_speed);
            //stop if speed is below threshold or advection time is reached
            if(current_cost > advection_time)
                break;
        }else{
            //FTLE_TERMINATION_CONDITION_ARC_LENGTH
            current_cost = arc_length;
            //stop if speed is below threshold or advection time is reached
            if(current_cost > termination_arc_length)
                break;
        }

        //prepare next iteration
        previous_position = current_position;
        previous_f = current_f;
        previous_cost = current_cost;
        previous_speed = current_speed;
        iteration_count = i;
    }
    final_position = pos_r3;
    return iteration_count;
} 

`;