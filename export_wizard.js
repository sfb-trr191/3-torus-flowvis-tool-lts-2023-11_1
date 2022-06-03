
class ExportWizard{

    constructor(){
        this.page = 1;
        this.sheduled_task = TASK_NONE;
        this.list_indices = [];
        this.list_pages = [];
        this.list_page_buttons = [];
        this.addPages();
        this.addListeners();
        this.addListenersExportChangedResolution();
    }

    addPages(){
        this.list_indices.push(1);
        this.list_indices.push(2);
        this.list_indices.push(3);

        this.list_pages.push(document.getElementById("export_page_1"));        
        this.list_pages.push(document.getElementById("export_page_2"));        
        this.list_pages.push(document.getElementById("export_page_3"));

        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_1"));
        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_2"));
        this.list_page_buttons.push(document.getElementById("group_properties_export_buttons_page_3"));
    }

    addListeners() {
        document.getElementById("button_open_dialog_export").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "wrapper";
            this.setToDefaultResolution();
            this.loadPage(1);
        });
        
        //PAGE 1
        document.getElementById("button_dialog_export_page_1_cancel").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "hidden";
        });
        document.getElementById("button_dialog_export_page_1_skip").addEventListener("click", (event) => {
            this.loadPage(2);
        });
        document.getElementById("button_dialog_export_page_1_next").addEventListener("click", (event) => {
            this.sheduled_task = TASK_EXPORT_THUMBNAIL;
            this.loadPage(2);
        });

        //PAGE 2
        document.getElementById("button_dialog_export_page_2_cancel").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "hidden";
        });
        document.getElementById("button_dialog_export_page_2_next").addEventListener("click", (event) => {
            this.loadPage(3);
        });

        //PAGE 3
        document.getElementById("button_dialog_export_page_3_cancel").addEventListener("click", (event) => {
            document.getElementById("wrapper_dialog_export").className = "hidden";
        });
        document.getElementById("button_dialog_export_page_3_finish").addEventListener("click", (event) => {
            this.sheduled_task = TASK_EXPORT_LATEX;
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

        var max_size = 5760 * 5760;
        var above_max = size_main > max_size || size_aux > max_size;
        var class_name = "hidden";
        var allow_thumbnail_warning = true;
        if(check_max_size && above_max){
            class_name = "warning";
            allow_thumbnail_warning = false;
        }
        document.getElementById("warning_export_size").className = class_name;
        
        var recommended = 1000000;
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
    
}

module.exports = ExportWizard;
