const glMatrix = require("gl-matrix");
const DataUnit = require("./data_unit");
const DataContainer = require("./data_container");
const {DataTextures, DataTexture3D_RGBA, DataTexture3D_R} = require("./data_textures");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");
const BVH_AA = require("./bvh_aa");
const module_utility = require("./utility");
const { rightArithShift } = require("mathjs");
const distancePointToLine = module_utility.distancePointToLine;

const module_math4D = require("./math4D");
const getAligned4DRotationMatrix = module_math4D.getAligned4DRotationMatrix;

class PolyLineSegment {

    constructor() {
        this.indexA = -1;
        this.indexB = -1;
        this.highestDistance = -1;
        this.indexHighestDistance = -1;
        this.hasInBetweenVertex = false;
    }

    //std::vector<int>& pointIndices, std::vector<PositionData> &pointDataVector
    CalculateDistances(pointIndices, pointDataVector) {
        //std::cout << "TODO PolyLineSegment::CalculateDistances" << std::endl;
        this.hasInBetweenVertex = (this.indexB - this.indexA) > 1;
        if (!this.hasInBetweenVertex)
            return;

        var iA = pointIndices[this.indexA];
        //console.log("pointDataVector[iA]", pointDataVector[iA])
        var vecA = glMatrix.vec3.create();
        vec3_from_vec4(vecA, pointDataVector[iA].position);

        var iB = pointIndices[this.indexB];
        var vecB = glMatrix.vec3.create();
        vec3_from_vec4(vecB, pointDataVector[iB].position);
        var direction = glMatrix.vec3.create();
        glMatrix.vec3.subtract(direction, vecB, vecA);
        glMatrix.vec3.normalize(direction, direction);

        //std::cout << "vecA: " << vecA.x() << ", "<< vecA.y() << ", "<<vecA.z() << std::endl;
        //std::cout << "vecB: " << vecB.x() << ", " << vecB.y() << ", " << vecB.z() << std::endl;
        for (var i = this.indexA + 1; i < this.indexB; i++) {
            var iC = pointIndices[i];
            var vecC = glMatrix.vec3.create();
            vec3_from_vec4(vecC, pointDataVector[iC].position);
            var distance = distancePointToLine(vecC, vecA, direction);
            //std::cout << "vecC: " << vecC.x() << ", " << vecC.y() << ", " << vecC.z() << std::endl;
            //std::cout << "distance: " << distance << std::endl;
            if (distance > this.highestDistance) {
                this.indexHighestDistance = i;
                this.highestDistance = distance;
            }
        }
        //std::cout << "indexHighestDistance: " << indexHighestDistance << ", highestDistance; " << highestDistance << std::endl;
    }

}

class PolyLine {

    constructor() {
        this.pointIndices = [];//list<int>
    }
}

class MultiPolyLine {

    constructor() {
        this.polyLines = [];//list<PolyLine>
        this.multiPolyID = -1;
    }
}

class LODDataPart{

    constructor(name, part_index, p_data_unit, p_streamline_context){
        this.name = name + "_" + part_index;
        this.p_data_unit = p_data_unit;
        this.p_streamline_context = p_streamline_context;
        this.p_raw_data = p_streamline_context.GetRawData(part_index);
        console.log("Generate part: " + this.name);
        this.vectorMultiPolyLines = [];
        this.vectorLineSegment = [];
        this.tree_nodes = [];

        this.data_container_positions = new DataContainer("positions"+part_index, new PositionData());
        this.data_container_line_segments = new DataContainer("line_segments"+part_index, new LineSegment());
        this.data_container_tree_nodes = new DataContainer("tree_nodes"+part_index, new TreeNode());

        this.p_data_unit.registerDataCollection(this.data_container_positions);
        this.p_data_unit.registerDataCollection(this.data_container_line_segments);
        this.p_data_unit.registerDataCollection(this.data_container_tree_nodes);
    }

    UpdateDataContainers(){
        this.data_container_positions.data = this.p_raw_data.position_data;
        this.data_container_line_segments.data = this.vectorLineSegment;
        this.data_container_tree_nodes.data = this.tree_nodes;
    }

    LogState() {
        console.log("LogState LOD: " + this.name);
        console.log("LogState segments: " + this.vectorLineSegment.length);
        console.log("LogState nodes: " + this.tree_nodes.length);
    }

}

