const glMatrix = require("gl-matrix");
const module_utility = require("./utility");
const rgbToHex = module_utility.rgbToHex;
const lerp = module_utility.lerp;
const LogToLinear = module_utility.LogToLinear;
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");
const BinaryArray = require("./binary_array");
const getStateDescription = require("./version").getStateDescription;

const TRANSFER_FUNCTION_BINS = 512;

class TransferFunctionColorPoint {
    constructor(t, r, g, b) {
        this.t = t;
        this.r = r;
        this.g = g;
        this.b = b;
    }

    writeToBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "color_point");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = this.getValueByName(list[i].name);
            var value_conversion = null;
            binary_array.writeValue(value, list[i].data_type, value_conversion);            
        }
    }

    readFromBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "color_point");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = binary_array.readValue(list[i].data_type);
            this.setValueByName(list[i].name, value);
        }
    }

    toString() {
        var r_int = Math.round(this.r * 255);
        var g_int = Math.round(this.g * 255);
        var b_int = Math.round(this.b * 255);

        var s = this.t + "~"
            + rgbToHex(r_int, g_int, b_int);
        return s;
    }

    fromString(s) {
        var split = s.split("~");
        this.t = split[0];

        var hex = split[1];
        this.r = parseInt(hex.substr(1, 2), 16) / 255
        this.g = parseInt(hex.substr(3, 2), 16) / 255
        this.b = parseInt(hex.substr(5, 2), 16) / 255
    }

    getValueByName(name){
        switch (name) {
            case "t":
                return this.t;
            case "color_r":
                return this.r;
            case "color_g":
                return this.g;
            case "color_b":
                return this.b;
            default:
                console.error("TransferFunctionColorPoint: getValueByName: Unknown name");
                return null;
        }
    }

    setValueByName(name, value){
        switch (name) {
            case "t":
                this.t = value;
                break;
            case "color_r":        
                this.r = value;
                break;
            case "color_g":     
                this.g = value;
                break;
            case "color_b":       
                this.b = value;
                break;
            default:
                console.error("TransferFunctionColorPoint: setValueByName: Unknown name");
                break;
        }
    }

}

class TransferFunctionOpacityPoint {
    constructor(t, a) {
        this.t = t;
        this.a = a;
    }

    writeToBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "opacity_point");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = this.getValueByName(list[i].name);
            var value_conversion = null;
            binary_array.writeValue(value, list[i].data_type, value_conversion);            
        }
    }

    readFromBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "opacity_point");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = binary_array.readValue(list[i].data_type);
            this.setValueByName(list[i].name, value);
        }
    }

    toString() {
        var s = this.t + "~"
            + this.a;
        return s;
    }

    fromString(s) {
        var split = s.split("~");
        this.t = split[0];
        this.a = split[1];
    }

    getValueByName(name){
        switch (name) {
            case "t":
                return this.t;
            case "a":
                return this.a;
            default:
                console.error("TransferFunctionOpacityPoint: getValueByName: Unknown name");
                return null;
        }
    }

    setValueByName(name, value){
        switch (name) {
            case "t":
                this.t = value;
                break;
            case "a":        
                this.a = value;
                break;
            default:
                console.error("TransferFunctionOpacityPoint: setValueByName: Unknown name");
                break;
        }
    }


}

class TransferFunction {

    constructor(name, bin_count) {
        this.name = name;
        this.bin_count = bin_count;//size of list_colors
        this.list_color_points = [];//TransferFunctionColorPoint
        this.list_opacity_points = [];//TransferFunctionOpacityPoint
        this.list_colors = [];//StreamlineColor
    }

    writeToBinaryArray(binary_array){
        binary_array.writeUint16(this.list_opacity_points.length);
        for (var i = 0; i < this.list_opacity_points.length; i++) {
            this.list_opacity_points[i].writeToBinaryArray(binary_array);
        }
        binary_array.writeUint16(this.list_color_points.length);
        for (var i = 0; i < this.list_color_points.length; i++) {
            this.list_color_points[i].writeToBinaryArray(binary_array);
        }
    }

    readFromBinaryArray(binary_array){
        this.readOpacitiesFromBinaryArray(binary_array);
        this.readColorsFromBinaryArray(binary_array);
        this.fillBins();
    }

