class StreamlineGenerator {

    constructor(p_streamline_context) {
        this.p_streamline_context = p_streamline_context;
        this.p_raw_data = p_streamline_context.raw_data;
        this.seeds = [];
        this.num_points_per_streamline = 10;
        this.step_size = 0.0125;
        this.epsilon_move_just_outside_cube = 0.00001;
        this.confine_to_cube = false;
        this.tubeRadius = 0.005;
    }

    GenerateExampleSeeds() {
        console.log("GenerateExampleSeeds");
        this.seeds = [];

        var seed = glMatrix.vec4.fromValues(0.01, 0.25, 0.25, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.99, 0.25, 0.75, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.55, 0.25, 0.5, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.95, 0.25, 0.5, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.25, 0.25, 0.1, 1);
        this.seeds.push(seed);
        seed = glMatrix.vec4.fromValues(0.25, 0.25, 0.9, 1);
        this.seeds.push(seed);
    }

    SetRulesTorus() {
        console.log("SetRulesTorus");
        //rules
        this.shader_rule_x_pos_x = "x-1";	//if x>1 : x=___
        this.shader_rule_x_pos_y = "y";		//if x>1 : y=___
        this.shader_rule_x_pos_z = "z";	    //if x>1 : z=___

        this.shader_rule_y_pos_x = "x";	    //if y>1 : x=___
        this.shader_rule_y_pos_y = "y-1";	//if y>1 : y=___
        this.shader_rule_y_pos_z = "z";	    //if y>1 : z=___

        this.shader_rule_z_pos_x = "x";	    //if z>1 : x=___
        this.shader_rule_z_pos_y = "y";	    //if z>1 : y=___
        this.shader_rule_z_pos_z = "z-1";	//if z>1 : z=___

        //inverted rules
        this.shader_rule_x_neg_x = "x+1";	//if x>1 : x=___
        this.shader_rule_x_neg_y = "y";		//if x>1 : y=___
        this.shader_rule_x_neg_z = "z";	    //if x>1 : z=___

        this.shader_rule_y_neg_x = "x";	    //if y>1 : x=___
        this.shader_rule_y_neg_y = "y+1";	//if y>1 : y=___
        this.shader_rule_y_neg_z = "z";	    //if y>1 : z=___

        this.shader_rule_z_neg_x = "x";	    //if z>1 : x=___
        this.shader_rule_z_neg_y = "y";	    //if z>1 : y=___
        this.shader_rule_z_neg_z = "z+1";	//if z>1 : z=___
    }

    CalculateRawStreamlines() {
        console.log("CalculateRawStreamlines");
        this.check_bounds = true;
        this.continue_at_bounds = true;

        this.p_raw_data.initialize(this.seeds, this.num_points_per_streamline);

        for (var i = 0; i < this.seeds.length; i++) {
            this.CalculateRawStreamline(i);
        }
        console.log("CalculateRawStreamlines completed");
    }

