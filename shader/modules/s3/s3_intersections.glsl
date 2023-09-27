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
    variableRay.ray_projection_index = ray.ray_projection_index;

    //initialize ExplicitIntegrationData, which is NOT USED for s3 currently, but needed to call functions
    ExplicitIntegrationData explicitIntegrationData;
    explicitIntegrationData.t = 0.0;
    explicitIntegrationData.original_position = ray.origin;
	explicitIntegrationData.original_direction = ray.direction;

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

    //sphere4D.center = vec4(0.0, 2.0, 0.0, 1.0);
    //sphere4D.radius = 0.5;
    //Intersect3Sphere(part_index, ray, ray_local_cutoff, sphere4D, hit, copy, multiPolyID, type, velocity, cost);
    //IntersectInstance(variableRay, hit);  
    //return;
    
	while(true)
	{
        variableRay.iteration_count = count;
        tmp_rayDistance = variableRay.rayDistance;
#ifdef INTEGRATE_LIGHT
        LightIntegrationPre(variableRay, hit, explicitIntegrationData);  
#endif  
        bool dynamic = false;
		IntersectInstance(dynamic, variableRay, hit);             
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

		
        if(hit.hitType > TYPE_NONE || hitCube.hitType > TYPE_NONE){
            if(variableRay.rayDistance >= hit.distance + 0.0)
                break;
        }

		//update distance "traveled" using value from this instance
		variableRay.rayDistance += t;

		//stop at maxRayDistance
		if(variableRay.rayDistance > maxRayDistance)
			break;

#ifdef INTEGRATE_LIGHT
        LightIntegrationPost(variableRay, flag_ray_stays_inside);  
        if(count >= light_integration_max_step_count){
            break;
        }
#endif  
        
        count++;
		if(count >= maxIterationCount)
			break;            
	}	
    

}


