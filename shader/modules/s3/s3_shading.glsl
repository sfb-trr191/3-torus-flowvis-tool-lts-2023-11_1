global.SHADER_MODULE_S3_SHADING = `

vec3 AddTransparentColorBackToFront(vec3 combined_color, vec3 added_color, float alpha){
    vec3 C_in = combined_color.rgb;
    vec3 C = added_color.rgb;
    //back to front compositing formula:
    vec3 C_out = C_in * (1.0-alpha) + (C * alpha);
    return C_out;
}

vec3 Get4DNormalColor(vec4 normal){
    vec3 color = vec3(0,0,0);
    float white = abs(normal[3]);
    float red = abs(normal[0]);
    float green = abs(normal[1]);
    float blue = abs(normal[2]);
    color = AddTransparentColorBackToFront(color, vec3(1.0,1.0,1.0), white);
    color = AddTransparentColorBackToFront(color, vec3(red,green,blue), 0.5);
    return color;
}

vec3 Shade(Ray ray, inout HitInformation hit, inout HitInformation hitCube, bool ignore_override)
{	
    /*		
    if(hit.hitType>TYPE_NONE)
	{
        surface_color = Get4DNormalColor(hit.normal);  
	}
    */
    vec3 surface_color = vec3(0, 0, 0);
    
    //return vec3(hit.debug_value_f, 0, 0);

    if(hit.hitType>TYPE_NONE && hit.distance < maxRayDistance)
	{	
		//hit found
        if(hit.hitType == TYPE_STREAMLINE_SEGMENT)
	    {
            if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_NORMAL){
                surface_color = Get4DNormalColor(hit.normal); 
                return surface_color;
            }
            if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_POSITION){
                vec4 mapped_position = map4(hit.position, vec4(-1,-1,-1,-1), vec4(1,1,1,1), vec4(0,0,0,0), vec4(1,1,1,1));	
                surface_color = Get4DNormalColor(mapped_position); 
                return surface_color;
            }
            if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_SUBTYPE){
                if(hit.sub_type == SUBTYPE_3SPHERE){
                    surface_color = vec3(1, 0, 0);
                }
                if(hit.sub_type == SUBTYPE_SPHERINDER){
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
            if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_DISTANCE_ITERATION){
                float scalar = hit.distance_iteration;
                float t = (scalar - min_scalar) / (max_scalar - min_scalar);
                int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
                bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
                return GetScalarColor(bin, transfer_function_index_streamline_scalar).rgb;
            }
            if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_ITERATION_COUNT){
                float scalar = float(hit.iteration_count);
                float t = (scalar - min_scalar) / (max_scalar - min_scalar);
                int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
                bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
                return GetScalarColor(bin, transfer_function_index_streamline_scalar).rgb;
            }
            
        }

        vec3 lightColor = vec3(0, 0, 0);
        vec3 viewDir = -ray.direction.xyz;
        vec3 normal = hit.normal.xyz;	
        //vec3 normalMapped = map(hit.normal, vec3(-1,-1,-1), vec3(1,1,1), vec3(0,0,0), vec3(1,1,1));	
        //vec3 normalAbs = abs(hit.normal);	
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
    
    vec3 resultColor = surface_color;
  

	return resultColor;
}


float GetScalar(vec4 position){
    float x = position.x;
	float y = position.y;
	float z = position.z;
    return shader_formula_scalar;
}

`;