global.SHADER_MODULE_DEFAULT_VOLUME_RENDERING = `

void IntersectVolumeInstance(Ray ray, float distance_exit, inout HitInformation hit, inout HitInformation hitCube)
{
    int sample_index_iteration = 0;
    float delta = volume_rendering_distance_between_points;
    while(sample_index_iteration < 10000){
        //check termination condition
        float sample_distance_iteration = float(sample_index_iteration) * delta;
        float current_distance = ray.rayDistance + sample_distance_iteration;
        bool max_range_reached = current_distance > max_volume_distance;
        bool min_range_reached = current_distance >= min_volume_distance;
        bool skip_first_fundamental_domain = ray.iteration_count == 0 && volume_skip_first_fundamental_domain;
        if(max_range_reached)
            break;
        if(!min_range_reached){
            //prepare next sample
            sample_index_iteration++;
            continue;
        }
        if(skip_first_fundamental_domain){
            //prepare next sample
            sample_index_iteration++;
            continue;
        }

        bool has_hit = hit.hitType > TYPE_NONE;
        bool has_hit_cube = hitCube.hitType > TYPE_NONE;
        bool has_hit_any = has_hit || has_hit_cube;
        bool no_hit_any = !has_hit_any;
        bool sample_in_front_of_hit = sample_distance_iteration < hit.distance_iteration;
        bool sample_in_front_of_hit_cube = sample_distance_iteration < hitCube.distance_iteration;
        float min_hit_distance = has_hit && has_hit_cube
            ? min(hit.distance_iteration, hitCube.distance_iteration)
            : has_hit ? hit.distance_iteration : hitCube.distance_iteration;
        bool sample_in_front_of_hit_any = sample_distance_iteration < min_hit_distance;
        bool sample_in_front_of_exit = sample_distance_iteration < distance_exit;
        bool ok = (no_hit_any && sample_in_front_of_exit)
            || (has_hit_any && sample_in_front_of_hit_any);
        if(!ok)
            break;

        //calculate sample position
        vec3 sample_position = ray.origin + ray.direction * sample_distance_iteration;
        bool out_of_bounds = CheckOutOfBounds(sample_position);
        if(out_of_bounds){
            //prepare next sample
            sample_index_iteration++;
            continue;
        }

        //transfer_function_index_streamline_scalar;
        //transfer_function_index_ftle_forward;
        //transfer_function_index_ftle_backward;

        //calculate forward color
#ifdef SHOW_VOLUME_RENDERING_FORWARD
        {
            int z_offset = 0;
            ApplyVolumeSample(ray, sample_position, z_offset, transfer_function_index_ftle_forward, hit);
        }
#endif

        //calculate backward color
#ifdef SHOW_VOLUME_RENDERING_BACKWARD
        {
            int z_offset = dim_z;
            ApplyVolumeSample(ray, sample_position, z_offset, transfer_function_index_ftle_backward, hit);
        }
#endif

        //prepare next sample
        sample_index_iteration++;

        if(hit.vol_accumulated_opacity >= volume_rendering_termination_opacity)
            break;
    } 
}

void ApplyVolumeSample(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index, inout HitInformation hit){
    vec4 rgba_forward;
    if(volume_rendering_mode == VOLUME_RENDERING_MODE_ORIGINAL_FTLE){
        rgba_forward = GetVolumeColorAndOpacity(ray, sample_position, z_offset, transfer_function_index);
    }
    else if (volume_rendering_mode == VOLUME_RENDERING_MODE_RIDGES){
        rgba_forward = GetDirectRidgeVolumeColorAndOpacity(ray, sample_position, z_offset, transfer_function_index);
    }else{
        rgba_forward = GetVolumeColorAndOpacitySmallestEigenvalue(ray, sample_position, z_offset, transfer_function_index);
    }    

    vec3 combined_color = rgba_forward.rgb;
    float combined_alpha = rgba_forward.a * volume_rendering_opacity_factor;//volume_rendering_opacity_factor (experimental)

    //opacity correction:
    float alpha_corrected = combined_alpha;
    if(correct_volume_opacity){
        float delta = volume_rendering_distance_between_points;
        float alpha_exponent = delta / volume_rendering_reference_distance;
        alpha_corrected = 1.0 - pow(1.0-combined_alpha, alpha_exponent);
    }

    //apply compositing: alpha_out = alpha_in + (1-alpha_in) * alpha;        
    float alpha_in = hit.vol_accumulated_opacity;
    hit.vol_accumulated_opacity = alpha_in + (1.0-alpha_in) * alpha_corrected;
    //apply compositing: C_out = C_in + (1-alpha_in) * C';        
    vec3 C_in = hit.vol_accumulated_color;
    hit.vol_accumulated_color = C_in + (1.0-alpha_in) * combined_color * alpha_corrected;
}

vec4 GetVolumeColorAndOpacity(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index)
{
    float sample_scalar = InterpolateFloat(texture_ftle, sample_position, z_offset);
    vec3 sample_normal = normalize(InterpolateVec3(texture_ftle_gradient, sample_position, z_offset));
    if(!volume_rendering_clamp_scalars){
        if(sample_scalar > max_scalar_ftle || sample_scalar < min_scalar_ftle){
            return vec4(0, 0, 0, 0);
        }
    }

    //apply transfer function
    float t = (sample_scalar - min_scalar_ftle) / (max_scalar_ftle - min_scalar_ftle);
    int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);    
    bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
    vec4 rgba = GetScalarColor(bin, transfer_function_index);
    vec3 color = rgba.rgb;
    float alpha = rgba.a;

    //apply phong shading
    vec3 lightColor = vec3(0, 0, 0);
    vec3 viewDir = -ray.direction;
    vec3 normal = sample_normal;	
    for(int i=0; i<numDirLights; i++)
    {
        GL_DirLight light = GetDirLight(i);
        lightColor += CalcDirLight(light, normal, viewDir);
    }
    lightColor *= color;
    return vec4(lightColor, alpha);
}

vec4 GetVolumeColorAndOpacitySmallestEigenvalue(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index)
{
    float sample_scalar = InterpolateFloat(texture_ftle, sample_position, z_offset);
    vec3 sample_jacoby_direction_x = InterpolateVec3(texture_ftle_jacoby_direction_x, sample_position, z_offset);
    vec3 sample_jacoby_direction_y = InterpolateVec3(texture_ftle_jacoby_direction_y, sample_position, z_offset);
    vec3 sample_jacoby_direction_z = InterpolateVec3(texture_ftle_jacoby_direction_z, sample_position, z_offset);
    vec3 sample_gradient = InterpolateVec3(texture_ftle_gradient, sample_position, z_offset);
    vec3 sample_gradient_normalized = normalize(sample_gradient);

    mat3 sample_hessian = ridges_force_symmetric_hessian ? BuildHessianForceSym(sample_jacoby_direction_x, sample_jacoby_direction_y, sample_jacoby_direction_z) : BuildHessian(sample_jacoby_direction_x, sample_jacoby_direction_y, sample_jacoby_direction_z);
    
    
    //old
    //vec3 new_vec = sample_hessian * sample_gradient;
    //vec3 new_vec_normalized = normalize(new_vec);
    //float scalar = dot(new_vec_normalized, sample_gradient_normalized);
    //new
    float lambda = 0.0;
    vec3 ev = vec3(0,0,0);
    bool ok = mat3RidgeEigen(sample_hessian, lambda, ev);
    float dot_grad_ev = dot(sample_gradient_normalized, ev);
    float scalar = lambda;
    if(!volume_rendering_clamp_scalars){
        if(scalar > max_scalar_ftle || scalar < min_scalar_ftle){
            return vec4(0, 0, 0, 0);
        }
    }

    //apply transfer function
    //float t = (sample_scalar - min_scalar_ftle) / (max_scalar_ftle - min_scalar_ftle);
    //float t = abs(normalize(sample_jacoby_direction_x).x);
    float t = (scalar - min_scalar_ftle) / (max_scalar_ftle - min_scalar_ftle);
    int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
    bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
    vec4 rgba = GetScalarColor(bin, transfer_function_index);
    vec3 color = rgba.rgb;
    float alpha = rgba.a;

    //apply phong shading
    vec3 lightColor = vec3(0, 0, 0);
    vec3 viewDir = -ray.direction;
    vec3 normal = sample_gradient_normalized;	
    for(int i=0; i<numDirLights; i++)
    {
        GL_DirLight light = GetDirLight(i);
        lightColor += CalcDirLight(light, normal, viewDir);
    }
    lightColor *= color;
    return vec4(lightColor, alpha);
}

vec4 GetDirectRidgeVolumeColorAndOpacity(Ray ray, vec3 sample_position, int z_offset, int transfer_function_index)
{
    float sample_scalar = InterpolateFloat(texture_ftle, sample_position, z_offset);
    vec3 sample_jacoby_direction_x = InterpolateVec3(texture_ftle_jacoby_direction_x, sample_position, z_offset);
    vec3 sample_jacoby_direction_y = InterpolateVec3(texture_ftle_jacoby_direction_y, sample_position, z_offset);
    vec3 sample_jacoby_direction_z = InterpolateVec3(texture_ftle_jacoby_direction_z, sample_position, z_offset);
    vec3 sample_gradient = InterpolateVec3(texture_ftle_gradient, sample_position, z_offset);
    vec3 sample_gradient_normalized = normalize(sample_gradient);

    mat3 sample_hessian = ridges_force_symmetric_hessian ? BuildHessianForceSym(sample_jacoby_direction_x, sample_jacoby_direction_y, sample_jacoby_direction_z) : BuildHessian(sample_jacoby_direction_x, sample_jacoby_direction_y, sample_jacoby_direction_z);
    
    //old
    //vec3 new_vec = sample_hessian * sample_gradient;
    //vec3 new_vec_normalized = normalize(new_vec);
    //float scalar = dot(new_vec_normalized, sample_gradient_normalized);
    //new
    float lambda = 0.0;
    vec3 ev = vec3(0,0,0);
    bool ok = mat3RidgeEigen(sample_hessian, lambda, ev);
    float dot_grad_ev = dot(sample_gradient, ev);
    //float scalar = ok ? 1.0 - abs(dot_grad_ev) : 0.0;
    float scalar = ok ? abs(dot_grad_ev) : 10000.0;
    if(!volume_rendering_clamp_scalars){
        if(scalar > max_scalar_ftle || scalar < min_scalar_ftle){
            return vec4(0, 0, 0, 0);
        }
    }

    //apply transfer function
    //float t = (sample_scalar - min_scalar_ftle) / (max_scalar_ftle - min_scalar_ftle);
    //float t = abs(normalize(sample_jacoby_direction_x).x);
    float t = (abs(scalar) - min_scalar_ftle) / (max_scalar_ftle - min_scalar_ftle);
    int bin = int(float(TRANSFER_FUNCTION_LAST_BIN) * t);
    bin = clamp(bin, 0, TRANSFER_FUNCTION_LAST_BIN);
    vec4 rgba = GetScalarColor(bin, transfer_function_index);
    vec3 color = rgba.rgb;
    float alpha = rgba.a;

    //apply phong shading
    vec3 lightColor = vec3(0, 0, 0);
    vec3 viewDir = -ray.direction;
    vec3 normal = sample_gradient_normalized;	
    for(int i=0; i<numDirLights; i++)
    {
        GL_DirLight light = GetDirLight(i);
        lightColor += CalcDirLight(light, normal, viewDir);
    }
    lightColor *= color;
    return vec4(lightColor, alpha);
}
/*
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

////////////////////////////////////////////////////////////////////
//
//                 START REGION UTILITY
//
////////////////////////////////////////////////////////////////////

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
*/

`;