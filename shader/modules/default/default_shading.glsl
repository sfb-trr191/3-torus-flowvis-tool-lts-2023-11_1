global.SHADER_MODULE_DEFAULT_SHADING = `

vec3 Get3DNormalColor(vec3 normal){
    vec3 color = vec3(0,0,0);
    float red = abs(normal[0]);
    float green = abs(normal[1]);
    float blue = abs(normal[2]);
    color = vec3(red,green,blue);
    return color;
}

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
			hit.sub_type = hitCube.sub_type;
			hit.position = hitCube.position;
			hit.positionCenter = hitCube.positionCenter;
			hit.normal = hitCube.normal;
			hit.distance = hitCube.distance;
			hit.multiPolyID = hitCube.multiPolyID;
			hit.velocity = hitCube.velocity;
			hit.cost = hitCube.cost;
		}
        
	}

    //--------------------------------------------------------------------------------
    if(hit.hitType == TYPE_STREAMLINE_SEGMENT)
    {
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_NORMAL){
            surface_color = Get3DNormalColor(hit.normal); 
            return surface_color;
        }
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_POSITION){
            vec3 mapped_position = map(hit.position, vec3(-1,-1,-1), vec3(1,1,1), vec3(0,0,0), vec3(1,1,1));	
            surface_color = Get3DNormalColor(mapped_position); 
            return surface_color;
        }
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_SUBTYPE){
            if(hit.sub_type == SUBTYPE_SPHERE){
                surface_color = vec3(1, 0, 0);
            }
            if(hit.sub_type == SUBTYPE_CYLINDER){
                surface_color = vec3(0, 1, 0);
            }
            return surface_color;
        }
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_DISTANCE){
            float scalar = hit.distance;
            float t = (scalar - min_scalar) / (max_scalar - min_scalar);
            int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
            bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
            return GetScalarColor(bin, transfer_function_index_streamline_scalar).rgb;
        }
    }
    //--------------------------------------------------------------------------------

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

float GetScalar(vec3 position){
    float x = position.x;
	float y = position.y;
	float z = position.z;
    return shader_formula_scalar;
}


`;