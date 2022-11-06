global.F_SHADER_RAYTRACING_PREPROCESSOR = `#version 300 es

$defines$

precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

////////////////////////////////////////////////////////////////////
//
//                 START STRUCTS
//
////////////////////////////////////////////////////////////////////

struct GL_DirLight
{
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 direction;
};

struct GL_CameraData
{
	vec4 q_x;			//only using 3 components
	vec4 q_y;			//only using 3 components
	vec4 p_1m;			//only using 3 components
	vec4 E;				//only using 3 components, eye 
	vec4 forward;		//only using 3 components 
	vec4 normal_left;	//only using 3 components, left frustum plane normal 
	vec4 normal_right;	//only using 3 components, right frustum plane normal 
	vec4 normal_top;	//only using 3 components, top frustum plane normal 
	vec4 normal_bottom;	//only using 3 components, bottom frustum plane normal 
};

struct GL_TreeNode
{
	int hitLink;
	int missLink;
	int objectIndex;//index in lineSegment buffer (or other buffer if needed, depending on type). ignored if type=0(parents represent no objects)
	int type;//see TYPE constants
};

struct GL_AABB
{
	vec4 min;
	vec4 max;
};

struct GL_LineSegment
{
	int indexA;
	int indexB;
	int multiPolyID;
	int copy;

	int isBeginning;
	float a_0;
	float b_0;
	float theta_0;

	float a_1;
	float b_1;
	float theta_1;
	float PADDING;
	
	vec4 bounds;
	mat4 matrix;
	mat4 matrix_inv;
};

struct GL_Cylinder
{
	vec4 position_a;
	vec4 position_b;
	vec4 color;
	mat4 matrix;
	mat4 matrix_inv;
	float radius;
	float padding_2;
	float padding_3;
	float padding_4;
};

struct HitInformation
{
	vec3 position;
	vec3 positionCenter;
	vec3 normal;
	vec3 objectColor;//for GL_Cylinder
	//bool terminate;
	int hitType;
	bool copy;
	float distance_iteration;
	float distance;
	float distanceToCenter;
	int multiPolyID;

	bool clickTarget;
	float velocity;
	float cost;

	bool transparentHit;
	float transparentNearest;
	vec3 transparentNormal;

	bool ignore_override;

    float vol_accumulated_opacity;
    vec3 vol_accumulated_color;

    bool was_copied_from_outside;
    
    int debug_value;
};

struct Ray
{
	vec3 origin;		//the origin of the ray, this changes when leaving the cube or when the ray is only a segment
	vec3 direction;
	vec3 dir_inv;		//cached value of: 1 / ray.direction
	float rayDistance;	//the distance already travelled
    float local_cutoff; //the max distance used for intersection testing, for linear rays, this is just maxRayDistance, but if light is integrated this uses the segment length from the integration step

    //the following variables are for ray integration
    vec3 nextPosition;
    vec3 nextDirection;
    float segment_length;
};

struct Sphere
{
	vec3 center;
	float radius;
};

struct MoveOutOfBoundsFlags
{
	bool x_greater;
	bool y_greater;
	bool z_greater;
	bool x_smaller;
	bool y_smaller;
	bool z_smaller;
};

////////////////////////////////////////////////////////////////////
//
//                 START CONSTANTS
//
////////////////////////////////////////////////////////////////////

#define BINDING_BLOCK_DIR_LIGHT 0

const int TYPE_IGNORE_CUBE = -1;//no intersection with cube found --> skip testing
const int TYPE_NONE = 0;//Used in tree for non leaves or in hitInfo if no object was hit
const int TYPE_STREAMLINE_SEGMENT = 1;
const int TYPE_CLICKED_SPHERE = 2;
const int TYPE_GL_CYLINDER = 3;
const int TYPE_SEED = 4;

const int FOG_NONE = 0;
const int FOG_LINEAR = 1;
const int FOG_EXPONENTIAL = 2;
const int FOG_EXPONENTIAL_SQUARED = 3;

const int SHADING_MODE_STREAMLINES_ID = 0;
const int SHADING_MODE_STREAMLINES_SCALAR = 1;
const int SHADING_MODE_STREAMLINES_FTLE = 2;

const float PI = 3.1415926535897932384626433832795;
const int TRANSFER_FUNCTION_BINS = 512;
const int TRANSFER_FUNCTION_LAST_BIN = TRANSFER_FUNCTION_BINS-1;

const int INDEX_CYLINDER_FIRST_PROJECTION_FRAME = 66;

const int PART_INDEX_DEFAULT = 0;//streamlines only in fundamental domain
const int PART_INDEX_OUTSIDE = 1;//streamlines leave fundamental domain

////////////////////////////////////////////////////////////////////
//
//                 START UNIFORMS
//
////////////////////////////////////////////////////////////////////

uniform float light_integration_step_size;
uniform int light_integration_max_step_count;

uniform int num_visual_seeds;
uniform int visualize_seeds_mode;

uniform float color_r;
uniform sampler3D texture_float;
uniform isampler3D texture_int;
uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;
uniform sampler3D texture_ftle;
uniform sampler3D texture_ftle_differences;
uniform float offset_x;
uniform float offset_y;
uniform float maxRayDistance;
uniform float max_volume_distance;
uniform int maxIterationCount;
uniform float tubeRadius;
uniform float tubeRadiusOutside;
uniform float fog_density;
uniform int fog_type;
uniform int shading_mode_streamlines;
uniform float min_scalar;
uniform float max_scalar;
uniform int projection_index;

uniform bool is_main_renderer;
uniform bool show_origin_axes;
uniform float volume_rendering_distance_between_points;
uniform float volume_rendering_termination_opacity;
uniform float volume_rendering_opacity_factor;
uniform float min_scalar_ftle;
uniform float max_scalar_ftle;

uniform int transfer_function_index_streamline_scalar;
uniform int transfer_function_index_ftle_forward;
uniform int transfer_function_index_ftle_backward;

uniform int width;
uniform int height;
uniform int dim_x;//dim of volume texture
uniform int dim_y;//dim of volume texture
uniform int dim_z;//dim of volume texture


uniform float max_streamline_cost;
const int growth = 1;//DUMMY

const float epsilon_move_ray = 0.0000001;//DUMMY
const float epsilon_out_of_bounds = 0.000001;//DUMMY
const bool ignore_copy = false;//DUMMY

const int growth_id = -1;//DUMMY
const bool check_bounds = true;//DUMMY
const int allowOutOfBoundSphere = 0;//DUMMY
const int numDirLights = 3;//DUMMY
const float fogStart = 1000.0;//DUMMY
const float fogEnd = 1001.0;//DUMMY
const vec3 fogColor = vec3(1,1,1);//DUMMY
const float tubeShininess = 32.0;//DUMMY
const bool blinn_phong = true;//DUMMY

const float x_axesPixelOffset = 0.85;
const float y_axesPixelOffset = 0.75;

uniform GL_CameraData active_camera;

//************************** redundant because of compiler directives ********************************

uniform bool show_volume_rendering;
uniform bool show_volume_rendering_forward;
uniform bool show_volume_rendering_backward;
uniform bool show_movable_axes;
uniform bool show_streamlines;//not yet entirely redundant
uniform bool show_streamlines_outside;//not yet entirely redundant
uniform bool show_bounding_box;
uniform bool show_bounding_box_projection;
uniform bool cut_at_cube_faces;
uniform bool handle_inside;

//**********************************************************

out vec4 outputColor;

////////////////////////////////////////////////////////////////////
//
//                 START FUNCTIONS
//
////////////////////////////////////////////////////////////////////

vec4 getTestColor(int x, int y, int z);
bool validateInteger(int value, int expected_value);
bool validateInteger(ivec3 index3D, int expected_value);
bool validateVec3(vec3 a, vec3 b);
vec4 getValidationColor(bool valid);

//**********************************************************

vec3 CalculateOneRay(float x_offset, float y_offset, inout HitInformation hit, inout HitInformation hit_outside);
Ray GenerateRay(float x_offset, float y_offset);
Ray GenerateRayWithPixelOffset(float x_offset, float y_offset);
GL_CameraData GetActiveCamera();
vec3 RepositionIntoFundamentalDomain(vec3 position);
void Intersect(Ray ray, inout HitInformation hit, inout HitInformation hit_outside, inout HitInformation hitCube);
void CombineHitInformation(Ray ray, inout HitInformation hit, inout HitInformation hit_outside, inout HitInformation hitCube);
void IntersectInstance(Ray ray, inout HitInformation hit, inout HitInformation hitCube);
void IntersectInstance_Tree(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube);
bool CheckOutOfBounds(vec3 position);
vec3 MoveOutOfBounds(vec3 position);
vec3 MoveOutOfBoundsProjection(vec3 position);
vec3 MoveOutOfBoundsAndGetFlags(vec3 position, inout MoveOutOfBoundsFlags flags);
vec3 ApplyMoveOutOfBoundsFlags(vec3 position, MoveOutOfBoundsFlags flags);
bool IntersectGLAABB(GL_AABB b, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax);
bool IntersectGLAABB(GL_Cylinder cylinder, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax);
bool IntersectGLAABB(Sphere sphere, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax);
void IntersectLineSegment(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit);
void IntersectCylinder(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override);
void IntersectSphere(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, int type, float velocity, float cost);
float ExtractLinearPercentage(float a, float b, float value);

//**********************************************************

vec3 Shade(Ray ray, inout HitInformation hit, inout HitInformation hitCube, bool ignore_override);
float CalculateFogFactor(float dist);
vec3 GetObjectColor(Ray ray, inout HitInformation hit);
float GetScalar(vec3 position);
vec3 CalcDirLight(GL_DirLight light, vec3 normal, vec3 viewDir);
vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax);

void IntersectUnitCube(Ray ray, inout bool doesIntersect, inout float nearest_t, inout vec3 out_normal);
void IntersectUnitCubeFace(Ray ray, vec3 planeNormal, float planeDistance, inout bool doesIntersect, inout float nearest_t, inout vec3 out_normal);
void HandleOutOfBound_LineSegment(int part_index, Ray ray, int lineSegmentID, inout HitInformation hitCube);
void HandleOutOfBound_Cylinder(int part_index, mat4 matrix, float h, inout HitInformation hitCube, bool copy, int multiPolyID, float cost_a, float cost_b);
void HandleOutOfBound_Sphere(int part_index, Sphere sphere, inout HitInformation hitCube, bool copy, int multiPolyID);
void HandleInside_LineSegment(int part_index, Ray ray, int lineSegmentID, inout HitInformation hit);
void HandleInside_Cylinder(int part_index, mat4 matrix, mat4 matrix_inv, float h, inout HitInformation hit, bool copy, int multiPolyID, float cost_a, float cost_b, vec3 position, Ray ray);
void HandleInside_Sphere(int part_index, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, vec3 position, Ray ray);

void IntersectSeeds(Ray ray, float maxRayDistance, inout HitInformation hit);
void IntersectProjectionFrame(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube);
void IntersectMovableAxes(Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube);
void IntersectAxesCornerAABB(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube, int corner_index);
void IntersectCylinder(bool check_bounds, GL_Cylinder cylinder, Ray ray, float ray_local_cutoff, inout HitInformation hit, bool ignore_override);
void IntersectSphereAxis(bool check_bounds, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, int type, vec3 pos_1, vec3 col_1, vec3 pos_2, vec3 col_2, vec3 pos_3, vec3 col_3);
void IntersectAxes(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube);

//**********************************************************

void IntersectVolumeInstance(Ray ray, float distance_exit, inout HitInformation hit, inout HitInformation hitCube);
void ApplyVolumeSample(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index, inout HitInformation hit);
vec4 GetVolumeColorAndOpacity(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index);

//**********************************************************

vec3 InterpolateVec3(sampler3D texture, vec3 texture_coordinate, int z_offset);
float InterpolateFloat(sampler3D texture, vec3 texture_coordinate, int z_offset);
float GetTubeRadius(int part_index);

//**********************************************************

float GetCost(int index, int part_index);
vec3 GetPosition(int index, int part_index);
float GetVelocity(int index, int part_index);
GL_LineSegment GetLineSegment(int index, int part_index);
GL_TreeNode GetNode(int index, int part_index);
GL_AABB GetAABB(int index, int part_index);
GL_DirLight GetDirLight(int index);
vec3 GetStreamlineColor(int index);
vec3 GetStreamlineSeedPosition(int index);
vec4 GetScalarColor(int index, int transfer_function_index);
GL_Cylinder GetCylinder(int index);

ivec3 GetIndex3D(int global_index);

//**********************************************************
//                       modules

void RayEulerStep(inout Ray ray);
void RayRK4Step(inout Ray ray);
vec3 RayLightFunctionPos(vec3 position, vec3 direction);
vec3 RayLightFunctionDir(vec3 position, vec3 direction);

//**********************************************************

void main() {
    float i = gl_FragCoord[0];//x
	float j = gl_FragCoord[1];//y
    
	HitInformation hit;
    HitInformation hit_outside;
	vec3 color = CalculateOneRay(offset_x, offset_y, hit, hit_outside);
	//if(hit.hitType > TYPE_NONE)
	//{
  //  
	//}

	//write color to output
	outputColor = vec4(color, 1);	

	return;   

  	if (int(i) < 100)
  	{
		if(int(j) < 100)
			outputColor = getTestColor(0,0,0);	
		else if (int(j) < 200)
		{
			outputColor = vec4(GetPosition(0, 0), 1);	
		}
		else if (int(j) < 300)
		{
			bool flag = validateInteger(ivec3(8,0,0), 1);  
			outputColor = getValidationColor(flag);	 
		} 
		else if (int(j) < 400)
		{
			bool flag = validateInteger(ivec3(9,0,0), 2);  
			outputColor = getValidationColor(flag);	 

			/*
			GL_AABB aabb = GetAABB(0, false);
			bool flag1 = validateVec3(aabb.min.xyz, vec3(0,0,0));
			bool flag2 = validateVec3(aabb.max.xyz, vec3(1,1,1));

			aabb = GetAABB(1, false);
			bool flag3 = validateVec3(aabb.min.xyz, vec3(0.4,0.4,0.4));
			bool flag4 = validateVec3(aabb.max.xyz, vec3(0.6,0.6,0.7));

			aabb = GetAABB(2, false);
			bool flag5 = validateVec3(aabb.min.xyz, vec3(0.4,0.4,0.5));
			bool flag6 = validateVec3(aabb.max.xyz, vec3(0.8,0.8,0.7));

			bool flag = flag1 && flag2 && flag3 && flag4 && flag5 && flag6;
			outputColor = getValidationColor(flag);
			*/
		}
		else if (int(j) < 500)
		{
			GL_TreeNode node = GetNode(0, 0);
			bool flag1 = validateInteger(node.hitLink, 1);
			bool flag2 = validateInteger(node.missLink, 0);
			bool flag3 = validateInteger(node.objectIndex, -1);
			bool flag4 = validateInteger(node.type, 0);

			node = GetNode(1, 0);
			bool flag5 = validateInteger(node.hitLink, 2);
			bool flag6 = validateInteger(node.missLink, 2);
			bool flag7 = validateInteger(node.objectIndex, 0);
			bool flag8 = validateInteger(node.type, 1);

			node = GetNode(2, 0);
			bool flag9 = validateInteger(node.hitLink, 0);
			bool flag10 = validateInteger(node.missLink, 0);
			bool flag11 = validateInteger(node.objectIndex, 1);
			bool flag12 = validateInteger(node.type, 1);

			bool flag = flag1 && flag2 && flag3 && flag4 && flag5 && flag6 && flag7 && flag8 && flag9 && flag10 && flag11 && flag12;
			outputColor = getValidationColor(flag);	
		}
		else
		{
			/*
			GL_CameraData cam = GetActiveCamera();
			vec3 E = cam.E.xyz;
			vec3 forward = cam.forward.xyz;
			vec3 p_1m = cam.p_1m.xyz;
			vec3 q_x = cam.q_x.xyz;
			vec3 q_y = cam.q_y.xyz;

			bool flag1 = validateVec3(E, vec3(0.5, 0.01, 0.5));
			bool flag2 = validateVec3(forward, vec3(0.0, 1.0, 0.0));

			bool flag = flag1 && flag2;// && flag4;
			outputColor = getValidationColor(flag);	
			*/

			GL_DirLight light = GetDirLight(0);
			
			vec3 ambient = light.ambient.xyz;
			vec3 diffuse = light.diffuse.xyz;
			vec3 specular = light.specular.xyz;
			vec3 direction = light.direction.xyz;
			
			bool flag1 = validateVec3(ambient, vec3(0.04, 0.04, 0.04));
			bool flag2 = validateVec3(diffuse, vec3(0.6, 0.6, 0.6));
			bool flag3 = validateVec3(specular, vec3(0.3, 0.3, 0.3));
			bool flag4 = validateVec3(direction, vec3(1.0, 1.0, 1.0));
			bool flag = flag1 && flag2 && flag3 && flag4;
			outputColor = getValidationColor(flag);			  
		}	
	}
}

vec4 getTestColor(int x, int y, int z)
{
  float value_r = texelFetch(texture_float, ivec3(x+0,y,z), 0).r;
  float value_g = texelFetch(texture_float, ivec3(x+1,y,z), 0).r;
  float value_b = texelFetch(texture_float, ivec3(x+2,y,z), 0).r;
  return vec4(value_r, value_g, value_b, 1.0);
}

bool validateInteger(int value, int expected_value)
{
    return value == expected_value;
}

bool validateInteger(ivec3 index3D, int expected_value)
{
	int value = texelFetch(texture_int, index3D, 0).r;
    return value == expected_value;
}

bool validateVec3(vec3 a, vec3 b)
{
  vec3 diff = a - b;
  float sum = diff.x + diff.y + diff.z;
  return abs(sum) < 0.0001;
}

vec4 getValidationColor(bool valid)
{
    return valid ? vec4(0,1,0, 1) : vec4(1,0,0, 1);  
}

vec3 CalculateOneRay(float x_offset, float y_offset, inout HitInformation hit, inout HitInformation hit_outside)
{
    hit.was_copied_from_outside = false;
	hit.hitType = TYPE_NONE;
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

	Ray ray = GenerateRay(x_offset, y_offset);	
  
	Intersect(ray, hit, hit_outside, hitCube);//found in decision: intersection_control_definitions

    CombineHitInformation(ray, hit, hit_outside, hitCube);

	vec3 resultColor = Shade(ray, hit, hitCube, false);
	/*
	BlendTransparent(ray, hit, hitCube, resultColor);
	return resultColor;
  */
  	return resultColor;
}

Ray GenerateRay(float x_offset, float y_offset)
{	
    bool left_handed = false;//DUMMY


	GL_CameraData cam = GetActiveCamera();
	vec3 E = cam.E.xyz;
	vec3 p_1m = cam.p_1m.xyz;
	vec3 q_x = cam.q_x.xyz;
	vec3 q_y = cam.q_y.xyz;

	float i = gl_FragCoord[0];//x
	//float j = float(height) - gl_FragCoord[1];//y
	float j = gl_FragCoord[1];//y
	//if(!left_handed)
		j = float(height) - gl_FragCoord[1];//y
	vec3 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec3 r_ij = normalize(p_ij);
	
	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
    ray.local_cutoff = maxRayDistance;
	return ray;
}

//result is not 3D, uses central camera for both eyes
Ray GenerateRayWithPixelOffset(float x_offset, float y_offset)
{	
    bool left_handed = false;//DUMMY

	GL_CameraData cam = GetActiveCamera();
	vec3 E = cam.E.xyz;
	vec3 p_1m = cam.p_1m.xyz;
	vec3 q_x = cam.q_x.xyz;
	vec3 q_y = cam.q_y.xyz;

    float width_f = float(width);
    float height_f = float(height);

	float i = gl_FragCoord[0] - (x_axesPixelOffset * width_f * 0.5);//x
	//i = gl_FragCoord[0];//x
	//float j = height - gl_FragCoord[1];//y
	float j = gl_FragCoord[1] - (y_axesPixelOffset * height_f * 0.5);//y
	//j = gl_FragCoord[1];//y
	//if(!left_handed)
		j = height_f - gl_FragCoord[1] + (y_axesPixelOffset * height_f * 0.5);//y
	vec3 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec3 r_ij = normalize(p_ij);
	
	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
    ray.local_cutoff = maxRayDistance;
	return ray;
}

GL_CameraData GetActiveCamera()
{
	return active_camera;
}

vec3 RepositionIntoFundamentalDomain(vec3 position)
{
	vec3 new_position = vec3(position[0],position[1],position[2]);
	if(projection_index >= 0)
	{
		for (int i = 0; i < 3; i++) {
			if (i != projection_index) {			
				if (new_position[i] > 1.0) {
					float change = floor(abs(new_position[i]));
					new_position[i] -= change;
				}
				else if (new_position[i] < 0.0) {
					float change = ceil(abs(new_position[i]));
					new_position[i] += change;
				}			
			}
		}
	}
	return new_position;
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

void Intersect(Ray ray, inout HitInformation hit, inout HitInformation hit_outside, inout HitInformation hitCube)
{			
	Ray variableRay;
	variableRay.origin = RepositionIntoFundamentalDomain(ray.origin);
	variableRay.direction = ray.direction;
	variableRay.dir_inv = ray.dir_inv;
	variableRay.rayDistance = 0.0;
    variableRay.local_cutoff = maxRayDistance;

    Ray transitional_ray;
			
	int count = 0;
	int hitCount = 0;
    float tmp_rayDistance = 0.0;

	//IntersectAxesCorner(ray, hit, hitCube, 0);

	while(true)
	{
        tmp_rayDistance = variableRay.rayDistance;

#ifdef INTEGRATE_LIGHT
        LightIntegrationPre(variableRay);  
#endif      
		IntersectInstance(variableRay, hit, hitCube);
		//calculate exit (the point where ray leaves the current instance)
		//formula: target = origin + t * direction
		//float tar_x = (variableRay.direction.x > 0) ? 1 : 0;	
		//float tar_y = (variableRay.direction.y > 0) ? 1 : 0;
		//float tar_z = (variableRay.direction.z > 0) ? 1 : 0;
		vec3 tar = step(vec3(0,0,0), variableRay.direction);
		//float t_x = (tar_x - variableRay.origin.x) * variableRay.dir_inv.x;	
		//float t_y = (tar_y - variableRay.origin.y) * variableRay.dir_inv.y;	
		//float t_z = (tar_z - variableRay.origin.z) * variableRay.dir_inv.z;	
		vec3 t_v = (tar - variableRay.origin) * variableRay.dir_inv;	
		float t_exit = min(t_v.x, min(t_v.y, t_v.z));		
		vec3 exit = variableRay.origin + t_exit * variableRay.direction;
        float t = t_exit;
        
        //bool flag_ray_stays_inside = variableRay.segment_length < t_exit;
        //bool flag_ray_stays_inside = variableRay.local_cutoff < t_exit;
        bool flag_ray_stays_inside = false;
#ifdef INTEGRATE_LIGHT
        flag_ray_stays_inside = ! CheckOutOfBounds(variableRay.nextPosition);
#endif  
        
        if(flag_ray_stays_inside){
            //t = variableRay.segment_length;
            t = variableRay.local_cutoff;
        }

#ifdef SHOW_VOLUME_RENDERING
        bool volume_flag = hit.vol_accumulated_opacity < volume_rendering_termination_opacity
            && variableRay.rayDistance < max_volume_distance;
        if(volume_flag)
        {
            float distance_end = t;
            IntersectVolumeInstance(variableRay, distance_end, hit, hitCube);
        }
#endif

		if(hit.hitType > TYPE_NONE || hitCube.hitType > TYPE_NONE)		
			break;
		
		//update distance "traveled" using value from this instance
		variableRay.rayDistance += t;

		//stop at maxRayDistance + 1.8
		//1.8 is a bit greater than sqrt(3) which is the max distance inside unit cube
		if(variableRay.rayDistance > (maxRayDistance + 1.8))
			break;

        if(!flag_ray_stays_inside){            
            if(projection_index >= 0)
            {
                if(projection_index == 0){
                    if(exit.x < 0.001)
                        break;
                }
                else if (projection_index == 1){
                if(exit.y < 0.001)
                        break;
                }
                else if (projection_index == 2){
                if(exit.z < 0.001)
                        break;
                }
                //update ray origin for next instance	
                variableRay.origin = MoveOutOfBoundsProjection(exit);
            }	
            else{
                //update ray origin for next instance		
                //MoveRayOrigin(variableRay, exit);
#ifdef INTEGRATE_LIGHT
                //V1
                //variableRay.nextPosition = MoveOutOfBounds(exit);//problem, wrong direction because next position not matching next direction
                
                //V2
                /*
                float exit_distance = distance(variableRay.origin, exit);

                MoveOutOfBoundsFlags flags;
                variableRay.nextPosition = MoveOutOfBoundsAndGetFlags(variableRay.nextPosition, flags);//problem, exit might need other flags

                transitional_ray.origin = ApplyMoveOutOfBoundsFlags(exit, flags);
                transitional_ray.direction = variableRay.direction;
                transitional_ray.dir_inv = variableRay.dir_inv;
                transitional_ray.rayDistance = tmp_rayDistance + exit_distance;//TODO
                transitional_ray.local_cutoff = variableRay.local_cutoff - exit_distance;//TODO
                IntersectInstance(transitional_ray, hit, hitCube);
                */
                //V3

                //set next position of variable ray, next iteration will resume normally
                variableRay.nextPosition = MoveOutOfBounds(variableRay.nextPosition);
                variableRay.rayDistance = tmp_rayDistance + variableRay.local_cutoff;
                //however, for the transition we use a transitional ray
                //the transitional ray keeps the same direction as the variable ray
                //but will be moved (possibly multiple times if multiple borders are crossed)            
                transitional_ray.direction = variableRay.direction;
                transitional_ray.dir_inv = variableRay.dir_inv;
                //each iteration the local cutoff is reduced by the exit distance i.e. the distance from current position to the cube intersection
                float exit_distance = distance(variableRay.origin, exit);
                transitional_ray.local_cutoff = variableRay.local_cutoff;
                transitional_ray.rayDistance = tmp_rayDistance;
                while(transitional_ray.local_cutoff >= exit_distance && exit_distance > 0.0){
                    transitional_ray.local_cutoff -= exit_distance;
                    transitional_ray.rayDistance += exit_distance;
                    transitional_ray.origin = MoveOutOfBounds(exit);
                    IntersectInstance(transitional_ray, hit, hitCube);

                    //calculate exit (the point where ray leaves the current instance)
                    //formula: target = origin + t * direction
                    //float tar_x = (variableRay.direction.x > 0) ? 1 : 0;	
                    //float tar_y = (variableRay.direction.y > 0) ? 1 : 0;
                    //float tar_z = (variableRay.direction.z > 0) ? 1 : 0;
                    vec3 tar = step(vec3(0,0,0), transitional_ray.direction);
                    //float t_x = (tar_x - variableRay.origin.x) * variableRay.dir_inv.x;	
                    //float t_y = (tar_y - variableRay.origin.y) * variableRay.dir_inv.y;	
                    //float t_z = (tar_z - variableRay.origin.z) * variableRay.dir_inv.z;	
                    vec3 t_v = (tar - transitional_ray.origin) * transitional_ray.dir_inv;	
                    float t_exit = min(t_v.x, min(t_v.y, t_v.z));		
                    exit = transitional_ray.origin + t_exit * transitional_ray.direction;

                    exit_distance = distance(transitional_ray.origin, exit);
                }
                
                
#else
                variableRay.origin = MoveOutOfBounds(exit);
#endif   
            }
        }

#ifdef INTEGRATE_LIGHT
        LightIntegrationPost(variableRay, flag_ray_stays_inside);  
        if(count >= light_integration_max_step_count){
            break;
        }
#endif    
        
        count++;
		if(count >= maxIterationCount)
			break;
            
				
		//break;
	}	

#ifdef SHOW_STREAMLINES_OUTSIDE
    {
        bool check_bounds = false;
	    IntersectInstance_Tree(PART_INDEX_OUTSIDE, check_bounds, ray, maxRayDistance, hit_outside, hitCube);
    }
#endif

#ifdef SHOW_SEEDS_ONCE
    {
		IntersectSeeds(ray, maxRayDistance, hit_outside);
    }
#endif
}

void IntersectInstance(Ray ray, inout HitInformation hit, inout HitInformation hitCube)
{
	hitCube.hitType = TYPE_IGNORE_CUBE;
	hitCube.distance = 0.0;		
	bool doesIntersect = false;
	float nearest_t = 0.0;
	vec3 normal_face;
  /*
	if(show_transparent_cone)
	{		
		IntersectTransparentTriangle(ray, GetTriangle(0), hit);
		IntersectTransparentTriangle(ray, GetTriangle(1), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(2), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(3), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(4), hit);	
		IntersectTransparentTriangle(ray, GetTriangle(5), hit);		
	}

	if(show_pyramid_wireframe)
	{
		GL_Cylinder cylinder;
		for(int i=0; i<8; i++)
		{
			cylinder = blockCylinders[INDEX_CYLINDER_FIRST_PYRAMID + i];
			bool ignore_override = true;
			IntersectCylinder(false, cylinder, ray, maxRayDistance, hit, ignore_override);
		}

		Sphere sphere;
		sphere.radius = cylinder.radius;
		vec3 col = cylinder.color.xyz;
		for(int i=0; i<4; i++)
		{
			cylinder = blockCylinders[INDEX_CYLINDER_FIRST_PYRAMID + i];
			sphere.center = cylinder.position_b.xyz;
			
			IntersectSphereAxis(false, ray, maxRayDistance, sphere, hit, TYPE_GL_CYLINDER,
				sphere.center, col, sphere.center, col, sphere.center, col);	
		}
	}
  */
#ifdef CUT_AT_CUBE_FACES
	{
        //
		IntersectUnitCube(ray, doesIntersect, nearest_t, normal_face);
		if(doesIntersect)
		{
			hitCube.hitType = TYPE_NONE;
			hitCube.distance = nearest_t;
			hitCube.normal = normal_face;
			hitCube.position = ray.origin + nearest_t * ray.direction;		
		}
	}
#endif

#ifdef SHOW_STREAMLINES
    {
        bool check_bounds = true;
	    IntersectInstance_Tree(PART_INDEX_DEFAULT, check_bounds, ray, ray.local_cutoff+0.001, hit, hitCube);
	    //IntersectInstance_Tree(PART_INDEX_DEFAULT, check_bounds, ray, maxRayDistance, hit, hitCube);
    }
#endif
  /*
	if(show_interactive_streamline)
		IntersectInstance_Tree(true, ray, maxRayDistance, hit, hitCube);

	if(renderClickedSphere > RENDER_CLICKED_SPHERE_FALSE)
		IntersectInstance_Clicked(ray, maxRayDistance, hit, hitCube);
  */
  /*
	if(multi_show_camera && camIndexOther >= 0)
	{
		bool interactiveStreamline = false;//this does not matter here because of TYPE_CLICKED_SPHERE
		Sphere sphere;
		sphere.radius = multi_camera_radius;	
		bool copy = false;
		int multiPolyID = -1;
		
		float velocity = 0;
		float cost = 0;
		sphere.center = blockCameraData[camIndexOther].E.xyz;
		IntersectSphere(interactiveStreamline, ray, maxRayDistance, sphere, hit, copy, multiPolyID, TYPE_CLICKED_SPHERE, velocity, cost);
		//sphere.center = blockCameraData[camIndexOther+1].E.xyz;
		//IntersectSphere(interactiveStreamline, ray, sphere, hit, copy, multiPolyID, TYPE_CLICKED_SPHERE, velocity, cost);
		//sphere.center = blockCameraData[camIndexOther+2].E.xyz;
		//IntersectSphere(interactiveStreamline, ray, sphere, hit, copy, multiPolyID, TYPE_CLICKED_SPHERE, velocity, cost);
	}
*/
	
#ifdef SHOW_BOUNDING_BOX
	{
        bool check_bounds = is_main_renderer;
        //bool check_bounds = false;
        IntersectAxes(check_bounds, ray, ray.local_cutoff+0.001, hit, hitCube);
	}
#endif

#ifdef SHOW_BOUNDING_BOX_PROJECTION
    {
        bool check_bounds = true;
        IntersectProjectionFrame(check_bounds, ray, maxRayDistance, hit, hitCube);
    }
#endif

#ifdef SHOW_SEEDS_INSTANCE
    {
		IntersectSeeds(ray, maxRayDistance, hit);
    }
#endif
/*
	if(show_main_camera_axes)
	{
		//index 0 and 1 are the movable axes for main / multi renderer
		//index 2 is the main camera orientation
		//indices 3 to 10 are the axes
		IntersectAxesCornerAABB(false, ray, maxRayDistance, hit, hitCube, 2);
	}	
  */
}

void IntersectInstance_Tree(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{		
	bool copy = false;
	int multiPolyID = 0;
	int type = TYPE_STREAMLINE_SEGMENT;
	float velocity = 0.0;
	float cost = 0.0;

	Sphere sphere;
	sphere.radius = 0.1;

	int nodeIndex = 0;
	int iteration_counter = -1;
	while(true)
	{		
		iteration_counter++;	
		//if (iteration_counter > 1000)			
		//	break;//TODO

		GL_TreeNode glNode = GetNode(nodeIndex, part_index);
		GL_AABB glAABB = GetAABB(nodeIndex, part_index);
		float tmin;
		float tmax;
		bool hitAABB = IntersectGLAABB(glAABB, ray, ray_local_cutoff, tmin, tmax);
		//hitAABB = true;
		if(hitAABB)
		{
			nodeIndex = glNode.hitLink;
			if(hitCube.hitType != TYPE_IGNORE_CUBE)
			{
				//ray intersects cube --> check if cube hit is inside this object
				if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
				{
					HandleOutOfBound_LineSegment(part_index, ray, glNode.objectIndex, hitCube);//possible problem here					
				}
			}     

            if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
			{
#ifdef HANDLE_INSIDE
                {
                    HandleInside_LineSegment(part_index, ray, glNode.objectIndex, hit);
                }
#endif
                IntersectLineSegment(part_index, check_bounds, ray, ray_local_cutoff, glNode, hit);	          						
			}
      				
		}
		else
		{
			nodeIndex = glNode.missLink;
		}
		if(nodeIndex <= 0)//end if next node is root
			break;
	}
}

bool CheckOutOfBounds(vec3 position)
{
	//if(!check_bounds)
	//	return false;
	//float error = 0.0001;
	//return true;
	for(int i=0; i<3; i++)
	{
		if(position[i] > 1.0 + epsilon_out_of_bounds)
			return true;
		if(position[i] < 0.0 - epsilon_out_of_bounds)
			return true;
	}	
	return false;
}

vec3 MoveOutOfBounds(vec3 position)
{
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;
	
	if(x > 1.0-epsilon_move_ray)
	{
		x = x-1.0;
		y = y;
		z = z;
	}
	else if(x < 0.0+epsilon_move_ray)
	{
		x = x+1.0;
		y = y;
		z = z;
	}

	if(y > 1.0-epsilon_move_ray)
	{
		x = x;
		y = y-1.0;
		z = z;
	}
	else if(y < 0.0+epsilon_move_ray)
	{
		x = x;
		y = y+1.0;
		z = z;
	}

	if(z > 1.0-epsilon_move_ray)
	{
		x = x;
		y = y;
		z = z-1.0;
	}
	else if(z < 0.0+epsilon_move_ray)
	{
		x = x;
		y = y;
		z = z+1.0;
	}

	return vec3(x,y,z);
}

vec3 MoveOutOfBoundsAndGetFlags(vec3 position, inout MoveOutOfBoundsFlags flags)
{
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;

    flags.x_greater = false;
    flags.x_smaller = false;
    flags.y_greater = false;
    flags.y_smaller = false;
    flags.z_greater = false;
    flags.z_smaller = false;
	
	if(x > 1.0-epsilon_move_ray)
	{
		x = x-1.0;
		y = y;
		z = z;
        flags.x_greater = true;
	}
	else if(x < 0.0+epsilon_move_ray)
	{
		x = x+1.0;
		y = y;
		z = z;
        flags.x_smaller = true;
	}

	if(y > 1.0-epsilon_move_ray)
	{
		x = x;
		y = y-1.0;
		z = z;
        flags.y_greater = true;
	}
	else if(y < 0.0+epsilon_move_ray)
	{
		x = x;
		y = y+1.0;
		z = z;
        flags.y_smaller = true;
	}

	if(z > 1.0-epsilon_move_ray)
	{
		x = x;
		y = y;
		z = z-1.0;
        flags.z_greater = true;
	}
	else if(z < 0.0+epsilon_move_ray)
	{
		x = x;
		y = y;
		z = z+1.0;
        flags.z_smaller = true;
	}

	return vec3(x,y,z);
}

vec3 ApplyMoveOutOfBoundsFlags(vec3 position, MoveOutOfBoundsFlags flags)
{
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;
	
	if(flags.x_greater)
	{
		x = x-1.0;
		y = y;
		z = z;
	}
	else if(flags.x_smaller)
	{
		x = x+1.0;
		y = y;
		z = z;
	}

	if(flags.y_greater)
	{
		x = x;
		y = y-1.0;
		z = z;
	}
	else if(flags.y_smaller)
	{
		x = x;
		y = y+1.0;
		z = z;
	}

	if(flags.z_greater)
	{
		x = x;
		y = y;
		z = z-1.0;
	}
	else if(flags.z_smaller)
	{
		x = x;
		y = y;
		z = z+1.0;
	}

	return vec3(x,y,z);
}

vec3 MoveOutOfBoundsProjection(vec3 position)
{
	//user friendly variables
	float x = position.x;
	float y = position.y;
	float z = position.z;
	//additional "constant" variables for this calculation
	float x0 = x;
	float y0 = y;
	float z0 = z;

    if(projection_index != 0){
        if(x > 1.0-epsilon_move_ray)
        {
            x = x-1.0;
            y = y;
            z = z;
        }
        else if(x < 0.0+epsilon_move_ray)
        {
            x = x+1.0;
            y = y;
            z = z;
        }
    }	

    if(projection_index != 1){
        if(y > 1.0-epsilon_move_ray)
        {
            x = x;
            y = y-1.0;
            z = z;
        }
        else if(y < 0.0+epsilon_move_ray)
        {
            x = x;
            y = y+1.0;
            z = z;
        }
    }

    if(projection_index != 2){
        if(z > 1.0-epsilon_move_ray)
        {
            x = x;
            y = y;
            z = z-1.0;
        }
        else if(z < 0.0+epsilon_move_ray)
        {
            x = x;
            y = y;
            z = z+1.0;
        }
    }
	return vec3(x,y,z);
}

bool IntersectGLAABB(GL_AABB b, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax) {
    float t1 = (b.min[0] - r.origin[0])*r.dir_inv[0];
    float t2 = (b.max[0] - r.origin[0])*r.dir_inv[0];	
    tmin = min(t1, t2);
    tmax = max(t1, t2);
 
    for (int i = 1; i < 3; ++i) {
        t1 = (b.min[i] - r.origin[i])*r.dir_inv[i];
        t2 = (b.max[i] - r.origin[i])*r.dir_inv[i]; 
        tmin = max(tmin, min(t1, t2));
        tmax = min(tmax, max(t1, t2));
    }
	
	bool segment_outside = tmax < 0.0 || tmin > ray_local_cutoff;
    return tmax > max(tmin, 0.0) && !segment_outside;
}

bool IntersectGLAABB(GL_Cylinder cylinder, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax) {    
	GL_AABB aabb;
	float radius = cylinder.radius;
	aabb.min = min(cylinder.position_a, cylinder.position_b) + vec4(-radius, -radius, -radius, 0);
	aabb.max = max(cylinder.position_a, cylinder.position_b) + vec4(radius, radius, radius, 0);
    return IntersectGLAABB(aabb, r, ray_local_cutoff, tmin, tmax);
}

bool IntersectGLAABB(Sphere sphere, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax) {    
	GL_AABB aabb;
	float radius = sphere.radius;
	vec4 position = vec4(sphere.center, 0);
	aabb.min = position + vec4(-radius, -radius, -radius, 0);
	aabb.max = position + vec4(radius, radius, radius, 0);
    return IntersectGLAABB(aabb, r, ray_local_cutoff, tmin, tmax);
}

void IntersectLineSegment(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit)
{ 
    float tube_radius = GetTubeRadius(part_index);
	/*
	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, interactiveStreamline);
	bool copy = false; 
	int multiPolyID = 0; 
	float v_b = 1.0; 
	float cost_b_value = 0.0;

	vec3 a = GetPosition(lineSegment.indexA, interactiveStreamline);

	Sphere sphere;
	sphere.radius = tube_radius;
	sphere.center = a;
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);

	*/


	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index);
	int multiPolyID = lineSegment.multiPolyID;
	bool copy = (lineSegment.copy==1);
	if(ignore_copy && copy)
		return;
	vec3 a = GetPosition(lineSegment.indexA, part_index);
	vec3 b = GetPosition(lineSegment.indexB, part_index);
	float cost_a = GetCost(lineSegment.indexA, part_index);
	float cost_b = GetCost(lineSegment.indexB, part_index);
	float cost_cutoff = max_streamline_cost;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_a > cost_cutoff)
				return;
		}
		
	}

	//OABB TEST
	float h = distance(a,b);
	mat4 matrix = lineSegment.matrix;
	Ray ray_os;//Object Space of Cylinder
	ray_os.origin = (matrix * vec4(ray.origin, 1)).xyz;
	ray_os.direction = (matrix * vec4(ray.origin+ray.direction, 1)).xyz - ray_os.origin;
	ray_os.dir_inv = 1.0/ray_os.direction;
	GL_AABB glAABB_os;
	glAABB_os.min = vec4(-tube_radius, -tube_radius, -tube_radius, 0);
	glAABB_os.max = vec4(tube_radius, tube_radius, h+tube_radius, 0);
	float tmin;
	float tmax;
	bool hitAABB = IntersectGLAABB(glAABB_os, ray_os, ray_local_cutoff, tmin, tmax);
	if(!hitAABB)
	{
		//return;
	}
	float v_a = GetVelocity(lineSegment.indexA, part_index);
	float v_b = GetVelocity(lineSegment.indexB, part_index);
	
	//CYLINDER AND SPHERE TEST
	bool ignore_override = false;
	IntersectCylinder(part_index, check_bounds, ray, ray_local_cutoff, glNode.objectIndex, hit, ignore_override);	
	Sphere sphere;
	sphere.radius = tube_radius;
	//SPHERE A
	if(lineSegment.isBeginning == 1 || copy)
	{
		sphere.center = a;
		IntersectSphere(part_index, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_a, cost_a);
	}
	//SPHERE B
	sphere.center = b;
	float cost_b_value = cost_b;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_b > cost_cutoff)
			{
				float t = ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);
				sphere.center = mix(a, b, t);//ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);		
				cost_b_value = cost_cutoff;
				//sphere.radius = tube_radius * 1.1;		
			}
		}
	}
	IntersectSphere(part_index, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);	
	
	/**/
}

void IntersectCylinder(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override)
{
    float tube_radius = GetTubeRadius(part_index);

	float r = tube_radius;// / 2.0;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index);
	vec3 a = GetPosition(lineSegment.indexA, part_index);
	vec3 b = GetPosition(lineSegment.indexB, part_index);

	
	mat4 matrix = lineSegment.matrix;
	mat4 matrix_inv = lineSegment.matrix_inv;
	
	//vec3 a_os = (matrix * vec4(a, 1)).xyz;
	//vec3 b_os = (matrix * vec4(b, 1)).xyz;
		
	Ray ray_os;//Object Space of Cylinder
	ray_os.origin = (matrix * vec4(ray.origin, 1)).xyz;
	//ray_os.direction = (matrix_inv * vec4(ray.direction, 1)).xyz;
	ray_os.direction = (matrix * vec4(ray.origin+ray.direction, 1)).xyz - ray_os.origin;
	//ray_os.direction = normalize(ray_os.direction);
		
	//calculate discriminant in object space
	float x_1 = ray_os.origin.x;
	float x_2 = (ray_os.origin + ray_os.direction).x;
	float y_1 = ray_os.origin.y;
	float y_2 = (ray_os.origin + ray_os.direction).y;
	float d_x =  x_2 - x_1;
	float d_y =  y_2 - y_1;
	//float d_r = sqrt(d_x*d_x + d_y*d_y);
	//float d_r_squared = d_r * d_r;
    float d_r_squared = d_x*d_x + d_y*d_y;
	float D = x_1 * y_2 - x_2 * y_1;
	float discriminant = r*r * d_r_squared - D*D;
	if(discriminant < 0.0)
		return;

	

	float d_r_squared_inv = 1.0/d_r_squared;
	//calculate intersection points in object space	
	float root = sqrt(discriminant);
	float x_L = D * d_y;
	float x_R = sign(d_y)*d_x*root;
	//float y_L = -D * d_x;							//NOT NECESSARY
	//float y_R = abs(d_y)*root;					//NOT NECESSARY
	float p_x_1 = (x_L + x_R)/(d_r_squared);		
	float p_x_2 = (x_L - x_R)/(d_r_squared);		
	//vec2 p_x = vec2((x_L + x_R), (x_L - x_R)) * d_r_squared_inv;
	//float p_y_1 = (y_L + y_R)/(d_r_squared);		//NOT NECESSARY
	//float p_y_2 = (y_L - y_R)/(d_r_squared);		//NOT NECESSARY
	//vec2 p_1 = vec2(p_x_1, p_y_1);				//NOT NECESSARY
	//vec2 p_2 = vec2(p_x_2, p_y_2);				//NOT NECESSARY
	
	//calculate t in object space 
	//equation: ray_os.origin.x + t * ray_os.direction.x = p_x_1
	float t_1 = (p_x_1 - ray_os.origin.x) / ray_os.direction.x;
	float t_2 = (p_x_2 - ray_os.origin.x) / ray_os.direction.x;
	//float t_1 = (p_x[0] - ray_os.origin.x) / ray_os.direction.x;
	//float t_2 = (p_x[1] - ray_os.origin.x) / ray_os.direction.x;
	float t = 0.0;
	bool bothInFront = false;
	if(t_1 < 0.0)
	{		
		//t_1 is behind the camera
		if(t_2 < 0.0)//both intersection points are behind the camera						
			return;
		//t_2 is in front of camera  
		t = t_2;
	}
	else
	{
		if(t_2 < 0.0)//t_1 is in front of camera  
			t = t_1;
		else//both intersection points are in front of the camera	
		{
			t = min(t_1, t_2);
			bothInFront = true;
		}
	}
	
	//calculate intersection point p in object space
	//vec3 a_os = (matrix * vec4(a, 1)).xyz;		//NOT NECESSARY
	//vec3 b_os = (matrix * vec4(b, 1)).xyz;		//NOT NECESSARY
	//float z_min = a_os.z;
	//float z_max = b_os.z;
	vec3 p_os = ray_os.origin + t * ray_os.direction;
	float z_os = p_os.z;
	float h = distance(a,b);
	
	/*
	if(z_os > h || z_os < 0.0)
	{
		if(!bothInFront)
			return;
		return;
		//We also need to check the other t if we are not rendering caps		
		t = max(t_1, t_2);
		p_os = ray_os.origin + t * ray_os.direction;
		z_os = p_os.z;
		if(z_os > h || z_os < 0.0)
			return;
	}
	*/
	if(z_os > h || z_os < 0.0)
	{
		return;
	}
	
	float distance_os = distance(ray_os.origin, p_os);				
	float distance = ray.rayDistance + distance_os;
			
	bool copy = (lineSegment.copy == 1);
	
	vec3 position_os = ray.origin + distance_os * ray.direction;	
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_os);	
		if(outOfBounds)	
			return;	
	}	
	
	int multiPolyID = lineSegment.multiPolyID;

	float cost_a = GetCost(lineSegment.indexA, part_index);
	float cost_b = GetCost(lineSegment.indexB, part_index);
	float local_percentage = z_os / h;
	float cost = mix(cost_a, cost_b, local_percentage);
	
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}
	

	if(distance_os > ray_local_cutoff)
		return;

    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance < hit.distance);
    if(projection_index >= 0)
    {
        hit_condition = false;
        if(hit.hitType==TYPE_NONE)
            hit_condition = true;
        else if(hit.hitType==TYPE_STREAMLINE_SEGMENT)
        {
            if(multiPolyID < hit.multiPolyID)
                hit_condition = true;
            else if(multiPolyID == hit.multiPolyID)
                hit_condition = distance < hit.distance;
        }
    }
	
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if(hit_condition)
	{		
        bool interactiveStreamline = part_index == 2 || part_index == 3;
		//calculate intersection point in world space
		//vec3 p = (matrix_inv * vec4(p_os, 1)).xyz;
		//calculate tube center in world space (for normal calculation)
		vec3 tube_center = (matrix_inv * vec4(0,0, z_os, 1)).xyz;
		//vec3 tube_center = mix(a, b, local_percentage);//alternative
		float v_a = GetVelocity(lineSegment.indexA, part_index);
		float v_b = GetVelocity(lineSegment.indexB, part_index);		
		hit.hitType = TYPE_STREAMLINE_SEGMENT;
		hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;	
		hit.position = position_os;	
		hit.positionCenter = tube_center;
		hit.normal = normalize(hit.position - tube_center);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = mix(v_a, v_b, local_percentage);
		hit.cost = cost;
		hit.ignore_override = ignore_override;
	}
}

void IntersectSphere(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, int type, float velocity, float cost)
{
	vec3 z = ray.origin - sphere.center;//e-c
	float a = dot(ray.direction, ray.direction);//unnecessary
	float b = 2.0 * dot(ray.direction, z);
	float c = dot(z, z) - sphere.radius * sphere.radius;

	float discriminant = b*b - 4.0 * a *c;
	if (discriminant < 0.0)
		return;
		
	float root = sqrt(discriminant);
	float t1 = (-b + root) * 0.5f;
	float t2 = (-b - root) * 0.5f;
	//float distance = min(t1, t2);
	//float distance = (-b - root) / (2.0f * a);
	float distance_os = 0.0;
		


	if(t1 < 0.0)
	{
		if(t2 < 0.0)
			return;
		distance_os = t2;
	}
	else if (t2 < 0.0)
		distance_os = t1;
	else
		distance_os = min(t1, t2);


	
	float distance_surface = ray.rayDistance + distance_os;
		
	vec3 position_os = ray.origin + distance_os * ray.direction;//intersection point in world space

	/*
	bool doOutOfBoundsCheck = false;
	if(allowOutOfBoundSphere == 0)	
		doOutOfBoundsCheck = true;	
	else if(type != TYPE_CLICKED_SPHERE)	
		doOutOfBoundsCheck = true;	

	if(doOutOfBoundsCheck)
	{
		bool outOfBounds = CheckOutOfBounds(position_os);	
		if(outOfBounds)	
			return;
	}
	else
	{
		bool outOfBounds = CheckOutOfBounds(sphere.center);	
		if(outOfBounds)	
			return;
	}
    */
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_os);	
		if(outOfBounds)	
			return;	
	}	


	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}
	}
	
		
	if(distance_os > ray_local_cutoff)
		return;
		
    bool hit_condition = (hit.hitType==TYPE_NONE) || (distance_surface < hit.distance);
    if(projection_index >= 0)
    {
        hit_condition = false;
        if(hit.hitType==TYPE_NONE)
            hit_condition = true;
        else if(hit.hitType==TYPE_STREAMLINE_SEGMENT)
        {
            if(multiPolyID < hit.multiPolyID)
                hit_condition = true;
            else if(multiPolyID == hit.multiPolyID)
                hit_condition = distance_surface < hit.distance;
        }
    }
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if(hit_condition)
	{		
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hit.hitType = type;
		hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;
		hit.position = ray.origin + distance_os * ray.direction;
		hit.positionCenter = sphere.center;
		hit.normal = normalize(hit.position - sphere.center);
		//hit.normal = normalize(sphere.center - hit.position);
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = velocity;
		hit.cost = cost;
		
	}
}

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
                hit.position = hit_outside.position;
                hit.positionCenter = hit_outside.positionCenter;
                hit.normal = hit_outside.normal;
                hit.distance = hit_outside.distance;
                hit.multiPolyID = hit_outside.multiPolyID;
                hit.velocity = hit_outside.velocity;
                hit.cost = hit_outside.cost;
                hit.debug_value = 1;//red
            }
            else if(hit_outside.distance < hit.distance){
                hit.was_copied_from_outside = true;
                hit.hitType = hit_outside.hitType;
                hit.position = hit_outside.position;
                hit.positionCenter = hit_outside.positionCenter;
                hit.normal = hit_outside.normal;
                hit.distance = hit_outside.distance;
                hit.multiPolyID = hit_outside.multiPolyID;
                hit.velocity = hit_outside.velocity;
                hit.cost = hit_outside.cost;
                hit.debug_value = 2;//green
            }
            else{
                hit.debug_value = 3;//blue
            }
        }
        else{            
            hit.debug_value = 4;//yellow
        }
    }
    else{
        //if we hit something outside, prioretize the outside hit
        if(hit_outside.hitType>TYPE_NONE){
            hit.was_copied_from_outside = true;
            hit.hitType = hit_outside.hitType;
            hit.position = hit_outside.position;
            hit.positionCenter = hit_outside.positionCenter;
            hit.normal = hit_outside.normal;
            hit.distance = hit_outside.distance;
            hit.multiPolyID = hit_outside.multiPolyID;
            hit.velocity = hit_outside.velocity;
            hit.cost = hit_outside.cost;
        }
    }
}

vec3 Shade(Ray ray, inout HitInformation hit, inout HitInformation hitCube, bool ignore_override)
{			
	ignore_override = ignore_override || hit.ignore_override;
	vec3 resultColor = vec3(0,0,0);
    vec3 surface_color = vec3(0,0,0);
    if(hitCube.hitType>TYPE_NONE)
	{
		//gl_FragColor = vec4(0, 0, 0, 1);
		//return;
		bool transfer = true;
		if(hit.hitType == TYPE_CLICKED_SPHERE)
		{
			bool outOfBounds = CheckOutOfBounds(hit.position);			
			if(outOfBounds)
				transfer = false;
		}
		else if(hit.hitType == TYPE_GL_CYLINDER)
		{
			if(hit.distance < hitCube.distance)
				transfer = false;
		}
        if(hit.was_copied_from_outside){
            if(hit.distance < hitCube.distance)
				transfer = false;
        }
        
        //transfer = false;
		if(transfer)
		{
			hit.hitType = hitCube.hitType;
			hit.position = hitCube.position;
			hit.positionCenter = hitCube.positionCenter;
			hit.normal = hitCube.normal;
			hit.distance = hitCube.distance;
			hit.multiPolyID = hitCube.multiPolyID;
			hit.velocity = hitCube.velocity;
			hit.cost = hitCube.cost;
		}
        
	}

	if(hit.hitType>TYPE_NONE && hit.distance < maxRayDistance)
	{	
		//hit found
		vec3 lightColor = vec3(0, 0, 0);
		vec3 viewDir = -ray.direction;
		vec3 normal = hit.normal;	
		vec3 normalMapped = map(hit.normal, vec3(-1,-1,-1), vec3(1,1,1), vec3(0,0,0), vec3(1,1,1));	
		vec3 normalAbs = abs(hit.normal);	
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

    //blend volume with surface
    resultColor = mix(surface_color, hit.vol_accumulated_color, hit.vol_accumulated_opacity);
/*
    if(hit.debug_value == 1){
        resultColor = vec3(1, 0, 0);
    }
    if(hit.debug_value == 2){
        resultColor = vec3(0, 1, 0);
    }
    if(hit.debug_value == 3){
        resultColor = vec3(0, 0, 1);
    }
    if(hit.debug_value == 4){
        resultColor = vec3(1, 1, 0);
    }
    */
    
	//return hitCube.hitType>TYPE_NONE ? surface_color : resultColor;
	return resultColor;
}

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

float GetScalar(vec3 position){
    float x = position.x;
	float y = position.y;
	float z = position.z;
    return shader_formula_scalar;
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

vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void IntersectUnitCube(Ray ray, inout bool doesIntersect, inout float nearest_t, inout vec3 out_normal)
{	
	GL_CameraData cam = GetActiveCamera();
	vec3 E = cam.E.xyz;
	float error = 0.0;//0.0001;
	//return;
	vec3 normal;
	float planeDistance;
	doesIntersect = false;
	nearest_t = 100000.0;
	//return;
	if (E.x > 1.0)
	{
		normal = vec3(1, 0, 0);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	if (E.x < 0.0)
	{
		normal = vec3(-1, 0, 0);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	
	if (E.y > 1.0)
	{
		normal = vec3(0, 1, 0);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	if (E.y < 0.0)
	{
		normal = vec3(0, -1, 0);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	
	if (E.z > 1.0)
	{
		normal = vec3(0, 0, 1);
		planeDistance = 1.0 + error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
	if (E.z < 0.0)
	{
		normal = vec3(0, 0, -1);
		planeDistance = 0.0 - error;
		IntersectUnitCubeFace(ray, normal, planeDistance, doesIntersect, nearest_t, out_normal);
	}
}

void IntersectUnitCubeFace(Ray ray, vec3 planeNormal, float planeDistance, inout bool doesIntersect, inout float nearest_t, inout vec3 out_normal)
{
	float d_n = dot(ray.direction, planeNormal);
	if(d_n == 0.0)
		return;
	float t = (planeDistance - dot(ray.origin, planeNormal)) / d_n;
	if(t < 0.0)
		return;
	
	//return;
	float distance_os = t;
	float distance = ray.rayDistance + distance_os;
	vec3 position_os = ray.origin + distance_os * ray.direction;
	
	
	for(int i=0; i<3; i++)
	{
		if(planeNormal[i] == 0.0)
		{
			if(position_os[i] < 0.0 || position_os[i] > 1.0)
				return;
		}
	}
	
	if((!doesIntersect) || (t < nearest_t))
	{
		nearest_t = t;
		out_normal = planeNormal;
	}
	doesIntersect = true;
}

void HandleOutOfBound_LineSegment(int part_index, Ray ray, int lineSegmentID, inout HitInformation hitCube)
{	
    float tube_radius = GetTubeRadius(part_index);

	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index);
	bool copy = (lineSegment.copy == 1);
	int multiPolyID = lineSegment.multiPolyID;
	if(ignore_copy && copy)
		return;

	float cost_a = GetCost(lineSegment.indexA, part_index);
	float cost_b = GetCost(lineSegment.indexB, part_index);
	float cost_cutoff = max_streamline_cost;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_a > cost_cutoff)
				return;
		}
	}
		
	mat4 matrix = lineSegment.matrix;
	vec3 a = GetPosition(lineSegment.indexA, part_index);
	vec3 b = GetPosition(lineSegment.indexB, part_index);
	float h = distance(a,b);
	HandleOutOfBound_Cylinder(part_index, matrix, h, hitCube, copy, multiPolyID, cost_a, cost_b);
		
	Sphere sphere;
	sphere.radius = tube_radius;	
	sphere.center = a;
	HandleOutOfBound_Sphere(part_index, sphere, hitCube, copy, multiPolyID);

	//sphere.center = b;
	//HandleOutOfBound_Sphere(interactiveStreamline, sphere, hitCube, copy, multiPolyID);	

	sphere.center = b;
	float cost_b_value = cost_b;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_b > cost_cutoff)
			{
				float t = ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);
				sphere.center = mix(a, b, t);//ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);		
				cost_b_value = cost_cutoff;
				//sphere.radius = tube_radius * 1.1;		
			}
		}
	}
	HandleOutOfBound_Sphere(part_index, sphere, hitCube, copy, multiPolyID);	
	//IntersectSphere(interactiveStreamline, ray, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);	
}

void HandleOutOfBound_Cylinder(int part_index, mat4 matrix, float h, inout HitInformation hitCube, bool copy, int multiPolyID, float cost_a, float cost_b)
{	
    float tube_radius = GetTubeRadius(part_index);
	
	vec3 position_face_os = (matrix * vec4(hitCube.position, 1)).xyz;
	float f_z = position_face_os.z;
	float f_x_2 = position_face_os.x * position_face_os.x; 
	float f_y_2 = position_face_os.y * position_face_os.y; 
	if(f_z > h || f_z < 0.0)
		return;
		
	float distanceToCenter = sqrt(f_x_2 + f_y_2);
	if(distanceToCenter > tube_radius)
		return;	

	float local_percentage = f_z / h;
	float cost = mix(cost_a, cost_b, local_percentage);
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}	
	}

	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hitCube.hitType==TYPE_NONE) || (distanceToCenter < hitCube.distanceToCenter))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hitCube.hitType = TYPE_STREAMLINE_SEGMENT;
		hitCube.copy = copy;
		hitCube.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hitCube.distanceToCenter = distanceToCenter;
		hitCube.positionCenter = vec3(-1, -1, -1);
	}		
}

void HandleOutOfBound_Sphere(int part_index, Sphere sphere, inout HitInformation hitCube, bool copy, int multiPolyID)
{	

	float distanceToCenter = distance(hitCube.position, sphere.center);
	if(distanceToCenter > sphere.radius)
		return;
		
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hitCube.hitType==TYPE_NONE) || (distanceToCenter < hitCube.distanceToCenter))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hitCube.hitType = TYPE_STREAMLINE_SEGMENT;
		hitCube.copy = copy;
		hitCube.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hitCube.distanceToCenter = distanceToCenter;
		hitCube.positionCenter = vec3(-1, -1, -1);
	}	
}

void HandleInside_LineSegment(int part_index, Ray ray, int lineSegmentID, inout HitInformation hit)
{	
    float tube_radius = GetTubeRadius(part_index);

	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, part_index);
	bool copy = (lineSegment.copy == 1);
	int multiPolyID = lineSegment.multiPolyID;
	if(ignore_copy && copy)
		return;

	float cost_a = GetCost(lineSegment.indexA, part_index);
	float cost_b = GetCost(lineSegment.indexB, part_index);
	float cost_cutoff = max_streamline_cost;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_a > cost_cutoff)
				return;
		}
	}
		
	mat4 matrix = lineSegment.matrix;
	mat4 matrix_inv = lineSegment.matrix_inv;
	vec3 a = GetPosition(lineSegment.indexA, part_index);
	vec3 b = GetPosition(lineSegment.indexB, part_index);
	float h = distance(a,b);
	HandleInside_Cylinder(part_index, matrix, matrix_inv, h, hit, copy, multiPolyID, cost_a, cost_b, ray.origin, ray);
		
	Sphere sphere;
	sphere.radius = tube_radius;	
	sphere.center = a;
	HandleInside_Sphere(part_index, sphere, hit, copy, multiPolyID, ray.origin, ray);

	sphere.center = b;
	float cost_b_value = cost_b;
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost_b > cost_cutoff)
			{
				float t = ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);
				sphere.center = mix(a, b, t);//ExtractLinearPercentage(cost_a, cost_b, cost_cutoff);		
				cost_b_value = cost_cutoff;
				//sphere.radius = tube_radius * 1.1;		
			}
		}
	}
	HandleInside_Sphere(part_index, sphere, hit, copy, multiPolyID, ray.origin, ray);	
}

void HandleInside_Cylinder(int part_index, mat4 matrix, mat4 matrix_inv, float h, inout HitInformation hit, bool copy, int multiPolyID, float cost_a, float cost_b, vec3 position, Ray ray)
{	
    float tube_radius = GetTubeRadius(part_index);
	
	vec3 position_face_os = (matrix * vec4(position, 1)).xyz;
	float f_z = position_face_os.z;
	float f_x_2 = position_face_os.x * position_face_os.x; 
	float f_y_2 = position_face_os.y * position_face_os.y; 
	if(f_z > h || f_z < 0.0)
		return;
		
	float distanceToCenter = sqrt(f_x_2 + f_y_2);
	if(distanceToCenter > tube_radius)
		return;	

	float local_percentage = f_z / h;
	float cost = mix(cost_a, cost_b, local_percentage);
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > max_streamline_cost)
				return;
		}	
	}

	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distanceToCenter < hit.distanceToCenter)|| (ray.rayDistance < hit.distance))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		vec3 tube_center = (matrix_inv * vec4(0,0, f_z, 1)).xyz;

		hit.hitType = TYPE_STREAMLINE_SEGMENT;
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.distanceToCenter = distanceToCenter;
		hit.positionCenter = vec3(-1, -1, -1);
		hit.position = position;
		hit.normal = normalize(position - tube_center);//vec3(1, 0, 0);
		hit.distance = ray.rayDistance;	
        hit.distance_iteration = 0.0;
		hit.ignore_override = false;
		//hit.hitType = TYPE_GL_CYLINDER;//change
		//hit.objectColor = vec3(1, 1, 0);
	}		
}

void HandleInside_Sphere(int part_index, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, vec3 position, Ray ray)
{	

	float distanceToCenter = distance(position, sphere.center);
	if(distanceToCenter > sphere.radius)
		return;
		
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distanceToCenter < hit.distanceToCenter) || (ray.rayDistance < hit.distance))
	{
        bool interactiveStreamline = part_index == 2 || part_index == 3;

		hit.hitType = TYPE_STREAMLINE_SEGMENT;
		hit.copy = copy;
		hit.multiPolyID = interactiveStreamline ? -1 : multiPolyID;
		hit.distanceToCenter = distanceToCenter;
		hit.positionCenter = vec3(-1, -1, -1);
		hit.position = position;
		hit.normal = normalize(position - sphere.center);//vec3(1, 0, 0);
		hit.distance = ray.rayDistance;
        hit.distance_iteration = 0.0;
		//hit.hitType = TYPE_GL_CYLINDER;//change
		//hit.objectColor = vec3(1, 1, 0);
	}	
}

void IntersectProjectionFrame(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{
    for(int i=0; i<4; i++){
        float tmin;
        float tmax;
        bool ignore_override = true;
        GL_Cylinder cylinder = GetCylinder(INDEX_CYLINDER_FIRST_PROJECTION_FRAME+i+4*projection_index);

        Sphere sphere;
        sphere.radius = cylinder.radius;

        vec3 pos_a = cylinder.position_a.xyz;
        vec3 pos_b = cylinder.position_b.xyz;
        vec3 col = cylinder.color.xyz;

        bool hitAABB = IntersectGLAABB(cylinder, ray, ray_local_cutoff, tmin, tmax);
        if(hitAABB)
        {
            IntersectCylinder(check_bounds, cylinder, ray, ray_local_cutoff, hit, ignore_override);
            
            sphere.center = pos_a;
            IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b, col, pos_b, col, pos_b, col);
        
            //sphere.center = pos_b;
            //IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b, col, pos_b, col, pos_b, col);
        }
    }
}


void IntersectSeeds(Ray ray, float maxRayDistance, inout HitInformation hit){
	bool check_bounds = false;
	float ray_local_cutoff = maxRayDistance;
	bool copy = false;
	int type = TYPE_SEED; 
	float velocity = 0.0;
	float cost = 0.0;

	float tube_radius = GetTubeRadius(PART_INDEX_OUTSIDE);

	Sphere sphere;
	sphere.radius = tube_radius * 1.5;

	for (int i=0; i<num_visual_seeds; i++){
		sphere.center = GetStreamlineSeedPosition(i);	
		int multiPolyID = i; 

		float tmin;
		float tmax;
		bool hitAABB = IntersectGLAABB(sphere, ray, maxRayDistance, tmin, tmax);
		if(hitAABB)
		{
			IntersectSphere(PART_INDEX_OUTSIDE, check_bounds, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
		}		
	}	
}

void IntersectMovableAxes(Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube){
    bool check_bounds = false;
    int corner_index = is_main_renderer ? 0 : 11;
    IntersectAxesCornerAABB(check_bounds, ray, ray_local_cutoff, hit, hitCube, corner_index);
}

void IntersectAxes(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{
	//index 0 and 1 are the movable axes for main / multi renderer
	//index 2 is the main camera orientation
	//indices 3 to 10 are the axes
	//index 11 is the fat origin axes

    //index 0 is the movable axes
    //index 1 is the other camera orientation
    //indices 2 to 9 are the axes
	//index 10 is the fat origin axes
	int additional_index = show_origin_axes ? 1 : 0;
    int offset = is_main_renderer ? 0 : 11;
	for(int i=offset+2; i<offset+10+additional_index; i++)
		IntersectAxesCornerAABB(check_bounds, ray, ray_local_cutoff, hit, hitCube, i);

}

//improved version of IntersectAxesCorner. constructs AABB on the fly
void IntersectAxesCornerAABB(bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube, int corner_index)
{ 	
	float tmin;
	float tmax;
	bool hitAABB;
	bool hitAnyAABB = false;

	bool ignore_override = true;
    GL_Cylinder cylinder_1 = GetCylinder(corner_index * 3);
    GL_Cylinder cylinder_2 = GetCylinder(corner_index * 3 + 1);
    GL_Cylinder cylinder_3 = GetCylinder(corner_index * 3 + 2);
	vec3 pos_a = cylinder_1.position_a.xyz;
	vec3 pos_b_1 = cylinder_1.position_b.xyz;
	vec3 pos_b_2 = cylinder_2.position_b.xyz;
	vec3 pos_b_3 = cylinder_3.position_b.xyz;
	vec3 col_1 = cylinder_1.color.xyz;
	vec3 col_2 = cylinder_2.color.xyz;
	vec3 col_3 = cylinder_3.color.xyz;

	Sphere sphere;
	sphere.radius = cylinder_1.radius;

	hitAABB = IntersectGLAABB(cylinder_1, ray, ray_local_cutoff, tmin, tmax);
	if(hitAABB)
	{
		IntersectCylinder(check_bounds, cylinder_1, ray, ray_local_cutoff, hit, ignore_override);
		sphere.center = pos_b_1;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
		hitAnyAABB = true;
	}

	hitAABB = IntersectGLAABB(cylinder_2, ray, ray_local_cutoff, tmin, tmax);
	if(hitAABB)
	{
		IntersectCylinder(check_bounds, cylinder_2, ray, ray_local_cutoff, hit, ignore_override);
		sphere.center = pos_b_2;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
		hitAnyAABB = true;
	}

	hitAABB = IntersectGLAABB(cylinder_3, ray, ray_local_cutoff, tmin, tmax);
	if(hitAABB)
	{
		IntersectCylinder(check_bounds, cylinder_3, ray, ray_local_cutoff, hit, ignore_override);
		sphere.center = pos_b_3;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
		hitAnyAABB = true;
	}

	if(hitAnyAABB)
	{
		sphere.center = pos_a;
		IntersectSphereAxis(check_bounds, ray, ray_local_cutoff, sphere, hit, TYPE_GL_CYLINDER, pos_b_1, col_1, pos_b_2, col_2, pos_b_3, col_3);
	}	
}


void IntersectCylinder(bool check_bounds, GL_Cylinder cylinder, Ray ray, float ray_local_cutoff, inout HitInformation hit, bool ignore_override)
{
	
	float r = cylinder.radius;
	vec3 a = cylinder.position_a.xyz;
	vec3 b = cylinder.position_b.xyz;
	mat4 matrix = cylinder.matrix;
	mat4 matrix_inv = cylinder.matrix_inv;
	
	//vec3 a_os = (matrix * vec4(a, 1)).xyz;
	//vec3 b_os = (matrix * vec4(b, 1)).xyz;
		
	Ray ray_os;//Object Space of Cylinder
	ray_os.origin = (matrix * vec4(ray.origin, 1)).xyz;
	//ray_os.direction = (matrix_inv * vec4(ray.direction, 1)).xyz;
	ray_os.direction = (matrix * vec4(ray.origin+ray.direction, 1)).xyz - ray_os.origin;
	//ray_os.direction = normalize(ray_os.direction);
		
	//calculate discriminant in object space
	float x_1 = ray_os.origin.x;
	float x_2 = (ray_os.origin + ray_os.direction).x;
	float y_1 = ray_os.origin.y;
	float y_2 = (ray_os.origin + ray_os.direction).y;
	float d_x =  x_2 - x_1;
	float d_y =  y_2 - y_1;
	//float d_r = sqrt(d_x*d_x + d_y*d_y);
	//float d_r_squared = d_r * d_r;
    float d_r_squared = d_x*d_x + d_y*d_y;
	float D = x_1 * y_2 - x_2 * y_1;
	float discriminant = r*r * d_r_squared - D*D;
	if(discriminant < 0.0)
		return;

	float d_r_squared_inv = 1.0/d_r_squared;
	//calculate intersection points in object space	
	float root = sqrt(discriminant);
	float x_L = D * d_y;
	float x_R = sign(d_y)*d_x*root;
	//float y_L = -D * d_x;							//NOT NECESSARY
	//float y_R = abs(d_y)*root;					//NOT NECESSARY
	float p_x_1 = (x_L + x_R)/(d_r_squared);		
	float p_x_2 = (x_L - x_R)/(d_r_squared);		
	//vec2 p_x = vec2((x_L + x_R), (x_L - x_R)) * d_r_squared_inv;
	//float p_y_1 = (y_L + y_R)/(d_r_squared);		//NOT NECESSARY
	//float p_y_2 = (y_L - y_R)/(d_r_squared);		//NOT NECESSARY
	//vec2 p_1 = vec2(p_x_1, p_y_1);				//NOT NECESSARY
	//vec2 p_2 = vec2(p_x_2, p_y_2);				//NOT NECESSARY
	
	//calculate t in object space 
	//equation: ray_os.origin.x + t * ray_os.direction.x = p_x_1
	float t_1 = (p_x_1 - ray_os.origin.x) / ray_os.direction.x;
	float t_2 = (p_x_2 - ray_os.origin.x) / ray_os.direction.x;
	//float t_1 = (p_x[0] - ray_os.origin.x) / ray_os.direction.x;
	//float t_2 = (p_x[1] - ray_os.origin.x) / ray_os.direction.x;
	float t = 0.0;
	bool bothInFront = false;
	if(t_1 < 0.0)
	{		
		//t_1 is behind the camera
		if(t_2 < 0.0)//both intersection points are behind the camera						
			return;
		//t_2 is in front of camera  
		t = t_2;
	}
	else
	{
		if(t_2 < 0.0)//t_1 is in front of camera  
			t = t_1;
		else//both intersection points are in front of the camera	
		{
			t = min(t_1, t_2);
			bothInFront = true;
		}
	}
	
	//calculate intersection point p in object space
	//vec3 a_os = (matrix * vec4(a, 1)).xyz;		//NOT NECESSARY
	//vec3 b_os = (matrix * vec4(b, 1)).xyz;		//NOT NECESSARY
	//float z_min = a_os.z;
	//float z_max = b_os.z;
	vec3 p_os = ray_os.origin + t * ray_os.direction;
	float z_os = p_os.z;
	float h = distance(a,b);
	
	if(z_os > h || z_os < 0.0)
	{
		if(!bothInFront)
			return;
		return;
		//We also need to check the other t if we are not rendering caps		
		t = max(t_1, t_2);
		p_os = ray_os.origin + t * ray_os.direction;
		z_os = p_os.z;
		if(z_os > h || z_os < 0.0)
			return;
	}
	
	float distance_os = distance(ray_os.origin, p_os);				
	float distance = ray.rayDistance + distance_os;
				
	vec3 position_os = ray.origin + distance_os * ray.direction;
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_os);	
		if(outOfBounds)	
			return;	
	}
	if(distance_os > ray_local_cutoff)
		return;
	
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distance < hit.distance))
	{		
		//calculate intersection point in world space
		//vec3 p = (matrix_inv * vec4(p_os, 1)).xyz;
		//calculate tube center in world space (for normal calculation)
		vec3 tube_center = (matrix_inv * vec4(0,0, z_os, 1)).xyz;	
		hit.hitType = TYPE_GL_CYLINDER;//change
        hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;	
		hit.position = position_os;	
		hit.positionCenter = tube_center;
		hit.normal = normalize(hit.position - tube_center);
		hit.copy = false;//copy;
		hit.multiPolyID = -1;//interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = -1.0;//mix(v_a, v_b, local_percentage);
		hit.cost = -1.0;//cost;
		hit.objectColor = cylinder.color.xyz;
		hit.ignore_override = ignore_override;
	}
	
}

void IntersectSphereAxis(bool check_bounds, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, int type, vec3 pos_1, vec3 col_1, vec3 pos_2, vec3 col_2, vec3 pos_3, vec3 col_3)
{
	vec3 z = ray.origin - sphere.center;//e-c
	float a = dot(ray.direction, ray.direction);//unnecessary
	float b = 2.0 * dot(ray.direction, z);
	float c = dot(z, z) - sphere.radius * sphere.radius;

	float discriminant = b*b - 4.0 * a *c;
	if (discriminant < 0.0)
		return;

	float root = sqrt(discriminant);
	float t1 = (-b + root) * 0.5f;
	float t2 = (-b - root) * 0.5f;
	//float distance = min(t1, t2);
	//float distance = (-b - root) / (2.0f * a);
	float distance_os = 0.0;
		
	if(t1 < 0.0)
	{
		if(t2 < 0.0)
			return;
		distance_os = t2;
	}
	else if (t2 < 0.0)
		distance_os = t1;
	else
		distance_os = min(t1, t2);
	
	float distance_surface = ray.rayDistance + distance_os;
		
	vec3 position_os = ray.origin + distance_os * ray.direction;//intersection point in world space
	if(check_bounds)
	{
		bool outOfBounds = CheckOutOfBounds(position_os);	
		if(outOfBounds)	
			return;	
	}
	if(distance_os > ray_local_cutoff)
		return;
		
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distance_surface < hit.distance))
	{		
		hit.hitType = type;
		hit.distance_iteration = distance_os;	
		hit.distance = ray.rayDistance + distance_os;
		hit.position = ray.origin + distance_os * ray.direction;
		hit.positionCenter = sphere.center;
		hit.normal = normalize(hit.position - sphere.center);
		//hit.normal = normalize(sphere.center - hit.position);
		hit.copy = false;//copy;
		hit.multiPolyID = -1;//interactiveStreamline ? -1 : multiPolyID;
		hit.velocity = -1.0;//velocity;
		hit.cost = -1.0;//cost;
		hit.ignore_override = true;

		float d_1 = distance(pos_1, hit.position);
		float d_2 = distance(pos_2, hit.position);
		float d_3 = distance(pos_3, hit.position);
		if(d_1 < d_2)		
			hit.objectColor = d_1 < d_3 ? col_1 : col_3;
		else
			hit.objectColor = d_2 < d_3 ? col_2 : col_3;
	}
}

////////////////////////////////////////////////////////////////////
//
//                 START REGION VOLUME
//
////////////////////////////////////////////////////////////////////

void IntersectVolumeInstance(Ray ray, float distance_exit, inout HitInformation hit, inout HitInformation hitCube)
{
    int sample_index_iteration = 0;
    float delta = volume_rendering_distance_between_points;
    while(sample_index_iteration < 10000){
        //check termination condition
        float sample_distance_iteration = float(sample_index_iteration) * delta;
        bool max_range_reached = ray.rayDistance + sample_distance_iteration > max_volume_distance;
        if(max_range_reached)
            break;

        bool has_hit = hit.hitType > TYPE_NONE;
        bool has_hit_cube = hitCube.hitType > TYPE_NONE;
        bool has_hit_any = has_hit || has_hit_cube;
        bool no_hit_any = !has_hit_any;
        bool sample_in_front_of_hit = sample_distance_iteration < hit.distance_iteration;
        bool sample_in_front_of_hit_cube = sample_distance_iteration < hitCube.distance_iteration;
        float min_hit_distance = has_hit && has_hit_cube
            ? min(hit.distance_iteration, hitCube.distance_iteration)
            : has_hit ? hit.distance_iteration : hitCube.distance_iteration;
        bool sample_in_front_of_hit_any = sample_distance_iteration < min_hit_distance;
        bool sample_in_front_of_exit = sample_distance_iteration < distance_exit;
        bool ok = (no_hit_any && sample_in_front_of_exit)
            || (has_hit_any && sample_in_front_of_hit_any);
        if(!ok)
            break;

        //calculate sample position
        vec3 sample_position = ray.origin + ray.direction * sample_distance_iteration;
        bool out_of_bounds = CheckOutOfBounds(sample_position);
        if(out_of_bounds){
            //prepare next sample
            sample_index_iteration++;
            continue;
        }

        //transfer_function_index_streamline_scalar;
        //transfer_function_index_ftle_forward;
        //transfer_function_index_ftle_backward;

        //calculate forward color
#ifdef SHOW_VOLUME_RENDERING_FORWARD
        {
            int z_offset = 0;
            ApplyVolumeSample(ray, sample_position, z_offset, transfer_function_index_ftle_forward, hit);
        }
#endif

        //calculate backward color
#ifdef SHOW_VOLUME_RENDERING_BACKWARD
        {
            int z_offset = dim_z;
            ApplyVolumeSample(ray, sample_position, z_offset, transfer_function_index_ftle_backward, hit);
        }
#endif

        //prepare next sample
        sample_index_iteration++;

        if(hit.vol_accumulated_opacity >= volume_rendering_termination_opacity)
            break;
    } 
}

void ApplyVolumeSample(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index, inout HitInformation hit){
    vec4 rgba_forward = GetVolumeColorAndOpacity(ray, sample_position, z_offset, transfer_function_index);         

    vec3 combined_color = rgba_forward.rgb;
    float combined_alpha = rgba_forward.a * volume_rendering_opacity_factor;//volume_rendering_opacity_factor (experimental)

    //apply compositing: alpha_out = alpha_in + (1-alpha_in) * alpha;        
    float alpha_in = hit.vol_accumulated_opacity;
    hit.vol_accumulated_opacity = alpha_in + (1.0-alpha_in) * combined_alpha;
    //apply compositing: C_out = C_in + (1-alpha_in) * C';        
    vec3 C_in = hit.vol_accumulated_color;
    hit.vol_accumulated_color = C_in + (1.0-alpha_in) * combined_color * combined_alpha;
}

vec4 GetVolumeColorAndOpacity(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index)
{
    float sample_scalar = InterpolateFloat(texture_ftle, sample_position, z_offset);
    vec3 sample_normal = normalize(InterpolateVec3(texture_ftle_differences, sample_position, z_offset));

    //apply transfer function
    float t = (sample_scalar - min_scalar_ftle) / (max_scalar_ftle - min_scalar_ftle);
    int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
    bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
    vec4 rgba = GetScalarColor(bin, transfer_function_index);
    vec3 color = rgba.rgb;
    float alpha = rgba.a;

    //apply phong shading
    vec3 lightColor = vec3(0, 0, 0);
    vec3 viewDir = -ray.direction;
    vec3 normal = sample_normal;	
    for(int i=0; i<numDirLights; i++)
    {
        GL_DirLight light = GetDirLight(i);
        lightColor += CalcDirLight(light, normal, viewDir);
    }
    lightColor *= color;
    return vec4(lightColor, alpha);
}

////////////////////////////////////////////////////////////////////
//
//                 START REGION UTILITY
//
////////////////////////////////////////////////////////////////////

vec3 InterpolateVec3(sampler3D texture, vec3 texture_coordinate, int z_offset)
{
    float dx = 1.0 / float(dim_x-1);
    float dy = 1.0 / float(dim_y-1);
    float dz = 1.0 / float(dim_z-1);

    float x = texture_coordinate.r;
    float y = texture_coordinate.g;
    float z = texture_coordinate.b;

    int i = int(floor(x / dx));
    int j = int(floor(y / dy));
    int k = int(floor(z / dz));

    float t_x = (x - (float(i) * dx)) / dx;
    float t_y = (y - (float(j) * dy)) / dy;
    float t_z = (z - (float(k) * dz)) / dz;

    //get the 8 cell vertices
    vec3 v_000 = texelFetch(texture, ivec3(i+0, j+0, k+0+z_offset), 0).rgb;
    vec3 v_001 = texelFetch(texture, ivec3(i+0, j+0, k+1+z_offset), 0).rgb;
    vec3 v_010 = texelFetch(texture, ivec3(i+0, j+1, k+0+z_offset), 0).rgb;
    vec3 v_011 = texelFetch(texture, ivec3(i+0, j+1, k+1+z_offset), 0).rgb;
    vec3 v_100 = texelFetch(texture, ivec3(i+1, j+0, k+0+z_offset), 0).rgb;
    vec3 v_101 = texelFetch(texture, ivec3(i+1, j+0, k+1+z_offset), 0).rgb;
    vec3 v_110 = texelFetch(texture, ivec3(i+1, j+1, k+0+z_offset), 0).rgb;
    vec3 v_111 = texelFetch(texture, ivec3(i+1, j+1, k+1+z_offset), 0).rgb;

    //interpolate 4 points along x axis using t_x
    vec3 v_00 = mix(v_000, v_100, t_x);
    vec3 v_10 = mix(v_010, v_110, t_x);
    vec3 v_01 = mix(v_001, v_101, t_x);
    vec3 v_11 = mix(v_011, v_111, t_x);

    //interpolate 2 points along y axis using t_y
    vec3 v_0 = mix(v_00, v_10, t_y);
    vec3 v_1 = mix(v_01, v_11, t_y);

    //interpolate 1 points along z axis using t_z
    vec3 v = mix(v_0, v_1, t_z);

    return v;
}

float InterpolateFloat(sampler3D texture, vec3 texture_coordinate, int z_offset)
{
    float dx = 1.0 / float(dim_x-1);
    float dy = 1.0 / float(dim_y-1);
    float dz = 1.0 / float(dim_z-1);

    float x = texture_coordinate.r;
    float y = texture_coordinate.g;
    float z = texture_coordinate.b;

    int i = int(floor(x / dx));
    int j = int(floor(y / dy));
    int k = int(floor(z / dz));

    float t_x = (x - (float(i) * dx)) / dx;
    float t_y = (y - (float(j) * dy)) / dy;
    float t_z = (z - (float(k) * dz)) / dz;

    //get the 8 cell vertices
    float v_000 = texelFetch(texture, ivec3(i+0, j+0, k+0+z_offset), 0).r;
    float v_001 = texelFetch(texture, ivec3(i+0, j+0, k+1+z_offset), 0).r;
    float v_010 = texelFetch(texture, ivec3(i+0, j+1, k+0+z_offset), 0).r;
    float v_011 = texelFetch(texture, ivec3(i+0, j+1, k+1+z_offset), 0).r;
    float v_100 = texelFetch(texture, ivec3(i+1, j+0, k+0+z_offset), 0).r;
    float v_101 = texelFetch(texture, ivec3(i+1, j+0, k+1+z_offset), 0).r;
    float v_110 = texelFetch(texture, ivec3(i+1, j+1, k+0+z_offset), 0).r;
    float v_111 = texelFetch(texture, ivec3(i+1, j+1, k+1+z_offset), 0).r;

    //interpolate 4 points along x axis using t_x
    float v_00 = mix(v_000, v_100, t_x);
    float v_10 = mix(v_010, v_110, t_x);
    float v_01 = mix(v_001, v_101, t_x);
    float v_11 = mix(v_011, v_111, t_x);

    //interpolate 2 points along y axis using t_y
    float v_0 = mix(v_00, v_10, t_y);
    float v_1 = mix(v_01, v_11, t_y);

    //interpolate 1 points along z axis using t_z
    float v = mix(v_0, v_1, t_z);

    return v;
}

float GetTubeRadius(int part_index){
    return part_index == 0 ? tubeRadius : tubeRadiusOutside;
}

////////////////////////////////////////////////////////////////////
//
//                 START REGION MEMORY ACCESS
//
////////////////////////////////////////////////////////////////////

//DATA SIZES
const int POSITION_DATA_FLOAT_COUNT = 4;
const int POSITION_DATA_INT_COUNT = 0;
const int LINE_SEGMENT_FLOAT_COUNT = 128;//32 for two matrices
const int LINE_SEGMENT_INT_COUNT = 8;
const int TREE_NODE_FLOAT_COUNT = 8;
const int TREE_NODE_INT_COUNT = 4;
const int DIR_LIGHT_FLOAT_COUNT = 16;
const int DIR_LIGHT_INT_COUNT = 0;
const int STREAMLINE_COLOR_FLOAT_COUNT = 4;
const int STREAMLINE_COLOR_INT_COUNT = 0;
const int STREAMLINE_SEED_FLOAT_COUNT = 4;
const int STREAMLINE_SEED_INT_COUNT = 0;
const int CYLINDER_FLOAT_COUNT = 64;
const int CYLINDER_INT_COUNT = 0;

//LOD DATA
uniform int start_index_int_position_data0;
uniform int start_index_float_position_data0;
uniform int start_index_int_line_segments0;
uniform int start_index_float_line_segments0;
uniform int start_index_int_tree_nodes0;
uniform int start_index_float_tree_nodes0;

uniform int start_index_int_position_data1;
uniform int start_index_float_position_data1;
uniform int start_index_int_line_segments1;
uniform int start_index_float_line_segments1;
uniform int start_index_int_tree_nodes1;
uniform int start_index_float_tree_nodes1;

const int test_value = 1;

//GLOBAL DATA
uniform int start_index_int_dir_lights;
uniform int start_index_float_dir_lights;
uniform int start_index_int_streamline_color;
uniform int start_index_float_streamline_color;
uniform int start_index_int_scalar_color;
uniform int start_index_float_scalar_color;
uniform int start_index_int_cylinder;
uniform int start_index_float_cylinder;
uniform int start_index_int_seeds;
uniform int start_index_float_seeds;

//TEXTURE
const int tex_n_x = 512;
const int tex_n_y = 512;
const int tex_ny_nx = tex_n_y * tex_n_x;
ivec3 GetIndex3D(int global_index)
{  
  int z = global_index / tex_ny_nx;
  int y = (global_index % tex_ny_nx) / tex_n_x;
  int x = (global_index % tex_ny_nx) % tex_n_x;
  return ivec3(x,y,z);
}

////////////////////////////////////////////////////////////////////
//
//                START REGION ACCESS LOD TEXTURE
//
////////////////////////////////////////////////////////////////////

int GetStartIndexIntPositionData(int part_index){
    return part_index == 0 ? start_index_int_position_data0 : start_index_int_position_data1;
}

int GetStartIndexFloatPositionData(int part_index){
    return part_index == 0 ? start_index_float_position_data0 : start_index_float_position_data1;
}

int GetStartIndexIntLineSegments(int part_index){
    return part_index == 0 ? start_index_int_line_segments0 : start_index_int_line_segments1;
}

int GetStartIndexFloatLineSegments(int part_index){
    return part_index == 0 ? start_index_float_line_segments0 : start_index_float_line_segments1;
}

int GetStartIndexIntTreeNodes(int part_index){
    return part_index == 0 ? start_index_int_tree_nodes0 : start_index_int_tree_nodes1;
}

int GetStartIndexFloatTreeNodes(int part_index){
    return part_index == 0 ? start_index_float_tree_nodes0 : start_index_float_tree_nodes1;
}

vec3 GetPosition(int index, int part_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index) + index * POSITION_DATA_FLOAT_COUNT);
    float x = texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r;
    float y = texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r;
    float z = texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r;  
    vec3 position = vec3(x, y, z);
    if(projection_index >=0)
        position[projection_index] = 0.0;

    return position;
}

float GetCost(int index, int part_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index) + index * POSITION_DATA_FLOAT_COUNT);
    float cost = texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r;
    return cost;
}

float GetVelocity(int index, int part_index)
{
    float velocity = 1.0;//DUMMY
    return velocity;
}

//********************************************************** 

GL_LineSegment GetLineSegment(int index, int part_index)
{
	GL_LineSegment segment;
	ivec3 pointer = GetIndex3D(GetStartIndexIntLineSegments(part_index) + index * LINE_SEGMENT_INT_COUNT);
	segment.indexA = texelFetch(texture_int, pointer+ivec3(0,0,0), 0).r;
	segment.indexB = texelFetch(texture_int, pointer+ivec3(1,0,0), 0).r;
	segment.multiPolyID = texelFetch(texture_int, pointer+ivec3(2,0,0), 0).r;
	segment.copy = texelFetch(texture_int, pointer+ivec3(3,0,0), 0).r;
	segment.isBeginning = texelFetch(texture_int, pointer+ivec3(4,0,0), 0).r;

	pointer = GetIndex3D(GetStartIndexFloatLineSegments(part_index) + index * LINE_SEGMENT_FLOAT_COUNT
        + 32 * (projection_index+1));//projection_index = -1 is no projection (default)
  	segment.matrix = mat4(
		texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(7,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(11,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(15,0,0), 0).r
  	);
	segment.matrix_inv = mat4(
		texelFetch(texture_float, pointer+ivec3(16,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(17,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(18,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(19,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(20,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(21,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(22,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(23,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(24,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(25,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(26,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(27,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(28,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(29,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(30,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(31,0,0), 0).r
  	);
  return segment;
}

//********************************************************** 

GL_TreeNode GetNode(int index, int part_index)
{
	GL_TreeNode node;
	ivec3 pointer = GetIndex3D(GetStartIndexIntTreeNodes(part_index) + index * TREE_NODE_INT_COUNT);
	node.hitLink = texelFetch(texture_int, pointer+ivec3(0,0,0), 0).r;
	node.missLink = texelFetch(texture_int, pointer+ivec3(1,0,0), 0).r;
	node.objectIndex = texelFetch(texture_int, pointer+ivec3(2,0,0), 0).r;//segmentIndex TODO rename?
	node.type = texelFetch(texture_int, pointer+ivec3(3,0,0), 0).r;
	return node;
}

GL_AABB GetAABB(int index, int part_index)
{
    float tube_radius = GetTubeRadius(part_index);

	GL_AABB aabb;
	ivec3 pointer = GetIndex3D(GetStartIndexFloatTreeNodes(part_index) + index * TREE_NODE_FLOAT_COUNT);
	aabb.min = vec4(
		texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r//unnecessary
	);
	aabb.max = vec4(
		texelFetch(texture_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(7,0,0), 0).r//unnecessary
	);

    if(projection_index >=0)
    {
        aabb.min[projection_index] = -tube_radius;
        aabb.max[projection_index] = tube_radius;
    }
	return aabb;
}

////////////////////////////////////////////////////////////////////
//
//               START REGION ACCESS GLOBAL TEXTURE
//
////////////////////////////////////////////////////////////////////

GL_DirLight GetDirLight(int index)
{
	GL_DirLight light;
	ivec3 pointer = GetIndex3D(start_index_float_dir_lights + index * DIR_LIGHT_FLOAT_COUNT);
	light.ambient = vec4(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(3,0,0), 0).r//unnecessary
	);
	light.diffuse = vec4(
		texelFetch(texture_float_global, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(7,0,0), 0).r//unnecessary
	);
	light.specular = vec4(
		texelFetch(texture_float_global, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(11,0,0), 0).r//unnecessary
	);
	light.direction = vec4(
		texelFetch(texture_float_global, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(15,0,0), 0).r//unnecessary
	);
	return light;
}

vec3 GetStreamlineColor(int index)
{
	ivec3 pointer = GetIndex3D(start_index_float_streamline_color + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec3 color = vec3(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r
	);
	return color;
}

vec3 GetStreamlineSeedPosition(int index)
{
	ivec3 pointer = GetIndex3D(start_index_float_seeds + index * STREAMLINE_SEED_FLOAT_COUNT);
	vec3 position = vec3(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r
	);
	if(projection_index >=0)
        position[projection_index] = 0.0;
	return position;
}

vec4 GetScalarColor(int index, int transfer_function_index)
{
    ivec3 pointer = GetIndex3D(start_index_float_scalar_color 
        + transfer_function_index * TRANSFER_FUNCTION_BINS * STREAMLINE_COLOR_FLOAT_COUNT
        + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec4 color = vec4(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(3,0,0), 0).r
	);
	return color;
}

GL_Cylinder GetCylinder(int index)
{
    GL_Cylinder cylinder;
	ivec3 pointer = GetIndex3D(start_index_float_cylinder + index * CYLINDER_FLOAT_COUNT);
  	cylinder.matrix = mat4(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(3,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(7,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(11,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(15,0,0), 0).r
  	);
	cylinder.matrix_inv = mat4(
		texelFetch(texture_float_global, pointer+ivec3(16,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(17,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(18,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(19,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(20,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(21,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(22,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(23,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(24,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(25,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(26,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(27,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(28,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(29,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(30,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(31,0,0), 0).r
  	);
    cylinder.position_a = vec4(
		texelFetch(texture_float_global, pointer+ivec3(32,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(33,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(34,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(35,0,0), 0).r//unnecessary
  	);
    cylinder.position_b = vec4(
		texelFetch(texture_float_global, pointer+ivec3(36,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(37,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(38,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(39,0,0), 0).r//unnecessary
  	);
    cylinder.color = vec4(
		texelFetch(texture_float_global, pointer+ivec3(40,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(41,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(42,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(43,0,0), 0).r//unnecessary
  	);
	cylinder.radius = texelFetch(texture_float_global, pointer+ivec3(44,0,0), 0).r;
  return cylinder;
}

$SHADER_MODULE_LIGHT_INTEGRATION_DEFINITIONS$

`;