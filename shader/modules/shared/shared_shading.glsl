global.SHADER_MODULE_SHARED_SHADING = `

float CalculateFogFactor(float dist)
{
    float fogFactor = 1.0;
    if (fog_type == FOG_LINEAR){
	    //float fogFactor = (fogEnd - hit.distance)/(fogEnd-fogStart);
	    fogFactor = (maxRayDistance - dist)/(maxRayDistance);
	    fogFactor = clamp(fogFactor, 0.0, 1.0);   
    }
    else if (fog_type == FOG_EXPONENTIAL){
        float dz = fog_density * dist;
	    fogFactor = exp(-dz);
	    fogFactor = clamp(fogFactor, 0.0, 1.0);   
    }
    else if (fog_type == FOG_EXPONENTIAL_SQUARED){
        float dz = fog_density * dist;
	    fogFactor = exp(-dz*dz);
	    fogFactor = clamp(fogFactor, 0.0, 1.0);      
    }

    return fogFactor;
}

vec3 ToGrayScale(vec3 rgb, float color_t)
{
	float gray = 0.21 * rgb[0] + 0.71 * rgb[1] + 0.07 * rgb[2];
	return vec3(
		rgb[0] * color_t + gray * (1.0 - color_t),
		rgb[1] * color_t + gray * (1.0 - color_t),
		rgb[2] * color_t + gray * (1.0 - color_t));	
}

vec3 GetObjectColor(Ray ray, inout HitInformation hit)
{
	//return vec3(0.5,0.5,0.5);
	vec3 objectColor = vec3(0, 0, 1);
	
    if(hit.hitType == TYPE_GL_CYLINDER)
	{
		objectColor = hit.objectColor;
	}
	if(hit.hitType == TYPE_STREAMLINE_SEGMENT)
	{
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_ID)
        {
            //check if we are in projection mode and show both inside and outside
            bool projection_both = projection_index>=0 && show_streamlines && show_streamlines_outside;
            if( projection_both ){
                //check if we want to remove color from the inside mode
                if(!hit.was_copied_from_outside){
                    return vec3(1,1,1);
                }
            }
            if(hit.dynamic)
                return dynamic_streamline_color;

		    int index = hit.multiPolyID;
            vec3 color = GetStreamlineColor(index);
            if(selected_streamline_id >= 0){
                if(selected_streamline_id == hit.multiPolyID){
                    color = vec3(1,0,0);
                }else{
                    //not the selected streamline --> change color to graycale
                    color = ToGrayScale(color, gray_scale_factor);
                }
            }
            return color;
        }
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_SCALAR)
        {
            float scalar = GetScalar(hit.positionCenter);
            float t = (scalar - min_scalar) / (max_scalar - min_scalar);
            int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
            bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
            return GetScalarColor(bin, transfer_function_index_streamline_scalar).rgb;
        }
#ifdef SHOW_VOLUME_RENDERING
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_FTLE)
        {
            int z_offset = 0;
            vec3 sample_position = hit.position;
            vec4 rgba_forward = GetVolumeColorAndOpacity(ray, sample_position, z_offset, transfer_function_index_streamline_scalar);
            return rgba_forward.rgb;
        }
#endif
        
	}
	if(hit.hitType == TYPE_SEED){
		int index = hit.multiPolyID;
        return GetStreamlineColor(index);
	}
	
	return objectColor;
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