const glMatrix = require("gl-matrix");
const seedrandom = require("seedrandom");
const module_utility = require("./utility");
const rgbToHex = module_utility.rgbToHex;
const lerpHex = module_utility.lerpHex;
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

class UITransferFunctionColorPoint {
    constructor(ui_transfer_functions, index) {
        this.ui_transfer_functions = ui_transfer_functions;
        this.index = index;
        this.node = document.createElement("div");
        this.node.className = "horizontal_div_tranfer_function_color";

        this.node_label = document.createElement("label");
        this.node_label.innerHTML = index;
        this.node.appendChild(this.node_label);

        this.node_input_t = document.createElement("input");
        this.node_input_t.type = "text";
        this.node_input_t.value = "0.5";
        this.node.appendChild(this.node_input_t);

        this.node_input_c = document.createElement("input");
        this.node_input_c.type = "color";
        this.node_input_c.value = "#FFFFFF";
        this.node.appendChild(this.node_input_c);

        this.node_button = document.createElement("button");
        this.node_button.innerHTML = "x";
        this.node_button.type = "button";
        this.node_button.addEventListener("click", (event) => {
            console.log("this.index: ", event.target.id, this.index);
            this.ui_transfer_functions.removeColorPoint(this.index);
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
        this.node_input_c.value = split[1];
    }

    toString() {
        var s = this.node_input_t.value + "~"
            + this.node_input_c.value;
        return s;
    }

    UpdateDefaultValues(name) {
        this.node_input_t.defaultValue = this.node_input_t.value;
        this.node_input_c.defaultValue = this.node_input_c.value;

    }

    HasValueChanged(name) {
        if (this.node_input_t.defaultValue != this.node_input_t.value)
            return true;
        if (this.node_input_c.defaultValue != this.node_input_c.value)
            return true;
        return false;
    }
}

class UITransferFunctions {
    constructor() {
        this.changed_count = false;
        this.element_opacities = document.getElementById("container_transfer_function_opacities");
        this.element_colors = document.getElementById("container_transfer_function_colors");
        this.list_opacity = [];
        this.list_color = [];
        this.active_transfer_function_name = "Green Linear";
        this.active_transfer_function_index = 0;
    }

    addOpacityPoint() {
        var new_point = new UITransferFunctionOpacityPoint(this, this.list_opacity.length);
        this.list_opacity.push(new_point);
        this.element_opacities.appendChild(new_point.node);
        this.changed_count = true;
    }

    addOpacityPointAtIndex(index, t_x, t_y) {
        var new_point = new UITransferFunctionOpacityPoint(this, this.list_opacity.length);
        this.element_opacities.insertBefore(new_point.node, this.list_opacity[index].node);
        this.list_opacity.splice(index, 0, new_point);
        this.changed_count = true;
        for (var i = 0; i < this.list_opacity.length; i++) {
            this.list_opacity[i].updateIndex(i);
        }
        new_point.node_input_t.value = t_x;
        new_point.node_input_a.value = t_y;
        return new_point;
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

    addColorPoint() {
        var new_point = new UITransferFunctionColorPoint(this, this.list_color.length);
        this.list_color.push(new_point);
        this.element_colors.appendChild(new_point.node);
        this.changed_count = true;
    }

    addColorPointAtIndex(index, t_x) {
        var new_point = new UITransferFunctionColorPoint(this, this.list_color.length);
        this.element_colors.insertBefore(new_point.node, this.list_color[index].node);
        this.list_color.splice(index, 0, new_point);
        this.changed_count = true;
        for (var i = 0; i < this.list_color.length; i++) {
            this.list_color[i].updateIndex(i);
        }

        var point_l = this.list_color[index-1];
        var point_r = this.list_color[index+1];
        var t_l = point_l.node_input_t.value;
        var t_r = point_r.node_input_t.value;

        var t = (t_x - t_l) / (t_r - t_l);
        var c_l = point_l.node_input_c.value;
        var c_r = point_r.node_input_c.value;

        console.log("insert debug tl", t_l);
        console.log("insert debug tr", t_r);
        console.log("insert debug t", t);
        //var r = lerp(point_low.r, point_high.r, t);
        new_point.node_input_t.value = t_x;
        new_point.node_input_c.value = lerpHex(c_l, c_r, t);
        return new_point;
    }


    removeColorPoint(index) {
        console.log("removeColorPoint: ", index);
        var to_remove = this.list_color[index];
        this.element_colors.removeChild(to_remove.node);
        this.list_color.splice(index, 1);
        for (var i = 0; i < this.list_color.length; i++) {
            this.list_color[i].updateIndex(i);
        }
        this.changed_count = true;
    }

    toString() {
        var s = "";
        s += this.toStringOpacities(s);
        s += "_";
        s += this.toStringColors(s);
        console.log("DEBUG_MARKER H", s);
        return s;
    }

    toStringOpacities(s) {
        var s = "";
        for (var i = 0; i < this.list_opacity.length; i++) {
            if (i > 0)
                s += "!"
            s += this.list_opacity[i].toString();
            console.log("DEBUG_MARKER A");
        }
        return s;
    }

    toStringColors(s) {
        var s = "";
        for (var i = 0; i < this.list_color.length; i++) {
            if (i > 0)
                s += "!"
            s += this.list_color[i].toString();
            console.log("DEBUG_MARKER B");
        }
        return s;
    }

    fromString(s) {
        console.log("UITransferFunctions_fromString", s);
        console.log("DEBUG_MARKER F", s);
        if (s === null)
            return;
        if (!s.includes("_")) {
            return;
        }
        var split = s.split("_");
        var s_o = split[0];
        var s_c = split[1];
        console.log("DEBUG_MARKER s_o", s_o);
        console.log("DEBUG_MARKER s_c", s_c);
        for(var i=0; i<split.length; i++){
            console.log("DEBUG_MARKER", i, split[i]);
        }
        this.fromStringOpacities(s_o);
        this.fromStringColors(s_c);
    }

    fromStringOpacities(s) {
        console.log("fromStringOpacities");
        console.log("DEBUG_MARKER G", s);
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

    fromStringColors(s) {
        console.log("fromStringColors");
        console.log("DEBUG_MARKER H", s);
        if (s === null)
            return;
        if (!s.includes("!")) {
            return;
        }
        var split = s.split("!");

        while (split.length > this.list_color.length) {
            this.addColorPoint();
        }
        while (this.list_color.length > split.length) {
            this.removeColorPoint(this.list_color.length - 1);
        }

        for (var i = 0; i < split.length; i++) {
            console.log("i:", i, split[i]);
            this.list_color[i].fromString(split[i]);
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