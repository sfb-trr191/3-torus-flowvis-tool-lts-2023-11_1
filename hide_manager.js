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

class HideManager{
    constructor(){        
        this.list_input_row = [];
        this.select = document.getElementById("select_settings_mode");

        this.list_input_row.push(new InputRow("input_row_scalar_field_debug", LEVEL_DEBUG));

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
}