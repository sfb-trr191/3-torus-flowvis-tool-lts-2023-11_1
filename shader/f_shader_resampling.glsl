var F_SHADER_RESAMPLING = `#version 300 es
precision highp int;
precision highp float;

uniform int use3D;
uniform int width;
uniform int height;

uniform sampler2D texture1;
uniform sampler2D texture2;

uniform float progress;
uniform float progressbar_height;
uniform bool progressbar;
uniform	int text_rect_width;
uniform	int text_rect_height;

out vec4 outputColor;

//varying vec2 v_texcoord;

//! [0]
void main()
{
    //vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), float(1)-(gl_FragCoord[1]/float(height)));
    vec2 v_texcoord = vec2(gl_FragCoord[0]/float(width), (gl_FragCoord[1]/float(height)));
    //outputColor = vec4(v_texcoord[0],v_texcoord[1],0,1);
    outputColor = texture(texture1, v_texcoord);//center
    /*if(v_texcoord.x > 0.9)
    {
        outputColor = vec4(0,0,0,1);
    }*/
    return;

    /*
    // Set fragment color from texture
    //gl_FragColor = texture2D(texture, v_texcoord);

    //vec4 col = vec4(col_1.r,col_1.y,col_1.z,1);
    //gl_FragColor = vec4(1,0,0,1);
    //gl_FragColor = vec4(col_2.x,col_1.y,col_1.z,1);
    //gl_FragColor = vec4(col_1.x,col_2.y,col_2.z,1);
    //gl_FragColor = vec4(col_1.x,0, 0, 1);
    //gl_FragColor = vec4(0,col_2.y,col_2.z,1);
    vec2 v_texcoord = vec2(gl_FragCoord[0]/width, 1-(gl_FragCoord[1]/height));

    if(progressbar)
    {
        if(v_texcoord.y > 1-progressbar_height)
        {
            outputColor = vec4(0,0,0,1);
            if(v_texcoord.x < progress)        
                outputColor = vec4(1,1,1,1);
            return;
        }
    }

    if(gl_FragCoord[0] < text_rect_width && height-gl_FragCoord[1] < text_rect_height)
    {
        outputColor = vec4(1,1,1,1);
        return;
    }

    if(use3D == 0)
    {
        outputColor = texture2D(texture, v_texcoord);//center
    }
    else
    {    
        vec4 col_1 = texture2D(texture, v_texcoord);//left
        vec4 col_2 = texture2D(texture2, v_texcoord);//right
        outputColor = vec4(col_1.x,col_2.y,col_2.z,1);
    }
    */
}
//! [0]


`;
