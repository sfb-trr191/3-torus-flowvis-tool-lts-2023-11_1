const glMatrix = require("gl-matrix");
const math4D = require("./math4D");
const seedrandom = require("seedrandom");

function IntersectSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result){
    //console.log("-----------------------------");
    //console.log("spherinder_point_A", spherinder_point_A);
    //console.log("spherinder_point_B", spherinder_point_B);
    //var spherinder_point_A_translated = glMatrix.vec4.create();
    var spherinder_point_B_translated = glMatrix.vec4.create();
    var ray_origin_4D_translated = glMatrix.vec4.create();
    var ray_destination_4D_translated = glMatrix.vec4.create();

    var ray_destination_4D = glMatrix.vec4.create();

    var ray_origin_4D_rotated = glMatrix.vec4.create();
    var ray_destination_4D_rotated = glMatrix.vec4.create();
    //var spherinder_point_A_rotated = glMatrix.vec4.create();
    //var spherinder_point_B_rotated = glMatrix.vec4.create();

    var ray_direction_3D = glMatrix.vec3.create();

    var ray_direction_4D_rotated = glMatrix.vec4.create();
    var intersection_4D_os = glMatrix.vec4.create();
    var intersection_4D_ws = glMatrix.vec4.create();
    var spherinder_direction = glMatrix.vec4.create();
    var intersection_center_4D_ws = glMatrix.vec4.create();
    

    //get second point on line
    glMatrix.vec4.add(ray_destination_4D, ray_origin_4D, ray_direction_4D);

    //translate to origin
    //glMatrix.vec4.subtract(spherinder_point_A_translated, spherinder_point_A, spherinder_point_A);//unnecessary, results in 0
    glMatrix.vec4.subtract(spherinder_point_B_translated, spherinder_point_B, spherinder_point_A);
    glMatrix.vec4.subtract(ray_origin_4D_translated, ray_origin_4D, spherinder_point_A);
    glMatrix.vec4.subtract(ray_destination_4D_translated, ray_destination_4D, spherinder_point_A);
    //console.log("spherinder_point_A_translated", spherinder_point_A_translated);
    //console.log("spherinder_point_B_translated", spherinder_point_B_translated);
    //console.log("ray_origin_4D_translated", ray_origin_4D_translated);

    //get rotation matrix
    var M = math4D.getAligned4DRotationMatrix(spherinder_point_B_translated);

    //rotate points
    glMatrix.vec4.transformMat4(ray_origin_4D_rotated, ray_origin_4D_translated, M);
    glMatrix.vec4.transformMat4(ray_destination_4D_rotated, ray_destination_4D_translated, M);
    //glMatrix.vec4.transformMat4(spherinder_point_A_rotated, spherinder_point_A_translated, M);
    //glMatrix.vec4.transformMat4(spherinder_point_B_rotated, spherinder_point_B_translated, M);
    //console.log("spherinder_point_A_rotated", spherinder_point_A_rotated);
    //console.log("spherinder_point_B_rotated", spherinder_point_B_rotated);

    //get 3D points
    var ray_origin_3D = glMatrix.vec3.fromValues(ray_origin_4D_rotated[0], ray_origin_4D_rotated[1], ray_origin_4D_rotated[2]);
    var ray_destination_3D = glMatrix.vec3.fromValues(ray_destination_4D_rotated[0], ray_destination_4D_rotated[1], ray_destination_4D_rotated[2]);
    //var spherinder_point_A_3D = glMatrix.vec3.fromValues(spherinder_point_A_rotated[0], spherinder_point_A_rotated[1], spherinder_point_A_rotated[2]);
    //var spherinder_point_B_3D = glMatrix.vec3.fromValues(spherinder_point_B_rotated[0], spherinder_point_B_rotated[1], spherinder_point_B_rotated[2]);

    //get 3D direction vector
    glMatrix.vec3.subtract(ray_direction_3D, ray_destination_3D, ray_origin_3D);
    var sphere_center_3D = glMatrix.vec3.fromValues(0, 0, 0);

    //intersect sphere in 3D
    result.intersect = false;
    IntersectSphere(ray_origin_3D, ray_destination_3D, sphere_center_3D, radius, result)

    //if no sphere intersection --> no intersection
    if(!result.intersect){
        return;
    }

    //------------- 4D OBJECT SPACE -----------------

    //get 4D rotated direction vector
    glMatrix.vec4.subtract(ray_direction_4D_rotated, ray_destination_4D_rotated, ray_origin_4D_rotated);
    //sphere intersection found, get w
    glMatrix.vec4.scaleAndAdd(intersection_4D_os, ray_origin_4D_rotated, ray_direction_4D_rotated, result.t);
    var h = glMatrix.vec4.distance(spherinder_point_A, spherinder_point_B);//spherinder_point_B_rotated[3];   
    var w_os = intersection_4D_os[3];
    if(w_os > h || w_os < 0.0)
	{
        result.intersect = false;
        result.flag_outside_interval = true;
		return;
	}

    //var zero3 = glMatrix.vec3.fromValues(0,0,0)
    //var dist = glMatrix.vec3.distance(zero3, result.intersection_3D);
    //console.log("dist sphere", dist);
    //var center_os = glMatrix.vec4.fromValues(0,0,0,w_os);
    //var dist = glMatrix.vec4.distance(center_os, intersection_4D_os);
    //console.log("intersection_4D_os", intersection_4D_os);
    //console.log("center_os", center_os);
    //console.log("dist sphererinder os", dist);

    //------------- 4D WORLD SPACE -----------------

    //intersection in world space
    glMatrix.vec4.scaleAndAdd(intersection_4D_ws, ray_origin_4D, ray_direction_4D, result.t);
    result.intersection_4D = intersection_4D_ws;

    //get intersection center (nearest point on spherinder center line)
    var t_spherinder = w_os / h;
    glMatrix.vec4.subtract(spherinder_direction, spherinder_point_B, spherinder_point_A);
    glMatrix.vec4.scaleAndAdd(intersection_center_4D_ws, spherinder_point_A, spherinder_direction, t_spherinder);
    result.intersection_center_4D = intersection_center_4D_ws;
    //console.log(result);
    //console.log(intersection_4D_os);
    //debugger;
    //console.log("intersection_4D", intersection_4D_ws);
    //console.log("intersection_center_4D_ws", intersection_center_4D_ws);
    //var dist = glMatrix.vec4.distance(intersection_4D_ws, intersection_center_4D_ws);
    //console.log("dist sphererinder ws", dist);


}

