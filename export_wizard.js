
class ExportWizard{

    constructor(){
        this.page = 1;
        this.sheduled_task = TASK_NONE;
        this.list_indices = [];
        this.list_pages = [];
        this.list_page_buttons = [];
        this.addPages();
        this.addListeners();
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

    getSheduledTask(){
        var task = this.sheduled_task;
        this.sheduled_task = TASK_NONE;
        return task;
    }

    loadPage(number){
        console.log("EXP: loadPage,",number);
        this.page = number;

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
