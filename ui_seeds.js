const glMatrix = require("gl-matrix");
const seedrandom = require("seedrandom");
const module_utility = require("./utility");
const rgbToHex = module_utility.rgbToHex;
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");
const BinaryArray = require("./binary_array");
const { floor } = require("mathjs");
const getStateDescription = require("./version").getStateDescription;

class UISeed {
    constructor(ui_seeds, index, is_phantom) {
        this.ui_seeds = ui_seeds;
        this.index = index;
        this.is_phantom = is_phantom;
        this.node = document.createElement("div");
        //this.node.className = "horizontal_div_seed";
        this.node.className = "seed_grid_3";

        this.node_label = document.createElement("label");
        this.node_label.className = "seed_label";
        this.node_label.innerHTML = index;
        this.node.appendChild(this.node_label);

        this.node_input_x = document.createElement("input");
        this.node_input_x.className = "seed_x";
        this.node_input_x.type = "text";
        this.node_input_x.value = "0.5";
        this.node_input_x.title = "x component of the seed position. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_x);

        this.node_input_y = document.createElement("input");
        this.node_input_y.className = "seed_y";
        this.node_input_y.type = "text";
        this.node_input_y.value = "0.5";
        this.node_input_y.title = "y component of the seed position. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_y);

        this.node_input_z = document.createElement("input");
        this.node_input_z.className = "seed_z";
        this.node_input_z.type = "text";
        this.node_input_z.value = "0.5";
        this.node_input_z.title = "z component of the seed position. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_z);

        this.node_input_w = document.createElement("input");
        this.node_input_w.className = "seed_w";
        this.node_input_w.type = "text";
        this.node_input_w.value = "0.5";
        this.node_input_w.title = "w component of the seed position. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_w);



        this.node_input_v_x = document.createElement("input");
        this.node_input_v_x.className = "seed_v_x";
        this.node_input_v_x.type = "text";
        this.node_input_v_x.value = "0.5";
        this.node_input_v_x.title = "x component of the seed direction. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_v_x);

        this.node_input_v_y = document.createElement("input");
        this.node_input_v_y.className = "seed_v_y";
        this.node_input_v_y.type = "text";
        this.node_input_v_y.value = "0.5";
        this.node_input_v_y.title = "y component of the seed direction. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_v_y);

        this.node_input_v_z = document.createElement("input");
        this.node_input_v_z.className = "seed_v_z";
        this.node_input_v_z.type = "text";
        this.node_input_v_z.value = "0.5";
        this.node_input_v_z.title = "z component of the seed direction. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_v_z);

        this.node_input_v_w = document.createElement("input");
        this.node_input_v_w.className = "seed_v_w";
        this.node_input_v_w.type = "text";
        this.node_input_v_w.value = "0.5";
        this.node_input_v_w.title = "w component of the seed direction. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_v_w);



        this.node_input_c = document.createElement("input");
        this.node_input_c.className = "seed_c";
        this.node_input_c.type = "color";
        this.node_input_c.value = "#00FF00";
        this.node_input_c.title = "Color of the streamline started at this seed.";
        this.node.appendChild(this.node_input_c);

        if(!is_phantom){
            this.node_random = document.createElement("button");
            this.node_random.className = "seed_button_random_position";
            this.node_random.innerHTML = "";
            this.node_random.type = "button";
            this.node_random.id = "button_randomize_this_seed_position";
            this.node_random.title = "Randomize position of this seed.";
            this.node_random.addEventListener("click", (event) => {
                console.log("this.index: ", event.target.id, this.index);
                this.randomizePosition();
            });
            this.node.appendChild(this.node_random);
    
            this.node_random_col = document.createElement("button");
            this.node_random_col.className = "seed_button_random_color";
            this.node_random_col.innerHTML = "";
            this.node_random_col.type = "button";
            this.node_random_col.id = "button_randomize_this_seed_color";
            this.node_random_col.title = "Randomize color of this seed.";
            this.node_random_col.addEventListener("click", (event) => {
                console.log("this.index: ", event.target.id, this.index);
                this.randomizeColor();
            });
            this.node.appendChild(this.node_random_col);

            this.node_button = document.createElement("button");
            this.node_button.className = "seed_button_remove";
            this.node_button.innerHTML = "x";
            this.node_button.type = "button";
            this.node_button.id = "button_delete_this_seed";
            this.node_button.title = "Remove this seed.";
            this.node_button.addEventListener("click", (event) => {
                console.log("this.index: ", event.target.id, this.index);
                this.ui_seeds.removeSeed(this.index);
            });
            this.node.appendChild(this.node_button);
        }
        else{
            this.node_space_1 = document.createElement("label");
            this.node_space_1.innerHTML = "";
            this.node.appendChild(this.node_space_1);

            this.node_space_2 = document.createElement("label");
            this.node_space_2.innerHTML = "";
            this.node.appendChild(this.node_space_2);

            this.node_space_3 = document.createElement("label");
            this.node_space_3.innerHTML = "";
            this.node.appendChild(this.node_space_3);
        }

        this.randomizePosition();
        this.randomizeColor();
    }

    updateIndex(new_index) {
        this.index = new_index;
        this.node_label.innerHTML = new_index;
    }

    randomizePosition() {
        this.node_input_x.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_y.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_z.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
    }

    randomizeColor() {
        var r = Math.round(this.ui_seeds.rng_autoseed() * 255);
        var g = Math.round(this.ui_seeds.rng_autoseed() * 255);
        var b = Math.round(this.ui_seeds.rng_autoseed() * 255);
        this.node_input_c.value = rgbToHex(r, g, b);
    }

    fromString(s) {
        var split = s.split("~");
        this.node_input_x.value = split[0];
        this.node_input_y.value = split[1];
        this.node_input_z.value = split[2];
        this.node_input_w.value = split[3];
        this.node_input_v_x.value = split[4];
        this.node_input_v_y.value = split[5];
        this.node_input_v_z.value = split[6];
        this.node_input_v_w.value = split[7];
        this.node_input_c.value = split[8];
    }

    toString() {
        var s = this.node_input_x.value + "~"
            + this.node_input_y.value + "~"
            + this.node_input_z.value + "~"
            + this.node_input_w.value + "~"
            + this.node_input_v_x.value + "~"
            + this.node_input_v_y.value + "~"
            + this.node_input_v_z.value + "~"
            + this.node_input_v_w.value + "~"
            + this.node_input_c.value;
        return s;
    }

    writeToBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "seed");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = this.getValueByName(list[i].name);
            var value_conversion = null;
            binary_array.writeValue(value, list[i].data_type, value_conversion);            
        }
    }

    readFromBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "seed");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = binary_array.readValue(list[i].data_type);
            this.setValueByName(list[i].name, value);
        }
    }

    getColorVector() {
        var hex = this.node_input_c.value;
        console.log("hex: ", hex);
        const r = parseInt(hex.substr(1, 2), 16) / 255
        const g = parseInt(hex.substr(3, 2), 16) / 255
        const b = parseInt(hex.substr(5, 2), 16) / 255
        console.log(`red: ${r}, green: ${g}, blue: ${b}`)
        return glMatrix.vec3.fromValues(r, g, b);
    }

    UpdateDefaultValues(name) {
        if (name == GROUP_NAME_CALCULATE) {
            this.node_input_x.defaultValue = this.node_input_x.value;
            this.node_input_y.defaultValue = this.node_input_y.value;
            this.node_input_z.defaultValue = this.node_input_z.value;
        }
        else if (name == GROUP_NAME_RENDER_SETTINGS) {
            this.node_input_c.defaultValue = this.node_input_c.value;
        }
    }

    HasValueChanged(name) {
        if (name == GROUP_NAME_CALCULATE) {
            if (this.node_input_x.defaultValue != this.node_input_x.value)
                return true;
            if (this.node_input_y.defaultValue != this.node_input_y.value)
                return true;
            if (this.node_input_z.defaultValue != this.node_input_z.value)
                return true;
        }
        else if (name == GROUP_NAME_RENDER_SETTINGS) {
            if (this.node_input_c.defaultValue != this.node_input_c.value)
                return true;
        }
        return false;
    }

    getValueByName(name){
        switch (name) {
            case "position_x":
                return this.node_input_x.value;
            case "position_y":
                return this.node_input_y.value;
            case "position_z":
                return this.node_input_z.value;
            case "color":
                return this.node_input_c.value;
            case "color_byte_r":        
                var hex = this.node_input_c.value;
                return parseInt(hex.substr(1, 2), 16);
            case "color_byte_g":        
                var hex = this.node_input_c.value;
                return parseInt(hex.substr(3, 2), 16);
            case "color_byte_b":        
                var hex = this.node_input_c.value;
                return parseInt(hex.substr(5, 2), 16);
            default:
                console.error("ui_seeds: getValueByName: Unknown name");
                return null;
        }
    }

    setValueByName(name, value){
        switch (name) {
            case "position_x":
                this.node_input_x.value = value;
                break;
            case "position_y":
                this.node_input_y.value = value;
                break;
            case "position_z":
                this.node_input_z.value = value;
                break;
            case "color":
                this.node_input_c.value = value;
                break;
            case "color_byte_r":        
                var hex = this.node_input_c.value;
                var r = value;
                var g = parseInt(hex.substr(3, 2), 16);
                var b = parseInt(hex.substr(5, 2), 16);
                this.node_input_c.value = rgbToHex(r, g, b);
                break;
            case "color_byte_g":        
                var hex = this.node_input_c.value;
                var r = parseInt(hex.substr(1, 2), 16);
                var g = value;
                var b = parseInt(hex.substr(5, 2), 16);
                this.node_input_c.value = rgbToHex(r, g, b);
                break;
            case "color_byte_b":        
                var hex = this.node_input_c.value;
                var r = parseInt(hex.substr(1, 2), 16);
                var g = parseInt(hex.substr(3, 2), 16);
                var b = value;
                this.node_input_c.value = rgbToHex(r, g, b);
                break;
            default:
                console.error("ui_seeds: setValueByName: Unknown name");
                break;
        }
    }
}

