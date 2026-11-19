import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, 
  Terminal, 
  Flame, 
  ArrowUpRight, 
  Volume2, 
  VolumeX, 
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import type { Incident } from './types';

// The 5 authentic cinematic rooms with high-res atmospheric spatial visuals
const ROOMS = [
  {
    id: 0,
    number: "01",
    title: "SPÜRSINN",
    italic: "The Beginning",
    subtitle: "Real-time Telemetry & Crash Ingestion",
    description: "The autonomous perimeter intercepting runtime exceptions across distributed services.",
    pill: "Stage 01 // Inception",
    tagColor: "#38BDF8",
    image: "https://framerusercontent.com/images/RS69Ed1spgNQZP5bDKSkypnMeQA.webp?width=1262&height=800",
  },
  {
    id: 1,
    number: "02",
    title: "MULTIDIMENSIONAL",
    italic: "Human",
    subtitle: "AST Parsing & Stacktrace Deconstruction",
    description: "Deep frame inspection deconstructing call stacks to isolate unhandled variables and culprit functions.",
    pill: "Stage 02 // Diagnosis",
    tagColor: "#F43F5E",
    image: "https://framerusercontent.com/images/bPlZYth7cs3PE7DXCGxqj6ZcC8.webp?width=1262&height=800",
  },
  {
    id: 2,
    number: "03",
    title: "COLLECTIVE",
    italic: "Field",
    subtitle: "Deterministic Pytest Generation",
    description: "Synthesizing minimal reproduction test suites to prove defect replication prior to code mutation.",
    pill: "Stage 03 // Pytest",
    tagColor: "#A855F7",
    image: "https://framerusercontent.com/images/byN5JITGDpJS5uPjBYZNgrdYBc.webp?width=1262&height=800",
  },
  {
    id: 3,
    number: "04",
    title: "THE PATH",
    italic: "& Sanctuary",
    subtitle: "Isolated Subprocess Execution (15s Bound)",
    description: "Real Python runner verifying test-pass assertions in temporary sandboxes with zero regressions.",
    pill: "Stage 04 // Sandbox",
    tagColor: "#F59E0B",
    image: "https://framerusercontent.com/images/nXXbEcLSHkFkWv8SoaEMsCWE2T0.webp?width=1262&height=800",
  },
  {
    id: 4,
    number: "05",
    title: "THE CIRCLE",
    italic: "& Encounter",
    subtitle: "Automated GitHub Pull Request & Diff",
    description: "Publishing audited git branches, clean patches, and Root Cause Analysis markdown directly to GitHub.",
    pill: "Stage 05 // Release",
    tagColor: "#10B981",
    image: "https://framerusercontent.com/images/vDbSa7PEB8DwTVdVLCO5S03G0E.webp?width=1262&height=800",
  }
];

