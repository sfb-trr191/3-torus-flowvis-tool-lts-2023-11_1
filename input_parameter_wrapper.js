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

    addToDicts(){
        console.log("add InputWrapper: ", this.input_element_name, this.url_parameter_name)
        var exists = this.url_parameter_name in this.input_parameter_wrapper.dict_url_parameter_name_to_input_wrapper
        if(exists){
            var wrapper = this.input_parameter_wrapper.dict_url_parameter_name_to_input_wrapper[this.url_parameter_name]
            throw new Error("Error while trying to add '"+this.input_element_name+"' with url_parameter_name '"
            +this.url_parameter_name+"'. The url_parameter_name "
            +"already exists for wrapper: '"+wrapper.input_element_name+"'");
        }
        var exists = this.input_element_name in this.input_parameter_wrapper.dict_input_element_name_to_input_wrapper
        if(exists){
            var wrapper = this.input_parameter_wrapper.dict_input_element_name_to_input_wrapper[this.input_element_name]
            throw new Error("Error while trying to add '"+this.input_element_name+"' with url_parameter_name '"
            +this.url_parameter_name+"'. The input_element_name "
            +"already exists with url_parameter_name: '"+wrapper.url_parameter_name+"'");
        }
        this.input_parameter_wrapper.dict_url_parameter_name_to_input_wrapper[this.url_parameter_name] = this;
        this.input_parameter_wrapper.dict_input_element_name_to_input_wrapper[this.input_element_name] = this;
    }
}

class InputParameterWrapper {

    constructor(ui_seeds, main_camera, side_camera, tab_manager) {
        this.ui_seeds = ui_seeds;
        this.main_camera = main_camera;
        this.side_camera = side_camera;
        this.tab_manager = tab_manager;
        this.dict_url_parameter_name_to_input_wrapper = {};
        this.dict_input_element_name_to_input_wrapper = {};
        
        this.css_loaded = "index.css";
        //data - equations
        new InputWrapper(this, "input_field_equation_u", PARAM_input_field_equation_u);
        new InputWrapper(this, "input_field_equation_v", PARAM_input_field_equation_v);
        new InputWrapper(this, "input_field_equation_w", PARAM_input_field_equation_w);
        //data - parameters        
        new InputWrapper(this, "select_data_paramaters_mode", PARAM_select_data_paramaters_mode);
        new InputWrapper(this, "input_num_points_per_streamline", PARAM_input_num_points_per_streamline);
        new InputWrapper(this, "input_step_size", PARAM_input_step_size);
        new InputWrapper(this, "segment_duplicator_iterations", PARAM_segment_duplicator_iterations);
        new InputWrapper(this, "select_streamline_calculation_method", PARAM_STREAMLINE_CALCULATION_METHOD);
        new InputWrapper(this, "input_thumbnail", PARAM_THUMBNAIL);
        new InputWrapper(this, "input_thumbnail_directory", PARAM_EXPORT_THUMBNAIL_DIRECTORY);
        new InputWrapper(this, "input_thumbnail_name", PARAM_EXPORT_THUMBNAIL_NAME);
        new InputWrapper(this, "select_tab", PARAM_TAB_MAIN);
        new InputWrapper(this, "select_side_mode", PARAM_SIDE_MODE);
        new InputWrapper(this, "select_projection_index", PARAM_PROJECTION_INDEX);

        
    }

    fromURL() {
        console.log("fromURL:", window.location.search);
        const urlParams = new URLSearchParams(window.location.search);
        for (var key in this.dict_url_parameter_name_to_input_wrapper) {
            var input_wrapper = this.dict_url_parameter_name_to_input_wrapper[key];
            const value = urlParams.get(input_wrapper.url_parameter_name);
            console.log("url_parameter_name:", input_wrapper.url_parameter_name, "value:", value);
            if (value === null)
                continue;
            input_wrapper.input_field.value = value;
        }
        const text = urlParams.get("text");
        document.getElementById("paragraph_text").innerHTML = text;

        const seeds = urlParams.get(PARAM_SEEDS);
        this.ui_seeds.fromString(seeds);

        const camera = urlParams.get(PARAM_CAMERA);
        this.main_camera.fromString(camera);

        const side_camera = urlParams.get(PARAM_SIDE_CAMERA);
        this.side_camera.fromString(side_camera);

        const style = urlParams.get(PARAM_STYLE);
        console.log("STYLE:", style)

        const thumbnail_url = urlParams.get(PARAM_THUMBNAIL);
        console.log("thumbnail_url:", thumbnail_url)
        var invalid_thumbnail = thumbnail_url === null || thumbnail_url === "";
        if (!invalid_thumbnail)
            document.getElementById("image_thumbnail").src = thumbnail_url;

        switch (style) {
            case STYLE_DEFAULT:
                setCSS("index.css");
                this.css_loaded = "index.css";
                break;
            case STYLE_EMBEDDED:
                setCSS("embedded_thumbnail.css");
                this.css_loaded = "embedded.css";
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

    toQueryString() {
        console.log("toURL");
        var params = {};
        for (var key in this.dict_url_parameter_name_to_input_wrapper) {
            var input_wrapper = this.dict_url_parameter_name_to_input_wrapper[key];
            console.log("key:", key);
            const value = input_wrapper.input_element.value;
            console.log("url_parameter_name:", input_wrapper.url_parameter_name, "value:", value);
            if (value === null)
                continue;
            params[input_wrapper.url_parameter_name] = value;
        }
        params[PARAM_SEEDS] = this.ui_seeds.toString();
        params[PARAM_CAMERA] = this.main_camera.toString();
        params[PARAM_SIDE_CAMERA] = this.side_camera.toString();
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
        return query_string;
    }
}

module.exports = InputParameterWrapper;