const glMatrix = require("gl-matrix");
const seedrandom = require("seedrandom");
const module_utility = require("./utility");
const rgbToHex = module_utility.rgbToHex;
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, Cylinder } = require("./data_types");

class UITransferFunctionOpacityPoint {
    constructor(ui_transfer_functions, index) {
        this.ui_transfer_functions = ui_transfer_functions;
        this.index = index;
        this.node = document.createElement("div");
        this.node.className = "horizontal_div_tranfer_function_opacity";

        this.node_label = document.createElement("label");
        this.node_label.innerHTML = index;
        this.node.appendChild(this.node_label);

        this.node_input_t = document.createElement("input");
        this.node_input_t.type = "text";
        this.node_input_t.value = "0.5";
        this.node.appendChild(this.node_input_t);

        this.node_input_a = document.createElement("input");
        this.node_input_a.type = "text";
        this.node_input_a.value = "0.5";
        this.node.appendChild(this.node_input_a);

        this.node_button = document.createElement("button");
        this.node_button.innerHTML = "x";
        this.node_button.type = "button";
        this.node_button.addEventListener("click", (event) => {
            console.log("this.index: ", event.target.id, this.index);
            this.ui_transfer_functions.removeOpacityPoint(this.index);
        });
        this.node.appendChild(this.node_button);
    }

    updateIndex(new_index) {
        this.index = new_index;
        this.node_label.innerHTML = new_index;
    }

    fromString(s) {
        var split = s.split("~");
        this.node_input_t.value = split[0];
        this.node_input_a.value = split[1];
    }

    toString() {
        var s = this.node_input_t.value + "~"
            + this.node_input_a.value;
        return s;
    }

    UpdateDefaultValues(name) {
        this.node_input_t.defaultValue = this.node_input_t.value;
        this.node_input_a.defaultValue = this.node_input_a.value;
        
    }

    HasValueChanged(name) {
        if (this.node_input_t.defaultValue != this.node_input_t.value)
            return true;
        if (this.node_input_a.defaultValue != this.node_input_a.value)
            return true;
        return false;
    }
}

class UITransferFunctions {
    constructor() {
        this.changed_count = false;
        this.element_opacities = document.getElementById("container_transfer_function_opacities");
        this.list_opacity = [];
        this.active_transfer_function_name = "Green Linear";
    }

    addOpacityPoint() {
        var new_point = new UITransferFunctionOpacityPoint(this, this.list_opacity.length);
        this.list_opacity.push(new_point);
        this.element_opacities.appendChild(new_point.node);
        this.changed_count = true;
    }

    removeOpacityPoint(index) {
        console.log("removeOpacityPoint: ", index);
        var to_remove = this.list_opacity[index];
        this.element_opacities.removeChild(to_remove.node);
        this.list_opacity.splice(index, 1);
        for (var i = 0; i < this.list_opacity.length; i++) {
            this.list_opacity[i].updateIndex(i);
        }
        this.changed_count = true;
    }

    toString() {
        var s = "";
        for (var i = 0; i < this.list_opacity.length; i++) {
            if (i > 0)
                s += "!"
            s += this.list_opacity[i].toString();
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

        while (split.length > this.list_opacity.length) {
            this.addOpacityPoint();
        }
        while (this.list_opacity.length > split.length) {
            this.removeOpacityPoint(this.list_opacity.length - 1);
        }

        for (var i = 0; i < split.length; i++) {
            console.log("i:", i, split[i]);
            this.list_opacity[i].fromString(split[i]);
        }
    }

    HasValueChanged(name) {
        var changed = this.changed_count;
        for (var i = 0; i < this.list_opacity.length; i++) {
            changed = changed || this.list_opacity[i].HasValueChanged(name);
        }
        return changed;
    }

    UpdateDefaultValues(name) {
        this.changed_count = false;
        for (var i = 0; i < this.list_opacity.length; i++) {
            this.list_opacity[i].UpdateDefaultValues(name);
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

module.exports = UITransferFunctions;