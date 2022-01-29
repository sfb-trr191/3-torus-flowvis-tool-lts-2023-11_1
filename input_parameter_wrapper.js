const module_utility = require("./utility");
const setCSS = module_utility.setCSS;

class InputWrapper {

    constructor(input_parameter_wrapper, input_element_name, url_parameter_name) {
        this.input_parameter_wrapper = input_parameter_wrapper;
        this.input_element_name = input_element_name;
        this.input_element = document.getElementById(input_element_name);
        this.url_parameter_name = url_parameter_name;

        this.addToDicts();
    }

    addToDicts() {
        console.log("add InputWrapper: ", this.input_element_name, this.url_parameter_name)
        var exists = this.url_parameter_name in this.input_parameter_wrapper.dict_url_parameter_name_to_input_wrapper
        if (exists) {
            var wrapper = this.input_parameter_wrapper.dict_url_parameter_name_to_input_wrapper[this.url_parameter_name]
            throw new Error("Error while trying to add '" + this.input_element_name + "' with url_parameter_name '"
                + this.url_parameter_name + "'. The url_parameter_name "
                + "already exists for wrapper: '" + wrapper.input_element_name + "'");
        }
        var exists = this.input_element_name in this.input_parameter_wrapper.dict_input_element_name_to_input_wrapper
        if (exists) {
            var wrapper = this.input_parameter_wrapper.dict_input_element_name_to_input_wrapper[this.input_element_name]
            throw new Error("Error while trying to add '" + this.input_element_name + "' with url_parameter_name '"
                + this.url_parameter_name + "'. The input_element_name "
                + "already exists with url_parameter_name: '" + wrapper.url_parameter_name + "'");
        }
        this.input_parameter_wrapper.dict_url_parameter_name_to_input_wrapper[this.url_parameter_name] = this;
        this.input_parameter_wrapper.dict_input_element_name_to_input_wrapper[this.input_element_name] = this;
    }

    /**
     * 
     * @param {*} value the value to be set. In the case of type "checkbox" use 1 or 0 instead of true and false
     */
    setValue(value) {
        console.log("set value of '", this.input_element_name, "' to '", value, "'")
        var node_name = this.input_element.nodeName
        switch (node_name) {
            case "INPUT":
                var type = this.input_element.type
                switch (type) {
                    case "text":
                        this.input_element.value = value
                        break;
                    case "checkbox":
                        this.input_element.checked = (value == 1)
                        break;
                    default:
                        throw new Error("unknown type: " + type)
                }
            case "SELECT":
                this.input_element.value = value
                break;
            default:
                throw new Error("unknown node_name: " + node_name)
        }
    }

    getValue() {
        console.log("get value of '", this.input_element_name, "'")
        var node_name = this.input_element.nodeName
        switch (node_name) {
            case "INPUT":
                var type = this.input_element.type
                switch (type) {
                    case "text":
                        return this.input_element.value;
                    case "checkbox":
                        return this.input_element.checked ? 1 : 0;
                    default:
                        throw new Error("unknown type: " + type)
                }
            case "SELECT":
                return this.input_element.value;
            default:
                throw new Error("unknown node_name: " + node_name)
        }
    }
}

class InputParameterWrapper {

