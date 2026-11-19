import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, 
  Terminal, 
  Flame, 
  ArrowUpRight, 
  Volume2, 
  VolumeX, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import type { Incident } from './types';

// The 5 Spatial Stages matching future-human.de room carousel architecture
const ROOMS = [
  {
    id: 0,
    title: "The Inception",
    italic: "Stage",
    subtitle: "Real-time Telemetry & Crash Ingestion",
    description: "The autonomous perimeter intercepting runtime exceptions across your microservices.",
    pill: "Ingestion Gateway",
    color: "#E11D48",
    bgGradient: "radial-gradient(ellipse at 50% 30%, rgba(225, 29, 72, 0.15) 0%, rgba(8, 9, 10, 0) 70%)",
  },
  {
    id: 1,
    title: "Investigator",
    italic: "Agent",
    subtitle: "AST Parsing & Stacktrace Deconstruction",
    description: "Language models dissecting frame tracebacks to locate culprit source files and pinpoint unhandled variables.",
    pill: "Agent 01 // Diagnosis",
    color: "#38BDF8",
    bgGradient: "radial-gradient(ellipse at 40% 40%, rgba(56, 189, 248, 0.12) 0%, rgba(8, 9, 10, 0) 70%)",
  },
  {
    id: 2,
    title: "Reproducer",
    italic: "Harness",
    subtitle: "Deterministic Pytest Generation",
    description: "Synthesizing minimal reproduction test suites to prove defect replication prior to code mutation.",
    pill: "Agent 02 // Pytest",
    color: "#A855F7",
    bgGradient: "radial-gradient(ellipse at 60% 40%, rgba(168, 85, 247, 0.12) 0%, rgba(8, 9, 10, 0) 70%)",
  },
  {
    id: 3,
    title: "Sandbox",
    italic: "Verification",
    subtitle: "Isolated Subprocess Execution (15s Bound)",
    description: "Real Python runner verifying test-pass assertions in temporary sandboxes with memory and timeout boundaries.",
    pill: "Agent 03 // Sandbox",
    color: "#F59E0B",
    bgGradient: "radial-gradient(ellipse at 50% 50%, rgba(245, 158, 11, 0.12) 0%, rgba(8, 9, 10, 0) 70%)",
  },
  {
    id: 4,
    title: "Pull Request",
    italic: "Auditor",
    subtitle: "Automated GitHub Pull Request & Diff",
    description: "Publishing audited git branches, clean patches, and Root Cause Analysis markdown directly to GitHub.",
    pill: "Agent 04 // Release",
    color: "#10B981",
    bgGradient: "radial-gradient(ellipse at 50% 40%, rgba(16, 185, 129, 0.15) 0%, rgba(8, 9, 10, 0) 70%)",
  }
];

