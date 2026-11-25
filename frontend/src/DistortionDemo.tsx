import { useEffect, useRef, useState } from 'react';
import { Activity, Crosshair, Pause, Play } from 'lucide-react';
import { gsap } from 'gsap';
import InteractiveBackground from './interactive/InteractiveBackground';
import type { BackgroundMode } from './interactive/InteractiveBackground';
import './demo.css';

export default function DistortionDemo() {
  const [mode, setMode] = useState<BackgroundMode>('loading');
  const [paused, setPaused] = useState(false);
  const intro = useRef<HTMLDivElement>(null);
  const pulse = useRef<(() => void) | null>(null);
  const interactive = mode === 'webgl';

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(intro.current, { y: 10, opacity: 0.68 }, {
        y: 0, opacity: 1, duration: 0.75, ease: 'power3.out', clearProps: 'transform,opacity',
      });
    });
    return () => media.revert();
  }, []);

  const status = {
    loading: 'Starting WebGL',
    webgl: paused ? 'Motion paused' : 'WebGL live',
    reduced: 'Reduced motion',
    fallback: 'Static field',
  }[mode];

  return (
    <main className="distortion-demo">
      <InteractiveBackground paused={paused} onMode={setMode} pulseRef={pulse} />
      <header className="demo-bar">
        <span className="demo-brand"><Activity size={17} aria-hidden="true" /> IncidentZero</span>
        <span className="demo-status" role="status" data-mode={mode} data-paused={paused}>
          <span aria-hidden="true" /> {status}
        </span>
      </header>

      <div className="demo-caption" ref={intro}>
        <h1>Signal field<span>.</span></h1>
        <p>{mode === 'fallback'
          ? 'WebGL 2 is unavailable. The ASCII field is shown as a still.'
          : mode === 'reduced'
            ? 'Your reduced-motion setting keeps the field still.'
            : 'Move to bend the field. Click or tap anywhere to send a shockwave.'}</p>
      </div>

      <footer className="demo-controls" aria-label="Animation controls">
        <button
          className="demo-button"
          disabled={!interactive || paused}
          onClick={event => { if (event.detail === 0) pulse.current?.(); }}
        >
          <Crosshair size={15} aria-hidden="true" /> Emit pulse
        </button>
        <button className="demo-button" disabled={!interactive} onClick={() => setPaused(current => !current)}>
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      </footer>
    </main>
  );
}
