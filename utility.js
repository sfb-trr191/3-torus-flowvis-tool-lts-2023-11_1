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