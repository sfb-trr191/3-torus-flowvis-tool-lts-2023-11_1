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

void RayExplicitStep(inout Ray ray, inout ExplicitIntegrationData explicitIntegrationData)
{
	vec3 currentPosition = ray.origin;
	vec3 currentDirection = ray.direction;

    ray.nextPosition = RayLightFunctionPosExplicit(explicitIntegrationData);

    ray.local_cutoff = distance(currentPosition, ray.nextPosition);    
	ray.direction = ray.nextPosition - currentPosition;    
    ray.direction = normalize(ray.direction);
    ray.nextDirection = ray.direction;//for the case when we leave the fd
    ray.dir_inv = 1.0/ray.direction;

    /*
    //in case the ray leaves the fundamental domain we need to make sure that the next direction is "good"
    bool flag_ray_goes_outside = CheckOutOfBounds(ray.nextPosition);
    //TODO: bisection to get point close to the intersection?
    //below: using the next position to calculate direction, doesnt change much
    if(flag_ray_goes_outside){
        ExplicitIntegrationData tmp;
        tmp.t = explicitIntegrationData.t;
        tmp.markError = explicitIntegrationData.markError;
        tmp.original_position = explicitIntegrationData.original_position;
        tmp.original_direction = explicitIntegrationData.original_direction;
        vec3 nextPosition = RayLightFunctionPosExplicit(tmp);
        ray.nextDirection = nextPosition - ray.nextPosition;  
        ray.nextDirection = normalize(ray.nextDirection);
    }
    */

}

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

vec3 RayLightFunctionPosExplicit(inout ExplicitIntegrationData explicitIntegrationData)
{	
    //update internal
    explicitIntegrationData.t = explicitIntegrationData.t + light_integration_step_size;

    //rename for userfriendly acces to variable
    float t = explicitIntegrationData.t;

	float x1 = explicitIntegrationData.original_position.x;
	float x2 = explicitIntegrationData.original_position.y;
	float x3 = explicitIntegrationData.original_position.z;

	float v1 = explicitIntegrationData.original_direction.x;
	float v2 = explicitIntegrationData.original_direction.y;
	float v3 = explicitIntegrationData.original_direction.z;


    //equations
    float P1;
    float P2;
    float P3;
    float xt;
    float yt;
    float zt;
    if(false){
        //line for debugging purpose
	    P1 = x1 + v1 * t;
	    P2 = x2 + v2 * t;
	    P3 = x3 + v3 * t;
    }else{
        float w = v3;
        float c = sqrt(v1*v1 + v2*v2);
        float alpha = atan(v2, v1);

        xt = c / w * (sin(w*t+alpha)-sin(alpha));
        yt = - c / w * (cos(w*t+alpha)-cos(alpha));
        zt = t*(w+(c*c)/(2.0*w)) - (c*c)/(4.0*w*w) * (sin(2.0*w*t + 2.0*alpha) - sin(2.0*alpha)) + (c*c)/(2.0*w*w)*(sin(w*t+2.0*alpha)-sin(2.0*alpha)-sin(t*w));

        P1 = x1 + xt;
        P2 = x2 + yt;
        P3 = x3 + zt + x1*yt;

        bool markError = true;//TODO: uniform or solve problem
        if(markError && abs(w) < 0.02){
            explicitIntegrationData.markError = true;
            /*
            xt = c * cos(alpha*t);
            yt = c * sin(alpha*t);
            zt = (c*c)/2.0 * cos(alpha) * sin(alpha*t*t);

            P1 = x1 + xt;
            P2 = x2 + yt;
            P3 = x3 + zt + x1*yt;
            */
        }


    }
	return vec3(P1,P2,P3);	
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