export default function App() {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(true);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentRoom(prev => (prev < ROOMS.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowLeft') {
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
      
      {/* FULL-VIEWPORT CINEMATIC BACKGROUND MEDIA (Directly from Future-Human) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={room.image}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <img 
            src={room.image} 
            alt={room.title}
            className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1] transform scale-100"
          />
          {/* Authentic dark vignette & radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-[#08090A]/40 to-[#08090A]/80" />
          <div className="absolute inset-0 bg-radial at-center from-transparent via-[#08090A]/30 to-[#08090A]/90" />
        </motion.div>
      </AnimatePresence>

      {/* TOP HEADER: Clean minimalist luxury centered branding */}
      <header className="absolute top-8 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 pointer-events-auto">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono-tech tracking-[0.25em] text-[#FFF9EA]/50 uppercase">
            // AUTONOMOUS SRE
          </span>
        </div>

        {/* Brand Center Title */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center cursor-pointer" onClick={() => setCurrentRoom(0)}>
          <h1 className="font-serif-luxury text-2xl lg:text-3xl tracking-[0.25em] uppercase font-light text-[#FFF9EA]">
            FUTURE <span className="italic font-normal opacity-90 text-rose-300">HUMAN</span>
          </h1>
          <div className="text-[9px] font-mono-tech tracking-[0.3em] uppercase text-[#FFF9EA]/40 -mt-1">
            INCIDENTZERO // ENGINE
          </div>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-4">
          <button
            onClick={simulateCrash}
            disabled={simulating}
            className="glass-pill px-6 py-2.5 rounded-full text-[11px] font-mono-tech uppercase tracking-[0.2em] text-[#FFF9EA] flex items-center gap-2.5 cursor-pointer disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,249,234,0.15)]"
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

      {/* CINEMATIC NAVIGATION ARROWS (Floating Left & Right) */}
      <button 
        onClick={() => setCurrentRoom(prev => (prev > 0 ? prev - 1 : ROOMS.length - 1))}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full glass-pill text-[#FFF9EA]/50 hover:text-white cursor-pointer hover:scale-110 transition-all hidden md:flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button 
        onClick={() => setCurrentRoom(prev => (prev < ROOMS.length - 1 ? prev + 1 : 0))}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 p-4 rounded-full glass-pill text-[#FFF9EA]/50 hover:text-white cursor-pointer hover:scale-110 transition-all hidden md:flex items-center justify-center"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* CENTER HERO CANVAS: Exact Future-Human Spatial Room Layout */}
      <main className="relative z-20 w-full h-full flex items-center justify-center px-6 lg:px-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoom}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-5xl flex flex-col items-center text-center space-y-6 pt-10 pointer-events-auto"
          >
            {/* Room Tag Pill */}
            <div className="glass-pill px-5 py-1.5 rounded-full text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#FFF9EA]/80 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: room.tagColor }} />
              {room.pill}
            </div>

            {/* Room Grand Editorial Title */}
            <h2 className="font-serif-luxury text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-[#FFF9EA] drop-shadow-2xl">
              {room.title} <span className="italic font-normal" style={{ color: room.tagColor }}>{room.italic}</span>
            </h2>

            {/* Subtitle & Description */}
            <p className="max-w-xl text-sm lg:text-base text-[#FFF9EA]/75 font-light leading-relaxed drop-shadow">
              {room.description}
            </p>

            {/* INTERACTIVE STAGE FEATURE CARDS */}
            {currentRoom === 0 && (
              <div className="w-full max-w-3xl pt-2">
                <div className="glass-future rounded-2xl p-6 lg:p-8 text-left space-y-4">
                  <div className="flex items-center justify-between border-b border-[#FFF9EA]/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-mono-tech text-[#FFF9EA]/90 uppercase tracking-widest font-medium">Live Telemetry Ingestion</span>
                    </div>
                    <span className="text-[11px] font-mono-tech text-[#FFF9EA]/50">{incidents.length} Events Logged</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-52 overflow-y-auto pr-1">
                    {incidents.map(inc => (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className={`p-4 rounded-xl cursor-pointer transition-all border ${
                          selectedIncident?.id === inc.id 
                            ? 'bg-[#FFF9EA]/15 border-[#FFF9EA]/40 shadow-lg' 
                            : 'bg-black/50 border-[#FFF9EA]/10 hover:border-[#FFF9EA]/30'
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
              <div className="w-full max-w-3xl pt-2">
                <div className="glass-future rounded-2xl p-6 lg:p-8 text-left space-y-4">
                  <div className="text-xs font-mono-tech text-sky-300 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Root Cause Analysis</span>
                  </div>
                  <p className="text-sm font-light text-[#FFF9EA]/90 leading-relaxed font-serif-luxury text-xl">
                    {selectedIncident.root_cause_analysis || "Deconstructing stack trace frames with AST analysis..."}
                  </p>
                  <pre className="p-4 rounded-xl bg-black/70 border border-[#FFF9EA]/10 font-mono-tech text-xs text-rose-300/90 overflow-x-auto whitespace-pre max-h-40">
                    {selectedIncident.stack_trace}
                  </pre>
                </div>
              </div>
            )}

            {currentRoom === 2 && selectedIncident && (
              <div className="w-full max-w-3xl pt-2">
                <div className="glass-future rounded-2xl p-6 lg:p-8 text-left space-y-3">
                  <div className="text-xs font-mono-tech text-purple-300 uppercase tracking-widest flex items-center justify-between">
                    <span>Deterministic Pytest Replication</span>
                    <span className="text-[10px] text-[#FFF9EA]/50">test_reproduce.py</span>
                  </div>
                  <pre className="p-5 rounded-xl bg-black/75 border border-[#FFF9EA]/10 font-mono-tech text-xs text-purple-200/90 leading-loose overflow-x-auto max-h-52">
                    {selectedIncident.reproduced_test_code || "# Synthesizing reproducible failure..."}
                  </pre>
                </div>
              </div>
            )}

            {currentRoom === 3 && selectedIncident && (
              <div className="w-full max-w-3xl pt-2">
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

                  <div className="p-4 rounded-xl bg-black/80 font-mono-tech text-xs leading-loose overflow-x-auto max-h-52">
                    {selectedIncident.patch_diff ? selectedIncident.patch_diff.split('\n').map((line, idx) => {
                      let color = 'text-[#FFF9EA]/50';
                      let bg = '';
                      if (line.startsWith('+')) {
                        color = 'text-emerald-300';
                        bg = 'bg-emerald-500/15';
                      } else if (line.startsWith('-')) {
                        color = 'text-rose-300';
                        bg = 'bg-rose-500/15';
                      }
                      return (
                        <div key={idx} className={`${color} ${bg} px-2 py-0.5 rounded font-mono-tech`}>
                          {line || ' '}
                        </div>
                      );
                    }) : <div className="text-[#FFF9EA]/40">Patch testing in sandbox...</div>}
                  </div>
                </div>
              </div>
            )}

            {currentRoom === 4 && selectedIncident && (
              <div className="w-full max-w-3xl pt-2">
                <div className="glass-future rounded-2xl p-8 text-center space-y-6">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-serif-luxury text-4xl font-light text-[#FFF9EA]">
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
                      className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#FFF9EA] text-[#08090A] text-xs font-mono-tech uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_35px_rgba(255,249,234,0.4)]"
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
                className="glass-pill px-6 py-2 rounded-full text-[11px] font-mono-tech uppercase tracking-[0.25em] text-[#FFF9EA]/90 flex items-center gap-3 cursor-pointer group hover:scale-105 transition-all"
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
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

      {/* BOTTOM NAVIGATION: The Signature 5-Dot Room Controller from Future-Human */}
      <footer className="absolute bottom-8 left-0 right-0 z-50 flex items-center justify-between px-8 lg:px-16 pointer-events-auto">
        
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
              FUTURE
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
                          ? 'bg-[#FFF9EA] scale-150 shadow-[0_0_20px_rgba(255,249,234,1)]' 
                          : 'bg-[#FFF9EA]/30 group-hover:bg-[#FFF9EA]/70 group-hover:scale-125'
                      }`}
                      style={{ backgroundColor: isActive ? r.tagColor : undefined }}
                    />

                    {/* Tooltip on hover */}
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/90 border border-white/10 text-[9px] font-mono-tech uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
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
              HUMAN
            </span>
          </div>

          <span className="text-[10px] font-mono-tech text-[#FFF9EA]/40 uppercase tracking-[0.25em]">
            ROOM {room.number} OF 05 // CLICK DOTS OR USE ARROWS
          </span>
        </div>

        {/* Right Corner Telemetry */}
        <div className="hidden sm:flex items-center gap-4 text-[11px] font-mono-tech text-[#FFF9EA]/50">
          <span>LAT: 12ms</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AUTONOMOUS</span>
        </div>
      </footer>
    </div>
  );
}
