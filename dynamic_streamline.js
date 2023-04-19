const glMatrix = require("gl-matrix");
const UnitCubeTranslator = require("./unit_cube_translator");

class DynamicStreamline {

    constructor() {
        this.position = glMatrix.vec4.fromValues(0, 0, 0, 0);
        this.linked_element_input_dynamic_position_x = document.getElementById("input_dynamic_position_x");
        this.linked_element_input_dynamic_position_y = document.getElementById("input_dynamic_position_y");
        this.linked_element_input_dynamic_position_z = document.getElementById("input_dynamic_position_z");
        this.linked_element_input_dynamic_position_w = document.getElementById("input_dynamic_position_w");

        this.left_handed = false;
        this.xMouse_old = -1;
        this.yMouse_old = -1;
        
        this.changed = false;
    }

    LinkAndCompleteInitialization(streamline_context_dynamic){
        //this.streamline_context_dynamic = streamline_context_dynamic;
        this.unit_cube_translator = new UnitCubeTranslator(streamline_context_dynamic);
    }

    fromUI(){
        this.position = glMatrix.vec4.fromValues(
            parseFloat(this.linked_element_input_dynamic_position_x.value),
            parseFloat(this.linked_element_input_dynamic_position_y.value),
            parseFloat(this.linked_element_input_dynamic_position_z.value),
            parseFloat(this.linked_element_input_dynamic_position_w.value),)
    }

    toUI(){
        var decimals = 6;
        this.linked_element_input_dynamic_position_x.value = this.position[0].toFixed(decimals);
        this.linked_element_input_dynamic_position_y.value = this.position[1].toFixed(decimals);
        this.linked_element_input_dynamic_position_z.value = this.position[2].toFixed(decimals);
        this.linked_element_input_dynamic_position_w.value = this.position[3].toFixed(decimals);
    }

    StartPanning(x, y, x_canonical, y_canonical, shift, control) {
        console.warn("start panning")
        this.xMouse_old = x;
        this.yMouse_old = y;
        this.xMouse_old_canonical = x_canonical;
        this.yMouse_old_canonical = y_canonical;
        this.panning = true;
        this.paning_shift = shift;
        this.paning_control = control;
        //this.SetCorrectResolution();

        //if projection and no control is pressed, instead of doing nothing fall back to shift
        //if((!this.allow_panning) && (!this.paning_control)){
        //    this.paning_shift = true;
        //}
    }

    StopPanning() {
        if (!this.panning)
            return;
        console.warn("stop panning")
        this.panning = false;
    }

