const module_const = require("./const");
; (function () {
    "use strict"
    window.addEventListener("load", onStart, false);

    function onStart(evt) {
        //console.log("onStart");
        window.removeEventListener(evt.type, onStart, false);

        setThumbnail();
        
        document.getElementById("message_display").innerHTML = "click to interact";
        document.getElementById("image_thumbnail").addEventListener("click", function () {
            redirect();
        });
    }

    function setThumbnail(){
        const urlParams = new URLSearchParams(window.location.search);
        const style = urlParams.get(PARAM_STYLE);
        const thumbnail_url = urlParams.get(PARAM_THUMBNAIL);
        const thumbnail_url_right = urlParams.get(PARAM_THUMBNAIL_RIGHT);
        //console.log("thumbnail_url:", thumbnail_url)
        var url = thumbnail_url;
        if(style == STYLE_EMBEDDED_RIGHT){
            var url = thumbnail_url_right;
        }

        var invalid_thumbnail = url === null || url === "";
        if(!invalid_thumbnail)
            document.getElementById("image_thumbnail").src = url;
    }

    function redirect() {
        var query = window.location.search;
        var url_without_query = window.location.toString().replace(window.location.search, "");
        url_without_query = url_without_query.replace("lazy", "index");
        var new_url = url_without_query + query;
        window.location.href = new_url; 
    }
})();