class UIMultiSeed {
    constructor(ui_seeds, index) {
        this.ui_seeds = ui_seeds;
        this.index = index;

        this.node = document.createElement("fieldset");
        this.node.className = "fieldset_camera";

        this.node_vertical = document.createElement("div");
        this.node_vertical.className = "vertical_container_test";     
        this.node.appendChild(this.node_vertical);  

        this.node_header = document.createElement("div");
        this.node_header.className = "horizontal_div_multi_seed_header";        
        this.node_vertical.appendChild(this.node_header);

        this.className_node_row_count = "horizontal_div_multi_seed_vec3";    
        this.node_row_count = document.createElement("div");
        this.node_row_count.className = this.className_node_row_count;        
        this.node_vertical.appendChild(this.node_row_count);

        this.className_node_row_axis = "horizontal_div_multi_seed_vec3";    
        this.node_row_axis = document.createElement("div");
        this.node_row_axis.className = this.className_node_row_axis;        
        this.node_vertical.appendChild(this.node_row_axis);

        this.className_node_row_count_per_axis = "horizontal_div_multi_seed_vec3";    
        this.node_row_count_per_axis = document.createElement("div");
        this.node_row_count_per_axis.className = this.className_node_row_count_per_axis;        
        this.node_vertical.appendChild(this.node_row_count_per_axis);

        this.className_node_row_random_number = "horizontal_div_multi_seed_vec3";     
        this.node_row_random_number = document.createElement("div");
        this.node_row_random_number.className = this.className_node_row_random_number;        
        this.node_vertical.appendChild(this.node_row_random_number);

        this.className_node_row_point = "horizontal_div_multi_seed_vec3";    
        this.node_row_point = document.createElement("div");
        this.node_row_point.className = this.className_node_row_point;        
        this.node_vertical.appendChild(this.node_row_point);

        this.className_node_row_point2 = "horizontal_div_multi_seed_vec3";    
        this.node_row_point2 = document.createElement("div");
        this.node_row_point2.className = this.className_node_row_point2;        
        this.node_vertical.appendChild(this.node_row_point2);

        this.className_node_row_two_colors = "horizontal_div_multi_seed_vec3";    
        this.node_row_two_colors = document.createElement("div");
        this.node_row_two_colors.className = this.className_node_row_two_colors;        
        this.node_vertical.appendChild(this.node_row_two_colors);

        this.className_node_row_two_colors2 = "horizontal_div_multi_seed_vec3";    
        this.node_row_two_colors2 = document.createElement("div");
        this.node_row_two_colors2.className = this.className_node_row_two_colors2;        
        this.node_vertical.appendChild(this.node_row_two_colors2);
        

        //HEADER


        this.node_label = document.createElement("label");
        this.node_label.innerHTML = index;
        this.node_header.appendChild(this.node_label);
        
        this.node_input_select = document.createElement("select");
        this.node_option_random = document.createElement("option");
        this.node_option_random.value = MULTI_SEED_MODE_RANDOM
        this.node_option_random.innerText = "Random";
        this.node_input_select.appendChild(this.node_option_random);
        this.node_option_line = document.createElement("option");
        this.node_option_line.value = MULTI_SEED_MODE_LINE
        this.node_option_line.innerText = "Line";
        this.node_input_select.appendChild(this.node_option_line);        
        this.node_option_fixed_point = document.createElement("option");
        this.node_option_fixed_point.value = MULTI_SEED_MODE_FIXED_POINT
        this.node_option_fixed_point.innerText = "Fixed Point (2+2D)";
        this.node_input_select.appendChild(this.node_option_fixed_point);
        this.node_option_aligned_plane_random = document.createElement("option");
        this.node_option_aligned_plane_random.value = MULTI_SEED_MODE_ALIGNED_PLANE_RANDOM
        this.node_option_aligned_plane_random.innerText = "Aligned Plane Random";
        this.node_input_select.appendChild(this.node_option_aligned_plane_random);
        this.node_option_aligned_plane_grid = document.createElement("option");
        this.node_option_aligned_plane_grid.value = MULTI_SEED_MODE_ALIGNED_PLANE_GRID
        this.node_option_aligned_plane_grid.innerText = "Aligned Plane Grid";
        this.node_input_select.appendChild(this.node_option_aligned_plane_grid);
        
        this.node_input_select.addEventListener("change", (event) => {
            this.OnChangedMode();
        });
        this.node_header.appendChild(this.node_input_select);

        this.node_button = document.createElement("button");
        this.node_button.innerHTML = "x";
        this.node_button.type = "button";
        this.node_button.id = "button_delete_this_multi_seed";
        this.node_button.title = "Remove this multi seed.";
        this.node_button.addEventListener("click", (event) => {
            console.log("this.index: ", event.target.id, this.index);
            this.ui_seeds.removeMultiSeed(this.index);
            this.ui_seeds.UpdateChanges();
        });
        this.node_header.appendChild(this.node_button);


        //ROW AXIS
        
        this.node_row_axis_label = document.createElement("label");
        this.node_row_axis_label.innerHTML = "axis";
        this.node_row_axis.appendChild(this.node_row_axis_label);

        this.node_input_select_axis = document.createElement("select");
        this.node_option_axis_x = document.createElement("option");
        this.node_option_axis_x.value = 0;
        this.node_option_axis_x.innerText = "x";
        this.node_input_select_axis.appendChild(this.node_option_axis_x);
        this.node_option_axis_y = document.createElement("option");
        this.node_option_axis_y.value = 1;
        this.node_option_axis_y.innerText = "y";
        this.node_input_select_axis.appendChild(this.node_option_axis_y);
        this.node_option_axis_z = document.createElement("option");
        this.node_option_axis_z.value = 2;
        this.node_option_axis_z.innerText = "z";
        this.node_input_select_axis.appendChild(this.node_option_axis_z);
        this.node_row_axis.appendChild(this.node_input_select_axis);

        this.node_input_axis_value = document.createElement("input");
        this.node_input_axis_value.type = "text";
        this.node_input_axis_value.value = "0.5";
        this.node_input_axis_value.title = "The fixed x, y, or z value (depending on the selected axis).";
        this.node_row_axis.appendChild(this.node_input_axis_value);

        //ROW COUNT    
        this.node_row_count_label = document.createElement("label");
        this.node_row_count_label.innerHTML = "number of seeds";
        this.node_row_count.appendChild(this.node_row_count_label);

        this.node_input_count= document.createElement("input");
        this.node_input_count.type = "text";
        this.node_input_count.value = "4";
        this.node_input_count.title = "The number of seeds.";
        this.node_row_count.appendChild(this.node_input_count);

        //ROW COUNT PER AXIS        
        this.node_row_count_per_axis_label = document.createElement("label");
        this.node_row_count_per_axis_label.innerHTML = "number per axis";
        this.node_row_count_per_axis.appendChild(this.node_row_count_per_axis_label);

        this.node_input_count_per_axis= document.createElement("input");
        this.node_input_count_per_axis.type = "text";
        this.node_input_count_per_axis.value = "3";
        this.node_input_count_per_axis.title = "The number of seeds per axis.";
        this.node_row_count_per_axis.appendChild(this.node_input_count_per_axis);

        //ROW RANDOM NUMBER
        
        this.node_row_random_number_label = document.createElement("label");
        this.node_row_random_number_label.innerHTML = "random number init.";
        this.node_row_random_number.appendChild(this.node_row_random_number_label);

        this.node_input_random_number = document.createElement("input");
        this.node_input_random_number.type = "text";
        this.node_input_random_number.value = "0";
        this.node_input_random_number.title = "Determines the reproducible sequence generated by the Pseudo Random Number generator.";
        this.node_row_random_number.appendChild(this.node_input_random_number);

        //ROW POINT

        this.node_row_point_label = document.createElement("label");
        this.node_row_point_label.innerHTML = "position";
        this.node_row_point.appendChild(this.node_row_point_label);

        this.node_input_x = document.createElement("input");
        this.node_input_x.type = "text";
        this.node_input_x.value = "0.5";
        this.node_input_x.title = "x component of the seed position. \n    - Must be between 0 and 1.";
        this.node_row_point.appendChild(this.node_input_x);

        this.node_input_y = document.createElement("input");
        this.node_input_y.type = "text";
        this.node_input_y.value = "0.5";
        this.node_input_y.title = "y component of the seed position. \n    - Must be between 0 and 1.";
        this.node_row_point.appendChild(this.node_input_y);

        this.node_input_z = document.createElement("input");
        this.node_input_z.type = "text";
        this.node_input_z.value = "0.5";
        this.node_input_z.title = "z component of the seed position. \n    - Must be between 0 and 1.";
        this.node_row_point.appendChild(this.node_input_z);

        //ROW POINT 2

        this.node_row_point2_label = document.createElement("label");
        this.node_row_point2_label.innerHTML = "position";
        this.node_row_point2.appendChild(this.node_row_point2_label);

        this.node_input_point2_x = document.createElement("input");
        this.node_input_point2_x.type = "text";
        this.node_input_point2_x.value = "0.5";
        this.node_input_point2_x.title = "x component of the seed position. \n    - Must be between 0 and 1.";
        this.node_row_point2.appendChild(this.node_input_point2_x);

        this.node_input_point2_y = document.createElement("input");
        this.node_input_point2_y.type = "text";
        this.node_input_point2_y.value = "0.5";
        this.node_input_point2_y.title = "y component of the seed position. \n    - Must be between 0 and 1.";
        this.node_row_point2.appendChild(this.node_input_point2_y);

        this.node_input_point2_z = document.createElement("input");
        this.node_input_point2_z.type = "text";
        this.node_input_point2_z.value = "0.5";
        this.node_input_point2_z.title = "z component of the seed position. \n    - Must be between 0 and 1.";
        this.node_row_point2.appendChild(this.node_input_point2_z);


        // ROW TWO COLORS

        this.node_row_two_colors_label = document.createElement("label");
        this.node_row_two_colors_label.innerHTML = "colors";
        this.node_row_two_colors.appendChild(this.node_row_two_colors_label);

        this.node_input_c1 = document.createElement("input");
        this.node_input_c1.type = "color";
        this.node_input_c1.value = "#00FF00";
        this.node_input_c1.title = "First color of the Multi Seed. \n    - (Linear interpolation)";
        this.node_row_two_colors.appendChild(this.node_input_c1);

        this.node_input_c2 = document.createElement("input");
        this.node_input_c2.type = "color";
        this.node_input_c2.value = "#00FF00";
        this.node_input_c2.title = "Last color of the Multi Seed. \n    - (Linear interpolation)";
        this.node_row_two_colors.appendChild(this.node_input_c2);

        // ROW TWO COLORS

        this.node_row_two_colors2_label = document.createElement("label");
        this.node_row_two_colors2_label.innerHTML = "";
        this.node_row_two_colors2.appendChild(this.node_row_two_colors2_label);

        this.node_input_c3 = document.createElement("input");
        this.node_input_c3.type = "color";
        this.node_input_c3.value = "#00FF00";
        this.node_input_c3.title = "First color of the Multi Seed. \n    - (Linear interpolation)";
        this.node_row_two_colors2.appendChild(this.node_input_c3);

        this.node_input_c4 = document.createElement("input");
        this.node_input_c4.type = "color";
        this.node_input_c4.value = "#00FF00";
        this.node_input_c4.title = "Last color of the Multi Seed. \n    - (Linear interpolation)";
        this.node_row_two_colors2.appendChild(this.node_input_c4);


        

        this.randomizePosition();
        this.randomizeColor();
        this.randomizeRandomNumber();
        this.OnChangedMode();
    }