    repositionDefault() {
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



    UpdateMouseMove(camera, x, y, x_canonical, y_canonical, left_handed){
        //check if currently in panning mode
        if (!this.panning)
            return;
        this.changed = true;

        console.warn("UpdateMouseMove")

        var slow = false;
        var deltaX = x - this.xMouse_old;
        var deltaY = y - this.yMouse_old;

        if(this.paning_shift){
            this.move_left_right(camera, deltaX, slow);
            this.move_up_down(camera, deltaY, slow);
        }
        else if(this.paning_control){
            this.move_forward_backward(camera, deltaY, slow);
        }

        this.xMouse_old = x;
        this.yMouse_old = y;
    }

    move_left_right(camera, delta_x, slow) {
        /*
        if(this.is4D){
            if (this.draw_mode == DRAW_MODE_S3){
                this.moveLeftRight_S3(delta_x, slow);
            }
            else if (this.draw_mode == DRAW_MODE_R4){
                this.moveLeftRight_R4(delta_x, slow);
            }
        }
        else
        */
            this.move_left_right3D(camera, delta_x, slow);
    }

    move_left_right3D(camera, delta_x, slow){
        //var v = slow ? this.trackball_translation_sensitivity : this.trackball_translation_sensitivity;
        var v = -0.1

        var left = glMatrix.vec3.create();
        var change = glMatrix.vec3.create();

        glMatrix.vec3.cross(left, camera.forward, camera.up);
        glMatrix.vec3.normalize(left, left);
        glMatrix.vec3.scale(change, left, (delta_x * v));
        glMatrix.vec3.add(this.position, this.position, change);

        this.changed = true;
    }

    move_up_down(camera, delta_y, slow) {
        /*
        if(this.is4D){
            if (this.draw_mode == DRAW_MODE_S3){
                this.moveUpDown_S3(delta_y, slow);
            }
            else if (this.draw_mode == DRAW_MODE_R4){
                this.moveUpDown_R4(delta_y, slow);
            }
        }
        else
        */
            this.move_up_down3D(camera, delta_y, slow);
    }

    move_up_down3D(camera, delta_y, slow){
        //var v = slow ? this.trackball_translation_sensitivity : this.trackball_translation_sensitivity;
        var v = -0.1
        var handedness = this.left_handed ? 1 : -1;

        var change = glMatrix.vec3.create();
        glMatrix.vec3.scale(change, camera.up, (delta_y * v * handedness));
        glMatrix.vec3.add(this.position, this.position, change);

    }

    move_forward_backward(camera, delta_y, slow) {
        /*
        if(this.is4D){
            if (this.draw_mode == DRAW_MODE_S3){
                this.moveForwardBackward_S3(delta_y, slow);
            }
            else if (this.draw_mode == DRAW_MODE_R4){
                this.moveForwardBackward_R4(delta_y, slow);
            }
        }
        else
        */
        this.move_forward_backward3D(camera, delta_y, slow);
    }

    move_forward_backward3D(camera, delta_y, slow){
        //var v = slow ? this.trackball_translation_sensitivity : this.trackball_translation_sensitivity;
        var v = 0.1

        //var change = glMatrix.vec3.create();
        //glMatrix.vec3.scale(change, camera.forward, (delta_y * v));
        //glMatrix.vec3.subtract(this.position, this.position, change);

        var change = glMatrix.vec3.create();
        var direction = glMatrix.vec3.create();
        var best_translated_camera_point = this.unit_cube_translator.SelectCopyWithSmallestDistance(this.position, camera.forward, camera.position);

        glMatrix.vec3.subtract(direction, this.position, best_translated_camera_point);
        glMatrix.vec3.normalize(direction, direction);
        glMatrix.vec3.scale(change, direction, (delta_y * v));
        glMatrix.vec3.subtract(this.position, this.position, change);
        
    }

    move_forward_backward_wheel(camera, delta_y, x, y, slow){
        /*
        if(this.is4D){
            if (this.draw_mode == DRAW_MODE_S3){
                this.move_forward_backward_wheelS3(delta_y, x, y, slow);
            }
            else if (this.draw_mode == DRAW_MODE_R4){
                this.move_forward_backward_wheelR4(delta_y, x, y, slow);
            }
        }
        else
        */
        this.move_forward_backward_wheel3D(camera, delta_y, x, y, slow);
    }

    move_forward_backward_wheel3D(camera, delta_y, x, y, slow){        
        //var v = slow ? this.trackball_wheel_sensitivity : this.trackball_wheel_sensitivity;
        this.changed = true;
        var v = 0.00025;

        var change = glMatrix.vec3.create();
        var direction = glMatrix.vec3.create();
        //var best_translated_camera_point = this.unit_cube_translator.SelectCopyWithSmallestAngle(this.position, camera.forward, camera.position);
        var best_translated_camera_point = this.unit_cube_translator.SelectCopyWithSmallestDistance(this.position, camera.forward, camera.position);
        
        glMatrix.vec3.subtract(direction, this.position, best_translated_camera_point);
        glMatrix.vec3.normalize(direction, direction);
        glMatrix.vec3.scale(change, direction, (delta_y * v));
        glMatrix.vec3.subtract(this.position, this.position, change);
    }
}


module.exports = DynamicStreamline;