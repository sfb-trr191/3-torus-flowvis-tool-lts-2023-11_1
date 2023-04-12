class LayoutEntry{
    constructor(ui_tools, key, name, id_button, css){
        this.ui_tools = ui_tools;
        this.key = key;//id used for saving etc.
        this.name = name;
        this.id_button = id_button;
        this.css = css;
        this.button = document.getElementById(id_button);

        this.button.addEventListener("click", (event) => {
            if(this.ui_tools.block_all_input){
                return;
            }
            this.select();
        });
        
    }

    select(){
        this.ui_tools.selected_layout_key = this.key;
        this.ui_tools.setCSS(this.css);
        this.ui_tools.DeselectAll();
        this.button.className = "tools_button_selected";    
    }
}

class ControlModeEntry{
    constructor(ui_tools, key, name, id_button){
        this.ui_tools = ui_tools;
        this.key = key;//id used for saving etc.
        this.name = name;
        this.id_button = id_button;
        this.button = document.getElementById(id_button);

        this.button.addEventListener("click", (event) => {
            if(this.ui_tools.block_all_input){
                return;
            }
            this.select();
        });
        
    }

    select(){
        this.ui_tools.selected_control_mode_key = this.key;
        this.ui_tools.DeselectAllControlModeEntry();
        this.button.className = "tools_button_selected";    
    }
}

class UiTools{
    constructor() {
        this.block_all_input = false;
        this.selected_layout_key = this.getDefaultLayoutKey();//layout 0 means use the one from export
        this.list_layouts = [];
        this.dict_layouts = {};
        this.list_control_modes = [];
        this.dict_control_modes = {};
        this.generateLayoutEntry("1", "foucus_main", "button_layout_focus_main", "css/layout_focus_main.css");
        this.generateLayoutEntry("2", "edit", "button_layout_edit_mode", "css/layout_edit_mode.css");
        this.generateLayoutEntry("3", "main", "button_layout_main_view", "css/layout_main_view.css");
        this.generateLayoutEntry("4", "aux", "button_layout_aux_view", "css/layout_aux_view.css");
        this.generateLayoutEntry("5", "compare", "button_layout_compare", "css/layout_compare.css");
        this.generateLayoutEntry("6", "foucus_aux", "button_layout_focus_aux", "css/layout_focus_aux.css");
        
        this.generateControlModeEntry(CONTROL_MODE_CAMERA, "camera", "button_control_camera");
        this.generateControlModeEntry(CONTROL_MODE_DYNAMIC_STREAMLINE, "camera", "button_control_dynamic");
        this.generateControlModeEntry(CONTROL_MODE_SELECT_STREAMLINE, "camera", "button_control_selected");
    }

    generateLayoutEntry(key, name, id_button, css){
        var layout_entry = new LayoutEntry(this, key, name, id_button, css);
        this.dict_layouts[key] = layout_entry;
        this.list_layouts.push(layout_entry);
    }

    generateControlModeEntry(key, name, id_button){
        var control_mode_entry = new ControlModeEntry(this, key, name, id_button);
        this.dict_control_modes[key] = control_mode_entry;
        this.list_control_modes.push(control_mode_entry);
    }

    DeselectAll(){
        for(var i = 0; i< this.list_layouts.length; i++){
            this.list_layouts[i].button.className = "tools_button";
        }
    }

    DeselectAllControlModeEntry(){
        for(var i = 0; i< this.list_control_modes.length; i++){
            this.list_control_modes[i].button.className = "tools_button";
        }
    }

    setCSS(value){
        var sheets = document.getElementsByTagName("link");
        sheets[0].href = value;
        console.log("STYLE:", value)
    }

    selectLayout(key){
        this.dict_layouts[key].select();
    }

    getSelectedLayoutKey(){
        return this.selected_layout_key;
    }

    getDefaultLayoutKey(){
        return "2";
    }

    DeactivateInput(){
        this.block_all_input = true;
    }

    ActivateInput(){
        this.block_all_input = false;
    }
}

module.exports = UiTools;