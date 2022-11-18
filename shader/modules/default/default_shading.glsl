global.SHADER_MODULE_DEFAULT_SHADING = `

vec3 Shade(Ray ray, inout HitInformation hit, inout HitInformation hitCube, bool ignore_override)
{			
	ignore_override = ignore_override || hit.ignore_override;
	vec3 resultColor = vec3(0,0,0);
    vec3 surface_color = vec3(0,0,0);
    if(hitCube.hitType>TYPE_NONE)
	{
		//gl_FragColor = vec4(0, 0, 0, 1);
		//return;
		bool transfer = true;
		if(hit.hitType == TYPE_CLICKED_SPHERE)
		{
			bool outOfBounds = CheckOutOfBounds(hit.position);			
			if(outOfBounds)
				transfer = false;
		}
		else if(hit.hitType == TYPE_GL_CYLINDER)
		{
			if(hit.distance < hitCube.distance)
				transfer = false;
		}
        if(hit.was_copied_from_outside){
            if(hit.distance < hitCube.distance)
				transfer = false;
        }
        
        //transfer = false;
		if(transfer)
		{
			hit.hitType = hitCube.hitType;
			hit.position = hitCube.position;
			hit.positionCenter = hitCube.positionCenter;
			hit.normal = hitCube.normal;
			hit.distance = hitCube.distance;
			hit.multiPolyID = hitCube.multiPolyID;
			hit.velocity = hitCube.velocity;
			hit.cost = hitCube.cost;
		}
        
	}

	if(hit.hitType>TYPE_NONE && hit.distance < maxRayDistance)
	{	
		//hit found
		vec3 lightColor = vec3(0, 0, 0);
		vec3 viewDir = -ray.direction;
		vec3 normal = hit.normal;	
		vec3 normalMapped = map(hit.normal, vec3(-1,-1,-1), vec3(1,1,1), vec3(0,0,0), vec3(1,1,1));	
		vec3 normalAbs = abs(hit.normal);	
		for(int i=0; i<numDirLights; i++)
		{
			GL_DirLight light = GetDirLight(i);//blockDirLight[i];
			lightColor += CalcDirLight(light, normal, viewDir);
		}

		vec3 objectColor = GetObjectColor(ray, hit);	
		lightColor *= objectColor;
		
        float fogFactor = CalculateFogFactor(hit.distance);
		
		//formula: finalColor = (1.0 - f)*fogColor + f * lightColor
		surface_color = mix(fogColor, lightColor, fogFactor);
	}
	else
	{
		//no hit found, use background color
		surface_color = vec3(1, 1, 1);
	}

    //blend volume with surface
    resultColor = mix(surface_color, hit.vol_accumulated_color, hit.vol_accumulated_opacity);
/*
    if(hit.debug_value == 1){
        resultColor = vec3(1, 0, 0);
    }
    if(hit.debug_value == 2){
        resultColor = vec3(0, 1, 0);
    }
    if(hit.debug_value == 3){
        resultColor = vec3(0, 0, 1);
    }
    if(hit.debug_value == 4){
        resultColor = vec3(1, 1, 0);
    }
    */
    
	//return hitCube.hitType>TYPE_NONE ? surface_color : resultColor;
	return resultColor;
}


vec3 CalcDirLight(GL_DirLight light, vec3 normal, vec3 viewDir)
{	
	float shininess = tubeShininess;
	if(blinn_phong)
	{

  		vec3 lightDir = normalize(-light.direction.xyz);
   		// diffuse shading
		
    	float diff = max(dot(normal, lightDir), 0.0);
   		// specular shading
    	vec3 reflectDir = reflect(-lightDir, normal);
    	vec3 halfDir = normalize(lightDir + viewDir);
    	//float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    	float spec = pow(max(dot(halfDir, normal), 0.0), shininess);
	
    	// combine results
    	vec3 ambient  = light.ambient.xyz;
    	vec3 diffuse  = light.diffuse.xyz  * diff;
    	vec3 specular = light.specular.xyz * spec;
    	return (ambient + diffuse + specular);	
	}
	else
	{
		//PHONG

   		vec3 lightDir = normalize(-light.direction.xyz);
  	  	// diffuse shading
		
    	float diff = max(dot(normal, lightDir), 0.0);
    	// specular shading
    	vec3 reflectDir = reflect(-lightDir, normal);
    	float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
	
    	// combine results
    	vec3 ambient  = light.ambient.xyz;
    	vec3 diffuse  = light.diffuse.xyz  * diff;
    	vec3 specular = light.specular.xyz * spec;
    	return (ambient + diffuse + specular);	
	}
}  


`;