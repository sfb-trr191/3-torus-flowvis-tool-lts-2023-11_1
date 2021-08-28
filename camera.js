const glMatrix = require("gl-matrix");
const module_gl_matrix_extensions = require("./gl_matrix_extensions");
const vec4fromvec3 = module_gl_matrix_extensions.vec4fromvec3;

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
        this.forward = glMatrix.vec3.create();
        this.up = glMatrix.vec3.create();
        this.position = glMatrix.vec3.create();
        //unsaved variables
        this.allow_panning = true;
    }

    setProjectionX() {
        this.forward = glMatrix.vec3.fromValues(-1, 0, 0);
        this.up = glMatrix.vec3.fromValues(0, 0, -1);
        this.position = glMatrix.vec3.fromValues(1, 0.5, 0.5);
        this.allow_panning = false;
    }

    setProjectionY() {
        this.forward = glMatrix.vec3.fromValues(0, -1, 0);
        this.up = glMatrix.vec3.fromValues(-1, 0, 0);
        this.position = glMatrix.vec3.fromValues(0.5, 1, 0.5);
        this.allow_panning = false;
    }

    setProjectionZ() {
        this.forward = glMatrix.vec3.fromValues(0, 0, -1);
        this.up = glMatrix.vec3.fromValues(0, -1, 0);
        this.position = glMatrix.vec3.fromValues(0.5, 0.5, 1);
        this.allow_panning = false;
    }

    fromString(s) {
        console.log("CAMERA_STATE ", s);
        if (s === null)
            return;
        console.log("CAMERA_STATE not null");
        if (!s.includes("~"))
            return;

        var split = s.split("~");
        this.position[0] = split[0];
        this.position[1] = split[1];
        this.position[2] = split[2];
        this.forward[0] = split[3];
        this.forward[1] = split[4];
        this.forward[2] = split[5];
        this.up[0] = split[6];
        this.up[1] = split[7];
        this.up[2] = split[8];
    }

    toString() {
        var s = this.position[0] + "~"
            + this.position[1] + "~"
            + this.position[2] + "~"
            + this.forward[0] + "~"
            + this.forward[1] + "~"
            + this.forward[2] + "~"
            + this.up[0] + "~"
            + this.up[1] + "~"
            + this.up[2]
        return s;
    }

}

class Camera {
    /**
     * 
     * @param {string} name the name of the camera
     */
    constructor(name, input_changed_manager) {
        this.name = name;
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

        //panning
        this.allow_panning = true;
        this.panning = false;
        this.panning_forced = false;
        this.xMouse_old = 0;
        this.yMouse_old = 0;
        this.mouse_in_canvas = false;

        //description of the camera for the user
        this.position = glMatrix.vec3.create();
        this.forward = glMatrix.vec3.create();
        this.up = glMatrix.vec3.create();

        //calculated values for raytracing
        this.q_x = glMatrix.vec3.create();
        this.q_y = glMatrix.vec3.create();
        this.p_1m = glMatrix.vec3.create();

        //normals used for the view pyramid
        this.normal_left = glMatrix.vec3.create();
        this.normal_right = glMatrix.vec3.create();
        this.normal_top = glMatrix.vec3.create();
        this.normal_bottom = glMatrix.vec3.create();

        this.states = {};
        this.states["state_default"] = new CameraState();
        this.states["state_projection_x"] = new CameraState();
        this.states["state_projection_y"] = new CameraState();
        this.states["state_projection_z"] = new CameraState();

        this.states["state_projection_x"].setProjectionX();
        this.states["state_projection_y"].setProjectionY();
        this.states["state_projection_z"].setProjectionZ();

        this.current_state_name = "state_default";
    }

    LinkInput(input_camera_position_x, input_camera_position_y, input_camera_position_z,
        input_camera_forward_x, input_camera_forward_y, input_camera_forward_z,
        input_camera_up_x, input_camera_up_y, input_camera_up_z) {

        this.input_camera_position_x = input_camera_position_x;
        this.input_camera_position_y = input_camera_position_y;
        this.input_camera_position_z = input_camera_position_z;

        this.input_camera_forward_x = input_camera_forward_x;
        this.input_camera_forward_y = input_camera_forward_y;
        this.input_camera_forward_z = input_camera_forward_z;

        this.input_camera_up_x = input_camera_up_x;
        this.input_camera_up_y = input_camera_up_y;
        this.input_camera_up_z = input_camera_up_z;
    }

