class StateDescriptionEntry {

    constructor(name, element_type, data_type, value_conversion_name = null) {
        this.name = name;
        this.element_type = element_type;
        this.data_type = data_type;
        this.value_conversion_name = value_conversion_name;
        console.log("StateDescriptionEntry: ", name, element_type, data_type, value_conversion_name);
    }
}

module.exports = StateDescriptionEntry;