    CalculateRawStreamline(seed_index) {
        console.log("CalculateRawStreamline: ", seed_index);

        var startIndex = seed_index * this.num_points_per_streamline;
        var total_points = this.p_raw_data.num_points;
        var positionData = this.p_raw_data.data[startIndex];
        var startPosition = glMatrix.vec3.fromValues(positionData.position[0], positionData.position[1], positionData.position[2]);
        var signum = (positionData.u_v_w_signum[3] > 0) ? 1 : -1;

        var f_start = this.f(startPosition, signum);
        this.p_raw_data.data[startIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_start[0], f_start[1], f_start[2], signum);
        var previousPosition = startPosition;
        console.log("startIndex: ", startIndex);
        console.log("positionData: ", positionData);
        console.log("startPosition: ", startPosition);
        console.log("previousPosition: ", previousPosition);

        var currentPosition = glMatrix.vec3.create();
        var k1 = glMatrix.vec3.create();
        var k2 = glMatrix.vec3.create();
        var k3 = glMatrix.vec3.create();
        var k4 = glMatrix.vec3.create();
        var k1_2 = glMatrix.vec3.create();// k1_2 = k1/2
        var k2_2 = glMatrix.vec3.create();// k2_2 = k2/2
        var k1_6 = glMatrix.vec3.create();// k1_6 = k1/6
        var k2_3 = glMatrix.vec3.create();// k2_3 = k2/3
        var k3_3 = glMatrix.vec3.create();// k3_3 = k3/3
        var k4_6 = glMatrix.vec3.create();// k4_6 = k4/6
        var previous_plus_k1_2 = glMatrix.vec3.create();// previousPosition + k1/2
        var previous_plus_k2_2 = glMatrix.vec3.create();// previousPosition + k2/2
        var previous_plus_k3 = glMatrix.vec3.create();// previousPosition + k3
        for (var i = 1; i < this.num_points_per_streamline; i++) {

            var currentIndex = startIndex + i;
            var previousIndex = currentIndex - 1;
            var previousVec4 = this.p_raw_data.data[previousIndex].position;
            previousPosition = glMatrix.vec3.fromValues(previousVec4[0], previousVec4[1], previousVec4[2]);
            //console.log("i: ", i);
            //console.log("previousPosition: ", previousPosition);
            //console.log("this.step_size: ", this.step_size);

            //CALCULATE: vec3 k1 = step_size * f(previousPosition, signum);
            glMatrix.vec3.scale(k1, this.f(previousPosition, signum), this.step_size);

            //CALCULATE: vec3 k2 = step_size * f(previousPosition + k1/2, signum);
            glMatrix.vec3.scale(k1_2, k1, 1 / 2);// k1_2 = k1/2
            glMatrix.vec3.add(previous_plus_k1_2, previousPosition, k1_2);// previousPosition + k1/2            
            glMatrix.vec3.scale(k2, this.f(previous_plus_k1_2, signum), this.step_size);

            //CALCULATE: vec3 k3 = step_size * f(previousPosition + k2/2, signum);
            glMatrix.vec3.scale(k2_2, k2, 1 / 2);// k2_2 = k2/2
            glMatrix.vec3.add(previous_plus_k2_2, previousPosition, k2_2);// previousPosition + k2/2     
            glMatrix.vec3.scale(k3, this.f(previous_plus_k2_2, signum), this.step_size);

            //CALCULATE: vec3 k4 = step_size * f(previousPosition + k3, signum);
            glMatrix.vec3.add(previous_plus_k3, previousPosition, k3);// previousPosition + k3
            glMatrix.vec3.scale(k4, this.f(previous_plus_k3, signum), this.step_size);

            //CALCULATE: vec3 currentPosition = previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6;
            glMatrix.vec3.scale(k1_6, k1, 1 / 6);// k1_6 = k1/6
            glMatrix.vec3.scale(k2_3, k2, 1 / 3);// k2_3 = k2/3
            glMatrix.vec3.scale(k3_3, k3, 1 / 3);// k3_3 = k3/3
            glMatrix.vec3.scale(k4_6, k4, 1 / 6);// k4_6 = k4/6
            glMatrix.vec3.add(currentPosition, previousPosition, k1_6);// previousPosition + k1 / 6 
            glMatrix.vec3.add(currentPosition, currentPosition, k2_3);// previousPosition + k1 / 6 + k2 / 3
            glMatrix.vec3.add(currentPosition, currentPosition, k3_3);// previousPosition + k1 / 6 + k2 / 3 + k3 / 3
            glMatrix.vec3.add(currentPosition, currentPosition, k4_6);// previousPosition + k1 / 6 + k2 / 3 + k3 / 3 + k4 / 6

            //console.log(i, currentPosition);
            if (this.confine_to_cube)
                currentPosition = this.ConfineToCube(currentPosition, previousPosition);


            var flag = 2;//2=normal point   1=new polyline   3=end polyline   0=skip point
            var f_previous = this.f(previousPosition, signum);
            var f_current = this.f(currentPosition, signum);
            var v_previous = glMatrix.vec3.length(f_previous);
            var v_current = glMatrix.vec3.length(f_current);
            var v_average = (v_previous + v_current) * 0.5;
            var time_previous = this.p_raw_data.data[previousIndex].time;
            var time_current = time_previous + (this.step_size / v_average);


            if (i == this.num_points_per_streamline - 1)
                flag = 3;//end of polyline

            var terminate = false;
            if (this.check_bounds) {
                var outOfBounds = this.CheckOutOfBounds(currentPosition);
                if (outOfBounds) {
                    flag = 3;//end of polyline
                    //vectorPosition[currentIndex]= vec4(currentPosition, 3);//3 = end

                    if (this.continue_at_bounds && i < this.num_points_per_streamline - 2) {
                        var movedPosition = this.MoveOutOfBounds(currentPosition);
                        var f_movedPosition = this.f(movedPosition, signum);
                        var v_movedPosition = glMatrix.vec3.length(f_movedPosition);
                        this.p_raw_data.data[currentIndex + 1].position = glMatrix.vec4.fromValues(movedPosition[0], movedPosition[1], movedPosition[2], signum);;//1 or -1 for start
                        this.p_raw_data.data[currentIndex + 1].u_v_w_signum = glMatrix.vec4.fromValues(f_movedPosition[0], f_movedPosition[1], f_movedPosition[2], signum);
                        this.p_raw_data.data[currentIndex + 1].time = time_current;
                        this.p_raw_data.data[currentIndex + 1].velocity = v_movedPosition;
                        i++;
                    }
                    else {
                        terminate = true;
                    }
                }
            }


            this.p_raw_data.data[currentIndex].position = glMatrix.vec4.fromValues(currentPosition[0], currentPosition[1], currentPosition[2], flag);
            this.p_raw_data.data[currentIndex].u_v_w_signum = glMatrix.vec4.fromValues(f_current[0], f_current[1], f_current[2], signum);
            this.p_raw_data.data[currentIndex].time = time_current;

            //previousPosition = currentPosition;
            if (terminate)
                break;
        }
    }

