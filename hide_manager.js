const LEVEL_BASIC = 0;
const LEVEL_ADVANCED = 1;
const LEVEL_DEBUG = 2;

class InputRow{
    constructor(name, required_level){
        this.name = name;
        this.required_level = required_level;
        this.element = document.getElementById(name)
    }

    UpdateVisibility(level){
        var visible = level >= this.required_level;
        this.element.className = visible ? "input_row" : "hidden";
    }
}

class HideGroup{
    constructor(select_name){
        this.list_input_row = [];
        this.select = document.getElementById(select_name);
        this.select.addEventListener("change", (event) => {
            this.UpdateVisibility();
        });
    }

    UpdateVisibility(){
        var level = this.select.value;
        console.log("change: ", level);
        for(var i=0; i<this.list_input_row.length; i++){
            this.list_input_row[i].UpdateVisibility(level);
        }
    }

    Add(input_row_name, level){
        this.list_input_row.push(new InputRow(input_row_name, level));
    }
}

class HideManager{
    constructor(){        
        this.groups = [];

        this.group_settings = new HideGroup("select_settings_mode");
        this.group_settings.Add("input_row_scalar_field_debug", LEVEL_DEBUG);
        this.group_settings.Add("input_row_bounding_axes_length", LEVEL_ADVANCED);
        this.group_settings.Add("input_row_bounding_axes_radius", LEVEL_ADVANCED);
        this.group_settings.Add("input_row_emphasize_origin_axes", LEVEL_ADVANCED);
        this.group_settings.Add("input_row_bounding_axes_origin_length", LEVEL_ADVANCED);
        this.group_settings.Add("input_row_bounding_axes_origin_radius", LEVEL_ADVANCED);
        this.groups.push(this.group_settings);
    }

    UpdateVisibility(){
        for(var i=0; i<this.groups.length; i++){
            this.groups[i].UpdateVisibility();
        }
    }
}