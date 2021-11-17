attribute vec3 position;
attribute vec2 reference;
attribute float mass;
attribute vec3 random;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform sampler2D uTexPos;
uniform sampler2D uTexVel;
uniform float uTime;
uniform vec3 uRotateIntensity;
uniform vec2 uResolution;
uniform float uWaveAmp;
uniform float uWaveFreq;

varying vec2 vUv;
varying float vAlpha;

float map(float value, float inputMin, float inputMax, float outputMin, float outputMax, bool clamp) {
  if(clamp == true) {
    if(value < inputMin) return outputMin;
    if(value > inputMax) return outputMax;
  }

  float p = (outputMax - outputMin) / (inputMax - inputMin);
  return ((value - inputMin) * p) + outputMin;
}

// 大きさから透明度を計算
float getAlpha(float size) {
  // createVelTextureのmassのサイズに合わせる
  return map(size, 16.0, 110.0, 0.2, 1.0, true);
}

vec3 scale3d (vec3 pos, float scale) {
  mat3 mat =  mat3(
    scale, 0.0, 0.0,
    0.0, scale, 0.0,
    0.0, 0.0, scale
  );
  return mat * pos;
}

mat4 rotateX( in float angle ) {
  float s = sin(angle);
  float c = cos(angle);
	return mat4(
    1, 0,  0, 0,
    0, c,	-s,	0,
    0, s,	 c,	0,
    0, 0,	 0, 1
  );
}

mat4 rotateY( in float angle ) {
  float s = sin(angle);
  float c = cos(angle);
	return mat4(
     c, 0, s, 0,
		 0, 1, 0, 0,
		-s,	0, c,	0,
		 0, 0, 0, 1
  );
}

mat4 rotateZ( in float angle ) {
  float s = sin(angle);
  float c = cos(angle);
	return mat4(
    c,-s, 0, 0,
    s, c, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );
}

// 任意の軸で回転
mat4 rotateAxis(float angle, vec3 axis){
  vec3  a = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float r = 1.0 - c;
  mat4  m = mat4(
    a.x*a.x*r+c    , a.y*a.x*r+a.z*s, a.z*a.x*r-a.y*s,0,
    a.x*a.y*r-a.z*s, a.y*a.y*r+c    , a.z*a.y*r+a.x*s,0,
    a.x*a.z*r+a.y*s, a.y*a.z*r-a.x*s, a.z*a.z*r+c    ,0,
    0              , 0              , 0              ,1
  );
  return m;
}

mat4 scaleMat(float s) {
  return mat4(
    s, 0.0, 0.0, 0.0,
    0.0, s, 0.0, 0.0,
    0.0, 0.0, s, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

mat4 tranMat(vec3 pos) {
  return mat4(
    1.0,   0.0,   0.0,   0.0,
    0.0,   1.0,   0.0,   0.0,
    0.0,   0.0,   1.0,   0.0,
    pos.x, pos.y, pos.z, 1.0
  );
}

void main() {
  vUv = uv;

  vec4 pos = texture2D( uTexPos, reference);
  pos = pos;

  vec4 vel = texture2D( uTexVel, reference);
  float mass = vel.w;
  float speed = length(vel);
  float angle = speed * uTime * 0.002;

  // 回転
  mat4 rMatz = rotateZ(angle * mass * 0.1 * uRotateIntensity.z);
  mat4 rMatx = rotateX(angle * mass * 0.1 * uRotateIntensity.x);
  mat4 rMaty = rotateY(angle * mass * 0.1 * uRotateIntensity.y);
  // vec3 axis = vec3(1, 1, 0);
  // mat4 rMat = rotateAxis(angle, axis);

  // scale
  float size = mass;
  mat4 sMat = scaleMat(size);

  // pos
  float amp = uResolution.x/mass * uWaveAmp;
  float freq = uResolution.x*0.125/mass * uWaveFreq;
  float sinPos = sin(uTime * freq) * amp;
  pos.x += sinPos;
  mat4 tMat = tranMat(pos.xyz);

  // rZ->rX->rY->s->t
  mat4 mdlMatrix = tMat * sMat * rMaty * rMatx * rMatz;

  // parentのobject3D反映のためmodelMatrixも必要
  mat4 mvpMatrix = projectionMatrix * viewMatrix * modelMatrix * mdlMatrix;
  gl_Position =  mvpMatrix * vec4( position, 1.0 );

  // sizeからのアルファ計算
  vAlpha = getAlpha(size);
}