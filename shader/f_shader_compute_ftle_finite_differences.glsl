global.F_SHADER_COMPUTE_FTLE_FINITE_DIFFERENCES = `#version 300 es
precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform sampler3D texture_ftle;

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

const float PI = 3.1415926535897932384626433832795;
//! [0]
void main()
{
    float dx = CalculateCentralDifference(0, h2_x);
    float dy = CalculateCentralDifference(1, h2_y);
    float dz = CalculateCentralDifference(2, h2_z);
    outputColor = vec4(dx, dy, dz, 1);
    //outputColor = vec4(x,y,slice_index,1);
    //outputColor = vec4(forward_value,1);
}

float CalculateCentralDifference(int direction, float h2){
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);

    int forward_x = x;
    int forward_y = y;
    int forward_z = slice_index;

    int backward_x = x;
    int backward_y = y;
    int backward_z = slice_index;

    //identify the correct neighboring index. usually +1 and -1, wrap around at the border.
    //direction X
    if(direction == 0){
        forward_x += 1;
        if(forward_x == dim_x)
            forward_x = 1;

        backward_x -= 1;
        if(backward_x == -1)
            backward_x = dim_x-2;
    }
    //direction Y
    else if(direction == 1){
        forward_y += 1;
        if(forward_y == dim_y)
            forward_y = 1;

        backward_y -= 1;
        if(backward_y == -1)
            backward_y = dim_y-2;
    }
    //direction Z
    else{
        forward_z += 1;  
        if(forward_z == dim_z)
            forward_z = 1;   

        backward_z -= 1;
        if(backward_z == -1)
            backward_z = dim_z-2;
    }

    if(!is_forward){
        forward_z += dim_z; 
        backward_z += dim_z;
    }

    //ivec3 pointer = ivec3(x,y,slice_index);
    //vec3 value = texelFetch(texture_ftle, pointer, 0).r;
    //ivec3 extended_offset = ivec3(1,1,1);
    ivec3 pointer = ivec3(forward_x,forward_y,forward_z);
    float forward_value = texelFetch(texture_ftle, pointer, 0).r;
    
    pointer = ivec3(backward_x,backward_y,backward_z);
    float backward_value = texelFetch(texture_ftle, pointer, 0).r;

    float central_difference = (forward_value - backward_value) / h2;
    return central_difference;
}

`;