class RenderTexture {

    texture;
    texture_settings;
    texture_data;

    constructor(gl, texture_width, texture_height, type, format, internalformat) {
        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        var target = gl.TEXTURE_2D;
        var level = 0;
        var width = texture_width;
        var height = texture_height;
        var border = 0;

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

module.exports = RenderTexture;