    toString() {
        var mode = parseInt(this.node_input_select.value);
        switch(mode){
            case MULTI_SEED_MODE_RANDOM:
                var s = this.node_input_select.value + "~"
                + this.node_input_count.value + "~"
                + this.node_input_random_number.value + "~"
                + this.node_input_c1.value + "~"
                + this.node_input_c2.value;
                return s;
            case MULTI_SEED_MODE_FIXED_POINT:
                var s = this.node_input_select.value + "~"
                + this.node_input_count.value + "~"
                + this.node_input_x.value + "~"
                + this.node_input_y.value + "~"
                + this.node_input_z.value + "~"
                + this.node_input_c1.value + "~"
                + this.node_input_c2.value;
                return s;
            case MULTI_SEED_MODE_LINE:
                this.node_row_random_number.className = "hidden";
                this.node_row_point.className = this.className_node_row_point;
                this.node_row_point2.className = this.className_node_row_point2;
                var s = this.node_input_select.value + "~"
                + this.node_input_count.value + "~"
                + this.node_input_x.value + "~"
                + this.node_input_y.value + "~"
                + this.node_input_z.value + "~"
                + this.node_input_point2_x.value + "~"
                + this.node_input_point2_y.value + "~"
                + this.node_input_point2_z.value + "~"
                + this.node_input_c1.value + "~"
                + this.node_input_c2.value;
                return s;
            case MULTI_SEED_MODE_ALIGNED_PLANE_RANDOM:
                var s = this.node_input_select.value + "~"
                + this.node_input_count.value + "~"
                + this.node_input_select_axis.value + "~"
                + this.node_input_axis_value.value + "~"
                + this.node_input_random_number.value + "~"
                + this.node_input_c1.value + "~"
                + this.node_input_c2.value;
                return s;                
            case MULTI_SEED_MODE_ALIGNED_PLANE_GRID:
                var s = this.node_input_select.value + "~"
                + this.node_input_count.value + "~"
                + this.node_input_select_axis.value + "~"
                + this.node_input_axis_value.value + "~"
                + this.node_input_count_per_axis.value + "~"
                + this.node_input_c1.value + "~"
                + this.node_input_c2.value + "~"
                + this.node_input_c3.value + "~"
                + this.node_input_c4.value;
                //TODO
                return s;
            default:
                return "";
        }
    }

    fromString(s) {
        var split = s.split("~");
        this.node_input_select.value = split[0];
        var mode = parseInt(this.node_input_select.value);
        this.node_input_count.value = split[1];
        switch(mode){
            case MULTI_SEED_MODE_RANDOM:
                this.node_input_random_number.value = split[2];
                this.node_input_c1.value = split[3];
                this.node_input_c2.value = split[4];
                break;
            case MULTI_SEED_MODE_FIXED_POINT:
                this.node_input_x.value = split[2];
                this.node_input_y.value = split[3];
                this.node_input_z.value = split[4];
                this.node_input_c1.value = split[5];
                this.node_input_c2.value = split[6];
                break;
            case MULTI_SEED_MODE_LINE:
                this.node_input_x.value = split[2];
                this.node_input_y.value = split[3];
                this.node_input_z.value = split[4];
                this.node_input_point2_x.value = split[5];
                this.node_input_point2_y.value = split[6];
                this.node_input_point2_z.value = split[7];
                this.node_input_c1.value = split[8];
                this.node_input_c2.value = split[9];
                break;
            case MULTI_SEED_MODE_ALIGNED_PLANE_RANDOM:
                this.node_input_select_axis.value = split[2];
                this.node_input_axis_value.value = split[3];
                this.node_input_random_number.value = split[4];
                this.node_input_c1.value = split[5];
                this.node_input_c2.value = split[6];
                break;
            case MULTI_SEED_MODE_ALIGNED_PLANE_GRID:
                this.node_input_select_axis.value = split[2];
                this.node_input_axis_value.value = split[3];
                this.node_input_count_per_axis.value = split[4];
                this.node_input_c1.value = split[5];
                this.node_input_c2.value = split[6];
                this.node_input_c3.value = split[7];
                this.node_input_c4.value = split[8];
                break;
            default:
                break;
        }
        this.OnChangedMode();
    }

    OnChangedMode(){
        console.log("OnChangedMode: ", this.node_input_select.value);
        var mode = parseInt(this.node_input_select.value);
        switch(mode){
            case MULTI_SEED_MODE_RANDOM:
                this.node_row_count.className = this.className_node_row_count;
                this.node_row_axis.className = "hidden";
                this.node_row_count_per_axis.className = "hidden";
                this.node_row_random_number.className = this.className_node_row_random_number;
                this.node_row_point.className = "hidden";
                this.node_row_point2.className = "hidden";
                this.node_row_two_colors2.className = "hidden";
                break;
            case MULTI_SEED_MODE_FIXED_POINT:
                this.node_row_count.className = this.className_node_row_count;
                this.node_row_axis.className = "hidden";
                this.node_row_count_per_axis.className = "hidden";
                this.node_row_random_number.className = "hidden";
                this.node_row_point.className = this.className_node_row_point;
                this.node_row_point2.className = "hidden";
                this.node_row_two_colors2.className = "hidden";
                break;
            case MULTI_SEED_MODE_LINE:
                this.node_row_count.className = this.className_node_row_count;
                this.node_row_axis.className = "hidden";
                this.node_row_count_per_axis.className = "hidden";
                this.node_row_random_number.className = "hidden";
                this.node_row_point.className = this.className_node_row_point;
                this.node_row_point2.className = this.className_node_row_point2;
                this.node_row_two_colors2.className = "hidden";
                break;
            case MULTI_SEED_MODE_ALIGNED_PLANE_RANDOM:
                this.node_row_count.className = this.className_node_row_count;
                this.node_row_axis.className = this.className_node_row_axis;
                this.node_row_count_per_axis.className = "hidden";
                this.node_row_random_number.className = this.className_node_row_random_number;
                this.node_row_point.className = "hidden";
                this.node_row_point2.className = "hidden";
                this.node_row_two_colors2.className = "hidden";
                break;
            case MULTI_SEED_MODE_ALIGNED_PLANE_GRID:
                this.node_row_count.className = "hidden";
                this.node_row_axis.className = this.className_node_row_axis;
                this.node_row_count_per_axis.className = this.className_node_row_count_per_axis;
                this.node_row_random_number.className = "hidden";
                this.node_row_point.className = "hidden";
                this.node_row_point2.className = "hidden";
                this.node_row_two_colors2.className = this.className_node_row_two_colors2;
                break;
        }
    }

