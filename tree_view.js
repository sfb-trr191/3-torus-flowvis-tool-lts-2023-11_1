class TreeViewNode {
    constructor(tree_view, name, group_id, has_eye) {
        this.tree_view = tree_view;
        this.name = name;
        this.group_id = group_id;
        this.linked_group_node = document.getElementById(group_id);
        this.linked_children_container_node = this.linked_group_node.querySelector(".group_properties_children");
        this.linked_content_container_node = this.linked_group_node.querySelector(".group_properties_content");        
        this.container_properties_node = document.getElementById("container_properties");
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
            this.onHeaderClicked(event);
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
                event.stopPropagation();
            });
        }
        else{
            this.node_header_content_spacing_no_eye = document.createElement("label");
            this.node_header_content_spacing_no_eye.innerText = "";
            this.node_header_content.appendChild(this.node_header_content_spacing_no_eye);  

        }

        this.node_header_content_spacing = document.createElement("label");
        this.node_header_content_spacing.innerText = "";
        //this.node_header_content_spacing.className = "label_no_select";
        this.node_header_content.appendChild(this.node_header_content_spacing);   

        this.node_header_content_button_children = document.createElement("button");
        this.node_header_content.appendChild(this.node_header_content_button_children);   
        this.node_header_content_button_children.addEventListener("click", (event) => {
            this.toggleCollapse();
            event.stopPropagation();
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

    updateLinkedGroup(){     
        if(this.selected){
            this.linked_group_node.className = "group_properties";
            //only for the root node: always append directly to container
            if(this.parent === null){
                this.container_properties_node.appendChild(this.linked_group_node);
            }
            //all non root nodes: append to either parent or directly to container
            else{
                if(this.parent.selected){
                    this.parent.linked_children_container_node.appendChild(this.linked_group_node);
                }else{
                    this.container_properties_node.appendChild(this.linked_group_node);
                }
            }
            //show/hide content container
            if(this.hasVisibleContent()){
                this.linked_content_container_node.className = "group_properties_content";
            }else{                
                this.linked_content_container_node.className = "hidden";
            }
            //show/hide children container
            if(this.hasSelectedChildren()){
                this.linked_children_container_node.className = "group_properties_children";
            }else{                
                this.linked_children_container_node.className = "hidden";
            }

        }
        else{
            this.linked_group_node.className = "hidden";
        }   
    }

    onHeaderClicked(event){
        var ctrl_pressed = event.getModifierState("Control");
        var shift_pressed = event.getModifierState("Shift");
        if(shift_pressed){
            if(!ctrl_pressed){
                this.tree_view.deselect();
            }
            this.selectWithAllChildren();
        }
        else if(ctrl_pressed){
            this.toggleSelected();
        }
        else{         
            var toggle_state = !this.selected;   
            this.tree_view.deselect();
            this.selected = toggle_state;
        }
        this.tree_view.updateHeaderClass();
        this.tree_view.updateLinkedGroup();
        this.tree_view.updatePropertiesHelp();
    }

    toggleSelected(){
        this.selected = !this.selected;
    }

    selectWithAllChildren(){
        this.selected = true;
        var stack = [];
        for(var i=0; i<this.list_children.length; i++){
            stack.push(this.list_children[i]);
        }
        while(stack.length > 0){            
            var node = stack.pop();
            node.selected = true;
            for(var i=0; i<node.list_children.length; i++){
                stack.push(node.list_children[i]);
            }
        }
        
        this.tree_view.updateHeaderClass();
        this.tree_view.updateLinkedGroup();
    }

    hasSelectedChildren(){
        for(var i=0; i<this.list_children.length; i++){
            if(this.list_children[i].selected)
                return true;            
        }
        return false;
    }

    hasVisibleContent(){        
        for(var i=0; i<this.linked_content_container_node.children.length; i++){
            if(this.linked_content_container_node.children[i].className !== "hidden")
                return true;            
        }
        return false; 
    }
}

class TreeView{
    constructor() {
        this.invisible_container = document.getElementById("invisible_container");
        this.element = document.getElementById("container_tree_view_nodes");
        this.node_help_properties = document.getElementById("help_properties");
        this.list_nodes = [];
        this.generateNodes();
        this.updateCollapseState();
        this.updateLinkedGroup();
        this.updatePropertiesHelp();
    }

    generateNodes() {
        var EYE = true;
        var NO_EYE = false;

        var node_root = this.generateNode(this, "Root", "group_properties_root", NO_EYE);
        var node_data = this.generateNode(this, "Data", "group_properties_root_data", NO_EYE);
        var node_equations = this.generateNode(this, "Equations", "group_properties_root_data_equations", NO_EYE);
        var node_streamline_calculation = this.generateNode(this, "Streamline Calculation", "group_properties_root_data_streamline_calculation", NO_EYE);
        var node_ftle_calculation = this.generateNode(this, "FTLE Calculation", "group_properties_root_data_ftle_calculation", NO_EYE);
        var node_lighting = this.generateNode(this, "Lighting", "group_properties_root_lighting", NO_EYE);
        var node_transfer_functions = this.generateNode(this, "Transfer Functions", "group_properties_root_transfer_functions", NO_EYE);

        var node_main_scene = this.generateNode(this, "Main View", "group_properties_root_main_view", NO_EYE);
        var node_main_camera = this.generateNode(this, "Camera", "group_properties_root_main_view_camera", NO_EYE);
        var node_main_visual_objects = this.generateNode(this, "Visual Objects", "group_properties_root_main_view_visual_objects", EYE);
        var node_main_streamlines = this.generateNode(this, "Streamlines", "group_properties_root_main_view_visual_objects_streamlines", EYE);
        var node_main_ftle = this.generateNode(this, "FTLE Volume", "group_properties_root_main_view_visual_objects_ftle_volume", EYE);
        var node_main_indicators = this.generateNode(this, "Indicators", "group_properties_root_main_view_visual_objects_indicators", EYE);
        var node_main_bounding_axes = this.generateNode(this, "Bounding Axes", "group_properties_root_main_view_visual_objects_indicators_bounding_axes", EYE);
        var node_main_top_right_axes = this.generateNode(this, "Top Right Axes", "group_properties_root_main_view_visual_objects_indicators_top_right_axes", EYE);
        var node_main_clicked_position = this.generateNode(this, "Clicked Position", "group_properties_root_main_view_visual_objects_indicators_clicked_position", EYE);
        var node_main_seeds = this.generateNode(this, "Seeds", "group_properties_root_main_view_visual_objects_indicators_seeds", EYE);

        var node_aux_scene = this.generateNode(this, "Aux View", "group_properties_root_aux_view", NO_EYE);
        var node_aux_camera = this.generateNode(this, "Camera", "group_properties_root_aux_view_camera", NO_EYE);
        var node_aux_visual_objects = this.generateNode(this, "Visual Objects", "group_properties_root_aux_view_visual_objects", EYE);
        var node_aux_streamlines = this.generateNode(this, "Streamlines", "group_properties_root_aux_view_visual_objects_streamlines", EYE);
        var node_aux_ftle = this.generateNode(this, "FTLE Volume", "group_properties_root_aux_view_visual_objects_ftle_volume", EYE);
        var node_aux_indicators = this.generateNode(this, "Indicators", "group_properties_root_aux_view_visual_objects_indicators", EYE);
        var node_aux_bounding_axes = this.generateNode(this, "Bounding Axes", "group_properties_root_aux_view_visual_objects_indicators_bounding_axes", EYE);
        var node_aux_origin_axes = this.generateNode(this, "Origin Axes", "group_properties_root_aux_view_visual_objects_indicators_bounding_axes_origin_axes", EYE);
        var node_aux_top_right_axes = this.generateNode(this, "Top Right Axes", "group_properties_root_aux_view_visual_objects_indicators_top_right_axes", EYE);
        var node_aux_clicked_position = this.generateNode(this, "Clicked Position", "group_properties_root_aux_view_visual_objects_indicators_clicked_position", EYE);
        var node_aux_seeds = this.generateNode(this, "Seeds", "group_properties_root_aux_view_visual_objects_indicators_seeds", EYE);        

        var node_todo = this.generateNode(this, "Todo", "group_properties_root_todo", NO_EYE);

        this.element.appendChild(node_root.node);

        node_root.addChild(node_data);        
        node_data.addChild(node_equations);
        node_data.addChild(node_streamline_calculation);
        node_data.addChild(node_ftle_calculation);
        node_root.addChild(node_lighting);
        node_root.addChild(node_transfer_functions);        
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
        node_aux_bounding_axes.addChild(node_aux_origin_axes);        
        node_aux_indicators.addChild(node_aux_top_right_axes);
        node_aux_indicators.addChild(node_aux_clicked_position);
        node_aux_indicators.addChild(node_aux_seeds);
        node_root.addChild(node_todo);  
        
        
    }  

    generateNode(tree_view, name, group_id, has_eye){
        var node = new TreeViewNode(tree_view, name, group_id, has_eye);
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

    updateLinkedGroup(){        
        for(var i=0; i<this.list_nodes.length; i++){
            this.invisible_container.appendChild(this.list_nodes[i].linked_group_node);
        }
        for(var i=0; i<this.list_nodes.length; i++){
            this.list_nodes[i].updateLinkedGroup();
        }
    }

    updatePropertiesHelp(){
        for(var i=0; i<this.list_nodes.length; i++){
            if(this.list_nodes[i].selected){
                this.node_help_properties.className = "hidden";
                return;
            }
        }
        this.node_help_properties.className = "shown";
    }

    deselect(){
        for(var i=0; i<this.list_nodes.length; i++){
            this.list_nodes[i].selected = false;
        }
        this.updateLinkedGroup();
    }
}