void IntersectInstance(bool dynamic, Ray ray, inout HitInformation hit)
{

#ifdef SHOW_STREAMLINES
    {
        //bool check_bounds = true;
        bool dynamic = false;
	    IntersectInstance_Tree(dynamic, PART_INDEX_DEFAULT, ray, ray.local_cutoff+0.001, hit);
    }
#endif
#ifdef SHOW_STREAMLINES_OUTSIDE
    {
        bool dynamic = false;
	    IntersectInstance_Tree(dynamic, PART_INDEX_OUTSIDE, ray, ray.local_cutoff+0.001, hit);
    }
#endif

    IntersectSideProjectionAxes(ray, ray.local_cutoff, hit);

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



void IntersectInstance_Tree(bool dynamic, int part_index, Ray ray, float ray_local_cutoff, inout HitInformation hit)
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

		GL_TreeNode glNode = GetNode(dynamic, nodeIndex, part_index);
		GL_AABB glAABB = GetAABB(dynamic, nodeIndex, part_index, ray.ray_projection_index);
		float tmin;
		float tmax;
		bool hitAABB = IntersectGLAABB(glAABB, ray, ray_local_cutoff, tmin, tmax);
		//hitAABB = true;

        
		if(hitAABB)
		{
            //hit.hitType = TYPE_STREAMLINE_SEGMENT;
            //hit.normal = vec4(0, 1, 0, 0);
            //hit.distance = 200000.0;
            
			nodeIndex = glNode.hitLink;

            if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
			{
/*
#ifdef HANDLE_INSIDE
                {
                    HandleInside_LineSegment(part_index, ray, glNode.objectIndex, hit);
                }
#endif
*/
                IntersectLineSegment(dynamic, part_index, ray, ray_local_cutoff, glNode, hit);	
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


void IntersectLineSegment(bool dynamic, int part_index, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit)
{ 
    float tube_radius = GetTubeRadius(part_index);
    
	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(dynamic, lineSegmentID, part_index, ray.ray_projection_index);
	int multiPolyID = lineSegment.multiPolyID;
	bool copy = (lineSegment.copy==1);
	if(ignore_copy && copy)
		return;

	vec4 a = GetPosition4D(dynamic, lineSegment.indexA, part_index, ray.ray_projection_index);
	vec4 b = GetPosition4D(dynamic, lineSegment.indexB, part_index, ray.ray_projection_index);
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


    /*
	//OABB TEST
	float h = distance(a,b);
	mat4 matrix = lineSegment.matrix;
	Ray ray_os;//Object Space of Cylinder
	ray_os.origin = ray.origin-a;//(matrix * vec4(ray.origin, 1)).xyz;
	ray_os.direction = (matrix * (ray_os.origin+ray.direction)) - ray_os.origin;
	ray_os.dir_inv = 1.0/ray_os.direction;
	GL_AABB glAABB_os;
	glAABB_os.min = vec4(-tube_radius, -tube_radius, -tube_radius, 0);
	glAABB_os.max = vec4(tube_radius, tube_radius, h+tube_radius, 0);
	float tmin;
	float tmax;
	bool hitAABB = IntersectGLAABB(glAABB_os, ray_os, ray_local_cutoff, tmin, tmax);
    if(hitAABB)
	{
		//hit.hitType = TYPE_STREAMLINE_SEGMENT;
        //hit.normal = vec4(1, 1, 0, 0);
        //hit.distance = 100000.0;
	}
	if(!hitAABB)
	{
		//return;
	}
    */
	float v_a = GetVelocity(dynamic, lineSegment.indexA, part_index);
	float v_b = GetVelocity(dynamic, lineSegment.indexB, part_index);

	
	//SPHERINDER AND SPHERE TEST
	bool ignore_override = false;
    if(debug_render_spherinder){//debug_render_spherinder should be set to true
        IntersectSpherinder(dynamic, part_index, ray, ray_local_cutoff, lineSegmentID, hit, ignore_override);
    }

    if(debug_render_3Sphere){//debug_render_3Sphere should be set to true
        Sphere4D sphere4D;
        sphere4D.radius = tube_radius;
        //SPHERE A
        if(lineSegment.isBeginning == 1 || copy)
        {
            sphere4D.center = a;
            Intersect3Sphere(dynamic, part_index, ray, ray_local_cutoff, sphere4D, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_a, cost_a);
        }
        
        //SPHERE B
        sphere4D.center = b;
        float cost_b_value = cost_b;    
        if(growth == 1)
        {
            if(growth_id == -1 || growth_id == multiPolyID)
            {
                if(cost_b > cost_cutoff)
                {
                    float t = ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);
                    sphere4D.center = mix(a, b, t);//ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);		
                    cost_b_value = cost_cutoff;
                    //sphere.radius = tube_radius * 1.1;		
                }
            }
        }    
        Intersect3Sphere(dynamic, part_index, ray, ray_local_cutoff, sphere4D, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);	
    }

}

void Intersect3Sphere(bool dynamic, int part_index, Ray ray, float ray_local_cutoff, Sphere4D sphere4D, inout HitInformation hit, bool copy, int multiPolyID, int type, float velocity, float cost)
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


            
	//float distance_surface = ray.rayDistance + distance_os;
		
	vec4 position_ws = ray.origin + distance_os * ray.direction;//intersection point in world space

	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}

	float distance_this_iteration = distance_os;//distance(ray.origin, position_ws);
		
	if(distance_this_iteration > ray_local_cutoff)
		return;
		
    
    float distance_total = ray.rayDistance + distance_this_iteration;
    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance_total < hit.distance);
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
                hit_condition = distance_total < hit.distance;
        }
    }
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if(hit_condition)
	{		
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hit.hitType = type;
        hit.iteration_count = ray.iteration_count;
		hit.distance_iteration = distance_this_iteration;	
		hit.distance = distance_total;
		hit.position = position_ws;
		hit.positionCenter = sphere4D.center;
        hit.light_direction = ray.direction;
		hit.normal = normalize(hit.position - sphere4D.center);
		//hit.normal = normalize(sphere.center - hit.position);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = velocity;
		hit.cost = cost;
        //hit.debug_value = 2;
        hit.sub_type = SUBTYPE_3SPHERE;
        hit.dynamic = dynamic;
		
	}
}

