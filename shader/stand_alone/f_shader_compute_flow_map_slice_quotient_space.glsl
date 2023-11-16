global.F_SHADER_COMPUTE_FLOW_MAP_SLICE_QUOTIENT_SPACE = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform int dim_x;
uniform int dim_y;
uniform int dim_z;

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
vec3 phi(vec3 a, vec3 dir);
vec3 phi_track(vec3 a, vec3 dir, inout vec3 pos_r3);
bool CheckOutOfBounds(vec3 position);
vec3 MoveOutOfBounds(vec3 position);
vec3 MoveOutOfBoundsDirection(vec3 position, vec3 direction);

const float PI = 3.1415926535897932384626433832795;
const float epsilon_move_ray = 0.0000001;//DUMMY
const float epsilon_out_of_bounds = 0.0;//00001;//DUMMY

$SHADER_MODULE_COMPUTE_PHI$
$SHADER_MODULE_COMPUTE_BOUNDS$

void main()
{
    //MARKER_MODIFIED_STREAMLINE_CALCULATION
    //TODO: new calculation method
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    float t_x = float(x) / float(dim_x-1);
    float t_y = float(y) / float(dim_y-1);
    float t_z = float(slice_index) / float(dim_z-1);

    bool flag = x == 0 || x == dim_x-1 || y == 0 || y == dim_y-1 || slice_index == 0 || slice_index == dim_z-1;
    if(false){
        outputColor = vec4(0,0,0,0);
        return;
    }

    vec3 previous_position = vec3(t_x, t_y, t_z);
    vec3 pos_r3 = previous_position;//this is the vector that tracks the flow

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
    outputColor = vec4(pos_r3,iteration_count);
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


`;