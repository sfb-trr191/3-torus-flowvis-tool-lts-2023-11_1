const glMatrix = require("gl-matrix");
const module_gl_matrix_extensions = require("./gl_matrix_extensions");

const { tb_project_to_sphere, trackball } = require("./trackball");
const { ndcToArcBall, trackball2, getRotationQuaternion } = require("./trackball2");
const { trackball3 } = require("./trackball3");
const vec4fromvec3 = module_gl_matrix_extensions.vec4fromvec3;
const getStateDescription = require("./version").getStateDescription;
const BinaryArray = require("./binary_array");

class GL_CameraData {
    constructor() {
        this.q_x = glMatrix.vec4.create();
        this.q_y = glMatrix.vec4.create();
        this.p_1m = glMatrix.vec4.create();
        this.E = glMatrix.vec4.create();
        this.forward = glMatrix.vec4.create();
        this.normal_left = glMatrix.vec4.create();
        this.normal_right = glMatrix.vec4.create();
        this.normal_top = glMatrix.vec4.create();
        this.normal_bottom = glMatrix.vec4.create();
    }

    WriteToUniform(gl, program, uniform_variable_name) {
        var location_q_x = gl.getUniformLocation(program, uniform_variable_name + ".q_x");
        var location_q_y = gl.getUniformLocation(program, uniform_variable_name + ".q_y");
        var location_p_1m = gl.getUniformLocation(program, uniform_variable_name + ".p_1m");
        var location_E = gl.getUniformLocation(program, uniform_variable_name + ".E");
        var location_forward = gl.getUniformLocation(program, uniform_variable_name + ".forward");
        var location_normal_left = gl.getUniformLocation(program, uniform_variable_name + ".normal_left");
        var location_normal_right = gl.getUniformLocation(program, uniform_variable_name + ".normal_right");
        var location_normal_top = gl.getUniformLocation(program, uniform_variable_name + ".normal_top");
        var location_normal_bottom = gl.getUniformLocation(program, uniform_variable_name + ".normal_bottom");

        gl.uniform4fv(location_q_x, this.q_x);
        gl.uniform4fv(location_q_y, this.q_y);
        gl.uniform4fv(location_p_1m, this.p_1m);
        gl.uniform4fv(location_E, this.E);
        gl.uniform4fv(location_forward, this.forward);
        gl.uniform4fv(location_normal_left, this.normal_left);
        gl.uniform4fv(location_normal_right, this.normal_right);
        gl.uniform4fv(location_normal_top, this.normal_top);
        gl.uniform4fv(location_normal_bottom, this.normal_bottom);
    }
}

class CameraState {

    constructor() {
        //saved variables
        this.forward = glMatrix.vec4.create();
        this.up = glMatrix.vec4.create();
        this.right = glMatrix.vec4.create();
        this.position = glMatrix.vec4.create();
        //unsaved variables
        this.allow_panning = true;
    }

    setProjectionX() {
        this.forward = glMatrix.vec4.fromValues(-1, 0, 0, 0);
        this.up = glMatrix.vec4.fromValues(0, 0, -1, 0);
        this.position = glMatrix.vec4.fromValues(1, 0.5, 0.5, 0);
        this.allow_panning = false;
    }

    setProjectionY() {
        this.forward = glMatrix.vec4.fromValues(0, -1, 0, 0);
        this.up = glMatrix.vec4.fromValues(-1, 0, 0, 0);
        this.position = glMatrix.vec4.fromValues(0.5, 1, 0.5, 0);
        this.allow_panning = false;
    }

    setProjectionZ() {
        this.forward = glMatrix.vec4.fromValues(0, 0, -1, 0);
        this.up = glMatrix.vec4.fromValues(0, -1, 0, 0);
        this.position = glMatrix.vec4.fromValues(0.5, 0.5, 1, 0);
        this.allow_panning = false;
    }

    fromString(s) {
        console.log("0x22 CAMERA_STATE ", s);
        if (s === null)
            return;
        console.log("CAMERA_STATE not null");
        if (!s.includes("~"))
            return;

        var split = s.split("~");
        this.position[0] = split[0];
        this.position[1] = split[1];
        this.position[2] = split[2];
        this.position[3] = split[3];
        this.forward[0] = split[4];
        this.forward[1] = split[5];
        this.forward[2] = split[6];
        this.forward[3] = split[7];
        this.up[0] = split[8];
        this.up[1] = split[9];
        this.up[2] = split[10];
        this.up[3] = split[11];
        this.right[0] = split[12];
        this.right[1] = split[13];
        this.right[2] = split[14];
        this.right[3] = split[15];

        console.log("fromString this.position", this.position);
    }

    toString() {
        var s = this.position[0] + "~"
            + this.position[1] + "~"
            + this.position[2] + "~"
            + this.position[3] + "~"
            + this.forward[0] + "~"
            + this.forward[1] + "~"
            + this.forward[2] + "~"
            + this.forward[3] + "~"
            + this.up[0] + "~"
            + this.up[1] + "~"
            + this.up[2] + "~"
            + this.up[3] + "~"
            + this.right[0] + "~"
            + this.right[1] + "~"
            + this.right[2] + "~"
            + this.right[3]
        console.log("0x22 toString", s);
        return s;
    }

    writeToBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "camera_state");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = this.getValueByName(list[i].name);
            var value_conversion = null;
            binary_array.writeValue(value, list[i].data_type, value_conversion);            
        }        
    }

    readFromBinaryArray(binary_array){
        var list = getStateDescription(STATE_VERSION, "camera_state");
        console.log(list);
        for(var i=0; i<list.length; i++){
            var value = binary_array.readValue(list[i].data_type);
            this.setValueByName(list[i].name, value);
        }
    }

    getValueByName(name){
        switch (name) {
            case "position_x":
                return this.position[0];
            case "position_y":
                return this.position[1];
            case "position_z":
                return this.position[2];
            case "forward_x":
                return this.forward[0];
            case "forward_y":
                return this.forward[1];
            case "forward_z":
                return this.forward[2];
            case "up_x":
                return this.up[0];
            case "up_y":
                return this.up[1];
            case "up_z":
                return this.up[2];
            default:
                console.error("ui_seeds: getValueByName: Unknown name");
                return null;
        }
    }

    setValueByName(name, value){
        switch (name) {
            case "position_x":
                this.position[0] = value;
                break;
            case "position_y":
                this.position[1] = value;
                break;
            case "position_z":
                this.position[2] = value;
                break;
            case "forward_x":
                this.forward[0] = value;
                break;
            case "forward_y":
                this.forward[1] = value;
                break;
            case "forward_z":
                this.forward[2] = value;
                break;
            case "up_x":
                this.up[0] = value;
                break;
            case "up_y":
                this.up[1] = value;
                break;
            case "up_z":
                this.up[2] = value;
                break;
            default:
                console.error("camera_state: setValueByName: Unknown name");
                break;
        }
    }
}

