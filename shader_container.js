class ShaderContainer {

    constructor(gl, f_source, v_source) {
        this.program = gl.createProgram();
        this.vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        this.fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        this.load(gl, f_source, v_source);
    }

    load(gl, f_source, v_source) {
        gl.shaderSource(this.vertex_shader, v_source);
        gl.compileShader(this.vertex_shader);
    
        gl.shaderSource(this.fragment_shader, f_source);
        gl.compileShader(this.fragment_shader);
    
        gl.attachShader(this.program, this.vertex_shader);
        gl.attachShader(this.program, this.fragment_shader);

        gl.linkProgram(this.program);
    }

    check_status(gl, ext_parallel){
        if (ext_parallel) {
            if(!gl.getProgramParameter(this.program, ext_parallel.COMPLETION_STATUS_KHR)){
                return false;
            }
            return true;
        }
        else{
            if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
                console.error('Link failed: ' + gl.getProgramInfoLog(this.program));
                console.error('vs info-log: ' + gl.getShaderInfoLog(this.vertex_shader));
                console.error('fs info-log: ' + gl.getShaderInfoLog(this.fragment_shader));
                return false;
            }
            return true;
        }
    }
}

module.exports = ShaderContainer;