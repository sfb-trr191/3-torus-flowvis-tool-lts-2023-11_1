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

        /*
        bool markError = true;//TODO: uniform or solve problem
        if(markError && abs(w) < 0.5){
            //explicitIntegrationData.markError = true;            
        }
        */

        bool use_taylor = true;
        if(use_taylor){
            //taylor expansion in w of xt
            //https://www.wolframalpha.com/input?i=Series%5B%5B%2F%2Fmath%3Ac%2Fw%28sin%28wt%2Ba%29-sin%28a%29%29%2F%2F%5D%2C+%7B%5B%2F%2Fmath%3Aw%2F%2F%5D%2C+%5B%2F%2Fmath%3A0%2F%2F%5D%2C+%5B%2F%2Fmath%3A10%2F%2F%5D%7D%5D
            xt = c*t *cos(alpha) - 0.5 *w *(c *t*t *sin(alpha)) - 1.0/6.0 *w*w *(c *t*t*t *cos(alpha)) + 1.0/24.0 *c *t*t*t*t *w*w*w *sin(alpha);

            //taylor expansion in w of yt
            //https://www.wolframalpha.com/input?i=Series%5B%5B%2F%2Fmath%3A+-+c+%2F+w+*+%28cos%28w*t%2Balpha%29-cos%28alpha%29%29%2F%2F%5D%2C+%7B%5B%2F%2Fmath%3Aw%2F%2F%5D%2C+%5B%2F%2Fmath%3A0%2F%2F%5D%2C+%5B%2F%2Fmath%3A10%2F%2F%5D%7D%5D
            yt = c *t *sin(alpha) + 0.5 *c *t*t *w *cos(alpha) - 1.0/6.0 *w*w *(c *t*t*t *sin(alpha)) - 1.0/24.0 *w*w*w *(c *t*t*t*t *cos(alpha));
    
            //taylor expansion in w of zt
            //https://www.wolframalpha.com/input?i=Series%5B%5B%2F%2Fmath%3At*%28w%2B%28c%5E2%29%2F%282.0*w%29%29+-+%28c%5E2%29%2F%284.0*w%5E2%29+*+%28sin%282.0*w*t+%2B+2.0*alpha%29+-+sin%282.0*alpha%29%29+%2B+%28c%5E2%29%2F%282.0*w%5E2%29*%28sin%28w*t%2B2.0*alpha%29-sin%282.0*alpha%29-sin%28t*w%29%29%2F%2F%5D%2C+%7B%5B%2F%2Fmath%3Aw%2F%2F%5D%2C+%5B%2F%2Fmath%3A0%2F%2F%5D%2C+%5B%2F%2Fmath%3A10%2F%2F%5D%7D%5D
            zt = 0.25 *c*c *t*t* sin(2.0*alpha) + w* (0.25 *c*c* pow(t,3.0) *cos(2.0*alpha) + 0.0833333 *c*c* pow(t,3.0) + t)            
            - 0.145833 *w*w *(c*c* pow(t,4.0)* sin(2.0*alpha)) + c*c* pow(t,5.0) *pow(w,3.0)* (-0.0625 *cos(2.0* alpha) - 0.00416667);
            /*                  
            + 0.0215278 *c*c* pow(t,6.0) *pow(w,4.0) *sin(2.0*alpha)
            + c*c *pow(t,7.0)* pow(w,5.0)* (0.00625 *cos(2.0*alpha) + 0.0000992063)
            - 0.0015749 *pow(w,6.0) *(c*c *pow(t,8.0) *sin(2.0*alpha)) + c*c *pow(t,9.0) *pow(w,7.0) *(-0.000351356 *cos(2.0*alpha) - 1.37787/pow(10.0,6.0)) 
            + 0.000070409 *c*c *pow(t,10.0) *pow(w,8.0) *sin(2.0*alpha) + c*c *pow(t,11.0) *pow(w,9.0) *(0.0000128142*cos(2.0*alpha) + 1.25261/pow(10.0,8.0)) 
            - 2.13674/pow(10.0,6.0) *pow(w,10.0) *(c*c *pow(t,12.0) *sin(2.0*alpha));
            */
        }else{
            xt = c / w * (sin(w*t+alpha)-sin(alpha));
            yt = - c / w * (cos(w*t+alpha)-cos(alpha));
            zt = t*(w+(c*c)/(2.0*w)) - (c*c)/(4.0*w*w) * (sin(2.0*w*t + 2.0*alpha) - sin(2.0*alpha)) + (c*c)/(2.0*w*w)*(sin(w*t+2.0*alpha)-sin(2.0*alpha)-sin(t*w));
        }

        P1 = x1 + xt;
        P2 = x2 + yt;
        P3 = x3 + zt + x1*yt;

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