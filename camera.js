class GL_CameraData{
    constructor(){
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

    WriteToUniform(gl, program, uniform_variable_name){
        var location_q_x = gl.getUniformLocation(program, uniform_variable_name+".q_x");
        var location_q_y = gl.getUniformLocation(program, uniform_variable_name+".q_y");
        var location_p_1m = gl.getUniformLocation(program, uniform_variable_name+".p_1m");
        var location_E = gl.getUniformLocation(program, uniform_variable_name+".E");
        var location_forward = gl.getUniformLocation(program, uniform_variable_name+".forward");
        var location_normal_left = gl.getUniformLocation(program, uniform_variable_name+".normal_left");
        var location_normal_right = gl.getUniformLocation(program, uniform_variable_name+".normal_right");
        var location_normal_top = gl.getUniformLocation(program, uniform_variable_name+".normal_top");
        var location_normal_bottom = gl.getUniformLocation(program, uniform_variable_name+".normal_bottom");

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

class Camera{
    /**
     * 
     * @param {string} name the name of the camera
     */
     constructor(name) {
        this.name = name;
        this.height = 0;
        this.width = 0;
        this.left_handed = false;        
        this.velocity_slow = 0.1;
        this.velocity = 1.0;
        this.changed = true;

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

        console.log("Generate camera: "+name);

    }

    GetCameraData(){
        return this.GetCameraDataWithPosition(this.position);
    }

    GetCameraDataWithPosition(eyePosition){
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

    WriteToUniform(gl, program, uniform_variable_name){
        var data = this.GetCameraData();
        data.WriteToUniform(gl, program, uniform_variable_name);
    }

    UpdateShaderValues(){
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
        var g_y = g_x * m / (k*1.0);//TODO is this correct syntax?

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

    UpdatePanning(x, y, left_handed){
        /*
        var handedness = left_handed ? 1 : -1;
        var invert = true;
        if (!panning)
            return;
        var deltaX = x - xMouse_old;
        var deltaY = y - yMouse_old;
        if (invert)
        {
            deltaX *= -1;
            deltaY *= -1;
        }

        deltaY *= handedness;

        //QVector3D right = QVector3D::crossProduct(forward, up);
        QVector3D left = QVector3D::crossProduct(forward, up);
        QVector3D right = -left;
        
        QQuaternion quaternion = QQuaternion::fromDirection(forward, up);
        quaternion = QQuaternion::fromAxisAndAngle(up, deltaX * -rotationSpeed) * quaternion;
        quaternion = QQuaternion::fromAxisAndAngle(right, deltaY * -rotationSpeed) * quaternion;
        forward = quaternion * QVector3D(0,0,1);
        up = quaternion * QVector3D(0,1,0);


        xMouse_old = x;
        yMouse_old = y;
        */
    }

    moveLeft(deltaTime, slow){
        var v = slow ? this.velocity_slow : this.velocity;

        var left = glMatrix.vec3.create();
        var change = glMatrix.vec3.create();
        glMatrix.vec3.cross(left, this.forward, this.up);
        glMatrix.vec3.normalize(left, left);
        glMatrix.vec3.scale(change, left, (deltaTime * v));
        glMatrix.vec3.add(this.position, this.position, change);
        console.log(this.position);

        this.changed = true;
    }

    moveRight(deltaTime, slow){   
        var v = slow ? this.velocity_slow : this.velocity;

        var left = glMatrix.vec3.create();
        var change = glMatrix.vec3.create();
        glMatrix.vec3.cross(left, this.forward, this.up);
        glMatrix.vec3.normalize(left, left);
        glMatrix.vec3.scale(change, left, (deltaTime * v));
        glMatrix.vec3.subtract(this.position, this.position, change);
        console.log(this.position);

        this.changed = true;
    }

    moveForward(deltaTime, slow){
        var v = slow ? this.velocity_slow : this.velocity;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.forward, (deltaTime * v));
        glMatrix.vec3.add(this.position, this.position, change);
        console.log(this.position);

        this.changed = true;
    }

    moveBackward(deltaTime, slow){        
        var v = slow ? this.velocity_slow : this.velocity;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.forward, (deltaTime * v));
        glMatrix.vec3.subtract(this.position, this.position, change);
        console.log(this.position);

        this.changed = true;
    }

    moveUp(deltaTime, slow){
        var v = slow ? this.velocity_slow : this.velocity;
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.up, (deltaTime * v * handedness));
        glMatrix.vec3.add(this.position, this.position, change);
        console.log(this.position);

        this.changed = true;
    }

    moveDown(deltaTime, slow){
        var v = slow ? this.velocity_slow : this.velocity;
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, this.up, (deltaTime * v * handedness));
        glMatrix.vec3.subtract(this.position, this.position, change);
        console.log(this.position);

        this.changed = true;
    }

    repositionCamera(){
        for (var i=0; i<3; i++){
            if (this.position[i] > 1.0){
                this.position[i] -= 1.0;
            }
            else if (this.position[i] < 0.0){
                this.position[i] += 1.0;
            }
        }
    }

}