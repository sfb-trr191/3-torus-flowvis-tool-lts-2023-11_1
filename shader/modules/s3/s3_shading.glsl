global.SHADER_MODULE_S3_SHADING = `

vec3 Shade(Ray ray, inout HitInformation hit, inout HitInformation hitCube, bool ignore_override)
{			
    vec3 resultColor = vec3(0.2,0,0);
    if(hitCube.hitType>TYPE_NONE)
	{
	    resultColor = vec3(0,0.2,0);         
	}
	return resultColor;
}


float GetScalar(vec4 position){
    float x = position.x;
	float y = position.y;
	float z = position.z;
    return shader_formula_scalar;
}

`;