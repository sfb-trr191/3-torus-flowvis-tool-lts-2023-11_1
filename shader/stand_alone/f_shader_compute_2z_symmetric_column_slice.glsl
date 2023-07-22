global.F_SHADER_COMPUTE_2Z_SYMMETRIC_COLUMN_SLICE = `#version 300 es

// INPUT TEXTURE
// this shader uses 3 textures as input
// each of those textures contains two vector fields
// each of the vector fields has dimensions (dim_x, dim_y, dim_z)
// they are stored together in one texture with dimensions (dim_x, dim_y, 2*dim_z)
// the vector at each point contains one column of the input matrix

// OUTPUT TEXTURE
// this shader calculates a column of the symmetric matrix of each point of one slice determined by "slice_index"
// the uniform "is_forward" determines which of the two scalar fields is used
// for the backwards scalar field, "dim_z" is added to all indices to access the correct part of the texture
// the output texture has dimensions (dim_x, dim_y)

precision highp int;                //high precision required for indices / ids etc.
precision highp isampler3D;         //high precision required for indices / ids etc.
precision highp float;
precision highp sampler3D;

uniform sampler3D texture_column0;
uniform sampler3D texture_column1;
uniform sampler3D texture_column2;

uniform int dim_x;
uniform int dim_y;
uniform int dim_z;
uniform int slice_index;
uniform int column_index;//same as jacoby direction x,y,z = 0,1,2
uniform bool is_forward;

out vec4 outputColor;

const float PI = 3.1415926535897932384626433832795;
//! [0]
void main()
{
    int x = int(gl_FragCoord[0]);
    int y = int(gl_FragCoord[1]);
    int z = is_forward ? slice_index : slice_index + dim_z;
    ivec3 pointer = ivec3(x,y,z);
    vec3 column0 = texelFetch(texture_column0, pointer, 0).rgb;
    vec3 column1 = texelFetch(texture_column1, pointer, 0).rgb;
    vec3 column2 = texelFetch(texture_column2, pointer, 0).rgb;

    vec3 column;
    vec3 row;
    if(column_index == 0){
        column = column0;
        row = vec3(column0.x, column1.x, column2.x);
    }
    else if(column_index == 1){
        column = column1;
        row = vec3(column0.y, column1.y, column2.y);
    }
    else{
        column = column2;
        row = vec3(column0.z, column1.z, column2.z);
    }
    vec3 vector = 0.5 * (column + row);
    outputColor = vec4(vector, 1);
}

`;