/**
 * The LODData class manages one level of detail.
 * - Streamlines are extracted from the streamline generator and are stored as MultiPolyLines.
 * - They are then modified (e.g. simplified)
 * - Finally they are converted and stored in a DataUnit to be used as textures
 */
class LODData {

    /**
     * 
     * @param {string} name the name of the lod data
     */
    constructor(name, p_streamline_context, gl, gl_side) {
        console.log("Generate lod: " + name);
        this.name = name;
        this.douglasPeukerParameter = 0;
        this.data_unit = new DataUnit(name);
        this.list_part = [];
        this.list_part.push(new LODDataPart(name, 0, this.data_unit, p_streamline_context));
        this.list_part.push(new LODDataPart(name, 1, this.data_unit, p_streamline_context));

        //---start region: references
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.p_segment_duplicator = p_streamline_context.segment_duplicator;
        //this.p_raw_data = p_streamline_context.raw_data;
        this.p_lights = p_streamline_context.p_lights;
        this.p_ui_seeds = p_streamline_context.ui_seeds;
        //---end region: references

        //---start region: data unit 
        //this.data_container_dir_lights = new DataContainer("dir_lights", new DirLight());
        //this.data_container_streamline_color = new DataContainer("streamline_color", new StreamlineColor());
        //this.data_unit.registerDataCollection(this.data_container_dir_lights);
        //this.data_unit.registerDataCollection(this.data_container_streamline_color);
        //---end region: data unit 

        this.data_textures = new DataTextures(gl, this.data_unit);
        this.data_textures_side = new DataTextures(gl_side, this.data_unit);
    }

    Reset() {
        for(var i=0; i<this.list_part.length; i++){
            this.list_part[i].vectorMultiPolyLines = [];
            this.list_part[i].vectorLineSegment = [];
        }
    }

    ResetPart(part_index) {
        this.list_part[part_index].vectorMultiPolyLines = [];
        this.list_part[part_index].vectorLineSegment = [];
    }

    GetVectorMultiPolyLines(part_index){
        return this.list_part[part_index].vectorMultiPolyLines;
    }

    GetVectorLineSegment(part_index){
        return this.list_part[part_index].vectorLineSegment;
    }

    GetTreeNodes(part_index){
        return this.list_part[part_index].tree_nodes;
    }

    SetTreeNodes(part_index, tree_nodes){
        this.list_part[part_index].tree_nodes = tree_nodes;
    }

    ExtractMultiPolyLines(part_index) {
        console.log("ExtractMultiPolyLines", part_index);
        this.ResetPart(part_index);
        var raw_data = this.p_streamline_context.GetRawData(part_index);
        var streamline_generator = this.p_streamline_generator;

        var vectorMultiPolyLines = this.GetVectorMultiPolyLines(part_index);
        var direction = streamline_generator.direction;
        var multi = new MultiPolyLine();
        var poly = new PolyLine();
        var currentDirection;
        for (var seedIndex = 0; seedIndex < raw_data.num_seeds; seedIndex++) {
            var startIndex = raw_data.start_indices[seedIndex];//seedIndex * raw_data.num_points_per_streamline;
            var stopIndex = seedIndex < raw_data.num_seeds-1 ? raw_data.start_indices[seedIndex+1] : raw_data.data.length;
            var num_points_this_streamline = stopIndex - startIndex;
            //console.log("startIndex", startIndex);
            //console.log("stopIndex", stopIndex);
            //console.log("num_points_this_streamline", num_points_this_streamline);
            var oldFlag = 1337;
            var offset = 0;
            for (var offset = 0; offset < num_points_this_streamline; offset++) {
                var index = startIndex + offset;
                var flag = raw_data.data[index].flag;
                switch (flag) {
                    case -1://new polyline other direction
                        //console.log("case -1: new polyline other direction");
                        currentDirection = DIRECTION_BACKWARD;
                        poly.pointIndices.push(index);
                        break;
                    case 0://skip point
                        //console.log("case 0: skip point");
                        break;
                    case 1://new polyline
                        //console.log("case 1: new polyline");
                        currentDirection = DIRECTION_FORWARD;
                        poly.pointIndices.push(index);
                        break;
                    case 2://normal point
                        //console.log("case 2: normal point");
                        poly.pointIndices.push(index);
                        break;
                    case 3://end polyline
                        //console.log("case 3: end polyline");
                        poly.pointIndices.push(index);
                        if (poly.pointIndices.length == 1) {
                            console.log("Error size 1");
                        }
                        multi.polyLines.push(poly);
                        poly = new PolyLine();;//cleanup for next poly
                        break;
                    default://ERROR
                        console.log("Error unknown flag: ", flag);
                        break;
                }
                if (flag == oldFlag) {
                    if (flag == 3 || flag == 1 || flag == -1) {
                        console.log("Error consecutive flags: ", flag);
                    }
                }
                oldFlag = flag;
            }
            if (direction != DIRECTION_BOTH || currentDirection == DIRECTION_BACKWARD) {
                //the multi poly line ends for every seed in "direction=forward" or "direction=backward" mode
                //in "direction=both" mode, the multi poly ends if the current direction is backward
                //because seeds alternate forward and backward
                vectorMultiPolyLines.push(multi);
                multi = new MultiPolyLine();
            }
        }

        for (var i = 0; i < vectorMultiPolyLines.length; i++)
            vectorMultiPolyLines[i].multiPolyID = i;

        console.log("vectorMultiPolyLines: ", vectorMultiPolyLines);
        console.log("ExtractMultiPolyLines completed");
    }
    
