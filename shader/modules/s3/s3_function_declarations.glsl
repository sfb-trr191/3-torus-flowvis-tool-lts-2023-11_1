global.SHADER_MODULE_S3_FUNCTION_DECLARATIONS = `

//**********************************************************

void IntersectInstance(Ray ray, inout HitInformation hit);
void IntersectInstance_Tree(int part_index, Ray ray, float ray_local_cutoff, inout HitInformation hit);
void IntersectLineSegment(int part_index, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit);
void IntersectSphere(vec3 ray_origin_3D, vec3 ray_destination_3D, vec3 sphere_center_3D, float sphere_radius, inout IntersectionResult result);
void IntersectSpherinder(int part_index, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override);
void IntersectSpherinderGL_Cylinder(GL_Cylinder cylinder, Ray ray, float ray_local_cutoff, inout HitInformation hit);
void IntersectSideProjectionAxes(Ray ray, float ray_local_cutoff, inout HitInformation hit);
float GetScalar(vec4 position);
vec4 RayLightFunctionPos(vec4 position, vec4 direction);
vec4 RayLightFunctionDir(vec4 position, vec4 direction);

//**********************************************************

`;