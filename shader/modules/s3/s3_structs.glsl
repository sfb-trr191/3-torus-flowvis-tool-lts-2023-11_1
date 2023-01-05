global.SHADER_MODULE_S3_STRUCTS = `

struct HitInformation
{
	vec4 position;
	vec4 positionCenter;
	vec4 normal;
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
	vec4 transparentNormal;

	bool ignore_override;

    float vol_accumulated_opacity;
    vec3 vol_accumulated_color;

    bool was_copied_from_outside;
    
    int debug_value;
    float debug_value_f;
    int sub_type;
};

struct Ray
{
	vec4 origin;		//the origin of the ray, this changes when leaving the cube or when the ray is only a segment
	vec4 direction;
	vec4 dir_inv;		//cached value of: 1 / ray.direction
	float rayDistance;	//the distance already travelled
    float local_cutoff; //the max distance used for intersection testing, for linear rays, this is just maxRayDistance, but if light is integrated this uses the segment length from the integration step

    //the following variables are for ray integration
    vec4 nextPosition;
    vec4 nextDirection;
    float segment_length;
};

struct IntersectionResult{
    bool intersect;
    vec3 intersection_3D;
    float t;
};

`;