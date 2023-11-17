global.F_SHADER_COMPUTE_FLOWMAP_FINITE_DIFFERENCES_QUOTIENT_SPACE = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform sampler3D texture_flow_map;

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

const float PI = 3.1415926535897932384626433832795;

vec3 InterpolateVec3(sampler3D texture, vec3 texture_coordinate, int z_offset);

const float tubeRadius = 0.0;//dummy for importing utility
const float tubeRadiusOutside = 0.0;//dummy for importing utility
const float epsilon_move_ray = 0.0000001;//DUMMY
const float epsilon_out_of_bounds = 0.0;//00001;//DUMMY
$SHADER_MODULE_SHARED_UTILITY$
$SHADER_MODULE_COMPUTE_BOUNDS$
$SHADER_MODULE_COMPUTE_PHI$

void main()
{    
    vec3 vector = CalculateCentralDifference(direction, h2);
    outputColor = vec4(vector, 1);
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
    vec3 value_sample = InterpolateVec3(texture_flow_map, position_sample, z_offset);
    vec3 value_forward = InterpolateVec3(texture_flow_map, position_forward, z_offset);
    vec3 value_backward = InterpolateVec3(texture_flow_map, position_backward, z_offset);

    //Calculate central differences without using christoffel symbols
    vec3 central_difference = (value_forward - value_backward) / h2;

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
        central_difference.x += covariant_derivative_11k;
        central_difference.y += covariant_derivative_21k;
        central_difference.z += covariant_derivative_31k;
    }
    else if(direction == 1)//j=1 (2 in mathematical notation)
    {
        central_difference.x += covariant_derivative_12k;
        central_difference.y += covariant_derivative_22k;
        central_difference.z += covariant_derivative_32k;
    }
    else//j=2 (3 in mathematical notation)
    {
        central_difference.x += covariant_derivative_13k;
        central_difference.y += covariant_derivative_23k;
        central_difference.z += covariant_derivative_33k;
    }
    
    return central_difference;
}

`;