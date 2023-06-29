const ShaderContainer = require("./shader_container");
const module_utility = require("./utility");
const GetFormula = module_utility.GetFormula;
const GetFormulaFloat = module_utility.GetFormulaFloat;

class ShaderManager {
    constructor() {
        this.shaders_linked = false;
        this.settings_changed = false;
        this.dict_shaders_main = {};
        this.dict_shaders_side = {};
    }

    Link(canvas_wrapper_main, canvas_wrapper_side){
        this.canvas_wrapper_main = canvas_wrapper_main;
        this.canvas_wrapper_side = canvas_wrapper_side;
    }

    NotifySettingsChanged(){
        this.settings_changed = true;
        this.shaders_linked = false;
    }

    IsDirty(){
        return this.settings_changed;
    }

    AreShadersLinked(){
        return this.shaders_linked;
    }

    GetDefaultShader() {
        var code = F_SHADER_RAYTRACING_PREPROCESSOR.replace("shader_formula_scalar", "0.0");
        return code;
    }

    GetShader(shader_formula_scalar, 
        light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3,
        light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
        shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
        shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
        shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
        shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
        shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
        shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
        shader_flags) {
        var code = F_SHADER_RAYTRACING_PREPROCESSOR;

        code = this.LoadModules(code, shader_flags);
        code = code.replace("shader_formula_scalar", shader_formula_scalar);

        var defines = "";
        if(shader_flags.space == SPACE_3_SPHERE_4_PLUS_4D)
            defines += "\n#define COORDINATES_4D";
        if(shader_flags.show_volume_rendering)
            defines += "\n#define SHOW_VOLUME_RENDERING";        
        if(shader_flags.show_volume_rendering_forward)
            defines += "\n#define SHOW_VOLUME_RENDERING_FORWARD";        
        if(shader_flags.show_volume_rendering_backward)
            defines += "\n#define SHOW_VOLUME_RENDERING_BACKWARD";        
        if(shader_flags.show_movable_axes)
            defines += "\n#define SHOW_MOVABLE_AXES";
        if(shader_flags.show_streamlines)
            defines += "\n#define SHOW_STREAMLINES";            
        if(shader_flags.show_streamlines_outside)
            defines += "\n#define SHOW_STREAMLINES_OUTSIDE";
        if(shader_flags.show_bounding_box)
            defines += "\n#define SHOW_BOUNDING_BOX";
        if(shader_flags.show_bounding_box_projection)
            defines += "\n#define SHOW_BOUNDING_BOX_PROJECTION";
        if(shader_flags.cut_at_cube_faces)
            defines += "\n#define CUT_AT_CUBE_FACES";
        if(shader_flags.handle_inside)
            defines += "\n#define HANDLE_INSIDE";
        if(shader_flags.show_seeds_once)
            defines += "\n#define SHOW_SEEDS_ONCE";
        if(shader_flags.show_seeds_instance)
            defines += "\n#define SHOW_SEEDS_INSTANCE";
        if(shader_flags.integrate_light)
            defines += "\n#define INTEGRATE_LIGHT";
        
        code = code.replace("$defines$", defines);
        
        code = code.replace("light_transport_p0", light_transport_p0);
        code = code.replace("light_transport_p1", light_transport_p1);
        code = code.replace("light_transport_p2", light_transport_p2);
        code = code.replace("light_transport_p3", light_transport_p3);
        code = code.replace("light_transport_d0", light_transport_d0);
        code = code.replace("light_transport_d1", light_transport_d1);
        code = code.replace("light_transport_d2", light_transport_d2);
        code = code.replace("light_transport_d3", light_transport_d3);

        code = code.replace("shader_rule_x_pos_x", shader_rule_x_pos_x);
        code = code.replace("shader_rule_x_pos_y", shader_rule_x_pos_y);
        code = code.replace("shader_rule_x_pos_z", shader_rule_x_pos_z);        
        code = code.replace("shader_rule_x_neg_x", shader_rule_x_neg_x);
        code = code.replace("shader_rule_x_neg_y", shader_rule_x_neg_y);
        code = code.replace("shader_rule_x_neg_z", shader_rule_x_neg_z);

        code = code.replace("shader_rule_y_pos_x", shader_rule_y_pos_x);
        code = code.replace("shader_rule_y_pos_y", shader_rule_y_pos_y);
        code = code.replace("shader_rule_y_pos_z", shader_rule_y_pos_z);        
        code = code.replace("shader_rule_y_neg_x", shader_rule_y_neg_x);
        code = code.replace("shader_rule_y_neg_y", shader_rule_y_neg_y);
        code = code.replace("shader_rule_y_neg_z", shader_rule_y_neg_z);

        code = code.replace("shader_rule_z_pos_x", shader_rule_z_pos_x);
        code = code.replace("shader_rule_z_pos_y", shader_rule_z_pos_y);
        code = code.replace("shader_rule_z_pos_z", shader_rule_z_pos_z);        
        code = code.replace("shader_rule_z_neg_x", shader_rule_z_neg_x);
        code = code.replace("shader_rule_z_neg_y", shader_rule_z_neg_y);
        code = code.replace("shader_rule_z_neg_z", shader_rule_z_neg_z);


        console.log("code:", code);
        return code;
    }

