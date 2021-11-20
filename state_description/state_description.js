class StateDescriptionEntry {

    constructor(name, element_type, data_type) {
        this.name = name;
        this.element_type = element_type;
        this.data_type = data_type;
        console.log("StateDescriptionEntry: ", name, element_type, data_type);
    }
}

module.exports = StateDescriptionEntry;