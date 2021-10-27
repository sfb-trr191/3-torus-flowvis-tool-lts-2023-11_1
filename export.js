const JSZip = require("jszip");
const FileSaver = require("file-saver");

exports.Export = function(input_parameter_wrapper) {
    console.log("Export");
    document.getElementById("button_export").disabled = true;
    var zip = new JSZip();
    var dir_name = document.getElementById("input_thumbnail_directory").value;
    var file_name = document.getElementById("input_thumbnail_name").value;
    var file_name_right = document.getElementById("input_thumbnail_name_right").value;

    
    var query_string = input_parameter_wrapper.toQueryString();
    var url_without_query = window.location.toString().replace(window.location.search, "");
    url_without_query = url_without_query.replace("index", "lazy");
    var url_default = url_without_query + query_string +"&style=" + STYLE_DEFAULT;
    var url_embedded = url_without_query + query_string +"&style=" + STYLE_EMBEDDED;
    var url_embedded_r = url_without_query + query_string +"&style=" + STYLE_EMBEDDED_RIGHT;
    //console.log("query_string: ", query_string);
    //console.log("window.location.href: ", window.location.href);
    //console.log("url_without_query: ", url_without_query);
    //console.log("url_default: ", url_default);
    //console.log("url_embedded: ", url_embedded);

    zip.file("latex/latex_default.txt", GenerateExportString_Latex(url_default, dir_name+file_name));
    zip.file("latex/latex_embedded_left.txt", GenerateExportString_Latex(url_embedded, dir_name+file_name));
    zip.file("latex/latex_embedded_right.txt", GenerateExportString_Latex(url_embedded_r, dir_name+file_name_right));
    zip.file("html/html_default.txt", GenerateExportString_HTML(url_default, "iframe_reeb_vector_fields_default"));
    zip.file("html/html_embedded_left.txt", GenerateExportString_HTML(url_embedded, "iframe_reeb_vector_fields_embedded_left"));
    zip.file("html/html_embedded_right.txt", GenerateExportString_HTML(url_embedded_r, "iframe_reeb_vector_fields_embedded_right"));
    zip.file("url/url_default.txt", url_default);
    zip.file("url/url_embedded_left.txt", url_embedded);
    zip.file("url/url_embedded_right.txt", url_embedded_r);

    main_canvas.toBlob(function (blob) {
        zip.file(file_name+".png", blob);
        side_canvas.toBlob(function (blob) {
            zip.file(file_name_right+".png", blob);
            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    FileSaver.saveAs(content, "RVF-exported.zip");
                    document.getElementById("button_export").disabled = false;
                });
        });  
    });  

    /*
    main_canvas.toBlob(function (blob) {
        zip.file(file_name+".png", blob, {binary:true});
    });  
    
    side_canvas.toBlob(function (blob) {
        zip.file(file_name+"2.png", blob, {binary:true});
    });

    zip.generateAsync({ type: "blob" })
    .then(function (content) {
        FileSaver.saveAs(content, "RVF-exported.zip");
        document.getElementById("button_export").disabled = false;
    });
    */

    /*
    main_canvas.toBlob(function (blob) {
        zip.file(file_name+".png", blob);
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                FileSaver.saveAs(content, "RVF-exported.zip");
                document.getElementById("button_export").disabled = false;
            });
    });  
    */
}

function GenerateExportString_Latex(url, file_name){
    var latex = "\\href{"+url+"}{\\includegraphics[width=\\textwidth]{"+file_name+"}}";
    return latex;    
}

function GenerateExportString_HTML(url, class_name){
    var html = '<iframe class="'+class_name+'" src="'+url+'"></iframe>';
    return html;    
}