    IsGrid2D(){
        var mode = parseInt(this.node_input_select.value);
        switch(mode){            
            case MULTI_SEED_MODE_ALIGNED_PLANE_GRID:
                return true;
            default:
                return false;
        }
    }

    GetCount(){        
        if(this.IsGrid2D()){
            var count_per_axis = parseInt(this.node_input_count_per_axis.value);
            return count_per_axis * count_per_axis;
        }else{
            return parseInt(this.node_input_count.value);
        }
    }

    updateIndex(new_index) {
        this.index = new_index;
        this.node_label.innerHTML = new_index;
    }

    randomizePosition() {
        this.node_input_x.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_y.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_z.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_point2_x.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_point2_y.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_point2_z.value = this.ui_seeds.rng_autoseed().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
    }

    randomizeColor() {
        var r = Math.round(this.ui_seeds.rng_autoseed() * 255);
        var g = Math.round(this.ui_seeds.rng_autoseed() * 255);
        var b = Math.round(this.ui_seeds.rng_autoseed() * 255);
        this.node_input_c1.value = rgbToHex(r, g, b);
        var r = Math.round(this.ui_seeds.rng_autoseed() * 255);
        var g = Math.round(this.ui_seeds.rng_autoseed() * 255);
        var b = Math.round(this.ui_seeds.rng_autoseed() * 255);
        this.node_input_c2.value = rgbToHex(r, g, b);
    }

    randomizeRandomNumber(){
        this.node_input_random_number.value = Math.round(this.ui_seeds.rng_autoseed()*1000000);
    }

    getColorVector(local_index) {
        //get col 1
        var hex = this.node_input_c1.value;
        console.log("hex1: ", hex);
        const r1 = parseInt(hex.substr(1, 2), 16) / 255
        const g1 = parseInt(hex.substr(3, 2), 16) / 255
        const b1 = parseInt(hex.substr(5, 2), 16) / 255
        console.log(`red: ${r1}, green: ${g1}, blue: ${b1}`)

        //get col 2
        var hex = this.node_input_c2.value;
        console.log("hex2: ", hex);
        const r2 = parseInt(hex.substr(1, 2), 16) / 255
        const g2 = parseInt(hex.substr(3, 2), 16) / 255
        const b2 = parseInt(hex.substr(5, 2), 16) / 255
        console.log(`red: ${r2}, green: ${g2}, blue: ${b2}`)

        //get percentage
        var count = parseInt(this.node_input_count.value);
        var t = local_index / (count-1);

        console.log("t", t)
        var r = module_utility.lerp(r1, r2, t);
        var g = module_utility.lerp(g1, g2, t);
        var b = module_utility.lerp(b1, b2, t);
        console.log(`red: ${r}, green: ${g}, blue: ${b}`)

        return glMatrix.vec3.fromValues(r, g, b);
    }

    getColorVector256(local_index) {
        //get col 1
        var hex = this.node_input_c1.value;
        //console.log("hex1: ", hex);
        const r1 = parseInt(hex.substr(1, 2), 16)
        const g1 = parseInt(hex.substr(3, 2), 16)
        const b1 = parseInt(hex.substr(5, 2), 16)
        //console.log(`red: ${r1}, green: ${g1}, blue: ${b1}`)

        //get col 2
        var hex = this.node_input_c2.value;
        //console.log("hex2: ", hex);
        const r2 = parseInt(hex.substr(1, 2), 16)
        const g2 = parseInt(hex.substr(3, 2), 16)
        const b2 = parseInt(hex.substr(5, 2), 16)
        //console.log(`red: ${r2}, green: ${g2}, blue: ${b2}`)

        //get percentage
        var count = parseInt(this.node_input_count.value);
        var t = local_index / (count-1);

        var r = floor(module_utility.lerp(r1, r2, t));
        var g = floor(module_utility.lerp(g1, g2, t));
        var b = floor(module_utility.lerp(b1, b2, t));
        //console.log(`red: ${r}, green: ${g}, blue: ${b}`)
        console.log("lerp", t, r, g, b)

        return glMatrix.vec3.fromValues(r, g, b);
    }

    getColorVector256_2D(local_index_a, local_index_b) {
        //get col 1
        var hex = this.node_input_c1.value;
        //console.log("hex1: ", hex);
        const r1 = parseInt(hex.substr(1, 2), 16)
        const g1 = parseInt(hex.substr(3, 2), 16)
        const b1 = parseInt(hex.substr(5, 2), 16)
        //console.log(`red: ${r1}, green: ${g1}, blue: ${b1}`)

        //get col 2
        var hex = this.node_input_c2.value;
        //console.log("hex2: ", hex);
        const r2 = parseInt(hex.substr(1, 2), 16)
        const g2 = parseInt(hex.substr(3, 2), 16)
        const b2 = parseInt(hex.substr(5, 2), 16)
        //console.log(`red: ${r2}, green: ${g2}, blue: ${b2}`)

        //get col 3
        var hex = this.node_input_c3.value;
        //console.log("hex2: ", hex);
        const r3 = parseInt(hex.substr(1, 2), 16)
        const g3 = parseInt(hex.substr(3, 2), 16)
        const b3 = parseInt(hex.substr(5, 2), 16)
        //console.log(`red: ${r2}, green: ${g2}, blue: ${b2}`)

        //get col 4
        var hex = this.node_input_c4.value;
        //console.log("hex2: ", hex);
        const r4 = parseInt(hex.substr(1, 2), 16)
        const g4 = parseInt(hex.substr(3, 2), 16)
        const b4 = parseInt(hex.substr(5, 2), 16)
        //console.log(`red: ${r2}, green: ${g2}, blue: ${b2}`)

        //get percentage
        var count_per_axis = parseInt(this.node_input_count_per_axis.value);
        var t_a = local_index_a / (count_per_axis-1);
        var t_b = local_index_b / (count_per_axis-1);

        var r_a1 = module_utility.lerp(r1, r2, t_a);
        var g_a1 = module_utility.lerp(g1, g2, t_a);
        var b_a1 = module_utility.lerp(b1, b2, t_a);

        var r_a2 = module_utility.lerp(r3, r4, t_a);
        var g_a2 = module_utility.lerp(g3, g4, t_a);
        var b_a2 = module_utility.lerp(b3, b4, t_a);

        //var r = floor(module_utility.lerp(r_a1, r_a2, t_b));
        //var g = floor(module_utility.lerp(g_a1, g_a2, t_b));
        //var b = floor(module_utility.lerp(b_a1, b_a2, t_b));
        var r = floor(module_utility.lerp(r_a2, r_a1, t_b));
        var g = floor(module_utility.lerp(g_a2, g_a1, t_b));
        var b = floor(module_utility.lerp(b_a2, b_a1, t_b));
        //console.log(`red: ${r}, green: ${g}, blue: ${b}`)
        console.log("lerp", t_a, t_b, r, g, b);

        return glMatrix.vec3.fromValues(r, g, b);
    }
}

