precision highp float;

varying vec2 vUv;
uniform sampler2D uTexAlbedo;
uniform float uHue;
uniform float uSat;
uniform float uOpacity;

varying float vAlpha;

vec3 saturate(vec3 x)
{
    return clamp( x, 0.0, 1.0 );
}

void hue(vec3 In, float Offset, out vec3 Out)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 P = mix(vec4(In.bg, K.wz), vec4(In.gb, K.xy), step(In.b, In.g));
    vec4 Q = mix(vec4(P.xyw, In.r), vec4(In.r, P.yzx), step(P.x, In.r));
    float D = Q.x - min(Q.w, Q.y);
    float E = 1e-10;
    vec3 hsv = vec3(abs(Q.z + (Q.w - Q.y)/(6.0 * D + E)), D / (Q.x + E), Q.x);

    float hue = hsv.x + Offset / 360.0;
    hsv.x = (hue < 0.0)
            ? hue + 1.0
            : (hue > 1.0)
                ? hue - 1.0
                : hue;

    vec4 K2 = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 P2 = abs(fract(hsv.xxx + K2.xyz) * 6.0 - K2.www);
    Out = hsv.z * mix(K2.xxx, saturate(P2 - K2.xxx), hsv.y);
}

void sat(vec3 In, float Saturation, out vec3 Out)
{
    float luma = dot(In, vec3(0.2126729, 0.7151522, 0.0721750));
    Out =  vec3(luma) + vec3(Saturation) * (In - vec3(luma));
}

float ease(float x) {
  // return 1.0 - sqrt(1.0 - pow(x, 2.0));
  return x;
}

void main() {
  vec4 colorTex = texture2D(uTexAlbedo,vUv);

  vec3 colorMain = colorTex.rgb;
  hue(colorTex.xyz, uHue, colorMain);
  sat(colorMain, uSat, colorMain);
  float alpha = colorTex.a * ease(vAlpha) * uOpacity;
  if(alpha < 0.1) {
    discard;
  } else {
    gl_FragColor = vec4(colorMain, alpha);
  }
}