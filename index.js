//########## GLOBALS ##########
const module_const = require("./const");
const f_shader_average = require("./shader/f_shader_average.glsl");
const f_shader_compute_flow_map_slice = require("./shader/f_shader_compute_flow_map_slice.glsl");
const f_shader_compute_flowmap_finite_differences = require("./shader/f_shader_compute_flowmap_finite_differences.glsl");
const f_shader_compute_ftle_normals = require("./shader/f_shader_compute_ftle_normals.glsl");
const f_shader_copy = require("./shader/f_shader_copy.glsl");
const f_shader_flow_map_slice = require("./shader/f_shader_flow_map_slice.glsl");
const f_shader_placeholder = require("./shader/f_shader_placeholder.glsl");
const f_shader_raytracing = require("./shader/f_shader_raytracing.glsl");
const f_shader_resampling = require("./shader/f_shader_resampling.glsl");
const f_shader_sum = require("./shader/f_shader_sum.glsl");
const v_shader_raytracing = require("./shader/v_shader_raytracing.glsl");
const v_shader_resampling = require("./shader/v_shader_resampling.glsl");

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
const Camera = require("./camera");
const InputManager = require("./input_manager");
const MouseManager = require("./mouse_manager");
const module_webgl = require("./webgl");
const getRenderingContext = module_webgl.getRenderingContext;
const UISeeds = require("./ui_seeds");
const UITransferFunctions = require("./ui_transfer_functions");
const Lights = require("./lights");
const TransferFunctionManager = require("./transfer_function_manager");
const ObjectManager = require("./object_manager");
const GlobalData = require("./global_data");
const ShaderManager = require("./shader_manager");
const StreamlineContext = require("./streamline_context");
const FTLEManager = require("./ftle_manager");
const Aliasing = require("./aliasing");
const CanvasWrapper = require("./canvas_wrapper");
const InputParameterWrapper = require("./input_parameter_wrapper");
const module_utility = require("./utility");
const setCSS = module_utility.setCSS;
const lerp = module_utility.lerp;
const module_export = require("./export");
const Export = module_export.Export;