class UISeeds {
    constructor() {
        this.changed_count = false;
        this.element = document.getElementById("fieldset_seeds");
        this.element_multi_seeds = document.getElementById("fieldset_multi_seeds");
        this.element_phantom_seeds = document.getElementById("fieldset_phantom_seeds");
        
        this.list = [];
        this.list_multi_seeds = [];
        this.list_phantom_seeds = [];
        this.rng_autoseed = seedrandom();
        this.direction = DIRECTION_FORWARD;
    }

    generateDefaultSeeds() {
        var count = 7;
        while (count > this.list.length) {
            this.addSeed();
        }
        while (this.list.length > count) {
            this.removeSeed(this.list.length - 1);
        }

        var i = 0;
        this.list[i].node_input_x.value = 0.4802;
        this.list[i].node_input_y.value = 0.7473;
        this.list[i].node_input_z.value = 0.1558;
        this.list[i].node_input_c.value = "#EA4335";
        i += 1;
        this.list[i].node_input_x.value = 0.5035;
        this.list[i].node_input_y.value = 0.0771;
        this.list[i].node_input_z.value = 0.8774;
        this.list[i].node_input_c.value = "#34A853";
        i += 1;
        this.list[i].node_input_x.value = 0.7352;
        this.list[i].node_input_y.value = 0.3579;
        this.list[i].node_input_z.value = 0.3672;
        this.list[i].node_input_c.value = "#4285F4";
        i += 1;
        this.list[i].node_input_x.value = 0.2809;
        this.list[i].node_input_y.value = 0.1736;
        this.list[i].node_input_z.value = 0.0425;
        this.list[i].node_input_c.value = "#FBBC05";
        i += 1;
        this.list[i].node_input_x.value = 0.8768;
        this.list[i].node_input_y.value = 0.0078;
        this.list[i].node_input_z.value = 0.8723;
        this.list[i].node_input_c.value = "#B14FF3";
        i += 1;
        this.list[i].node_input_x.value = 0.6060;
        this.list[i].node_input_y.value = 0.9590;
        this.list[i].node_input_z.value = 0.9770;
        this.list[i].node_input_c.value = "#FBCFEB";
        i += 1;
        this.list[i].node_input_x.value = 0.8768;
        this.list[i].node_input_y.value = 0.0078;
        this.list[i].node_input_z.value = 0.1277;
        this.list[i].node_input_c.value = "#95FEF2";
    }

    addSeed() {
        var new_seed = new UISeed(this, this.list.length, false);
        this.list.push(new_seed);
        this.element.appendChild(new_seed.node);
        this.changed_count = true;
        this.UpdateCSS();
    }

    addMultiSeed() {
        var new_seed = new UIMultiSeed(this, this.list_multi_seeds.length);
        this.list_multi_seeds.push(new_seed);
        this.element_multi_seeds.appendChild(new_seed.node);
        this.changed_count = true;
    }

    addPhantomSeed() {
        var new_seed = new UISeed(this, this.list_phantom_seeds.length, true);
        this.list_phantom_seeds.push(new_seed);
        this.element_phantom_seeds.appendChild(new_seed.node);
    }

