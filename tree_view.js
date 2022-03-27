class TreeViewNode {
    constructor(tree_view, name, has_eye) {
        this.tree_view = tree_view;
        this.name = name;
        this.has_eye = has_eye;
        this.level = 0;
        this.parent = null;
        this.list_children = [];

        this.eye_enabled = true;
        this.eye_enabled_in_hierarchy = true;//only true if eye_enabled and all ancestors have eye_enabled
        this.show_children = true;
        this.selected = false;
        
        this.node = document.createElement("div");
        this.node.className = "tree_view_node";

        this.node_header = document.createElement("div");
        this.node_header.className = "tree_view_header";
        this.node.appendChild(this.node_header);
        this.node_header.addEventListener("click", (event) => {
            this.onSelect();
        });

        this.node_header_content = document.createElement("div");
        this.node_header_content.className = "tree_view_header_content0";
        this.node_header.appendChild(this.node_header_content);

        this.node_children = document.createElement("div");
        this.node_children.className = "tree_view_children";   
        this.node.appendChild(this.node_children);     

        //header content
        if(has_eye){
            this.node_header_content_button_visibility = document.createElement("button");
            this.node_header_content_button_visibility.className = "button_eye_enabled";
            this.node_header_content.appendChild(this.node_header_content_button_visibility);     

            this.node_header_content_button_visibility.addEventListener("click", (event) => {
                this.toggleEnabled();
            });
        }
        else{
            this.node_header_content_spacing_no_eye = document.createElement("label");
            this.node_header_content_spacing_no_eye.innerText = "";
            this.node_header_content.appendChild(this.node_header_content_spacing_no_eye);   

        }

        this.node_header_content_spacing = document.createElement("label");
        this.node_header_content_spacing.innerText = "";
        this.node_header_content.appendChild(this.node_header_content_spacing);   

        this.node_header_content_button_children = document.createElement("button");
        this.node_header_content.appendChild(this.node_header_content_button_children);   
        this.node_header_content_button_children.addEventListener("click", (event) => {
            this.toggleCollapse();
        });

        this.node_header_content_name = document.createElement("label");
        this.node_header_content_name.innerText = name;
        this.node_header_content.appendChild(this.node_header_content_name);   

        /*
        this.node_header_content_selection_marker = document.createElement("div");
        this.node_header_content_selection_marker.className = "tree_node_selection_marker";
        this.node_header_content.appendChild(this.node_header_content_selection_marker);  
        */
    }

    addChild(child) {
        this.node_children.appendChild(child.node);  
        this.list_children.push(child); 
        child.setLevel(this.level+1);  
        child.setParent(this); 
    }

    setLevel(level){
        this.level = level;
    }

    setParent(parent){
        this.parent = parent;
    }

    toggleEnabled(){
        this.eye_enabled = !this.eye_enabled;
        this.tree_view.onEyeChanged();
    }

    updateEyeState(){
        if(!this.has_eye){
            return;
        }
        this.updateEyeInHierarchy();
        this.updateEyeIcon();
    }

    updateEyeInHierarchy(){
        var parent = this.parent;
        this.eye_enabled_in_hierarchy = this.eye_enabled;
        while(true){
            //stop when no more parent
            if(parent === null){
                return;
            }
            //if any parent is disabled, the child is disabled
            if(!parent.eye_enabled){
                this.eye_enabled_in_hierarchy = false;
                return;
            }
            parent = parent.parent;
        }
    }

    updateEyeIcon(){
        if(this.eye_enabled){
            if(this.eye_enabled_in_hierarchy){            
                this.node_header_content_button_visibility.className = "button_eye_enabled";
            }
            else{
                this.node_header_content_button_visibility.className = "button_eye_disabled_by_parent";
            }
        }
        else{
            this.node_header_content_button_visibility.className = "button_eye_disabled";
        }
    }

    toggleCollapse(){
        this.show_children = !this.show_children;
        this.updateCollapseState();
    }

    updateCollapseState(){
        if(this.list_children.length == 0){
            this.node_header_content_button_children.className = "button_children_none";
        }
        else{
            if(this.show_children){
                this.node_header_content_button_children.className = "button_children_show";
                this.node_children.className = "tree_view_children";
            }
            else{
                this.node_header_content_button_children.className = "button_children_hide";
                this.node_children.className = "hidden";
            }
        }
        this.updateHeaderClass();
    }

    updateHeaderClass(){   
        var is_leaf = this.list_children.length == 0;     
        if(is_leaf){
            //this.node_header_content.className = "tree_view_header_content"+this.level+"_leaf";
            this.node_header_content.className = "tree_view_header_content"+this.level;
        }
        else{
            this.node_header_content.className = "tree_view_header_content"+this.level;
        }

        if(this.selected){
            this.node_header.className = "tree_view_header_selected";
        }
        else{
            this.node_header.className = "tree_view_header";
        }
        
    }

    onSelect(){
        this.tree_view.deselect();
        this.selected = true;
        this.tree_view.updateHeaderClass();
    }
}

