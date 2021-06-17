class Aliasing {

    constructor() {
        this.num_rays_per_pixel = 64;
        this.offset_x = [];
        this.offset_y = [];
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                var index = x + 8 * y;
                this.offset_x[index] = x / 8;
                this.offset_y[index] = y / 8;
            }
        }
    }
}