class Camera {
    /**
     * 
     * @param {string} name the name of the camera
     */
    constructor(name, special_data_name, varname_current_state_name, input_changed_manager) {
        this.name = name;
        this.special_data_name =  special_data_name;
        this.varname_current_state_name = varname_current_state_name;
        this.input_changed_manager = input_changed_manager;
        this.width = 0;
        this.height = 0;
        this.width_original = 0;
        this.height_original = 0;
        this.width_still = 0;
        this.height_still = 0;
        this.width_panning = 0;
        this.height_panning = 0;
        this.left_handed = false;
        this.velocity_slow = 0.1;
        this.velocity = 0.25;
        this.rotationSpeed = 1;
        this.rollspeed = 0.5;
        this.changed = true;
        this.fov_theta = 90.0; 

        this.is4D = false;
        this.control_mode = CAMERA_CONTROL_ROTATE_AROUND_CAMERA;
        this.trackball_rotation_sensitivity = 1.0;
        this.trackball_translation_sensitivity = 1.0;
        this.trackball_wheel_sensitivity = 0.001;
        this.trackball_focus_distance = 0.5;

        //panning
        this.allow_panning = true;
        this.panning = false;
        this.panning_forced = false;
        this.xMouse_old = 0;
        this.yMouse_old = 0;
        this.mouse_in_canvas = false;

        //description of the camera for the user
        this.position = glMatrix.vec4.create();
        this.forward = glMatrix.vec4.create();
        this.up = glMatrix.vec4.create();
        this.right = glMatrix.vec4.create();

        //calculated values for raytracing
        this.q_x = glMatrix.vec4.create();
        this.q_y = glMatrix.vec4.create();
        this.p_1m = glMatrix.vec4.create();

        //normals used for the view pyramid
        this.normal_left = glMatrix.vec4.create();
        this.normal_right = glMatrix.vec4.create();
        this.normal_top = glMatrix.vec4.create();
        this.normal_bottom = glMatrix.vec4.create();

        this.states = {};
        this.states["state_default"] = new CameraState();
        this.states["state_projection_x"] = new CameraState();
        this.states["state_projection_y"] = new CameraState();
        this.states["state_projection_z"] = new CameraState();

        this.states["state_projection_x"].setProjectionX();
        this.states["state_projection_y"].setProjectionY();
        this.states["state_projection_z"].setProjectionZ();

        this.current_state_name = "state_default";

        this.last_mouse_position = {"x":0, "y":0};

        this.InitTracknall2();
    }

    LinkInput(input_camera_position_x, input_camera_position_y, input_camera_position_z, input_camera_position_w,
        input_camera_forward_x, input_camera_forward_y, input_camera_forward_z, input_camera_forward_w,
        input_camera_up_x, input_camera_up_y, input_camera_up_z, input_camera_up_w,
        input_camera_right_x, input_camera_right_y, input_camera_right_z, input_camera_right_w) {

        this.input_camera_position_x = input_camera_position_x;
        this.input_camera_position_y = input_camera_position_y;
        this.input_camera_position_z = input_camera_position_z;
        this.input_camera_position_w = input_camera_position_w;

        this.input_camera_forward_x = input_camera_forward_x;
        this.input_camera_forward_y = input_camera_forward_y;
        this.input_camera_forward_z = input_camera_forward_z;
        this.input_camera_forward_w = input_camera_forward_w;

        this.input_camera_up_x = input_camera_up_x;
        this.input_camera_up_y = input_camera_up_y;
        this.input_camera_up_z = input_camera_up_z;
        this.input_camera_up_w = input_camera_up_w;
        
        this.input_camera_right_x = input_camera_right_x;
        this.input_camera_right_y = input_camera_right_y;
        this.input_camera_right_z = input_camera_right_z;
        this.input_camera_right_w = input_camera_right_w;
    }

    SetDefaultValuesMain(){
        this.position = glMatrix.vec4.fromValues(0.5, 0.5, 0.5, 0);
        this.forward = glMatrix.vec4.fromValues(0.000001, 1.000000, 0.000001, 0);
        this.up = glMatrix.vec4.fromValues(0.000001, 0.000001, -1.000000, 0);
        this.right = glMatrix.vec4.fromValues(0.000001, 1.000001, 0.000001, 0);
        glMatrix.vec4.normalize(this.forward, this.forward);
        glMatrix.vec4.normalize(this.up, this.up);
        glMatrix.vec4.normalize(this.right, this.right);
    }

    SetDefaultValuesAux(){
        this.position = glMatrix.vec4.fromValues(0.500000, -1.000000, 0.500000, 0);
        this.forward = glMatrix.vec4.fromValues(0.000001, 1.000000, 0.000001, 0);
        this.up = glMatrix.vec4.fromValues(0.000001, 0.000001, -1.000000, 0);
        this.right = glMatrix.vec4.fromValues(0.000001, 1.000001, 0.000001, 0);
        glMatrix.vec4.normalize(this.forward, this.forward);
        glMatrix.vec4.normalize(this.up, this.up);
        glMatrix.vec4.normalize(this.right, this.right);
    }

    //camera behavior is changed when calculating streamlines
    OnCalculateStreamlines(space){        
        this.is4D = false;
        if(space == SPACE_3_SPHERE_4_PLUS_4D){                 
            this.is4D = true;
        }
    }

    set_control(mode){
        this.control_mode = mode;
    }

    FromInput() {
        //console.log("FromInput");
        this.position = new_vec4_from_input(this.input_camera_position_x, this.input_camera_position_y, this.input_camera_position_z, this.input_camera_position_w);
        this.forward = new_vec4_from_input(this.input_camera_forward_x, this.input_camera_forward_y, this.input_camera_forward_z, this.input_camera_forward_w);
        var up_negated = new_vec4_from_input(this.input_camera_up_x, this.input_camera_up_y, this.input_camera_up_z, this.input_camera_up_w);
        glMatrix.vec4.negate(this.up, up_negated);
        this.right = new_vec4_from_input(this.input_camera_right_x, this.input_camera_right_y, this.input_camera_right_z, this.input_camera_right_w);
        this.changed = true;
    }

    WriteToInputFields() {
        if (!this.changed)
            return;
        console.log("0x22 this.position", this.position)
        var decimals = 6;
        var up_negated = glMatrix.vec4.create();
        glMatrix.vec4.negate(up_negated, this.up);
        this.input_camera_position_x.value = this.position[0].toFixed(decimals);
        this.input_camera_position_y.value = this.position[1].toFixed(decimals);
        this.input_camera_position_z.value = this.position[2].toFixed(decimals);
        this.input_camera_position_w.value = this.position[3].toFixed(decimals);
        this.input_camera_forward_x.value = this.forward[0].toFixed(decimals);
        this.input_camera_forward_y.value = this.forward[1].toFixed(decimals);
        this.input_camera_forward_z.value = this.forward[2].toFixed(decimals);
        this.input_camera_forward_w.value = this.forward[3].toFixed(decimals);
        this.input_camera_up_x.value = up_negated[0].toFixed(decimals);
        this.input_camera_up_y.value = up_negated[1].toFixed(decimals);
        this.input_camera_up_z.value = up_negated[2].toFixed(decimals);
        this.input_camera_up_w.value = up_negated[3].toFixed(decimals);
        this.input_camera_right_x.value = this.right[0].toFixed(decimals);
        this.input_camera_right_y.value = this.right[1].toFixed(decimals);
        this.input_camera_right_z.value = this.right[2].toFixed(decimals);
        this.input_camera_right_w.value = this.right[3].toFixed(decimals);
        this.input_changed_manager.UpdateDefaultValuesCamera();
    }

