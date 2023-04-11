//########## GLOBALS ##########
const module_const = require("./const");
const module_version = require("./version");
const f_shader_average = require("./shader/stand_alone/f_shader_average.glsl");
const f_shader_compute_flow_map_slice_AB = require("./shader/stand_alone/f_shader_compute_flow_map_slice_AB.glsl");
const f_shader_compute_flow_map_slice = require("./shader/stand_alone/f_shader_compute_flow_map_slice.glsl");
const f_shader_compute_flowmap_finite_differences = require("./shader/stand_alone/f_shader_compute_flowmap_finite_differences.glsl");
const f_shader_compute_ftle_normals = require("./shader/stand_alone/f_shader_compute_ftle_normals.glsl");
const f_shader_copy = require("./shader/stand_alone/f_shader_copy.glsl");
const f_shader_flow_map_slice = require("./shader/stand_alone/f_shader_flow_map_slice.glsl");
const f_shader_placeholder = require("./shader/stand_alone/f_shader_placeholder.glsl");
const f_shader_raytracing = require("./shader/stand_alone/f_shader_raytracing.glsl");
const f_shader_resampling = require("./shader/stand_alone/f_shader_resampling.glsl");
const f_shader_sum = require("./shader/stand_alone/f_shader_sum.glsl");
const f_shader_transfer_function_points = require("./shader/stand_alone/f_shader_transfer_function_points.glsl");
const f_shader_transfer_function = require("./shader/stand_alone/f_shader_transfer_function.glsl");
const v_shader_raytracing = require("./shader/stand_alone/v_shader_raytracing.glsl");
const v_shader_resampling = require("./shader/stand_alone/v_shader_resampling.glsl");
const v_shader_transfer_function_points = require("./shader/stand_alone/v_shader_transfer_function_points.glsl");

//modular shader:
const f_shader_raytracing_preprocessor = require("./shader/f_shader_raytracing_preprocessor.glsl");
//modules
const shader_modules_out_of_bounds = require("./shader/modules/default/default_out_of_bounds.glsl");
const shader_modules_volume_rendering = require("./shader/modules/default/default_volume_rendering.glsl");
const shader_modules_handle_inside = require("./shader/modules/default/default_handle_inside.glsl");
const shader_modules_handle_out_of_bounds = require("./shader/modules/default/default_handle_out_of_bounds.glsl");
//modules: shared
const shader_modules_data_access = require("./shader/modules/shared/shared_data_access.glsl");
const shader_modules_shared_structs = require("./shader/modules/shared/shared_structs.glsl");
const shader_modules_shared_uniforms = require("./shader/modules/shared/shared_uniforms.glsl");
const shader_modules_shared_const = require("./shader/modules/shared/shared_const.glsl");
const shader_modules_shared_function_declarations = require("./shader/modules/shared/shared_function_declarations.glsl");
const shader_modules_shared_shading = require("./shader/modules/shared/shared_shading.glsl");
//modules: default
const shader_modules_default_structs = require("./shader/modules/default/default_structs.glsl");
const shader_modules_default_function_declarations = require("./shader/modules/default/default_function_declarations.glsl");
const shader_modules_default_intersections = require("./shader/modules/default/default_intersections.glsl");
const shader_modules_default_ray_generation = require("./shader/modules/default/default_ray_generation.glsl");
const shader_modules_default_shading = require("./shader/modules/default/default_shading.glsl");
const shader_modules_default_light_integration_definitions = require("./shader/modules/default/default_light_integration_definitions.glsl");
const shader_modules_default_output_data = require("./shader/modules/default/default_output_data.glsl");
//modules: s3
const shader_modules_s3_structs = require("./shader/modules/s3/s3_structs.glsl");
const shader_modules_s3_function_declarations = require("./shader/modules/s3/s3_function_declarations.glsl");
const shader_modules_s3_intersections = require("./shader/modules/s3/s3_intersections.glsl");
const shader_modules_s3_ray_generation = require("./shader/modules/s3/s3_ray_generation.glsl");
const shader_modules_s3_shading = require("./shader/modules/s3/s3_shading.glsl");
const shader_modules_s3_light_integration_definitions = require("./shader/modules/s3/s3_light_integration_definitions.glsl");
const shader_modules_s3_output_data = require("./shader/modules/s3/s3_output_data.glsl");

//########## THIRD PARTY MODULES ##########
const glMatrix = require("gl-matrix");
const {
    Matrix,
    inverse,
    solve,
    linearDependencies,
    QrDecomposition,
    LuDecomposition,
    CholeskyDecomposition,
    EigenvalueDecomposition
} = require('ml-matrix');

//########## OWN MODULES ##########
const TabManager = require("./tab_manager");
const InputChangedManager = require("./input_changed_manager");
const HideManager = require("./hide_manager");
const VisibilityManager = require("./visibility_manager");
const Camera = require("./camera");
const InputManager = require("./input_manager");
const MouseManager = require("./mouse_manager");
const module_webgl = require("./webgl");
const getRenderingContext = module_webgl.getRenderingContext;
const getRenderingContextTransferFunction = module_webgl.getRenderingContextTransferFunction;
const UISeeds = require("./ui_seeds");
const UITransferFunctions = require("./ui_transfer_functions");
const UILeftToolBar = require("./ui_left_tool_bar");
const Lights = require("./lights");
const TransferFunctionManager = require("./transfer_function_manager");
const ObjectManager = require("./object_manager");
const GlobalData = require("./global_data");
const ShaderManager = require("./shader_manager");
const StreamlineContext = require("./streamline_context");
const BackgroundObjectCalculateStreamlines = require("./background_object_calculate_streamlines")
const FTLEManager = require("./ftle_manager");
const Aliasing = require("./aliasing");
const CanvasWrapper = require("./canvas_wrapper");
const CanvasWrapperTransferFunction = require("./canvas_wrapper_transfer_function");
const InputParameterWrapper = require("./input_parameter_wrapper");
const module_utility = require("./utility");
const setCSS = module_utility.setCSS;
const lerp = module_utility.lerp;
const ExportObject = require("./export");
const module_data_conversion = require("./data_conversion");
const conversionTest = module_data_conversion.conversionTest;
const StateManager = require("./state_manager");
const TreeView = require("./tree_view");
const UiTools = require("./ui_tools");
const ExportWizard = require("./export_wizard");
const Tests = require("./tests");
const gram_schmidt = require("./gram_schmidt");
const VERSION_REDIRECTION_DICT = require("./version_redirection_dict").VERSION_REDIRECTION_DICT;


const math4D = require("./math4D");
const cpu_intersect = require("./cpu_intersect");

