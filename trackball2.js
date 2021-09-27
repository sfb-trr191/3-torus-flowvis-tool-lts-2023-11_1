const glMatrix = require("gl-matrix");
const module_gl_matrix_extensions = require("./gl_matrix_extensions");
const TRACKBALLSIZE = 2;

/**
 * Project a point in NDC onto the arcball sphere 
 * returns quaternion
 */
function ndcToArcBall(x, y) {
    var p = glMatrix.vec2.fromValues(x, y);
    var dist = glMatrix.vec2.dot(p,p);

    /* Point is on sphere */
    if(dist <= 1.0){
        var z = Math.sqrt(1.0 - dist);
        return glMatrix.quat.fromValues(x, y, z, 0);
    }

    /* Point is outside sphere */
    else {
        var proj = glMatrix.vec2.create();
        glMatrix.vec2.normalize(proj, p);
        return glMatrix.quat.fromValues(proj[0], proj[1], 0, 0);
    }
}

function trackball_rotate(p1x, p1y, p2x, p2y, rot) {
    //const Vector2 mousePosNDC = screenCoordToNDC(mousePos);
    var currentQRotation = ndcToArcBall(p2x, p2y);
    var prevQRotation = ndcToArcBall(p1x, p1y);
    //_targetQRotation = (currentQRotation*prevQRotation*_targetQRotation).normalized();

    var currentQRotation_prevQRotation = glMatrix.quat.create();
    var result_rot = glMatrix.quat.create();
    glMatrix.quat.multiply(currentQRotation_prevQRotation, currentQRotation, prevQRotation);
    glMatrix.quat.multiply(result_rot, currentQRotation_prevQRotation, rot);
    glMatrix.quat.normalize(result_rot, result_rot);
    return result_rot;
}

function getRotationQuaternion(forward, up)
{
    _targetQRotation = glMatrix.quat.create();
    zAxis = glMatrix.vec3.create();
    xAxis = glMatrix.vec3.create();
    yAxis = glMatrix.vec3.create();
    tmp = glMatrix.vec3.create();
    //const Vector3 dir = viewCenter - position;
    glMatrix.vec3.normalize(forward, forward);
    glMatrix.vec3.normalize(up, up);

    //Vector3 zAxis = dir.normalized();
    glMatrix.vec3.copy(zAxis, forward);
    //Vector3 xAxis = (Math::cross(zAxis, up.normalized())).normalized();
    glMatrix.vec3.cross(tmp, zAxis, up);
    glMatrix.vec3.normalize(xAxis, tmp);
    //Vector3 yAxis = (Math::cross(xAxis, zAxis)).normalized();
    glMatrix.vec3.cross(tmp, xAxis, zAxis);
    glMatrix.vec3.normalize(yAxis, tmp);
    //xAxis = (Math::cross(zAxis, yAxis)).normalized();
    glMatrix.vec3.cross(tmp, zAxis, yAxis);
    glMatrix.vec3.normalize(xAxis, tmp);

    //_targetPosition = -viewCenter;
    //_targetZooming = -dir.length();
    //_targetQRotation = Quaternion::fromMatrix(
    //    Matrix3x3{xAxis, yAxis, -zAxis}.transposed()).normalized();

    var mat = glMatrix.mat3.fromValues(
            xAxis[0], xAxis[1], xAxis[2],
            yAxis[0], yAxis[1], yAxis[2],
            -zAxis[0], -zAxis[1], -zAxis[2]
        )

    glMatrix.mat3.transpose(mat, mat);
    glMatrix.quat.fromMat3(_targetQRotation, mat);
    glMatrix.quat.normalize(_targetQRotation, _targetQRotation);
    return _targetQRotation;

    //_positionT0  = _currentPosition = _targetPosition;
    //_zoomingT0 = _currentZooming = _targetZooming;
    //_qRotationT0 = _currentQRotation = _targetQRotation;

    //updateInternalTransformations();
}

module.exports = { ndcToArcBall, trackball_rotate, getRotationQuaternion }