    toSpecialData(){                  
        var binary_array = new BinaryArray();
        this.states["state_default"].writeToBinaryArray(binary_array);
        this.states["state_projection_x"].writeToBinaryArray(binary_array);
        this.states["state_projection_y"].writeToBinaryArray(binary_array);
        this.states["state_projection_z"].writeToBinaryArray(binary_array);
        binary_array.resizeToContent();
        console.log(binary_array);
        window[this.special_data_name] = binary_array;  

        window[this.varname_current_state_name] = this.current_state_name;
        
        console.log("varname_current_state_name", this.varname_current_state_name);
        console.log("window[this.varname_current_state_name]", window[this.varname_current_state_name])

    }

    fromSpecialData() {
        var binary_array = window[this.special_data_name];
        binary_array.begin();
        this.states["state_default"].readFromBinaryArray(binary_array);
        this.states["state_projection_x"].readFromBinaryArray(binary_array);
        this.states["state_projection_y"].readFromBinaryArray(binary_array);
        this.states["state_projection_z"].readFromBinaryArray(binary_array);
        
        this.current_state_name = window[this.varname_current_state_name];

        console.log("varname_current_state_name", this.varname_current_state_name);
        console.log("current_state_name", this.current_state_name);
        console.log("state_default", this.states["state_default"]);
        
        this.loadState(this.current_state_name, false);
    }

    fromString(s) {
        console.log("CAMERA ", s);
        if (s === null)
            return;
        console.log("CAMERA not null");
        if (!s.includes("!"))
            return;
        console.log("CAMERA contains !");

        var split = s.split("!");
        //this.fromStringUI(split[0]);
        this.current_state_name = split[0];
        this.states["state_default"].fromString(split[1]);
        this.states["state_projection_x"].fromString(split[2]);
        this.states["state_projection_y"].fromString(split[3]);
        this.states["state_projection_z"].fromString(split[4]);

        this.loadState(this.current_state_name, false);
    }

    fromStringUI(s) {
        console.log("fromStringUI: ", s);
        if (!s.includes("~"))
            return;

        var split = s.split("~");
        this.input_camera_position_x.value = split[0];
        this.input_camera_position_y.value = split[1];
        this.input_camera_position_z.value = split[2];
        this.input_camera_position_w.value = split[3];
        this.input_camera_forward_x.value = split[4];
        this.input_camera_forward_y.value = split[5];
        this.input_camera_forward_z.value = split[6];
        this.input_camera_forward_w.value = split[7];
        this.input_camera_up_x.value = split[8];
        this.input_camera_up_y.value = split[9];
        this.input_camera_up_z.value = split[10];
        this.input_camera_up_w.value = split[11];
        this.input_camera_right_x.value = split[12];
        this.input_camera_right_y.value = split[13];
        this.input_camera_right_z.value = split[14];
        this.input_camera_right_w.value = split[15];

        this.FromInput();
    }

    toString() {
        //var s = this.toStringUI();
        var s = this.current_state_name;
        s += "!"
        s += this.states["state_default"].toString();
        s += "!"
        s += this.states["state_projection_x"].toString();
        s += "!"
        s += this.states["state_projection_y"].toString();
        s += "!"
        s += this.states["state_projection_z"].toString();
        return s;
    }

    toStringUI() {
        var s = this.input_camera_position_x.value + "~"
            + this.input_camera_position_y.value + "~"
            + this.input_camera_position_z.value + "~"
            + this.input_camera_position_w.value + "~"
            + this.input_camera_forward_x.value + "~"
            + this.input_camera_forward_y.value + "~"
            + this.input_camera_forward_z.value + "~"
            + this.input_camera_forward_w.value + "~"
            + this.input_camera_up_x.value + "~"
            + this.input_camera_up_y.value + "~"
            + this.input_camera_up_z.value + "~"
            + this.input_camera_up_w.value + "~"
            + this.input_camera_right_x.value + "~"
            + this.input_camera_right_y.value + "~"
            + this.input_camera_right_z.value + "~"
            + this.input_camera_right_w.value;
        return s;
    }

    SetRenderSizes(width, height, width_panning, height_panning) {
        this.width = width;
        this.height = height;
        this.width_original = width;
        this.height_original = height;
        this.width_still = width;
        this.height_still = height;
        this.width_panning = width_panning;
        this.height_panning = height_panning;
    }

    GetCameraData() {
        return this.GetCameraDataWithPosition(this.position);
    }

    GetCameraDataWithPosition(eyePosition) {
        var data = new GL_CameraData();
        glMatrix.vec4.copy(data.q_x, this.q_x);//data.q_x = vec4fromvec3(this.q_x, 0);
        glMatrix.vec4.copy(data.q_y, this.q_y);//data.q_y = vec4fromvec3(this.q_y, 0);
        glMatrix.vec4.copy(data.p_1m, this.p_1m);//data.p_1m = vec4fromvec3(this.p_1m, 0);
        glMatrix.vec4.copy(data.E, eyePosition);//data.E = vec4fromvec3(eyePosition, 0);
        glMatrix.vec4.copy(data.forward, this.forward);//data.forward = vec4fromvec3(this.forward, 0);
        glMatrix.vec4.copy(data.normal_left, this.normal_left);//data.normal_left = vec4fromvec3(this.normal_left, 0);
        glMatrix.vec4.copy(data.normal_right, this.normal_right);//data.normal_right = vec4fromvec3(this.normal_right, 0);
        glMatrix.vec4.copy(data.normal_top, this.normal_top);//data.normal_top = vec4fromvec3(this.normal_top, 0);
        glMatrix.vec4.copy(data.normal_bottom, this.normal_bottom);//data.normal_bottom = vec4fromvec3(this.normal_bottom, 0);
        return data;
    }

    WriteToUniform(gl, program, uniform_variable_name) {
        var data = this.GetCameraData();
        data.WriteToUniform(gl, program, uniform_variable_name);
    }

    UpdateShaderValues() {
        if(this.is4D){
            this.UpdateShaderValues4D();
        }
        else{
            this.UpdateShaderValues3D();
        }
    }

