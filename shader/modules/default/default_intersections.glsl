global.SHADER_MODULE_DEFAULT_INTERSECTIONS = `

void Intersect(Ray ray, inout HitInformation hit, inout HitInformation hit_outside, inout HitInformation hitCube)
{			
	Ray variableRay;
	variableRay.origin = RepositionIntoFundamentalDomain(ray.origin);
	variableRay.direction = ray.direction;
	variableRay.dir_inv = ray.dir_inv;
	variableRay.rayDistance = 0.0;
    variableRay.local_cutoff = maxRayDistance;

    Ray transitional_ray;
			
	int count = 0;
	int hitCount = 0;
    float tmp_rayDistance = 0.0;

	//IntersectAxesCorner(ray, hit, hitCube, 0);

    #ifdef SHOW_STREAMLINES_OUTSIDE
    {
        bool check_bounds = false;
        bool dynamic = false;
	    IntersectInstance_Tree(dynamic, PART_INDEX_OUTSIDE, check_bounds, ray, maxRayDistance, hit_outside, hitCube);
        if(render_dynamic_streamline){
            dynamic = true;
            IntersectInstance_Tree(dynamic, PART_INDEX_OUTSIDE, check_bounds, ray, maxRayDistance, hit_outside, hitCube);
        }
    }
#endif

#ifdef SHOW_SEEDS_ONCE
    {
		IntersectSeeds(ray, maxRayDistance, hit_outside);
    }
#endif

	while(true)
	{
        variableRay.iteration_count = count;
        tmp_rayDistance = variableRay.rayDistance;

#ifdef INTEGRATE_LIGHT
        LightIntegrationPre(variableRay);  
#endif      
        bool dynamic = false;
		IntersectInstance(dynamic, variableRay, hit, hitCube);
        if(render_dynamic_streamline){            
            dynamic = true;
            IntersectInstance(dynamic, variableRay, hit, hitCube);
        }
		//calculate exit (the point where ray leaves the current instance)
		//formula: target = origin + t * direction
		//float tar_x = (variableRay.direction.x > 0) ? 1 : 0;	
		//float tar_y = (variableRay.direction.y > 0) ? 1 : 0;
		//float tar_z = (variableRay.direction.z > 0) ? 1 : 0;
		vec3 tar = step(vec3(0,0,0), variableRay.direction);
		//float t_x = (tar_x - variableRay.origin.x) * variableRay.dir_inv.x;	
		//float t_y = (tar_y - variableRay.origin.y) * variableRay.dir_inv.y;	
		//float t_z = (tar_z - variableRay.origin.z) * variableRay.dir_inv.z;	
		vec3 t_v = (tar - variableRay.origin) * variableRay.dir_inv;	
		float t_exit = min(t_v.x, min(t_v.y, t_v.z));		
		vec3 exit = variableRay.origin + t_exit * variableRay.direction;
        float t = t_exit;
        
        //bool flag_ray_stays_inside = variableRay.segment_length < t_exit;
        //bool flag_ray_stays_inside = variableRay.local_cutoff < t_exit;
        bool flag_ray_stays_inside = false;
#ifdef INTEGRATE_LIGHT
        flag_ray_stays_inside = ! CheckOutOfBounds(variableRay.nextPosition);
#endif  
        
        if(flag_ray_stays_inside){
            //t = variableRay.segment_length;
            t = variableRay.local_cutoff;
        }

#ifdef USE_LINEAR_LIGHT_SKIP_OPTIMIZATION    
        //speed up ridge surface and volume rendering for linear rays
        bool doesIntersectCube;
        int numberOfIntersectionsCube;
        float nearest_tCube;
        float farthest_tCube;
        IntersectUnitCubeAllSides(variableRay, doesIntersectCube, numberOfIntersectionsCube, nearest_tCube, farthest_tCube);
        bool rayStartsOutOfBounds = CheckOutOfBounds(variableRay.origin);
        //flag_ray_stays_inside = ! CheckOutOfBounds(variableRay.nextPosition);
#endif  

#ifdef SHOW_RIDGE_SURFACE
        {
            float distance_end = t;
            #ifdef USE_LINEAR_LIGHT_SKIP_OPTIMIZATION 
                if(numberOfIntersectionsCube == 0){
                    //for rays that dont intersect we dont need to do rendering of volume or ridges
                    distance_end = 0.0;
                    BisectRidges(variableRay, distance_end, hit, hitCube);
                }
                else if(rayStartsOutOfBounds){
                    //for rays that start out of bound, but DO intersect the cube, skip forward to the intersection
                    Ray skipRay;
                    skipRay.origin = variableRay.origin + variableRay.direction * nearest_tCube;
                    skipRay.direction = variableRay.direction;
                    skipRay.dir_inv = variableRay.dir_inv;
                    skipRay.rayDistance = variableRay.rayDistance + nearest_tCube;
                    skipRay.local_cutoff = variableRay.local_cutoff - nearest_tCube;
                    BisectRidges(skipRay, distance_end - nearest_tCube, hit, hitCube);
                }
                else{
                    //this leaves rays starting inside the cube, use normal behavior
                    BisectRidges(variableRay, distance_end, hit, hitCube);
                }
            #else 
                BisectRidges(variableRay, distance_end, hit, hitCube);                 
            #endif           
        }
#endif

#ifdef SHOW_VOLUME_RENDERING
        bool volume_flag = hit.vol_accumulated_opacity < volume_rendering_termination_opacity
            && variableRay.rayDistance < max_volume_distance;
        if(volume_flag)
        {
            float distance_end = t;
            #ifdef USE_LINEAR_LIGHT_SKIP_OPTIMIZATION 
                if(numberOfIntersectionsCube == 0){
                    //for rays that dont intersect we dont need to do rendering of volume or ridges
                    distance_end = 0.0;
                    IntersectVolumeInstance(variableRay, distance_end, hit, hitCube, hit_outside);
                }
                else if(rayStartsOutOfBounds){
                    //for rays that start out of bound, but DO intersect the cube, skip forward to the intersection
                    Ray skipRay;
                    skipRay.origin = variableRay.origin + variableRay.direction * nearest_tCube;
                    skipRay.direction = variableRay.direction;
                    skipRay.dir_inv = variableRay.dir_inv;
                    skipRay.rayDistance = variableRay.rayDistance + nearest_tCube;
                    skipRay.local_cutoff = variableRay.local_cutoff - nearest_tCube;
                    IntersectVolumeInstance(skipRay, distance_end, hit, hitCube, hit_outside);//not using "distance_end - nearest_tCube" because the volume rendering uses different logic
                }
                else{
                    //this leaves rays starting inside the cube, use normal behavior
                    IntersectVolumeInstance(variableRay, distance_end, hit, hitCube, hit_outside);
                }
            #else 
                IntersectVolumeInstance(variableRay, distance_end, hit, hitCube, hit_outside);
            #endif           
        }
#endif

		if(hit.hitType > TYPE_NONE || hitCube.hitType > TYPE_NONE)		
			break;
		
		//update distance "traveled" using value from this instance
		variableRay.rayDistance += t;

		//stop at maxRayDistance + 1.8
		//1.8 is a bit greater than sqrt(3) which is the max distance inside unit cube
		if(variableRay.rayDistance > (maxRayDistance + 1.8))
			break;

        if(!flag_ray_stays_inside){            
            if(projection_index >= 0)
            {
                if(projection_index == 0){
                    if(exit.x < 0.001)
                        break;
                }
                else if (projection_index == 1){
                if(exit.y < 0.001)
                        break;
                }
                else if (projection_index == 2){
                if(exit.z < 0.001)
                        break;
                }
                //update ray origin for next instance	
                variableRay.origin = MoveOutOfBoundsProjection(exit);
            }	
            else{
                //update ray origin for next instance		
                //MoveRayOrigin(variableRay, exit);
#ifdef INTEGRATE_LIGHT
                //V1
                //variableRay.nextPosition = MoveOutOfBounds(exit);//problem, wrong direction because next position not matching next direction
                
                //V2
                /*
                float exit_distance = distance(variableRay.origin, exit);

                MoveOutOfBoundsFlags flags;
                variableRay.nextPosition = MoveOutOfBoundsAndGetFlags(variableRay.nextPosition, flags);//problem, exit might need other flags

                transitional_ray.origin = ApplyMoveOutOfBoundsFlags(exit, flags);
                transitional_ray.direction = variableRay.direction;
                transitional_ray.dir_inv = variableRay.dir_inv;
                transitional_ray.rayDistance = tmp_rayDistance + exit_distance;//TODO
                transitional_ray.local_cutoff = variableRay.local_cutoff - exit_distance;//TODO
                IntersectInstance(transitional_ray, hit, hitCube);
                */
                //V3

                //set next position of variable ray, next iteration will resume normally
                variableRay.nextPosition = MoveOutOfBounds(variableRay.nextPosition);
                variableRay.rayDistance = tmp_rayDistance + variableRay.local_cutoff;
                //however, for the transition we use a transitional ray
                //the transitional ray keeps the same direction as the variable ray
                //but will be moved (possibly multiple times if multiple borders are crossed)            
                transitional_ray.direction = variableRay.direction;
                transitional_ray.dir_inv = variableRay.dir_inv;
                //each iteration the local cutoff is reduced by the exit distance i.e. the distance from current position to the cube intersection
                float exit_distance = distance(variableRay.origin, exit);
                transitional_ray.local_cutoff = variableRay.local_cutoff;
                transitional_ray.rayDistance = tmp_rayDistance;
                while(transitional_ray.local_cutoff >= exit_distance && exit_distance > 0.0){
                    transitional_ray.local_cutoff -= exit_distance;
                    transitional_ray.rayDistance += exit_distance;
                    transitional_ray.origin = MoveOutOfBounds(exit);
                    dynamic = false;
                    IntersectInstance(dynamic, transitional_ray, hit, hitCube);
                    if(render_dynamic_streamline){
                        dynamic = true;
                        IntersectInstance(dynamic, transitional_ray, hit, hitCube);
                    }

                    //calculate exit (the point where ray leaves the current instance)
                    //formula: target = origin + t * direction
                    //float tar_x = (variableRay.direction.x > 0) ? 1 : 0;	
                    //float tar_y = (variableRay.direction.y > 0) ? 1 : 0;
                    //float tar_z = (variableRay.direction.z > 0) ? 1 : 0;
                    vec3 tar = step(vec3(0,0,0), transitional_ray.direction);
                    //float t_x = (tar_x - variableRay.origin.x) * variableRay.dir_inv.x;	
                    //float t_y = (tar_y - variableRay.origin.y) * variableRay.dir_inv.y;	
                    //float t_z = (tar_z - variableRay.origin.z) * variableRay.dir_inv.z;	
                    vec3 t_v = (tar - transitional_ray.origin) * transitional_ray.dir_inv;	
                    float t_exit = min(t_v.x, min(t_v.y, t_v.z));		
                    exit = transitional_ray.origin + t_exit * transitional_ray.direction;

                    exit_distance = distance(transitional_ray.origin, exit);
                }
                
                
#else
                variableRay.direction = normalize(MoveOutOfBoundsDirection(exit, variableRay.direction));
                variableRay.dir_inv = 1.0/variableRay.direction;
                variableRay.origin = MoveOutOfBounds(exit);
#endif   
            }
        }

#ifdef INTEGRATE_LIGHT
        LightIntegrationPost(variableRay, flag_ray_stays_inside);  
        if(count >= light_integration_max_step_count){
            break;
        }
#endif    
        
        count++;
		if(count >= maxIterationCount)
			break;
            
				
		//break;
	}	


}


void IntersectInstance(bool dynamic, Ray ray, inout HitInformation hit, inout HitInformation hitCube)
{
	hitCube.hitType = TYPE_IGNORE_CUBE;
	hitCube.distance = 0.0;		
	bool doesIntersect = false;
	float nearest_t = 0.0;
	vec3 normal_face;
  /*
	if(show_transparent_cone)
	{		
		IntersectTransparentTriangle(ray, GetTriangle(0), hit);
		IntersectTransparentTriangle(ray, GetTriangle(1), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(2), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(3), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(4), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(5), hit);		
	}

	if(show_pyramid_wireframe)
	{
		GL_Cylinder cylinder;
		for(int i=0; i<8; i++)
		{
			cylinder = blockCylinders[INDEX_CYLINDER_FIRST_PYRAMID + i];
			bool ignore_override = true;
			IntersectCylinder(false, cylinder, ray, maxRayDistance, hit, ignore_override);
		}

		Sphere sphere;
		sphere.radius = cylinder.radius;
		vec3 col = cylinder.color.xyz;
		for(int i=0; i<4; i++)
		{
			cylinder = blockCylinders[INDEX_CYLINDER_FIRST_PYRAMID + i];
			sphere.center = cylinder.position_b.xyz;
			
			IntersectSphereAxis(false, ray, maxRayDistance, sphere, hit, TYPE_GL_CYLINDER,
				sphere.center, col, sphere.center, col, sphere.center, col);	
		}
	}
  */
#ifdef CUT_AT_CUBE_FACES
	{
        //
		IntersectUnitCube(ray, doesIntersect, nearest_t, normal_face);
		if(doesIntersect)
		{
			hitCube.hitType = TYPE_NONE;
			hitCube.distance = nearest_t;
			hitCube.normal = normal_face;
			hitCube.position = ray.origin + nearest_t * ray.direction;		
		}
	}
#endif

#ifdef SHOW_STREAMLINES
    {
        bool check_bounds = true;
	    IntersectInstance_Tree(dynamic, PART_INDEX_DEFAULT, check_bounds, ray, ray.local_cutoff+0.001, hit, hitCube);
	    //IntersectInstance_Tree(PART_INDEX_DEFAULT, check_bounds, ray, maxRayDistance, hit, hitCube);
    }
#endif
  /*
	if(show_interactive_streamline)
		IntersectInstance_Tree(true, ray, maxRayDistance, hit, hitCube);

	if(renderClickedSphere > RENDER_CLICKED_SPHERE_FALSE)
		IntersectInstance_Clicked(ray, maxRayDistance, hit, hitCube);
  */
  /*
	if(multi_show_camera && camIndexOther >= 0)
	{
		bool interactiveStreamline = false;//this does not matter here because of TYPE_CLICKED_SPHERE
		Sphere sphere;
		sphere.radius = multi_camera_radius;	
		bool copy = false;
		int multiPolyID = -1;
		
		float velocity = 0;
		float cost = 0;
		sphere.center = blockCameraData[camIndexOther].E.xyz;
		IntersectSphere(interactiveStreamline, ray, maxRayDistance, sphere, hit, copy, multiPolyID, TYPE_CLICKED_SPHERE, velocity, cost);
		//sphere.center = blockCameraData[camIndexOther+1].E.xyz;
		//IntersectSphere(interactiveStreamline, ray, sphere, hit, copy, multiPolyID, TYPE_CLICKED_SPHERE, velocity, cost);
		//sphere.center = blockCameraData[camIndexOther+2].E.xyz;
		//IntersectSphere(interactiveStreamline, ray, sphere, hit, copy, multiPolyID, TYPE_CLICKED_SPHERE, velocity, cost);
	}
*/
	
#ifdef SHOW_BOUNDING_BOX
	{
        bool check_bounds = is_main_renderer;
        //bool check_bounds = false;
        IntersectAxes(check_bounds, ray, ray.local_cutoff+0.001, hit, hitCube);
	}
#endif

#ifdef SHOW_BOUNDING_BOX_PROJECTION
    {
        bool check_bounds = true;
        IntersectProjectionFrame(check_bounds, ray, maxRayDistance, hit, hitCube);
    }
#endif

#ifdef SHOW_SEEDS_INSTANCE
    {
		IntersectSeeds(ray, maxRayDistance, hit);
    }
#endif
/*
	if(show_main_camera_axes)
	{
		//index 0 and 1 are the movable axes for main / multi renderer
		//index 2 is the main camera orientation
		//indices 3 to 10 are the axes
		IntersectAxesCornerAABB(false, ray, maxRayDistance, hit, hitCube, 2);
	}	
  */
}

void IntersectInstance_Tree(bool dynamic, int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{		
	bool copy = false;
	int multiPolyID = 0;
	int type = TYPE_STREAMLINE_SEGMENT;
	float velocity = 0.0;
	float cost = 0.0;

	Sphere sphere;
	sphere.radius = 0.1;

	int nodeIndex = 0;
	int iteration_counter = -1;
	while(true)
	{		
		iteration_counter++;	
		//if (iteration_counter > 1000)			
		//	break;//TODO

		GL_TreeNode glNode = GetNode(dynamic, nodeIndex, part_index);
		GL_AABB glAABB = GetAABB(dynamic, nodeIndex, part_index);
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
					HandleOutOfBound_LineSegment(dynamic, part_index, ray, glNode.objectIndex, hitCube);//possible problem here					
				}
			}     

            if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
			{
#ifdef HANDLE_INSIDE
                {
                    HandleInside_LineSegment(dynamic, part_index, ray, glNode.objectIndex, hit);
                }
#endif
                IntersectLineSegment(dynamic, part_index, check_bounds, ray, ray_local_cutoff, glNode, hit);	          						
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

bool IntersectGLAABB(GL_Cylinder cylinder, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax) {    
	GL_AABB aabb;
	float radius = cylinder.radius;
	aabb.min = min(cylinder.position_a, cylinder.position_b) + vec4(-radius, -radius, -radius, 0);
	aabb.max = max(cylinder.position_a, cylinder.position_b) + vec4(radius, radius, radius, 0);
    return IntersectGLAABB(aabb, r, ray_local_cutoff, tmin, tmax);
}

bool IntersectGLAABB(Sphere sphere, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax) {    
	GL_AABB aabb;
	float radius = sphere.radius;
	vec4 position = vec4(sphere.center, 0);
	aabb.min = position + vec4(-radius, -radius, -radius, 0);
	aabb.max = position + vec4(radius, radius, radius, 0);
    return IntersectGLAABB(aabb, r, ray_local_cutoff, tmin, tmax);
}

void IntersectLineSegment(bool dynamic, int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit)
{ 
    float tube_radius = GetTubeRadius(part_index);
	/*
	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, interactiveStreamline);
	bool copy = false; 
	int multiPolyID = 0; 
	float v_b = 1.0; 
	float cost_b_value = 0.0;

	vec3 a = GetPosition(lineSegment.indexA, interactiveStreamline);

	Sphere sphere;
	sphere.radius = tube_radius;
	sphere.center = a;
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);

	*/


	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(dynamic, lineSegmentID, part_index);
	int multiPolyID = lineSegment.multiPolyID;
	bool copy = (lineSegment.copy==1);
	if(ignore_copy && copy)
		return;
	vec3 a = GetPosition(dynamic, lineSegment.indexA, part_index);
	vec3 b = GetPosition(dynamic, lineSegment.indexB, part_index);
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
	float v_a = GetVelocity(dynamic, lineSegment.indexA, part_index);
	float v_b = GetVelocity(dynamic, lineSegment.indexB, part_index);
	
	//CYLINDER AND SPHERE TEST
	bool ignore_override = false;
	IntersectCylinder(dynamic, part_index, check_bounds, ray, ray_local_cutoff, glNode.objectIndex, hit, ignore_override);	
	Sphere sphere;
	sphere.radius = tube_radius;
	//SPHERE A
	if(lineSegment.isBeginning == 1 || copy)
	{
		sphere.center = a;
		IntersectSphere(dynamic, part_index, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_a, cost_a);
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
	IntersectSphere(dynamic, part_index, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);	
	
	/**/
}

void IntersectCylinder(bool dynamic, int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override)
{
    float tube_radius = GetTubeRadius(part_index);

	float r = tube_radius;// / 2.0;
	GL_LineSegment lineSegment = GetLineSegment(dynamic, lineSegmentID, part_index);
	vec3 a = GetPosition(dynamic, lineSegment.indexA, part_index);
	vec3 b = GetPosition(dynamic, lineSegment.indexB, part_index);

	
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
	
	/*
	if(z_os > h || z_os < 0.0)
	{
		if(!bothInFront)
			return;
		return;
		//We also need to check the other t if we are not rendering caps		
		t = max(t_1, t_2);
		p_os = ray_os.origin + t * ray_os.direction;
		z_os = p_os.z;
		if(z_os > h || z_os < 0.0)
			return;
	}
	*/
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

	float cost_a = GetCost(dynamic, lineSegment.indexA, part_index);
	float cost_b = GetCost(dynamic, lineSegment.indexB, part_index);
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
	
    float total_distance = ray.rayDistance + distance_os;
    if(total_distance <= min_streamline_distance)
        return;

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
		float v_a = GetVelocity(dynamic, lineSegment.indexA, part_index);
		float v_b = GetVelocity(dynamic, lineSegment.indexB, part_index);		
		hit.hitType = TYPE_STREAMLINE_SEGMENT;
        hit.sub_type = SUBTYPE_CYLINDER;        
        hit.dynamic = dynamic;
        hit.iteration_count = ray.iteration_count;
		hit.distance_iteration = distance_os;	
		hit.distance = total_distance;	
		hit.position = position_ws;	
		hit.positionCenter = tube_center;
        hit.light_direction = ray.direction;
		hit.normal = normalize(hit.position - tube_center);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = mix(v_a, v_b, local_percentage);
		hit.cost = cost;
		hit.ignore_override = ignore_override;
	}
}

void IntersectSphere(bool dynamic, int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, int type, float velocity, float cost)
{
	vec3 z = ray.origin - sphere.center;//e-c
	float a = dot(ray.direction, ray.direction);//unnecessary
	float b = 2.0 * dot(ray.direction, z);
	float c = dot(z, z) - sphere.radius * sphere.radius;

	float discriminant = b*b - 4.0 * a *c;
	if (discriminant < 0.0)
		return;
		
	float root = sqrt(discriminant);
	float t1 = (-b + root) * 0.5f;
	float t2 = (-b - root) * 0.5f;
	//float distance = min(t1, t2);
	//float distance = (-b - root) / (2.0f * a);
	float distance_os = 0.0;
		


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
		
	vec3 position_ws = ray.origin + distance_os * ray.direction;//intersection point in world space

	/*
	bool doOutOfBoundsCheck = false;
	if(allowOutOfBoundSphere == 0)	
		doOutOfBoundsCheck = true;	
	else if(type != TYPE_CLICKED_SPHERE)	
		doOutOfBoundsCheck = true;	

	if(doOutOfBoundsCheck)
	{
		bool outOfBounds = CheckOutOfBounds(position_ws);	
		if(outOfBounds)	
			return;
	}
	else
	{
		bool outOfBounds = CheckOutOfBounds(sphere.center);	
		if(outOfBounds)	
			return;
	}
    */
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_ws);	
		if(outOfBounds)	
			return;	
	}	


	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}
	
    float total_distance = ray.rayDistance + distance_os;
    if(total_distance <= min_streamline_distance)
        return;
		
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
        hit.sub_type = SUBTYPE_SPHERE;
        hit.dynamic = dynamic;
        hit.iteration_count = ray.iteration_count;
		hit.distance_iteration = distance_os;	
		hit.distance = total_distance;
		hit.position = position_ws;
		hit.positionCenter = sphere.center;
        hit.light_direction = ray.direction;
		hit.normal = normalize(hit.position - sphere.center);
		//hit.normal = normalize(sphere.center - hit.position);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = velocity;
		hit.cost = cost;
		
	}
}

void IntersectUnitCube(Ray ray, inout bool doesIntersect, inout float nearest_t, inout vec3 out_normal)
{	
	GL_CameraData cam = GetActiveCamera();
	vec3 E = cam.E.xyz;
	float error = 0.0;//0.0001;
	//return;
	vec3 normal;
	float planeDistance;
	doesIntersect = false;
	nearest_t = 100000.0;
	//return;
	if (E.x > 1.0)
	{
		normal = vec3(1, 0, 0);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	if (E.x < 0.0)
	{
		normal = vec3(-1, 0, 0);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	
	if (E.y > 1.0)
	{
		normal = vec3(0, 1, 0);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	if (E.y < 0.0)
	{
		normal = vec3(0, -1, 0);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	
	if (E.z > 1.0)
	{
		normal = vec3(0, 0, 1);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	if (E.z < 0.0)
	{
		normal = vec3(0, 0, -1);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
}

void IntersectUnitCubeFace(Ray ray, vec3 planeNormal, float planeDistance, inout bool doesIntersect, inout float nearest_t, inout vec3 out_normal)
{
	float d_n = dot(ray.direction, planeNormal);
	if(d_n == 0.0)
		return;
	float t = (planeDistance - dot(ray.origin, planeNormal)) / d_n;
	if(t < 0.0)
		return;
	
	//return;
	float distance_os = t;
	float distance = ray.rayDistance + distance_os;
	vec3 position_ws = ray.origin + distance_os * ray.direction;
	
	
	for(int i=0; i<3; i++)
	{
		if(planeNormal[i] == 0.0)
		{
			if(position_ws[i] < 0.0 || position_ws[i] > 1.0)
				return;
		}
	}
	
	if((!doesIntersect) || (t < nearest_t))
	{
		nearest_t = t;
		out_normal = planeNormal;
	}
	doesIntersect = true;
}

void IntersectUnitCubeAllSides(Ray ray, inout bool doesIntersect, inout int numberOfIntersections, inout float nearest_t, inout float farthest_t)
{	
	GL_CameraData cam = GetActiveCamera();
	vec3 E = cam.E.xyz;
	float error = 0.0;//0.0001;
	//return;
	vec3 normal;
	float planeDistance;
	doesIntersect = false;
	nearest_t = 100000.0;
    farthest_t = -100000.0;
    numberOfIntersections = 0;

	//X
	{
		normal = vec3(1, 0, 0);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace2(ray, normal, planeDistance, doesIntersect, numberOfIntersections, nearest_t, farthest_t);
	}
	{
		normal = vec3(-1, 0, 0);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace2(ray, normal, planeDistance, doesIntersect, numberOfIntersections, nearest_t, farthest_t);
	}

	//Y
	{
		normal = vec3(0, 1, 0);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace2(ray, normal, planeDistance, doesIntersect, numberOfIntersections, nearest_t, farthest_t);
	}
	{
		normal = vec3(0, -1, 0);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace2(ray, normal, planeDistance, doesIntersect, numberOfIntersections, nearest_t, farthest_t);
	}
	
	//Z
	{
		normal = vec3(0, 0, 1);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace2(ray, normal, planeDistance, doesIntersect, numberOfIntersections, nearest_t, farthest_t);
	}
	{
		normal = vec3(0, 0, -1);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace2(ray, normal, planeDistance, doesIntersect, numberOfIntersections, nearest_t, farthest_t);
	}
}

void IntersectUnitCubeFace2(Ray ray, vec3 planeNormal, float planeDistance, inout bool doesIntersect, inout int numberOfIntersections, inout float nearest_t, inout float farthest_t)
{
	float d_n = dot(ray.direction, planeNormal);
	if(d_n == 0.0)
		return;
	float t = (planeDistance - dot(ray.origin, planeNormal)) / d_n;
	if(t < 0.0)
		return;
	
	//return;
	float distance_os = t;
	float distance = ray.rayDistance + distance_os;
	vec3 position_ws = ray.origin + distance_os * ray.direction;
	
	
	for(int i=0; i<3; i++)
	{
		if(planeNormal[i] == 0.0)
		{
			if(position_ws[i] < 0.0 || position_ws[i] > 1.0)
				return;
		}
	}
	
	if((!doesIntersect) || (t < nearest_t))
	{
		nearest_t = t;
	}
    if((!doesIntersect) || (t > farthest_t))
	{
		farthest_t = t;
	}
	doesIntersect = true;
    numberOfIntersections += 1;
}


void IntersectProjectionFrame(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{
    for(int i=0; i<4; i++){
        float tmin;
        float tmax;
        bool ignore_override = true;
        GL_Cylinder cylinder = GetCylinder(INDEX_CYLINDER_FIRST_PROJECTION_FRAME+i+4*projection_index);

        Sphere sphere;
        sphere.radius = cylinder.radius;

        vec3 pos_a = cylinder.position_a.xyz;
        vec3 pos_b = cylinder.position_b.xyz;
        vec3 col = cylinder.color.xyz;

        bool hitAABB = IntersectGLAABB(cylinder, ray, ray_local_cutoff, tmin, tmax);
        if(hitAABB)
        {
            IntersectCylinder(check_bounds, cylinder, ray, ray_local_cutoff, hit, ignore_override);
            
            sphere.center = pos_a;
            IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b, col, pos_b, col, pos_b, col);
        
            //sphere.center = pos_b;
            //IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b, col, pos_b, col, pos_b, col);
        }
    }
}


void IntersectSeeds(Ray ray, float maxRayDistance, inout HitInformation hit){
	bool check_bounds = false;
	float ray_local_cutoff = maxRayDistance;
	bool copy = false;
	int type = TYPE_SEED; 
	float velocity = 0.0;
	float cost = 0.0;

	float tube_radius = GetTubeRadius(PART_INDEX_OUTSIDE);

	Sphere sphere;
	sphere.radius = tube_radius * 1.5;

	for (int i=0; i<num_visual_seeds; i++){
		sphere.center = GetStreamlineSeedPosition(i);	
		int multiPolyID = i; 

		float tmin;
		float tmax;
		bool hitAABB = IntersectGLAABB(sphere, ray, maxRayDistance, tmin, tmax);
		if(hitAABB)
		{
            bool dynamic = false;
			IntersectSphere(dynamic, PART_INDEX_OUTSIDE, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
        }		
	}	
    if(render_dynamic_streamline){
		sphere.center = dynamic_seed_position.xyz;	
    	int multiPolyID = 0; 

		float tmin;
		float tmax;
		bool hitAABB = IntersectGLAABB(sphere, ray, maxRayDistance, tmin, tmax);
		if(hitAABB)
		{
            bool dynamic = true;
			IntersectSphere(dynamic, PART_INDEX_OUTSIDE, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
        }
    
    }
}

void IntersectMovableAxes(Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube){
    bool check_bounds = false;
    int corner_index = is_main_renderer ? 0 : 11;
    IntersectAxesCornerAABB(check_bounds, ray, ray_local_cutoff, hit, hitCube, corner_index);
}

void IntersectAxes(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{
	//index 0 and 1 are the movable axes for main / multi renderer
	//index 2 is the main camera orientation
	//indices 3 to 10 are the axes
	//index 11 is the fat origin axes

    //index 0 is the movable axes
    //index 1 is the other camera orientation
    //indices 2 to 9 are the axes
	//index 10 is the fat origin axes
    /*
	int additional_index = show_origin_axes ? 1 : 0;
    int offset = is_main_renderer ? 0 : 11;
	for(int i=offset+2; i<offset+10+additional_index; i++)
		IntersectAxesCornerAABB(check_bounds, ray, ray_local_cutoff, hit, hitCube, i);
*/
    
    if(show_non_origin_axes){
        int offset = is_main_renderer ? 0 : 11;
		for(int i=offset+2; i<offset+10; i++)
		    IntersectAxesCornerAABB(check_bounds, ray, ray_local_cutoff, hit, hitCube, i);
    }
    if(show_origin_axes){//only for aux view
		IntersectAxesCornerAABB(check_bounds, ray, ray_local_cutoff, hit, hitCube, 21);
    }
    

}

//improved version of IntersectAxesCorner. constructs AABB on the fly
void IntersectAxesCornerAABB(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube, int corner_index)
{ 	
	float tmin;
	float tmax;
	bool hitAABB;
	bool hitAnyAABB = false;

	bool ignore_override = true;
    GL_Cylinder cylinder_1 = GetCylinder(corner_index * 3);
    GL_Cylinder cylinder_2 = GetCylinder(corner_index * 3 + 1);
    GL_Cylinder cylinder_3 = GetCylinder(corner_index * 3 + 2);
	vec3 pos_a = cylinder_1.position_a.xyz;
	vec3 pos_b_1 = cylinder_1.position_b.xyz;
	vec3 pos_b_2 = cylinder_2.position_b.xyz;
	vec3 pos_b_3 = cylinder_3.position_b.xyz;
	vec3 col_1 = cylinder_1.color.xyz;
	vec3 col_2 = cylinder_2.color.xyz;
	vec3 col_3 = cylinder_3.color.xyz;

	Sphere sphere;
	sphere.radius = cylinder_1.radius;

	hitAABB = IntersectGLAABB(cylinder_1, ray, ray_local_cutoff, tmin, tmax);
	if(hitAABB)
	{
		IntersectCylinder(check_bounds, cylinder_1, ray, ray_local_cutoff, hit, ignore_override);
		sphere.center = pos_b_1;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
		hitAnyAABB = true;
	}

	hitAABB = IntersectGLAABB(cylinder_2, ray, ray_local_cutoff, tmin, tmax);
	if(hitAABB)
	{
		IntersectCylinder(check_bounds, cylinder_2, ray, ray_local_cutoff, hit, ignore_override);
		sphere.center = pos_b_2;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
		hitAnyAABB = true;
	}

	hitAABB = IntersectGLAABB(cylinder_3, ray, ray_local_cutoff, tmin, tmax);
	if(hitAABB)
	{
		IntersectCylinder(check_bounds, cylinder_3, ray, ray_local_cutoff, hit, ignore_override);
		sphere.center = pos_b_3;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
		hitAnyAABB = true;
	}

	if(hitAnyAABB)
	{
		sphere.center = pos_a;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
	}	
}


void IntersectCylinder(bool check_bounds, GL_Cylinder cylinder, Ray ray, float ray_local_cutoff, inout HitInformation hit, bool ignore_override)
{
	
	float r = cylinder.radius;
	vec3 a = cylinder.position_a.xyz;
	vec3 b = cylinder.position_b.xyz;
	mat4 matrix = cylinder.matrix;
	mat4 matrix_inv = cylinder.matrix_inv;
	
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
		if(!bothInFront)
			return;
		return;
		//We also need to check the other t if we are not rendering caps		
		t = max(t_1, t_2);
		p_os = ray_os.origin + t * ray_os.direction;
		z_os = p_os.z;
		if(z_os > h || z_os < 0.0)
			return;
	}
	
	float distance_os = distance(ray_os.origin, p_os);				
	float distance = ray.rayDistance + distance_os;
				
	vec3 position_ws = ray.origin + distance_os * ray.direction;
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_ws);	
		if(outOfBounds)	
			return;	
	}
	if(distance_os > ray_local_cutoff)
		return;
	
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distance < hit.distance))
	{		
		//calculate intersection point in world space
		//vec3 p = (matrix_inv * vec4(p_os, 1)).xyz;
		//calculate tube center in world space (for normal calculation)
		vec3 tube_center = (matrix_inv * vec4(0,0, z_os, 1)).xyz;	
		hit.hitType = TYPE_GL_CYLINDER;//change
        hit.sub_type = SUBTYPE_CYLINDER;        
        hit.dynamic = false;//for now, dynamic only contains streamlines, no objects
        hit.iteration_count = ray.iteration_count;
        hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;	
		hit.position = position_ws;	
		hit.positionCenter = tube_center;
        hit.light_direction = ray.direction;
		hit.normal = normalize(hit.position - tube_center);
		hit.copy = false;//copy;
		hit.multiPolyID = -1;//interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = -1.0;//mix(v_a, v_b, local_percentage);
		hit.cost = -1.0;//cost;
		hit.objectColor = cylinder.color.xyz;
		hit.ignore_override = ignore_override;
	}
	
}

void IntersectSphereAxis(bool check_bounds, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, int type, vec3 pos_1, vec3 col_1, vec3 pos_2, vec3 col_2, vec3 pos_3, vec3 col_3)
{
	vec3 z = ray.origin - sphere.center;//e-c
	float a = dot(ray.direction, ray.direction);//unnecessary
	float b = 2.0 * dot(ray.direction, z);
	float c = dot(z, z) - sphere.radius * sphere.radius;

	float discriminant = b*b - 4.0 * a *c;
	if (discriminant < 0.0)
		return;

	float root = sqrt(discriminant);
	float t1 = (-b + root) * 0.5f;
	float t2 = (-b - root) * 0.5f;
	//float distance = min(t1, t2);
	//float distance = (-b - root) / (2.0f * a);
	float distance_os = 0.0;
		
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
		
	vec3 position_ws = ray.origin + distance_os * ray.direction;//intersection point in world space
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_ws);	
		if(outOfBounds)	
			return;	
	}
	if(distance_os > ray_local_cutoff)
		return;
		
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distance_surface < hit.distance))
	{		
		hit.hitType = type;
        hit.sub_type = SUBTYPE_SPHERE;
        hit.dynamic = false;//for now, dynamic only contains streamlines, no objects
        hit.iteration_count = ray.iteration_count;
		hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;
		hit.position = position_ws;
		hit.positionCenter = sphere.center;
        hit.light_direction = ray.direction;
		hit.normal = normalize(hit.position - sphere.center);
		//hit.normal = normalize(sphere.center - hit.position);
		hit.copy = false;//copy;
		hit.multiPolyID = -1;//interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = -1.0;//velocity;
		hit.cost = -1.0;//cost;
		hit.ignore_override = true;

		float d_1 = distance(pos_1, hit.position);
		float d_2 = distance(pos_2, hit.position);
		float d_3 = distance(pos_3, hit.position);
		if(d_1 < d_2)		
			hit.objectColor = d_1 < d_3 ? col_1 : col_3;
		else
			hit.objectColor = d_2 < d_3 ? col_2 : col_3;
	}
}


`;