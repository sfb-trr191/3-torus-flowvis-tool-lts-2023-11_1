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
        this.input_parameters.advection_time = parseFloat(document.getElementById("input_ftle_advection_time").value);
        this.input_parameters.step_size = parseFloat(document.getElementById("input_ftle_step_size").value);
    }

    start(){
        this.t_start = performance.now();
        console.log("#SC start: ", this.t_start);        
    } 
    
    ResetProgress(){
        var width = 0;
        document.getElementById("progress_bar_calculate_ftle_1").style.width = width + '%';     
        document.getElementById("progress_bar_calculate_ftle_2").style.width = width + '%';    
        document.getElementById("progress_bar_calculate_ftle_3").style.width = width + '%';     
        document.getElementById("progress_bar_calculate_ftle_4").style.width = width + '%';   
         
    }

    OnProgressChanged(fraction, element_string){  
        var width = Math.round(100 * fraction);
        //var element_string = true ? "progress_bar_calculate_ftle_1" : "progress_bar_calculate_ftle_2";
        document.getElementById(element_string).style.width = width + '%'; 
        
    } 

}

module.exports = BackgroundObjectCalculateFTLE;