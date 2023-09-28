const module_utility = require("./utility");
const getMousePositionPercentage = module_utility.getMousePositionPercentage;
const getMousePositionCanonical = module_utility.getMousePositionCanonical;
const getMousePosition = module_utility.getMousePosition;
const getTouchPositionPercentage = module_utility.getTouchPositionPercentage;
const getTouchPositionCanonical = module_utility.getTouchPositionCanonical;
const getTouchPosition = module_utility.getTouchPosition;

class MouseManager {

    constructor(canvas, camera, side_canvas, side_camera, dynamic_streamline) {
        this.canvas = canvas;
        this.camera = camera;
        this.side_canvas = side_canvas;
        this.side_camera = side_camera;      
        this.active_camera = camera;
        this.block_all_input = false;
        this.control_mode = CONTROL_MODE_CAMERA;
        this.dynamic_streamline = dynamic_streamline;
        this.dynamic_movement_camera_is_main = true;//changed on button down
        this.double_touch_threshold = 700;//in milliseconds
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
        this.canvas.addEventListener("touchstart", (event) => {
            this.dynamic_movement_camera_is_main = true;
            this.onTouchDown(event, this.canvas, this.camera, this.canvas_wrapper_main, this.side_camera);
            this.ui_left_tool_bar.SelectLeft();
            console.warn("touchstart")
        });
        this.side_canvas.addEventListener("touchstart", (event) => {
            this.dynamic_movement_camera_is_main = false;
            this.onTouchDown(event, this.side_canvas, this.side_camera, this.canvas_wrapper_side, this.camera);
            this.ui_left_tool_bar.SelectLeft();
            console.warn("touchstart")
        });

        this.canvas.addEventListener("mousedown", (event) => {
            this.dynamic_movement_camera_is_main = true;
            this.onMouseDown(event, this.canvas, this.camera, this.canvas_wrapper_main, this.side_camera);
            this.ui_left_tool_bar.SelectLeft();
        });
        this.side_canvas.addEventListener("mousedown", (event) => {
            this.dynamic_movement_camera_is_main = false;
            this.onMouseDown(event, this.side_canvas, this.side_camera, this.canvas_wrapper_side, this.camera);
            this.ui_left_tool_bar.SelectRight();
        });
    }

    onMouseDownControlModeCamera(event, canvas, camera, canvas_wrapper, other_camera, shift_pressed, ctrl_pressed, pos_percentage, pos_canonical){    
        camera.StartPanning(pos_percentage.x, pos_percentage.y, pos_canonical.x, pos_canonical.y, shift_pressed, ctrl_pressed);
        this.active_camera = camera;
        other_camera.other_camera_is_panning = true;   
    }

    onMouseDownControlModeDynamic(event, canvas, camera, canvas_wrapper, other_camera, shift_pressed, ctrl_pressed, pos_percentage, pos_canonical){
        if((!shift_pressed) && (!ctrl_pressed)){
            //Left Mouse button
            canvas_wrapper.ScheduleClickedPosition(this.control_mode);
        }
        else{              
            this.dynamic_streamline.StartPanning(pos_percentage.x, pos_percentage.y, pos_canonical.x, pos_canonical.y, shift_pressed, ctrl_pressed);
        }
        
    }

    onMouseDownControlModeSelect(event, canvas, camera, canvas_wrapper, other_camera, shift_pressed, ctrl_pressed, pos_percentage, pos_canonical){
        if((!shift_pressed) && (!ctrl_pressed)){
            //Left Mouse button
            canvas_wrapper.ScheduleClickedPosition(this.control_mode);
        }
        
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
                this.onMouseDownControlModeCamera(event, canvas, camera, canvas_wrapper, other_camera, shift_pressed, ctrl_pressed, pos_percentage, pos_canonical);
                break;
            case CONTROL_MODE_DYNAMIC_STREAMLINE:
                this.onMouseDownControlModeDynamic(event, canvas, camera, canvas_wrapper, other_camera, shift_pressed, ctrl_pressed, pos_percentage, pos_canonical);
                break;
            case CONTROL_MODE_SELECT_STREAMLINE:
                this.onMouseDownControlModeSelect(event, canvas, camera, canvas_wrapper, other_camera, shift_pressed, ctrl_pressed, pos_percentage, pos_canonical);
                break;                
            default:
                break;
        }


