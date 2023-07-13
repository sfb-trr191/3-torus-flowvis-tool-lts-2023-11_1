global.F_SHADER_RAYTRACING_PREPROCESSOR = `#version 300 es

$defines$
#define BINDING_BLOCK_DIR_LIGHT 0

precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

out vec4 outputColor;

$SHADER_MODULE_SHARED_STRUCTS$
$SHADER_MODULE_ADDITIONAL_STRUCTS$
$SHADER_MODULE_SHARED_UNIFORMS$
$SHADER_MODULE_SHARED_CONST$
$SHADER_MODULE_SHARED_FUNCTION_DECLARATIONS$
$SHADER_MODULE_ADDITIONAL_FUNCTION_DECLARATIONS$

//#######################################################
//#                                                     #
//#                FUNCTION DEFINITIONS                 #
//#                                                     #
//#######################################################

//different for s3
$SHADER_MODULE_RAY_GENERATION$
$SHADER_MODULE_INTERSECTIONS$
$SHADER_MODULE_SHADING$
$SHADER_MODULE_OUTPUT_DATA$

//not used in s3
$SHADER_MODULE_VOLUME_RENDERING$
$SHADER_MODULE_OUT_OF_BOUNDS$
$SHADER_MODULE_HANDLE_INSIDE$
$SHADER_MODULE_HANDLE_OUT_OF_BOUNDS$

//shared
$SHADER_MODULE_SHARED_UTILITY$
$SHADER_MODULE_SHARED_DATA_ACCESS$
$SHADER_MODULE_LIGHT_INTEGRATION_DEFINITIONS$
$SHADER_MODULE_SHARED_SHADING$
$SHADER_MODULE_LINALG$


void main() {
	HitInformation hit;
    HitInformation hit_outside;
	vec3 color = CalculateOneRay(offset_x, offset_y, hit, hit_outside);
	outputColor = vec4(color, 1);
    if(get_pixel_data_results){
        outputColor = GetOutput(hit);
    }
}

vec3 CalculateOneRay(float x_offset, float y_offset, inout HitInformation hit, inout HitInformation hit_outside)
{
    hit.was_copied_from_outside = false;
	hit.hitType = TYPE_NONE;
    hit.sub_type = SUBTYPE_NONE;    
    hit.dynamic = false;
	hit.distance = 0.0;	
    hit.distance_iteration = 0.0;
	hit.transparentHit = false;
	hit.transparentNearest = 0.0;
	hit.clickTarget = false;
	hit.ignore_override = false;
    hit.vol_accumulated_opacity = 0.0;
    hit.vol_accumulated_color = vec3(0,0,0);
    hit.debug_value = 0;

    hit_outside.hitType = TYPE_NONE;
	hit_outside.distance = 0.0;	
    hit_outside.distance_iteration = 0.0;
	hit_outside.transparentHit = false;
	hit_outside.transparentNearest = 0.0;
	hit_outside.clickTarget = false;
	hit_outside.ignore_override = false;
    hit_outside.vol_accumulated_opacity = 0.0;
    hit_outside.vol_accumulated_color = vec3(0,0,0);
  /*
	if(clicked == 1)
	{
		int clickedX_scaled = int(clickedX * resolutionFactor);
		int clickedY_scaled = int(clickedY * resolutionFactor);
		int x = int(gl_FragCoord[0]);
		int y = height - int(gl_FragCoord[1]);
		if(clickedX_scaled == x && clickedY_scaled == y)		
			hit.clickTarget = true;		
	}
  */
	HitInformation hitCube;

	//#decision render_movable_axes
#ifdef SHOW_MOVABLE_AXES
    Ray rayPixelOffset = GenerateRayWithPixelOffset(x_offset, y_offset);
    IntersectMovableAxes(rayPixelOffset, maxRayDistance, hit, hitCube);
    if(hit.hitType > TYPE_NONE)
    {
        //return vec3(1,0,0);
        vec3 resultColor = Shade(rayPixelOffset, hit, hitCube, true);
        return resultColor;	
    }
#endif

    GL_CameraData cam = GetActiveCamera();
    
    //multiple areas
    float i = gl_FragCoord[0];//x
	float j = float(height) - gl_FragCoord[1];//y
    if(i < float(width) * cam.area_start_x_percentage){

        float start = 0.0;
        float area_height = 0.0;
        for(int area_index=0; area_index<4; area_index++){

            GL_CameraData cam_tmp = GetCameraForArea(area_index);
            float area_height = float(height) * cam_tmp.area_height_percentage;
            float area_height_min = float(height) * cam_tmp.area_start_y_percentage;
            float area_height_max = area_height_min + area_height;
            if(j >= area_height_min && j <= area_height_max){
                Ray ray = GenerateRay(x_offset, y_offset, area_index);
                Intersect(ray, hit, hit_outside, hitCube);//found in decision: intersection_control_definitions
                CombineHitInformation(ray, hit, hit_outside, hitCube);
                vec3 resultColor = Shade(ray, hit, hitCube, false);
                return resultColor;  
            }
        }

      	vec3 resultColor = vec3(1.0, 1.0, 1.0);
  	    return resultColor;  
    }else{
        Ray ray = GenerateRay(x_offset, y_offset, -1);
        Intersect(ray, hit, hit_outside, hitCube);//found in decision: intersection_control_definitions
        CombineHitInformation(ray, hit, hit_outside, hitCube);
        vec3 resultColor = Shade(ray, hit, hitCube, false);
        return resultColor;
    }
   

    //without multiple areas
    Ray ray = GenerateRay(x_offset, y_offset);	  
    Intersect(ray, hit, hit_outside, hitCube);//found in decision: intersection_control_definitions
    CombineHitInformation(ray, hit, hit_outside, hitCube);
	vec3 resultColor = Shade(ray, hit, hitCube, false);
  	return resultColor;
}

GL_CameraData GetActiveCamera()
{
	return active_camera;
}

GL_CameraData GetCameraForArea(int area_index)
{
    if(area_index == 0){
	    return cameraAreaProjection0;
    }
    if(area_index == 1){
	    return cameraAreaProjection1;
    }
    if(area_index == 2){
	    return cameraAreaProjection2;
    }
    if(area_index == 3){
	    return cameraAreaProjection3;
    }
	return active_camera;
}

#ifdef INTEGRATE_LIGHT
void LightIntegrationPre(inout Ray ray){
    RayRK4Step(ray);
}

void LightIntegrationPost(inout Ray ray, bool flag_ray_stays_inside){
    /*
    if(flag_ray_stays_inside){

    }
    */
    ray.origin = ray.nextPosition;
    ray.direction = ray.nextDirection;
    ray.dir_inv = 1.0/ray.direction;
}
#endif 

float ExtractLinearPercentage(float a, float b, float value)
{
	return (value - a) / (b - a);
}

void CombineHitInformation(Ray ray, inout HitInformation hit, inout HitInformation hit_outside, inout HitInformation hitCube)
{
    //deciding which hit to use
    if(projection_index == -1){
        if(hit_outside.hitType>TYPE_NONE){
            if(hit.hitType == TYPE_NONE){
                hit.was_copied_from_outside = true;
                hit.hitType = hit_outside.hitType;
                hit.sub_type = hit_outside.sub_type;                
                hit.dynamic = hit_outside.dynamic;
                hit.position = hit_outside.position;
                hit.positionCenter = hit_outside.positionCenter;
                hit.light_direction = hit_outside.light_direction;
                hit.normal = hit_outside.normal;
                hit.distance = hit_outside.distance;
                hit.multiPolyID = hit_outside.multiPolyID;
                hit.velocity = hit_outside.velocity;
                hit.cost = hit_outside.cost;
                //hit.debug_value = 1;//red
            }
            else if(hit_outside.distance < hit.distance){
                hit.was_copied_from_outside = true;
                hit.hitType = hit_outside.hitType;
                hit.sub_type = hit_outside.sub_type;
                hit.dynamic = hit_outside.dynamic;
                hit.position = hit_outside.position;
                hit.positionCenter = hit_outside.positionCenter;
                hit.light_direction = hit_outside.light_direction;
                hit.normal = hit_outside.normal;
                hit.distance = hit_outside.distance;
                hit.multiPolyID = hit_outside.multiPolyID;
                hit.velocity = hit_outside.velocity;
                hit.cost = hit_outside.cost;
                //hit.debug_value = 2;//green
            }
            else{
                //hit.debug_value = 3;//blue
            }
        }
        else{            
            //hit.debug_value = 4;//yellow
        }
    }
    else{
        //if we hit something outside, prioretize the outside hit
        if(hit_outside.hitType>TYPE_NONE){
            hit.was_copied_from_outside = true;
            hit.hitType = hit_outside.hitType;
            hit.sub_type = hit_outside.sub_type;            
            hit.dynamic = hit_outside.dynamic;
            hit.position = hit_outside.position;
            hit.positionCenter = hit_outside.positionCenter;
            hit.light_direction = hit_outside.light_direction;
            hit.normal = hit_outside.normal;
            hit.distance = hit_outside.distance;
            hit.multiPolyID = hit_outside.multiPolyID;
            hit.velocity = hit_outside.velocity;
            hit.cost = hit_outside.cost;
        }
    }
}

`;