    UpdateShaderValues3D() {
        //console.log("0x22 UpdateShaderValues3D", this.name);
        //console.log("0x22 this.position", this.position);
        var T = glMatrix.vec3.create();
        var t = glMatrix.vec3.create();
        var t_n = glMatrix.vec3.create();
        var b = glMatrix.vec3.create();
        var b_n = glMatrix.vec3.create();
        var v_n = glMatrix.vec3.create();
        var top_left = glMatrix.vec3.create();
        var bottom_left = glMatrix.vec3.create();
        var top_right = glMatrix.vec3.create();
        var bottom_right = glMatrix.vec3.create();
        var p_1m_3d = glMatrix.vec3.create();
        var q_x_3d = glMatrix.vec3.create();
        var q_y_3d = glMatrix.vec3.create();

        var d = 1.0;//distance to plane

        var E = glMatrix.vec3.create();
        var forward_3D = glMatrix.vec3.create();
        var w = glMatrix.vec3.create();
        vec3_from_vec4(E, this.position);
        vec3_from_vec4(forward_3D, this.forward);
        vec3_from_vec4(w, this.up);
        glMatrix.vec3.add(T, E, forward_3D);//T = this.position + this.forward;
        var m = this.height;
        var k = this.width;

        //pre calculations
        glMatrix.vec3.subtract(t, T, E);//t = T - E;//t should be same as forward
        //t = T - E;//this should be same as forward
        glMatrix.vec3.normalize(t_n, t);//t_n should be same as forward
        glMatrix.vec3.cross(b, w, t);//b should be the same as right
        glMatrix.vec3.normalize(b_n, b);//b_n should be the same as right
        glMatrix.vec3.cross(v_n, t_n, b_n)//v_n should be the same as up
        var theta_half = this.fov_theta / 2;
        var g_x = d * Math.tan(theta_half * Math.PI / 180.0);//TODO does M_PI work here?
        var g_y = g_x * m / (k * 1.0);//TODO is this correct syntax?

        //uniforms
        glMatrix.vec3.scale(q_x_3d, b_n, ((2 * g_x) / (k - 1)));//this.q_x = ((2 * g_x) / (k - 1)) * b_n;
        glMatrix.vec3.scale(q_y_3d, v_n, ((2 * g_y) / (m - 1)));//this.q_y = ((2 * g_y) / (m - 1)) * v_n;

        //this.p_1m = t_n * d - g_x * b_n - g_y * v_n;
        //p_1m is the bottom left reference pixel (as a direction relative to E), each other pixel is calculated by moving along the "shift vectors" q_x and q_y.
        var t_n_times_d = glMatrix.vec3.create();
        var g_x_times_b_n = glMatrix.vec3.create();
        var g_y_times_v_n = glMatrix.vec3.create();
        glMatrix.vec3.scale(t_n_times_d, t_n, d);//t_n * d
        glMatrix.vec3.scale(g_x_times_b_n, b_n, g_x);//g_x * b_n
        glMatrix.vec3.scale(g_y_times_v_n, v_n, g_y);//g_y * v_n
        glMatrix.vec3.subtract(p_1m_3d, t_n_times_d, g_x_times_b_n);
        glMatrix.vec3.subtract(p_1m_3d, p_1m_3d, g_y_times_v_n);

        top_left = t_n * d - g_x * b_n + g_y * v_n;
        bottom_left = t_n * d - g_x * b_n - g_y * v_n;
        top_right = t_n * d + g_x * b_n + g_y * v_n;
        bottom_right = t_n * d + g_x * b_n - g_y * v_n;

        glMatrix.vec3.cross(this.normal_left, top_left, bottom_left);//normal_left = QVector3D::crossProduct(top_left, bottom_left);
        glMatrix.vec3.cross(this.normal_right, bottom_right, top_right);//normal_right = QVector3D::crossProduct(bottom_right, top_right);
        glMatrix.vec3.cross(this.normal_top, top_right, top_left);//normal_top = QVector3D::crossProduct(top_right, top_left);
        glMatrix.vec3.cross(this.normal_bottom, bottom_left, bottom_right);//normal_bottom = QVector3D::crossProduct(bottom_left, bottom_right);

        glMatrix.vec3.copy(this.right, b_n);//here for display purposes only


        //store 4D values
        vec4_from_vec3_0(this.q_x, q_x_3d);
        vec4_from_vec3_0(this.q_y, q_y_3d);
        vec4_from_vec3_0(this.p_1m, p_1m_3d);

        //console.log("0x22 this.position", this.position);
    }

    UpdateShaderValues4D() {
        //console.log("UpdateShaderValues4D", this.name);
        var T = glMatrix.vec3.create();
        var t = glMatrix.vec3.create();
        var t_n = glMatrix.vec3.create();
        var b = glMatrix.vec3.create();
        var b_n = glMatrix.vec3.create();
        var v_n = glMatrix.vec3.create();
        //var top_left = glMatrix.vec3.create();
        //var bottom_left = glMatrix.vec3.create();
        //var top_right = glMatrix.vec3.create();
        //var bottom_right = glMatrix.vec3.create();

        var d = 1.0;//distance to plane

        var E = this.position;
        glMatrix.vec3.add(T, this.position, this.forward);//T = this.position + this.forward;
        var m = this.height;
        var k = this.width;
        var w = this.up;

        //pre calculations
        glMatrix.vec3.copy(t, this.forward);//t = T - E;//t should be same as forward
        //t = T - E;//this should be same as forward
        glMatrix.vec3.normalize(t_n, t);//t_n should be same as forward
        glMatrix.vec3.copy(b, this.right);//b should be the same as right
        glMatrix.vec3.normalize(b_n, b);//b_n should be the same as right
        glMatrix.vec3.normalize(v_n, this.up)//v_n should be the same as up
        var theta_half = this.fov_theta / 2;
        var g_x = d * Math.tan(theta_half * Math.PI / 180.0);//TODO does M_PI work here?
        var g_y = g_x * m / (k * 1.0);//TODO is this correct syntax?

        //uniforms
        glMatrix.vec3.scale(this.q_x, b_n, ((2 * g_x) / (k - 1)));//this.q_x = ((2 * g_x) / (k - 1)) * b_n;
        glMatrix.vec3.scale(this.q_y, v_n, ((2 * g_y) / (m - 1)));//this.q_y = ((2 * g_y) / (m - 1)) * v_n;

        //this.p_1m = t_n * d - g_x * b_n - g_y * v_n;
        //p_1m is the bottom left reference pixel (as a direction relative to E), each other pixel is calculated by moving along the "shift vectors" q_x and q_y.
        var t_n_times_d = glMatrix.vec3.create();
        var g_x_times_b_n = glMatrix.vec3.create();
        var g_y_times_v_n = glMatrix.vec3.create();
        glMatrix.vec3.scale(t_n_times_d, t_n, d);//t_n * d
        glMatrix.vec3.scale(g_x_times_b_n, b_n, g_x);//g_x * b_n
        glMatrix.vec3.scale(g_y_times_v_n, v_n, g_y);//g_y * v_n
        glMatrix.vec3.subtract(this.p_1m, t_n_times_d, g_x_times_b_n);
        glMatrix.vec3.subtract(this.p_1m, this.p_1m, g_y_times_v_n);

        //top_left = t_n * d - g_x * b_n + g_y * v_n;
        //bottom_left = t_n * d - g_x * b_n - g_y * v_n;
        //top_right = t_n * d + g_x * b_n + g_y * v_n;
        //bottom_right = t_n * d + g_x * b_n - g_y * v_n;

        //glMatrix.vec3.cross(this.normal_left, top_left, bottom_left);//normal_left = QVector3D::crossProduct(top_left, bottom_left);
        //glMatrix.vec3.cross(this.normal_right, bottom_right, top_right);//normal_right = QVector3D::crossProduct(bottom_right, top_right);
        //glMatrix.vec3.cross(this.normal_top, top_right, top_left);//normal_top = QVector3D::crossProduct(top_right, top_left);
        //glMatrix.vec3.cross(this.normal_bottom, bottom_left, bottom_right);//normal_bottom = QVector3D::crossProduct(bottom_left, bottom_right);
    }


    someTestFunction4546() {
        console.log("someTestFunction4546")
    }

    someTestFunction8454(x, y) {
        console.log("someTestFunction8454")
        console.log(x, y)
    }

    IsPanningOrForced() {
        return (this.panning || this.panning_forced);
    }

