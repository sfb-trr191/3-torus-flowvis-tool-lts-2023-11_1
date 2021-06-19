class InputFieldWrapper {

    constructor(input_parameter_wrapper, input_field_name, url_parameter_name) {
        this.input_field_name = input_field_name;
        this.input_field = document.getElementById(input_field_name);
        this.url_parameter_name = url_parameter_name;

        input_parameter_wrapper.dict_url_parameter_name_to_input_field[url_parameter_name] = this;
    }
}

class InputParameterWrapper {

    constructor(ui_seeds) {
        this.ui_seeds = ui_seeds;
        this.dict_url_parameter_name_to_input_field = {};
        new InputFieldWrapper(this, "input_field_equation_u", PARAM_input_field_equation_u);
        new InputFieldWrapper(this, "input_field_equation_v", PARAM_input_field_equation_v);
        new InputFieldWrapper(this, "input_field_equation_w", PARAM_input_field_equation_w);
        new InputFieldWrapper(this, "input_num_points_per_streamline", PARAM_input_num_points_per_streamline);
        new InputFieldWrapper(this, "input_step_size", PARAM_input_step_size);
        new InputFieldWrapper(this, "segment_duplicator_iterations", PARAM_segment_duplicator_iterations);
    }

    fromURL() {
        console.log("fromURL:", window.location.search);
        const urlParams = new URLSearchParams(window.location.search);
        for (var key in this.dict_url_parameter_name_to_input_field) {
            var input_field_wrapper = this.dict_url_parameter_name_to_input_field[key];
            const value = urlParams.get(input_field_wrapper.url_parameter_name);
            console.log("url_parameter_name:", input_field_wrapper.url_parameter_name, "value:", value);
            if (value === null)
                continue;
            input_field_wrapper.input_field.value = value;
        }
        const text = urlParams.get("text");
        document.getElementById("paragraph_text").innerHTML = text;


        const seeds = urlParams.get(PARAM_SEEDS);
        this.ui_seeds.fromString(seeds);
    }

    toQueryString() {
        console.log("toURL");
        var params = {};
        for (var key in this.dict_url_parameter_name_to_input_field) {
            var input_field_wrapper = this.dict_url_parameter_name_to_input_field[key];
            const value = input_field_wrapper.input_field.value;
            console.log("url_parameter_name:", input_field_wrapper.url_parameter_name, "value:", value);
            if (value === null)
                continue;
            params[input_field_wrapper.url_parameter_name] = value;
        }
        params[PARAM_SEEDS] = this.ui_seeds.toString();
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