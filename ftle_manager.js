class UniformLocationsComputeFlowMapSlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsComputeFlowMapSlice: ", name)
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class FTLEManager{

    constructor(gl, p_streamline_context, p_shader_manager){
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.p_shader_manager = p_shader_manager;
        this.dim_x = 10;
        this.dim_y = 10;
        this.dim_z = 10;
        this.compute_wrapper = new ComputeWrapper(gl, "compute_wrapper", this.dim_x, this.dim_y);
        

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
        console.log("shader_formula_u: ", shader_formula_u);
        console.log("shader_formula_v: ", shader_formula_v);
        console.log("shader_formula_w: ", shader_formula_w);

        this.program_compute_flowmap_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_compute_flowmap_slice, V_SHADER_RAYTRACING, 
            this.p_shader_manager.GetShaderComputeFlowMapSlice(shader_formula_u, shader_formula_v, shader_formula_w));
        this.location_compute_flowmap_slice = new UniformLocationsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.shader_uniforms_compute_flowmap_slice = this.loadShaderUniformsComputeFlowMapSlice(gl, this.program_compute_flowmap_slice);
        this.attribute_location_dummy_program_compute_flowmap_slice = gl.getAttribLocation(this.program_compute_flowmap_slice, "a_position");
    }

    computeFlowMap(gl){
        console.log("computeFlowMap");
        console.log(gl);
        this.ReplaceComputeFlowMapSliceShader(gl);
        this.computeFlowMapSlice(gl, 0);

    }

    computeFlowMapSlice(gl, slice_index){
        console.log("computeFlowMapSlice: ", slice_index);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.compute_wrapper.frame_buffer);
        gl.viewport(0, 0, this.dim_x, this.dim_y);
        gl.useProgram(this.program_compute_flowmap_slice);
        gl.uniform1i(this.location_compute_flowmap_slice.location_width, this.dim_x);
        gl.uniform1i(this.location_compute_flowmap_slice.location_height, this.dim_y);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_compute_flowmap_slice);
        var pixels = this.readPixels(gl);
        console.log(pixels);
        

        console.log(this.compute_wrapper.frame_buffer);
    }

    readPixels(gl){
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