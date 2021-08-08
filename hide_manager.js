const LEVEL_BASIC = 0;
const LEVEL_ADVANCED = 1;
const LEVEL_DEBUG = 2;

const CLASS_INPUT_ROW = "input_row";

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

class Show{
    constructor(name, required_level, require_exact){
        this.name = name;
        this.required_level = required_level;
        this.require_exact = require_exact;
        this.element = document.getElementById(name)
    }

    UpdateVisibility(level){
        var visible = this.require_exact ? level == this.required_level : level >= this.required_level;
        this.element.className = visible ? "show" : "hidden";
    }
}

class HideGroup{
    constructor(select_name){
        this.list_input_row = [];
        this.list_show = [];
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
        for(var i=0; i<this.list_show.length; i++){
            this.list_show[i].UpdateVisibility(level);
        }
    }

    AddInputRow(input_row_name, level){
        this.list_input_row.push(new InputRow(input_row_name, level));
    }

    AddShow(show_name, level, require_exact){
        this.list_show.push(new Show(show_name, level, require_exact));
    }
}

class HideManager{
    constructor(){        
        this.groups = [];

        
        this.group_data = new HideGroup("select_data_paramaters_mode");
        this.group_data.AddInputRow("input_row_duplicator_iterations", LEVEL_DEBUG);
        this.group_data.AddInputRow("input_row_data_step_size", LEVEL_ADVANCED);
        this.groups.push(this.group_data);

        this.group_settings = new HideGroup("select_settings_mode");
        this.group_settings.AddInputRow("input_row_scalar_field_debug", LEVEL_DEBUG);
        this.group_settings.AddInputRow("input_row_bounding_axes_length", LEVEL_ADVANCED);
        this.group_settings.AddInputRow("input_row_bounding_axes_radius", LEVEL_ADVANCED);
        this.group_settings.AddInputRow("input_row_emphasize_origin_axes", LEVEL_ADVANCED);
        this.group_settings.AddInputRow("input_row_bounding_axes_origin_length", LEVEL_ADVANCED);
        this.group_settings.AddInputRow("input_row_bounding_axes_origin_radius", LEVEL_ADVANCED);
        this.groups.push(this.group_settings);

        this.group_side_canvas = new HideGroup("select_side_mode");
        this.group_side_canvas.AddShow("show_side_canvas", 1, false);
        this.group_side_canvas.AddShow("show_projection_index", DRAW_MODE_PROJECTION, true);
        this.group_side_canvas.AddShow("show_slice_axes_order", DRAW_MODE_FTLE_SLICE, true);
        this.groups.push(this.group_side_canvas);        
    }

    UpdateVisibility(){
        for(var i=0; i<this.groups.length; i++){
            this.groups[i].UpdateVisibility();
        }
    }
}


module.exports = HideManager;