precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uTexInit;
uniform sampler2D uTexPos;
uniform sampler2D uTexVel;
uniform vec3 uForce;
uniform vec2 uMouse;
// varying vec2 vUv;

const float SPEED_LIMIT = 80.0;

void applyForce (vec3 force, float mass, inout vec3 acc) {
  vec3 f = force / mass;
  acc = acc + f;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec3 position = texture2D( uTexPos, uv ).xyz;
  float reset = texture2D( uTexPos, uv ).w;

  vec3 velocity = texture2D( uTexVel, uv ).xyz;
  float mass = texture2D( uTexVel, uv ).w;

  vec4 initVelocity = texture2D( uTexInit, uv );

  // edges
  if(-1.0 == reset) {
    velocity = initVelocity.xyz;
    // velocity = vec3(0.0,0.0,0.0);
    mass = initVelocity.w;
  }

  vec3 acc;
  // applyForce(vec3(uMouse, 0.0), mass, acc);
  // vec3 windF = vec3(uForce.x, 0.0, uForce.z);
  // applyForce(windF, mass, acc);
  // vec3 weightF = vec3(0.0, uForce.y, 0.0) * mass/1000.0;
  // applyForce(weightF, 1.0, acc);
  vec3 weightAndWindF = uForce*mass/1000.0;
  applyForce(weightAndWindF, 1.0, acc);
  velocity += acc;

  // Speed Limits
  // if ( length( velocity ) > SPEED_LIMIT ) {
  //   velocity = normalize( velocity ) * SPEED_LIMIT;
  // }

  gl_FragColor = vec4( velocity, mass );
}