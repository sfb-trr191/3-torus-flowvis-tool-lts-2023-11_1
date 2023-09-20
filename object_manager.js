const glMatrix = require("gl-matrix");
const module_gl_matrix_extensions = require("./gl_matrix_extensions");
const vec4fromvec3 = module_gl_matrix_extensions.vec4fromvec3;
const MovableAxesState = require("./movable_axes_state");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");

const module_math4D = require("./math4D");
const getAligned4DRotationMatrix = module_math4D.getAligned4DRotationMatrix;

class ObjectManager {

    constructor() {
        this.cylinders = [];
        this.dirty = true;
        this.movable_axes_state_main = new MovableAxesState();
        this.movable_axes_state_side = new MovableAxesState();
        //this.movable_axes_state_main2 = new MovableAxesState();

        var offset_forward_main = 2.0;//dummy
        var offset_forward_side = 2.0;//dummy
        this.movable_axes_state_main.SetSettings(offset_forward_main, 0, 0);
        this.movable_axes_state_side.SetSettings(offset_forward_side, 0, 0);
        //this.movable_axes_state_main2.SetSettings(0, 0, 0);

        this.AddAxes(true);
        this.AddAxes(false);
        this.AddProjectionFrames();
        this.AddAxesSideProjections();
        this.CalculateMatrices();
        console.log("this.cylinders: ", this.cylinders);
        //debugger;
    }

    AddAxes(is_main) {
        var radius = 0.01;
        var position = glMatrix.vec3.fromValues(0.5, 0.5, 0.5);
        var directions = glMatrix.vec3.fromValues(1, 1, 1);
        this.AddAxesCorner(position, directions, false, radius);//main or multi movable axes
        this.AddAxesCorner(position, directions, false, radius);//other camera orientation

        //8 CORNERS
        if (is_main)
            this.INDEX_CYLINDER_FIRST_CUBE_AXES_MAIN = this.cylinders.length;
        else
            this.INDEX_CYLINDER_FIRST_CUBE_AXES_SIDE = this.cylinders.length;

        for (var x = 0; x < 2; x++)
            for (var y = 0; y < 2; y++)
                for (var z = 0; z < 2; z++) {
                    var xx = x == 0 ? 1 : -1;
                    var yy = y == 0 ? 1 : -1;
                    var zz = z == 0 ? 1 : -1;
                    position = glMatrix.vec3.fromValues(x, y, z);
                    directions = glMatrix.vec3.fromValues(xx, yy, zz);
                    this.AddAxesCorner(position, directions, false, radius);
                }

        //FAT ORIGIN AXES
        radius = 0.015;
        position = glMatrix.vec3.fromValues(0, 0, 0);
        directions = glMatrix.vec3.fromValues(1, 1, 1);
        this.AddAxesCorner(position, directions, false, radius);
    }

    AddProjectionFrames() {
        this.INDEX_CYLINDER_FIRST_PROJECTION_FRAME = this.cylinders.length;
        console.log("INDEX_CYLINDER_FIRST_PROJECTION_FRAME: ", this.INDEX_CYLINDER_FIRST_PROJECTION_FRAME);
        this.AddProjectionFrame(
            glMatrix.vec4.fromValues(0, 0, 0, 1),
            glMatrix.vec4.fromValues(0, 1, 0, 1),
            glMatrix.vec4.fromValues(0, 1, 1, 1),
            glMatrix.vec4.fromValues(0, 0, 1, 1)
        );
        this.AddProjectionFrame(
            glMatrix.vec4.fromValues(0, 0, 0, 1),
            glMatrix.vec4.fromValues(1, 0, 0, 1),
            glMatrix.vec4.fromValues(1, 0, 1, 1),
            glMatrix.vec4.fromValues(0, 0, 1, 1)
        );
        this.AddProjectionFrame(
            glMatrix.vec4.fromValues(0, 0, 0, 1),
            glMatrix.vec4.fromValues(1, 0, 0, 1),
            glMatrix.vec4.fromValues(1, 1, 0, 1),
            glMatrix.vec4.fromValues(0, 1, 0, 1)
        );
    }