    LoadModules(code, shader_flags){
        if(shader_flags.integrate_light){
            if(shader_flags.space == SPACE_3_SPHERE_4_PLUS_4D){
                code = code.replace("$SHADER_MODULE_LIGHT_INTEGRATION_DEFINITIONS$", SHADER_MODULE_S3_LIGHT_INTEGRATION_DEFINITIONS);
            }else{
                code = code.replace("$SHADER_MODULE_LIGHT_INTEGRATION_DEFINITIONS$", SHADER_MODULE_DEFAULT_LIGHT_INTEGRATION_DEFINITIONS);
            }            
        }else{
            code = code.replace("$SHADER_MODULE_LIGHT_INTEGRATION_DEFINITIONS$", "");
        }

        //different for s3
        if(shader_flags.space == SPACE_3_SPHERE_4_PLUS_4D){
            code = code.replace("$SHADER_MODULE_ADDITIONAL_STRUCTS$", SHADER_MODULE_S3_STRUCTS);   
            code = code.replace("$SHADER_MODULE_ADDITIONAL_FUNCTION_DECLARATIONS$", SHADER_MODULE_S3_FUNCTION_DECLARATIONS); 
            code = code.replace("$SHADER_MODULE_INTERSECTIONS$", SHADER_MODULE_S3_INTERSECTIONS); 
            code = code.replace("$SHADER_MODULE_SHADING$", SHADER_MODULE_S3_SHADING);       
            code = code.replace("$SHADER_MODULE_RAY_GENERATION$", SHADER_MODULE_S3_RAY_GENERATION);   
            code = code.replace("$SHADER_MODULE_OUTPUT_DATA$", SHADER_MODULE_S3_OUTPUT_DATA);   
            
            //not used in s3
            code = code.replace("$SHADER_MODULE_VOLUME_RENDERING$", "");        
            code = code.replace("$SHADER_MODULE_OUT_OF_BOUNDS$", "");
            code = code.replace("$SHADER_MODULE_HANDLE_INSIDE$", "");
            code = code.replace("$SHADER_MODULE_HANDLE_OUT_OF_BOUNDS$", "");
        }
        else{
            code = code.replace("$SHADER_MODULE_ADDITIONAL_STRUCTS$", SHADER_MODULE_DEFAULT_STRUCTS);     
            code = code.replace("$SHADER_MODULE_ADDITIONAL_FUNCTION_DECLARATIONS$", SHADER_MODULE_DEFAULT_FUNCTION_DECLARATIONS); 
            code = code.replace("$SHADER_MODULE_INTERSECTIONS$", SHADER_MODULE_DEFAULT_INTERSECTIONS); 
            code = code.replace("$SHADER_MODULE_SHADING$", SHADER_MODULE_DEFAULT_SHADING);     
            code = code.replace("$SHADER_MODULE_RAY_GENERATION$", SHADER_MODULE_DEFAULT_RAY_GENERATION);  
            code = code.replace("$SHADER_MODULE_OUTPUT_DATA$", SHADER_MODULE_DEFAULT_OUTPUT_DATA);     

            //not used in s3
            code = code.replace("$SHADER_MODULE_VOLUME_RENDERING$", SHADER_MODULE_DEFAULT_VOLUME_RENDERING);        
            code = code.replace("$SHADER_MODULE_OUT_OF_BOUNDS$", SHADER_MODULE_DEFAULT_OUT_OF_BOUNDS);
            code = code.replace("$SHADER_MODULE_HANDLE_INSIDE$", SHADER_MODULE_DEFAULT_HANDLE_INSIDE);
            code = code.replace("$SHADER_MODULE_HANDLE_OUT_OF_BOUNDS$", SHADER_MODULE_DEFAULT_HANDLE_OUT_OF_BOUNDS);
        }           
        


        //shared
        code = code.replace("$SHADER_MODULE_SHARED_DATA_ACCESS$", SHADER_MODULE_SHARED_DATA_ACCESS);
        code = code.replace("$SHADER_MODULE_SHARED_STRUCTS$", SHADER_MODULE_SHARED_STRUCTS);
        code = code.replace("$SHADER_MODULE_SHARED_UNIFORMS$", SHADER_MODULE_SHARED_UNIFORMS);
        code = code.replace("$SHADER_MODULE_SHARED_CONST$", SHADER_MODULE_SHARED_CONST);
        code = code.replace("$SHADER_MODULE_SHARED_FUNCTION_DECLARATIONS$", SHADER_MODULE_SHARED_FUNCTION_DECLARATIONS);
        code = code.replace("$SHADER_MODULE_SHARED_SHADING$", SHADER_MODULE_SHARED_SHADING);  
        code = code.replace("$SHADER_MODULE_LINALG$", SHADER_MODULE_LINALG);  
        
        
        
        
        
        
        return code;
    }

