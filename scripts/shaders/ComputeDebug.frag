precision highp float;

uniform vec2 uResolution;
uniform sampler2D uTexPos;
uniform sampler2D uTexVel;
varying vec2 vUv;

void main(){
  vec2 fc = gl_FragCoord.xy/uResolution;
  vec4 position = texture2D(uTexVel, vUv);
  gl_FragColor=vec4(position.xyz, 1.0);
  // gl_FragColor=vec4(fc, 0.0, 1.0);
}