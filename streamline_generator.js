const glMatrix = require("gl-matrix");
const RawDataEntry = require("./raw_data_entry");
const math = require("mathjs");
const module_utility = require("./utility");
const GetFormula = module_utility.GetFormula;
const GetFormulaFloat = module_utility.GetFormulaFloat;
const stepVec3 = module_utility.stepVec3;
const clampVec3 = module_utility.clampVec3;

class StreamlineGenerator {

    constructor(p_streamline_context) {
        this.p_streamline_context = p_streamline_context;
        this.p_ui_seeds = p_streamline_context.ui_seeds;
        this.p_dynamic_streamline = p_streamline_context.dynamic_streamline;
        this.seeds = [];
        this.num_points_per_streamline = 10;
        this.step_size = 0.0125;
        this.inbetweens = 0;
        this.epsilon_move_just_outside_cube = 0.00001;
        this.confine_to_cube = false;
        this.check_bounds = true;
        this.continue_at_bounds = true;
        this.tubeRadius = 0.005;

        this.streamline_error_counter = 0;
        this.termination_condition = STREAMLINE_TERMINATION_CONDITION_POINTS;
        this.termination_advection_time = 0;
        this.termination_arc_length = 0;
    }

    GenerateExampleSeeds() {
        console.log("GenerateExampleSeeds");
        this.seeds = [];

        var seed = glMatrix.vec4.fromValues(0.01, 0.25, 0.25, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.99, 0.25, 0.75, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.55, 0.25, 0.5, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.95, 0.25, 0.5, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.25, 0.25, 0.1, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.25, 0.25, 0.9, 1);
        this.seeds.push(seed);
    }

    GenerateSeedsFromUI(name) {
        //console.warn("GenerateSeedsFromUI", name);
        if(name == "static"){
            this.p_ui_seeds.correctSeeds(this.space);
            this.p_ui_seeds.createPointList(this.space);
            this.seeds = this.p_ui_seeds.seed_positions;
            this.seed_directions = this.p_ui_seeds.seed_directions;
            this.seed_signums = this.p_ui_seeds.seed_signums;
        }else{
            this.p_dynamic_streamline.fromUI();
            this.seeds = [
                this.p_dynamic_streamline.position, 
                this.p_dynamic_streamline.position];
            this.seed_directions = [DIRECTION_BOTH, DIRECTION_BOTH];
            this.seed_signums = [1, -1];
        }
        //console.log("seeds");
        //console.warn(this.seeds);
        //console.warn(this.seed_directions);
        //console.warn(this.seed_signums);
    }    

    SetRulesTorus() {
        //MARKER_RENAME_SYMBOLS todo RULE
        /*
        console.log("SetRulesTorus");
        //rules
        this.shader_rule_x_pos_x = "x-1";	//if x>1 : x=___
        this.shader_rule_x_pos_y = "y";		//if x>1 : y=___
        this.shader_rule_x_pos_z = "z";	    //if x>1 : z=___

        this.shader_rule_y_pos_x = "x";	    //if y>1 : x=___
        this.shader_rule_y_pos_y = "y-1";	//if y>1 : y=___
        this.shader_rule_y_pos_z = "z";	    //if y>1 : z=___

        this.shader_rule_z_pos_x = "x";	    //if z>1 : x=___
        this.shader_rule_z_pos_y = "y";	    //if z>1 : y=___
        this.shader_rule_z_pos_z = "z-1";	//if z>1 : z=___

        //inverted rules
        this.shader_rule_x_neg_x = "x+1";	//if x>1 : x=___
        this.shader_rule_x_neg_y = "y";		//if x>1 : y=___
        this.shader_rule_x_neg_z = "z";	    //if x>1 : z=___

        this.shader_rule_y_neg_x = "x";	    //if y>1 : x=___
        this.shader_rule_y_neg_y = "y+1";	//if y>1 : y=___
        this.shader_rule_y_neg_z = "z";	    //if y>1 : z=___

        this.shader_rule_z_neg_x = "x";	    //if z>1 : x=___
        this.shader_rule_z_neg_y = "y";	    //if z>1 : y=___
        this.shader_rule_z_neg_z = "z+1";	//if z>1 : z=___
        */
    }

    SetRules2Plus2D(){
        //MARKER_RENAME_SYMBOLS todo RULE
        /*
        //rules
        this.shader_rule_x_pos_x = "x-1";	        //if x>1 : x=___
        this.shader_rule_x_pos_y = "y";		        //if x>1 : y=___
        this.shader_rule_x_pos_v_x = "v_x";	        //if x>1 : v_x=___
        this.shader_rule_x_pos_v_y = "v_y";	        //if x>1 : v_y=___

        this.shader_rule_y_pos_x = "x";	            //if y>1 : x=___
        this.shader_rule_y_pos_y = "y-1";		    //if y>1 : y=___
        this.shader_rule_y_pos_v_x = "v_x";	        //if y>1 : v_x=___
        this.shader_rule_y_pos_v_y = "v_y";	        //if y>1 : v_y=___

        this.shader_rule_v_x_pos_x = "x";	        //if v_x>1 : x=___
        this.shader_rule_v_x_pos_y = "y";		    //if v_x>1 : y=___
        this.shader_rule_v_x_pos_v_x = "v_x-1";	    //if v_x>1 : v_x=___
        this.shader_rule_v_x_pos_v_y = "v_y";	    //if v_x>1 : v_y=___

        this.shader_rule_v_y_pos_x = "x";	        //if v_y>1 : x=___
        this.shader_rule_v_y_pos_y = "y";		    //if v_y>1 : y=___
        this.shader_rule_v_y_pos_v_x = "v_x";	    //if v_y>1 : v_x=___
        this.shader_rule_v_y_pos_v_y = "v_y-1";	    //if v_y>1 : v_y=___

        //inverted rules
        this.shader_rule_x_neg_x = "x+1";	        //if x<1 : x=___
        this.shader_rule_x_neg_y = "y";		        //if x<1 : y=___
        this.shader_rule_x_neg_v_x = "v_x";	        //if x<1 : v_x=___
        this.shader_rule_x_neg_v_y = "v_y";	        //if x<1 : v_y=___

        this.shader_rule_y_neg_x = "x";	            //if y<1 : x=___
        this.shader_rule_y_neg_y = "y+1";		    //if y<1 : y=___
        this.shader_rule_y_neg_v_x = "v_x";	        //if y<1 : v_x=___
        this.shader_rule_y_neg_v_y = "v_y";	        //if y<1 : v_y=___

        this.shader_rule_v_x_neg_x = "x";	        //if v_x<1 : x=___
        this.shader_rule_v_x_neg_y = "y";		    //if v_x<1 : y=___
        this.shader_rule_v_x_neg_v_x = "v_x+1";	    //if v_x<1 : v_x=___
        this.shader_rule_v_x_neg_v_y = "v_y";	    //if v_x<1 : v_y=___

        this.shader_rule_v_y_neg_x = "x";	        //if v_y<1 : x=___
        this.shader_rule_v_y_neg_y = "y";		    //if v_y<1 : y=___
        this.shader_rule_v_y_neg_v_x = "v_x";	    //if v_y<1 : v_x=___
        this.shader_rule_v_y_neg_v_y = "v_y+1";	    //if v_y<1 : v_y=___
        */
    }

    SetRulesFromUI_xyz(){
        //MARKER_RENAME_SYMBOLS todo RULE
        this.shader_rule_x_pos_x = GetFormula("input_field_shader_rule_x_pos_x");
        this.shader_rule_x_pos_y = GetFormula("input_field_shader_rule_x_pos_y");
        this.shader_rule_x_pos_z = GetFormula("input_field_shader_rule_x_pos_z");
        this.shader_rule_x_neg_x = GetFormula("input_field_shader_rule_x_neg_x");
        this.shader_rule_x_neg_y = GetFormula("input_field_shader_rule_x_neg_y");
        this.shader_rule_x_neg_z = GetFormula("input_field_shader_rule_x_neg_z");

        this.shader_rule_y_pos_x = GetFormula("input_field_shader_rule_y_pos_x");
        this.shader_rule_y_pos_y = GetFormula("input_field_shader_rule_y_pos_y");
        this.shader_rule_y_pos_z = GetFormula("input_field_shader_rule_y_pos_z");
        this.shader_rule_y_neg_x = GetFormula("input_field_shader_rule_y_neg_x");
        this.shader_rule_y_neg_y = GetFormula("input_field_shader_rule_y_neg_y");
        this.shader_rule_y_neg_z = GetFormula("input_field_shader_rule_y_neg_z");

        this.shader_rule_z_pos_x = GetFormula("input_field_shader_rule_z_pos_x");
        this.shader_rule_z_pos_y = GetFormula("input_field_shader_rule_z_pos_y");
        this.shader_rule_z_pos_z = GetFormula("input_field_shader_rule_z_pos_z");
        this.shader_rule_z_neg_x = GetFormula("input_field_shader_rule_z_neg_x");
        this.shader_rule_z_neg_y = GetFormula("input_field_shader_rule_z_neg_y");
        this.shader_rule_z_neg_z = GetFormula("input_field_shader_rule_z_neg_z");


        this.shader_rule_x_pos_u = GetFormula("input_field_shader_rule_x_pos_u");
        this.shader_rule_x_pos_v = GetFormula("input_field_shader_rule_x_pos_v");
        this.shader_rule_x_pos_w = GetFormula("input_field_shader_rule_x_pos_w");
        this.shader_rule_x_neg_u = GetFormula("input_field_shader_rule_x_neg_u");
        this.shader_rule_x_neg_v = GetFormula("input_field_shader_rule_x_neg_v");
        this.shader_rule_x_neg_w = GetFormula("input_field_shader_rule_x_neg_w");

        this.shader_rule_y_pos_u = GetFormula("input_field_shader_rule_y_pos_u");
        this.shader_rule_y_pos_v = GetFormula("input_field_shader_rule_y_pos_v");
        this.shader_rule_y_pos_w = GetFormula("input_field_shader_rule_y_pos_w");
        this.shader_rule_y_neg_u = GetFormula("input_field_shader_rule_y_neg_u");
        this.shader_rule_y_neg_v = GetFormula("input_field_shader_rule_y_neg_v");
        this.shader_rule_y_neg_w = GetFormula("input_field_shader_rule_y_neg_w");

        this.shader_rule_z_pos_u = GetFormula("input_field_shader_rule_z_pos_u");
        this.shader_rule_z_pos_v = GetFormula("input_field_shader_rule_z_pos_v");
        this.shader_rule_z_pos_w = GetFormula("input_field_shader_rule_z_pos_w");
        this.shader_rule_z_neg_u = GetFormula("input_field_shader_rule_z_neg_u");
        this.shader_rule_z_neg_v = GetFormula("input_field_shader_rule_z_neg_v");
        this.shader_rule_z_neg_w = GetFormula("input_field_shader_rule_z_neg_w");
    }

    SetupCalculateRawStreamlines(bo_calculate_streamlines){
        bo_calculate_streamlines.raw_data.initialize(this.seeds, this.seed_signums, this.num_points_per_streamline);
        bo_calculate_streamlines.next_streamline_index = 0;
    }

    SetupNextStreamline(bo_calculate_streamlines){
        bo_calculate_streamlines.current_streamline.finished = false;
        switch (this.space) {
            case SPACE_3_TORUS:
                this.SetupStreamline3Torus(bo_calculate_streamlines);
                break;
            case SPACE_2_PLUS_2D:
                this.SetupStreamline2Plus2D(bo_calculate_streamlines);
                break;
            case SPACE_2_SPHERE_3_PLUS_3D:
                this.SetupStreamline2Sphere3Plus3D(bo_calculate_streamlines);
                break;
            case SPACE_3_SPHERE_4_PLUS_4D:
                this.SetupStreamline3Sphere4Plus4D(bo_calculate_streamlines);
                break;
            default:
                console.log("Error unknonw space");
                break;
        }
    }

    SetupStreamline3Torus(bo_calculate_streamlines) {
        var seed_index = bo_calculate_streamlines.next_streamline_index;
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        console.log("#SC: SetupStreamline3Torus: ", seed_index);


        var startIndex = raw_data.data.length;//seed_index * this.num_points_per_streamline;

        //push seed
        var new_entry = new RawDataEntry();
        raw_data.data.push(new_entry);
        //console.log("this.seeds[i]: ", this.seeds[seed_index]);
        glMatrix.vec4.copy(raw_data.data[startIndex].position, this.seeds[seed_index]);
        glMatrix.vec4.copy(raw_data.data[startIndex].position_r3, this.seeds[seed_index]);
        raw_data.data[startIndex].u_v_w_signum[3] = this.seed_signums[seed_index];
        raw_data.data[startIndex].flag = this.seed_signums[seed_index];

        //push startindex
        raw_data.start_indices.push(startIndex);

        //var total_points = raw_data.num_points;
        var positionData = raw_data.data[startIndex];
        var startPosition = glMatrix.vec3.fromValues(positionData.position[0], positionData.position[1], positionData.position[2]);
        //var signum = (positionData.u_v_w_signum[3] > 0) ? 1 : -1;
        var signum = positionData.flag;

        var f_start = this.f(startPosition, signum);
        raw_data.data[startIndex].flag = signum;
        raw_data.data[startIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_start[0], f_start[1], f_start[2], 1);
        //var previousPosition = startPosition;
        //console.log("startIndex: ", startIndex);
        //console.log("positionData: ", positionData);
        //console.log("startPosition: ", startPosition);
        //console.log("previousPosition: ", previousPosition);

        tmp.terminate = false;
        tmp.startIndex = startIndex;
        tmp.signum = signum;
        tmp.i=1;

    }

