import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitPullRequest, 
  Flame, 
  Volume2, 
  VolumeX, 
  X,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import type { Incident } from './types';

// The 5 authentic cinematic rooms generated directly from Stitch & Future-Human
const ROOMS = [
  {
    id: 0,
    number: "01",
    label: "01 / eBPF Probing",
    headline: "THE ENGINE IS AUTONOMOUS.",
    italicTag: "Autonomous Kernel • Active",
    subtitle: "Real-time Telemetry & Crash Ingestion",
    description: "Production crashes no longer wait for morning triage. IncidentZero intercepts runtime panics and synthesizes verified pull requests in seconds.",
    accent: "#E6B35A",
    image: "https://lh3.googleusercontent.com/aida/ALJJyrBQlLlLWgOemAKLowuoU5Zjzi1nOQnlzyIA6N7WtSvnOCEGrhWL1gDbEB_wF3YQ-_-pDMOTzQcXyFEXDrgb2jNrJgEQWUVbg74Snm0fFCcg1oaZTZh5a5r8DY2VoJzpd2i_sJ_SUQBnXcNgwetswBSuwjUMjzMskjkeZskuxoH22ufgSbP8t2xOC8HCmdGIls0li64eeogYcF6oZPzvMcqRae-W5EkCtQHUW0darSFZqGbAmhLwvDbQ-tGAQTDJZJJ9RMKMKiaryg",
    hotspots: ["Kernel eBPF", "AST Synthesis", "Zero Regression"]
  },
  {
    id: 1,
    number: "02",
    label: "02 / Frame Analysis",
    headline: "TRACEBACKS DECONSTRUCTED.",
    italicTag: "Deterministic Code Remediation",
    subtitle: "AST Parsing & Stacktrace Isolation",
    description: "Deep frame inspection dissects invocation stacks to isolate unhandled variables, boundary conditions, and culprit functions.",
    accent: "#38BDF8",
    image: "https://lh3.googleusercontent.com/aida/ALJJyrBnFELVLjOc8FHTy0HFvmb4Dw2gWshQieZHqcnHa_RAa0ndMkXL_k8eWozUCWkEGXzS41otdsQxoWyt2a-4IiF6M5gccaivnRiipDT0WtSTSP7FMW9mzOgjjBK9lYbQAZ6AXDLTv7NEiqF9bxmqF1gq4ZCsW3YfR5H9cU7tK2F_nWa9LC0ihBsCZNc6ePid1dOJ5QiMyDQB-BQjVNcdIOGIQYz19lQWj1Rr_oY6ZrfnKlfl_z9bzd7Vmq92Ef1HFtSVI4ppZDnt1w",
    hotspots: ["Variable Scopes", "Call Hierarchy", "Pointer Safety"]
  },
  {
    id: 2,
    number: "03",
    label: "03 / Harness Synthesis",
    headline: "REPRODUCING THE INFECTION.",
    italicTag: "Zero Hallucination Guarantee",
    subtitle: "Deterministic Pytest Generation",
    description: "Synthesizing minimal reproduction test suites to mathematically prove defect replication prior to code mutation.",
    accent: "#A855F7",
    image: "https://framerusercontent.com/images/byN5JITGDpJS5uPjBYZNgrdYBc.webp?width=1262&height=800",
    hotspots: ["Failing Assertion", "Test Boundary", "Mock Context"]
  },
  {
    id: 3,
    number: "04",
    label: "04 / Sandbox Runner",
    headline: "SUBPROCESS VERIFICATION.",
    italicTag: "Subprocess Sandbox // 15s Timeout",
    subtitle: "Isolated Execution Engine",
    description: "Real Python runner verifying test-pass assertions in temporary sandboxes with memory limits and zero regression guarantees.",
    accent: "#F59E0B",
    image: "https://framerusercontent.com/images/nXXbEcLSHkFkWv8SoaEMsCWE2T0.webp?width=1262&height=800",
    hotspots: ["15s Boundary", "Exit Code 0", "Zero Regressions"]
  },
  {
    id: 4,
    number: "05",
    label: "05 / Release Pipeline",
    headline: "AUDITED PULL REQUESTS.",
    italicTag: "Production Gate Passed",
    subtitle: "Automated GitHub Pull Request",
    description: "Publishing verified git branches, clean patches, and Root Cause Analysis markdown directly to production teams.",
    accent: "#10B981",
    image: "https://framerusercontent.com/images/vDbSa7PEB8DwTVdVLCO5S03G0E.webp?width=1262&height=800",
    hotspots: ["Verified Diff", "Branch fix/*", "Automated RCA"]
  }
];

