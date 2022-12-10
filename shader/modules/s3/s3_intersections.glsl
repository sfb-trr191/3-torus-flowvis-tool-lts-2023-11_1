global.SHADER_MODULE_S3_INTERSECTIONS = `

bool IsVec4Similar(vec4 a, vec4 b){
    return distance(a,b) < 0.00001;
}

void Intersect(Ray ray, inout HitInformation hit, inout HitInformation hit_outside, inout HitInformation hitCube)
{			
	Ray variableRay;
	variableRay.origin = ray.origin;
	variableRay.direction = ray.direction;
	variableRay.dir_inv = ray.dir_inv;
	variableRay.rayDistance = 0.0;
    variableRay.local_cutoff = maxRayDistance;

    /*	
    if(IsVec4Similar(ray.origin, vec4(0.0, 0.0, 0.0, 1.0))){
        hit.hitType = TYPE_STREAMLINE_SEGMENT;
    }
    return;
    */


	int count = 0;
	int hitCount = 0;
    float tmp_rayDistance = 0.0;

    int part_index = 0;
    float ray_local_cutoff = 100000.0;
    Sphere4D sphere4D;
    bool copy = false;
    int multiPolyID = 0;
    int type = TYPE_STREAMLINE_SEGMENT;
    float velocity = 0.0;
    float cost = 0.0;

    sphere4D.center = vec4(0.0, 2.0, 0.0, 1.0);
    sphere4D.radius = 0.5;
    Intersect3Sphere(part_index, ray, ray_local_cutoff, sphere4D, hit, copy, multiPolyID, type, velocity, cost);

    return;
    /*
	while(true)
	{
        tmp_rayDistance = variableRay.rayDistance;
        LightIntegrationPre(variableRay);  
		IntersectInstance(variableRay, hit, hitCube);        
        bool flag_ray_stays_inside = true;        
        float t = variableRay.local_cutoff;


//#ifdef SHOW_VOLUME_RENDERING
//        bool volume_flag = hit.vol_accumulated_opacity < volume_rendering_termination_opacity
//            && variableRay.rayDistance < max_volume_distance;
//        if(volume_flag)
//        {
//            float distance_end = t;
//            IntersectVolumeInstance(variableRay, distance_end, hit, hitCube);
//        }
//#endif


		if(hit.hitType > TYPE_NONE || hitCube.hitType > TYPE_NONE)		
			break;
		
		//update distance "traveled" using value from this instance
		variableRay.rayDistance += t;

		//stop at maxRayDistance + 1.8
		//1.8 is a bit greater than sqrt(3) which is the max distance inside unit cube
		if(variableRay.rayDistance > (maxRayDistance + 1.8))
			break;

        LightIntegrationPost(variableRay, flag_ray_stays_inside);  
        if(count >= light_integration_max_step_count){
            break;
        }
        
        count++;
		if(count >= maxIterationCount)
			break;            
	}	
    */

}

/*
void IntersectInstance(Ray ray, inout HitInformation hit, inout HitInformation hitCube)
{
	hitCube.hitType = TYPE_IGNORE_CUBE;
	hitCube.distance = 0.0;		
	bool doesIntersect = false;
	float nearest_t = 0.0;

#ifdef SHOW_STREAMLINES
    {
        bool check_bounds = true;
	    IntersectInstance_Tree(PART_INDEX_DEFAULT, check_bounds, ray, ray.local_cutoff+0.001, hit, hitCube);
    }
#endif

//#ifdef SHOW_BOUNDING_BOX
//	{
//        bool check_bounds = is_main_renderer;
//        //bool check_bounds = false;
//        IntersectAxes(check_bounds, ray, ray.local_cutoff+0.001, hit, hitCube);
//	}
//#endif

//#ifdef SHOW_BOUNDING_BOX_PROJECTION
//    {
//        bool check_bounds = true;
//        IntersectProjectionFrame(check_bounds, ray, maxRayDistance, hit, hitCube);
//    }
//#endif

//#ifdef SHOW_SEEDS_INSTANCE
//    {
//		IntersectSeeds(ray, maxRayDistance, hit);
//    }
//#endif

}
*/

/*
void IntersectInstance_Tree(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{		
	bool copy = false;
	int multiPolyID = 0;
	int type = TYPE_STREAMLINE_SEGMENT;
	float velocity = 0.0;
	float cost = 0.0;

	int nodeIndex = 0;
	int iteration_counter = -1;
	while(true)
	{		
		iteration_counter++;	
		//if (iteration_counter > 1000)			
		//	break;//TODO

		GL_TreeNode glNode = GetNode(nodeIndex, part_index);
		GL_AABB glAABB = GetAABB(nodeIndex, part_index);
		float tmin;
		float tmax;
		bool hitAABB = IntersectGLAABB(glAABB, ray, ray_local_cutoff, tmin, tmax);
		//hitAABB = true;
		if(hitAABB)
		{
			nodeIndex = glNode.hitLink;
			if(hitCube.hitType != TYPE_IGNORE_CUBE)
			{
				//ray intersects cube --> check if cube hit is inside this object
				if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
				{
					HandleOutOfBound_LineSegment(part_index, ray, glNode.objectIndex, hitCube);//possible problem here					
				}
			}     

            if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
			{
#ifdef HANDLE_INSIDE
                {
                    HandleInside_LineSegment(part_index, ray, glNode.objectIndex, hit);
                }
#endif
                IntersectLineSegment(part_index, check_bounds, ray, ray_local_cutoff, glNode, hit);	          						
			}
      				
		}
		else
		{
			nodeIndex = glNode.missLink;
		}
		if(nodeIndex <= 0)//end if next node is root
			break;
	}
}

bool IntersectGLAABB(GL_AABB b, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax) {
    float t1 = (b.min[0] - r.origin[0])*r.dir_inv[0];
    float t2 = (b.max[0] - r.origin[0])*r.dir_inv[0];	
    tmin = min(t1, t2);
    tmax = max(t1, t2);
 
    for (int i = 1; i < 3; ++i) {
        t1 = (b.min[i] - r.origin[i])*r.dir_inv[i];
        t2 = (b.max[i] - r.origin[i])*r.dir_inv[i]; 
        tmin = max(tmin, min(t1, t2));
        tmax = min(tmax, max(t1, t2));
    }
	
	bool segment_outside = tmax < 0.0 || tmin > ray_local_cutoff;
    return tmax > max(tmin, 0.0) && !segment_outside;
}
*/
/*
void IntersectLineSegment(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit)
{ 
    float tube_radius = GetTubeRadius(part_index);
    
	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index);
	int multiPolyID = lineSegment.multiPolyID;
	bool copy = (lineSegment.copy==1);
	if(ignore_copy && copy)
		return;

	vec4 a = GetPosition4D(lineSegment.indexA, part_index);
	vec4 b = GetPosition4D(lineSegment.indexB, part_index);
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

	//OABB TEST
	float h = distance(a,b);
	mat4 matrix = lineSegment.matrix;
	Ray ray_os;//Object Space of Cylinder
	ray_os.origin = (matrix * vec4(ray.origin, 1)).xyz;
	ray_os.direction = (matrix * vec4(ray.origin+ray.direction, 1)).xyz - ray_os.origin;
	ray_os.dir_inv = 1.0/ray_os.direction;
	GL_AABB glAABB_os;
	glAABB_os.min = vec4(-tube_radius, -tube_radius, -tube_radius, 0);
	glAABB_os.max = vec4(tube_radius, tube_radius, h+tube_radius, 0);
	float tmin;
	float tmax;
	bool hitAABB = IntersectGLAABB(glAABB_os, ray_os, ray_local_cutoff, tmin, tmax);
	if(!hitAABB)
	{
		//return;
	}
	float v_a = GetVelocity(lineSegment.indexA, part_index);
	float v_b = GetVelocity(lineSegment.indexB, part_index);
	
	//CYLINDER AND SPHERE TEST
	bool ignore_override = false;
	IntersectCylinder(part_index, check_bounds, ray, ray_local_cutoff, glNode.objectIndex, hit, ignore_override);	
	Sphere sphere;
	sphere.radius = tube_radius;
	//SPHERE A
	if(lineSegment.isBeginning == 1 || copy)
	{
		sphere.center = a;
		IntersectSphere(part_index, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_a, cost_a);
	}
	//SPHERE B
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
	IntersectSphere(part_index, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);	
}

void IntersectCylinder(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override)
{
    float tube_radius = GetTubeRadius(part_index);

	float r = tube_radius;// / 2.0;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index);
	vec3 a = GetPosition(lineSegment.indexA, part_index);
	vec3 b = GetPosition(lineSegment.indexB, part_index);

	
	mat4 matrix = lineSegment.matrix;
	mat4 matrix_inv = lineSegment.matrix_inv;
	
	//vec3 a_os = (matrix * vec4(a, 1)).xyz;
	//vec3 b_os = (matrix * vec4(b, 1)).xyz;
		
	Ray ray_os;//Object Space of Cylinder
	ray_os.origin = (matrix * vec4(ray.origin, 1)).xyz;
	//ray_os.direction = (matrix_inv * vec4(ray.direction, 1)).xyz;
	ray_os.direction = (matrix * vec4(ray.origin+ray.direction, 1)).xyz - ray_os.origin;
	//ray_os.direction = normalize(ray_os.direction);
		
	//calculate discriminant in object space
	float x_1 = ray_os.origin.x;
	float x_2 = (ray_os.origin + ray_os.direction).x;
	float y_1 = ray_os.origin.y;
	float y_2 = (ray_os.origin + ray_os.direction).y;
	float d_x =  x_2 - x_1;
	float d_y =  y_2 - y_1;
	//float d_r = sqrt(d_x*d_x + d_y*d_y);
	//float d_r_squared = d_r * d_r;
    float d_r_squared = d_x*d_x + d_y*d_y;
	float D = x_1 * y_2 - x_2 * y_1;
	float discriminant = r*r * d_r_squared - D*D;
	if(discriminant < 0.0)
		return;

	

	float d_r_squared_inv = 1.0/d_r_squared;
	//calculate intersection points in object space	
	float root = sqrt(discriminant);
	float x_L = D * d_y;
	float x_R = sign(d_y)*d_x*root;
	//float y_L = -D * d_x;							//NOT NECESSARY
	//float y_R = abs(d_y)*root;					//NOT NECESSARY
	float p_x_1 = (x_L + x_R)/(d_r_squared);		
	float p_x_2 = (x_L - x_R)/(d_r_squared);		
	//vec2 p_x = vec2((x_L + x_R), (x_L - x_R)) * d_r_squared_inv;
	//float p_y_1 = (y_L + y_R)/(d_r_squared);		//NOT NECESSARY
	//float p_y_2 = (y_L - y_R)/(d_r_squared);		//NOT NECESSARY
	//vec2 p_1 = vec2(p_x_1, p_y_1);				//NOT NECESSARY
	//vec2 p_2 = vec2(p_x_2, p_y_2);				//NOT NECESSARY
	
	//calculate t in object space 
	//equation: ray_os.origin.x + t * ray_os.direction.x = p_x_1
	float t_1 = (p_x_1 - ray_os.origin.x) / ray_os.direction.x;
	float t_2 = (p_x_2 - ray_os.origin.x) / ray_os.direction.x;
	//float t_1 = (p_x[0] - ray_os.origin.x) / ray_os.direction.x;
	//float t_2 = (p_x[1] - ray_os.origin.x) / ray_os.direction.x;
	float t = 0.0;
	bool bothInFront = false;
	if(t_1 < 0.0)
	{		
		//t_1 is behind the camera
		if(t_2 < 0.0)//both intersection points are behind the camera						
			return;
		//t_2 is in front of camera  
		t = t_2;
	}
	else
	{
		if(t_2 < 0.0)//t_1 is in front of camera  
			t = t_1;
		else//both intersection points are in front of the camera	
		{
			t = min(t_1, t_2);
			bothInFront = true;
		}
	}
	
	//calculate intersection point p in object space
	//vec3 a_os = (matrix * vec4(a, 1)).xyz;		//NOT NECESSARY
	//vec3 b_os = (matrix * vec4(b, 1)).xyz;		//NOT NECESSARY
	//float z_min = a_os.z;
	//float z_max = b_os.z;
	vec3 p_os = ray_os.origin + t * ray_os.direction;
	float z_os = p_os.z;
	float h = distance(a,b);
	
	if(z_os > h || z_os < 0.0)
	{
		return;
	}
	
	float distance_os = distance(ray_os.origin, p_os);				
	float distance = ray.rayDistance + distance_os;
			
	bool copy = (lineSegment.copy == 1);
	

	vec3 position_ws = ray.origin + distance_os * ray.direction;	
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_ws);	
		if(outOfBounds)	
			return;	
	}	
	
	int multiPolyID = lineSegment.multiPolyID;

	float cost_a = GetCost(lineSegment.indexA, part_index);
	float cost_b = GetCost(lineSegment.indexB, part_index);
	float local_percentage = z_os / h;
	float cost = mix(cost_a, cost_b, local_percentage);
	
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}
	

	if(distance_os > ray_local_cutoff)
		return;

    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance < hit.distance);
    if(projection_index >= 0)
    {
        hit_condition = false;
        if(hit.hitType==TYPE_NONE)
            hit_condition = true;
        else if(hit.hitType==TYPE_STREAMLINE_SEGMENT)
        {
            if(multiPolyID < hit.multiPolyID)
                hit_condition = true;
            else if(multiPolyID == hit.multiPolyID)
                hit_condition = distance < hit.distance;
        }
    }
	
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if(hit_condition)
	{		
        bool interactiveStreamline = part_index == 2 || part_index == 3;
		//calculate intersection point in world space
		//vec3 p = (matrix_inv * vec4(p_os, 1)).xyz;
		//calculate tube center in world space (for normal calculation)
		vec3 tube_center = (matrix_inv * vec4(0,0, z_os, 1)).xyz;
		//vec3 tube_center = mix(a, b, local_percentage);//alternative
		float v_a = GetVelocity(lineSegment.indexA, part_index);
		float v_b = GetVelocity(lineSegment.indexB, part_index);		
		hit.hitType = TYPE_STREAMLINE_SEGMENT;
		hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;	
		hit.position = position_ws;	
		hit.positionCenter = tube_center;
		hit.normal = normalize(hit.position - tube_center);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = mix(v_a, v_b, local_percentage);
		hit.cost = cost;
		hit.ignore_override = ignore_override;
	}
}
*/
void Intersect3Sphere(int part_index, Ray ray, float ray_local_cutoff, Sphere4D sphere4D, inout HitInformation hit, bool copy, int multiPolyID, int type, float velocity, float cost)
{
	vec4 z = ray.origin - sphere4D.center;//e-c
	float a = dot(ray.direction, ray.direction);//unnecessary
	float b = 2.0 * dot(ray.direction, z);
	float c = dot(z, z) - sphere4D.radius * sphere4D.radius;

	float discriminant = b*b - 4.0 * a *c;
	if (discriminant < 0.0)
		return;
		
	float root = sqrt(discriminant);
	float t1 = (-b + root) * 0.5f;
	float t2 = (-b - root) * 0.5f;
	//float distance = min(t1, t2);
	//float distance = (-b - root) / (2.0f * a);
	float distance_os = 0.0;//T BASED ON NORMALIZED RAY DIRECTION, THIS IS NOT THE REAL DISTANCE
		
	if(t1 < 0.0)
	{
		if(t2 < 0.0)
			return;
		distance_os = t2;
	}
	else if (t2 < 0.0)
		distance_os = t1;
	else
		distance_os = min(t1, t2);


	
	float distance_surface = ray.rayDistance + distance_os;
		
	vec4 position_ws = ray.origin + distance_os * ray.direction;//intersection point in world space

	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}
	
		
	if(distance_os > ray_local_cutoff)
		return;
		
    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance_surface < hit.distance);
    if(projection_index >= 0)
    {
        hit_condition = false;
        if(hit.hitType==TYPE_NONE)
            hit_condition = true;
        else if(hit.hitType==TYPE_STREAMLINE_SEGMENT)
        {
            if(multiPolyID < hit.multiPolyID)
                hit_condition = true;
            else if(multiPolyID == hit.multiPolyID)
                hit_condition = distance_surface < hit.distance;
        }
    }
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if(hit_condition)
	{		
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hit.hitType = type;
		hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;
		hit.position = position_ws;
		hit.positionCenter = sphere4D.center;
		hit.normal = normalize(hit.position - sphere4D.center);
		//hit.normal = normalize(sphere.center - hit.position);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = velocity;
		hit.cost = cost;
		
	}
}


`;