; (function () {
    "use strict"
    window.addEventListener("load", onStart, false);

    var ext_parallel;
    var ext_parallel_side;

    var gl;
    var gl_side;
    var gl_transfer_function;
    var timer;
    var tick_counter;
    var frame_counter;
    var strong_tick_counter;
    var strong_frame_counter;
    //var strong_time;
    //var strong_delta_time;
    var strong_fps;

    var main_camera;
    var side_camera;
    var main_canvas;
    var side_canvas;
    var main_thumbnail;
    var aux_thumbnail;
    var transfer_function_canvas;
    var input_manager;
    var mouse_manager;
    var input_changed_manager;
    var hide_manager;
    var visibility_manager;
    var lights;
    var streamline_context_static;//the static streamlines
    var streamline_context_dynamic;//interactive streamline placement
    var ftle_manager;

    var aliasing;
    var transfer_function_manager;
    var object_manager;
    var shader_manager;
    var canvas_wrapper_main;
    var canvas_wrapper_side;
    var canvas_wrapper_transfer_function;
    var input_parameter_wrapper;

    var data_changed = false;
    var settings_changed = false;

    var ui_seeds;
    var ui_transfer_functions;
    var ui_left_tool_bar;
    var global_data;
    var time_last_tick = 0;
    var time_last_draw = 0;
    var t_start_waiting_for_shaders;
    var fps_display;
    //var message_display;
    var current_fps = 0;

    var tree_view;
    var tab_manager;
    var ui_tools;
    var state_manager;
    var sheduled_task = TASK_CALCULATE_STREAMLINES;
    var fence_sync = null;//used to check if rendering completed
    var fence_sync_side_export = null;//used to check if rendering completed
    var export_object = null;
    var export_wizard;
    var block_all_input = false;

    var bo_calculate_streamlines;

    function onStart(evt) {
        console.log("onStart");

        //math4D.Test();
        //gram_schmidt.Test();
        cpu_intersect.Test();

        var tests = new Tests();
       
        window["URL_VERSION_YEAR"] = window["VERSION_YEAR"];
        window["URL_VERSION_MONTH"] = window["VERSION_MONTH"];
        window["URL_VERSION_NUMBER"] = window["VERSION_NUMBER"];
        window["URL_STATE_VERSION"] = window["STATE_VERSION"];

        var base64 = conversionTest();
        state_manager = new StateManager();
        //state_manager.generateStateBase64(STATE_VERSION);
        //state_manager.executeStateBase64Url();
        //return;

        window.removeEventListener(evt.type, onStart, false);        
        document.getElementById("wrapper_dialog_javascript").className = "hidden";   
        //document.getElementById("wrapper_transparent_overlay").className = "hidden";    
        //message_display = document.getElementById("message_display");
        //message_display.innerHTML = "step 1: initializing...";
        setTimeout(on_start_step_1, 200);

        var url_without_query = window.location.toString().replace(window.location.search, "");
        if(url_without_query.includes("localhost")){
            document.title = "[LOCAL] 3-Torus FlowVis Tool";
        }
        else if(url_without_query.includes("christian-lang")){
            document.title = "[DEV] 3-Torus FlowVis Tool";
        }
        else{
            document.title = "3-Torus FlowVis Tool";
        }
        console.log("url_without_query", url_without_query);
    }

    function on_start_step_1(){
        addOnClickRequestData();
        addOnClickUpdateRenderSettings();
        addOnClickUpdateCamera();
        addOnClickAddSeed();
        addOnClickRandomizeSeedPositions();
        addOnClickUpdateURL();
        addOnClickSetMagneticField();
        addOnClickTabs();
        addChangedSideMode();
        addChangedCameraControl();
        addChangedTransferFunction();
        //testWebGPU();
        //testEigenvalueDecomposition();

        tree_view = new TreeView();
        tab_manager = new TabManager();
        hide_manager = new HideManager(tab_manager);
        visibility_manager = new VisibilityManager();
        tab_manager.Link(hide_manager);
        ui_tools = new UiTools();

        main_canvas = document.getElementById("main_canvas");
        side_canvas = document.getElementById("side_canvas");
        main_thumbnail = document.getElementById("image_thumbnail_main");
        aux_thumbnail = document.getElementById("image_thumbnail_aux");
        transfer_function_canvas = document.getElementById("transfer_function_canvas");
        fps_display = document.getElementById("fps_display");

        export_wizard = new ExportWizard();

        addBlockContextMenu();
        addBlockScroll();


        input_changed_manager = new InputChangedManager();
        main_camera = new Camera("main_camera", "special_data_camera_main", "current_state_name_main", input_changed_manager);
        side_camera = new Camera("side_camera", "special_data_camera_aux", "current_state_name_aux", input_changed_manager);


        input_manager = new InputManager(main_canvas, main_camera, side_canvas, side_camera);
        input_manager.initialize();
        mouse_manager = new MouseManager(main_canvas, main_camera, side_canvas, side_camera);
        mouse_manager.initialize();

        //buildErrorDictionary();

        if (!(gl = getRenderingContext(main_canvas)))
            return;
        if (!(gl_side = getRenderingContext(side_canvas)))
            return;
        if (!(gl_transfer_function = getRenderingContextTransferFunction(transfer_function_canvas)))
            return;
        console.log(gl);
        console.log(gl_side);
        console.log(gl_transfer_function);

        var ext = gl.getExtension('EXT_color_buffer_float');
        var ext_side = gl_side.getExtension('EXT_color_buffer_float');
        var ext_transfer_function = gl_transfer_function.getExtension('EXT_color_buffer_float');

        if ((!ext) || (!ext_side) || (!ext_transfer_function)) {
            alert("FTLE not supported: could not load EXT_color_buffer_float");
            return;
        }

        ext_parallel = gl.getExtension('KHR_parallel_shader_compile');
        ext_parallel_side = gl_side.getExtension('KHR_parallel_shader_compile');
        if ((!ext_parallel) || (!ext_parallel_side)) {
            //alert("Parallel not supported");
        }

        ui_seeds = new UISeeds();
        ui_seeds.generateDefaultSeeds();
        input_changed_manager.LinkUISeeds(ui_seeds);

        ui_transfer_functions = new UITransferFunctions();

        ui_left_tool_bar = new UILeftToolBar(main_camera, side_camera, mouse_manager);

        lights = new Lights();
        lights.GenerateDefaultLighting();

        transfer_function_manager = new TransferFunctionManager(ui_transfer_functions);
        object_manager = new ObjectManager();

        global_data = new GlobalData(gl, gl_side, gl_transfer_function, lights, ui_seeds, transfer_function_manager, object_manager);

        shader_manager = new ShaderManager();
        streamline_context_static = new StreamlineContext("static", lights, ui_seeds, gl, gl_side);
        streamline_context_dynamic = new StreamlineContext("dynamic", lights, ui_seeds, gl, gl_side);
        visibility_manager.Link(streamline_context_static);
        ftle_manager = new FTLEManager(gl, gl_side, streamline_context_static, shader_manager);

        main_camera.SetRenderSizes(1280, 720, 640, 360);
        main_camera.SetDefaultValuesMain();

        main_camera.LinkInput(
            document.getElementById("input_camera_position_x"),
            document.getElementById("input_camera_position_y"),
            document.getElementById("input_camera_position_z"),
            document.getElementById("input_camera_position_w"),
            document.getElementById("input_camera_forward_x"),
            document.getElementById("input_camera_forward_y"),
            document.getElementById("input_camera_forward_z"),
            document.getElementById("input_camera_forward_w"),
            document.getElementById("input_camera_up_x"),
            document.getElementById("input_camera_up_y"),
            document.getElementById("input_camera_up_z"),
            document.getElementById("input_camera_up_w"),
            document.getElementById("input_camera_right_x"),
            document.getElementById("input_camera_right_y"),
            document.getElementById("input_camera_right_z"),
            document.getElementById("input_camera_right_w"));

        side_camera.SetRenderSizes(512, 384, 256, 192);
        side_camera.SetDefaultValuesAux();
        //side_camera.position = glMatrix.vec3.fromValues(0.500000, -0.750000, 1.200000);
        //side_camera.forward = glMatrix.vec3.fromValues(-0.023683, 0.813820, -0.580633);
        //side_camera.up = glMatrix.vec3.fromValues(-0.008492, -0.580940, -0.813903);


        side_camera.LinkInput(
            document.getElementById("input_side_camera_position_x"),
            document.getElementById("input_side_camera_position_y"),
            document.getElementById("input_side_camera_position_z"),
            document.getElementById("input_side_camera_position_w"),
            document.getElementById("input_side_camera_forward_x"),
            document.getElementById("input_side_camera_forward_y"),
            document.getElementById("input_side_camera_forward_z"),
            document.getElementById("input_side_camera_forward_w"),
            document.getElementById("input_side_camera_up_x"),
            document.getElementById("input_side_camera_up_y"),
            document.getElementById("input_side_camera_up_z"),
            document.getElementById("input_side_camera_up_w"),
            document.getElementById("input_side_camera_right_x"),
            document.getElementById("input_side_camera_right_y"),
            document.getElementById("input_side_camera_right_z"),
            document.getElementById("input_side_camera_right_w"));

        aliasing = new Aliasing();

        canvas_wrapper_main = new CanvasWrapper(gl, streamline_context_static, streamline_context_dynamic, ftle_manager, CANVAS_WRAPPER_MAIN,
            main_canvas, CANVAS_MAIN_WIDTH, CANVAS_MAIN_HEIGHT, main_thumbnail, main_camera, aliasing, shader_manager, global_data, tree_view);
        canvas_wrapper_side = new CanvasWrapper(gl_side, streamline_context_static, streamline_context_dynamic, ftle_manager, CANVAS_WRAPPER_SIDE,
            side_canvas, CANVAS_SIDE_WIDTH, CANVAS_SIDE_HEIGHT, aux_thumbnail, side_camera, aliasing, shader_manager, global_data, tree_view);
        canvas_wrapper_transfer_function = new CanvasWrapperTransferFunction(gl_transfer_function, CANVAS_WRAPPER_TRANSFER_FUNCTION, 
            transfer_function_canvas, CANVAS_TRANSFER_FUNCTION_WIDTH, CANVAS_TRANSFER_FUNCTION_HEIGHT, global_data, transfer_function_manager);

        shader_manager.Link(canvas_wrapper_main, canvas_wrapper_side);
        mouse_manager.Link(ui_left_tool_bar, canvas_wrapper_main, canvas_wrapper_side);

        tick_counter = 0;
        frame_counter = 0;
        var strongs = document.querySelectorAll("strong");
        strong_tick_counter = strongs[0];
        strong_frame_counter = strongs[1];
        strong_fps = strongs[2];
        //strong_time = strongs[2];
        //strong_delta_time = strongs[3];

        initializeAttributes();

        input_parameter_wrapper = new InputParameterWrapper(tree_view, ui_seeds, main_camera, side_camera, transfer_function_manager, tab_manager, state_manager, ui_tools);
        input_parameter_wrapper.fromURLVersion();
        RedirectVersion();
        input_parameter_wrapper.fromURL();
        UpdateVersionString();
        onChangedDrawMode();
        onChangedCameraControl();
        OnSelectedTransferFunction();

        hide_manager.UpdateVisibility();
        tree_view.onEyeChanged();

        //message_display.innerHTML = "step 2: initializing basic shaders...";
        writeCurrentResolutionToUI();//required here to show correct thumbnail size
        canvas_wrapper_main.ShowThumbnail(true);
        canvas_wrapper_side.ShowThumbnail(true);
        setTimeout(on_start_step_2, 200);
    }

    function on_start_step_2(){
        canvas_wrapper_main.InitializeShaders(gl);
        canvas_wrapper_side.InitializeShaders(gl_side);
    
        //message_display.innerHTML = "";
        //message_display.innerHTML = "step 3: calculating...";
        //document.getElementById("wrapper_dialog_calculating").className = "wrapper";
        //document.getElementById("wrapper_transparent_overlay").className = "wrapper";
        //setTimeout(on_start_step_3, 200);
        requestAnimationFrame(on_update);
    }

    function on_fully_loaded() {
        console.log("on_fully_loaded");
        canvas_wrapper_main.ShowThumbnail(false);
        canvas_wrapper_side.ShowThumbnail(false);
        //setCSS(input_parameter_wrapper.css_loaded);
        //message_display.innerHTML = "";
    }

    function state_streamline_calculation_setup(time_now){
        console.warn("#SC: state_streamline_calculation_setup", sheduled_task);
        bo_calculate_streamlines = new BackgroundObjectCalculateStreamlines(gl, gl_side, sheduled_task);

        //var t_start = performance.now();        

        canvas_wrapper_main.tube_radius_fundamental = bo_calculate_streamlines.input_parameters.tube_radius_fundamental;
        canvas_wrapper_side.tube_radius_fundamental = bo_calculate_streamlines.input_parameters.tube_radius_fundamental;
        canvas_wrapper_main.tube_radius_outside = bo_calculate_streamlines.input_parameters.max_radius_factor_highlight;
        canvas_wrapper_side.tube_radius_outside = bo_calculate_streamlines.input_parameters.max_radius_factor_highlight;

        main_camera.OnCalculateStreamlines(bo_calculate_streamlines.input_parameters.space);
        side_camera.OnCalculateStreamlines(bo_calculate_streamlines.input_parameters.space);

        //streamline_context_static.CalculateStreamlines(gl, gl_side);

        //var t_stop = performance.now();
        //console.log("Performance: calculated streamlines in: ", Math.ceil(t_stop-t_start), "ms");

        //var errors = streamline_context_static.streamline_generator.streamline_error_counter;
        //if(errors > 0){
        //    alert("Warning: There were " + errors + " errors during streamline calculation. The respective streamlines are terminated where the error occured. Make sure the equations do not result in infinity or NaN values.");
        //}

        requestAnimationFrame(state_streamline_calculation_setup_part_default);
    }

    function state_streamline_calculation_setup_part_default(time_now){
        console.log("#SC: state_streamline_calculation_setup_part_default");
        var context = sheduled_task == TASK_CALCULATE_STREAMLINES ? streamline_context_static : streamline_context_dynamic;
        context.SetupPartDefault(bo_calculate_streamlines);
        requestAnimationFrame(state_streamline_calculation_setup_new_streamline);
    }

    function state_streamline_calculation_setup_part_outside(time_now){
        console.log("#SC: state_streamline_calculation_setup_part_outside");
        var context = sheduled_task == TASK_CALCULATE_STREAMLINES ? streamline_context_static : streamline_context_dynamic;
        context.SetupPartOutside(bo_calculate_streamlines);
        requestAnimationFrame(state_streamline_calculation_setup_new_streamline);
    }

    function state_streamline_calculation_setup_new_streamline(time_now){
        console.log("#SC: state_streamline_calculation_setup_new_streamline", bo_calculate_streamlines.next_streamline_index);
        var context = sheduled_task == TASK_CALCULATE_STREAMLINES ? streamline_context_static : streamline_context_dynamic;
        bo_calculate_streamlines.OnProgressChanged(bo_calculate_streamlines.next_streamline_index/(streamline_context_static.streamline_generator.seeds.length));
        if(bo_calculate_streamlines.next_streamline_index == context.streamline_generator.seeds.length){
            requestAnimationFrame(state_streamline_calculation_finish_part);
            return;
        }
        context.streamline_generator.SetupNextStreamline(bo_calculate_streamlines);

        requestAnimationFrame(state_streamline_calculation_continue_streamline);
    }

    function state_streamline_calculation_continue_streamline(time_now){
        console.log("#SC: state_streamline_calculation_continue_streamline", bo_calculate_streamlines.next_streamline_index);
        var context = sheduled_task == TASK_CALCULATE_STREAMLINES ? streamline_context_static : streamline_context_dynamic;
        if(bo_calculate_streamlines.current_streamline.finished){
            bo_calculate_streamlines.next_streamline_index++;            
            requestAnimationFrame(state_streamline_calculation_setup_new_streamline);
            return;
        }
        context.streamline_generator.ContinueStreamline(bo_calculate_streamlines);

        bo_calculate_streamlines.OnProgressChanged(bo_calculate_streamlines.streamline_part_progress);
        requestAnimationFrame(state_streamline_calculation_continue_streamline);
    }

    function state_streamline_calculation_finish_part(time_now){
        console.log("#SC: state_streamline_calculation_finish_part");     
        var context = sheduled_task == TASK_CALCULATE_STREAMLINES ? streamline_context_static : streamline_context_dynamic;
        context.FinishStreamlinesPart(bo_calculate_streamlines);
        if(bo_calculate_streamlines.part_index == PART_INDEX_DEFAULT){
            requestAnimationFrame(state_streamline_calculation_setup_part_outside);
            return;
        }
        requestAnimationFrame(state_streamline_calculation_finished);
    }

    function state_streamline_calculation_finished(time_now){
        console.log("#SC: state_streamline_calculation_finished");
        var context = sheduled_task == TASK_CALCULATE_STREAMLINES ? streamline_context_static : streamline_context_dynamic;
        context.NotifyFinished();

        data_changed = true;
        input_changed_manager.UpdateDefaultValuesCalculate();

        UpdateRenderSettings();
        UpdateGlobalData();
        UpdateURL();
        sheduled_task = TASK_NONE;
        document.getElementById("wrapper_dialog_calculating").className = "hidden";
        requestAnimationFrame(on_update);
    }



    function prepare_left_shader(time_now){
        shader_manager.PrepareRaytracingShaderMain(gl);   

        document.getElementById("wrapper_dialog_prepare_left_shader").className = "hidden";        
        //message_display.innerHTML = "initialize shaders (2/2)...";
        if(shader_manager.ShouldPrepareRaytracingShaderSide(gl)){
            document.getElementById("wrapper_dialog_prepare_right_shader").className = "wrapper";
            document.getElementById("wrapper_transparent_overlay").className = "wrapper";
        }
        requestAnimationFrame(prepare_right_shader);
    }

    function prepare_right_shader(time_now){
        shader_manager.PrepareRaytracingShaderSide(gl_side);

        //message_display.innerHTML = "waiting for shaders...";
        t_start_waiting_for_shaders = performance.now();

        document.getElementById("wrapper_dialog_prepare_right_shader").className = "hidden";
        if(shader_manager.DidPrepareShader()){
            document.getElementById("wrapper_dialog_wait_for_shader").className = "wrapper";
            document.getElementById("wrapper_transparent_overlay").className = "wrapper";
        }
        requestAnimationFrame(wait_for_shader);
    }

    function wait_for_shader(time_now){
        tick_counter++;
        time_last_tick = time_now;
        strong_tick_counter.innerHTML = tick_counter;

        shader_manager.CheckRaytracingShaders(gl, gl_side, ext_parallel, ext_parallel_side);      
        if(!shader_manager.AreShadersLinked()){
            requestAnimationFrame(wait_for_shader);
            return;
        }  

        //shaders are now linked
        //message_display.innerHTML = "";
        canvas_wrapper_main.SetRayTracingProgram(gl, shader_manager.container_main);
        canvas_wrapper_side.SetRayTracingProgram(gl_side, shader_manager.container_side);

        var t_stop = performance.now();
        console.log("Performance: Waiting for shaders in: ", Math.ceil(t_stop-t_start_waiting_for_shaders), "ms");

        document.getElementById("wrapper_dialog_wait_for_shader").className = "hidden";
        document.getElementById("wrapper_transparent_overlay").className = "hidden";   
        on_fully_loaded();          
        requestAnimationFrame(on_update);
    }

    function on_update_export_main(time_now){       
        var finished = on_update_export_step(canvas_wrapper_main, gl, fence_sync);
        var fraction = 0.5 * (canvas_wrapper_main.aliasing_index / 64);
        export_wizard.OnProgressChanged(fraction);
        if(export_wizard.cancel){
            requestAnimationFrame(on_update);
            export_wizard.OnExportCancelled();
            return;
        }
        if(finished){
            requestAnimationFrame(on_update_export_aux);
            return;
        }
        requestAnimationFrame(on_update_export_main);
    }

    function on_update_export_aux(time_now){       
        var finished = on_update_export_step(canvas_wrapper_side, gl_side, fence_sync_side_export);
        var fraction = 0.5 + 0.5 * (canvas_wrapper_side.aliasing_index / 64);
        export_wizard.OnProgressChanged(fraction);
        if(export_wizard.cancel){
            requestAnimationFrame(on_update);
            export_wizard.OnExportCancelled();
            return;
        }
        if(finished){
            export_object.startExport(input_parameter_wrapper, ui_tools);
            export_wizard.ActivateWaitingForDownloadImage();
            requestAnimationFrame(on_update_wait_for_export_finished);
            return;
        }
        requestAnimationFrame(on_update_export_aux);
    }

    function on_update_wait_for_export_finished(time_now){ 
        console.log("on_update_wait_for_export_finished"); 
        if(export_object.finished){
            export_wizard.OnExportFinished();
            requestAnimationFrame(on_update);
            return;
        }
        requestAnimationFrame(on_update_wait_for_export_finished);
    }

    function on_update_export_step(canvas_wrapper, gl, fence_sync){

        if(canvas_wrapper.aliasing_index == 64){
            return true;
        } 

        var render = true;//should we render this tick? assume there is no current rendering process --> we can render
        //if there is a current rendering process, we only render if it has completed
        if(fence_sync !== null){
            var status = gl.getSyncParameter(fence_sync, gl.SYNC_STATUS);
            render = (status == gl.SIGNALED)
        }
        if(render){
            canvas_wrapper.draw(gl, data_changed, settings_changed);
            fence_sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            gl.flush();
        }
        console.log(canvas_wrapper.aliasing_index, render, status);
        return false;
    }

    function on_update(time_now) {
        tick_counter++;
        var deltaTime = (time_now - time_last_tick) / 1000;
        var deltaTimeDraw = (time_now - time_last_draw) / 1000;

        updateViewSizes();
        ActivateInput();

        if(tree_view.eyes_changed){
            console.log("eyes changed");
            tree_view.eyes_changed = false;
            UpdateRenderSettings();
        }

        //retrieve sheduled task from export wizard
        if (sheduled_task == TASK_NONE){
            sheduled_task = export_wizard.getSheduledTask();
            
            if (sheduled_task != TASK_NONE){                
                console.log("sheduled_task:", sheduled_task);
            }
        }

        //handle sheduled task
        if(sheduled_task == TASK_CALCULATE_STREAMLINES || sheduled_task == TASK_CALCULATE_DYNAMIC_STREAMLINE){
            DeactivateInput();
            UpdateRenderSettings();
            document.getElementById("wrapper_dialog_calculating").className = "wrapper";
            document.getElementById("wrapper_transparent_overlay").className = "wrapper";
            requestAnimationFrame(state_streamline_calculation_setup);
            return;  
        }        
        if(sheduled_task == TASK_EXPORT_THUMBNAIL){
            DeactivateInput();
            UpdateURL();
            var width_main = parseInt(document.getElementById("input_export_thumbnail_width_main").value);
            var height_main = parseInt(document.getElementById("input_export_thumbnail_height_main").value);
            var width_aux = parseInt(document.getElementById("input_export_thumbnail_width_aux").value);
            var height_aux = parseInt(document.getElementById("input_export_thumbnail_height_aux").value);
            canvas_wrapper_main.startExport(gl, width_main, height_main);
            canvas_wrapper_side.startExport(gl_side, width_aux, height_aux);
            sheduled_task = TASK_NONE;
            export_object = new ExportObject(TASK_EXPORT_THUMBNAIL);
            requestAnimationFrame(on_update_export_main);
            return;  
        }
        if(sheduled_task == TASK_EXPORT_LATEX){
            DeactivateInput();
            UpdateURL();
            var width_main = parseInt(document.getElementById("input_export_width_main").value);
            var height_main = parseInt(document.getElementById("input_export_height_main").value);
            var width_aux = parseInt(document.getElementById("input_export_width_aux").value);
            var height_aux = parseInt(document.getElementById("input_export_height_aux").value);
            canvas_wrapper_main.startExport(gl, width_main, height_main);
            canvas_wrapper_side.startExport(gl_side, width_aux, height_aux);
            sheduled_task = TASK_NONE;
            export_object = new ExportObject(TASK_EXPORT_LATEX);
            requestAnimationFrame(on_update_export_main);
            return;  
        }

        

        canvas_wrapper_main.is_exporting = false;
        canvas_wrapper_side.is_exporting = false;

        if(shader_manager.IsDirty()){
            //message_display.innerHTML = "initialize shaders (1/2)...";
            if(shader_manager.ShouldPrepareRaytracingShaderMain(gl)){
                document.getElementById("wrapper_dialog_prepare_left_shader").className = "wrapper";
                document.getElementById("wrapper_transparent_overlay").className = "wrapper";
            }
            requestAnimationFrame(prepare_left_shader);
            return;
        }        

        UpdateAnimation(time_now, deltaTime);

        input_manager.on_update(deltaTime, mouse_manager.active_camera);

        main_camera.repositionCamera(canvas_wrapper_main.draw_mode == DRAW_MODE_PROJECTION, canvas_wrapper_main.projection_index, true);
        main_camera.UpdateShaderValues();
        main_camera.WriteToInputFields();
        object_manager.movable_axes_state_main.SetCameraData(
            main_camera.position,
            main_camera.forward,
            main_camera.up,
            main_camera.p_1m,
            main_camera.q_x,
            main_camera.q_y);

        side_camera.repositionCamera(canvas_wrapper_side.draw_mode == DRAW_MODE_PROJECTION, canvas_wrapper_side.projection_index, false);
        side_camera.UpdateShaderValues();
        side_camera.WriteToInputFields();
        object_manager.movable_axes_state_side.SetCameraData(
            side_camera.position,
            side_camera.forward,
            side_camera.up,
            side_camera.p_1m,
            side_camera.q_x,
            side_camera.q_y);

        object_manager.Update();
        UpdateGlobalDataIfDirty();

        var render = true;//should we render this tick? assume there is no current rendering process --> we can render
        //if there is a current rendering process, we only render if it has completed
        if(fence_sync !== null){
            var status = gl.getSyncParameter(fence_sync, gl.SYNC_STATUS);
            render = (status == gl.SIGNALED)
        }
        if(render){
            canvas_wrapper_main.draw(gl, data_changed, settings_changed);
            canvas_wrapper_main.draw_retrieve(gl);
            canvas_wrapper_side.draw(gl_side, data_changed, settings_changed);
            canvas_wrapper_side.draw_retrieve(gl_side);
            canvas_wrapper_transfer_function.draw(gl_transfer_function);
            fence_sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            gl.flush();

            frame_counter++;
            frame_counter = canvas_wrapper_main.aliasing_index;
            main_camera.changed = false;
            side_camera.changed = false;
            settings_changed = false;
            data_changed = false;

            time_last_draw = time_now;
            current_fps = 1 / deltaTimeDraw;

            if(canvas_wrapper_main.get_did_update_clicked_position_and_reset()){
                if(mouse_manager.control_mode == CONTROL_MODE_SELECT_STREAMLINE){
                    console.warn("MAIN DID UPDATE, NEW SELECTED STREAMLINE")
                    var id = parseInt(document.getElementById("input_clicked_streamline_id_main").value)
                    canvas_wrapper_main.selected_streamline_id = id
                    canvas_wrapper_side.selected_streamline_id = id
                    main_camera.changed = true;
                    side_camera.changed = true;
                }
                if(streamline_context_static.streamline_generator.space == SPACE_3_TORUS){
                    if(mouse_manager.control_mode == CONTROL_MODE_DYNAMIC_STREAMLINE){
                        console.warn("MAIN DID UPDATE, SCHEDULE TASK: TASK_CALCULATE_DYNAMIC_STREAMLINE")
                        sheduled_task = TASK_CALCULATE_DYNAMIC_STREAMLINE;
                    }                    
                }
                else{
                    console.warn("DYNAMIC STREAMLINE CALCULATION ONLY FOR 3-TORUS")
                }
            }
            if(canvas_wrapper_side.get_did_update_clicked_position_and_reset()){
                console.warn("AUX DID UPDATE - DO NOTHING FOR NOW")
                //sheduled_task = TASK_CALCULATE_DYNAMIC_STREAMLINE;
            }
        }

        strong_tick_counter.innerHTML = tick_counter;
        strong_frame_counter.innerHTML = frame_counter;
        //strong_time.innerHTML = time_now.toFixed(3);
        //strong_delta_time.innerHTML = deltaTime.toFixed(3);
        strong_fps.innerHTML = current_fps.toFixed(1);

        var text_fps_panning = current_fps.toFixed(1);
        if (main_camera.IsPanningOrForced())
            text_fps_panning += "[P]";
        fps_display.innerHTML = text_fps_panning;

        writeCurrentResolutionToUI();
        input_changed_manager.CheckValuesChanged();

        time_last_tick = time_now;
        requestAnimationFrame(on_update);

    }

    function updateViewSizes(){

        //console.log(main_canvas.offsetWidth, "x", main_canvas.offsetHeight);
        //canvas_wrapper_main
    }

    function writeCurrentResolutionToUI(){
        var aspect_wrapper_main = document.getElementById("aspect_wrapper_main");
        var input_current_resolution_width_main = document.getElementById("input_current_resolution_width_main");
        var input_current_resolution_height_main = document.getElementById("input_current_resolution_height_main");
        var input_current_aspect_ratio_main = document.getElementById("input_current_aspect_ratio_main");
        var checkbox_fixed_aspect_ratio_main = document.getElementById("checkbox_fixed_aspect_ratio_main");
                
        handleAspectRatio(main_canvas, aspect_wrapper_main, input_current_resolution_width_main, input_current_resolution_height_main,
            input_current_aspect_ratio_main, checkbox_fixed_aspect_ratio_main);

        var aspect_wrapper_aux = document.getElementById("aspect_wrapper_aux");
        var input_current_resolution_width_aux = document.getElementById("input_current_resolution_width_aux");
        var input_current_resolution_height_aux = document.getElementById("input_current_resolution_height_aux");
        var input_current_aspect_ratio_aux = document.getElementById("input_current_aspect_ratio_aux");
        var checkbox_fixed_aspect_ratio_aux = document.getElementById("checkbox_fixed_aspect_ratio_aux");
                
        handleAspectRatio(side_canvas, aspect_wrapper_aux, input_current_resolution_width_aux, input_current_resolution_height_aux,
            input_current_aspect_ratio_aux, checkbox_fixed_aspect_ratio_aux);
    }

    function handleAspectRatio(canvas, aspect_wrapper, input_current_resolution_width, input_current_resolution_height, 
        input_current_aspect_ratio, checkbox_fixed_aspect_ratio){

        var width = canvas.width;
        var height = canvas.height;
        
        input_current_resolution_width.value = width.toFixed(0);
        input_current_resolution_height.value = height.toFixed(0);

        if(checkbox_fixed_aspect_ratio.checked){
            var ratio_aux = input_current_aspect_ratio.value;

            aspect_wrapper.className = "aspect_wrapper_fixed";
            aspect_wrapper.style.setProperty("aspect-ratio", ratio_aux);
        }
        else{
            var ratio_aux = width / height;
            input_current_aspect_ratio.value = ratio_aux.toFixed(4);

            aspect_wrapper.className = "aspect_wrapper_flexible";
            aspect_wrapper.style.removeProperty("aspect-ratio");
        }
    }

    var buffer;
    function initializeAttributes() {
        gl.enableVertexAttribArray(0);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
    }

    function cleanup() {
        gl.useProgram(null);
        if (buffer)
            gl.deleteBuffer(buffer);
        if (program)
            gl.deleteProgram(program);
    }

    function addOnClickRequestData() {
        document.getElementById("button_request_data").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickRequestData");
            sheduled_task = TASK_CALCULATE_STREAMLINES;
        });
        document.getElementById("button_calculate_ftle").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickCalculateFTLE");
            CalculateFTLE();
        });

    }

    function addOnClickUpdateRenderSettings() {
        document.getElementById("button_render_settings").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickUpdateRenderSettings");
            UpdateRenderSettings();
            UpdateGlobalData();
        });
        document.getElementById("button_data_update_render_settings").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickUpdateRenderSettings");
            UpdateRenderSettings();
            UpdateGlobalData();
        });
    }

    function addOnClickUpdateCamera() {
        document.getElementById("button_update_camera").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickUpdateCamera");
            UpdateCamera();
            UpdateSideCamera();
        });
    }

    function addOnClickAddSeed() {
        document.getElementById("button_add_seed").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickAddSeed");
            AddSeed();
        });
        document.getElementById("button_add_multi_seed").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickAddMultiSeed");
            AddMultiSeed();
        });
    }

    function addOnClickRandomizeSeedPositions() {
        document.getElementById("button_randomize_seed_positions").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickRandomizeSeedPositions");
            RandomizeSeedPositions();
        });
        document.getElementById("button_randomize_seed_colors").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickRandomizeSeedColors");
            RandomizeSeedColors();
        });
        /*
        document.getElementById("button_randomize_seed_positions_new_seed").addEventListener("click", function () {
            console.log("onClickRandomizeSeedPositionsNewSeed");
            RandomizeSeedPositionsNewSeed();
        });
        */
    }

    function addOnClickSetMagneticField() {
        document.getElementById("button_open_dialog_load").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            document.getElementById("wrapper_dialog_load_field").className = "wrapper";
        });
        document.getElementById("button_dialog_load_cancel").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            document.getElementById("wrapper_dialog_load_field").className = "hidden";
        });

        document.getElementById("fieldset_load_magnetic_field").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickSetMagneticField");
            SetMagneticField();
        });

        document.getElementById("fieldset_load_double_pndulum").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickSetMagneticField");
            SetDoublePendulum();
        });
        
        document.getElementById("fieldset_load_example_1").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickSetExample1");
            SetExample1();
        });

        document.getElementById("fieldset_load_example_2").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickSetExample2");
            SetExample2();
        });

        document.getElementById("fieldset_load_example_3").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickSetExample3");
            SetExample3();
        });

        document.getElementById("fieldset_load_example_4").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickSetExample4");
            SetExample4();
        });
        
        document.getElementById("fieldset_load_example_5").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickSetExample5");
            SetExample5();
        });
        
    }

    function addOnClickUpdateURL() {
        document.getElementById("button_update_url").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClickUpdateURL");
            UpdateURL();
        });
    }

    function addOnClickTabs() {
        document.getElementById("button_tab_data").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClick: button_tab_data");
            tab_manager.selectTab("tab_group_main", "tab_data");
        });
        document.getElementById("button_tab_ftle").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClick: button_tab_ftle");
            tab_manager.selectTab("tab_group_main", "tab_ftle");
        });
        document.getElementById("button_tab_settings").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClick: button_tab_settings");
            tab_manager.selectTab("tab_group_main", "tab_settings");
        });
        document.getElementById("button_tab_transfer_function").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClick: button_tab_transfer_function");
            tab_manager.selectTab("tab_group_main", "tab_transfer_function");
        });   
        /**     
        document.getElementById("button_tab_information").addEventListener("click", function () {
            console.log("onClick: button_tab_information");
            tab_manager.selectTab("tab_group_main", "tab_information");
        });
        document.getElementById("button_tab_edit").addEventListener("click", function () {
            console.log("onClick: button_tab_edit");
            tab_manager.selectTab("tab_group_main", "tab_edit");
        });
        */ 
        document.getElementById("button_tab_export").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClick: button_tab_export");
            tab_manager.selectTab("tab_group_main", "tab_export");
        });
        document.getElementById("button_tab_help").addEventListener("click", (event) => {
            if(block_all_input){
                return;
            }
            console.log("onClick: button_tab_help");
            tab_manager.selectTab("tab_group_main", "tab_help");
        });
    }

    function addChangedSideMode() {
        document.getElementById("select_side_mode").addEventListener("change", (event) => {
            //onChangedDrawMode();
            UpdateRenderSettings();
        });
        document.getElementById("select_side_mode_s3").addEventListener("change", (event) => {
            //onChangedDrawMode();
            UpdateRenderSettings();
        });
        document.getElementById("select_projection_index").addEventListener("change", (event) => {
            //onChangedDrawMode();
            UpdateRenderSettings();
        });
        document.getElementById("select_side_canvas_streamline_method").addEventListener("change", (event) => {
            //onChangedDrawMode();
            UpdateRenderSettings();
        });
        document.getElementById("select_side_canvas_streamline_method_projection").addEventListener("change", (event) => {
            //onChangedDrawMode();
            UpdateRenderSettings();
        });

        document.getElementById("slide_slice_index").addEventListener("change", (event) => {
            var value = document.getElementById("slide_slice_index").value;
            canvas_wrapper_side.draw_slice_index = value;
            console.log("slice_index", value);
            UpdateSliceSettings();
        });

        document.getElementById("slide_max_cost").addEventListener("change", (event) => {
            var value = document.getElementById("slide_max_cost").value / 100;
            console.log("slide_max_cost", value);
            document.getElementById("input_max_cost_percentage").value = value;
            UpdateRenderSettings();
        });

        document.getElementById("select_space").addEventListener("change", (event) => {
            ui_seeds.UpdateCSS();
        });

        
    }

    function addChangedCameraControl() {
        document.getElementById("select_camera_control_3d_left").addEventListener("change", (event) => {
            onChangedCameraControl();
        });
        document.getElementById("select_camera_control_3d_right").addEventListener("change", (event) => {
            onChangedCameraControl();
        });
    }    

    function onChangedDrawMode(){
        /*
        var draw_mode = parseInt(document.getElementById("select_side_mode").value);
        var draw_mode_s3 = parseInt(document.getElementById("select_side_mode_s3").value);
        var projection_index = parseInt(document.getElementById("select_projection_index").value);
        var show_streamlines = tree_view.IsVisibleInHierarchy(9);// ? STREAMLINE_DRAW_METHOD_FUNDAMENTAL : STREAMLINE_DRAW_METHOD_NONE;
        var streamline_method = show_streamlines ? parseInt(document.getElementById("select_side_canvas_streamline_method").value) : STREAMLINE_DRAW_METHOD_NONE;
        var streamline_method_projection = show_streamlines ? parseInt(document.getElementById("select_side_canvas_streamline_method_projection").value) : STREAMLINE_DRAW_METHOD_NONE;
        //canvas_wrapper_side.set_draw_mode(draw_mode, projection_index, streamline_method, streamline_method_projection);
        */
        canvas_wrapper_side.update_draw_mode_aux();
        
        shader_manager.NotifySettingsChanged();

        //var space = streamline_context_static.streamline_generator.space;
        //side_camera.OnUpdateBehavior(space, draw_mode);
    }

    function onChangedCameraControl(){
        var camera_control_left = parseInt(document.getElementById("select_camera_control_3d_left").value);
        var camera_control_right = parseInt(document.getElementById("select_camera_control_3d_right").value);
        main_camera.set_control(camera_control_left);
        side_camera.set_control(camera_control_right);
    }

    function addChangedTransferFunction(){
        document.getElementById("select_transfer_function_id").addEventListener("change", (event) => {
            OnSelectedTransferFunction();
        });
    }

    function addBlockContextMenu(){
        main_canvas.addEventListener("contextmenu", ( e )=> { 
            e.preventDefault(); return false; 
        });
        side_canvas.addEventListener("contextmenu", ( e )=> { 
            e.preventDefault(); return false; 
        });
        transfer_function_canvas.addEventListener("contextmenu", ( e )=> { 
            e.preventDefault(); return false; 
        });
    }

    function addBlockScroll(){
        addEventListener("mousedown", (e) =>{ 
            if (e.button === 1){
                //Middle Mouse Button
                e.preventDefault(); return false;
            }
        });
    }

    function OnSelectedTransferFunction(){
        var value = parseInt(document.getElementById("select_transfer_function_id").value);
        console.log("SELECT: ", value);
        canvas_wrapper_transfer_function.deselectPoint();
        transfer_function_manager.UpdateToUI(value);
        canvas_wrapper_transfer_function.updateBuffers();
    }

    function CalculateFTLE() {
        var dim_x = parseInt(document.getElementById("input_ftle_dim_x").value);
        var dim_y = parseInt(document.getElementById("input_ftle_dim_y").value);
        var dim_z = parseInt(document.getElementById("input_ftle_dim_z").value);
        var advection_time = parseFloat(document.getElementById("input_ftle_advection_time").value);
        var step_size = parseFloat(document.getElementById("input_ftle_step_size").value);
        ftle_manager.compute(gl, gl_side, dim_x, dim_y, dim_z, advection_time, step_size);

        var slider = document.getElementById("slide_slice_index");
        var value = Math.min(slider.value, dim_z - 1);
        slider.max = dim_z - 1;
        slider.value = value;

        canvas_wrapper_side.draw_slice_index = value;
        data_changed = true;

        console.log("draw_slice_index", value);
    }

    function UpdateRenderSettings() {
        console.log("UpdateRenderSettings");
        settings_changed = true;

        ui_seeds.UpdateChanges();
        onChangedDrawMode();

        transfer_function_manager.UpdateFromUI();
        canvas_wrapper_transfer_function.transfer_function_changed = true;

        var cube_axes_radius_main = parseFloat(document.getElementById("input_cube_axes_radius_main").value);
        var cube_axes_radius_origin_main = 0;
        var cube_axes_length_main = parseFloat(document.getElementById("input_cube_axes_length_main").value);
        var cube_axes_length_origin_main = 0;
        var camera_axes_invert_color_main = true;
        var cube_use_axes_colors_main = true;

        var cube_axes_radius_side = parseFloat(document.getElementById("input_cube_axes_radius_side").value);
        var cube_axes_radius_origin_side = parseFloat(document.getElementById("input_cube_axes_origin_radius_side").value);
        var cube_axes_length_side = parseFloat(document.getElementById("input_cube_axes_length_side").value);
        var cube_axes_length_origin_side = parseFloat(document.getElementById("input_cube_axes_origin_length_side").value);
        var camera_axes_invert_color_side = true;
        var cube_use_axes_colors_side = true;
        object_manager.SetAxesParameters(cube_axes_radius_main, cube_axes_radius_origin_main,
            cube_axes_length_main, cube_axes_length_origin_main,
            camera_axes_invert_color_main, cube_use_axes_colors_main,
            cube_axes_radius_side, cube_axes_radius_origin_side,
            cube_axes_length_side, cube_axes_length_origin_side,
            camera_axes_invert_color_side, cube_use_axes_colors_side);

        console.log(object_manager.cylinders);

        main_camera.trackball_rotation_sensitivity = parseFloat(document.getElementById("input_trackball_rotation_sensitivity").value);
        main_camera.trackball_translation_sensitivity = parseFloat(document.getElementById("input_trackball_translation_sensitivity").value);
        main_camera.trackball_wheel_sensitivity = parseFloat(document.getElementById("input_trackball_wheel_sensitivity").value);
        main_camera.trackball_focus_distance = parseFloat(document.getElementById("input_trackball_focus_distance_left").value);

        side_camera.trackball_rotation_sensitivity = parseFloat(document.getElementById("input_trackball_rotation_sensitivity").value);
        side_camera.trackball_translation_sensitivity = parseFloat(document.getElementById("input_trackball_translation_sensitivity").value);
        side_camera.trackball_wheel_sensitivity = parseFloat(document.getElementById("input_trackball_wheel_sensitivity").value);
        side_camera.trackball_focus_distance = parseFloat(document.getElementById("input_trackball_focus_distance_right").value);

        var max_ray_distance = parseFloat(document.getElementById("input_max_ray_distance").value);
        var light_integrator_type = document.getElementById("select_light_integrator_type").value;
        var light_integration_step_size = parseFloat(document.getElementById("input_light_integration_step_size").value);
        var light_integration_max_step_count = parseInt(document.getElementById("input_light_integration_max_step_count").value);
        //MAIN
        canvas_wrapper_main.max_cost = parseFloat(document.getElementById("input_max_cost_percentage").value);        
        canvas_wrapper_main.camera.fov_theta = parseFloat(document.getElementById("input_fov_theta_main").value);
        canvas_wrapper_main.max_volume_distance = parseFloat(document.getElementById("input_volume_rendering_max_distance").value);
        canvas_wrapper_main.tube_radius_factor = document.getElementById("input_tube_radius_factor").value;
        canvas_wrapper_main.tube_radius_factor_projection = document.getElementById("input_tube_radius_factor_projection").value;
        canvas_wrapper_main.tube_radius_factor_projection_highlight = document.getElementById("input_tube_radius_factor_projection_highlight").value;
        canvas_wrapper_main.fog_density = document.getElementById("input_fog_density").value;
        canvas_wrapper_main.fog_type = document.getElementById("select_fog_type").value;
        canvas_wrapper_main.shading_mode_streamlines = document.getElementById("select_shading_mode_streamlines").value;
        canvas_wrapper_main.min_scalar = document.getElementById("input_min_scalar").value;
        canvas_wrapper_main.max_scalar = document.getElementById("input_max_scalar").value;
        canvas_wrapper_main.cut_at_cube_faces = false;
        canvas_wrapper_main.handle_inside = false;
        canvas_wrapper_main.is_main_renderer = true;
        canvas_wrapper_main.show_bounding_box = tree_view.IsVisibleInHierarchy(4);//document.getElementById("checkbox_show_bounding_axes_main").checked;
        canvas_wrapper_main.show_movable_axes = tree_view.IsVisibleInHierarchy(5);//document.getElementById("checkbox_show_movable_axes_main").checked;
        canvas_wrapper_main.show_origin_axes = false;//document.getElementById("checkbox_show_origin_axes_main").checked;
        canvas_wrapper_main.volume_rendering_mode = tree_view.IsVisibleInHierarchy(2) ? parseInt(document.getElementById("select_show_volume_main").value) : VOLUME_RENDERING_MODE_NONE;
        canvas_wrapper_main.volume_rendering_distance_between_points = parseFloat(document.getElementById("input_volume_rendering_distance_between_points").value);
        canvas_wrapper_main.volume_rendering_termination_opacity = parseFloat(document.getElementById("input_volume_rendering_termination_opacity").value);
        canvas_wrapper_main.volume_rendering_opacity_factor = parseFloat(document.getElementById("input_volume_rendering_opacity_factor").value);
       
        canvas_wrapper_main.debug_render_spherinder = document.getElementById("checkbox_debug_render_streamline_spherinder_main").checked;
        canvas_wrapper_main.debug_render_3Sphere = document.getElementById("checkbox_debug_render_streamline_3Sphere_main").checked;

        canvas_wrapper_main.transfer_function_index_streamline_scalar = parseInt(document.getElementById("select_transfer_function_index_scalar").value);
        canvas_wrapper_main.transfer_function_index_ftle_forward = parseInt(document.getElementById("select_transfer_function_index_ftle_forward").value);
        canvas_wrapper_main.transfer_function_index_ftle_backward = parseInt(document.getElementById("select_transfer_function_index_ftle_backward").value);

        canvas_wrapper_main.streamline_method = tree_view.IsVisibleInHierarchy(1) ? STREAMLINE_DRAW_METHOD_FUNDAMENTAL : STREAMLINE_DRAW_METHOD_NONE;
        canvas_wrapper_main.seed_visualization_mode = tree_view.IsVisibleInHierarchy(7) ? SEED_VISUALIZATION_MODE_INSTANCE : SEED_VISUALIZATION_MODE_NONE;

        canvas_wrapper_main.SetLightIntegratorParameters(max_ray_distance, light_integrator_type, light_integration_step_size, light_integration_max_step_count);
        canvas_wrapper_main.max_iteration_count = Math.ceil(canvas_wrapper_main.limited_max_distance) * 3;
        canvas_wrapper_main.max_iteration_count = 10000;
        console.log("fog_type", canvas_wrapper_main.fog_type);
        console.log("limited_max_distance", canvas_wrapper_main.limited_max_distance);
        document.getElementById("input_limited_max_ray_distance").value = canvas_wrapper_main.limited_max_distance.toFixed(3);

        canvas_wrapper_main.lod_index_panning = document.getElementById("select_lod_panning").value;
        canvas_wrapper_main.lod_index_still = document.getElementById("select_lod_still").value;

        var still_resolution_factor = document.getElementById("input_still_resolution_factor").value;
        var panning_resolution_factor = document.getElementById("input_panning_resolution_factor").value;
        canvas_wrapper_main.UpdateResolutionFactor(gl, still_resolution_factor, panning_resolution_factor);

        var shader_formula_scalar = document.getElementById("input_formula_scalar").value;
        var shader_formula_scalar_float = shader_formula_scalar.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
            return ($2 == ".") ? $0 : $0 + ".0";
        });
        document.getElementById("input_formula_scalar_float").value = shader_formula_scalar_float;
        console.log("shader_formula_scalar", shader_formula_scalar);
        console.log("shader_formula_scalar_float", shader_formula_scalar_float);
        //canvas_wrapper_main.ReplaceRaytracingShader(gl, shader_formula_scalar_float);

        //SIDE        

        var show_4_projections = document.getElementById("checkbox_show_4_projections_main").checked;
        canvas_wrapper_side.camera.SetArea(-1, show_4_projections, parseFloat(document.getElementById("input_width_percentage_4_projections").value));
        canvas_wrapper_side.cameraAreaProjection0.SetArea(0, document.getElementById("checkbox_show_4_projections_main").checked, parseFloat(document.getElementById("input_width_percentage_4_projections").value));
        canvas_wrapper_side.cameraAreaProjection1.SetArea(1, document.getElementById("checkbox_show_4_projections_main").checked, parseFloat(document.getElementById("input_width_percentage_4_projections").value));
        canvas_wrapper_side.cameraAreaProjection2.SetArea(2, document.getElementById("checkbox_show_4_projections_main").checked, parseFloat(document.getElementById("input_width_percentage_4_projections").value));
        canvas_wrapper_side.cameraAreaProjection3.SetArea(3, document.getElementById("checkbox_show_4_projections_main").checked, parseFloat(document.getElementById("input_width_percentage_4_projections").value));

        canvas_wrapper_side.max_cost = parseFloat(document.getElementById("input_max_cost_percentage").value);
        canvas_wrapper_side.camera.fov_theta = parseFloat(document.getElementById("input_fov_theta_aux").value);
        canvas_wrapper_side.max_ray_distance = parseFloat(document.getElementById("input_max_ray_distance_aux").value);
        canvas_wrapper_side.tube_radius_factor = document.getElementById("input_tube_radius_factor_aux").value;
        canvas_wrapper_side.tube_radius_factor_projection = document.getElementById("input_tube_radius_factor_projection").value;
        canvas_wrapper_side.tube_radius_factor_projection_highlight = document.getElementById("input_tube_radius_factor_projection_highlight").value;
        
        canvas_wrapper_side.fog_density = document.getElementById("input_fog_density").value;
        canvas_wrapper_side.fog_type = document.getElementById("select_fog_type").value;
        canvas_wrapper_side.projection_index = document.getElementById("select_projection_index").value;
        canvas_wrapper_side.shading_mode_streamlines = document.getElementById("select_shading_mode_streamlines").value;
        canvas_wrapper_side.min_scalar = document.getElementById("input_min_scalar").value;
        canvas_wrapper_side.max_scalar = document.getElementById("input_max_scalar").value;
        canvas_wrapper_side.cut_at_cube_faces = true;
        canvas_wrapper_side.handle_inside = false;
        canvas_wrapper_side.is_main_renderer = false;
        canvas_wrapper_side.show_bounding_box = tree_view.IsVisibleInHierarchy(12);//document.getElementById("checkbox_show_bounding_axes_side").checked;
        canvas_wrapper_side.show_bounding_box_projection = tree_view.IsVisibleInHierarchy(12);//document.getElementById("checkbox_show_bounding_axes_projection_side").checked;
        
        canvas_wrapper_side.show_movable_axes = tree_view.IsVisibleInHierarchy(14);//document.getElementById("checkbox_show_movable_axes_side").checked;
        canvas_wrapper_side.show_origin_axes = tree_view.IsVisibleInHierarchy(13);//document.getElementById("checkbox_show_origin_axes_side").checked;
        canvas_wrapper_side.volume_rendering_mode = tree_view.IsVisibleInHierarchy(10) ? parseInt(document.getElementById("select_show_volume_side").value) : VOLUME_RENDERING_MODE_NONE;
        canvas_wrapper_side.volume_rendering_distance_between_points = parseFloat(document.getElementById("input_volume_rendering_distance_between_points").value);
        canvas_wrapper_side.volume_rendering_termination_opacity = parseFloat(document.getElementById("input_volume_rendering_termination_opacity").value);
        canvas_wrapper_side.volume_rendering_opacity_factor = parseFloat(document.getElementById("input_volume_rendering_opacity_factor").value);
       
        canvas_wrapper_side.debug_render_spherinder = document.getElementById("checkbox_debug_render_streamline_spherinder_aux").checked;
        canvas_wrapper_side.debug_render_3Sphere = document.getElementById("checkbox_debug_render_streamline_3Sphere_aux").checked;

        canvas_wrapper_side.transfer_function_index_streamline_scalar = parseInt(document.getElementById("select_transfer_function_index_scalar").value);
        canvas_wrapper_side.transfer_function_index_ftle_forward = parseInt(document.getElementById("select_transfer_function_index_ftle_forward").value);
        canvas_wrapper_side.transfer_function_index_ftle_backward = parseInt(document.getElementById("select_transfer_function_index_ftle_backward").value);

        
        canvas_wrapper_side.seed_visualization_mode = tree_view.IsVisibleInHierarchy(16) ? parseInt(document.getElementById("select_seed_mode_side").value) : SEED_VISUALIZATION_MODE_NONE;


        canvas_wrapper_side.SetLightIntegratorParameters(max_ray_distance, LIGHT_INTEGRATOR_LINE, light_integration_step_size, light_integration_max_step_count);
        canvas_wrapper_side.max_iteration_count = 1;
        console.log("fog_type", canvas_wrapper_side.fog_type);
        console.log("limited_max_distance", canvas_wrapper_side.limited_max_distance);
        document.getElementById("input_limited_max_ray_distance_aux").value = canvas_wrapper_side.limited_max_distance.toFixed(3);

        canvas_wrapper_side.lod_index_panning = document.getElementById("select_lod_panning").value;
        canvas_wrapper_side.lod_index_still = document.getElementById("select_lod_still").value;

        var still_resolution_factor = document.getElementById("input_still_resolution_factor").value;
        var panning_resolution_factor = document.getElementById("input_panning_resolution_factor").value;
        canvas_wrapper_side.UpdateResolutionFactor(gl_side, still_resolution_factor, panning_resolution_factor);

        var shader_formula_scalar = document.getElementById("input_formula_scalar").value;
        var shader_formula_scalar_float = shader_formula_scalar.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
            return ($2 == ".") ? $0 : $0 + ".0";
        });
        document.getElementById("input_formula_scalar_float").value = shader_formula_scalar_float;
        console.log("shader_formula_scalar", shader_formula_scalar);
        console.log("shader_formula_scalar_float", shader_formula_scalar_float);
        //canvas_wrapper_side.ReplaceRaytracingShader(gl_side, shader_formula_scalar_float);

        input_changed_manager.UpdateDefaultValuesRenderSettings();

        shader_manager.NotifySettingsChanged();

        visibility_manager.UpdateVisibility();
    }

    function UpdateGlobalData() {
        global_data.UpdateDataUnit();
        global_data.UpdateDataTextures(gl, gl_side, gl_transfer_function);
    }

    function UpdateGlobalDataIfDirty() {
        var dirty = object_manager.dirty || transfer_function_manager.dirty;
        if (!dirty)
            return;
        console.log("UpdateGlobalDataIfDirty");
        object_manager.dirty = false;
        transfer_function_manager.dirty = false;
        UpdateGlobalData();
    }

    function UpdateCamera() {
        console.log("UpdateCamera");
        main_camera.FromInput();
        //input_changed_manager.UpdateDefaultValuesMainCamera();
    }

    function UpdateSideCamera() {
        console.log("UpdateSideCamera");
        side_camera.FromInput();
        //input_changed_manager.UpdateDefaultValuesSideCamera();
    }

    function AddSeed() {
        console.log("AddSeed");
        ui_seeds.addSeed();
    }

    function AddMultiSeed() {
        console.log("AddMultiSeed");
        ui_seeds.addMultiSeed();
        ui_seeds.UpdateChanges();
    }

    function RandomizeSeedPositions() {
        console.log("RandomizeSeedPositions");
        //var seed = document.getElementById("input_random_position_seed").value;
        //ui_seeds.randomizePosition(seed);
        ui_seeds.randomizePosition();
    }

    function RandomizeSeedColors() {
        console.log("RandomizeSeedColors");
        //var seed = document.getElementById("input_random_position_seed").value;
        //ui_seeds.randomizePosition(seed);
        ui_seeds.randomizeColor();
    }
    /*
    function RandomizeSeedPositionsNewSeed() {
        console.log("RandomizeSeedPositionsNewSeed");
        var old_seed = document.getElementById("input_random_position_seed").value;
        var new_seed = parseInt(old_seed);
        if (isNaN(new_seed))
            new_seed = 0;
        new_seed += 1;
        document.getElementById("input_random_position_seed").value = new_seed;
        RandomizeSeedPositions();
    }
    */
   
    function UpdateURL() {
        console.log("UpdateURL");
        main_camera.saveCurrentState();
        side_camera.saveCurrentState();
        //var use_data_array = document.getElementById("checkbox_url_data_array").checked;
        var use_data_array = false;
        var layout_key = ui_tools.getSelectedLayoutKey();
        var query_string = input_parameter_wrapper.toQueryString(use_data_array, layout_key);
        //window.history.pushState(null, null, 'index.html' + query_string["default"]);
        window.history.pushState(null, null, 'index.html' + query_string);
    }

    function RedirectVersion(){
        console.log("RedirectVersion");

        var upgrade = window["global_is_upgrade"];
        if(upgrade){
            return;
        }

        var key = GetShortVersionStringURL();
        if(key in VERSION_REDIRECTION_DICT){
            console.log("Redirect: redirection found for key:", key);
            var url = VERSION_REDIRECTION_DICT[key];
            var url_without_query = window.location.toString().replace(window.location.search, "");
            var redirection_url = window.location.toString().replace(url_without_query, url);

            console.log("Redirect: url:", url);
            console.log("Redirect: url_without_query:", url_without_query);
            if(url === url_without_query){
                console.log("Redirect: already at destination", url);
                return;
            }  
            console.log("Redirect: redirect to:", redirection_url);  
            window.location.href = redirection_url; 
        }
        else{
            console.log("Redirect: no redirection found for key:", key);
        }
    }

    //used for redirection
    function GetShortVersionStringURL(){
        var year = window["URL_VERSION_YEAR"];
        var month = window["URL_VERSION_MONTH"];
        var number = window["URL_VERSION_NUMBER"];
        return GetShortVersionString(year, month, number);
    }

    function GetShortVersionStringCurrent(){
        var year = window["VERSION_YEAR"];
        var month = window["VERSION_MONTH"];
        var number = window["VERSION_NUMBER"];
        return GetShortVersionString(year, month, number);
    }
    
    function GetShortVersionString(year, month, number){   
        month = month.toString();
        month = month.length == 1 ? "0" + month : month;
        return year + "-" + month + "." + number;  
    }

    function GetShortVersionIntURL(){
        var year = window["URL_VERSION_YEAR"];
        var month = window["URL_VERSION_MONTH"];
        var number = window["URL_VERSION_NUMBER"];
        return GetShortVersionInt(year, month, number);
    }

    function GetShortVersionInt(year, month, number){   
        return 100000*year + 1000*month + number;  
    }
    
    /*
    //extended version used for display
    function GetCompleteVersionStringURL(){
        var year = window["URL_VERSION_YEAR"];
        var month = window["URL_VERSION_MONTH"];
        var number = window["URL_VERSION_NUMBER"];
        var state = window["URL_STATE_VERSION"];
        return GetCompleteVersionString(year, month, number, state);
    }

    //extended version used for display
    function GetCompleteVersionStringCurrent(){
        var year = window["VERSION_YEAR"];
        var month = window["VERSION_MONTH"];
        var number = window["VERSION_NUMBER"];
        var state = window["STATE_VERSION"];
        return GetCompleteVersionString(year, month, number, state);
    }

    function GetCompleteVersionString(year, month, number, state){        
        month = month.toString();
        month = month.length == 1 ? "0" + month : month;
        return year + "-" + month + "." + number + "S" + state;
    }
    */

    function UpdateVersionString(){

        var string_new_version = "";
        var string_upgrade_version = "";
        var url_without_query = window.location.toString().replace(window.location.search, "");
        var upgrade_url = window.location.toString().replace(url_without_query, URL_RELEASE);
        var upgrade_url = upgrade_url.replace("&c=1", "&upgrade=1&c=1");
        if(url_without_query.includes("-lts-")){
            string_new_version = "<span style='color: red'>A new version is available </span> <a href='" + URL_RELEASE + "'>here</a>";
            string_upgrade_version = "<span style='color: red'>. You can try to transfer the state </span> <a href='" + upgrade_url + "'>here</a>" +
                "<span style='color: red'>.</span>";
        }
        else if(url_without_query.includes("christian-lang")){
            string_new_version = "<span style='color: red'>This is the development version. The release version is available </span> <a href='" + URL_RELEASE + "'>here</a>";
            string_upgrade_version = "<span style='color: red'>. You can try to transfer the state </span> <a href='" + upgrade_url + "'>here</a>" +
                "<span style='color: red'>.</span>";
        }
        else if(url_without_query.includes("localhost")){
            string_new_version = "<span style='color: red'>This is the local version. The release version is available </span> <a href='" + URL_RELEASE + "'>here</a>";
            string_upgrade_version = "<span style='color: red'>. You can try to transfer the state </span> <a href='" + upgrade_url + "'>here</a>" +
                "<span style='color: red'>.</span>";
        }

        var string_url = GetShortVersionStringURL();            

        var string_current = GetShortVersionStringCurrent();

        var string_compare = "Version: " + string_current + ". ";

        if(string_url !== string_current){
            string_compare = "This savestate was created with version: " + 
            string_url + " " +
            "and is currently running on version: " +
            string_current + ". ";
        }

        document.getElementById("paragraph_version_string").innerHTML = 
        string_compare +
        string_new_version + string_upgrade_version;
    }

    function SetMagneticField(){
        document.getElementById("select_space").value = "1";
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        hide_manager.UpdateVisibility();
    }

    function SetDoublePendulum(){
        document.getElementById("select_space").value = "2";
        document.getElementById("input_field_equation_a").value = "sin(4*PI*(x-y)) / (2*(cos(2*PI*(x-y))-2)) * v_x*v_x - sin(2*PI*(x-y)) / (2-cos(2*PI*(x-y))) * v_y*v_y";
        document.getElementById("input_field_equation_b").value = "-2*sin(2*PI*(x-y)) / (2-cos(2*PI*(x-y))) * v_x*v_x - sin(4*PI*(x-y)) / (2*(cos(2*PI*(x-y))-2)) * v_y*v_y";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        hide_manager.UpdateVisibility();
    }

    function SetExample1(){
        document.getElementById("select_space").value = "1";
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "0";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        hide_manager.UpdateVisibility();
    }

    function SetExample2(){
        document.getElementById("select_space").value = "1";
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "1";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        hide_manager.UpdateVisibility();
    }

    function SetExample3(){
        document.getElementById("select_space").value = "1";
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "cos(2 * PI * x)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        hide_manager.UpdateVisibility();
    }

    function SetExample4(){
        document.getElementById("select_space").value = "1";
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "sin(2 * PI * x) + cos(2 * PI * y)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        hide_manager.UpdateVisibility();
    }

    function SetExample5(){
        document.getElementById("select_space").value = "1";
        document.getElementById("input_field_equation_u").value = "2 * sin(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * y) + 2 * cos (2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "cos(2 * PI * x)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        hide_manager.UpdateVisibility();
    }
  

    function testWebGPU() {
        async function demo() {
            console.log('B');
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                console.log("testWebGPU error A");
                return;

            }
            const device = await adapter.requestDevice();
            if (!device) {
                console.log("testWebGPU error B");
                return;

            }
            console.log("testWebGPU successful");
            console.log('C');
        }

        console.log('A');
        demo().then(() => {
            console.log('D');
        });

        console.log('E');
    }

    function testEigenvalueDecomposition() {
        console.log("EigenvalueDecomposition test");
        var A = new Matrix([[5, 2, 0], [2, 5, 0], [-3, 4, 6]]);
        var e = new EigenvalueDecomposition(A);
        var real = e.realEigenvalues;
        var imaginary = e.imaginaryEigenvalues;
        var S = e.eigenvectorMatrix;
        var S_inverse = inverse(S);
        var J = new Matrix([[real[0], 0, 0], [0, real[1], 0], [0, 0, real[2]]]);
        var M = S.mmul(J).mmul(S_inverse);

        console.log("real", real);
        console.log("imaginary", imaginary);
        console.log("S", S);
        console.log("J", J);
        console.log("S_inverse", S_inverse);
        console.log("reconstructed M", M);
    }

    function selectTab(evt, id) {
        console.log(id);
        // Declare all variables
        var i, tabcontent, tablinks;

        // Get all elements with class="tabcontent" and hide them
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Get all elements with class="tablinks" and remove the class "active"
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }

        // Show the current tab, and add an "active" class to the button that opened the tab
        document.getElementById(id).style.display = "block";
        evt.currentTarget.className += " active";
    }

    function UpdateAnimation(time_now, deltaTime) {
        if(canvas_wrapper_side.draw_mode != DRAW_MODE_FTLE_SLICE)
            return;
        
        UpdateSliceSettings();

        var animate = document.getElementById("checkbox_animate_slice_index").checked
        if (!animate)
            return;

        var slider = document.getElementById("slide_slice_index");
        var max_index = ftle_manager.dim_z - 1;

        var loop_time_s = 10;
        var time_now_s = time_now / 1000;
        var fraction = time_now_s / loop_time_s;
        var completed_loops = Math.floor(fraction);
        var t = fraction - completed_loops;
        var index = Math.round(lerp(0, max_index, t));

        slider.value = index;

        canvas_wrapper_side.draw_slice_index = index;
    }

    function UpdateSliceSettings(){
        canvas_wrapper_side.draw_slice_axes_order = parseInt(document.getElementById("select_slice_axes_order").value);
        canvas_wrapper_side.draw_slice_mode = parseInt(document.getElementById("select_slice_mode").value);
        canvas_wrapper_side.aliasing_index = 0;
        canvas_wrapper_side.ftle_slice_interpolate = document.getElementById("checkbox_ftle_slice_interpolate").checked;
        
    }

    function DeactivateInput(){        
        mouse_manager.DeactivateInput();
        ui_left_tool_bar.DeactivateInput();
        ui_tools.DeactivateInput();
        block_all_input = true;
    }

    function ActivateInput(){        
        mouse_manager.ActivateInput();
        ui_left_tool_bar.ActivateInput();
        ui_tools.ActivateInput();
        block_all_input = false;
    }

})();