    DouglasPeuker(part_index, lod_data_original) {
        console.log("DouglasPeuker: ", this.name, part_index);
        var originalVectorMultiPolyLines = lod_data_original.GetVectorMultiPolyLines(part_index);
        this.ResetPart(part_index);
        for (var i = 0; i < originalVectorMultiPolyLines.length; i++) {
            this.DouglasPeukerMulti(part_index, originalVectorMultiPolyLines[i]);
        }
        console.log("DouglasPeuker completed");
    }

    DouglasPeukerMulti(part_index, originalMulti) {
        var vectorMultiPolyLines = this.GetVectorMultiPolyLines(part_index);
        var newMulti = new MultiPolyLine();
        newMulti.multiPolyID = originalMulti.multiPolyID;
        for (var i = 0; i < originalMulti.polyLines.length; i++) {
            this.DouglasPeukerAddPoly(part_index, newMulti, originalMulti.polyLines[i]);
        }
        vectorMultiPolyLines.push(newMulti);

    }

    DouglasPeukerAddPoly(part_index, newMulti, originalPoly) {
        var raw_data = this.p_streamline_context.GetRawData(part_index);
        var numberOfPoints = originalPoly.pointIndices.length;
        var vectorKeep = new Array(numberOfPoints);//address via local index
        for (var i = 1; i < numberOfPoints - 1; i++) {
            vectorKeep[i] = false;
        }
        vectorKeep[0] = true;
        vectorKeep[numberOfPoints - 1] = true;

        var segment = new PolyLineSegment();
        segment.indexA = 0;//address via local index
        segment.indexB = numberOfPoints - 1;//address via local index
        var stack = [];//stack<PolyLineSegment>
        stack.push(segment);

        while (stack.length > 0) {
            var segment = stack.pop();
            //std::cout << "pop: " << segment.indexA << ", " << segment.indexB << std::endl;

            segment.CalculateDistances(originalPoly.pointIndices, raw_data.data);
            if (segment.hasInBetweenVertex && segment.highestDistance > this.douglasPeukerParameter) {
                //std::cout << "segment split: " << segment.indexA << ", " << segment.indexB << std::endl;
                //std::cout << "segment.highestDistance: " << segment.highestDistance << std::endl;
                //indexVector.push_back(pointIDs->GetId(segment.indexHighestDistance));
                vectorKeep[segment.indexHighestDistance] = true;//address via local index

                var segmentLow = new PolyLineSegment();
                segmentLow.indexA = segment.indexA;//address via local index
                segmentLow.indexB = segment.indexHighestDistance;//address via local index
                stack.push(segmentLow);
                //std::cout << "push: " << segmentLow.indexA << ", " << segmentLow.indexB << std::endl;

                var segmentHigh = new PolyLineSegment();
                segmentHigh.indexA = segment.indexHighestDistance;//address via local index
                segmentHigh.indexB = segment.indexB;//address via local index
                stack.push(segmentHigh);
                //std::cout << "push: " << segmentHigh.indexA << ", " << segmentHigh.indexB << std::endl;
            }
            else {
                continue;
            }
        }

        var newPoly = new PolyLine();
        for (var localIndex = 0; localIndex < numberOfPoints; localIndex++) {
            if (vectorKeep[localIndex]) {
                var globalIndex = originalPoly.pointIndices[localIndex];
                newPoly.pointIndices.push(globalIndex);
            }
        }
        newMulti.polyLines.push(newPoly);
    }

