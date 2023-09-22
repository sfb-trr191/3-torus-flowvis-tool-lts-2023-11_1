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
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;
	
	if(x > 1.0-epsilon_move_ray)
	{
		x = shader_rule_x_pos_x;
		y = shader_rule_x_pos_y;
		z = shader_rule_x_pos_z;
	}
	else if(x < 0.0+epsilon_move_ray)
	{
		x = shader_rule_x_neg_x;
		y = shader_rule_x_neg_y;
		z = shader_rule_x_neg_z;
	}

	if(y > 1.0-epsilon_move_ray)
	{
		x = shader_rule_y_pos_x;
		y = shader_rule_y_pos_y;
		z = shader_rule_y_pos_z;
	}
	else if(y < 0.0+epsilon_move_ray)
	{
		x = shader_rule_y_neg_x;
		y = shader_rule_y_neg_y;
		z = shader_rule_y_neg_z;
	}

	if(z > 1.0-epsilon_move_ray)
	{
		x = shader_rule_z_pos_x;
		y = shader_rule_z_pos_y;
		z = shader_rule_z_pos_z;
	}
	else if(z < 0.0+epsilon_move_ray)
	{
		x = shader_rule_z_neg_x;
		y = shader_rule_z_neg_y;
		z = shader_rule_z_neg_z;
	}

	return vec3(x,y,z);
}

vec3 MoveOutOfBoundsDirection(vec3 position, vec3 direction)
{    
    //user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	float u = direction.x;
	float v = direction.y;
	float w = direction.z;

	if(x > 1.0-epsilon_move_ray)
	{
		u = shader_rule_x_pos_u;
		v = shader_rule_x_pos_v;
		w = shader_rule_x_pos_w;
	}
	else if(x < 0.0+epsilon_move_ray)
	{
		u = shader_rule_x_neg_u;
		v = shader_rule_x_neg_v;
		w = shader_rule_x_neg_w;
	}

	if(y > 1.0-epsilon_move_ray)
	{
		u = shader_rule_y_pos_u;
		v = shader_rule_y_pos_v;
		w = shader_rule_y_pos_w;
	}
	else if(y < 0.0+epsilon_move_ray)
	{
		u = shader_rule_y_neg_u;
		v = shader_rule_y_neg_v;
		w = shader_rule_y_neg_w;
	}

	if(z > 1.0-epsilon_move_ray)
	{
		u = shader_rule_z_pos_u;
		v = shader_rule_z_pos_v;
		w = shader_rule_z_pos_w;
	}
	else if(z < 0.0+epsilon_move_ray)
	{
		u = shader_rule_z_neg_u;
		v = shader_rule_z_neg_v;
		w = shader_rule_z_neg_w;
	}


	return vec3(u,v,w);
}

vec3 MoveOutOfBoundsAndGetFlags(vec3 position, inout MoveOutOfBoundsFlags flags)
{
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;

    flags.x_greater = false;
    flags.x_smaller = false;
    flags.y_greater = false;
    flags.y_smaller = false;
    flags.z_greater = false;
    flags.z_smaller = false;
	
	if(x > 1.0-epsilon_move_ray)
	{
		x = x-1.0;
		y = y;
		z = z;
        flags.x_greater = true;
	}
	else if(x < 0.0+epsilon_move_ray)
	{
		x = x+1.0;
		y = y;
		z = z;
        flags.x_smaller = true;
	}

	if(y > 1.0-epsilon_move_ray)
	{
		x = x;
		y = y-1.0;
		z = z;
        flags.y_greater = true;
	}
	else if(y < 0.0+epsilon_move_ray)
	{
		x = x;
		y = y+1.0;
		z = z;
        flags.y_smaller = true;
	}

	if(z > 1.0-epsilon_move_ray)
	{
		x = x;
		y = y;
		z = z-1.0;
        flags.z_greater = true;
	}
	else if(z < 0.0+epsilon_move_ray)
	{
		x = x;
		y = y;
		z = z+1.0;
        flags.z_smaller = true;
	}

	return vec3(x,y,z);
}

vec3 ApplyMoveOutOfBoundsFlags(vec3 position, MoveOutOfBoundsFlags flags)
{
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;
	
	if(flags.x_greater)
	{
		x = x-1.0;
		y = y;
		z = z;
	}
	else if(flags.x_smaller)
	{
		x = x+1.0;
		y = y;
		z = z;
	}

	if(flags.y_greater)
	{
		x = x;
		y = y-1.0;
		z = z;
	}
	else if(flags.y_smaller)
	{
		x = x;
		y = y+1.0;
		z = z;
	}

	if(flags.z_greater)
	{
		x = x;
		y = y;
		z = z-1.0;
	}
	else if(flags.z_smaller)
	{
		x = x;
		y = y;
		z = z+1.0;
	}

	return vec3(x,y,z);
}

vec3 MoveOutOfBoundsProjection(vec3 position)
{
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;

    if(projection_index != 0){
        if(x > 1.0-epsilon_move_ray)
        {
            x = x-1.0;
            y = y;
            z = z;
        }
        else if(x < 0.0+epsilon_move_ray)
        {
            x = x+1.0;
            y = y;
            z = z;
        }
    }	

    if(projection_index != 1){
        if(y > 1.0-epsilon_move_ray)
        {
            x = x;
            y = y-1.0;
            z = z;
        }
        else if(y < 0.0+epsilon_move_ray)
        {
            x = x;
            y = y+1.0;
            z = z;
        }
    }

    if(projection_index != 2){
        if(z > 1.0-epsilon_move_ray)
        {
            x = x;
            y = y;
            z = z-1.0;
        }
        else if(z < 0.0+epsilon_move_ray)
        {
            x = x;
            y = y;
            z = z+1.0;
        }
    }
	return vec3(x,y,z);
}

`;