import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { drawAsciiFallback } from './AsciiField';
import { ClickShockwave } from './ClickShockwave';
import type { DistortionShader } from './DistortionShader';
import { normalizePointer, PointerMotion } from './PointerMotion';

export type BackgroundMode = 'loading' | 'webgl' | 'reduced' | 'fallback';

interface InteractiveBackgroundProps {
  paused: boolean;
  onMode: (mode: BackgroundMode) => void;
  pulseRef: RefObject<(() => void) | null>;
}

export default function InteractiveBackground({ paused, onMode, pulseRef }: InteractiveBackgroundProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const webglRef = useRef<HTMLCanvasElement>(null);
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const pauseRef = useRef(paused);
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pauseRef.current = paused;
    syncRef.current?.();
  }, [paused]);

  useEffect(() => {
    const host = hostRef.current;
    const webgl = webglRef.current;
    const fallback = fallbackRef.current;
    if (!host || !webgl || !fallback) return;

    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = new PointerMotion();
    const shockwaves = new ClickShockwave();
    let shader: DistortionShader | null = null;
    let active = true;
    let contextLost = false;
    let frame = 0;
    let restoration = 0;
    let previous = 0;
    let time = 0;
    let width = 1;
    let height = 1;

    const canAnimate = () => shader && !contextLost && !preference.matches && !pauseRef.current && !document.hidden;

    function showMode(mode: BackgroundMode) {
      if (!host) return;
      host.dataset.mode = mode;
      onMode(mode);
    }

    function stopFrame() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    }

    function paint() {
      try {
        const strength = preference.matches ? 0 : pointer.strength;
        shader?.render(time, strength, pointer.shaderPointer, pointer.shaderTrail, shockwaves.sample(time));
      } catch (error) {
        console.warn('IncidentZero shader failed. Showing the static ASCII field.', error);
        stopFrame();
        shader?.dispose();
        shader = null;
        showMode('fallback');
      }
    }

    function tick(timestamp: number) {
      frame = 0;
      if (!canAnimate()) return;
      const delta = previous ? (timestamp - previous) / 1000 : 0;
      previous = timestamp;
      time += delta;
      pointer.step(Math.min(0.05, delta), width / height);
      paint();
      if (canAnimate()) frame = requestAnimationFrame(tick);
    }

    function syncMotion() {
      stopFrame();
      if (!shader || contextLost) return;
      if (preference.matches) {
        shockwaves.clear();
        pointer.leave();
      }
      showMode(preference.matches ? 'reduced' : 'webgl');
      paint();
      if (canAnimate()) frame = requestAnimationFrame(tick);
    }

    function resize() {
      if (!host || !fallback) return;
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      const deviceRatio = window.devicePixelRatio || 1;
      const ratio = Math.min(deviceRatio, 1.5, Math.sqrt(2_900_000 / (width * height)));
      drawAsciiFallback(fallback, width, height, Math.min(deviceRatio, 1));
      if (shader && !contextLost) {
        shader.resize(width, height, ratio);
        paint();
      }
    }

    function emit(x: number, y: number) {
      if (canAnimate()) shockwaves.emit(x, y, time);
    }

    function move(event: PointerEvent) {
      if (!host || !canAnimate() || event.pointerType === 'touch') return;
      const point = normalizePointer(event.clientX, event.clientY, host.getBoundingClientRect());
      pointer.move(point.x, point.y, event.timeStamp);
    }

    function press(event: PointerEvent) {
      if (!host || event.button !== 0 || !canAnimate()) return;
      const point = normalizePointer(event.clientX, event.clientY, host.getBoundingClientRect());
      emit(point.x, point.y);
    }

    function leave() {
      pointer.leave();
    }

    function pointerOut(event: PointerEvent) {
      if (event.relatedTarget === null) leave();
    }

    function loseContext(event: Event) {
      event.preventDefault();
      contextLost = true;
      stopFrame();
      showMode('fallback');
    }

    function restoreContext() {
      cancelAnimationFrame(restoration);
      restoration = requestAnimationFrame(() => {
        if (!active || !shader) return;
        contextLost = false;
        shockwaves.clear();
        resize();
        syncMotion();
      });
    }

    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', press, { passive: true });
    window.addEventListener('pointerout', pointerOut, { passive: true });
    window.addEventListener('blur', leave);
    document.addEventListener('visibilitychange', syncMotion);
    preference.addEventListener('change', syncMotion);
    webgl.addEventListener('webglcontextlost', loseContext);
    webgl.addEventListener('webglcontextrestored', restoreContext);
    pulseRef.current = () => emit(0.5, 0.5);
    syncRef.current = syncMotion;
    resize();

    import('./DistortionShader').then(({ DistortionShader }) => {
      if (!active) return;
      shader = new DistortionShader(webgl, shockwaves.uniforms);
      resize();
      syncMotion();
    }).catch((error: unknown) => {
      if (!active) return;
      stopFrame();
      shader?.dispose();
      shader = null;
      console.warn('WebGL is unavailable. Showing the static ASCII field.', error);
      showMode('fallback');
    });

    return () => {
      active = false;
      stopFrame();
      cancelAnimationFrame(restoration);
      observer.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerout', pointerOut);
      window.removeEventListener('blur', leave);
      document.removeEventListener('visibilitychange', syncMotion);
      preference.removeEventListener('change', syncMotion);
      webgl.removeEventListener('webglcontextlost', loseContext);
      webgl.removeEventListener('webglcontextrestored', restoreContext);
      pulseRef.current = null;
      syncRef.current = null;
      shader?.dispose();
    };
  }, [onMode, pulseRef]);

  return (
    <div className="interactive-background" ref={hostRef} aria-hidden="true">
      <canvas className="interactive-background__fallback" ref={fallbackRef} />
      <canvas className="interactive-background__webgl" ref={webglRef} />
    </div>
  );
}
