const LEVEL_BASIC = 0;
const LEVEL_INTERMEDIATE = 1;
const LEVEL_ADVANCED = 2;
const LEVEL_DEBUG = 3;

const CLASS_INPUT_ROW = "input_row";

class Condition {
    constructor() {

    }

    evaluate() {
        return true;
    }
}

class TabIsActiveCondition extends Condition{
    constructor(tab_group_name, required_tab_name, tab_manager) {
        super();
        this.tab_group_name = tab_group_name;
        this.required_tab_name = required_tab_name;
        this.tab_manager = tab_manager;
    }

    evaluate() {
        console.log("evaluate TabIsActiveCondition")
        console.log("required_tab_name:", this.required_tab_name)
        var result = this.tab_manager.IsTabSelected(this.tab_group_name, this.required_tab_name)
        console.log("result:", result)
        return result;
    }
}

class NotifyingCondition extends Condition{
    constructor(element_name, notification_element) {
        super();
        this.element_name = element_name;
        this.element = document.getElementById(element_name)
        this.notification_element = notification_element;
        this.element.addEventListener("change", (event) => {
            console.log("56465465", this.element_name, this.notification_element.name)
            this.notification_element.UpdateVisibility();
        });
    }
}

class ConditionRequiredValue extends NotifyingCondition {
    constructor(element_name, notification_element, required_value, require_exact) {
        super(element_name, notification_element);
        this.required_value = required_value;
        this.require_exact = require_exact;
        this.element = document.getElementById(element_name)
    }

    evaluate() {
        console.log("evaluate ConditionRequiredValue")
        console.log("element_name:", this.element_name)
        console.log("required_value:", this.required_value)
        console.log("require_exact:", this.require_exact)
        console.log("value:", this.element.value)
        var value = this.element.value;
        var result = this.require_exact ? value == this.required_value : value >= this.required_value;
        console.log("result:", result)
        return result;
    }
}

class MultiCondition extends Condition {
    constructor() {
        super();
        this.list_conditions = []
    }

    evaluate() {
        return true;
    }

    add_condition(condition) {
        this.list_conditions.push(condition)
    }
}

class AndCondition extends MultiCondition {
    constructor() {
        super();
    }

    evaluate() {
        console.log("evaluate AndCondition")
        for (var index = 0; index < this.list_conditions.length; index++) {
            console.log("index: ", index)
            const condition = this.list_conditions[index];
            var tmp = condition.evaluate()
            if( ! tmp){
                console.log("result of AndCondition: false")
                return false;
            }
        }
        console.log("result of AndCondition: true")
        return true;
    }
}

class OrCondition extends MultiCondition {
    constructor() {
        super();
    }

    evaluate() {
        console.log("evaluate OrCondition")
        for (var index = 0; index < this.list_conditions.length; index++) {
            console.log("index: ", index)
            const condition = this.list_conditions[index];
            var tmp = condition.evaluate()
            if(tmp){
                console.log("result of OrCondition: true")
                return true;
            }
        }
        console.log("result of OrCondition: false")
        return false;
    }
}

class MultiConditionalElement {
    constructor(name) {
        this.name = name;
        this.element = document.getElementById(name)
    }

    set_condition(condition) {
        this.condition = condition
    }

    evaluate() {
        console.log("evaluate MultiConditionalElement")
        return this.condition.evaluate();
    }

    UpdateVisibility() {
        console.log("UpdateVisibility MultiConditionalElement")
        var visible = this.evaluate();
        console.log("visible:", visible)
        this.element.className = visible ? this.get_visible_name() : "hidden";
    }

    get_visible_name() {
        console.error("error: MultiConditionalElement: get_visible_name")
        return "";
    }
}

class MultiConditionalInputRow extends MultiConditionalElement {
    constructor(name) {
        super(name);
    }

    get_visible_name() {
        return "input_row";
    }
}

class MultiConditionalWrapper extends MultiConditionalElement {
    constructor(name) {
        super(name);
    }

    get_visible_name() {
        return "wrapper";
    }
}

class InputRow {
    constructor(name, required_level, require_exact) {
        this.name = name;
        this.required_level = required_level;
        this.require_exact = require_exact;
        this.element = document.getElementById(name)
    }

    UpdateVisibility(level) {
        var visible = this.require_exact ? level == this.required_level : level >= this.required_level;
        this.element.className = visible ? "input_row" : "hidden";
    }
}

class Show {
    constructor(name, required_level, require_exact) {
        this.name = name;
        this.required_level = required_level;
        this.require_exact = require_exact;
        this.element = document.getElementById(name)
    }

    UpdateVisibility(level) {
        var visible = this.require_exact ? level == this.required_level : level >= this.required_level;
        this.element.className = visible ? "show" : "hidden";
    }
}

class HideGroup {
    constructor(select_name) {
        this.list_input_row = [];
        this.list_show = [];
        this.select = document.getElementById(select_name);
        this.select.addEventListener("change", (event) => {
            this.UpdateVisibility();
        });
    }