    readOpacitiesFromBinaryArray(binary_array){
        var list_length = binary_array.readUint16();
        while (list_length > this.list_opacity_points.length) {
            this.addOpacityPoint(0, 0);
        }
        while (this.list_opacity_points.length > list_length) {
            this.removeLastOpacityPoint();
        }
        for (var i = 0; i < list_length; i++) {
            this.list_opacity_points[i].readFromBinaryArray(binary_array);
        }
    }

    readColorsFromBinaryArray(binary_array){
        var list_length = binary_array.readUint16();
        while (list_length > this.list_color_points.length) {
            this.addColorPoint(0, 0);
        }
        while (this.list_color_points.length > list_length) {
            this.removeLastColorPoint();
        }
        for (var i = 0; i < list_length; i++) {
            this.list_color_points[i].readFromBinaryArray(binary_array);
        }
    }

    toString() {
        var s = "";
        s += this.toStringOpacities(s);
        s += "_";
        s += this.toStringColors(s);
        console.log("DEBUG_MARKER E", s);
        return s;
    }

    toStringOpacities(s) {
        var s = "";
        for (var i = 0; i < this.list_opacity_points.length; i++) {
            if (i > 0)
                s += "!"
            s += this.list_opacity_points[i].toString();
        }
        console.log("DEBUG_MARKER C", s);
        return s;
    }

    toStringColors(s) {
        var s = "";
        for (var i = 0; i < this.list_color_points.length; i++) {
            if (i > 0)
                s += "!"
            s += this.list_color_points[i].toString();
        }
        console.log("DEBUG_MARKER D", s);
        return s;
    }

    fromString(s) {
        console.log("fromString");
        console.log("s:", s);
        if (s === null)
            return;
        if (!s.includes("_")) {
            return;
        }
        var split = s.split("_");
        var s_o = split[0];
        var s_c = split[1];
        this.fromStringOpacities(s_o);
        this.fromStringColors(s_c);
    }

    fromStringOpacities(s) {
        console.log("fromStringOpacities");
        console.log("s:", s);
        if (s === null)
            return;
        if (!s.includes("!")) {
            return;
        }
        var split = s.split("!");

        while (split.length > this.list_opacity_points.length) {
            this.addOpacityPoint(0, 0);
        }
        while (this.list_opacity_points.length > split.length) {
            this.removeLastOpacityPoint();
        }

        for (var i = 0; i < split.length; i++) {
            console.log("i:", i, split[i]);
            this.list_opacity_points[i].fromString(split[i]);
        }

        this.fillBins();
    }

    fromStringColors(s) {
        console.log("fromStringColors");
        console.log("s:", s);
        if (s === null)
            return;
        if (!s.includes("!")) {
            return;
        }
        var split = s.split("!");

        while (split.length > this.list_color_points.length) {
            this.addColorPoint(0, 0);
        }
        while (this.list_color_points.length > split.length) {
            this.removeLastColorPoint();
        }

        for (var i = 0; i < split.length; i++) {
            console.log("i:", i, split[i]);
            this.list_color_points[i].fromString(split[i]);
        }

        this.fillBins();
    }

    addOpacityPoint(t, a) {
        this.list_opacity_points.push(new TransferFunctionOpacityPoint(t, a / 255));
    }

    addColorPoint(t, r, g, b) {
        this.list_color_points.push(new TransferFunctionColorPoint(t, r / 255, g / 255, b / 255));
    }

    addColorPointF(t, r, g, b) {
        this.list_color_points.push(new TransferFunctionColorPoint(t, r, g, b));
    }

    removeLastOpacityPoint() {
        console.log("removeLastOpacityPoint");
        this.list_opacity_points.pop();
    }

    removeLastColorPoint() {
        console.log("removeLastColorPoint");
        this.list_color_points.pop();
    }

    fillBins() {        
        var use_log_scale = document.getElementById("checkbox_transfer_function_log_scale").checked;
        var log_scale_d = parseFloat(document.getElementById("input_transfer_function_log_scale_d").value);        
        this.list_colors = [];
        for (var i = 0; i < this.bin_count; i++) {
            var t = i / (this.bin_count - 1);
            var index_low = this.findIndexLow(t, this.list_color_points);
            var index_high = index_low + 1;
            var color = this.interpolateColor(index_low, index_high, t);
            var index_low = this.findIndexLow(t, this.list_opacity_points);
            var index_high = index_low + 1;
            var opacity = this.interpolateOpacity(index_low, index_high, t);
            var c = new StreamlineColor();
            c.color = color;
            c.opacity = use_log_scale ? LogToLinear(opacity, log_scale_d) : opacity;
            this.list_colors.push(c);
            //console.log(i, " t:", t, "color:", color, "opacity:", opacity);
        }
    }

