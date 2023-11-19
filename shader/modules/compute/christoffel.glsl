global.SHADER_MODULE_COMPUTE_CHRISTOFFEL = `

vec3 CorrectionTermChristoffel(vec3 value_sample, vec3 position_sample){
    vec3 correction = vec3(0,0,0);

    //Rename for user convenience
    float u1 = value_sample.x;
    float u2 = value_sample.y;
    float u3 = value_sample.z;
    float x1 = position_sample.x;
    float x2 = position_sample.y;
    float x3 = position_sample.z;
    
    //add christoffel, ijk, i=function, j=direction, k=change
    if(direction == 0)//j=0 (1 in mathematical notation)
    {
        correction.x += covariant_derivative_11k;
        correction.y += covariant_derivative_21k;
        correction.z += covariant_derivative_31k;
    }
    else if(direction == 1)//j=1 (2 in mathematical notation)
    {
        correction.x += covariant_derivative_12k;
        correction.y += covariant_derivative_22k;
        correction.z += covariant_derivative_32k;
    }
    else//j=2 (3 in mathematical notation)
    {
        correction.x += covariant_derivative_13k;
        correction.y += covariant_derivative_23k;
        correction.z += covariant_derivative_33k;
    }

    return correction;
}

`;