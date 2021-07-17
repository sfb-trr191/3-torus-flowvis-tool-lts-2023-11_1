const ComputeWrapper = require("./compute_wraper");
const ShaderUniforms = require("./shader_uniforms");
const DummyQuad = require("./dummy_quad");
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
        this.location_advection_time = gl.getUniformLocation(program, "advection_time");

    }
}

class UniformLocationsComputeFiniteDifferences {
    constructor(gl, program, name) {
        console.log("UniformLocationsComputeFiniteDifferences: ", name)
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

class FTLEManager {

    constructor(gl, p_streamline_context, p_shader_manager) {
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.p_shader_manager = p_shader_manager;
        this.dim_x = 100;
        this.dim_y = 100;
        this.dim_z = 100;
        this.UpdateExtendedDims(gl);
        this.step_size = 0.0125;
        this.advection_time = 0.5;

        //this.compute_wrapper_extended = new ComputeWrapper(gl, "compute_wrapper_extended", this.dim_x_extended, this.dim_y_extended);
        this.data_texture_flowmap = new DataTexture3D_RGBA(gl);

        //this.compute_wrapper = new ComputeWrapper(gl, "compute_wrapper", this.dim_x, this.dim_y);
        this.data_texture_diff_x = new DataTexture3D_RGBA(gl);
        this.data_texture_diff_y = new DataTexture3D_RGBA(gl);
        this.data_texture_diff_z = new DataTexture3D_RGBA(gl);
        this.data_texture_ftle = new DataTexture3D_R(gl);
        this.ftle_max_value = 0;
        this.ftle_min_value = 0;


        this.program_compute_flowmap_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_slice, V_SHADER_RAYTRACING, F_SHADER_PLACEHOLDER);
        this.location_compute_flowmap_slice = new UniformLocationsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.shader_uniforms_compute_flowmap_slice = this.loadShaderUniformsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.attribute_location_dummy_program_compute_flowmap_slice = gl.getAttribLocation(this.program_compute_flowmap_slice, "a_position");

        this.program_compute_finite_differences = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_finite_differences, V_SHADER_RAYTRACING, F_SHADER_COMPUTE_FINITE_DIFFERENCES);
        this.location_compute_finite_differences = new UniformLocationsComputeFiniteDifferences(gl, this.program_compute_finite_differences);
        this.shader_uniforms_compute_finite_differences = this.loadShaderUniformsComputeFiniteDifferences(gl, this.program_compute_finite_differences);
        this.attribute_location_dummy_program_compute_finite_differences = gl.getAttribLocation(this.program_compute_finite_differences, "a_position");

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
        console.log("ReplaceComputeFlowMapSliceShader");
        console.log(gl);
        var shader_formula_u = this.p_streamline_generator.shader_formula_u;
        var shader_formula_v = this.p_streamline_generator.shader_formula_v;
        var shader_formula_w = this.p_streamline_generator.shader_formula_w;

        var shader_formula_u_float = regexIntToFloat(shader_formula_u);
        var shader_formula_v_float = regexIntToFloat(shader_formula_v);
        var shader_formula_w_float = regexIntToFloat(shader_formula_w);
        console.log("shader_formula_u: ", shader_formula_u_float);
        console.log("shader_formula_v: ", shader_formula_v_float);
        console.log("shader_formula_w: ", shader_formula_w_float);

        this.program_compute_flowmap_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_slice, V_SHADER_RAYTRACING,
            this.p_shader_manager.GetShaderComputeFlowMapSlice(shader_formula_u_float, shader_formula_v_float, shader_formula_w_float));
        this.location_compute_flowmap_slice = new UniformLocationsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.shader_uniforms_compute_flowmap_slice = this.loadShaderUniformsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.attribute_location_dummy_program_compute_flowmap_slice = gl.getAttribLocation(this.program_compute_flowmap_slice, "a_position");
    }

    compute(gl, dim_x, dim_y, dim_z, advection_time, step_size) {
        this.dim_x = dim_x;
        this.dim_y = dim_y;
        this.dim_z = dim_z;
        this.UpdateExtendedDims(gl);
        this.advection_time = advection_time;
        this.step_size = step_size;
        this.highest_iteration_count = 0;
        this.computeFlowMap(gl);
        console.log(this.data_texture_flowmap.texture.texture_data);

        this.computeFiniteDifferences(gl);
        this.computeFTLE(gl);
    }

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

    computeFlowMapSlice(gl, slice_index, is_forward) {
        var sign_f = is_forward ? 1.0 : -1.0;
        //var sign_f = 1.0;
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z_extended;
        //var z = slice_index / (this.dim_z - 1);
        console.log("computeFlowMapSlice: ", slice_index);
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
        gl.uniform1f(this.location_compute_flowmap_slice.location_advection_time, this.advection_time);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_flowmap_slice);
        var slice_data = this.readPixelsRGBA(gl, this.dim_x_extended, this.dim_y_extended);
        this.data_texture_flowmap.updateSlice(gl, slice_index_combined_texture, slice_data);

        var highest_iteration_count_slice = 0;
        var size = this.dim_x * this.dim_y * 4;
        for (var i=3; i<size; i+=4){
            highest_iteration_count_slice = Math.max(slice_data[i], highest_iteration_count_slice);
        }
        this.highest_iteration_count = Math.max(highest_iteration_count_slice, this.highest_iteration_count);
        console.log("highest_iteration_count: ", highest_iteration_count_slice, this.highest_iteration_count);
    }

    computeFiniteDifferences(gl) {
        console.log("computeFiniteDifferences");
        console.log(gl);
        var h2_x = 2 / (this.dim_x - 1);
        var h2_y = 2 / (this.dim_y - 1);
        var h2_z = 2 / (this.dim_z - 1);
        this.computeFiniteDifferencesDirection(gl, 0, this.data_texture_diff_x, h2_x);
        this.computeFiniteDifferencesDirection(gl, 1, this.data_texture_diff_y, h2_y);
        this.computeFiniteDifferencesDirection(gl, 2, this.data_texture_diff_z, h2_z);
    }

    computeFiniteDifferencesDirection(gl, direction, data_texture, h2) {
        data_texture.initDimensions(gl, this.dim_x, this.dim_y, 2*this.dim_z);
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFiniteDifferencesSlice(gl, i, direction, data_texture, h2, true);
        }
        for (var i = 0; i < this.dim_z; i++) {
            this.computeFiniteDifferencesSlice(gl, i, direction, data_texture, h2, false);
        }
        data_texture.update(gl);
    }

    computeFiniteDifferencesSlice(gl, slice_index, direction, data_texture, h2, is_forward) {
        var sign_f = is_forward ? 1.0 : -1.0;
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
        var z = slice_index / (this.dim_z - 1);
        console.log("computeFiniteDifferencesSlice: ", slice_index, z);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper.frame_buffer);
        gl.viewport(0, 0, this.dim_x, this.dim_y);
        gl.useProgram(this.program_compute_finite_differences);
        gl.uniform1i(this.location_compute_finite_differences.location_dim_x, this.dim_x);
        gl.uniform1i(this.location_compute_finite_differences.location_dim_y, this.dim_y);
        gl.uniform1i(this.location_compute_finite_differences.location_dim_z, this.dim_z);
        gl.uniform1i(this.location_compute_finite_differences.location_slice_index, slice_index);
        gl.uniform1i(this.location_compute_finite_differences.location_direction, direction);
        gl.uniform1i(this.location_compute_finite_differences.location_is_forward, is_forward);
        gl.uniform1f(this.location_compute_finite_differences.location_h2, h2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_3D, this.data_texture_flowmap.texture.texture);
        gl.uniform1i(this.location_compute_finite_differences.location_texture_flow_map, 0);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_finite_differences);
        var slice_data = this.readPixelsRGBA(gl, this.dim_x, this.dim_y);
        data_texture.updateSlice(gl, slice_index_combined_texture, slice_data);
    }

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

        console.log(this.data_texture_diff_x.texture.texture_data)
    }

    computeFTLESlice(gl, slice_index, is_forward) {
        var slice_index_combined_texture = is_forward ? slice_index : slice_index + this.dim_z;
        var z = slice_index / (this.dim_z - 1);
        console.log("computeFTLESlice: ", slice_index, z, slice_index_combined_texture);

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
        var data = this.data_texture_diff_x.texture.texture_data;
        var df0_dx0 = data[index];
        var df1_dx0 = data[index + 1];
        var df2_dx0 = data[index + 2];
        //finite differences in y direction
        var data = this.data_texture_diff_y.texture.texture_data;
        var df0_dx1 = data[index];
        var df1_dx1 = data[index + 1];
        var df2_dx1 = data[index + 2];
        //finite differences in z direction
        var data = this.data_texture_diff_z.texture.texture_data;
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
        var ftle = 1 / this.advection_time * Math.log(Math.sqrt(lambda_max));
        //ftle= is_forward ? x : y;
        this.ftle_max_value = Math.max(ftle, this.ftle_max_value);
        this.ftle_min_value = Math.min(ftle, this.ftle_min_value);

        return ftle;
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
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsComputeFiniteDifferences(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }
}

module.exports = FTLEManager;