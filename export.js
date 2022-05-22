const JSZip = require("jszip");
const FileSaver = require("file-saver");

exports.Export = function(input_parameter_wrapper) {
    console.log("Export");
    document.getElementById("button_dialog_export_export").disabled = true;
    var zip = new JSZip();
    var dir_name = document.getElementById("input_thumbnail_directory").value;
    var file_name = document.getElementById("input_thumbnail_name").value;
    var file_name_right = document.getElementById("input_thumbnail_name_right").value;

    var use_data_array = false;
    var is_export = true;
    var query_string = input_parameter_wrapper.toQueryString(use_data_array, is_export);
    console.log(query_string["default"]);

    //direct loading for latex
    var url_without_query = window.location.toString().replace(window.location.search, "");
    var url_default = url_without_query + query_string["default"];
    var url_embedded = url_without_query + query_string["embedded_main"];
    var url_embedded_r = url_without_query + query_string["embedded_aux"];
    zip.file("latex/latex_main.txt", GenerateExportString_Latex(url_default, dir_name+file_name));
    zip.file("latex/latex_aux.txt", GenerateExportString_Latex(url_default, dir_name+file_name_right));
    //zip.file("latex/latex_embedded_left.txt", GenerateExportString_Latex(url_embedded, dir_name+file_name));
    //zip.file("latex/latex_embedded_right.txt", GenerateExportString_Latex(url_embedded_r, dir_name+file_name_right));
    zip.file("url/direct/url_default.txt", url_default);
    zip.file("url/direct/url_embedded_main.txt", url_embedded);
    zip.file("url/direct/url_embedded_aux.txt", url_embedded_r);

    //lazy loading for html
    url_without_query = url_without_query.replace("index", "lazy");
    var url_default = url_without_query + query_string["default"];
    var url_embedded = url_without_query + query_string["embedded_main"];
    var url_embedded_r = url_without_query + query_string["embedded_aux"];
    zip.file("html/html_default.txt", GenerateExportString_HTML(url_default, "iframe_3_torus_flowvis_tool_default"));
    zip.file("html/html_embedded_main.txt", GenerateExportString_HTML(url_embedded, "iframe_3_torus_flowvis_tool_embedded_main"));
    zip.file("html/html_embedded_aux.txt", GenerateExportString_HTML(url_embedded_r, "iframe_3_torus_flowvis_tool_embedded_aux"));
    zip.file("url/lazy/url_default.txt", url_default);
    zip.file("url/lazy/url_embedded_main.txt", url_embedded);
    zip.file("url/lazy/url_embedded_aux.txt", url_embedded_r);

    main_canvas.toBlob(function (blob) {
        zip.file(file_name+".png", blob);
        side_canvas.toBlob(function (blob) {
            zip.file(file_name_right+".png", blob);
            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    FileSaver.saveAs(content, "RVF-exported.zip");
                    document.getElementById("button_dialog_export_export").disabled = false;
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