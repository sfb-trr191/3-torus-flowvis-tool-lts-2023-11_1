(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (global){(function (){
global.URL_RELEASE = "https://sfb-trr191.github.io/3-torus-flowvis-tool/index.html";

global.TYPE_NONE = 0;
global.TYPE_STREAMLINE_SEGMENT = 1;
global.TYPE_CLICKED_SPHERE = 2;
global.TYPE_GL_CYLINDER = 3;
global.TYPE_SEED = 4;
global.TYPE_FTLE_SURFACE_FORWARD = 5;
global.TYPE_FTLE_SURFACE_BACKWARD = 6;

global.CONTROL_MODE_CAMERA = 1;
global.CONTROL_MODE_DYNAMIC_STREAMLINE = 2;
global.CONTROL_MODE_SELECT_STREAMLINE = 3;

global.FIXED_LENGTH_RANDOM_SEED_POSITION = 4;

global.DRAW_MODE_NONE = 0;
global.DRAW_MODE_DEFAULT = 1;
global.DRAW_MODE_FTLE_SLICE = 2;
global.DRAW_MODE_PROJECTION = 3;
global.DRAW_MODE_STEREOGRAPHIC_PROJECTION = 4;
global.DRAW_MODE_R4 = 5;
global.DRAW_MODE_S3 = 6;

global.DRAW_SLICE_AXES_ORDER_HX_VY = 0;
global.DRAW_SLICE_AXES_ORDER_HX_VZ = 1;
global.DRAW_SLICE_AXES_ORDER_HZ_VY = 2;

global.DRAW_SLICE_MODE_COMBINED = 0;
global.DRAW_SLICE_MODE_FORWARD = 1;
global.DRAW_SLICE_MODE_BACKWARD = 2;
global.DRAW_SLICE_MODE_FORWARD_NORMAL = 3;
global.DRAW_SLICE_MODE_BACKWARD_NORMAL = 4;

global.DIRECTION_FORWARD = 1;
global.DIRECTION_BACKWARD = 2;
global.DIRECTION_BOTH = 3;

global.STREAMLINE_TERMINATION_CONDITION_POINTS = 0;
global.STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME = 1;
global.STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH = 2;

global.FTLE_TERMINATION_CONDITION_ADVECTION_TIME = 1;
global.FTLE_TERMINATION_CONDITION_ARC_LENGTH = 2;

global.LIGHT_INTEGRATOR_LINE = 0;
global.LIGHT_INTEGRATOR_RK4 = 1;

global.SPACE_3_TORUS = 1;
global.SPACE_2_PLUS_2D = 2;
global.SPACE_2_SPHERE_3_PLUS_3D = 3;
global.SPACE_3_SPHERE_4_PLUS_4D = 4;

global.MULTI_SEED_MODE_RANDOM = 0;
global.MULTI_SEED_MODE_FIXED_POINT = 1;
global.MULTI_SEED_MODE_LINE = 2;
global.MULTI_SEED_MODE_ALIGNED_PLANE_RANDOM = 3;
global.MULTI_SEED_MODE_ALIGNED_PLANE_GRID = 4;
global.MULTI_SEED_MODE_CIRCLE = 5;

global.SEED_VISUALIZATION_MODE_NONE = 0;
global.SEED_VISUALIZATION_MODE_ONCE = 1;
global.SEED_VISUALIZATION_MODE_INSTANCE = 2;

global.STREAMLINE_CALCULATION_METHOD_BOTH = 0;
global.STREAMLINE_CALCULATION_METHOD_FUNDAMENTAL = 1;
global.STREAMLINE_CALCULATION_METHOD_R3 = 2;

global.STREAMLINE_DRAW_METHOD_NONE = 0;
global.STREAMLINE_DRAW_METHOD_FUNDAMENTAL = 1;
global.STREAMLINE_DRAW_METHOD_R3 = 2;
global.STREAMLINE_DRAW_METHOD_BOTH = 3;

global.FTLE_DIRECTIONS_NONE = 0;
global.FTLE_DIRECTIONS_BOTH = 1;
global.FTLE_DIRECTIONS_FORWARD = 2;
global.FTLE_DIRECTIONS_BACKWARD = 3;

global.STYLE_DEFAULT = "d";
global.STYLE_EMBEDDED = "e";
global.STYLE_EMBEDDED_RIGHT = "er";

global.FOG_NONE = 0;
global.FOG_LINEAR = 1;
global.FOG_EXPONENTIAL = 2;
global.FOG_EXPONENTIAL_SQUARED = 3;

global.SHADING_MODE_STREAMLINES_ID = 0;
global.SHADING_MODE_STREAMLINES_SCALAR = 1;
global.SHADING_MODE_STREAMLINES_FTLE = 2;
global.SHADING_MODE_STREAMLINES_NORMAL = 3;
global.SHADING_MODE_STREAMLINES_POSITION = 4;
global.SHADING_MODE_STREAMLINES_SUBTYPE = 5;
global.SHADING_MODE_STREAMLINES_DISTANCE = 6;
global.SHADING_MODE_STREAMLINES_DISTANCE_ITERATION = 7;
global.SHADING_MODE_STREAMLINES_ITERATION_COUNT = 8;
global.SHADING_MODE_STREAMLINES_COST = 9;

global.VOLUME_RENDERING_MODE_ORIGINAL_FTLE = 0;
global.VOLUME_RENDERING_MODE_RIDGES = 1;
global.VOLUME_RENDERING_MODE_SMALLEST_EIGENVALUE = 2;

global.PARAM_EYE = "eye";
global.PARAM_SEEDS = "s";
global.PARAM_CAMERA = "mc";
global.PARAM_SIDE_CAMERA = "sc";
global.PARAM_TRANSFER_FUNCTION_MANAGER = "tfm";
global.PARAM_select_data_paramaters_mode = "dpm"
global.PARAM_input_field_equation_u = "u";
global.PARAM_input_field_equation_v = "v";
global.PARAM_input_field_equation_w = "w";
global.PARAM_input_num_points_per_streamline = "pps";
global.PARAM_input_step_size = "ss";
global.PARAM_segment_duplicator_iterations = "di";
global.PARAM_STREAMLINE_CALCULATION_METHOD = "scm"
global.PARAM_STYLE = "style";
global.PARAM_THUMBNAIL = "et";
global.PARAM_THUMBNAIL_RIGHT = "etr";
global.PARAM_LAYOUT = "lay";
global.PARAM_LAYOUT_EXPORT_MAIN = "laym";
global.PARAM_LAYOUT_EXPORT_AUX = "laya";
global.PARAM_SIDE_MODE = "sm";
global.PARAM_PROJECTION_INDEX = "pi"
global.PARAM_EXPORT_THUMBNAIL_DIRECTORY = "etd";
global.PARAM_EXPORT_THUMBNAIL_NAME = "etn";
global.PARAM_EXPORT_THUMBNAIL_NAME_RIGHT = "etnr"
global.PARAM_RNG_SEED_POSITION = "rngp";


global.CANVAS_WRAPPER_MAIN = "main";
global.CANVAS_WRAPPER_SIDE = "side";
global.CANVAS_WRAPPER_TRANSFER_FUNCTION = "transfer_function";


global.CANVAS_MAIN_WIDTH = 1280;
global.CANVAS_MAIN_HEIGHT = 720;
global.CANVAS_SIDE_WIDTH = 512;
global.CANVAS_SIDE_HEIGHT = 384;
global.CANVAS_TRANSFER_FUNCTION_WIDTH = 512;
global.CANVAS_TRANSFER_FUNCTION_HEIGHT = 256;

global.GROUP_NAME_CALCULATE = "group_calculate";
global.GROUP_NAME_CAMERA = "group_camera";
global.GROUP_NAME_RENDER_SETTINGS = "group_render_settings";

global.TRANSFER_FUNCTION_AREA_NONE = 0;
global.TRANSFER_FUNCTION_AREA_TOP = 1;
global.TRANSFER_FUNCTION_AREA_CENTER = 2;
global.TRANSFER_FUNCTION_AREA_BOTTOM = 3;

global.DRAG_SQUARED_DISTANCE_THRESHOLD = 256;

global.NUMBER_OF_LOD_PARTS = 2;
global.PART_INDEX_DEFAULT = 0;//streamlines only in fundamental domain
global.PART_INDEX_OUTSIDE = 1;//streamlines leave fundamental domain

global.TASK_NONE = 0;
global.TASK_CALCULATE_STREAMLINES = 1;
global.TASK_EXPORT_THUMBNAIL = 2;
global.TASK_EXPORT_LATEX = 3;
global.TASK_CALCULATE_DYNAMIC_STREAMLINE = 4;
global.TASK_CALCULATE_FTLE = 5;


global.CAMERA_CONTROL_NONE = 0;
global.CAMERA_CONTROL_TRACKBALL = 1;
global.CAMERA_CONTROL_TRACKBALL2 = 3;
global.CAMERA_CONTROL_TRACKBALL3 = 4;
global.CAMERA_CONTROL_ROTATE_AROUND_CAMERA = 2;

global.TYPE_UNDEFINED = "UNDEFINED";
global.TYPE_UINT8 = "UI8";
global.TYPE_UINT16 = "UI16";
global.TYPE_UINT32 = "UI32";
global.TYPE_FLOAT32 = "F32";

global.FTLE_STATE_INITIALIZATION = 0;
global.FTLE_STATE_FLOW_MAP_SETUP = 1;
global.FTLE_STATE_FLOW_MAP_COMPUTE = 2;
global.FTLE_STATE_FLOW_MAP_FINISH = 3;
global.FTLE_STATE_FLOW_MAP_FINITE_DIFFEREMCES_COMPUTE = 4;
global.FTLE_STATE_FTLE = 5;
global.FTLE_STATE_FTLE_GRADIENT = 6;
global.FTLE_STATE_FTLE_JACOBY = 7;
global.FTLE_STATE_SYMMETRIC = 8;
global.FTLE_STATE_FINISH = 100;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
const module_const = require("./const");
; (function () {
    "use strict"
    window.addEventListener("load", onStart, false);

    function onStart(evt) {
        //console.log("onStart");
        window.removeEventListener(evt.type, onStart, false);

        setThumbnail();
        
        document.getElementById("message_display").innerHTML = "click to interact";
        document.getElementById("image_thumbnail").addEventListener("click", function () {
            redirect();
        });
    }

    function setThumbnail(){
        const urlParams = new URLSearchParams(window.location.search);
        const style = urlParams.get(PARAM_STYLE);
        const thumbnail_url = urlParams.get(PARAM_THUMBNAIL);
        const thumbnail_url_right = urlParams.get(PARAM_THUMBNAIL_RIGHT);
        //console.log("thumbnail_url:", thumbnail_url)
        var url = thumbnail_url;
        if(style == STYLE_EMBEDDED_RIGHT){
            var url = thumbnail_url_right;
        }

        var invalid_thumbnail = url === null || url === "";
        if(!invalid_thumbnail)
            document.getElementById("image_thumbnail").src = url;
    }

    function redirect() {
        var query = window.location.search;
        var url_without_query = window.location.toString().replace(window.location.search, "");
        url_without_query = url_without_query.replace("lazy", "index");
        var new_url = url_without_query + query;
        window.location.href = new_url; 
    }
})();
},{"./const":1}]},{},[2]);
