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
        this.node.appendChild(this.node_input_x);

        this.node_input_y = document.createElement("input");
        this.node_input_y.type = "text";
        this.node_input_y.value = "0.5";
        this.node.appendChild(this.node_input_y);

        this.node_input_z = document.createElement("input");
        this.node_input_z.type = "text";
        this.node_input_z.value = "0.5";
        this.node.appendChild(this.node_input_z);

        this.node_input_c = document.createElement("input");
        this.node_input_c.type = "color";
        this.node_input_c.value = "#00FF00";
        this.node.appendChild(this.node_input_c);

        this.node_random = document.createElement("button");
        this.node_random.innerHTML = "r pos";
        this.node_random.type = "button";
        this.node_random.addEventListener("click", (event) => {
            console.log("this.index: ", event.target.id, this.index);
            this.randomizePosition();
        });
        this.node.appendChild(this.node_random);

        this.node_random_col = document.createElement("button");
        this.node_random_col.innerHTML = "r col";
        this.node_random_col.type = "button";
        this.node_random_col.addEventListener("click", (event) => {
            console.log("this.index: ", event.target.id, this.index);
            this.randomizeColor();
        });
        this.node.appendChild(this.node_random_col);

        this.node_button = document.createElement("button");
        this.node_button.innerHTML = "x";
        this.node_button.type = "button";
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
        if (name == CONST_GROUP_NAME_CALCULATE) {
            this.node_input_x.defaultValue = this.node_input_x.value;
            this.node_input_y.defaultValue = this.node_input_y.value;
            this.node_input_z.defaultValue = this.node_input_z.value;
        }
        else if (name == CONST_GROUP_NAME_RENDER_SETTINGS) {
            this.node_input_c.defaultValue = this.node_input_c.value;
        }
    }

    HasValueChanged(name) {
        if (name == CONST_GROUP_NAME_CALCULATE) {
            if (this.node_input_x.defaultValue != this.node_input_x.value)
                return true;
            if (this.node_input_y.defaultValue != this.node_input_y.value)
                return true;
            if (this.node_input_z.defaultValue != this.node_input_z.value)
                return true;
        }
        else if (name == CONST_GROUP_NAME_RENDER_SETTINGS) {
            if (this.node_input_c.defaultValue != this.node_input_c.value)
                return true;
        }
        return false;
    }
}

class UISeeds {
    constructor() {
        this.changed_count = false;
        this.element = document.getElementById("fieldset_seeds");
        this.list = [];
        this.rng_positions = new Math.seedrandom();
        //this.rng_positions_seed_string = 'hello.';
    }

    generateDefaultSeeds() {
        var count = 6;
        while (count > this.list.length) {
            this.addSeed();
        }
        while (this.list.length > count) {
            this.removeSeed(this.list.length - 1);
        }

        var i = 0;
        this.list[i].node_input_x.value = 0.01;
        this.list[i].node_input_y.value = 0.25;
        this.list[i].node_input_z.value = 0.25;
        this.list[i].node_input_c.value = "#FF0000";
        i += 1;
        this.list[i].node_input_x.value = 0.99;
        this.list[i].node_input_y.value = 0.25;
        this.list[i].node_input_z.value = 0.75;
        this.list[i].node_input_c.value = "#00FF00";
        i += 1;
        this.list[i].node_input_x.value = 0.55;
        this.list[i].node_input_y.value = 0.25;
        this.list[i].node_input_z.value = 0.5;
        this.list[i].node_input_c.value = "#0000FF";
        i += 1;
        this.list[i].node_input_x.value = 0.95;
        this.list[i].node_input_y.value = 0.25;
        this.list[i].node_input_z.value = 0.5;
        this.list[i].node_input_c.value = "#FFFF00";
        i += 1;
        this.list[i].node_input_x.value = 0.25;
        this.list[i].node_input_y.value = 0.25;
        this.list[i].node_input_z.value = 0.1;
        this.list[i].node_input_c.value = "#FF00FF";
        i += 1;
        this.list[i].node_input_x.value = 0.25;
        this.list[i].node_input_y.value = 0.25;
        this.list[i].node_input_z.value = 0.9;
        this.list[i].node_input_c.value = "#00FFFF";
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
        console.log("s:", s);
        if (s === null)
            return;
        if (!s.includes("!")) {
            return;
        }
        var split = s.split("!");

        while (split.length > this.list.length) {
            this.addSeed();
        }
        while (this.list.length > split.length) {
            this.removeSeed(this.list.length - 1);
        }

        for (var i = 0; i < split.length; i++) {
            console.log("i:", i, split[i]);
            this.list[i].fromString(split[i]);
        }
    }

    createPointList() {
        var point_list = [];
        for (var i = 0; i < this.list.length; i++) {
            var entry = this.list[i];
            var x = entry.node_input_x.value;
            var y = entry.node_input_y.value;
            var z = entry.node_input_z.value;
            var seed = glMatrix.vec4.fromValues(x, y, z, 1);
            point_list.push(seed);
        }
        return point_list;
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