void IntersectSpherinder(bool dynamic, int part_index, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override)
{
    float tube_radius = GetTubeRadius(part_index);

    //rename
    vec4 ray_origin_4D = ray.origin;
    vec4 ray_direction_4D = ray.direction;
    
	GL_LineSegment lineSegment = GetLineSegment(dynamic, lineSegmentID, part_index, ray.ray_projection_index);
	int multiPolyID = lineSegment.multiPolyID;
	bool copy = (lineSegment.copy==1);

    vec4 spherinder_point_A = GetPosition4D(dynamic, lineSegment.indexA, part_index, ray.ray_projection_index);
    vec4 spherinder_point_B = GetPosition4D(dynamic, lineSegment.indexB, part_index, ray.ray_projection_index);
    

    //get second point on line
    vec4 ray_destination_4D = ray_origin_4D + ray_direction_4D;//glMatrix.vec4.add(ray_destination_4D, ray_origin_4D, ray_direction_4D);

    //translate to origin
    vec4 spherinder_point_B_translated = spherinder_point_B - spherinder_point_A; //glMatrix.vec4.subtract(spherinder_point_B_translated, spherinder_point_B, spherinder_point_A);
    vec4 ray_origin_4D_translated = ray_origin_4D - spherinder_point_A; //glMatrix.vec4.subtract(ray_origin_4D_translated, ray_origin_4D, spherinder_point_A);
    vec4 ray_destination_4D_translated = ray_destination_4D - spherinder_point_A; //glMatrix.vec4.subtract(ray_destination_4D_translated, ray_destination_4D, spherinder_point_A);

    //get rotation matrix
    mat4 M = lineSegment.matrix; //var M = math4D.getAligned4DRotationMatrix(spherinder_point_B_translated);

    //rotate points
    vec4 ray_origin_4D_rotated = M * ray_origin_4D_translated; //glMatrix.vec4.transformMat4(ray_origin_4D_rotated, ray_origin_4D_translated, M);
    vec4 ray_destination_4D_rotated = M * ray_destination_4D_translated; //glMatrix.vec4.transformMat4(ray_destination_4D_rotated, ray_destination_4D_translated, M);

    //get 3D points
    vec3 ray_origin_3D = ray_origin_4D_rotated.xyz; //var ray_origin_3D = glMatrix.vec3.fromValues(ray_origin_4D_rotated[0], ray_origin_4D_rotated[1], ray_origin_4D_rotated[2]);
    vec3 ray_destination_3D = ray_destination_4D_rotated.xyz; //var ray_destination_3D = glMatrix.vec3.fromValues(ray_destination_4D_rotated[0], ray_destination_4D_rotated[1], ray_destination_4D_rotated[2]);

    //get 3D direction vector
    vec3 ray_direction_3D = ray_destination_3D - ray_origin_3D; //glMatrix.vec3.subtract(ray_direction_3D, ray_destination_3D, ray_origin_3D);
    vec3 sphere_center_3D = vec3(0,0,0); //var sphere_center_3D = glMatrix.vec3.fromValues(0, 0, 0);

    //intersect sphere in 3D
    IntersectionResult result;
    result.intersect = false;
    IntersectSphere(ray_origin_3D, ray_destination_3D, sphere_center_3D, tube_radius, result);

    //if no sphere intersection --> no intersection
    if(!result.intersect){
        return;
    }

    //------------- 4D OBJECT SPACE -----------------

    //get 4D rotated direction vector
    vec4 ray_direction_4D_rotated = ray_destination_4D_rotated - ray_origin_4D_rotated; //glMatrix.vec4.subtract(ray_direction_4D_rotated, ray_destination_4D_rotated, ray_origin_4D_rotated);
    //sphere intersection found, get w
    vec4 intersection_4D_os = ray_origin_4D_rotated + (ray_direction_4D_rotated * result.t); //glMatrix.vec4.scaleAndAdd(intersection_4D_os, ray_origin_4D_rotated, ray_direction_4D_rotated, result.t);
    float h = distance(spherinder_point_A, spherinder_point_B); //var h = glMatrix.vec4.distance(spherinder_point_A, spherinder_point_B);//spherinder_point_B_rotated[3];   
    float w_os = intersection_4D_os[3]; //var w_os = intersection_4D_os[3];
    if(w_os > h || w_os < 0.0)
	{
        //result.intersect = false;
        //result.flag_outside_interval = true;
		return;
	}

    //------------- COST CHECK -----------------

    float cost_a = GetCost(dynamic, lineSegment.indexA, part_index);
	float cost_b = GetCost(dynamic, lineSegment.indexB, part_index);
	float local_percentage = w_os / h;
	float cost = mix(cost_a, cost_b, local_percentage);

    if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}

    //------------- 4D WORLD SPACE -----------------

    //intersection in world space
    vec4 intersection_4D_ws = ray_origin_4D + (ray_direction_4D * result.t); //glMatrix.vec4.scaleAndAdd(intersection_4D_ws, ray_origin_4D, ray_direction_4D, result.t);
    //result.intersection_4D = intersection_4D_ws;

    //get intersection center (nearest point on spherinder center line)
    float t_spherinder = w_os / h; //var t_spherinder = w_os / h;
    vec4 spherinder_direction = spherinder_point_B - spherinder_point_A; //glMatrix.vec4.subtract(spherinder_direction, spherinder_point_B, spherinder_point_A);
    vec4 intersection_center_4D_ws = spherinder_point_A + (spherinder_direction * t_spherinder); //glMatrix.vec4.scaleAndAdd(intersection_center_4D_ws, spherinder_point_A, spherinder_direction, t_spherinder);
    //result.intersection_center_4D = intersection_center_4D_ws;
    
    float distance_this_iteration = distance(ray_origin_4D, intersection_4D_ws);
    float distance_total = ray.rayDistance + distance_this_iteration;
    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance_total < hit.distance);
    if(hit_condition)
	{		
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hit.hitType = TYPE_STREAMLINE_SEGMENT;
        hit.iteration_count = ray.iteration_count;
		hit.distance_iteration = distance_this_iteration;	
		hit.distance = distance_total;
		hit.position = intersection_4D_ws;
		hit.positionCenter = intersection_center_4D_ws;
        hit.light_direction = ray.direction;
		hit.normal = normalize(intersection_4D_ws - intersection_center_4D_ws);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = -1.0;
		hit.cost = cost;
        //hit.debug_value = 1;
        hit.sub_type = SUBTYPE_SPHERINDER;
        hit.dynamic = dynamic;
		
	}
}


