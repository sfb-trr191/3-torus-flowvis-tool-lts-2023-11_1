global.SHADER_MODULE_S3_OUTPUT_DATA = `

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
            return hit.position;
        case 3:
            return hit.positionCenter;
        case 4:
            return hit.light_direction;       
        default:
            return vec4(0, 0, 0, 0);
    }
}


`;