class ShaderManager{
    constructor(){

    }

    GetDefaultShader(){
        var code = F_SHADER_RAYTRACING.replace("shader_formula_scalar", "0.0");
        return code;
    }

    GetShader(shader_formula_scalar){
        var code = F_SHADER_RAYTRACING.replace("shader_formula_scalar", shader_formula_scalar);
        return code;
    }
}