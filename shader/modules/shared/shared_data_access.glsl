global.SHADER_MODULE_SHARED_DATA_ACCESS = `

////////////////////////////////////////////////////////////////////
//
//                 START REGION MEMORY ACCESS
//
////////////////////////////////////////////////////////////////////

//DATA SIZES
const int POSITION_DATA_FLOAT_COUNT = 8;
const int POSITION_DATA_INT_COUNT = 0;
const int LINE_SEGMENT_FLOAT_COUNT = 160;//128;//32 for two matrices
const int LINE_SEGMENT_INT_COUNT = 8;
const int TREE_NODE_FLOAT_COUNT = 8;
const int TREE_NODE_INT_COUNT = 4;
const int DIR_LIGHT_FLOAT_COUNT = 16;
const int DIR_LIGHT_INT_COUNT = 0;
const int STREAMLINE_COLOR_FLOAT_COUNT = 4;
const int STREAMLINE_COLOR_INT_COUNT = 0;
const int STREAMLINE_SEED_FLOAT_COUNT = 4;
const int STREAMLINE_SEED_INT_COUNT = 0;
const int CYLINDER_FLOAT_COUNT = 64;
const int CYLINDER_INT_COUNT = 0;

//LOD DATA
uniform int start_index_int_position_data0;
uniform int start_index_float_position_data0;
uniform int start_index_int_line_segments0;
uniform int start_index_float_line_segments0;
uniform int start_index_int_tree_nodes0;
uniform int start_index_float_tree_nodes0;

uniform int start_index_int_position_data1;
uniform int start_index_float_position_data1;
uniform int start_index_int_line_segments1;
uniform int start_index_float_line_segments1;
uniform int start_index_int_tree_nodes1;
uniform int start_index_float_tree_nodes1;

//LOD DATA
uniform int start_index_dynamic_int_position_data0;
uniform int start_index_dynamic_float_position_data0;
uniform int start_index_dynamic_int_line_segments0;
uniform int start_index_dynamic_float_line_segments0;
uniform int start_index_dynamic_int_tree_nodes0;
uniform int start_index_dynamic_float_tree_nodes0;

uniform int start_index_dynamic_int_position_data1;
uniform int start_index_dynamic_float_position_data1;
uniform int start_index_dynamic_int_line_segments1;
uniform int start_index_dynamic_float_line_segments1;
uniform int start_index_dynamic_int_tree_nodes1;
uniform int start_index_dynamic_float_tree_nodes1;

const int test_value = 1;

//GLOBAL DATA
uniform int start_index_int_dir_lights;
uniform int start_index_float_dir_lights;
uniform int start_index_int_streamline_color;
uniform int start_index_float_streamline_color;
uniform int start_index_int_scalar_color;
uniform int start_index_float_scalar_color;
uniform int start_index_int_cylinder;
uniform int start_index_float_cylinder;
uniform int start_index_int_seeds;
uniform int start_index_float_seeds;

//TEXTURE
const int tex_n_x = 512;
const int tex_n_y = 512;
const int tex_ny_nx = tex_n_y * tex_n_x;
ivec3 GetIndex3D(int global_index)
{  
  int z = global_index / tex_ny_nx;
  int y = (global_index % tex_ny_nx) / tex_n_x;
  int x = (global_index % tex_ny_nx) % tex_n_x;
  return ivec3(x,y,z);
}

////////////////////////////////////////////////////////////////////
//
//                START REGION ACCESS LOD TEXTURE
//
////////////////////////////////////////////////////////////////////


/*

uniform int start_index_dynamic_int_position_data0;
uniform int start_index_dynamic_float_position_data0;
uniform int start_index_dynamic_int_line_segments0;
uniform int start_index_dynamic_float_line_segments0;
uniform int start_index_dynamic_int_tree_nodes0;
uniform int start_index_dynamic_float_tree_nodes0;

uniform int start_index_dynamic_int_position_data1;
uniform int start_index_dynamic_float_position_data1;
uniform int start_index_dynamic_int_line_segments1;
uniform int start_index_dynamic_float_line_segments1;
uniform int start_index_dynamic_int_tree_nodes1;
uniform int start_index_dynamic_float_tree_nodes1;

*/

int GetStartIndexIntPositionData(int part_index, bool dynamic){
    if(dynamic)
        return part_index == 0 ? start_index_dynamic_int_position_data0 : start_index_dynamic_int_position_data1;
    return part_index == 0 ? start_index_int_position_data0 : start_index_int_position_data1;
}

int GetStartIndexFloatPositionData(int part_index, bool dynamic){
    if(dynamic)
        return part_index == 0 ? start_index_dynamic_float_position_data0 : start_index_dynamic_float_position_data1;
    return part_index == 0 ? start_index_float_position_data0 : start_index_float_position_data1;
}

int GetStartIndexIntLineSegments(int part_index, bool dynamic){
    if(dynamic)
        return part_index == 0 ? start_index_dynamic_int_line_segments0 : start_index_dynamic_int_line_segments1;
    return part_index == 0 ? start_index_int_line_segments0 : start_index_int_line_segments1;
}

int GetStartIndexFloatLineSegments(int part_index, bool dynamic){
    if(dynamic)
        return part_index == 0 ? start_index_dynamic_float_line_segments0 : start_index_dynamic_float_line_segments1;
    return part_index == 0 ? start_index_float_line_segments0 : start_index_float_line_segments1;
}

int GetStartIndexIntTreeNodes(int part_index, bool dynamic){
    if(dynamic)
        return part_index == 0 ? start_index_dynamic_int_tree_nodes0 : start_index_dynamic_int_tree_nodes1;
    return part_index == 0 ? start_index_int_tree_nodes0 : start_index_int_tree_nodes1;
}

int GetStartIndexFloatTreeNodes(int part_index, bool dynamic){
    if(dynamic)
        return part_index == 0 ? start_index_dynamic_float_tree_nodes0 : start_index_dynamic_float_tree_nodes1;
    return part_index == 0 ? start_index_float_tree_nodes0 : start_index_float_tree_nodes1;
}

vec3 GetPosition_dynamic(bool dynamic, int index, int part_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index, dynamic) + index * POSITION_DATA_FLOAT_COUNT);
    float x = texelFetch(texture_dynamic_float, pointer+ivec3(0,0,0), 0).r;
    float y = texelFetch(texture_dynamic_float, pointer+ivec3(1,0,0), 0).r;
    float z = texelFetch(texture_dynamic_float, pointer+ivec3(2,0,0), 0).r;  
    vec3 position = vec3(x, y, z);
    if(projection_index >=0)
        position[projection_index] = 0.0;

    return position;
}
vec3 GetPosition_static(bool dynamic, int index, int part_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index, dynamic) + index * POSITION_DATA_FLOAT_COUNT);
    float x = texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r;
    float y = texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r;
    float z = texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r;  
    vec3 position = vec3(x, y, z);
    if(projection_index >=0)
        position[projection_index] = 0.0;

    return position;
}
vec3 GetPosition(bool dynamic, int index, int part_index)
{
    return dynamic ? GetPosition_dynamic(dynamic, index, part_index) : GetPosition_static(dynamic, index, part_index);
}

vec4 GetPosition4D_dynamic(bool dynamic, int index, int part_index, int ray_projection_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index, dynamic) + index * POSITION_DATA_FLOAT_COUNT);
    float x = texelFetch(texture_dynamic_float, pointer+ivec3(0,0,0), 0).r;
    float y = texelFetch(texture_dynamic_float, pointer+ivec3(1,0,0), 0).r;
    float z = texelFetch(texture_dynamic_float, pointer+ivec3(2,0,0), 0).r;  
    float w = texelFetch(texture_dynamic_float, pointer+ivec3(3,0,0), 0).r;  
    vec4 position = vec4(x, y, z, w);
    if(ray_projection_index >=0)
        position[ray_projection_index] = 0.0;

    return position;
}
vec4 GetPosition4D_static(bool dynamic, int index, int part_index, int ray_projection_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index, dynamic) + index * POSITION_DATA_FLOAT_COUNT);
    float x = texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r;
    float y = texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r;
    float z = texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r;  
    float w = texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r;  
    vec4 position = vec4(x, y, z, w);
    if(ray_projection_index >=0)
        position[ray_projection_index] = 0.0;

    return position;
}
vec4 GetPosition4D(bool dynamic, int index, int part_index, int ray_projection_index)
{
    return dynamic ? GetPosition4D_dynamic(dynamic, index, part_index, ray_projection_index) : GetPosition4D_static(dynamic, index, part_index, ray_projection_index);
}

float GetCost_dynamic(bool dynamic, int index, int part_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index, dynamic) + index * POSITION_DATA_FLOAT_COUNT);
    float cost = texelFetch(texture_dynamic_float, pointer+ivec3(4,0,0), 0).r;
    return cost;
}
float GetCost_static(bool dynamic, int index, int part_index)
{
    ivec3 pointer = GetIndex3D(GetStartIndexFloatPositionData(part_index, dynamic) + index * POSITION_DATA_FLOAT_COUNT);
    float cost = texelFetch(texture_float, pointer+ivec3(4,0,0), 0).r;
    return cost;
}
float GetCost(bool dynamic, int index, int part_index)
{
    return dynamic ? GetCost_dynamic(dynamic, index, part_index) : GetCost_static(dynamic, index, part_index);
}

float GetVelocity_dynamic(bool dynamic, int index, int part_index)
{
    float velocity = 1.0;//DUMMY
    return velocity;
}
float GetVelocity_static(bool dynamic, int index, int part_index)
{
    float velocity = 1.0;//DUMMY
    return velocity;
}
float GetVelocity(bool dynamic, int index, int part_index)
{
    return dynamic ? GetVelocity_dynamic(dynamic, index, part_index) : GetVelocity_static(dynamic, index, part_index);
}

//********************************************************** 

GL_LineSegment GetLineSegment_dynamic(bool dynamic, int index, int part_index)
{
	GL_LineSegment segment;
	ivec3 pointer = GetIndex3D(GetStartIndexIntLineSegments(part_index, dynamic) + index * LINE_SEGMENT_INT_COUNT);
	segment.indexA = texelFetch(texture_dynamic_int, pointer+ivec3(0,0,0), 0).r;
	segment.indexB = texelFetch(texture_dynamic_int, pointer+ivec3(1,0,0), 0).r;
	segment.multiPolyID = texelFetch(texture_dynamic_int, pointer+ivec3(2,0,0), 0).r;
	segment.copy = texelFetch(texture_dynamic_int, pointer+ivec3(3,0,0), 0).r;
	segment.isBeginning = texelFetch(texture_dynamic_int, pointer+ivec3(4,0,0), 0).r;

	pointer = GetIndex3D(GetStartIndexFloatLineSegments(part_index, dynamic) + index * LINE_SEGMENT_FLOAT_COUNT
        + 32 * (projection_index+1));//projection_index = -1 is no projection (default)
  	segment.matrix = mat4(
		texelFetch(texture_dynamic_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(3,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(7,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(11,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(15,0,0), 0).r
  	);
	segment.matrix_inv = mat4(
		texelFetch(texture_dynamic_float, pointer+ivec3(16,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(17,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(18,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(19,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(20,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(21,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(22,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(23,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(24,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(25,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(26,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(27,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(28,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(29,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(30,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(31,0,0), 0).r
  	);
  return segment;
}
GL_LineSegment GetLineSegment_static(bool dynamic, int index, int part_index)
{
	GL_LineSegment segment;
	ivec3 pointer = GetIndex3D(GetStartIndexIntLineSegments(part_index, dynamic) + index * LINE_SEGMENT_INT_COUNT);
	segment.indexA = texelFetch(texture_int, pointer+ivec3(0,0,0), 0).r;
	segment.indexB = texelFetch(texture_int, pointer+ivec3(1,0,0), 0).r;
	segment.multiPolyID = texelFetch(texture_int, pointer+ivec3(2,0,0), 0).r;
	segment.copy = texelFetch(texture_int, pointer+ivec3(3,0,0), 0).r;
	segment.isBeginning = texelFetch(texture_int, pointer+ivec3(4,0,0), 0).r;

	pointer = GetIndex3D(GetStartIndexFloatLineSegments(part_index, dynamic) + index * LINE_SEGMENT_FLOAT_COUNT
        + 32 * (projection_index+1));//projection_index = -1 is no projection (default)
  	segment.matrix = mat4(
		texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(7,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(11,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(15,0,0), 0).r
  	);
	segment.matrix_inv = mat4(
		texelFetch(texture_float, pointer+ivec3(16,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(17,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(18,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(19,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(20,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(21,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(22,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(23,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(24,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(25,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(26,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(27,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(28,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(29,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(30,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(31,0,0), 0).r
  	);
  return segment;
}
GL_LineSegment GetLineSegment(bool dynamic, int index, int part_index)
{
    if(dynamic)
	    return GetLineSegment_dynamic(dynamic, index, part_index);
    return GetLineSegment_static(dynamic, index, part_index);
}














GL_LineSegment GetLineSegment_dynamic(bool dynamic, int index, int part_index, int ray_projection_index)
{
	GL_LineSegment segment;
	ivec3 pointer = GetIndex3D(GetStartIndexIntLineSegments(part_index, dynamic) + index * LINE_SEGMENT_INT_COUNT);
	segment.indexA = texelFetch(texture_dynamic_int, pointer+ivec3(0,0,0), 0).r;
	segment.indexB = texelFetch(texture_dynamic_int, pointer+ivec3(1,0,0), 0).r;
	segment.multiPolyID = texelFetch(texture_dynamic_int, pointer+ivec3(2,0,0), 0).r;
	segment.copy = texelFetch(texture_dynamic_int, pointer+ivec3(3,0,0), 0).r;
	segment.isBeginning = texelFetch(texture_dynamic_int, pointer+ivec3(4,0,0), 0).r;

	pointer = GetIndex3D(GetStartIndexFloatLineSegments(part_index, dynamic) + index * LINE_SEGMENT_FLOAT_COUNT
        + 32 * (ray_projection_index+1));//projection_index = -1 is no projection (default)
  	segment.matrix = mat4(
		texelFetch(texture_dynamic_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(3,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(7,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(11,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(15,0,0), 0).r
  	);
	segment.matrix_inv = mat4(
		texelFetch(texture_dynamic_float, pointer+ivec3(16,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(17,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(18,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(19,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(20,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(21,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(22,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(23,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(24,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(25,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(26,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(27,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(28,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(29,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(30,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(31,0,0), 0).r
  	);
  return segment;
}
GL_LineSegment GetLineSegment_static(bool dynamic, int index, int part_index, int ray_projection_index)
{
	GL_LineSegment segment;
	ivec3 pointer = GetIndex3D(GetStartIndexIntLineSegments(part_index, dynamic) + index * LINE_SEGMENT_INT_COUNT);
	segment.indexA = texelFetch(texture_int, pointer+ivec3(0,0,0), 0).r;
	segment.indexB = texelFetch(texture_int, pointer+ivec3(1,0,0), 0).r;
	segment.multiPolyID = texelFetch(texture_int, pointer+ivec3(2,0,0), 0).r;
	segment.copy = texelFetch(texture_int, pointer+ivec3(3,0,0), 0).r;
	segment.isBeginning = texelFetch(texture_int, pointer+ivec3(4,0,0), 0).r;

	pointer = GetIndex3D(GetStartIndexFloatLineSegments(part_index, dynamic) + index * LINE_SEGMENT_FLOAT_COUNT
        + 32 * (ray_projection_index+1));//projection_index = -1 is no projection (default)
  	segment.matrix = mat4(
		texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(7,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(11,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(15,0,0), 0).r
  	);
	segment.matrix_inv = mat4(
		texelFetch(texture_float, pointer+ivec3(16,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(17,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(18,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(19,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(20,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(21,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(22,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(23,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(24,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(25,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(26,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(27,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(28,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(29,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(30,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(31,0,0), 0).r
  	);
  return segment;
}
GL_LineSegment GetLineSegment(bool dynamic, int index, int part_index, int ray_projection_index)
{
    if(dynamic)
	return GetLineSegment_dynamic(dynamic, index, part_index, ray_projection_index);
    return GetLineSegment_static(dynamic, index, part_index, ray_projection_index);
}

//********************************************************** 

GL_TreeNode GetNode_dynamic(bool dynamic, int index, int part_index)
{
	GL_TreeNode node;
	ivec3 pointer = GetIndex3D(GetStartIndexIntTreeNodes(part_index, dynamic) + index * TREE_NODE_INT_COUNT);
	node.hitLink = texelFetch(texture_dynamic_int, pointer+ivec3(0,0,0), 0).r;
	node.missLink = texelFetch(texture_dynamic_int, pointer+ivec3(1,0,0), 0).r;
	node.objectIndex = texelFetch(texture_dynamic_int, pointer+ivec3(2,0,0), 0).r;//segmentIndex TODO rename?
	node.type = texelFetch(texture_dynamic_int, pointer+ivec3(3,0,0), 0).r;
	return node;
}
GL_TreeNode GetNode_static(bool dynamic, int index, int part_index)
{
	GL_TreeNode node;
	ivec3 pointer = GetIndex3D(GetStartIndexIntTreeNodes(part_index, dynamic) + index * TREE_NODE_INT_COUNT);
	node.hitLink = texelFetch(texture_int, pointer+ivec3(0,0,0), 0).r;
	node.missLink = texelFetch(texture_int, pointer+ivec3(1,0,0), 0).r;
	node.objectIndex = texelFetch(texture_int, pointer+ivec3(2,0,0), 0).r;//segmentIndex TODO rename?
	node.type = texelFetch(texture_int, pointer+ivec3(3,0,0), 0).r;
	return node;
}
GL_TreeNode GetNode(bool dynamic, int index, int part_index)
{
    if(dynamic)
	    return GetNode_dynamic(dynamic, index, part_index);
    return GetNode_static(dynamic, index, part_index);
}

GL_AABB GetAABB_dynamic(bool dynamic, int index, int part_index)
{
    float tube_radius = GetTubeRadius(part_index);

	GL_AABB aabb;
	ivec3 pointer = GetIndex3D(GetStartIndexFloatTreeNodes(part_index, dynamic) + index * TREE_NODE_FLOAT_COUNT);
	aabb.min = vec4(
		texelFetch(texture_dynamic_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(3,0,0), 0).r//unnecessary
	);
	aabb.max = vec4(
		texelFetch(texture_dynamic_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(7,0,0), 0).r//unnecessary
	);

    if(projection_index >=0)
    {
        aabb.min[projection_index] = -tube_radius;
        aabb.max[projection_index] = tube_radius;
    }
	return aabb;
}
GL_AABB GetAABB_static(bool dynamic, int index, int part_index)
{
    float tube_radius = GetTubeRadius(part_index);

	GL_AABB aabb;
	ivec3 pointer = GetIndex3D(GetStartIndexFloatTreeNodes(part_index, dynamic) + index * TREE_NODE_FLOAT_COUNT);
	aabb.min = vec4(
		texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r//unnecessary
	);
	aabb.max = vec4(
		texelFetch(texture_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(7,0,0), 0).r//unnecessary
	);

    if(projection_index >=0)
    {
        aabb.min[projection_index] = -tube_radius;
        aabb.max[projection_index] = tube_radius;
    }
	return aabb;
}
GL_AABB GetAABB(bool dynamic, int index, int part_index)
{
    if(dynamic)
	    return GetAABB_dynamic(dynamic, index, part_index);
    return GetAABB_static(dynamic, index, part_index);
}

GL_AABB GetAABB_dynamic(bool dynamic, int index, int part_index, int ray_projection_index)
{
    float tube_radius = GetTubeRadius(part_index);

	GL_AABB aabb;
	ivec3 pointer = GetIndex3D(GetStartIndexFloatTreeNodes(part_index, dynamic) + index * TREE_NODE_FLOAT_COUNT);
	aabb.min = vec4(
		texelFetch(texture_dynamic_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(3,0,0), 0).r//unnecessary
	);
	aabb.max = vec4(
		texelFetch(texture_dynamic_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_dynamic_float, pointer+ivec3(7,0,0), 0).r//unnecessary
	);

    if(ray_projection_index >=0)
    {
        aabb.min[ray_projection_index] = -tube_radius;
        aabb.max[ray_projection_index] = tube_radius;
    }
	return aabb;
}
GL_AABB GetAABB_static(bool dynamic, int index, int part_index, int ray_projection_index)
{
    float tube_radius = GetTubeRadius(part_index);

	GL_AABB aabb;
	ivec3 pointer = GetIndex3D(GetStartIndexFloatTreeNodes(part_index, dynamic) + index * TREE_NODE_FLOAT_COUNT);
	aabb.min = vec4(
		texelFetch(texture_float, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(3,0,0), 0).r//unnecessary
	);
	aabb.max = vec4(
		texelFetch(texture_float, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float, pointer+ivec3(7,0,0), 0).r//unnecessary
	);

    if(ray_projection_index >=0)
    {
        aabb.min[ray_projection_index] = -tube_radius;
        aabb.max[ray_projection_index] = tube_radius;
    }
	return aabb;
}
GL_AABB GetAABB(bool dynamic, int index, int part_index, int ray_projection_index)
{
    if(dynamic)
        return GetAABB_dynamic(dynamic, index, part_index, ray_projection_index);    
	return GetAABB_static(dynamic, index, part_index, ray_projection_index);
}

////////////////////////////////////////////////////////////////////
//
//               START REGION ACCESS GLOBAL TEXTURE
//
////////////////////////////////////////////////////////////////////

GL_DirLight GetDirLight(int index)
{
	GL_DirLight light;
	ivec3 pointer = GetIndex3D(start_index_float_dir_lights + index * DIR_LIGHT_FLOAT_COUNT);
	light.ambient = vec4(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(3,0,0), 0).r//unnecessary
	);
	light.diffuse = vec4(
		texelFetch(texture_float_global, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(7,0,0), 0).r//unnecessary
	);
	light.specular = vec4(
		texelFetch(texture_float_global, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(11,0,0), 0).r//unnecessary
	);
	light.direction = vec4(
		texelFetch(texture_float_global, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(15,0,0), 0).r//unnecessary
	);
	return light;
}

vec3 GetStreamlineColor(int index)
{
	ivec3 pointer = GetIndex3D(start_index_float_streamline_color + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec3 color = vec3(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r
	);
	return color;
}

vec3 GetStreamlineSeedPosition(int index)
{
	ivec3 pointer = GetIndex3D(start_index_float_seeds + index * STREAMLINE_SEED_FLOAT_COUNT);
	vec3 position = vec3(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r
	);
	if(projection_index >=0)
        position[projection_index] = 0.0;
	return position;
}

vec4 GetScalarColor(int index, int transfer_function_index)
{
    ivec3 pointer = GetIndex3D(start_index_float_scalar_color 
        + transfer_function_index * TRANSFER_FUNCTION_BINS * STREAMLINE_COLOR_FLOAT_COUNT
        + index * STREAMLINE_COLOR_FLOAT_COUNT);
	vec4 color = vec4(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(3,0,0), 0).r
	);
	return color;
}

GL_Cylinder GetCylinder(int index)
{
    GL_Cylinder cylinder;
	ivec3 pointer = GetIndex3D(start_index_float_cylinder + index * CYLINDER_FLOAT_COUNT);
  	cylinder.matrix = mat4(
		texelFetch(texture_float_global, pointer+ivec3(0,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(1,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(2,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(3,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(4,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(5,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(6,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(7,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(8,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(9,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(10,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(11,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(12,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(13,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(14,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(15,0,0), 0).r
  	);
	cylinder.matrix_inv = mat4(
		texelFetch(texture_float_global, pointer+ivec3(16,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(17,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(18,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(19,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(20,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(21,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(22,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(23,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(24,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(25,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(26,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(27,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(28,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(29,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(30,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(31,0,0), 0).r
  	);
    cylinder.position_a = vec4(
		texelFetch(texture_float_global, pointer+ivec3(32,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(33,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(34,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(35,0,0), 0).r//unnecessary
  	);
    cylinder.position_b = vec4(
		texelFetch(texture_float_global, pointer+ivec3(36,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(37,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(38,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(39,0,0), 0).r//unnecessary
  	);
    cylinder.color = vec4(
		texelFetch(texture_float_global, pointer+ivec3(40,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(41,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(42,0,0), 0).r,
		texelFetch(texture_float_global, pointer+ivec3(43,0,0), 0).r//unnecessary
  	);
	cylinder.radius = texelFetch(texture_float_global, pointer+ivec3(44,0,0), 0).r;
  return cylinder;
}

`;