    findIndexLow(t, list) {
        for (var i = 0; i < list.length - 1; i++) {
            var low = list[i].t;
            var high = list[i + 1].t;
            if (low == high)
                continue;
            if (t >= low && t <= high)
                return i;
        }
        return list.length - 2;
    }

    interpolateColor(index_low, index_high, t) {
        var point_low = this.list_color_points[index_low];
        var point_high = this.list_color_points[index_high];
        var t = (t - point_low.t) / (point_high.t - point_low.t);
        var r = lerp(point_low.r, point_high.r, t);
        var g = lerp(point_low.g, point_high.g, t);
        var b = lerp(point_low.b, point_high.b, t);
        return glMatrix.vec3.fromValues(r, g, b);
    }

    interpolateOpacity(index_low, index_high, t) {
        var point_low = this.list_opacity_points[index_low];
        var point_high = this.list_opacity_points[index_high];
        var t = (t - point_low.t) / (point_high.t - point_low.t);
        var a = lerp(point_low.a, point_high.a, t);
        return a;
    }
}

class TransferFunctionManager {

    constructor(p_ui_transfer_functions) {
        this.p_ui_transfer_functions = p_ui_transfer_functions;
        this.transfer_function_list = [];
        this.transfer_function_dict = {};
        this.concatenated_colors = [];
        this.CreateDefaultTransferFunctions();
        this.Concatenate();
        this.UpdateToUI(0);
        this.dirty = false;
    }

    toSpecialData(){          
        //getStateDescriptionDict(STATE_VERSION);
        
        var binary_array = new BinaryArray();
        binary_array.writeUint16(this.transfer_function_list.length);
        for (var i = 0; i < this.transfer_function_list.length; i++) {
            this.transfer_function_list[i].writeToBinaryArray(binary_array);   
        }
        binary_array.resizeToContent();
        console.log(binary_array);
        window["special_data_transfer_function_manager"] = binary_array;  
    }

    fromSpecialData() {
        var binary_array = window["special_data_transfer_function_manager"];
        binary_array.begin();
        var list_length = binary_array.readUint16();
        for(var i=0; i<list_length; i++){
            this.transfer_function_list[i].readFromBinaryArray(binary_array);
        }
    }

    fromString(s) {
        console.log("from string TransferFunctionManager ", s);
        if (s === null)
            return;
        console.log("TransferFunctionManager not null");
        if (!s.includes("|"))
            return;
        console.log("TransferFunctionManager contains |");
        var split = s.split("|");
        for (var i = 0; i < split.length; i++) {
            var s_i = split[i];
            console.log("s_i", s_i);
            this.transfer_function_list[i].fromString(s_i);
        }
    }

    toString() {
        console.log("to string TransferFunctionManager");
        var s = "";
        for (var i = 0; i < this.transfer_function_list.length; i++) {
            if(i>0)
                s += "|"
            var s_i = this.transfer_function_list[i].toString();
            console.log("s_i", s_i);
            s += s_i
        }
        console.log("s", s);
        return s;
    }

    UpdateToUI(index) {
        console.log(index);
        var s = this.transfer_function_list[index].toString();
        console.log("UpdateToUI: ", s);
        this.p_ui_transfer_functions.active_transfer_function_index = index;
        //this.p_ui_transfer_functions.active_transfer_function_name;        
        this.p_ui_transfer_functions.fromString(s);
    }

    UpdateFromUI() {
        var index = this.p_ui_transfer_functions.active_transfer_function_index;
        this.transfer_function_list[index].fromString(this.p_ui_transfer_functions.toString());
        this.Concatenate();
    }

    Concatenate() {
        this.concatenated_colors = [];
        for (var i = 0; i < this.transfer_function_list.length; i++) {
            this.concatenated_colors = this.concatenated_colors.concat(this.transfer_function_list[i].list_colors);
        }
        //console.log("Concatenate ", this.concatenated_colors)
    }

    GetConcatenatedTransferfunctionColorList() {
        return this.concatenated_colors;
    }

