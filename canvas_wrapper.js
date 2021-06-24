class UniformLocationsRayTracing {
    constructor(gl, program, name) {
        console.log("UniformLocationsRayTracing: ", name)
        this.location_color_r = gl.getUniformLocation(program, "color_r");
        this.location_texture_float = gl.getUniformLocation(program, "texture_float");
        this.location_texture_int = gl.getUniformLocation(program, "texture_int");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
        this.location_offset_x = gl.getUniformLocation(program, "offset_x");
        this.location_offset_y = gl.getUniformLocation(program, "offset_y");
        this.location_max_ray_distance = gl.getUniformLocation(program, "maxRayDistance");
        this.location_max_iteration_count = gl.getUniformLocation(program, "maxIterationCount");
        this.location_tube_radius = gl.getUniformLocation(program, "tubeRadius");
        this.location_fog_density = gl.getUniformLocation(program, "fog_density");        
    }
}

class UniformLocationsAverage {
    constructor(gl, program, name) {
        console.log("UniformLocationsAverage: ", name)
        this.location_aliasing_index = gl.getUniformLocation(program, "aliasing_index");
        this.location_texture1 = gl.getUniformLocation(program, "texture1");
        this.location_texture2 = gl.getUniformLocation(program, "texture2");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class UniformLocationsCopy {
    constructor(gl, program, name) {
        console.log("UniformLocationsCopy: ", name)
        this.location_color_r = gl.getUniformLocation(program, "color_r");
        this.location_texture1 = gl.getUniformLocation(program, "texture1");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class UniformLocationsResampling {
    constructor(gl, program, name) {
        console.log("UniformLocationsResampling: ", name)
        this.location_show_progressbar = gl.getUniformLocation(program, "show_progressbar");
        this.location_progress = gl.getUniformLocation(program, "progress");
        this.location_texture1 = gl.getUniformLocation(program, "texture1");
        this.location_texture2 = gl.getUniformLocation(program, "texture2");
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
    }
}

class CanvasWrapper {

    constructor(gl, streamline_context_static, name, canvas, camera, aliasing) {
        console.log("Construct CanvasWrapper: ", name)
        this.canvas = canvas;
        this.camera = camera;
        this.aliasing = aliasing;
        this.p_streamline_context_static = streamline_context_static;
        this.aliasing_index = 0;
        this.max_ray_distance = 0;
        this.tube_radius = 0;
        this.lod_index_panning = 0;
        this.lod_index_still = 0;
        this.fog_density = 0;

        this.render_wrapper_raytracing_still_left = new RenderWrapper(gl, name + "_raytracing_still_left", camera.width_still, camera.height_still);
        this.render_wrapper_raytracing_still_right = new RenderWrapper(gl, name + "_raytracing_still_right", camera.width_still, camera.height_still);
        this.render_wrapper_raytracing_panning_left = new RenderWrapper(gl, name + "_raytracing_panning_left", camera.width_panning, camera.height_panning);
        this.render_wrapper_raytracing_panning_right = new RenderWrapper(gl, name + "_raytracing_panning_right", camera.width_panning, camera.height_panning);

        this.program_raytracing = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_raytracing, V_SHADER_RAYTRACING, F_SHADER_RAYTRACING);
        this.location_raytracing = new UniformLocationsRayTracing(gl, this.program_raytracing);
        this.shader_uniforms_raytracing = this.loadShaderUniformsRayTracing(gl, this.program_raytracing);

        this.program_average = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_average, V_SHADER_RAYTRACING, F_SHADER_AVERAGE);
        this.location_average = new UniformLocationsAverage(gl, this.program_average);
        this.shader_uniforms_average = this.loadShaderUniformsAverage(gl, this.program_average);

        this.program_copy = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_copy, V_SHADER_RAYTRACING, F_SHADER_COPY);
        this.location_copy = new UniformLocationsCopy(gl, this.program_copy);
        this.shader_uniforms_copy = this.loadShaderUniformsCopy(gl, this.program_copy);

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

    UpdatePanningResolutionFactor(gl, panning_resolution_factor) {
        var width_panning = Math.round(this.camera.width_still * panning_resolution_factor);
        var height_panning = Math.round(this.camera.height_still * panning_resolution_factor);
        var changed = (width_panning != this.camera.width_panning) || (height_panning != this.camera.height_panning);
        if (changed) {
            this.camera.width_panning = width_panning;
            this.camera.height_panning = height_panning;
            this.render_wrapper_raytracing_panning_left.resize(gl, width_panning, height_panning);
            this.render_wrapper_raytracing_panning_right.resize(gl, width_panning, height_panning);
        }
    }

    draw(gl, data_changed, settings_changed, mouse_in_canvas) {
        if (this.camera.changed || data_changed || settings_changed)
            this.aliasing_index = 0;

        if (this.aliasing_index == this.aliasing.num_rays_per_pixel)
            return;

        if(this.aliasing_index > 0 && !mouse_in_canvas)
            return;

        //console.log("aliasing_index: ", this.aliasing_index, "panning:", this.camera.panning);
        //console.log("offset_x: ", this.aliasing.offset_x[this.aliasing_index]);
        //console.log("offset_y: ", this.aliasing.offset_y[this.aliasing_index]);

        var left_render_wrapper = this.camera.panning ? this.render_wrapper_raytracing_panning_left : this.render_wrapper_raytracing_still_left
        this.drawTextureRaytracing(gl, left_render_wrapper);
        this.drawTextureAverage(gl, left_render_wrapper);
        this.drawResampling(gl, left_render_wrapper);
        this.drawTextureSumCopy(gl, left_render_wrapper);

        this.aliasing_index += 1;
    }

    drawTextureRaytracing(gl, render_wrapper, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_wrapper.frame_buffer);
        //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.camera.width, this.camera.height);
        //console.log(this.camera.width, this.camera.height);
        gl.useProgram(this.program_raytracing);
        this.camera.WriteToUniform(gl, this.program_raytracing, "active_camera");
        //gl.uniform1f(this.location_raytracing.location_color_r, 0.5 + 0.5 * Math.sin(2 * Math.PI * x));
        gl.uniform1i(this.location_raytracing.location_width, this.camera.width);
        gl.uniform1i(this.location_raytracing.location_height, this.camera.height);
        gl.uniform1i(this.location_raytracing.location_max_iteration_count, Math.ceil(this.max_ray_distance * 3));

        gl.uniform1f(this.location_raytracing.location_offset_x, this.aliasing.offset_x[this.aliasing_index]);
        gl.uniform1f(this.location_raytracing.location_offset_y, this.aliasing.offset_y[this.aliasing_index]);
        gl.uniform1f(this.location_raytracing.location_max_ray_distance, this.max_ray_distance);
        gl.uniform1f(this.location_raytracing.location_tube_radius, this.tube_radius);
        gl.uniform1f(this.location_raytracing.location_fog_density, this.fog_density);

        

        var panning = this.camera.panning;
        var active_lod = panning ? this.lod_index_panning : this.lod_index_still;
        this.p_streamline_context_static.bind_lod(active_lod, gl,
            this.shader_uniforms_raytracing,
            this.location_raytracing.location_texture_float,
            this.location_raytracing.location_texture_int);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    drawTextureAverage(gl, render_wrapper, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_wrapper.frame_buffer_average);
        gl.viewport(0, 0, this.camera.width, this.camera.height);
        gl.useProgram(this.program_average);
        gl.uniform1i(this.location_average.location_aliasing_index, this.aliasing_index);
        gl.uniform1i(this.location_average.location_width, this.camera.width);
        gl.uniform1i(this.location_average.location_height, this.camera.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture.texture);
        gl.uniform1i(this.location_average.location_texture1, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_average_in.texture);
        gl.uniform1i(this.location_average.location_texture2, 1);


        gl.drawArrays(gl.POINTS, 0, 1);
    }

    //copies data from render_texture_average_out to render_texture_average_in to prepare next frame
    drawTextureSumCopy(gl, render_wrapper, width, height) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, render_wrapper.frame_buffer_average_copy);
        gl.viewport(0, 0, this.camera.width, this.camera.height);
        gl.useProgram(this.program_copy);
        gl.uniform1i(this.location_copy.location_width, this.camera.width);
        gl.uniform1i(this.location_copy.location_height, this.camera.height);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_average_out.texture);
        gl.uniform1i(this.location_copy.location_texture1, 0);

        gl.drawArrays(gl.POINTS, 0, 1);
    }

    drawResampling(gl, render_wrapper) {
        var show_progressbar = this.aliasing_index < this.aliasing.num_rays_per_pixel - 1;
        var progress = this.aliasing_index / (this.aliasing.num_rays_per_pixel - 1);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, 1280, 720);
        gl.useProgram(this.program_resampling);
        gl.uniform1f(this.location_resampling.location_show_progressbar, show_progressbar);
        gl.uniform1f(this.location_resampling.location_progress, progress);
        gl.uniform1i(this.location_resampling.location_width, 1280);
        gl.uniform1i(this.location_resampling.location_height, 720);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, render_wrapper.render_texture_average_out.texture);
        gl.uniform1i(this.location_resampling.location_texture1, 0);

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
        program_shader_uniforms.registerUniform("start_index_int_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_streamline_color", "INT", -1);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }
    
    loadShaderUniformsAverage(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsCopy(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    loadShaderUniformsResampling(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.print();
        return program_shader_uniforms;
    }
}