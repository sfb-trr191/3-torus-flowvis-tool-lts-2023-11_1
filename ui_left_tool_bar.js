
class UISelectedCameraIndicator{

    constructor(){
        this.button_left = document.getElementById("button_select_camera_left");
        this.button_right = document.getElementById("button_select_camera_right");
        this.selected_left = true;
        this.selected_right = false;
    }

    Unselect(){
        this.button_left.className = "camera_unselected";
        this.button_right.className = "camera_unselected";
    }

    SelectLeft(){
        this.selected_left = true;
        this.selected_right = false;
        this.button_left.className = "camera_selected";
        this.button_right.className = "camera_unselected";
    }

    SelectRight(){
        this.selected_left = false;
        this.selected_right = true;
        this.button_left.className = "camera_unselected";
        this.button_right.className = "camera_selected";
    }
}

class UILeftToolBar{

    constructor(main_camera, side_camera){
        this.main_camera = main_camera;
        this.side_camera = side_camera;
        this.ui_selected_camera_indicator = new UISelectedCameraIndicator();
        this.ui_selected_camera_indicator.SelectLeft();
        this.block_all_input = false;

        this.ui_selected_camera_indicator.button_left.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            this.ui_selected_camera_indicator.SelectLeft();
        });
        this.ui_selected_camera_indicator.button_right.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            this.ui_selected_camera_indicator.SelectRight();
        });

        this.button_camera_Yneg_Zpos_Xpos = document.getElementById("button_camera_Yneg_Zpos_Xpos");
        this.button_camera_Yneg_Zpos_Xpos.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            if(this.IsLeftCameraSelected())
                this.main_camera.SetOrientation_Yneg_Zpos_Xpos();
            if(this.IsRightCameraSelected())
                this.side_camera.SetOrientation_Yneg_Zpos_Xpos();
        });

        this.button_camera_Ypos_Zpos_Xneg = document.getElementById("button_camera_Ypos_Zpos_Xneg");
        this.button_camera_Ypos_Zpos_Xneg.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            if(this.IsLeftCameraSelected())
                this.main_camera.SetOrientation_Ypos_Zpos_Xneg();
            if(this.IsRightCameraSelected())
                this.side_camera.SetOrientation_Ypos_Zpos_Xneg();
        });

        this.button_camera_Xpos_Zpos_Ypos = document.getElementById("button_camera_Xpos_Zpos_Ypos");
        this.button_camera_Xpos_Zpos_Ypos.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            if(this.IsLeftCameraSelected())
                this.main_camera.SetOrientation_Xpos_Zpos_Ypos();
            if(this.IsRightCameraSelected())
                this.side_camera.SetOrientation_Xpos_Zpos_Ypos();
        });

        this.button_camera_Xneg_Zpos_Yneg = document.getElementById("button_camera_Xneg_Zpos_Yneg");
        this.button_camera_Xneg_Zpos_Yneg.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            if(this.IsLeftCameraSelected())
                this.main_camera.SetOrientation_Xneg_Zpos_Yneg();
            if(this.IsRightCameraSelected())
                this.side_camera.SetOrientation_Xneg_Zpos_Yneg();
        });

        this.button_camera_Xneg_Ypos_Zpos = document.getElementById("button_camera_Xneg_Ypos_Zpos");
        this.button_camera_Xneg_Ypos_Zpos.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            if(this.IsLeftCameraSelected())
                this.main_camera.SetOrientation_Xneg_Ypos_Zpos();
            if(this.IsRightCameraSelected())
                this.side_camera.SetOrientation_Xneg_Ypos_Zpos();
        });

        this.button_camera_Xpos_Ypos_Zneg = document.getElementById("button_camera_Xpos_Ypos_Zneg");
        this.button_camera_Xpos_Ypos_Zneg.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            if(this.IsLeftCameraSelected())
                this.main_camera.SetOrientation_Xpos_Ypos_Zneg();
            if(this.IsRightCameraSelected())
                this.side_camera.SetOrientation_Xpos_Ypos_Zneg();
        });

        this.button_focus_center = document.getElementById("button_focus_center");
        this.button_focus_center.addEventListener("mousedown", (event) => {
            if(this.block_all_input){
                return;
            }
            if(this.IsLeftCameraSelected())
                this.main_camera.FocusCenter();
            if(this.IsRightCameraSelected())
                this.side_camera.FocusCenter();
        });
    }   

    IsLeftCameraSelected(){
        return this.ui_selected_camera_indicator.selected_left;
    }

    IsRightCameraSelected(){
        return this.ui_selected_camera_indicator.selected_right;
    }

    DeactivateInput(){
        this.block_all_input = true;
    }

    ActivateInput(){
        this.block_all_input = false;
    }
}

module.exports = UILeftToolBar;