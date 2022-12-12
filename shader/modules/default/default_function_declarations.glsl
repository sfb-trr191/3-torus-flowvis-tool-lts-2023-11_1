global.SHADER_MODULE_DEFAULT_FUNCTION_DECLARATIONS = `

//**********************************************************

void IntersectInstance(Ray ray, inout HitInformation hit, inout HitInformation hitCube);
void IntersectInstance_Tree(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube);
void IntersectLineSegment(int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit);
float GetScalar(vec3 position);
vec3 RayLightFunctionPos(vec3 position, vec3 direction);
vec3 RayLightFunctionDir(vec3 position, vec3 direction);

//**********************************************************

`;