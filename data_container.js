class DataContainer{

    /**
     * 
     * @param {string} name the name of the container
     * @param {*} dummy a dummy element used to get the data layout
     */
    constructor(name, dummy) {
        this.name = name;
        this.data = [];
        this.arrayf = new Float32Array(0);
        this.arrayi = new Int32Array(0);
        this.meta_data = {
            element_float_count: dummy.getFloatCount(),
            element_int_count: dummy.getIntCount(),
            total_float_count: 0,
            total_int_count: 0
        };
        console.log("Generate container: "+name+" with "+this.getElementFloatCount()+" floats and "+this.getElementIntCount()+" ints per element.")
    }

    generateArrays() {
        console.log("Generate arrays for container: "+this.name);
        this.arrayf = new Float32Array(this.data.length * this.getElementFloatCount());
        this.arrayi = new Int32Array(this.data.length * this.getElementIntCount());

        for (var i = 0; i < this.data.length; i++){
            var start_index_f = this.getElementFloatCount() * i;
            var start_index_i = this.getElementIntCount() * i; 
            this.data[i].writeToArrays(this.arrayf, this.arrayi, start_index_f, start_index_i);
        }

        this.setByName("total_float_count", this.arrayf.length);
        this.setByName("total_int_count", this.arrayi.length);

        console.log("arrayi [" + this.arrayi.length +"]["+this.getElementIntCount()+"] : "+this.arrayi);
        console.log("arrayf [" + this.arrayf.length +"]["+this.getElementFloatCount()+"] : "+this.arrayf);
    }

    getElementFloatCount(){
        return this.meta_data["element_float_count"];
    }

    getElementIntCount(){
        return this.meta_data["element_int_count"];
    }

    getTotalFloatCount(){
        return this.meta_data["total_float_count"];
    }

    getTotalIntCount(){
        return this.meta_data["total_int_count"];
    }

    getByName(name){
        return this.meta_data[name];
    }

    setByName(name, value){
        this.meta_data[name] = value;
    }

    setDataArrays(arrayf, arrayi){
        this.arrayf = arrayf;
        this.arrayi = arrayi;
        this.setByName("total_float_count", this.arrayf.length);
        this.setByName("total_int_count", this.arrayi.length);
    }
}