function IntersectSphere(ray_origin_3D, ray_destination_3D, sphere_center_3D, sphere_radius, result)
{
    var ray_direction_3D = glMatrix.vec3.create();
    var ray_direction_3D_normalized = glMatrix.vec3.create();
    //get 3D direction vector
    glMatrix.vec3.subtract(ray_direction_3D, ray_destination_3D, ray_origin_3D);
    glMatrix.vec3.normalize(ray_direction_3D_normalized, ray_direction_3D);

    //console.log("sphere_radius", sphere_radius);
    var z = glMatrix.vec3.create();
    var intersection_3D = glMatrix.vec3.create();
    //console.log("ray_origin_3D", ray_origin_3D);
    //console.log("ray_direction_3D", ray_direction_3D);
    //console.log("sphere_center_3D", sphere_center_3D);
    //console.log("sphere_radius", sphere_radius);
    
	glMatrix.vec3.subtract(z, ray_origin_3D, sphere_center_3D);//vec3 z = ray.origin - sphere.center;//e-c
	var a = glMatrix.vec3.dot(ray_direction_3D_normalized, ray_direction_3D_normalized);//float a = dot(ray.direction, ray.direction);
	var b = 2.0 * glMatrix.vec3.dot(ray_direction_3D_normalized, z);//float b = 2.0 * dot(ray.direction, z);
	var c = glMatrix.vec3.dot(z, z) - sphere_radius*sphere_radius;//float c = dot(z, z) - sphere.radius * sphere.radius;

	var discriminant = b*b - 4.0 * a *c;//float discriminant = b*b - 4.0 * a *c;
    //console.log("discriminant", discriminant);
	if (discriminant < 0.0)
		return;
		
    var root = Math.sqrt(discriminant);//float root = sqrt(discriminant);
	var t1 = (-b + root) * 0.5;//float t1 = (-b + root) * 0.5f;
	var t2 = (-b - root) * 0.5;//float t2 = (-b - root) * 0.5f;
	var t_os = 0.0;//T BASED ON NORMALIZED RAY DIRECTION, THIS IS NOT THE REAL DISTANCE
    //console.log("t1", t1);
    //console.log("t2", t2);
		
	if(t1 < 0.0)
	{
		if(t2 < 0.0)
			return;
        t_os = t2;
	}
	else if (t2 < 0.0)
        t_os = t1;
	else
        t_os = Math.min(t1, t2);
	
    //console.log("t_os", t_os);
	//float distance_surface = ray.rayDistance + t_os;
    //we normalize our 4D ray directions, meaning the 3D ray direction is not necessarily normalized
    //we calculate the sphere intersection using a normalized 3D ray direction
    //to get the real distance, the resulting t_os is scaled by the length of the 3D
    var scaled_t = t_os / glMatrix.vec3.length(ray_direction_3D);
		
    //calculate intersection point
    glMatrix.vec3.scaleAndAdd(intersection_3D, ray_origin_3D, ray_direction_3D_normalized, t_os);//vec3 intersection_3D = ray.origin + t_os * ray.direction;//intersection point in world space
				
    result.intersect = true;
    result.intersection_3D = intersection_3D;
    result.t = scaled_t;
    //console.log("intersects", true);
    //console.log("result sphere", result);
    //console.log("result sphere intersection_3D", intersection_3D);
}

