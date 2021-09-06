const ShaderContainer = require("./shader_container");

class ShaderManager {
    constructor() {
        this.shaders_linked = false;
        this.settings_changed = false;
        this.dict_shaders_main = {};
        this.dict_shaders_side = {};
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

    GetShader(shader_formula_scalar) {
        var code = F_SHADER_RAYTRACING_PREPROCESSOR.replace("shader_formula_scalar", shader_formula_scalar);
        return code;
    }

    GetShaderComputeFlowMapSlice(shader_formula_u, shader_formula_v, shader_formula_w){
        var code = F_SHADER_COMPUTE_FLOW_MAP_SLICE;
        code = code.replace("shader_formula_u", shader_formula_u);
        code = code.replace("shader_formula_v", shader_formula_v);
        code = code.replace("shader_formula_w", shader_formula_w);
        return code;  
    }

    GetShaderKey(shader_formula_scalar_float){
        return shader_formula_scalar_float;
    }

    PrepareRaytracingShader(gl, dict_shaders, shader_formula_scalar_float){
        //the return container
        var container;

        //get shader key
        var shader_key = this.GetShaderKey(shader_formula_scalar_float);

        //get old container if possible
        if(shader_key in dict_shaders){
            console.log("Performance: shader_key:", shader_key, "already exists");
            container = dict_shaders[shader_key];
        }
        //otherwise create new container
        else{
            console.log("Performance: shader_key:", shader_key, "is created");
            var f_source = this.GetShader(shader_formula_scalar_float);
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

        this.container_main = this.PrepareRaytracingShader(gl, this.dict_shaders_main, shader_formula_scalar_float);
        
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

        this.container_side = this.PrepareRaytracingShader(gl, this.dict_shaders_side, shader_formula_scalar_float);
        
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