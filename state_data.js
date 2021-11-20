class StateData {

    constructor() {
        console.log("Generate StateData");
        this.clear();
    }

    /*
    generateHeader(state_version, version_year, version_month, version_number){
        console.log("StateData: generateHeader");
        console.log("state_version:", state_version);
        console.log("version_year:", version_year);
        console.log("version_month:", version_month);
        console.log("version_number:", version_number);
        var header = new Uint16Array(4);
        header[0] = state_version;
        header[1] = version_year;
        header[2] = version_month;
        header[3] = version_number;
        this.data_uint8 = new Uint8Array(0);
    }
    */

    clear(){        
        this.data_base64 = "";
        this.data_uint8 = new Uint8Array(42);//array that holds the entire state data
        this.pointer = 0;//current pointer position used to write into the data_uint8 array
    }

    begin(){
        this.pointer = 0;//reset pointer to start reading or writing
    }

    generateBase64(){
        this.data_base64 = Buffer.from(this.data_uint8).toString('base64');
        console.log("generateBase64:", this.data_base64);
    }

    generateDataUint8FromBase64(){
        this.data_uint8 = Buffer.from(this.data_base64, 'base64');
        console.log("generateDataUint8FromBase64:", this.data_uint8);
    }

    writeValue(value, data_type){
        switch (data_type) {
            case "UI16":
                this.writeUint16(value);
                break;
            case "F32":
                this.writeFloat32(value);
                break;
            default:
                console.log("ERROR UNKNOWN data_type");
                break;
        }
    }

    /**
     * Sets a Uint16 value at the current pointer position and incements the pointer by 2
     * @param {*} value 
     */
    writeUint16(value){
        //convert value to uint8 array
        console.log("writeUint16:", value);
        var data_16 = new Uint16Array(1);
        data_16[0] = value;
        console.log("data_16:", data_16);
        var data_8 = new Uint8Array(data_16.buffer, data_16.byteOffset, data_16.byteLength);
        console.log("data_8:", data_8);

        //set copy converted uint8 values
        this.data_uint8[this.pointer] = data_8[0];
        this.data_uint8[this.pointer+1] = data_8[1];
        this.pointer += 2;
        console.log("data_uint8:", this.data_uint8);
    }

    /**
     * Sets a Float32 value at the current pointer position and incements the pointer by 4
     * @param {*} value 
     */
    writeFloat32(value){
        //convert value to uint8 array
        console.log("writeFloat32:", value);
        var data_32 = new Float32Array(1);
        data_32[0] = value;
        console.log("data_32:", data_32);
        var data_8 = new Uint8Array(data_32.buffer, data_32.byteOffset, data_32.byteLength);
        console.log("data_8:", data_8);

        //set copy converted uint8 values
        this.data_uint8[this.pointer] = data_8[0];
        this.data_uint8[this.pointer+1] = data_8[1];
        this.data_uint8[this.pointer+2] = data_8[2];
        this.data_uint8[this.pointer+3] = data_8[3];
        this.pointer += 4;
        console.log("data_uint8:", this.data_uint8);
    }

    readValue(data_type){
        switch (data_type) {
            case "UI16":
                return this.readUint16();
            case "F32":
                return this.readFloat32();
            default:
                console.log("ERROR UNKNOWN data_type");
                return undefined;
        }
    }

    readUint16(){  
        //copy uint8 data values into temporary array
        var data_8 = new Uint8Array(2);
        data_8[0] = this.data_uint8[this.pointer];
        data_8[1] = this.data_uint8[this.pointer+1];
        this.pointer += 2;
        console.log("data_8:", data_8);


        //convert value to uint16
        var data_16 = new Uint16Array(data_8.buffer);
        var value = data_16[0];
        console.log("readUint16:", value);
        return value;
    }

    readFloat32(){  
        //copy uint8 data values into temporary array
        var data_8 = new Uint8Array(4);
        data_8[0] = this.data_uint8[this.pointer];
        data_8[1] = this.data_uint8[this.pointer+1];
        data_8[2] = this.data_uint8[this.pointer+2];
        data_8[3] = this.data_uint8[this.pointer+3];
        this.pointer += 4;
        console.log("data_8:", data_8);


        //convert value to uint16
        var data_32 = new Float32Array(data_8.buffer);
        var value = data_32[0];
        console.log("readFloat32:", value);
        return value;
    }
}

module.exports = StateData;