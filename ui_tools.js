class UiTools{
    constructor() {
        this.button_layout_default_mode = document.getElementById("button_layout_default_mode");
        this.button_layout_edit_mode = document.getElementById("button_layout_edit_mode");
        this.button_layout_main_view = document.getElementById("button_layout_main_view");
        this.button_layout_aux_view = document.getElementById("button_layout_aux_view");

        this.button_layout_default_mode.addEventListener("click", (event) => {
            this.loadLayoutDefaultMode(event);
        });

        this.button_layout_edit_mode.addEventListener("click", (event) => {
            this.loadLayoutEditMode(event);
        });

        this.button_layout_main_view.addEventListener("click", (event) => {
            this.loadLayoutMainView(event);
        });

        this.button_layout_aux_view.addEventListener("click", (event) => {
            this.loadLayoutAuxView(event);
        });
    }

    loadLayoutDefaultMode(){
        this.setCSS("css/layout_default_mode.css");
    }

    loadLayoutEditMode(){
        this.setCSS("css/layout_edit_mode.css");
    }

    loadLayoutMainView(){
        this.setCSS("css/layout_main_view.css");
    }

    loadLayoutAuxView(){
        this.setCSS("css/layout_aux_view.css");
    }

    setCSS(value){
        var sheets = document.getElementsByTagName("link");
        sheets[0].href = value;
        console.log("STYLE:", value)
    }
}