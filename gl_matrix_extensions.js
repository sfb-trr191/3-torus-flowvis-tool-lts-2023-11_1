vec3_add_scalar = function(out, a, s) {
    out[0] = a[0] + s;
    out[1] = a[1] + s;
    out[2] = a[2] + s;
    return out;
};

vec3_subtract_scalar = function(out, a, s) {
    out[0] = a[0] - s;
    out[1] = a[1] - s;
    out[2] = a[2] - s;
    return out;
};