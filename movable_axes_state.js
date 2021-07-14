const glMatrix = require("gl-matrix");
const module_gl_matrix_extensions = require("./gl_matrix_extensions");
const vec4fromvec3 = module_gl_matrix_extensions.vec4fromvec3;

class MovableAxesState {

    camera_position = glMatrix.vec3.create();//QVector3D
    camera_forward = glMatrix.vec3.create();//QVector3D
    camera_up = glMatrix.vec3.create();//QVector3D
    camera_right = glMatrix.vec3.create();//QVector3D

    camera_p_1m = glMatrix.vec3.create();//QVector3D
    camera_q_x = glMatrix.vec3.create();//QVector3D
    camera_q_y = glMatrix.vec3.create();//QVector3D

    pyramid_bottom_left = glMatrix.vec3.create();//QVector3D
    pyramid_bottom_right = glMatrix.vec3.create();//QVector3D
    pyramid_top_left = glMatrix.vec3.create();//QVector3D
    pyramid_top_right = glMatrix.vec3.create();//QVector3D

    width = 0;//int
    height = 0;//int

    axes_offset_forward = 0.0;//float
    axes_offset_up = 0.0;;//float
    axes_offset_right = 0.0;;//float

    dirty = true;//bool
    position_a = glMatrix.vec3.create();//QVector3D

    SetCameraData(camera_position, camera_forward, camera_up,
        camera_p_1m, camera_q_x, camera_q_y) {
        if (!glMatrix.vec3.equals(this.camera_position, camera_position)) {
            this.dirty = true;
            glMatrix.vec3.copy(this.camera_position, camera_position);
        }
        if (!glMatrix.vec3.equals(this.camera_forward, camera_forward)) {
            this.dirty = true;
            glMatrix.vec3.copy(this.camera_forward, camera_forward);
        }
        if (!glMatrix.vec3.equals(this.camera_up, camera_up)) {
            this.dirty = true;
            glMatrix.vec3.copy(this.camera_up, camera_up);
        }
        if (!glMatrix.vec3.equals(this.camera_p_1m, camera_p_1m)) {
            this.dirty = true;
            glMatrix.vec3.copy(this.camera_p_1m, camera_p_1m);
        }
        if (!glMatrix.vec3.equals(this.camera_q_x, camera_q_x)) {
            this.dirty = true;
            glMatrix.vec3.copy(this.camera_q_x, camera_q_x);
        }
        if (!glMatrix.vec3.equals(this.camera_q_y, camera_q_y)) {
            this.dirty = true;
            glMatrix.vec3.copy(this.camera_q_y, camera_q_y);
        }

        glMatrix.vec3.cross(this.camera_right, this.camera_forward, this.camera_up);
        glMatrix.vec3.normalize(this.camera_right, this.camera_right);
        glMatrix.vec3.negate(this.camera_right, this.camera_right);
    }

    SetSettings(axes_offset_forward, axes_offset_up, axes_offset_right) {
        if (this.axes_offset_forward != axes_offset_forward) {
            this.dirty = true;
            this.axes_offset_forward = axes_offset_forward;
        }
        if (this.axes_offset_up != axes_offset_up) {
            this.dirty = true;
            this.axes_offset_up = axes_offset_up;
        }
        if (this.axes_offset_right != axes_offset_right) {
            this.dirty = true;
            this.axes_offset_right = axes_offset_right;
        }
    }

    SetDimensions(width, height) {
        if (this.width != width) {
            this.dirty = true;
            this.width = width;
        }
        if (this.height != height) {
            this.dirty = true;
            this.height = height;
        }
    }

