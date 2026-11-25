import {
  CanvasTexture, Camera, GLSL3, Mesh, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer,
} from 'three';
import { ATLAS_COLUMNS, ATLAS_ROWS, createGlyphAtlas, GLYPH_COUNT } from './AsciiField';
import { MAX_PULSES, PULSE_DURATION } from './ClickShockwave';
import { TRAIL_LENGTH } from './PointerMotion';
import vertexShader from './screen.vert.glsl?raw';
import fragmentShader from './screen.frag.glsl?raw';

export class DistortionShader {
  private readonly renderer: WebGLRenderer;
  private readonly camera = new Camera();
  private readonly scene = new Scene();
  private readonly atlas: CanvasTexture;
  private readonly geometry = new PlaneGeometry(2, 2);
  private readonly material: ShaderMaterial;
  private shaderError: string | undefined;

  constructor(canvas: HTMLCanvasElement, pulses: Float32Array) {
    this.atlas = new CanvasTexture(createGlyphAtlas());
    try {
      this.renderer = new WebGLRenderer({
        canvas, alpha: false, antialias: false, depth: false, stencil: false,
        powerPreference: 'high-performance',
      });
    } catch (error) {
      this.atlas.dispose();
      this.geometry.dispose();
      throw error;
    }

    this.renderer.debug.onShaderError = (gl, program, vertex, fragment) => {
      const logs = [gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment)];
      this.shaderError = logs.filter(Boolean).join('\n') || 'Could not link the distortion shader';
    };

    this.material = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader,
      fragmentShader,
      defines: { MAX_PULSES, TRAIL_LENGTH },
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uAtlas: { value: this.atlas },
        uAtlasSize: { value: new Vector2(ATLAS_COLUMNS, ATLAS_ROWS) },
        uGlyphCount: { value: GLYPH_COUNT },
        uViewport: { value: new Vector2(1, 1) },
        uTime: { value: 0 },
        uPointerStrength: { value: 0 },
        uPointer: { value: new Float32Array(4) },
        uTrail: { value: new Float32Array(TRAIL_LENGTH * 4) },
        uPulses: { value: pulses },
        uPulseCount: { value: 0 },
        uPulseDuration: { value: PULSE_DURATION },
      },
    });

    const screen = new Mesh(this.geometry, this.material);
    screen.frustumCulled = false;
    this.scene.add(screen);
  }

  resize(width: number, height: number, pixelRatio: number) {
    this.renderer.setDrawingBufferSize(width, height, pixelRatio);
    this.material.uniforms.uViewport.value.set(width, height);
  }

  render(time: number, pointerStrength: number, pointer: Float32Array, trail: Float32Array, pulseCount: number) {
    const uniforms = this.material.uniforms;
    uniforms.uTime.value = time;
    uniforms.uPointerStrength.value = pointerStrength;
    uniforms.uPointer.value = pointer;
    uniforms.uTrail.value = trail;
    uniforms.uPulseCount.value = pulseCount;
    this.renderer.render(this.scene, this.camera);
    if (this.shaderError) throw new Error(this.shaderError);
  }

  dispose() {
    this.material.dispose();
    this.geometry.dispose();
    this.atlas.dispose();
    this.renderer.dispose();
  }
}
