global.SHADER_MODULE_SHARED_CONST = `

const int TYPE_IGNORE_CUBE = -1;//no intersection with cube found --> skip testing
const int TYPE_NONE = 0;//Used in tree for non leaves or in hitInfo if no object was hit
const int TYPE_STREAMLINE_SEGMENT = 1;
const int TYPE_CLICKED_SPHERE = 2;
const int TYPE_GL_CYLINDER = 3;
const int TYPE_SEED = 4;

const int SUBTYPE_NONE = 0;
const int SUBTYPE_3SPHERE = 1;
const int SUBTYPE_SPHERINDER = 2;
const int SUBTYPE_SPHERE = 3;
const int SUBTYPE_CYLINDER = 4;


const int FOG_NONE = 0;
const int FOG_LINEAR = 1;
const int FOG_EXPONENTIAL = 2;
const int FOG_EXPONENTIAL_SQUARED = 3;

const int SHADING_MODE_STREAMLINES_ID = 0;
const int SHADING_MODE_STREAMLINES_SCALAR = 1;
const int SHADING_MODE_STREAMLINES_FTLE = 2;
const int SHADING_MODE_STREAMLINES_NORMAL = 3;
const int SHADING_MODE_STREAMLINES_POSITION = 4;
const int SHADING_MODE_STREAMLINES_SUBTYPE = 5;
const int SHADING_MODE_STREAMLINES_DISTANCE = 6;
const int SHADING_MODE_STREAMLINES_DISTANCE_ITERATION = 7;
const int SHADING_MODE_STREAMLINES_ITERATION_COUNT = 8;


const float PI = 3.1415926535897932384626433832795;
const int TRANSFER_FUNCTION_BINS = 512;
const int TRANSFER_FUNCTION_LAST_BIN = TRANSFER_FUNCTION_BINS-1;

const int INDEX_CYLINDER_FIRST_PROJECTION_FRAME = 66;
const int INDEX_CYLINDER_FIRST_SIDE_PROJECTION = 78;

const int PART_INDEX_DEFAULT = 0;//streamlines only in fundamental domain
const int PART_INDEX_OUTSIDE = 1;//streamlines leave fundamental domain

//**********************************************************************************************************
//**********************************************************************************************************
//**********************************************************************************************************

const int growth = 1;//DUMMY

const float epsilon_move_ray = 0.0000001;//DUMMY
const float epsilon_out_of_bounds = 0.000001;//DUMMY
const bool ignore_copy = false;//DUMMY

const int growth_id = -1;//DUMMY
const bool check_bounds = true;//DUMMY
const int allowOutOfBoundSphere = 0;//DUMMY
const int numDirLights = 3;//DUMMY
const float fogStart = 1000.0;//DUMMY
const float fogEnd = 1001.0;//DUMMY
const vec3 fogColor = vec3(1,1,1);//DUMMY
const float tubeShininess = 32.0;//DUMMY
const bool blinn_phong = true;//DUMMY

const float x_axesPixelOffset = 0.85;
const float y_axesPixelOffset = 0.75;
const float volume_rendering_reference_distance = 0.001;//reference sampling distance required for opacity correction

`;