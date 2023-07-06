const JSZip = require("jszip");
const FileSaver = require("file-saver");
const { DOMParser, XMLSerializer } = require('xmldom');

class VTK_File {

    constructor() {
        this.decimals = 6;
    }

    SetData(texture_data, forward, dim_x, dim_y, dim_z) {
        this.texture_data = texture_data;
        this.forward = forward;
        this.dim_x = dim_x;
        this.dim_y = dim_y;
        this.dim_z = dim_z;

        this.GenerateXML();
    }

    GetFileContent(){
        return this.xml_string;
    }

    GenerateXML(){
        // Create a new XML document
        this.xmlDoc = new DOMParser().parseFromString("<VTKFile></VTKFile>", "application/xml");
        const rootElement = this.xmlDoc.documentElement;
        rootElement.setAttribute("type", "ImageData");
        rootElement.setAttribute("version", "0.1");
        rootElement.setAttribute("byte_order", "LittleEndian");

        const e_ImageData = this.xmlDoc.createElement("ImageData");
        e_ImageData.setAttribute("WholeExtent", this.GenerateExtentString());
        e_ImageData.setAttribute("Origin", "0 0 0");
        e_ImageData.setAttribute("Spacing", this.GenerateSpacingString());

        const e_Piece = this.xmlDoc.createElement("Piece");
        e_Piece.setAttribute("Extent", this.GenerateExtentString());

        const e_PointData = this.xmlDoc.createElement("PointData");
        e_PointData.setAttribute("Scalars", "scalars");

        const e_DataArray = this.xmlDoc.createElement("DataArray");
        e_DataArray.setAttribute("type", "Float32");
        e_DataArray.setAttribute("Name", "ImageScalars");
        e_DataArray.setAttribute("format", "ascii");
        e_DataArray.textContent = this.GenerateDataString();

        // Append child elements
        rootElement.appendChild(e_ImageData);
        e_ImageData.appendChild(e_Piece);
        e_Piece.appendChild(e_PointData);
        e_PointData.appendChild(e_DataArray);

        this.xml_string = new XMLSerializer().serializeToString(this.xmlDoc);
    }

    GenerateExtentString(){
        var dim_x = this.dim_x;
        var dim_y = this.dim_y;
        var dim_z = this.dim_z;

        var last_x = (dim_x-1);
        var last_y = (dim_y-1);
        var last_z = (dim_z-1);

        return "0 " + last_x.toString() + " 0 " + last_y.toString() + " 0 " + last_z.toString();
    }

    GenerateSpacingString(){
        var forward = this.forward;
        var dim_x = this.dim_x;
        var dim_y = this.dim_y;
        var dim_z = this.dim_z;
        var decimals = this.decimals;

        var d_x = 1 / (dim_x-1);
        var d_y = 1 / (dim_y-1);
        var d_z = 1 / (dim_z-1);

        return d_x.toFixed(decimals) + " " + d_y.toFixed(decimals) + " " + d_z.toFixed(decimals);
    }

    GenerateDataString(){
        var forward = this.forward;
        var dim_x = this.dim_x;
        var dim_y = this.dim_y;
        var dim_z = this.dim_z;
        var decimals = this.decimals;

        var offset = forward ? 0 : dim_z;
        var s = "";
        var add_space = false;
        for(var z = 0; z<dim_z; z++){
            for(var y = 0; y<dim_y; y++){
                for(var x = 0; x<dim_x; x++){
                    var z_texture = z + offset;      
                    var global_index_texture = x + y * dim_x + z_texture * dim_x * dim_y;
                    var scalar = this.texture_data[global_index_texture];
                    if(add_space){
                        s += " ";
                    }
                    s += scalar.toFixed(decimals);
                    add_space = true;
                }
            }
        }
        return s;
    }

}

module.exports = VTK_File;