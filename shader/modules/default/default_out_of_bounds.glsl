global.SHADER_MODULE_DEFAULT_OUT_OF_BOUNDS = `

//used once at the beginning of intersect to reposition the original ray inside the fundamental domain (for fundamental domain based rendering)
//see: variableRay.origin = RepositionIntoFundamentalDomain(ray.origin);
vec3 RepositionIntoFundamentalDomain(vec3 position)
{
	vec3 new_position = vec3(position[0],position[1],position[2]);
	if(projection_index >= 0)
	{
		for (int i = 0; i < 3; i++) {
			if (i != projection_index) {			
				if (new_position[i] > 1.0) {
					float change = floor(abs(new_position[i]));
					new_position[i] -= change;
				}
				else if (new_position[i] < 0.0) {
					float change = ceil(abs(new_position[i]));
					new_position[i] += change;
				}			
			}
		}
	}
	return new_position;
}

bool CheckOutOfBounds(vec3 position)
{
	//if(!check_bounds)
	//	return false;
	//float error = 0.0001;
	//return true;
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
    //MARKER_RENAME_SYMBOLS DONE RULE
	//user friendly variables
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	//additional "constant" variables for this calculation
	//float x0 = x;
	//float y0 = y;
	//float z0 = z;
	
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

vec3 MoveOutOfBoundsTorusRules(vec3 position)
{
	//user friendly variables
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	//additional "constant" variables for this calculation
	//float x0 = x;
	//float y0 = y;
	//float z0 = z;
	
	if(x1 > 1.0-epsilon_move_ray)
	{
		x1 = x1 - 1.0;
	}
	else if(x1 < 0.0+epsilon_move_ray)
	{
		x1 = x1 + 1.0;
	}

	if(x2 > 1.0-epsilon_move_ray)
	{
		x2 = x2 - 1.0;
	}
	else if(x2 < 0.0+epsilon_move_ray)
	{
		x2 = x2 + 1.0;
	}

	if(x3 > 1.0-epsilon_move_ray)
	{
		x3 = x3 - 1.0;
	}
	else if(x3 < 0.0+epsilon_move_ray)
	{
        x3 = x3 + 1.0;
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

vec3 MoveOutOfBoundsAndGetFlags(vec3 position, inout MoveOutOfBoundsFlags flags)
{
	//user friendly variables
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	//additional "constant" variables for this calculation
	//float x0 = x;
	//float y0 = y;
	//float z0 = z;

    flags.x_greater = false;
    flags.x_smaller = false;
    flags.y_greater = false;
    flags.y_smaller = false;
    flags.z_greater = false;
    flags.z_smaller = false;
	
	if(x1 > 1.0-epsilon_move_ray)
	{
		x1 = x1-1.0;
		x2 = x2;
		x3 = x3;
        flags.x_greater = true;
	}
	else if(x1 < 0.0+epsilon_move_ray)
	{
		x1 = x1+1.0;
		x2 = x2;
		x3 = x3;
        flags.x_smaller = true;
	}

	if(x2 > 1.0-epsilon_move_ray)
	{
		x1 = x1;
		x2 = x2-1.0;
		x3 = x3;
        flags.y_greater = true;
	}
	else if(x2 < 0.0+epsilon_move_ray)
	{
		x1 = x1;
		x2 = x2+1.0;
		x3 = x3;
        flags.y_smaller = true;
	}

	if(x3 > 1.0-epsilon_move_ray)
	{
		x1 = x1;
		x2 = x2;
		x3 = x3-1.0;
        flags.z_greater = true;
	}
	else if(x3 < 0.0+epsilon_move_ray)
	{
		x1 = x1;
		x2 = x2;
		x3 = x3+1.0;
        flags.z_smaller = true;
	}

	return vec3(x1,x2,x3);
}

vec3 ApplyMoveOutOfBoundsFlags(vec3 position, MoveOutOfBoundsFlags flags)
{
	//user friendly variables
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	//additional "constant" variables for this calculation
	//float x0 = x;
	//float y0 = y;
	//float z0 = z;
	
	if(flags.x_greater)
	{
		x1 = x1-1.0;
		x2 = x2;
		x3 = x3;
	}
	else if(flags.x_smaller)
	{
		x1 = x1+1.0;
		x2 = x2;
		x3 = x3;
	}

	if(flags.y_greater)
	{
		x1 = x1;
		x2 = x2-1.0;
		x3 = x3;
	}
	else if(flags.y_smaller)
	{
		x1 = x1;
		x2 = x2+1.0;
		x3 = x3;
	}

	if(flags.z_greater)
	{
		x1 = x1;
		x2 = x2;
		x3 = x3-1.0;
	}
	else if(flags.z_smaller)
	{
		x1 = x1;
		x2 = x2;
		x3 = x3+1.0;
	}

	return vec3(x1,x2,x3);
}

vec3 MoveOutOfBoundsProjection(vec3 position)
{
	//user friendly variables
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	//additional "constant" variables for this calculation
	//float x0 = x;
	//float y0 = y;
	//float z0 = z;

    if(projection_index != 0){
        if(x1 > 1.0-epsilon_move_ray)
        {
            x1 = x1-1.0;
            x2 = x2;
            x3 = x3;
        }
        else if(x1 < 0.0+epsilon_move_ray)
        {
            x1 = x1+1.0;
            x2 = x2;
            x3 = x3;
        }
    }	

    if(projection_index != 1){
        if(x2 > 1.0-epsilon_move_ray)
        {
            x1 = x1;
            x2 = x2-1.0;
            x3 = x3;
        }
        else if(x2 < 0.0+epsilon_move_ray)
        {
            x1 = x1;
            x2 = x2+1.0;
            x3 = x3;
        }
    }

    if(projection_index != 2){
        if(x3 > 1.0-epsilon_move_ray)
        {
            x1 = x1;
            x2 = x2;
            x3 = x3-1.0;
        }
        else if(x3 < 0.0+epsilon_move_ray)
        {
            x1 = x1;
            x2 = x2;
            x3 = x3+1.0;
        }
    }
	return vec3(x1,x2,x3);
}

`;