    TogglePanningForced() {
        this.panning_forced = !this.panning_forced;
        this.changed = true;
        this.SetCorrectResolution();
        console.log("this.panning_forced", this.panning_forced);
    }

    StartPanning(x, y, x_canonical, y_canonical, shift, control) {
        //console.log("start panning")
        this.xMouse_old = x;
        this.yMouse_old = y;
        this.xMouse_old_canonical = x_canonical;
        this.yMouse_old_canonical = y_canonical;
        this.panning = true;
        this.changed = true;
        this.paning_shift = shift;
        this.paning_control = control;
        this.SetCorrectResolution();

        //if projection and no control is pressed, instead of doing nothing fall back to shift
        if((!this.allow_panning) && (!this.paning_control)){
            this.paning_shift = true;
        }
    }

    StopPanning() {
        if (!this.panning)
            return;
        //console.log("stop panning")
        this.panning = false;
        this.changed = true;
        this.SetCorrectResolution();
        glMatrix.quat.copy(this.trackball_rot_start_quaternion, this.trackball_rot_quaternion);
    }

    SetCorrectResolution() {
        if (this.panning_forced || this.panning) {
            this.width = this.width_panning;
            this.height = this.height_panning;
        }
        else {
            this.width = this.width_still;
            this.height = this.height_still;
        }
    }

    UpdateMouseMove(x, y, x_canonical, y_canonical, left_handed){
        //check if currently in panning mode
        if (!this.panning)
            return;

        var slow = false;
        var deltaX = x - this.xMouse_old;
        var deltaY = y - this.yMouse_old;

        if(this.paning_shift){
            this.move_left_right(deltaX, slow);
            this.move_up_down(deltaY, slow);
        }
        else if(this.paning_control){
            this.move_forward_backward(deltaY, slow);
        }
        else{
            this.UpdatePanning(x, y, x_canonical, y_canonical, left_handed);
        }

        this.xMouse_old = x;
        this.yMouse_old = y;
    }

    UpdatePanning(x, y, x_canonical, y_canonical, left_handed) {
        if(this.is4D){
            this.UpdatePanning4D(x, y, x_canonical, y_canonical, left_handed);
        }else{
            this.UpdatePanning3D(x, y, x_canonical, y_canonical, left_handed);
        }
    }

    UpdatePanning3D(x, y, x_canonical, y_canonical, left_handed) {
        //check if panning mode is allowed
        if(!this.allow_panning)
            return
        //check if currently in panning mode
        if (!this.panning)
            return;


        if(this.control_mode == CAMERA_CONTROL_ROTATE_AROUND_CAMERA){
            this.UpdatePanningRotateAroundCamera(x, y, left_handed);
        }
        if(this.control_mode == CAMERA_CONTROL_TRACKBALL){
            this.UpdatePanningTrackball(x_canonical, y_canonical, left_handed);
        }
        if(this.control_mode == CAMERA_CONTROL_TRACKBALL2){
            this.UpdatePanningTrackball2(x_canonical, y_canonical, left_handed);
        }
        if(this.control_mode == CAMERA_CONTROL_TRACKBALL3){
            this.UpdatePanningTrackball3(x_canonical, y_canonical, left_handed);
        }        
    }

    UpdatePanning4D(x, y, x_canonical, y_canonical, left_handed) {
        console.warn("UpdatePanning4D not implemented yet"); 
    }

    UpdatePanningRotateAroundCamera(x, y, left_handed) {

        var forward = this.forward;
        var up = this.up;
        var left = glMatrix.vec3.create();
        var right = glMatrix.vec3.create();
        var quaternion = glMatrix.quat.create();
        var quaternion_up = glMatrix.quat.create();
        var quaternion_right = glMatrix.quat.create();

        var FORWARD = glMatrix.vec3.fromValues(0, 0, 1);
        var UP = glMatrix.vec3.fromValues(0, 1, 0);


        var handedness = left_handed ? 1 : -1;
        var invert = true;

        var deltaX = x - this.xMouse_old;
        var deltaY = y - this.yMouse_old;
        if (invert) {
            deltaX *= -1;
            deltaY *= -1;
        }

        deltaY *= handedness;

        glMatrix.vec3.cross(left, forward, up);//left = QVector3D::crossProduct(forward, up);
        glMatrix.vec3.negate(right, left);//right = -left;

        //glMatrix.quat.setAxes(quaternion, forward, right, up);//QQuaternion quaternion = QQuaternion::fromDirection(forward, up);
        glMatrix.quat.setAxisAngle(quaternion_up, up, deltaX * -this.rotationSpeed);//quaternion = QQuaternion::fromAxisAndAngle(up, deltaX * -rotationSpeed) * quaternion;
        glMatrix.quat.setAxisAngle(quaternion_right, right, deltaY * -this.rotationSpeed);//quaternion = QQuaternion::fromAxisAndAngle(right, deltaY * -rotationSpeed) * quaternion;

        glMatrix.quat.multiply(quaternion, quaternion_right, quaternion_up);

        glMatrix.vec3.transformQuat(this.forward, this.forward, quaternion);//forward = quaternion * QVector3D(0,0,1);
        glMatrix.vec3.transformQuat(this.up, this.up, quaternion);//up = quaternion * QVector3D(0,1,0);

        this.xMouse_old = x;
        this.yMouse_old = y;

        this.changed = true;
    }

    UpdatePanningTrackball(x, y, left_handed){
        var r = 0.5;

        //normalize forward and up vectors just to be sure they really are normalized
        glMatrix.vec3.normalize(this.forward, this.forward);
        glMatrix.vec3.normalize(this.up, this.up);

        //calculate focus point
        var forward_scaled = glMatrix.vec3.create();
        var focus_point = glMatrix.vec3.create();
        glMatrix.vec3.scale(forward_scaled, this.forward, this.trackball_focus_distance);
        glMatrix.vec3.add(focus_point, this.position, forward_scaled);

        //move camera so that position of focus point is at origin
        //--> we are now in object space of the focus point
        //the camera has arbitrary rotation but looks at the origin
        var pos_cam = glMatrix.vec3.create();
        glMatrix.vec3.subtract(pos_cam, this.position, focus_point);

        //get the rotation quaternion
        var quaternion = trackball(this.xMouse_old_canonical, this.yMouse_old_canonical, x, y, pos_cam, this.forward, this.up, this.trackball_rotation_sensitivity);
        glMatrix.quat.invert(quaternion, quaternion);

        //two helper points offset by forward and up vector respectively
        var pos_cam_forward = glMatrix.vec3.create();
        var pos_cam_up = glMatrix.vec3.create();
        glMatrix.vec3.add(pos_cam_forward, pos_cam, this.forward);
        glMatrix.vec3.add(pos_cam_up, pos_cam, this.up);

        //rotate the position and two helper points
        glMatrix.vec3.transformQuat(pos_cam, pos_cam, quaternion);
        glMatrix.vec3.transformQuat(pos_cam_forward, pos_cam_forward, quaternion);
        glMatrix.vec3.transformQuat(pos_cam_up, pos_cam_up, quaternion);

        //calculate new forward and up vectors from new position and helper points
        glMatrix.vec3.subtract(this.forward, pos_cam_forward, pos_cam);
        glMatrix.vec3.subtract(this.up, pos_cam_up, pos_cam);

        //normalize forward and up vectors just to be sure they are still normalized
        glMatrix.vec3.normalize(this.forward, this.forward);
        glMatrix.vec3.normalize(this.up, this.up);

        //add the focus point to position
        //--> we are now back in world space
        glMatrix.vec3.add(this.position, pos_cam, focus_point);

        this.xMouse_old_canonical = x;
        this.yMouse_old_canonical = y;
        this.changed = true;

        console.log("DCAM focus_point: ", focus_point)
    }

