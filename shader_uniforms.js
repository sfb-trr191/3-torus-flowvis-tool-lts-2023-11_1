class ShaderUniform {

    constructor(gl, program, name, type, value) {
        this.gl = gl;
        this.program = program;
        this.name = name;
        this.type = type;
        this.value = value;
        this.location = gl.getUniformLocation(program, name);
    }

    updateUniform() {
        if (this.type == "INT") {
            this.gl.uniform1i(this.location, this.value);
        }
        else {
            console.error("UNKNOWN TYPE: " + this.type);
        }
    }

}

class ShaderUniforms {

    constructor(gl, program) {
        this.uniforms = {};
        this.gl = gl;
        this.program = program;
    }

    registerUniform(name, type, value) {
        var shader_uniform = new ShaderUniform(this.gl, this.program, name, type, value);
        this.uniforms[name] = shader_uniform;
    }

    setUniform(name, value) {
        this.uniforms[name].value = value;
    }

    updateUniforms() {
        for (const [key, value] of Object.entries(this.uniforms)) {
            //console.log(key, value);
            value.updateUniform();
        }
    }

    print() {
        console.log("ShaderUniforms");
        console.log(this.uniforms);
    }

}