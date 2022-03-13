const DataUnit = require("./data_unit");
const DataContainer = require("./data_container");
const {DataTextures, DataTexture3D_RGBA, DataTexture3D_R} = require("./data_textures");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");

class GlobalData {

    constructor(gl, gl_side, gl_transfer_function, p_lights, p_ui_seeds, p_transfer_function_manager, p_object_manager) {

        //---start region: references
        this.p_lights = p_lights;
        this.p_ui_seeds = p_ui_seeds;
        this.p_transfer_function_manager = p_transfer_function_manager;
        this.p_object_manager = p_object_manager;
        //---end region: references

        //---start region: data unit 
        this.data_unit = new DataUnit("global_data");
        this.data_container_dir_lights = new DataContainer("dir_lights", new DirLight());
        this.data_container_streamline_color = new DataContainer("streamline_color", new StreamlineColor());
        this.data_container_scalar_color = new DataContainer("scalar_color", new StreamlineColor());
        this.data_container_cylinders = new DataContainer("cylinders", new Cylinder());
        this.data_container_seeds = new DataContainer("seeds", new StreamlineSeed());
        this.data_unit.registerDataCollection(this.data_container_dir_lights);
        this.data_unit.registerDataCollection(this.data_container_streamline_color);
        this.data_unit.registerDataCollection(this.data_container_scalar_color);
        this.data_unit.registerDataCollection(this.data_container_cylinders);
        this.data_unit.registerDataCollection(this.data_container_seeds);
        //---end region: data unit  

        this.data_textures = new DataTextures(gl, this.data_unit);
        this.data_textures_side = new DataTextures(gl_side, this.data_unit);
        this.data_textures_transfer_function = new DataTextures(gl_transfer_function, this.data_unit);
    }

    UpdateDataUnit() {
        console.log("UpdateDataUnit: ", this.data_unit.name);
        this.data_container_dir_lights.data = this.p_lights.dir_lights;
        this.data_container_streamline_color.data = this.p_ui_seeds.getStreamlineColors();
        this.data_container_scalar_color.data = this.p_transfer_function_manager.GetConcatenatedTransferfunctionColorList();
        this.data_container_cylinders.data = this.p_object_manager.cylinders;
        this.data_container_seeds.data = this.p_ui_seeds.visual_seeds;
        this.data_unit.generateArrays();
        console.log("UpdateDataUnit completed");
    }

    UpdateDataTextures(gl, gl_side, gl_transfer_function) {
        console.log("UpdateDataTextures");
        this.data_textures.update(gl);
        this.data_textures_side.update(gl_side);
        this.data_textures_transfer_function.update(gl_transfer_function);
        console.log("UpdateDataTextures completed");
    }

    bind(canvas_wrapper_name, gl, shader_uniforms, 
        location_texture_float_global, texture_float_active, texture_float_index, 
        location_texture_int_global, texture_int_active, texture_int_index) {
        var data_textures;
        switch (canvas_wrapper_name) {
            case CANVAS_WRAPPER_MAIN:
                data_textures = this.data_textures;
                break;
            case CANVAS_WRAPPER_SIDE:
                data_textures = this.data_textures_side;
                break;
            case CANVAS_WRAPPER_TRANSFER_FUNCTION:
                data_textures = this.data_textures_transfer_function;
                break;
            default:
                console.warn("unknown canvas_wrapper_name: ", canvas_wrapper_name);
                break;
        }

        gl.activeTexture(texture_float_active);                  // added this and following line to be extra sure which texture is being used...
        gl.bindTexture(gl.TEXTURE_3D, data_textures.texture_float.texture);
        gl.uniform1i(location_texture_float_global, texture_float_index);
        gl.activeTexture(texture_int_active);
        gl.bindTexture(gl.TEXTURE_3D, data_textures.texture_int.texture);
        gl.uniform1i(location_texture_int_global, texture_int_index);

        shader_uniforms.setUniform("start_index_int_dir_lights", this.data_unit.getIntStart("dir_lights"));
        shader_uniforms.setUniform("start_index_int_streamline_color", this.data_unit.getIntStart("streamline_color"));
        shader_uniforms.setUniform("start_index_int_scalar_color", this.data_unit.getIntStart("scalar_color"));
        shader_uniforms.setUniform("start_index_int_cylinder", this.data_unit.getIntStart("cylinders"));
        shader_uniforms.setUniform("start_index_int_seeds", this.data_unit.getIntStart("seeds"));

        shader_uniforms.setUniform("start_index_float_dir_lights", this.data_unit.getFloatStart("dir_lights"));
        shader_uniforms.setUniform("start_index_float_streamline_color", this.data_unit.getFloatStart("streamline_color"));
        shader_uniforms.setUniform("start_index_float_scalar_color", this.data_unit.getFloatStart("scalar_color"));
        shader_uniforms.setUniform("start_index_float_cylinder", this.data_unit.getFloatStart("cylinders"));
        shader_uniforms.setUniform("start_index_float_seeds", this.data_unit.getFloatStart("seeds"));

        shader_uniforms.updateUniforms();
    }

    GetNumVisualSeeds(){
        return this.data_container_seeds.data.length;
    }
}

module.exports = GlobalData;