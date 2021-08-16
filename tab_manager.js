class TabEntry{
    constructor(name, id_button, id_content){
        this.name = name;
        this.id_button = id_button;
        this.id_content = id_content;
    }
}

class TabGroup{
    constructor(tab_manager, name){
        this.name = name;
        this.tab_manager = tab_manager;
        this.tab_manager.dict_tab_groups[name] = this;
        this.dict_tab_entry = {};
        this.selected_name = "";
    }

    addTab(name, id_button, id_content){
        var entry = new TabEntry(name, id_button, id_content);
        this.dict_tab_entry[name] = entry;
    }
}

class TabManager{

    constructor(){
        this.dict_tab_groups = {};
        this.initTabs();
    }

    initTabs(){
        var tab_group_main = new TabGroup(this, "tab_group_main");
        tab_group_main.addTab("tab_data", "button_tab_data", "tabcontent_data");
        tab_group_main.addTab("tab_ftle", "button_tab_ftle", "tabcontent_ftle");
        tab_group_main.addTab("tab_settings", "button_tab_settings", "tabcontent_settings");
        tab_group_main.addTab("tab_transfer_function", "button_tab_transfer_function", "tabcontent_transfer_function");        
        //tab_group_main.addTab("tab_information", "button_tab_information", "tabcontent_information");
        //tab_group_main.addTab("tab_edit", "button_tab_edit", "tabcontent_edit");
        tab_group_main.addTab("tab_export", "button_tab_export", "tabcontent_export");
        tab_group_main.addTab("tab_help", "button_tab_help", "tabcontent_help");
    }

    selectTab(tab_group_name, tab_name){
        var group = this.dict_tab_groups[tab_group_name];
        group.selected_name = tab_name;

        if (!(tab_name in group.dict_tab_entry))
            return;

        var tab = group.dict_tab_entry[tab_name];
        console.log(tab.name, tab.id_button, tab.id_content);

        for (var key in group.dict_tab_entry) {
            // check if the property/key is defined in the object itself, not in parent
            if (group.dict_tab_entry.hasOwnProperty(key)) { 
                var entry = group.dict_tab_entry[key]; 
                document.getElementById(entry.id_content).style.display = "none";
                document.getElementById(entry.id_button).className = "tablink";
            }
        }
        
        document.getElementById(tab.id_content).style.display = "block";
        document.getElementById(tab.id_button).className += " active";
    }
}

module.exports = TabManager;