    GetShaderComputeFlowMapSlice(space, shader_formula_u, shader_formula_v, shader_formula_w, shader_formula_a, shader_formula_b){
        var code;
        switch (space) {
            case SPACE_3_TORUS:
                code = F_SHADER_COMPUTE_FLOW_MAP_SLICE;
                break;
            case SPACE_2_PLUS_2D:
                code = F_SHADER_COMPUTE_FLOW_MAP_SLICE_AB;
                break;
            default:
                console.log("Error unknonw space");
                break;
        }
        code = code.replace("shader_formula_u", shader_formula_u);
        code = code.replace("shader_formula_v", shader_formula_v);
        code = code.replace("shader_formula_w", shader_formula_w);
        code = code.replace("shader_formula_a", shader_formula_a);
        code = code.replace("shader_formula_b", shader_formula_b);
        return code;  
    }

    GetShaderKey(shader_formula_scalar_float, 
        light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
        light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
        shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
        shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
        shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
        shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
        shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
        shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
        shader_flags){
        var key = shader_flags.space + ";" + shader_formula_scalar_float;
        if(shader_flags.show_volume_rendering)
            key += ";SHOW_VOLUME_RENDERING"
        if(shader_flags.show_volume_rendering_forward)
            key += ";SHOW_VOLUME_RENDERING_FORWARD"
        if(shader_flags.show_volume_rendering_backward)
            key += ";SHOW_VOLUME_RENDERING_BACKWARD"
        if(shader_flags.show_movable_axes)
            key += ";SHOW_MOVABLE_AXES"
        if(shader_flags.show_streamlines)
            key += ";SHOW_STREAMLINES"
        if(shader_flags.show_streamlines_outside)
            key += ";SHOW_STREAMLINES_OUTSIDE"
        if(shader_flags.show_bounding_box)
            key += ";SHOW_BOUNDING_BOX"
        if(shader_flags.show_bounding_box_projection)
            key += ";SHOW_BOUNDING_BOX_PROJECTION"
        if(shader_flags.cut_at_cube_faces)
            key += ";CUT_AT_CUBE_FACES"     
        if(shader_flags.handle_inside)
            key += ";HANDLE_INSIDE"     
        if(shader_flags.show_seeds_once)
            key += ";SHOW_SEEDS_ONCE"     
        if(shader_flags.show_seeds_instance)
            key += ";SHOW_SEEDS_INSTANCE"     
        if(shader_flags.integrate_light){
            key += ";INTEGRATE_LIGHT" 
            key += ";"+light_transport_p0 
            key += ";"+light_transport_p1 
            key += ";"+light_transport_p2 
            key += ";"+light_transport_p3 
            key += ";"+light_transport_d0 
            key += ";"+light_transport_d1 
            key += ";"+light_transport_d2 
            key += ";"+light_transport_d3 
        }
        if(true){//TODO: optimize this: we dont need this everywhere
            key += ";"+shader_rule_x_pos_x 
            key += ";"+shader_rule_x_pos_y 
            key += ";"+shader_rule_x_pos_z 
            key += ";"+shader_rule_x_neg_x 
            key += ";"+shader_rule_x_neg_y 
            key += ";"+shader_rule_x_neg_z 
            key += ";"+shader_rule_y_pos_x 
            key += ";"+shader_rule_y_pos_y 
            key += ";"+shader_rule_y_pos_z 
            key += ";"+shader_rule_y_neg_x 
            key += ";"+shader_rule_y_neg_y 
            key += ";"+shader_rule_y_neg_z 
            key += ";"+shader_rule_z_pos_x 
            key += ";"+shader_rule_z_pos_y 
            key += ";"+shader_rule_z_pos_z 
            key += ";"+shader_rule_z_neg_x 
            key += ";"+shader_rule_z_neg_y 
            key += ";"+shader_rule_z_neg_z 
        }
        console.log("code:", key);       
        return key;
    }