    SetupStreamline2Plus2D(bo_calculate_streamlines) {
        var snap_nearest_z = bo_calculate_streamlines.part_index == PART_INDEX_OUTSIDE;
        var seed_index = bo_calculate_streamlines.next_streamline_index;
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        console.log("#SC: SetupStreamline2Plus2D: ", seed_index);

        var startIndex = raw_data.data.length;//seed_index * this.num_points_per_streamline;

        //push seed
        var new_entry = new RawDataEntry();
        raw_data.data.push(new_entry);
        console.log("this.seeds[i]: ", this.seeds[seed_index]);
        glMatrix.vec4.copy(raw_data.data[startIndex].position, this.seeds[seed_index]);
        raw_data.data[startIndex].u_v_w_signum[3] = this.seed_signums[seed_index];
        raw_data.data[startIndex].flag = this.seed_signums[seed_index];

        //push startindex
        raw_data.start_indices.push(startIndex);


        var total_points = raw_data.num_points;
        var positionData = raw_data.data[startIndex];
        var startPosition = glMatrix.vec4.fromValues(positionData.position[0], positionData.position[1], positionData.position[2], positionData.position[3]);
        //var signum = (positionData.u_v_w_signum[3] > 0) ? 1 : -1;
        var signum = positionData.flag;

        var f_start = this.g(startPosition, signum);
        raw_data.data[startIndex].flag = signum;
        raw_data.data[startIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_start[0], f_start[1], f_start[2], 1);//TODO
        raw_data.data[startIndex].position = glMatrix.vec4.fromValues(startPosition[0], startPosition[1], startPosition[2], startPosition[3]);
        raw_data.data[startIndex].CalculateAngleFromPosition_3_2();
        var previousPosition = startPosition;
        console.log("startIndex: ", startIndex);
        console.log("positionData: ", positionData);
        console.log("startPosition: ", startPosition);
        console.log("previousPosition: ", previousPosition);

        tmp.startIndex = startIndex;
        tmp.signum = signum;
        tmp.i=1;
    }

    SetupStreamline2Sphere3Plus3D(bo_calculate_streamlines) {
        var seed_index = bo_calculate_streamlines.next_streamline_index;
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        console.log("#SC: SetupStreamline2Sphere3Plus3D: ", seed_index);


        var startIndex = raw_data.data.length;//seed_index * this.num_points_per_streamline;

        //push seed
        var new_entry = new RawDataEntry();
        raw_data.data.push(new_entry);
        //console.log("this.seeds[i]: ", this.seeds[seed_index]);
        glMatrix.vec4.copy(raw_data.data[startIndex].position, this.seeds[seed_index]);
        glMatrix.vec4.copy(raw_data.data[startIndex].direction, this.seed_directions[seed_index]);
        raw_data.data[startIndex].u_v_w_signum[3] = this.seed_signums[seed_index];
        raw_data.data[startIndex].flag = this.seed_signums[seed_index];

        //push startindex
        raw_data.start_indices.push(startIndex);

        //var total_points = raw_data.num_points;
        var positionData = raw_data.data[startIndex];
        var startPosition = glMatrix.vec3.fromValues(positionData.position[0], positionData.position[1], positionData.position[2]);
        var startDirection = glMatrix.vec3.fromValues(positionData.direction[0], positionData.direction[1], positionData.direction[2]);
        //var signum = (positionData.u_v_w_signum[3] > 0) ? 1 : -1;
        var signum = positionData.flag;

        var f_start = this.f_2Sphere3Plus3D_position(startPosition, startDirection, signum);
        raw_data.data[startIndex].flag = signum;
        raw_data.data[startIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_start[0], f_start[1], f_start[2], 1);

        tmp.startIndex = startIndex;
        tmp.signum = signum;
        tmp.i=1;

        console.log("-------------------");
        console.log("START position", raw_data.data[startIndex].position);
        console.log("START direction", raw_data.data[startIndex].direction);

    }

    SetupStreamline3Sphere4Plus4D(bo_calculate_streamlines) {
        var seed_index = bo_calculate_streamlines.next_streamline_index;
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        console.log("#SC: SetupStreamline3Sphere4Plus4D: ", seed_index);


        var startIndex = raw_data.data.length;//seed_index * this.num_points_per_streamline;

        //push seed
        var new_entry = new RawDataEntry();
        raw_data.data.push(new_entry);
        //console.log("this.seeds[i]: ", this.seeds[seed_index]);
        glMatrix.vec4.copy(raw_data.data[startIndex].position, this.seeds[seed_index]);
        glMatrix.vec4.copy(raw_data.data[startIndex].direction, this.seed_directions[seed_index]);
        raw_data.data[startIndex].u_v_w_signum[3] = this.seed_signums[seed_index];
        raw_data.data[startIndex].flag = this.seed_signums[seed_index];

        //push startindex
        raw_data.start_indices.push(startIndex);

        //var total_points = raw_data.num_points;
        var positionData = raw_data.data[startIndex];
        var startPosition = glMatrix.vec4.fromValues(positionData.position[0], positionData.position[1], positionData.position[2], positionData.position[3]);
        var startDirection = glMatrix.vec4.fromValues(positionData.direction[0], positionData.direction[1], positionData.direction[2], positionData.direction[3]);
        //var signum = (positionData.u_v_w_signum[3] > 0) ? 1 : -1;
        var signum = positionData.flag;

        //this part is for the magnetic streamlines
        var startPositionSwapped = glMatrix.vec4.create();
        apply_magnetic_3sphere_i(startPositionSwapped, startPosition);

        tmp.startIndex = startIndex;
        tmp.signum = signum;
        tmp.i=1;
        tmp.delta = glMatrix.vec4.dot(startDirection, startPositionSwapped);//this part is for the magnetic streamlines
        tmp.s = bo_calculate_streamlines.input_parameters.parameter_s;//this part is for the magnetic streamlines

        //console.warn("delta", tmp.delta, "s", tmp.s)

        var f_start = this.f_3Sphere4Plus4D_position(startPosition, startDirection, tmp);
        raw_data.data[startIndex].flag = signum;
        raw_data.data[startIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_start[0], f_start[1], f_start[2], 1);

        console.log("-------------------");
        console.log("START position", raw_data.data[startIndex].position);
        console.log("START direction", raw_data.data[startIndex].direction);
    }

    ContinueStreamline(bo_calculate_streamlines){
        switch (this.space) {
            case SPACE_3_TORUS:
                //this.ContinueStreamline3Torus(bo_calculate_streamlines);
                this.ContinueStreamlineQuotientSpace(bo_calculate_streamlines);
                break;
            case SPACE_2_PLUS_2D:
                this.ContinueStreamline2Plus2D(bo_calculate_streamlines);
                break;
            case SPACE_2_SPHERE_3_PLUS_3D:
                this.ContinueStreamline2Sphere3Plus3D(bo_calculate_streamlines);
                break;
            case SPACE_3_SPHERE_4_PLUS_4D:
                this.ContinueStreamline3Sphere4Plus4D(bo_calculate_streamlines);
                break;
            default:
                console.log("Error unknonw space");
                break;
        }
    }



    addSegmentEnd(bo_calculate_streamlines, position){
        var diff = glMatrix.vec3.create();
        var position_r3 = glMatrix.vec3.create();

        //get variables
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;

        //data from last point
        var last_entry = raw_data.data[raw_data.data.length-1];
        var position_previous = glMatrix.vec3.fromValues(last_entry.position[0], last_entry.position[1], last_entry.position[2]);
        var position_previous_r3 = glMatrix.vec3.fromValues(last_entry.position_r3[0], last_entry.position_r3[1], last_entry.position_r3[2]);
        var f_previous = this.f(position_previous, signum);
        var v_previous = glMatrix.vec3.length(f_previous);
        var time_previous = last_entry.time;
        var arc_length_previous = last_entry.arc_length;
        var local_i_previous = last_entry.local_i;
        
        //data for curent point
        var f_current = this.f(position, signum);
        var v_current = glMatrix.vec3.length(f_current);
        glMatrix.vec3.subtract(diff, position, position_previous);
        
        //below is different for the different types of points
        var flag = 3;//3=end
        var segment_length = glMatrix.vec3.length(diff);
        var v_average = (v_previous + v_current) * 0.5;
        var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
        var arc_length_current = arc_length_previous + segment_length;

        glMatrix.vec3.add(position_r3, position_previous_r3, diff);
        raw_data.AddEntry(flag, position, position_r3, f_current, signum, time_current, arc_length_current, local_i_previous+1);
        //console.warn("Add", "END", time_current, position);
    }

    addSegmentStart(bo_calculate_streamlines, position){
        var diff = glMatrix.vec3.create();
        var position_r3 = glMatrix.vec3.create();

        //get variables
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;

        //data from last point
        var last_entry = raw_data.data[raw_data.data.length-1];
        var position_previous = glMatrix.vec3.fromValues(last_entry.position[0], last_entry.position[1], last_entry.position[2]);
        var position_previous_r3 = glMatrix.vec3.fromValues(last_entry.position_r3[0], last_entry.position_r3[1], last_entry.position_r3[2]);
        var f_previous = this.f(position_previous, signum);
        var v_previous = glMatrix.vec3.length(f_previous);
        var time_previous = last_entry.time;
        var arc_length_previous = last_entry.arc_length;
        var local_i_previous = last_entry.local_i;
        
        //data for curent point
        var f_current = this.f(position, signum);
        var v_current = glMatrix.vec3.length(f_current);
        glMatrix.vec3.subtract(diff, position, position_previous);
        
        //below is different for the different types of points
        var flag = signum;//1 or -1 for start
        var time_current = time_previous;//copy from last point
        var arc_length_current = arc_length_previous;//copy from last point

        glMatrix.vec3.copy(position_r3, position_previous_r3);//copy from last point
        raw_data.AddEntry(flag, position, position_r3, f_current, signum, time_current, arc_length_current, local_i_previous+1);
        //console.warn("Add", "START", time_current, position);
    }

    addSegmentContinue(bo_calculate_streamlines, position){
        var diff = glMatrix.vec3.create();
        var position_r3 = glMatrix.vec3.create();

        //get variables
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;

        //data from last point
        var last_entry = raw_data.data[raw_data.data.length-1];
        var position_previous = glMatrix.vec3.fromValues(last_entry.position[0], last_entry.position[1], last_entry.position[2]);
        var position_previous_r3 = glMatrix.vec3.fromValues(last_entry.position_r3[0], last_entry.position_r3[1], last_entry.position_r3[2]);
        var f_previous = this.f(position_previous, signum);
        var v_previous = glMatrix.vec3.length(f_previous);
        var time_previous = last_entry.time;
        var arc_length_previous = last_entry.arc_length;
        var local_i_previous = last_entry.local_i;
        
        //data for curent point
        var f_current = this.f(position, signum);
        var v_current = glMatrix.vec3.length(f_current);
        glMatrix.vec3.subtract(diff, position, position_previous);
        
        //below is different for the different types of points
        var segment_length = glMatrix.vec3.length(diff);
        var v_average = (v_previous + v_current) * 0.5;
        var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
        var arc_length_current = arc_length_previous + segment_length;

        var flag = 2;//3=end
        if(this.TerminationChecks(tmp.i, time_current, arc_length_current, bo_calculate_streamlines)){
            tmp.terminate = true;
            flag = 3;//end of polyline
        }
        glMatrix.vec3.add(position_r3, position_previous_r3, diff);
        raw_data.AddEntry(flag, position, position_r3, f_current, signum, time_current, arc_length_current, local_i_previous+1);
        //console.warn("Add", flag==3 ? "END" : "", time_current, position);
        //console.warn("   segment_length", segment_length);
        //console.warn("   position_previous", position_previous);
        //console.warn("   position", position);
    }

