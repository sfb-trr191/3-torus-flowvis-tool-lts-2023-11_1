global.SHADER_MODULE_S3_LIGHT_INTEGRATION_DEFINITIONS = `

/*
void RayEulerStep(inout Ray ray)
{
	vec3 previousPosition = ray.origin;
	vec3 previousDirection = ray.direction;

	vec3 currentPosition = previousPosition + light_integration_step_size * RayLightFunctionPos(previousPosition, previousDirection);
	vec3 currentDirection = previousDirection + light_integration_step_size * RayLightFunctionDir(previousPosition, previousDirection);

	ray.origin = currentPosition;
	ray.direction = currentDirection;
}
*/

void RayExplicitStep(inout Ray ray, inout ExplicitIntegrationData explicitIntegrationData)
{
    /*
	vec3 currentPosition = ray.origin;
	vec3 currentDirection = ray.direction;

    ray.nextPosition = RayLightFunctionPosExplicit(explicitIntegrationData);

    ray.local_cutoff = distance(currentPosition, ray.nextPosition);    
	ray.direction = ray.nextPosition - currentPosition;    
    ray.direction = normalize(ray.direction);
    ray.dir_inv = 1.0/ray.direction;
    */
}

void RayRK4Step(inout Ray ray)
{
    
	vec4 currentPosition = ray.origin;
	vec4 currentDirection = ray.direction;

	vec4 k1 = light_integration_step_size * RayLightFunctionPos(currentPosition, currentDirection);
	vec4 l1 = light_integration_step_size * RayLightFunctionDir(currentPosition, currentDirection);

	vec4 k2 = light_integration_step_size * RayLightFunctionPos(currentPosition + k1/2.0, currentDirection + l1/2.0);
	vec4 l2 = light_integration_step_size * RayLightFunctionDir(currentPosition + k1/2.0, currentDirection + l1/2.0);

	vec4 k3 = light_integration_step_size * RayLightFunctionPos(currentPosition + k2/2.0, currentDirection + l2/2.0);
	vec4 l3 = light_integration_step_size * RayLightFunctionDir(currentPosition + k2/2.0, currentDirection + l2/2.0);

	vec4 k4 = light_integration_step_size * RayLightFunctionPos(currentPosition + k3, currentDirection + l3);
	vec4 l4 = light_integration_step_size * RayLightFunctionDir(currentPosition + k3, currentDirection + l3);

	ray.nextPosition = currentPosition + k1 / 6.0 + k2 / 3.0 + k3 / 3.0 + k4 / 6.0;
	ray.nextDirection = currentDirection + l1 / 6.0 + l2 / 3.0 + l3 / 3.0 + l4 / 6.0;    
    ray.local_cutoff = distance(currentPosition, ray.nextPosition);
    ray.nextDirection = normalize(ray.nextDirection);
    
}

vec4 RayLightFunctionPos(vec4 position, vec4 direction)
{	    
    //MARKER_RENAME_SYMBOLS DONE 3-sphere
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	float x4 = position.w;

	float v1 = direction.x;
	float v2 = direction.y;
	float v3 = direction.z;
	float v4 = direction.w;

	float P0 = light_transport_p0;
	float P1 = light_transport_p1;
	float P2 = light_transport_p2;
	float P3 = light_transport_p3;

	return vec4(P0,P1,P2,P3);	
}

vec4 RayLightFunctionDir(vec4 position, vec4 direction)
{    
    //MARKER_RENAME_SYMBOLS DONE 3-sphere
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
	float x4 = position.w;

	float v1 = direction.x;
	float v2 = direction.y;
	float v3 = direction.z;
	float v4 = direction.w;
	
	float D0 = light_transport_d0;
	float D1 = light_transport_d1;
	float D2 = light_transport_d2;
	float D3 = light_transport_d3;

	return vec4(D0,D1,D2,D3);	
}


`;