void IntersectSphere(vec3 ray_origin_3D, vec3 ray_destination_3D, vec3 sphere_center_3D, float sphere_radius, inout IntersectionResult result)
{
    result.intersect = false;
    //get 3D direction vector
    vec3 ray_direction_3D = ray_destination_3D - ray_origin_3D;//glMatrix.vec3.subtract(ray_direction_3D, ray_destination_3D, ray_origin_3D);
    vec3 ray_direction_3D_normalized = normalize(ray_direction_3D); //glMatrix.vec3.normalize(ray_direction_3D_normalized, ray_direction_3D);
    
	vec3 z = ray_origin_3D - sphere_center_3D; //glMatrix.vec3.subtract(z, ray_origin_3D, sphere_center_3D);//vec3 z = ray.origin - sphere.center;//e-c
	float a = dot(ray_direction_3D_normalized, ray_direction_3D_normalized); //var a = glMatrix.vec3.dot(ray_direction_3D_normalized, ray_direction_3D_normalized);//float a = dot(ray.direction, ray.direction);
	float b = 2.0 * dot(ray_direction_3D_normalized, z); //var b = 2.0 * glMatrix.vec3.dot(ray_direction_3D_normalized, z);//float b = 2.0 * dot(ray.direction, z);
	float c = dot(z, z) - sphere_radius*sphere_radius; //var c = glMatrix.vec3.dot(z, z) - sphere_radius*sphere_radius;//float c = dot(z, z) - sphere.radius * sphere.radius;

	float discriminant = b*b - 4.0 * a *c;//var discriminant = b*b - 4.0 * a *c;//float discriminant = b*b - 4.0 * a *c;
	if (discriminant < 0.0)
		return;
		
    float root = sqrt(discriminant); //var root = Math.sqrt(discriminant);//float root = sqrt(discriminant);
	float t1 = (-b + root) * 0.5; //var t1 = (-b + root) * 0.5;//float t1 = (-b + root) * 0.5f;
	float t2 = (-b - root) * 0.5; //var t2 = (-b - root) * 0.5;//float t2 = (-b - root) * 0.5f;
	float t_os = 0.0; //var t_os = 0.0;//T BASED ON NORMALIZED RAY DIRECTION, THIS IS NOT THE REAL DISTANCE
		
	if(t1 < 0.0)
	{
		if(t2 < 0.0)
			return;
        t_os = t2;
	}
	else if (t2 < 0.0)
        t_os = t1;
	else
        t_os = min(t1, t2);
	
	//float distance_surface = ray.rayDistance + t_os;
    //we normalize our 4D ray directions, meaning the 3D ray direction is not necessarily normalized
    //we calculate the sphere intersection using a normalized 3D ray direction
    //to get the real distance, the resulting t_os is scaled by the length of the 3D
    float scaled_t = t_os / length(ray_direction_3D); //var scaled_t = t_os / glMatrix.vec3.length(ray_direction_3D);
		
    //calculate intersection point
    vec3 intersection_3D = ray_origin_3D + (ray_direction_3D_normalized * t_os); //glMatrix.vec3.scaleAndAdd(intersection_3D, ray_origin_3D, ray_direction_3D_normalized, t_os);//vec3 intersection_3D = ray.origin + t_os * ray.direction;//intersection point in world space
				
    result.intersect = true;
    result.intersection_3D = intersection_3D;
    result.t = scaled_t;
}