class TreeView{
    constructor() {
        this.element = document.getElementById("container_tree_view_nodes");
        this.list_nodes = [];
        this.generateNodes();
        this.updateCollapseState();
    }

    generateNodes() {
        var EYE = true;
        var NO_EYE = false;

        var node_root = this.generateNode(this, "Root", NO_EYE);
        var node_data = this.generateNode(this, "Data", NO_EYE);
        var node_equations = this.generateNode(this, "Equations", NO_EYE);
        var node_streamline_calculation = this.generateNode(this, "Streamline Calculation", NO_EYE);
        var node_ftle_calculation = this.generateNode(this, "FTLE Calculation", NO_EYE);
        var node_lights = this.generateNode(this, "Lights", NO_EYE);

        var node_main_scene = this.generateNode(this, "Main View", NO_EYE);
        var node_main_camera = this.generateNode(this, "Camera", NO_EYE);
        var node_main_visual_objects = this.generateNode(this, "Visual Objects", EYE);
        var node_main_streamlines = this.generateNode(this, "Streamlines", EYE);
        var node_main_ftle = this.generateNode(this, "FTLE Volume", EYE);
        var node_main_indicators = this.generateNode(this, "Indicators", EYE);
        var node_main_bounding_axes = this.generateNode(this, "Bounding Axes", EYE);
        var node_main_top_right_axes = this.generateNode(this, "Top Right Axes", EYE);
        var node_main_clicked_position = this.generateNode(this, "Clicked Position", EYE);
        var node_main_seeds = this.generateNode(this, "Seeds", EYE);

        var node_aux_scene = this.generateNode(this, "Aux View", NO_EYE);
        var node_aux_camera = this.generateNode(this, "Camera", NO_EYE);
        var node_aux_visual_objects = this.generateNode(this, "Visual Objects", EYE);
        var node_aux_streamlines = this.generateNode(this, "Streamlines", EYE);
        var node_aux_ftle = this.generateNode(this, "FTLE Volume", EYE);
        var node_aux_indicators = this.generateNode(this, "Indicators", EYE);
        var node_aux_bounding_axes = this.generateNode(this, "Bounding Axes", EYE);
        var node_aux_top_right_axes = this.generateNode(this, "Top Right Axes", EYE);
        var node_aux_clicked_position = this.generateNode(this, "Clicked Position", EYE);
        var node_aux_seeds = this.generateNode(this, "Seeds", EYE);        

        this.element.appendChild(node_root.node);

        node_root.addChild(node_data);        
        node_data.addChild(node_equations);
        node_data.addChild(node_streamline_calculation);
        node_data.addChild(node_ftle_calculation);
        node_root.addChild(node_lights);
        node_root.addChild(node_main_scene);        
        node_main_scene.addChild(node_main_camera);
        node_main_scene.addChild(node_main_visual_objects);
        node_main_visual_objects.addChild(node_main_streamlines);
        node_main_visual_objects.addChild(node_main_ftle);
        node_main_visual_objects.addChild(node_main_indicators);
        node_main_indicators.addChild(node_main_bounding_axes);
        node_main_indicators.addChild(node_main_top_right_axes);
        node_main_indicators.addChild(node_main_clicked_position);
        node_main_indicators.addChild(node_main_seeds);
        node_root.addChild(node_aux_scene);  
        node_aux_scene.addChild(node_aux_camera);
        node_aux_scene.addChild(node_aux_visual_objects);
        node_aux_visual_objects.addChild(node_aux_streamlines);
        node_aux_visual_objects.addChild(node_aux_ftle);
        node_aux_visual_objects.addChild(node_aux_indicators);
        node_aux_indicators.addChild(node_aux_bounding_axes);
        node_aux_indicators.addChild(node_aux_top_right_axes);
        node_aux_indicators.addChild(node_aux_clicked_position);
        node_aux_indicators.addChild(node_aux_seeds);
        
        
    }  

    generateNode(tree_view, name, has_eye){
        var node = new TreeViewNode(tree_view, name, has_eye);
        this.list_nodes.push(node);
        return node;
    }

    onEyeChanged(){
        for(var i=0; i<this.list_nodes.length; i++){
            this.list_nodes[i].updateEyeState();
        }
    }

    updateCollapseState(){
        for(var i=0; i<this.list_nodes.length; i++){
            this.list_nodes[i].updateCollapseState();
        }
    }

    updateHeaderClass(){
        for(var i=0; i<this.list_nodes.length; i++){
            this.list_nodes[i].updateHeaderClass();
        }
    }

    deselect(){
        for(var i=0; i<this.list_nodes.length; i++){
            this.list_nodes[i].selected = false;
        }
    }
}