        //canvas_wrapper.SetOutputPositionPercentage(pos_percentage.x, pos_percentage.y);
    }

    onTouchDown(event, canvas, camera, canvas_wrapper, other_camera){
        if(this.block_all_input){
            return;
        }
        var shift_pressed = false;//event.getModifierState("Shift");
        var ctrl_pressed = false;//event.getModifierState("Control");
        //var pos = getMousePosition(this.canvas, event);
        var pos = getTouchPosition(this.canvas, event);        
        var pos_percentage = getTouchPositionPercentage(canvas, event)
        var pos_canonical = getTouchPositionCanonical(canvas, event);
        console.log("pos_canonical", pos_canonical.x, pos_canonical.y);

        
        var flag_double_touch = event.timeStamp - canvas_wrapper.last_touch_ms < this.double_touch_threshold;
        if(flag_double_touch){
            console.warn("double touch detected");
            ctrl_pressed = true;
        }

        this.onMouseDownControlModeCamera(event, canvas, camera, canvas_wrapper, other_camera, shift_pressed, ctrl_pressed, pos_percentage, pos_canonical);

        //set time of event to allow double click detection
        canvas_wrapper.last_touch_ms = event.timeStamp;
    }

    addOnMouseUp() {
        document.addEventListener("touchend", (event) => {
            console.warn("touchend")
            if(this.block_all_input){
                return;
            }
            this.camera.StopPanning();
            this.side_camera.StopPanning();
            this.dynamic_streamline.StopPanning();
            this.camera.other_camera_is_panning = false;
            this.side_camera.other_camera_is_panning = false;
        });
        document.addEventListener("mouseup", (event) => {
            if(this.block_all_input){
                return;
            }
            this.camera.StopPanning();
            this.side_camera.StopPanning();
            this.dynamic_streamline.StopPanning();
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
        /*
        this.canvas.addEventListener("touchmove", (event) => {
            //this.dynamic_movement_camera_is_main = true;
            //this.onMouseDown(event, this.canvas, this.camera, this.canvas_wrapper_main, this.side_camera);
            //this.ui_left_tool_bar.SelectLeft();
            console.warn("touchmove")
        });
        */
        document.addEventListener("touchmove", (event) => {
            if(this.block_all_input){
                return;
            }
            console.warn("touchmove")

            var pos_main = getTouchPosition(this.canvas, event);
            var pos_percentage_main = getTouchPositionPercentage(this.canvas, event);
            var pos_canonical_main = getTouchPositionCanonical(this.canvas, event);


            var pos_aux = getTouchPosition(this.side_canvas, event);
            var pos_percentage_aux = getTouchPositionPercentage(this.side_canvas, event);
            var pos_canonical_aux = getTouchPositionCanonical(this.side_canvas, event);

            this.camera.UpdateMouseMove(pos_percentage_main.x, pos_percentage_main.y, pos_canonical_main.x, pos_canonical_main.y, false);
            this.camera.SetLastMousePosition(pos_main);
            this.canvas_wrapper_main.SetOutputPositionPercentage(pos_percentage_main.x, pos_percentage_main.y);
            this.side_camera.UpdateMouseMove(pos_percentage_aux.x, pos_percentage_aux.y, pos_canonical_aux.x, pos_canonical_aux.y, false);
            this.side_camera.SetLastMousePosition(pos_aux);
            this.canvas_wrapper_side.SetOutputPositionPercentage(pos_percentage_aux.x, pos_percentage_aux.y);
        });

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
                    //curretnly using main camera
                    if(this.dynamic_movement_camera_is_main){
                        this.dynamic_streamline.UpdateMouseMove(this.camera, pos_percentage_main.x, pos_percentage_main.y, pos_canonical_main.x, pos_canonical_main.y, false);
                    }else{
                        this.dynamic_streamline.UpdateMouseMove(this.side_camera, pos_percentage_aux.x, pos_percentage_aux.y, pos_canonical_aux.x, pos_canonical_aux.y, false);
                    }
                    this.dynamic_streamline.repositionDefault();
                    this.dynamic_streamline.toUI();
                    //this.camera.SetLastMousePosition(pos_main);
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
            this.onMouseWheel(event, this.canvas, this.canvas_wrapper_main, this.camera, this.side_camera);
        });
        this.side_canvas.addEventListener("wheel", (event) => {
            this.onMouseWheel(event, this.side_canvas, this.canvas_wrapper_side, this.side_camera, this.camera);
        });
    }

    onMouseWheel(event, canvas, canvas_wrapper, camera, other_camera){
        if(this.block_all_input){
            return;
        }
        var slow = false;
        var pos = getMousePosition(canvas, event);
        canvas_wrapper.setRetreiveOnce();

        switch(this.control_mode){
            case CONTROL_MODE_CAMERA:
                camera.move_forward_backward_wheel(event.deltaY, pos.x, pos.y, slow);
                break;
            case CONTROL_MODE_DYNAMIC_STREAMLINE:
                this.dynamic_streamline.move_forward_backward_wheel(this.camera, event.deltaY, pos.x, pos.y, slow);
                this.dynamic_streamline.repositionDefault();
                this.dynamic_streamline.toUI();
                break;
            default:
                break;
        }
    }

    /**
     * Called at the beginning of every update tick.
     * 
     */
    on_update() {

    }
}


module.exports = MouseManager;