    DidPrepareShader(){
        return this.flag_prepare_main || this.flag_prepare_side;
    }

    ShouldPrepareRaytracingShader(gl, dict_shaders, shader_formula_scalar_float,  
        light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
        light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
        shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
        shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
        shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
        shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
        shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
        shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
        shader_flags){
        //get shader key
        var shader_key = this.GetShaderKey(shader_formula_scalar_float, 
            light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
            light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3, 
            shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
            shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
            shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
            shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
            shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
            shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
            shader_flags);
        return ! (shader_key in dict_shaders);
    }

    PrepareRaytracingShader(gl, dict_shaders, shader_formula_scalar_float,  
        light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
        light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
        shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
        shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
        shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
        shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
        shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
        shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
        shader_flags){
        //the return container
        var container;

        //get shader key
        var shader_key = this.GetShaderKey(shader_formula_scalar_float, 
            light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
            light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
            shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
            shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
            shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
            shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
            shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
            shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
            shader_flags);

        //get old container if possible
        if(shader_key in dict_shaders){
            console.log("Performance: shader_key:", shader_key, "already exists");
            container = dict_shaders[shader_key];
        }
        //otherwise create new container
        else{
            console.log("Performance: shader_key:", shader_key, "is created");
            var f_source = this.GetShader(shader_formula_scalar_float, 
                light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
                light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
                shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
                shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
                shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
                shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
                shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
                shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
                shader_flags);
            container = new ShaderContainer(gl, f_source, V_SHADER_RAYTRACING);
            dict_shaders[shader_key] = container;
        }
        return container;
    }