    phi(a_input, dir_input)
    {    
        var a = glMatrix.vec3.create();
        var dir = glMatrix.vec3.create();
        glMatrix.vec3.copy(a, a_input);
        glMatrix.vec3.copy(dir, dir_input);

        var b = glMatrix.vec3.create();
        var c = glMatrix.vec3.create();
        var dir_normalized = glMatrix.vec3.create();
        var tar_a = glMatrix.vec3.create();
        var t_v = glMatrix.vec3.create();
        var dir_new_normalized = glMatrix.vec3.create();

        var epsilon_clamp = 0.00001;
        var epsilon_t_exit = 0.000001;
        //a = clamp(a, 0.0+epsilon_clamp, 1.0-epsilon_clamp);//does not seem to be required
    
        //var b = a + dir;  
        glMatrix.vec3.add(b, a, dir);

        //console.warn("---PHI---");
        //console.warn("a", a);
        //console.warn("dir", dir);
        //console.warn("b", b);

        var iteration_count_at_border = 0;  
        while(this.CheckOutOfBounds3(b)){
            //console.warn("b is out of bounds", b);
            //vec3 dir_normalized = normalize(dir);
            glMatrix.vec3.normalize(dir_normalized, dir);
            
            //var dir_inv = 1.0/dir_normalized;
            var dir_inv = glMatrix.vec3.fromValues(1/dir_normalized[0], 1/dir_normalized[1], 1/dir_normalized[2]);

            //calculate exit c (the point where ray leaves the current instance)
            //formula: target = origin + t * direction
            //float tar_x = (direction.x > 0) ? 1 : 0;	
            //float tar_y = (direction.y > 0) ? 1 : 0;
            //float tar_z = (direction.z > 0) ? 1 : 0;
            var tar = stepVec3(glMatrix.vec3.fromValues(0,0,0), dir_normalized);
            //float t_x = (tar_x - origin.x) * dir_inv.x;	
            //float t_y = (tar_y - origin.y) * dir_inv.y;	
            //float t_z = (tar_z - origin.z) * dir_inv.z;	
            //var t_v = (tar - a) * dir_inv;
            glMatrix.vec3.subtract(tar_a, tar, a);
            glMatrix.vec3.multiply(t_v, tar_a, dir_inv);	
            
            var t_exit = Math.min(t_v[0], Math.min(t_v[1], t_v[2]));	
            t_exit += 0.00001;//test: force minimal out of bounds	
            t_exit = Math.max(0.0, t_exit);		

            //var c = a + t_exit * dir_normalized;
            glMatrix.vec3.scaleAndAdd(c, a, dir_normalized, t_exit);
            //console.warn("-");
            //console.warn("c", c);
            //console.warn("dir_normalizedc", dir_normalized);
            //console.warn("t_exit", t_exit);
        
            //Calculate the distance dist between c and b (that is how far we need to go into the next FD)
            var dist = glMatrix.vec3.distance(c, b);
    
            //Apply boundary rule to (c, normalize(dir)) to get c_new and dir_new (because the rules are only valid at the border)
            var dir_new = this.MoveOutOfBoundsDirection3(c, dir_normalized);
            var c_new = this.MoveOutOfBounds3(c);
    
            //Calculate new b
            //b = c_new + dist * normalize(dir_new);
            glMatrix.vec3.normalize(dir_new_normalized, dir_new);
            glMatrix.vec3.scaleAndAdd(b, c_new, dir_new_normalized, dist);
            //console.warn("c_new", c_new);
            //console.warn("b", b);
    
            //Cleanup for next iteration:
            //a = c_new;
            glMatrix.vec3.copy(a, c_new);
            //dir = b-a;
            glMatrix.vec3.subtract(dir, b, a);
    
            //Detect infinite loop when a stays on border
            //if a starts at the border
            if(t_exit < epsilon_t_exit)
            {            
                iteration_count_at_border += 1;
            }        
            if(iteration_count_at_border == 3){
                break;
            }
    
        }
        if(isNaN(b[0]) || isNaN(b[1]) || isNaN(b[2])){
            //console.warn("b is NaN before clamp", b);
            debugger;
        }
        b = clampVec3(b, 0.0+epsilon_clamp, 1.0-epsilon_clamp);
        if(isNaN(b[0]) || isNaN(b[1]) || isNaN(b[2])){
            //console.warn("b is NaN after clamp", b);
            debugger;
        }
        //console.warn("b", b);
        //console.warn("---PHI END---");
    
        return b;
    }

    //a = tmp.previous_position_fd
    //dir = currentPosition - tmp.previous_position_fd 
    //pos_r3 = tmp.previous_position_r3
    phi_add_segments(a, dir, bo_calculate_streamlines)
    {    
        //console.warn("---PHI ADD SEGMENTS---");
        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;

        var previousVec4 = raw_data.data[raw_data.data.length-1].position;
        var a = glMatrix.vec3.fromValues(previousVec4[0], previousVec4[1], previousVec4[2]);
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;

        var b = glMatrix.vec3.create();
        var c = glMatrix.vec3.create();
        var dir_normalized = glMatrix.vec3.create();
        var tar_a = glMatrix.vec3.create();
        var t_v = glMatrix.vec3.create();
        var diff_inside = glMatrix.vec3.create();//the vector from a (start of current rk4 step) to c (exit of FD)
        var dir_new_normalized = glMatrix.vec3.create();
        var diff_remaining = glMatrix.vec3.create();

        var epsilon_clamp = 0.00001;
        var epsilon_t_exit = 0.000001;
        //a = clamp(a, 0.0+epsilon_clamp, 1.0-epsilon_clamp);//does not seem to be required
    
        //var b = a + dir;  
        glMatrix.vec3.add(b, a, dir);              
        //console.warn("a", a);                   
        //console.warn("b", b);           
        //console.warn("a", a);           
        //console.warn("dir", dir);
        var iteration_count_at_border = 0;  
        var is_new_segment = false;//assume b stays inside
        while(this.CheckOutOfBounds3(b)){

            var is_new_segment = true;//b left FD, the segment added after the loop is a new polyline

            //vec3 dir_normalized = normalize(dir);
            glMatrix.vec3.normalize(dir_normalized, dir);
            
            //var dir_inv = 1.0/dir_normalized;
            var dir_inv = glMatrix.vec3.fromValues(1/dir_normalized[0], 1/dir_normalized[1], 1/dir_normalized[2]);

            //calculate exit c (the point where ray leaves the current instance)
            //formula: target = origin + t * direction
            //float tar_x = (direction.x > 0) ? 1 : 0;	
            //float tar_y = (direction.y > 0) ? 1 : 0;
            //float tar_z = (direction.z > 0) ? 1 : 0;
            var tar = stepVec3(glMatrix.vec3.fromValues(0,0,0), dir_normalized);
            //float t_x = (tar_x - origin.x) * dir_inv.x;	
            //float t_y = (tar_y - origin.y) * dir_inv.y;	
            //float t_z = (tar_z - origin.z) * dir_inv.z;	
            //var t_v = (tar - a) * dir_inv;
            glMatrix.vec3.subtract(tar_a, tar, a);
            glMatrix.vec3.multiply(t_v, tar_a, dir_inv);	
            
            var t_exit = Math.min(t_v[0], Math.min(t_v[1], t_v[2]));
            t_exit += 0.00001;//test: force minimal out of bounds		
            t_exit = Math.max(0.0, t_exit);		

            //var c = a + t_exit * dir_normalized;
            glMatrix.vec3.scaleAndAdd(c, a, dir_normalized, t_exit);


            //Add the end point of the polyline, the next start is added further below
            this.addSegmentEnd(bo_calculate_streamlines, c);
    
            //Update the flow tracker variable
            //pos_r3 += c - a;
            glMatrix.vec3.subtract(diff_inside, c, a);
            //console.log("diff_inside", diff_inside);
            //console.log("pos_r3", pos_r3);
            //glMatrix.vec3.add(pos_r3, pos_r3, diff_inside);
    
            //Calculate the distance dist between c and b (that is how far we need to go into the next FD)
            var dist = glMatrix.vec3.distance(c, b);
    
            //Apply boundary rule to (c, normalize(dir)) to get c_new and dir_new (because the rules are only valid at the border)
            var dir_new = this.MoveOutOfBoundsDirection3(c, dir_normalized);
            var c_new = this.MoveOutOfBounds3(c);
    
            //Calculate new b
            //b = c_new + dist * normalize(dir_new);
            glMatrix.vec3.normalize(dir_new_normalized, dir_new);
            glMatrix.vec3.scaleAndAdd(b, c_new, dir_new_normalized, dist);

            /*
            console.warn("b", b);
            console.warn("c_new", c_new);
            console.warn("dir_new_normalized", dir_new_normalized);
            console.warn("dist", dist);
            debug;
            */
    
            //Cleanup for next iteration:
            //a = c_new;
            glMatrix.vec3.copy(a, c_new);
            //dir = b-a;
            glMatrix.vec3.subtract(dir, b, a);

            //Add the start point of the polyline, the end point was already added above
            this.addSegmentStart(bo_calculate_streamlines, a);
    
            //Detect infinite loop when a stays on border
            //if a starts at the border
            if(t_exit < epsilon_t_exit)
            {            
                iteration_count_at_border += 1;
            }        
            if(iteration_count_at_border == 3){
                break;
            }
    
        }

        b = clampVec3(b, 0.0+epsilon_clamp, 1.0-epsilon_clamp);


        //Update the flow tracker variable (this is either the entire segment, or the last part that remains in the new FD after exiting the old FD)
        //pos_r3 += b - a;
        glMatrix.vec3.subtract(diff_remaining, b, a);

        this.addSegmentContinue(bo_calculate_streamlines, b);
        /*
        if(is_new_segment){
            //b was out of bounds, the part inside was already added, now we add the part in the new FD as a new polyline
            //add "a" with flag new polyline
            //add "b" with flag default continue 
            tmp.terminate = true;
            console.warn("TERMINATE");
        }
        else{
            //b was not out of bounds, we can directly add "b" as new point with flag default continue
            console.warn("b stayed inside");
            var flag = 2;//2=normal point   1=new polyline   3=end polyline   0=skip point
            var f_previous = this.f(tmp.previous_position_fd, signum);
            var f_current = this.f(b, signum);
            var v_previous = glMatrix.vec3.length(f_previous);
            var v_current = glMatrix.vec3.length(f_current);
            var v_average = (v_previous + v_current) * 0.5;
            var segment_length = glMatrix.vec3.length(diff_remaining);

            //get data from last point
            var last_entry = raw_data.data[raw_data.data.length-1];
            console.warn(last_entry);
            var time_previous = last_entry.time;
            var arc_length_previous = last_entry.arc_length;

            var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
            var arc_length_current = arc_length_previous + segment_length;

            glMatrix.vec3.copy(tmp.previous_position_fd, b);
            glMatrix.vec3.add(tmp.previous_position_r3, tmp.previous_position_r3, diff_remaining);
            var pos_add_new =  this.check_bounds ? tmp.previous_position_fd : tmp.previous_position_r3;

            if(this.TerminationChecks(tmp.i, time_current, arc_length_current, bo_calculate_streamlines)){
                tmp.terminate = true;
                flag = 3;//end of polyline
            }

            //generate and add new point
            var new_entry = new RawDataEntry();
            new_entry.flag = flag;
            new_entry.position = glMatrix.vec4.fromValues(pos_add_new[0], pos_add_new[1], pos_add_new[2], 1);
            new_entry.u_v_w_signum = glMatrix.vec4.fromValues(f_current[0], f_current[1], f_current[2], signum);
            new_entry.time = time_current;
            new_entry.arc_length = arc_length_current;
            new_entry.local_i = last_entry.local_i+1;    
            raw_data.data.push(new_entry);
            tmp.i += 1;

            //console.warn("b", b);
            console.warn("added point", new_entry.position);
        }    

        //console.log("diff_remaining", diff_remaining);
        //console.log("pos_r3", pos_r3);
        glMatrix.vec3.add(pos_r3, pos_r3, diff_remaining);
        console.warn("---PHI ADD SEGMENTS END---");
        return b;
        */
    }

