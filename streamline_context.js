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

    SetupPartDefault(bo_calculate_streamlines){
        var part_index = PART_INDEX_DEFAULT;
        var generate_copies = true;
        var check_bounds = true;
        this.SetupPart(bo_calculate_streamlines, part_index, generate_copies, check_bounds);   
    }

    SetupPartOutside(bo_calculate_streamlines){
        var part_index = PART_INDEX_OUTSIDE;
        var generate_copies = false;
        var check_bounds = false;
        this.SetupPart(bo_calculate_streamlines, part_index, generate_copies, check_bounds);   
    }

    SetupPart(bo_calculate_streamlines, part_index, generate_copies, check_bounds){
        bo_calculate_streamlines.next_streamline_index = 0;
        bo_calculate_streamlines.part_index = part_index;
        bo_calculate_streamlines.generate_copies = generate_copies;
        this.streamline_generator.check_bounds = check_bounds;

        //references for better readability
        var termination_condition = bo_calculate_streamlines.input_parameters.termination_condition;
        var termination_advection_time = bo_calculate_streamlines.input_parameters.termination_advection_time;
        var termination_arc_length = bo_calculate_streamlines.input_parameters.termination_arc_length;
        var num_points_per_streamline = bo_calculate_streamlines.input_parameters.num_points_per_streamline;


        bo_calculate_streamlines.raw_data = this.GetRawData(bo_calculate_streamlines.part_index);

        this.ui_seeds.direction = bo_calculate_streamlines.input_parameters.direction;

        this.streamline_generator.termination_condition = termination_condition;
        this.streamline_generator.termination_advection_time = termination_advection_time;
        this.streamline_generator.termination_arc_length = termination_arc_length;
        this.streamline_generator.num_points_per_streamline = num_points_per_streamline;

        this.streamline_generator.termination_max_value = 
            termination_condition == STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME ? termination_advection_time
            : termination_condition == STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH ? termination_arc_length
            : (num_points_per_streamline-1);
    
        this.streamline_generator.streamline_error_counter = 0;
        this.streamline_generator.space = bo_calculate_streamlines.input_parameters.space;
        this.streamline_generator.direction = bo_calculate_streamlines.input_parameters.direction;
        this.streamline_generator.shader_formula_u = bo_calculate_streamlines.input_parameters.shader_formula_u;
        this.streamline_generator.shader_formula_v = bo_calculate_streamlines.input_parameters.shader_formula_v;
        this.streamline_generator.shader_formula_w = bo_calculate_streamlines.input_parameters.shader_formula_w;
        this.streamline_generator.shader_formula_a = bo_calculate_streamlines.input_parameters.shader_formula_a;
        this.streamline_generator.shader_formula_b = bo_calculate_streamlines.input_parameters.shader_formula_b;
        this.streamline_generator.shader_formula_p0 = bo_calculate_streamlines.input_parameters.shader_formula_p0;
        this.streamline_generator.shader_formula_p1 = bo_calculate_streamlines.input_parameters.shader_formula_p1;
        this.streamline_generator.shader_formula_p2 = bo_calculate_streamlines.input_parameters.shader_formula_p2;
        this.streamline_generator.shader_formula_p3 = bo_calculate_streamlines.input_parameters.shader_formula_p3;
        this.streamline_generator.shader_formula_d0 = bo_calculate_streamlines.input_parameters.shader_formula_d0;
        this.streamline_generator.shader_formula_d1 = bo_calculate_streamlines.input_parameters.shader_formula_d1;
        this.streamline_generator.shader_formula_d2 = bo_calculate_streamlines.input_parameters.shader_formula_d2;
        this.streamline_generator.shader_formula_d3 = bo_calculate_streamlines.input_parameters.shader_formula_d3;
        this.streamline_generator.step_size = bo_calculate_streamlines.input_parameters.step_size;
        this.streamline_generator.inbetweens = bo_calculate_streamlines.input_parameters.inbetweens;
        this.segment_duplicator.iterations = bo_calculate_streamlines.input_parameters.segment_duplicator_iterations;

        if(this.streamline_generator.space == SPACE_3_SPHERE_4_PLUS_4D){
            bo_calculate_streamlines.generate_copies = false;
        }

        this.streamline_generator.SetRulesTorus();
        this.streamline_generator.SetRules2Plus2D();
        this.streamline_generator.GenerateSeedsFromUI();

        //flag_calculate determines whether streamlines are calculated or cleared depending on the part index and the selected calculation method
        var flag_fundamental = bo_calculate_streamlines.input_parameters.streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_BOTH
            || bo_calculate_streamlines.input_parameters.streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_FUNDAMENTAL;
        var flag_r3 = bo_calculate_streamlines.input_parameters.streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_BOTH
            || bo_calculate_streamlines.input_parameters.streamline_calculation_method == STREAMLINE_CALCULATION_METHOD_R3;
        var flag_calculate = part_index == PART_INDEX_DEFAULT ? flag_fundamental : flag_r3;

        //tubeRadius depends on the part index
        this.streamline_generator.tubeRadius = part_index == PART_INDEX_DEFAULT ? bo_calculate_streamlines.input_parameters.tube_radius_fundamental
            : bo_calculate_streamlines.input_parameters.tube_radius_fundamental * bo_calculate_streamlines.input_parameters.max_radius_factor_highlight;

        if (flag_calculate) {
            //this.CalculateStreamlinesPart(PART_INDEX_DEFAULT, gl, gl_side, generate_copies);
            this.streamline_generator.SetupCalculateRawStreamlines(bo_calculate_streamlines);
        }
        else {
            this.ClearStreamlinesPart(bo_calculate_streamlines.part_index, bo_calculate_streamlines.gl, bo_calculate_streamlines.gl_side);
        }
    }

    ClearStreamlinesPart(part_index, gl, gl_side) {
        var raw_data = this.GetRawData(part_index);
        raw_data.initialize([], [], 0);
        //for all lods
        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].ResetPart(part_index);
            this.lod_list[i].CalculateBVH(part_index);
        }

        raw_data.GeneratePositionData(this.streamline_generator.termination_condition, this.streamline_generator.termination_max_value);

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].UpdateDataUnit();
            this.lod_list[i].UpdateDataTextures(gl, gl_side);
        }

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].LogState();
        }
    }

    FinishStreamlinesPart(bo_calculate_streamlines) {
        var part_index = bo_calculate_streamlines.part_index;
        var gl = bo_calculate_streamlines.gl;
        var gl_side = bo_calculate_streamlines.gl_side;
        var generate_copies = bo_calculate_streamlines.generate_copies;



        var raw_data = this.GetRawData(part_index);
        console.log("FinishStreamlinesPart");

        this.lod_0.ExtractMultiPolyLines(part_index);

        switch (this.streamline_generator.space) {
            case SPACE_3_TORUS:
                raw_data.MakeDataHomogenous();
                break;
            case SPACE_2_PLUS_2D:
                raw_data.CopyAngleIntoPosition();
                break;
            case SPACE_3_SPHERE_4_PLUS_4D:
                //do nothing
                break;
            default:
                console.log("Error unknonw space");
                debugger;
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
            this.lod_list[i].CalculateMatrices(part_index, this.streamline_generator.space);
            this.lod_list[i].CalculateBVH(part_index);
        }

        raw_data.GeneratePositionData(this.streamline_generator.termination_condition, this.streamline_generator.termination_max_value);

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