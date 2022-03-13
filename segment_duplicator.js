const glMatrix = require("gl-matrix");
const math = require("mathjs");
const AABB = require("./aabb");
const RawDataEntry = require("./raw_data_entry");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");

class SegmentDuplicator {

    constructor(p_streamline_context) {
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
        this.iterations = 1;
        this.InitUnitCubeVectors();
    }

    InitUnitCubeVectors() {
        console.log("InitUnitCubeVectors");
        this.vectorTranslation = [];
        this.vectorInverseTranslation = [];
        this.vectorAABB = [];

        for (var x = -1; x <= 1; x++) {
            for (var y = -1; y <= 1; y++) {
                for (var z = -1; z <= 1; z++) {
                    if (x == 0 && y == 0 && z == 0)
                        continue;

                    var translation = glMatrix.vec4.fromValues(x, y, z, 0);//we dont want to change 4th component
                    var translation_inverse = glMatrix.vec4.fromValues(-x, -y, -z, 0);

                    var aabb = new AABB();//transplated unit cube
                    aabb.min = glMatrix.vec4.fromValues(0, 0, 0, 1);
                    aabb.max = glMatrix.vec4.fromValues(1, 1, 1, 1);
                    aabb.Translate(translation);

                    this.vectorTranslation.push(translation);
                    this.vectorInverseTranslation.push(translation_inverse);
                    this.vectorAABB.push(aabb);
                }
            }
        }


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
        for (var i = 0; i < this.vectorAABB.length; i++) {
            var apply = this.vectorTranslation[i];
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

                var intersects = aabb.Intersect(this.vectorAABB[i]);
                if (intersects) {
                    var newSegment = new LineSegment();
                    newSegment.copy = 1;
                    newSegment.multiPolyID = segment.multiPolyID;
                    newSegment.beginning = segment.beginning;

                    newSegment.indexA = pointDataVector.length;
                    var newA = new RawDataEntry();
                    var resultA = this.MoveOutOfBounds(pointA, apply[0], apply[1], apply[2]);
                    //newA.position = resultA;
                    vec4_from_vec3_1(newA.position, resultA);
                    //newA.position = glMatrix.vec4.fromValues(0.40, 0.40, 0.40, 1);
                    newA.time = rawDataA.time;
                    pointDataVector.push(newA);

                    newSegment.indexB = pointDataVector.length;
                    var newB = new RawDataEntry();
                    var resultB = this.MoveOutOfBounds(pointB, apply[0], apply[1], apply[2]);
                    //newB.position = resultB;
                    vec4_from_vec3_1(newB.position, resultB);
                    newB.time = rawDataB.time;
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

    MoveOutOfBounds(position, apply_rule_x, apply_rule_y, apply_rule_z) {
        //user friendly variables
        var x = position[0];
        var y = position[1];
        var z = position[2];
        //additional "constant" variables for this calculation
        var x0 = x;
        var y0 = y;
        var z0 = z;

        let scope = {
            x: x,
            y: y,
            z: z,
        };

        if (apply_rule_x == 1) {
            scope.x = math.evaluate(this.p_streamline_generator.shader_rule_x_pos_x, scope);
            scope.y = math.evaluate(this.p_streamline_generator.shader_rule_x_pos_y, scope);
            scope.z = math.evaluate(this.p_streamline_generator.shader_rule_x_pos_z, scope);
        }
        else if (apply_rule_x == -1) {
            scope.x = math.evaluate(this.p_streamline_generator.shader_rule_x_neg_x, scope);
            scope.y = math.evaluate(this.p_streamline_generator.shader_rule_x_neg_y, scope);
            scope.z = math.evaluate(this.p_streamline_generator.shader_rule_x_neg_z, scope);
        }

        if (apply_rule_y == 1) {
            scope.x = math.evaluate(this.p_streamline_generator.shader_rule_y_pos_x, scope);
            scope.y = math.evaluate(this.p_streamline_generator.shader_rule_y_pos_y, scope);
            scope.z = math.evaluate(this.p_streamline_generator.shader_rule_y_pos_z, scope);
        }
        else if (apply_rule_y == -1) {
            scope.x = math.evaluate(this.p_streamline_generator.shader_rule_y_neg_x, scope);
            scope.y = math.evaluate(this.p_streamline_generator.shader_rule_y_neg_y, scope);
            scope.z = math.evaluate(this.p_streamline_generator.shader_rule_y_neg_z, scope);
        }

        if (apply_rule_z == 1) {
            scope.x = math.evaluate(this.p_streamline_generator.shader_rule_z_pos_x, scope);
            scope.y = math.evaluate(this.p_streamline_generator.shader_rule_z_pos_y, scope);
            scope.z = math.evaluate(this.p_streamline_generator.shader_rule_z_pos_z, scope);
        }
        else if (apply_rule_z == -1) {
            scope.x = math.evaluate(this.p_streamline_generator.shader_rule_z_neg_x, scope);
            scope.y = math.evaluate(this.p_streamline_generator.shader_rule_z_neg_y, scope);
            scope.z = math.evaluate(this.p_streamline_generator.shader_rule_z_neg_z, scope);
        }

        return glMatrix.vec3.fromValues(scope.x, scope.y, scope.z);
    }
}

module.exports = SegmentDuplicator;