    ShouldPrepareRaytracingShaderMain(gl){

        //get variables
        var shader_formula_scalar_float = GetFormulaFloat("input_formula_scalar");
        var light_transport_p0 = GetFormula("input_field_light_transport_p0");
        var light_transport_p1 = GetFormula("input_field_light_transport_p1");
        var light_transport_p2 = GetFormula("input_field_light_transport_p2");
        var light_transport_p3 = GetFormula("input_field_light_transport_p3");
        var light_transport_d0 = GetFormula("input_field_light_transport_d0");
        var light_transport_d1 = GetFormula("input_field_light_transport_d1");
        var light_transport_d2 = GetFormula("input_field_light_transport_d2");
        var light_transport_d3 = GetFormula("input_field_light_transport_d3");

        var shader_rule_x_pos_x = GetFormula("input_field_shader_rule_x_pos_x");
        var shader_rule_x_pos_y = GetFormula("input_field_shader_rule_x_pos_y");
        var shader_rule_x_pos_z = GetFormula("input_field_shader_rule_x_pos_z");
        var shader_rule_x_neg_x = GetFormula("input_field_shader_rule_x_neg_x");
        var shader_rule_x_neg_y = GetFormula("input_field_shader_rule_x_neg_y");
        var shader_rule_x_neg_z = GetFormula("input_field_shader_rule_x_neg_z");

        var shader_rule_y_pos_x = GetFormula("input_field_shader_rule_y_pos_x");
        var shader_rule_y_pos_y = GetFormula("input_field_shader_rule_y_pos_y");
        var shader_rule_y_pos_z = GetFormula("input_field_shader_rule_y_pos_z");
        var shader_rule_y_neg_x = GetFormula("input_field_shader_rule_y_neg_x");
        var shader_rule_y_neg_y = GetFormula("input_field_shader_rule_y_neg_y");
        var shader_rule_y_neg_z = GetFormula("input_field_shader_rule_y_neg_z");

        var shader_rule_z_pos_x = GetFormula("input_field_shader_rule_z_pos_x");
        var shader_rule_z_pos_y = GetFormula("input_field_shader_rule_z_pos_y");
        var shader_rule_z_pos_z = GetFormula("input_field_shader_rule_z_pos_z");
        var shader_rule_z_neg_x = GetFormula("input_field_shader_rule_z_neg_x");
        var shader_rule_z_neg_y = GetFormula("input_field_shader_rule_z_neg_y");
        var shader_rule_z_neg_z = GetFormula("input_field_shader_rule_z_neg_z");

        this.canvas_wrapper_main.UpdateShaderFlags();
        var shader_flags = this.canvas_wrapper_main.shader_flags;

        this.flag_prepare_main = this.ShouldPrepareRaytracingShader(gl, this.dict_shaders_main, shader_formula_scalar_float,  
            light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
            light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
            shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
            shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
            shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
            shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
            shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
            shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
            shader_flags);
        return this.flag_prepare_main;
    }


    PrepareRaytracingShaderMain(gl){
        console.log("PrepareRaytracingShaderMain");
        var t_start = performance.now();

        //get variables
        var shader_formula_scalar_float = GetFormulaFloat("input_formula_scalar");
        var light_transport_p0 = GetFormula("input_field_light_transport_p0");
        var light_transport_p1 = GetFormula("input_field_light_transport_p1");
        var light_transport_p2 = GetFormula("input_field_light_transport_p2");
        var light_transport_p3 = GetFormula("input_field_light_transport_p3");
        var light_transport_d0 = GetFormula("input_field_light_transport_d0");
        var light_transport_d1 = GetFormula("input_field_light_transport_d1");
        var light_transport_d2 = GetFormula("input_field_light_transport_d2");
        var light_transport_d3 = GetFormula("input_field_light_transport_d3");

        var shader_rule_x_pos_x = GetFormula("input_field_shader_rule_x_pos_x");
        var shader_rule_x_pos_y = GetFormula("input_field_shader_rule_x_pos_y");
        var shader_rule_x_pos_z = GetFormula("input_field_shader_rule_x_pos_z");
        var shader_rule_x_neg_x = GetFormula("input_field_shader_rule_x_neg_x");
        var shader_rule_x_neg_y = GetFormula("input_field_shader_rule_x_neg_y");
        var shader_rule_x_neg_z = GetFormula("input_field_shader_rule_x_neg_z");

        var shader_rule_y_pos_x = GetFormula("input_field_shader_rule_y_pos_x");
        var shader_rule_y_pos_y = GetFormula("input_field_shader_rule_y_pos_y");
        var shader_rule_y_pos_z = GetFormula("input_field_shader_rule_y_pos_z");
        var shader_rule_y_neg_x = GetFormula("input_field_shader_rule_y_neg_x");
        var shader_rule_y_neg_y = GetFormula("input_field_shader_rule_y_neg_y");
        var shader_rule_y_neg_z = GetFormula("input_field_shader_rule_y_neg_z");

        var shader_rule_z_pos_x = GetFormula("input_field_shader_rule_z_pos_x");
        var shader_rule_z_pos_y = GetFormula("input_field_shader_rule_z_pos_y");
        var shader_rule_z_pos_z = GetFormula("input_field_shader_rule_z_pos_z");
        var shader_rule_z_neg_x = GetFormula("input_field_shader_rule_z_neg_x");
        var shader_rule_z_neg_y = GetFormula("input_field_shader_rule_z_neg_y");
        var shader_rule_z_neg_z = GetFormula("input_field_shader_rule_z_neg_z");

        this.canvas_wrapper_main.UpdateShaderFlags();
        var shader_flags = this.canvas_wrapper_main.shader_flags;

        //get container
        this.container_main = this.PrepareRaytracingShader(gl, this.dict_shaders_main, shader_formula_scalar_float,  
            light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
            light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
            shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
            shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
            shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
            shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
            shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
            shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
            shader_flags);
        
        var t_stop = performance.now();
        console.log("Performance: Prepare left shader in: ", Math.ceil(t_stop-t_start), "ms");
    }

