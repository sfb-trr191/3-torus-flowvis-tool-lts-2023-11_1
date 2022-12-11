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
    vec3 resultColor = vec3(0.2,0,0);
    if(hit.hitType>TYPE_NONE)
	{
        resultColor = Get4DNormalColor(hit.normal);  
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