    CreateDefaultTransferFunctions() {
        this.CreateBlackBodyRadiation();    //0
        this.CreateGreenLinear();           //1
        this.CreateCoolToWarm();            //2
        this.CreateWhiteToBlue();           //3
        this.CreateWhiteToRed();            //4
    }

    CreateBlackBodyRadiation() {
        var transfer_function = new TransferFunction("Black Body Radiation", TRANSFER_FUNCTION_BINS);
        this.transfer_function_dict[transfer_function.name] = transfer_function;
        this.transfer_function_list.push(transfer_function);

        transfer_function.addColorPoint(0.00, 0, 0, 0);
        transfer_function.addColorPoint(0.40, 230, 0, 0);
        transfer_function.addColorPoint(0.80, 230, 230, 0);
        transfer_function.addColorPoint(1.00, 255, 255, 255);

        transfer_function.addOpacityPoint(0.00, 0);
        transfer_function.addOpacityPoint(1.00, 255);

        transfer_function.fillBins();
    }

    CreateGreenLinear() {
        var transfer_function = new TransferFunction("Green Linear", TRANSFER_FUNCTION_BINS);
        this.transfer_function_dict[transfer_function.name] = transfer_function;
        this.transfer_function_list.push(transfer_function);

        transfer_function.addColorPoint(0.00, 255, 252, 247);
        transfer_function.addColorPoint(0.11, 241, 228, 162);
        transfer_function.addColorPoint(0.22, 204, 216, 119);
        transfer_function.addColorPoint(0.35, 91, 185, 87);
        transfer_function.addColorPoint(0.61, 36, 130, 140);
        transfer_function.addColorPoint(0.75, 30, 80, 133);
        transfer_function.addColorPoint(0.94, 49, 42, 120);
        transfer_function.addColorPoint(1.00, 66, 50, 112);

        transfer_function.addOpacityPoint(0.00, 0);
        //transfer_function.addOpacityPoint(0.90, 0);
        //transfer_function.addOpacityPoint(0.90, 255);
        transfer_function.addOpacityPoint(1.00, 255);

        transfer_function.fillBins();
    }

    CreateCoolToWarm() {
        var transfer_function = new TransferFunction("Cool to Warm", TRANSFER_FUNCTION_BINS);
        this.transfer_function_dict[transfer_function.name] = transfer_function;
        this.transfer_function_list.push(transfer_function);

        //transfer_function.addColorPointF(0.00, 0.231373, 0.298039, 0.752941);
        //transfer_function.addColorPointF(0.50, 0.865003, 0.865003, 0.865003);
        //transfer_function.addColorPointF(1.00, 0.705882, 0.0156863, 0.14902);
        transfer_function.addColorPoint(0.00, 0, 0, 255);
        transfer_function.addColorPoint(0.5, 255, 255, 255);
        transfer_function.addColorPoint(1.00, 255, 0, 0);

        transfer_function.addOpacityPoint(0.00, 0);
        transfer_function.addOpacityPoint(1.00, 255);

        transfer_function.fillBins();
    }

    CreateWhiteToBlue() {
        var transfer_function = new TransferFunction("White to Blue", TRANSFER_FUNCTION_BINS);
        this.transfer_function_dict[transfer_function.name] = transfer_function;
        this.transfer_function_list.push(transfer_function);

        transfer_function.addColorPoint(0.00, 255, 255, 255);
        transfer_function.addColorPoint(1.00, 0, 0, 255);

        transfer_function.addOpacityPoint(0.00, 0);
        transfer_function.addOpacityPoint(1.00, 255);

        transfer_function.fillBins();
    }

    CreateWhiteToRed() {
        var transfer_function = new TransferFunction("White to Red", TRANSFER_FUNCTION_BINS);
        this.transfer_function_dict[transfer_function.name] = transfer_function;
        this.transfer_function_list.push(transfer_function);

        transfer_function.addColorPoint(0.00, 255, 255, 255);
        transfer_function.addColorPoint(1.00, 255, 0, 0);

        transfer_function.addOpacityPoint(0.00, 0);
        transfer_function.addOpacityPoint(1.00, 255);

        transfer_function.fillBins();
    }

    /*
    GetActiveTransferfunctionColorList(){
        return this.transfer_function_dict[this.active_transfer_function].list_colors;
    }
    */
}

module.exports = TransferFunctionManager;