    InitTracknall2(){
        this.TRACKBALL_F = glMatrix.vec3.fromValues(0,1,0);
        this.TRACKBALL_U = glMatrix.vec3.fromValues(0,0,-1);
        //this.trackball_rot_start_quaternion = getRotationQuaternion(this.TRACKBALL_F, this.TRACKBALL_U);     
        this.trackball_rot_quaternion = glMatrix.quat.create();
        this.trackball_rot_start_quaternion = glMatrix.quat.create();
        glMatrix.quat.identity(this.trackball_rot_start_quaternion);
    }
    
    StartTrackball2(x, y){
        this.xMouse_old_canonical = x;
        this.yMouse_old_canonical = y;
    }
    
    UpdatePanningTrackball2(x, y, left_handed){
        var r = 0.5;
        var offset_vector = glMatrix.vec3.create();
        
        //get the rotation quaternion
        //this.trackball_rot_quaternion = getRotationQuaternion(this.forward, this.up);
        var quaternion = trackball2(this.xMouse_old_canonical, this.yMouse_old_canonical, x, y, this.trackball_rot_quaternion);

        //var mat = glMatrix.mat3.create();
        //glMatrix.mat3.fromQuat(mat, quaternion);
        glMatrix.quat.invert(quaternion, quaternion);
        glMatrix.vec3.transformQuat(this.forward, this.TRACKBALL_F, quaternion);
        glMatrix.vec3.transformQuat(this.up, this.TRACKBALL_U, quaternion);

        var focus_point = glMatrix.vec3.fromValues(0.5, 0.5, 0.5);
        glMatrix.vec3.scale(offset_vector, this.forward, 1.5);
        glMatrix.vec3.subtract(this.position, focus_point, offset_vector);

        //console.log("DCAM focus_point: ", focus_point)
        //console.log("DCAM rot: ", this.trackball_rot_quaternion)
        console.log("DCAM quaternion: ", quaternion)
        //console.log("DCAM mat: ", mat)

        
        glMatrix.quat.copy(this.trackball_rot_quaternion, quaternion);
        //this.xMouse_old_canonical = x;
        //this.yMouse_old_canonical = y;
        this.changed = true;
    }


    UpdatePanningTrackball3(x, y, left_handed){
        var r = 0.5;

        //normalize forward and up vectors just to be sure they really are normalized
        glMatrix.vec3.normalize(this.forward, this.forward);
        glMatrix.vec3.normalize(this.up, this.up);

        //calculate focus point
        var forward_scaled = glMatrix.vec3.create();
        var focus_point = glMatrix.vec3.create();
        glMatrix.vec3.scale(forward_scaled, this.forward, this.trackball_focus_distance);
        glMatrix.vec3.add(focus_point, this.position, forward_scaled);

        //move camera so that position of focus point is at origin
        //--> we are now in object space of the focus point
        //the camera has arbitrary rotation but looks at the origin
        var pos_cam = glMatrix.vec3.create();
        glMatrix.vec3.subtract(pos_cam, this.position, focus_point);

        //get the rotation quaternion
        var quaternion = trackball3(this.xMouse_old_canonical, this.yMouse_old_canonical, x, y, pos_cam, this.forward, this.up, this.trackball_rotation_sensitivity);
        glMatrix.quat.invert(quaternion, quaternion);

        //two helper points offset by forward and up vector respectively
        var pos_cam_forward = glMatrix.vec3.create();
        var pos_cam_up = glMatrix.vec3.create();
        glMatrix.vec3.add(pos_cam_forward, pos_cam, this.forward);
        glMatrix.vec3.add(pos_cam_up, pos_cam, this.up);

        //rotate the position and two helper points
        glMatrix.vec3.transformQuat(pos_cam, pos_cam, quaternion);
        glMatrix.vec3.transformQuat(pos_cam_forward, pos_cam_forward, quaternion);
        glMatrix.vec3.transformQuat(pos_cam_up, pos_cam_up, quaternion);

        //calculate new forward and up vectors from new position and helper points
        glMatrix.vec3.subtract(this.forward, pos_cam_forward, pos_cam);
        glMatrix.vec3.subtract(this.up, pos_cam_up, pos_cam);

        //normalize forward and up vectors just to be sure they are still normalized
        glMatrix.vec3.normalize(this.forward, this.forward);
        glMatrix.vec3.normalize(this.up, this.up);

        //add the focus point to position
        //--> we are now back in world space
        glMatrix.vec3.add(this.position, pos_cam, focus_point);

        this.xMouse_old_canonical = x;
        this.yMouse_old_canonical = y;
        this.changed = true;

        console.log("DCAM focus_point: ", focus_point)
    }

    RollLeft(deltaTime, left_handed) {
        if(this.is4D)
            this.RollLeft4D(deltaTime, left_handed);
        else
            this.RollLeft3D(deltaTime, left_handed);
    }

    RollLeft3D(deltaTime, left_handed) {
        var handedness = left_handed ? 1 : -1;
        var quaternion = glMatrix.quat.create();
        //QQuaternion quaternion = QQuaternion::fromDirection(forward, up);
        glMatrix.quat.setAxisAngle(quaternion, this.forward, deltaTime * this.rollspeed * handedness);//quaternion = QQuaternion::fromAxisAndAngle(forward, deltaTime * -rollSpeed * handedness) * quaternion;
        glMatrix.vec3.transformQuat(this.up, this.up, quaternion);//up = quaternion * QVector3D(0,1,0);
        this.changed = true;
    }

    RollLeft4D(deltaTime, left_handed) {        
        console.warn("RollLeft4D not implemented yet");
    }

    RollRight(deltaTime, left_handed) {
        if(this.is4D)
            this.RollRight4D(deltaTime, left_handed);
        else
            this.RollRight3D(deltaTime, left_handed);
    }

    RollRight3D(deltaTime, left_handed) {
        var handedness = left_handed ? 1 : -1;
        var quaternion = glMatrix.quat.create();
        //QQuaternion quaternion = QQuaternion::fromDirection(forward, up);
        glMatrix.quat.setAxisAngle(quaternion, this.forward, deltaTime * -this.rollspeed * handedness);//quaternion = QQuaternion::fromAxisAndAngle(forward, deltaTime * -rollSpeed * handedness) * quaternion;
        glMatrix.vec3.transformQuat(this.up, this.up, quaternion);//up = quaternion * QVector3D(0,1,0);
        this.changed = true;
    }

    RollRight4D(deltaTime, left_handed) {        
        console.warn("RollRight4D not implemented yet");
    }

    moveLeft(deltaTime, slow) {
        if(this.is4D)
            this.moveLeft4D(deltaTime, slow);
        else
            this.moveLeft3D(deltaTime, slow);
    }