export default function App() {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
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
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#0A0A0A] text-[#FFF9EA] font-sans antialiased">
      
      {/* BACKGROUND CINEMATIC ARTWORK WITH SMOOTH CROSSFADE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={room.image}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.82, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <img 
            src={room.image} 
            alt={room.headline}
            className="w-full h-full object-cover filter brightness-[0.7] contrast-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-[#0A0A0A]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,249,234,0.04)_1px,transparent_0)] bg-[size:28px_28px]" />
        </motion.div>
      </AnimatePresence>

      {/* FIXED TOP CENTER BRAND HEADER (Exact future-human.de typography & letter-spacing) */}
      <header className="fixed top-8 left-0 right-0 z-40 flex flex-col items-center justify-center pointer-events-none">
        <button 
          onClick={() => setCurrentRoom(0)} 
          className="pointer-events-auto flex flex-col items-center group cursor-pointer transition-transform duration-300 active:scale-95"
        >
          <span className="font-serif-luxury text-sm tracking-[0.35em] uppercase text-[#FFF9EA] font-light">
            I N C I D E N T
          </span>
          <span className="font-serif-luxury text-sm tracking-[0.35em] uppercase text-[#FFF9EA] font-light -mt-1">
            Z E R O
          </span>
        </button>
      </header>

      {/* TOP LEFT STATUS BADGE */}
      <aside className="fixed top-8 left-8 z-40 hidden sm:flex items-center gap-3 pointer-events-none font-mono-tech text-[11px] text-[#FFF9EA]/80 uppercase px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-2.5" />
        <span>Autonomous Kernel • Active</span>
      </aside>

      {/* TOP RIGHT TELEMETRY & SIMULATE BUTTON */}
      <aside className="fixed top-8 right-8 z-40 flex items-center gap-3">
        <button
          onClick={simulateCrash}
          disabled={simulating}
          className="glass-pill px-5 py-2 rounded-full font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#FFF9EA] flex items-center gap-2 cursor-pointer disabled:opacity-40 hover:scale-105 transition-all shadow-[0_0_20px_rgba(230,179,90,0.2)]"
        >
          <Flame className="w-3.5 h-3.5 text-[#E6B35A]" />
          <span>{simulating ? 'Injecting...' : 'Simulate Outage'}</span>
        </button>
      </aside>

      {/* CENTER SPATIAL ROOM DISPLAY */}
      <main className="relative z-20 w-full h-full flex flex-col justify-between p-8 md:p-14 pointer-events-none">
        
        {/* Empty space for top alignment */}
        <div className="h-10" />

        {/* Center Room Editorial Statement */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoom}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="my-auto max-w-4xl mx-auto text-center flex flex-col items-center px-4 pointer-events-auto"
          >
            <span 
              className="font-mono-tech text-xs uppercase tracking-widest mb-3 block"
              style={{ color: room.accent }}
            >
              {room.italicTag}
            </span>

            <h1 className="font-serif-luxury text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#FFF9EA] font-light mb-4 tracking-tight drop-shadow-2xl">
              {room.headline}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#FFF9EA]/80 font-light max-w-2xl mb-8 leading-relaxed drop-shadow">
              {room.description}
            </p>

            {/* Interactive Floating Hotspot Nodes */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-2 font-mono-tech text-xs text-[#FFF9EA]/80">
              {room.hotspots.map((hotspot, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveDrawer(hotspot)}
                  className="group flex items-center gap-2.5 transition-colors hover:text-[#FFF9EA] cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full border border-[#FFF9EA]/50 group-hover:bg-[#FFF9EA] group-hover:scale-125 transition-all" />
                  <span>{hotspot}</span>
                </button>
              ))}
            </div>

            {/* ACTIVE DATA CARD PREVIEW */}
            {currentRoom === 0 && (
              <div className="mt-8 w-full max-w-2xl bg-black/60 border border-white/10 rounded-2xl p-5 text-left backdrop-blur-xl">
                <div className="flex items-center justify-between text-[11px] font-mono-tech text-[#FFF9EA]/50 border-b border-white/10 pb-3 mb-3">
                  <span>DETECTED INCIDENTS ({incidents.length})</span>
                  <span>CLICK TO INSPECT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-36 overflow-y-auto">
                  {incidents.map(inc => (
                    <div 
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedIncident?.id === inc.id ? 'bg-white/15 border-white/40' : 'bg-black/40 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="text-[10px] font-mono-tech text-[#E6B35A] uppercase">{inc.service_name}</div>
                      <div className="text-xs font-medium text-[#FFF9EA] truncate">{inc.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentRoom === 3 && selectedIncident?.patch_diff && (
              <div className="mt-8 w-full max-w-2xl bg-black/80 border border-white/10 rounded-2xl p-5 text-left backdrop-blur-xl font-mono-tech text-xs leading-loose overflow-x-auto max-h-48">
                {selectedIncident.patch_diff.split('\n').map((line, idx) => {
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
                    <div key={idx} className={`${color} ${bg} px-2 py-0.5 rounded`}>
                      {line || ' '}
                    </div>
                  );
                })}
              </div>
            )}

            {currentRoom === 4 && selectedIncident?.pull_request_url && (
              <div className="mt-8">
                <a
                  href={selectedIncident.pull_request_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#FFF9EA] text-[#0A0A0A] font-mono-tech text-xs uppercase tracking-[0.2em] font-semibold hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_35px_rgba(255,249,234,0.4)]"
                >
                  <GitPullRequest className="w-4 h-4" />
                  <span>Inspect GitHub Pull Request</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* BOTTOM SECTION BAR */}
        <div className="relative z-10 w-full flex items-center justify-between text-[11px] font-mono-tech text-[#FFF9EA]/60 uppercase tracking-widest pointer-events-auto">
          <span>{room.label}</span>
          <button 
            onClick={() => setCurrentRoom(prev => (prev < ROOMS.length - 1 ? prev + 1 : 0))}
            className="group flex items-center gap-2 text-[#FFF9EA] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <span>Next Stage</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      {/* CONTEXTUAL DRAWER MODAL */}
      <AnimatePresence>
        {activeDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setActiveDrawer(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass-future w-full max-w-xl rounded-3xl p-8 relative space-y-5"
            >
              <button 
                onClick={() => setActiveDrawer(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-[#FFF9EA]/60 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-[10px] font-mono-tech px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#E6B35A] uppercase tracking-widest">
                {activeDrawer}
              </span>

              <h3 className="font-serif-luxury text-3xl font-light text-[#FFF9EA]">
                {room.headline}
              </h3>

              <p className="text-sm text-[#FFF9EA]/75 leading-relaxed font-light">
                {room.description}
              </p>

              {selectedIncident && (
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 font-mono-tech text-xs text-[#FFF9EA]/70">
                  <div className="text-[10px] text-slate-500 uppercase">Active Incident In Context:</div>
                  <div className="text-rose-300 font-medium">{selectedIncident.error_type} in {selectedIncident.service_name}</div>
                  <div className="text-[11px] text-[#FFF9EA]/50 truncate">{selectedIncident.error_message}</div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setActiveDrawer(null)}
                  className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono-tech uppercase tracking-wider text-[#FFF9EA] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM CONTROLLER: THE SIGNATURE 5-DOT ROOM NAVIGATOR */}
      <footer className="fixed bottom-8 left-0 right-0 z-40 flex items-center justify-between px-8 md:px-14 pointer-events-auto">
        
        {/* Audio Toggle */}
        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="glass-pill p-3 rounded-full text-[#FFF9EA]/60 hover:text-[#FFF9EA] cursor-pointer"
          title="Ambient Sound"
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#E6B35A]" />}
        </button>

        {/* 5-Dot Controller */}
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
                      style={{ backgroundColor: isActive ? r.accent : undefined }}
                    />
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/95 border border-white/10 text-[9px] font-mono-tech uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                      {r.headline}
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

        {/* Status Indicator Right */}
        <div className="hidden sm:flex items-center gap-3 font-mono-tech text-[11px] text-[#FFF9EA]/50 uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>AUTONOMOUS</span>
        </div>
      </footer>
    </div>
  );
}
