global.SHADER_MODULE_S3_FUNCTION_DECLARATIONS = `

//**********************************************************

void IntersectInstance(bool dynamic, Ray ray, inout HitInformation hit);
void IntersectInstance_Tree(bool dynamic, int part_index, Ray ray, float ray_local_cutoff, inout HitInformation hit);
void IntersectLineSegment(bool dynamic, int part_index, Ray ray, float ray_local_cutoff, GL_TreeNode glNode, inout HitInformation hit);
void IntersectSphere(vec3 ray_origin_3D, vec3 ray_destination_3D, vec3 sphere_center_3D, float sphere_radius, inout IntersectionResult result);
void IntersectSpherinder(bool dynamic, int part_index, Ray ray, float ray_local_cutoff, int lineSegmentID, inout HitInformation hit, bool ignore_override);
void IntersectSpherinderGL_Cylinder(GL_Cylinder cylinder, Ray ray, float ray_local_cutoff, inout HitInformation hit);
void Intersect3SphereAxis(Ray ray, float ray_local_cutoff, Sphere4D sphere4D, inout HitInformation hit, vec3 color);
void Intersect3SphereAxes(Ray ray, float ray_local_cutoff, Sphere4D sphere4D, inout HitInformation hit, vec4 pos_1, vec3 col_1, vec4 pos_2, vec3 col_2, vec4 pos_3, vec3 col_3);
void IntersectSideProjectionAxes(Ray ray, float ray_local_cutoff, inout HitInformation hit);
float GetScalar(vec4 position);
vec4 RayLightFunctionPos(vec4 position, vec4 direction);
vec4 RayLightFunctionDir(vec4 position, vec4 direction);

//**********************************************************

`;