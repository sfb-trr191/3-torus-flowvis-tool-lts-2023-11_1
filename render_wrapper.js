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

        gl.texImage2D(target, level, internalformat, width, height, border, format, type, this.texture_data);

        // set the filtering so we don't need mips and it's not filtered
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.texture_settings = { target, level, internalformat, width, height, border, format, type };
        //return {texture: texture, texture_data: texture_data, texture_settings: texture_settings};    
    }
}

class RenderWrapper {

    constructor(gl, name, texture_width, texture_height) {
        console.log("Construct RenderWrapper: ", name, texture_width, texture_height)
        this.render_texture = new RenderTexture(gl, texture_width, texture_height);

        // Create and bind the framebuffer
        this.frame_buffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frame_buffer);

        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, this.render_texture.texture, this.render_texture.texture_settings.level);
    }
}