    constructor(ui_seeds, main_camera, side_camera, transfer_function_manager, tab_manager, state_manager) {
        this.ui_seeds = ui_seeds;
        this.main_camera = main_camera;
        this.side_camera = side_camera;
        this.transfer_function_manager = transfer_function_manager;
        this.tab_manager = tab_manager;
        this.state_manager = state_manager;
        this.dict_url_parameter_name_to_input_wrapper = {};
        this.dict_input_element_name_to_input_wrapper = {};

        this.css_loaded = "index.css";

        //top right select
        new InputWrapper(this, "select_side_mode", PARAM_SIDE_MODE);
        new InputWrapper(this, "select_projection_index", PARAM_PROJECTION_INDEX);
        new InputWrapper(this, "select_slice_axes_order", "sao");
        new InputWrapper(this, "select_side_canvas_streamline_method", "sml");
        new InputWrapper(this, "select_side_canvas_streamline_method_projection", "smpl");
        //data
        //data - general
        new InputWrapper(this, "select_space", "space");
        //data - equations
        new InputWrapper(this, "input_field_equation_u", PARAM_input_field_equation_u);
        new InputWrapper(this, "input_field_equation_v", PARAM_input_field_equation_v);
        new InputWrapper(this, "input_field_equation_w", PARAM_input_field_equation_w);
        new InputWrapper(this, "input_field_equation_a", "a");
        new InputWrapper(this, "input_field_equation_b", "b");
        //data - parameters        
        new InputWrapper(this, "select_data_paramaters_mode", PARAM_select_data_paramaters_mode);
        new InputWrapper(this, "select_streamline_calculation_method", PARAM_STREAMLINE_CALCULATION_METHOD);
        new InputWrapper(this, "select_streamline_calculation_direction", "scd");        
        new InputWrapper(this, "input_num_points_per_streamline", PARAM_input_num_points_per_streamline);
        new InputWrapper(this, "input_step_size", PARAM_input_step_size);
        new InputWrapper(this, "segment_duplicator_iterations", PARAM_segment_duplicator_iterations);

        new InputWrapper(this, "input_tube_radius_fundamental", "tr");
        new InputWrapper(this, "input_max_radius_factor_highlight", "mrfh");
        //FTLE data
        //FTLE data - slice
        //TODO SLICE INDEX
        new InputWrapper(this, "checkbox_animate_slice_index", "asi");
        new InputWrapper(this, "checkbox_ftle_slice_interpolate", "fsi");
        new InputWrapper(this, "select_slice_mode", "slm");
        //FTLE data - resolution
        new InputWrapper(this, "input_ftle_dim_x", "srx");
        new InputWrapper(this, "input_ftle_dim_y", "sry");
        new InputWrapper(this, "input_ftle_dim_z", "srz");
        //FTLE data - parameters
        new InputWrapper(this, "input_ftle_advection_time", "fat");
        new InputWrapper(this, "input_ftle_step_size", "fss");        
        //settings
        //settings - general
        new InputWrapper(this, "select_settings_mode", "ssm");
        new InputWrapper(this, "input_max_ray_distance", "mrd");
        new InputWrapper(this, "input_tube_radius_factor", "trf");
        //settings - projection
        new InputWrapper(this, "input_tube_radius_factor_projection", "trfp");     
        new InputWrapper(this, "input_tube_radius_factor_projection_highlight", "trfph");   
        //settings - streamline shading
        new InputWrapper(this, "checkbox_show_streamlines_main", "ssl");
        new InputWrapper(this, "select_shading_mode_streamlines", "sms");
        new InputWrapper(this, "input_formula_scalar", "fs");
        new InputWrapper(this, "input_min_scalar", "smin");
        new InputWrapper(this, "input_max_scalar", "smax");        
        //settings - fog
        new InputWrapper(this, "select_fog_type", "sft");      
        new InputWrapper(this, "input_fog_density", "fd");          
        //settings - axes   
        new InputWrapper(this, "checkbox_show_movable_axes_main", "mal");    
        new InputWrapper(this, "checkbox_show_movable_axes_side", "mar");  
        new InputWrapper(this, "checkbox_show_bounding_axes_main", "bal");  
        new InputWrapper(this, "checkbox_show_bounding_axes_side", "bar");  
        new InputWrapper(this, "checkbox_show_bounding_axes_projection_side", "barp");          
        new InputWrapper(this, "input_cube_axes_length_main", "all"); 
        new InputWrapper(this, "input_cube_axes_length_side", "alr"); 
        new InputWrapper(this, "input_cube_axes_radius_main", "arl"); 
        new InputWrapper(this, "input_cube_axes_radius_side", "arr"); 
        new InputWrapper(this, "checkbox_show_origin_axes_side", "oas"); 
        new InputWrapper(this, "input_cube_axes_origin_length_side", "oll"); 
        new InputWrapper(this, "input_cube_axes_origin_radius_side", "olr"); 
        //settings - volume rendering
        new InputWrapper(this, "select_show_volume_main", "vl"); 
        new InputWrapper(this, "select_show_volume_side", "vr"); 
        new InputWrapper(this, "input_volume_rendering_max_distance", "vmd"); 
        new InputWrapper(this, "input_volume_rendering_distance_between_points", "vpd"); 
        new InputWrapper(this, "input_volume_rendering_termination_opacity", "vto");         
        //settings - quality        
        new InputWrapper(this, "input_still_resolution_factor", "rfs");   
        new InputWrapper(this, "input_panning_resolution_factor", "rfp");   
        new InputWrapper(this, "select_lod_still", "lods");   
        new InputWrapper(this, "select_lod_panning", "lodp");   
        //settings - cameras
        new InputWrapper(this, "select_camera_control_3d_left", "cc3l");   
        new InputWrapper(this, "select_camera_control_3d_right", "cc3r");  
        //settings - trackball
        new InputWrapper(this, "input_trackball_rotation_sensitivity", "trs");  
        new InputWrapper(this, "input_trackball_translation_sensitivity", "tts");  
        new InputWrapper(this, "input_trackball_wheel_sensitivity", "tws");  
        new InputWrapper(this, "input_trackball_focus_distance_left", "tfdl");  
        new InputWrapper(this, "input_trackball_focus_distance_right", "tfdr");    
        //transfer function
        new InputWrapper(this, "select_transfer_function_id", "tfid");           
        new InputWrapper(this, "select_transfer_function_index_scalar", "tfis");     
        new InputWrapper(this, "select_transfer_function_index_ftle_forward", "tfif");   
        new InputWrapper(this, "select_transfer_function_index_ftle_backward", "tfib");   
        //export
        new InputWrapper(this, "input_thumbnail", PARAM_THUMBNAIL);
        new InputWrapper(this, "input_thumbnail_right", PARAM_THUMBNAIL_RIGHT);
        new InputWrapper(this, "input_thumbnail_directory", PARAM_EXPORT_THUMBNAIL_DIRECTORY);
        new InputWrapper(this, "input_thumbnail_name", PARAM_EXPORT_THUMBNAIL_NAME);
        new InputWrapper(this, "input_thumbnail_name_right", PARAM_EXPORT_THUMBNAIL_NAME_RIGHT);
        new InputWrapper(this, "select_tab", PARAM_TAB_MAIN);
        //this.dict_url_parameter_name_to_input_wrapper["test"].setValue(1)

    }

