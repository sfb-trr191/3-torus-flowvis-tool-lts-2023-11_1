global.SHADER_MODULE_DEFAULT_METRIC = `

float dot_using_metric(vec3 a, vec3 b, vec3 position)
{    
	float x1 = position.x;
	float x2 = position.y;
	float x3 = position.z;
    float a1 = a.x;
	float a2 = a.y;
	float a3 = a.z;
    float b1 = b.x;
	float b2 = b.y;
	float b3 = b.z;

    float m1 = metric_tensor_r1c1;
    float m2 = metric_tensor_r1c2;
    float m3 = metric_tensor_r1c3;
    float m4 = metric_tensor_r2c1;
    float m5 = metric_tensor_r2c2;
    float m6 = metric_tensor_r2c3;
    float m7 = metric_tensor_r3c1;
    float m8 = metric_tensor_r3c2;
    float m9 = metric_tensor_r3c3;

    //see https://www.wolframalpha.com/input?i=%7Ba1%2C+a2%2C+a3%7D+*+%7B%7Bm1%2C+m2%2C+m3%7D%2C%7Bm4%2C+m5%2C+m6%7D%2C%7Bm7%2C+m8%2C+m9%7D%7D+*+%7B%7Bb1%7D%2C%7Bb2%7D%2C%7Bb3%7D%7D
	return (b1*(a1*m1 + a2*m4 + a3*m7) + b2*(a1*m2 + a2*m5 + a3*m8) + b3*(a1*m3 + a2*m6 + a3*m9));
}


`;