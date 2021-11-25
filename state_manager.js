const Entry = require("./state_description/state_description");
const module_version = require("./version");
const getStateDescriptionDict = module_version.getStateDescriptionDict;
const getSpecialDescriptionList = module_version.getSpecialDescriptionList;
const getReadValueConversion = module_version.getReadValueConversion;
const getWriteValueConversion = module_version.getWriteValueConversion;
const BinaryArray = require("./binary_array");
const { forEach } = require("mathjs");

global.URL_VERSION_YEAR = 0;
global.URL_VERSION_MONTH = 0;
global.URL_VERSION_NUMBER = 0;
global.URL_STATE_VERSION = 0;
global.current_state_name_main = "";
global.current_state_name_aux = "";

class StateManager {

    constructor() {
        console.log("Generate StateManager");
    }

    generateListEntriesDefault(state_version) {
        var state_description_dict = getStateDescriptionDict(state_version);
        var list = [];
        list.push(new Entry("URL_STATE_VERSION", "global", "UI16"));
        list.push(new Entry("URL_VERSION_YEAR", "global", "UI16"));
        list.push(new Entry("URL_VERSION_MONTH", "global", "UI16"));
        list.push(new Entry("URL_VERSION_NUMBER", "global", "UI16"));
        var list_default = state_description_dict["default"];
        list = list.concat(list_default);
        console.log(list);
        return list;
    }

    executeStateBase64Url(){
        console.log("StateManager: execute state");
        console.log("base64_url:", this.base64_url);

        var state_data = new BinaryArray();
        state_data.data_base64_url = this.base64_url;
        state_data.generateBase64FromBase64URL();
        state_data.generateDataUint8FromBase64();

        var state_version = state_data.readValue("UI16");

        var state_description_dict = getStateDescriptionDict(state_version);
        var list = this.generateListEntriesDefault(state_version);

        state_data.begin();
        for(var i=0; i<list.length; i++){
            var name = list[i].name;
            var data_type = list[i].data_type;
            var value_conversion_name = list[i].value_conversion_name;
            var value_conversion = getReadValueConversion(state_version, value_conversion_name);
            var value = state_data.readValue(data_type, value_conversion);
            console.log(name, value);
            switch (list[i].element_type) {
                case "global":
                    window[list[i].name] = value;
                    break;
                case "field":       
                    window[list[i].name].value = value;
                    break;
                case "checkbox":       
                    window[list[i].name].checked = value;
                    break;
                default:
                    console.log("ERROR UNKNOWN element_type");
                    break;
            }
        }

        var list_special = getSpecialDescriptionList(state_version);
        for(var i=0; i<list_special.length; i++){
            console.log(i, list_special[i]);
            var arr_length = state_data.readUint16();
            var arr = new BinaryArray(arr_length);
            for(var j=0; j<arr_length; j++){
                var byte = state_data.readUint8();
                arr.writeUint8(byte);
            }
            window[list_special[i]] = arr;
            console.log(window[list_special[i]]);
        }
    }

    generateStateBase64(state_version){
        console.log("StateManager: generateStateBase64");
        var list = this.generateListEntriesDefault(state_version);
        var state_data = new BinaryArray();
        for(var i=0; i<list.length; i++){
            console.log(i, list[i]);
            switch (list[i].element_type) {
                case "global":
                    var value = window[list[i].name];
                    var data_type = list[i].data_type;
                    var value_conversion_name = list[i].value_conversion_name;
                    var value_conversion = getWriteValueConversion(state_version, value_conversion_name);
                    state_data.writeValue(value, data_type, value_conversion);
                    break;
                case "field":                    
                    var value = window[list[i].name].value;
                    var data_type = list[i].data_type;
                    var value_conversion_name = list[i].value_conversion_name;
                    var value_conversion = getWriteValueConversion(state_version, value_conversion_name);
                    state_data.writeValue(value, data_type, value_conversion);
                    break;
                case "checkbox":                    
                    var value = window[list[i].name].checked;
                    var data_type = list[i].data_type;
                    var value_conversion_name = list[i].value_conversion_name;
                    var value_conversion = getWriteValueConversion(state_version, value_conversion_name);
                    state_data.writeValue(value, data_type, value_conversion);
                    break;
                default:
                    console.log("ERROR UNKNOWN element_type");
                    break;
            }
        }

        var list_special = getSpecialDescriptionList(state_version);
        for(var i=0; i<list_special.length; i++){
            var arr = window[list_special[i]].data_uint8;
            state_data.writeUint16(arr.length);
            for(var j=0; j<arr.length; j++){
                state_data.writeUint8(arr[j]);
            }
        }
        state_data.resizeToContent();
        state_data.generateBase64FromUint8();
        state_data.generateBase64URLFromBase64();
        this.base64 = state_data.data_base64;
        this.base64_url = state_data.data_base64_url;
    }
}

module.exports = StateManager;