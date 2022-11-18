global.SHADER_MODULE_SHARED_STRUCTS = `

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

`;