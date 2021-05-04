class MouseManager{

    constructor(canvas, camera){
        this.canvas = canvas;
        this.camera = camera;
    }

    initialize(){
        console.log("initialize mouse manager");
        this.addOnMouseDown();
        this.addOnMouseUp();
        this.addOnMouseMove();
        this.addOnMouseOut();
    }
     
    addOnMouseDown(){
        this.canvas.addEventListener("mousedown", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            console.log("down", "x: " + pos.x, "y: " + pos.y);
            //console.log(this.camera);
            this.camera.StartPanning(pos.x, pos.y);
            //this.camera.lol();
        });
    }

    addOnMouseUp(){
        this.canvas.addEventListener("mouseup", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            console.log("up", "x: " + pos.x, "y: " + pos.y);
            this.camera.StopPanning();
        });
    }

    addOnMouseOut(){
        this.canvas.addEventListener("mouseout", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            console.log("out", "x: " + pos.x, "y: " + pos.y);
            this.camera.StopPanning();
        });
    }

    addOnMouseMove(){
        this.canvas.addEventListener("mousemove", (event) => {
            var pos = getMousePositionPercentage(this.canvas, event)
            this.camera.UpdatePanning(pos.x, pos.y, false);
        });
    }
        
    /**
     * Called at the beginning of every update tick.
     * 
     */
    on_update(){

    }
}