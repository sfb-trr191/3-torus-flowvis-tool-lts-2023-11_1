global.SHADER_MODULE_DEFAULT_BISECTION = `

void GetRidgeInformation(bool forward, vec3 sample_position, inout RidgeInformation info){
    int z_offset = forward ? 0 : dim_z;

    float sample_scalar = InterpolateFloat(texture_ftle, sample_position, z_offset);
    vec3 sample_jacoby_direction_x = InterpolateVec3(texture_ftle_jacoby_direction_x, sample_position, z_offset);
    vec3 sample_jacoby_direction_y = InterpolateVec3(texture_ftle_jacoby_direction_y, sample_position, z_offset);
    vec3 sample_jacoby_direction_z = InterpolateVec3(texture_ftle_jacoby_direction_z, sample_position, z_offset);
    vec3 sample_gradient = InterpolateVec3(texture_ftle_gradient, sample_position, z_offset);
    //vec3 sample_gradient_normalized = normalize(sample_gradient);

    mat3 sample_hessian = ridges_force_symmetric_hessian ? BuildHessianForceSym(sample_jacoby_direction_x, sample_jacoby_direction_y, sample_jacoby_direction_z) : BuildHessian(sample_jacoby_direction_x, sample_jacoby_direction_y, sample_jacoby_direction_z);
    
    float lambda = 0.0;
    vec3 ev = vec3(0,0,0);
    bool ok = mat3RidgeEigenNoThreshold(sample_hessian, lambda, ev);

    if(eigen_orientation_method == EIGEN_ORIENTATION_METHOD_X_AXIS && dot(ev, vec3(1,0,0)) > 0.0){
        ev = -ev;
    }
    if(eigen_orientation_method == EIGEN_ORIENTATION_METHOD_Y_AXIS && dot(ev, vec3(0,1,0)) > 0.0){
        ev = -ev;
    }
    if(eigen_orientation_method == EIGEN_ORIENTATION_METHOD_Z_AXIS && dot(ev, vec3(0,0,1)) > 0.0){
        ev = -ev;
    }

    float dot_grad_ev = dot(sample_gradient, ev);

    //RidgeInformation info;
    info.ok = ok;
    info.ev = ev;
    info.dot_grad_ev = dot_grad_ev;
    info.lambda = lambda;
    info.sample_position = sample_position;
    info.ftle_value = sample_scalar;
    //return info;
}

bool IntervalHasSignChange(RidgeInformation info_start, RidgeInformation info_stop){
    float info_stop_dot_grad_ev = info_stop.dot_grad_ev;
    if(eigen_orientation_method == EIGEN_ORIENTATION_METHOD_LOCAL && dot(info_start.ev, info_stop.ev) < 0.0){
        info_stop_dot_grad_ev = -info_stop.dot_grad_ev;
    }
    return (info_start.dot_grad_ev > 0.0) ? (info_stop_dot_grad_ev < 0.0) : (info_stop_dot_grad_ev > 0.0);
}

void BisectInterval(Ray ray, bool forward, float start_distance, float stop_distance, inout HitInformation hit){
        
    vec3 sample_position_start = ray.origin + ray.direction * start_distance;
    vec3 sample_position_stop = ray.origin + ray.direction * stop_distance;

    bool out_start = CheckOutOfBounds(sample_position_start);
    bool out_stop = CheckOutOfBounds(sample_position_stop);
    if(out_start || out_stop){
        return;
    }
    
	RidgeInformation info_start;
	RidgeInformation info_stop;
    RidgeInformation info_center;
    GetRidgeInformation(forward, sample_position_start, info_start);
    GetRidgeInformation(forward, sample_position_stop, info_stop);

    bool has_change = IntervalHasSignChange(info_start, info_stop);
    if(has_change){
        //multiple bisection iterations        
        for(int i=0; i<max_bisection_iterations_per_interval; i++){
            //early termination conditions

            //divide interval at center
            //float center_distance = 0.5 * (start_distance + stop_distance);
            //float total_distance = ray.rayDistance + center_distance;
            //vec3 sample_position_center = ray.origin + ray.direction * center_distance;       
            vec3 sample_position_center = mix(info_start.sample_position, info_stop.sample_position, 0.5);;           
            GetRidgeInformation(forward, sample_position_center, info_center);

            //identify smaller interval
            bool has_change_start = IntervalHasSignChange(info_start, info_center);
            bool has_change_stop = IntervalHasSignChange(info_center, info_stop);
            if(has_change_start){
                info_stop = info_center;
            }
            else if(has_change_stop){
                info_start = info_center;
            }
            else{
                break;
            }
        }

        //get best sample
        bool flag_start_is_best = abs(info_start.dot_grad_ev) <= abs(info_stop.dot_grad_ev) && abs(info_start.dot_grad_ev) <= abs(info_center.dot_grad_ev);
        bool flag_stop_is_best = abs(info_stop.dot_grad_ev) <= abs(info_start.dot_grad_ev) && abs(info_stop.dot_grad_ev) <= abs(info_center.dot_grad_ev);

        RidgeInformation best_info;
        if(flag_start_is_best)
            best_info = info_start;
        else if(flag_stop_is_best)
            best_info = info_stop;
        else
            best_info = info_center;


        //filter
        if(ftle_surface_use_lambda_criterion && best_info.lambda >= 0.0)
            return;

        float ftle_ridge_strength = abs(best_info.lambda);
        if(ftle_ridge_strength < ridge_surface_filter_strength)
            return;

        float ftle_value = best_info.ftle_value;
        if(ftle_value < ridge_surface_filter_ftle)
            return;  

        //hit
        float distance_from_ray_position = distance(ray.origin, best_info.sample_position);
        float total_distance = ray.rayDistance + distance_from_ray_position;
        if((hit.hitType==TYPE_NONE) || (total_distance < hit.distance)){
            hit.hitType = forward ? TYPE_FTLE_SURFACE_FORWARD : TYPE_FTLE_SURFACE_BACKWARD; 
            hit.copy = false;
            hit.multiPolyID = -1;
            hit.distanceToCenter = 0.0;
            hit.positionCenter = best_info.sample_position;//used by output
            hit.position = best_info.sample_position;
            hit.normal = dot(ray.direction, best_info.ev) < 0.0 ? best_info.ev : -best_info.ev;
            hit.distance = total_distance;
            hit.distance_iteration = distance_from_ray_position;//TODO probably wrong
            hit.ignore_override = false;

            hit.ftle_value = ftle_value;
            hit.ftle_ridge_strength = ftle_ridge_strength;
        }

    }

}

void BisectRidges(Ray ray, float distance_exit, inout HitInformation hit, inout HitInformation hitCube)
{
    int sample_index_iteration = 0;
    float delta = volume_rendering_distance_between_points;
    float max_range = min(max_volume_distance, distance_exit);
    while(sample_index_iteration < max_number_of_bisection_intervals){
        //check termination condition
        float start_distance = float(sample_index_iteration) * delta;
        float stop_distance = float(sample_index_iteration+1) * delta;
        
        //global check
        float total_start_distance = ray.rayDistance + start_distance;
        float total_stop_distance = ray.rayDistance + stop_distance;
        
        bool min_range_reached = total_start_distance >= min_volume_distance;
        if(!min_range_reached){            
            sample_index_iteration++;
            continue;
        }

        if(total_start_distance >= max_volume_distance)
            break;
        //end of global check

        bool max_range_reached = stop_distance > max_range;
        if(max_range_reached)
            break;

        if(hit.hitType==TYPE_FTLE_SURFACE_FORWARD || hit.hitType==TYPE_FTLE_SURFACE_BACKWARD)
            break;

#ifdef SHOW_RIDGE_SURFACE_FORWARD
        {
            bool forward = true;
            BisectInterval(ray, forward, start_distance, stop_distance, hit);
        }
#endif
#ifdef SHOW_RIDGE_SURFACE_BACKWARD
        {
            bool forward = false;
            BisectInterval(ray, forward, start_distance, stop_distance, hit);
        }
#endif        

        //prepare next sample
        sample_index_iteration++;
        //END OF LOOP
        //return;

        /*

        float current_distance = ray.rayDistance + sample_distance_iteration;
        //bool max_range_reached = current_distance > max_volume_distance;
        bool min_range_reached = current_distance >= min_volume_distance;
        bool skip_first_fundamental_domain = ray.iteration_count == 0 && volume_skip_first_fundamental_domain;

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
        vec3 sample_position_1 = ray.origin + ray.direction * sample_distance_iteration;
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
*/

    } 
}

`;