function Intersect3Sphere(ray_origin_4D, ray_direction_4D, sphere_center_4D, sphere_radius, result)
{
    //console.log("sphere_radius", sphere_radius);
    var z = glMatrix.vec4.create();
    var intersection_4D = glMatrix.vec4.create();
    //console.log("ray_origin_4D", ray_origin_4D);
    //console.log("ray_direction_4D", ray_direction_3D);
    //console.log("sphere_center_4D", sphere_center_4D);
    //console.log("sphere_radius", sphere_radius);
    
	glMatrix.vec4.subtract(z, ray_origin_4D, sphere_center_4D);//vec3 z = ray.origin - sphere.center;//e-c
	var a = glMatrix.vec4.dot(ray_direction_4D, ray_direction_4D);//float a = dot(ray.direction, ray.direction);
	var b = 2.0 * glMatrix.vec4.dot(ray_direction_4D, z);//float b = 2.0 * dot(ray.direction, z);
	var c = glMatrix.vec4.dot(z, z) - sphere_radius*sphere_radius;//float c = dot(z, z) - sphere.radius * sphere.radius;

	var discriminant = b*b - 4.0 * a *c;//float discriminant = b*b - 4.0 * a *c;
    //console.log("discriminant", discriminant);
	if (discriminant < 0.0)
		return;
		
    var root = Math.sqrt(discriminant);//float root = sqrt(discriminant);
	var t1 = (-b + root) * 0.5;//float t1 = (-b + root) * 0.5f;
	var t2 = (-b - root) * 0.5;//float t2 = (-b - root) * 0.5f;
	var t_os = 0.0;//T BASED ON NORMALIZED RAY DIRECTION, THIS IS NOT THE REAL DISTANCE
    //console.log("t1", t1);
    //console.log("t2", t2);
		
	if(t1 < 0.0)
	{
		if(t2 < 0.0)
			return;
        t_os = t2;
	}
	else if (t2 < 0.0)
        t_os = t1;
	else
        t_os = Math.min(t1, t2);
	
    //console.log("t_os", t_os);
	//float distance_surface = ray.rayDistance + t_os;
		
    //calculate intersection point
    glMatrix.vec4.scaleAndAdd(intersection_4D, ray_origin_4D, ray_direction_4D, t_os);//vec3 intersection_3D = ray.origin + t_os * ray.direction;//intersection point in world space
				
    result.intersect = true;
    result.intersection_4D = intersection_4D;
    result.t = t_os;
    //console.log("intersects", true);
    //console.log("result sphere", result);
    //console.log("result sphere intersection_4D", intersection_4D);
}

