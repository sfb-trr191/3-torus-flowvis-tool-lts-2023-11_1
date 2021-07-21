const glMatrix = require("gl-matrix");
const module_utility = require("./utility");
const lerp = module_utility.lerp;
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, Cylinder } = require("./data_types");

const TRANSFER_FUNCTION_BINS = 512;

class TransferFunctionColorPoint {
    constructor(t, r, g, b) {
        this.t = t;
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

class TransferFunctionOpacityPoint {
    constructor(t, a) {
        this.t = t;
        this.a = a;
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

    addColorPoint(t, r, g, b) {
        this.list_color_points.push(new TransferFunctionColorPoint(t, r/255, g/255, b/255));
    }

    addOpacityPoint(t, a) {
        this.list_opacity_points.push(new TransferFunctionOpacityPoint(t, a/255));
    }

    fillBins() {
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
            c.opacity = opacity;
            this.list_colors.push(c);
            console.log(i, " t:", t, "color:", color, "opacity:", opacity);
        }
    }

    findIndexLow(t, list){
        for (var i = 0; i < list.length - 1; i++) {
            var low = list[i].t;
            var high = list[i+1].t;
            if(low == high)
                continue;
            if(t >= low && t <= high)
                return i;
        }
        return list.length - 1;
    }

    interpolateColor(index_low, index_high, t){
        var point_low = this.list_color_points[index_low];
        var point_high = this.list_color_points[index_high];
        var t = (t - point_low.t) / (point_high.t - point_low.t);
        var r = lerp(point_low.r, point_high.r, t);
        var g = lerp(point_low.g, point_high.g, t);
        var b = lerp(point_low.b, point_high.b, t);
        return glMatrix.vec3.fromValues(r,g,b);
    }

    interpolateOpacity(index_low, index_high, t){
        var point_low = this.list_opacity_points[index_low];
        var point_high = this.list_opacity_points[index_high];
        var t = (t - point_low.t) / (point_high.t - point_low.t);
        var a = lerp(point_low.a, point_high.a, t);
        return a;
    }
}

class TransferFunctionManager {

    constructor() {
        this.transfer_function_list = [];
        this.transfer_function_dict = {};
        this.concatenated_colors = [];
        this.active_transfer_function = "Green Linear";
        this.CreateDefaultTransferFunctions();
        this.Concatenate();
    }

    Concatenate(){
        this.concatenated_colors = [];
        for(var i=0; i<this.transfer_function_list.length; i++){
            this.concatenated_colors = this.concatenated_colors.concat(this.transfer_function_list[i].list_colors);
        }
        console.log("Concatenate ", this.concatenated_colors)
    }

    GetConcatenatedTransferfunctionColorList(){
        return this.concatenated_colors;
    }

    CreateDefaultTransferFunctions() {
        this.CreateGreenLinear();
        this.CreateCoolToWarm();
        this.CreateWhiteToBlue();
        this.CreateWhiteToRed();
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

    GetActiveTransferfunctionColorList(){
        return this.transfer_function_dict[this.active_transfer_function].list_colors;
    }
}

module.exports = TransferFunctionManager;