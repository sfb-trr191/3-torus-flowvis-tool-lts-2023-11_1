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

        this.node_button = document.createElement("button");
        this.node_button.innerHTML = "x";
        this.node_button.type = "button";
        //node_button.id = "button_remove_seed_" + index;
        //node_button.addEventListener("click", function (e, seed) {
        //    console.log("this.index: ", e.target.id, seed.index);
        //});

        this.node_button.addEventListener("click", (event) => {
            console.log("this.index: ", event.target.id, this.index);
            this.ui_seeds.removeSeed(this.index);
        });

        this.node.appendChild(this.node_button);
    }

    updateIndex(new_index) {
        this.index = new_index;
        this.node_label.innerHTML = new_index;
    }

    randomizePosition() {
        this.node_input_x.value = this.ui_seeds.rng_positions();
        this.node_input_y.value = this.ui_seeds.rng_positions();
        this.node_input_z.value = this.ui_seeds.rng_positions();
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
}

class UISeeds {
    constructor() {
        this.element = document.getElementById("fieldset_seeds");
        this.list = [];
        this.rng_positions = new Math.seedrandom('hello.');
        this.rng_positions_seed_string = 'hello.';
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
    }

    removeSeed(index) {
        console.log("removeSeed: ", index);
        var to_remove = this.list[index];
        this.element.removeChild(to_remove.node);
        this.list.splice(index, 1);
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].updateIndex(i);
        }
    }

    randomizePosition(seed_string) {
        this.rng_positions = new Math.seedrandom(seed_string);
        this.rng_positions_seed_string = seed_string;
        for (var i = 0; i < this.list.length; i++) {
            this.list[i].randomizePosition(i);
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