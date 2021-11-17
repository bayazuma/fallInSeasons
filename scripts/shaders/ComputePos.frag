precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uVelIntensity;
uniform sampler2D uTexPos;
uniform sampler2D uTexVel;

uniform vec3 cameraPosition;  // カメラの位置

void main()	{
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 position = texture2D( uTexPos, uv ).xyz;
  float reset = texture2D( uTexPos, uv ).w;
  vec3 velocity = texture2D( uTexVel, uv ).xyz;
  float mass = texture2D( uTexVel, uv ).w;

  position = position + velocity * uVelIntensity;

  //  vec2 edges = uResolution.xy/2.0;
  vec2 edges = uResolution.xy; // 時間差で出すため、1.0余分に泳がせる
  float edgeZ = 800.0;
  if(position.x > edges.x) {
    reset = -1.0;
    position.x = -edges.x;
  }
  else if(position.x < -edges.x) {
    reset = -1.0;
    position.x = edges.x;
  }
  // else if(position.y > edges.y) {
    // reset = -1.0;
  //   position.y = -edges.y;
  // }
  else if(position.y < -edges.y) {
    reset = -1.0;
    position.y = edges.y;
  }
  else if(position.z > edgeZ) {
    reset = -1.0;
    position.z = -edgeZ;
  }
  else if(position.z < -edgeZ) {
    reset = -1.0;
    position.z = edgeZ;
  }
  else {
    reset = 0.0;
  }

  gl_FragColor = vec4(position, reset);
}