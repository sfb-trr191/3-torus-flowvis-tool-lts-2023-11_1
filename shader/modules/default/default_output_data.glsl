global.SHADER_MODULE_DEFAULT_OUTPUT_DATA = `

vec4 GetOutput(HitInformation hit)
{	    
    int pixel_index = int(gl_FragCoord[0]);
    switch(pixel_index){
        case 0:
            return vec4(hit.hitType, output_x_percentage, output_y_percentage, 0);
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
        default:
            return vec4(0, 0, 0, 0);
    }
}


`;