    Update(cylinder0, cylinder1, cylinder2) {
        this.dirty = false;

        var position_a = glMatrix.vec3.create();
        var forward = glMatrix.vec3.create();
        var up = glMatrix.vec3.create();
        var right = glMatrix.vec3.create();

        glMatrix.vec3.scale(forward, this.camera_forward, this.axes_offset_forward);
        glMatrix.vec3.scale(up, this.camera_up, this.axes_offset_up);
        glMatrix.vec3.scale(right, this.camera_right, this.axes_offset_right);

        glMatrix.vec3.add(position_a, this.camera_position, forward);
        glMatrix.vec3.add(position_a, position_a, up);
        glMatrix.vec3.add(position_a, position_a, right);

        var radius = 0.01;
        var length = 0.25;

        var v_x = glMatrix.vec3.fromValues(length, 0, 0);
        var v_y = glMatrix.vec3.fromValues(0, length, 0);
        var v_z = glMatrix.vec3.fromValues(0, 0, length);

        var position_a_v_x = glMatrix.vec3.create();//position_a + v_x
        var position_a_v_y = glMatrix.vec3.create();//position_a + v_y
        var position_a_v_z = glMatrix.vec3.create();//position_a + v_z

        glMatrix.vec3.add(position_a_v_x, position_a, v_x);
        glMatrix.vec3.add(position_a_v_y, position_a, v_y);
        glMatrix.vec3.add(position_a_v_z, position_a, v_z);

        cylinder0.position_a = vec4fromvec3(position_a, 1);
        cylinder0.position_b = vec4fromvec3(position_a_v_x, 1);

        cylinder1.position_a = vec4fromvec3(position_a, 1);
        cylinder1.position_b = vec4fromvec3(position_a_v_y, 1);

        cylinder2.position_a = vec4fromvec3(position_a, 1);
        cylinder2.position_b = vec4fromvec3(position_a_v_z, 1);

        console.log("DEBUG_CENTER", position_a);
    }
    /*
    UpdateWithRotation(Cylinder & cylinder0, Cylinder & cylinder1, Cylinder & cylinder2) {
        //TODO: check for right handed coordinates (currently only left handed tested)

        dirty = false;

        position_a = camera_position;

        var radius = 0.01;
        var length = 0.25;
        QVector3D v_forward = camera_position + camera_forward.normalized() * length;
        QVector3D v_up = camera_position + camera_up.normalized() * length;
        QVector3D v_right = camera_position + camera_right.normalized() * length;

        cylinder0.gl_cylinder.position_a = QVector4D(position_a, 1);
        cylinder0.gl_cylinder.position_b = QVector4D(v_right, 1);

        cylinder1.gl_cylinder.position_a = QVector4D(position_a, 1);
        cylinder1.gl_cylinder.position_b = QVector4D(v_up, 1);

        cylinder2.gl_cylinder.position_a = QVector4D(position_a, 1);
        cylinder2.gl_cylinder.position_b = QVector4D(v_forward, 1);
    }
    */
    /*    
    UpdateTriangles(Triangle & triangleTop, Triangle & triangleBottom,
        Triangle & triangleLeft, Triangle & triangleRight,
        Triangle & triangleFarA, Triangle & triangleFarB) {
        float range = 3;

        QVector3D E = camera_position;
        QVector3D p_1m = camera_p_1m;
        QVector3D q_x = camera_q_x;
        QVector3D q_y = camera_q_y;

        float i = 0;//x
        float j = 0;//y
        QVector3D p_ij = p_1m + q_x * (i - 1) + q_y * (j - 1);
        QVector3D r_ij = p_ij.normalized();
        pyramid_bottom_left = E + r_ij * range;

        i = width;//x
        j = 0;//y
        p_ij = p_1m + q_x * (i - 1) + q_y * (j - 1);
        r_ij = p_ij.normalized();
        pyramid_bottom_right = E + r_ij * range;

        i = 0;//x
        j = height;//y
        p_ij = p_1m + q_x * (i - 1) + q_y * (j - 1);
        r_ij = p_ij.normalized();
        pyramid_top_left = E + r_ij * range;

        i = width;//x
        j = height;//y
        p_ij = p_1m + q_x * (i - 1) + q_y * (j - 1);
        r_ij = p_ij.normalized();
        pyramid_top_right = E + r_ij * range;


        triangleTop.gl_triangle.v0 = E;
        triangleTop.gl_triangle.v1 = QVector4D(pyramid_top_left, 0);
        triangleTop.gl_triangle.v2 = QVector4D(pyramid_top_right, 0);

        triangleBottom.gl_triangle.v0 = E;
        triangleBottom.gl_triangle.v1 = QVector4D(pyramid_bottom_right, 0);
        triangleBottom.gl_triangle.v2 = QVector4D(pyramid_bottom_left, 0);

        triangleLeft.gl_triangle.v0 = E;
        triangleLeft.gl_triangle.v1 = QVector4D(pyramid_bottom_left, 0);
        triangleLeft.gl_triangle.v2 = QVector4D(pyramid_top_left, 0);

        triangleRight.gl_triangle.v0 = E;
        triangleRight.gl_triangle.v1 = QVector4D(pyramid_top_right, 0);
        triangleRight.gl_triangle.v2 = QVector4D(pyramid_bottom_right, 0);

        triangleFarA.gl_triangle.v0 = QVector4D(pyramid_top_left, 0);
        triangleFarA.gl_triangle.v1 = QVector4D(pyramid_bottom_left, 0);
        triangleFarA.gl_triangle.v2 = QVector4D(pyramid_top_right, 0);

        triangleFarB.gl_triangle.v0 = QVector4D(pyramid_bottom_right, 0);
        triangleFarB.gl_triangle.v1 = QVector4D(pyramid_top_right, 0);
        triangleFarB.gl_triangle.v2 = QVector4D(pyramid_bottom_left, 0);
    }
    */
    /*
    UpdatePyramidCylinders(
        cylinder0, cylinder1, cylinder2, cylinder3,
        cylinder4, cylinder5, cylinder6, cylinder7) {
        //TODO: check for right handed coordinates (currently only left handed tested)

        // camera <--> far plane

        cylinder0.gl_cylinder.position_a = QVector4D(camera_position, 1);
        cylinder0.gl_cylinder.position_b = QVector4D(pyramid_bottom_left, 1);

        cylinder1.gl_cylinder.position_a = QVector4D(camera_position, 1);
        cylinder1.gl_cylinder.position_b = QVector4D(pyramid_bottom_right, 1);

        cylinder2.gl_cylinder.position_a = QVector4D(camera_position, 1);
        cylinder2.gl_cylinder.position_b = QVector4D(pyramid_top_left, 1);

        cylinder3.gl_cylinder.position_a = QVector4D(camera_position, 1);
        cylinder3.gl_cylinder.position_b = QVector4D(pyramid_top_right, 1);

        // far plane <--> far plane

        cylinder4.gl_cylinder.position_a = QVector4D(pyramid_bottom_left, 1);
        cylinder4.gl_cylinder.position_b = QVector4D(pyramid_bottom_right, 1);

        cylinder5.gl_cylinder.position_a = QVector4D(pyramid_bottom_right, 1);
        cylinder5.gl_cylinder.position_b = QVector4D(pyramid_top_right, 1);

        cylinder6.gl_cylinder.position_a = QVector4D(pyramid_top_right, 1);
        cylinder6.gl_cylinder.position_b = QVector4D(pyramid_top_left, 1);

        cylinder7.gl_cylinder.position_a = QVector4D(pyramid_top_left, 1);
        cylinder7.gl_cylinder.position_b = QVector4D(pyramid_bottom_left, 1);
    }
    */
};

module.exports = MovableAxesState;