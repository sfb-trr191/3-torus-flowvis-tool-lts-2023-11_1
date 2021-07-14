/**
 * The DataUnit class manages several DataCollection objects.
 * The data of those collections is copied into one float and one integer array.
 * Those two arrays are then stored in 3D textures.
 */
class DataUnit {

    /**
     * 
     * @param {string} name the name of the data unit
     * @param {*} dummy a dummy element used to get the data layout
     */
    constructor(name) {
        console.log("Generate data unit: " + name);
        this.name = name;
        this.list_data_containers = [];
        this.list_data_containers_float_start = [];
        this.list_data_containers_int_start = [];
        this.dict_name_to_index = {};
        this.arrayf = new Float32Array(0);
        this.arrayi = new Int32Array(0);
        this.total_float_count = 0;
        this.total_int_count = 0;
        this.texture_size_x = 512;
        this.texture_size_y = 512;
        this.texture_size_float_z = 1;//this value is variable depending on the total data size
        this.texture_size_int_z = 1;//this value is variable depending on the total data size
    }

    registerDataCollection(collection) {
        this.dict_name_to_index[collection.name] = this.list_data_containers.length;
        this.list_data_containers.push(collection);
        this.list_data_containers_float_start.push(0);
        this.list_data_containers_int_start.push(0);
        console.log("register: " + collection.name + " to data unit " + this.name + " at index: " + this.dict_name_to_index[collection.name]);
    }

    getCollectionIndex(collection_name) {
        return this.dict_name_to_index[collection_name];
    }

    getFloatStart(collection_name) {
        var index = this.dict_name_to_index[collection_name];
        return this.list_data_containers_float_start[index];
    }

    getIntStart(collection_name) {
        var index = this.dict_name_to_index[collection_name];
        return this.list_data_containers_int_start[index];
    }

    generateArrays() {
        console.log("Generate arrays for data unit: " + this.name);

        //generate arrays of the containers
        for (var i = 0; i < this.list_data_containers.length; i++) {
            this.list_data_containers[i].generateArrays();
        }

        this.generateInternal();
    }

    setDataArrays(collection_name, arrayf, arrayi) {
        this.list_data_containers[this.getCollectionIndex(collection_name)].setDataArrays(arrayf, arrayi);
    }

    generateFromArrays(data_points, data_segments_float, data_segments_int, data_nodes_float, data_nodes_int) {
        console.log("Generate from arrays for data unit: " + this.name);

        this.setDataArrays("positions", data_points, new Int32Array());
        this.setDataArrays("line_segments", data_segments_float, data_segments_int);
        this.setDataArrays("tree_nodes", data_nodes_float, data_nodes_int);

        this.generateInternal();
    }

    generateInternal() {
        //update the start indices for all containers except the first (i=0)
        for (var i = 1; i < this.list_data_containers.length; i++) {
            this.updateStartIndex(i, this.list_data_containers_float_start, "total_float_count", "element_float_count");
            this.updateStartIndex(i, this.list_data_containers_int_start, "total_int_count", "element_int_count");
        }

        //generate arrays of the data unit
        var last_index = this.list_data_containers.length - 1;
        this.total_float_count = this.list_data_containers_float_start[last_index] + this.list_data_containers[last_index].getByName("total_float_count");
        this.total_int_count = this.list_data_containers_int_start[last_index] + this.list_data_containers[last_index].getByName("total_int_count");
        this.texture_size_float_z = Math.ceil(this.total_float_count / (this.texture_size_x * this.texture_size_y));
        this.texture_size_int_z = Math.ceil(this.total_int_count / (this.texture_size_x * this.texture_size_y));
        //this.texture_size_float_z = 10;//this somehow works on windows
        //this.texture_size_int_z = 10;//this somehow works on windows
        //console.warn(this.texture_size_float_z + ", " + typeof (this.texture_size_float_z));

        this.arrayf = new Float32Array(this.texture_size_x * this.texture_size_y * this.texture_size_float_z);
        //this.arrayi = new Int32Array(this.total_int_count);
        this.arrayi = new Int32Array(this.texture_size_x * this.texture_size_y * this.texture_size_int_z);

        //copy arrays of the containers into the arrays of the data unit
        for (var i = 0; i < this.list_data_containers.length; i++) {
            this.copyArray(this.list_data_containers[i].arrayf, this.arrayf, this.list_data_containers_float_start[i]);
            this.copyArray(this.list_data_containers[i].arrayi, this.arrayi, this.list_data_containers_int_start[i]);
        }

        console.log("arrayi [" + this.arrayi.length + "] : " + this.arrayi);
        console.log("arrayf [" + this.arrayf.length + "] : " + this.arrayf);

        console.log("start f: " + this.list_data_containers_float_start);
        console.log("start i: " + this.list_data_containers_int_start);
    }

    updateStartIndex(i, list_data_containers_start, vn_total_count, vn_element_count) {

        //the start of the last container is retrieved from the list 
        var start_previous = list_data_containers_start[i - 1];

        //the start of the current container is the previous start, offset by the size of the previous container
        var total_count_previous = this.list_data_containers[i - 1].getByName(vn_total_count);
        var start_current = start_previous + total_count_previous;

        //however, to fulfill our alignment condition, this must be a multiple of the element float or int count
        var total_count_current = this.list_data_containers[i].getByName(vn_total_count);
        console.log("updateStartIndex " + i + ", " + total_count_current)
        //skipped if there is no data
        if (total_count_current == 0) {
            list_data_containers_start[i] = start_current;
            return;
        }
        var element_count = this.list_data_containers[i].getByName(vn_element_count);
        var remainder = start_current % element_count;
        if (remainder != 0) {
            var quotient = Math.floor(start_current / element_count);
            var dummy_count = quotient + 1;
            start_current = dummy_count * element_count;
        }

        //update the start of the current container in the list
        list_data_containers_start[i] = start_current;
    }

    copyArray(source_array, target_array, target_start_index) {
        console.log("target_start_index: " + target_start_index + ", source_array.length: " + source_array.length + ", target_array.length: " + target_array.length);
        target_array.set(source_array, target_start_index);
    }
}

module.exports = DataUnit;