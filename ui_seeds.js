const glMatrix = require("gl-matrix");
const seedrandom = require("seedrandom");
const module_utility = require("./utility");
const rgbToHex = module_utility.rgbToHex;
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, Cylinder } = require("./data_types");
const BinaryArray = require("./binary_array");
const getStateDescription = require("./version").getStateDescription;

class UISeed {
    constructor(ui_seeds, index) {
        this.ui_seeds = ui_seeds;
        this.index = index;
        this.node = document.createElement("div");
        this.node.className = "horizontal_div_seed";

        this.node_label = document.createElement("label");
        this.node_label.innerHTML = index;
        this.node.appendChild(this.node_label);

        this.node_input_x = document.createElement("input");
        this.node_input_x.type = "text";
        this.node_input_x.value = "0.5";
        this.node_input_x.title = "x component of the seed position. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_x);

        this.node_input_y = document.createElement("input");
        this.node_input_y.type = "text";
        this.node_input_y.value = "0.5";
        this.node_input_y.title = "y component of the seed position. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_y);

        this.node_input_z = document.createElement("input");
        this.node_input_z.type = "text";
        this.node_input_z.value = "0.5";
        this.node_input_z.title = "z component of the seed position. \n    - Must be between 0 and 1.";
        this.node.appendChild(this.node_input_z);

        this.node_input_c = document.createElement("input");
        this.node_input_c.type = "color";
        this.node_input_c.value = "#00FF00";
        this.node_input_c.title = "Color of the streamline started at this seed.";
        this.node.appendChild(this.node_input_c);

        this.node_random = document.createElement("button");
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
        this.node_button.innerHTML = "x";
        this.node_button.type = "button";
        this.node_button.id = "button_delete_this_seed";
        this.node_button.title = "Remove this seed.";
        this.node_button.addEventListener("click", (event) => {
            console.log("this.index: ", event.target.id, this.index);
            this.ui_seeds.removeSeed(this.index);
        });
        this.node.appendChild(this.node_button);

        this.randomizePosition();
        this.randomizeColor();
    }

    updateIndex(new_index) {
        this.index = new_index;
        this.node_label.innerHTML = new_index;
    }

    randomizePosition() {
        this.node_input_x.value = this.ui_seeds.rng_positions().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_y.value = this.ui_seeds.rng_positions().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
        this.node_input_z.value = this.ui_seeds.rng_positions().toFixed(FIXED_LENGTH_RANDOM_SEED_POSITION);
    }

    randomizeColor() {
        var r = Math.round(this.ui_seeds.rng_positions() * 255);
        var g = Math.round(this.ui_seeds.rng_positions() * 255);
        var b = Math.round(this.ui_seeds.rng_positions() * 255);
        this.node_input_c.value = rgbToHex(r, g, b);
    }

    fromString(s) {
        var split = s.split("~");
        this.node_input_x.value = split[0];
        this.node_input_y.value = split[1];
        this.node_input_z.value = split[2];
        this.node_input_c.value = split[3];
    }

    toString() {
        var s = this.node_input_x.value + "~"
            + this.node_input_y.value + "~"
            + this.node_input_z.value + "~"
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

class UISeeds {
    constructor() {
        this.changed_count = false;
        this.element = document.getElementById("fieldset_seeds");
        this.list = [];
        this.rng_positions = seedrandom();
        this.direction = DIRECTION_FORWARD;
        //this.rng_positions_seed_string = 'hello.';
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
        var new_seed = new UISeed(this, this.list.length);
        this.list.push(new_seed);
        this.element.appendChild(new_seed.node);
        this.changed_count = true;
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



    /*
    randomizePosition(seed_string) {
        this.rng_positions = new Math.seedrandom(seed_string);
        this.rng_positions_seed_string = seed_string;
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].randomizePosition(i);
        }
    }
    */
    
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
        return s;
    }

    fromString(s) {
        console.log("fromString");
        console.log("0x2 s:", s);
        if (s === null)
            return;
        //if (!s.includes("!")) {
        //    return;
        //}        
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

    createPointList(space) {
        var point_list = [];
        var seed_signums = [];
        for (var i = 0; i < this.list.length; i++) {
            var entry = this.list[i];
            var x = entry.node_input_x.value;
            var y = entry.node_input_y.value;
            var z = entry.node_input_z.value;
            var v_x = Math.cos(2*Math.PI*z);
            var v_y = Math.sin(2*Math.PI*z);
            //v_x = -1.25;
            //v_y = 0.75;
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
                    point_list.push(seed);
                    seed_signums.push(1);
                    break;
                case DIRECTION_BACKWARD:
                    point_list.push(seed);
                    seed_signums.push(-1);
                    break;
                case DIRECTION_BOTH:
                    point_list.push(seed);
                    seed_signums.push(1);
                    point_list.push(seed);
                    seed_signums.push(-1);
                    break;
            }
        }
        return {
            point_list: point_list,
            seed_signums: seed_signums,
        };
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