const glMatrix = require("gl-matrix");
const math = require("mathjs");
const AABB = require("./aabb");
const RawDataEntry = require("./raw_data_entry");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");
const UnitCubeTranslator = require("./unit_cube_translator");

class SegmentDuplicator {

    constructor(p_streamline_context) {
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.iterations = 1;
        this.unit_cube_translator = new UnitCubeTranslator(p_streamline_context);
    }

    GenerateLineSegmentCopies(part_index, lod) {
        console.log("GenerateLineSegmentCopies");
        var vectorLineSegment = lod.GetVectorLineSegment(part_index);
        var startSegmentIndex = 0;
        for (var i = 0; i < this.iterations; i++) {
            var startSegmentIndexNext = vectorLineSegment.length;
            //PrepareProgramApplyRules(pointDataVector);
            this.GenerateLineSegmentCopiesIteration(part_index, lod, i, startSegmentIndex);
            startSegmentIndex = startSegmentIndexNext;
        }
        console.log("GenerateLineSegmentCopies completed");
    }

    GenerateLineSegmentCopiesIteration(part_index, lod, iteration, startSegmentIndex) {
        console.log("GenerateLineSegmentCopiesIteration: ", iteration, startSegmentIndex);
        var vectorLineSegment = lod.GetVectorLineSegment(part_index);
        var raw_data = this.p_streamline_context.GetRawData(part_index);
        var pointDataVector = raw_data.data;
        var tubeRadius = this.p_streamline_generator.tubeRadius;
        console.log("vectorLineSegment.length: ", vectorLineSegment.length);

        var r = glMatrix.vec4.fromValues(tubeRadius, tubeRadius, tubeRadius, 0);
        var segmentCount = vectorLineSegment.length;
        //std::vector<QVector4D> resultPointVector;
        //resultPointVector.resize(pointCount);
        for (var i = 0; i < this.unit_cube_translator.vectorAABB.length; i++) {
            var apply = this.unit_cube_translator.vectorTranslation[i];
            //RunProgramApplyRules(apply.x(), apply.y(), apply.z(), pointCount, resultPointVector);
            //std::cout << resultPointVector[0].x() << ", " << resultPointVector[0].y() << ", " << resultPointVector[0].z() << std::endl;

            for (var j = startSegmentIndex; j < segmentCount; j++) {
                var segment = vectorLineSegment[j];
                var rawDataA = pointDataVector[segment.indexA];
                var rawDataB = pointDataVector[segment.indexB];
                var pointA = rawDataA.position;//glMatrix.vec4.fromValues(rawDataA.x, rawDataA.y, rawDataA.z, 1);
                var pointB = rawDataB.position;//glMatrix.vec4.fromValues(rawDataB.x, rawDataB.y, rawDataB.z, 1);
                //TODO check out of unit cube
                //add new points and new segments
                var aabb = new AABB();
                //console.log("pointA", pointA);
                //console.log("pointB", pointB);
                //console.log("r", r);
                aabb.SetTube(pointA, pointB, r);

                var intersects = aabb.Intersect(this.unit_cube_translator.vectorAABB[i]);
                if (intersects) {
                    var newSegment = new LineSegment();
                    newSegment.copy = 1;
                    newSegment.multiPolyID = segment.multiPolyID;
                    newSegment.beginning = segment.beginning;

                    newSegment.indexA = pointDataVector.length;
                    var newA = new RawDataEntry();
                    var resultA = this.unit_cube_translator.MoveOutOfBounds(pointA, apply[0], apply[1], apply[2]);
                    //newA.position = resultA;
                    vec4_from_vec3_1(newA.position, resultA);
                    //newA.position = glMatrix.vec4.fromValues(0.40, 0.40, 0.40, 1);
                    newA.time = rawDataA.time;
                    newA.arc_length = rawDataA.arc_length;
                    newA.local_i = rawDataA.local_i;
                    pointDataVector.push(newA);

                    newSegment.indexB = pointDataVector.length;
                    var newB = new RawDataEntry();
                    var resultB = this.unit_cube_translator.MoveOutOfBounds(pointB, apply[0], apply[1], apply[2]);
                    //newB.position = resultB;
                    vec4_from_vec3_1(newB.position, resultB);
                    newB.time = rawDataB.time;
                    newB.arc_length = rawDataB.arc_length;
                    newB.local_i = rawDataB.local_i;
                    pointDataVector.push(newB);

                    /*
                    std::cout << std::endl;
                    std::cout << "indices: " << segment.indexA << ", " << segment.indexB << std::endl;
                    std::cout << "pointA: " << pointA.x() << ", " << pointA.y() << ", " << pointA.z() << std::endl;
                    std::cout << "  newA: " << newA.position.x() << ", " << newA.position.y() << ", " << newA.position.z() << std::endl;
                    std::cout << "pointB: " << pointB.x() << ", " << pointB.y() << ", " << pointB.z() << std::endl;
                    std::cout << "  newB: " << newB.position.x() << ", " << newB.position.y() << ", " << newB.position.z() << std::endl;
                    */
                    vectorLineSegment.push(newSegment);
                    //console.log("----------");
                    //console.log("pointA: ", pointA);
                    //console.log("resultA: ", resultA);
                    //console.log("pointB: ", pointB);
                    //console.log("resultB: ", resultB);
                }
            }
        }
        console.log("vectorLineSegment.length: ", vectorLineSegment.length);
        console.log("GenerateLineSegmentCopiesIteration completed");
    }

}

module.exports = SegmentDuplicator;