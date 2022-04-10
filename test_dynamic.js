class Dynamic{
    constructor() {
        
        this.parent_of_1_is_a = true;
        this.node_children_a = document.getElementById("node_children_a");
        this.node_children_b = document.getElementById("node_children_b");
        this.button_1 = document.getElementById("button_1");
        this.button_2 = document.getElementById("button_2");
        this.button_move = document.getElementById("button_move");

        this.button_1.addEventListener("click", (event) => {
            this.printButton1(event);
        });

        this.button_2.addEventListener("click", (event) => {
            this.printButton2(event);
        });

        this.button_move.addEventListener("click", (event) => {
            this.moveButton(event);
        });
    }

    printButton1(){
        console.log("------------------------------");
        console.log("Button 1");
    }

    printButton2(){
        console.log("------------------------------");
        console.log("Button 2");
    }

    moveButton(){
        console.log("------------------------------");
        console.log("Move Button 1");   
        if(this.parent_of_1_is_a){
            console.log("current paret is A");   
            this.node_children_b.appendChild(this.button_1);
            this.parent_of_1_is_a = false;
            console.log("new paret is B");   
        }
        else{
            console.log("current paret is B");   
            this.node_children_a.appendChild(this.button_1);
            this.parent_of_1_is_a = true;
            console.log("new paret is A");   

        }
    }



}