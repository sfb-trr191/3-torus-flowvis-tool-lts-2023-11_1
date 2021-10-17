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

    addOnMouseDown() {
        this.canvas.addEventListener("mousedown", (event) => {
            this.onMouseDown(event, this.canvas, this.camera, this.side_camera);
        });
        this.side_canvas.addEventListener("mousedown", (event) => {
            this.onMouseDown(event, this.side_canvas, this.side_camera, this.camera);
        });
    }

    onMouseDown(event, canvas, camera, other_camera){
        var shift_pressed = event.getModifierState("Shift");
        var ctrl_pressed = event.getModifierState("Control");
        var pos = getMousePositionPercentage(canvas, event)
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
        camera.StartPanning(pos.x, pos.y, pos_canonical.x, pos_canonical.y, shift_pressed, ctrl_pressed);
        this.active_camera = camera;
        other_camera.other_camera_is_panning = true;   
    }

    addOnMouseUp() {
        /*
        this.canvas.addEventListener("mouseup", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            //console.log("up", "x: " + pos.x, "y: " + pos.y);
            this.camera.StopPanning();
        });
        this.side_canvas.addEventListener("mouseup", (event) => {
            var pos = getMousePositionPercentage(this.side_canvas, event)
            //console.log("up", "x: " + pos.x, "y: " + pos.y);
            this.side_camera.StopPanning();
        });
        */
        document.addEventListener("mouseup", (event) => {
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
            var pos = getMousePositionPercentage(this.canvas, event)
            //console.log("out", "x: " + pos.x, "y: " + pos.y);
            //this.camera.StopPanning();
            this.camera.mouse_in_canvas = false;
        });
        this.side_canvas.addEventListener("mouseout", (event) => {
            var pos = getMousePositionPercentage(this.side_canvas, event)
            //console.log("out", "x: " + pos.x, "y: " + pos.y);
            //this.side_camera.StopPanning();
            this.side_camera.mouse_in_canvas = false;
        });
    }

    addOnMouseMove() {
        /*
        this.canvas.addEventListener("mousemove", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            this.camera.UpdatePanning(pos.x, pos.y, false);
            this.camera.mouse_in_canvas = true;
            this.active_camera = this.camera;
        });
        this.side_canvas.addEventListener("mousemove", (event) => {
            var pos = getMousePositionPercentage(this.side_canvas, event)
            this.side_camera.UpdatePanning(pos.x, pos.y, false);
            this.side_camera.mouse_in_canvas = true;
            this.active_camera = this.side_camera;
        });
        */
        document.addEventListener("mousemove", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            var pos_canonical = getMousePositionCanonical(this.canvas, event);
            this.camera.UpdateMouseMove(pos.x, pos.y, pos_canonical.x, pos_canonical.y, false);
            var pos = getMousePositionPercentage(this.side_canvas, event)
            var pos_canonical = getMousePositionCanonical(this.side_canvas, event);
            this.side_camera.UpdateMouseMove(pos.x, pos.y, pos_canonical.x, pos_canonical.y, false);
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
        var slow = false;
        var pos = getMousePosition(canvas, event)
        camera.move_forward_backward_wheel(event.deltaY, pos.x, pos.y, slow);
        /*
        switch (event.which) {
            case 1:
                var shift_pressed = event.getModifierState("Shift");
                var ctrl_pressed = event.getModifierState("Control");
                var pos = getMousePositionPercentage(canvas, event)
                var pos_canonical = getMousePositionCanonical(canvas, event);
                //console.log("down", "x: " + pos.x, "y: " + pos.y);
                camera.StartPanning(pos.x, pos.y, pos_canonical.x, pos_canonical.y, shift_pressed, ctrl_pressed);
                this.active_camera = camera;
                other_camera.other_camera_is_panning = true;
                break;
            case 2:
                //Middle Mouse button
                break;
            case 3:
                //Right Mouse button
                break;
        }    
        */
    }

    /**
     * Called at the beginning of every update tick.
     * 
     */
    on_update() {

    }
}


module.exports = MouseManager;