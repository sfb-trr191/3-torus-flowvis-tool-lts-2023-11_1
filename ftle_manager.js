const ComputeWrapper = require("./compute_wraper");
const ShaderUniforms = require("./shader_uniforms");
const DummyQuad = require("./dummy_quad");
const VTK_File = require("./vtk_file");
const { DataTextures, DataTexture3D_RGBA, DataTexture3D_R } = require("./data_textures");
const module_webgl = require("./webgl");
const loadShaderProgramFromCode = module_webgl.loadShaderProgramFromCode;
const module_utility = require("./utility");
const regexIntToFloat = module_utility.regexIntToFloat;
const {
    Matrix,
    inverse,
    solve,
    linearDependencies,
    QrDecomposition,
    LuDecomposition,
    CholeskyDecomposition,
    EigenvalueDecomposition
} = require('ml-matrix');
const JSZip = require("jszip");
const FileSaver = require("file-saver");
const glMatrix = require("gl-matrix");
//const V_SHADER_RAYTRACING = require("./shader/v_shader_raytracing.js");
//const F_SHADER_PLACEHOLDER = require("./shader/f_shader_placeholder.glsl");

class UniformLocationsComputeFlowMapSlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsComputeFlowMapSlice: ", name)
        this.location_dim_x_extended = gl.getUniformLocation(program, "dim_x_extended");
        this.location_dim_y_extended = gl.getUniformLocation(program, "dim_y_extended");
        this.location_dim_z_extended = gl.getUniformLocation(program, "dim_z_extended");
        this.location_extended_min_x = gl.getUniformLocation(program, "extended_min_x");
        this.location_extended_min_y = gl.getUniformLocation(program, "extended_min_y");
        this.location_extended_min_z = gl.getUniformLocation(program, "extended_min_z");
        this.location_extended_max_x = gl.getUniformLocation(program, "extended_max_x");
        this.location_extended_max_y = gl.getUniformLocation(program, "extended_max_y");
        this.location_extended_max_z = gl.getUniformLocation(program, "extended_max_z");
        this.location_slice_index = gl.getUniformLocation(program, "slice_index");
        this.location_sign_f = gl.getUniformLocation(program, "sign_f");        
        this.location_step_size = gl.getUniformLocation(program, "step_size");
        this.location_termination_condition = gl.getUniformLocation(program, "termination_condition");
        this.location_advection_time = gl.getUniformLocation(program, "advection_time");
        this.location_termination_arc_length = gl.getUniformLocation(program, "termination_arc_length");
        
    }
}

class UniformLocationsComputeFlowMapFiniteDifferences {
    constructor(gl, program, name) {
        console.log("UniformLocationsComputeFlowMapFiniteDifferences: ", name)
        this.location_texture_flow_map = gl.getUniformLocation(program, "texture_flow_map");        
        this.location_dim_x = gl.getUniformLocation(program, "dim_x");
        this.location_dim_y = gl.getUniformLocation(program, "dim_y");
        this.location_dim_z = gl.getUniformLocation(program, "dim_z");
        this.location_slice_index = gl.getUniformLocation(program, "slice_index");
        this.location_direction = gl.getUniformLocation(program, "direction");
        this.location_h2 = gl.getUniformLocation(program, "h2");
        this.location_is_forward = gl.getUniformLocation(program, "is_forward");
    }
}

class UniformLocationsComputeFTLENormals {
    constructor(gl, program, name) {
        console.log("UniformLocationsComputeFTLENormals: ", name)
        this.location_texture_ftle = gl.getUniformLocation(program, "texture_ftle");
        this.location_dim_x = gl.getUniformLocation(program, "dim_x");
        this.location_dim_y = gl.getUniformLocation(program, "dim_y");
        this.location_dim_z = gl.getUniformLocation(program, "dim_z");
        this.location_slice_index = gl.getUniformLocation(program, "slice_index");
        this.location_h2_x = gl.getUniformLocation(program, "h2_x");
        this.location_h2_y = gl.getUniformLocation(program, "h2_y");
        this.location_h2_z = gl.getUniformLocation(program, "h2_z");
        this.location_is_forward = gl.getUniformLocation(program, "is_forward");
    }
}

class UniformLocationsCompute2zGradientSlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsCompute2zGradientSlice: ", name)
        this.location_texture_scalar_fields = gl.getUniformLocation(program, "texture_scalar_fields");
        this.location_dim_x = gl.getUniformLocation(program, "dim_x");
        this.location_dim_y = gl.getUniformLocation(program, "dim_y");
        this.location_dim_z = gl.getUniformLocation(program, "dim_z");
        this.location_slice_index = gl.getUniformLocation(program, "slice_index");
        this.location_h2_x = gl.getUniformLocation(program, "h2_x");
        this.location_h2_y = gl.getUniformLocation(program, "h2_y");
        this.location_h2_z = gl.getUniformLocation(program, "h2_z");
        this.location_is_forward = gl.getUniformLocation(program, "is_forward");
    }
}

class UniformLocationsCompute2zJacobyColumnSlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsCompute2zJacobyColumnSlice: ", name)
        this.location_texture_vector_fields = gl.getUniformLocation(program, "texture_vector_fields");        
        this.location_dim_x = gl.getUniformLocation(program, "dim_x");
        this.location_dim_y = gl.getUniformLocation(program, "dim_y");
        this.location_dim_z = gl.getUniformLocation(program, "dim_z");
        this.location_slice_index = gl.getUniformLocation(program, "slice_index");
        this.location_direction = gl.getUniformLocation(program, "direction");
        this.location_h2 = gl.getUniformLocation(program, "h2");
        this.location_is_forward = gl.getUniformLocation(program, "is_forward");
    }
}

class UniformLocationsCompute2zSymmetricColumnSlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsCompute2zSymmetricColumnSlice: ", name)
        this.location_texture_column0 = gl.getUniformLocation(program, "texture_column0");       
        this.location_texture_column1 = gl.getUniformLocation(program, "texture_column1");    
        this.location_texture_column2 = gl.getUniformLocation(program, "texture_column2");     
        this.location_dim_x = gl.getUniformLocation(program, "dim_x");
        this.location_dim_y = gl.getUniformLocation(program, "dim_y");
        this.location_dim_z = gl.getUniformLocation(program, "dim_z");
        this.location_slice_index = gl.getUniformLocation(program, "slice_index");
        this.location_column_index = gl.getUniformLocation(program, "column_index");//direction
        this.location_is_forward = gl.getUniformLocation(program, "is_forward");
    }
}

class FTLEManager {

    constructor(gl, gl_side, p_streamline_context, p_shader_manager, p_christoffel) {
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.p_shader_manager = p_shader_manager;
        this.p_christoffel = p_christoffel;
        this.dim_x = 100;
        this.dim_y = 100;
        this.dim_z = 100;
        this.force_symmetric = true;
        this.UpdateExtendedDims(gl);
        this.step_size = 0.0125;
        this.advection_time = 0.5;
        this.termination_arc_length = 0.5;
        this.termination_condition = FTLE_TERMINATION_CONDITION_ADVECTION_TIME;
        this.ftle_max_value = 0;
        this.ftle_min_value = 0;

        //temporary textures
        this.data_texture_flowmap = new DataTexture3D_RGBA(gl);
        this.data_texture_flowmap_diff_x = new DataTexture3D_RGBA(gl);
        this.data_texture_flowmap_diff_y = new DataTexture3D_RGBA(gl);
        this.data_texture_flowmap_diff_z = new DataTexture3D_RGBA(gl);
        this.data_texture_ftle_jacoby_direction_x_tmp = new DataTexture3D_RGBA(gl);
        this.data_texture_ftle_jacoby_direction_y_tmp = new DataTexture3D_RGBA(gl);
        this.data_texture_ftle_jacoby_direction_z_tmp = new DataTexture3D_RGBA(gl);

        //main textures
        this.data_texture_ftle = new DataTexture3D_R(gl);
        this.data_texture_ftle_gradient = new DataTexture3D_RGBA(gl);
        this.data_texture_ftle_jacoby_direction_x = new DataTexture3D_RGBA(gl);
        this.data_texture_ftle_jacoby_direction_y = new DataTexture3D_RGBA(gl);
        this.data_texture_ftle_jacoby_direction_z = new DataTexture3D_RGBA(gl);

        //side textures
        this.data_texture_ftle_side = new DataTexture3D_R(gl_side);
        this.data_texture_ftle_gradient_side = new DataTexture3D_RGBA(gl_side);
        this.data_texture_ftle_jacoby_direction_x_side = new DataTexture3D_RGBA(gl_side);
        this.data_texture_ftle_jacoby_direction_y_side = new DataTexture3D_RGBA(gl_side);
        this.data_texture_ftle_jacoby_direction_z_side = new DataTexture3D_RGBA(gl_side);

        this.program_compute_flowmap_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_slice, V_SHADER_RAYTRACING, F_SHADER_PLACEHOLDER);
        this.location_compute_flowmap_slice = new UniformLocationsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.shader_uniforms_compute_flowmap_slice = this.loadShaderUniformsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.attribute_location_dummy_program_compute_flowmap_slice = gl.getAttribLocation(this.program_compute_flowmap_slice, "a_position");

