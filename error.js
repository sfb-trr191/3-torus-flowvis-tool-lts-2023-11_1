//WEB GL ERRORS

var ERROR_ID_GET_WEB_GL_CONTEXT = 1001;
var ERROR_TEXT_GET_WEB_GL_CONTEXT = "Failed to use WebGL 2.0 context."
+ " Your browser or device may not support WebGL 2.0.";

var error_dictionary;

function buildErrorDictionary(){
    error_dictionary = {};

    //WEB GL ERRORS
    error_dictionary[ERROR_ID_GET_WEB_GL_CONTEXT] = ERROR_TEXT_GET_WEB_GL_CONTEXT;

}

function displayError(error_id){
    var paragraph = document.querySelector("p");
    paragraph.innerHTML = "Error: " + error_id + ". " + error_dictionary[error_id];
}