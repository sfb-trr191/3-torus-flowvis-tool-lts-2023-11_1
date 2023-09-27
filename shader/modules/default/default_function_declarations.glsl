global.SHADER_MODULE_DEFAULT_FUNCTION_DECLARATIONS = `

//**********************************************************

void IntersectInstance(bool dynamic, Ray ray, inout HitInformation hit, inout HitInformation hitCube);
void IntersectInstance_Tree(bool dynamic, int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, inout HitInformation hit, inout HitInformation hitCube);
void IntersectLineSegment(bool dynamic, int part_index, bool check_bounds, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit);
float GetScalar(vec3 position);
vec3 RayLightFunctionPos(vec3 position, vec3 direction);
vec3 RayLightFunctionDir(vec3 position, vec3 direction);
vec3 RayLightFunctionPosExplicit(inout ExplicitIntegrationData explicitIntegrationData);

//**********************************************************

`;