    ShouldPrepareRaytracingShaderSide(gl){

        //get variables
        var shader_formula_scalar_float = GetFormulaFloat("input_formula_scalar");
        var light_transport_p0 = GetFormula("input_field_light_transport_p0");
        var light_transport_p1 = GetFormula("input_field_light_transport_p1");
        var light_transport_p2 = GetFormula("input_field_light_transport_p2");
        var light_transport_p3 = GetFormula("input_field_light_transport_p3");
        var light_transport_d0 = GetFormula("input_field_light_transport_d0");
        var light_transport_d1 = GetFormula("input_field_light_transport_d1");
        var light_transport_d2 = GetFormula("input_field_light_transport_d2");
        var light_transport_d3 = GetFormula("input_field_light_transport_d3");

        var shader_rule_x_pos_x = GetFormula("input_field_shader_rule_x_pos_x");
        var shader_rule_x_pos_y = GetFormula("input_field_shader_rule_x_pos_y");
        var shader_rule_x_pos_z = GetFormula("input_field_shader_rule_x_pos_z");
        var shader_rule_x_neg_x = GetFormula("input_field_shader_rule_x_neg_x");
        var shader_rule_x_neg_y = GetFormula("input_field_shader_rule_x_neg_y");
        var shader_rule_x_neg_z = GetFormula("input_field_shader_rule_x_neg_z");

        var shader_rule_y_pos_x = GetFormula("input_field_shader_rule_y_pos_x");
        var shader_rule_y_pos_y = GetFormula("input_field_shader_rule_y_pos_y");
        var shader_rule_y_pos_z = GetFormula("input_field_shader_rule_y_pos_z");
        var shader_rule_y_neg_x = GetFormula("input_field_shader_rule_y_neg_x");
        var shader_rule_y_neg_y = GetFormula("input_field_shader_rule_y_neg_y");
        var shader_rule_y_neg_z = GetFormula("input_field_shader_rule_y_neg_z");

        var shader_rule_z_pos_x = GetFormula("input_field_shader_rule_z_pos_x");
        var shader_rule_z_pos_y = GetFormula("input_field_shader_rule_z_pos_y");
        var shader_rule_z_pos_z = GetFormula("input_field_shader_rule_z_pos_z");
        var shader_rule_z_neg_x = GetFormula("input_field_shader_rule_z_neg_x");
        var shader_rule_z_neg_y = GetFormula("input_field_shader_rule_z_neg_y");
        var shader_rule_z_neg_z = GetFormula("input_field_shader_rule_z_neg_z");

        this.canvas_wrapper_side.UpdateShaderFlags();
        var shader_flags = this.canvas_wrapper_side.shader_flags;

        this.flag_prepare_side = this.ShouldPrepareRaytracingShader(gl, this.dict_shaders_side, shader_formula_scalar_float,  
            light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
            light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
            shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
            shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
            shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
            shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
            shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
            shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
            shader_flags);
        return this.flag_prepare_side;
    }

