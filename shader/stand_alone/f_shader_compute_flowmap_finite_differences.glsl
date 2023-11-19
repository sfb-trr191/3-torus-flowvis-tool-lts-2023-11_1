global.F_SHADER_COMPUTE_FLOWMAP_FINITE_DIFFERENCES = `#version 300 es
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
vec3 CorrectionTerm(vec3 value_sample, vec3 position_sample);

const float PI = 3.1415926535897932384626433832795;

$SHADER_MODULE_COMPUTE_BOUNDS$
$SHADER_MODULE_COMPUTE_PHI$

void main()
{    
    if(true){
        vec3 central_difference = CalculateCentralDifference(direction, h2);
        outputColor = vec4(central_difference,1);
        return;
    }

    //OLD METHOD BELOW

    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);

    int forward_x = x;
    int forward_y = y;
    int forward_z = slice_index;

    int backward_x = x;
    int backward_y = y;
    int backward_z = slice_index;

    //identify the correct neighboring index. always +1 and -1 because flowmap is padded.
    //direction X
    if(direction == 0){
        forward_x += 1;
        backward_x -= 1;
    }
    //direction Y
    else if(direction == 1){
        forward_y += 1;
        backward_y -= 1;
    }
    //direction Z
    else{
        forward_z += 1;  
        backward_z -= 1;
    }
    //offset for backward data
    if(!is_forward){
        forward_z += dim_z+2; 
        backward_z += dim_z+2;
    }

    ivec3 extended_offset = ivec3(1,1,1);
    ivec3 pointer = ivec3(forward_x,forward_y,forward_z);
    vec3 forward_value = texelFetch(texture_flow_map, pointer+extended_offset, 0).rgb;
    
    pointer = ivec3(backward_x,backward_y,backward_z);
    vec3 backward_value = texelFetch(texture_flow_map, pointer+extended_offset, 0).rgb;

    vec3 central_difference = (forward_value - backward_value) / h2;
    outputColor = vec4(central_difference,1);     
}

void ReadFlowmapValues(inout vec3 value_sample, inout vec3 value_forward, inout vec3 value_backward){
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);

    int forward_x = x;
    int forward_y = y;
    int forward_z = slice_index;

    int backward_x = x;
    int backward_y = y;
    int backward_z = slice_index;

    //identify the correct neighboring index. always +1 and -1 because flowmap is padded.
    //direction X
    if(direction == 0){
        forward_x += 1;
        backward_x -= 1;
    }
    //direction Y
    else if(direction == 1){
        forward_y += 1;
        backward_y -= 1;
    }
    //direction Z
    else{
        forward_z += 1;  
        backward_z -= 1;
    }
    //offset for backward data
    if(!is_forward){
        forward_z += dim_z+2; 
        backward_z += dim_z+2;
    }

    ivec3 extended_offset = ivec3(1,1,1);

    ivec3 pointer = ivec3(x,y,slice_index);
    value_sample = texelFetch(texture_flow_map, pointer+extended_offset, 0).rgb;

    pointer = ivec3(forward_x,forward_y,forward_z);
    value_forward = texelFetch(texture_flow_map, pointer+extended_offset, 0).rgb;

    pointer = ivec3(backward_x,backward_y,backward_z);
    value_backward = texelFetch(texture_flow_map, pointer+extended_offset, 0).rgb;
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
    
    //Grab relative flow result from flow map
    vec3 value_sample;
    vec3 value_forward;
    vec3 value_backward;
    ReadFlowmapValues(value_sample, value_forward, value_backward);

    //Add the starting positions and relative positions
    value_sample += position_sample;
    value_forward += position_sample + direction_forward;
    value_backward += position_sample + direction_backward;

    //Calculate central differences without using christoffel symbols
    vec3 central_difference = (value_forward - value_backward) / h2;

    //Correct the central differences using christoffel symbols
    central_difference += CorrectionTerm(value_sample, position_sample);
    
    return central_difference;
}

vec3 CorrectionTerm(vec3 value_sample, vec3 position_sample){
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