class RenderTexture {

    texture;
    texture_settings;
    texture_data;

    constructor(gl, texture_width, texture_height) {
        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        var target = gl.TEXTURE_2D;
        var level = 0;
        var internalformat = gl.RGBA;
        var width = texture_width;
        var height = texture_height;
        var border = 0;
        var format = gl.RGBA;
        var type = gl.UNSIGNED_BYTE;

        this.texture_data = null;
        this.texture_settings = { target, level, internalformat, width, height, border, format, type };

        //gl.texImage2D(target, level, internalformat, width, height, border, format, type, this.texture_data);
        this.texImage2D(gl);
        // set the filtering so we don't need mips and it's not filtered
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        //return {texture: texture, texture_data: texture_data, texture_settings: texture_settings};    
    }

    resize(gl, texture_width, texture_height) {
        this.texture_data = null;
        this.texture_settings.width = texture_width;
        this.texture_settings.height = texture_height;
        this.texImage2D(gl);
    }

    texImage2D(gl) {
        var target = this.texture_settings.target;
        var level = this.texture_settings.level;
        var internalformat = this.texture_settings.internalformat;
        var width = this.texture_settings.width;
        var height = this.texture_settings.height;
        var border = this.texture_settings.border;
        var format = this.texture_settings.format;
        var type = this.texture_settings.type;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(target, level, internalformat, width, height, border, format, type, this.texture_data);
    }
}

class RenderWrapper {

    constructor(gl, name, texture_width, texture_height) {
        console.log("Construct RenderWrapper: ", name, texture_width, texture_height)
        this.name = name;
        this.render_texture = new RenderTexture(gl, texture_width, texture_height);
        this.render_texture_average_in = new RenderTexture(gl, texture_width, texture_height);
        this.render_texture_average_out = new RenderTexture(gl, texture_width, texture_height);

        const attachmentPoint = gl.COLOR_ATTACHMENT0;

        //this produces a single frame
        this.frame_buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D,
            this.render_texture.texture, this.render_texture.texture_settings.level);

        //this sums the previous frames (render_texture_average_in) and the new frame (render_texture)
        this.frame_buffer_average = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer_average);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D,
            this.render_texture_average_out.texture, this.render_texture_average_out.texture_settings.level);

        //this copies data from render_texture_average_out to render_texture_average_in to prepare next frame
        this.frame_buffer_average_copy = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer_average_copy);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D,
            this.render_texture_average_in.texture, this.render_texture_average_in.texture_settings.level);
    }

    resize(gl, texture_width, texture_height) {
        console.log("resize RenderWrapper: ", this.name, texture_width, texture_height)
        this.render_texture.resize(gl, texture_width, texture_height);
        this.render_texture_average_in.resize(gl, texture_width, texture_height);
        this.render_texture_average_out.resize(gl, texture_width, texture_height);

        // Create and bind the framebuffer
        //this.frame_buffer = gl.createFramebuffer();
        //gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
        // attach the texture as the first color attachment
        //const attachmentPoint = gl.COLOR_ATTACHMENT0;
        //gl.framebufferTexture2D(
        //    gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.render_texture.texture, this.render_texture.texture_settings.level);
    }
}