    removeSeed(index) {
        console.log("removeSeed: ", index);
        var to_remove = this.list[index];
        this.element.removeChild(to_remove.node);
        this.list.splice(index, 1);
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].updateIndex(i);
        }
        this.changed_count = true;
    }

    removeMultiSeed(index) {
        console.log("removeMultiSeed: ", index);
        var to_remove = this.list_multi_seeds[index];
        this.element_multi_seeds.removeChild(to_remove.node);
        this.list_multi_seeds.splice(index, 1);
        for (var i = 0; i < this.list_multi_seeds.length; i++) {
            this.list_multi_seeds[i].updateIndex(i);
        }
        this.changed_count = true;
    }
    
    removePhantomSeed(index) {
        console.log("removePhantomSeed: ", index);
        var to_remove = this.list_phantom_seeds[index];
        this.element_phantom_seeds.removeChild(to_remove.node);
        this.list_phantom_seeds.splice(index, 1);
        for (var i = 0; i < this.list_phantom_seeds.length; i++) {
            this.list_phantom_seeds[i].updateIndex(i);
        }
        this.changed_count = true;
    }

    randomizePosition() {
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].randomizePosition(i);
        }
    }

    randomizeColor() {
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].randomizeColor(i);
        }
    }
    
    toSpecialData(){          
        //getStateDescriptionDict(STATE_VERSION);
        
        var binary_array = new BinaryArray();
        binary_array.writeUint16(this.list.length);
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].writeToBinaryArray(binary_array);   
        }
        binary_array.resizeToContent();
        console.log(binary_array);
        window["special_data_seeds"] = binary_array;  
    }

    fromSpecialData() {
        var binary_array = window["special_data_seeds"];
        binary_array.begin();
        var list_length = binary_array.readUint16();

        while (list_length > this.list.length) {
            this.addSeed();
        }
        while (this.list.length > list_length) {
            this.removeSeed(this.list.length - 1);
        }
        for(var i=0; i<list_length; i++){
            this.list[i].readFromBinaryArray(binary_array);
        }
    }

    toString() {
        var s = "";
        //s += this.list.length;
        //if (this.list.length == 0)
        //    return s
        for (var i = 0; i < this.list.length; i++) {
            if (i > 0)
                s += "!"
            s += this.list[i].toString();
        }

        s += ";"

        for (var i = 0; i < this.list_multi_seeds.length; i++) {
            if (i > 0)
                s += "!"
            s += this.list_multi_seeds[i].toString();
        }

        console.log("0x2 toString s:", s);
        return s;
    }

    fromString(s) {
        console.log("0x2 fromString");
        console.log("0x2 s:", s);
        if (s === null){
            s = "";
        }  
        s += ";"
        console.log("0x2 s:", s);
        var split = s.split(";");
        console.log("0x2 split:", split);
        this.fromString_seeds(split[0]);
        this.fromString_multi_seeds(split[1]);
        this.UpdateChanges();
    }

    fromString_seeds(s){
        console.log("0x2 fromString_seeds:", s);
        if (s.length == 0){
            while (this.list.length > 0) {
                this.removeSeed(this.list.length - 1);
            }
            return;
        }      
        s = s + "!";//dummy split at end to allow 1 element lists

        var split = s.split("!");
        console.log("0x2 split:", split);
        var real_length = split.length - 1;//excluding dummy

        while (real_length > this.list.length) {
            this.addSeed();
        }
        while (this.list.length > real_length) {
            this.removeSeed(this.list.length - 1);
        }

        for (var i = 0; i < real_length; i++) {
            console.log("i:", i, split[i]);
            this.list[i].fromString(split[i]);
        }
    }

    fromString_multi_seeds(s){
        console.log("0x2 fromString_multi_seeds:", s);
        if (s.length == 0){
            while (this.list_multi_seeds.length > 0) {
                this.removeMultiSeedSeed(this.list_multi_seeds.length - 1);
            }
            return;
        }      
        s = s + "!";//dummy split at end to allow 1 element lists

        var split = s.split("!");
        console.log("0x2 split:", split);
        var real_length = split.length - 1;//excluding dummy

        while (real_length > this.list_multi_seeds.length) {
            this.addMultiSeed();
        }
        while (this.list_multi_seeds.length > real_length) {
            this.removeMultiSeed(this.list.length - 1);
        }

        for (var i = 0; i < real_length; i++) {
            console.log("i:", i, split[i]);
            this.list_multi_seeds[i].fromString(split[i]);
        }
    }

    createPointList(space) {
        var seed_positions = [];
        var seed_directions = [];
        var visual_seeds = [];
        var seed_signums = [];
        this.createPointListSeeds(space, seed_positions, seed_directions, visual_seeds, seed_signums);
        this.createPointListPhantomSeeds(space, seed_positions, visual_seeds, seed_signums);
        this.seed_positions = seed_positions;
        this.seed_directions = seed_directions;
        this.seed_signums = seed_signums;
        this.visual_seeds = visual_seeds;
    }

    createPointListSeeds(space, seed_positions, seed_directions, visual_seeds, seed_signums){
        for (var i = 0; i < this.list.length; i++) {
            var entry = this.list[i];
            var x = entry.node_input_x.value;
            var y = entry.node_input_y.value;
            var z = entry.node_input_z.value;
            var w = entry.node_input_w.value;
            var v_x = entry.node_input_v_x.value;
            var v_y = entry.node_input_v_y.value;
            var v_z = entry.node_input_v_z.value;
            var v_w = entry.node_input_v_w.value;
            //v_x = -1.25;
            //v_y = 0.75;
            var visual_seed = new StreamlineSeed();
            visual_seed.position = glMatrix.vec3.fromValues(x, y, z);
            visual_seeds.push(visual_seed);

            var seed;
            var seed_direction;
            switch (space) {
                case SPACE_3_TORUS:
                    seed = glMatrix.vec4.fromValues(x, y, z, 1);
                    break;
                case SPACE_2_PLUS_2D:
                    v_x = Math.cos(2*Math.PI*z);
                    v_y = Math.sin(2*Math.PI*z);
                    seed = glMatrix.vec4.fromValues(x, y, v_x, v_y);
                    break;
                case SPACE_2_SPHERE_3_PLUS_3D:
                    seed = glMatrix.vec4.fromValues(x, y, z, 1);
                    seed_direction = glMatrix.vec4.fromValues(v_x, v_y, v_z, 1);
                    break;
                default:
                    console.log("Error unknonw space");
                    break;
            }


            switch(this.direction){
                case DIRECTION_FORWARD:
                    seed_positions.push(seed);
                    seed_directions.push(seed_direction);
                    seed_signums.push(1);
                    break;
                case DIRECTION_BACKWARD:
                    seed_positions.push(seed);
                    seed_directions.push(seed_direction);
                    seed_signums.push(-1);
                    break;
                case DIRECTION_BOTH:
                    seed_positions.push(seed);
                    seed_directions.push(seed_direction);
                    seed_signums.push(1);
                    seed_positions.push(seed);
                    seed_directions.push(seed_direction);
                    seed_signums.push(-1);
                    break;
            }
        }
    }

    createPointListPhantomSeeds(space, seed_positions, visual_seeds, seed_signums){
        for (var i = 0; i < this.list_phantom_seeds.length; i++) {
            var entry = this.list_phantom_seeds[i];
            var x = entry.node_input_x.value;
            var y = entry.node_input_y.value;
            var z = entry.node_input_z.value;
            var v_x = Math.cos(2*Math.PI*z);
            var v_y = Math.sin(2*Math.PI*z);
            //v_x = -1.25;
            //v_y = 0.75;
            var visual_seed = new StreamlineSeed();
            visual_seed.position = glMatrix.vec3.fromValues(x, y, z);
            visual_seeds.push(visual_seed);

            var seed;
            switch (space) {
                case SPACE_3_TORUS:
                    seed = glMatrix.vec4.fromValues(x, y, z, 1);
                    break;
                case SPACE_2_PLUS_2D:
                    seed = glMatrix.vec4.fromValues(x, y, v_x, v_y);
                    break;
                default:
                    console.log("Error unknonw space");
                    break;
            }


            switch(this.direction){
                case DIRECTION_FORWARD:
                    seed_positions.push(seed);
                    seed_signums.push(1);
                    break;
                case DIRECTION_BACKWARD:
                    seed_positions.push(seed);
                    seed_signums.push(-1);
                    break;
                case DIRECTION_BOTH:
                    seed_positions.push(seed);
                    seed_signums.push(1);
                    seed_positions.push(seed);
                    seed_signums.push(-1);
                    break;
            }
        }
    }

    getStreamlineColors() {
        var color_list = [];
        for (var i = 0; i < this.list.length; i++) {
            var entry = this.list[i];
            var color = entry.getColorVector();
            var streamline_color = new StreamlineColor();
            streamline_color.color = color;
            color_list.push(streamline_color);
        }
        for (var i = 0; i < this.list_phantom_seeds.length; i++) {
            var entry = this.list_phantom_seeds[i];
            var color = entry.getColorVector();
            var streamline_color = new StreamlineColor();
            streamline_color.color = color;
            color_list.push(streamline_color);
        }
        return color_list;
    }

    HasValueChanged(name) {
        var changed = this.changed_count;
        for (var i = 0; i < this.list.length; i++) {
            changed = changed || this.list[i].HasValueChanged(name);
        }
        return changed;
    }

    UpdateDefaultValues(name) {
        this.changed_count = false;
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].UpdateDefaultValues(name);
        }
    }

    UpdatePhantomSeeds(){
        console.log("UpdatePhantomSeeds");
        var total_count = 0;
        //count num required seeds
        for (var i = 0; i < this.list_multi_seeds.length; i++) {
            var multi_seed = this.list_multi_seeds[i];
            var count = multi_seed.GetCount();
            total_count += count;
            console.log("multi seed:", multi_seed.index, count);
        }
        //add seeds
        while (total_count > this.list_phantom_seeds.length) {
            this.addPhantomSeed();
        }
        //remove seeds
        while (this.list_phantom_seeds.length > total_count) {
            this.removePhantomSeed(this.list_phantom_seeds.length - 1);
        }
        //update data
        var phantom_index = 0;
        for (var i = 0; i < this.list_multi_seeds.length; i++) {
            var multi_seed = this.list_multi_seeds[i];
            var count = parseInt(multi_seed.node_input_count.value);
            var rng_seed = multi_seed.node_input_random_number.value;
            var rng = seedrandom(rng_seed);
            
            var mode = parseInt(multi_seed.node_input_select.value);
            var is_grid_based = multi_seed.IsGrid2D();
            if(is_grid_based){
                phantom_index = this.UpdatePhantomSeeds_GridBased(multi_seed, mode, rng, phantom_index);
            }else{
                phantom_index = this.UpdatePhantomSeeds_NonGridBased(count, multi_seed, mode, rng, phantom_index);
            }


            console.log("multi seed:", multi_seed.index, count);
        }
    }

    UpdatePhantomSeeds_NonGridBased(count, multi_seed, mode, rng, phantom_index){
        for (var j = 0; j < count; j++){
            var phantom_seed = this.list_phantom_seeds[phantom_index];

            var col = multi_seed.getColorVector256(j);
            phantom_seed.node_input_c.value = rgbToHex(col[0], col[1], col[2]);

            switch(mode){
                case MULTI_SEED_MODE_RANDOM:
                    phantom_seed.node_input_x.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                    phantom_seed.node_input_y.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                    phantom_seed.node_input_z.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                    break;
                case MULTI_SEED_MODE_FIXED_POINT:
                    //fixed position, multiple directions
                    phantom_seed.node_input_x.value = multi_seed.node_input_x.value
                    phantom_seed.node_input_y.value = multi_seed.node_input_y.value
                    var t = j / count;
                    var z = parseFloat(multi_seed.node_input_z.value) + module_utility.lerp(0, 1, t);
                    console.log("z", z);
                    z -= floor(z) 
                    phantom_seed.node_input_z.value = z.toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                    break;
                case MULTI_SEED_MODE_LINE:
                    var t = j / (count-1);
                    var x1 = parseFloat(multi_seed.node_input_x.value);
                    var x2 = parseFloat(multi_seed.node_input_point2_x.value);
                    var y1 = parseFloat(multi_seed.node_input_y.value);
                    var y2 = parseFloat(multi_seed.node_input_point2_y.value);
                    var z1 = parseFloat(multi_seed.node_input_z.value);
                    var z2 = parseFloat(multi_seed.node_input_point2_z.value);
                    phantom_seed.node_input_x.value = module_utility.lerp(x1, x2, t).toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                    phantom_seed.node_input_y.value = module_utility.lerp(y1, y2, t).toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                    phantom_seed.node_input_z.value = module_utility.lerp(z1, z2, t).toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                    break;
                case MULTI_SEED_MODE_ALIGNED_PLANE_RANDOM:
                    var axis = parseInt(multi_seed.node_input_select_axis.value);
                    var axis_value = parseFloat(multi_seed.node_input_axis_value.value).toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);                        
                    switch(axis){
                        case 0:
                            phantom_seed.node_input_x.value = axis_value;
                            phantom_seed.node_input_y.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                            phantom_seed.node_input_z.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                            break;
                        case 1:
                            phantom_seed.node_input_x.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                            phantom_seed.node_input_y.value = axis_value;
                            phantom_seed.node_input_z.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                            break;
                        case 2:
                            phantom_seed.node_input_x.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                            phantom_seed.node_input_y.value = rng.quick().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                            phantom_seed.node_input_z.value = axis_value;
                            break;
                    }
                    break;
            }
            
            console.log("phantom_seed:", phantom_seed, col);
            phantom_index += 1;
        }
        return phantom_index;
    }

    UpdatePhantomSeeds_GridBased(multi_seed, mode, rng, phantom_index){
        var count_per_axis = parseInt(multi_seed.node_input_count_per_axis.value);
        var count = count_per_axis * count_per_axis;
        for (var a = 0; a < count_per_axis; a++){
            for (var b = 0; b < count_per_axis; b++){
                var phantom_seed = this.list_phantom_seeds[phantom_index];

                var col = multi_seed.getColorVector256_2D(a, b);
                phantom_seed.node_input_c.value = rgbToHex(col[0], col[1], col[2]);

                var dist = 1/(count_per_axis);
    
                switch(mode){
                    case MULTI_SEED_MODE_ALIGNED_PLANE_GRID:
                        var axis = parseInt(multi_seed.node_input_select_axis.value);
                        var axis_value = parseFloat(multi_seed.node_input_axis_value.value).toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                        var a_value = (0.5*dist + a*dist).toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                        var b_value = (0.5*dist + b*dist).toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
                        switch(axis){
                            case 0:
                                phantom_seed.node_input_x.value = axis_value;
                                phantom_seed.node_input_y.value = a_value;
                                phantom_seed.node_input_z.value = b_value;
                                break;
                            case 1:
                                phantom_seed.node_input_x.value = a_value;
                                phantom_seed.node_input_y.value = axis_value;
                                phantom_seed.node_input_z.value = b_value;
                                break;
                            case 2:
                                phantom_seed.node_input_x.value = a_value;
                                phantom_seed.node_input_y.value = b_value;
                                phantom_seed.node_input_z.value = axis_value;
                                break;
                        }
                        break;
                }
                console.log("phantom_seed:", phantom_seed, col);
                phantom_index += 1;
            }           

        }
        return phantom_index;
    }

    UpdateChanges(){        
        this.UpdatePhantomSeeds();
        this.createPointList();
        this.UpdateCSS();
    }

    UpdateCSS(){
        var space = parseInt(document.getElementById("select_space").value);
        for (var i = 0; i < this.list.length; i++) {
            switch (space) {
                case SPACE_3_TORUS:
                    this.list[i].node.className = "seed_grid_3";                       
                    break;
                case SPACE_2_PLUS_2D:
                    this.list[i].node.className = "seed_grid_3";                  
                    break;
                case SPACE_2_SPHERE_3_PLUS_3D:
                    this.list[i].node.className = "seed_grid_3Plus3";                
                    break;
                default:
                    break;
            }
        }
    }
}
/*
<fieldset id="fieldset_seeds">
<div id="div_seed_position_0" class="horizontal_div_seed">
    <label>0</label>
    <input id="seed_x_0" type="text" value="0.5">
    <input id="seed_y_0" type="text" value="0.5">
    <input id="seed_z_0" type="text" value="0.5">
    <input id="seed_c_0" type="color" value="#ff0000">
    <button type="button" id="button_remove_seed_0">x</button>
</div>
</fieldset>
*/

module.exports = UISeeds;