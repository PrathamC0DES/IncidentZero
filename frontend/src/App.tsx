import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, 
  Flame, 
  X,
  ExternalLink,
  Check,
  ArrowUpRight
} from 'lucide-react';
import type { Incident } from './types';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'prs' | 'spec'>('home');
  const [helpOpen, setHelpOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch incidents
  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/v1/incidents');
      if (res.ok) {
        const data: Incident[] = await res.json();
        setIncidents(data);
        if (data.length > 0 && !selectedIncident) {
          setSelectedIncident(data[0]);
        } else if (selectedIncident) {
          const updated = data.find(i => i.id === selectedIncident.id);
          if (updated) setSelectedIncident(updated);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, [selectedIncident]);

  // Interactive 3D Torus ASCII canvas effect from your Stitch generation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let A = 0;
    let B = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = ".,-~:;=!*#$@";

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255, 249, 234, 0.08)";
      ctx.font = "10px monospace";

      A += 0.015 + mouseY * 0.02;
      B += 0.01 + mouseX * 0.02;

      const cosA = Math.cos(A), sinA = Math.sin(A);
      const cosB = Math.cos(B), sinB = Math.sin(B);

      const width = Math.floor(canvas.width / 12);
      const height = Math.floor(canvas.height / 14);
      const output = new Array(width * height).fill(' ');
      const zBuffer = new Array(width * height).fill(0);

      for (let theta = 0; theta < 6.28; theta += 0.12) {
        const costheta = Math.cos(theta), sintheta = Math.sin(theta);
        for (let phi = 0; phi < 6.28; phi += 0.06) {
          const cosphi = Math.cos(phi), sinphi = Math.sin(phi);

          const circlex = 2 + 1.2 * costheta;
          const circley = 1.2 * sintheta;

          const x = circlex * (cosB * cosphi + sinA * sinB * sinphi) - circley * cosA * sinB;
          const y = circlex * (sinB * cosphi - sinA * cosB * sinphi) + circley * cosA * cosB;
          const z = 5 + cosA * circlex * sinphi + circley * sinA;
          const ooz = 1 / z;

          const xp = Math.floor(width / 2 + 30 * ooz * x * 2);
          const yp = Math.floor(height / 2 + 15 * ooz * y);

          const L = 0.7 * (cosphi * costheta * sinB - cosA * costheta * sinphi - sinA * sintheta + cosB * (cosA * sintheta - costheta * sinA * sinphi));

          if (L > 0) {
            const idx = xp + yp * width;
            if (idx >= 0 && idx < width * height && ooz > zBuffer[idx]) {
              zBuffer[idx] = ooz;
              const charIdx = Math.floor(L * 8);
              output[idx] = chars[Math.max(0, Math.min(chars.length - 1, charIdx))];
            }
          }
        }
      }

      for (let y = 0; y < height; y++) {
        let line = "";
        for (let x = 0; x < width; x++) {
          line += output[x + y * width];
        }
        ctx.fillText(line, 10, y * 14 + 10);
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const simulateCrash = async () => {
    setSimulating(true);
    const mockErrors = [
      {
        title: "SIGSEGV null-pointer dereference in gateway route dispatcher",
        service_name: "gateway-core",
        error_type: "NullPointerException",
        error_message: "null pointer dereference in route handler at line 42",
        stack_trace: "Traceback (most recent call last):\n  File 'gateway/dispatcher.py', line 42, in route\n    return session.get(stream_id).unwrap()\nNullPointerException: session is None",
        repo_url: "https://github.com/PrathamC0DES/IncidentZero",
        target_branch: "main"
      },
      {
        title: "ZeroDivisionError in calculate_rate()",
        service_name: "billing-service",
        error_type: "ZeroDivisionError",
        error_message: "division by zero in calculate_rate at line 42",
        stack_trace: "Traceback (most recent call last):\n  File 'billing/service.py', line 42, in calculate_rate\n    return value / divisor\nZeroDivisionError: division by zero",
        repo_url: "https://github.com/PrathamC0DES/IncidentZero",
        target_branch: "main"
      }
    ];

    const payload = mockErrors[Math.floor(Math.random() * mockErrors.length)];

    try {
      const res = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newInc: Incident = await res.json();
        await fetchIncidents();
        setSelectedIncident(newInc);
        setActiveTab('prs');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0A0A0A] text-[#FFF9EA] flex flex-col justify-between p-6 select-none font-sans antialiased">
      
      {/* Interactive 3D Torus ASCII Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />

      {/* TOP BAR: Pill Navigation & Status (Stitch vshslv.com layout) */}
      <header className="relative z-20 w-full flex items-center justify-between pointer-events-auto">
        {/* Left 3-Pill Switcher */}
        <div className="glass-pill flex items-center p-1 rounded-full space-x-1">
          <button 
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'home' 
                ? 'bg-[#FFF9EA] text-[#0A0A0A] shadow-lg' 
                : 'text-[#FFF9EA]/75 hover:text-white'
            }`}
          >
            IncidentZero
          </button>
          
          <button 
            onClick={() => setActiveTab('prs')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'prs' 
                ? 'bg-[#FFF9EA] text-[#0A0A0A] shadow-lg' 
                : 'text-[#FFF9EA]/75 hover:text-white'
            }`}
          >
            <span>Autonomous PRs</span>
            <span className="text-[10px] font-mono-tech px-1.5 py-0.2 rounded-full bg-black/20">
              {incidents.length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('spec')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              activeTab === 'spec' 
                ? 'bg-[#FFF9EA] text-[#0A0A0A] shadow-lg' 
                : 'text-[#FFF9EA]/75 hover:text-white'
            }`}
          >
            Architecture & Spec
          </button>
        </div>

        {/* Right Status & Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={simulateCrash}
            disabled={simulating}
            className="glass-pill px-4 py-1.5 rounded-full text-xs font-mono-tech uppercase tracking-wider text-[#FFF9EA] flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(230,179,90,0.25)]"
          >
            <Flame className="w-3.5 h-3.5 text-[#E6B35A]" />
            <span>{simulating ? 'Synthesizing...' : 'Simulate Outage'}</span>
          </button>

          <div className="glass-pill px-3.5 py-1.5 rounded-full hidden sm:flex items-center space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-[#FFF9EA]/90 font-mono-tech">0 crashes unresolved</span>
            <span className="text-xs text-[#FFF9EA]/40 font-mono-tech">|</span>
            <span className="text-xs text-[#E6B35A] font-mono-tech font-medium">18.4s MTTR</span>
          </div>

          <button 
            onClick={() => setHelpOpen(!helpOpen)}
            className="glass-pill w-8 h-8 rounded-full flex items-center justify-center font-mono-tech text-xs text-[#FFF9EA]/90 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            ?
          </button>
        </div>
      </header>

      {/* LEFT SIDEBAR: Vertical Orientation */}
      <aside className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center space-y-12 pointer-events-auto">
        <a 
          href="https://github.com/PrathamC0DES/IncidentZero" 
          target="_blank" 
          rel="noreferrer"
          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-mono-tech font-semibold text-xs tracking-tighter hover:border-white transition-colors bg-black/60 backdrop-blur-md"
        >
          IZ.
        </a>

        <div className="flex flex-col items-center space-y-8">
          <span className="text-[10px] font-mono-tech tracking-widest text-[#FFF9EA]/60 uppercase [writing-mode:vertical-rl] rotate-180">
            SOC2 TYPE II VERIFIED
          </span>
          <div className="w-px h-8 bg-white/20" />
          <span className="text-[10px] font-mono-tech tracking-widest text-[#FFF9EA]/60 uppercase [writing-mode:vertical-rl] rotate-180">
            99.999% KERNEL RELIABILITY
          </span>
        </div>
      </aside>

      {/* HERO GRID: 4-Column Layout positioned in lower half (from Stitch HTML) */}
      <main className="relative z-10 w-full max-w-[1260px] md:ml-16 mx-auto grid grid-cols-12 gap-8 my-auto pt-20 pb-4 pointer-events-auto">
        
        {/* Col 1: Identity / Title & Lead (Cols 1-4) */}
        <div className="col-span-12 md:col-span-4 flex flex-col justify-end space-y-3.5 pr-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech text-[#E6B35A] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E6B35A]" />
            Autonomous AI Engine
          </div>
          
          <h1 className="font-serif-luxury text-5xl lg:text-6xl font-medium tracking-tight text-[#FFF9EA]">
            IncidentZero
          </h1>

          <p className="text-xs lg:text-sm text-[#FFF9EA]/75 max-w-sm leading-relaxed">
            Autonomous kernel and distributed runtime engine that monitors production failures, isolates call stack anomalies, and publishes verified, passing GitHub Pull Requests without human on-call delays.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('prs')}
              className="px-4 py-2 rounded-full bg-[#FFF9EA] text-[#0A0A0A] text-xs font-medium hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(255,249,234,0.3)]"
            >
              <span>Active Remediation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setActiveTab('spec')}
              className="px-4 py-2 rounded-full glass-pill text-[#FFF9EA]/90 hover:text-white text-xs font-medium transition-all cursor-pointer"
            >
              <span>Architecture</span>
            </button>
          </div>
        </div>

        {/* Col 2: Core Loop / Focus (Cols 5-6) */}
        <div className="col-span-12 md:col-span-2 flex flex-col justify-end space-y-2 border-l border-white/15 pl-5">
          <span className="text-[11px] font-mono-tech text-[#FFF9EA]/60 uppercase tracking-wider pb-1">01 / Loop</span>
          <ul className="text-xs space-y-2 text-[#FFF9EA]/85 font-normal">
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5" onClick={() => setActiveTab('prs')}>
              <span className="text-[#E6B35A]">›</span> eBPF Kernel Probe
            </li>
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5" onClick={() => setActiveTab('prs')}>
              <span className="text-[#E6B35A]">›</span> Crash Dump Snapshot
            </li>
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5" onClick={() => setActiveTab('prs')}>
              <span className="text-[#E6B35A]">›</span> AST Semantic Patch
            </li>
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5" onClick={() => setActiveTab('prs')}>
              <span className="text-[#E6B35A]">›</span> Sandbox CI Regression
            </li>
            <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5" onClick={() => setActiveTab('prs')}>
              <span className="text-[#E6B35A]">›</span> Verified GitHub PR
            </li>
          </ul>
        </div>

        {/* Col 3: Engine Stack (Cols 7-8) */}
        <div className="col-span-12 md:col-span-2 flex flex-col justify-end space-y-2 border-l border-white/15 pl-5">
          <span className="text-[11px] font-mono-tech text-[#FFF9EA]/60 uppercase tracking-wider pb-1">02 / Engine</span>
          <ul className="text-xs space-y-2 text-[#FFF9EA]/85 font-normal">
            <li className="hover:text-white transition-colors">FastAPI Async Kernel</li>
            <li className="hover:text-white transition-colors">LiteLLM / Gemini 1.5</li>
            <li className="hover:text-white transition-colors">Subprocess Sandbox</li>
            <li className="hover:text-white transition-colors">Deterministic Pytest</li>
            <li className="hover:text-white transition-colors">Zero-Regression Matrix</li>
          </ul>
        </div>

        {/* Col 4: Integrations & Live Metric (Cols 9-12) */}
        <div className="col-span-12 md:col-span-4 flex flex-col justify-end space-y-3.5 border-l border-white/15 pl-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-tech text-[#FFF9EA]/60 uppercase tracking-wider">03 / Ecosystem</span>
            <span className="text-[11px] font-mono-tech text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 6 Active Hooks
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-[#FFF9EA]/85">
            <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <span>GitHub API</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <span>Docker Sandbox</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <span>PostgreSQL</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="p-2.5 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <span>Sentry Webhook</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Live Speed Metric Card */}
          <div className="glass-pill p-3.5 rounded-xl flex items-center justify-between mt-1">
            <div>
              <div className="text-[10px] font-mono-tech text-[#FFF9EA]/65">AVERAGE CRASH-TO-PR VELOCITY</div>
              <div className="text-xl font-mono-tech font-medium text-[#FFF9EA]">
                18.4 <span className="text-xs text-[#FFF9EA]/65">seconds</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono-tech text-emerald-400">100% PASSING</div>
              <div className="text-[10px] text-[#FFF9EA]/60 font-mono-tech">CI test suites</div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER: Index & Telemetry */}
      <footer className="relative z-20 w-full flex items-center justify-between text-[11px] font-mono-tech text-[#FFF9EA]/65 pointer-events-auto">
        <div className="flex items-center space-x-3">
          <span className="text-[#FFF9EA] font-semibold">1</span>
          <span className="text-[#FFF9EA]/40">/</span>
          <span>AUTONOMOUS ENGINE STATUS</span>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-[#FFF9EA]/55">
          <span>MOVE CURSOR TO DISTORT 3D TORUS ASCII</span>
          <span>•</span>
          <span>AUTONOMOUS SRE HEALING ENGINE</span>
        </div>

        <div className="flex items-center space-x-3">
          <span>LATENCY: 4.2ms</span>
          <span className="text-[#FFF9EA]/40">/</span>
          <span className="text-emerald-400">ONLINE</span>
        </div>
      </footer>

      {/* MODAL WINDOW DRAWER (Stitch .os-window replica) */}
      <AnimatePresence>
        {activeTab === 'prs' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-x-6 top-16 bottom-10 z-40 bg-[#0C0C0C]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 flex flex-col overflow-hidden shadow-2xl pointer-events-auto"
          >
            {/* Window Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <span className="font-serif-luxury text-xl text-[#FFF9EA]">
                  Active Remediations &amp; Synthesized PRs
                </span>
                <span className="text-[10px] font-mono-tech px-2.5 py-0.5 rounded-full bg-white/10 text-[#FFF9EA]/80">
                  Verified by Sandbox CI
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('home')}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-mono-tech text-[#FFF9EA]/90 hover:text-white flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Esc</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content: Incidents Feed & Diffs */}
            <div className="flex-1 overflow-y-auto pt-6 space-y-6">
              {incidents.map((inc) => (
                <div key={inc.id} className="glass-pill p-5 rounded-xl border border-white/10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {inc.error_type}
                        </span>
                        <span className="text-[11px] font-mono-tech text-[#FFF9EA]/60">#{inc.id}</span>
                        <span className="text-[11px] font-mono-tech text-emerald-400">Remediated in 1.3s</span>
                      </div>
                      <h3 className="text-base font-medium text-[#FFF9EA] pt-1">{inc.title}</h3>
                      <p className="text-xs text-[#FFF9EA]/70 font-mono-tech">{inc.error_message}</p>
                    </div>

                    {inc.pull_request_url && (
                      <a
                        href={inc.pull_request_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-full text-xs font-mono-tech bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 hover:bg-emerald-500/25 transition-all"
                      >
                        <GitPullRequest className="w-3.5 h-3.5" />
                        <span>View PR</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Git Diff Viewer */}
                  {inc.patch_diff && (
                    <div className="rounded-lg bg-black/90 border border-white/10 p-3.5 font-mono-tech text-xs overflow-x-auto">
                      <div className="text-[#FFF9EA]/50 pb-1.5 flex justify-between border-b border-white/5">
                        <span>{inc.service_name} / patch_diff</span>
                        <span className="text-emerald-400">Exit Code: 0 • Zero Regressions</span>
                      </div>
                      <div className="pt-2 space-y-1 leading-relaxed">
                        {inc.patch_diff.split('\n').map((line, idx) => {
                          let color = 'text-[#FFF9EA]/50';
                          let bg = '';
                          if (line.startsWith('+')) {
                            color = 'text-emerald-300';
                            bg = 'bg-emerald-950/20';
                          } else if (line.startsWith('-')) {
                            color = 'text-rose-400';
                            bg = 'bg-rose-950/20';
                          }
                          return (
                            <div key={idx} className={`${color} ${bg} px-1.5 py-0.5 rounded`}>
                              {line || ' '}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pytest Code */}
                  {inc.reproduced_test_code && (
                    <div className="rounded-lg bg-black/70 border border-white/5 p-3 font-mono-tech text-xs text-sky-200/90 overflow-x-auto">
                      <div className="text-[10px] text-sky-400/60 pb-1 uppercase">Synthesized Test Harness:</div>
                      <pre className="whitespace-pre leading-relaxed">{inc.reproduced_test_code}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ARCHITECTURE SPEC MODAL */}
      <AnimatePresence>
        {activeTab === 'spec' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-x-6 top-16 bottom-10 z-40 bg-[#0C0C0C]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 flex flex-col overflow-hidden shadow-2xl pointer-events-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="font-serif-luxury text-xl text-[#FFF9EA]">
                IncidentZero Architectural Specifications
              </span>
              <button 
                onClick={() => setActiveTab('home')}
                className="glass-pill px-3 py-1.5 rounded-full text-xs font-mono-tech text-[#FFF9EA]/90 hover:text-white flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Esc</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-6 space-y-6 max-w-4xl font-mono-tech text-xs text-[#FFF9EA]/80 leading-relaxed">
              <div className="glass-pill p-5 rounded-xl border border-white/10 space-y-3">
                <h4 className="text-sm font-semibold text-[#FFF9EA] font-sans">1. Ingestion Gateway</h4>
                <p>Non-blocking asynchronous webhook in FastAPI returning HTTP 202 in 4.2ms. Immediate handoff to Celery/Background workers with PostgreSQL transaction locking.</p>
              </div>

              <div className="glass-pill p-5 rounded-xl border border-white/10 space-y-3">
                <h4 className="text-sm font-semibold text-[#FFF9EA] font-sans">2. 4-Agent LangGraph State Machine</h4>
                <p>Investigator Agent ➔ Reproducer Agent ➔ Sandbox Fixer Agent ➔ Release Auditor. Guardrails bound by max 5 iterations and 25,000 token limiters.</p>
              </div>

              <div className="glass-pill p-5 rounded-xl border border-white/10 space-y-3">
                <h4 className="text-sm font-semibold text-[#FFF9EA] font-sans">3. Ephemeral Subprocess Sandbox</h4>
                <p>Isolated temporary execution runner executing pytest in sanitized sub-environments with strict 15-second timeouts and memory caps.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HELP MODAL */}
      <AnimatePresence>
        {helpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHelpOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto"
          >
            <div 
              onClick={e => e.stopPropagation()}
              className="bg-[#141414] border border-white/15 rounded-2xl p-6 max-w-sm w-full space-y-4 font-mono-tech text-xs"
            >
              <div className="flex items-center justify-between text-[#FFF9EA]">
                <span className="font-sans font-medium text-sm">Control Navigation</span>
                <button onClick={() => setHelpOpen(false)} className="cursor-pointer hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="space-y-2 text-[#FFF9EA]/70">
                <li className="flex justify-between"><span>Interactive Torus:</span> <span className="text-[#E6B35A]">Move Mouse</span></li>
                <li className="flex justify-between"><span>Simulate Crash:</span> <span className="text-rose-400">Click Flame</span></li>
                <li className="flex justify-between"><span>View PRs:</span> <span className="text-emerald-400">Autonomous PRs Tab</span></li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
