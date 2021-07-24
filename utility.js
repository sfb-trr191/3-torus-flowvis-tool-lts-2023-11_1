const glMatrix = require("gl-matrix");

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

exports.regexIntToFloat = function(input_string) {
    return input_string.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
        return ($2 == ".") ? $0 : $0 + ".0";
    });
}