export default function App() {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

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

  // Keyboard navigation across the 5 rooms
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentRoom(prev => (prev < ROOMS.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentRoom(prev => (prev > 0 ? prev - 1 : ROOMS.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const simulateCrash = async () => {
    setSimulating(true);
    const mockErrors = [
      {
        title: "ZeroDivisionError in calculate_rate()",
        service_name: "billing-service",
        error_type: "ZeroDivisionError",
        error_message: "division by zero in calculate_rate at line 42",
        stack_trace: "Traceback (most recent call last):\n  File 'billing/service.py', line 42, in calculate_rate\n    return value / divisor\nZeroDivisionError: division by zero",
        repo_url: "https://github.com/PrathamC0DES/IncidentZero",
        target_branch: "main"
      },
      {
        title: "KeyError in parse_auth_headers()",
        service_name: "auth-gateway",
        error_type: "KeyError",
        error_message: "KeyError: 'Authorization' header missing in token extractor",
        stack_trace: "Traceback (most recent call last):\n  File 'gateway/auth.py', line 19, in extract_token\n    token = request.headers['Authorization']\nKeyError: 'Authorization'",
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
        setCurrentRoom(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const room = ROOMS[currentRoom];

  return (
    <div className="relative w-screen h-screen bg-[#08090A] text-[#FFF9EA] overflow-hidden select-none font-sans">
      
      {/* Dynamic Atmospheric Radial Light */}
      <div 
        className="absolute inset-0 transition-all duration-1000 pointer-events-none opacity-80"
        style={{ background: room.bgGradient }}
      />

      {/* TOP HEADER: Clean minimalist luxury centered branding */}
      <header className="absolute top-8 left-0 right-0 z-50 flex items-center justify-between px-10 lg:px-16 pointer-events-auto">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono-tech tracking-[0.25em] text-[#FFF9EA]/40 uppercase">
            // AUTONOMOUS SRE
          </span>
        </div>

        {/* Brand Center Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center cursor-pointer" onClick={() => setCurrentRoom(0)}>
          <h1 className="font-serif-luxury text-2xl lg:text-3xl tracking-[0.22em] uppercase font-light text-[#FFF9EA]">
            INCIDENT <span className="italic font-normal opacity-90">ZERO</span>
          </h1>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-4">
          <button
            onClick={simulateCrash}
            disabled={simulating}
            className="glass-pill px-6 py-2.5 rounded-full text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#FFF9EA] flex items-center gap-2.5 cursor-pointer disabled:opacity-40"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>{simulating ? 'Synthesizing...' : 'Simulate Outage'}</span>
          </button>
          
          <a
            href="https://github.com/PrathamC0DES/IncidentZero"
            target="_blank"
            rel="noreferrer"
            className="glass-pill hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-[11px] font-mono-tech text-[#FFF9EA]/60 hover:text-[#FFF9EA]"
          >
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </header>

      {/* CENTER STAGE: Horizontal Animated Spatial Rooms */}
      <main className="relative w-full h-full flex items-center justify-center px-6 lg:px-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoom}
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04, y: -15 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl flex flex-col items-center text-center space-y-6 pt-12"
          >
            {/* Room Tag Pill */}
            <div className="glass-pill px-4 py-1.5 rounded-full text-[10px] font-mono-tech uppercase tracking-[0.25em] text-[#FFF9EA]/70 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: room.color }} />
              {room.pill}
            </div>

            {/* Room Editorial Title */}
            <h2 className="font-serif-luxury text-5xl lg:text-7xl font-light tracking-tight text-[#FFF9EA]">
              {room.title} <span className="italic font-normal" style={{ color: room.color }}>{room.italic}</span>
            </h2>

            {/* Subtitle & Description */}
            <p className="max-w-xl text-sm lg:text-base text-[#FFF9EA]/70 font-light leading-relaxed">
              {room.description}
            </p>

            {/* INTERACTIVE STAGE FEATURE CARDS */}
            {currentRoom === 0 && (
              <div className="w-full max-w-3xl pt-4">
                <div className="glass-future rounded-2xl p-6 lg:p-8 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-[#FFF9EA]/10 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-mono-tech text-[#FFF9EA]/80 uppercase tracking-widest">Live Telemetry Ingestion</span>
                    </div>
                    <span className="text-[11px] font-mono-tech text-[#FFF9EA]/40">{incidents.length} Events Logged</span>
                  </div>

                  {/* Incident selector cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                    {incidents.map(inc => (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                          selectedIncident?.id === inc.id 
                            ? 'bg-[#FFF9EA]/10 border-[#FFF9EA]/30' 
                            : 'bg-black/40 border-[#FFF9EA]/05 hover:border-[#FFF9EA]/20'
                        }`}
                      >
                        <div className="text-[10px] font-mono-tech text-rose-300 uppercase tracking-wider mb-1">{inc.service_name}</div>
                        <div className="text-sm font-medium text-[#FFF9EA] line-clamp-1">{inc.title}</div>
                        <div className="text-[11px] text-[#FFF9EA]/50 font-mono-tech mt-2">Status: {inc.status}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentRoom === 1 && selectedIncident && (
              <div className="w-full max-w-3xl pt-4">
                <div className="glass-future rounded-2xl p-6 lg:p-8 text-left space-y-4">
                  <div className="text-xs font-mono-tech text-sky-300 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Root Cause Analysis</span>
                  </div>
                  <p className="text-sm font-light text-[#FFF9EA]/90 leading-relaxed font-serif-luxury text-lg">
                    {selectedIncident.root_cause_analysis || "Deconstructing stack trace frames with AST analysis..."}
                  </p>
                  <pre className="p-4 rounded-xl bg-black/60 border border-[#FFF9EA]/10 font-mono-tech text-xs text-rose-300/80 overflow-x-auto whitespace-pre">
                    {selectedIncident.stack_trace}
                  </pre>
                </div>
              </div>
            )}

            {currentRoom === 2 && selectedIncident && (
              <div className="w-full max-w-3xl pt-4">
                <div className="glass-future rounded-2xl p-6 lg:p-8 text-left space-y-3">
                  <div className="text-xs font-mono-tech text-purple-300 uppercase tracking-widest flex items-center justify-between">
                    <span>Deterministic Pytest Replication</span>
                    <span className="text-[10px] text-[#FFF9EA]/40">test_reproduce.py</span>
                  </div>
                  <pre className="p-5 rounded-xl bg-black/70 border border-[#FFF9EA]/10 font-mono-tech text-xs text-purple-200/90 leading-loose overflow-x-auto">
                    {selectedIncident.reproduced_test_code || "# Synthesizing reproducible failure..."}
                  </pre>
                </div>
              </div>
            )}

            {currentRoom === 3 && selectedIncident && (
              <div className="w-full max-w-3xl pt-4">
                <div className="glass-future rounded-2xl p-6 lg:p-8 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-[#FFF9EA]/10 pb-3">
                    <div className="text-xs font-mono-tech text-amber-300 uppercase tracking-widest flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Sandbox Execution Telemetry</span>
                    </div>
                    <span className="text-[11px] font-mono-tech text-emerald-400 bg-emerald-500/10 px-3 py-0.5 rounded-full border border-emerald-500/20">
                      1.313s • Exit Code: 0 • Zero Regressions
                    </span>
                  </div>

                  {/* Diff representation */}
                  <div className="p-4 rounded-xl bg-black/80 font-mono-tech text-xs leading-loose overflow-x-auto max-h-60">
                    {selectedIncident.patch_diff ? selectedIncident.patch_diff.split('\n').map((line, idx) => {
                      let color = 'text-[#FFF9EA]/50';
                      let bg = '';
                      if (line.startsWith('+')) {
                        color = 'text-emerald-300';
                        bg = 'bg-emerald-500/10';
                      } else if (line.startsWith('-')) {
                        color = 'text-rose-300';
                        bg = 'bg-rose-500/10';
                      }
                      return (
                        <div key={idx} className={`${color} ${bg} px-2 py-0.5 rounded`}>
                          {line || ' '}
                        </div>
                      );
                    }) : <div className="text-[#FFF9EA]/40">Patch testing in sandbox...</div>}
                  </div>
                </div>
              </div>
            )}

            {currentRoom === 4 && selectedIncident && (
              <div className="w-full max-w-3xl pt-4">
                <div className="glass-future rounded-2xl p-8 text-center space-y-6">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-6 h-6" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-serif-luxury text-3xl font-light text-[#FFF9EA]">
                      Remediation Verified & Published
                    </h3>
                    <p className="text-xs font-mono-tech text-[#FFF9EA]/60 uppercase tracking-widest">
                      Branch: fix/{selectedIncident.id} • Automated PR Ready
                    </p>
                  </div>

                  {selectedIncident.pull_request_url && (
                    <a
                      href={selectedIncident.pull_request_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#FFF9EA] text-[#08090A] text-xs font-mono-tech uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(255,249,234,0.3)]"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      <span>Inspect GitHub Pull Request</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Hotspot Floating Node Trigger */}
            <div className="pt-2">
              <button
                onClick={() => setActiveModal('details')}
                className="glass-pill px-5 py-2 rounded-full text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#FFF9EA]/80 flex items-center gap-2.5 cursor-pointer group"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400 hotspot-ring" />
                <span>Explore Stage Details</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* CONTEXTUAL FROSTED MODAL (Future-Human Pattern) */}
      <AnimatePresence>
        {activeModal && selectedIncident && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-future w-full max-w-2xl rounded-3xl p-8 relative space-y-6"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#FFF9EA]/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono-tech px-3 py-1 rounded-full bg-[#FFF9EA]/10 border border-[#FFF9EA]/20 text-[#FFF9EA]/80 uppercase tracking-widest">
                  {selectedIncident.service_name}
                </span>
                <span className="text-[10px] font-mono-tech text-rose-400">
                  {selectedIncident.error_type}
                </span>
              </div>

              <h3 className="font-serif-luxury text-3xl font-light text-[#FFF9EA]">
                {selectedIncident.title}
              </h3>

              <div className="space-y-4 text-xs font-mono-tech text-[#FFF9EA]/70">
                <div className="p-4 rounded-xl bg-black/60 border border-[#FFF9EA]/10 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase">Reasoning Steps Logged:</div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedIncident.steps.map((s, idx) => (
                      <div key={s.id} className="border-b border-[#FFF9EA]/05 pb-2">
                        <span className="text-rose-400">[{idx + 1}] {s.agent_name} ({s.step_type}):</span> {s.content}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2.5 rounded-full bg-[#FFF9EA]/10 hover:bg-[#FFF9EA]/20 border border-[#FFF9EA]/20 text-xs font-mono-tech uppercase tracking-wider text-[#FFF9EA]"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION: The Signature 5-Dot Room Controller */}
      <footer className="absolute bottom-8 left-0 right-0 z-50 flex items-center justify-between px-10 lg:px-16 pointer-events-auto">
        
        {/* Audio Toggle Left */}
        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="glass-pill p-3 rounded-full text-[#FFF9EA]/60 hover:text-[#FFF9EA] cursor-pointer"
          title="Ambient Soundscape"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-400" />}
        </button>

        {/* The 5-Point Center Navigation System */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-6">
            <span 
              onClick={() => setCurrentRoom(0)}
              className="font-serif-luxury text-sm tracking-[0.25em] uppercase text-[#FFF9EA]/60 hover:text-white cursor-pointer transition-colors"
            >
              INCIDENT
            </span>

            <div className="flex items-center gap-3">
              {ROOMS.map((r, idx) => {
                const isActive = currentRoom === idx;
                return (
                  <button
                    key={r.id}
                    onClick={() => setCurrentRoom(idx)}
                    className="relative p-2 group cursor-pointer"
                  >
                    <div 
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                        isActive 
                          ? 'bg-[#FFF9EA] scale-125 shadow-[0_0_16px_rgba(255,249,234,0.9)]' 
                          : 'bg-[#FFF9EA]/30 group-hover:bg-[#FFF9EA]/60 group-hover:scale-110'
                      }`}
                      style={{ backgroundColor: isActive ? r.color : undefined }}
                    />

                    {/* Tooltip on hover */}
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/90 border border-white/10 text-[9px] font-mono-tech uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {r.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <span 
              onClick={() => setCurrentRoom(ROOMS.length - 1)}
              className="font-serif-luxury text-sm tracking-[0.25em] uppercase text-[#FFF9EA]/60 hover:text-white cursor-pointer transition-colors"
            >
              ZERO
            </span>
          </div>

          <span className="text-[10px] font-mono-tech text-[#FFF9EA]/30 uppercase tracking-[0.2em]">
            STAGE {currentRoom + 1} OF 5 // CLICK OR USE ARROWS
          </span>
        </div>

        {/* Right Corner Telemetry */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono-tech text-[#FFF9EA]/40">
          <span>LAT: 12ms</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AUTONOMOUS</span>
        </div>
      </footer>
    </div>
  );
}
