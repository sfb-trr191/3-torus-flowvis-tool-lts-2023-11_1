const Entry = require("./state_description");

exports.addEntries_1 = function (list) {    
    console.log("addEntries_1");
    list.push(new Entry("input_num_points_per_streamline", "field", "F32"));
}