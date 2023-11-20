const { string } = require("mathjs");
const module_utility = require("./utility");
const GetFormula = module_utility.GetFormula;
const GetFormulaFloat = module_utility.GetFormulaFloat;
const regexIntToFloat = module_utility.regexIntToFloat;

class Metric {

    constructor() {
        this.ReadFromUI();
    }

    //---------- christoffel symbols

    Transform_metric_ij_to_index(i, j){        
        return 3*j + i;
    }

    Transform_metric_ijOneBased_to_index(i, j){        
        return 3*(j-1) + (i-1);
    }

    Transform_metric_index_to_ij(index){
        var i = index % 3;
        var j = ((index-i)/3) % 3;
        return { i, j};
    }

    Transform_metric_index_to_ijOneBased(index){
        var i = index % 3;
        var j = ((index-i)/3) % 3;
        return { i:i+1, j:j+1};
    }

    Transform_metric_index_to_fieldName(index){
        var indices = this.Transform_metric_index_to_ijOneBased(index);
        return "input_field_metric_"+string(indices.i)+string(indices.j);
    }

    //---------- 

    toString(){
        var s = "";
        for (var index = 0; index < 9; index++) {
            if(index > 0){
                s += "~";
            }
            s += this.metric_values[index];
        }
        return s;
    }

    fromString(s){
        this.metric_values = [];
        var split = s.split("~");
        for (var index = 0; index < 9; index++) {
            this.metric_values[index] = split[index];
        }
        this.WriteToUI();
    }

    //---------- 

    ReadFromUI(){
        this.metric_values = [];
        for (var index = 0; index < 9; index++) {
            var indices = this.Transform_metric_index_to_ijOneBased(index);
            var field_name = this.Transform_metric_index_to_fieldName(index);
            console.log("#metric index: ",index,field_name)
            this.metric_values[index] = GetFormula(field_name);
        }
    }

    WriteToUI(){
        for (var index = 0; index < 9; index++) {
            var field_name = this.Transform_metric_index_to_fieldName(index);
            document.getElementById(field_name).value = this.metric_values[index]
        }
    }
}

module.exports = Metric;