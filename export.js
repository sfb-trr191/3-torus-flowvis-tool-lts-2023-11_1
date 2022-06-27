const JSZip = require("jszip");
const FileSaver = require("file-saver");

class ExportObject{
    constructor(task){
        this.task = task;
        this.finished = false;
    }

    startExport(input_parameter_wrapper, ui_tools){
        console.log("Export: ");

        var zip = new JSZip();
        if(this.task == TASK_EXPORT_THUMBNAIL){
            var layout_key_state = ui_tools.getSelectedLayoutKey();
            var url_state = input_parameter_wrapper.toURL(layout_key_state, false);
            zip.file("url_direct_state.txt", url_state);
            this.save(zip, "3-torus_export_thumbnails.zip", "", "thumbnail_main", "thumbnail_aux");
        }
        else if(this.task == TASK_EXPORT_LATEX){
            var image_dir_name = document.getElementById("input_latex_image_directory").value;
            var file_name_main = document.getElementById("input_latex_image_name_main").value;
            var file_name_aux = document.getElementById("input_latex_image_name_aux").value;

            var layout_key_state = ui_tools.getSelectedLayoutKey();
            var layout_key_main = document.getElementById("select_override_layout_main").value;
            var layout_key_aux = document.getElementById("select_override_layout_aux").value;
            var url_state = input_parameter_wrapper.toURL(layout_key_state, false);
            var url_main = input_parameter_wrapper.toURL(layout_key_main, false);
            var url_aux = input_parameter_wrapper.toURL(layout_key_aux, false);
            var url_lazy_state = input_parameter_wrapper.toURL(layout_key_state, true);
            var url_lazy_main = input_parameter_wrapper.toURL(layout_key_main, true);
            var url_lazy_aux = input_parameter_wrapper.toURL(layout_key_aux, true);
            zip.file("latex/latex_main.txt", GenerateExportString_Latex(url_main, image_dir_name+file_name_main));
            zip.file("latex/latex_aux.txt", GenerateExportString_Latex(url_aux, image_dir_name+file_name_main));
            zip.file("url/url_direct_state.txt", url_state);
            zip.file("url/url_direct_main.txt", url_main);
            zip.file("url/url_direct_aux.txt", url_aux);
            zip.file("url/url_lazy_state.txt", url_lazy_state);
            zip.file("url/url_lazy_main.txt", url_lazy_main);
            zip.file("url/url_lazy_aux.txt", url_lazy_aux);
            zip.file("html/html_default.txt", GenerateExportString_HTML(url_lazy_state, "iframe_3_torus_flowvis_tool_default"));
            zip.file("html/html_main.txt", GenerateExportString_HTML(url_lazy_main, "iframe_3_torus_flowvis_tool_embedded_main"));
            zip.file("html/html_aux.txt", GenerateExportString_HTML(url_lazy_aux, "iframe_3_torus_flowvis_tool_embedded_aux"));
            this.save(zip, "3-torus_export_content.zip", image_dir_name, file_name_main, file_name_aux);
        }     
    }


    save(zip, file_name_zip, image_dir_name, file_name_main, file_name_aux){
        var that = this;
        var path_main = image_dir_name+file_name_main+".png";
        var path_aux = image_dir_name+file_name_aux+".png";
        console.log("Export: path_main", path_main);
        console.log("Export: path_aux", path_aux);
        main_canvas.toBlob(function (blob) {
            zip.file(path_main, blob);
            side_canvas.toBlob(function (blob) {
                zip.file(path_aux, blob);
                zip.generateAsync({ type: "blob" })
                    .then(function (content) {
                        FileSaver.saveAs(content, file_name_zip);
                        //document.getElementById("button_dialog_export_export").disabled = false;
                        that.finished = true;
                    });
            });  
        });  
    }
}

module.exports = ExportObject;

function GenerateExportString_Latex(url, file_name){
    var latex = "\\href{"+url+"}{\\includegraphics[width=\\textwidth]{"+file_name+"}}";
    return latex;    
}

function GenerateExportString_HTML(url, class_name){
    var html = '<iframe class="'+class_name+'" src="'+url+'"></iframe>';
    return html;    
}