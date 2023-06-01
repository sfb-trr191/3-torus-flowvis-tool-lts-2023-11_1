class ExampleManager {
    constructor() {
        this.block_all_input = false;     
        this.InitButtons();   
    }

    Link(hide_manager){
        this.hide_manager = hide_manager;
    }

    DeactivateInput(){
        this.block_all_input = true;
    }

    ActivateInput(){
        this.block_all_input = false;
    }

    InitButtons(){
        document.getElementById("button_open_dialog_load").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            document.getElementById("wrapper_dialog_load_field").className = "wrapper";
        });
        document.getElementById("button_dialog_load_cancel").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            document.getElementById("wrapper_dialog_load_field").className = "hidden";
        });

        document.getElementById("fieldset_load_magnetic_field").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetMagneticField");
            this.SetMagneticField();
        });

        document.getElementById("fieldset_load_double_pndulum").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetMagneticField");
            this.SetDoublePendulum();
        });
        
        document.getElementById("fieldset_load_example_1").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetExample1");
            this.SetExample1();
        });

        document.getElementById("fieldset_load_example_2").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetExample2");
            this.SetExample2();
        });

        document.getElementById("fieldset_load_example_3").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetExample3");
            this.SetExample3();
        });

        document.getElementById("fieldset_load_example_4").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetExample4");
            this.SetExample4();
        });
        
        document.getElementById("fieldset_load_example_5").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetExample5");
            this.SetExample5();
        });

        document.getElementById("fieldset_load_example_6").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetExample6");
            this.SetExample6();
        });
        
        document.getElementById("fieldset_load_example_7").addEventListener("click", (event) => {
            if(this.block_all_input){
                return;
            }
            console.log("onClickSetExample7");
            this.SetExample7();
        });
    }

    SetMagneticField(){
        document.getElementById("select_space").value = SPACE_3_TORUS;
        this.SetLightTransportLinear();
        this.SetDuplicatorOnce();
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetDoublePendulum(){
        document.getElementById("select_space").value = SPACE_2_PLUS_2D;
        this.SetLightTransportLinear();
        this.SetDuplicatorOnce();
        document.getElementById("input_field_equation_a").value = "sin(4*PI*(x-y)) / (2*(cos(2*PI*(x-y))-2)) * v_x*v_x - sin(2*PI*(x-y)) / (2-cos(2*PI*(x-y))) * v_y*v_y";
        document.getElementById("input_field_equation_b").value = "-2*sin(2*PI*(x-y)) / (2-cos(2*PI*(x-y))) * v_x*v_x - sin(4*PI*(x-y)) / (2*(cos(2*PI*(x-y))-2)) * v_y*v_y";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetExample1(){
        document.getElementById("select_space").value = SPACE_3_TORUS;
        this.SetLightTransportLinear();
        this.SetDuplicatorOnce();
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "0";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetExample2(){
        document.getElementById("select_space").value = SPACE_3_TORUS;
        this.SetLightTransportLinear();
        this.SetDuplicatorOnce();
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "1";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetExample3(){
        document.getElementById("select_space").value = SPACE_3_TORUS;
        this.SetLightTransportLinear();
        this.SetDuplicatorOnce();
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "cos(2 * PI * x)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetExample4(){
        document.getElementById("select_space").value = SPACE_3_TORUS;
        this.SetLightTransportLinear();
        this.SetDuplicatorOnce();
        document.getElementById("input_field_equation_u").value = "cos(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "sin(2 * PI * x) + cos(2 * PI * y)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetExample5(){
        document.getElementById("select_space").value = SPACE_3_TORUS;
        this.SetLightTransportLinear();
        this.SetDuplicatorOnce();
        document.getElementById("input_field_equation_u").value = "2 * sin(2 * PI * z)";
        document.getElementById("input_field_equation_v").value = "sin(2 * PI * y) + 2 * cos (2 * PI * z)";
        document.getElementById("input_field_equation_w").value = "cos(2 * PI * x)";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }
  
    SetExample6(){
        document.getElementById("select_space").value = SPACE_3_SPHERE_4_PLUS_4D;
        this.SetLightTransport3Sphere();
        this.SetDuplicatorOff();
        document.getElementById("input_field_equation_p0").value = "d0";
        document.getElementById("input_field_equation_p1").value = "d1";
        document.getElementById("input_field_equation_p2").value = "d2";
        document.getElementById("input_field_equation_p3").value = "d3";
        document.getElementById("input_field_equation_d0").value = "-p0";
        document.getElementById("input_field_equation_d1").value = "-p1";
        document.getElementById("input_field_equation_d2").value = "-p2";
        document.getElementById("input_field_equation_d3").value = "-p3";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetExample7(){
        document.getElementById("select_space").value = SPACE_3_SPHERE_4_PLUS_4D;
        this.SetLightTransport3Sphere();
        this.SetDuplicatorOff();
        document.getElementById("input_field_equation_parameter_s").value = "0.5";
        document.getElementById("input_field_equation_p0").value = "d0";
        document.getElementById("input_field_equation_p1").value = "d1";
        document.getElementById("input_field_equation_p2").value = "d2";
        document.getElementById("input_field_equation_p3").value = "d3";
        document.getElementById("input_field_equation_d0").value = "-s*d1-(1-s*delta)*p0";
        document.getElementById("input_field_equation_d1").value = "s*d0-(1-s*delta)*p1";
        document.getElementById("input_field_equation_d2").value = "-s*d3-(1-s*delta)*p2";
        document.getElementById("input_field_equation_d3").value = "s*d2-(1-s*delta)*p3";
        document.getElementById("wrapper_dialog_load_field").className = "hidden";
        this.hide_manager.UpdateVisibility();
    }

    SetLightTransport3Sphere(){                
        document.getElementById("select_light_integrator_type").value = LIGHT_INTEGRATOR_RK4;
        document.getElementById("input_field_light_transport_p0").value = "d0";
        document.getElementById("input_field_light_transport_p1").value = "d1";
        document.getElementById("input_field_light_transport_p2").value = "d2";
        document.getElementById("input_field_light_transport_p3").value = "d3";
        document.getElementById("input_field_light_transport_d0").value = "-p0";
        document.getElementById("input_field_light_transport_d1").value = "-p1";
        document.getElementById("input_field_light_transport_d2").value = "-p2";
        document.getElementById("input_field_light_transport_d3").value = "-p3";
    }

    SetLightTransportLinear(){                
        document.getElementById("select_light_integrator_type").value = LIGHT_INTEGRATOR_LINE;
    }

    SetDuplicatorOff(){                
        document.getElementById("segment_duplicator_iterations").value = "0";
    }

    SetDuplicatorOnce(){                
        document.getElementById("segment_duplicator_iterations").value = "1";
    }
}


module.exports = ExampleManager;