    UpdateVisibility() {
        var level = this.select.value;
        console.log("change: ", level);
        for (var i = 0; i < this.list_input_row.length; i++) {
            this.list_input_row[i].UpdateVisibility(level);
        }
        for (var i = 0; i < this.list_show.length; i++) {
            this.list_show[i].UpdateVisibility(level);
        }
    }

    AddInputRow(input_row_name, level, require_exact) {
        this.list_input_row.push(new InputRow(input_row_name, level, require_exact));
    }

    AddShow(show_name, level, require_exact) {
        this.list_show.push(new Show(show_name, level, require_exact));
    }
}

class HideManager {
    constructor(tab_manager) {
        this.tab_manager = tab_manager;
        this.groups = [];
        this.multi_consodtional_elements = []

        //---------- groups ----------

        this.group_data = new HideGroup("select_data_paramaters_mode");
        this.group_data.AddInputRow("input_row_duplicator_iterations", LEVEL_DEBUG, false);
        this.group_data.AddInputRow("input_row_data_step_size", LEVEL_ADVANCED, false);
        this.group_data.AddInputRow("input_streamline_calculation_inbetweens", LEVEL_ADVANCED, false);        
        this.group_data.AddInputRow("input_row_tube_radius_fundamental", LEVEL_ADVANCED, false);
        this.group_data.AddInputRow("input_row_max_radius_factor_highlight", LEVEL_ADVANCED, false);
        this.groups.push(this.group_data);

        this.group_settings = new HideGroup("select_settings_mode");
        this.group_settings.AddInputRow("input_row_volume_rendering_distance_between_points", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_volume_rendering_termination_opacity", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_volume_rendering_opacity_factor", LEVEL_DEBUG, false);

        this.group_settings.AddInputRow("input_row_still_resolution_factor", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_panning_resolution_factor", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_lod_still", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_lod_panning", LEVEL_ADVANCED, false);

        this.group_settings.AddInputRow("input_row_trackball_rotation_sensitivity", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_trackball_translation_sensitivity", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_trackball_wheel_sensitivity", LEVEL_ADVANCED, false);
        this.group_settings.AddInputRow("input_row_trackball_focus_distance", LEVEL_ADVANCED, false);
        this.groups.push(this.group_settings);
        /*
        //this.group_settings.AddInputRow("input_row_tube_radius_factor_projection", LEVEL_INTERMEDIATE, false);
        //this.group_settings.AddInputRow("input_row_tube_radius_factor_projection_highlight", LEVEL_INTERMEDIATE, false);
        this.group_settings.AddInputRow("input_row_volume_rendering_max_distance", LEVEL_INTERMEDIATE, false);
        */

        this.group_shading_mode = new HideGroup("select_shading_mode_streamlines");
        this.group_shading_mode.AddInputRow("input_row_formula_scalar", SHADING_MODE_STREAMLINES_SCALAR, true);
        this.group_shading_mode.AddInputRow("input_row_scalar_range", SHADING_MODE_STREAMLINES_SCALAR, true);
        this.groups.push(this.group_shading_mode);

        //---------- special conditions ----------

        this.mcir_scalar_field_debug = new MultiConditionalInputRow("input_row_scalar_field_debug");
        this.condition_debug = new ConditionRequiredValue("select_settings_mode",
            this.mcir_scalar_field_debug,
            LEVEL_DEBUG, false);
        this.condition_scalar = new ConditionRequiredValue("select_shading_mode_streamlines",
            this.mcir_scalar_field_debug,
            SHADING_MODE_STREAMLINES_SCALAR, true);
        this.condition_and = new AndCondition();
        this.condition_and.add_condition(this.condition_debug)
        this.condition_and.add_condition(this.condition_scalar)
        this.mcir_scalar_field_debug.set_condition(this.condition_and)
        this.multi_consodtional_elements.push(this.mcir_scalar_field_debug);

        this.condition_tab_data = new TabIsActiveCondition("tab_group_main", "tab_data", tab_manager);
        this.condition_tab_ftle = new TabIsActiveCondition("tab_group_main", "tab_ftle", tab_manager);
        this.condition_tab_export = new TabIsActiveCondition("tab_group_main", "tab_export", tab_manager);
        
        
        this.mcir_number_of_points = new MultiConditionalInputRow("input_row_streamline_calculation_points_per_streamline");
        this.condition_number_of_points = new ConditionRequiredValue("select_streamline_termination_method",
            this.mcir_number_of_points,
            STREAMLINE_TERMINATION_CONDITION_POINTS, true);
        this.mcir_number_of_points.set_condition(this.condition_number_of_points)
        this.multi_consodtional_elements.push(this.mcir_number_of_points);

        this.mcir_advection_time = new MultiConditionalInputRow("input_row_streamline_calculation_advection_time");
        this.condition_advection_time = new ConditionRequiredValue("select_streamline_termination_method",
            this.mcir_advection_time,
            STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME, true);
        this.mcir_advection_time.set_condition(this.condition_advection_time)
        this.multi_consodtional_elements.push(this.mcir_advection_time);

        this.mcir_arc_length = new MultiConditionalInputRow("input_row_streamline_calculation_arc_length");
        this.condition_arc_length = new ConditionRequiredValue("select_streamline_termination_method",
            this.mcir_arc_length,
            STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH, true);
        this.mcir_arc_length.set_condition(this.condition_arc_length)
        this.multi_consodtional_elements.push(this.mcir_arc_length);
        /*
        // BUTTONS

        this.mcw_add_multi_seed = new MultiConditionalWrapper("wrapper_button_add_multi_seed");
        this.mcw_add_multi_seed.set_condition(this.condition_tab_data)
        this.multi_consodtional_elements.push(this.mcw_add_multi_seed);

        this.mcw_add_seed = new MultiConditionalWrapper("wrapper_button_add_seed");
        this.mcw_add_seed.set_condition(this.condition_tab_data)
        this.multi_consodtional_elements.push(this.mcw_add_seed);

        this.mcw_randomize_seed_positions = new MultiConditionalWrapper("wrapper_button_randomize_seed_positions");
        this.mcw_randomize_seed_positions.set_condition(this.condition_tab_data)
        this.multi_consodtional_elements.push(this.mcw_randomize_seed_positions);

        this.mcw_randomize_seed_colors = new MultiConditionalWrapper("wrapper_button_randomize_seed_colors");
        this.mcw_randomize_seed_colors.set_condition(this.condition_tab_data)
        this.multi_consodtional_elements.push(this.mcw_randomize_seed_colors);

        this.mcw_set_magnetic_field = new MultiConditionalWrapper("wrapper_button_set_magnetic_field");
        this.mcw_set_magnetic_field.set_condition(this.condition_tab_data)
        this.multi_consodtional_elements.push(this.mcw_set_magnetic_field);

        this.mcw_export = new MultiConditionalWrapper("wrapper_button_export");
        this.mcw_export.set_condition(this.condition_tab_export)
        this.multi_consodtional_elements.push(this.mcw_export);
        */

        this.InitEquations();
    }

    InitEquations(){
        var mcir_equation_u = new MultiConditionalInputRow("input_row_field_equation_u");
        var condition_equation_u_space_3_torus = new ConditionRequiredValue("select_space",
            mcir_equation_u,
            SPACE_3_TORUS, true);
        mcir_equation_u.set_condition(condition_equation_u_space_3_torus)
        this.multi_consodtional_elements.push(mcir_equation_u);

        var mcir_equation_v = new MultiConditionalInputRow("input_row_field_equation_v");
        var condition_equation_v_space_3_torus = new ConditionRequiredValue("select_space",
            mcir_equation_v,
            SPACE_3_TORUS, true);
        mcir_equation_v.set_condition(condition_equation_v_space_3_torus)
        this.multi_consodtional_elements.push(mcir_equation_v);

        var mcir_equation_w = new MultiConditionalInputRow("input_row_field_equation_w");
        var condition_equation_w_space_3_torus = new ConditionRequiredValue("select_space",
            mcir_equation_w,
            SPACE_3_TORUS, true);
        mcir_equation_w.set_condition(condition_equation_w_space_3_torus)
        this.multi_consodtional_elements.push(mcir_equation_w);

        var mcir_equation_a = new MultiConditionalInputRow("input_row_field_equation_a");
        var condition_equation_a_space_2_plus_2D = new ConditionRequiredValue("select_space",
            mcir_equation_a,
            SPACE_2_PLUS_2D, true);
        mcir_equation_a.set_condition(condition_equation_a_space_2_plus_2D)
        this.multi_consodtional_elements.push(mcir_equation_a);

        var mcir_equation_b = new MultiConditionalInputRow("input_row_field_equation_b");
        var condition_equation_b_space_2_plus_2D = new ConditionRequiredValue("select_space",
            mcir_equation_b,
            SPACE_2_PLUS_2D, true);
        mcir_equation_b.set_condition(condition_equation_b_space_2_plus_2D)
        this.multi_consodtional_elements.push(mcir_equation_b);
        
    }

    UpdateVisibility() {        
        for (var i = 0; i < this.groups.length; i++) {
            this.groups[i].UpdateVisibility();
        }        
        for (var i = 0; i < this.multi_consodtional_elements.length; i++) {
            this.multi_consodtional_elements[i].UpdateVisibility();
        }

        //var termination_method = parseInt(document.getElementById("select_streamline_termination_method").value);
        //document.getElementById("input_row_streamline_calculation_advection_time").className = (termination_method == STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME) ? "input_row" : "hidden";
        //document.getElementById("input_row_streamline_calculation_arc_length").className = (termination_method == STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH) ? "input_row" : "hidden";
    }
}


module.exports = HideManager;