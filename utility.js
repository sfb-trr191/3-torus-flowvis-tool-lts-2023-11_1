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

exports.getTouchPosition = function(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.touches[0].clientX - rect.left;
    let y = event.touches[0].clientY - rect.top;
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

exports.getTouchPositionPercentage = function (canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = (event.touches[0].clientX - rect.left) / rect.width;
    let y = (event.touches[0].clientY - rect.top) / rect.height;
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

exports.getTouchPositionCanonical = function (canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let s = Math.min(rect.width, rect.height)
    let cx = rect.left + 0.5 * rect.width;
    let cy = rect.top + 0.5 * rect.height;
    let x = 2 * (event.touches[0].clientX - cx) / s;
    let y = -2 * (event.touches[0].clientY - cy) / s;
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
    //MARKER_RENAME_SYMBOLS float ignores

    input_string = input_string.replaceAll("x1", "x_one")
    input_string = input_string.replaceAll("x2", "x_two")
    input_string = input_string.replaceAll("x3", "x_three")
    input_string = input_string.replaceAll("x4", "x_four")
    
    input_string = input_string.replaceAll("v1", "v_one")
    input_string = input_string.replaceAll("v2", "v_two")
    input_string = input_string.replaceAll("v3", "v_three")
    input_string = input_string.replaceAll("v4", "v_four")

    var string_float = input_string.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
        return ($2 == ".") ? $0 : $0 + ".0";
    });

    string_float = string_float.replaceAll("x_one", "x1")
    string_float = string_float.replaceAll("x_two", "x2")
    string_float = string_float.replaceAll("x_three", "x3")
    string_float = string_float.replaceAll("x_four", "x4")

    string_float = string_float.replaceAll("v_one", "v1")
    string_float = string_float.replaceAll("v_two", "v2")
    string_float = string_float.replaceAll("v_three", "v3")
    string_float = string_float.replaceAll("v_four", "v4")

    return string_float;
}

exports.getColorVectorFromElementID = function(element_id) {
    var element_value = document.getElementById(element_id).value;
    console.log("element: ", element_value);
    const r = parseInt(element_value.substr(1, 2), 16) / 255
    const g = parseInt(element_value.substr(3, 2), 16) / 255
    const b = parseInt(element_value.substr(5, 2), 16) / 255
    console.log(`red: ${r}, green: ${g}, blue: ${b}`)
    return glMatrix.vec3.fromValues(r, g, b);
}

exports.GetFormula = function(element_id){
    var shader_formula = document.getElementById(element_id).value;
    return shader_formula;
}

exports.GetFormulaFloat = function(element_id){
    //MARKER_RENAME_SYMBOLS float ignores
    
    var shader_formula = document.getElementById(element_id).value;

    shader_formula = shader_formula.replaceAll("x1", "x_one")
    shader_formula = shader_formula.replaceAll("x2", "x_two")
    shader_formula = shader_formula.replaceAll("x3", "x_three")
    shader_formula = shader_formula.replaceAll("x4", "x_four")

    shader_formula = shader_formula.replaceAll("v1", "v_one")
    shader_formula = shader_formula.replaceAll("v2", "v_two")
    shader_formula = shader_formula.replaceAll("v3", "v_three")
    shader_formula = shader_formula.replaceAll("v4", "v_four")

    var shader_formula_float = shader_formula.replace(/([0-9]*)([.])*([0-9]+)/gm, function ($0, $1, $2, $3) {
        return ($2 == ".") ? $0 : $0 + ".0";
    });

    shader_formula_float = shader_formula_float.replaceAll("x_one", "x1")
    shader_formula_float = shader_formula_float.replaceAll("x_two", "x2")
    shader_formula_float = shader_formula_float.replaceAll("x_three", "x3")
    shader_formula_float = shader_formula_float.replaceAll("x_four", "x4")

    shader_formula_float = shader_formula_float.replaceAll("v_one", "v1")
    shader_formula_float = shader_formula_float.replaceAll("v_two", "v2")
    shader_formula_float = shader_formula_float.replaceAll("v_three", "v3")
    shader_formula_float = shader_formula_float.replaceAll("v_four", "v4")

    return shader_formula_float;
}

exports.LogToLinear = function(alpha_log, d){
    var a = Math.max(Math.log(d),1);
    var term_1 = Math.pow(Math.E, -a*(1-alpha_log));
    var term_2 = Math.pow(Math.E, -a);
    var alpha_linear = (term_1 - term_2) / (1 - term_2);
    return alpha_linear;
}

//glsl-like
//step generates a step function by comparing x to edge.
//For element i of the return value, 0.0 is returned if x[i] < edge[i], and 1.0 is returned otherwise. 
exports.stepVec3 = function(edge, x){
    var results = glMatrix.vec3.create();
    for (var i = 0; i < 3; i++) {
        results[i] = x[i] < edge[i] ? 0.0 : 1.0;        
    }
    return results;
}

//glsl-like
exports.clampVec3 = function(x, minVal, maxVal){
    var results = glMatrix.vec3.create();
    for (var i = 0; i < 3; i++) {
        results[i] = Math.min(maxVal, Math.max(x[i], minVal));
    }
    return results;
}
