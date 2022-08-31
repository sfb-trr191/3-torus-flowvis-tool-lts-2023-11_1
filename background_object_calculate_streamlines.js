const JSZip = require("jszip");
const FileSaver = require("file-saver");

class BackgroundObjectCalculateStreamlines{
    constructor(gl, gl_side){
        this.gl = gl;
        this.gl_side = gl_side;
        this.input_parameters = new Object();
        this.current_streamline = new Object();
        this.finished = false;
        this.test_index = 0;
        this.grabInputParameters();
        this.ResetProgress();
    }

    grabInputParameters(){
        this.input_parameters.shader_formula_u = document.getElementById("input_field_equation_u").value;
        this.input_parameters.shader_formula_v = document.getElementById("input_field_equation_v").value;
        this.input_parameters.shader_formula_w = document.getElementById("input_field_equation_w").value;
        this.input_parameters.shader_formula_a = document.getElementById("input_field_equation_a").value;
        this.input_parameters.shader_formula_b = document.getElementById("input_field_equation_b").value;
        this.input_parameters.num_points_per_streamline = document.getElementById("input_num_points_per_streamline").value;
        this.input_parameters.step_size = document.getElementById("input_step_size").value;
        this.input_parameters.inbetweens = document.getElementById("input_streamline_calculation_inbetweens").value;
        this.input_parameters.segment_duplicator_iterations = document.getElementById("segment_duplicator_iterations").value;
        this.input_parameters.space = parseInt(document.getElementById("select_space").value);
        this.input_parameters.direction = parseInt(document.getElementById("select_streamline_calculation_direction").value);

        this.input_parameters.streamline_calculation_method = document.getElementById("select_streamline_calculation_method").value;
        this.input_parameters.tube_radius_fundamental = parseFloat(document.getElementById("input_tube_radius_fundamental").value);
        this.input_parameters.max_radius_factor_highlight = parseFloat(document.getElementById("input_max_radius_factor_highlight").value);

        this.input_parameters.termination_condition = parseInt(document.getElementById("select_streamline_termination_method").value);
        this.input_parameters.termination_advection_time = parseFloat(document.getElementById("input_streamline_calculation_advection_time").value);
        this.input_parameters.termination_arc_length = parseFloat(document.getElementById("input_streamline_calculation_arc_length").value);
    }

    start(){
        this.t_start = performance.now();
        console.log("#SC start: ", this.t_start);

        
    } 
    
    ResetProgress(){
        var width = 0;
        document.getElementById("progress_bar_calculate_streamlines_default").style.width = width + '%';     
        document.getElementById("progress_bar_calculate_streamlines_outside").style.width = width + '%';     
    }

    OnProgressChanged(fraction){  
        var width = Math.round(100 * fraction);
        var element_string = this.part_index == PART_INDEX_DEFAULT ? "progress_bar_calculate_streamlines_default" : "progress_bar_calculate_streamlines_outside";
        document.getElementById(element_string).style.width = width + '%'; 
        
    } 

}

module.exports = BackgroundObjectCalculateStreamlines;