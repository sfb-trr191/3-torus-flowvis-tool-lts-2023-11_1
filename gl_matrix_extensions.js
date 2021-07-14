const glMatrix = require("gl-matrix");

vec3_add_scalar = function (out, a, s) {
    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;
    return out;
};

vec3_subtract_scalar = function (out, a, s) {
    out[0] = a[0] - s;
    out[1] = a[1] - s;
    out[2] = a[2] - s;
    return out;
};

vec3_from_vec4 = function (out, vec4) {
    out[0] = vec4[0];
    out[1] = vec4[1];
    out[2] = vec4[2];
    return out;
};

vec4_from_vec3_0 = function (out, vec3) {
    out[0] = vec3[0];
    out[1] = vec3[1];
    out[2] = vec3[2];
    out[3] = 0;
    return out;
};

vec4_from_vec3_1 = function (out, vec3) {
    out[0] = vec3[0];
    out[1] = vec3[1];
    out[2] = vec3[2];
    out[3] = 1;
    return out;
};

exports.vec4fromvec3 = function(vec3, w) {
    return glMatrix.vec4.fromValues(vec3[0], vec3[1], vec3[2], w);
}

new_vec3_from_input = function (field_0, field_1, field_2) {
    var v0 = field_0.value;
    var v1 = field_1.value;
    var v2 = field_2.value;
    return glMatrix.vec3.fromValues(v0, v1, v2);
}

new_vec3_from_input_name = function (field_name_0, field_name_1, field_name_2) {
    var v0 = document.getElementById(field_name_0).value;
    var v1 = document.getElementById(field_name_1).value;
    var v2 = document.getElementById(field_name_2).value;
    return glMatrix.vec3.fromValues(v0, v1, v2);
}

