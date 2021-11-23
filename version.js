//ON_RELEASE: ADD REFERENCE IF STATE DATA DESCRIPTION CHANGES
const state_description_dict_1 = require("./state_description/1").state_description_dict;

//ON_RELEASE: CHANGE EVERY RELEASE
global.VERSION_YEAR = 2021;
global.VERSION_MONTH = 11;
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
