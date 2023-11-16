global.SHADER_MODULE_COMPUTE_PHI = `

vec3 phi(vec3 a, vec3 dir)
{    
    float epsilon_clamp = 0.00001;
    float epsilon_t_exit = 0.000001;
    //a = clamp(a, 0.0+epsilon_clamp, 1.0-epsilon_clamp);//does not seem to be required

    vec3 b = a + dir;  
    int iteration_count_at_border = 0;  
    while(CheckOutOfBounds(b)){
        vec3 dir_normalized = normalize(dir);
        vec3 dir_inv = 1.0/dir_normalized;

        //calculate exit c (the point where ray leaves the current instance)
        //formula: target = origin + t * direction
        //float tar_x = (direction.x > 0) ? 1 : 0;	
        //float tar_y = (direction.y > 0) ? 1 : 0;
        //float tar_z = (direction.z > 0) ? 1 : 0;
        vec3 tar = step(vec3(0,0,0), dir_normalized);
        //float t_x = (tar_x - origin.x) * dir_inv.x;	
        //float t_y = (tar_y - origin.y) * dir_inv.y;	
        //float t_z = (tar_z - origin.z) * dir_inv.z;	
        vec3 t_v = (tar - a) * dir_inv;	
        float t_exit = min(t_v.x, min(t_v.y, t_v.z));	
        t_exit = max(0.0, t_exit);	
        vec3 c = a + t_exit * dir_normalized;

        //Calculate the distance dist between c and b (that is how far we need to go into the next FD)
        float dist = distance(c, b);

        //Apply boundary rule to (c, normalize(dir)) to get c_new and dir_new (because the rules are only valid at the border)
        vec3 dir_new = MoveOutOfBoundsDirection(c, dir_normalized);
        vec3 c_new = MoveOutOfBounds(c);

        //Calculate new b
        b = c_new + dist * normalize(dir_new);

        //Cleanup for next iteration:
        a = c_new;
        dir = b-a;

        //Detect infinite loop when a stays on border
        //if a starts at the border
        if(t_exit < epsilon_t_exit)
        {            
            iteration_count_at_border += 1;
        }        
        if(iteration_count_at_border == 3){
            break;
        }

    }

    b = clamp(b, 0.0+epsilon_clamp, 1.0-epsilon_clamp);

    return b;
}

vec3 phi_track(vec3 a, vec3 dir, inout vec3 pos_r3)
{    
    float epsilon_clamp = 0.00001;
    float epsilon_t_exit = 0.000001;
    //a = clamp(a, 0.0+epsilon_clamp, 1.0-epsilon_clamp);//does not seem to be required

    vec3 b = a + dir;  
    int iteration_count_at_border = 0;  
    while(CheckOutOfBounds(b)){
        vec3 dir_normalized = normalize(dir);
        vec3 dir_inv = 1.0/dir_normalized;

        //calculate exit c (the point where ray leaves the current instance)
        //formula: target = origin + t * direction
        //float tar_x = (direction.x > 0) ? 1 : 0;	
        //float tar_y = (direction.y > 0) ? 1 : 0;
        //float tar_z = (direction.z > 0) ? 1 : 0;
        vec3 tar = step(vec3(0,0,0), dir_normalized);
        //float t_x = (tar_x - origin.x) * dir_inv.x;	
        //float t_y = (tar_y - origin.y) * dir_inv.y;	
        //float t_z = (tar_z - origin.z) * dir_inv.z;	
        vec3 t_v = (tar - a) * dir_inv;	
        float t_exit = min(t_v.x, min(t_v.y, t_v.z));	
        t_exit = max(0.0, t_exit);		
        vec3 c = a + t_exit * dir_normalized;

        //Update the flow tracker variable
        pos_r3 += c - a;

        //Calculate the distance dist between c and b (that is how far we need to go into the next FD)
        float dist = distance(c, b);

        //Apply boundary rule to (c, normalize(dir)) to get c_new and dir_new (because the rules are only valid at the border)
        vec3 dir_new = MoveOutOfBoundsDirection(c, dir_normalized);
        vec3 c_new = MoveOutOfBounds(c);

        //Calculate new b
        b = c_new + dist * normalize(dir_new);

        //Cleanup for next iteration:
        a = c_new;
        dir = b-a;

        //Detect infinite loop when a stays on border
        //if a starts at the border
        if(t_exit < epsilon_t_exit)
        {            
            iteration_count_at_border += 1;
        }        
        if(iteration_count_at_border == 3){
            break;
        }

    }

    b = clamp(b, 0.0+epsilon_clamp, 1.0-epsilon_clamp);

    //Update the flow tracker variable (this is either the entire segment, or the last part that remains in the new FD after exiting the old FD)
    pos_r3 += b - a;
    return b;
}

`;