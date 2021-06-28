class InputManager {

    NUMBER_OF_KEYS = 8;//only continuous keys

    KEY_INDEX_W = 0;
    KEY_INDEX_A = 1;
    KEY_INDEX_S = 2;
    KEY_INDEX_D = 3;
    KEY_INDEX_R = 4;
    KEY_INDEX_F = 5;
    KEY_INDEX_Q = 6;
    KEY_INDEX_E = 7;

    KEY_STATE_INACTIVE = 0;
    KEY_STATE_ACTIVE = 1;

    constructor(main_canvas, main_camera) {
        this.main_canvas = main_canvas;
        this.main_camera = main_camera;
        this.key_states = new Int32Array(this.NUMBER_OF_KEYS);
    }

    initialize() {
        console.log("NUMBER_OF_KEYS " + this.NUMBER_OF_KEYS);

        this.addOnKeyDown();
        this.addOnKeyUp();
        this.addOnFocusOut();
    }

    addOnKeyDown() {
        this.main_canvas.addEventListener("keydown", (event) => {
            if (event.key == 'w')
                this.key_states[this.KEY_INDEX_W] = this.KEY_STATE_ACTIVE;
            if (event.key == 'a')
                this.key_states[this.KEY_INDEX_A] = this.KEY_STATE_ACTIVE;
            if (event.key == 's')
                this.key_states[this.KEY_INDEX_S] = this.KEY_STATE_ACTIVE;
            if (event.key == 'd')
                this.key_states[this.KEY_INDEX_D] = this.KEY_STATE_ACTIVE;
            if (event.key == 'r')
                this.key_states[this.KEY_INDEX_R] = this.KEY_STATE_ACTIVE;
            if (event.key == 'f')
                this.key_states[this.KEY_INDEX_F] = this.KEY_STATE_ACTIVE;
            if (event.key == 'q')
                this.key_states[this.KEY_INDEX_Q] = this.KEY_STATE_ACTIVE;
            if (event.key == 'e')
                this.key_states[this.KEY_INDEX_E] = this.KEY_STATE_ACTIVE;
        });
    }

    addOnKeyUp() {
        this.main_canvas.addEventListener("keyup", (event) => {
            //HANDLING CONTINUOUS KEYS
            if (event.key == 'w')
                this.key_states[this.KEY_INDEX_W] = this.KEY_STATE_INACTIVE;
            if (event.key == 'a')
                this.key_states[this.KEY_INDEX_A] = this.KEY_STATE_INACTIVE;
            if (event.key == 's')
                this.key_states[this.KEY_INDEX_S] = this.KEY_STATE_INACTIVE;
            if (event.key == 'd')
                this.key_states[this.KEY_INDEX_D] = this.KEY_STATE_INACTIVE;
            if (event.key == 'r')
                this.key_states[this.KEY_INDEX_R] = this.KEY_STATE_INACTIVE;
            if (event.key == 'f')
                this.key_states[this.KEY_INDEX_F] = this.KEY_STATE_INACTIVE;
            if (event.key == 'q')
                this.key_states[this.KEY_INDEX_Q] = this.KEY_STATE_INACTIVE;
            if (event.key == 'e')
                this.key_states[this.KEY_INDEX_E] = this.KEY_STATE_INACTIVE;

            //HANDLING NON CONTINUOUS KEYS
            if (event.key == 'p')
                this.main_camera.TogglePanningForced();
        });
    }

    addOnFocusOut() {
        this.main_canvas.addEventListener("focusout", (event) => {
            for (var i = 0; i < this.NUMBER_OF_KEYS; i++)
                this.key_states[i] = this.KEY_STATE_INACTIVE;
        });
    }

    isKeyDown(key_index) {
        return this.key_states[key_index] == this.KEY_STATE_ACTIVE;
    }

    /**
     * Called at the beginning of every update tick.
     * 
     */
    on_update() {

    }
}