
class ExportWizard{

    constructor(){
        this.recommended_thumbnail_budget = 1000000;
        this.recommended_export_budget = 33177600;
        this.max_export_budget = 33177600;
        this.page = 1;
        this.sheduled_task = TASK_NONE;
        this.list_indices = [];
        this.list_pages = [];
        this.list_page_buttons = [];
        this.cancel = false;
        this.addPages();
        this.addListeners();
        this.addListenersExportChangedResolution();
    }

    addPages(){
        this.list_indices.push(1);
        this.list_indices.push(2);
        this.list_indices.push(3);
        this.list_indices.push(4);
        this.list_indices.push(5);

        this.list_pages.push(document.getElementById("export_page_1"));        
        this.list_pages.push(document.getElementById("export_page_2"));        
        this.list_pages.push(document.getElementById("export_page_3"));    
        this.list_pages.push(document.getElementById("export_page_4"));    
        this.list_pages.push(document.getElementById("export_page_5"));

        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_1"));
        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_2"));
        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_3"));
        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_4"));
        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_5"));
    }

    addListeners() {
        document.getElementById("button_open_dialog_export").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "wrapper";
            this.setToRecommendedResolution();
            this.loadPage(1);
            this.cancel = false;
        });
        
        //PAGE 1 - Step 1
        document.getElementById("button_dialog_export_page_1_cancel").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "hidden";
        });
        document.getElementById("button_dialog_export_page_1_skip").addEventListener("click", (event) => {
            this.loadPage(3);
        });
        document.getElementById("button_dialog_export_page_1_next").addEventListener("click", (event) => {
            this.sheduled_task = TASK_EXPORT_THUMBNAIL;
            this.loadPage(2);
        });

        //PAGE 2 - Waiting
        document.getElementById("button_dialog_export_page_2_cancel").addEventListener("click", (event) => {
            this.cancel = true;
        });

        //PAGE 3 - Step 2
        document.getElementById("button_dialog_export_page_3_cancel").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "hidden";
        });
        document.getElementById("button_dialog_export_page_3_next").addEventListener("click", (event) => {
            this.loadPage(4);
        });

        //PAGE 4 - Step 3
        document.getElementById("button_dialog_export_page_4_cancel").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "hidden";
        });
        document.getElementById("button_dialog_export_page_4_finish").addEventListener("click", (event) => {
            this.sheduled_task = TASK_EXPORT_LATEX;
            this.loadPage(5);
        });

        //PAGE 5 - Waiting
        document.getElementById("button_dialog_export_page_5_cancel").addEventListener("click", (event) => {
            this.cancel = true;
        });
    }

    addListenersExportChangedResolution(){
        //thumbnail
        document.getElementById("input_export_thumbnail_width_main").addEventListener("change", (event) => {
            var width = parseInt(document.getElementById("input_export_thumbnail_width_main").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_main").value);
            document.getElementById("input_export_thumbnail_height_main").value = Math.round(width / aspect_ratio); 
            this.checkExportSizeWarning();
        });
        document.getElementById("input_export_thumbnail_width_aux").addEventListener("change", (event) => {
            var width = parseInt(document.getElementById("input_export_thumbnail_width_aux").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_aux").value);
            document.getElementById("input_export_thumbnail_height_aux").value = Math.round(width / aspect_ratio); 
            this.checkExportSizeWarning();
        });
        document.getElementById("input_export_thumbnail_height_main").addEventListener("change", (event) => {
            var height = parseInt(document.getElementById("input_export_thumbnail_height_main").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_main").value);
            document.getElementById("input_export_thumbnail_width_main").value = Math.round(height * aspect_ratio); 
            this.checkExportSizeWarning();
        });
        document.getElementById("input_export_thumbnail_height_aux").addEventListener("change", (event) => {
            var height = parseInt(document.getElementById("input_export_thumbnail_height_aux").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_aux").value);
            document.getElementById("input_export_thumbnail_width_aux").value = Math.round(height * aspect_ratio); 
            this.checkExportSizeWarning();
        });
        //export
        document.getElementById("input_export_width_main").addEventListener("change", (event) => {
            var width = parseInt(document.getElementById("input_export_width_main").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_main").value);
            document.getElementById("input_export_height_main").value = Math.round(width / aspect_ratio); 
            this.checkExportSizeWarning();
        });
        document.getElementById("input_export_width_aux").addEventListener("change", (event) => {
            var width = parseInt(document.getElementById("input_export_width_aux").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_aux").value);
            document.getElementById("input_export_height_aux").value = Math.round(width / aspect_ratio); 
            this.checkExportSizeWarning();
        });
        document.getElementById("input_export_height_main").addEventListener("change", (event) => {
            var height = parseInt(document.getElementById("input_export_height_main").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_main").value);
            document.getElementById("input_export_width_main").value = Math.round(height * aspect_ratio); 
            this.checkExportSizeWarning();
        });
        document.getElementById("input_export_height_aux").addEventListener("change", (event) => {
            var height = parseInt(document.getElementById("input_export_height_aux").value);
            var aspect_ratio = parseFloat(document.getElementById("input_current_aspect_ratio_aux").value);
            document.getElementById("input_export_width_aux").value = Math.round(height * aspect_ratio); 
            this.checkExportSizeWarning();
        });
    }

    setToDefaultResolution(){
        document.getElementById("input_export_thumbnail_width_main").value = document.getElementById("input_current_resolution_width_main").value;
        document.getElementById("input_export_thumbnail_height_main").value = document.getElementById("input_current_resolution_height_main").value;
        document.getElementById("input_export_thumbnail_width_aux").value = document.getElementById("input_current_resolution_width_aux").value;
        document.getElementById("input_export_thumbnail_height_aux").value = document.getElementById("input_current_resolution_height_aux").value;

        document.getElementById("input_export_width_main").value = document.getElementById("input_current_resolution_width_main").value;
        document.getElementById("input_export_height_main").value = document.getElementById("input_current_resolution_height_main").value;
        document.getElementById("input_export_width_aux").value = document.getElementById("input_current_resolution_width_aux").value;
        document.getElementById("input_export_height_aux").value = document.getElementById("input_current_resolution_height_aux").value;
    }

    setToRecommendedResolution(){
        var recommended = this.recommended_thumbnail_budget;
        this.setToResolution(recommended, "input_export_thumbnail_width_main", "input_export_thumbnail_height_main", "input_current_aspect_ratio_main");
        this.setToResolution(recommended, "input_export_thumbnail_width_aux", "input_export_thumbnail_height_aux", "input_current_aspect_ratio_aux");
    
        var recommended = this.recommended_export_budget;
        this.setToResolution(recommended, "input_export_width_main", "input_export_height_main", "input_current_aspect_ratio_main");
        this.setToResolution(recommended, "input_export_width_aux", "input_export_height_aux", "input_current_aspect_ratio_aux" );
    }

    setToResolution(recommended, width_export_name, height_export_name, name_aspect_ratio){
        /**
         * Rectangle with height a and width ab and area c where b is the aspect ratio factor
         * a*ab = c
         * a^2 = c/b
         * a = sqrt(c/b)
         */
        var aspect_ratio = parseFloat(document.getElementById(name_aspect_ratio).value);
        var height_value = Math.floor(Math.sqrt(recommended / aspect_ratio));//a = sqrt(c/b)
        var width_value = Math.floor(height_value * aspect_ratio);
        document.getElementById(width_export_name).value = width_value;
        document.getElementById(height_export_name).value = height_value;
        this.snapToStandardResolutions(width_export_name, height_export_name);
    }

    snapToStandardResolutions(width_export_name, height_export_name){
        var width_value = parseInt(document.getElementById(width_export_name).value);
        var height_value = parseInt(document.getElementById(height_export_name).value);

        this.snapToResolution(width_value, height_value, 7680, 4320, width_export_name, height_export_name);//16:9
        this.snapToResolution(width_value, height_value, 5760, 5760, width_export_name, height_export_name);// 1:1
        
        this.snapToResolution(width_value, height_value, 1000, 1000, width_export_name, height_export_name);// 1:1

    }

    snapToResolution(width, height, reference_width, reference_height, width_export_name, height_export_name){
        if(this.isCloseToResolution(width, height, reference_width, reference_height)){
            document.getElementById(width_export_name).value = reference_width;
            document.getElementById(height_export_name).value = reference_height;
        }
    }

    isCloseToResolution(width, height, reference_width, reference_height){
        var threshold = 0.0025;
        var error_width = Math.abs(width-reference_width) / reference_width;
        var error_height = Math.abs(height-reference_height) / reference_height;
        return error_width < threshold && error_height < threshold;
    }

    checkExportSizeWarning(){
        var check_max_size = false;
        var check_thumbnail = false;
        var width_main;
        var height_main;
        var width_aux;
        var height_aux;
        if (this.page == 1){
            width_main = parseInt(document.getElementById("input_export_thumbnail_width_main").value);
            height_main = parseInt(document.getElementById("input_export_thumbnail_height_main").value);
            width_aux = parseInt(document.getElementById("input_export_thumbnail_width_aux").value);
            height_aux = parseInt(document.getElementById("input_export_thumbnail_height_aux").value);    
            check_max_size = true;
            check_thumbnail = true;
        }
        if(this.page == 3){
            width_main = parseInt(document.getElementById("input_export_width_main").value);
            height_main = parseInt(document.getElementById("input_export_height_main").value);
            width_aux = parseInt(document.getElementById("input_export_width_aux").value);
            height_aux = parseInt(document.getElementById("input_export_height_aux").value);
            check_max_size = true;
        }

        var size_main = width_main * height_main;
        var size_aux = width_aux * height_aux;

        var max_size = this.max_export_budget;
        var above_max = size_main > max_size || size_aux > max_size;
        var class_name = "hidden";
        var allow_thumbnail_warning = true;
        if(check_max_size && above_max){
            class_name = "warning";
            allow_thumbnail_warning = false;
        }
        document.getElementById("warning_export_size").className = class_name;
        
        var recommended = this.recommended_thumbnail_budget;
        var above_recommended = size_main > recommended || size_aux > recommended;
        var class_name = "hidden";
        if (check_thumbnail && above_recommended && allow_thumbnail_warning) {
            class_name = "warning";
        }
        document.getElementById("warning_thumbnail_size").className = class_name;
    }

    getSheduledTask(){
        var task = this.sheduled_task;
        this.sheduled_task = TASK_NONE;
        return task;
    }

    loadPage(number){
        console.log("EXP: loadPage,",number);
        this.page = number;
        this.checkExportSizeWarning();

        for(var i=0; i<this.list_indices.length; i++){
            var index = this.list_indices[i];
            if(this.page === index){
                this.list_pages[i].className = "subgroup_properties";
                this.list_page_buttons[i].className = "group_properties_export_buttons";                
            }else{
                this.list_pages[i].className = "hidden";
                this.list_page_buttons[i].className = "hidden";       
            }
        }

    }

    OnExportFinished(){
        console.log("OnExportFinished");
        if(this.page === 2){
            this.loadPage(this.page + 1);
        }
        else{
            document.getElementById("wrapper_dialog_export").className = "hidden";
        }
    }

    OnExportCancelled(){
        console.log("OnExportCancelled");
        document.getElementById("wrapper_dialog_export").className = "hidden";

    }
    
}

module.exports = ExportWizard;
