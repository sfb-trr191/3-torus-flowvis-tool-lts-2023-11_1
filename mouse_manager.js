class MouseManager {

    constructor(canvas, camera) {
        this.canvas = canvas;
        this.camera = camera;
    }

    initialize() {
        console.log("initialize mouse manager");
        this.addOnMouseDown();
        this.addOnMouseUp();
        this.addOnMouseMove();
        this.addOnMouseOut();
    }

    addOnMouseDown() {
        this.canvas.addEventListener("mousedown", (event) => {
            switch (event.which) {
                case 1:
                    var pos = getMousePositionPercentage(this.canvas, event)
                    //console.log("down", "x: " + pos.x, "y: " + pos.y);
                    this.camera.StartPanning(pos.x, pos.y);
                    break;
                case 2:
                    //Middle Mouse button
                    break;
                case 3:
                    //Right Mouse button
                    break;
            }            
        });
    }

    addOnMouseUp() {
        this.canvas.addEventListener("mouseup", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            //console.log("up", "x: " + pos.x, "y: " + pos.y);
            this.camera.StopPanning();
        });
    }

    addOnMouseOut() {
        this.canvas.addEventListener("mouseout", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            //console.log("out", "x: " + pos.x, "y: " + pos.y);
            this.camera.StopPanning();
            this.camera.mouse_in_canvas = false;
        });
    }

    addOnMouseMove() {
        this.canvas.addEventListener("mousemove", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            this.camera.UpdatePanning(pos.x, pos.y, false);
            this.camera.mouse_in_canvas = true;
        });
    }

    /**
     * Called at the beginning of every update tick.
     * 
     */
    on_update() {

    }
}