in vec2 vUv;
out vec4 outColor;

uniform sampler2D uAtlas;
uniform vec2 uAtlasSize;
uniform float uGlyphCount;
uniform vec2 uViewport;
uniform float uTime;
uniform float uPointerStrength;
uniform vec4 uPointer;
uniform vec4 uTrail[TRAIL_LENGTH];
uniform vec4 uPulses[MAX_PULSES];
uniform int uPulseCount;
uniform float uPulseDuration;

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(cell), hash(cell + vec2(1.0, 0.0)), f.x),
    mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0)), f.x),
    f.y
  );
}

float glyphAt(vec2 p, vec2 cellSize, float corrupt) {
  vec2 grid = p * uViewport / cellSize;
  vec2 cell = floor(grid);
  vec2 tile = fract(grid);
  float seed = hash(cell);
  float scrambleSeed = hash(cell + floor(uTime * 31.0) * vec2(0.73, 0.51));
  float churn = hash(cell + floor(uTime * 2.0 + seed * 7.0) * 0.27);
  bool scramble = corrupt > 0.08 + seed * 0.46;
  float glyph = floor((scramble ? scrambleSeed : (seed > 0.86 ? churn : seed)) * uGlyphCount);

  // Align short hexadecimal runs between the larger symbol groups.
  float group = hash(vec2(floor(cell.x / 7.0), cell.y));
  if (!scramble && group > 0.71 && mod(cell.x, 7.0) < 5.0) {
    glyph = floor(seed * 16.0);
  }
  if (seed < 0.21 && !scramble) return 0.0;

  float row = floor(glyph / uAtlasSize.x);
  float column = mod(glyph, uAtlasSize.x);
  vec2 atlasUv = (vec2(column, uAtlasSize.y - row - 1.0) + tile) / uAtlasSize;
  return texture(uAtlas, atlasUv).a * mix(0.44, 1.0, seed);
}

void main() {
  float aspect = uViewport.x / max(1.0, uViewport.y);
  vec2 metric = vec2(aspect, 1.0);
  vec2 p = vUv * metric;
  vec2 displacement = vec2(0.0);
  float corruption = 0.0;
  float separation = 0.0;
  float localLight = 0.0;

  if (uPointerStrength > 0.005) {
    vec2 relative = p - uPointer.xy * metric;
    float falloff = exp(-dot(relative, relative) * 25.0) * uPointerStrength;
    vec2 velocity = uPointer.zw * metric;
    float speed = min(length(velocity), 2.0);
    displacement += (relative * 0.20 - velocity * 0.022) * falloff;
    separation += falloff * (0.0005 + speed * 0.002);
    localLight += falloff * (0.16 + speed * 0.17);

    for (int i = 0; i < TRAIL_LENGTH; i++) {
      vec4 trailPoint = uTrail[i];
      if (trailPoint.w < 0.008) continue;
      vec2 offset = p - trailPoint.xy * metric;
      float trailFalloff = exp(-dot(offset, offset) * (54.0 + float(i) * 8.0));
      float wake = trailFalloff * trailPoint.w * uPointerStrength / (1.0 + float(i) * 0.31);
      vec2 direction = vec2(cos(trailPoint.z), sin(trailPoint.z));
      displacement += (offset * 0.16 - direction * 0.028) * wake;
      separation += wake * 0.0016;
      localLight += wake * 0.11;
    }
  }

  for (int i = 0; i < uPulseCount; i++) {
    vec4 pulse = uPulses[i];
    float age = (uTime - pulse.z) / uPulseDuration;
    if (pulse.w <= 0.0 || age < 0.0 || age >= 1.0) continue;

    vec2 offset = p - pulse.xy * metric;
    float distanceToClick = length(offset);
    float radius = (1.0 - pow(1.0 - age, 1.55)) * 1.06;
    float front = distanceToClick - radius;
    float life = pow(1.0 - age, 1.25) * pulse.w;
    float band = exp(-abs(front) * 39.0);
    float wake = exp(-abs(front + 0.035) * 24.0) * smoothstep(-0.20, -0.005, front);
    float impact = exp(-distanceToClick * 20.0) * pow(1.0 - age, 8.0);
    float activity = (band * 0.76 + wake * 0.32 + impact * 0.78) * life;
    vec2 direction = offset / max(distanceToClick, 0.0001);
    float scanline = hash(vec2(floor((vUv.y + pulse.y * 0.008) * uViewport.y / 2.4), floor(uTime * 38.0) + float(i) * 7.0));

    displacement += direction * (sin(front * 106.0) * band * 0.033 + impact * 0.031) * life;
    displacement.x += (scanline - 0.5) * activity * 0.111;
    displacement.y += (hash(vec2(scanline * 17.0, float(i))) - 0.5) * activity * 0.008;
    corruption += activity;
    separation += activity * 0.016;
    localLight += activity * 1.40;
  }

  vec2 warped = (p + clamp(displacement, vec2(-0.14), vec2(0.14))) / metric;
  float texel = clamp(uViewport.y / 850.0, 0.83, 1.35);
  vec2 cellSize = vec2(10.0, 14.0) * texel;
  float glyph = glyphAt(warped, cellSize, corruption);
  vec3 channels = vec3(glyph);

  if (separation > 0.0012) {
    vec2 split = vec2(min(separation, 0.025), separation * 0.29) / metric;
    channels.r = glyphAt(warped + split, cellSize, corruption);
    channels.b = glyphAt(warped - split, cellSize, corruption);
  }

  float center = 0.49 + 0.12 * sin(warped.x * 8.0 - uTime * 0.28);
  float fold = abs(warped.y - center);
  float veil = noise(warped * vec2(9.0, 18.0) + vec2(uTime * 0.16, 0.0));
  float filaments = noise(warped * vec2(9.0, 52.0) + vec2(veil * 0.68, uTime * 0.042));
  float body = exp(-fold * 7.2) * (0.26 + veil * 0.74);
  float focus = smoothstep(0.06, 0.39, vUv.x) * (1.0 - smoothstep(0.70, 1.16, vUv.x));
  float edge = smoothstep(0.015, 0.15, vUv.y) * (1.0 - smoothstep(0.79, 1.02, vUv.y));
  float light = (0.055 + body * (0.32 + filaments * 1.36) * focus) * edge;
  float grain = hash(gl_FragCoord.xy + vec2(floor(uTime * 21.0) * 0.73, 0.0)) - 0.5;

  vec3 base = vec3(8.0, 9.0, 13.0) / 255.0;
  vec3 tint = mix(vec3(0.60, 0.65, 0.84), vec3(0.73, 0.88, 0.98), veil);
  vec3 color = base + tint * body * focus * 0.050 + tint * channels * light;
  color += channels * min(localLight, 1.7) * vec3(0.65, 0.76, 0.97);
  color += tint * glyph * min(localLight, 0.85) * 0.21;
  color += grain * (0.016 + min(corruption, 1.0) * 0.055);
  outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
