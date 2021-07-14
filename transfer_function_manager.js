const glMatrix = require("gl-matrix");
const module_utility = require("./utility");
const lerp = module_utility.lerp;
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, Cylinder } = require("./data_types");

const TRANSFER_FUNCTION_BINS = 512;

class TransferFunctionPoint {
    constructor(t, r, g, b) {
        this.t = t;
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

class TransferFunction {

    constructor(name, bin_count) {
        this.name = name;
        this.bin_count = bin_count;//size of list_colors
        this.list_points = [];//TransferFunctionPoint
        this.list_colors = [];//StreamlineColor
    }

    addPoint(t, r, g, b) {
        this.list_points.push(new TransferFunctionPoint(t, r/255, g/255, b/255));
    }

    fillBins() {
        this.list_colors = [];
        for (var i = 0; i < this.bin_count; i++) {
            var t = i / (this.bin_count - 1);
            var index_low = this.findIndexLow(t);
            var index_high = index_low + 1;
            var color = this.interpolateColor(index_low, index_high, t);
            var c = new StreamlineColor();
            c.color = color;
            this.list_colors.push(c);
            console.log(i, " t:", t, "color:", color);
        }
    }

    findIndexLow(t){
        for (var i = 0; i < this.list_points.length - 1; i++) {
            var low = this.list_points[i].t;
            var high = this.list_points[i+1].t;
            if(t >= low && t <= high)
                return i;
        }
        return this.list_points.length - 1;
    }

    interpolateColor(index_low, index_high, t){
        var point_low = this.list_points[index_low];
        var point_high = this.list_points[index_high];
        var t = (t - point_low.t) / (point_high.t - point_low.t);
        var r = lerp(point_low.r, point_high.r, t);
        var g = lerp(point_low.g, point_high.g, t);
        var b = lerp(point_low.b, point_high.b, t);
        return glMatrix.vec3.fromValues(r,g,b);
    }
}

class TransferFunctionManager {

    constructor() {
        this.transfer_functions = {};
        this.active_transfer_function = "Green Linear";
        this.CreateDefaultTransferFunctions();
    }

    CreateDefaultTransferFunctions() {
        this.CreateGreenLinear();
    }

    CreateGreenLinear() {
        var transfer_function = new TransferFunction("Green Linear", TRANSFER_FUNCTION_BINS);
        this.transfer_functions[transfer_function.name] = transfer_function;

        transfer_function.addPoint(0.00, 255, 252, 247);
        transfer_function.addPoint(0.11, 241, 228, 162);
        transfer_function.addPoint(0.22, 204, 216, 119);
        transfer_function.addPoint(0.35, 91, 185, 87);
        transfer_function.addPoint(0.61, 36, 130, 140);
        transfer_function.addPoint(0.75, 30, 80, 133);
        transfer_function.addPoint(0.94, 49, 42, 120);
        transfer_function.addPoint(1.00, 66, 50, 112);

        transfer_function.fillBins();
    }

    GetActiveTransferfunctionColorList(){
        return this.transfer_functions[this.active_transfer_function].list_colors;
    }
}

module.exports = TransferFunctionManager;