    fromURL() {
        console.log("fromURL:", window.location.search);
        const urlParams = new URLSearchParams(window.location.search);

        const no_search = window.location.search.length < 1;
        const complete = urlParams.has("c") || no_search;
        if(!complete){
            window.alert("Error: Incomplete URL.\nIf you clicked on a link in a PDF, try using a different PDF viewer.");
        }

        const upgrade = urlParams.has("upgrade");        
        window["global_is_upgrade"] = upgrade;

        var use_data_array = urlParams.has("data");
        //document.getElementById("checkbox_url_data_array").checked = use_data_array;
        if(use_data_array){
            const data = urlParams.get("data");
            this.state_manager.base64_url = data;
            this.state_manager.executeStateBase64Url();

            this.ui_seeds.fromSpecialData();
            this.main_camera.fromSpecialData();
            this.side_camera.fromSpecialData();
            this.transfer_function_manager.fromSpecialData();
        }
        else if(no_search){
            //do nothing
        }
        else{
            for (var key in this.dict_url_parameter_name_to_input_wrapper) {
                var input_wrapper = this.dict_url_parameter_name_to_input_wrapper[key];
                const value = urlParams.get(input_wrapper.url_parameter_name);
                console.log("url_parameter_name:", input_wrapper.url_parameter_name, "value:", value);
                if (value === null)
                    continue;
                input_wrapper.setValue(value);
            }

            const seeds = urlParams.get(PARAM_SEEDS);
            this.ui_seeds.fromString(seeds);

            const camera = urlParams.get(PARAM_CAMERA);
            this.main_camera.fromString(camera);
    
            const side_camera = urlParams.get(PARAM_SIDE_CAMERA);
            this.side_camera.fromString(side_camera);

            const transfer_function_manager = urlParams.get(PARAM_TRANSFER_FUNCTION_MANAGER);
            this.transfer_function_manager.fromString(transfer_function_manager);  

            var f1 = urlParams.has("v_y");
            var f2 = urlParams.has("v_m");
            var f3 = urlParams.has("v_n");
            var f4 = urlParams.has("v_s");
            if(f1 && f2 && f3 && f4){
                window["URL_VERSION_YEAR"] = parseInt(urlParams.get("v_y"));
                window["URL_VERSION_MONTH"] = parseInt(urlParams.get("v_m"));
                window["URL_VERSION_NUMBER"] = parseInt(urlParams.get("v_n"));
                window["URL_STATE_VERSION"] = parseInt(urlParams.get("v_s"));
            }
            else{
                console.error("missing version");
                stop_script;
            }
        }

        const text = urlParams.get("text");
        document.getElementById("paragraph_text").innerHTML = text;

        const style = urlParams.get(PARAM_STYLE);
        console.log("STYLE:", style)

        const thumbnail_url = window["input_thumbnail"].value;
        const thumbnail_url_right = window["input_thumbnail_right"].value;

        var url = thumbnail_url;
        if(style == STYLE_EMBEDDED_RIGHT){
            var url = thumbnail_url_right;
        }
        console.log("used thumbnail url:", url)


        var invalid_thumbnail = url === null || url === "";
        if (!invalid_thumbnail)
            document.getElementById("image_thumbnail").src = url;

        var url = thumbnail_url_right;
        var invalid_thumbnail = url === null || url === "";
        if (!invalid_thumbnail)
            document.getElementById("image_thumbnail_right").src = url;  

        switch (style) {
            case STYLE_DEFAULT:
                setCSS("embedded_thumbnail_default.css");
                this.css_loaded = "index.css";
                break;
            case STYLE_EMBEDDED:
                setCSS("embedded_thumbnail.css");
                this.css_loaded = "embedded.css";
                break;
            case STYLE_EMBEDDED_RIGHT:
                setCSS("embedded_thumbnail.css");
                this.css_loaded = "embedded_right.css";
                break;
            default:
                setCSS("index.css");
                this.css_loaded = "index.css";
                break;
        }

        var tab = urlParams.get(PARAM_TAB_MAIN);
        var invalid_tab = tab === null || tab === "";
        if (invalid_tab)
            tab = "tab_data";
        this.tab_manager.selectTab("tab_group_main", tab);
    }

