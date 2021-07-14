const RenderTexture = require("./render_texture");

class ComputeWrapper {

    constructor(gl, name, texture_width, texture_height) {
        console.log("Construct ComputeWrapper: ", name, texture_width, texture_height)
        this.name = name;
        var type = gl.FLOAT;
        var format = gl.RGBA;
        var internalformat = gl.RGBA32F;
        //var type = gl.UNSIGNED_BYTE;
        //var format = gl.RGBA;
        //var internalformat = gl.RGBA;
        this.render_texture = new RenderTexture(gl, texture_width, texture_height, type, format, internalformat);

        const attachmentPoint = gl.COLOR_ATTACHMENT0;

        this.frame_buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D,
            this.render_texture.texture, this.render_texture.texture_settings.level);
    }

    resize(gl, texture_width, texture_height) {
        console.log("resize ComputeWrapper: ", this.name, texture_width, texture_height)
        this.render_texture.resize(gl, texture_width, texture_height);
    }
}

module.exports = ComputeWrapper;