    moveLeft3D(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;

        var left = glMatrix.vec3.create();
        var change = glMatrix.vec3.create();
        glMatrix.vec3.cross(left, this.forward, this.up);
        glMatrix.vec3.normalize(left, left);
        glMatrix.vec3.scale(change, left, (deltaTime * v));
        glMatrix.vec3.add(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveLeft4D(deltaTime, slow) {        
        console.warn("moveLeft4D not implemented yet");
    }

    moveRight(deltaTime, slow) {
        if(this.is4D)
            this.moveRight4D(deltaTime, slow);
        else
            this.moveRight3D(deltaTime, slow);
    }

    moveRight3D(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;

        var left = glMatrix.vec3.create();
        var change = glMatrix.vec3.create();
        glMatrix.vec3.cross(left, this.forward, this.up);
        glMatrix.vec3.normalize(left, left);
        glMatrix.vec3.scale(change, left, (deltaTime * v));
        glMatrix.vec3.subtract(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveRight4D(deltaTime, slow) {        
        console.warn("moveRight4D not implemented yet");
    }

    move_left_right(delta_x, slow) {
        if(this.is4D)
            this.move_left_right4D(delta_x, slow);
        else
            this.move_left_right3D(delta_x, slow);
    }

    move_left_right3D(delta_x, slow){
        var v = slow ? this.trackball_translation_sensitivity : this.trackball_translation_sensitivity;

        var left = glMatrix.vec3.create();
        var change = glMatrix.vec3.create();

        glMatrix.vec3.cross(left, this.forward, this.up);
        glMatrix.vec3.normalize(left, left);
        glMatrix.vec3.scale(change, left, (delta_x * v));
        glMatrix.vec3.add(this.position, this.position, change);

        this.changed = true;
    }

    move_left_right4D(delta_x, slow) {        
        console.warn("move_left_right4D not implemented yet");
    }

    moveForward(deltaTime, slow) {
        if(this.is4D)
            this.moveForward4D(deltaTime, slow);
        else
            this.moveForward3D(deltaTime, slow);
    }

    moveForward3D(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.forward, (deltaTime * v));
        glMatrix.vec3.add(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveForward4D(deltaTime, slow) {        
        console.warn("moveForward4D not implemented yet");
    }

    moveBackward(deltaTime, slow) {
        if(this.is4D)
            this.moveBackward4D(deltaTime, slow);
        else
            this.moveBackward3D(deltaTime, slow);
    }

    moveBackward3D(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.forward, (deltaTime * v));
        glMatrix.vec3.subtract(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveBackward4D(deltaTime, slow) {        
        console.warn("moveBackward4D not implemented yet");
    }

    move_forward_backward(delta_y, slow) {
        if(this.is4D)
            this.move_forward_backward4D(delta_y, slow);
        else
            this.move_forward_backward3D(delta_y, slow);
    }

    move_forward_backward3D(delta_y, slow){
        var v = slow ? this.trackball_translation_sensitivity : this.trackball_translation_sensitivity;

        var change = glMatrix.vec3.create();

        glMatrix.vec3.scale(change, this.forward, (delta_y * v));
        glMatrix.vec3.subtract(this.position, this.position, change);

        this.changed = true;
    }

    move_forward_backward4D(delta_y, slow) {        
        console.warn("move_forward_backward4D not implemented yet");
    }

    move_forward_backward_wheel(delta_y, x, y, slow){
        if(this.is4D)
            this.move_forward_backward_wheel4D(delta_y, x, y, slow);
        else
            this.move_forward_backward_wheel3D(delta_y, x, y, slow);
    }

    move_forward_backward_wheel3D(delta_y, x, y, slow){
        var v = slow ? this.trackball_wheel_sensitivity : this.trackball_wheel_sensitivity;

        var change = glMatrix.vec3.create();

        var direction = this.forward;
        if(true){
            direction = this.generate_ray_direction(x, y)
        }

        glMatrix.vec3.scale(change, direction, (delta_y * v));
        glMatrix.vec3.subtract(this.position, this.position, change);

        this.changed = true;
    }

    move_forward_backward_wheel4D(delta_y, x, y, slow){
        console.warn("move_forward_backward_wheel4D not implemented yet");
    }

    move_forward_to_cursor(deltaTime, slow){
        if(this.is4D){
            this.move_forward_or_backward_cursor4D(deltaTime, slow, -1);
        }else{
            this.move_forward_or_backward_cursor3D(deltaTime, slow, -1);
        }
    }    

    move_backward_from_cursor(deltaTime, slow){
        if(this.is4D){
            this.move_forward_or_backward_cursor4D(deltaTime, slow, 1);
        }else{
            this.move_forward_or_backward_cursor3D(deltaTime, slow, 1);
        }
    }    

    move_forward_or_backward_cursor3D(deltaTime, slow, signum){
        var x = this.last_mouse_position["x"];
        var y = this.last_mouse_position["y"];
        var v = slow ? this.velocity_slow : this.velocity;

        var change = glMatrix.vec3.create();

        var direction = this.forward;
        if(true){
            direction = this.generate_ray_direction(x, y)
        }

        glMatrix.vec3.scale(change, direction, (signum * deltaTime * v));
        glMatrix.vec3.subtract(this.position, this.position, change);

        this.changed = true;  
    }

    move_forward_or_backward_cursor4D(deltaTime, slow, signum){
        console.warn("move_forward_or_backward_cursor4D not implemented yet");
    }

    generate_ray_direction(x, y){
        console.log("generate_ray_direction: ", x, y);
        var p_ij = glMatrix.vec3.create();
        var r_ij = glMatrix.vec3.create();
        var tmp = glMatrix.vec3.create();

        //float i = gl_FragCoord[0];//x
        var i = x;
        //float j = float(height) - gl_FragCoord[1];//y
        var j = y;

        //vec3 p_ij = p_1m + q_x * (i-1.0+x_offset) + q_y * (j-1.0+y_offset);
        glMatrix.vec3.copy(p_ij, this.p_1m);
        glMatrix.vec3.scale(tmp, this.q_x, (i-1));
        glMatrix.vec3.add(p_ij, p_ij, tmp);
        glMatrix.vec3.scale(tmp, this.q_y, (j-1));
        glMatrix.vec3.add(p_ij, p_ij, tmp);

        //vec3 r_ij = normalize(p_ij);
        glMatrix.vec3.normalize(r_ij, p_ij);
        return r_ij;
    }

    moveUp(deltaTime, slow) {
        if(this.is4D)
            this.moveUp4D(deltaTime, slow);
        else
            this.moveUp3D(deltaTime, slow);
    }

    moveUp3D(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.up, (deltaTime * v * handedness));
        glMatrix.vec3.add(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveUp4D(deltaTime, slow) {
        console.warn("moveUp4D not implemented yet");
    }

    moveDown(deltaTime, slow) {
        if(this.is4D)
            this.moveDown4D(deltaTime, slow);
        else
            this.moveDown3D(deltaTime, slow);
    }

    moveDown3D(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.up, (deltaTime * v * handedness));
        glMatrix.vec3.subtract(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveDown4D(deltaTime, slow) {
        console.warn("moveDown4D not implemented yet");
    }

    move_up_down(delta_y, slow) {
        if(this.is4D)
            this.move_up_down4D(delta_y, slow);
        else
            this.move_up_down3D(delta_y, slow);
    }

    move_up_down3D(delta_y, slow){
        var v = slow ? this.trackball_translation_sensitivity : this.trackball_translation_sensitivity;
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.up, (delta_y * v * handedness));
        glMatrix.vec3.add(this.position, this.position, change);

        this.changed = true;
    }

    move_up_down4D(delta_y, slow) {        
        console.warn("move_up_down4D not implemented yet");
    }

    repositionCamera(is_projection, projection_index, allow_default) {
        if(this.is4D){
            //do nothing yet
        }
        else{
            if (is_projection) {
                this.repositionCameraProjection(projection_index);
            }
            else if (allow_default) {
                this.repositionCameraDefault();
            }
        }
    }

    repositionCameraDefault() {
        for (var i = 0; i < 3; i++) {
            if (this.position[i] > 1.0) {
                var change = Math.floor( Math.abs(this.position[i]))
                this.position[i] -= change;
            }
            else if (this.position[i] < 0.0) {
                var change = Math.ceil( Math.abs(this.position[i]))
                this.position[i] += change;
            }
        }
    }

    repositionCameraProjection(projection_index) {
        for (var i = 0; i < 3; i++) {
            if (i == projection_index) {
                this.position[i] = Math.max(this.position[i], 0.01)
            }
            /*
            else {
                if (this.position[i] > 1.0) {
                    var change = Math.floor( Math.abs(this.position[i]))
                    this.position[i] -= change;
                }
                else if (this.position[i] < 0.0) {
                    var change = Math.ceil( Math.abs(this.position[i]))
                    this.position[i] += change;
                }
            }
            */
        }
    }

    loadState(state_name_new, save_old_state) {
        if (save_old_state)
            this.saveCurrentState();

        var state_new = this.states[state_name_new];
        glMatrix.vec4.copy(this.forward, state_new.forward);
        glMatrix.vec4.copy(this.up, state_new.up);
        glMatrix.vec4.copy(this.right, state_new.right);
        glMatrix.vec4.copy(this.position, state_new.position);
        this.allow_panning = state_new.allow_panning;

        this.current_state_name = state_name_new;
        console.log("loadState: ", this.current_state_name);
        console.log(this.current_state_name, "forward", this.states[this.current_state_name].forward);
        console.log(this.current_state_name, "up", this.states[this.current_state_name].up);
        console.log(this.current_state_name, "right", this.states[this.current_state_name].right);
        console.log(this.current_state_name, "position", this.states[this.current_state_name].position);

    }

    saveCurrentState() {
        var state_old = this.states[this.current_state_name];
        glMatrix.vec4.copy(state_old.forward, this.forward);
        glMatrix.vec4.copy(state_old.up, this.up);
        glMatrix.vec4.copy(state_old.right, this.right);
        glMatrix.vec4.copy(state_old.position, this.position);
        console.log("saveCurrentState: ", this.current_state_name);
        console.log(this.current_state_name, "forward", this.states[this.current_state_name].forward);
        console.log(this.current_state_name, "up", this.states[this.current_state_name].up);
        console.log(this.current_state_name, "right", this.states[this.current_state_name].right);
        console.log(this.current_state_name, "position", this.states[this.current_state_name].position);
    }
      
    //order: right, up, forward
    SetOrientation_Yneg_Zpos_Xpos() {
        if(!this.allow_panning)
            return;
        var focus_point = this.CalculateFocusPoint();

        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(1, epsilon, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);

        if(this.control_mode != CAMERA_CONTROL_ROTATE_AROUND_CAMERA)
            this.position = this.CalculatePositionFromFocus(focus_point);
        this.changed = true;
    }
    
    //order: right, up, forward
    SetOrientation_Ypos_Zpos_Xneg() {
        if(!this.allow_panning)
            return;
        var focus_point = this.CalculateFocusPoint();

        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(-1, epsilon, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);

        if(this.control_mode != CAMERA_CONTROL_ROTATE_AROUND_CAMERA)
            this.position = this.CalculatePositionFromFocus(focus_point);
        this.changed = true;
    }
    
    //order: right, up, forward
    SetOrientation_Xpos_Zpos_Ypos() {
        if(!this.allow_panning)
            return;
        var focus_point = this.CalculateFocusPoint();

        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, 1, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);

        if(this.control_mode != CAMERA_CONTROL_ROTATE_AROUND_CAMERA)
            this.position = this.CalculatePositionFromFocus(focus_point);
        this.changed = true;
    }

    //order: right, up, forward
    SetOrientation_Xneg_Zpos_Yneg() {
        if(!this.allow_panning)
            return;
        var focus_point = this.CalculateFocusPoint();

        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, -1, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);

        if(this.control_mode != CAMERA_CONTROL_ROTATE_AROUND_CAMERA)
            this.position = this.CalculatePositionFromFocus(focus_point);
        this.changed = true;
    }

    //order: right, up, forward
    SetOrientation_Xneg_Ypos_Zpos() {
        if(!this.allow_panning)
            return;
        var focus_point = this.CalculateFocusPoint();

        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        var up_negated = glMatrix.vec3.fromValues(epsilon, 1, epsilon);
        glMatrix.vec3.negate(this.up, up_negated);

        if(this.control_mode != CAMERA_CONTROL_ROTATE_AROUND_CAMERA)
            this.position = this.CalculatePositionFromFocus(focus_point);
        this.changed = true;
    }

    //order: right, up, forward
    SetOrientation_Xpos_Ypos_Zneg() {
        if(!this.allow_panning)
            return;
        var focus_point = this.CalculateFocusPoint();

        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, epsilon, -1);
        var up_negated = glMatrix.vec3.fromValues(epsilon, 1, epsilon);
        glMatrix.vec3.negate(this.up, up_negated);

        if(this.control_mode != CAMERA_CONTROL_ROTATE_AROUND_CAMERA)
            this.position = this.CalculatePositionFromFocus(focus_point);
        this.changed = true;
    }

    CalculateFocusPoint(){
        var forward_scaled = glMatrix.vec3.create();
        var focus_point = glMatrix.vec3.create();
        glMatrix.vec3.scale(forward_scaled, this.forward, this.trackball_focus_distance);
        glMatrix.vec3.add(focus_point, this.position, forward_scaled);
        return focus_point;
    }

    CalculatePositionFromFocus(focus_point){
        var forward_scaled = glMatrix.vec3.create();
        var position = glMatrix.vec3.create();
        glMatrix.vec3.scale(forward_scaled, this.forward, this.trackball_focus_distance);
        glMatrix.vec3.subtract(position, focus_point, forward_scaled);
        return position;
    }

    //set camera focus to (0.5, 0.5, 0.5)
    FocusCenter(){
        //calculate focus point
        var forward_scaled = glMatrix.vec3.create();
        var focus_point = glMatrix.vec3.create();
        var diff = glMatrix.vec3.create();
        glMatrix.vec3.scale(forward_scaled, this.forward, this.trackball_focus_distance);
        glMatrix.vec3.add(focus_point, this.position, forward_scaled);

        var center = glMatrix.vec3.fromValues(0.5, 0.5, 0.5);
        glMatrix.vec3.subtract(diff, focus_point, center);
        glMatrix.vec3.subtract(this.position, this.position, diff);
        this.changed = true;
    }

    SetLastMousePosition(pos){
        this.last_mouse_position = pos;
    }
}

module.exports = Camera;