    GenerateLineSegments(part_index) {
        console.log("GenerateLineSegments", part_index);
        var vectorMultiPolyLines = this.GetVectorMultiPolyLines(part_index);
        var vectorLineSegment = this.GetVectorLineSegment(part_index);
        for (var i = 0; i < vectorMultiPolyLines.length; i++) {
            var m = vectorMultiPolyLines[i];
            for (var j = 0; j < m.polyLines.length; j++) {
                var p = m.polyLines[j];
                for (var k = 1; k < p.pointIndices.length; k++) {
                    var segment = new LineSegment();
                    segment.indexA = p.pointIndices[k - 1];
                    segment.indexB = p.pointIndices[k];
                    segment.multiPolyID = m.multiPolyID;
                    segment.copy = 0;
                    segment.beginning = (k == 1) ? 1 : 0;
                    vectorLineSegment.push(segment);
                }
            }
        }
        console.log("GenerateLineSegments completed");
        //console.log("this.vectorLineSegment [", vectorLineSegment.length, "]: ", vectorLineSegment);
    }

    CalculateMatrices(part_index, space) {
        console.log("CalculateMatrices", part_index, space);
        var raw_data = this.p_streamline_context.GetRawData(part_index);
        var vectorLineSegment = this.GetVectorLineSegment(part_index);
        for (var i = 0; i < vectorLineSegment.length; i++) {
            var projection_index = -1;
            var matrixCombined = this.CalculateMatrix(part_index, space, i, projection_index);
            var matrixInverted = glMatrix.mat4.create();
            glMatrix.mat4.invert(matrixInverted, matrixCombined);//matrixInverted = matrixCombined.inverted();
            vectorLineSegment[i].matrix = matrixCombined;
            vectorLineSegment[i].matrix_inv = matrixInverted;
            
            for (var projection_index=0; projection_index<4; projection_index++){
                var matrix = this.CalculateMatrix(part_index, space, i, projection_index);
                var matrix_inv = glMatrix.mat4.create();
                glMatrix.mat4.invert(matrix_inv, matrix);
                vectorLineSegment[i].list_matrix_projection[projection_index] = matrix;
                vectorLineSegment[i].list_matrix_projection_inv[projection_index] = matrix_inv;
            }
        }
        console.log("CalculateMatrices completed");
    }

    CalculateMatrix(part_index, space, segment_index, projection_index){
        if(space == SPACE_3_SPHERE_4_PLUS_4D && part_index == PART_INDEX_DEFAULT){
            return this.CalculateMatrix4D(part_index, segment_index, projection_index);
        }else{
            return this.CalculateMatrix3D(part_index, segment_index, projection_index);
        }
    }

