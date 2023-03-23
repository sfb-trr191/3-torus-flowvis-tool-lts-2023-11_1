const glMatrix = require("gl-matrix");

exports.format4NumbersAsVectorString = function(x, y, z, w){
    var s = "["
    s+= x.toFixed(3) + ", "
    s+= y.toFixed(3) + ", "
    s+= z.toFixed(3) + ", "
    s+= w.toFixed(3)
    s+= "]"
    return s;
}

exports.getMousePosition = function(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return {
        x: x,
        y: y
    };
}

exports.getMousePositionFromBottomLeft = function(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = rect.height - (event.clientY - rect.top);
    return {
        x: x,
        y: y
    };
}

exports.getMousePositionPercentage = function (canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    return {
        x: x,
        y: y
    };
}

/**
 * 
 * @param {*} canvas 
 * @param {*} event 
 * @returns x,y coordinates in [-1,1]
 */
exports.getMousePositionCanonical = function (canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let s = Math.min(rect.width, rect.height)
    let cx = rect.left + 0.5 * rect.width;
    let cy = rect.top + 0.5 * rect.height;
    let x = 2 * (event.clientX - cx) / s;
    let y = -2 * (event.clientY - cy) / s;
    return {
        x: x,
        y: y
    };
}

exports.GetIndexInList = function (value, vector) {
    for (var i = 0; i < vector.length; i++) {
        if (vector[i] == value)
            return i;
    }
    return -1;
}

/**
 * 
 * @param {*} p point whose distance is to be calculated
 * @param {*} a point on the line 
 * @param {*} n direction of the line 
 */
exports.distancePointToLine = function (p, a, n) {

    var a_minus_p = glMatrix.vec3.create();
    glMatrix.vec3.subtract(a_minus_p, a, p);

    var a_minus_p_cross_n = glMatrix.vec3.create();
    glMatrix.vec3.cross(a_minus_p_cross_n, a_minus_p, n);

    var magnitude_a_minus_p_cross_n = glMatrix.vec3.length(a_minus_p_cross_n);
    var magnitude_n = glMatrix.vec3.length(n);

    return magnitude_a_minus_p_cross_n / magnitude_n;
}


exports.setCSS = function (value) {

    // Obtain the name of stylesheet 
    // as a parameter and set it 
    // using href attribute.
    var sheets = document.getElementsByTagName("link");
    sheets[0].href = value;
    console.log("STYLE:", value)
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

exports.rgbToHex = function (r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

exports.lerp = function (a, b, t) {
    return (1 - t) * a + t * b;
}

exports.lerpHex = function (col_a, col_b, t){
    var a_r = parseInt(col_a.substr(1, 2), 16) / 255
    var a_g = parseInt(col_a.substr(3, 2), 16) / 255
    var a_b = parseInt(col_a.substr(5, 2), 16) / 255

    var b_r = parseInt(col_b.substr(1, 2), 16) / 255
    var b_g = parseInt(col_b.substr(3, 2), 16) / 255
    var b_b = parseInt(col_b.substr(5, 2), 16) / 255

    var r = exports.lerp(a_r, b_r, t);
    var g = exports.lerp(a_g, b_g, t);
    var b = exports.lerp(a_b, b_b, t);

    var r_int = Math.round(r * 255);
    var g_int = Math.round(g * 255);
    var b_int = Math.round(b * 255);

    var hex = exports.rgbToHex(r_int, g_int, b_int);
    return hex;
}

exports.clamp = function (x, min_x, max_x) {
    return Math.min(Math.max(x, min_x), max_x);
}

exports.regexIntToFloat = function(input_string) {
    return input_string.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
        return ($2 == ".") ? $0 : $0 + ".0";
    });
}

