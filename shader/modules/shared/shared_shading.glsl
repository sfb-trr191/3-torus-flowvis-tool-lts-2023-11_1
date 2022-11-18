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
		    int index = hit.multiPolyID;
            return GetStreamlineColor(index);
        }
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_SCALAR)
        {
            float scalar = GetScalar(hit.positionCenter);
            float t = (scalar - min_scalar) / (max_scalar - min_scalar);
            int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
            bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
            return GetScalarColor(bin, transfer_function_index_streamline_scalar).rgb;
        }
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_FTLE)
        {
            int z_offset = 0;
            vec3 sample_position = hit.position;
            vec4 rgba_forward = GetVolumeColorAndOpacity(ray, sample_position, z_offset, transfer_function_index_streamline_scalar);
            return rgba_forward.rgb;
        }
        
	}
	if(hit.hitType == TYPE_SEED){
		int index = hit.multiPolyID;
        return GetStreamlineColor(index);
	}
	
	return objectColor;
}


`;