class UniformLocationsRayTracing {
    constructor(gl, program, name) {
        console.log("UniformLocationsRayTracing: ", name)
        this.location_color_r = gl.getUniformLocation(program, "color_r");
        this.location_texture_float = gl.getUniformLocation(program, "texture_float");
        this.location_texture_int = gl.getUniformLocation(program, "texture_int");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class UniformLocationsResampling {
    constructor(gl, program, name) {
        console.log("UniformLocationsResampling: ", name)
        this.location_color_r = gl.getUniformLocation(program, "color_r");
        this.location_texture_float = gl.getUniformLocation(program, "texture_float");
        this.location_texture_int = gl.getUniformLocation(program, "texture_int");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class CanvasWrapper {

    constructor(gl, streamline_context_static, name, canvas, camera) {
        console.log("Construct CanvasWrapper: ", name)
        this.canvas = canvas;
        this.camera = camera;
        this.p_streamline_context_static = streamline_context_static;
        
        this.render_wrapper_raytracing_still_left = new RenderWrapper(gl, name + "_raytracing_still_left", camera.width_still, camera.height_still);
        this.render_wrapper_raytracing_still_right = new RenderWrapper(gl, name + "_raytracing_still_right", camera.width_still, camera.height_still);
        this.render_wrapper_raytracing_panning_left = new RenderWrapper(gl, name + "_raytracing_panning_left", camera.width_panning, camera.height_panning);
        this.render_wrapper_raytracing_panning_right = new RenderWrapper(gl, name + "_raytracing_panning_right", camera.width_panning, camera.height_panning);

        this.program_raytracing = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_raytracing, V_SHADER_RAYTRACING, F_SHADER_RAYTRACING);
        this.location_raytracing = new UniformLocationsRayTracing(gl, this.program_raytracing);
        this.shader_uniforms_raytracing = this.loadShaderUniformsRayTracing(gl, this.program_raytracing);
        
        this.program_resampling = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_resampling, V_SHADER_RAYTRACING, F_SHADER_RESAMPLING);
        this.location_resampling = new UniformLocationsResampling(gl, this.program_resampling);
        this.shader_uniforms_resampling = this.loadShaderUniformsResampling(gl, this.program_resampling);
        
    }

    SetRenderSizes(width, height, width_panning, height_panning) {
        this.camera.SetRenderSizes(width, height, width_panning, height_panning);
    }

    SetCanvasSize(width, height) {

    }

    UpdatePanningResolutionFactor(gl, panning_resolution_factor){
        var width_panning = Math.round(this.camera.width_still * panning_resolution_factor);
        var height_panning = Math.round(this.camera.height_still * panning_resolution_factor);
        var changed = (width_panning != this.camera.width_panning)||(height_panning != this.camera.height_panning);
        if(changed){
            this.camera.width_panning = width_panning;
            this.camera.height_panning = height_panning;
            this.render_wrapper_raytracing_panning_left.resize(gl, width_panning, height_panning);
            this.render_wrapper_raytracing_panning_right.resize(gl, width_panning, height_panning);
        }
    }

    draw(gl) {
        var left_render_wrapper = this.camera.panning ? this.render_wrapper_raytracing_panning_left : this.render_wrapper_raytracing_still_left
        this.drawTextureRaytracing(gl, left_render_wrapper);
        this.drawResampling(gl, left_render_wrapper);        
    }

    drawTextureRaytracing(gl, render_wrapper, width, height){
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_wrapper.frame_buffer);
        //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.camera.width, this.camera.height);
        console.log(this.camera.width, this.camera.height);
        gl.useProgram(this.program_raytracing);
        this.camera.WriteToUniform(gl, this.program_raytracing, "active_camera");
        //gl.uniform1f(this.location_raytracing.location_color_r, 0.5 + 0.5 * Math.sin(2 * Math.PI * x));
        gl.uniform1i(this.location_raytracing.location_width, this.camera.width);
        gl.uniform1i(this.location_raytracing.location_height, this.camera.height);
        var panning = this.camera.panning;
        var active_lod = panning ? 2 : 0;
        this.p_streamline_context_static.bind_lod(active_lod, gl,
            this.shader_uniforms_raytracing,
            this.location_raytracing.location_texture_float,
            this.location_raytracing.location_texture_int);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    drawResampling(gl, render_wrapper){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, 800, 600);
        gl.useProgram(this.program_resampling);
        gl.uniform1i(this.location_resampling.location_width, 800);
        gl.uniform1i(this.location_resampling.location_height, 600);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture.texture);
        gl.uniform1i(this.location_resampling.location_texture_float, 0);
        
        gl.drawArrays(gl.POINTS, 0, 1);
    }



    loadShaderUniformsRayTracing(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.registerUniform("start_index_int_position_data", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_position_data", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_line_segments", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_line_segments", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_tree_nodes", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_tree_nodes", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_dir_lights", "INT", -1);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsResampling(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.registerUniform("start_index_int_position_data", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_position_data", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_line_segments", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_line_segments", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_tree_nodes", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_tree_nodes", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_dir_lights", "INT", -1);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }
}