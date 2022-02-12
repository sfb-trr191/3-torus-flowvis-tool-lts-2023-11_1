const ShaderContainer = require("./shader_container");

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

    GetShader(shader_formula_scalar, shader_flags) {
        var code = F_SHADER_RAYTRACING_PREPROCESSOR.replace("shader_formula_scalar", shader_formula_scalar);

        var defines = "";
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
        
        code = code.replace("$defines$", defines);
        console.log(code);
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

    GetShaderKey(shader_formula_scalar_float, shader_flags){
        var key = shader_formula_scalar_float;

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
        return key;
    }

    PrepareRaytracingShader(gl, dict_shaders, shader_formula_scalar_float, shader_flags){
        //the return container
        var container;

        //get shader key
        var shader_key = this.GetShaderKey(shader_formula_scalar_float, shader_flags);

        //get old container if possible
        if(shader_key in dict_shaders){
            console.log("Performance: shader_key:", shader_key, "already exists");
            container = dict_shaders[shader_key];
        }
        //otherwise create new container
        else{
            console.log("Performance: shader_key:", shader_key, "is created");
            var f_source = this.GetShader(shader_formula_scalar_float, shader_flags);
            container = new ShaderContainer(gl, f_source, V_SHADER_RAYTRACING);
            dict_shaders[shader_key] = container;
        }
        return container;
    }

    PrepareRaytracingShaderMain(gl){
        var t_start = performance.now();

        //get variables
        var shader_formula_scalar = document.getElementById("input_formula_scalar").value;
        var shader_formula_scalar_float = shader_formula_scalar.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
            return ($2 == ".") ? $0 : $0 + ".0";
        });

        this.canvas_wrapper_main.UpdateShaderFlags();
        var shader_flags = this.canvas_wrapper_main.shader_flags;

        //get container
        this.container_main = this.PrepareRaytracingShader(gl, this.dict_shaders_main, shader_formula_scalar_float, shader_flags);
        
        var t_stop = performance.now();
        console.log("Performance: Prepare left shader in: ", Math.ceil(t_stop-t_start), "ms");
    }

    PrepareRaytracingShaderSide(gl){
        var t_start = performance.now();

        //get variables
        var shader_formula_scalar = document.getElementById("input_formula_scalar").value;
        var shader_formula_scalar_float = shader_formula_scalar.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
            return ($2 == ".") ? $0 : $0 + ".0";
        });

        this.canvas_wrapper_side.UpdateShaderFlags();
        var shader_flags = this.canvas_wrapper_side.shader_flags;

        //get container
        this.container_side = this.PrepareRaytracingShader(gl, this.dict_shaders_side, shader_formula_scalar_float, shader_flags);
        
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