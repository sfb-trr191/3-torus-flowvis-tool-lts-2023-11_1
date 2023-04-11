global.SHADER_MODULE_DEFAULT_STRUCTS = `

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
    int sub_type;
    int iteration_count;
    bool dynamic;
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
    int iteration_count;
    int ray_projection_index;
};

`;