    CalculateMatrix3D(part_index, segment_index, projection_index){
        if(projection_index >= 3){
            return glMatrix.mat4.create();
        }

        var raw_data = this.p_streamline_context.GetRawData(part_index);
        var vectorLineSegment = this.GetVectorLineSegment(part_index);

        var matrixTranslation = glMatrix.mat4.create();
        var matrixRotation1 = glMatrix.mat4.create();
        var matrixRotation2 = glMatrix.mat4.create();
        var matrixRotation3 = glMatrix.mat4.create();
        var matrixCombined = glMatrix.mat4.create();

        var posA_ws = glMatrix.vec4.create();
        var posB_ws = glMatrix.vec4.create();
        var posA_os = glMatrix.vec4.create();
        var posB_os = glMatrix.vec4.create();

        var translation_vector = glMatrix.vec3.create();
        var axis_x = glMatrix.vec3.fromValues(1, 0, 0);
        var axis_y = glMatrix.vec3.fromValues(0, 1, 0);

        //std::cout << "------------------------------" << i << std::endl;
        //std::cout << "SEGMENT: " << i << std::endl;
        //calculate translation matrix
        var lineSegment = vectorLineSegment[segment_index];
        var indexA = lineSegment.indexA;
        var indexB = lineSegment.indexB;
        glMatrix.vec4.copy(posA_ws, raw_data.data[indexA].position);//vec4
        glMatrix.vec4.copy(posB_ws, raw_data.data[indexB].position);//vec4
        posA_ws[projection_index] = 0;
        posB_ws[projection_index] = 0;
        //std::cout << "posA_ws: " << posA_ws.x() << ", " << posA_ws.y() << ", " << posA_ws.z() << std::endl;
        //std::cout << "posB_ws: " << posB_ws.x() << ", " << posB_ws.y() << ", " << posB_ws.z() << std::endl;
        vec3_from_vec4(translation_vector, posA_ws);
        glMatrix.vec3.negate(translation_vector, translation_vector);
        glMatrix.mat4.fromTranslation(matrixTranslation, translation_vector);//matrixTranslation.translate(-1 * posA_ws.toVector3D());

        glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixTranslation);//var posA_os = matrixTranslation * posA_ws;//vec4
        glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixTranslation);//var posB_os = matrixTranslation * posB_ws;//vec4
        //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
        //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;

        //calculate rotation matrix (rotate around y)
        var x = posB_os[0];
        var z = posB_os[2];
        var angle_y_rad = Math.atan2(-x, z);//angleY = (Math.atan2(-x, z)) * 180 / M_PI;
        //std::cout << "angle_y_rad: " << angle_y_rad << std::endl;
        glMatrix.mat4.fromRotation(matrixRotation1, angle_y_rad, axis_y);//matrixRotation1.rotate(angle_y_degree, QVector3D(0, 1, 0));

        //combine matrices
        glMatrix.mat4.multiply(matrixCombined, matrixRotation1, matrixTranslation);//matrixCombined = matrixRotation1 * matrixTranslation;
        glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixCombined);//posA_os = matrixCombined * posA_ws;
        glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixCombined);//posB_os = matrixCombined * posB_ws;
        //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
        //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;

        //calculate rotation matrix (rotate around x)
        var y = posB_os[1];
        z = posB_os[2];
        var angle_x_rad = Math.atan2(y, z);//angleX = (Math.atan2(y, z)) * 180 / M_PI;
        //std::cout << "angle_x_rad: " << angle_x_rad << std::endl;
        glMatrix.mat4.fromRotation(matrixRotation2, angle_x_rad, axis_x);//matrixRotation2.rotate(angle_x_degree, QVector3D(1, 0, 0));

        //combine matrices
        glMatrix.mat4.multiply(matrixCombined, matrixRotation2, matrixCombined);//matrixCombined = matrixRotation2 * matrixRotation1 * matrixTranslation;
        glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixCombined);//posA_os = matrixCombined * posA_ws;
        glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixCombined);//posB_os = matrixCombined * posB_ws;
        //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
        //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;

        if (posB_os[2] < posA_os[2]) {
            glMatrix.mat4.fromRotation(matrixRotation3, Math.PI, axis_x);//rotate.rotate(180, QVector3D(1, 0, 0));
            glMatrix.mat4.multiply(matrixCombined, matrixRotation3, matrixCombined);//matrixCombined = rotate * matrixCombined;
            glMatrix.vec4.transformMat4(posA_os, posA_ws, matrixCombined);//posA_os = matrixCombined * posA_ws;
            glMatrix.vec4.transformMat4(posB_os, posB_ws, matrixCombined);//posB_os = matrixCombined * posB_ws;
            //std::cout << "posA_os: " << posA_os.x() << ", " << posA_os.y() << ", " << posA_os.z() << std::endl;
            //std::cout << "posB_os: " << posB_os.x() << ", " << posB_os.y() << ", " << posB_os.z() << std::endl;
        }

        return matrixCombined;
    }

    CalculateMatrix4D(part_index, segment_index, projection_index){
        console.log("CalculateMatrix4D");
        var raw_data = this.p_streamline_context.GetRawData(part_index);
        var vectorLineSegment = this.GetVectorLineSegment(part_index);

        var lineSegment = vectorLineSegment[segment_index];
        var indexA = lineSegment.indexA;
        var indexB = lineSegment.indexB;
        var posA_ws = glMatrix.vec4.create();
        var posB_ws = glMatrix.vec4.create();
        glMatrix.vec4.copy(posA_ws, raw_data.data[indexA].position);//vec4
        glMatrix.vec4.copy(posB_ws, raw_data.data[indexB].position);//vec4
        posA_ws[projection_index] = 0;
        posB_ws[projection_index] = 0;

        var point_B_translated = glMatrix.vec4.create();
        glMatrix.vec4.subtract(point_B_translated, posB_ws, posA_ws);

        var matrix = getAligned4DRotationMatrix(point_B_translated);
        return matrix;
    }

    CalculateBVH(part_index) {
        console.log("CalculateBVH");
        var raw_data = this.p_streamline_context.GetRawData(part_index);
        var vectorLineSegment = this.GetVectorLineSegment(part_index);
        //var tree_nodes = this.GetTreeNodes(part_index);

        var bvh = new BVH_AA();
        var tubeRadius = this.p_streamline_generator.tubeRadius;
        var maxCost = -1;
        var growthID = -1;
        var volume_threshold = 0.0001;
        bvh.GenerateTree(raw_data.data, vectorLineSegment, tubeRadius, maxCost, growthID, volume_threshold);
        var tree_nodes = bvh.ConvertNodes();
        this.SetTreeNodes(part_index, tree_nodes);
        //console.log("tree_nodes: " + this.tree_nodes);
        console.log("CalculateBVH completed");
    }

    UpdateDataUnit() {
        console.log("UpdateDataUnit");
        //this.data_container_positions.data = this.p_raw_data.position_data;
        //this.data_container_line_segments.data = this.vectorLineSegment;
        //this.data_container_tree_nodes.data = this.tree_nodes;
        for(var i=0; i<this.list_part.length; i++){
            this.list_part[i].UpdateDataContainers();
        }
        this.data_unit.generateArrays();
        console.log("UpdateDataUnit completed");
    }

    UpdateDataTextures(gl, gl_side) {
        console.log("UpdateDataTextures");
        this.data_textures.update(gl);
        this.data_textures_side.update(gl_side);
        console.log("UpdateDataTextures completed");
    }

    bind(context_name, canvas_wrapper_name, gl, shader_uniforms, location_texture_float, location_texture_int) {
        //console.warn("context_name", context_name)
        var data_textures = canvas_wrapper_name == CANVAS_WRAPPER_MAIN ? this.data_textures : this.data_textures_side;

        var texture_float_binding = context_name == "static" ? gl.TEXTURE0 : gl.TEXTURE6;
        var texture_int_binding = context_name == "static" ? gl.TEXTURE1 : gl.TEXTURE7;
        var location_texture_float_value = context_name == "static" ? 0 : 6;
        var location_texture_int_value = context_name == "static" ? 1 : 7;
        var prefix = context_name == "static" ? "start_index_" : "start_index_dynamic_";


        gl.activeTexture(texture_float_binding);                  // added this and following line to be extra sure which texture is being used...
        gl.bindTexture(gl.TEXTURE_3D, data_textures.texture_float.texture);
        gl.uniform1i(location_texture_float, location_texture_float_value);
        gl.activeTexture(texture_int_binding);
        gl.bindTexture(gl.TEXTURE_3D, data_textures.texture_int.texture);
        gl.uniform1i(location_texture_int, location_texture_int_value);

        for(var part_index=0; part_index<this.list_part.length; part_index++){
            shader_uniforms.setUniform(prefix+"int_position_data"+part_index, this.data_unit.getIntStart("positions"+part_index));
            shader_uniforms.setUniform(prefix+"int_line_segments"+part_index, this.data_unit.getIntStart("line_segments"+part_index));
            shader_uniforms.setUniform(prefix+"int_tree_nodes"+part_index, this.data_unit.getIntStart("tree_nodes"+part_index));
            
            shader_uniforms.setUniform(prefix+"float_position_data"+part_index, this.data_unit.getFloatStart("positions"+part_index));
            shader_uniforms.setUniform(prefix+"float_line_segments"+part_index, this.data_unit.getFloatStart("line_segments"+part_index));
            shader_uniforms.setUniform(prefix+"float_tree_nodes"+part_index, this.data_unit.getFloatStart("tree_nodes"+part_index));
        }

        shader_uniforms.updateUniforms();
    }

    GenerateLineSegmentCopies(part_index) {
        console.log("GenerateLineSegmentCopies");
        this.p_segment_duplicator.GenerateLineSegmentCopies(part_index, this);
        console.log("GenerateLineSegmentCopies completed");
    }

    LogState() {
        for(var i=0; i<this.list_part.length; i++){
            this.list_part[i].LogState();
        }
    }
}

module.exports = LODData;