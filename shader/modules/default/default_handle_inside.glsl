global.SHADER_MODULE_DEFAULT_HANDLE_INSIDE = `

void HandleInside_LineSegment(int part_index, Ray ray, int lineSegmentID, inout HitInformation hit)
{	
    float tube_radius = GetTubeRadius(part_index);

	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index);
	bool copy = (lineSegment.copy == 1);
	int multiPolyID = lineSegment.multiPolyID;
	if(ignore_copy && copy)
		return;

	float cost_a = GetCost(lineSegment.indexA, part_index);
	float cost_b = GetCost(lineSegment.indexB, part_index);
	float cost_cutoff = max_streamline_cost;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_a > cost_cutoff)
				return;
		}
	}
		
	mat4 matrix = lineSegment.matrix;
	mat4 matrix_inv = lineSegment.matrix_inv;
	vec3 a = GetPosition(lineSegment.indexA, part_index);
	vec3 b = GetPosition(lineSegment.indexB, part_index);
	float h = distance(a,b);
	HandleInside_Cylinder(part_index, matrix, matrix_inv, h, hit, copy, multiPolyID, cost_a, cost_b, ray.origin, ray);
		
	Sphere sphere;
	sphere.radius = tube_radius;	
	sphere.center = a;
	HandleInside_Sphere(part_index, sphere, hit, copy, multiPolyID, ray.origin, ray);

	sphere.center = b;
	float cost_b_value = cost_b;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_b > cost_cutoff)
			{
				float t = ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);
				sphere.center = mix(a, b, t);//ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);		
				cost_b_value = cost_cutoff;
				//sphere.radius = tube_radius * 1.1;		
			}
		}
	}
	HandleInside_Sphere(part_index, sphere, hit, copy, multiPolyID, ray.origin, ray);	
}

void HandleInside_Cylinder(int part_index, mat4 matrix, mat4 matrix_inv, float h, inout HitInformation hit, bool copy, int multiPolyID, float cost_a, float cost_b, vec3 position, Ray ray)
{	
    float tube_radius = GetTubeRadius(part_index);
	
	vec3 position_face_os = (matrix * vec4(position, 1)).xyz;
	float f_z = position_face_os.z;
	float f_x_2 = position_face_os.x * position_face_os.x; 
	float f_y_2 = position_face_os.y * position_face_os.y; 
	if(f_z > h || f_z < 0.0)
		return;
		
	float distanceToCenter = sqrt(f_x_2 + f_y_2);
	if(distanceToCenter > tube_radius)
		return;	

	float local_percentage = f_z / h;
	float cost = mix(cost_a, cost_b, local_percentage);
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}	
	}

	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distanceToCenter < hit.distanceToCenter)|| (ray.rayDistance < hit.distance))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		vec3 tube_center = (matrix_inv * vec4(0,0, f_z, 1)).xyz;

		hit.hitType = TYPE_STREAMLINE_SEGMENT;
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.distanceToCenter = distanceToCenter;
		hit.positionCenter = vec3(-1, -1, -1);
		hit.position = position;
		hit.normal = normalize(position - tube_center);//vec3(1, 0, 0);
		hit.distance = ray.rayDistance;	
        hit.distance_iteration = 0.0;
		hit.ignore_override = false;
		//hit.hitType = TYPE_GL_CYLINDER;//change
		//hit.objectColor = vec3(1, 1, 0);
	}		
}

void HandleInside_Sphere(int part_index, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, vec3 position, Ray ray)
{	

	float distanceToCenter = distance(position, sphere.center);
	if(distanceToCenter > sphere.radius)
		return;
		
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distanceToCenter < hit.distanceToCenter) || (ray.rayDistance < hit.distance))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hit.hitType = TYPE_STREAMLINE_SEGMENT;
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.distanceToCenter = distanceToCenter;
		hit.positionCenter = vec3(-1, -1, -1);
		hit.position = position;
		hit.normal = normalize(position - sphere.center);//vec3(1, 0, 0);
		hit.distance = ray.rayDistance;
        hit.distance_iteration = 0.0;
		//hit.hitType = TYPE_GL_CYLINDER;//change
		//hit.objectColor = vec3(1, 1, 0);
	}	
}

`;