const DummyQuad = require("./dummy_quad");
const RenderWrapper = require("./render_wrapper");
const ShaderUniforms = require("./shader_uniforms");
const module_webgl = require("./webgl");
const loadShaderProgramFromCode = module_webgl.loadShaderProgramFromCode;
const module_utility = require("./utility");
const getMousePositionFromBottomLeft = module_utility.getMousePositionFromBottomLeft;
const lerp = module_utility.lerp;

class UniformLocationsFTLESlice {
    constructor(gl, program, name) {
        console.log("UniformLocationsFTLESlice: ", name)
        this.location_width = gl.getUniformLocation(program, "width");
        this.location_height = gl.getUniformLocation(program, "height");
        this.location_texture_float_global = gl.getUniformLocation(program, "texture_float_global");
        this.location_texture_int_global = gl.getUniformLocation(program, "texture_int_global");
    }
}

class CanvasWrapperTransferFunction {

    constructor(gl, name, canvas, canvas_width, canvas_height, global_data) {
        console.log("Construct CanvasWrapper: ", name)
        this.name = name;
        this.canvas = canvas;
        this.canvas_width = canvas_width;
        this.canvas_height = canvas_height;
        this.global_data = global_data;

        //this.render_wrapper = new RenderWrapper(gl, name + "_render_wrapper", canvas_width, canvas_height);

        console.log("CanvasWrapper: ", name, "create program")
        console.log("CanvasWrapper gl: ", gl)

        this.program_ftle_slice = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_ftle_slice, V_SHADER_RAYTRACING, F_SHADER_TRANSFER_FUNCTION);
        this.location_ftle_slice = new UniformLocationsFTLESlice(gl, this.program_ftle_slice);
        this.shader_uniforms_ftle_slice = this.loadShaderUniformsFTLESlice(gl, this.program_ftle_slice);
        this.attribute_location_dummy_program_ftle_slice = gl.getAttribLocation(this.program_ftle_slice, "a_position");

        this.program_transfer_function_points = gl.createProgram();
        loadShaderProgramFromCode(gl, this.program_transfer_function_points, V_SHADER_TRANSFER_FUNCTION_POINTS, F_SHADER_TRANSFER_FUNCTION_POINTS);
        this.attribute_location_dummy_program_transfer_function_points = gl.getAttribLocation(this.program_transfer_function_points, "a_position");

        //this.GenerateDummyBuffer(gl);
        this.dummy_quad = new DummyQuad(gl);

