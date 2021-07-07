class InputChangedGroup{

    constructor(name, button){
        this.name = name;
        this.input_list = [];
        this.additional_check_list = [];
        this.button = button;
    }

    AddInput(input){
        this.input_list.push(input);
    }

    AddAdditionalCheck(input){
        this.additional_check_list.push(input);
    }

    UpdateDefaultValues(){
        for(var i=0; i<this.input_list.length; i++){
            this.input_list[i].defaultValue = this.input_list[i].value;
        }
        for(var i=0; i<this.additional_check_list.length; i++){
            this.additional_check_list[i].UpdateDefaultValues(this.name);
        }
    }

    CheckValuesChanged(){
        var changed = this.HasValueChanged();
        for(var i=0; i<this.additional_check_list.length; i++){
            changed = changed || this.additional_check_list[i].HasValueChanged(this.name);
        }
        this.button.className = changed ? "button_changed" : "button";
    }

    HasValueChanged(){
        for(var i=0; i<this.input_list.length; i++){
            if(this.input_list[i].value != this.input_list[i].defaultValue){
                return true;
            }
        }
        return false;
    }

}

class InputChangedManager{

    constructor(){
        this.groups = [];
        this.groups_dict = {};
        this.group_calculate = new InputChangedGroup(GROUP_NAME_CALCULATE, document.getElementById("button_request_data"));
        this.group_main_camera = new InputChangedGroup(GROUP_NAME_MAIN_CAMERA, document.getElementById("button_update_camera"));
        this.group_render_settings = new InputChangedGroup(GROUP_NAME_RENDER_SETTINGS, document.getElementById("button_render_settings"));
        this.groups.push(this.group_calculate);
        this.groups.push(this.group_main_camera);
        this.groups.push(this.group_render_settings);
        this.groups_dict["main_camera"] = this.group_main_camera;
        this.GenerateGroupCalculate();
        this.GenerateGroupCamera();
        this.GenerateGroupRenderSettings();
    }

    GenerateGroupCalculate(){
        this.group_calculate.AddInput(document.getElementById("input_field_equation_u"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_v"));
        this.group_calculate.AddInput(document.getElementById("input_field_equation_w"));
        this.group_calculate.AddInput(document.getElementById("input_num_points_per_streamline"));
        this.group_calculate.AddInput(document.getElementById("input_step_size"));
        this.group_calculate.AddInput(document.getElementById("segment_duplicator_iterations"));
    }

    GenerateGroupCamera(){
        this.group_main_camera.AddInput(document.getElementById("input_camera_position_x"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_position_y"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_position_z"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_forward_x"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_forward_y"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_forward_z"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_up_x"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_up_y"));
        this.group_main_camera.AddInput(document.getElementById("input_camera_up_z"));
        
    }

    GenerateGroupRenderSettings(){
        this.group_render_settings.AddInput(document.getElementById("input_panning_resolution_factor"));
        this.group_render_settings.AddInput(document.getElementById("input_max_ray_distance"));
        this.group_render_settings.AddInput(document.getElementById("select_fog_type"));
        this.group_render_settings.AddInput(document.getElementById("input_fog_density"));
        this.group_render_settings.AddInput(document.getElementById("select_shading_mode_streamlines"));
        this.group_render_settings.AddInput(document.getElementById("input_formula_scalar"));
        this.group_render_settings.AddInput(document.getElementById("input_min_scalar"));
        this.group_render_settings.AddInput(document.getElementById("input_max_scalar"));
        this.group_render_settings.AddInput(document.getElementById("input_tube_radius_factor"));
        this.group_render_settings.AddInput(document.getElementById("select_lod_still"));
        this.group_render_settings.AddInput(document.getElementById("select_lod_panning"));        
    }

    LinkUISeeds(ui_seeds){
        this.group_calculate.AddAdditionalCheck(ui_seeds);
        this.group_render_settings.AddAdditionalCheck(ui_seeds);
    }

    UpdateDefaultValuesCalculate(){ 
        this.group_calculate.UpdateDefaultValues();
    }

    UpdateDefaultValuesRenderSettings(){ 
        this.group_render_settings.UpdateDefaultValues();
    }

    UpdateDefaultValues(name){ 
        this.groups_dict[name].UpdateDefaultValues();
    }

    CheckValuesChanged(){
        for(var i=0; i<this.groups.length; i++){
            this.groups[i].CheckValuesChanged();
        }  
    }
}