    PrepareRaytracingShaderSide(gl){
        console.log("PrepareRaytracingShaderSide");
        var t_start = performance.now();
        input_formula_scalar
        //get variables
        var shader_formula_scalar_float = GetFormulaFloat("input_formula_scalar");
        var light_transport_p0 = GetFormula("input_field_light_transport_p0");
        var light_transport_p1 = GetFormula("input_field_light_transport_p1");
        var light_transport_p2 = GetFormula("input_field_light_transport_p2");
        var light_transport_p3 = GetFormula("input_field_light_transport_p3");
        var light_transport_d0 = GetFormula("input_field_light_transport_d0");
        var light_transport_d1 = GetFormula("input_field_light_transport_d1");
        var light_transport_d2 = GetFormula("input_field_light_transport_d2");
        var light_transport_d3 = GetFormula("input_field_light_transport_d3");

        var shader_rule_x_pos_x = GetFormula("input_field_shader_rule_x_pos_x");
        var shader_rule_x_pos_y = GetFormula("input_field_shader_rule_x_pos_y");
        var shader_rule_x_pos_z = GetFormula("input_field_shader_rule_x_pos_z");
        var shader_rule_x_neg_x = GetFormula("input_field_shader_rule_x_neg_x");
        var shader_rule_x_neg_y = GetFormula("input_field_shader_rule_x_neg_y");
        var shader_rule_x_neg_z = GetFormula("input_field_shader_rule_x_neg_z");

        var shader_rule_y_pos_x = GetFormula("input_field_shader_rule_y_pos_x");
        var shader_rule_y_pos_y = GetFormula("input_field_shader_rule_y_pos_y");
        var shader_rule_y_pos_z = GetFormula("input_field_shader_rule_y_pos_z");
        var shader_rule_y_neg_x = GetFormula("input_field_shader_rule_y_neg_x");
        var shader_rule_y_neg_y = GetFormula("input_field_shader_rule_y_neg_y");
        var shader_rule_y_neg_z = GetFormula("input_field_shader_rule_y_neg_z");

        var shader_rule_z_pos_x = GetFormula("input_field_shader_rule_z_pos_x");
        var shader_rule_z_pos_y = GetFormula("input_field_shader_rule_z_pos_y");
        var shader_rule_z_pos_z = GetFormula("input_field_shader_rule_z_pos_z");
        var shader_rule_z_neg_x = GetFormula("input_field_shader_rule_z_neg_x");
        var shader_rule_z_neg_y = GetFormula("input_field_shader_rule_z_neg_y");
        var shader_rule_z_neg_z = GetFormula("input_field_shader_rule_z_neg_z");

        this.canvas_wrapper_side.UpdateShaderFlags();
        var shader_flags = this.canvas_wrapper_side.shader_flags;

        //get container
        this.container_side = this.PrepareRaytracingShader(gl, this.dict_shaders_side, shader_formula_scalar_float,  
            light_transport_p0, light_transport_p1, light_transport_p2, light_transport_p3, 
            light_transport_d0, light_transport_d1, light_transport_d2, light_transport_d3,
            shader_rule_x_pos_x, shader_rule_x_pos_y, shader_rule_x_pos_z,
            shader_rule_x_neg_x, shader_rule_x_neg_y, shader_rule_x_neg_z,
            shader_rule_y_pos_x, shader_rule_y_pos_y, shader_rule_y_pos_z,
            shader_rule_y_neg_x, shader_rule_y_neg_y, shader_rule_y_neg_z,
            shader_rule_z_pos_x, shader_rule_z_pos_y, shader_rule_z_pos_z,
            shader_rule_z_neg_x, shader_rule_z_neg_y, shader_rule_z_neg_z,
            shader_flags);
        
        var t_stop = performance.now();
        console.log("Performance: Prepare right shader in: ", Math.ceil(t_stop-t_start), "ms");
    }

    CheckRaytracingShaders(gl_main, gl_side, ext_parallel_main, ext_parallel_side){
        var ok_left = this.container_main.check_status(gl_main, ext_parallel_main);
        var ok_right = this.container_side.check_status(gl_side, ext_parallel_side);
        this.shaders_linked = ok_left && ok_right;
        this.settings_changed = false;
    }



}

module.exports = ShaderManager;