        canvas.addEventListener("click", (event) => {
            var pos = getMousePositionFromBottomLeft(canvas, event)
            this.onClick(pos.x, pos.y);
        });
    }

    draw(gl, transfer_function_changed) {
        if (!transfer_function_changed)
            return;

        this.drawBackground(gl);
        this.drawPoints(gl);
    }

    drawBackground(gl) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas_width, this.canvas_height);
        //gl.viewport(0, 0, 1024, 200);
        gl.useProgram(this.program_ftle_slice);
        gl.uniform1i(this.location_ftle_slice.location_width, this.canvas_width);
        gl.uniform1i(this.location_ftle_slice.location_height, this.canvas_height);

        this.global_data.bind(this.name, gl,
            this.shader_uniforms_ftle_slice,
            this.location_ftle_slice.location_texture_float_global, gl.TEXTURE2, 2,
            this.location_ftle_slice.location_texture_int_global, gl.TEXTURE3, 3);

        this.dummy_quad.draw(gl, this.attribute_location_dummy_program_ftle_slice);
    }

    drawPoints(gl) {
        var vertices_opacities = [
            -0.5, 0.5, 0.0,
            -0.5, -0.5, 0.0,
            0.5, 0.5, 0.0,
            0.5, -0.5, 0.0,
        ];
        var vertex_buffer_opacities = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_opacities);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_opacities), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        var vertices_colors = [
            -0.5, -0.75, 0.0,
            0.0, -0.75, 0.0,
            -0.25, -0.75, 0.0,
        ];
        var vertex_buffer_colors = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_colors);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_colors), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        //opacities
        gl.useProgram(this.program_transfer_function_points);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_opacities);
        gl.vertexAttribPointer(this.attribute_location_dummy_program_transfer_function_points, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribute_location_dummy_program_transfer_function_points);
        gl.drawArrays(gl.POINTS, 0, 4);
        //colors
        gl.useProgram(this.program_transfer_function_points);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_colors);
        gl.vertexAttribPointer(this.attribute_location_dummy_program_transfer_function_points, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.attribute_location_dummy_program_transfer_function_points);
        gl.drawArrays(gl.POINTS, 0, 3);
    }

    loadShaderUniformsFTLESlice(gl, program) {
        var program_shader_uniforms = new ShaderUniforms(gl, program);
        program_shader_uniforms.registerUniform("start_index_int_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_dir_lights", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_streamline_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_scalar_color", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_int_cylinder", "INT", -1);
        program_shader_uniforms.registerUniform("start_index_float_cylinder", "INT", -1);

        program_shader_uniforms.print();
        return program_shader_uniforms;
    }

    onClick(x, y){
        console.log("down", "x: " + x, "y: " + y);
        var area = this.identifyArea(x, y);
        var tx = this.pixelToTX(area, x);
        var ty = this.pixelToTY(area, y);
        var x_d = this.txToDeviceX(area, tx);
        var y_d = this.tyToDeviceY(area, ty);
        console.log("area", area);
        console.log("tx", tx);
        console.log("ty", ty);
        console.log("x_d", x_d);
        console.log("y_d", y_d);
    }

    identifyArea(x, y){
        var width = CANVAS_TRANSFER_FUNCTION_WIDTH;
        var height = CANVAS_TRANSFER_FUNCTION_HEIGHT;

        var padding = 8;
        var padding_bottom = 24;
        var gap = 8;
        var bar_height = 16;
        var min_x = padding-1;
        var max_x = width-padding-1;
        var min_y = padding_bottom-1;
        var max_y = height-padding-1;
        var max_y_bottom = min_y + bar_height;
        var min_y_center = max_y_bottom + gap;
        var min_y_top = max_y - bar_height;
        var max_y_center = min_y_top - gap;

        var inside_x = x >= min_x && x <= max_x;
        var inside_y = y >= min_y && y <= max_y;
        var inside_top_y = y >= min_y_top;
        var inside_center_y = y >= min_y_center && y <= max_y_center;
        var inside_bottom_y = y <= max_y_bottom;
        var inside_top_area = inside_x && inside_y && inside_top_y;
        var inside_center_area = inside_x && inside_y && inside_center_y;
        var inside_bottom_area = inside_x && inside_y && inside_bottom_y;

        return inside_top_area ? TRANSFER_FUNCTION_AREA_TOP
            : inside_center_area ? TRANSFER_FUNCTION_AREA_CENTER
            : inside_bottom_area ? TRANSFER_FUNCTION_AREA_BOTTOM
            : TRANSFER_FUNCTION_AREA_NONE;
    }

    pixelToTX(area, x){
        var width = CANVAS_TRANSFER_FUNCTION_WIDTH;
        var height = CANVAS_TRANSFER_FUNCTION_HEIGHT;

        var padding = 8;
        var padding_bottom = 24;
        var gap = 8;
        var bar_height = 16;
        var min_x = padding-1;
        var max_x = width-padding-1;
        var min_y = padding_bottom-1;
        var max_y = height-padding-1;
        var max_y_bottom = min_y + bar_height;
        var min_y_center = max_y_bottom + gap;
        var min_y_top = max_y - bar_height;
        var max_y_center = min_y_top - gap;

        return (x-min_x) / (max_x-min_x);
    }

    pixelToTY(area, y){
        var width = CANVAS_TRANSFER_FUNCTION_WIDTH;
        var height = CANVAS_TRANSFER_FUNCTION_HEIGHT;

        var padding = 8;
        var padding_bottom = 24;
        var gap = 8;
        var bar_height = 16;
        var min_x = padding-1;
        var max_x = width-padding-1;
        var min_y = padding_bottom-1;
        var max_y = height-padding-1;
        var max_y_bottom = min_y + bar_height;
        var min_y_center = max_y_bottom + gap;
        var min_y_top = max_y - bar_height;
        var max_y_center = min_y_top - gap;

        switch (area) {
            case TRANSFER_FUNCTION_AREA_TOP:                
                return (y-min_y_top) / (max_y-min_y_top);  
            case TRANSFER_FUNCTION_AREA_CENTER:    
                return (y-min_y_center) / (max_y_center-min_y_center);
            case TRANSFER_FUNCTION_AREA_BOTTOM:         
                return (y-min_y) / (max_y_bottom-min_y); 
            default:
                return 0;
        }
    }

    txToDeviceX(area, tx){
        var width = CANVAS_TRANSFER_FUNCTION_WIDTH;
        var height = CANVAS_TRANSFER_FUNCTION_HEIGHT;

        var padding = 8;
        var padding_bottom = 24;
        var gap = 8;
        var bar_height = 16;
        var min_x = padding-1;
        var max_x = width-padding-1;
        var min_y = padding_bottom-1;
        var max_y = height-padding-1;
        var max_y_bottom = min_y + bar_height;
        var min_y_center = max_y_bottom + gap;
        var min_y_top = max_y - bar_height;
        var max_y_center = min_y_top - gap;

        var min_x_d = lerp(-1, 1, min_x/width);
        var max_x_d = lerp(-1, 1, max_x/width);
        var min_y_d = lerp(1, -1, min_y/height);
        var max_y_d = lerp(1, -1, max_y/height);
        var max_y_bottom_d = lerp(1, -1, max_y_bottom/height);
        var min_y_center_d = lerp(1, -1, min_y_center/height);
        var min_y_top_d = lerp(1, -1, min_y_top/height);
        var max_y_center_d = lerp(1, -1, max_y_center/height);
        /*
        console.log("min_x_d", min_x_d);
        console.log("max_x_d", max_x_d);
        console.log("min_y_d", min_y_d);
        console.log("max_y_bottom_d", max_y_bottom_d);
        console.log("min_y_center_d", min_y_center_d);
        console.log("max_y_center_d", max_y_center_d);
        console.log("min_y_top_d", min_y_top_d);
        console.log("max_y_d", max_y_d);
        */
        return lerp(min_x_d, max_x_d, tx);
    }

    tyToDeviceY(area, ty){
        var width = CANVAS_TRANSFER_FUNCTION_WIDTH;
        var height = CANVAS_TRANSFER_FUNCTION_HEIGHT;

        var padding = 8;
        var padding_bottom = 24;
        var gap = 8;
        var bar_height = 16;
        var min_x = padding-1;
        var max_x = width-padding-1;
        var min_y = padding_bottom-1;
        var max_y = height-padding-1;
        var max_y_bottom = min_y + bar_height;
        var min_y_center = max_y_bottom + gap;
        var min_y_top = max_y - bar_height;
        var max_y_center = min_y_top - gap;

        var min_x_d = lerp(-1, 1, min_x/width);
        var max_x_d = lerp(-1, 1, max_x/width);
        var min_y_d = lerp(1, -1, min_y/height);
        var max_y_d = lerp(1, -1, max_y/height);
        var max_y_bottom_d = lerp(1, -1, max_y_bottom/height);
        var min_y_center_d = lerp(1, -1, min_y_center/height);
        var min_y_top_d = lerp(1, -1, min_y_top/height);
        var max_y_center_d = lerp(1, -1, max_y_center/height);

        switch (area) {
            case TRANSFER_FUNCTION_AREA_TOP:               
                return lerp(min_y_top_d, max_y_d, ty);
            case TRANSFER_FUNCTION_AREA_CENTER:         
                return lerp(min_y_center_d, max_y_center_d, ty);
            case TRANSFER_FUNCTION_AREA_BOTTOM:              
                return lerp(min_y_d, max_y_bottom_d, ty);
            default:
                return 0;
        }

    }
}

module.exports = CanvasWrapperTransferFunction;