class ShaderManager {
    constructor() {

    }

    GetDefaultShader() {
        var code = F_SHADER_RAYTRACING.replace("shader_formula_scalar", "0.0");
        return code;
    }

    GetShader(shader_formula_scalar) {
        var code = F_SHADER_RAYTRACING.replace("shader_formula_scalar", shader_formula_scalar);
        return code;
    }

    GetShaderComputeFlowMapSlice(shader_formula_u, shader_formula_v, shader_formula_w){
        var code = F_SHADER_COMPUTE_FLOW_MAP_SLICE;
        code = code.replace("shader_formula_u", shader_formula_u);
        code = code.replace("shader_formula_v", shader_formula_v);
        code = code.replace("shader_formula_w", shader_formula_w);
        return code;  
    }
}