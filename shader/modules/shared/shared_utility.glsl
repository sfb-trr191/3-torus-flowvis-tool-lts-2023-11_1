global.SHADER_MODULE_SHARED_UTILITY = `

vec3 map(vec3 value, vec3 inMin, vec3 inMax, vec3 outMin, vec3 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec4 map4(vec4 value, vec4 inMin, vec4 inMax, vec4 outMin, vec4 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

float GetTubeRadius(int part_index){
    return part_index == 0 ? tubeRadius : tubeRadiusOutside;
}

mat3 BuildJacoby(vec3 sample_jacoby_direction_x, vec3 sample_jacoby_direction_y, vec3 sample_jacoby_direction_z)
{
    mat3 matrix;//column major order, matrix[0] references the first column
    matrix[0] = sample_jacoby_direction_x;
    matrix[1] = sample_jacoby_direction_y;
    matrix[2] = sample_jacoby_direction_z;
    return matrix;
}

mat3 BuildHessian(vec3 sample_jacoby_direction_x, vec3 sample_jacoby_direction_y, vec3 sample_jacoby_direction_z)
{
    //the hessian is the transpose of the jacobian of the gradient
    mat3 matrix;//column major order, matrix[0] references the first column
    matrix[0] = vec3(sample_jacoby_direction_x.x, sample_jacoby_direction_y.x, sample_jacoby_direction_z.x);
    matrix[1] = vec3(sample_jacoby_direction_x.y, sample_jacoby_direction_y.y, sample_jacoby_direction_z.y);
    matrix[2] = vec3(sample_jacoby_direction_x.z, sample_jacoby_direction_y.z, sample_jacoby_direction_z.z);
    return matrix;
}

mat3 BuildHessianForceSym(vec3 sample_jacoby_direction_x, vec3 sample_jacoby_direction_y, vec3 sample_jacoby_direction_z)
{
    //the hessian is the transpose of the jacobian of the gradient
    mat3 matrix;//column major order, matrix[0] references the first column
    matrix[0] = 0.5 * (sample_jacoby_direction_x + vec3(sample_jacoby_direction_x.x, sample_jacoby_direction_y.x, sample_jacoby_direction_z.x));
    matrix[1] = 0.5 * (sample_jacoby_direction_y + vec3(sample_jacoby_direction_x.y, sample_jacoby_direction_y.y, sample_jacoby_direction_z.y));
    matrix[2] = 0.5 * (sample_jacoby_direction_z + vec3(sample_jacoby_direction_x.z, sample_jacoby_direction_y.z, sample_jacoby_direction_z.z));
    return matrix;
}

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

`;