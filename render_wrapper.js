const RenderTexture = require("./render_texture");

class RenderWrapper {

    constructor(gl, name, texture_width, texture_height) {
        console.log("Construct RenderWrapper: ", name, texture_width, texture_height)
        this.name = name;
        var type = gl.UNSIGNED_BYTE;
        var format = gl.RGBA;
        var internalformat = gl.RGBA;
        this.render_texture = new RenderTexture(gl, texture_width, texture_height, type, format, internalformat);
        this.render_texture_alternative = new RenderTexture(gl, texture_width, texture_height, type, format, internalformat);
        this.render_texture_compare = new RenderTexture(gl, texture_width, texture_height, type, format, internalformat);
        this.render_texture_average_in = new RenderTexture(gl, texture_width, texture_height, type, format, internalformat);
        this.render_texture_average_out = new RenderTexture(gl, texture_width, texture_height, type, format, internalformat);

        const attachmentPoint = gl.COLOR_ATTACHMENT0;

        //this produces a single frame
        this.frame_buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D,
            this.render_texture.texture, this.render_texture.texture_settings.level);

        //this produces a single frame with alternative parameters --> allows comparison and hole detection
        this.frame_buffer_alternative = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer_alternative);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D,
            this.render_texture_alternative.texture, this.render_texture_alternative.texture_settings.level);

        //comparison of render_texture and render_texture_alternative, hole detection
        this.frame_buffer_compare = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer_compare);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D,
            this.render_texture_compare.texture, this.render_texture_compare.texture_settings.level);

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
        //console.warn("resize RenderWrapper: ", this.name, texture_width, texture_height)
        this.render_texture.resize(gl, texture_width, texture_height);
        this.render_texture_alternative.resize(gl, texture_width, texture_height);
        this.render_texture_compare.resize(gl, texture_width, texture_height);
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

module.exports = RenderWrapper;