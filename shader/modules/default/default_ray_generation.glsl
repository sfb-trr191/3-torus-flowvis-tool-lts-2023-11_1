global.SHADER_MODULE_DEFAULT_RAY_GENERATION = `

Ray GenerateRay(float x_offset, float y_offset)
{	
    bool left_handed = false;//DUMMY


	GL_CameraData cam = GetActiveCamera();
	vec3 E = cam.E.xyz;
	vec3 p_1m = cam.p_1m.xyz;
	vec3 q_x = cam.q_x.xyz;
	vec3 q_y = cam.q_y.xyz;

	float i = gl_FragCoord[0];//x
	//float j = float(height) - gl_FragCoord[1];//y
	float j = gl_FragCoord[1];//y
	//if(!left_handed)
		j = float(height) - gl_FragCoord[1];//y
	vec3 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec3 r_ij = normalize(p_ij);
	
	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
    ray.local_cutoff = maxRayDistance;
	return ray;
}

//result is not 3D, uses central camera for both eyes
Ray GenerateRayWithPixelOffset(float x_offset, float y_offset)
{	
    bool left_handed = false;//DUMMY

	GL_CameraData cam = GetActiveCamera();
	vec3 E = cam.E.xyz;
	vec3 p_1m = cam.p_1m.xyz;
	vec3 q_x = cam.q_x.xyz;
	vec3 q_y = cam.q_y.xyz;

    float width_f = float(width);
    float height_f = float(height);

	float i = gl_FragCoord[0] - (x_axesPixelOffset * width_f * 0.5);//x
	//i = gl_FragCoord[0];//x
	//float j = height - gl_FragCoord[1];//y
	float j = gl_FragCoord[1] - (y_axesPixelOffset * height_f * 0.5);//y
	//j = gl_FragCoord[1];//y
	//if(!left_handed)
		j = height_f - gl_FragCoord[1] + (y_axesPixelOffset * height_f * 0.5);//y
	vec3 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec3 r_ij = normalize(p_ij);
	
	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
    ray.local_cutoff = maxRayDistance;
	return ray;
}

`;