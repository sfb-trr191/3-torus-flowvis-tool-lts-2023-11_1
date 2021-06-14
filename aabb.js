class AABB {

    constructor() {
        this.min = glMatrix.vec4.create();
        this.max = glMatrix.vec4.create();
        this.center = glMatrix.vec4.create();
        this.mean_center = glMatrix.vec4.create();
    }

    SetTube(a, b, r) {
        //min = QVector4D(std::min(a.x(), b.x()), std::min(a.y(), b.y()), std::min(a.z(), b.z()), 1)-r;
        glMatrix.vec4.min(this.min, a, b);
        glMatrix.vec4.subtract(this.min, this.min, r);

        //max = QVector4D(std::max(a.x(), b.x()), std::max(a.y(), b.y()), std::max(a.z(), b.z()), 1)+r;
        glMatrix.vec4.max(this.max, a, b);
        glMatrix.vec4.add(this.max, this.max, r);

        //center = (a + b) * 0.5;
        glMatrix.vec4.add(this.center, a, b);
        glMatrix.vec4.scale(this.center, this.center, 0.5);

        glMatrix.vec4.copy(this.mean_center, this.center);
    }

    Translate(translation) {
        glMatrix.vec4.add(this.min, this.min, translation);
        glMatrix.vec4.add(this.max, this.max, translation);
        glMatrix.vec4.add(this.center, this.center, translation);
        glMatrix.vec4.add(this.mean_center, this.mean_center, translation);
    }

    //std::vector<AABB*> &toCombine
    Combine(toCombine) {
        //console.log("Combine");
        glMatrix.vec4.copy(this.min, toCombine[0].min);
        glMatrix.vec4.copy(this.max, toCombine[0].max);
        glMatrix.vec4.copy(this.mean_center, toCombine[0].center);
        //console.log("this.min: " + this.min);
        //console.log("this.max: " + this.max);
        for (var i = 1; i < toCombine.length; i++) {
            var b = toCombine[i];//AABB *b 
            //console.log("b.min: " + b.min);
            //console.log("b.max: " + b.max);
            //min = QVector4D(std::min(min.x(), b->min.x()), std::min(min.y(), b->min.y()), std::min(min.z(), b->min.z()), 1);
            glMatrix.vec4.min(this.min, this.min, b.min);
            //console.log("this.min: " + this.min);

            //max = QVector4D(std::max(max.x(), b->max.x()), std::max(max.y(), b->max.y()), std::max(max.z(), b->max.z()), 1);
            glMatrix.vec4.max(this.max, this.max, b.max);
            //console.log("this.max: " + this.max);

            glMatrix.vec4.add(this.mean_center, this.mean_center, b.center);//meanCenter += toCombine[i].center;
        }
        //this.center = (min + max) * 0.5;
        //console.log("this.center: " + this.center);	
        glMatrix.vec4.add(this.center, this.min, this.max);
        //console.log("this.center: " + this.center);	
        glMatrix.vec4.scale(this.center, this.center, 0.5);
        //console.log("this.center: " + this.center);	

        //this.mean_center /= toCombine.size();
        glMatrix.vec4.scale(this.mean_center, this.mean_center, 1 / toCombine.length);
        //console.log("this.min: " + this.min);
        //console.log("this.max: " + this.max);
        //console.log("this.center: " + this.center);	
        //console.log("this.mean_center: " + this.mean_center);
        //console.log("Combine completed");
    }

    Intersect(other) {
        return !(
            other.min[0] > this.max[0] ||//other.min.x() > max.x() ||
            other.max[0] < this.min[0] ||//other.max.x() < min.x() ||
            other.min[1] > this.max[1] ||//other.min.y() > max.y() ||
            other.max[1] < this.min[1] ||//other.max.y() < min.y() ||
            other.min[2] > this.max[2] ||//other.min.z() > max.z() ||
            other.max[2] < this.min[2]);//other.max.z() < min.z());
    }

    GetVolume() {
        var difference = glMatrix.vec4.create();
        glMatrix.vec4.subtract(difference, this.max, this.min);//QVector4D sizes = max - min;
        return difference[0] * difference[1] * difference[2];
    }
}