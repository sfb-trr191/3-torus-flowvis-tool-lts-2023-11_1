const glMatrix = require("gl-matrix");
const module_gl_matrix_extensions = require("./gl_matrix_extensions");
const TRACKBALLSIZE = 2;

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


/**
 * Project the points onto the virtual trackball, then figure out the axis of rotation,
 * which is the cross product of P1 P2 and O P1 (O is the center of the ball, 0,0,0) 
 * Note: This is a deformed trackball
 * -- is a trackball in the center, but is deformed into a hyperbolic sheet of rotation away from the center. 
 * This particular function was chosen after trying out several variations.
 * It is assumed that the arguments to this routine are in the range (-1.0 ... 1.0) 
 * 
 * Param float p1x
 * Param float p1y
 * Param float p2x
 * Param float p2y
 * 
 * return quaternion q
 */
function trackball(p1x, p1y, p2x, p2y, position, forward, up, sensitivity){
    var q = glMatrix.quat.create(); //return value
    var a = glMatrix.vec3.create(); //float a[3]        Axis of rotation
    var phi;    //float phi         how much to rotate about axis
    var p1 = glMatrix.vec3.create();//float p1[3]
    var p2 = glMatrix.vec3.create();//float p2[3]
    var d = glMatrix.vec3.create(); //float d[3]
    var t;      //float t

    if (p1x == p2x && p1y == p2y) {
        //Zero rotation
        glMatrix.quat.identity(q);
        return q;
    }  
    
    //First, figure out z-coordinates for projection of P1 and P2 to
    //deformed sphere    
    //vset(p1,p1x,p1y,tb_project_to_sphere(TRACKBALLSIZE,p1x,p1y));
    //vset(p2,p2x,p2y,tb_project_to_sphere(TRACKBALLSIZE,p2x,p2y));
    p1z = tb_project_to_sphere(TRACKBALLSIZE,p1x,p1y);
    p2z = tb_project_to_sphere(TRACKBALLSIZE,p2x,p2y);
    //p1 = glMatrix.vec3.fromValues(p1x, p1y, p1z);
    //p2 = glMatrix.vec3.fromValues(p2x, p2y, p2z);

    //###############################################################
    //start of inserted code
    //###############################################################

    //calculate right vector
    var left = glMatrix.vec3.create();
    var right = glMatrix.vec3.create();
    glMatrix.vec3.cross(left, forward, up);
    glMatrix.vec3.negate(right, left);

    //apply camera vectors
    var p_forward = glMatrix.vec3.create();
    var p_up = glMatrix.vec3.create();
    var p_right = glMatrix.vec3.create();    
    //apply camera vectors to p1
    glMatrix.vec3.scale(p_forward, forward, p1z);
    glMatrix.vec3.scale(p_up, up, p1y);
    glMatrix.vec3.scale(p_right, right, -p1x);//TRACKBALL_MARKER negated makes it left
    glMatrix.vec3.add(p1, p_forward, p_up);
    glMatrix.vec3.add(p1, p1, p_right);
    //apply camera vectors to p2
    glMatrix.vec3.scale(p_forward, forward, p2z);
    glMatrix.vec3.scale(p_up, up, p2y);
    glMatrix.vec3.scale(p_right, right, -p2x);//TRACKBALL_MARKER negated makes it left
    glMatrix.vec3.add(p2, p_forward, p_up);
    glMatrix.vec3.add(p2, p2, p_right);

    //###############################################################
    //end of inserted code
    //###############################################################
    
    //Now, we want the cross product of P1 and P2
    //vcross(p2,p1,a);
    glMatrix.vec3.cross(a, p2, p1);
    glMatrix.vec3.normalize(a, a);

    //Figure out how much to rotate around that axis.
    //vsub(p1,p2,d);
    //t = vlength(d) / (2.0*TRACKBALLSIZE);
    glMatrix.vec3.subtract(d, p1, p2);
    t = glMatrix.vec3.length(d) / (2.0*TRACKBALLSIZE);
    
    //Avoid problems with out-of-control values...
    if (t > 1.0) t = 1.0;
    if (t < -1.0) t = -1.0;
    phi = 2.0 * Math.asin(t);

    console.log("DCAM p2z:", p2z);
    console.log("DCAM phi:", phi);

    //axis_to_quat(a,phi,q);
    glMatrix.quat.setAxisAngle(q, a, -phi * sensitivity);
    
   return q;
}

/**
 * Project the points onto the virtual trackball, then figure out the axis of rotation,
 * which is the cross product of P1 P2 and O P1 (O is the center of the ball, 0,0,0) 
 * Note: This is a deformed trackball
 * -- is a trackball in the center, but is deformed into a hyperbolic sheet of rotation away from the center. 
 * This particular function was chosen after trying out several variations.
 * It is assumed that the arguments to this routine are in the range (-1.0 ... 1.0) 
 * 
 * Param float p1x
 * Param float p1y
 * Param float p2x
 * Param float p2y
 * 
 * return quaternion q
 */
 function trackball_old(p1x, p1y, p2x, p2y){
    var q = glMatrix.quat.create(); //return value
    var a = glMatrix.vec3.create(); //float a[3]        Axis of rotation
    var phi;    //float phi         how much to rotate about axis
    var p1;     //float p1[3]
    var p2;     //float p2[3]
    var d = glMatrix.vec3.create(); //float d[3]
    var t;      //float t

    console.log("x", p2x)
    console.log("y", p2y)

    if (p1x == p2x && p1y == p2y) {
        //Zero rotation
        glMatrix.quat.identity(q);
        return q;
    }  
    
    //First, figure out z-coordinates for projection of P1 and P2 to
    //deformed sphere    
    //vset(p1,p1x,p1y,tb_project_to_sphere(TRACKBALLSIZE,p1x,p1y));
    //vset(p2,p2x,p2y,tb_project_to_sphere(TRACKBALLSIZE,p2x,p2y));
    p1z = tb_project_to_sphere(TRACKBALLSIZE,p1x,p1y);
    p2z = tb_project_to_sphere(TRACKBALLSIZE,p2x,p2y);
    p1 = glMatrix.vec3.fromValues(p1x, p1y, p1z);
    p2 = glMatrix.vec3.fromValues(p2x, p2y, p2z);
    
    //Now, we want the cross product of P1 and P2
    //vcross(p2,p1,a);
    glMatrix.vec3.cross(a, p2, p1);

    //Figure out how much to rotate around that axis.
    //vsub(p1,p2,d);
    //t = vlength(d) / (2.0*TRACKBALLSIZE);
    glMatrix.vec3.subtract(d, p1, p2);
    t = glMatrix.vec3.length(d) / (2.0*TRACKBALLSIZE);
    
    //Avoid problems with out-of-control values...
    if (t > 1.0) t = 1.0;
    if (t < -1.0) t = -1.0;
    phi = 2.0 * Math.asin(t);

    console.log("DCAM phi:", phi);

    //axis_to_quat(a,phi,q);
    glMatrix.quat.setAxisAngle(q, a, phi);
    
   return q;
}

module.exports = { tb_project_to_sphere, trackball }