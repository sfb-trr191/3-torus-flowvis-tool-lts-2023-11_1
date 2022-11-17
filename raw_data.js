const RawDataEntry = require("./raw_data_entry");
const { PositionData, LineSegment, TreeNode, DirLight, StreamlineColor, StreamlineSeed, Cylinder } = require("./data_types");
const glMatrix = require("gl-matrix");

/**
 * The RawData class contains the points calculated by the StreamlineGenerator
 */
class RawData {

    constructor() {
        console.log("Generate raw data");
        this.num_points = 0;
        this.data = new Array();
        this.position_data = new Array();
        this.start_indices = [];
    }

    /**
     * 
     * @param {string} seeds the list of seeds. each entry is a glMatrix.vec4 where the last component is the signum (at seed points flag is equal to signum)
     */
    initialize(seeds, seed_signums, num_points_per_streamline) {
        console.log("initialize raw data");
        console.log(seeds);
        this.num_seeds = seeds.length;
        this.num_points_per_streamline = num_points_per_streamline;
        this.num_points = this.num_seeds * num_points_per_streamline;
        console.log("num_seeds: ", this.num_seeds);
        console.log("num_points_per_streamline: ", this.num_points_per_streamline);
        console.log("num_points: ", this.num_points);
        /*
        this.data = new Array(this.num_points);
        for (var i = 0; i < this.data.length; i++) {
            var new_entry = new RawDataEntry();
            this.data[i] = new_entry;
        }
        for (var i = 0; i < this.num_seeds; i++) {
            var index = i * num_points_per_streamline;
            console.log("seeds[i]: ", seeds[i]);
            glMatrix.vec4.copy(this.data[index].position, seeds[i]);
            this.data[index].u_v_w_signum[3] = seed_signums[i];
            this.data[index].flag = seed_signums[i];
        }
        */
        this.data.length = 0;
        this.start_indices.length = 0;
        console.log("data length: ", this.data.length);
        console.log("data: ", this.data);
    }

    MakeDataHomogenous() {
        console.log("MakeDataHomogenous");
        for (var i = 0; i < this.data.length; i++)
            this.data[i].position[3] = 1;
    }

    ConvertVeclocityToAngle() {
        console.log("ConvertVeclocityToAngle");
        for (var i = 0; i < this.data.length; i++)
        {
            //calculate angle from this.data[i].position[2] and this.data[i].position[3]
            var angle = Math.atan2(this.data[i].position[3], this.data[i].position[2]);//TODO Math.atan2(y, x);
            angle = angle / (2 * Math.PI)
            angle = angle >= 0 ? angle : 1 + angle;
            this.data[i].position[2] = angle;
            this.data[i].position[3] = 1;
        }
    }

    CopyAngleIntoPosition() {
        console.log("CopyAngleIntoPosition");
        for (var i = 0; i < this.data.length; i++)
        {
            this.data[i].position[2] = this.data[i].angle;
            this.data[i].position[3] = 1;
        }
    }

    SwapComponents_0123_2301() {
        console.log("0x1 SwapComponents_0123_2301", this.data.length);
        console.log("0x1 this.data[i].position[0]", this.data[0].position+"");
        for (var i = 0; i < this.data.length; i++){
            var pos = this.data[i].position;
            this.data[i].position = glMatrix.vec4.fromValues(pos[2], pos[3], pos[0], pos[1]);    
        }
        console.log("0x1 this.data[i].position[0]", this.data[0].position+"");
}

    GeneratePositionData(termination_condition, termination_max_value) {
        console.log("GeneratePositionData", termination_condition);
        this.position_data = new Array(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            var new_entry = new PositionData();
            new_entry.x = this.data[i].position[0];
            new_entry.y = this.data[i].position[1];
            new_entry.z = this.data[i].position[2];
            new_entry.w = this.data[i].position[3];//added for S3

            if(termination_condition == STREAMLINE_TERMINATION_CONDITION_ADVECTION_TIME){
                new_entry.cost = this.data[i].time / termination_max_value;
            }
            else if(termination_condition == STREAMLINE_TERMINATION_CONDITION_ARC_LENGTH){
                new_entry.cost = this.data[i].arc_length / termination_max_value;
            }
            else{
                new_entry.cost = this.data[i].local_i / termination_max_value;
                console.log("PositionData: ", this.data[i].local_i, termination_max_value, new_entry.cost);
            }

            this.position_data[i] = new_entry;
        }
    }

}

module.exports = RawData;