; (function () {
    "use strict"
    window.addEventListener("load", onStart, false);

    var gl;
    var gl_side;
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
    var input_manager;
    var mouse_manager;
    var input_changed_manager;
    var hide_manager;
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
    var input_parameter_wrapper;

    var data_changed = false;
    var settings_changed = false;

    var ui_seeds;
    var ui_transfer_functions;
    var global_data;
    var time_last_tick = 0;
    var fps_display;
    var message_display;
    var current_fps = 0;

    var tab_manager;

    function onStart(evt) {
        console.log("onStart");
        window.removeEventListener(evt.type, onStart, false);
        addOnClickRequestData();
        addOnClickUpdateRenderSettings();
        addOnClickUpdateCamera();
        addOnClickAddSeed();
        addOnClickRandomizeSeedPositions();
        addOnClickUpdateURL();
        addOnClickExport();
        addOnClickTabs();
        addChangedSideMode();
        //testWebGPU();
        //testEigenvalueDecomposition();

        tab_manager = new TabManager();

        main_canvas = document.getElementById("main_canvas");
        side_canvas = document.getElementById("side_canvas");
        fps_display = document.getElementById("fps_display");
        message_display = document.getElementById("message_display");


        input_changed_manager = new InputChangedManager();
        hide_manager = new HideManager();
        main_camera = new Camera("main_camera", input_changed_manager);
        side_camera = new Camera("side_camera", input_changed_manager);


        input_manager = new InputManager(main_canvas, main_camera, side_canvas, side_camera);
        input_manager.initialize();
        mouse_manager = new MouseManager(main_canvas, main_camera, side_canvas, side_camera);
        mouse_manager.initialize();
        //buildErrorDictionary();

        if (!(gl = getRenderingContext(main_canvas)))
            return;
        if (!(gl_side = getRenderingContext(side_canvas)))
            return;
        console.log(gl);
        console.log(gl_side);

        var ext = gl_side.getExtension('EXT_color_buffer_float');
        if (!ext) {
            alert("FTLE not supported: could not load EXT_color_buffer_float");
            return;
        }

        ui_seeds = new UISeeds();
        ui_seeds.generateDefaultSeeds();
        input_changed_manager.LinkUISeeds(ui_seeds);

        ui_transfer_functions = new UITransferFunctions();

        lights = new Lights();
        lights.GenerateDefaultLighting();

        transfer_function_manager = new TransferFunctionManager(ui_transfer_functions);
        object_manager = new ObjectManager();

        global_data = new GlobalData(gl, gl_side, lights, ui_seeds, transfer_function_manager, object_manager);

        shader_manager = new ShaderManager();
        streamline_context_static = new StreamlineContext("static", lights, ui_seeds, gl, gl_side);
        ftle_manager = new FTLEManager(gl_side, streamline_context_static, shader_manager);

        main_camera.SetRenderSizes(1280, 720, 640, 360);
        main_camera.position = glMatrix.vec3.fromValues(0.5399, 0.7699, 0.001);
        main_camera.forward = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
        main_camera.up = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);

        main_camera.LinkInput(
            document.getElementById("input_camera_position_x"),
            document.getElementById("input_camera_position_y"),
            document.getElementById("input_camera_position_z"),
            document.getElementById("input_camera_forward_x"),
            document.getElementById("input_camera_forward_y"),
            document.getElementById("input_camera_forward_z"),
            document.getElementById("input_camera_up_x"),
            document.getElementById("input_camera_up_y"),
            document.getElementById("input_camera_up_z"));

        side_camera.SetRenderSizes(512, 384, 256, 192);
        //side_camera.position = glMatrix.vec3.fromValues(-0.750000, 0.500000, 1.250000);
        //side_camera.forward = glMatrix.vec3.fromValues(0.824459, 0.005006, -0.565899);
        //side_camera.up = glMatrix.vec3.fromValues(0.565852, 0.008385, 0.824465);
        side_camera.position = glMatrix.vec3.fromValues(0.500000, -0.750000, 1.200000);
        side_camera.forward = glMatrix.vec3.fromValues(-0.023683, 0.813820, -0.580633);
        side_camera.up = glMatrix.vec3.fromValues(-0.008492, -0.580940, -0.813903);

        side_camera.LinkInput(
            document.getElementById("input_side_camera_position_x"),
            document.getElementById("input_side_camera_position_y"),
            document.getElementById("input_side_camera_position_z"),
            document.getElementById("input_side_camera_forward_x"),
            document.getElementById("input_side_camera_forward_y"),
            document.getElementById("input_side_camera_forward_z"),
            document.getElementById("input_side_camera_up_x"),
            document.getElementById("input_side_camera_up_y"),
            document.getElementById("input_side_camera_up_z"));

        aliasing = new Aliasing();




        canvas_wrapper_main = new CanvasWrapper(gl, streamline_context_static, ftle_manager, CANVAS_WRAPPER_MAIN,
            main_canvas, CANVAS_MAIN_WIDTH, CANVAS_MAIN_HEIGHT, main_camera, aliasing, shader_manager, global_data);
        canvas_wrapper_side = new CanvasWrapper(gl_side, streamline_context_static, ftle_manager, CANVAS_WRAPPER_SIDE,
            side_canvas, CANVAS_SIDE_WIDTH, CANVAS_SIDE_HEIGHT, side_camera, aliasing, shader_manager, global_data);

        tick_counter = 0;
        frame_counter = 0;
        var strongs = document.querySelectorAll("strong");
        strong_tick_counter = strongs[0];
        strong_frame_counter = strongs[1];
        strong_fps = strongs[2];
        //strong_time = strongs[2];
        //strong_delta_time = strongs[3];

        initializeAttributes();

        input_parameter_wrapper = new InputParameterWrapper(ui_seeds, main_camera, tab_manager);
        input_parameter_wrapper.fromURL();



        hide_manager.UpdateVisibility();

        message_display.innerHTML = "calculating...";
        setTimeout(on_start_delayed, 1000);
    }

    function on_start_delayed() {
        CalculateStreamlines();
        UpdateRenderSettings();
        UpdateGlobalData();
        on_fully_loaded();
        requestAnimationFrame(on_update);
    }

    function on_fully_loaded() {
        console.log("on_fully_loaded");
        setCSS(input_parameter_wrapper.css_loaded);
        message_display.innerHTML = "";
    }


    function on_update(time_now) {
        tick_counter++;
        var deltaTime = (time_now - time_last_tick) / 1000;

        UpdateAnimation(time_now, deltaTime);

        input_manager.on_update(deltaTime, mouse_manager.active_camera);

        main_camera.repositionCamera();
        main_camera.UpdateShaderValues();
        main_camera.WriteToInputFields();
        object_manager.movable_axes_state_main.SetCameraData(
            main_camera.position,
            main_camera.forward,
            main_camera.up,
            main_camera.p_1m,
            main_camera.q_x,
            main_camera.q_y);

        //side_camera.repositionCamera();
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

        canvas_wrapper_main.draw(gl, data_changed, settings_changed, main_camera.mouse_in_canvas);
        canvas_wrapper_side.draw(gl_side, data_changed, settings_changed, side_camera.mouse_in_canvas);
        frame_counter++;
        frame_counter = canvas_wrapper_main.aliasing_index;
        main_camera.changed = false;
        side_camera.changed = false;
        settings_changed = false;
        data_changed = false;

        //gl.finish();
        current_fps = 1 / deltaTime

        strong_tick_counter.innerHTML = tick_counter;
        strong_frame_counter.innerHTML = frame_counter;
        //strong_time.innerHTML = time_now.toFixed(3);
        //strong_delta_time.innerHTML = deltaTime.toFixed(3);
        strong_fps.innerHTML = current_fps.toFixed(1);

        var text_fps_panning = current_fps.toFixed(1);
        if (main_camera.IsPanningOrForced())
            text_fps_panning += "[P]";
        fps_display.innerHTML = text_fps_panning;

        UpdateHiddenWarnings();
        input_changed_manager.CheckValuesChanged();

        time_last_tick = time_now;
        requestAnimationFrame(on_update);
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
        document.getElementById("button_request_data").addEventListener("click", function () {
            console.log("onClickRequestData");
            //MARKER url changes
            //window.location.href = window.location.pathname + '?u=123';
            //window.history.replaceState(null, null, 'index.html?u=123');
            CalculateStreamlines();
            UpdateRenderSettings();
            UpdateGlobalData();
            UpdateURL();
        });
        document.getElementById("button_calculate_ftle").addEventListener("click", function () {
            console.log("onClickCalculateFTLE");
            CalculateFTLE();
        });

    }

    function addOnClickUpdateRenderSettings() {
        document.getElementById("button_render_settings").addEventListener("click", function () {
            console.log("onClickUpdateRenderSettings");
            UpdateRenderSettings();
            UpdateGlobalData();
        });
        document.getElementById("button_data_update_render_settings").addEventListener("click", function () {
            console.log("onClickUpdateRenderSettings");
            UpdateRenderSettings();
            UpdateGlobalData();
        });
    }

    function addOnClickUpdateCamera() {
        document.getElementById("button_update_camera").addEventListener("click", function () {
            console.log("onClickUpdateCamera");
            UpdateCamera();
        });
        document.getElementById("button_update_side_camera").addEventListener("click", function () {
            console.log("onClickUpdateSideCamera");
            UpdateSideCamera();
        });


    }

    function addOnClickAddSeed() {
        document.getElementById("button_add_seed").addEventListener("click", function () {
            console.log("onClickAddSeed");
            AddSeed();
        });
    }

    function addOnClickRandomizeSeedPositions() {
        document.getElementById("button_randomize_seed_positions").addEventListener("click", function () {
            console.log("onClickRandomizeSeedPositions");
            RandomizeSeedPositions();
        });
        document.getElementById("button_randomize_seed_colors").addEventListener("click", function () {
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

    function addOnClickUpdateURL() {
        document.getElementById("button_update_url").addEventListener("click", function () {
            console.log("onClickUpdateURL");
            UpdateURL();
        });
        document.getElementById("button_export_update_url").addEventListener("click", function () {
            console.log("onClickUpdateURL");
            UpdateURL();
        });
    }

    function addOnClickExport() {
        document.getElementById("button_export").addEventListener("click", function () {
            console.log("onClickExport");
            UpdateURL();
            Export(input_parameter_wrapper);
        });
    }

    function addOnClickTabs() {
        document.getElementById("button_tab_data").addEventListener("click", function () {
            console.log("onClick: button_tab_data");
            tab_manager.selectTab("tab_group_main", "tab_data");
        });
        document.getElementById("button_tab_ftle").addEventListener("click", function () {
            console.log("onClick: button_tab_ftle");
            tab_manager.selectTab("tab_group_main", "tab_ftle");
        });
        document.getElementById("button_tab_settings").addEventListener("click", function () {
            console.log("onClick: button_tab_settings");
            tab_manager.selectTab("tab_group_main", "tab_settings");
        });
        document.getElementById("button_tab_transfer_function").addEventListener("click", function () {
            console.log("onClick: button_tab_transfer_function");
            tab_manager.selectTab("tab_group_main", "tab_transfer_function");
        });        
        document.getElementById("button_tab_information").addEventListener("click", function () {
            console.log("onClick: button_tab_information");
            tab_manager.selectTab("tab_group_main", "tab_information");
        });
        document.getElementById("button_tab_edit").addEventListener("click", function () {
            console.log("onClick: button_tab_edit");
            tab_manager.selectTab("tab_group_main", "tab_edit");
        });
        document.getElementById("button_tab_export").addEventListener("click", function () {
            console.log("onClick: button_tab_export");
            tab_manager.selectTab("tab_group_main", "tab_export");
        });
        document.getElementById("button_tab_help").addEventListener("click", function () {
            console.log("onClick: button_tab_help");
            tab_manager.selectTab("tab_group_main", "tab_help");
        });
    }

    function addChangedSideMode() {
        document.getElementById("select_side_mode").addEventListener("change", (event) => {
            var value = document.getElementById("select_side_mode").value;
            canvas_wrapper_side.set_draw_mode(parseInt(value));
        });

        document.getElementById("slide_slice_index").addEventListener("change", (event) => {
            var value = document.getElementById("slide_slice_index").value;
            canvas_wrapper_side.draw_slice_index = value;
            console.log("slice_index", value);
            UpdateSliceSettings();
        });
    }

    function CalculateStreamlines() {
        console.log("CalculateStreamlines");
        var shader_formula_u = document.getElementById("input_field_equation_u").value;
        var shader_formula_v = document.getElementById("input_field_equation_v").value;
        var shader_formula_w = document.getElementById("input_field_equation_w").value;
        var num_points_per_streamline = document.getElementById("input_num_points_per_streamline").value;
        var step_size = document.getElementById("input_step_size").value;
        var segment_duplicator_iterations = document.getElementById("segment_duplicator_iterations").value;
        var direction = DIRECTION_FORWARD;
        streamline_context_static.CalculateStreamlines(gl, gl_side, shader_formula_u, shader_formula_v, shader_formula_w, num_points_per_streamline, step_size, segment_duplicator_iterations, direction);
        data_changed = true;
        input_changed_manager.UpdateDefaultValuesCalculate();
    }

    function CalculateFTLE() {
        var dim_x = parseInt(document.getElementById("input_ftle_dim_x").value);
        var dim_y = parseInt(document.getElementById("input_ftle_dim_y").value);
        var dim_z = parseInt(document.getElementById("input_ftle_dim_z").value);
        var advection_time = parseFloat(document.getElementById("input_ftle_advection_time").value);
        var step_size = parseFloat(document.getElementById("input_ftle_step_size").value);
        ftle_manager.compute(gl_side, dim_x, dim_y, dim_z, advection_time, step_size);

        var slider = document.getElementById("slide_slice_index");
        var value = Math.min(slider.value, dim_z - 1);
        slider.max = dim_z - 1;
        slider.value = value;

        canvas_wrapper_side.draw_slice_index = value;
        canvas_wrapper_side.aliasing_index = 0;

        console.log("draw_slice_index", value);
    }

    function UpdateRenderSettings() {
        console.log("UpdateRenderSettings");
        settings_changed = true;

        transfer_function_manager.UpdateFromUI();

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

        //MAIN
        canvas_wrapper_main.max_ray_distance = parseFloat(document.getElementById("input_max_ray_distance").value);
        canvas_wrapper_main.tube_radius = 0.005 * document.getElementById("input_tube_radius_factor").value;
        canvas_wrapper_main.fog_density = document.getElementById("input_fog_density").value;
        canvas_wrapper_main.fog_type = document.getElementById("select_fog_type").value;
        canvas_wrapper_main.shading_mode_streamlines = document.getElementById("select_shading_mode_streamlines").value;
        canvas_wrapper_main.min_scalar = document.getElementById("input_min_scalar").value;
        canvas_wrapper_main.max_scalar = document.getElementById("input_max_scalar").value;
        canvas_wrapper_main.cut_at_cube_faces = false;
        canvas_wrapper_main.handle_inside = false;
        canvas_wrapper_main.is_main_renderer = true;
        canvas_wrapper_main.show_bounding_box = document.getElementById("checkbox_show_bounding_axes_main").checked;
        canvas_wrapper_main.show_movable_axes = document.getElementById("checkbox_show_movable_axes_main").checked;
        canvas_wrapper_main.show_origin_axes = false;//document.getElementById("checkbox_show_origin_axes_main").checked;
        canvas_wrapper_main.show_volume_rendering = document.getElementById("checkbox_show_volume_main").checked;
        canvas_wrapper_main.volume_rendering_distance_between_points = parseFloat(document.getElementById("input_volume_rendering_distance_between_points").value);
        canvas_wrapper_main.volume_rendering_termination_opacity = parseFloat(document.getElementById("input_volume_rendering_termination_opacity").value);
       
        canvas_wrapper_main.CalculateLimitedMaxRayDistance();
        canvas_wrapper_main.max_iteration_count = Math.ceil(canvas_wrapper_main.limited_max_distance) * 3;
        console.log("fog_type", canvas_wrapper_main.fog_type);
        console.log("limited_max_distance", canvas_wrapper_main.limited_max_distance);
        document.getElementById("input_limited_max_ray_distance").value = canvas_wrapper_main.limited_max_distance.toFixed(3);

        canvas_wrapper_main.lod_index_panning = document.getElementById("select_lod_panning").value;
        canvas_wrapper_main.lod_index_still = document.getElementById("select_lod_still").value;

        var panning_resolution_factor = document.getElementById("input_panning_resolution_factor").value;
        canvas_wrapper_main.UpdatePanningResolutionFactor(gl, panning_resolution_factor);

        var shader_formula_scalar = document.getElementById("input_formula_scalar").value;
        var shader_formula_scalar_float = shader_formula_scalar.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
            return ($2 == ".") ? $0 : $0 + ".0";
        });
        document.getElementById("input_formula_scalar_float").value = shader_formula_scalar_float;
        console.log("shader_formula_scalar", shader_formula_scalar);
        console.log("shader_formula_scalar_float", shader_formula_scalar_float);
        canvas_wrapper_main.ReplaceRaytracingShader(gl, shader_formula_scalar_float);

        //SIDE
        canvas_wrapper_side.max_ray_distance = parseFloat(document.getElementById("input_max_ray_distance").value);
        canvas_wrapper_side.tube_radius = 0.005 * document.getElementById("input_tube_radius_factor").value;
        canvas_wrapper_side.fog_density = document.getElementById("input_fog_density").value;
        canvas_wrapper_side.fog_type = document.getElementById("select_fog_type").value;
        canvas_wrapper_side.shading_mode_streamlines = document.getElementById("select_shading_mode_streamlines").value;
        canvas_wrapper_side.min_scalar = document.getElementById("input_min_scalar").value;
        canvas_wrapper_side.max_scalar = document.getElementById("input_max_scalar").value;
        canvas_wrapper_side.cut_at_cube_faces = true;
        canvas_wrapper_side.handle_inside = false;
        canvas_wrapper_side.is_main_renderer = false;
        canvas_wrapper_side.show_bounding_box = document.getElementById("checkbox_show_bounding_axes_side").checked;
        canvas_wrapper_side.show_movable_axes = document.getElementById("checkbox_show_movable_axes_side").checked;
        canvas_wrapper_side.show_origin_axes = document.getElementById("checkbox_show_origin_axes_side").checked;
        canvas_wrapper_side.show_volume_rendering = document.getElementById("checkbox_show_volume_side").checked;
        canvas_wrapper_side.volume_rendering_distance_between_points = parseFloat(document.getElementById("input_volume_rendering_distance_between_points").value);
        canvas_wrapper_side.volume_rendering_termination_opacity = parseFloat(document.getElementById("input_volume_rendering_termination_opacity").value);
       
        canvas_wrapper_side.CalculateLimitedMaxRayDistance();
        canvas_wrapper_side.max_iteration_count = 1;
        console.log("fog_type", canvas_wrapper_side.fog_type);
        console.log("limited_max_distance", canvas_wrapper_side.limited_max_distance);
        document.getElementById("input_limited_max_ray_distance").value = canvas_wrapper_side.limited_max_distance.toFixed(3);

        canvas_wrapper_side.lod_index_panning = document.getElementById("select_lod_panning").value;
        canvas_wrapper_side.lod_index_still = document.getElementById("select_lod_still").value;

        var panning_resolution_factor = document.getElementById("input_panning_resolution_factor").value;
        canvas_wrapper_side.UpdatePanningResolutionFactor(gl_side, panning_resolution_factor);

        var shader_formula_scalar = document.getElementById("input_formula_scalar").value;
        var shader_formula_scalar_float = shader_formula_scalar.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
            return ($2 == ".") ? $0 : $0 + ".0";
        });
        document.getElementById("input_formula_scalar_float").value = shader_formula_scalar_float;
        console.log("shader_formula_scalar", shader_formula_scalar);
        console.log("shader_formula_scalar_float", shader_formula_scalar_float);
        canvas_wrapper_side.ReplaceRaytracingShader(gl_side, shader_formula_scalar_float);

        input_changed_manager.UpdateDefaultValuesRenderSettings();
    }

    function UpdateGlobalData() {
        global_data.UpdateDataUnit();
        global_data.UpdateDataTextures(gl, gl_side);
    }

    function UpdateGlobalDataIfDirty() {
        if (!object_manager.dirty)
            return;
        console.log("UpdateGlobalDataIfDirty");
        object_manager.dirty = false;
        global_data.UpdateDataUnit();
        global_data.UpdateDataTextures(gl, gl_side);
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
        var query_string = input_parameter_wrapper.toQueryString();
        window.history.pushState(null, null, 'index.html' + query_string);
    }

    function UpdateHiddenWarnings() {
        var warning_counter = 0;

        /*
        var class_name = "hidden";
        if(main_camera.panning_forced){
            class_name = "list_entry";
            warning_counter += 1;
        }
        document.getElementById("list_warning_p").className = class_name;
        */

        var class_name = "hidden";
        if (main_camera.panning_forced) {
            class_name = "warning";
            warning_counter += 1;
        }
        document.getElementById("warning_p").className = class_name;


        /*
                class_name = "hidden";
                if(canvas_wrapper_main.isRenderingIncomplete()){
                    class_name = "list_entry";
                    warning_counter += 1;
                }
                document.getElementById("list_warning_index").className = class_name;*/

        class_name = "hidden";
        if (canvas_wrapper_main.isRenderingIncomplete()) {
            class_name = "warning";
            warning_counter += 1;
        }
        document.getElementById("warning_index").className = class_name;


        /*
                var text = document.getElementById("input_thumbnail").value
                class_name = "hidden";
                if(text == ""){
                    class_name = "list_entry";
                    warning_counter += 1;
                }
                document.getElementById("list_warning_thumbnail_url").className = class_name;*/

        var text = document.getElementById("input_thumbnail").value
        class_name = "hidden";
        if (text == "") {
            class_name = "warning";
            warning_counter += 1;
        }
        document.getElementById("warning_thumbnail_url").className = class_name;

        /*
                class_name = "hidden";
                if(warning_counter > 0){
                    class_name = "warning";
                    warning_counter += 1;
                }
                document.getElementById("h_export_warnings").className = class_name;        */
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

})();