    f(vector, signum) {
        //console.log("--------------");
        //console.log("vector: ", vector, "test");
        //console.log("vector0: ", vector[0]);
        //console.log("vector1: ", vector[1]);
        //console.log("vector2: ", vector[2]);
        let scope = {
            x: vector[0],
            y: vector[1],
            z: vector[2],
        };
        //console.log("scope: ", scope);
        //console.log("this.shader_formula_u: ", this.shader_formula_u);
        var u = math.evaluate(this.shader_formula_u, scope)
        var v = math.evaluate(this.shader_formula_v, scope);
        var w = math.evaluate(this.shader_formula_w, scope);
        var result = glMatrix.vec3.create();
        result[0] = u * signum;
        result[1] = v * signum;
        result[2] = w * signum;
        return result;
    }

    CheckOutOfBounds(position) {
        for (var i = 0; i < 3; i++)
            if (position[i] > 1 || position[i] < 0)
                return true;
        return false;
    }

    MoveOutOfBounds(position) {
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

        if (x > 1) {
            scope.x = math.evaluate(this.shader_rule_x_pos_x, scope);
            scope.y = math.evaluate(this.shader_rule_x_pos_y, scope);
            scope.z = math.evaluate(this.shader_rule_x_pos_z, scope);
        }
        else if (x < 0) {
            scope.x = math.evaluate(this.shader_rule_x_neg_x, scope);
            scope.y = math.evaluate(this.shader_rule_x_neg_y, scope);
            scope.z = math.evaluate(this.shader_rule_x_neg_z, scope);
        }

        if (y > 1) {
            scope.x = math.evaluate(this.shader_rule_y_pos_x, scope);
            scope.y = math.evaluate(this.shader_rule_y_pos_y, scope);
            scope.z = math.evaluate(this.shader_rule_y_pos_z, scope);
        }
        else if (y < 0) {
            scope.x = math.evaluate(this.shader_rule_y_neg_x, scope);
            scope.y = math.evaluate(this.shader_rule_y_neg_y, scope);
            scope.z = math.evaluate(this.shader_rule_y_neg_z, scope);
        }

        if (z > 1) {
            scope.x = math.evaluate(this.shader_rule_z_pos_x, scope);
            scope.y = math.evaluate(this.shader_rule_z_pos_y, scope);
            scope.z = math.evaluate(this.shader_rule_z_pos_z, scope);
        }
        else if (z < 0) {
            scope.x = math.evaluate(this.shader_rule_z_neg_x, scope);
            scope.y = math.evaluate(this.shader_rule_z_neg_y, scope);
            scope.z = math.evaluate(this.shader_rule_z_neg_z, scope);
        }

        return glMatrix.vec3.fromValues(scope.x, scope.y, scope.z);
    }

    //vec3 currentPosition, previousPosition
    ConfineToCube(currentPosition, previousPosition) {
        //return currentPosition;
        var confine = false;
        var min_t = 1000000;
        for (var i = 0; i < 3; i++) {
            if (currentPosition[i] < 0) {
                confine = true;
                var t = this.ExtractLinearPercentage(previousPosition[i], currentPosition[i], 0);
                if (t < min_t)
                    min_t = t;
            }
            if (currentPosition[i] > 1) {
                confine = true;
                var t = this.ExtractLinearPercentage(previousPosition[i], currentPosition[i], 1);
                if (t < min_t)
                    min_t = t;
            }
        }

        if (confine) {
            //vec3 direction = currentPosition - previousPosition;
            var direction = glMatrix.vec3.create();
            glMatrix.vec3.subtract(direction, currentPosition, previousPosition);
            //vec3 direction_normalized = normalize(direction);
            var direction_normalized = glMatrix.vec3.create();
            glMatrix.vec3.normalize(direction_normalized, direction);
            //return previousPosition + min_t * direction + epsilon_move_just_outside_cube * direction_normalized;
            var result = glMatrix.vec3.clone(previousPosition);//previousPosition + ...
            var tmp = glMatrix.vec3.create();
            //... + min_t * direction + ...
            glMatrix.vec3.scale(tmp, direction, min_t)
            glMatrix.vec3.add(result, result, tmp);
            //... + epsilon_move_just_outside_cube * direction_normalized + ...
            glMatrix.vec3.scale(tmp, direction_normalized, this.epsilon_move_just_outside_cube)
            glMatrix.vec3.add(result, result, tmp);
            return result;

        }

        return currentPosition;
    }

    //float a, b, value
    ExtractLinearPercentage(a, b, value) {
        return (value - a) / (b - a);
    }

}