        this.program_compute_flowmap_finite_differences = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_finite_differences, V_SHADER_RAYTRACING, F_SHADER_COMPUTE_FLOWMAP_FINITE_DIFFERENCES);
        this.location_compute_flowmap_finite_differences = new UniformLocationsComputeFlowMapFiniteDifferences(gl, this.program_compute_flowmap_finite_differences);
        this.shader_uniforms_compute_flowmap_finite_differences = this.loadShaderUniformsComputeFlowMapFiniteDifferences(gl, this.program_compute_flowmap_finite_differences);
        this.attribute_location_dummy_program_compute_flowmap_finite_differences = gl.getAttribLocation(this.program_compute_flowmap_finite_differences, "a_position");

        this.program_compute_2z_gradient_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_2z_gradient_slice, V_SHADER_RAYTRACING, F_SHADER_COMPUTE_2Z_GRADIENT_SLICE);
        this.location_compute_compute_2z_gradient_slice = new UniformLocationsCompute2zGradientSlice(gl, this.program_compute_2z_gradient_slice);
        this.shader_uniforms_compute_compute_2z_gradient_slice = this.loadShaderUniformsCompute2zGradientSlice(gl, this.program_compute_2z_gradient_slice);
        this.attribute_location_dummy_program_compute_2z_gradient_slice = gl.getAttribLocation(this.program_compute_2z_gradient_slice, "a_position");
    
        this.program_compute_2z_jacoby_column_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_2z_jacoby_column_slice, V_SHADER_RAYTRACING, F_SHADER_COMPUTE_2Z_JACOBY_COLUMN_SLICE);
        this.location_compute_2z_jacoby_column_slice = new UniformLocationsCompute2zJacobyColumnSlice(gl, this.program_compute_2z_jacoby_column_slice);
        this.shader_uniforms_compute_2z_jacoby_column_slice = this.loadShaderUniformsCompute2zJacobyColumnSlice(gl, this.program_compute_2z_jacoby_column_slice);
        this.attribute_location_dummy_program_compute_2z_jacoby_column_slice = gl.getAttribLocation(this.program_compute_2z_jacoby_column_slice, "a_position");

        this.program_compute_2z_symmetric_column_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_2z_symmetric_column_slice, V_SHADER_RAYTRACING, F_SHADER_COMPUTE_2Z_SYMMETRIC_COLUMN_SLICE);
        this.location_compute_2z_symmetric_column_slice = new UniformLocationsCompute2zSymmetricColumnSlice(gl, this.program_compute_2z_symmetric_column_slice);
        this.shader_uniforms_compute_2z_symmetric_column_slice = this.loadShaderUniformsCompute2zJacobyColumnSlice(gl, this.program_compute_2z_symmetric_column_slice);
        this.attribute_location_dummy_program_compute_2z_symmetric_column_slice = gl.getAttribLocation(this.program_compute_2z_symmetric_column_slice, "a_position");

        this.dummy_quad = new DummyQuad(gl);
    }

    UpdateExtendedDims(gl) {
        var h_x = 1 / (this.dim_x - 1)
        var h_y = 1 / (this.dim_y - 1)
        var h_z = 1 / (this.dim_z - 1)

        var dim_x_extended = this.dim_x + 2;
        var dim_y_extended = this.dim_y + 2;
        var dim_z_extended = this.dim_z + 2;
        this.extended_min_x = 0 - h_x;
        this.extended_min_y = 0 - h_y;
        this.extended_min_z = 0 - h_z;
        this.extended_max_x = 1 + h_x;
        this.extended_max_y = 1 + h_y;
        this.extended_max_z = 1 + h_z;

        var changed = dim_x_extended != this.dim_x_extended
            || dim_y_extended != this.dim_y_extended
            || dim_z_extended != this.dim_z_extended;

        this.dim_x_extended = dim_x_extended;
        this.dim_y_extended = dim_y_extended;
        this.dim_z_extended = dim_z_extended;

        if(changed){
            this.compute_wrapper_extended = new ComputeWrapper(gl, "compute_wrapper_extended", this.dim_x_extended, this.dim_y_extended);
            this.compute_wrapper = new ComputeWrapper(gl, "compute_wrapper", this.dim_x, this.dim_y);
        }
    }

    ReplaceComputeFlowMapSliceShader(gl) {
        //MARKER_RENAME_SYMBOLS
        console.log("ReplaceComputeFlowMapSliceShader");
        console.log(gl);
        var space = this.p_streamline_generator.space;
        var shader_formula_u = this.p_streamline_generator.shader_formula_u;
        var shader_formula_v = this.p_streamline_generator.shader_formula_v;
        var shader_formula_w = this.p_streamline_generator.shader_formula_w;
        var shader_formula_a = this.p_streamline_generator.shader_formula_a;
        var shader_formula_b = this.p_streamline_generator.shader_formula_b;

        var shader_formula_u_float = regexIntToFloat(shader_formula_u);
        var shader_formula_v_float = regexIntToFloat(shader_formula_v);
        var shader_formula_w_float = regexIntToFloat(shader_formula_w);
        var shader_formula_a_float = regexIntToFloat(shader_formula_a);
        var shader_formula_b_float = regexIntToFloat(shader_formula_b);
        console.log("shader_formula_u: ", shader_formula_u_float);
        console.log("shader_formula_v: ", shader_formula_v_float);
        console.log("shader_formula_w: ", shader_formula_w_float);
        console.log("shader_formula_a: ", shader_formula_a_float);
        console.log("shader_formula_b: ", shader_formula_b_float);

        this.program_compute_flowmap_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_slice, V_SHADER_RAYTRACING,
            this.p_shader_manager.GetShaderComputeFlowMapSlice(space, shader_formula_u_float, shader_formula_v_float, shader_formula_w_float, shader_formula_a_float, shader_formula_b_float));
        this.location_compute_flowmap_slice = new UniformLocationsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.shader_uniforms_compute_flowmap_slice = this.loadShaderUniformsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.attribute_location_dummy_program_compute_flowmap_slice = gl.getAttribLocation(this.program_compute_flowmap_slice, "a_position");
    }

    ReplaceComputeFlowMapFiniteDifferencesShader(gl){
        console.log("ReplaceComputeFlowMapFiniteDifferencesShader");
        console.log(gl);
        var space = this.p_streamline_generator.space;

        this.program_compute_flowmap_finite_differences = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_finite_differences, V_SHADER_RAYTRACING, 
            this.p_shader_manager.GetShaderComputeFlowMapFiniteDifferences(space, this.p_christoffel));
        this.location_compute_flowmap_finite_differences = new UniformLocationsComputeFlowMapFiniteDifferences(gl, this.program_compute_flowmap_finite_differences);
        this.shader_uniforms_compute_flowmap_finite_differences = this.loadShaderUniformsComputeFlowMapFiniteDifferences(gl, this.program_compute_flowmap_finite_differences);
        this.attribute_location_dummy_program_compute_flowmap_finite_differences = gl.getAttribLocation(this.program_compute_flowmap_finite_differences, "a_position");
    }

    ReplaceCompute2zGradientSliceShader(gl){
        console.log("ReplaceCompute2zGradientSliceShader");
        console.log(gl);
        var space = this.p_streamline_generator.space;

        this.program_compute_2z_gradient_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_2z_gradient_slice, V_SHADER_RAYTRACING, 
            this.p_shader_manager.GetShaderCompute2zGradientSlice(space));
        this.location_compute_compute_2z_gradient_slice = new UniformLocationsCompute2zGradientSlice(gl, this.program_compute_2z_gradient_slice);
        this.shader_uniforms_compute_compute_2z_gradient_slice = this.loadShaderUniformsCompute2zGradientSlice(gl, this.program_compute_2z_gradient_slice);
        this.attribute_location_dummy_program_compute_2z_gradient_slice = gl.getAttribLocation(this.program_compute_2z_gradient_slice, "a_position");
    }

    ReplaceCompute2zJacobyColumnSliceShader(gl){
        console.log("ReplaceCompute2zJacobyColumnSliceShader");
        console.log(gl);
        var space = this.p_streamline_generator.space;

        this.program_compute_2z_jacoby_column_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_2z_jacoby_column_slice, V_SHADER_RAYTRACING, 
            this.p_shader_manager.GetShaderCompute2zJacobyColumnSlice(space, this.p_christoffel));
        this.location_compute_2z_jacoby_column_slice = new UniformLocationsCompute2zJacobyColumnSlice(gl, this.program_compute_2z_jacoby_column_slice);
        this.shader_uniforms_compute_2z_jacoby_column_slice = this.loadShaderUniformsCompute2zJacobyColumnSlice(gl, this.program_compute_2z_jacoby_column_slice);
        this.attribute_location_dummy_program_compute_2z_jacoby_column_slice = gl.getAttribLocation(this.program_compute_2z_jacoby_column_slice, "a_position");
    }

    bind(canvas_wrapper_name, gl, 
        location_texture_ftle, texture_ftle_index, 
        location_texture_ftle_gradient, texture_ftle_gradient_index, 
        location_texture_ftle_jacoby_direction_x, texture_ftle_jacoby_direction_x_index, 
        location_texture_ftle_jacoby_direction_y, texture_ftle_jacoby_direction_y_index, 
        location_texture_ftle_jacoby_direction_z, texture_ftle_jacoby_direction_z_index) {

        var data_texture_ftle = canvas_wrapper_name == CANVAS_WRAPPER_MAIN ? this.data_texture_ftle : this.data_texture_ftle_side;
        var data_texture_ftle_gradient = canvas_wrapper_name == CANVAS_WRAPPER_MAIN ? this.data_texture_ftle_gradient : this.data_texture_ftle_gradient_side;

        var data_texture_ftle_jacoby_direction_x = canvas_wrapper_name == CANVAS_WRAPPER_MAIN ? this.data_texture_ftle_jacoby_direction_x : this.data_texture_ftle_jacoby_direction_x_side;
        var data_texture_ftle_jacoby_direction_y = canvas_wrapper_name == CANVAS_WRAPPER_MAIN ? this.data_texture_ftle_jacoby_direction_y : this.data_texture_ftle_jacoby_direction_y_side;
        var data_texture_ftle_jacoby_direction_z = canvas_wrapper_name == CANVAS_WRAPPER_MAIN ? this.data_texture_ftle_jacoby_direction_z : this.data_texture_ftle_jacoby_direction_z_side;

        gl.activeTexture(gl.TEXTURE0 + texture_ftle_index);
        gl.bindTexture(gl.TEXTURE_3D, data_texture_ftle.texture.texture);
        gl.uniform1i(location_texture_ftle, texture_ftle_index);

        gl.activeTexture(gl.TEXTURE0 + texture_ftle_gradient_index);
        gl.bindTexture(gl.TEXTURE_3D, data_texture_ftle_gradient.texture.texture);
        gl.uniform1i(location_texture_ftle_gradient, texture_ftle_gradient_index);

        gl.activeTexture(gl.TEXTURE0 + texture_ftle_jacoby_direction_x_index);
        gl.bindTexture(gl.TEXTURE_3D, data_texture_ftle_jacoby_direction_x.texture.texture);
        gl.uniform1i(location_texture_ftle_jacoby_direction_x, texture_ftle_jacoby_direction_x_index);

        gl.activeTexture(gl.TEXTURE0 + texture_ftle_jacoby_direction_y_index);
        gl.bindTexture(gl.TEXTURE_3D, data_texture_ftle_jacoby_direction_y.texture.texture);
        gl.uniform1i(location_texture_ftle_jacoby_direction_y, texture_ftle_jacoby_direction_y_index);

        gl.activeTexture(gl.TEXTURE0 + texture_ftle_jacoby_direction_z_index);
        gl.bindTexture(gl.TEXTURE_3D, data_texture_ftle_jacoby_direction_z.texture.texture);
        gl.uniform1i(location_texture_ftle_jacoby_direction_z, texture_ftle_jacoby_direction_z_index);

        /*
        gl.activeTexture(texture_ftle_differences_active);
        gl.bindTexture(gl.TEXTURE_3D, data_texture_ftle_gradient.texture.texture);
        gl.uniform1i(location_texture_ftle_gradient, texture_ftle_differences_index);
        */
    }

    initialize_statemachine(bo) {//bo = bo_calculate_ftle        
        this.enterState(FTLE_STATE_INITIALIZATION);
        this.finished = false;
        this.dim_x = bo.input_parameters.dim_x;
        this.dim_y = bo.input_parameters.dim_y;
        this.dim_z = bo.input_parameters.dim_z;
        this.UpdateExtendedDims(bo.gl);
        this.termination_condition = bo.input_parameters.termination_condition;
        this.advection_time = bo.input_parameters.advection_time;
        this.termination_arc_length = bo.input_parameters.termination_arc_length;
        this.step_size = bo.input_parameters.step_size;
        this.force_symmetric = bo.input_parameters.force_symmetric;
        this.highest_iteration_count = 0;
        this.enterState(FTLE_STATE_FLOW_MAP_SETUP);
    }

    enterState(state){
        console.log("enter state:", state)
        this.state = state;        
    }

    execute_statemachine(bo){//bo = bo_calculate_ftle      
        switch (this.state) {
            case FTLE_STATE_FLOW_MAP_SETUP:
                this.execute_flow_map_setup(bo);
                break;
            case FTLE_STATE_FLOW_MAP_COMPUTE:
                this.execute_flow_map_compute(bo);
                break;
            case FTLE_STATE_FLOW_MAP_FINISH:
                this.execute_flow_map_finish(bo);
                break;
            case FTLE_STATE_FLOW_MAP_FINITE_DIFFEREMCES_COMPUTE:
                this.execute_flow_map_compute_finite_differences_compute(bo);
                break;                
            case FTLE_STATE_FTLE:
                this.execute_ftle(bo);
                break; 
            case FTLE_STATE_FTLE_GRADIENT:
                this.execute_ftle_gradient(bo);
                break; 
            case FTLE_STATE_FTLE_JACOBY:
                this.execute_ftle_jacoby(bo);
                break; 
            case FTLE_STATE_SYMMETRIC:
                this.execute_ftle_symmetric(bo);
                break; 
            case FTLE_STATE_FINISH:
                this.execute_finish(bo);
                break;
            default:
                break;
        }
    }

    execute_flow_map_setup(bo){//bo = bo_calculate_ftle
        //MARKER_MODIFIED_STREAMLINE_CALCULATION
        //TODO: do not use extended dimension, we wrap around instead      
        this.createFTLEDebugger();  
        this.data_texture_flowmap.initDimensions(bo.gl, this.dim_x_extended, this.dim_y_extended, 2*this.dim_z_extended);
        this.ReplaceComputeFlowMapSliceShader(bo.gl);
        this.ReplaceComputeFlowMapFiniteDifferencesShader(bo.gl);
        this.ReplaceCompute2zGradientSliceShader(bo.gl);
        this.ReplaceCompute2zJacobyColumnSliceShader(bo.gl);

        bo.tmp.i = 0;
        bo.tmp.finished_forward = false;
        this.enterState(FTLE_STATE_FLOW_MAP_COMPUTE);
    }

    execute_flow_map_compute(bo){//bo = bo_calculate_ftle
        //MARKER_MODIFIED_STREAMLINE_CALCULATION
        //TODO: do not use extended dimension, we wrap around instead    
        if(!bo.tmp.finished_forward){
            if(bo.tmp.i == this.dim_z_extended){
                bo.tmp.finished_forward = true
                bo.tmp.i = 0;
            }else{
                this.computeFlowMapSlice(bo.gl, bo.tmp.i, true);
                bo.tmp.i += 1;
                var progress = bo.tmp.i / (2 * this.dim_z_extended)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_1");
            }
        }
        else{
            if(bo.tmp.i == this.dim_z_extended){
                this.enterState(FTLE_STATE_FLOW_MAP_FINISH);
            }else{
                this.computeFlowMapSlice(bo.gl, bo.tmp.i, false);
                bo.tmp.i += 1;
                var progress = (this.dim_z_extended + bo.tmp.i) / (2 * this.dim_z_extended)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_1");
            }
        }
    }

    execute_flow_map_finish(bo){//bo = bo_calculate_ftle
        //this.runFTLEDebuggerTests();
        this.data_texture_flowmap.update(bo.gl);

        bo.tmp.h2_x = 2 / (this.dim_x - 1);
        bo.tmp.h2_y = 2 / (this.dim_y - 1);
        bo.tmp.h2_z = 2 / (this.dim_z - 1);
        bo.tmp.h2 = bo.tmp.h2_x;
        bo.tmp.direction = 0;
        bo.tmp.data_texture = this.data_texture_flowmap_diff_x;
        bo.tmp.finished_forward = false;
        bo.tmp.i = 0;
        this.enterState(FTLE_STATE_FLOW_MAP_FINITE_DIFFEREMCES_COMPUTE);
    }

    execute_flow_map_compute_finite_differences_compute(bo){//bo = bo_calculate_ftle
        if(!bo.tmp.finished_forward){
            if(bo.tmp.i == this.dim_z){
                bo.tmp.finished_forward = true;
                bo.tmp.i = 0;
            }else{
                if(bo.tmp.i == 0){
                    bo.tmp.data_texture.initDimensions(bo.gl, this.dim_x, this.dim_y, 2*this.dim_z);
                }
                this.computeFlowMapFiniteDifferencesSlice(bo.gl, bo.tmp.i, bo.tmp.direction, bo.tmp.data_texture, bo.tmp.h2, true)
                bo.tmp.i += 1;
                var progress = ((bo.tmp.direction * 2 * this.dim_z) + bo.tmp.i) / (6 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_2");
            }
        }
        else{
            if(bo.tmp.i == this.dim_z){
                bo.tmp.data_texture.update(bo.gl);
                bo.tmp.finished_forward = false;
                bo.tmp.direction += 1;
                bo.tmp.i = 0;
                if(bo.tmp.direction == 1){
                    bo.tmp.h2 = bo.tmp.h2_y;
                    bo.tmp.data_texture = this.data_texture_flowmap_diff_y;
                }
                if(bo.tmp.direction == 2){
                    bo.tmp.h2 = bo.tmp.h2_z;
                    bo.tmp.data_texture = this.data_texture_flowmap_diff_z;
                }
                if(bo.tmp.direction == 3){
                    bo.tmp.finished_forward = false;
                    bo.tmp.i = 0;
                    this.enterState(FTLE_STATE_FTLE);
                }
            }else{
                this.computeFlowMapFiniteDifferencesSlice(bo.gl, bo.tmp.i, bo.tmp.direction, bo.tmp.data_texture, bo.tmp.h2, false)
                bo.tmp.i += 1;
                var progress = ((bo.tmp.direction * 2 * this.dim_z) + this.dim_z + bo.tmp.i) / (6 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_2");
            }
        }
    }

    execute_ftle(bo){//bo = bo_calculate_ftle
        if(!bo.tmp.finished_forward){
            if(bo.tmp.i == this.dim_z){
                bo.tmp.finished_forward = true
                bo.tmp.i = 0;
            }else{
                if(bo.tmp.i == 0){                    
                    this.data_texture_ftle.initDimensions(bo.gl, this.dim_x, this.dim_y, 2*this.dim_z);
                }
                this.computeFTLESlice(bo.gl, bo.tmp.i, true);
                bo.tmp.i += 1;
                var progress = bo.tmp.i / (2 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_3");
            }
        }
        else{
            if(bo.tmp.i == this.dim_z){
                this.data_texture_ftle.update(bo.gl);
                bo.tmp.finished_forward = false;
                bo.tmp.i = 0;
                this.enterState(FTLE_STATE_FTLE_GRADIENT);
            }else{
                this.computeFTLESlice(bo.gl, bo.tmp.i, false);
                bo.tmp.i += 1;
                var progress = (this.dim_z + bo.tmp.i) / (2 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_3");
            }
        }
    }
    
    execute_ftle_gradient(bo){//bo = bo_calculate_ftle
        if(!bo.tmp.finished_forward){
            if(bo.tmp.i == this.dim_z){
                bo.tmp.finished_forward = true
                bo.tmp.i = 0;
            }else{
                if(bo.tmp.i == 0){                    
                    this.data_texture_ftle_gradient.initDimensions(bo.gl, this.dim_x, this.dim_y, 2*this.dim_z);
                }
                this.computeFTLEGradientSlice(bo.gl, bo.tmp.i, this.data_texture_ftle_gradient, bo.tmp.h2_x, bo.tmp.h2_y, bo.tmp.h2_z, true);
                bo.tmp.i += 1;
                var progress = bo.tmp.i / (2 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_4");
            }
        }
        else{
            if(bo.tmp.i == this.dim_z){
                this.data_texture_ftle_gradient.update(bo.gl);
                //prepare next state
                bo.tmp.h2_x = 2 / (this.dim_x - 1);
                bo.tmp.h2_y = 2 / (this.dim_y - 1);
                bo.tmp.h2_z = 2 / (this.dim_z - 1);
                bo.tmp.h2 = bo.tmp.h2_x;
                bo.tmp.direction = 0;
                bo.tmp.data_texture = this.force_symmetric ? this.data_texture_ftle_jacoby_direction_x_tmp : this.data_texture_ftle_jacoby_direction_x;
                bo.tmp.finished_forward = false;
                bo.tmp.i = 0;

                this.enterState(FTLE_STATE_FTLE_JACOBY);
            }else{
                this.computeFTLEGradientSlice(bo.gl, bo.tmp.i, this.data_texture_ftle_gradient, bo.tmp.h2_x, bo.tmp.h2_y, bo.tmp.h2_z, false);
                bo.tmp.i += 1;
                var progress = (this.dim_z + bo.tmp.i) / (2 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_4");
            }
        }
    }

    execute_ftle_jacoby(bo){//bo = bo_calculate_ftle
        if(!bo.tmp.finished_forward){
            if(bo.tmp.i == this.dim_z){
                bo.tmp.finished_forward = true;
                bo.tmp.i = 0;
            }else{
                if(bo.tmp.i == 0){
                    bo.tmp.data_texture.initDimensions(bo.gl, this.dim_x, this.dim_y, 2*this.dim_z);
                }
                this.computeFTLEJacobySlice(bo.gl, bo.tmp.i, bo.tmp.direction, bo.tmp.data_texture, bo.tmp.h2, true)
                bo.tmp.i += 1;
                var progress = ((bo.tmp.direction * 2 * this.dim_z) + bo.tmp.i) / (6 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_5");
            }
        }
        else{
            if(bo.tmp.i == this.dim_z){
                bo.tmp.data_texture.update(bo.gl);
                bo.tmp.finished_forward = false;
                bo.tmp.direction += 1;
                bo.tmp.i = 0;
                if(bo.tmp.direction == 1){
                    bo.tmp.h2 = bo.tmp.h2_y;
                    bo.tmp.data_texture = this.force_symmetric ? this.data_texture_ftle_jacoby_direction_y_tmp : this.data_texture_ftle_jacoby_direction_y;
                }
                if(bo.tmp.direction == 2){
                    bo.tmp.h2 = bo.tmp.h2_z;
                    bo.tmp.data_texture = this.force_symmetric ? this.data_texture_ftle_jacoby_direction_z_tmp : this.data_texture_ftle_jacoby_direction_z; 
                }
                if(bo.tmp.direction == 3){
                    //prepare next state
                    if(this.force_symmetric){
                        bo.tmp.direction = 0;
                        bo.tmp.data_texture = this.data_texture_ftle_jacoby_direction_x;
                        bo.tmp.finished_forward = false;
                        bo.tmp.i = 0;
                        this.enterState(FTLE_STATE_SYMMETRIC);
                    }else{
                        this.enterState(FTLE_STATE_FINISH);
                    }
                }
            }else{
                this.computeFTLEJacobySlice(bo.gl, bo.tmp.i, bo.tmp.direction, bo.tmp.data_texture, bo.tmp.h2, false)
                bo.tmp.i += 1;
                var progress = ((bo.tmp.direction * 2 * this.dim_z) + this.dim_z + bo.tmp.i) / (6 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_5");
            }
        }
    }

    execute_ftle_symmetric(bo){//bo = bo_calculate_ftle
        if(!bo.tmp.finished_forward){
            if(bo.tmp.i == this.dim_z){
                bo.tmp.finished_forward = true;
                bo.tmp.i = 0;
            }else{
                if(bo.tmp.i == 0){
                    bo.tmp.data_texture.initDimensions(bo.gl, this.dim_x, this.dim_y, 2*this.dim_z);
                }
                this.computeFTLESymmetricSlice(bo.gl, bo.tmp.i, bo.tmp.direction, bo.tmp.data_texture, bo.tmp.h2, true)
                bo.tmp.i += 1;
                var progress = ((bo.tmp.direction * 2 * this.dim_z) + bo.tmp.i) / (6 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_6");
            }
        }
        else{
            if(bo.tmp.i == this.dim_z){
                bo.tmp.data_texture.update(bo.gl);
                bo.tmp.finished_forward = false;
                bo.tmp.direction += 1;
                bo.tmp.i = 0;
                if(bo.tmp.direction == 1){
                    bo.tmp.h2 = bo.tmp.h2_y;
                    bo.tmp.data_texture = this.data_texture_ftle_jacoby_direction_y;
                }
                if(bo.tmp.direction == 2){
                    bo.tmp.h2 = bo.tmp.h2_z;
                    bo.tmp.data_texture = this.data_texture_ftle_jacoby_direction_z;
                }
                if(bo.tmp.direction == 3){
                    //prepare next state
                    bo.tmp.direction = 0;
                    bo.tmp.finished_forward = false;
                    bo.tmp.i = 0;
                    this.enterState(FTLE_STATE_FINISH);
                }
            }else{
                this.computeFTLESymmetricSlice(bo.gl, bo.tmp.i, bo.tmp.direction, bo.tmp.data_texture, bo.tmp.h2, false)
                bo.tmp.i += 1;
                var progress = ((bo.tmp.direction * 2 * this.dim_z) + this.dim_z + bo.tmp.i) / (6 * this.dim_z)
                bo.OnProgressChanged(progress, "progress_bar_calculate_ftle_6");
            }
        }
    }

    execute_finish(bo){//bo = bo_calculate_ftle
        this.data_texture_ftle_side.copyFrom(bo.gl_side, this.data_texture_ftle);
        this.data_texture_ftle_gradient_side.copyFrom(bo.gl_side, this.data_texture_ftle_gradient);
        this.data_texture_ftle_jacoby_direction_x_side.copyFrom(bo.gl_side, this.data_texture_ftle_jacoby_direction_x);
        this.data_texture_ftle_jacoby_direction_y_side.copyFrom(bo.gl_side, this.data_texture_ftle_jacoby_direction_y);
        this.data_texture_ftle_jacoby_direction_z_side.copyFrom(bo.gl_side, this.data_texture_ftle_jacoby_direction_z);

        /*
        this.data_texture_ftle_jacoby_direction_x.update(bo.gl);
        this.data_texture_ftle_jacoby_direction_y.update(bo.gl);
        this.data_texture_ftle_jacoby_direction_z.update(bo.gl);
        
        this.data_texture_ftle_jacoby_direction_x_side.update(bo.gl_side);
        this.data_texture_ftle_jacoby_direction_y_side.update(bo.gl_side);
        this.data_texture_ftle_jacoby_direction_z_side.update(bo.gl_side);
        */
        bo.finish();

        this.finished = true;
    }

    /*
    compute(gl, gl_side, dim_x, dim_y, dim_z, advection_time, step_size) {
        this.dim_x = dim_x;
        this.dim_y = dim_y;
        this.dim_z = dim_z;
        this.UpdateExtendedDims(gl);
        this.advection_time = advection_time;
        this.step_size = step_size;
        this.highest_iteration_count = 0;
        this.computeFlowMap(gl);
        console.log(this.data_texture_flowmap.texture.texture_data);

        this.computeFlowMapFiniteDifferences(gl);
        this.computeFTLE(gl);
        this.computeFTLENormals(gl);

        this.data_texture_ftle_side.copyFrom(gl_side, this.data_texture_ftle);
        this.data_texture_ftle_gradient_side.copyFrom(gl_side, this.data_texture_ftle_gradient);
    }
    */

    /*
    computeFlowMap(gl) {
        console.log("computeFlowMap");
        console.log("this.dim_x_extended: ", this.dim_x_extended);
        console.log("this.dim_y_extended: ", this.dim_y_extended);
        console.log("this.dim_z_extended: ", this.dim_z_extended);
        console.log("this.extended_min_x: ", this.extended_min_x);
        console.log("this.extended_min_y: ", this.extended_min_y);
        console.log("this.extended_min_z: ", this.extended_min_z);
        console.log("this.extended_max_x: ", this.extended_max_x);
        console.log("this.extended_max_y: ", this.extended_max_y);
        console.log("this.extended_max_z: ", this.extended_max_z);
        this.data_texture_flowmap.initDimensions(gl, this.dim_x_extended, this.dim_y_extended, 2*this.dim_z_extended);
        this.ReplaceComputeFlowMapSliceShader(gl);
        for (var i = 0; i < this.dim_z_extended; i++) {
            this.computeFlowMapSlice(gl, i, true);
        }
        for (var i = 0; i < this.dim_z_extended; i++) {
            this.computeFlowMapSlice(gl, i, false);
        }
        this.data_texture_flowmap.update(gl);
    }
    */

    createFTLEDebugger(){
        this.ftle_debugger = {};
    }

    addFTLEDebuggerSlice(slice_data, slice_index){
        this.ftle_debugger[slice_index] = slice_data;
    }

    runFTLEDebuggerTests(){
        var slice_data = this.ftle_debugger[50];
        console.warn("runFTLEDebuggerTests");

        var data = this.debugPixelFlowMapSlice(slice_data,0,1);
        console.warn(data);
        var data = this.debugPixelFlowMapSlice(slice_data,this.dim_x_extended-3,1);
        console.warn(data);
        var data = this.debugPixelFlowMapSlice(slice_data,1,1);
        console.warn(data);
        var data = this.debugPixelFlowMapSlice(slice_data,this.dim_x_extended-2,1);
        console.warn(data);

        //this.testFTLEDebuggerPoint(0, 1, 50);
        //this.testFTLEDebuggerPoint(this.dim_x_extended-3, 1, 50);
        //this.testFTLEDebuggerPoint(1, 1, 50);
        //this.testFTLEDebuggerPoint(this.dim_x_extended-2, 1, 50);

        //check inside
        
        for(var z_index_extended=0; z_index_extended<this.dim_z_extended; z_index_extended++){
            for(var y_index_extended=0; y_index_extended<this.dim_y_extended; y_index_extended++){
                for(var x_index_extended=0; x_index_extended<this.dim_x_extended; x_index_extended++){
                    this.testFTLEDebuggerPoint(x_index_extended, y_index_extended, z_index_extended);
                }
            }
        }
        

        debugger;
    }

    //returns 0 for any node inside the FD
    //returns 1 for a node that is interesting (i.e. requires boundary rules)
    //returns 2 for edges --> no computation required
    //returns 3 for corners --> no computation required
    CountBorderDimensions(x_index_extended, y_index_extended, z_index_extended)
    {
        var count = 0;
        count += (x_index_extended == 0 || x_index_extended == this.dim_x_extended-1) ? 1 : 0;
        count += (y_index_extended == 0 || y_index_extended == this.dim_y_extended-1) ? 1 : 0;
        count += (z_index_extended == 0 || z_index_extended == this.dim_z_extended-1) ? 1 : 0;
        return count;
    }

    testFTLEDebuggerPoint(x_index_extended, y_index_extended, z_index_extended){
        //console.warn("test point", x_index_extended, y_index_extended, z_index_extended);

        //console.warn("    ", value);

        var count = this.CountBorderDimensions(x_index_extended, y_index_extended, z_index_extended);
        if(count > 1){
            return;
        }
        else if(count == 1){  
            /*   
            var x_index_extended_torus_identical = x_index_extended;
            var y_index_extended_torus_identical = y_index_extended;
            var z_index_extended_torus_identical = z_index_extended;
            if(x_index_extended == 0){
                x_index_extended_torus_identical = this.dim_x_extended-3
            }
            else if(x_index_extended == this.dim_x_extended-1){
                x_index_extended_torus_identical = 2
            }
            if(y_index_extended == 0){
                y_index_extended_torus_identical = this.dim_y_extended-3
            }
            else if(y_index_extended == this.dim_y_extended-1){
                y_index_extended_torus_identical = 2
            }
            if(z_index_extended == 0){
                z_index_extended_torus_identical = this.dim_z_extended-3
            }
            else if(z_index_extended == this.dim_z_extended-1){
                z_index_extended_torus_identical = 2
            }
            var slice_data = this.ftle_debugger[z_index_extended];
            var value = this.debugPixelFlowMapSlice(slice_data, x_index_extended, y_index_extended);
            var slice_data_identical = this.ftle_debugger[z_index_extended_torus_identical];
            var value_identical = this.debugPixelFlowMapSlice(slice_data_identical, x_index_extended_torus_identical, y_index_extended_torus_identical);
            console.warn("test point", x_index_extended, y_index_extended, z_index_extended);
            console.warn("identical", x_index_extended_torus_identical, y_index_extended_torus_identical, z_index_extended_torus_identical);
            console.warn("value", value);
            console.warn("value_identical", value_identical);
            */
        }
        else{
            var x_index_extended_torus_identical = x_index_extended;
            var y_index_extended_torus_identical = y_index_extended;
            var z_index_extended_torus_identical = z_index_extended;
            if(x_index_extended == 1){
                x_index_extended_torus_identical = this.dim_x_extended-2
                var slice_data = this.ftle_debugger[z_index_extended];
                var value = this.debugPixelFlowMapSlice(slice_data, x_index_extended, y_index_extended);
                var slice_data_identical = this.ftle_debugger[z_index_extended_torus_identical];
                var value_identical = this.debugPixelFlowMapSlice(slice_data_identical, x_index_extended_torus_identical, y_index_extended_torus_identical);
                console.warn("test point", x_index_extended, y_index_extended, z_index_extended);
                console.warn("identical", x_index_extended_torus_identical, y_index_extended_torus_identical, z_index_extended_torus_identical);
                console.warn("value", value);
                console.warn("value_identical", value_identical);
                console.warn("x diff", Math.abs(value[0] - value_identical[0]));
            }

        }


    }

    debugPixelFlowMapSlice(slice_data, x_index_extended, y_index_extended){
        var global_index = x_index_extended + this.dim_x_extended * y_index_extended;
        var p = 4 * global_index;
        return glMatrix.vec4.fromValues(slice_data[p], slice_data[p+1], slice_data[p+2], slice_data[p+3]);
    }

    computeFlowMapSlice(gl, slice_index, is_forward) {
        var sign_f = is_forward ? 1.0 : -1.0;
        //var sign_f = 1.0;
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z_extended;
        //var z = slice_index / (this.dim_z - 1);
        //console.log("computeFlowMapSlice: ", slice_index);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper_extended.frame_buffer);
        gl.viewport(0, 0, this.dim_x_extended, this.dim_y_extended);
        gl.useProgram(this.program_compute_flowmap_slice);
        gl.uniform1i(this.location_compute_flowmap_slice.location_dim_x_extended, this.dim_x_extended);
        gl.uniform1i(this.location_compute_flowmap_slice.location_dim_y_extended, this.dim_y_extended);
        gl.uniform1i(this.location_compute_flowmap_slice.location_dim_z_extended, this.dim_z_extended);
        gl.uniform1f(this.location_compute_flowmap_slice.location_extended_min_x, this.extended_min_x);
        gl.uniform1f(this.location_compute_flowmap_slice.location_extended_min_y, this.extended_min_y);
        gl.uniform1f(this.location_compute_flowmap_slice.location_extended_min_z, this.extended_min_z);
        gl.uniform1f(this.location_compute_flowmap_slice.location_extended_max_x, this.extended_max_x);
        gl.uniform1f(this.location_compute_flowmap_slice.location_extended_max_y, this.extended_max_y);
        gl.uniform1f(this.location_compute_flowmap_slice.location_extended_max_z, this.extended_max_z);
        gl.uniform1f(this.location_compute_flowmap_slice.location_step_size, this.step_size);
        gl.uniform1i(this.location_compute_flowmap_slice.location_slice_index, slice_index);
        gl.uniform1f(this.location_compute_flowmap_slice.location_sign_f, sign_f);        
        gl.uniform1i(this.location_compute_flowmap_slice.location_termination_condition, this.termination_condition);
        gl.uniform1f(this.location_compute_flowmap_slice.location_advection_time, this.advection_time);
        gl.uniform1f(this.location_compute_flowmap_slice.location_termination_arc_length, this.termination_arc_length);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_flowmap_slice);
        var slice_data = this.readPixelsRGBA(gl, this.dim_x_extended, this.dim_y_extended);
        this.addFTLEDebuggerSlice(slice_data, slice_index);
        /*
        //debug special output values
        var entry_size = 8;
        for(var i=0; i<8; i++){
            var p = i * entry_size;
            console.warn("----------");
            console.warn("x_index_extended", slice_data[p+0]-1000);
            console.warn("start_position", slice_data[p+1], slice_data[p+2], slice_data[p+3]);
            console.warn("x_index_extended", slice_data[p+4]-2000);
            console.warn("final_position", slice_data[p+5], slice_data[p+6], slice_data[p+7]);
        }
        debugger;
        */
        /*
        var list = [0, 1, 2, 101, 100, 99];
        if(slice_index == 50){
            var data = this.debugPixelFlowMapSlice(slice_data,0,1);
            console.warn(data);
            var data = this.debugPixelFlowMapSlice(slice_data,this.dim_x_extended-3,1);
            console.warn(data);
            var data = this.debugPixelFlowMapSlice(slice_data,1,1);
            console.warn(data);
            var data = this.debugPixelFlowMapSlice(slice_data,this.dim_x_extended-2,1);
            console.warn(data);
            debugger;
        }
        */

        this.data_texture_flowmap.updateSlice(gl, slice_index_combined_texture, slice_data);

        var highest_iteration_count_slice = 0;
        var size = this.dim_x * this.dim_y * 4;
        for (var i=3; i<size; i+=4){
            highest_iteration_count_slice = Math.max(slice_data[i], highest_iteration_count_slice);
        }
        this.highest_iteration_count = Math.max(highest_iteration_count_slice, this.highest_iteration_count);
        //console.log("highest_iteration_count: ", highest_iteration_count_slice, this.highest_iteration_count);
    }

    /*
    computeFlowMapFiniteDifferences(gl) {
        console.log("computeFlowMapFiniteDifferences");
        console.log(gl);
        var h2_x = 2 / (this.dim_x - 1);
        var h2_y = 2 / (this.dim_y - 1);
        var h2_z = 2 / (this.dim_z - 1);
        this.computeFlowMapFiniteDifferencesDirection(gl, 0, this.data_texture_flowmap_diff_x, h2_x);
        this.computeFlowMapFiniteDifferencesDirection(gl, 1, this.data_texture_flowmap_diff_y, h2_y);
        this.computeFlowMapFiniteDifferencesDirection(gl, 2, this.data_texture_flowmap_diff_z, h2_z);
    }
    */

    computeFlowMapFiniteDifferencesDirection(gl, direction, data_texture, h2) {        
        //MARKER_MODIFIED_STREAMLINE_CALCULATION
        //TODO: this seems to be unused, comment out? 
        data_texture.initDimensions(gl, this.dim_x, this.dim_y, 2*this.dim_z);
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFlowMapFiniteDifferencesSlice(gl, i, direction, data_texture, h2, true);
        }
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFlowMapFiniteDifferencesSlice(gl, i, direction, data_texture, h2, false);
        }
        data_texture.update(gl);
    }

    computeFlowMapFiniteDifferencesSlice(gl, slice_index, direction, data_texture, h2, is_forward) {
        var sign_f = is_forward ? 1.0 : -1.0;
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
        var z = slice_index / (this.dim_z - 1);
        //console.log("computeFlowMapFiniteDifferencesSlice: ", slice_index, z);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper.frame_buffer);
        gl.viewport(0, 0, this.dim_x, this.dim_y);
        gl.useProgram(this.program_compute_flowmap_finite_differences);
        gl.uniform1i(this.location_compute_flowmap_finite_differences.location_dim_x, this.dim_x);
        gl.uniform1i(this.location_compute_flowmap_finite_differences.location_dim_y, this.dim_y);
        gl.uniform1i(this.location_compute_flowmap_finite_differences.location_dim_z, this.dim_z);
        gl.uniform1i(this.location_compute_flowmap_finite_differences.location_slice_index, slice_index);
        gl.uniform1i(this.location_compute_flowmap_finite_differences.location_direction, direction);
        gl.uniform1i(this.location_compute_flowmap_finite_differences.location_is_forward, is_forward);
        gl.uniform1f(this.location_compute_flowmap_finite_differences.location_h2, h2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, this.data_texture_flowmap.texture.texture);
        gl.uniform1i(this.location_compute_flowmap_finite_differences.location_texture_flow_map, 0);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_flowmap_finite_differences);
        var slice_data = this.readPixelsRGBA(gl, this.dim_x, this.dim_y);
        data_texture.updateSlice(gl, slice_index_combined_texture, slice_data);
    }

    /*
    computeFTLE(gl) {
        console.log("computeFTLE");
        this.ftle_max_value = 0;
        this.ftle_min_value = 0;
        this.data_texture_ftle.initDimensions(gl, this.dim_x, this.dim_y, 2*this.dim_z);
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFTLESlice(gl, i, true);
        }
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFTLESlice(gl, i, false);
        }
        this.data_texture_ftle.update(gl);

        //console.log(this.data_texture_flowmap_diff_x.texture.texture_data)
    }
    */

    computeFTLESlice(gl, slice_index, is_forward) {
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
        var z = slice_index / (this.dim_z - 1);
        //console.log("computeFTLESlice: ", slice_index, z, slice_index_combined_texture);

        var slice_data = new Float32Array(this.dim_x * this.dim_y);
        for (var x = 0; x < this.dim_x; x++) {
            for (var y = 0; y < this.dim_y; y++) {
                var index = x + y * this.dim_x;
                slice_data[index] = this.computeFTLETexel(x, y, slice_index, is_forward);
            }
        }
        this.data_texture_ftle.updateSlice(gl, slice_index_combined_texture, slice_data);


        //console.log(this.data_texture_ftle.texture.texture_data)
    }

    computeFTLETexel(x, y, z, is_forward) {
        var index = 4 * (x + y * this.dim_x + z * this.dim_x * this.dim_y);
        if(!is_forward)
            index += 4 * (this.dim_x * this.dim_y * this.dim_z);
        //index += is_forward ? 0 : this.dim_x * this.dim_y * this.dim_z;
        //finite differences in x direction
        var data = this.data_texture_flowmap_diff_x.texture.texture_data;
        var df0_dx0 = data[index];
        var df1_dx0 = data[index + 1];
        var df2_dx0 = data[index + 2];
        //finite differences in y direction
        var data = this.data_texture_flowmap_diff_y.texture.texture_data;
        var df0_dx1 = data[index];
        var df1_dx1 = data[index + 1];
        var df2_dx1 = data[index + 2];
        //finite differences in z direction
        var data = this.data_texture_flowmap_diff_z.texture.texture_data;
        var df0_dx2 = data[index];
        var df1_dx2 = data[index + 1];
        var df2_dx2 = data[index + 2];
        //J = jacobian matrix
        var J = new Matrix([[df0_dx0, df0_dx1, df0_dx2], [df1_dx0, df1_dx1, df1_dx2], [df2_dx0, df2_dx1, df2_dx2]]);
        var J_T = J.transpose();
        //C = cauchy-green tensor = J^T * J
        var C = J_T.mmul(J);

        //compute biggest eigenvalue lambda_max
        var e = new EigenvalueDecomposition(C);
        var real = e.realEigenvalues;
        var lambda_max = Math.max(real[0], real[1], real[2]);
        //calculate FTLE
        var ftle = 0;
        if(this.termination_condition == FTLE_TERMINATION_CONDITION_ADVECTION_TIME){
            ftle = 1 / this.advection_time * Math.log(Math.sqrt(lambda_max));
        }else if (this.termination_condition == FTLE_TERMINATION_CONDITION_ARC_LENGTH){
            ftle = 1 / this.termination_arc_length * Math.log(Math.sqrt(lambda_max));
        }
        //ftle= is_forward ? x : y;
        this.ftle_max_value = Math.max(ftle, this.ftle_max_value);
        this.ftle_min_value = Math.min(ftle, this.ftle_min_value);

        return ftle;
    }
    /*
    computeFTLENormals(gl) {
        console.log("computeFTLENormals");
        console.log(gl);
        var h2_x = 2 / (this.dim_x - 1);
        var h2_y = 2 / (this.dim_y - 1);
        var h2_z = 2 / (this.dim_z - 1);

        this.data_texture_ftle_gradient.initDimensions(gl, this.dim_x, this.dim_y, 2*this.dim_z);
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFTLEGradientSlice(gl, i, this.data_texture_ftle_gradient, h2_x, h2_y, h2_z, true);
        }
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFTLEGradientSlice(gl, i, this.data_texture_ftle_gradient, h2_x, h2_y, h2_z, false);
        }
        this.data_texture_ftle_gradient.update(gl);

        console.log(this.data_texture_ftle_gradient.texture.texture_data)
    }
    */
    computeFTLEGradientSlice(gl, slice_index, data_texture, h2_x, h2_y, h2_z, is_forward) {
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
        var z = slice_index / (this.dim_z - 1);
        //console.log("computeFTLEGradientSlice: ", slice_index, z);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper.frame_buffer);
        gl.viewport(0, 0, this.dim_x, this.dim_y);
        gl.useProgram(this.program_compute_2z_gradient_slice);
        gl.uniform1i(this.location_compute_compute_2z_gradient_slice.location_dim_x, this.dim_x);
        gl.uniform1i(this.location_compute_compute_2z_gradient_slice.location_dim_y, this.dim_y);
        gl.uniform1i(this.location_compute_compute_2z_gradient_slice.location_dim_z, this.dim_z);
        gl.uniform1i(this.location_compute_compute_2z_gradient_slice.location_slice_index, slice_index);
        gl.uniform1i(this.location_compute_compute_2z_gradient_slice.location_is_forward, is_forward);
        gl.uniform1f(this.location_compute_compute_2z_gradient_slice.location_h2_x, h2_x);
        gl.uniform1f(this.location_compute_compute_2z_gradient_slice.location_h2_y, h2_y);
        gl.uniform1f(this.location_compute_compute_2z_gradient_slice.location_h2_z, h2_z);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, this.data_texture_ftle.texture.texture);
        gl.uniform1i(this.location_compute_compute_2z_gradient_slice.location_texture_ftle, 0);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_2z_gradient_slice);
        var slice_data = this.readPixelsRGBA(gl, this.dim_x, this.dim_y);
        data_texture.updateSlice(gl, slice_index_combined_texture, slice_data);
    }

    computeFTLEJacobySlice(gl, slice_index, direction, data_texture, h2, is_forward) {
        if(false){
            var sign_f = is_forward ? 1.0 : -1.0;
            var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
            var z = slice_index / (this.dim_z - 1);
            console.log("computeFlowMapFiniteDifferencesSlice: ", slice_index, z);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper.frame_buffer);
            gl.viewport(0, 0, this.dim_x, this.dim_y);
            gl.useProgram(this.program_compute_flowmap_finite_differences);
            gl.uniform1i(this.location_compute_flowmap_finite_differences.location_dim_x, this.dim_x);
            gl.uniform1i(this.location_compute_flowmap_finite_differences.location_dim_y, this.dim_y);
            gl.uniform1i(this.location_compute_flowmap_finite_differences.location_dim_z, this.dim_z);
            gl.uniform1i(this.location_compute_flowmap_finite_differences.location_slice_index, slice_index);
            gl.uniform1i(this.location_compute_flowmap_finite_differences.location_direction, direction);
            gl.uniform1i(this.location_compute_flowmap_finite_differences.location_is_forward, is_forward);
            gl.uniform1f(this.location_compute_flowmap_finite_differences.location_h2, h2);
    
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_3D, this.data_texture_flowmap.texture.texture);
            gl.uniform1i(this.location_compute_flowmap_finite_differences.location_texture_flow_map, 0);
    
            this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_flowmap_finite_differences);
            var slice_data = this.readPixelsRGBA(gl, this.dim_x, this.dim_y);
            data_texture.updateSlice(gl, slice_index_combined_texture, slice_data);
        }else{
            var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
            var z = slice_index / (this.dim_z - 1);
            //console.log("computeFTLEJacobySlice: ", slice_index, z);
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper.frame_buffer);
            gl.viewport(0, 0, this.dim_x, this.dim_y);
            gl.useProgram(this.program_compute_2z_jacoby_column_slice);
            gl.uniform1i(this.location_compute_2z_jacoby_column_slice.location_dim_x, this.dim_x);
            gl.uniform1i(this.location_compute_2z_jacoby_column_slice.location_dim_y, this.dim_y);
            gl.uniform1i(this.location_compute_2z_jacoby_column_slice.location_dim_z, this.dim_z);
            gl.uniform1i(this.location_compute_2z_jacoby_column_slice.location_slice_index, slice_index);
            gl.uniform1i(this.location_compute_2z_jacoby_column_slice.location_direction, direction);
            gl.uniform1i(this.location_compute_2z_jacoby_column_slice.location_is_forward, is_forward);
            gl.uniform1f(this.location_compute_2z_jacoby_column_slice.location_h2, h2);
    
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_3D, this.data_texture_ftle_gradient.texture.texture);
            gl.uniform1i(this.location_compute_2z_jacoby_column_slice.location_texture_vector_fields, 0);
    
            this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_2z_jacoby_column_slice);
            var slice_data = this.readPixelsRGBA(gl, this.dim_x, this.dim_y);
            data_texture.updateSlice(gl, slice_index_combined_texture, slice_data);
        }

    }

    computeFTLESymmetricSlice(gl, slice_index, direction, data_texture, h2, is_forward) {
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
        var z = slice_index / (this.dim_z - 1);
        //console.log("computeFTLESymmetricSlice: ", slice_index, z);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper.frame_buffer);
        gl.viewport(0, 0, this.dim_x, this.dim_y);
        gl.useProgram(this.program_compute_2z_symmetric_column_slice);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_dim_x, this.dim_x);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_dim_y, this.dim_y);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_dim_z, this.dim_z);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_slice_index, slice_index);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_column_index, direction);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_is_forward, is_forward);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, this.data_texture_ftle_jacoby_direction_x_tmp.texture.texture);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_texture_column0, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, this.data_texture_ftle_jacoby_direction_y_tmp.texture.texture);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_texture_column1, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_3D, this.data_texture_ftle_jacoby_direction_z_tmp.texture.texture);
        gl.uniform1i(this.location_compute_2z_symmetric_column_slice.location_texture_column2, 2);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_2z_symmetric_column_slice);
        var slice_data = this.readPixelsRGBA(gl, this.dim_x, this.dim_y);
        data_texture.updateSlice(gl, slice_index_combined_texture, slice_data);
    }


    readPixelsRGBA(gl, dim_x, dim_y) {
        var pixels = new Float32Array(dim_x * dim_y * 4);
        var format = gl.RGBA;
        var type = gl.FLOAT;
        gl.readPixels(0, 0, dim_x, dim_y, format, type, pixels);
        return pixels;
    }

    loadShaderUniformsComputeFlowMapSlice(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsComputeFlowMapFiniteDifferences(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsComputeFTLENormals(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsCompute2zGradientSlice(gl, program){
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsCompute2zJacobyColumnSlice(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        //program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    exportVTK(){
        var that = this;
        //from the documentation: Data with implicit topology (structured data such as vtkImageData and vtkStructuredGrid) 
        //are ordered with x increasing fastest, then y, then z.
        var dim_x = this.data_texture_ftle.texture.texture_settings.width;
        var dim_y = this.data_texture_ftle.texture.texture_settings.height;
        var dim_z = this.data_texture_ftle.texture.texture_settings.depth / 2;//forward and backward are combined
        console.warn("dim_x", dim_x);
        console.warn("dim_y", dim_y);
        console.warn("dim_z", dim_z);

        var zip = new JSZip();

        var texture_data = this.data_texture_ftle.texture.texture_data;

        var forward = true;
        var vtk_file_forward = new VTK_File();
        vtk_file_forward.SetData(texture_data, forward, dim_x, dim_y, dim_z);        
        zip.file("forward.vti", vtk_file_forward.GetFileContent());
        
        var forward = false;        
        var vtk_file_backward = new VTK_File();
        vtk_file_backward.SetData(texture_data, forward, dim_x, dim_y, dim_z);
        zip.file("backward.vti", vtk_file_backward.GetFileContent());

        var file_name_zip = "ftle_export";

        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                FileSaver.saveAs(content, file_name_zip);
                that.finished_vtk_export = true;
            });
    }
    /*
    GenerateVTKString(forward, dim_x, dim_y, dim_z){
        var s = "";
        s += this.GenerateDataString(forward, dim_x, dim_y, dim_z);
        return s;
    }

    GenerateDataString(forward, dim_x, dim_y, dim_z){
        var offset = forward ? 0 : dim_z;
        var s = "";
        for(var z = 0; z<dim_z; z++){
            for(var y = 0; y<dim_y; y++){
                for(var x = 0; x<dim_x; x++){
                    var z_texture = z + offset;      
                    var global_index_texture = x + y * dim_x + z_texture * dim_x * dim_y;
                    var scalar = this.data_texture_ftle.texture.texture_data[global_index_texture];
                    s += string(scalar);
                }
            }
        }
        return s;
    }
    */
}

module.exports = FTLEManager;