function TestIntersectSphere(){
    console.log("-----------------------------");
    var result = {};
    result.intersect = false;
    var ray_origin_3D = glMatrix.vec3.fromValues(-1,0,0);
    var ray_direction_3D = glMatrix.vec3.fromValues(1,0,0);
    var sphere_center_3D = glMatrix.vec3.fromValues(0,0,0);
    var sphere_radius = 0.5;
    IntersectSphere(ray_origin_3D, ray_direction_3D, sphere_center_3D, sphere_radius, result);
    console.log(result);

    console.log("-----------------------------");
    var result = {};
    result.intersect = false;
    var ray_origin_3D = glMatrix.vec3.fromValues(1,0,0);
    var ray_direction_3D = glMatrix.vec3.fromValues(1,0,0);
    var sphere_center_3D = glMatrix.vec3.fromValues(0,0,0);
    var sphere_radius = 0.5;
    IntersectSphere(ray_origin_3D, ray_direction_3D, sphere_center_3D, sphere_radius, result);
    console.log(result);

    console.log("-----------------------------");
    console.log("slightly above y value --> doesnt intersect");
    var result = {};
    result.intersect = false;
    var ray_origin_3D = glMatrix.vec3.fromValues(-1,0.51,0);
    var ray_direction_3D = glMatrix.vec3.fromValues(1,0,0);
    var sphere_center_3D = glMatrix.vec3.fromValues(0,0,0);
    var sphere_radius = 0.5;
    IntersectSphere(ray_origin_3D, ray_direction_3D, sphere_center_3D, sphere_radius, result);
    console.log(result);

    console.log("-----------------------------");
    console.log("slightly below y value --> intersects");
    var result = {};
    result.intersect = false;
    var ray_origin_3D = glMatrix.vec3.fromValues(-1,0.4999,0);
    var ray_direction_3D = glMatrix.vec3.fromValues(1,0,0);
    var sphere_center_3D = glMatrix.vec3.fromValues(0,0,0);
    var sphere_radius = 0.5;
    IntersectSphere(ray_origin_3D, ray_direction_3D, sphere_center_3D, sphere_radius, result);
    console.log(result);
}

function GetRandomVector3D(minValue, maxValu, normalize){
    var result = glMatrix.vec3.fromValues(
        minValue + rng() * (maxValu-minValue),
        minValue + rng() * (maxValu-minValue),
        minValue + rng() * (maxValu-minValue)
    );
    if(normalize){
        glMatrix.vec3.normalize(result, result);
    }    
    return result;
}

function GetRandomVector4D(minValue, maxValu, normalize){
    var result = glMatrix.vec4.fromValues(
        minValue + rng() * (maxValu-minValue),
        minValue + rng() * (maxValu-minValue),
        minValue + rng() * (maxValu-minValue),
        minValue + rng() * (maxValu-minValue)
    );
    if(normalize){
        glMatrix.vec4.normalize(result, result);
    }    
    return result;
}

function GetRandomValue(minValue, maxValu){
    return minValue + rng() * (maxValu-minValue);
}

function ApproxShortestDistanceRaySphere(ray_origin_3D, ray_direction_3D, sphere_center_3D){
    console.log("ApproxShortestDistanceRaySphere");
    tmp = glMatrix.vec3.create();
    t = 0;
    var delta_t = 0.01;
    var best_dist = 1000000000000;
    var best_t = 10000000000;
    while(true){
        glMatrix.vec3.scaleAndAdd(tmp, ray_origin_3D, ray_direction_3D, t);
        var dist = glMatrix.vec3.distance(sphere_center_3D, tmp);
        if(dist > best_dist){
            break;
        }
        best_t = t;
        best_dist = dist;
        t += delta_t;
    }
    return best_dist;
}

function ApproxShortestDistanceRaySphere4D(ray_origin_4D, ray_direction_4D, sphere_center_4D){
    tmp = glMatrix.vec4.create();
    t = 0;
    var delta_t = 0.01;
    var best_dist = 1000000000000;
    var best_t = 10000000000;
    while(true){
        glMatrix.vec4.scaleAndAdd(tmp, ray_origin_4D, ray_direction_4D, t);
        var dist = glMatrix.vec4.distance(sphere_center_4D, tmp);
        if(dist > best_dist){
            break;
        }
        best_t = t;
        best_dist = dist;
        t += delta_t;
    }
    return best_dist;
}

function ValidateIntersectionSphere(ray_origin_3D, ray_direction_3D, sphere_center_3D, sphere_radius, result){
    if(result.intersect){
        var dist = glMatrix.vec3.distance(sphere_center_3D, result.intersection_3D);
        var diff = Math.abs(dist - sphere_radius);
        console.log("intersection found, diff: ", diff);
    }else{
        var shortest_distance = ApproxShortestDistanceRaySphere(ray_origin_3D, ray_direction_3D, sphere_center_3D);
        var diff = Math.abs(shortest_distance - sphere_radius);
        console.log("no intersection found, diff: ", diff);
    }
}

