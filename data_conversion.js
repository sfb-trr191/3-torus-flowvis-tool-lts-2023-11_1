//https://stackoverflow.com/questions/63713889/convert-float32array-to-base64-in-javascript/63714922#63714922
function floatArrayToBytes(floats) {
    var output = floats.buffer; // Get the ArrayBuffer from the float array
    return new Uint8Array(output); // Convert the ArrayBuffer to Uint8s.
}

//https://stackoverflow.com/questions/63713889/convert-float32array-to-base64-in-javascript/63714922#63714922
function bytesToFloatArray(bytes) {
    var output = bytes.buffer; // Get the ArrayBuffer from the Uint8Array.
    return new Float32Array(output); // Convert the ArrayBuffer to floats.
}

function uint8ArrayToBase64(bytes) {
    //return nacl.util.encodeBase64(bytes) // Encode
    return Buffer.from(bytes).toString('base64');
}

function base64ToUint8Array(base64) {
    //return nacl.util.decodeBase64(base64) // Decode
    return Buffer.from(base64, 'base64');
}

exports.conversionTest = function () {
    var floats = new Float32Array(4);
    floats[0] = 42.42;
    floats[1] = 0.1337;
    floats[2] = 0.07;
    floats[3] = 0.001;    
    console.log("conversionTest floats", floats);
    var bytes = floatArrayToBytes(floats);
    console.log("conversionTest bytes", bytes);
    var base64 = uint8ArrayToBase64(bytes);
    console.log("conversionTest base64", base64);
    var bytes_reconstructed = base64ToUint8Array(base64);
    console.log("conversionTest bytes_reconstructed", bytes_reconstructed);
    var floats_reconstructed = bytesToFloatArray(bytes_reconstructed);
    console.log("conversionTest floats_reconstructed", floats_reconstructed);
    var result;
    console.log("conversionTest result", result);




    var data = new Uint8Array(16);
    console.log("data", data);
    var state_version = 1;//UI16
    var version_year = 2021;//UI16
    var version_month = 11;//UI16
    var version_number = 1;//UI16
    var base64 = uint8ArrayToBase64(data);
    return base64;
}

//float array --> byte array
//byte array --> base64 string
//base64 string --> url-safe-base64 string