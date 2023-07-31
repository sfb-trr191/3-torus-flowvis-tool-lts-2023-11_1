global.SHADER_MODULE_DEFAULT_OUTPUT_DATA = `

vec4 GetOutput(HitInformation hit)
{	    
    int pixel_index = int(gl_FragCoord[0]);
    switch(pixel_index){
        case 0:
            return vec4(hit.hitType, output_x_percentage, output_y_percentage, hit.distance);
        case 1:
            if(hit.hitType == TYPE_STREAMLINE_SEGMENT){
                return vec4(hit.multiPolyID, hit.cost, 0, 0);
            }
            return vec4(-1, 0, 0, 0);
        case 2:
            return vec4(hit.position[0], hit.position[1], hit.position[2], 0);
        case 3:
            return vec4(hit.positionCenter[0], hit.positionCenter[1], hit.positionCenter[2], 0);
        case 4:
            return vec4(hit.light_direction[0], hit.light_direction[1], hit.light_direction[2], 0);
        //debugging:
        case 5:
            return vec4(hit.ftle_value, hit.ftle_ridge_strength, 0, 0);
        /*
            float test_value = 8.0;
            //vec3 lambda = vec3(0,0,0);
            //mat3 matrix = mat3(vec3(1,-2,4), vec3(-2,1,3), vec3(4,3,1));
            mat3 matrix = mat3(vec3(1,6,4), vec3(2,5,8), vec3(3,9,7));
            //mat3eigenvalues(matrix, lambda);
            float lambda = 0.0;
            vec3 ev = vec3(0,0,0);
            bool ok = mat3RidgeEigen(matrix, lambda, ev);
            return vec4(ev[0],ev[1],ev[2],lambda);
            */
        default:
            return vec4(0, 0, 0, 0);
    }
}


`;