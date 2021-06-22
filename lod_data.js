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
    constructor(name, p_streamline_context, gl) {
        console.log("Generate lod: " + name);
        this.name = name;
        this.vectorMultiPolyLines = [];
        this.vectorLineSegment = [];
        this.tree_nodes = [];
        this.douglasPeukerParameter = 0;

        //---start region: references
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.p_segment_duplicator = p_streamline_context.segment_duplicator;
        this.p_raw_data = p_streamline_context.raw_data;
        this.p_lights = p_streamline_context.p_lights;
        this.p_ui_seeds = p_streamline_context.ui_seeds;
        //---end region: references

        //---start region: data unit 
        this.data_unit = new DataUnit(name);
        this.data_container_dir_lights = new DataContainer("dir_lights", new DirLight());
        this.data_container_positions = new DataContainer("positions", new PositionData());
        this.data_container_line_segments = new DataContainer("line_segments", new LineSegment());
        this.data_container_tree_nodes = new DataContainer("tree_nodes", new TreeNode());
        this.data_container_streamline_color = new DataContainer("streamline_color", new StreamlineColor());
        this.data_unit.registerDataCollection(this.data_container_dir_lights);
        this.data_unit.registerDataCollection(this.data_container_positions);
        this.data_unit.registerDataCollection(this.data_container_line_segments);
        this.data_unit.registerDataCollection(this.data_container_tree_nodes);
        this.data_unit.registerDataCollection(this.data_container_streamline_color);
        //---end region: data unit 

        this.data_textures = new DataTextures(gl, this.data_unit);
    }

    Reset() {
        this.vectorMultiPolyLines = [];
        this.vectorLineSegment = [];
    }

    ExtractMultiPolyLines() {
        console.log("ExtractMultiPolyLines");
        this.Reset();

        var direction = this.p_streamline_generator.direction;
        var multi = new MultiPolyLine();
        var poly = new PolyLine();
        var currentDirection;
        for (var seedIndex = 0; seedIndex < this.p_raw_data.num_seeds; seedIndex++) {
            var startIndex = seedIndex * this.p_raw_data.num_points_per_streamline;
            var oldFlag = 1337;
            for (var offset = 0; offset < this.p_raw_data.num_points_per_streamline; offset++) {
                var index = startIndex + offset;
                var flag = this.p_raw_data.data[index].position[3];
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
                this.vectorMultiPolyLines.push(multi);
                multi = new MultiPolyLine();
            }
        }

        for (var i = 0; i < this.vectorMultiPolyLines.length; i++)
            this.vectorMultiPolyLines[i].multiPolyID = i;

        console.log("this.vectorMultiPolyLines: ", this.vectorMultiPolyLines);
        console.log("ExtractMultiPolyLines completed");
    }

    DouglasPeuker(lod_data_original) {
        console.log("DouglasPeuker: ", this.name);
        this.Reset();
        for (var i = 0; i < lod_data_original.vectorMultiPolyLines.length; i++) {
            this.DouglasPeukerMulti(lod_data_original.vectorMultiPolyLines[i]);
        }
        //lod_data_original.LogState();
        //this.LogState();
        console.log("DouglasPeuker completed");
    }

    DouglasPeukerMulti(originalMulti) {
        var newMulti = new MultiPolyLine();
        newMulti.multiPolyID = originalMulti.multiPolyID;
        for (var i = 0; i < originalMulti.polyLines.length; i++) {
            this.DouglasPeukerAddPoly(newMulti, originalMulti.polyLines[i]);
        }
        this.vectorMultiPolyLines.push(newMulti);

    }

    DouglasPeukerAddPoly(newMulti, originalPoly) {
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

            segment.CalculateDistances(originalPoly.pointIndices, this.p_raw_data.data);
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

    GenerateLineSegments() {
        console.log("GenerateLineSegments");
        for (var i = 0; i < this.vectorMultiPolyLines.length; i++) {
            var m = this.vectorMultiPolyLines[i];
            for (var j = 0; j < m.polyLines.length; j++) {
                var p = m.polyLines[j];
                for (var k = 1; k < p.pointIndices.length; k++) {
                    var segment = new LineSegment();
                    segment.indexA = p.pointIndices[k - 1];
                    segment.indexB = p.pointIndices[k];
                    segment.multiPolyID = m.multiPolyID;
                    segment.copy = 0;
                    segment.beginning = (k == 1) ? 1 : 0;
                    this.vectorLineSegment.push(segment);
                }
            }
        }
        console.log("GenerateLineSegments completed");
        console.log("this.vectorLineSegment [", this.vectorLineSegment.length, "]: ", this.vectorLineSegment);
    }

    CalculateMatrices() {
        console.log("CalculateMatrices");
        for (var i = 0; i < this.vectorLineSegment.length; i++) {
            var matrixTranslation = glMatrix.mat4.create();
            var matrixRotation1 = glMatrix.mat4.create();
            var matrixRotation2 = glMatrix.mat4.create();
            var matrixRotation3 = glMatrix.mat4.create();
            var matrixCombined = glMatrix.mat4.create();
            var matrixInverted = glMatrix.mat4.create();

            var posA_os = glMatrix.vec4.create();
            var posB_os = glMatrix.vec4.create();

            var translation_vector = glMatrix.vec3.create();
            var axis_x = glMatrix.vec3.fromValues(1, 0, 0);
            var axis_y = glMatrix.vec3.fromValues(0, 1, 0);

            //std::cout << "------------------------------" << i << std::endl;
            //std::cout << "SEGMENT: " << i << std::endl;
            //calculate translation matrix
            var lineSegment = this.vectorLineSegment[i];
            var indexA = lineSegment.indexA;
            var indexB = lineSegment.indexB;
            var posA_ws = this.p_raw_data.data[indexA].position;//vec4
            var posB_ws = this.p_raw_data.data[indexB].position;//vec4
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

            glMatrix.mat4.invert(matrixInverted, matrixCombined);//matrixInverted = matrixCombined.inverted();

            this.vectorLineSegment[i].matrix = matrixCombined;
            this.vectorLineSegment[i].matrix_inv = matrixInverted;
            //console.log("posA_os: ", posA_os);
            //console.log("posB_os: ", posB_os);
            /*
            console.log("-----------------: ");
            console.log("matrixCombined: ", matrixCombined);
            console.log("matrixInverted: ", matrixInverted);
            var a = glMatrix.vec4.create();
            var b = glMatrix.vec4.create();
            var a2 = glMatrix.vec4.create();
            var b2 = glMatrix.vec4.create();
            var diff = glMatrix.vec4.create();
            glMatrix.vec4.transformMat4(a, posA_ws, matrixCombined);
            glMatrix.vec4.transformMat4(b, posB_ws, matrixCombined);
            glMatrix.vec4.transformMat4(a2, a, matrixInverted);
            glMatrix.vec4.transformMat4(b2, b, matrixInverted);
            //glMatrix.vec4.subtract(diff, c, a);
            console.log("posA_ws: ", posA_ws);
            console.log("posB_ws: ", posB_ws);
            console.log("posA_os: ", a);
            console.log("posB_os: ", b);
            console.log("posA_2: ", a2);
            console.log("posB_2: ", b2);
            */
        }
        console.log("CalculateMatrices completed");
    }

    CalculateBVH() {
        console.log("CalculateBVH");
        var bvh = new BVH_AA();
        var tubeRadius = this.p_streamline_generator.tubeRadius;
        var maxCost = -1;
        var growthID = -1;
        var volume_threshold = 0.0001;
        bvh.GenerateTree(this.p_raw_data.data, this.vectorLineSegment, tubeRadius, maxCost, growthID, volume_threshold);
        this.tree_nodes = bvh.ConvertNodes();
        console.log("tree_nodes: " + this.tree_nodes);
        console.log("CalculateBVH completed");
    }

    UpdateDataUnit() {
        console.log("UpdateDataUnit");
        this.data_container_dir_lights.data = this.p_lights.dir_lights;
        this.data_container_positions.data = this.p_raw_data.position_data;
        this.data_container_line_segments.data = this.vectorLineSegment;
        this.data_container_tree_nodes.data = this.tree_nodes;
        this.data_container_streamline_color.data = this.p_ui_seeds.getStreamlineColors();
        this.data_unit.generateArrays();
        console.log("UpdateDataUnit completed");
    }

    UpdateDataTextures(gl) {
        console.log("UpdateDataTextures");
        this.data_textures.update(gl);
        console.log("UpdateDataTextures completed");
    }

    bind(gl, shader_uniforms, location_texture_float, location_texture_int) {
        gl.activeTexture(gl.TEXTURE0);                  // added this and following line to be extra sure which texture is being used...
        gl.bindTexture(gl.TEXTURE_3D, this.data_textures.texture_float.texture);
        gl.uniform1i(location_texture_float, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_3D, this.data_textures.texture_int.texture);
        gl.uniform1i(location_texture_int, 1);

        shader_uniforms.setUniform("start_index_int_position_data", this.data_unit.getIntStart("positions"));
        shader_uniforms.setUniform("start_index_int_line_segments", this.data_unit.getIntStart("line_segments"));
        shader_uniforms.setUniform("start_index_int_tree_nodes", this.data_unit.getIntStart("tree_nodes"));
        shader_uniforms.setUniform("start_index_int_dir_lights", this.data_unit.getIntStart("dir_lights"));
        shader_uniforms.setUniform("start_index_int_streamline_color", this.data_unit.getIntStart("streamline_color"));
        shader_uniforms.setUniform("start_index_float_position_data", this.data_unit.getFloatStart("positions"));
        shader_uniforms.setUniform("start_index_float_line_segments", this.data_unit.getFloatStart("line_segments"));
        shader_uniforms.setUniform("start_index_float_tree_nodes", this.data_unit.getFloatStart("tree_nodes"));
        shader_uniforms.setUniform("start_index_float_dir_lights", this.data_unit.getFloatStart("dir_lights"));
        shader_uniforms.setUniform("start_index_float_streamline_color", this.data_unit.getFloatStart("streamline_color"));
        shader_uniforms.updateUniforms();
    }

    GenerateLineSegmentCopies() {
        console.log("GenerateLineSegmentCopies");
        this.p_segment_duplicator.GenerateLineSegmentCopies(this);
        console.log("GenerateLineSegmentCopies completed");
    }

    LogState() {
        console.log("LOD: " + this.name);
        console.log("segments: " + this.vectorLineSegment.length);
        console.log("nodes: " + this.tree_nodes.length);
    }
}