    FromInput() {
        //console.log("FromInput");
        this.position = new_vec3_from_input(this.input_camera_position_x, this.input_camera_position_y, this.input_camera_position_z);
        this.forward = new_vec3_from_input(this.input_camera_forward_x, this.input_camera_forward_y, this.input_camera_forward_z);
        var up_negated = new_vec3_from_input(this.input_camera_up_x, this.input_camera_up_y, this.input_camera_up_z);
        glMatrix.vec3.negate(this.up, up_negated);
        this.changed = true;
    }

    WriteToInputFields() {
        if (!this.changed)
            return;
        //console.log("WriteToInputFields")
        var decimals = 6;
        var up_negated = glMatrix.vec3.create();
        glMatrix.vec3.negate(up_negated, this.up);
        this.input_camera_position_x.value = this.position[0].toFixed(decimals);
        this.input_camera_position_y.value = this.position[1].toFixed(decimals);
        this.input_camera_position_z.value = this.position[2].toFixed(decimals);
        this.input_camera_forward_x.value = this.forward[0].toFixed(decimals);
        this.input_camera_forward_y.value = this.forward[1].toFixed(decimals);
        this.input_camera_forward_z.value = this.forward[2].toFixed(decimals);
        this.input_camera_up_x.value = up_negated[0].toFixed(decimals);
        this.input_camera_up_y.value = up_negated[1].toFixed(decimals);
        this.input_camera_up_z.value = up_negated[2].toFixed(decimals);
        this.input_changed_manager.UpdateDefaultValuesCamera();
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
        this.input_camera_forward_x.value = split[3];
        this.input_camera_forward_y.value = split[4];
        this.input_camera_forward_z.value = split[5];
        this.input_camera_up_x.value = split[6];
        this.input_camera_up_y.value = split[7];
        this.input_camera_up_z.value = split[8];

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
            + this.input_camera_forward_x.value + "~"
            + this.input_camera_forward_y.value + "~"
            + this.input_camera_forward_z.value + "~"
            + this.input_camera_up_x.value + "~"
            + this.input_camera_up_y.value + "~"
            + this.input_camera_up_z.value;
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
        data.q_x = vec4fromvec3(this.q_x, 0);
        data.q_y = vec4fromvec3(this.q_y, 0);
        data.p_1m = vec4fromvec3(this.p_1m, 0);
        data.E = vec4fromvec3(eyePosition, 0);
        data.forward = vec4fromvec3(this.forward, 0);
        data.normal_left = vec4fromvec3(this.normal_left, 0);
        data.normal_right = vec4fromvec3(this.normal_right, 0);
        data.normal_top = vec4fromvec3(this.normal_top, 0);
        data.normal_bottom = vec4fromvec3(this.normal_bottom, 0);
        return data;
    }

    WriteToUniform(gl, program, uniform_variable_name) {
        var data = this.GetCameraData();
        data.WriteToUniform(gl, program, uniform_variable_name);
    }

