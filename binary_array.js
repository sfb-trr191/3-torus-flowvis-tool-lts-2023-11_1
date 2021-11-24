class BinaryArray {

    constructor() {
        console.log("Generate BinaryArray");
        this.clear();
    }

    clear(){        
        this.data_base64 = "";
        this.data_base64_url = "";
        this.data_uint8 = new Uint8Array(128);//array that holds the entire state data
        this.pointer = 0;//current pointer position used to write into the data_uint8 array
    }

    begin(){
        this.pointer = 0;//reset pointer to start reading or writing
    }

    resizeToContent(){
        this.data_uint8 = this.data_uint8.slice(0, this.pointer);
    }

    generateBase64FromUint8(){
        this.data_base64 = Buffer.from(this.data_uint8).toString('base64');
        console.log("generateBase64FromUint8:", this.data_base64);
    }

    generateDataUint8FromBase64(){
        this.data_uint8 = Buffer.from(this.data_base64, 'base64');
        console.log("generateDataUint8FromBase64:", this.data_uint8);
    }

    generateBase64URLFromBase64(){
        this.data_base64_url = this.data_base64.replaceAll("+", "-");
        this.data_base64_url = this.data_base64_url.replaceAll("/", "_");
        this.data_base64_url = this.data_base64_url.replaceAll("=", "~");   
        console.log("generateBase64URLFromBase64:", this.data_base64_url);     
    }

    generateBase64FromBase64URL(){
        this.data_base64 = this.data_base64_url.replaceAll("-", "+");
        this.data_base64 = this.data_base64.replaceAll("_", "/");
        this.data_base64 = this.data_base64.replaceAll("~", "=");       
        console.log("generateBase64FromBase64URL:", this.data_base64);     
    }

    writeValue(value, data_type){
        switch (data_type) {
            case "UI8":
                this.writeUint8(value);
                break;
            case "UI16":
                this.writeUint16(value);
                break;
            case "F32":
                this.writeFloat32(value);
                break;
            case "STR":
                this.writeStr(value);
                break;
            default:
                console.log("ERROR UNKNOWN data_type");
                break;
        }
    }

    checkArraySpace(bytes_to_insert){
        if(this.pointer + bytes_to_insert <= this.data_uint8.byteLength)
            return;
        var new_array = new Uint8Array(2 * this.data_uint8.byteLength);
        new_array.set(this.data_uint8);
        this.data_uint8 = new_array;
    }

    /**
     * Sets a Uint16 value at the current pointer position and incements the pointer by 2
     * @param {*} value 
     */
    writeUint8(value){
        this.checkArraySpace(1);
        this.data_uint8[this.pointer] = value;
        this.pointer += 1;
        console.log("writeUint8:", value, "(", this.pointer, "/", this.data_uint8.byteLength, ")");
    }

    /**
     * Sets a Uint16 value at the current pointer position and incements the pointer by 2
     * @param {*} value 
     */
    writeUint16(value){
        this.checkArraySpace(2);
        //convert value to uint8 array
        var data_16 = new Uint16Array(1);
        data_16[0] = value;
        //console.log("data_16:", data_16);
        var data_8 = new Uint8Array(data_16.buffer, data_16.byteOffset, data_16.byteLength);
        //console.log("data_8:", data_8);

        //set copy converted uint8 values
        this.data_uint8[this.pointer] = data_8[0];
        this.data_uint8[this.pointer+1] = data_8[1];
        this.pointer += 2;
        //console.log("data_uint8:", this.data_uint8);
        console.log("writeUint16:", value, "(", this.pointer, "/", this.data_uint8.byteLength, ")");
    }

    /**
     * Sets a Float32 value at the current pointer position and incements the pointer by 4
     * @param {*} value 
     */
    writeFloat32(value){
        this.checkArraySpace(4);
        //convert value to uint8 array
        //console.log("writeFloat32:", value);
        var data_32 = new Float32Array(1);
        data_32[0] = value;
        //console.log("data_32:", data_32);
        var data_8 = new Uint8Array(data_32.buffer, data_32.byteOffset, data_32.byteLength);
        //console.log("data_8:", data_8);

        //set copy converted uint8 values
        this.data_uint8[this.pointer] = data_8[0];
        this.data_uint8[this.pointer+1] = data_8[1];
        this.data_uint8[this.pointer+2] = data_8[2];
        this.data_uint8[this.pointer+3] = data_8[3];
        this.pointer += 4;
        //console.log("data_uint8:", this.data_uint8);
        console.log("writeFloat32:", value, "(", this.pointer, "/", this.data_uint8.byteLength, ")");
    }

    /**
     * Writes string and 
     * @param {*} value 
     */
    writeStr(value){
        //write the number of bytes as UI16
        var buffer = Buffer.from(value, 'utf16le');
        var byte_length = buffer.length;
        this.writeUint16(byte_length);

        //write the string data
        this.checkArraySpace(byte_length);
        for(var i=0; i<byte_length; i++){
            this.data_uint8[this.pointer+i] = buffer[i];
        }
        this.pointer += byte_length;

        console.log("writeStr:", value, "(", this.pointer, "/", this.data_uint8.byteLength, ")");
    }

    readValue(data_type){
        switch (data_type) {
            case "UI8":
                return this.readUint8();
            case "UI16":
                return this.readUint16();
            case "F32":
                return this.readFloat32();
            case "STR":
                return this.readStr();
            default:
                console.log("ERROR UNKNOWN data_type");
                return undefined;
        }
    }

    readUint8(){  
        //copy uint8 data values into temporary array
        var value = this.data_uint8[this.pointer]
        this.pointer += 1;
        console.log("readUint8:", value);
        return value;
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

    readStr(){  
        //read the number of bytes of the string data
        var byte_length = this.readUint16();
        //copy uint8 data values into temporary array
        var data_8 = new Uint8Array(byte_length);
        for(var i=0; i<byte_length; i++){
            data_8[i] = this.data_uint8[this.pointer+i];
        }
        this.pointer += byte_length;
        console.log("data_8:", data_8);
        
        var value = Buffer.from(data_8).toString('utf16le');
        console.log("readStr:", value);
        return value;
    }
}

module.exports = BinaryArray;