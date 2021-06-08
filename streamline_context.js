class StreamlineContext{

    constructor(name, p_lights, gl){
        console.log("Generate context: "+name);
        this.name = name;
        this.p_lights = p_lights;
        this.raw_data = new RawData();
        this.streamline_generator = new StreamlineGenerator(this);
        this.lod_0 = new LODData(name+"_lod_0", this, gl);
    }

    CalculateExampleStreamlines(gl){
        console.log("CalculateExampleStreamlines");
        var direction = DIRECTION_FORWARD;

        this.streamline_generator.shader_formula_u = "2 * sin(2 * PI * z)";
        this.streamline_generator.shader_formula_v = "sin(2 * PI * y) + 2 * cos (2 * PI * z)";
        this.streamline_generator.shader_formula_w = "cos(2 * PI * x)";
        this.streamline_generator.num_points_per_streamline = 100;
        this.streamline_generator.num_points_per_streamline = 100;
        this.streamline_generator.step_size = 0.0125;

        this.streamline_generator.SetRulesTorus();
        this.streamline_generator.GenerateExampleSeeds();
        this.streamline_generator.CalculateRawStreamlines();
        this.lod_0.ExtractMultiPolyLines(direction);
        this.raw_data.MakeDataHomogenous();
        
        //TODO: DouglasPeuker: simplify (for all lods except lod0)

        this.lod_0.GenerateLineSegments();//TODO:(for all lods)
        //TODO: GeometryDuplicator: generate copies (for all lods)        
        this.lod_0.CalculateMatrices();//TODO:(for all lods)
        this.lod_0.CalculateBVH();//TODO:(for all lods)

        this.raw_data.GeneratePositionData();

        this.lod_0.UpdateDataUnit();//TODO:(for all lods)
        this.lod_0.UpdateDataTextures(gl);//TODO:(for all lods)
    }

    CalculateStreamlines(gl, shader_formula_u, shader_formula_v, shader_formula_w, input_num_points_per_streamline, step_size){
        console.log("CalculateStreamlines");
        var direction = DIRECTION_FORWARD;

        this.streamline_generator.shader_formula_u = shader_formula_u;
        this.streamline_generator.shader_formula_v = shader_formula_v;
        this.streamline_generator.shader_formula_w = shader_formula_w;
        this.streamline_generator.num_points_per_streamline = input_num_points_per_streamline;
        this.streamline_generator.step_size = step_size;        

        this.streamline_generator.SetRulesTorus();
        this.streamline_generator.GenerateExampleSeeds();
        this.streamline_generator.CalculateRawStreamlines();
        this.lod_0.ExtractMultiPolyLines(direction);
        this.raw_data.MakeDataHomogenous();
        
        //TODO: DouglasPeuker: simplify (for all lods except lod0)

        this.lod_0.GenerateLineSegments();//TODO:(for all lods)
        //TODO: GeometryDuplicator: generate copies (for all lods)        
        this.lod_0.CalculateMatrices();//TODO:(for all lods)
        this.lod_0.CalculateBVH();//TODO:(for all lods)

        this.raw_data.GeneratePositionData();

        this.lod_0.UpdateDataUnit();//TODO:(for all lods)
        this.lod_0.UpdateDataTextures(gl);//TODO:(for all lods)
    }

    bind_lod(lod_index, gl, shader_uniforms, location_texture_float, location_texture_int){
        console.log("bind_lod index: " + lod_index);
        this.lod_0.bind(gl, shader_uniforms, location_texture_float, location_texture_int);
    }



}