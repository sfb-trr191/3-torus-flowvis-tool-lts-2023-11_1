global.SHADER_MODULE_COMPUTE_BOUNDS = `

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