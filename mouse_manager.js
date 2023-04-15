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
        this.control_mode = CONTROL_MODE_CAMERA;
    }

    Link(ui_left_tool_bar, canvas_wrapper_main, canvas_wrapper_side){
        this.ui_left_tool_bar = ui_left_tool_bar;
        this.canvas_wrapper_main = canvas_wrapper_main;
        this.canvas_wrapper_side = canvas_wrapper_side;  
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

    SetControlMode(control_mode){
        console.warn("MouseManager control_mode:", control_mode);
        this.control_mode = control_mode
    }

    DeactivateInput(){
        this.block_all_input = true;
    }

    ActivateInput(){
        this.block_all_input = false;
    }

    addOnMouseDown() {
        this.canvas.addEventListener("mousedown", (event) => {
            this.onMouseDown(event, this.canvas, this.camera, this.canvas_wrapper_main, this.side_camera);
            this.ui_left_tool_bar.SelectLeft();
        });
        this.side_canvas.addEventListener("mousedown", (event) => {
            this.onMouseDown(event, this.side_canvas, this.side_camera, this.canvas_wrapper_side, this.camera);
            this.ui_left_tool_bar.SelectRight();
        });
    }

    onMouseDown(event, canvas, camera, canvas_wrapper, other_camera){
        if(this.block_all_input){
            return;
        }
        var shift_pressed = event.getModifierState("Shift");
        var ctrl_pressed = event.getModifierState("Control");
        var pos = getMousePosition(this.canvas, event);
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


        switch(this.control_mode){
            case CONTROL_MODE_CAMERA:
                camera.StartPanning(pos_percentage.x, pos_percentage.y, pos_canonical.x, pos_canonical.y, shift_pressed, ctrl_pressed);
                this.active_camera = camera;
                other_camera.other_camera_is_panning = true;   
                break;
            case CONTROL_MODE_DYNAMIC_STREAMLINE:
                console.warn("mouse_manager:ScheduleClickedPosition")
                canvas_wrapper.ScheduleClickedPosition(this.control_mode);
                break;
            case CONTROL_MODE_SELECT_STREAMLINE:
                console.warn("mouse_manager:ScheduleClickedPosition")
                canvas_wrapper.ScheduleClickedPosition(this.control_mode);
                break;                
            default:
                break;
        }


        //canvas_wrapper.SetOutputPositionPercentage(pos_percentage.x, pos_percentage.y);
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

            var pos_main = getMousePosition(this.canvas, event);
            var pos_percentage_main = getMousePositionPercentage(this.canvas, event);
            var pos_canonical_main = getMousePositionCanonical(this.canvas, event);


            var pos_aux = getMousePosition(this.side_canvas, event);
            var pos_percentage_aux = getMousePositionPercentage(this.side_canvas, event);
            var pos_canonical_aux = getMousePositionCanonical(this.side_canvas, event);

            switch(this.control_mode){
                case CONTROL_MODE_CAMERA:
                    this.camera.UpdateMouseMove(pos_percentage_main.x, pos_percentage_main.y, pos_canonical_main.x, pos_canonical_main.y, false);
                    this.camera.SetLastMousePosition(pos_main);
                    this.canvas_wrapper_main.SetOutputPositionPercentage(pos_percentage_main.x, pos_percentage_main.y);
                    this.side_camera.UpdateMouseMove(pos_percentage_aux.x, pos_percentage_aux.y, pos_canonical_aux.x, pos_canonical_aux.y, false);
                    this.side_camera.SetLastMousePosition(pos_aux);
                    this.canvas_wrapper_side.SetOutputPositionPercentage(pos_percentage_aux.x, pos_percentage_aux.y);
                    break;
                case CONTROL_MODE_DYNAMIC_STREAMLINE:
                    this.canvas_wrapper_main.SetOutputPositionPercentage(pos_percentage_main.x, pos_percentage_main.y);
                    this.canvas_wrapper_side.SetOutputPositionPercentage(pos_percentage_aux.x, pos_percentage_aux.y);
                    break;
                case CONTROL_MODE_SELECT_STREAMLINE:
                    this.canvas_wrapper_main.SetOutputPositionPercentage(pos_percentage_main.x, pos_percentage_main.y);
                    this.canvas_wrapper_side.SetOutputPositionPercentage(pos_percentage_aux.x, pos_percentage_aux.y);
                    break;
                default:
                    break;
            }
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