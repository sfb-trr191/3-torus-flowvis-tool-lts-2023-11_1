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
//! [0]
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

vec3 phi(vec3 a, vec3 dir)
{    
    vec3 b = a + dir;  
    int iteration_count_at_border = 0;  
    while(CheckOutOfBounds(b)){
        vec3 dir_normalized = normalize(dir);
        vec3 dir_inv = 1.0/dir_normalized;

        //calculate exit c (the point where ray leaves the current instance)
        //formula: target = origin + t * direction
        //float tar_x = (direction.x > 0) ? 1 : 0;	
        //float tar_y = (direction.y > 0) ? 1 : 0;
        //float tar_z = (direction.z > 0) ? 1 : 0;
        vec3 tar = step(vec3(0,0,0), dir_normalized);
        //float t_x = (tar_x - origin.x) * dir_inv.x;	
        //float t_y = (tar_y - origin.y) * dir_inv.y;	
        //float t_z = (tar_z - origin.z) * dir_inv.z;	
        vec3 t_v = (tar - a) * dir_inv;	
        float t_exit = min(t_v.x, min(t_v.y, t_v.z));		
        vec3 c = a + t_exit * dir_normalized;

        //Calculate the distance dist between c and b (that is how far we need to go into the next FD)
        float dist = distance(c, b);

        //Apply boundary rule to (c, normalize(dir)) to get c_new and dir_new (because the rules are only valid at the border)
        vec3 dir_new = MoveOutOfBoundsDirection(c, dir_normalized);
        vec3 c_new = MoveOutOfBounds(c);

        //Calculate new b
        b = c_new + dist * normalize(dir_new);

        //Cleanup for next iteration:
        a = c_new;
        dir = b-a;

        //Detect infinite loop when a stays on border
        //if a starts at the border
        if(t_exit < 0.001)
        {            
            iteration_count_at_border += 1;
        }        
        if(iteration_count_at_border == 3){
            break;
        }

    }

    float epsilon = 0.0001;
    b = clamp(b, 0.0+epsilon, 1.0-epsilon);

    return b;
}

vec3 phi_track(vec3 a, vec3 dir, inout vec3 pos_r3)
{    
    vec3 b = a + dir;  
    int iteration_count_at_border = 0;  
    while(CheckOutOfBounds(b)){
        vec3 dir_normalized = normalize(dir);
        vec3 dir_inv = 1.0/dir_normalized;

        //calculate exit c (the point where ray leaves the current instance)
        //formula: target = origin + t * direction
        //float tar_x = (direction.x > 0) ? 1 : 0;	
        //float tar_y = (direction.y > 0) ? 1 : 0;
        //float tar_z = (direction.z > 0) ? 1 : 0;
        vec3 tar = step(vec3(0,0,0), dir_normalized);
        //float t_x = (tar_x - origin.x) * dir_inv.x;	
        //float t_y = (tar_y - origin.y) * dir_inv.y;	
        //float t_z = (tar_z - origin.z) * dir_inv.z;	
        vec3 t_v = (tar - a) * dir_inv;	
        float t_exit = min(t_v.x, min(t_v.y, t_v.z));		
        vec3 c = a + t_exit * dir_normalized;

        //Update the flow tracker variable
        pos_r3 += c - a;

        //Calculate the distance dist between c and b (that is how far we need to go into the next FD)
        float dist = distance(c, b);

        //Apply boundary rule to (c, normalize(dir)) to get c_new and dir_new (because the rules are only valid at the border)
        vec3 dir_new = MoveOutOfBoundsDirection(c, dir_normalized);
        vec3 c_new = MoveOutOfBounds(c);

        //Calculate new b
        b = c_new + dist * normalize(dir_new);

        //Cleanup for next iteration:
        a = c_new;
        dir = b-a;

        //Detect infinite loop when a stays on border
        //if a starts at the border
        if(t_exit < 0.001)
        {            
            iteration_count_at_border += 1;
        }        
        if(iteration_count_at_border == 3){
            break;
        }

    }

    float epsilon = 0.0001;
    b = clamp(b, 0.0+epsilon, 1.0-epsilon);

    //Update the flow tracker variable (this is either the entire segment, or the last part that remains in the new FD after exiting the old FD)
    pos_r3 += b - a;
    return b;
}

bool CheckOutOfBounds(vec3 position)
{    
	for(int i=0; i<3; i++)
	{
		if(position[i] > 1.0 + epsilon_out_of_bounds)
			return true;
		if(position[i] < 0.0 - epsilon_out_of_bounds)
			return true;
	}	
	return false;
}

vec3 MoveOutOfBounds(vec3 position)
{
	//user friendly variables
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	
	if(x1 > 1.0-epsilon_move_ray)
	{
		x1 = shader_rule_x_pos_x;
		x2 = shader_rule_x_pos_y;
		x3 = shader_rule_x_pos_z;
	}
	else if(x1 < 0.0+epsilon_move_ray)
	{
		x1 = shader_rule_x_neg_x;
		x2 = shader_rule_x_neg_y;
		x3 = shader_rule_x_neg_z;
	}

	if(x2 > 1.0-epsilon_move_ray)
	{
		x1 = shader_rule_y_pos_x;
		x2 = shader_rule_y_pos_y;
		x3 = shader_rule_y_pos_z;
	}
	else if(x2 < 0.0+epsilon_move_ray)
	{
		x1 = shader_rule_y_neg_x;
		x2 = shader_rule_y_neg_y;
		x3 = shader_rule_y_neg_z;
	}

	if(x3 > 1.0-epsilon_move_ray)
	{
		x1 = shader_rule_z_pos_x;
		x2 = shader_rule_z_pos_y;
		x3 = shader_rule_z_pos_z;
	}
	else if(x3 < 0.0+epsilon_move_ray)
	{
		x1 = shader_rule_z_neg_x;
		x2 = shader_rule_z_neg_y;
		x3 = shader_rule_z_neg_z;
	}

	return vec3(x1,x2,x3);
}

vec3 MoveOutOfBoundsDirection(vec3 position, vec3 direction)
{    
    //user friendly variables
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	float v1 = direction.x;
	float v2 = direction.y;
	float v3 = direction.z;

	if(x1 > 1.0-epsilon_move_ray)
	{
		v1 = shader_rule_x_pos_u;
		v2 = shader_rule_x_pos_v;
		v3 = shader_rule_x_pos_w;
	}
	else if(x1 < 0.0+epsilon_move_ray)
	{
		v1 = shader_rule_x_neg_u;
		v2 = shader_rule_x_neg_v;
		v3 = shader_rule_x_neg_w;
	}

	if(x2 > 1.0-epsilon_move_ray)
	{
		v1 = shader_rule_y_pos_u;
		v2 = shader_rule_y_pos_v;
		v3 = shader_rule_y_pos_w;
	}
	else if(x2 < 0.0+epsilon_move_ray)
	{
		v1 = shader_rule_y_neg_u;
		v2 = shader_rule_y_neg_v;
		v3 = shader_rule_y_neg_w;
	}

	if(x3 > 1.0-epsilon_move_ray)
	{
		v1 = shader_rule_z_pos_u;
		v2 = shader_rule_z_pos_v;
		v3 = shader_rule_z_pos_w;
	}
	else if(x3 < 0.0+epsilon_move_ray)
	{
		v1 = shader_rule_z_neg_u;
		v2 = shader_rule_z_neg_v;
		v3 = shader_rule_z_neg_w;
	}

	return vec3(v1,v2,v3);
}

`;