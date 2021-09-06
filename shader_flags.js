class ShaderFlags {
    constructor() {
        this.changed = true;
    }

    Update(projection_index, draw_mode, max_iteration_count, tube_radius_fundamental,
        tube_radius_factor, tube_radius_factor_projection, tube_radius_factor_projection_highlight, 
        show_bounding_box, show_bounding_box_projection,
        streamline_method, streamline_method_projection, 
        volume_rendering_mode, show_movable_axes, cut_at_cube_faces, handle_inside){

        this.changed = true;
        this.show_movable_axes = show_movable_axes;
        this.cut_at_cube_faces = cut_at_cube_faces;
        this.handle_inside = handle_inside;

        this.projection_index = -1;
        this.max_iteration_count = max_iteration_count;
        this.tube_radius_factor_active = tube_radius_factor;
        this.tube_radius_factor_active_outside = tube_radius_factor;

        this.show_bounding_box = show_bounding_box;
        this.show_bounding_box_projection = show_bounding_box_projection;

        this.streamline_method = draw_mode == DRAW_MODE_PROJECTION ? streamline_method_projection : streamline_method;
        this.show_streamlines = false;
        this.show_streamlines_outside = false;
        switch (this.streamline_method) {
            case STREAMLINE_DRAW_METHOD_FUNDAMENTAL:
                this.show_streamlines = true;
                break;
            case STREAMLINE_DRAW_METHOD_R3:
                this.show_streamlines_outside = true;
                break;
            case STREAMLINE_DRAW_METHOD_BOTH:
                this.show_streamlines = true;
                this.show_streamlines_outside = true;
                break;
            default:
                break;
        }

        this.show_volume_rendering = false;
        this.show_volume_rendering_forward = false;
        this.show_volume_rendering_backward = false;
        switch (volume_rendering_mode) {
            case VOLUME_RENDERING_MODE_BOTH:
                this.show_volume_rendering = true;
                this.show_volume_rendering_forward = true;
                this.show_volume_rendering_backward = true;
                break;
            case VOLUME_RENDERING_MODE_FORWARD:
                this.show_volume_rendering = true;
                this.show_volume_rendering_forward = true;
                break;
            case VOLUME_RENDERING_MODE_BACKWARD:
                this.show_volume_rendering = true;
                this.show_volume_rendering_backward = true;
                break;
            default:
                break;
        }

        if(draw_mode == DRAW_MODE_PROJECTION){
            this.projection_index = projection_index;
            this.max_iteration_count = 1000;
            this.tube_radius_factor_active = tube_radius_factor_projection;
            this.tube_radius_factor_active_outside = tube_radius_factor_projection_highlight;
            //deactivate volume rendering in projection mode
            this.show_volume_rendering = false;
            this.show_bounding_box = false;
        }
        else{
            this.show_bounding_box_projection = false;
        }

        this.tube_radius_active = tube_radius_fundamental * this.tube_radius_factor_active;
        this.tube_radius_active_outside = tube_radius_fundamental * this.tube_radius_factor_active_outside;
    }



}

module.exports = ShaderFlags;