function ValidateIntersection3Sphere(ray_origin_4D, ray_direction_4D, sphere_center_4D, sphere_radius, result){
    var shortest_distance = ApproxShortestDistanceRaySphere4D(ray_origin_4D, ray_direction_4D, sphere_center_4D);
    if(result.intersect){
        var dist = glMatrix.vec4.distance(sphere_center_4D, result.intersection_4D);
        var diff = Math.abs(dist - sphere_radius);
        console.log("intersection found, diff: ", diff, "shortest_distance", shortest_distance);
    }else{
        var diff = Math.abs(shortest_distance - sphere_radius);
        console.log("no intersection found, diff: ", diff, "shortest_distance", shortest_distance);
    }
}

function ValidateIntersectionSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result){
    var sphere_center_4D = glMatrix.vec4.create();
    var sphereinder_direction_4D = glMatrix.vec4.create();
    var best_shortest_distance = 100000000000;
    glMatrix.vec4.subtract(sphereinder_direction_4D, spherinder_point_B, spherinder_point_A);

    for(var i=0; i<1000; i++){
        var t = i/(1000-1);
        glMatrix.vec4.scaleAndAdd(sphere_center_4D, spherinder_point_A, sphereinder_direction_4D, t);
        var shortest_distance = ApproxShortestDistanceRaySphere4D(ray_origin_4D, ray_direction_4D, sphere_center_4D)
        if(shortest_distance < best_shortest_distance)
            best_shortest_distance = shortest_distance;
    }

    if(result.flag_outside_interval){
        console.log("no intersection in interval but outside of spherinder interval");
    }
    else if(result.intersect){
        //var dist = glMatrix.vec3.distance(sphere_center_3D, result.intersection_3D);
        //var diff = Math.abs(dist - sphere_radius);
        //console.log("result: ", result);

        
        var dist = glMatrix.vec4.distance(result.intersection_center_4D, result.intersection_4D);
        //console.log("dist: ", dist);
        var diff = Math.abs(dist - radius);
        //console.log("diff: ", diff);

        if(diff < 0.000001){
            console.log("valid hit found, diff to radius is:", diff, "shortest dist=", best_shortest_distance);
            console.log("           ray_origin_4D:", ray_origin_4D);
            console.log("           ray_direction_4D:", ray_direction_4D);
            console.log("           spherinder_point_A:", spherinder_point_A);
            console.log("           spherinder_point_B:", spherinder_point_B);
        }
        else{
            console.log("INVALID hit found, diff to radius is:", diff, "shortest dist=", best_shortest_distance);

        }
    }else{
        //var shortest_distance = ApproxShortestDistanceRaySphere(ray_origin_3D, ray_direction_3D, sphere_center_3D);
        //var diff = Math.abs(shortest_distance - sphere_radius);
        //console.log("no intersection found, diff: ", diff);

        //if the shortest distance is smaller than the radius we might have missed an intersection
        if(best_shortest_distance < radius){
            /*
            if(result.flag_outside_interval){
                console.log("no intersection in interval but outside of spherinder interval");
            }else{
                console.log("WARNING: missed intersection shortest distance:", best_shortest_distance, "intersection:", result);                
            }
            */
            console.log("WARNING: missed intersection shortest distance:", best_shortest_distance, "intersection:", result);        
        }else{
            console.log("no intersection at all. best distance:", best_shortest_distance);
        }
    }
}

function RandomizedTestIntersectSphere(){
    rng = seedrandom();

    for (var i=0; i<100; i++) {
        var result = {};
        result.intersect = false;
        var ray_origin_3D = GetRandomVector3D(-1, 1, false);
        var ray_direction_3D = GetRandomVector3D(-1, 1, true);
        var sphere_center_3D = GetRandomVector3D(-1, 1, false);
        var sphere_radius = 0.5;//GetRandomValue(0.4, 0.5);
        IntersectSphere(ray_origin_3D, ray_direction_3D, sphere_center_3D, sphere_radius, result);
        ValidateIntersectionSphere(ray_origin_3D, ray_direction_3D, sphere_center_3D, sphere_radius, result);   
    }
}

