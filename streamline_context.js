class StreamlineContext {

    constructor(name, p_lights, gl) {
        console.log("Generate context: " + name);
        this.name = name;
        this.p_lights = p_lights;
        this.raw_data = new RawData();
        this.streamline_generator = new StreamlineGenerator(this);
        this.segment_duplicator = new SegmentDuplicator(this);
        //this.lod_0 = new LODData(name+"_lod_0", this, gl);
        this.lod_list = [];

        var num_lods = 4;
        //var douglasPeukerParameter = 0.0001;
        var douglasPeukerParameter = 0.0005;
        for (var i = 0; i < num_lods; i++) {
            var lod = new LODData(name + "_lod_" + i, this, gl);
            this.lod_list.push(lod);
            if (i > 0) {
                lod.douglasPeukerParameter = douglasPeukerParameter;
                douglasPeukerParameter *= 5;
            }
        }
        this.lod_0 = this.lod_list[0];
    }

    CalculateExampleStreamlines(gl) {
        console.log("CalculateExampleStreamlines");

        this.streamline_generator.direction = DIRECTION_FORWARD;
        this.streamline_generator.shader_formula_u = "2 * sin(2 * PI * z)";
        this.streamline_generator.shader_formula_v = "sin(2 * PI * y) + 2 * cos (2 * PI * z)";
        this.streamline_generator.shader_formula_w = "cos(2 * PI * x)";
        this.streamline_generator.num_points_per_streamline = 100;
        this.streamline_generator.num_points_per_streamline = 100;
        this.streamline_generator.step_size = 0.0125;

        this.streamline_generator.SetRulesTorus();
        this.streamline_generator.GenerateExampleSeeds();

        this.CalculateStreamlinesInternal(gl);
        /*
        this.streamline_generator.CalculateRawStreamlines();
        this.lod_0.ExtractMultiPolyLines();
        this.raw_data.MakeDataHomogenous();
        
        //TODO: DouglasPeuker: simplify (for all lods except lod0)

        this.lod_0.GenerateLineSegments();//TODO:(for all lods)        
        this.lod_0.GenerateLineSegmentCopies();//TODO: GeometryDuplicator: generate copies (for all lods)   
        this.lod_0.CalculateMatrices();//TODO:(for all lods)
        this.lod_0.CalculateBVH();//TODO:(for all lods)

        this.raw_data.GeneratePositionData();

        this.lod_0.UpdateDataUnit();//TODO:(for all lods)
        this.lod_0.UpdateDataTextures(gl);//TODO:(for all lods)
        */
    }

    CalculateStreamlines(gl, shader_formula_u, shader_formula_v, shader_formula_w, input_num_points_per_streamline, step_size, segment_duplicator_iterations, direction) {
        console.log("CalculateStreamlines");

        this.streamline_generator.direction = direction;
        this.streamline_generator.shader_formula_u = shader_formula_u;
        this.streamline_generator.shader_formula_v = shader_formula_v;
        this.streamline_generator.shader_formula_w = shader_formula_w;
        this.streamline_generator.num_points_per_streamline = input_num_points_per_streamline;
        this.streamline_generator.step_size = step_size;
        this.segment_duplicator.iterations = segment_duplicator_iterations;

        this.streamline_generator.SetRulesTorus();
        this.streamline_generator.GenerateExampleSeeds();

        this.CalculateStreamlinesInternal(gl);
    }

    CalculateStreamlinesInternal(gl) {
        this.streamline_generator.CalculateRawStreamlines();
        this.lod_0.ExtractMultiPolyLines();
        this.raw_data.MakeDataHomogenous();

        //simplify for all lods except lod_0
        for (var i = 1; i < this.lod_list.length; i++) {
            this.lod_list[i].DouglasPeuker(this.lod_list[i - 1]);
        }

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].GenerateLineSegments();
            this.lod_list[i].GenerateLineSegmentCopies();
            this.lod_list[i].CalculateMatrices();
            this.lod_list[i].CalculateBVH();
        }

        this.raw_data.GeneratePositionData();

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].UpdateDataUnit();
            this.lod_list[i].UpdateDataTextures(gl);
        }

        for (var i = 0; i < this.lod_list.length; i++) {
            this.lod_list[i].LogState();
        }
    }

    bind_lod(lod_index, gl, shader_uniforms, location_texture_float, location_texture_int) {
        console.log("bind_lod index: " + lod_index);
        this.lod_list[lod_index].bind(gl, shader_uniforms, location_texture_float, location_texture_int);
    }



}