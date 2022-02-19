const RawData = require("./raw_data");
const StreamlineGenerator = require("./streamline_generator");
const SegmentDuplicator = require("./segment_duplicator");
const LODData = require("./lod_data");

class StreamlineContext {

    constructor(name, p_lights, ui_seeds, gl, gl_side) {
        console.log("Generate context: " + name);
        this.name = name;
        this.p_lights = p_lights;
        this.ui_seeds = ui_seeds;
        this.list_raw_data = [];
        for (var i = 0; i < NUMBER_OF_LOD_PARTS; i++) {
            this.list_raw_data.push(new RawData());
        }

        this.streamline_generator = new StreamlineGenerator(this);
        this.segment_duplicator = new SegmentDuplicator(this);
        //this.lod_0 = new LODData(name+"_lod_0", this, gl);
        this.lod_list = [];
        this.highest_active_lod_index = 3;//only indices 0 to highest_active_lod_index are calculated

        var num_lods = 4;
        //var douglasPeukerParameter = 0.0001;
        var douglasPeukerParameter = 0.0005;
        for (var i = 0; i < num_lods; i++) {
            var lod = new LODData(name + "_lod_" + i, this, gl, gl_side);
            this.lod_list.push(lod);
            if (i > 0) {
                lod.douglasPeukerParameter = douglasPeukerParameter;
                douglasPeukerParameter *= 5;
            }
        }
        this.lod_0 = this.lod_list[0];
    }

    GetRawData(part_index) {
        return this.list_raw_data[part_index];
    }

    CalculateExampleStreamlines(gl, gl_side) {
        console.log("CalculateExampleStreamlines");

        this.streamline_generator.direction = DIRECTION_FORWARD;
        this.streamline_generator.shader_formula_u = "2 * sin(2 * PI * z)";
        this.streamline_generator.shader_formula_v = "sin(2 * PI * y) + 2 * cos (2 * PI * z)";
        this.streamline_generator.shader_formula_w = "cos(2 * PI * x)";
        this.streamline_generator.num_points_per_streamline = 100;
        this.streamline_generator.num_points_per_streamline = 100;
        this.streamline_generator.step_size = 0.0125;

        this.streamline_generator.SetRulesTorus();
        this.streamline_generator.GenerateExampleSeeds();

        this.CalculateStreamlinesPart(PART_INDEX_DEFAULT, gl, gl_side);
    }

    CalculateStreamlines(gl, gl_side, space, streamline_calculation_method, shader_formula_u, shader_formula_v, shader_formula_w,
        shader_formula_a, shader_formula_b,
        input_num_points_per_streamline, step_size, segment_duplicator_iterations, direction,
        tube_radius_fundamental, max_radius_factor_highlight) {
        console.log("CalculateStreamlines");
        console.log("tube_radius_fundamental", tube_radius_fundamental)
        console.log("max_radius_factor_highlight", max_radius_factor_highlight)

        //this.streamline_generator.streamline_calculation_method = streamline_calculation_method;
        this.ui_seeds.direction = direction;
        
        this.streamline_generator.streamline_error_counter = 0;
        this.streamline_generator.space = space;
        this.streamline_generator.direction = direction;
        this.streamline_generator.shader_formula_u = shader_formula_u;
        this.streamline_generator.shader_formula_v = shader_formula_v;
        this.streamline_generator.shader_formula_w = shader_formula_w;
        this.streamline_generator.shader_formula_a = shader_formula_a;
        this.streamline_generator.shader_formula_b = shader_formula_b;
        this.streamline_generator.num_points_per_streamline = input_num_points_per_streamline;
        this.streamline_generator.step_size = step_size;
        this.segment_duplicator.iterations = segment_duplicator_iterations;

        this.streamline_generator.SetRulesTorus();
        this.streamline_generator.SetRules2Plus2D();
        this.streamline_generator.GenerateSeedsFromUI();

        var flag_fundamental = streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_BOTH
            || streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_FUNDAMENTAL;
        var flag_r3 = streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_BOTH
            || streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_R3;

        var generate_copies = true;
        this.streamline_generator.tubeRadius = tube_radius_fundamental;
        if (flag_fundamental) {
            this.streamline_generator.check_bounds = true;
            this.CalculateStreamlinesPart(PART_INDEX_DEFAULT, gl, gl_side, generate_copies);
        }
        else {
            this.ClearStreamlinesPart(PART_INDEX_DEFAULT, gl, gl_side);
        }

        var generate_copies = false;
        this.streamline_generator.tubeRadius = tube_radius_fundamental * max_radius_factor_highlight;
        if (flag_r3) {
            this.streamline_generator.check_bounds = false;
            this.CalculateStreamlinesPart(PART_INDEX_OUTSIDE, gl, gl_side, generate_copies);
        }
        else {
            this.ClearStreamlinesPart(PART_INDEX_OUTSIDE, gl, gl_side);
        }

    }

    ClearStreamlinesPart(part_index, gl, gl_side) {
        var raw_data = this.GetRawData(part_index);
        raw_data.initialize([], 0);
        //for all lods
        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].ResetPart(part_index);
            this.lod_list[i].CalculateBVH(part_index);
        }

        raw_data.GeneratePositionData();

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].UpdateDataUnit();
            this.lod_list[i].UpdateDataTextures(gl, gl_side);
        }

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].LogState();
        }
    }

    CalculateStreamlinesPart(part_index, gl, gl_side, generate_copies) {
        var raw_data = this.GetRawData(part_index);
        console.log("CalculateStreamlinesPart");

        this.streamline_generator.CalculateRawStreamlines(raw_data);
        this.lod_0.ExtractMultiPolyLines(part_index);

        switch (this.streamline_generator.space) {
            case SPACE_3_TORUS:
                raw_data.MakeDataHomogenous();
                break;
            case SPACE_2_PLUS_2D:
                raw_data.CopyAngleIntoPosition();
                break;
            default:
                console.log("Error unknonw space");
                break;
        }

        //reset all lods that are not calculated
        for (var i = this.highest_active_lod_index+1; i < this.lod_list.length; i++) {
            this.lod_list[i].ResetPart(part_index);
            this.lod_list[i].CalculateBVH(part_index);
        }        

        //simplify active lods except lod_0
        for (var i = 1; i <= this.highest_active_lod_index; i++) {
            this.lod_list[i].DouglasPeuker(part_index, this.lod_list[i - 1]);
        }

        for (var i = 0; i <= this.highest_active_lod_index; i++) {
            this.lod_list[i].GenerateLineSegments(part_index);
            if (generate_copies)
                this.lod_list[i].GenerateLineSegmentCopies(part_index);
            this.lod_list[i].CalculateMatrices(part_index);
            this.lod_list[i].CalculateBVH(part_index);
        }

        raw_data.GeneratePositionData();

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].UpdateDataUnit();
            this.lod_list[i].UpdateDataTextures(gl, gl_side);
        }

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].LogState();
        }
    }

    bind_lod(canvas_wrapper_name, lod_index, gl, shader_uniforms, location_texture_float, location_texture_int) {
        //console.log("bind_lod index: " + lod_index);
        this.lod_list[lod_index].bind(canvas_wrapper_name, gl, shader_uniforms, location_texture_float, location_texture_int);
    }



}

module.exports = StreamlineContext;