    ContinueStreamlineQuotientSpace(bo_calculate_streamlines) {

        //debug
        /*
        var a = glMatrix.vec3.fromValues(0.95, 0.9, 0.5);
        var dir = glMatrix.vec3.fromValues(0.2, 0.2, 0.0);
        this.phi(a, dir);
        debug;
        */
        //end debug

        var t_start = performance.now();

        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;
        //console.log("#SC: ContinueStreamlineQuotientSpace", tmp.i);

        var currentPosition = glMatrix.vec3.create();
        var difference = glMatrix.vec3.create();//current - previous positions, calculated from k values
        var k1 = glMatrix.vec3.create();
        var k2 = glMatrix.vec3.create();
        var k3 = glMatrix.vec3.create();
        var k4 = glMatrix.vec3.create();
        var k1_2 = glMatrix.vec3.create();// k1_2 = k1/2
        var k2_2 = glMatrix.vec3.create();// k2_2 = k2/2
        var k1_6 = glMatrix.vec3.create();// k1_6 = k1/6
        var k2_3 = glMatrix.vec3.create();// k2_3 = k2/3
        var k3_3 = glMatrix.vec3.create();// k3_3 = k3/3
        var k4_6 = glMatrix.vec3.create();// k4_6 = k4/6
        
        while(true){
            //tmp.i starts with 1, the index 0 is the seed
            var previousVec4 = raw_data.data[raw_data.data.length-1].position;
            var previousPosition = glMatrix.vec3.fromValues(previousVec4[0], previousVec4[1], previousVec4[2]);
            
            //---------- START OF RK4 ----------
            //CALCULATE: vec3 k1 = step_size * f(previousPosition, signum);
            glMatrix.vec3.scale(k1, this.f(previousPosition, signum), this.step_size);

            //CALCULATE: vec3 k2 = step_size * f(previousPosition + k1/2, signum);
            glMatrix.vec3.scale(k1_2, k1, 1 / 2);// k1_2 = k1/2        
            glMatrix.vec3.scale(k2, this.f(this.phi(previousPosition, k1_2), signum), this.step_size);

            //CALCULATE: vec3 k3 = step_size * f(previousPosition + k2/2, signum);
            glMatrix.vec3.scale(k2_2, k2, 1 / 2);// k2_2 = k2/2
            glMatrix.vec3.scale(k3, this.f(this.phi(previousPosition, k2_2), signum), this.step_size);

            //CALCULATE: vec3 k4 = step_size * f(previousPosition + k3, signum);
            glMatrix.vec3.scale(k4, this.f(this.phi(previousPosition, k3), signum), this.step_size);

            //CALCULATE: vec3 currentPosition = previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6;
            glMatrix.vec3.scale(k1_6, k1, 1 / 6);// k1_6 = k1/6
            glMatrix.vec3.scale(k2_3, k2, 1 / 3);// k2_3 = k2/3
            glMatrix.vec3.scale(k3_3, k3, 1 / 3);// k3_3 = k3/3
            glMatrix.vec3.scale(k4_6, k4, 1 / 6);// k4_6 = k4/6
            
            glMatrix.vec3.copy(difference, k1_6);
            glMatrix.vec3.add(difference, difference, k2_3);// k1 / 6 + k2 / 3
            glMatrix.vec3.add(difference, difference, k3_3);// k1 / 6 + k2 / 3 + k3 / 3
            glMatrix.vec3.add(difference, difference, k4_6);// k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6
            
            //console.warn("currentPosition", currentPosition)
            glMatrix.vec3.add(currentPosition, previousPosition, difference);// previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6

            //prepare next iteration: copy current to previous
            //glMatrix.vec3.copy(previousPosition, currentPosition);              
            //---------- END OF RK4 ----------

            //We now have:
            //  previousPosition = the position before rk4 step (guaranteed to be inside FD)
            //  currentPosition = the position after rk4 step (NOT guaranteed to be inside FD)

            //console.warn("tmp.previous_position_fd", tmp.previous_position_fd);
            //console.warn("difference", difference);
            //Next we apply phi to make sure currentPosition is inside the FD, and store all segments needed
            this.phi_add_segments(previousPosition, difference, bo_calculate_streamlines);

            if (tmp.terminate){
                tmp.finished = true;
                //this.InterpolateLastSegment(currentIndex, previousIndex, raw_data);
                var last_entry = raw_data.data[raw_data.data.length-1];
                this.UpdateTotalStreamlineProgress(tmp.i, last_entry.time_current, last_entry.arc_length_current, bo_calculate_streamlines);
                //console.warn("last_entry", last_entry)
                break;
            }














































            /*



            var flag = 2;//2=normal point   1=new polyline   3=end polyline   0=skip point
            var f_previous = this.f(tmp.previous_position_fd, signum);
            var f_current = this.f(currentPosition, signum);
            var v_previous = glMatrix.vec3.length(f_previous);
            var v_current = glMatrix.vec3.length(f_current);
            var v_average = (v_previous + v_current) * 0.5;
            var time_previous = raw_data.data[previousIndex].time;
            var arc_length_previous = raw_data.data[previousIndex].arc_length;

            var difference = glMatrix.vec3.create();
            glMatrix.vec3.subtract(difference, currentPosition, previousPosition);
            var segment_length = glMatrix.vec3.length(difference);

            var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
            var arc_length_current = arc_length_previous + segment_length;

            //console.log("time_current", time_current);

            //push entry for current index
            var new_entry = new RawDataEntry();
            raw_data.data.push(new_entry);

            var terminate = false;

            if(this.TerminationChecks(tmp.i, time_current, arc_length_current, bo_calculate_streamlines)){
                terminate = true;
                flag = 3;//end of polyline
            }
            else if (this.check_bounds) {
                var outOfBounds = this.CheckOutOfBounds3(currentPosition);
                if (outOfBounds) {
                    flag = 3;//end of polyline
                    //vectorPosition[currentIndex]= vec4(currentPosition, 3);//3 = end
                   
                    if (this.continue_at_bounds) {//if (this.continue_at_bounds && i < this.num_points_per_streamline - 2) {
                        var movedPosition = this.MoveOutOfBounds3(currentPosition);
                        var f_movedPosition = this.f(movedPosition, signum);
                        var v_movedPosition = glMatrix.vec3.length(f_movedPosition);

                        //push entry for moved position (current index + 1)
                        var new_entry = new RawDataEntry();
                        raw_data.data.push(new_entry);

                        raw_data.data[currentIndex + 1].flag = signum;//1 or -1 for start
                        raw_data.data[currentIndex + 1].position = glMatrix.vec4.fromValues(movedPosition[0], movedPosition[1], movedPosition[2], 1);;//1 or -1 for start
                        raw_data.data[currentIndex + 1].u_v_w_signum = glMatrix.vec4.fromValues(f_movedPosition[0], f_movedPosition[1], f_movedPosition[2], signum);
                        raw_data.data[currentIndex + 1].time = time_current;
                        raw_data.data[currentIndex + 1].arc_length = arc_length_current;
                        raw_data.data[currentIndex + 1].local_i = local_i+1;                        
                        raw_data.data[currentIndex + 1].velocity = v_movedPosition;
                        tmp.i++;
                    }
                    else {
                        terminate = true;
                    }
                }
            }

            raw_data.data[currentIndex].flag = flag;
            raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(currentPosition[0], currentPosition[1], currentPosition[2], 1);
            raw_data.data[currentIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_current[0], f_current[1], f_current[2], signum);
            raw_data.data[currentIndex].time = time_current;
            raw_data.data[currentIndex].arc_length = arc_length_current;
            raw_data.data[currentIndex].local_i = local_i;               

            //previousPosition = currentPosition;
            if (terminate){
                tmp.finished = true;
                this.InterpolateLastSegment(currentIndex, previousIndex, raw_data);
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

            tmp.i++;

            var t_now = performance.now();
            var t_diff = Math.ceil(t_now-t_start);
            if(t_diff > 100){
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

            */

        }
    }