// AXES

void IntersectSideProjectionAxes(Ray ray, float ray_local_cutoff, inout HitInformation hit){
    int ray_projection_index = ray.ray_projection_index;
    //ray_projection_index = 0;//uncomment this for debugging axes
    if(ray_projection_index >= 0){
        vec3 colors[3] = vec3[3](vec3(1, 0, 0),vec3(0, 1, 0),vec3(0, 0, 1));
        vec4 positions[3] = vec4[3](vec4(0, 0, 0, 0),vec4(0, 0, 0, 0),vec4(0, 0, 0, 0));
        vec4 position_a;
        float radius;
        for(int i=0; i<3; i++){
            GL_Cylinder cylinder = GetCylinder(INDEX_CYLINDER_FIRST_SIDE_PROJECTION + i + (ray_projection_index * 3));
            IntersectSpherinderGL_Cylinder(cylinder, ray, ray_local_cutoff, hit);
            
            Sphere4D sphere4D;
            sphere4D.center = cylinder.position_b;
            sphere4D.radius = cylinder.radius;
            Intersect3SphereAxis(ray, ray_local_cutoff, sphere4D, hit, cylinder.color.xyz);        

            position_a = cylinder.position_a;//same for all 3 cylinders
            radius = cylinder.radius;//same for all 3 cylinders

            colors[i] = cylinder.color.xyz;
            positions[i] = cylinder.position_b;
        }

        Sphere4D sphere4D;
        sphere4D.center = position_a;
        sphere4D.radius = radius;
        Intersect3SphereAxes(ray, ray_local_cutoff, sphere4D, hit, positions[0], colors[0], positions[1], colors[1], positions[2], colors[2]);
    }
    /*
    Sphere4D sphere4D;
    sphere4D.center = vec4(-2.0, 0.0, -0.05, 0.0);
    sphere4D.radius = 0.05;
    Intersect3Sphere(0, ray, ray_local_cutoff, sphere4D, hit, false, 0, TYPE_GL_CYLINDER, 0.0, 0.0);	
    */
    
}