    UpdateShaderValues() {
        //std::cout << "UpdateShaderValues" << std::endl;
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

        var d = 1.0;//distance to plane

        var E = this.position;
        glMatrix.vec3.add(T, this.position, this.forward);//T = this.position + this.forward;
        var theta = 45.0;//radian instead?
        var m = this.height;
        var k = this.width;
        var w = this.up;

        //pre calculations
        glMatrix.vec3.subtract(t, T, E);//t = T - E;//this should be same as forward
        //t = T - E;//this should be same as forward
        glMatrix.vec3.normalize(t_n, t);//t_n = t.normalized();
        glMatrix.vec3.cross(b, w, t);//b = QVector3D::crossProduct(w, t);
        glMatrix.vec3.normalize(b_n, b);//b_n = b.normalized();
        glMatrix.vec3.cross(v_n, t_n, b_n)//v_n = QVector3D::crossProduct(t_n, b_n);

        var g_x = d * Math.tan(theta * Math.PI / 180.0);//TODO does M_PI work here?
        var g_y = g_x * m / (k * 1.0);//TODO is this correct syntax?

        //uniforms
        glMatrix.vec3.scale(this.q_x, b_n, ((2 * g_x) / (k - 1)));//this.q_x = ((2 * g_x) / (k - 1)) * b_n;
        glMatrix.vec3.scale(this.q_y, v_n, ((2 * g_y) / (m - 1)));//this.q_y = ((2 * g_y) / (m - 1)) * v_n;

        //this.p_1m = t_n * d - g_x * b_n - g_y * v_n;
        var t_n_times_d = glMatrix.vec3.create();
        var g_x_times_b_n = glMatrix.vec3.create();
        var g_y_times_v_n = glMatrix.vec3.create();
        glMatrix.vec3.scale(t_n_times_d, t_n, d);//t_n * d
        glMatrix.vec3.scale(g_x_times_b_n, b_n, g_x);//g_x * b_n
        glMatrix.vec3.scale(g_y_times_v_n, v_n, g_y);//g_y * v_n
        glMatrix.vec3.subtract(this.p_1m, t_n_times_d, g_x_times_b_n);
        glMatrix.vec3.subtract(this.p_1m, this.p_1m, g_y_times_v_n);

        top_left = t_n * d - g_x * b_n + g_y * v_n;
        bottom_left = t_n * d - g_x * b_n - g_y * v_n;
        top_right = t_n * d + g_x * b_n + g_y * v_n;
        bottom_right = t_n * d + g_x * b_n - g_y * v_n;

        glMatrix.vec3.cross(this.normal_left, top_left, bottom_left);//normal_left = QVector3D::crossProduct(top_left, bottom_left);
        glMatrix.vec3.cross(this.normal_right, bottom_right, top_right);//normal_right = QVector3D::crossProduct(bottom_right, top_right);
        glMatrix.vec3.cross(this.normal_top, top_right, top_left);//normal_top = QVector3D::crossProduct(top_right, top_left);
        glMatrix.vec3.cross(this.normal_bottom, bottom_left, bottom_right);//normal_bottom = QVector3D::crossProduct(bottom_left, bottom_right);

        /*
        console.log("position "+this.position);
        console.log("forward "+this.forward);
        console.log("T "+T);
        console.log("t "+t);
        console.log("t_n "+t_n);
        console.log("b "+b);
        console.log("b_n "+b_n);
        console.log("v_n "+v_n);
        console.log("E "+E);
        console.log("q_x "+this.q_x);
        console.log("q_y "+this.q_y);
        console.log("p_1m "+this.p_1m);
        console.log("top_left "+top_left);
        console.log("bottom_left "+bottom_left);
        console.log("top_right "+top_right);
        console.log("bottom_right "+bottom_right);
        console.log("normal_left "+this.normal_left);
        console.log("normal_right "+this.normal_right);
        console.log("normal_top "+this.normal_top);
        console.log("normal_bottom "+this.normal_bottom);

        var out_vector = glMatrix.vec3.create();
        var test_vector = glMatrix.vec3.create();
        test_vector[0] = 0;
        test_vector[1] = 1;
        test_vector[2] = 2;
        vec3_add_scalar(out_vector, test_vector, 0.5);
        console.log("out_vector "+out_vector);
        */
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

    StartPanning(x, y) {
        //console.log("start panning")
        this.xMouse_old = x;
        this.yMouse_old = y;
        this.panning = true;
        this.changed = true;
        this.SetCorrectResolution();
    }

    StopPanning() {
        if (!this.panning)
            return;
        //console.log("stop panning")
        this.panning = false;
        this.changed = true;
        this.SetCorrectResolution();
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

    UpdatePanning(x, y, left_handed) {
        //check if panning mode is allowed
        if(!this.allow_panning)
            return
        //check if currently in panning mode
        if (!this.panning)
            return;
        //console.log("UpdatePanning")

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

    RollLeft(deltaTime, left_handed) {
        var handedness = left_handed ? 1 : -1;
        var quaternion = glMatrix.quat.create();
        //QQuaternion quaternion = QQuaternion::fromDirection(forward, up);
        glMatrix.quat.setAxisAngle(quaternion, this.forward, deltaTime * this.rollspeed * handedness);//quaternion = QQuaternion::fromAxisAndAngle(forward, deltaTime * -rollSpeed * handedness) * quaternion;
        glMatrix.vec3.transformQuat(this.up, this.up, quaternion);//up = quaternion * QVector3D(0,1,0);
        this.changed = true;
    }

    RollRight(deltaTime, left_handed) {
        var handedness = left_handed ? 1 : -1;
        var quaternion = glMatrix.quat.create();
        //QQuaternion quaternion = QQuaternion::fromDirection(forward, up);
        glMatrix.quat.setAxisAngle(quaternion, this.forward, deltaTime * -this.rollspeed * handedness);//quaternion = QQuaternion::fromAxisAndAngle(forward, deltaTime * -rollSpeed * handedness) * quaternion;
        glMatrix.vec3.transformQuat(this.up, this.up, quaternion);//up = quaternion * QVector3D(0,1,0);
        this.changed = true;
    }

    moveLeft(deltaTime, slow) {
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

    moveRight(deltaTime, slow) {
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

    moveForward(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.forward, (deltaTime * v));
        glMatrix.vec3.add(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveBackward(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.forward, (deltaTime * v));
        glMatrix.vec3.subtract(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveUp(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.up, (deltaTime * v * handedness));
        glMatrix.vec3.add(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    moveDown(deltaTime, slow) {
        var v = slow ? this.velocity_slow : this.velocity;
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.up, (deltaTime * v * handedness));
        glMatrix.vec3.subtract(this.position, this.position, change);
        //console.log(this.position);

        this.changed = true;
    }

    repositionCamera(is_projection, projection_index, allow_default) {
        if (is_projection) {
            this.repositionCameraProjection(projection_index);
        }
        else if (allow_default) {
            this.repositionCameraDefault();
        }
    }

    repositionCameraDefault() {
        for (var i = 0; i < 3; i++) {
            if (this.position[i] > 1.0) {
                this.position[i] -= 1.0;
            }
            else if (this.position[i] < 0.0) {
                this.position[i] += 1.0;
            }
        }
    }

    repositionCameraProjection(projection_index) {
        for (var i = 0; i < 3; i++) {
            if (i == projection_index) {
                this.position[i] = Math.max(this.position[i], 0.01)
            }
            else {
                if (this.position[i] > 1.0) {
                    this.position[i] -= 1.0;
                }
                else if (this.position[i] < 0.0) {
                    this.position[i] += 1.0;
                }
            }
        }
    }

    loadState(state_name_new, save_old_state) {
        if (save_old_state)
            this.saveCurrentState();

        var state_new = this.states[state_name_new];
        glMatrix.vec3.copy(this.forward, state_new.forward);
        glMatrix.vec3.copy(this.up, state_new.up);
        glMatrix.vec3.copy(this.position, state_new.position);
        this.allow_panning = state_new.allow_panning;

        this.current_state_name = state_name_new;
        console.log("loadState: ", this.current_state_name);
        console.log(this.current_state_name, "forward", this.states[this.current_state_name].forward);
        console.log(this.current_state_name, "up", this.states[this.current_state_name].up);
        console.log(this.current_state_name, "position", this.states[this.current_state_name].position);

    }

    saveCurrentState() {
        var state_old = this.states[this.current_state_name];
        glMatrix.vec3.copy(state_old.forward, this.forward);
        glMatrix.vec3.copy(state_old.up, this.up);
        glMatrix.vec3.copy(state_old.position, this.position);
        console.log("saveCurrentState: ", this.current_state_name);
        console.log(this.current_state_name, "forward", this.states[this.current_state_name].forward);
        console.log(this.current_state_name, "up", this.states[this.current_state_name].up);
        console.log(this.current_state_name, "position", this.states[this.current_state_name].position);
    }
      
    //order: right, up, forward
    SetOrientation_Yneg_Zpos_Xpos() {
        if(!this.allow_panning)
            return;
        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(1, epsilon, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);
        this.changed = true;
    }
    
    //order: right, up, forward
    SetOrientation_Ypos_Zpos_Xneg() {
        if(!this.allow_panning)
            return;
        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(-1, epsilon, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);
        this.changed = true;
    }
    
    //order: right, up, forward
    SetOrientation_Xpos_Zpos_Ypos() {
        if(!this.allow_panning)
            return;
        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, 1, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);
        this.changed = true;
    }

    //order: right, up, forward
    SetOrientation_Xneg_Zpos_Yneg() {
        if(!this.allow_panning)
            return;
        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, -1, epsilon);
        var up_negated = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        glMatrix.vec3.negate(this.up, up_negated);
        this.changed = true;
    }

    //order: right, up, forward
    SetOrientation_Xneg_Ypos_Zpos() {
        if(!this.allow_panning)
            return;
        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, epsilon, 1);
        var up_negated = glMatrix.vec3.fromValues(epsilon, 1, epsilon);
        glMatrix.vec3.negate(this.up, up_negated);
        this.changed = true;
    }

    //order: right, up, forward
    SetOrientation_Xpos_Ypos_Zneg() {
        if(!this.allow_panning)
            return;
        var epsilon = 0.000001;
        this.forward = glMatrix.vec3.fromValues(epsilon, epsilon, -1);
        var up_negated = glMatrix.vec3.fromValues(epsilon, 1, epsilon);
        glMatrix.vec3.negate(this.up, up_negated);
        this.changed = true;
    }
}

module.exports = Camera;