    ContinueStreamline3Torus(bo_calculate_streamlines) {
        //MARKER_MODIFIED_STREAMLINE_CALCULATION
        //TODO: make new method ContinueStreamlineQuotientSpace
        var t_start = performance.now();


        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;
        console.log("#SC: ContinueStreamline3Torus", tmp.i);

        var currentPosition = glMatrix.vec3.create();
        var k1 = glMatrix.vec3.create();
        var k2 = glMatrix.vec3.create();
        var k3 = glMatrix.vec3.create();
        var k4 = glMatrix.vec3.create();
        var k1_2 = glMatrix.vec3.create();// k1_2 = k1/2
        var k2_2 = glMatrix.vec3.create();// k2_2 = k2/2
        var k1_6 = glMatrix.vec3.create();// k1_6 = k1/6
        var k2_3 = glMatrix.vec3.create();// k2_3 = k2/3
        var k3_3 = glMatrix.vec3.create();// k3_3 = k3/3
        var k4_6 = glMatrix.vec3.create();// k4_6 = k4/6
        var previous_plus_k1_2 = glMatrix.vec3.create();// previousPosition + k1/2
        var previous_plus_k2_2 = glMatrix.vec3.create();// previousPosition + k2/2
        var previous_plus_k3 = glMatrix.vec3.create();// previousPosition + k3
        var substep_currentPosition = glMatrix.vec3.create();
        var substep_previousPosition = glMatrix.vec3.create();
        
        while(true){
            var local_i = tmp.i;//does not change even if duplicating point (used for point data)
            var currentIndex = tmp.startIndex + tmp.i;
            var previousIndex = currentIndex - 1;
            var previousVec4 = raw_data.data[previousIndex].position;
            var previousPosition = glMatrix.vec3.fromValues(previousVec4[0], previousVec4[1], previousVec4[2]);

            
            glMatrix.vec3.copy(substep_previousPosition, previousPosition);
            var sub_step_size = this.step_size// / (this.inbetweens + 1);
            //multiple rk4 steps
            for (var sub_step_index = 0; sub_step_index <= this.inbetweens; sub_step_index++) {
                //CALCULATE: vec3 k1 = step_size * f(substep_previousPosition, signum);
                glMatrix.vec3.scale(k1, this.f(substep_previousPosition, signum), sub_step_size);

                //CALCULATE: vec3 k2 = step_size * f(substep_previousPosition + k1/2, signum);
                glMatrix.vec3.scale(k1_2, k1, 1 / 2);// k1_2 = k1/2
                glMatrix.vec3.add(previous_plus_k1_2, substep_previousPosition, k1_2);// substep_previousPosition + k1/2            
                glMatrix.vec3.scale(k2, this.f(previous_plus_k1_2, signum), sub_step_size);

                //CALCULATE: vec3 k3 = step_size * f(substep_previousPosition + k2/2, signum);
                glMatrix.vec3.scale(k2_2, k2, 1 / 2);// k2_2 = k2/2
                glMatrix.vec3.add(previous_plus_k2_2, substep_previousPosition, k2_2);// substep_previousPosition + k2/2     
                glMatrix.vec3.scale(k3, this.f(previous_plus_k2_2, signum), sub_step_size);

                //CALCULATE: vec3 k4 = step_size * f(substep_previousPosition + k3, signum);
                glMatrix.vec3.add(previous_plus_k3, substep_previousPosition, k3);// substep_previousPosition + k3
                glMatrix.vec3.scale(k4, this.f(previous_plus_k3, signum), sub_step_size);

                //CALCULATE: vec3 substep_currentPosition = substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6;
                glMatrix.vec3.scale(k1_6, k1, 1 / 6);// k1_6 = k1/6
                glMatrix.vec3.scale(k2_3, k2, 1 / 3);// k2_3 = k2/3
                glMatrix.vec3.scale(k3_3, k3, 1 / 3);// k3_3 = k3/3
                glMatrix.vec3.scale(k4_6, k4, 1 / 6);// k4_6 = k4/6
                glMatrix.vec3.add(substep_currentPosition, substep_previousPosition, k1_6);// substep_previousPosition + k1 / 6 
                glMatrix.vec3.add(substep_currentPosition, substep_currentPosition, k2_3);// substep_previousPosition + k1 / 6 + k2 / 3
                glMatrix.vec3.add(substep_currentPosition, substep_currentPosition, k3_3);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3
                glMatrix.vec3.add(substep_currentPosition, substep_currentPosition, k4_6);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6
              
                //prepare next substep iteration: copy current to previous
                glMatrix.vec3.copy(substep_previousPosition, substep_currentPosition);  
            }

            //after every substep, copy the final value to currentPosition
            glMatrix.vec3.copy(currentPosition, substep_currentPosition);

            //console.log(i, currentPosition);
            if (this.confine_to_cube)
                currentPosition = this.ConfineToCube(currentPosition, previousPosition);


            var flag = 2;//2=normal point   1=new polyline   3=end polyline   0=skip point
            var f_previous = this.f(previousPosition, signum);
            var f_current = this.f(currentPosition, signum);
            var v_previous = glMatrix.vec3.length(f_previous);
            var v_current = glMatrix.vec3.length(f_current);
            var v_average = (v_previous + v_current) * 0.5;
            var time_previous = raw_data.data[previousIndex].time;
            var arc_length_previous = raw_data.data[previousIndex].arc_length;

            var difference = glMatrix.vec3.create();
            glMatrix.vec3.subtract(difference, currentPosition, previousPosition);
            var segment_length = glMatrix.vec3.length(difference);

            var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
            var arc_length_current = arc_length_previous + segment_length;

            //console.log("time_current", time_current);

            //push entry for current index
            var new_entry = new RawDataEntry();
            raw_data.data.push(new_entry);

            var terminate = false;

            if(this.TerminationChecks(tmp.i, time_current, arc_length_current, bo_calculate_streamlines)){
                terminate = true;
                flag = 3;//end of polyline
            }
            else if (this.check_bounds) {
                var outOfBounds = this.CheckOutOfBounds3(currentPosition);
                if (outOfBounds) {
                    flag = 3;//end of polyline
                    //vectorPosition[currentIndex]= vec4(currentPosition, 3);//3 = end
                   
                    if (this.continue_at_bounds) {//if (this.continue_at_bounds && i < this.num_points_per_streamline - 2) {
                        var movedPosition = this.MoveOutOfBounds3(currentPosition);
                        var f_movedPosition = this.f(movedPosition, signum);
                        var v_movedPosition = glMatrix.vec3.length(f_movedPosition);

                        //push entry for moved position (current index + 1)
                        var new_entry = new RawDataEntry();
                        raw_data.data.push(new_entry);

                        raw_data.data[currentIndex + 1].flag = signum;//1 or -1 for start
                        raw_data.data[currentIndex + 1].position = glMatrix.vec4.fromValues(movedPosition[0], movedPosition[1], movedPosition[2], 1);;//1 or -1 for start
                        raw_data.data[currentIndex + 1].u_v_w_signum = glMatrix.vec4.fromValues(f_movedPosition[0], f_movedPosition[1], f_movedPosition[2], signum);
                        raw_data.data[currentIndex + 1].time = time_current;
                        raw_data.data[currentIndex + 1].arc_length = arc_length_current;
                        raw_data.data[currentIndex + 1].local_i = local_i+1;                        
                        raw_data.data[currentIndex + 1].velocity = v_movedPosition;
                        tmp.i++;
                    }
                    else {
                        terminate = true;
                    }
                }
            }

            raw_data.data[currentIndex].flag = flag;
            raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(currentPosition[0], currentPosition[1], currentPosition[2], 1);
            raw_data.data[currentIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_current[0], f_current[1], f_current[2], signum);
            raw_data.data[currentIndex].time = time_current;
            raw_data.data[currentIndex].arc_length = arc_length_current;
            raw_data.data[currentIndex].local_i = local_i;               

            //previousPosition = currentPosition;
            if (terminate){
                tmp.finished = true;
                this.InterpolateLastSegment(currentIndex, previousIndex, raw_data);
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

            tmp.i++;

            var t_now = performance.now();
            var t_diff = Math.ceil(t_now-t_start);
            if(t_diff > 100){
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

        }
    }

    ContinueStreamline2Plus2D(bo_calculate_streamlines) {
        var t_start = performance.now();


        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;
        console.log("#SC: ContinueStreamline2Plus2D", tmp.i);
        var snap_nearest_z = bo_calculate_streamlines.part_index == PART_INDEX_OUTSIDE;

        var currentPosition = glMatrix.vec4.create();
        //var currentPosition = glMatrix.vec4.fromValues(startPosition[0], startPosition[1], startPosition[2], startPosition[3]);
        var k1 = glMatrix.vec4.create();
        var k2 = glMatrix.vec4.create();
        var k3 = glMatrix.vec4.create();
        var k4 = glMatrix.vec4.create();
        var k1_2 = glMatrix.vec4.create();// k1_2 = k1/2
        var k2_2 = glMatrix.vec4.create();// k2_2 = k2/2
        var k1_6 = glMatrix.vec4.create();// k1_6 = k1/6
        var k2_3 = glMatrix.vec4.create();// k2_3 = k2/3
        var k3_3 = glMatrix.vec4.create();// k3_3 = k3/3
        var k4_6 = glMatrix.vec4.create();// k4_6 = k4/6
        var previous_plus_k1_2 = glMatrix.vec4.create();// previousPosition + k1/2
        var previous_plus_k2_2 = glMatrix.vec4.create();// previousPosition + k2/2
        var previous_plus_k3 = glMatrix.vec4.create();// previousPosition + k3
        var substep_currentPosition = glMatrix.vec4.create();
        var substep_previousPosition = glMatrix.vec4.create();

        while(true){  
            var local_i = tmp.i;//does not change even if duplicating point (used for point data)
            var currentIndex = tmp.startIndex + tmp.i;
            var previousIndex = currentIndex - 1;
            var previousVec4 = raw_data.data[previousIndex].position;
            var previousPosition = glMatrix.vec4.fromValues(previousVec4[0], previousVec4[1], previousVec4[2], previousVec4[3]);

            glMatrix.vec4.copy(substep_previousPosition, previousPosition);
            var sub_step_size = this.step_size// / (this.inbetweens + 1);
            //multiple rk4 steps
            for (var sub_step_index = 0; sub_step_index <= this.inbetweens; sub_step_index++) {

                //CALCULATE: vec3 k1 = step_size * f(previousPosition, signum);
                glMatrix.vec4.scale(k1, this.g(substep_previousPosition, signum), sub_step_size);

                //CALCULATE: vec3 k2 = step_size * f(previousPosition + k1/2, signum);
                glMatrix.vec4.scale(k1_2, k1, 1 / 2);// k1_2 = k1/2
                glMatrix.vec4.add(previous_plus_k1_2, substep_previousPosition, k1_2);// previousPosition + k1/2            
                glMatrix.vec4.scale(k2, this.g(previous_plus_k1_2, signum), sub_step_size);

                //CALCULATE: vec3 k3 = step_size * f(previousPosition + k2/2, signum);
                glMatrix.vec4.scale(k2_2, k2, 1 / 2);// k2_2 = k2/2
                glMatrix.vec4.add(previous_plus_k2_2, substep_previousPosition, k2_2);// previousPosition + k2/2     
                glMatrix.vec4.scale(k3, this.g(previous_plus_k2_2, signum), sub_step_size);

                //CALCULATE: vec3 k4 = step_size * f(previousPosition + k3, signum);
                glMatrix.vec4.add(previous_plus_k3, substep_previousPosition, k3);// previousPosition + k3
                glMatrix.vec4.scale(k4, this.g(previous_plus_k3, signum), sub_step_size);

                //CALCULATE: vec3 currentPosition = previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6;
                glMatrix.vec4.scale(k1_6, k1, 1 / 6);// k1_6 = k1/6
                glMatrix.vec4.scale(k2_3, k2, 1 / 3);// k2_3 = k2/3
                glMatrix.vec4.scale(k3_3, k3, 1 / 3);// k3_3 = k3/3
                glMatrix.vec4.scale(k4_6, k4, 1 / 6);// k4_6 = k4/6
                glMatrix.vec4.add(substep_currentPosition, substep_previousPosition, k1_6);// previousPosition + k1 / 6 
                glMatrix.vec4.add(substep_currentPosition, substep_currentPosition, k2_3);// previousPosition + k1 / 6 + k2 / 3
                glMatrix.vec4.add(substep_currentPosition, substep_currentPosition, k3_3);// previousPosition + k1 / 6 + k2 / 3 + k3 / 3
                glMatrix.vec4.add(substep_currentPosition, substep_currentPosition, k4_6);// previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6

                              
                //prepare next substep iteration: copy current to previous
                glMatrix.vec4.copy(substep_previousPosition, substep_currentPosition);  
            }

            //after every substep, copy the final value to currentPosition
            glMatrix.vec4.copy(currentPosition, substep_currentPosition);

            //console.log(i, currentPosition);
            if (this.confine_to_cube)
                currentPosition = this.ConfineToCube(currentPosition, previousPosition);


            var flag = 2;//2=normal point   1=new polyline   3=end polyline   0=skip point
            var f_previous = this.g(previousPosition, signum);
            var f_current = this.g(currentPosition, signum);
            var v_previous = glMatrix.vec4.length(f_previous);
            var v_current = glMatrix.vec4.length(f_current);
            var v_average = (v_previous + v_current) * 0.5;
            var time_previous = raw_data.data[previousIndex].time;
            var arc_length_previous = raw_data.data[previousIndex].arc_length;

            var difference = glMatrix.vec4.create();
            glMatrix.vec3.subtract(difference, currentPosition, previousPosition);
            var segment_length = glMatrix.vec4.length(difference);

            var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
            var arc_length_current = arc_length_previous + segment_length;

            //push entry for current index
            var new_entry = new RawDataEntry();
            raw_data.data.push(new_entry);

            //set values of current index
            raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(currentPosition[0], currentPosition[1], currentPosition[2], currentPosition[3]);
            raw_data.data[currentIndex].CalculateAngleFromPosition_3_2();
            raw_data.data[currentIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_current[0], f_current[1], f_current[2], signum);
            raw_data.data[currentIndex].time = time_current;
            raw_data.data[currentIndex].arc_length = arc_length_current;
            raw_data.data[currentIndex].local_i = local_i;               
            
            var flag_angle_jumping = false;
            if(snap_nearest_z){
                raw_data.data[currentIndex].SnapToOld(raw_data.data[previousIndex].angle);
            }
            else{
                //check if angle is jumping --> must start new line
                flag_angle_jumping = raw_data.data[currentIndex].IsAngleJumping(raw_data.data[previousIndex]);
                if(flag_angle_jumping){       
                    flag = 3;//end of polyline     
                    console.log("angle jumping: ", flag_angle_jumping, raw_data.data[previousIndex].angle, raw_data.data[currentIndex].angle);    
                    if(raw_data.data[currentIndex].angle > 0.5){
                        raw_data.data[currentIndex].angle -= 1;
                    }else{
                        raw_data.data[currentIndex].angle += 1;
                    }
                }
            }


            //if (i == this.num_points_per_streamline - 1)
            //    flag = 3;//end of polyline

            var terminate = false;
            var flag_move_new_point = false;
            if (this.check_bounds) {
                var outOfBounds = this.CheckOutOfBounds2(currentPosition);
                if (outOfBounds) {
                    flag = 3;//end of polyline
                    //vectorPosition[currentIndex]= vec4(currentPosition, 3);//3 = end

                    if (this.continue_at_bounds) {
                        flag_move_new_point = true;
                    }
                    else {
                        terminate = true;
                    }
                }
            }

            //set correct flag of current index
            //default is 2 (normal point)
            //changed to 3 if last point of line or out of bounds
            raw_data.data[currentIndex].flag = flag;

            var flag_make_new_point = flag_move_new_point || flag_angle_jumping;
            if(this.TerminationChecks(tmp.i, time_current, arc_length_current, bo_calculate_streamlines)){
                terminate = true;
                raw_data.data[currentIndex].flag = 3;//end of polyline
            }
            else if(flag_make_new_point){//else if(flag_make_new_point && i < this.num_points_per_streamline - 2){
                var newPosition = glMatrix.vec4.create();
                glMatrix.vec4.copy(newPosition, currentPosition);
                if(flag_move_new_point){
                    newPosition = this.MoveOutOfBounds4(currentPosition);
                }
                var f_newPosition = this.g(newPosition, signum);
                var v_newPosition = glMatrix.vec4.length(f_newPosition);

                //push entry for moved position (current index + 1)
                var new_entry = new RawDataEntry();
                raw_data.data.push(new_entry);

                raw_data.data[currentIndex + 1].flag = signum;//1 or -1 for start
                raw_data.data[currentIndex + 1].position = glMatrix.vec4.fromValues(newPosition[0], newPosition[1], newPosition[2], newPosition[3]);;//1 or -1 for start
                raw_data.data[currentIndex + 1].CalculateAngleFromPosition_3_2();
                raw_data.data[currentIndex + 1].u_v_w_signum = glMatrix.vec4.fromValues(f_newPosition[0], f_newPosition[1], f_newPosition[2], signum);//TODO
                raw_data.data[currentIndex + 1].time = time_current;
                raw_data.data[currentIndex + 1].arc_length = arc_length_current;
                raw_data.data[currentIndex + 1].local_i = local_i+1;               
                raw_data.data[currentIndex + 1].velocity = v_newPosition;
                tmp.i++;
            }

            //terminate if nan or infinity
            var flag_finite = this.CheckFinite(raw_data.data[currentIndex].position);
            if(!flag_finite){
                console.log("flag_nan ", tmp.i, raw_data.data[currentIndex].position[0] + " " + raw_data.data[currentIndex].position[1] + " " + raw_data.data[currentIndex].position[2] + " " + raw_data.data[currentIndex].position[3]);
                console.log(raw_data.data[currentIndex-1].position[0])
                console.log(raw_data.data[currentIndex].position[0])
                //copy previous point with end flag
                //the copy makes sure that we stop at a valid position
                raw_data.data[currentIndex].flag = 3;//end of polyline
                glMatrix.vec4.copy(raw_data.data[currentIndex].position, raw_data.data[previousIndex].position);
                glMatrix.vec4.copy(raw_data.data[currentIndex].u_v_w_signum, raw_data.data[previousIndex].u_v_w_signum);
                raw_data.data[currentIndex].time = raw_data.data[previousIndex].time;

                terminate = true;
                console.log("flag_nan copied", tmp.i, raw_data.data[currentIndex].position[0] + " " + raw_data.data[currentIndex].position[1] + " " + raw_data.data[currentIndex].position[2] + " " + raw_data.data[currentIndex].position[3]);
                this.streamline_error_counter += 1;
            }

            //previousPosition = currentPosition;
            if (terminate){
                tmp.finished = true;
                this.InterpolateLastSegment(currentIndex, previousIndex, raw_data);
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

            tmp.i++;

            var t_now = performance.now();
            var t_diff = Math.ceil(t_now-t_start);
            if(t_diff > 100){
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

            //console.log("currentPosition", i, currentPosition[0] + " " + currentPosition[1] + " " + currentPosition[2] + " " + currentPosition[3]);
        }        
    }

    ContinueStreamline2Sphere3Plus3D(bo_calculate_streamlines) {
        var t_start = performance.now();


        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;
        console.log("#SC: ContinueStreamline2Sphere3Plus3D", tmp.i);

        var currentPosition = glMatrix.vec3.create();
        var k1 = glMatrix.vec3.create();
        var k2 = glMatrix.vec3.create();
        var k3 = glMatrix.vec3.create();
        var k4 = glMatrix.vec3.create();
        var k1_2 = glMatrix.vec3.create();// k1_2 = k1/2
        var k2_2 = glMatrix.vec3.create();// k2_2 = k2/2
        var k1_6 = glMatrix.vec3.create();// k1_6 = k1/6
        var k2_3 = glMatrix.vec3.create();// k2_3 = k2/3
        var k3_3 = glMatrix.vec3.create();// k3_3 = k3/3
        var k4_6 = glMatrix.vec3.create();// k4_6 = k4/6
        var previous_plus_k1_2 = glMatrix.vec3.create();// previousPosition + k1/2
        var previous_plus_k2_2 = glMatrix.vec3.create();// previousPosition + k2/2
        var previous_plus_k3 = glMatrix.vec3.create();// previousPosition + k3
        var substep_currentPosition = glMatrix.vec3.create();
        var substep_previousPosition = glMatrix.vec3.create();

        var currentDirection = glMatrix.vec3.create();
        var l1 = glMatrix.vec3.create();
        var l2 = glMatrix.vec3.create();
        var l3 = glMatrix.vec3.create();
        var l4 = glMatrix.vec3.create();
        var l1_2 = glMatrix.vec3.create();// k1_2 = k1/2
        var l2_2 = glMatrix.vec3.create();// k2_2 = k2/2
        var l1_6 = glMatrix.vec3.create();// k1_6 = k1/6
        var l2_3 = glMatrix.vec3.create();// k2_3 = k2/3
        var l3_3 = glMatrix.vec3.create();// k3_3 = k3/3
        var l4_6 = glMatrix.vec3.create();// k4_6 = k4/6
        var previous_plus_l1_2 = glMatrix.vec3.create();// previousPosition + k1/2
        var previous_plus_l2_2 = glMatrix.vec3.create();// previousPosition + k2/2
        var previous_plus_l3 = glMatrix.vec3.create();// previousPosition + k3
        var substep_currentDirection = glMatrix.vec3.create();
        var substep_previousDirection = glMatrix.vec3.create();
        
        while(true){
            var local_i = tmp.i;//does not change even if duplicating point (used for point data)
            var currentIndex = tmp.startIndex + tmp.i;
            var previousIndex = currentIndex - 1;
            var previousVec4 = raw_data.data[previousIndex].position;
            var previousDirectionVec4 = raw_data.data[previousIndex].direction;
            var previousPosition = glMatrix.vec3.fromValues(previousVec4[0], previousVec4[1], previousVec4[2]);
            var previousDirection = glMatrix.vec3.fromValues(previousDirectionVec4[0], previousDirectionVec4[1], previousDirectionVec4[2]);

            /*
            console.log("-------------------");
            console.log("PRE previousPosition", previousPosition);
            console.log("PRE previousDirection", previousDirection);
*/
            //debugger;
            
            glMatrix.vec3.copy(substep_previousPosition, previousPosition);
            glMatrix.vec3.copy(substep_previousDirection, previousDirection);
            var sub_step_size = this.step_size// / (this.inbetweens + 1);
            //multiple rk4 steps
            for (var sub_step_index = 0; sub_step_index <= this.inbetweens; sub_step_index++) {
                //CALCULATE: vec3 k1 = step_size * f(substep_previousPosition, signum);
                glMatrix.vec3.scale(k1, this.f_2Sphere3Plus3D_position(substep_previousPosition, substep_previousDirection, signum), sub_step_size);
                glMatrix.vec3.scale(l1, this.f_2Sphere3Plus3D_direction(substep_previousPosition, substep_previousDirection, signum), sub_step_size);

                //CALCULATE: vec3 k2 = step_size * f(substep_previousPosition + k1/2, signum);
                glMatrix.vec3.scale(k1_2, k1, 1 / 2);// k1_2 = k1/2
                glMatrix.vec3.scale(l1_2, l1, 1 / 2);// k1_2 = k1/2
                glMatrix.vec3.add(previous_plus_k1_2, substep_previousPosition, k1_2);// substep_previousPosition + k1/2      
                glMatrix.vec3.add(previous_plus_l1_2, substep_previousDirection, l1_2);// substep_previousPosition + k1/2            
                glMatrix.vec3.scale(k2, this.f_2Sphere3Plus3D_position(previous_plus_k1_2, previous_plus_l1_2, signum), sub_step_size);
                glMatrix.vec3.scale(l2, this.f_2Sphere3Plus3D_direction(previous_plus_k1_2, previous_plus_l1_2, signum), sub_step_size);

                //CALCULATE: vec3 k3 = step_size * f(substep_previousPosition + k2/2, signum);
                glMatrix.vec3.scale(k2_2, k2, 1 / 2);// k2_2 = k2/2
                glMatrix.vec3.scale(l2_2, l2, 1 / 2);// k2_2 = k2/2
                glMatrix.vec3.add(previous_plus_k2_2, substep_previousPosition, k2_2);// substep_previousPosition + k2/2     
                glMatrix.vec3.add(previous_plus_l2_2, substep_previousDirection, l2_2);// substep_previousPosition + k2/2  
                glMatrix.vec3.scale(k3, this.f_2Sphere3Plus3D_position(previous_plus_k2_2, previous_plus_l2_2, signum), sub_step_size);
                glMatrix.vec3.scale(l3, this.f_2Sphere3Plus3D_direction(previous_plus_k2_2, previous_plus_l2_2, signum), sub_step_size);

                //CALCULATE: vec3 k4 = step_size * f(substep_previousPosition + k3, signum);
                glMatrix.vec3.add(previous_plus_k3, substep_previousPosition, k3);// substep_previousPosition + k3
                glMatrix.vec3.add(previous_plus_l3, substep_previousDirection, l3);// substep_previousPosition + k3
                glMatrix.vec3.scale(k4, this.f_2Sphere3Plus3D_position(previous_plus_k3, previous_plus_l3, signum), sub_step_size);
                glMatrix.vec3.scale(l4, this.f_2Sphere3Plus3D_direction(previous_plus_k3, previous_plus_l3, signum), sub_step_size);

                //CALCULATE: vec3 substep_currentPosition = substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6;
                glMatrix.vec3.scale(k1_6, k1, 1 / 6);// k1_6 = k1/6
                glMatrix.vec3.scale(l1_6, l1, 1 / 6);// k1_6 = k1/6
                glMatrix.vec3.scale(k2_3, k2, 1 / 3);// k2_3 = k2/3
                glMatrix.vec3.scale(l2_3, l2, 1 / 3);// k2_3 = k2/3
                glMatrix.vec3.scale(k3_3, k3, 1 / 3);// k3_3 = k3/3
                glMatrix.vec3.scale(l3_3, l3, 1 / 3);// k3_3 = k3/3
                glMatrix.vec3.scale(k4_6, k4, 1 / 6);// k4_6 = k4/6
                glMatrix.vec3.scale(l4_6, l4, 1 / 6);// k4_6 = k4/6
                glMatrix.vec3.add(substep_currentPosition, substep_previousPosition, k1_6);// substep_previousPosition + k1 / 6 
                glMatrix.vec3.add(substep_currentDirection, substep_previousDirection, l1_6);// substep_previousPosition + k1 / 6 
                glMatrix.vec3.add(substep_currentPosition, substep_currentPosition, k2_3);// substep_previousPosition + k1 / 6 + k2 / 3
                glMatrix.vec3.add(substep_currentDirection, substep_currentDirection, l2_3);// substep_previousPosition + k1 / 6 + k2 / 3
                glMatrix.vec3.add(substep_currentPosition, substep_currentPosition, k3_3);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3
                glMatrix.vec3.add(substep_currentDirection, substep_currentDirection, l3_3);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3
                glMatrix.vec3.add(substep_currentPosition, substep_currentPosition, k4_6);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6
                glMatrix.vec3.add(substep_currentDirection, substep_currentDirection, l4_6);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6
              
                //prepare next substep iteration: copy current to previous
                glMatrix.vec3.copy(substep_previousPosition, substep_currentPosition);  
                glMatrix.vec3.copy(substep_previousDirection, substep_currentDirection);  

            }

            //after every substep, copy the final value to currentPosition
            glMatrix.vec3.copy(currentPosition, substep_currentPosition);
            glMatrix.vec3.copy(currentDirection, substep_currentDirection);

            //console.log(i, currentPosition);
            //if (this.confine_to_cube)
            //    currentPosition = this.ConfineToCube(currentPosition, previousPosition);

            //TODO: should length be both vectors combined or only position vector
            var flag = 2;//2=normal point   1=new polyline   3=end polyline   0=skip point
            var f_previous = this.f_2Sphere3Plus3D_position(previousPosition, previousDirection, signum);
            var f_current = this.f_2Sphere3Plus3D_position(currentPosition, currentDirection, signum);
            var v_previous = glMatrix.vec3.length(f_previous);
            var v_current = glMatrix.vec3.length(f_current);
            var v_average = (v_previous + v_current) * 0.5;
            var time_previous = raw_data.data[previousIndex].time;
            var arc_length_previous = raw_data.data[previousIndex].arc_length;

            //TODO: normalization step necessary?
            //glMatrix.vec3.normalize(currentPosition, currentPosition);
            //glMatrix.vec3.normalize(currentDirection, currentDirection);


            var difference = glMatrix.vec3.create();
            glMatrix.vec3.subtract(difference, currentPosition, previousPosition);
            var segment_length = glMatrix.vec3.length(difference);

            var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
            var arc_length_current = arc_length_previous + segment_length;

            //console.log("time_current", time_current);

            //push entry for current index
            var new_entry = new RawDataEntry();
            raw_data.data.push(new_entry);

            var terminate = false;

            if(this.TerminationChecks(tmp.i, time_current, arc_length_current, bo_calculate_streamlines)){
                terminate = true;
                flag = 3;//end of polyline
            }




            raw_data.data[currentIndex].flag = flag;
            raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(currentPosition[0], currentPosition[1], currentPosition[2], 1);
            raw_data.data[currentIndex].direction = glMatrix.vec4.fromValues(currentDirection[0], currentDirection[1], currentDirection[2], 1);
            raw_data.data[currentIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_current[0], f_current[1], f_current[2], signum);
            raw_data.data[currentIndex].time = time_current;
            raw_data.data[currentIndex].arc_length = arc_length_current;
            raw_data.data[currentIndex].local_i = local_i;            
            
            /*
            console.log("-------------------");
            console.log("position", raw_data.data[currentIndex].position, glMatrix.vec3.length(raw_data.data[currentIndex].position));
            console.log("direction", raw_data.data[currentIndex].direction, glMatrix.vec3.length(raw_data.data[currentIndex].direction));
            console.log("time_current", time_current);
            console.log("arc_length_current", arc_length_current);
            console.log("difference", difference);
            */

            //previousPosition = currentPosition;
            if (terminate){
                tmp.finished = true;
                this.InterpolateLastSegment(currentIndex, previousIndex, raw_data);
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

            tmp.i++;

            var t_now = performance.now();
            var t_diff = Math.ceil(t_now-t_start);
            if(t_diff > 100){
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

        }
    }

    ContinueStreamline3Sphere4Plus4D(bo_calculate_streamlines) {
        var t_start = performance.now();


        var tmp = bo_calculate_streamlines.current_streamline;
        var raw_data = bo_calculate_streamlines.raw_data;
        var signum = tmp.signum;
        //console.log("#SC: ContinueStreamline3Sphere4Plus4D", tmp.i);

        var currentPosition = glMatrix.vec4.create();
        var k1 = glMatrix.vec4.create();
        var k2 = glMatrix.vec4.create();
        var k3 = glMatrix.vec4.create();
        var k4 = glMatrix.vec4.create();
        var k1_2 = glMatrix.vec4.create();// k1_2 = k1/2
        var k2_2 = glMatrix.vec4.create();// k2_2 = k2/2
        var k1_6 = glMatrix.vec4.create();// k1_6 = k1/6
        var k2_3 = glMatrix.vec4.create();// k2_3 = k2/3
        var k3_3 = glMatrix.vec4.create();// k3_3 = k3/3
        var k4_6 = glMatrix.vec4.create();// k4_6 = k4/6
        var previous_plus_k1_2 = glMatrix.vec4.create();// previousPosition + k1/2
        var previous_plus_k2_2 = glMatrix.vec4.create();// previousPosition + k2/2
        var previous_plus_k3 = glMatrix.vec4.create();// previousPosition + k3
        var substep_currentPosition = glMatrix.vec4.create();
        var substep_previousPosition = glMatrix.vec4.create();

        var currentDirection = glMatrix.vec4.create();
        var l1 = glMatrix.vec4.create();
        var l2 = glMatrix.vec4.create();
        var l3 = glMatrix.vec4.create();
        var l4 = glMatrix.vec4.create();
        var l1_2 = glMatrix.vec4.create();// k1_2 = k1/2
        var l2_2 = glMatrix.vec4.create();// k2_2 = k2/2
        var l1_6 = glMatrix.vec4.create();// k1_6 = k1/6
        var l2_3 = glMatrix.vec4.create();// k2_3 = k2/3
        var l3_3 = glMatrix.vec4.create();// k3_3 = k3/3
        var l4_6 = glMatrix.vec4.create();// k4_6 = k4/6
        var previous_plus_l1_2 = glMatrix.vec4.create();// previousPosition + k1/2
        var previous_plus_l2_2 = glMatrix.vec4.create();// previousPosition + k2/2
        var previous_plus_l3 = glMatrix.vec4.create();// previousPosition + k3
        var substep_currentDirection = glMatrix.vec4.create();
        var substep_previousDirection = glMatrix.vec4.create();
        
        while(true){
            var local_i = tmp.i;//does not change even if duplicating point (used for point data)
            var currentIndex = tmp.startIndex + tmp.i;
            var previousIndex = currentIndex - 1;
            var previousVec4 = raw_data.data[previousIndex].position;
            var previousDirectionVec4 = raw_data.data[previousIndex].direction;
            var previousPosition = glMatrix.vec4.fromValues(previousVec4[0], previousVec4[1], previousVec4[2], previousVec4[3]);
            var previousDirection = glMatrix.vec4.fromValues(previousDirectionVec4[0], previousDirectionVec4[1], previousDirectionVec4[2], previousDirectionVec4[3]);

            /*
            console.log("-------------------");
            console.log("PRE previousPosition", previousPosition);
            console.log("PRE previousDirection", previousDirection);
*/
            //debugger;
            
            glMatrix.vec4.copy(substep_previousPosition, previousPosition);
            glMatrix.vec4.copy(substep_previousDirection, previousDirection);
            var sub_step_size = this.step_size// / (this.inbetweens + 1);
            //multiple rk4 steps
            for (var sub_step_index = 0; sub_step_index <= this.inbetweens; sub_step_index++) {
                //CALCULATE: vec3 k1 = step_size * f(substep_previousPosition, signum);
                glMatrix.vec4.scale(k1, this.f_3Sphere4Plus4D_position(substep_previousPosition, substep_previousDirection, tmp), sub_step_size);
                glMatrix.vec4.scale(l1, this.f_3Sphere4Plus4D_direction(substep_previousPosition, substep_previousDirection, tmp), sub_step_size);

                //CALCULATE: vec3 k2 = step_size * f(substep_previousPosition + k1/2, signum);
                glMatrix.vec4.scale(k1_2, k1, 1 / 2);// k1_2 = k1/2
                glMatrix.vec4.scale(l1_2, l1, 1 / 2);// k1_2 = k1/2
                glMatrix.vec4.add(previous_plus_k1_2, substep_previousPosition, k1_2);// substep_previousPosition + k1/2      
                glMatrix.vec4.add(previous_plus_l1_2, substep_previousDirection, l1_2);// substep_previousPosition + k1/2            
                glMatrix.vec4.scale(k2, this.f_3Sphere4Plus4D_position(previous_plus_k1_2, previous_plus_l1_2, tmp), sub_step_size);
                glMatrix.vec4.scale(l2, this.f_3Sphere4Plus4D_direction(previous_plus_k1_2, previous_plus_l1_2, tmp), sub_step_size);

                //CALCULATE: vec3 k3 = step_size * f(substep_previousPosition + k2/2, signum);
                glMatrix.vec4.scale(k2_2, k2, 1 / 2);// k2_2 = k2/2
                glMatrix.vec4.scale(l2_2, l2, 1 / 2);// k2_2 = k2/2
                glMatrix.vec4.add(previous_plus_k2_2, substep_previousPosition, k2_2);// substep_previousPosition + k2/2     
                glMatrix.vec4.add(previous_plus_l2_2, substep_previousDirection, l2_2);// substep_previousPosition + k2/2  
                glMatrix.vec4.scale(k3, this.f_3Sphere4Plus4D_position(previous_plus_k2_2, previous_plus_l2_2, tmp), sub_step_size);
                glMatrix.vec4.scale(l3, this.f_3Sphere4Plus4D_direction(previous_plus_k2_2, previous_plus_l2_2, tmp), sub_step_size);

                //CALCULATE: vec3 k4 = step_size * f(substep_previousPosition + k3, signum);
                glMatrix.vec4.add(previous_plus_k3, substep_previousPosition, k3);// substep_previousPosition + k3
                glMatrix.vec4.add(previous_plus_l3, substep_previousDirection, l3);// substep_previousPosition + k3
                glMatrix.vec4.scale(k4, this.f_3Sphere4Plus4D_position(previous_plus_k3, previous_plus_l3, tmp), sub_step_size);
                glMatrix.vec4.scale(l4, this.f_3Sphere4Plus4D_direction(previous_plus_k3, previous_plus_l3, tmp), sub_step_size);

                //CALCULATE: vec3 substep_currentPosition = substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6;
                glMatrix.vec4.scale(k1_6, k1, 1 / 6);// k1_6 = k1/6
                glMatrix.vec4.scale(l1_6, l1, 1 / 6);// k1_6 = k1/6
                glMatrix.vec4.scale(k2_3, k2, 1 / 3);// k2_3 = k2/3
                glMatrix.vec4.scale(l2_3, l2, 1 / 3);// k2_3 = k2/3
                glMatrix.vec4.scale(k3_3, k3, 1 / 3);// k3_3 = k3/3
                glMatrix.vec4.scale(l3_3, l3, 1 / 3);// k3_3 = k3/3
                glMatrix.vec4.scale(k4_6, k4, 1 / 6);// k4_6 = k4/6
                glMatrix.vec4.scale(l4_6, l4, 1 / 6);// k4_6 = k4/6
                glMatrix.vec4.add(substep_currentPosition, substep_previousPosition, k1_6);// substep_previousPosition + k1 / 6 
                glMatrix.vec4.add(substep_currentDirection, substep_previousDirection, l1_6);// substep_previousPosition + k1 / 6 
                glMatrix.vec4.add(substep_currentPosition, substep_currentPosition, k2_3);// substep_previousPosition + k1 / 6 + k2 / 3
                glMatrix.vec4.add(substep_currentDirection, substep_currentDirection, l2_3);// substep_previousPosition + k1 / 6 + k2 / 3
                glMatrix.vec4.add(substep_currentPosition, substep_currentPosition, k3_3);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3
                glMatrix.vec4.add(substep_currentDirection, substep_currentDirection, l3_3);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3
                glMatrix.vec4.add(substep_currentPosition, substep_currentPosition, k4_6);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6
                glMatrix.vec4.add(substep_currentDirection, substep_currentDirection, l4_6);// substep_previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6
              
                //prepare next substep iteration: copy current to previous
                glMatrix.vec4.copy(substep_previousPosition, substep_currentPosition);  
                glMatrix.vec4.copy(substep_previousDirection, substep_currentDirection);  

            }

            //after every substep, copy the final value to currentPosition
            glMatrix.vec4.copy(currentPosition, substep_currentPosition);
            glMatrix.vec4.copy(currentDirection, substep_currentDirection);

            //console.log(i, currentPosition);
            //if (this.confine_to_cube)
            //    currentPosition = this.ConfineToCube(currentPosition, previousPosition);

            //TODO: should length be both vectors combined or only position vector
            var flag = 2;//2=normal point   1=new polyline   3=end polyline   0=skip point
            var f_previous = this.f_3Sphere4Plus4D_position(previousPosition, previousDirection, tmp);
            var f_current = this.f_3Sphere4Plus4D_direction(currentPosition, currentDirection, tmp);
            var v_previous = glMatrix.vec4.length(f_previous);
            var v_current = glMatrix.vec4.length(f_current);
            var v_average = (v_previous + v_current) * 0.5;
            var time_previous = raw_data.data[previousIndex].time;
            var arc_length_previous = raw_data.data[previousIndex].arc_length;

            //TODO: normalization step necessary?
            //glMatrix.vec3.normalize(currentPosition, currentPosition);
            //glMatrix.vec3.normalize(currentDirection, currentDirection);


            var difference = glMatrix.vec4.create();
            glMatrix.vec4.subtract(difference, currentPosition, previousPosition);
            var segment_length = glMatrix.vec4.length(difference);

            var time_current = time_previous + (segment_length / v_average);//var time_current = time_previous + (this.step_size / v_average);
            var arc_length_current = arc_length_previous + segment_length;

            //console.log("time_current", time_current);

            //push entry for current index
            var new_entry = new RawDataEntry();
            raw_data.data.push(new_entry);

            var terminate = false;

            if(this.TerminationChecks(tmp.i, time_current, arc_length_current, bo_calculate_streamlines)){
                terminate = true;
                flag = 3;//end of polyline
            }




            raw_data.data[currentIndex].flag = flag;
            raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(currentPosition[0], currentPosition[1], currentPosition[2], currentPosition[3]);
            raw_data.data[currentIndex].direction = glMatrix.vec4.fromValues(currentDirection[0], currentDirection[1], currentDirection[2], currentDirection[3]);
            raw_data.data[currentIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_current[0], f_current[1], f_current[2], signum);
            raw_data.data[currentIndex].time = time_current;
            raw_data.data[currentIndex].arc_length = arc_length_current;
            raw_data.data[currentIndex].local_i = local_i;            
            
            /*
            console.log("-------------------");
            console.log("position", raw_data.data[currentIndex].position, glMatrix.vec4.length(raw_data.data[currentIndex].position));
            console.log("direction", raw_data.data[currentIndex].direction, glMatrix.vec4.length(raw_data.data[currentIndex].direction));
            console.log("time_current", time_current);
            console.log("arc_length_current", arc_length_current);
            console.log("difference", difference);
            */

            //previousPosition = currentPosition;
            if (terminate){
                tmp.finished = true;
                //this.InterpolateLastSegment(currentIndex, previousIndex, raw_data);
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

            tmp.i++;

            var t_now = performance.now();
            var t_diff = Math.ceil(t_now-t_start);
            if(t_diff > 100){
                this.UpdateTotalStreamlineProgress(tmp.i, time_current, arc_length_current, bo_calculate_streamlines);
                break;
            }

        }
    }

    TerminationChecks(i, time_current, arc_length_current, bo_calculate_streamlines){
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_POINTS){  
            //console.log("#TerminationChecks", i, time_current, arc_length_current, bo_calculate_streamlines.input_parameters.num_points_per_streamline);          
            if (i >= bo_calculate_streamlines.input_parameters.num_points_per_streamline - 1){
                return true;
            }
        }
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME){
            if(time_current > this.termination_advection_time){
                return true;
            }
        }
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH){
            if(arc_length_current > this.termination_arc_length){
                return true;
            }
        }
        return false;
    }

    InterpolateLastSegment(currentIndex, previousIndex, raw_data){
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME){
            var last_time_diff = raw_data.data[currentIndex].time - raw_data.data[previousIndex].time;
            var required_time_diff = this.termination_advection_time - raw_data.data[previousIndex].time;
            var t = required_time_diff / last_time_diff;

            var x = module_utility.lerp(raw_data.data[previousIndex].position[0], raw_data.data[currentIndex].position[0], t);
            var y = module_utility.lerp(raw_data.data[previousIndex].position[1], raw_data.data[currentIndex].position[1], t);
            var z = module_utility.lerp(raw_data.data[previousIndex].position[2], raw_data.data[currentIndex].position[2], t);
            
            raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(x, y, z, raw_data.data[currentIndex].position[3]);
            raw_data.data[currentIndex].time = this.termination_advection_time;
        }
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH){
            var last_arc_diff = raw_data.data[currentIndex].arc_length - raw_data.data[previousIndex].arc_length;
            var required_arc_diff = this.termination_arc_length - raw_data.data[previousIndex].arc_length;
            var t = required_arc_diff / last_arc_diff;

            var x = module_utility.lerp(raw_data.data[previousIndex].position[0], raw_data.data[currentIndex].position[0], t);
            var y = module_utility.lerp(raw_data.data[previousIndex].position[1], raw_data.data[currentIndex].position[1], t);
            var z = module_utility.lerp(raw_data.data[previousIndex].position[2], raw_data.data[currentIndex].position[2], t);
            
            raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(x, y, z, raw_data.data[currentIndex].position[3]);
            raw_data.data[currentIndex].arc_length = this.termination_arc_length;
        }
    }

    UpdateTotalStreamlineProgress(i, time_current, arc_length_current, bo_calculate_streamlines){
        var a = (bo_calculate_streamlines.next_streamline_index)/(this.seeds.length);
        var b = (bo_calculate_streamlines.next_streamline_index+1)/(this.seeds.length);
        var t = this.GetCurrentStreamlineProgress(i, time_current, arc_length_current, bo_calculate_streamlines);
        bo_calculate_streamlines.streamline_part_progress = module_utility.lerp(a, b, t);
        //console.log("#Pro", i, a, b, t, "num", bo_calculate_streamlines.input_parameters.num_points_per_streamline);
    }

    GetCurrentStreamlineProgress(i, time_current, arc_length_current, bo_calculate_streamlines){
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_POINTS){            
            return i / (bo_calculate_streamlines.input_parameters.num_points_per_streamline - 1);
        }
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME){
            return time_current / this.termination_advection_time;
        }
        if(this.termination_condition == STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH){
            return arc_length_current / this.termination_arc_length;
        }
        return 0;
    }

