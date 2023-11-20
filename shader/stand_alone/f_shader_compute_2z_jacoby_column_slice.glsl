global.F_SHADER_COMPUTE_2Z_JACOBY_COLUMN_SLICE = `#version 300 es

// INPUT TEXTURE
// this shader uses two vector fields as input 
// each of the vector fields has dimensions (dim_x, dim_y, dim_z)
// they are stored together in one texture with dimensions (dim_x, dim_y, 2*dim_z)

// OUTPUT TEXTURE
// this shader calculates a column of the Jacoby matrix of each point of one slice determined by "slice_index"
// the uniform "is_forward" determines which of the two scalar fields is used
// for the backwards scalar field, "dim_z" is added to all indices to access the correct part of the texture
// the output texture has dimensions (dim_x, dim_y)

precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform sampler3D texture_vector_fields;

uniform bool use_forward_and_backward_at_border;
uniform int dim_x;
uniform int dim_y;
uniform int dim_z;
uniform int slice_index;
uniform int direction;//x,y,z = 0,1,2
uniform bool is_forward;
uniform float h2;// h2 = 2h from the equation f'(x_i) = (f(x_{i+1}) - f(x_{i-1})) / (2h)

out vec4 outputColor;

vec3 f(vec3 vector);
vec3 CalculateCentralDifference(int direction, float h2);
vec3 CalculateForwardDifferenceNoPhi(int direction, float h2);
vec3 CalculateBackwardDifferenceNoPhi(int direction, float h2);

const float PI = 3.1415926535897932384626433832795;

const float tubeRadius = 0.0;//dummy for importing utility
const float tubeRadiusOutside = 0.0;//dummy for importing utility
$SHADER_MODULE_SHARED_UTILITY$
$SHADER_MODULE_COMPUTE_BOUNDS$
$SHADER_MODULE_COMPUTE_PHI$
$SHADER_MODULE_COMPUTE_CHRISTOFFEL$

void main()
{   
    if(use_forward_and_backward_at_border){
        int x_index = int(gl_FragCoord[0]);
        int y_index = int(gl_FragCoord[1]);
        int z_index = slice_index;
        if(direction == 0){
            if(x_index == 0){
                vec3 vector = CalculateForwardDifferenceNoPhi(direction, h2);
                outputColor = vec4(vector, 1);
                return;
            }
            if(x_index == dim_x-1){
                vec3 vector = CalculateBackwardDifferenceNoPhi(direction, h2);
                outputColor = vec4(vector, 1);
                return;
            }
        }
        if(direction == 1){
            if(y_index == 0){
                vec3 vector = CalculateForwardDifferenceNoPhi(direction, h2);
                outputColor = vec4(vector, 1);
                return;
            }
            if(y_index == dim_y-1){
                vec3 vector = CalculateBackwardDifferenceNoPhi(direction, h2);
                outputColor = vec4(vector, 1);
                return;
            }
        }
        if(direction == 2){
            if(z_index == 0){
                vec3 vector = CalculateForwardDifferenceNoPhi(direction, h2);
                outputColor = vec4(vector, 1);
                return;
            }
            if(z_index == dim_z-1){
                vec3 vector = CalculateBackwardDifferenceNoPhi(direction, h2);
                outputColor = vec4(vector, 1);
                return;
            }
        }
    }    

    //in all other cases use central difference
    vec3 vector = CalculateCentralDifference(direction, h2);
    outputColor = vec4(vector, 1);
    return;
}

vec3 CalculateCentralDifference(int direction, float h2){
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
    vec3 value_sample = InterpolateVec3(texture_vector_fields, position_sample, z_offset);
    vec3 value_forward = InterpolateVec3(texture_vector_fields, position_forward, z_offset);
    vec3 value_backward = InterpolateVec3(texture_vector_fields, position_backward, z_offset);

    //Calculate central differences without using christoffel symbols
    vec3 central_difference = (value_forward - value_backward) / h2;

    //Correct the central differences using christoffel symbols
    central_difference += CorrectionTermChristoffel(value_sample, position_sample);

    return central_difference;
}

vec3 CalculateForwardDifferenceNoPhi(int direction, float h2){
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
    vec3 value_sample = InterpolateVec3(texture_vector_fields, position_sample, z_offset);
    vec3 value_forward = InterpolateVec3(texture_vector_fields, position_forward, z_offset);

    //Calculate central differences without using christoffel symbols
    vec3 forward_difference = (value_forward - value_sample) / (h2/2.0);

    //Correct the central differences using christoffel symbols
    forward_difference += CorrectionTermChristoffel(value_sample, position_sample);

    return forward_difference;
}

vec3 CalculateBackwardDifferenceNoPhi(int direction, float h2){
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
    vec3 value_sample = InterpolateVec3(texture_vector_fields, position_sample, z_offset);
    vec3 value_backward = InterpolateVec3(texture_vector_fields, position_backward, z_offset);

    //Calculate backward differences without using christoffel symbols
    vec3 backward_difference = (value_sample - value_backward) / (h2/2.0);

    //Correct the backward differences using christoffel symbols
    backward_difference += CorrectionTermChristoffel(value_sample, position_sample);

    return backward_difference;
}

`;