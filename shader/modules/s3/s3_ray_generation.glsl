global.SHADER_MODULE_S3_RAY_GENERATION = `

Ray GenerateRay(float x_offset, float y_offset)
{	
    bool left_handed = false;//DUMMY


	GL_CameraData cam = GetActiveCamera();
	vec4 E = cam.E;
	vec4 p_1m = cam.p_1m;
	vec4 q_x = cam.q_x;
	vec4 q_y = cam.q_y;

	float i = gl_FragCoord[0];//x
	//float j = float(height) - gl_FragCoord[1];//y
	float j = gl_FragCoord[1];//y
	//if(!left_handed)
		j = float(height) - gl_FragCoord[1];//y
	vec4 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec4 r_ij = normalize(p_ij);
	
	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
    ray.local_cutoff = maxRayDistance;
    ray.iteration_count = 0;
	return ray;
}

//result is not 3D, uses central camera for both eyes
Ray GenerateRayWithPixelOffset(float x_offset, float y_offset)
{	
    bool left_handed = false;//DUMMY

	GL_CameraData cam = GetActiveCamera();
	vec4 E = cam.E;
	vec4 p_1m = cam.p_1m;
	vec4 q_x = cam.q_x;
	vec4 q_y = cam.q_y;

    float width_f = float(width);
    float height_f = float(height);

	float i = gl_FragCoord[0] - (x_axesPixelOffset * width_f * 0.5);//x
	//i = gl_FragCoord[0];//x
	//float j = height - gl_FragCoord[1];//y
	float j = gl_FragCoord[1] - (y_axesPixelOffset * height_f * 0.5);//y
	//j = gl_FragCoord[1];//y
	//if(!left_handed)
		j = height_f - gl_FragCoord[1] + (y_axesPixelOffset * height_f * 0.5);//y
	vec4 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec4 r_ij = normalize(p_ij);
	
	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
    ray.local_cutoff = maxRayDistance;
    ray.iteration_count = 0;
	return ray;
}

// x_offset intra pixel offset
// y_offset intra pixel offset
// area_x_start the offset in pixels where this area starts
// area_y_start the offset in pixels where this area starts
// area_width the width of this area
// area_height the height of this area
Ray GenerateRay(float x_offset, float y_offset, int area_index)
{	
    bool left_handed = false;//DUMMY


	GL_CameraData cam = GetActiveCamera();
    if(area_index >= 0){
        cam = GetCameraForArea(area_index);
    }
    //float area_x_start = float(width) * 0.2;
    //float area_y_start = 0.0;
    //float area_width = float(width)-area_x_start;
    //float area_height = float(height);

	vec4 E = cam.E;
	vec4 p_1m = cam.p_1m;
	vec4 q_x = cam.q_x;
	vec4 q_y = cam.q_y;

    float area_height = float(height) * cam.area_height_percentage;
    float area_height_min = float(height) * cam.area_start_y_percentage;
    float area_height_max = area_height_min + area_height;
    
    float area_width = float(width) * cam.area_width_percentage;
    float area_width_min = float(width) * cam.area_start_x_percentage;

	float i = gl_FragCoord[0] - (cam.area_start_x_percentage * float(width));//x
    float j = float(height) - gl_FragCoord[1];
    //float t_i = (gl_FragCoord[0] - area_width_min) / area_width;
    float t_j = (j - area_height_min) / area_height;
    j = float(height) - (gl_FragCoord[1]- (cam.area_start_y_percentage * float(height)));//y
    j = t_j * area_height;//y
	vec4 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec4 r_ij = normalize(p_ij);

	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
    ray.local_cutoff = maxRayDistance;
    ray.iteration_count = 0;
	return ray;
}
/*
area_start_x_percentage
area_start_y_percentage
area_height_percentage
area_width_percentage
*/
`;