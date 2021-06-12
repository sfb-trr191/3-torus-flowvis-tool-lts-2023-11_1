function getMousePosition(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    return {
        x : x,
        y : y
    };
}

function getMousePositionPercentage(canvas, event) {
    let rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    let y = (event.clientY - rect.top) / rect.height;
    return {
        x : x,
        y : y
    };
}

function GetIndexInList(value, vector){
    for (var i = 0; i < vector.length; i++)
    {
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
function distancePointToLine(p, a, n){

    var a_minus_p = glMatrix.vec3.create();
    glMatrix.vec3.subtract(a_minus_p, a, p);

    var a_minus_p_cross_n = glMatrix.vec3.create();
    glMatrix.vec3.cross(a_minus_p_cross_n, a_minus_p, n);

    var magnitude_a_minus_p_cross_n = glMatrix.vec3.length(a_minus_p_cross_n);
    var magnitude_n = glMatrix.vec3.length(n);

    return magnitude_a_minus_p_cross_n / magnitude_n;
}