class RawDataEntry {

    constructor() {
        this.position = glMatrix.vec4.create();//using 3 components for position and 1 component for flag (at seed points flag is equal to signum)
        this.u_v_w_signum = glMatrix.vec4.create();//using 3 components for uvw and 1 component for signum
        this.time = 0.0;
    }
}


/**
 * The RawData class contains the points calculated by the StreamlineGenerator
 */
class RawData {

    constructor() {
        console.log("Generate raw data");
    }

    /**
     * 
     * @param {string} seeds the list of seeds. each entry is a glMatrix.vec4 where the last component is the signum (at seed points flag is equal to signum)
     */
    initialize(seeds, num_points_per_streamline) {
        console.log("initialize raw data");
        this.num_seeds = seeds.length;
        this.num_points_per_streamline = num_points_per_streamline;
        this.num_points = this.num_seeds * num_points_per_streamline;
        this.data = new Array(this.num_points);
        for (var i = 0; i < this.data.length; i++) {
            var new_entry = new RawDataEntry();
            this.data[i] = new_entry;
        }
        for (var i = 0; i < this.num_seeds; i++) {
            var index = i * num_points_per_streamline;
            this.data[index].position = seeds[i];
            this.data[index].u_v_w_signum[3] = seeds[i][3];
        }
        console.log("data length: ", this.data.length);
        console.log("data: ", this.data);
    }

    MakeDataHomogenous() {
        console.log("MakeDataHomogenous");
        for (var i = 0; i < this.data.length; i++)
            this.data[i].position[3] = 1;
    }

    GeneratePositionData() {
        console.log("GeneratePositionData");
        this.position_data = new Array(this.data.length);
        for (var i = 0; i < this.data.length; i++) {
            var new_entry = new PositionData();
            new_entry.x = this.data[i].position[0];
            new_entry.y = this.data[i].position[1];
            new_entry.z = this.data[i].position[2];
            new_entry.time = this.data[i].time;
            this.position_data[i] = new_entry;
        }
        console.log("position_data: ", this.position_data);
    }

}