    toQueryString(use_data_array) {
        console.log("toURL");
        var params = {};
        if(use_data_array){            
            this.ui_seeds.toSpecialData();
            this.main_camera.toSpecialData();
            this.side_camera.toSpecialData();
            this.transfer_function_manager.toSpecialData();

            this.state_manager.generateStateBase64(STATE_VERSION);
            params["data"] = this.state_manager.base64_url;
        }
        else{
            for (var key in this.dict_url_parameter_name_to_input_wrapper) {
                var input_wrapper = this.dict_url_parameter_name_to_input_wrapper[key];
                console.log("key:", key);
                const value = input_wrapper.getValue();
                console.log("url_parameter_name:", input_wrapper.url_parameter_name, "value:", value);
                if (value === null)
                    continue;
                params[input_wrapper.url_parameter_name] = value;
            }
            params[PARAM_SEEDS] = this.ui_seeds.toString();
            params[PARAM_CAMERA] = this.main_camera.toString();
            params[PARAM_SIDE_CAMERA] = this.side_camera.toString();
            params[PARAM_TRANSFER_FUNCTION_MANAGER] = this.transfer_function_manager.toString();

            params["v_y"] = window["VERSION_YEAR"];
            params["v_m"] = window["VERSION_MONTH"];
            params["v_n"] = window["VERSION_NUMBER"];
            params["v_s"] = window["STATE_VERSION"];
        }
        /*
        params["text"] = `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eu neque efficitur augue malesuada tristique. Mauris aliquam bibendum risus quis vestibulum. Sed dictum dignissim libero, commodo faucibus ex. Aenean lobortis in justo eget rutrum. Suspendisse maximus felis massa, non ornare risus rhoncus non. Quisque congue ex nulla, mollis tincidunt arcu auctor vitae. Mauris orci diam, suscipit sed commodo ac, eleifend et urna. Nullam dapibus urna eros, in euismod nibh iaculis accumsan. Proin ut ipsum at dolor tempus maximus a non diam. Vivamus leo nisi, rhoncus vitae dignissim a, scelerisque at ex. Quisque ipsum nulla, posuere at tempor quis, molestie vitae risus. Morbi ut metus non ex malesuada porta. Donec varius eros purus. Aliquam vehicula libero ac arcu venenatis vestibulum. Integer justo arcu, imperdiet id turpis ut, tincidunt ultrices mi.
        
        Suspendisse euismod ornare risus, id porta risus vulputate ut. In aliquam urna non placerat tincidunt. Donec laoreet est vel lacinia consequat. Aliquam quam lacus, porttitor in condimentum nec, porta sed neque. Donec vitae nisi nec enim placerat auctor nec in nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tempor metus arcu, eu consectetur magna malesuada ut. Nullam sapien diam, viverra rutrum nibh eget, scelerisque imperdiet nisl. Morbi nec tincidunt enim. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tincidunt eu turpis viverra rhoncus. Nam consectetur sem dolor, id consequat velit rhoncus et. Nam in tortor eleifend, bibendum sem ac, tempor leo. Donec sit amet magna nec justo viverra posuere.
        
        Nam iaculis, felis ut sagittis congue, nibh turpis imperdiet urna, nec vehicula lacus arcu nec erat. Nullam nec odio tempus, iaculis arcu euismod, egestas velit. Ut aliquet id leo sed pharetra. Integer consequat felis tempor sollicitudin dictum. Maecenas euismod enim id semper gravida. Nunc aliquet laoreet sollicitudin. Pellentesque commodo facilisis nisl. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam facilisis, est sed egestas auctor, mi justo iaculis dolor, in dignissim nibh neque vitae dui. Vivamus non magna eget diam cursus elementum vel vitae ex. Sed eu vulputate urna. Cras fringilla sem sem, non dignissim tortor fermentum consequat. Mauris at mi faucibus, ultrices urna consequat, commodo nunc. Fusce at gravida dui. Nulla ac ipsum in quam dapibus dapibus. Proin vel neque tincidunt, malesuada odio accumsan, mattis lectus.
        
        Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed sit amet dignissim dolor. Pellentesque eu feugiat est, in rhoncus augue. Fusce vulputate consequat mauris, sed finibus massa vulputate et. Donec quis interdum dolor, sit amet dignissim libero. Donec in odio a ipsum rutrum fermentum. Fusce finibus ligula eleifend nunc interdum tempor. Sed gravida euismod luctus. Maecenas eget nisi congue, ultrices arcu quis, fringilla justo. Duis consectetur sem est, quis tincidunt dolor maximus et. Pellentesque nec venenatis dolor, nec vulputate magna. Mauris et ante ut sapien ullamcorper lobortis.
        
        Integer nisi eros, viverra at odio eu, laoreet gravida neque. Proin odio nisl, tincidunt sit amet congue et, ullamcorper a nibh. Mauris sagittis scelerisque ante et gravida. Vestibulum cursus sagittis turpis, et posuere nibh. Sed interdum congue condimentum. Vestibulum scelerisque dolor justo, non mollis orci facilisis faucibus. Ut vitae magna ex. Sed iaculis nunc non risus eleifend lobortis. Ut non consectetur arcu. "
        `
        */
        var query_string = "?" + Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')

        console.log("query_string:", query_string);
        return {
            "default" : query_string + "&style=" + STYLE_DEFAULT + "&c=1",
            "embedded_main" : query_string + "&style=" + STYLE_EMBEDDED + "&c=1",
            "embedded_aux" : query_string + "&style=" + STYLE_EMBEDDED_RIGHT + "&c=1",
        };
    }
}

module.exports = InputParameterWrapper;