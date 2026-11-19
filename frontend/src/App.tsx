import { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  GitPullRequest, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  ExternalLink,
  Flame,
  Cpu,
  RefreshCw
} from 'lucide-react';
import type { Incident } from './types';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Fetch all incidents
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

  // Simulate a new production crash
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
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> Queued</span>;
      case 'INVESTIGATING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1 animate-pulse"><Cpu className="w-3 h-3" /> Investigating</span>;
      case 'REPRODUCING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1"><Terminal className="w-3 h-3" /> Reproducing</span>;
      case 'FIXING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Fixing</span>;
      case 'PR_CREATED':
      case 'HEALED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Auto-PR Raised</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">IncidentZero</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Autonomous SRE</span>
            </div>
            <p className="text-xs text-slate-400">Self-Healing Codebase Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={simulateIncident}
            disabled={simulating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-xs font-semibold shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
          >
            <Flame className="w-4 h-4 text-rose-200" />
            {simulating ? 'Injecting Crash...' : 'Inject Production Crash'}
          </button>
          <a 
            href="https://github.com/PrathamC0DES/IncidentZero" 
            target="_blank" 
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors border border-slate-800 rounded-lg px-3 py-2 bg-slate-900/50"
          >
            GitHub Repo <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Grid View */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Column: Incidents Feed */}
        <section className="col-span-4 border-r border-slate-800 bg-slate-900/30 flex flex-col h-[calc(100vh-4rem)]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-rose-400" />
              Live Incident Stream
            </div>
            <span className="text-xs text-slate-500 font-mono">{incidents.length} events</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {incidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active incidents captured. Click "Inject Production Crash" to test the autonomous healing agent.
              </div>
            ) : (
              incidents.map((inc) => (
                <div 
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-4 cursor-pointer transition-all hover:bg-slate-800/40 ${
                    selectedIncident?.id === inc.id ? 'bg-slate-800/60 border-l-2 border-rose-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">{inc.service_name}</span>
                    {getStatusBadge(inc.status)}
                  </div>
                  <h3 className="text-sm font-medium text-slate-200 line-clamp-1">{inc.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-mono">{inc.error_message}</p>
                  <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>{new Date(inc.created_at).toLocaleTimeString()}</span>
                    <span>•</span>
                    <span className="font-mono">{inc.id}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Active Healing Trace & Sandbox Diff */}
        <main className="col-span-8 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto bg-slate-950 p-6 space-y-6">
          {selectedIncident ? (
            <>
              {/* Incident Header Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                        {selectedIncident.service_name}
                      </span>
                      {getStatusBadge(selectedIncident.status)}
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedIncident.title}</h2>
                    <p className="text-sm text-slate-400 mt-1 font-mono">{selectedIncident.error_message}</p>
                  </div>
                  {selectedIncident.pull_request_url && (
                    <a
                      href={selectedIncident.pull_request_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md transition-all cursor-pointer"
                    >
                      <GitPullRequest className="w-4 h-4" />
                      View Auto-PR #1
                    </a>
                  )}
                </div>

                {/* Stack Trace Preview */}
                <div className="mt-4 bg-slate-950 border border-slate-800/80 rounded-lg p-3 font-mono text-xs text-rose-300/90 overflow-x-auto whitespace-pre">
                  {selectedIncident.stack_trace}
                </div>
              </div>

              {/* Verified Patch Diff & Root Cause Analysis */}
              {selectedIncident.patch_diff && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Sandbox-Verified Code Patch
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Zero Regressions • Exit Code: 0
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-sans">
                    <strong className="text-slate-100">Root Cause: </strong>
                    {selectedIncident.root_cause_analysis}
                  </div>

                  {/* Diff Box */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    {selectedIncident.patch_diff.split('\n').map((line, idx) => {
                      let color = 'text-slate-400';
                      let bg = '';
                      if (line.startsWith('+')) {
                        color = 'text-emerald-400';
                        bg = 'bg-emerald-500/10';
                      } else if (line.startsWith('-')) {
                        color = 'text-rose-400';
                        bg = 'bg-rose-500/10';
                      }
                      return (
                        <div key={idx} className={`${color} ${bg} px-1.5 py-0.5 rounded font-mono`}>
                          {line}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Multi-Agent Reasoning Execution Chain */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    Autonomous Agent Execution Chain
                  </h3>
                  <span className="text-xs font-mono text-slate-500">
                    {selectedIncident.steps.length} reasoning steps
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedIncident.steps.map((step, idx) => (
                    <div 
                      key={step.id} 
                      className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 space-y-2 hover:border-slate-700/80 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center font-bold text-slate-300">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-200">{step.agent_name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                            {step.step_type}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(step.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-mono bg-slate-900/50 p-2.5 rounded border border-slate-800/50 whitespace-pre-wrap">
                        {step.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <ShieldAlert className="w-12 h-12 text-slate-600" />
              <p className="text-sm">Select an incident from the stream to inspect the autonomous remediation loop.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
