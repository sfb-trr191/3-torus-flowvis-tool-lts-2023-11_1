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