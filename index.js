; (function () {
    "use strict"
    window.addEventListener("load", onStart, false);

    var gl;
    var program;
    var program_shader_uniforms;
    var timer;
    var tick_counter;
    var frame_counter;
    var strong_tick_counter;
    var strong_frame_counter;
    var location_color_r;
    var location_texture_float;
    var location_texture_int;
    var location_width;
    var location_height;

    var texture_float;
    var texture_float_settings;
    var texture_float_data;
    var texture_int;
    var texture_int_settings;
    var texture_int_data;

    var data_container_lod_0_positions;
    var data_container_lod_0_line_segments;
    var data_container_lod_0_tree_nodes;
    var data_container_lod_0_dir_lights;
    var data_unit_lod_0;

    var lod_0;

    var main_camera;
    var main_canvas;
    var input_manager;
    var mouse_manager;
    var streamline_generator;
    var lights;
    var streamline_context_static;//the static streamlines
    var streamline_context_dynamic;//interactive streamline placement

    var aliasing;
    var canvas_wrapper_main;
    var input_parameter_wrapper;

    var buffer_lights;
    var GLOBAL_DATA = "old data";
    var data_changed = false;

    function onStart(evt) {
        console.log("onStart");
        window.removeEventListener(evt.type, onStart, false);
        addOnClickRequestData();
        addOnClickUpdateRenderSettings();
        testWebGPU();
        testParameterExtractionFromURL();

        main_canvas = document.getElementById("main_canvas");

        main_camera = new Camera("main_camera");

        input_manager = new InputManager(main_canvas);
        input_manager.initialize();
        mouse_manager = new MouseManager(main_canvas, main_camera);
        mouse_manager.initialize();

        buildErrorDictionary();

        if (!(gl = getRenderingContext()))
            return;


        lights = new Lights();
        lights.GenerateDefaultLighting();
        streamline_context_static = new StreamlineContext("static", lights, gl);
        //streamline_context_static.CalculateExampleStreamlines(gl);

        main_camera.SetRenderSizes(800, 600, 400, 300);
        main_camera.position = glMatrix.vec3.fromValues(0.5399, 0.7699, 0.001);
        main_camera.forward = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
        main_camera.up = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);

        aliasing = new Aliasing();

        canvas_wrapper_main = new CanvasWrapper(gl, streamline_context_static, "main", main_canvas, main_camera, aliasing);


        var tex = generateDataTextureFloat(gl);
        texture_float = tex.texture;
        texture_float_data = tex.texture_data;
        texture_float_settings = tex.texture_settings;

        tex = generateDataTextureInt(gl);
        texture_int = tex.texture;
        texture_int_data = tex.texture_data;
        texture_int_settings = tex.texture_settings;

        program = gl.createProgram();

        tick_counter = 0;
        frame_counter = 0;
        var strongs = document.querySelectorAll("strong");
        strong_tick_counter = strongs[0];
        strong_frame_counter = strongs[1];

        loadShaderProgram(gl, program, "#vertex-shader", "#fragment-shader");
        loadUniformLocations(program);

        initializeAttributes();

        gl.useProgram(program);

        input_parameter_wrapper = new InputParameterWrapper();
        input_parameter_wrapper.fromURL();
        CalculateStreamlines(gl);
        //runParametersFromURL();
        UpdateRenderSettings();

        timer = setTimeout(on_update, 1);
    }

    function on_update() {
        tick_counter++;

        var x = (frame_counter % 1000) / 1000

        if (input_manager.isKeyDown(input_manager.KEY_INDEX_A)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveLeft(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_D)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveRight(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_W)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveForward(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_S)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveBackward(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_R)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveUp(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_F)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveDown(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_Q)) {
            var deltaTime = 0.01;
            var left_handed = false;
            main_camera.RollLeft(deltaTime, left_handed);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_E)) {
            var deltaTime = 0.01;
            var left_handed = false;
            main_camera.RollRight(deltaTime, left_handed);
        }
        main_camera.repositionCamera();
        main_camera.UpdateShaderValues();
        //main_camera.WriteToUniform(gl, program, "active_camera");

        //gl.uniform1f(location_color_r, 0.5 + 0.5 * Math.sin(2 * Math.PI * x));
        //gl.uniform1i(location_width, main_camera.width);
        //gl.uniform1i(location_height, main_camera.height);
        /*
        var progressive_active = true;
        if (main_camera.changed || data_changed || progressive_active) {

            frame_counter++;
            main_camera.changed = false;
            data_changed = false;
            canvas_wrapper_main.draw(gl, data_changed);
        }
*/
        canvas_wrapper_main.draw(gl, data_changed);
        frame_counter++;
        frame_counter = canvas_wrapper_main.aliasing_index;
        main_camera.changed = false;
        data_changed = false;

        gl.finish();
        strong_tick_counter.innerHTML = tick_counter;
        strong_frame_counter.innerHTML = frame_counter;
        //shedule next call
        timer = setTimeout(on_update, 60);
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

    function loadUniformLocations(program) {
        location_color_r = gl.getUniformLocation(program, "color_r");
        location_texture_float = gl.getUniformLocation(program, "texture_float");
        location_texture_int = gl.getUniformLocation(program, "texture_int");
        location_width = gl.getUniformLocation(program, "width");
        location_height = gl.getUniformLocation(program, "height");

        program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.registerUniform("start_index_int_position_data", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_position_data", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_line_segments", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_line_segments", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_tree_nodes", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_tree_nodes", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_dir_lights", "INT", -1);
        program_shader_uniforms.print();
    }
    /*
    uniform int start_index_int_position_data = 0;//DUMMY
    uniform int start_index_float_position_data = 0;//DUMMY
    uniform int start_index_int_line_segments = 0;//DUMMY
    uniform int start_index_float_line_segments = 80544;//DUMMY
    uniform int start_index_int_tree_nodes = 102560;//DUMMY
    uniform int start_index_float_tree_nodes = 490784;//DUMMY
    uniform int start_index_int_dir_lights = 177424;//DUMMY
    uniform int start_index_float_dir_lights = 640512;//DUMMY
    */

    function addOnClickRequestData() {
        document.getElementById("button_request_data").addEventListener("click", function () {
            console.log("onClickRequestData");
            //MARKER url changes
            //window.location.href = window.location.pathname + '?u=123';
            //window.history.replaceState(null, null, 'index.html?u=123');
            CalculateStreamlines();
            var query_string = input_parameter_wrapper.toQueryString();
            window.history.pushState(null, null, 'index.html' + query_string);
        });
    }

    function addOnClickUpdateRenderSettings() {
        document.getElementById("button_render_settings").addEventListener("click", function () {
            console.log("onClickUpdateRenderSettings");
            UpdateRenderSettings();
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
        streamline_context_static.CalculateStreamlines(gl, shader_formula_u, shader_formula_v, shader_formula_w, num_points_per_streamline, step_size, segment_duplicator_iterations, direction);
        data_changed = true;
    }

    function UpdateRenderSettings() {
        console.log("UpdateRenderSettings");
        canvas_wrapper_main.max_ray_distance = document.getElementById("input_max_ray_distance").value;
        var panning_resolution_factor = document.getElementById("input_panning_resolution_factor").value;
        canvas_wrapper_main.UpdatePanningResolutionFactor(gl, panning_resolution_factor);
    }

    function on_update_old() {
        tick_counter++;

        var x = (frame_counter % 1000) / 1000

        if (input_manager.isKeyDown(input_manager.KEY_INDEX_A)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveLeft(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_D)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveRight(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_W)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveForward(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_S)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveBackward(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_R)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveUp(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_F)) {
            var deltaTime = 0.01;
            var slow = false;
            main_camera.moveDown(deltaTime, slow);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_Q)) {
            var deltaTime = 0.01;
            var left_handed = false;
            main_camera.RollLeft(deltaTime, left_handed);
        }
        if (input_manager.isKeyDown(input_manager.KEY_INDEX_E)) {
            var deltaTime = 0.01;
            var left_handed = false;
            main_camera.RollRight(deltaTime, left_handed);
        }
        main_camera.repositionCamera();
        main_camera.UpdateShaderValues();
        main_camera.WriteToUniform(gl, program, "active_camera");

        gl.uniform1f(location_color_r, 0.5 + 0.5 * Math.sin(2 * Math.PI * x));
        gl.uniform1i(location_width, main_camera.width);
        gl.uniform1i(location_height, main_camera.height);

        // Tell the shader to use texture unit 0 for u_texture
        gl.activeTexture(gl.TEXTURE0);                  // added this and following line to be extra sure which texture is being used...
        gl.bindTexture(gl.TEXTURE_3D, texture_float);
        gl.uniform1i(location_texture_float, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, texture_int);
        gl.uniform1i(location_texture_int, 1);

        program_shader_uniforms.updateUniforms();

        if (tick_counter == 10) {
            data_unit_lod_0.generateFromArrays(DATA_POINTS, DATA_SEGMENTS_FLOAT, DATA_SEGMENTS_INT, DATA_NODES_FLOAT, DATA_NODES_INT);
            texture_float_settings.width = data_unit_lod_0.texture_size_x;
            texture_float_settings.height = data_unit_lod_0.texture_size_y;
            texture_float_settings.depth = data_unit_lod_0.texture_size_float_z;
            console.log("texture_float_settings.width: " + texture_float_settings.width);
            console.log("texture_float_settings.height: " + texture_float_settings.height);
            console.log("texture_float_settings.depth: " + texture_float_settings.depth);
            //gl.bindTexture(gl.TEXTURE_3D, texture_float);
            updateDataTexture(gl, texture_float, data_unit_lod_0.arrayf, texture_float_settings);

            texture_int_settings.width = data_unit_lod_0.texture_size_x;
            texture_int_settings.height = data_unit_lod_0.texture_size_y;
            texture_int_settings.depth = data_unit_lod_0.texture_size_int_z;
            //gl.bindTexture(gl.TEXTURE_3D, texture_int);
            console.log("texture_int_settings.width: " + texture_int_settings.width);
            console.log("texture_int_settings.height: " + texture_int_settings.height);
            console.log("texture_int_settings.depth: " + texture_int_settings.depth);
            updateDataTexture(gl, texture_int, data_unit_lod_0.arrayi, texture_int_settings);

            program_shader_uniforms.setUniform("start_index_int_position_data", data_unit_lod_0.getIntStart("positions"));
            program_shader_uniforms.setUniform("start_index_int_line_segments", data_unit_lod_0.getIntStart("line_segments"));
            program_shader_uniforms.setUniform("start_index_int_tree_nodes", data_unit_lod_0.getIntStart("tree_nodes"));
            program_shader_uniforms.setUniform("start_index_int_dir_lights", data_unit_lod_0.getIntStart("dir_lights"));
            program_shader_uniforms.setUniform("start_index_float_position_data", data_unit_lod_0.getFloatStart("positions"));
            program_shader_uniforms.setUniform("start_index_float_line_segments", data_unit_lod_0.getFloatStart("line_segments"));
            program_shader_uniforms.setUniform("start_index_float_tree_nodes", data_unit_lod_0.getFloatStart("tree_nodes"));
            program_shader_uniforms.setUniform("start_index_float_dir_lights", data_unit_lod_0.getFloatStart("dir_lights"));
            program_shader_uniforms.updateUniforms();

            data_changed = true;
        }

        if (main_camera.changed || data_changed) {
            frame_counter++;
            main_camera.changed = false;
            data_changed = false;
            gl.drawArrays(gl.POINTS, 0, 1);
        }

        gl.finish();
        strong_tick_counter.innerHTML = tick_counter;
        strong_frame_counter.innerHTML = frame_counter;
        //shedule next call
        timer = setTimeout(on_update, 60);
    }

    function onStart_old() {

        window.removeEventListener(evt.type, onStart, false);
        addOnClickRequestData();

        /*
        $.getScript('data.js', function() {
          console.log('Script loaded.');
        });
        */

        console.log("DATA_POINTS.length " + DATA_POINTS.length);

        main_canvas = document.getElementById("main_canvas");

        main_camera = new Camera("main_camera");

        input_manager = new InputManager(main_canvas);
        input_manager.initialize();
        mouse_manager = new MouseManager(main_canvas, main_camera);
        mouse_manager.initialize();

        buildErrorDictionary();

        if (!(gl = getRenderingContext()))
            return;

        /*
        buffer_lights = gl.createBuffer();
        var boundLocation = 0;
        gl.bindBuffer(gl.UNIFORM_BUFFER, buffer_lights);
        gl.bufferData(gl.UNIFORM_BUFFER, this.data, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.UNIFORM_BUFFER, null);
        gl.bindBufferBase(gl.UNIFORM_BUFFER, boundLocation, buffer_lights);
        */


        main_camera.width = 800;
        main_camera.height = 600;
        //main_camera.q_x = glMatrix.vec3.fromValues(-0.00100059, 0.00183964, -1.96343e-05);
        //main_camera.q_y = glMatrix.vec3.fromValues(-0.00054224, -0.000316268, -0.00199958);
        //main_camera.p_1m = glMatrix.vec3.fromValues(-0.21045, -1.24361, 0.866632);
        //main_camera.position = glMatrix.vec3.fromValues(0.946889, 0.812677, 0.131267);
        //main_camera.forward = glMatrix.vec3.fromValues(-0.839515, -0.45342, 0.299373);
        //main_camera.up = glMatrix.vec3.fromValues(-0.258727, -0.150905, -0.954090);
        //main_camera.position = glMatrix.vec3.fromValues(0.41, 0.56, 0.001);
        main_camera.position = glMatrix.vec3.fromValues(0.5399, 0.7699, 0.001);
        main_camera.forward = glMatrix.vec3.fromValues(0.0, 1.0, 0.0);
        main_camera.up = glMatrix.vec3.fromValues(0.0, 0.0, 1.0);
        //main_camera.normal_left = glMatrix.vec3.fromValues(-1.54052, 0.497029, 0.339139);
        //main_camera.normal_right = glMatrix.vec3.fromValues(-0.423033, -1.55754, 0.361068);
        //main_camera.normal_top = glMatrix.vec3.fromValues(-0.464322, -0.228444, 2.25828);
        //main_camera.normal_bottom = glMatrix.vec3.fromValues(-1.49923, -0.832066, -1.55808);

        data_container_lod_0_positions = new DataContainer("positions", new PositionData());
        data_container_lod_0_line_segments = new DataContainer("line_segments", new LineSegment());
        data_container_lod_0_tree_nodes = new DataContainer("tree_nodes", new TreeNode());
        data_container_lod_0_dir_lights = new DataContainer("dir_lights", new DirLight());
        data_unit_lod_0 = new DataUnit("lod_0");
        data_unit_lod_0.registerDataCollection(data_container_lod_0_dir_lights);
        data_unit_lod_0.registerDataCollection(data_container_lod_0_positions);
        data_unit_lod_0.registerDataCollection(data_container_lod_0_line_segments);
        data_unit_lod_0.registerDataCollection(data_container_lod_0_tree_nodes);

        var p0 = new PositionData();
        p0.x = 0.25;
        p0.y = 0.25;
        p0.z = 0.25;
        var p1 = new PositionData();
        p1.x = 0.5;
        p1.y = 0.5;
        p1.z = 0.5;
        var p2 = new PositionData();
        p2.x = 0.25;
        p2.y = 0.75;
        p2.z = 0.75;
        data_container_lod_0_positions.data.push(p0)
        data_container_lod_0_positions.data.push(p1)
        data_container_lod_0_positions.data.push(p2)

        var l0 = new LineSegment();
        l0.indexA = 0;
        l0.indexB = 1;
        var l1 = new LineSegment();
        l1.indexA = 1;
        l1.indexB = 2;
        data_container_lod_0_line_segments.data.push(l0)
        data_container_lod_0_line_segments.data.push(l1)

        var n0 = new TreeNode();
        n0.hitLink = 1;
        n0.missLink = 0;
        n0.segmentIndex = -1;
        n0.type = 0;
        n0.min[0] = 0;
        n0.min[1] = 0;
        n0.min[2] = 0;
        n0.max[0] = 1;
        n0.max[1] = 1;
        n0.max[2] = 1;
        data_container_lod_0_tree_nodes.data.push(n0)
        var n1 = new TreeNode();
        n1.hitLink = 2;
        n1.missLink = 2;
        n1.segmentIndex = 0;
        n1.type = 1;
        n1.min[0] = 0.15;
        n1.min[1] = 0.15;
        n1.min[2] = 0.15;
        n1.max[0] = 0.6;
        n1.max[1] = 0.6;
        n1.max[2] = 0.6;
        data_container_lod_0_tree_nodes.data.push(n1)
        var n2 = new TreeNode();
        n2.hitLink = 0;
        n2.missLink = 0;
        n2.segmentIndex = 1;
        n2.type = 1;
        n2.min[0] = 0.15;
        n2.min[1] = 0.4;
        n2.min[2] = 0.4;
        n2.max[0] = 0.6;
        n2.max[1] = 0.85;
        n2.max[2] = 0.85;
        data_container_lod_0_tree_nodes.data.push(n2)


        var l0 = new DirLight();
        l0.ambient = glMatrix.vec4.fromValues(0.04, 0.04, 0.04, 0.0);
        l0.diffuse = glMatrix.vec4.fromValues(0.6, 0.6, 0.6, 0.0);
        l0.specular = glMatrix.vec4.fromValues(0.3, 0.3, 0.3, 0.0);
        l0.direction = glMatrix.vec4.fromValues(1.0, 1.0, 1.0, 0.0);
        data_container_lod_0_dir_lights.data.push(l0)
        var l1 = new DirLight();
        l1.ambient = glMatrix.vec4.fromValues(0.04, 0.04, 0.04, 0.0);
        l1.diffuse = glMatrix.vec4.fromValues(0.6, 0.6, 0.6, 0.0);
        l1.specular = glMatrix.vec4.fromValues(0.3, 0.3, 0.3, 0.0);
        l1.direction = glMatrix.vec4.fromValues(-1.0, 1.0, 1.0, 0.0);
        data_container_lod_0_dir_lights.data.push(l1)
        var l2 = new DirLight();
        l2.ambient = glMatrix.vec4.fromValues(0.04, 0.04, 0.04, 0.0);
        l2.diffuse = glMatrix.vec4.fromValues(0.6, 0.6, 0.6, 0.0);
        l2.specular = glMatrix.vec4.fromValues(0.3, 0.3, 0.3, 0.0);
        l2.direction = glMatrix.vec4.fromValues(0.0, -1.0, -1.0, 0.0);
        data_container_lod_0_dir_lights.data.push(l2)

        data_unit_lod_0.generateArrays();

        var tex = generateDataTextureFloat(gl);
        texture_float = tex.texture;
        texture_float_data = tex.texture_data;
        texture_float_settings = tex.texture_settings;

        tex = generateDataTextureInt(gl);
        texture_int = tex.texture;
        texture_int_data = tex.texture_data;
        texture_int_settings = tex.texture_settings;

        program = gl.createProgram();

        tick_counter = 0;
        frame_counter = 0;
        var strongs = document.querySelectorAll("strong");
        strong_tick_counter = strongs[0];
        strong_frame_counter = strongs[1];

        loadShaderProgram(gl, program, "#vertex-shader", "#fragment-shader");
        loadUniformLocations(program);


        initializeAttributes();

        gl.useProgram(program);
        //gl.uniform1f(location_color_r, 0);
        //gl.drawArrays(gl.POINTS, 0, 1);

        //cleanup();

        timer = setTimeout(on_update, 1);
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

    function testParameterExtractionFromURL() {
        console.log("testParameterExtractionFromURL");





        //MARKER url changes
        //window.location.href = window.location.pathname.substring( 0, window.location.pathname.lastIndexOf( '/' ) + 1 ) + 'myPage.xhtml?u=123';

    }

})();