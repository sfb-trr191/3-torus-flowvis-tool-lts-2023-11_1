global.SHADER_MODULE_S3_FUNCTION_DECLARATIONS = `

//**********************************************************

void IntersectInstance(Ray ray, inout HitInformation hit);
void IntersectInstance_Tree(int part_index, Ray ray, float ray_local_cutoff, inout HitInformation hit);
void IntersectLineSegment(int part_index, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit);
float GetScalar(vec4 position);
vec4 RayLightFunctionPos(vec4 position, vec4 direction);
vec4 RayLightFunctionDir(vec4 position, vec4 direction);

//**********************************************************

`;