    f(vector, signum) {
        //console.log("--------------");
        //console.log("vector: ", vector, "test");
        //console.log("vector0: ", vector[0]);
        //console.log("vector1: ", vector[1]);
        //console.log("vector2: ", vector[2]);

        //MARKER_RENAME_SYMBOLS DONE 3-torus
        let scope = {
            x1: vector[0],
            x2: vector[1],
            x3: vector[2],
        };
        //console.log("scope: ", scope);
        //console.log("this.shader_formula_u: ", this.shader_formula_u);
        var u = math.evaluate(this.shader_formula_u, scope)
        var v = math.evaluate(this.shader_formula_v, scope);
        var w = math.evaluate(this.shader_formula_w, scope);
        var result = glMatrix.vec3.create();
        result[0] = u * signum;
        result[1] = v * signum;
        result[2] = w * signum;
        return result;
    }

    g(vector, signum) {
        //this.shader_formula_a = "x^2";
        //this.shader_formula_b = "y^2";
        //console.log("--------------");
        //console.log("vector: ", vector, "test");
        //console.log("vector0: ", vector[0]);
        //console.log("vector1: ", vector[1]);
        //console.log("vector2: ", vector[2]);
        
        //MARKER_RENAME_SYMBOLS DONE double pendulum
        let scope = {
            x1: vector[0],
            x2: vector[1],
            v1: vector[2],
            v2: vector[3],
        };
        //console.log("scope: ", scope);
        console.log("this.shader_formula_u: ", this.shader_formula_a);
        console.log("this.shader_formula_u: ", this.shader_formula_b);
        var u = vector[2];
        var v = vector[3];
        var a = math.evaluate(this.shader_formula_a, scope);
        var b = math.evaluate(this.shader_formula_b, scope);
        var result = glMatrix.vec4.create();
        result[0] = u * signum;
        result[1] = v * signum;
        result[2] = a * signum;
        result[3] = b * signum;
        return result;
    }

