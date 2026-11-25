import { useEffect, useRef } from 'react';

const trace = 'billing/service.py:42 ZeroDivisionError calculate_rate() capture → reproduce → validate → review  ';
const cool = ['#41646a', '#527c82', '#6d999b', '#8db7b5', '#b1d5ce', '#d9eee0'];
const warm = ['#765342', '#91634c', '#ac785a', '#c8946f', '#e4bc90', '#f7dfb5'];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

export default function SignalArtwork({ paused }: { paused: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const experience = canvas?.closest<HTMLElement>('.experience');
    const context = canvas?.getContext('2d');
    if (!canvas || !experience || !context) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sections = Array.from(experience.querySelectorAll<HTMLElement>('[data-motion-scene]'));
    const sceneProgress = sections.map(() => -1);
    const pointer = { x: 0, y: 0, strength: 0, target: 0 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let scrollFrame = 0;
    let previous = 0;
    let visible = false;
    let scene = 0;

    function draw(seconds: number) {
      if (!context || !width || !height) return;
      const compact = width < 720;
      const origin = width * 0.025;
      const step = Math.max(8, width / 153);
      const columns = Math.ceil((width - origin) / step);
      const rows = compact ? 30 : 38;
      const amplitude = height * (compact ? 0.075 : 0.115);
      const feed = Math.min(1, scene);
      const architecture = Math.max(0, scene - 1);

      context.clearRect(0, 0, width, height);
      context.font = Math.round(step * 1.13) + 'px Consolas, monospace';
      context.textBaseline = 'middle';

      for (let column = 0; column < columns; column++) {
        const progress = column / (columns - 1);
        const lane = Math.min(3, Math.floor(progress * 4));
        const laneEdge = Math.sin(Math.PI * (progress * 4 - lane));
        const streamX = (lane + 0.12 + (progress * 4 - lane) * 0.76) / 4;
        const x = origin + mix(progress, streamX, architecture) * (columns - 1) * step;
        const wave = progress * 7 - seconds * 0.66;
        const waveCenter = height * (0.54 - progress * 0.07) + Math.sin(wave) * amplitude;
        const center = mix(mix(waveCenter, height * 0.51, feed), height * (0.51 + lane * 0.022), architecture);
        const spread = height * mix(0.57 + 0.21 * Math.sin(progress * 2.5), 0.74, feed);
        const travelingLight = 0.84 + Math.sin(progress * 10 - seconds * 1.2) * 0.16;
        const edge = Math.sin(Math.PI * progress) ** 0.32;
        const lanes = mix(1, 0.26 + laneEdge * 0.74, architecture);

        for (let row = 0; row < rows; row++) {
          const depth = row / (rows - 1) - 0.5;
          const fold = Math.sin(wave * 1.4 + depth * 7);
          const baseY = center + depth * spread + fold * amplitude * mix(0.68, 0.12, feed);
          const influence = pointer.strength > 0.01
            ? Math.max(0, 1 - Math.hypot(x - pointer.x, baseY - pointer.y) / 150) * pointer.strength
            : 0;
          const ink = edge * lanes * (1 - Math.abs(depth) * 1.45);
          const brightness = ink * travelingLight * (0.81 + fold * 0.18) + influence * 0.28;
          if (brightness < 0.1) continue;

          const palette = progress + depth * 0.3 < mix(mix(0.47, 0.27, feed), 0.73, architecture) ? warm : cool;
          const shade = Math.min(palette.length - 1, Math.floor(brightness * palette.length));
          const glyph = trace[(column + row * 17) % trace.length];
          const y = baseY + (baseY - pointer.y) * influence * 0.32;
          context.fillStyle = palette[shade];
          context.fillText(glyph, x, y);
        }
      }
    }

    function readScroll() {
      if (!experience || !height) return;
      const still = paused || motion.matches;
      let nextScene = 0;

      sections.forEach((section, index) => {
        const top = section.getBoundingClientRect().top;
        const entry = clamp((height * 0.98 - top) / (height * 0.72));
        const progress = still ? Number(entry >= 0.5) : entry * entry * (3 - 2 * entry);
        nextScene += progress;
        if (sceneProgress[index] === progress) return;
        sceneProgress[index] = progress;
        const value = progress.toFixed(3);
        experience.style.setProperty(`--scene-${section.id}`, value);
        section.style.setProperty('--arrival', still ? '1' : value);
      });

      const changed = nextScene !== scene;
      scene = nextScene;
      if (changed && (still || !visible)) draw(time.current);
    }

    function queueScroll() {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        readScroll();
      });
    }

    function tick(timestamp: number) {
      const delta = previous ? timestamp - previous : 0;
      if (!previous || delta >= 30) {
        previous = timestamp;
        time.current += Math.min(delta, 50) / 1000;
        pointer.strength += (pointer.target - pointer.strength) * 0.16;
        draw(time.current);
      }
      frame = requestAnimationFrame(tick);
    }

    function updateMotion() {
      cancelAnimationFrame(frame);
      previous = 0;
      sceneProgress.fill(-1);
      readScroll();
      if (visible && !paused && !motion.matches) {
        frame = requestAnimationFrame(tick);
      } else {
        pointer.strength = 0;
        draw(time.current);
      }
    }

    function resize() {
      if (!canvas || !context) return;
      const { clientWidth, clientHeight } = canvas;
      width = clientWidth;
      height = clientHeight;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      readScroll();
      draw(time.current);
    }

    function move(event: PointerEvent) {
      if (!canvas || event.pointerType === 'touch') return;
      const bounds = canvas.getBoundingClientRect();
      pointer.x = event.clientX - bounds.left;
      pointer.y = event.clientY - bounds.top;
      pointer.target = 1;
    }

    function leave() {
      pointer.target = 0;
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const contentResize = new ResizeObserver(queueScroll);
    contentResize.observe(experience);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateMotion();
    });
    intersection.observe(canvas);
    motion.addEventListener('change', updateMotion);
    window.addEventListener('scroll', queueScroll, { passive: true });
    experience.addEventListener('pointermove', move, { passive: true });
    experience.addEventListener('pointerleave', leave);
    resize();

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      resizeObserver.disconnect();
      contentResize.disconnect();
      intersection.disconnect();
      motion.removeEventListener('change', updateMotion);
      window.removeEventListener('scroll', queueScroll);
      experience.removeEventListener('pointermove', move);
      experience.removeEventListener('pointerleave', leave);
      sections.forEach(section => {
        experience.style.removeProperty(`--scene-${section.id}`);
        section.style.removeProperty('--arrival');
      });
    };
  }, [paused]);

  return <canvas className="hero-scene" ref={canvasRef} aria-hidden="true" />;
}
