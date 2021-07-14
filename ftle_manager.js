const ComputeWrapper = require("./compute_wraper");
const ShaderUniforms = require("./shader_uniforms");
const DummyQuad = require("./dummy_quad");
const {DataTextures, DataTexture3D_RGBA } = require("./data_textures");
const module_webgl = require("./webgl");
const loadShaderProgramFromCode = module_webgl.loadShaderProgramFromCode;
const module_utility = require("./utility");
const regexIntToFloat = module_utility.regexIntToFloat;
//const V_SHADER_RAYTRACING = require("./shader/v_shader_raytracing.js");
//const F_SHADER_PLACEHOLDER = require("./shader/f_shader_placeholder.glsl");

class UniformLocationsComputeFlowMapSlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsComputeFlowMapSlice: ", name)
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
        this.location_z = gl.getUniformLocation(program, "z");
        this.location_step_size = gl.getUniformLocation(program, "step_size");
        this.location_advection_time = gl.getUniformLocation(program, "advection_time");
    }
}

class FTLEManager{

    constructor(gl, p_streamline_context, p_shader_manager){
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.p_shader_manager = p_shader_manager;
        this.dim_x = 100;
        this.dim_y = 100;
        this.dim_z = 100;
        this.step_size = 0.0125;
        this.advection_time = 0.5;
        this.compute_wrapper_flowmap = new ComputeWrapper(gl, "compute_wrapper", this.dim_x, this.dim_y);
        this.data_texture_flowmap = new DataTexture3D_RGBA(gl);
        

        this.program_compute_flowmap_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_slice, V_SHADER_RAYTRACING, F_SHADER_PLACEHOLDER);
        this.location_compute_flowmap_slice = new UniformLocationsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.shader_uniforms_compute_flowmap_slice = this.loadShaderUniformsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.attribute_location_dummy_program_compute_flowmap_slice = gl.getAttribLocation(this.program_compute_flowmap_slice, "a_position");

        this.dummy_quad = new DummyQuad(gl);
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

    computeFlowMap(gl){
        console.log("computeFlowMap");
        console.log(gl);
        this.data_texture_flowmap.initDimensions(gl, this.dim_x, this.dim_y, this.dim_z);
        this.ReplaceComputeFlowMapSliceShader(gl);
        for(var i=0; i<this.dim_z; i++){
            this.computeFlowMapSlice(gl, i);
        }
        this.data_texture_flowmap.update(gl);
    }

    computeFlowMapSlice(gl, slice_index){
        var z = slice_index / (this.dim_z-1);
        console.log("computeFlowMapSlice: ", slice_index, z);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper_flowmap.frame_buffer);
        gl.viewport(0, 0, this.dim_x, this.dim_y);
        gl.useProgram(this.program_compute_flowmap_slice);
        gl.uniform1i(this.location_compute_flowmap_slice.location_width, this.dim_x);
        gl.uniform1i(this.location_compute_flowmap_slice.location_height, this.dim_y);
        gl.uniform1f(this.location_compute_flowmap_slice.location_step_size, this.step_size);
        gl.uniform1f(this.location_compute_flowmap_slice.location_z, z);
        gl.uniform1f(this.location_compute_flowmap_slice.location_advection_time, this.advection_time);
        
        //console.log(this.data_texture_flowmap.texture.texture_data);
        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_flowmap_slice);
        var slice_data = this.readPixelsRGBA(gl);
        //console.log(slice_data);
        console.log(slice_data[3]);
        //console.log(slice_data[7]);
        
        this.data_texture_flowmap.updateSlice(gl, slice_index, slice_data);
        //console.log(this.data_texture_flowmap.texture.texture_data);
    }

    readPixelsRGBA(gl){
        var pixels = new Float32Array(this.dim_x * this.dim_y * 4);
        var format = gl.RGBA;
        var type = gl.FLOAT;
        gl.readPixels(0, 0, this.dim_x, this.dim_y, format, type, pixels);
        return pixels;
    }

    loadShaderUniformsComputeFlowMapSlice(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }
}

module.exports = FTLEManager;