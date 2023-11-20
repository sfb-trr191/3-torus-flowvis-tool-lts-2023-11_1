const JSZip = require("jszip");
const FileSaver = require("file-saver");

class BackgroundObjectCalculateFTLE{
    constructor(gl, gl_side, sheduled_task){
        this.gl = gl;
        this.gl_side = gl_side;
        this.sheduled_task = sheduled_task;
        this.input_parameters = new Object();
        this.tmp = new Object();//stores temporary variables like "i" in a loop
        this.finished = false;
        this.grabInputParameters();
        this.ResetProgress();
    }

    grabInputParameters(){
        this.input_parameters.dim_x = parseInt(document.getElementById("input_ftle_dim_x").value);
        this.input_parameters.dim_y = parseInt(document.getElementById("input_ftle_dim_y").value);
        this.input_parameters.dim_z = parseInt(document.getElementById("input_ftle_dim_z").value);
        this.input_parameters.termination_condition = parseInt(document.getElementById("select_ftle_termination_method").value);
        this.input_parameters.advection_time = parseFloat(document.getElementById("input_ftle_advection_time").value);
        this.input_parameters.termination_arc_length = parseFloat(document.getElementById("input_ftle_termination_arc_length").value);
        this.input_parameters.step_size = parseFloat(document.getElementById("input_ftle_step_size").value);
        this.input_parameters.force_symmetric = document.getElementById("input_ftle_calculation_force_symmetric").checked;
        this.input_parameters.always_central_differences = document.getElementById("input_ftle_calculation_always_central_differences").checked;

        
    }

    start(){
        this.t_start = performance.now();
        //console.log("#Performance FTLE start: ", this.t_start);        
    } 

    finish(){
        this.t_stop = performance.now();
        //console.log("#Performance FTLE end: ", this.t_stop);   
        var t = Math.ceil(this.t_stop-this.t_start) 
        console.log("#Paper Performance FTLE finished in: ", t, "ms");            
    }
    
    ResetProgress(){
        var width = 0;
        document.getElementById("progress_bar_calculate_ftle_1").style.width = width + '%';     
        document.getElementById("progress_bar_calculate_ftle_2").style.width = width + '%';    
        document.getElementById("progress_bar_calculate_ftle_3").style.width = width + '%';     
        document.getElementById("progress_bar_calculate_ftle_4").style.width = width + '%';     
        document.getElementById("progress_bar_calculate_ftle_5").style.width = width + '%';   
        document.getElementById("progress_bar_calculate_ftle_6").style.width = width + '%';   
         
    }

    OnProgressChanged(fraction, element_string){  
        var width = Math.round(100 * fraction);
        //var element_string = true ? "progress_bar_calculate_ftle_1" : "progress_bar_calculate_ftle_2";
        document.getElementById(element_string).style.width = width + '%'; 
        
    } 

}

module.exports = BackgroundObjectCalculateFTLE;