global.SHADER_MODULE_DEFAULT_LIGHT_INTEGRATION_DEFINITIONS = `

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
void RayRK4Step(inout Ray ray)
{
    
	vec3 currentPosition = ray.origin;
	vec3 currentDirection = ray.direction;

	vec3 k1 = light_integration_step_size * RayLightFunctionPos(currentPosition, currentDirection);
	vec3 l1 = light_integration_step_size * RayLightFunctionDir(currentPosition, currentDirection);

	vec3 k2 = light_integration_step_size * RayLightFunctionPos(currentPosition + k1/2.0, currentDirection + l1/2.0);
	vec3 l2 = light_integration_step_size * RayLightFunctionDir(currentPosition + k1/2.0, currentDirection + l1/2.0);

	vec3 k3 = light_integration_step_size * RayLightFunctionPos(currentPosition + k2/2.0, currentDirection + l2/2.0);
	vec3 l3 = light_integration_step_size * RayLightFunctionDir(currentPosition + k2/2.0, currentDirection + l2/2.0);

	vec3 k4 = light_integration_step_size * RayLightFunctionPos(currentPosition + k3, currentDirection + l3);
	vec3 l4 = light_integration_step_size * RayLightFunctionDir(currentPosition + k3, currentDirection + l3);

	ray.nextPosition = currentPosition + k1 / 6.0 + k2 / 3.0 + k3 / 3.0 + k4 / 6.0;
	ray.nextDirection = currentDirection + l1 / 6.0 + l2 / 3.0 + l3 / 3.0 + l4 / 6.0;    
    ray.local_cutoff = distance(currentPosition, ray.nextPosition);
    ray.nextDirection = normalize(ray.nextDirection);
    
}

vec3 RayLightFunctionPos(vec3 position, vec3 direction)
{	
	float p0 = position.x;
	float p1 = position.y;
	float p2 = position.z;

	float d0 = direction.x;
	float d1 = direction.y;
	float d2 = direction.z;

	float P0 = light_transport_p0;
	float P1 = light_transport_p1;
	float P2 = light_transport_p2;

	return vec3(P0,P1,P2);	
}

vec3 RayLightFunctionDir(vec3 position, vec3 direction)
{
	float p0 = position.x;
	float p1 = position.y;
	float p2 = position.z;

	float d0 = direction.x;
	float d1 = direction.y;
	float d2 = direction.z;
	
	float D0 = light_transport_d0;
	float D1 = light_transport_d1;
	float D2 = light_transport_d2;

	return vec3(D0,D1,D2);	
}


`;