void IntersectSpherinderGL_Cylinder(GL_Cylinder cylinder, Ray ray, float ray_local_cutoff, inout HitInformation hit)
{ 
    float tube_radius = cylinder.radius;//GetTubeRadius(part_index);

    //rename
    vec4 ray_origin_4D = ray.origin;
    vec4 ray_direction_4D = ray.direction;
    
	//GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index, ray.ray_projection_index);
	//int multiPolyID = lineSegment.multiPolyID;
	//bool copy = (lineSegment.copy==1);

    vec4 spherinder_point_A = cylinder.position_a;// GetPosition4D(lineSegment.indexA, part_index, ray.ray_projection_index);
    vec4 spherinder_point_B = cylinder.position_b;// GetPosition4D(lineSegment.indexB, part_index, ray.ray_projection_index);
    

    //get second point on line
    vec4 ray_destination_4D = ray_origin_4D + ray_direction_4D;//glMatrix.vec4.add(ray_destination_4D, ray_origin_4D, ray_direction_4D);

    //translate to origin
    vec4 spherinder_point_B_translated = spherinder_point_B - spherinder_point_A; //glMatrix.vec4.subtract(spherinder_point_B_translated, spherinder_point_B, spherinder_point_A);
    vec4 ray_origin_4D_translated = ray_origin_4D - spherinder_point_A; //glMatrix.vec4.subtract(ray_origin_4D_translated, ray_origin_4D, spherinder_point_A);
    vec4 ray_destination_4D_translated = ray_destination_4D - spherinder_point_A; //glMatrix.vec4.subtract(ray_destination_4D_translated, ray_destination_4D, spherinder_point_A);

    //get rotation matrix
    mat4 M = cylinder.matrix;//lineSegment.matrix; //var M = math4D.getAligned4DRotationMatrix(spherinder_point_B_translated);

    //rotate points
    vec4 ray_origin_4D_rotated = M * ray_origin_4D_translated; //glMatrix.vec4.transformMat4(ray_origin_4D_rotated, ray_origin_4D_translated, M);
    vec4 ray_destination_4D_rotated = M * ray_destination_4D_translated; //glMatrix.vec4.transformMat4(ray_destination_4D_rotated, ray_destination_4D_translated, M);

    //get 3D points
    vec3 ray_origin_3D = ray_origin_4D_rotated.xyz; //var ray_origin_3D = glMatrix.vec3.fromValues(ray_origin_4D_rotated[0], ray_origin_4D_rotated[1], ray_origin_4D_rotated[2]);
    vec3 ray_destination_3D = ray_destination_4D_rotated.xyz; //var ray_destination_3D = glMatrix.vec3.fromValues(ray_destination_4D_rotated[0], ray_destination_4D_rotated[1], ray_destination_4D_rotated[2]);

    //get 3D direction vector
    vec3 ray_direction_3D = ray_destination_3D - ray_origin_3D; //glMatrix.vec3.subtract(ray_direction_3D, ray_destination_3D, ray_origin_3D);
    vec3 sphere_center_3D = vec3(0,0,0); //var sphere_center_3D = glMatrix.vec3.fromValues(0, 0, 0);

    //intersect sphere in 3D
    IntersectionResult result;
    result.intersect = false;
    IntersectSphere(ray_origin_3D, ray_destination_3D, sphere_center_3D, tube_radius, result);

    //if no sphere intersection --> no intersection
    if(!result.intersect){
        return;
    }

    //------------- 4D OBJECT SPACE -----------------

    //get 4D rotated direction vector
    vec4 ray_direction_4D_rotated = ray_destination_4D_rotated - ray_origin_4D_rotated; //glMatrix.vec4.subtract(ray_direction_4D_rotated, ray_destination_4D_rotated, ray_origin_4D_rotated);
    //sphere intersection found, get w
    vec4 intersection_4D_os = ray_origin_4D_rotated + (ray_direction_4D_rotated * result.t); //glMatrix.vec4.scaleAndAdd(intersection_4D_os, ray_origin_4D_rotated, ray_direction_4D_rotated, result.t);
    float h = distance(spherinder_point_A, spherinder_point_B); //var h = glMatrix.vec4.distance(spherinder_point_A, spherinder_point_B);//spherinder_point_B_rotated[3];   
    float w_os = intersection_4D_os[3]; //var w_os = intersection_4D_os[3];
    if(w_os > h || w_os < 0.0)
	{
        //result.intersect = false;
        //result.flag_outside_interval = true;
		return;
	}

    //------------- COST CHECK -----------------
    /*
    float cost_a = GetCost(lineSegment.indexA, part_index);
	float cost_b = GetCost(lineSegment.indexB, part_index);
	float local_percentage = w_os / h;
	float cost = mix(cost_a, cost_b, local_percentage);

    if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}
    */
    //------------- 4D WORLD SPACE -----------------

    //intersection in world space
    vec4 intersection_4D_ws = ray_origin_4D + (ray_direction_4D * result.t); //glMatrix.vec4.scaleAndAdd(intersection_4D_ws, ray_origin_4D, ray_direction_4D, result.t);
    //result.intersection_4D = intersection_4D_ws;

    //get intersection center (nearest point on spherinder center line)
    float t_spherinder = w_os / h; //var t_spherinder = w_os / h;
    vec4 spherinder_direction = spherinder_point_B - spherinder_point_A; //glMatrix.vec4.subtract(spherinder_direction, spherinder_point_B, spherinder_point_A);
    vec4 intersection_center_4D_ws = spherinder_point_A + (spherinder_direction * t_spherinder); //glMatrix.vec4.scaleAndAdd(intersection_center_4D_ws, spherinder_point_A, spherinder_direction, t_spherinder);
    //result.intersection_center_4D = intersection_center_4D_ws;
    
    float distance_this_iteration = distance(ray_origin_4D, intersection_4D_ws);
    float distance_total = ray.rayDistance + distance_this_iteration;
    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance_total < hit.distance);
    if(hit_condition)
	{		
		hit.hitType = TYPE_GL_CYLINDER;
        hit.iteration_count = ray.iteration_count;
		hit.distance_iteration = distance_this_iteration;	
		hit.distance = distance_total;
		hit.position = intersection_4D_ws;
		hit.positionCenter = intersection_center_4D_ws;
        hit.light_direction = ray.direction;
		hit.normal = normalize(intersection_4D_ws - intersection_center_4D_ws);
		hit.copy = false;
		hit.multiPolyID = -1;
		hit.velocity = -1.0;
		hit.cost = -1.0;
        //hit.debug_value = 1;
        hit.sub_type = SUBTYPE_SPHERINDER;
        hit.dynamic = false;//for now, dynamic only contains streamlines, no objects
		hit.objectColor = cylinder.color.xyz;
		
	}   
}

