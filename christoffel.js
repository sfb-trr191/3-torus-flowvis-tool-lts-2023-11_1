const { string } = require("mathjs");
const module_utility = require("./utility");
const GetFormula = module_utility.GetFormula;
const GetFormulaFloat = module_utility.GetFormulaFloat;

class Christoffel {

    constructor() {
        this.covariant_derivative_symbol = "u";//the symbol used to access the vector field values at a position x
        this.ReadChristoffelSymbolsFromUI();
    }

    //---------- christoffel symbols

    Transform_christoffel_ijk_to_index(i, j, k){        
        return 9*k + 3*j + i;
    }

    Transform_christoffel_ijkOneBased_to_index(i, j, k){        
        return 9*(k-1) + 3*(j-1) + (i-1);
    }

    Transform_christoffel_index_to_ijk(index){
        var i = index % 3;
        var j = ((index-i)/3) % 3
        var k = (index-i -3*j) / 9
        return { i, j, k };
    }

    Transform_christoffel_index_to_ijkOneBased(index){
        var i = index % 3;
        var j = ((index-i)/3) % 3
        var k = (index-i -3*j) / 9
        return { i:i+1, j:j+1, k:k+1 };
    }

    Transform_christoffel_index_to_fieldName(index){
        var indices = this.Transform_christoffel_index_to_ijkOneBased(index);
        return "input_field_christoffel_"+string(indices.i)+string(indices.j)+string(indices.k);
    }

    //---------- christoffel symbols

    Transform_covariant_derivative_ij_to_index(i, j){        
        return 3*j + i;
    }

    Transform_covariant_derivative_ijOneBased_to_index(i, j){        
        return 3*(j-1) + (i-1);
    }

    Transform_covariant_derivative_index_to_ij(index){
        var i = index % 3;
        var j = ((index-i)/3) % 3
        return { i, j};
    }

    Transform_covariant_derivative_index_to_ijOneBased(index){
        var i = index % 3;
        var j = ((index-i)/3) % 3
        return { i:i+1, j:j+1};
    }

    Transform_covariant_derivative_index_to_fieldName(index){
        var indices = this.Transform_covariant_derivative_index_to_ijOneBased(index);
        return "input_field_covariant_derivative_"+string(indices.i)+string(indices.j)+"k";
    }

    //---------- 

    toString(){
        var s = "";
        for (var index = 0; index < 27; index++) {
            if(index > 0){
                s += "~";
            }
            s += this.christoffel_symbols[index];
        }
        return s;
    }

    fromString(s){
        this.christoffel_symbols = [];
        var split = s.split("~");
        for (var index = 0; index < 27; index++) {
            this.christoffel_symbols[index] = split[index];
        }
        this.WriteChristoffelSymbolsToUI();
    }

    //---------- 

    ReadChristoffelSymbolsFromUI(){
        this.christoffel_symbols = [];
        for (var index = 0; index < 27; index++) {
            var indices = this.Transform_christoffel_index_to_ijkOneBased(index);
            var field_name = this.Transform_christoffel_index_to_fieldName(index);
            console.log("#christoffel index: ",index,field_name)
            this.christoffel_symbols[index] = GetFormula(field_name);
        }
        this.GenerateCovariantDerivatives();
        this.WriteCovariantDerivativesToUI();
    }

    WriteChristoffelSymbolsToUI(){
        for (var index = 0; index < 27; index++) {
            var field_name = this.Transform_christoffel_index_to_fieldName(index);
            document.getElementById(field_name).value = this.christoffel_symbols[index]
        }
    }

    GenerateCovariantDerivatives(){
        this.covariant_derivatives = [];
        for (var index = 0; index < 9; index++) {
            var indices = this.Transform_covariant_derivative_index_to_ijOneBased(index);
            var formula = ""
            for (var k = 1; k <= 3; k++) {


                var christoffel_index = this.Transform_christoffel_ijkOneBased_to_index(indices.i, indices.j, k);
                var christoffel_symbol = this.christoffel_symbols[christoffel_index];
                if(christoffel_symbol == "0"){
                    continue;
                }
                if(formula != ""){
                    formula += "+"
                }
                formula += christoffel_symbol + "*" + this.covariant_derivative_symbol + string(k)
            }
            if(formula == ""){
                formula = "0";
            }
            
            this.covariant_derivatives[index] = formula;
        }
    }

    WriteCovariantDerivativesToUI() {
        for (var index = 0; index < 9; index++) {
            var indices = this.Transform_covariant_derivative_index_to_ijOneBased(index);
            var field_name = this.Transform_covariant_derivative_index_to_fieldName(index);
            console.log("#christoffel index: ",index,field_name)     
            document.getElementById(field_name).value = this.covariant_derivatives[index];       
        }
    }
}

module.exports = Christoffel;