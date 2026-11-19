import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  GitPullRequest, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame,
  Cpu,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Code2,
  FileCode,
  Layers
} from 'lucide-react';
import type { Incident } from './types';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<'diff' | 'chain' | 'test'>('diff');

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
      console.error('Failed to fetch incidents:', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, [selectedIncident]);

  const simulateIncident = async () => {
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
      }
    } catch (err) {
      console.error('Failed to trigger incident:', err);
    } finally {
      setSimulating(false);
    }
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'RECEIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech tracking-wider uppercase text-amber-300/90 bg-amber-500/10 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Queued
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech tracking-wider uppercase text-sky-300/90 bg-sky-500/10 border border-sky-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            Investigating
          </span>
        );
      case 'REPRODUCING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech tracking-wider uppercase text-purple-300/90 bg-purple-500/10 border border-purple-500/20">
            <Terminal className="w-3 h-3 text-purple-400" />
            Reproducing
          </span>
        );
      case 'FIXING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech tracking-wider uppercase text-rose-300/90 bg-rose-500/10 border border-rose-500/20">
            <RefreshCw className="w-3 h-3 text-rose-400 animate-spin" />
            Self-Healing
          </span>
        );
      case 'PR_CREATED':
      case 'HEALED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech tracking-wider uppercase text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Auto-PR Raised
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono-tech tracking-wider uppercase text-rose-300/90 bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-200 flex flex-col font-sans selection:bg-rose-500/30 selection:text-white bg-noise">
      
      {/* Editorial Header Ambient Horizon */}
      <div className="absolute top-0 left-0 right-0 h-96 glow-horizon pointer-events-none -z-10" />

      {/* Haute Couture Editorial Navigation */}
      <header className="border-b border-hairline px-8 lg:px-14 py-6 flex items-center justify-between sticky top-0 bg-[#050608]/80 backdrop-blur-xl z-50">
        <div className="flex items-baseline gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e]" />
            <span className="font-editorial text-2xl lg:text-3xl font-semibold tracking-wider text-white">
              INCIDENT<span className="font-light italic text-rose-400">ZERO</span>
            </span>
          </div>
          <span className="hidden md:inline-block text-[11px] font-mono-tech text-slate-500 tracking-widest uppercase">
            // AUTONOMOUS SRE & CODEBASE HEALING ENGINE
          </span>
        </div>

        <div className="flex items-center gap-5">
          <button
            onClick={simulateIncident}
            disabled={simulating}
            className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-mono-tech tracking-wider uppercase text-white bg-gradient-to-r from-rose-600/90 to-rose-700/90 hover:from-rose-500 hover:to-rose-600 border border-rose-400/30 transition-all duration-300 shadow-[0_0_25px_-5px_rgba(244,63,94,0.4)] active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-rose-200 group-hover:rotate-12 transition-transform duration-300" />
            <span>{simulating ? 'Synthesizing...' : 'Simulate Outage'}</span>
          </button>

          <a 
            href="https://github.com/PrathamC0DES/IncidentZero" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono-tech text-slate-400 hover:text-white border border-hairline hover:border-slate-600 bg-white/[0.02] transition-colors"
          >
            <span>v1.0.0</span>
            <span className="text-slate-600">•</span>
            <span>GitHub</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </header>

      {/* Telemetry Strip */}
      <div className="border-b border-hairline px-8 lg:px-14 py-2.5 bg-black/40 flex items-center justify-between text-[11px] font-mono-tech text-slate-500 overflow-x-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">SYS:</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              ONLINE / ARMED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">SANDBOX:</span>
            <span className="text-slate-300">SUBPROCESS_ISOLATED (15s TIMEOUT)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">ENGINE:</span>
            <span className="text-slate-300">LITELLM / GEMINI-1.5</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span>LATENCY: 14ms</span>
          <span>EVENTS: {incidents.length}</span>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 grid grid-cols-12 max-w-[1920px] mx-auto w-full">
        
        {/* Left Column: Curated Incident Stream */}
        <aside className="col-span-12 lg:col-span-4 border-r border-hairline bg-[#050608]/40 flex flex-col h-[calc(100vh-8.5rem)]">
          <div className="p-6 border-b border-hairline flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4 text-slate-500" />
              <h2 className="font-editorial text-sm tracking-wider uppercase text-slate-300">
                Outage Log
              </h2>
            </div>
            <span className="text-[10px] font-mono-tech text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded border border-hairline">
              {incidents.length} DETECTED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-hairline">
            {incidents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3 font-mono-tech text-xs">
                <Clock className="w-6 h-6 mx-auto text-slate-600 opacity-60" />
                <p>Telemetry stream idle.</p>
                <p className="text-[11px] text-slate-600">Click "Simulate Outage" to trigger autonomous agent remediation.</p>
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`p-6 cursor-pointer transition-all duration-300 relative group ${
                      isSelected 
                        ? 'bg-white/[0.03] border-l-2 border-rose-500' 
                        : 'hover:bg-white/[0.015]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono-tech tracking-wider text-slate-400 uppercase">
                        {inc.service_name}
                      </span>
                      {getStatusBadge(inc.status)}
                    </div>

                    <h3 className="text-sm font-medium text-slate-100 group-hover:text-rose-300 transition-colors line-clamp-1">
                      {inc.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-mono-tech opacity-75">
                      {inc.error_message}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-[10px] font-mono-tech text-slate-500">
                      <span>{new Date(inc.created_at).toLocaleTimeString()}</span>
                      <span className="text-slate-600">#{inc.id.replace('inc_', '')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Main Canvas: Future-Human Cinematic Inspector */}
        <main className="col-span-12 lg:col-span-8 flex flex-col h-[calc(100vh-8.5rem)] overflow-y-auto p-8 lg:p-12 space-y-8">
          {selectedIncident ? (
            <>
              {/* Incident Header Feature */}
              <div className="glass-panel rounded-2xl p-8 relative overflow-hidden border-hairline-glow">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono-tech px-2.5 py-1 rounded bg-white/[0.04] text-slate-400 border border-hairline uppercase tracking-widest">
                        {selectedIncident.service_name}
                      </span>
                      {getStatusBadge(selectedIncident.status)}
                    </div>

                    <h2 className="font-editorial text-2xl lg:text-3xl font-medium tracking-tight text-white">
                      {selectedIncident.title}
                    </h2>

                    <p className="text-xs text-slate-400 font-mono-tech bg-black/40 px-3 py-2 rounded-lg border border-hairline inline-block">
                      {selectedIncident.error_message}
                    </p>
                  </div>

                  {selectedIncident.pull_request_url && (
                    <a
                      href={selectedIncident.pull_request_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono-tech uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] self-start"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Inspect Pull Request</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    </a>
                  )}
                </div>

                {/* Collapsible Stack Trace Excerpt */}
                <div className="mt-6 pt-6 border-t border-hairline">
                  <div className="flex items-center justify-between mb-2 text-[11px] font-mono-tech text-slate-500 uppercase tracking-widest">
                    <span>Runtime Traceback</span>
                    <span>PYTHON 3.13</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-black/60 border border-hairline font-mono-tech text-xs text-rose-300/80 overflow-x-auto whitespace-pre">
                    {selectedIncident.stack_trace}
                  </pre>
                </div>
              </div>

              {/* View Switcher Tabs */}
              <div className="flex items-center gap-2 border-b border-hairline pb-4 text-xs font-mono-tech uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('diff')}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'diff' 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Sandbox Patch Diff</span>
                </button>
                <button
                  onClick={() => setActiveTab('chain')}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'chain' 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Agent Reasoning Chain ({selectedIncident.steps.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={`px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                    activeTab === 'test' 
                      ? 'bg-white/10 text-white border border-white/20' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Synthesized Pytest</span>
                </button>
              </div>

              {/* TAB 1: VERIFIED CODE PATCH */}
              {activeTab === 'diff' && (
                <div className="space-y-4">
                  {selectedIncident.root_cause_analysis && (
                    <div className="glass-panel p-6 rounded-2xl border-hairline space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-mono-tech text-slate-400 uppercase tracking-widest">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        <span>Root Cause Analysis</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed font-sans">
                        {selectedIncident.root_cause_analysis}
                      </p>
                    </div>
                  )}

                  {selectedIncident.patch_diff ? (
                    <div className="glass-panel rounded-2xl overflow-hidden border-hairline">
                      <div className="px-6 py-4 bg-white/[0.02] border-b border-hairline flex items-center justify-between text-xs font-mono-tech text-slate-400">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-white font-medium">Unified Git Diff</span>
                        </div>
                        <span className="text-emerald-400 text-[11px] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          EXIT_CODE: 0 • ZERO REGRESSIONS
                        </span>
                      </div>

                      <div className="p-6 bg-black/80 font-mono-tech text-xs leading-loose overflow-x-auto divide-y divide-white/[0.02]">
                        {selectedIncident.patch_diff.split('\n').map((line, idx) => {
                          let color = 'text-slate-400';
                          let bg = '';
                          if (line.startsWith('+')) {
                            color = 'text-emerald-300';
                            bg = 'bg-emerald-500/10';
                          } else if (line.startsWith('-')) {
                            color = 'text-rose-300';
                            bg = 'bg-rose-500/10';
                          } else if (line.startsWith('@')) {
                            color = 'text-sky-300 font-bold';
                          }
                          return (
                            <div key={idx} className={`${color} ${bg} px-3 py-1 font-mono-tech rounded`}>
                              {line || ' '}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel p-12 text-center text-slate-500 font-mono-tech text-xs rounded-2xl">
                      Remediation patch generating...
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AGENT REASONING CHAIN */}
              {activeTab === 'chain' && (
                <div className="space-y-4">
                  {selectedIncident.steps.map((step, idx) => (
                    <div 
                      key={step.id} 
                      className="glass-panel rounded-2xl p-6 border-hairline hover:border-slate-600 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white/[0.04] text-xs font-mono-tech text-slate-300 flex items-center justify-center border border-hairline">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-editorial text-white tracking-wide">
                            {step.agent_name}
                          </span>
                          <span className="text-[10px] font-mono-tech px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase tracking-widest">
                            {step.step_type}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-tech text-slate-500">
                          {new Date(step.created_at).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl bg-black/60 border border-hairline font-mono-tech text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {step.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: SYNTHESIZED PYTEST */}
              {activeTab === 'test' && (
                <div className="glass-panel rounded-2xl overflow-hidden border-hairline">
                  <div className="px-6 py-4 bg-white/[0.02] border-b border-hairline flex items-center justify-between text-xs font-mono-tech text-slate-400">
                    <span className="text-white font-medium">test_reproduce.py</span>
                    <span className="text-slate-500 text-[11px]">DETERMINISTIC TEST HARNESS</span>
                  </div>
                  <pre className="p-6 bg-black/80 font-mono-tech text-xs text-sky-200 leading-relaxed overflow-x-auto whitespace-pre">
                    {selectedIncident.reproduced_test_code || '# Synthesizing test suite...'}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
              <ShieldAlert className="w-16 h-16 opacity-30 text-rose-500" />
              <p className="font-editorial text-lg tracking-wider text-slate-400">No Outage Selected</p>
              <p className="font-mono-tech text-xs text-slate-600">Select an event from the outage log or click Simulate Outage.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
