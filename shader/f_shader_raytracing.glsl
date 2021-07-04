var F_SHADER_RAYTRACING = `#version 300 es
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

struct HitInformation
{
	vec3 position;
	vec3 positionCenter;
	vec3 normal;
	vec3 objectColor;//for GL_Cylinder
	//bool terminate;
	int hitType;
	bool copy;
	//float distance_os;
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
};

struct Ray
{
	vec3 origin;		//the origin of the ray, this changes when leaving the cube or when the ray is only a segment
	vec3 direction;
	vec3 dir_inv;		//cached value of: 1 / ray.direction
	float rayDistance;	//the distance already travelled
};

struct Sphere
{
	vec3 center;
	float radius;
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

const int FOG_NONE = 0;
const int FOG_LINEAR = 1;
const int FOG_EXPONENTIAL = 2;
const int FOG_EXPONENTIAL_SQUARED = 3;

const int SHADING_MODE_STREAMLINES_ID = 0;
const int SHADING_MODE_STREAMLINES_SCALAR = 1;

const float PI = 3.1415926535897932384626433832795;

////////////////////////////////////////////////////////////////////
//
//                 START UNIFORMS
//
////////////////////////////////////////////////////////////////////

uniform float color_r;
uniform sampler3D texture_float;
uniform isampler3D texture_int;
uniform sampler3D texture_float_global;
uniform isampler3D texture_int_global;
uniform float offset_x;
uniform float offset_y;
uniform float maxRayDistance;
uniform int maxIterationCount;
uniform float tubeRadius;
uniform float fog_density;
uniform int fog_type;
uniform int shading_mode_streamlines;
uniform float min_scalar;
uniform float max_scalar;

uniform int width;
uniform int height;
const float epsilon_move_ray = 0.0000001;//DUMMY
const float epsilon_out_of_bounds = 0.000001;//DUMMY
const bool ignore_copy = false;//DUMMY
const float growth_max_cost = 0.0;//DUMMY
const float scalar_cost_max = 0.0;//DUMMY
const int growth = 0;//DUMMY
const int growth_id = -1;//DUMMY
const bool check_bounds = true;//DUMMY
const int allowOutOfBoundSphere = 0;//DUMMY
const int numDirLights = 3;//DUMMY
const float fogStart = 1000.0;//DUMMY
const float fogEnd = 1001.0;//DUMMY
const vec3 fogColor = vec3(1,1,1);//DUMMY
const float tubeShininess = 32.0;//DUMMY
const bool blinn_phong = true;//DUMMY

uniform GL_CameraData active_camera;

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

vec3 CalculateOneRay(float x_offset, float y_offset, inout HitInformation hit);
Ray GenerateRay(float x_offset, float y_offset);
GL_CameraData GetActiveCamera();
void Intersect(Ray ray, inout HitInformation hit, inout HitInformation hitCube);
void IntersectInstance(Ray ray, inout HitInformation hit, inout HitInformation hitCube);
void IntersectInstance_Tree(bool interactiveStreamline, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube);
bool CheckOutOfBounds(vec3 position);
vec3 MoveOutOfBounds(vec3 position);
bool IntersectGLAABB(GL_AABB b, Ray r, float ray_local_cutoff, inout float tmin, inout float tmax);
void IntersectLineSegment(bool interactiveStreamline, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit);
void IntersectCylinder(bool interactiveStreamline, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override);
void IntersectSphere(bool interactiveStreamline, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, int type, float velocity, float cost);
float ExtractLinearPercentage(float a, float b, float value);

//**********************************************************

vec3 Shade(Ray ray, inout HitInformation hit, inout HitInformation hitCube, bool ignore_override);
float CalculateFogFactor(float dist);
vec3 GetObjectColor(inout HitInformation hit);
float GetScalar(vec3 position);
vec3 CalcDirLight(GL_DirLight light, vec3 normal, vec3 viewDir);
vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax);
//float clamp(float x, float min, float max);

//**********************************************************

float GetCost(int index, bool interactiveStreamline);
vec3 GetPosition(int index, bool interactiveStreamline);
float GetVelocity(int index, bool interactiveStreamline);
GL_LineSegment GetLineSegment(int index, bool interactiveStreamline);
GL_TreeNode GetNode(int index, bool interactiveStreamline);
GL_AABB GetAABB(int index, bool interactiveStreamline);
GL_DirLight GetDirLight(int index);
vec3 GetStreamlineColor(int index);
vec3 GetScalarColor(int index);

ivec3 GetIndex3D(int global_index);

void main() {
    float i = gl_FragCoord[0];//x
	float j = gl_FragCoord[1];//y
    
	HitInformation hit;
	vec3 color = CalculateOneRay(offset_x, offset_y, hit);
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
			outputColor = vec4(GetPosition(0, false), 1);	
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
			GL_TreeNode node = GetNode(0, false);
			bool flag1 = validateInteger(node.hitLink, 1);
			bool flag2 = validateInteger(node.missLink, 0);
			bool flag3 = validateInteger(node.objectIndex, -1);
			bool flag4 = validateInteger(node.type, 0);

			node = GetNode(1, false);
			bool flag5 = validateInteger(node.hitLink, 2);
			bool flag6 = validateInteger(node.missLink, 2);
			bool flag7 = validateInteger(node.objectIndex, 0);
			bool flag8 = validateInteger(node.type, 1);

			node = GetNode(2, false);
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

vec3 CalculateOneRay(float x_offset, float y_offset, inout HitInformation hit)
{

	hit.hitType = TYPE_NONE;
	hit.distance = 0.0;	
	hit.transparentHit = false;
	hit.transparentNearest = 0.0;
	hit.clickTarget = false;
	hit.ignore_override = false;
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

	Ray ray = GenerateRay(x_offset, y_offset);	
  
	Intersect(ray, hit, hitCube);//found in decision: intersection_control_definitions

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
	//float j = height - gl_FragCoord[1];//y
	float j = gl_FragCoord[1];//y
	if(!left_handed)
		j = float(height) - gl_FragCoord[1];//y
	vec3 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
	vec3 r_ij = normalize(p_ij);
	
	Ray ray;
	ray.origin = E;
	ray.direction = r_ij;
	ray.dir_inv = 1.0/ray.direction;
	ray.rayDistance = 0.0;
	return ray;
}

GL_CameraData GetActiveCamera()
{
	return active_camera;
}

void Intersect(Ray ray, inout HitInformation hit, inout HitInformation hitCube)
{			
	Ray variableRay;
	variableRay.origin = ray.origin;
	variableRay.direction = ray.direction;
	variableRay.dir_inv = ray.dir_inv;
	variableRay.rayDistance = 0.0;
			
	int count = 0;
	int hitCount = 0;

	//IntersectAxesCorner(ray, hit, hitCube, 0);

	while(true)
	{		
		IntersectInstance(variableRay, hit, hitCube);
		if(hit.hitType > TYPE_NONE || hitCube.hitType > TYPE_NONE)		
			break;

		count++;		
		if(count >= maxIterationCount)
			break;
		
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
		float t = min(t_v.x, min(t_v.y, t_v.z));		
		vec3 exit = variableRay.origin + t * variableRay.direction;
		
		//update distance "traveled" using value from this instance
		variableRay.rayDistance += t;
		
		//stop at maxRayDistance + 1.8
		//1.8 is a bit greater than sqrt(3) which is the max distance inside unit cube
		if(variableRay.rayDistance > (maxRayDistance + 1.8))
			break;

		
		//update ray origin for next instance		
		//MoveRayOrigin(variableRay, exit);
		variableRay.origin = MoveOutOfBounds(exit);
				
		//break;
	}	
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

	if(cut_at_cube_faces)
	{
		IntersectUnitCube(ray, doesIntersect, nearest_t, normal_face);
		if(doesIntersect)
		{
			hitCube.hitType = TYPE_NONE;
			hitCube.distance = nearest_t;
			hitCube.normal = normal_face;
			hitCube.position = ray.origin + nearest_t * ray.direction;		
		}
	}
  */
	//if(show_streamlines)
	IntersectInstance_Tree(false, ray, maxRayDistance, hit, hitCube);
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

	
	if(show_bounding_box)
	{
		IntersectAxes(is_main_renderer, ray, maxRayDistance, hit, hitCube);
	}

	if(show_main_camera_axes)
	{
		//index 0 and 1 are the movable axes for main / multi renderer
		//index 2 is the main camera orientation
		//indices 3 to 10 are the axes
		IntersectAxesCornerAABB(false, ray, maxRayDistance, hit, hitCube, 2);
	}	
  */
}

void IntersectInstance_Tree(bool interactiveStreamline, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube)
{		
	bool copy = false;
	int multiPolyID = 0;
	int type = TYPE_STREAMLINE_SEGMENT;
	float velocity = 0.0;
	float cost = 0.0;

	Sphere sphere;
	sphere.radius = 0.1;

	/*
	sphere.center =	vec3(0.1, 0.1, 0.1);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	sphere.center =	vec3(0.1, 0.1, 0.9);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	sphere.center =	vec3(0.1, 0.9, 0.1);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	sphere.center =	vec3(0.1, 0.9, 0.9);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	sphere.center =	vec3(0.9, 0.1, 0.1);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	sphere.center =	vec3(0.9, 0.1, 0.9);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	sphere.center =	vec3(0.9, 0.9, 0.1);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	sphere.center =	vec3(0.9, 0.9, 0.9);
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, type, velocity, cost);
	*/
	//return;


	int nodeIndex = 0;
	int iteration_counter = -1;
	while(true)
	{		
		iteration_counter++;	
		//if (iteration_counter > 1000)			
		//	break;//TODO

		GL_TreeNode glNode = GetNode(nodeIndex, interactiveStreamline);
		GL_AABB glAABB = GetAABB(nodeIndex, interactiveStreamline);
		float tmin;
		float tmax;
		bool hitAABB = IntersectGLAABB(glAABB, ray, ray_local_cutoff, tmin, tmax);
		//hitAABB = true;
		if(hitAABB)
		{
			nodeIndex = glNode.hitLink;
			if (glNode.type != 0)
			{
				//hit.hitType = 1;
				IntersectLineSegment(interactiveStreamline, ray, ray_local_cutoff, glNode, hit);
			}
			//if (nodeIndex == 1){
			//	hit.hitType = 1;
			//}
			/*			
			if(hitCube.hitType != TYPE_IGNORE_CUBE)
			{
				//ray intersects cube --> check if cube hit is inside this object
				if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
				{
					HandleOutOfBound_LineSegment(interactiveStreamline, ray, glNode.objectIndex, hitCube);					
				}
			}
			if(hitCube.hitType == TYPE_NONE || hitCube.hitType ==TYPE_IGNORE_CUBE)
			{
				
				if(glNode.type == TYPE_STREAMLINE_SEGMENT)	
				{
					if(handle_inside)
					{
						HandleInside_LineSegment(interactiveStreamline, ray, glNode.objectIndex, hit);
					}*/
					//IntersectLineSegment(interactiveStreamline, ray, ray_local_cutoff, glNode, hit);	
          /*							
				}
			}				
      */				
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
	if(!check_bounds)
		return false;
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

void IntersectLineSegment(bool interactiveStreamline, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit)
{ 
	/*
	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, interactiveStreamline);
	bool copy = false; 
	int multiPolyID = 0; 
	float v_b = 1.0; 
	float cost_b_value = 0.0;

	vec3 a = GetPosition(lineSegment.indexA, interactiveStreamline);

	Sphere sphere;
	sphere.radius = tubeRadius;
	sphere.center = a;
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);

	*/


	int lineSegmentID = glNode.objectIndex;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, interactiveStreamline);
	int multiPolyID = lineSegment.multiPolyID;
	bool copy = (lineSegment.copy==1);
	if(ignore_copy && copy)
		return;
	vec3 a = GetPosition(lineSegment.indexA, interactiveStreamline);
	vec3 b = GetPosition(lineSegment.indexB, interactiveStreamline);
	float cost_a = GetCost(lineSegment.indexA, interactiveStreamline);
	float cost_b = GetCost(lineSegment.indexB, interactiveStreamline);
	float cost_cutoff = growth_max_cost * scalar_cost_max;
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
	glAABB_os.min = vec4(-tubeRadius, -tubeRadius, -tubeRadius, 0);
	glAABB_os.max = vec4(tubeRadius, tubeRadius, h+tubeRadius, 0);
	float tmin;
	float tmax;
	bool hitAABB = IntersectGLAABB(glAABB_os, ray_os, ray_local_cutoff, tmin, tmax);
	if(!hitAABB)
	{
		//return;
	}
	float v_a = GetVelocity(lineSegment.indexA, interactiveStreamline);
	float v_b = GetVelocity(lineSegment.indexB, interactiveStreamline);
	
	//CYLINDER AND SPHERE TEST
	bool ignore_override = false;
	IntersectCylinder(interactiveStreamline, ray, ray_local_cutoff, glNode.objectIndex, hit, ignore_override);	
	Sphere sphere;
	sphere.radius = tubeRadius;
	//SPHERE A
	if(lineSegment.isBeginning == 1 || copy)
	{
		sphere.center = a;
		IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_a, cost_a);
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
				//sphere.radius = tubeRadius * 1.1;		
			}
		}
	}
	IntersectSphere(interactiveStreamline, ray, ray_local_cutoff, sphere, hit, copy, multiPolyID, TYPE_STREAMLINE_SEGMENT, v_b, cost_b_value);	
	
	/**/
}

void IntersectCylinder(bool interactiveStreamline, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override)
{
	float r = tubeRadius;// / 2.0;
	GL_LineSegment lineSegment = GetLineSegment(lineSegmentID, interactiveStreamline);
	vec3 a = GetPosition(lineSegment.indexA, interactiveStreamline);
	vec3 b = GetPosition(lineSegment.indexB, interactiveStreamline);

	
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
	float d_r = sqrt(d_x*d_x + d_y*d_y);
	float d_r_squared = d_r * d_r;
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
	bool outOfBounds = CheckOutOfBounds(position_os);	
	
	if(outOfBounds)	
		return;		
	
	int multiPolyID = lineSegment.multiPolyID;

	float cost_a = GetCost(lineSegment.indexA, interactiveStreamline);
	float cost_b = GetCost(lineSegment.indexB, interactiveStreamline);
	float local_percentage = z_os / h;
	float cost = mix(cost_a, cost_b, local_percentage);
	/*
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > growth_max_cost * scalar_cost_max)
				return;
		}
	}
	*/

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
		//vec3 tube_center = mix(a, b, local_percentage);//alternative
		float v_a = GetVelocity(lineSegment.indexA, interactiveStreamline);
		float v_b = GetVelocity(lineSegment.indexB, interactiveStreamline);		
		hit.hitType = TYPE_STREAMLINE_SEGMENT;
		//hit.distance_os = distance_os;	
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

void IntersectSphere(bool interactiveStreamline, Ray ray, float ray_local_cutoff, Sphere sphere, inout HitInformation hit, bool copy, int multiPolyID, int type, float velocity, float cost)
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
	if(growth == 1)
	{
		if(growth_id == -1 || growth_id == multiPolyID)
		{
			if(cost > growth_max_cost * scalar_cost_max)
				return;
		}
	}
	
		
	if(distance_os > ray_local_cutoff)
		return;
		
	//if (not hit) this is the first hit
	//otherwise hit is true and we only need to check the distance
	if((hit.hitType==TYPE_NONE) || (distance_surface < hit.distance))
	{		
		hit.hitType = type;
		//hit.distance_os = distance_os;	
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

vec3 Shade(Ray ray, inout HitInformation hit, inout HitInformation hitCube, bool ignore_override)
{			
	ignore_override = ignore_override || hit.ignore_override;
	vec3 resultColor = vec3(0,0,0);

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

		vec3 objectColor = GetObjectColor(hit);	
		lightColor *= objectColor;
		
        float fogFactor = CalculateFogFactor(hit.distance);
		
		//formula: finalColor = (1.0 - f)*fogColor + f * lightColor
		resultColor = mix(fogColor, lightColor, fogFactor);
	}
	else
	{
		//no hit found, use background color
		resultColor = vec3(1, 1, 1);
	}
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

vec3 GetObjectColor(inout HitInformation hit)
{
	//return vec3(0.5,0.5,0.5);
	vec3 objectColor = vec3(0, 0, 1);
	
	if(hit.hitType == TYPE_STREAMLINE_SEGMENT)
	{
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_ID)
        {
		    int index = hit.multiPolyID % 8;
            return GetStreamlineColor(index);
        }
        if(shading_mode_streamlines == SHADING_MODE_STREAMLINES_SCALAR)
        {
            float scalar = GetScalar(hit.positionCenter);
            float t = (scalar - min_scalar) / (max_scalar - min_scalar);
            int bin = int(float(127) * t);
            bin = clamp(bin, 0, 127);
            return GetScalarColor(bin);
        }
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

/*
float clamp(float x, float min, float max){
	return (x < min) ? min : (x > max) ? max : x;
}
*/

////////////////////////////////////////////////////////////////////
//
//                 START REGION MEMORY ACCESS
//
////////////////////////////////////////////////////////////////////

//DATA SIZES
const int POSITION_DATA_FLOAT_COUNT = 4;
const int POSITION_DATA_INT_COUNT = 0;
const int LINE_SEGMENT_FLOAT_COUNT = 32;
const int LINE_SEGMENT_INT_COUNT = 8;
const int TREE_NODE_FLOAT_COUNT = 8;
const int TREE_NODE_INT_COUNT = 4;
const int DIR_LIGHT_FLOAT_COUNT = 16;
const int DIR_LIGHT_INT_COUNT = 0;
const int STREAMLINE_COLOR_FLOAT_COUNT = 4;
const int STREAMLINE_COLOR_INT_COUNT = 0;

//LOD DATA
uniform int start_index_int_position_data;
uniform int start_index_float_position_data;
uniform int start_index_int_line_segments;
uniform int start_index_float_line_segments;
uniform int start_index_int_tree_nodes;
uniform int start_index_float_tree_nodes;

//GLOBAL DATA
uniform int start_index_int_dir_lights;
uniform int start_index_float_dir_lights;
uniform int start_index_int_streamline_color;
uniform int start_index_float_streamline_color;
uniform int start_index_int_scalar_color;
uniform int start_index_float_scalar_color;

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

vec3 GetPosition(int index, bool interactiveStreamline)
{
	//return interactiveStreamline ? bufferPositionDataInteractiveStreamline[index].position.xyz : bufferPositionData[index].position.xyz;
  ivec3 pointer = GetIndex3D(start_index_float_position_data + index * POSITION_DATA_FLOAT_COUNT);
  float x = texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r;
  float y = texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r;
  float z = texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r;  
  return vec3(x, y, z);
}

float GetCost(int index, bool interactiveStreamline)
{
	//return interactiveStreamline ? bufferPositionDataInteractiveStreamline[index].cost : bufferPositionData[index].cost;
  float cost = 0.0;
  return cost;
}

float GetVelocity(int index, bool interactiveStreamline)
{
	//return interactiveStreamline ? bufferPositionDataInteractiveStreamline[index].velocity : bufferPositionData[index].velocity;
  float velocity = 1.0;//DUMMY
  return velocity;
}

//********************************************************** 

GL_LineSegment GetLineSegment(int index, bool interactiveStreamline)
{
	//return interactiveStreamline ? bufferLineSegmentsInteractiveStreamline[index] : bufferLineSegments[index];
	GL_LineSegment segment;
	ivec3 pointer = GetIndex3D(start_index_int_line_segments + index * LINE_SEGMENT_INT_COUNT);
	segment.indexA = texelFetch(texture_int, pointer+ivec3(0,0,0), 0).r;
	segment.indexB = texelFetch(texture_int, pointer+ivec3(1,0,0), 0).r;
	segment.multiPolyID = texelFetch(texture_int, pointer+ivec3(2,0,0), 0).r;
	segment.copy = texelFetch(texture_int, pointer+ivec3(3,0,0), 0).r;
	segment.isBeginning = texelFetch(texture_int, pointer+ivec3(4,0,0), 0).r;

	pointer = GetIndex3D(start_index_float_line_segments + index * LINE_SEGMENT_FLOAT_COUNT);
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

GL_TreeNode GetNode(int index, bool interactiveStreamline)
{
	//return interactiveStreamline ? bufferNodesInteractiveStreamline[index].node : bufferNodes[index].node;
	GL_TreeNode node;
	ivec3 pointer = GetIndex3D(start_index_int_tree_nodes + index * TREE_NODE_INT_COUNT);
	node.hitLink = texelFetch(texture_int, pointer+ivec3(0,0,0), 0).r;
	node.missLink = texelFetch(texture_int, pointer+ivec3(1,0,0), 0).r;
	node.objectIndex = texelFetch(texture_int, pointer+ivec3(2,0,0), 0).r;//segmentIndex TODO rename?
	node.type = texelFetch(texture_int, pointer+ivec3(3,0,0), 0).r;
	return node;
}

GL_AABB GetAABB(int index, bool interactiveStreamline)
{
	//return interactiveStreamline ? bufferNodesInteractiveStreamline[index].aabb : bufferNodes[index].aabb;
	GL_AABB aabb;
	ivec3 pointer = GetIndex3D(start_index_float_tree_nodes + index * TREE_NODE_FLOAT_COUNT);
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

	/*
	aabb.min = vec4(0.4,0.4,0,0);
	aabb.max = vec4(0.7,0.6,1,0);

	aabb.min = vec4(0.6, 0.4, 0.0, 0);
	aabb.max = vec4(0.7, 0.99, 0.99, 0);

	aabb.min = vec4(0.5, 0.0, 0.0, 0);
	aabb.max = vec4(0.6, 0.6, 0.1, 0);

	aabb.min = vec4(0.0, 0.0, 0.0, 0);
	aabb.max = vec4(1.0, 1.0, 1.0, 0);
	*/
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

vec3 GetScalarColor(int index)
{
	ivec3 pointer = GetIndex3D(start_index_float_scalar_color + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec3 color = vec3(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r
	);
	return color;
}

`;