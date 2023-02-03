const glMatrix = require("gl-matrix");
const module_gl_matrix_extensions = require("./gl_matrix_extensions");
const TRACKBALLSIZE = 2;

const gram_schmidt = require("./gram_schmidt");
const GramSchmidt2Vectors4Dimensions = gram_schmidt.GramSchmidt2Vectors4Dimensions;

/**
 * Reprojecting mouse position onto a sphere.
 * Project an x,y pair onto a sphere of radius r OR a hyperbolic sheet if we are away from the center of the sphere. 
 * Param float r
 * Param float x
 * Param float y
 * return: float
 */
function tb_project_to_sphere(r, x, y)
{
    var d, t, z;

    d = Math.sqrt(x*x + y*y);
    if (d < r * 0.70710678118654752440) {    /* Inside sphere */
        z = Math.sqrt(r*r - d*d);
    } else {           /* On hyperbola */
        t = r / 1.41421356237309504880;
        z = t*t / d;
    }
    return z;
}

function tb_project_to_sphere3(x, y) {
    var p = glMatrix.vec2.fromValues(x, y);
    var dist = glMatrix.vec2.dot(p,p);

    /* Point is on sphere */
    if(dist <= 1.0){
        var z = Math.sqrt(1.0 - dist);
        return glMatrix.vec3.fromValues(x, y, z);
    }

    /* Point is outside sphere */
    else {
        var proj = glMatrix.vec2.create();
        glMatrix.vec2.normalize(proj, p);
        return glMatrix.vec3.fromValues(proj[0], proj[1], 0);
    }
}

/**
 * Project the points onto the virtual trackball, then figure out the angle theta and plane of rotation defined by the two vectors x and y
 * 
 * Param float p1x
 * Param float p1y
 * Param float p2x
 * Param float p2y
 * 
 * return {theta,x,y}
 */
function trackball4D(p1x, p1y, p2x, p2y, forward, up, right, position){
    var q = glMatrix.quat.create(); //return value
    var a = glMatrix.vec3.create(); //float a[3]        Axis of rotation
    var phi;    //float phi         how much to rotate about axis
    var p1 = glMatrix.vec3.create();//float p1[3]
    var p2 = glMatrix.vec3.create();//float p2[3]
    var d = glMatrix.vec4.create(); //float d[3]
    var t;      //float t

    /*
    if (p1x == p2x && p1y == p2y) {
        //Zero rotation
        glMatrix.quat.identity(q);
        return q;
    } 
    */ 
    
    //First, figure out z-coordinates for projection of P1 and P2 to
    //deformed sphere    
    //vset(p1,p1x,p1y,tb_project_to_sphere(TRACKBALLSIZE,p1x,p1y));
    //vset(p2,p2x,p2y,tb_project_to_sphere(TRACKBALLSIZE,p2x,p2y));
    p1 = tb_project_to_sphere3(p1x,p1y);
    p2 = tb_project_to_sphere3(p2x,p2y);
    //p1 = glMatrix.vec3.fromValues(p1x, p1y, p1z);
    //p2 = glMatrix.vec3.fromValues(p2x, p2y, p2z);
    p1x = p1[0];
    p1y = p1[1];
    p1z = p1[2];
    p2x = p2[0];
    p2y = p2[1];
    p2z = p2[2];
    console.log("HIT_SPHERE = ", p2)

    //###############################################################
    //start of inserted code
    //###############################################################

    //apply camera vectors
    var p_forward = glMatrix.vec4.create();
    var p_up = glMatrix.vec4.create();
    var p_right = glMatrix.vec4.create();   
    var p0 = glMatrix.vec4.create();//center of ball relative to camera 
    var p1 = glMatrix.vec4.create();//pos on ball relative to camera
    var p2 = glMatrix.vec4.create();//pos on ball relative to camera
    /*
    //apply camera vectors to p1
    glMatrix.vec4.scale(p_forward, forward, p1z);
    glMatrix.vec4.scale(p_up, up, p1y);
    glMatrix.vec4.scale(p_right, right, p1x);//TRACKBALL_MARKER negated makes it left
    glMatrix.vec4.add(p1, p_forward, p_up);
    glMatrix.vec4.add(p1, p1, p_right);
    //glMatrix.vec4.add(p1, p1, position);//test
    //apply camera vectors to p2
    glMatrix.vec4.scale(p_forward, forward, p2z);
    glMatrix.vec4.scale(p_up, up, p2y);
    glMatrix.vec4.scale(p_right, right, p2x);//TRACKBALL_MARKER negated makes it left
    glMatrix.vec4.add(p2, p_forward, p_up);
    glMatrix.vec4.add(p2, p2, p_right);
    //glMatrix.vec4.add(p2, p2, position);//test
    */
    console.warn("p1", p1)

    //apply camera vectors to p1
    glMatrix.vec4.scale(p_forward, forward, 1-p1z);
    glMatrix.vec4.scale(p_up, up, p1y);
    glMatrix.vec4.scale(p_right, right, p1x);//TRACKBALL_MARKER negated makes it left
    console.warn("p_forward", p_forward)
    console.warn("p_up", p_up)
    console.warn("p_right", p_right)
    glMatrix.vec4.add(p1, p_forward, p_up);
    glMatrix.vec4.add(p1, p1, p_right);
    glMatrix.vec4.add(p1, p1, position);//test
    //apply camera vectors to p2
    glMatrix.vec4.scale(p_forward, forward, 1-p2z);
    glMatrix.vec4.scale(p_up, up, p2y);
    glMatrix.vec4.scale(p_right, right, p2x);//TRACKBALL_MARKER negated makes it left
    glMatrix.vec4.add(p2, p_forward, p_up);
    glMatrix.vec4.add(p2, p2, p_right);
    glMatrix.vec4.add(p2, p2, position);//test
    //center of ball relative to camera    
    glMatrix.vec4.scaleAndAdd(p0, position, forward, 1);
    glMatrix.vec4.subtract(p1, p1, p0);
    glMatrix.vec4.subtract(p2, p2, p0);


    //Figure out how much to rotate around that axis.
    //vsub(p1,p2,d);
    //t = vlength(d) / (2.0*TRACKBALLSIZE);
    glMatrix.vec4.subtract(d, p1, p2);
    t = glMatrix.vec4.length(d) / (2.0*TRACKBALLSIZE);
    
    //Avoid problems with out-of-control values...
    if (t > 1.0) t = 1.0;
    if (t < -1.0) t = -1.0;
    phi = 2.0 * Math.asin(t);


    //use gram schmidt to make p2 orthogonal to p1
    glMatrix.vec4.normalize(p1, p1);
    glMatrix.vec4.normalize(p2, p2);
    var base = GramSchmidt2Vectors4Dimensions(p1, p2);

    var result = {};
    result.theta = phi;
    result.x = base.v1;
    result.y = base.v2;

    //###############################################################
    //end of inserted code
    //###############################################################
    
   return result;
}

module.exports = { trackball4D }