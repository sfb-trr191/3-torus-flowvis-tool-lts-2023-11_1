const glMatrix = require("gl-matrix");
const math = require("mathjs");
const AABB = require("./aabb");
const RawDataEntry = require("./raw_data_entry");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");

class UnitCubeTranslator {

    constructor(p_streamline_context) {
        this.p_streamline_context = p_streamline_context;
        this.p_streamline_generator = p_streamline_context.streamline_generator;
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

    /**
     * Returns the point with the smallest angle, i.e. 
     * the angle between the vector from variable_point to fixed_point
     * and the vector fixed_direction.
     * The point variable_point is translated in each way possible (27 variations)
     * @param {*} fixed_point 
     * @param {*} fixed_direction 
     * @param {*} variable_point 
     */
    SelectCopyWithSmallestAngle(fixed_point, fixed_direction, variable_point){
        var best_dot_product = Infinity;
        var best_point = glMatrix.vec3.create();
        var variable_direction = glMatrix.vec3.create();

        //do the non translated point (variable_point)
        glMatrix.vec3.subtract(variable_direction, fixed_point, variable_point);
        glMatrix.vec3.normalize(variable_direction, variable_direction);
        var dot_product = glMatrix.vec3.dot(fixed_direction, variable_direction);       
        if(dot_product >=0 && dot_product < best_dot_product){
            best_dot_product = dot_product;
            glMatrix.vec3.copy(best_point, variable_point);            
        }

        //do all translated points (translated_point)
        for (var i = 0; i < this.vectorTranslation.length; i++) {
            var apply = this.vectorTranslation[i];
            var translated_point = this.MoveOutOfBounds(variable_point, apply[0], apply[1], apply[2]);
            //console.warn(i, "   ", translated_point)
            glMatrix.vec3.subtract(variable_direction, fixed_point, translated_point);
            glMatrix.vec3.normalize(variable_direction, variable_direction);
            var dot_product = glMatrix.vec3.dot(fixed_direction, variable_direction);
            if(dot_product >=0 && dot_product < best_dot_product){
                best_dot_product = dot_product;
                glMatrix.vec3.copy(best_point, translated_point)
                console.warn(i, "   dot_product: ", dot_product)
            }
        }

        console.warn("best_point: ", best_point)
        console.warn("fixed_point: ", fixed_point)
        console.warn("fixed_direction: ", fixed_direction)
        return best_point;
    }

    /**
     * Returns the point with the smallest distance, i.e. 
     * the distance between the vector from variable_point to fixed_point, that is also in front of the camera
     * The point variable_point is translated in each way possible (27 variations)
     * @param {*} fixed_point 
     * @param {*} fixed_direction 
     * @param {*} variable_point 
     */
        SelectCopyWithSmallestDistance(fixed_point, fixed_direction, variable_point){
            var best_distance = Infinity;
            var best_point = glMatrix.vec3.create();
            var variable_direction = glMatrix.vec3.create();
    
            //do the non translated point (variable_point)
            glMatrix.vec3.subtract(variable_direction, fixed_point, variable_point);
            glMatrix.vec3.normalize(variable_direction, variable_direction);
            var dot_product = glMatrix.vec3.dot(fixed_direction, variable_direction);    
            var distance = glMatrix.vec3.distance(fixed_point, variable_point)
            console.warn(" fixed_point: ", fixed_point)
            console.warn(" fixed_direction: ", fixed_direction)
            console.warn(" variable_point: ", variable_point)
            console.warn(" untranslated distance: ", distance)
            console.warn(" untranslated dot_product: ", dot_product)
            if(dot_product >=0 && distance < best_distance){
                best_distance = distance;
                glMatrix.vec3.copy(best_point, variable_point);            
            }
    
            //do all translated points (translated_point)
            for (var i = 0; i < this.vectorTranslation.length; i++) {
                var apply = this.vectorTranslation[i];
                var translated_point = this.MoveOutOfBounds(variable_point, apply[0], apply[1], apply[2]);
                //console.warn(i, "   ", translated_point)
                glMatrix.vec3.subtract(variable_direction, fixed_point, translated_point);
                glMatrix.vec3.normalize(variable_direction, variable_direction);
                var dot_product = glMatrix.vec3.dot(fixed_direction, variable_direction); 
                var distance = glMatrix.vec3.distance(fixed_point, translated_point)
                if(dot_product >=0 && distance < best_distance){
                    best_distance = distance;
                    glMatrix.vec3.copy(best_point, translated_point)
                    console.warn(i, "   distance: ", distance)
                }
            }
    
            console.warn("best_point: ", best_point)
            console.warn("fixed_point: ", fixed_point)
            console.warn("fixed_direction: ", fixed_direction)
            return best_point;
        }
}

module.exports = UnitCubeTranslator;