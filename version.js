//ON_RELEASE: ADD REFERENCE IF STATE DATA DESCRIPTION CHANGES
const state_description_dict_1 = require("./state_description/1").state_description_dict;

//ON_RELEASE: CHANGE EVERY RELEASE
global.VERSION_YEAR = 2022;
global.VERSION_MONTH = 8;
global.VERSION_NUMBER = 1;
//ON_RELEASE: INCREMENT IF STATE DATA DESCRIPTION CHANGES
global.STATE_VERSION = 1;

//ON_RELEASE: ADD REFERENCE IF STATE DATA DESCRIPTION CHANGES
exports.getStateDescriptionDict = function(state_version){
    switch (state_version) {
        case 1:
            return state_description_dict_1;
        default:
            console.log("ERROR UNKNOWN STATE VERSION");
            return null;
    }
}

exports.getSpecialDescriptionList = function(state_version){
    return exports.getStateDescriptionDict(state_version)["special"];
}

exports.getStateDescription = function(state_version, name){
    return exports.getStateDescriptionDict(state_version)[name];
}

exports.getReadValueConversion = function(state_version, value_conversion_name){

    if(value_conversion_name === null)
        return null;

    var dict = exports.getStateDescriptionDict(state_version);
    var dict_read = dict["conversion_read"];
    var value_conversion = dict_read[value_conversion_name];
    return value_conversion;
}

exports.getWriteValueConversion = function(state_version, value_conversion_name){

    if(value_conversion_name === null)
        return null;

    var dict = exports.getStateDescriptionDict(state_version);
    var dict_write = dict["conversion_write"];
    var value_conversion = dict_write[value_conversion_name];
    return value_conversion;
}