    AddProjectionFrame(point_1, point_2, point_3, point_4) {
        var radius = 0.01;
        var color = glMatrix.vec4.fromValues(0.75, 0.75, 0.75, 1);

        var cylinder = new Cylinder;
        cylinder.is4D = false;
        cylinder.radius = radius;
        cylinder.position_a = point_1;
        cylinder.position_b = point_2;
        cylinder.color = color;
        this.cylinders.push(cylinder);

        var cylinder = new Cylinder;
        cylinder.is4D = false;
        cylinder.radius = radius;
        cylinder.position_a = point_2;
        cylinder.position_b = point_3;
        cylinder.color = color;
        this.cylinders.push(cylinder);

        var cylinder = new Cylinder;
        cylinder.is4D = false;
        cylinder.radius = radius;
        cylinder.position_a = point_3;
        cylinder.position_b = point_4;
        cylinder.color = color;
        this.cylinders.push(cylinder);

        var cylinder = new Cylinder;
        cylinder.is4D = false;
        cylinder.radius = radius;
        cylinder.position_a = point_4;
        cylinder.position_b = point_1;
        cylinder.color = color;
        this.cylinders.push(cylinder);
    }

    AddAxesSideProjections(){
        this.INDEX_CYLINDER_FIRST_SIDE_PROJECTION = this.cylinders.length;
        console.log("INDEX_CYLINDER_FIRST_SIDE_PROJECTION: ", this.INDEX_CYLINDER_FIRST_SIDE_PROJECTION);
        var RED = glMatrix.vec4.fromValues(1.0, 0.0, 0.0, 1.0);
        var GREEN = glMatrix.vec4.fromValues(0.0, 1.0, 0.0, 1.0);
        var BLUE = glMatrix.vec4.fromValues(0.0, 0.0, 1.0, 1.0);
        var YELLOW = glMatrix.vec4.fromValues(1.0, 1.0, 0.0, 1.0);
        var axis_length = 0.2; 
        var offset = 1.4;


        
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(0, 0, 0, -offset),//position
            glMatrix.vec4.fromValues(0, 1, 0, 0),//dir_1
            glMatrix.vec4.fromValues(0, 0, 1, 0),//dir_2
            glMatrix.vec4.fromValues(0, 0, 0, 1),//dir_3
            axis_length,
            GREEN, BLUE, YELLOW
        ); 
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(-offset, 0, 0, 0),//position
            glMatrix.vec4.fromValues(0, 0, 1, 0),//dir_1
            glMatrix.vec4.fromValues(0, 0, 0, 1),//dir_2
            glMatrix.vec4.fromValues(1, 0, 0, 0),//dir_3
            axis_length,
            BLUE, YELLOW, RED
        );          
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(-offset, 0, 0, 0),//position
            glMatrix.vec4.fromValues(0, 0, 0, 1),//dir_1
            glMatrix.vec4.fromValues(1, 0, 0, 0),//dir_2
            glMatrix.vec4.fromValues(0, 1, 0, 0),//dir_3
            axis_length,
            YELLOW, RED, GREEN
        );   
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(-offset, 0, 0, 0),//position
            glMatrix.vec4.fromValues(1, 0, 0, 0),//dir_1
            glMatrix.vec4.fromValues(0, 1, 0, 0),//dir_2
            glMatrix.vec4.fromValues(0, 0, 1, 0),//dir_3
            axis_length,
            RED, GREEN, BLUE
        );      
         





        axis_length = 2.0;
        /*
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(0, -1, -1, -1),//position
            glMatrix.vec4.fromValues(0, 1, 0, 0),//dir_1
            glMatrix.vec4.fromValues(0, 0, 1, 0),//dir_2
            glMatrix.vec4.fromValues(0, 0, 0, 1),//dir_3
            axis_length,
            GREEN, BLUE, YELLOW
        ); 
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(-1, 0, -1, -1),//position
            glMatrix.vec4.fromValues(0, 0, 1, 0),//dir_1
            glMatrix.vec4.fromValues(0, 0, 0, 1),//dir_2
            glMatrix.vec4.fromValues(1, 0, 0, 0),//dir_3
            axis_length,
            BLUE, YELLOW, RED
        );  
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(-1, -1, 0, -1),//position
            glMatrix.vec4.fromValues(0, 0, 0, 1),//dir_1
            glMatrix.vec4.fromValues(1, 0, 0, 0),//dir_2
            glMatrix.vec4.fromValues(0, 1, 0, 0),//dir_3
            axis_length,
            YELLOW, RED, GREEN
        );   
        this.AddAxesSideProjection(
            glMatrix.vec4.fromValues(-1, -1, -1, 0),//position
            glMatrix.vec4.fromValues(1, 0, 0, 0),//dir_1
            glMatrix.vec4.fromValues(0, 1, 0, 0),//dir_2
            glMatrix.vec4.fromValues(0, 0, 1, 0),//dir_3
            axis_length,
            RED, GREEN, BLUE
        );     
        */  
        //debugger;
    }

    AddAxesSideProjection(position, dir_1, dir_2, dir_3, length, col_1, col_2, col_3){
        var radius = 0.02;
        var color = glMatrix.vec4.fromValues(0.75, 0.75, 0.75, 1);

        var cylinder = new Cylinder;
        var position_b = glMatrix.vec4.create();
        glMatrix.vec4.scaleAndAdd(position_b, position, dir_1, length);
        cylinder.is4D = true;
        cylinder.radius = radius;
        cylinder.position_a = position;
        cylinder.position_b = position_b;
        cylinder.color = col_1;
        this.cylinders.push(cylinder);

        var cylinder = new Cylinder;
        var position_b = glMatrix.vec4.create();
        glMatrix.vec4.scaleAndAdd(position_b, position, dir_2, length);
        cylinder.is4D = true;
        cylinder.radius = radius;
        cylinder.position_a = position;
        cylinder.position_b = position_b;
        cylinder.color = col_2;
        this.cylinders.push(cylinder);

        var cylinder = new Cylinder;
        var position_b = glMatrix.vec4.create();
        glMatrix.vec4.scaleAndAdd(position_b, position, dir_3, length);
        cylinder.is4D = true;
        cylinder.radius = radius;
        cylinder.position_a = position;
        cylinder.position_b = position_b;
        cylinder.color = col_3;
        this.cylinders.push(cylinder);
    }

    SetAxesParameters(cube_axes_radius_main, cube_axes_radius_origin_main,
        cube_axes_length_main, cube_axes_length_origin_main,
        camera_axes_invert_color_main, cube_use_axes_colors_main,
        cube_axes_radius_side, cube_axes_radius_origin_side,
        cube_axes_length_side, cube_axes_length_origin_side,
        camera_axes_invert_color_side, cube_use_axes_colors_side) {
        if (this.cube_axes_radius_main == cube_axes_radius_main
            && this.cube_axes_radius_origin_main == cube_axes_radius_origin_main
            && this.cube_axes_length_main == cube_axes_length_main
            && this.cube_axes_length_origin_main == cube_axes_length_origin_main
            && this.camera_axes_invert_color_main == camera_axes_invert_color_main
            && this.cube_use_axes_colors_main == cube_use_axes_colors_main
            && this.cube_axes_radius_side == cube_axes_radius_side
            && this.cube_axes_radius_origin_side == cube_axes_radius_origin_side
            && this.cube_axes_length_side == cube_axes_length_side
            && this.cube_axes_length_origin_side == cube_axes_length_origin_side
            && this.camera_axes_invert_color_side == camera_axes_invert_color_side
            && this.cube_use_axes_colors_side == cube_use_axes_colors_side)
            return;

        this.cube_axes_radius_main = cube_axes_radius_main;
        this.cube_axes_radius_origin_main = cube_axes_radius_origin_main;
        this.cube_axes_length_main = cube_axes_length_main;
        this.cube_axes_length_origin_main = cube_axes_length_origin_main;
        this.camera_axes_invert_color_main = camera_axes_invert_color_main;
        this.cube_use_axes_colors_main = cube_use_axes_colors_main;

        this.cube_axes_radius_side = cube_axes_radius_side;
        this.cube_axes_radius_origin_side = cube_axes_radius_origin_side;
        this.cube_axes_length_side = cube_axes_length_side;
        this.cube_axes_length_origin_side = cube_axes_length_origin_side;
        this.camera_axes_invert_color_side = camera_axes_invert_color_side;
        this.cube_use_axes_colors_side = cube_use_axes_colors_side;

        this.RecalculateAxes(true, this.INDEX_CYLINDER_FIRST_CUBE_AXES_MAIN, cube_axes_radius_main, cube_axes_radius_origin_main, cube_axes_length_main, cube_axes_length_origin_main);
        this.RecalculateAxes(false, this.INDEX_CYLINDER_FIRST_CUBE_AXES_SIDE, cube_axes_radius_side, cube_axes_radius_origin_side, cube_axes_length_side, cube_axes_length_origin_side);
    }

    RecalculateAxes(is_main, start_index_cube_axes, cube_axes_radius, cube_axes_radius_origin, cube_axes_length, cube_axes_length_origin) {
        var position = glMatrix.vec3.fromValues(0.5, 0.5, 0.5);
        var directions = glMatrix.vec3.fromValues(1, 1, 1);
        //recalculate the dynamic axes
        //for now skipped
        //this.RecalculateAxesCorner(position, directions, false, radius);//main movable axes
        //this.RecalculateAxesCorner(position, directions, false, radius);//multi movable axes
        //this.RecalculateAxesCorner(position, directions, false, radius);//main camera orientation

        //8 CORNERS
        console.log("RecalculateAxes: ", start_index_cube_axes);
        var start_index = start_index_cube_axes;
        var radius = cube_axes_radius;
        var length = cube_axes_length;
        for (var x = 0; x < 2; x++)
            for (var y = 0; y < 2; y++)
                for (var z = 0; z < 2; z++) {
                    var xx = x == 0 ? 1 : -1;
                    var yy = y == 0 ? 1 : -1;
                    var zz = z == 0 ? 1 : -1;
                    position = glMatrix.vec3.fromValues(x, y, z);
                    directions = glMatrix.vec3.fromValues(xx, yy, zz);
                    start_index = this.RecalculateAxesCorner(position, directions, start_index, radius, length);
                }

        //FAT ORIGIN AXES
        radius = cube_axes_radius_origin;
        length = cube_axes_length_origin;
        position = glMatrix.vec3.fromValues(0, 0, 0);
        directions = glMatrix.vec3.fromValues(1, 1, 1);
        start_index = this.RecalculateAxesCorner(position, directions, start_index, radius, length);
    }

    AddAxesCorner(position, directions, invert_color, radius) {
        var length = 0.25;
        var v_x = glMatrix.vec3.fromValues(length, 0, 0);
        var v_y = glMatrix.vec3.fromValues(0, length, 0);
        var v_z = glMatrix.vec3.fromValues(0, 0, length);

        var v_x_scaled = glMatrix.vec3.create();
        var v_y_scaled = glMatrix.vec3.create();
        var v_z_scaled = glMatrix.vec3.create();
        var position_v_x = glMatrix.vec3.create();
        var position_v_y = glMatrix.vec3.create();
        var position_v_z = glMatrix.vec3.create();

        glMatrix.vec3.scale(v_x_scaled, v_x, directions[0]);
        glMatrix.vec3.scale(v_y_scaled, v_y, directions[1]);
        glMatrix.vec3.scale(v_z_scaled, v_z, directions[2]);

        glMatrix.vec3.add(position_v_x, position, v_x_scaled);
        glMatrix.vec3.add(position_v_y, position, v_y_scaled);
        glMatrix.vec3.add(position_v_z, position, v_z_scaled);


        var cylinder = new Cylinder;
        cylinder.is4D = false;
        cylinder.radius = radius;
        cylinder.position_a = vec4fromvec3(position, 1);
        cylinder.position_b = vec4fromvec3(position_v_x, 1);
        cylinder.color = invert_color ? glMatrix.vec4.fromValues(0, 1, 1, 1) : glMatrix.vec4.fromValues(1, 0, 0, 1);
        this.cylinders.push(cylinder);

        var cylinder = new Cylinder;
        cylinder.is4D = false;
        cylinder.radius = radius;
        cylinder.position_a = vec4fromvec3(position, 1);
        cylinder.position_b = vec4fromvec3(position_v_y, 1);
        cylinder.color = invert_color ? glMatrix.vec4.fromValues(1, 0, 1, 1) : glMatrix.vec4.fromValues(0, 1, 0, 1);
        this.cylinders.push(cylinder);

        var cylinder = new Cylinder;
        cylinder.is4D = false;
        cylinder.radius = radius;
        cylinder.position_a = vec4fromvec3(position, 1);
        cylinder.position_b = vec4fromvec3(position_v_z, 1);
        cylinder.color = invert_color ? glMatrix.vec4.fromValues(1, 1, 0, 1) : glMatrix.vec4.fromValues(0, 0, 1, 1);
        this.cylinders.push(cylinder);
    }

    RecalculateAxesCorner(position, directions, start_index, radius, length) {
        var v_x = glMatrix.vec3.fromValues(length, 0, 0);
        var v_y = glMatrix.vec3.fromValues(0, length, 0);
        var v_z = glMatrix.vec3.fromValues(0, 0, length);

        var v_x_scaled = glMatrix.vec3.create();
        var v_y_scaled = glMatrix.vec3.create();
        var v_z_scaled = glMatrix.vec3.create();
        var position_v_x = glMatrix.vec3.create();
        var position_v_y = glMatrix.vec3.create();
        var position_v_z = glMatrix.vec3.create();

        glMatrix.vec3.scale(v_x_scaled, v_x, directions[0]);
        glMatrix.vec3.scale(v_y_scaled, v_y, directions[1]);
        glMatrix.vec3.scale(v_z_scaled, v_z, directions[2]);

        glMatrix.vec3.add(position_v_x, position, v_x_scaled);
        glMatrix.vec3.add(position_v_y, position, v_y_scaled);
        glMatrix.vec3.add(position_v_z, position, v_z_scaled);


        var cylinder = this.cylinders[start_index];
        cylinder.radius = radius;
        cylinder.position_a = vec4fromvec3(position, 1);
        cylinder.position_b = vec4fromvec3(position_v_x, 1);

        var cylinder = this.cylinders[start_index + 1];
        cylinder.radius = radius;
        cylinder.position_a = vec4fromvec3(position, 1);
        cylinder.position_b = vec4fromvec3(position_v_y, 1);

        var cylinder = this.cylinders[start_index + 2];
        cylinder.radius = radius;
        cylinder.position_a = vec4fromvec3(position, 1);
        cylinder.position_b = vec4fromvec3(position_v_z, 1);

        return start_index + 3;
    }

    CalculateMatrices() {
        console.log("CalculateMatrices");
        for (var i = 0; i < this.cylinders.length; i++) {
            var cylinder = this.cylinders[i];
            if(cylinder.is4D){
                this.CalculateMatrix4D(cylinder);
            }
            else{
                this.CalculateMatrix3D(cylinder);
            }
        }
        console.log("CalculateMatrices completed");
    }

    CalculateMatrix3D(cylinder) {

        var matrixTranslation = glMatrix.mat4.create();
        var matrixRotation1 = glMatrix.mat4.create();
        var matrixRotation2 = glMatrix.mat4.create();
        var matrixRotation3 = glMatrix.mat4.create();
        var matrixCombined = glMatrix.mat4.create();
        var matrixInverted = glMatrix.mat4.create();

        var posA_os = glMatrix.vec4.create();
        var posB_os = glMatrix.vec4.create();

        var translation_vector = glMatrix.vec3.create();
        var axis_x = glMatrix.vec3.fromValues(1, 0, 0);
        var axis_y = glMatrix.vec3.fromValues(0, 1, 0);

        //std::cout << "------------------------------" << i << std::endl;
        //std::cout << "SEGMENT: " << i << std::endl;
        //calculate translation matrix
        var posA_ws = cylinder.position_a;//vec4
        var posB_ws = cylinder.position_b;//vec4
        //std::cout << "posA_ws: " << posA_ws.x() << ", " << posA_ws.y() << ", " << posA_ws.z() << std::endl;
        //std::cout << "posB_ws: " << posB_ws.x() << ", " << posB_ws.y() << ", " << posB_ws.z() << std::endl;
        vec3_from_vec4(translation_vector, posA_ws);
        glMatrix.vec3.negate(translation_vector, translation_vector);
        glMatrix.mat4.fromTranslation(matrixTranslation, translation_vector);//matrixTranslation.translate(-1 * posA_ws.toVector3D());

        glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixTranslation);//var posA_os = matrixTranslation * posA_ws;//vec4
        glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixTranslation);//var posB_os = matrixTranslation * posB_ws;//vec4
        //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
        //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;

        //calculate rotation matrix (rotate around y)
        var x = posB_os[0];
        var z = posB_os[2];
        var angle_y_rad = Math.atan2(-x, z);//angleY = (Math.atan2(-x, z)) * 180 / M_PI;
        //std::cout << "angle_y_rad: " << angle_y_rad << std::endl;
        glMatrix.mat4.fromRotation(matrixRotation1, angle_y_rad, axis_y);//matrixRotation1.rotate(angle_y_degree, QVector3D(0, 1, 0));

        //combine matrices
        glMatrix.mat4.multiply(matrixCombined, matrixRotation1, matrixTranslation);//matrixCombined = matrixRotation1 * matrixTranslation;
        glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixCombined);//posA_os = matrixCombined * posA_ws;
        glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixCombined);//posB_os = matrixCombined * posB_ws;
        //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
        //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;

        //calculate rotation matrix (rotate around x)
        var y = posB_os[1];
        z = posB_os[2];
        var angle_x_rad = Math.atan2(y, z);//angleX = (Math.atan2(y, z)) * 180 / M_PI;
        //std::cout << "angle_x_rad: " << angle_x_rad << std::endl;
        glMatrix.mat4.fromRotation(matrixRotation2, angle_x_rad, axis_x);//matrixRotation2.rotate(angle_x_degree, QVector3D(1, 0, 0));

        //combine matrices
        glMatrix.mat4.multiply(matrixCombined, matrixRotation2, matrixCombined);//matrixCombined = matrixRotation2 * matrixRotation1 * matrixTranslation;
        glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixCombined);//posA_os = matrixCombined * posA_ws;
        glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixCombined);//posB_os = matrixCombined * posB_ws;
        //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
        //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;

        if (posB_os[2] < posA_os[2]) {
            glMatrix.mat4.fromRotation(matrixRotation3, Math.PI, axis_x);//rotate.rotate(180, QVector3D(1, 0, 0));
            glMatrix.mat4.multiply(matrixCombined, matrixRotation3, matrixCombined);//matrixCombined = rotate * matrixCombined;
            glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixCombined);//posA_os = matrixCombined * posA_ws;
            glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixCombined);//posB_os = matrixCombined * posB_ws;
            //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
            //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;
        }

        glMatrix.mat4.invert(matrixInverted, matrixCombined);//matrixInverted = matrixCombined.inverted();

        cylinder.matrix = matrixCombined;
        cylinder.matrix_inv = matrixInverted;
        //console.log("posA_os: ", posA_os);
        //console.log("posB_os: ", posB_os);
        /*
        console.log("-----------------: ");
        console.log("matrixCombined: ", matrixCombined);
        console.log("matrixInverted: ", matrixInverted);
        var a = glMatrix.vec4.create();
        var b = glMatrix.vec4.create();
        var a2 = glMatrix.vec4.create();
        var b2 = glMatrix.vec4.create();
        var diff = glMatrix.vec4.create();
        glMatrix.vec4.transformMat4(a, posA_ws, matrixCombined);
        glMatrix.vec4.transformMat4(b, posB_ws, matrixCombined);
        glMatrix.vec4.transformMat4(a2, a, matrixInverted);
        glMatrix.vec4.transformMat4(b2, b, matrixInverted);
        //glMatrix.vec4.subtract(diff, c, a);
        console.log("posA_ws: ", posA_ws);
        console.log("posB_ws: ", posB_ws);
        console.log("posA_os: ", a);
        console.log("posB_os: ", b);
        console.log("posA_2: ", a2);
        console.log("posB_2: ", b2);
        */
    }

    CalculateMatrix4D(cylinder){
        //console.log("CalculateMatrix4D");
        var matrixInverted = glMatrix.mat4.create();
        //var raw_data = this.p_streamline_context.GetRawData(part_index);
        //var vectorLineSegment = this.GetVectorLineSegment(part_index);

        //var lineSegment = vectorLineSegment[segment_index];
        //var indexA = lineSegment.indexA;
        //var indexB = lineSegment.indexB;
        var posA_ws = cylinder.position_a;
        var posB_ws = cylinder.position_b;
        //glMatrix.vec4.copy(posA_ws, raw_data.data[indexA].position);//vec4
        //glMatrix.vec4.copy(posB_ws, raw_data.data[indexB].position);//vec4
        //posA_ws[projection_index] = 0;
        //posB_ws[projection_index] = 0;

        var point_B_translated = glMatrix.vec4.create();
        glMatrix.vec4.subtract(point_B_translated, posB_ws, posA_ws);

        var matrix = getAligned4DRotationMatrix(point_B_translated);
        glMatrix.mat4.invert(matrixInverted, matrix);

        cylinder.matrix = matrix;
        cylinder.matrix_inv = matrixInverted;
    }

    Update() {
        if (this.movable_axes_state_main.dirty) {
            this.movable_axes_state_main.Update(this.cylinders[0], this.cylinders[1], this.cylinders[2]);
            this.dirty = true;
        }
        if (this.movable_axes_state_side.dirty) {
            this.movable_axes_state_side.Update(this.cylinders[33], this.cylinders[34], this.cylinders[35]);
            this.dirty = true;
        }

        if (this.dirty) {
            this.CalculateMatrices();
        }
    }
}

module.exports = ObjectManager;