void Intersect3SphereAxis(Ray ray, float ray_local_cutoff, Sphere4D sphere4D, inout HitInformation hit, vec3 color)
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


            
    //float distance_surface = ray.rayDistance + distance_os;
        
    vec4 position_ws = ray.origin + distance_os * ray.direction;//intersection point in world space
    float distance_this_iteration = distance_os;//distance(ray.origin, position_ws);
        
    if(distance_this_iteration > ray_local_cutoff)
        return;
        
    
    float distance_total = ray.rayDistance + distance_this_iteration;
    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance_total < hit.distance);

    //if (not hit) this is the first hit
    //otherwise hit is true and we only need to check the distance
    if(hit_condition)
    {		
        hit.hitType = TYPE_GL_CYLINDER;
        hit.iteration_count = ray.iteration_count;
        hit.distance_iteration = distance_this_iteration;	
        hit.distance = distance_total;
        hit.position = position_ws;
        hit.positionCenter = sphere4D.center;
        hit.light_direction = ray.direction;
        hit.normal = normalize(hit.position - sphere4D.center);
        hit.copy = false;
        hit.multiPolyID = -1;
        hit.velocity = -1.0;
        hit.cost = -1.0;
        hit.sub_type = SUBTYPE_3SPHERE;		
        hit.dynamic = false;//for now, dynamic only contains streamlines, no objects
        hit.objectColor = color;
    }
}

void Intersect3SphereAxes(Ray ray, float ray_local_cutoff, Sphere4D sphere4D, inout HitInformation hit, vec4 pos_1, vec3 col_1, vec4 pos_2, vec3 col_2, vec4 pos_3, vec3 col_3)
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


            
    //float distance_surface = ray.rayDistance + distance_os;
        
    vec4 position_ws = ray.origin + distance_os * ray.direction;//intersection point in world space
    float distance_this_iteration = distance_os;//distance(ray.origin, position_ws);
        
    if(distance_this_iteration > ray_local_cutoff)
        return;
        
    
    float distance_total = ray.rayDistance + distance_this_iteration;
    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance_total < hit.distance);

    //if (not hit) this is the first hit
    //otherwise hit is true and we only need to check the distance
    if(hit_condition)
    {	
        hit.hitType = TYPE_GL_CYLINDER;
        hit.iteration_count = ray.iteration_count;
        hit.distance_iteration = distance_this_iteration;	
        hit.distance = distance_total;
        hit.position = position_ws;
        hit.positionCenter = sphere4D.center;
        hit.light_direction = ray.direction;
        hit.normal = normalize(hit.position - sphere4D.center);
        hit.copy = false;
        hit.multiPolyID = -1;
        hit.velocity = -1.0;
        hit.cost = -1.0;
        hit.sub_type = SUBTYPE_3SPHERE;	
        hit.dynamic = false;//for now, dynamic only contains streamlines, no objects	

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