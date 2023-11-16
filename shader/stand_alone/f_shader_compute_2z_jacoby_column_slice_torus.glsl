global.F_SHADER_COMPUTE_2Z_JACOBY_COLUMN_SLICE_TORUS = `#version 300 es

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
//! [0]
void main()
{
    vec3 vector = CalculateCentralDifference(direction, h2);
    outputColor = vec4(vector, 1);
}

vec3 CalculateCentralDifference(int direction, float h2){
    //MARKER_MODIFIED_STREAMLINE_CALCULATION
    //TODO: do not identify neighboring nodes, instead use the boundary rules, the new phi function, trilinear interpolation   
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


    ivec3 pointer = ivec3(forward_x,forward_y,forward_z);
    vec3 forward_value = texelFetch(texture_vector_fields, pointer, 0).rgb;
    
    pointer = ivec3(backward_x,backward_y,backward_z);
    vec3 backward_value = texelFetch(texture_vector_fields, pointer, 0).rgb;

    vec3 central_difference = (forward_value - backward_value) / h2;
    return central_difference;
}

`;