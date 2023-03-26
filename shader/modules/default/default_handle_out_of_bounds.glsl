global.SHADER_MODULE_DEFAULT_HANDLE_OUT_OF_BOUNDS = `


void HandleOutOfBound_LineSegment(bool dynamic, int part_index, Ray ray, int lineSegmentID, inout HitInformation hitCube)
{	
    float tube_radius = GetTubeRadius(part_index);

	GL_LineSegment lineSegment = GetLineSegment(dynamic, lineSegmentID, part_index);
	bool copy = (lineSegment.copy == 1);
	int multiPolyID = lineSegment.multiPolyID;
	if(ignore_copy && copy)
		return;

	float cost_a = GetCost(dynamic, lineSegment.indexA, part_index);
	float cost_b = GetCost(dynamic, lineSegment.indexB, part_index);
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
	vec3 a = GetPosition(dynamic, lineSegment.indexA, part_index);
	vec3 b = GetPosition(dynamic, lineSegment.indexB, part_index);
	float h = distance(a,b);
	HandleOutOfBound_Cylinder(dynamic, part_index, matrix, h, hitCube, copy, multiPolyID, cost_a, cost_b);
		
	Sphere sphere;
	sphere.radius = tube_radius;	
	sphere.center = a;
	HandleOutOfBound_Sphere(dynamic, part_index, sphere, hitCube, copy, multiPolyID);

	//sphere.center = b;
	//HandleOutOfBound_Sphere(interactiveStreamline, sphere, hitCube, copy, multiPolyID);	

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
	HandleOutOfBound_Sphere(dynamic, part_index, sphere, hitCube, copy, multiPolyID);	
	//IntersectSphere(interactiveStreamline, ray, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);	
}

void HandleOutOfBound_Cylinder(bool dynamic, int part_index, mat4 matrix, float h, inout HitInformation hitCube, bool copy, int multiPolyID, float cost_a, float cost_b)
{	
    float tube_radius = GetTubeRadius(part_index);
	
	vec3 position_face_os = (matrix * vec4(hitCube.position, 1)).xyz;
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
	if((hitCube.hitType==TYPE_NONE) || (distanceToCenter < hitCube.distanceToCenter))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hitCube.hitType = TYPE_STREAMLINE_SEGMENT;
		hitCube.copy = copy;
		hitCube.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hitCube.distanceToCenter = distanceToCenter;
		hitCube.positionCenter = vec3(-1, -1, -1);
	}		
}

void HandleOutOfBound_Sphere(bool dynamic, int part_index, Sphere sphere, inout HitInformation hitCube, bool copy, int multiPolyID)
{	

	float distanceToCenter = distance(hitCube.position, sphere.center);
	if(distanceToCenter > sphere.radius)
		return;
		
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hitCube.hitType==TYPE_NONE) || (distanceToCenter < hitCube.distanceToCenter))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hitCube.hitType = TYPE_STREAMLINE_SEGMENT;
		hitCube.copy = copy;
		hitCube.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hitCube.distanceToCenter = distanceToCenter;
		hitCube.positionCenter = vec3(-1, -1, -1);
	}	
}

`;