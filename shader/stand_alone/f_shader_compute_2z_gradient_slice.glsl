global.F_SHADER_COMPUTE_2Z_GRADIENT_SLICE = `#version 300 es

// INPUT TEXTURE
// this shader uses two scalar fields as input 
// each of the scalar fields has dimensions (dim_x, dim_y, dim_z)
// they are stored together in one texture with dimensions (dim_x, dim_y, 2*dim_z)

// OUTPUT TEXTURE
// this shader calculates the gradients of each point of one slice determined by "slice_index"
// the uniform "is_forward" determines which of the two scalar fields is used
// for the backwards scalar field, "dim_z" is added to all indices to access the correct part of the texture
// the output texture has dimensions (dim_x, dim_y)

precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform sampler3D texture_scalar_fields;

uniform bool use_forward_and_backward_at_border;
uniform int dim_x;
uniform int dim_y;
uniform int dim_z;
uniform int slice_index;
uniform bool is_forward;
uniform float h2_x;// h2 = 2h from the equation f'(x_i) = (f(x_{i+1}) - f(x_{i-1})) / (2h)
uniform float h2_y;// h2 = 2h from the equation f'(x_i) = (f(x_{i+1}) - f(x_{i-1})) / (2h)
uniform float h2_z;// h2 = 2h from the equation f'(x_i) = (f(x_{i+1}) - f(x_{i-1})) / (2h)

out vec4 outputColor;

vec3 f(vec3 vector);
float CalculateCentralDifference(int direction, float h2);
float CalculateForwardDifferenceNoPhi(int direction, float h2);
float CalculateBackwardDifferenceNoPhi(int direction, float h2);

const float PI = 3.1415926535897932384626433832795;

const float tubeRadius = 0.0;//dummy for importing utility
const float tubeRadiusOutside = 0.0;//dummy for importing utility
$SHADER_MODULE_SHARED_UTILITY$
$SHADER_MODULE_COMPUTE_BOUNDS$
$SHADER_MODULE_COMPUTE_PHI$

void main()
{
    float dx;
    float dy;
    float dz;
    if(use_forward_and_backward_at_border){
        int x_index = int(gl_FragCoord[0]);
        int y_index = int(gl_FragCoord[1]);
        int z_index = slice_index;
        //dir 0
        if(x_index == 0)
            dx = CalculateForwardDifferenceNoPhi(0, h2_x);            
        else if(x_index == dim_x-1)
            dx = CalculateBackwardDifferenceNoPhi(0, h2_x);            
        else
            dx = CalculateCentralDifference(0, h2_x);        
        //dir 1
        if(y_index == 0)
            dy = CalculateForwardDifferenceNoPhi(1, h2_y);            
        else if(y_index == dim_y-1)
            dy = CalculateBackwardDifferenceNoPhi(1, h2_y);            
        else
            dy = CalculateCentralDifference(1, h2_y);
        //dir 2
        if(z_index == 0)
            dz = CalculateForwardDifferenceNoPhi(2, h2_z);            
        else if(z_index == dim_z-1)
            dz = CalculateBackwardDifferenceNoPhi(2, h2_z);            
        else
            dz = CalculateCentralDifference(2, h2_z);
    }
    else{
        dx = CalculateCentralDifference(0, h2_x);
        dy = CalculateCentralDifference(1, h2_y);
        dz = CalculateCentralDifference(2, h2_z);
    }
    vec3 vector = vec3(dx, dy, dz);
    outputColor = vec4(vector, 1);
}

float CalculateCentralDifference(int direction, float h2){    
    //z_offset is used to access texture during interpolation
    int z_offset = is_forward ? 0 : dim_z;
    
    //delta_x, delta_y, delta_z are used for calculating position_forward and position_backward
    vec3 delta_x = vec3(1.0/(float(dim_x)-1.0), 0, 0);
    vec3 delta_y = vec3(0, 1.0/(float(dim_y)-1.0), 0);
    vec3 delta_z = vec3(0, 0, 1.0/(float(dim_z)-1.0));
        
    //Get sample/forward/backward positions in R3    
    int x_index = int(gl_FragCoord[0]);
    int y_index = int(gl_FragCoord[1]);
    vec3 position_sample = vec3(float(x_index)/(float(dim_x)-1.0), float(y_index)/(float(dim_y)-1.0), float(slice_index)/(float(dim_z)-1.0));
    vec3 direction_forward = (direction == 0) ? delta_x : (direction == 1) ? delta_y : delta_z;
    vec3 direction_backward = -direction_forward;

    //Transform forward or backward position if necessary (i.e. they are outside the FD)
    vec3 position_forward = phi(position_sample, direction_forward);
    vec3 position_backward = phi(position_sample, direction_backward);

    //Interpolate the values at all 3 positions
    float value_sample = InterpolateFloat(texture_scalar_fields, position_sample, z_offset);
    float value_forward = InterpolateFloat(texture_scalar_fields, position_forward, z_offset);
    float value_backward = InterpolateFloat(texture_scalar_fields, position_backward, z_offset);

    float central_difference = (value_forward - value_backward) / h2;
    return central_difference;
}

float CalculateForwardDifferenceNoPhi(int direction, float h2){    
    //z_offset is used to access texture during interpolation
    int z_offset = is_forward ? 0 : dim_z;
    
    //delta_x, delta_y, delta_z are used for calculating position_forward and position_backward
    vec3 delta_x = vec3(1.0/(float(dim_x)-1.0), 0, 0);
    vec3 delta_y = vec3(0, 1.0/(float(dim_y)-1.0), 0);
    vec3 delta_z = vec3(0, 0, 1.0/(float(dim_z)-1.0));
        
    //Get sample/forward/backward positions in R3    
    int x_index = int(gl_FragCoord[0]);
    int y_index = int(gl_FragCoord[1]);
    vec3 position_sample = vec3(float(x_index)/(float(dim_x)-1.0), float(y_index)/(float(dim_y)-1.0), float(slice_index)/(float(dim_z)-1.0));
    vec3 direction_forward = (direction == 0) ? delta_x : (direction == 1) ? delta_y : delta_z;

    //Transform forward or backward position if necessary (i.e. they are outside the FD)
    vec3 position_forward = position_sample + direction_forward;

    //Interpolate the values at all 3 positions
    float value_sample = InterpolateFloat(texture_scalar_fields, position_sample, z_offset);
    float value_forward = InterpolateFloat(texture_scalar_fields, position_forward, z_offset);

    float forward_difference = (value_forward - value_sample) / (h2/2.0);
    return forward_difference;
}

float CalculateBackwardDifferenceNoPhi(int direction, float h2){    
    //z_offset is used to access texture during interpolation
    int z_offset = is_forward ? 0 : dim_z;
    
    //delta_x, delta_y, delta_z are used for calculating position_forward and position_backward
    vec3 delta_x = vec3(1.0/(float(dim_x)-1.0), 0, 0);
    vec3 delta_y = vec3(0, 1.0/(float(dim_y)-1.0), 0);
    vec3 delta_z = vec3(0, 0, 1.0/(float(dim_z)-1.0));
        
    //Get sample/forward/backward positions in R3    
    int x_index = int(gl_FragCoord[0]);
    int y_index = int(gl_FragCoord[1]);
    vec3 position_sample = vec3(float(x_index)/(float(dim_x)-1.0), float(y_index)/(float(dim_y)-1.0), float(slice_index)/(float(dim_z)-1.0));
    vec3 direction_forward = (direction == 0) ? delta_x : (direction == 1) ? delta_y : delta_z;
    vec3 direction_backward = -direction_forward;

    //Transform forward or backward position if necessary (i.e. they are outside the FD)
    vec3 position_backward = position_sample + direction_backward;

    //Interpolate the values at all 3 positions
    float value_sample = InterpolateFloat(texture_scalar_fields, position_sample, z_offset);
    float value_backward = InterpolateFloat(texture_scalar_fields, position_backward, z_offset);

    float backward_difference = (value_sample - value_backward) / (h2/2.0);
    return backward_difference;
}

`;