function RandomizedTestIntersect3Sphere(){
    console.log("------------ RandomizedTestIntersect3Sphere ------------");
    rng = seedrandom("RandomizedTestIntersect3Sphere");

    for (var i=0; i<100; i++) {
        var result = {};
        result.intersect = false;
        result.flag_outside_interval = false;
        var ray_origin_4D = GetRandomVector4D(-1, 1, false);
        var ray_direction_4D = GetRandomVector4D(-1, 1, true);
        var sphere_center_4D = GetRandomVector4D(-1, 1, false);
        var radius = 0.5;//GetRandomValue(0.4, 0.5);
        Intersect3Sphere(ray_origin_4D, ray_direction_4D, sphere_center_4D, radius, result);
        ValidateIntersection3Sphere(ray_origin_4D, ray_direction_4D, sphere_center_4D, radius, result);
        //ValidateIntersectionSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result);
    }
}

function RandomizedTestIntersectSpherinder(){
    console.log("------------ RandomizedTestIntersectSpherinder ------------");
    rng = seedrandom("RandomizedTestIntersectSpherinder");

    for (var i=0; i<100; i++) {
        var result = {};
        result.intersect = false;
        result.flag_outside_interval = false;
        var ray_origin_4D = GetRandomVector4D(-1, 1, false);
        var ray_direction_4D = GetRandomVector4D(-1, 1, true);
        var spherinder_point_A = GetRandomVector4D(-1, 1, false);
        var spherinder_point_B = GetRandomVector4D(-1, 1, false);
        var radius = 0.5;//GetRandomValue(0.4, 0.5);
        IntersectSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result);
        ValidateIntersectionSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result);
    }
}

function TestCase01(){
    console.log("TestCase01: POSITIVE INTERSECTION LINE SPHERINDER");
    var radius = 0.5;
    var result = {};
    result.intersect = false;
    result.flag_outside_interval = false;
    var ray_origin_4D = glMatrix.vec4.fromValues(
        0.011895515024662018,
        -0.42977961897850037,
        -0.6823511719703674,
        0.7213745713233948
    );
    var ray_direction_4D = glMatrix.vec4.fromValues(
        -0.2936179041862488,
        -0.4730651080608368,
        0.567871630191803,
        -0.606234073638916
    );
    var spherinder_point_A = glMatrix.vec4.fromValues(
        0.5463999509811401,
        -0.4963940680027008,
        -0.7993444204330444,
        0.9073070883750916
    );
    var spherinder_point_B = glMatrix.vec4.fromValues(
        -0.8008022904396057,
        0.5201994776725769,
        -0.41431981325149536,
        -0.9893190264701843
    );
    IntersectSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result);
    ValidateIntersectionSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result);
}

function TestCase02(){
    console.log("TestCase02: NEGATIVE INTERSECTION LINE SPHERINDER");
    var radius = 0.5;
    var result = {};
    result.intersect = false;
    result.flag_outside_interval = false;
    var ray_origin_4D = glMatrix.vec4.fromValues(
        0.0,
        0.0,
        0.0,
        0.0
    );
    var ray_direction_4D = glMatrix.vec4.fromValues(
        0.0,
        0.0,
        0.0,
        1.0
    );
    var spherinder_point_A = glMatrix.vec4.fromValues(
        1.0,
        0.0,
        0.0,
        0.0
    );
    var spherinder_point_B = glMatrix.vec4.fromValues(
        1.0,
        1.0,
        0.0,
        0.0
    );
    IntersectSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result);
    ValidateIntersectionSpherinder(ray_origin_4D, ray_direction_4D, spherinder_point_A, spherinder_point_B, radius, result);
}

function KnownTestCases(){
    console.log("--------------------------KnownTestCases----------------------------");
    TestCase01();
    console.log("--------------------------");
    TestCase02();
}

function Test(){
    console.log("CPU INTERSECTION TESTS");
    //TestIntersectSphere();
    //RandomizedTestIntersectSphere();
    RandomizedTestIntersectSpherinder();
    RandomizedTestIntersect3Sphere();
    KnownTestCases();
    //debugger;
}

exports.Test = Test;

/*


    var ray_direction_4D = glMatrix.vec4.fromValues(
        000000000000,
        000000000000,
        000000000000,
        000000000000
    );


*/