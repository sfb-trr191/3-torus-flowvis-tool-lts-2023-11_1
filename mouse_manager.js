const module_utility = require("./utility");
const getMousePositionPercentage = module_utility.getMousePositionPercentage;
const getMousePositionCanonical = module_utility.getMousePositionCanonical;
const getMousePosition = module_utility.getMousePosition;

class MouseManager {

    constructor(canvas, camera, side_canvas, side_camera) {
        this.canvas = canvas;
        this.camera = camera;
        this.side_canvas = side_canvas;
        this.side_camera = side_camera;
        this.active_camera = camera;
        this.block_all_input = false;
    }

    initialize() {
        console.log("initialize mouse manager");
        this.addOnMouseDown();
        this.addOnMouseUp();
        this.addOnMouseMove();
        this.addOnMouseEnter();
        this.addOnMouseOut();
        this.addOnMouseWheel();
    }

    DeactivateInput(){
        this.block_all_input = true;
    }

    ActivateInput(){
        this.block_all_input = false;
    }

    addOnMouseDown() {
        this.canvas.addEventListener("mousedown", (event) => {
            this.onMouseDown(event, this.canvas, this.camera, this.side_camera);
        });
        this.side_canvas.addEventListener("mousedown", (event) => {
            this.onMouseDown(event, this.side_canvas, this.side_camera, this.camera);
        });
    }

    onMouseDown(event, canvas, camera, other_camera){
        if(this.block_all_input){
            return;
        }
        var shift_pressed = event.getModifierState("Shift");
        var ctrl_pressed = event.getModifierState("Control");
        var pos_percentage = getMousePositionPercentage(canvas, event)
        var pos_canonical = getMousePositionCanonical(canvas, event);
        console.log("pos_canonical", pos_canonical.x, pos_canonical.y);
        switch (event.which) {
            case 1:
                //Left Mouse button
                shift_pressed = event.getModifierState("Shift");
                ctrl_pressed = event.getModifierState("Control");
                break;
            case 2:
                //Middle Mouse button
                shift_pressed = true;
                ctrl_pressed = false;
                break;
            case 3:
                //Right Mouse button
                shift_pressed = false;
                ctrl_pressed = true;
                break;
            default:
                //unsupported button
                return;
        } 
        camera.StartPanning(pos_percentage.x, pos_percentage.y, pos_canonical.x, pos_canonical.y, shift_pressed, ctrl_pressed);
        this.active_camera = camera;
        other_camera.other_camera_is_panning = true;   
    }

    addOnMouseUp() {
        document.addEventListener("mouseup", (event) => {
            if(this.block_all_input){
                return;
            }
            this.camera.StopPanning();
            this.side_camera.StopPanning();
            this.camera.other_camera_is_panning = false;
            this.side_camera.other_camera_is_panning = false;
        });
    }

    addOnMouseEnter() {
        this.canvas.addEventListener("mouseenter", (event) => {
            this.camera.mouse_in_canvas = true;
        });
        this.side_canvas.addEventListener("mouseenter", (event) => {
            this.side_camera.mouse_in_canvas = true;
        });
    }

    addOnMouseOut() {
        this.canvas.addEventListener("mouseout", (event) => {
            this.camera.mouse_in_canvas = false;
        });
        this.side_canvas.addEventListener("mouseout", (event) => {
            this.side_camera.mouse_in_canvas = false;
        });
    }

    addOnMouseMove() {
        document.addEventListener("mousemove", (event) => {
            if(this.block_all_input){
                return;
            }

            var pos = getMousePosition(this.canvas, event);
            var pos_percentage = getMousePositionPercentage(this.canvas, event)
            var pos_canonical = getMousePositionCanonical(this.canvas, event);
            this.camera.UpdateMouseMove(pos_percentage.x, pos_percentage.y, pos_canonical.x, pos_canonical.y, false);
            this.camera.SetLastMousePosition(pos);

            var pos = getMousePosition(this.side_canvas, event);
            var pos_percentage = getMousePositionPercentage(this.side_canvas, event)
            var pos_canonical = getMousePositionCanonical(this.side_canvas, event);
            this.side_camera.UpdateMouseMove(pos_percentage.x, pos_percentage.y, pos_canonical.x, pos_canonical.y, false);
            this.side_camera.SetLastMousePosition(pos);
        });
    }

    addOnMouseWheel() {
        this.canvas.addEventListener("wheel", (event) => {
            this.onMouseWheel(event, this.canvas, this.camera, this.side_camera);
        });
        this.side_canvas.addEventListener("wheel", (event) => {
            this.onMouseWheel(event, this.side_canvas, this.side_camera, this.camera);
        });
    }

    onMouseWheel(event, canvas, camera, other_camera){
        if(this.block_all_input){
            return;
        }
        var slow = false;
        var pos = getMousePosition(canvas, event);
        camera.move_forward_backward_wheel(event.deltaY, pos.x, pos.y, slow);
    }

    /**
     * Called at the beginning of every update tick.
     * 
     */
    on_update() {

    }
}


module.exports = MouseManager;