    f_2Sphere3Plus3D_position(vector_position, vector_direction,signum) {
        
        //MARKER_RENAME_SYMBOLS
        let scope = {
            p0: vector_position[0],
            p1: vector_position[1],
            p2: vector_position[2],
            d0: vector_direction[0],
            d1: vector_direction[1],
            d2: vector_direction[2]
        };
        //console.log("scope: ", scope);
        //console.log("this.shader_formula_u: ", this.shader_formula_u);
        var u = math.evaluate(this.shader_formula_p0, scope)
        var v = math.evaluate(this.shader_formula_p1, scope);
        var w = math.evaluate(this.shader_formula_p2, scope);
        var result = glMatrix.vec3.create();
        result[0] = u * signum;
        result[1] = v * signum;
        result[2] = w * signum;
        /*
        console.log("shader_formula_p0:", this.shader_formula_p0);
        console.log("shader_formula_p1:", this.shader_formula_p1);
        console.log("shader_formula_p2:", this.shader_formula_p2);
        console.log("u:", u);
        console.log("v:", v);
        console.log("w:", w);
        console.log("signum:", signum);
        console.log("f_2Sphere3Plus3D_position:", result);
        debugger;
        */
        return result;
    }

    f_2Sphere3Plus3D_direction(vector_position, vector_direction, signum) {

        //MARKER_RENAME_SYMBOLS
        let scope = {
            p0: vector_position[0],
            p1: vector_position[1],
            p2: vector_position[2],
            d0: vector_direction[0],
            d1: vector_direction[1],
            d2: vector_direction[2]
        };
        //console.log("scope: ", scope);
        //console.log("this.shader_formula_u: ", this.shader_formula_u);
        var u = math.evaluate(this.shader_formula_d0, scope)
        var v = math.evaluate(this.shader_formula_d1, scope);
        var w = math.evaluate(this.shader_formula_d2, scope);
        var result = glMatrix.vec3.create();
        
        result[0] = u * signum;
        result[1] = v * signum;
        result[2] = w * signum;
        
            /*
        console.log("shader_formula_d0:", this.shader_formula_d0);
        console.log("shader_formula_d1:", this.shader_formula_d1);
        console.log("shader_formula_d2:", this.shader_formula_d2);
        console.log("u:", u);
        console.log("v:", v);
        console.log("w:", w);
        console.log("signum:", signum);
        console.log("f_2Sphere3Plus3D_direction:", result);
        debugger;
        */
        
        return result;
    }

    f_3Sphere4Plus4D_position(vector_position, vector_direction, current_streamline) {
        var signum = current_streamline.signum;
        var delta = current_streamline.delta;//for magnetic streamlines
        var s = current_streamline.s;//for magnetic streamlines

        //MARKER_RENAME_SYMBOLS DONE 3-sphere
        let scope = {
            x1: vector_position[0],
            x2: vector_position[1],
            x3: vector_position[2],
            x4: vector_position[3],
            v1: vector_direction[0],
            v2: vector_direction[1],
            v3: vector_direction[2],
            v4: vector_direction[3],
            delta : delta,
            s : s
        };
        //console.log("scope: ", scope);
        //console.log("this.shader_formula_p0: ", this.shader_formula_p0);
        var u = math.evaluate(this.shader_formula_p0, scope);
        var v = math.evaluate(this.shader_formula_p1, scope);
        var w = math.evaluate(this.shader_formula_p2, scope);
        var x = math.evaluate(this.shader_formula_p3, scope);
        var result = glMatrix.vec4.create();
        result[0] = u * signum;
        result[1] = v * signum;
        result[2] = w * signum;
        result[3] = x * signum;
        /*
        console.log("shader_formula_p0:", this.shader_formula_p0);
        console.log("shader_formula_p1:", this.shader_formula_p1);
        console.log("shader_formula_p2:", this.shader_formula_p2);
        console.log("u:", u);
        console.log("v:", v);
        console.log("w:", w);
        console.log("signum:", signum);
        console.log("f_2Sphere3Plus3D_position:", result);
        debugger;
        */
        return result;
    }

    f_3Sphere4Plus4D_direction(vector_position, vector_direction, current_streamline) {
        var signum = current_streamline.signum;
        var delta = current_streamline.delta;//for magnetic streamlines
        var s = current_streamline.s;//for magnetic streamlines

        //MARKER_RENAME_SYMBOLS DONE 3-sphere
        let scope = {
            x1: vector_position[0],
            x2: vector_position[1],
            x3: vector_position[2],
            x4: vector_position[3],
            v1: vector_direction[0],
            v2: vector_direction[1],
            v3: vector_direction[2],
            v4: vector_direction[3],
            delta : delta,
            s : s
        };
        //console.log("scope: ", scope);
        //console.log("this.shader_formula_u: ", this.shader_formula_u);
        var u = math.evaluate(this.shader_formula_d0, scope)
        var v = math.evaluate(this.shader_formula_d1, scope);
        var w = math.evaluate(this.shader_formula_d2, scope);
        var x = math.evaluate(this.shader_formula_d3, scope);
        var result = glMatrix.vec4.create();
        
        result[0] = u * signum;
        result[1] = v * signum;
        result[2] = w * signum;
        result[3] = x * signum;
        
            /*
        console.log("shader_formula_d0:", this.shader_formula_d0);
        console.log("shader_formula_d1:", this.shader_formula_d1);
        console.log("shader_formula_d2:", this.shader_formula_d2);
        console.log("u:", u);
        console.log("v:", v);
        console.log("w:", w);
        console.log("signum:", signum);
        console.log("f_2Sphere3Plus3D_direction:", result);
        debugger;
        */
        
        return result;
    }

    CheckFinite(position){
        for(var i=0; i< position.length; i++){
            if(!Number.isFinite(position[i])){
                return false;
            }
        }
        return true;
    }

    CheckOutOfBounds3(position) {
        for (var i = 0; i < 3; i++)
            if (position[i] > 1 || position[i] < 0)
                return true;
        return false;
    }

    CheckOutOfBounds2(position) {
        for (var i = 0; i < 2; i++)
            if (position[i] > 1 || position[i] < 0)
                return true;
        return false;
    }

    MoveOutOfBounds3(position) {
        //MARKER_RENAME_SYMBOLS DONE RULE
        //user friendly variables
        var x1 = position[0];
        var x2 = position[1];
        var x3 = position[2];
        //additional "constant" variables for this calculation
        //var x0 = x;
        //var y0 = y;
        //var z0 = z;

        let scope = {
            x1: x1,
            x2: x2,
            x3: x3,
        };

        if (x1 > 1) {
            scope.x1 = math.evaluate(this.shader_rule_x_pos_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_x_pos_y, scope);
            scope.x3 = math.evaluate(this.shader_rule_x_pos_z, scope);
        }
        else if (x1 < 0) {
            scope.x1 = math.evaluate(this.shader_rule_x_neg_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_x_neg_y, scope);
            scope.x3 = math.evaluate(this.shader_rule_x_neg_z, scope);
        }

        if (x2 > 1) {
            scope.x1 = math.evaluate(this.shader_rule_y_pos_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_y_pos_y, scope);
            scope.x3 = math.evaluate(this.shader_rule_y_pos_z, scope);
        }
        else if (x2 < 0) {
            scope.x1 = math.evaluate(this.shader_rule_y_neg_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_y_neg_y, scope);
            scope.x3 = math.evaluate(this.shader_rule_y_neg_z, scope);
        }

        if (x3 > 1) {
            scope.x1 = math.evaluate(this.shader_rule_z_pos_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_z_pos_y, scope);
            scope.x3 = math.evaluate(this.shader_rule_z_pos_z, scope);
        }
        else if (x3 < 0) {
            scope.x1 = math.evaluate(this.shader_rule_z_neg_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_z_neg_y, scope);
            scope.x3 = math.evaluate(this.shader_rule_z_neg_z, scope);
        }

        return glMatrix.vec3.fromValues(scope.x1, scope.x2, scope.x3);
    }

    MoveOutOfBoundsDirection3(position, direction){
        //user friendly variables
        var x1 = position[0];
        var x2 = position[1];
        var x3 = position[2];
        var v1 = direction[0];
        var v2 = direction[1];
        var v3 = direction[2];

        let scope = {
            x1: x1,
            x2: x2,
            x3: x3,
            v1: v1,
            v2: v2,
            v3: v3,
        };

        if (x1 > 1) {
            scope.v1 = math.evaluate(this.shader_rule_x_pos_u, scope);
            scope.v2 = math.evaluate(this.shader_rule_x_pos_v, scope);
            scope.v3 = math.evaluate(this.shader_rule_x_pos_w, scope);
        }
        else if (x1 < 0) {
            scope.v1 = math.evaluate(this.shader_rule_x_neg_u, scope);
            scope.v2 = math.evaluate(this.shader_rule_x_neg_v, scope);
            scope.v3 = math.evaluate(this.shader_rule_x_neg_w, scope);
        }

        if (x2 > 1) {
            scope.v1 = math.evaluate(this.shader_rule_y_pos_u, scope);
            scope.v2 = math.evaluate(this.shader_rule_y_pos_v, scope);
            scope.v3 = math.evaluate(this.shader_rule_y_pos_w, scope);
        }
        else if (x2 < 0) {
            scope.v1 = math.evaluate(this.shader_rule_y_neg_u, scope);
            scope.v2 = math.evaluate(this.shader_rule_y_neg_v, scope);
            scope.v3 = math.evaluate(this.shader_rule_y_neg_w, scope);
        }

        if (x3 > 1) {
            scope.v1 = math.evaluate(this.shader_rule_z_pos_u, scope);
            scope.v2 = math.evaluate(this.shader_rule_z_pos_v, scope);
            scope.v3 = math.evaluate(this.shader_rule_z_pos_w, scope);
        }
        else if (x3 < 0) {
            scope.v1 = math.evaluate(this.shader_rule_z_neg_u, scope);
            scope.v2 = math.evaluate(this.shader_rule_z_neg_v, scope);
            scope.v3 = math.evaluate(this.shader_rule_z_neg_w, scope);
        }

        return glMatrix.vec3.fromValues(scope.v1, scope.v2, scope.v3);
    }

    MoveOutOfBounds4(position) {
        //MARKER_RENAME_SYMBOLS DONE RULE
        //console.log("MoveOutOfBounds4: "+position[0] + ", " + position[1] + ", " + position[2] + ", " + position[3]);
        //user friendly variables
        var x1 = position[0];
        var x2 = position[1];
        var v1 = position[2];
        var v2 = position[3];
        //additional "constant" variables for this calculation
        //var x0 = x;
        //var y0 = y;
        //var v_x0 = v_x;
        //var v_y0 = v_y;

        let scope = {
            x1: x1,
            x2: x2,
            v1: v1,
            v2: v2,
        };

        if (x1 > 1) {
            //console.log("shader_rule_x_pos_x: "+this.shader_rule_x_pos_x);
            scope.x1 = math.evaluate(this.shader_rule_x_pos_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_x_pos_y, scope);
            //scope.v_x = math.evaluate(this.shader_rule_x_pos_v_x, scope);
            //scope.v_y = math.evaluate(this.shader_rule_x_pos_v_y, scope);
        }
        else if (x1 < 0) {
            scope.x1 = math.evaluate(this.shader_rule_x_neg_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_x_neg_y, scope);
            //scope.v_x = math.evaluate(this.shader_rule_x_neg_v_x, scope);
            //scope.v_y = math.evaluate(this.shader_rule_x_neg_v_y, scope);
        }

        if (x2 > 1) {
            scope.x1 = math.evaluate(this.shader_rule_y_pos_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_y_pos_y, scope);
            //scope.v_x = math.evaluate(this.shader_rule_y_pos_v_x, scope);
            //scope.v_y = math.evaluate(this.shader_rule_y_pos_v_y, scope);
        }
        else if (x2 < 0) {
            scope.x1 = math.evaluate(this.shader_rule_y_neg_x, scope);
            scope.x2 = math.evaluate(this.shader_rule_y_neg_y, scope);
            //scope.v_x = math.evaluate(this.shader_rule_y_neg_v_x, scope);
            //scope.v_y = math.evaluate(this.shader_rule_y_neg_v_y, scope);
        }
        /*
        if (v_x > 1) {
            scope.x = math.evaluate(this.shader_rule_v_x_pos_x, scope);
            scope.y = math.evaluate(this.shader_rule_v_x_pos_y, scope);
            scope.v_x = math.evaluate(this.shader_rule_v_x_pos_v_x, scope);
            scope.v_y = math.evaluate(this.shader_rule_v_x_pos_v_y, scope);
        }
        else if (v_x < 0) {
            scope.x = math.evaluate(this.shader_rule_v_x_neg_x, scope);
            scope.y = math.evaluate(this.shader_rule_v_x_neg_y, scope);
            scope.v_x = math.evaluate(this.shader_rule_v_x_neg_v_x, scope);
            scope.v_y = math.evaluate(this.shader_rule_v_x_neg_v_y, scope);
        }

        if (v_y > 1) {
            scope.x = math.evaluate(this.shader_rule_v_y_pos_x, scope);
            scope.y = math.evaluate(this.shader_rule_v_y_pos_y, scope);
            scope.v_x = math.evaluate(this.shader_rule_v_y_pos_v_x, scope);
            scope.v_y = math.evaluate(this.shader_rule_v_y_pos_v_y, scope);
        }
        else if (v_y < 0) {
            scope.x = math.evaluate(this.shader_rule_v_y_neg_x, scope);
            scope.y = math.evaluate(this.shader_rule_v_y_neg_y, scope);
            scope.v_x = math.evaluate(this.shader_rule_v_y_neg_v_x, scope);
            scope.v_y = math.evaluate(this.shader_rule_v_y_neg_v_y, scope);
        }
        */
        return glMatrix.vec4.fromValues(scope.x1, scope.x2, scope.v1, scope.v2);
    }

    //vec3 currentPosition, previousPosition
    ConfineToCube(currentPosition, previousPosition) {
        //return currentPosition;
        var confine = false;
        var min_t = 1000000;
        for (var i = 0; i < 3; i++) {
            if (currentPosition[i] < 0) {
                confine = true;
                var t = this.ExtractLinearPercentage(previousPosition[i], currentPosition[i], 0);
                if (t < min_t)
                    min_t = t;
            }
            if (currentPosition[i] > 1) {
                confine = true;
                var t = this.ExtractLinearPercentage(previousPosition[i], currentPosition[i], 1);
                if (t < min_t)
                    min_t = t;
            }
        }

        if (confine) {
            //vec3 direction = currentPosition - previousPosition;
            var direction = glMatrix.vec3.create();
            glMatrix.vec3.subtract(direction, currentPosition, previousPosition);
            //vec3 direction_normalized = normalize(direction);
            var direction_normalized = glMatrix.vec3.create();
            glMatrix.vec3.normalize(direction_normalized, direction);
            //return previousPosition + min_t * direction + epsilon_move_just_outside_cube * direction_normalized;
            var result = glMatrix.vec3.clone(previousPosition);//previousPosition + ...
            var tmp = glMatrix.vec3.create();
            //... + min_t * direction + ...
            glMatrix.vec3.scale(tmp, direction, min_t)
            glMatrix.vec3.add(result, result, tmp);
            //... + epsilon_move_just_outside_cube * direction_normalized + ...
            glMatrix.vec3.scale(tmp, direction_normalized, this.epsilon_move_just_outside_cube)
            glMatrix.vec3.add(result, result, tmp);
            return result;

        }

        return currentPosition;
    }

    //float a, b, value
    ExtractLinearPercentage(a, b, value) {
        return (value - a) / (b - a);
    }

}

module.exports = StreamlineGenerator;