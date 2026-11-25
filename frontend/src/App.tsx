import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowDown, ArrowUpRight, CircleHelp, GitPullRequest, Pause, Play, X, Zap } from 'lucide-react';
import type { Incident } from './types';
import SignalArtwork from './SignalArtwork';

const repository = 'https://github.com/PrathamC0DES/IncidentZero';

const exampleIncidents = [
  {
    title: 'SIGSEGV null-pointer dereference in gateway route dispatcher',
    service_name: 'gateway-core',
    error_type: 'NullPointerException',
    error_message: 'null pointer dereference in route handler at line 42',
    stack_trace: "Traceback (most recent call last):\n  File 'gateway/dispatcher.py', line 42, in route\n    return session.get(stream_id).unwrap()\nNullPointerException: session is None",
  },
  {
    title: 'ZeroDivisionError in calculate_rate()',
    service_name: 'billing-service',
    error_type: 'ZeroDivisionError',
    error_message: 'division by zero in calculate_rate at line 42',
    stack_trace: "Traceback (most recent call last):\n  File 'billing/service.py', line 42, in calculate_rate\n    return value / divisor\nZeroDivisionError: division by zero",
  },
];

const stages = [
  { title: 'Capture', description: 'A webhook sends crash context and a stack trace to the FastAPI ingestion endpoint.' },
  { title: 'Investigate', description: 'The LangGraph pipeline reviews the incident and identifies a likely root cause.' },
  { title: 'Validate', description: 'A test reproduces the reported error and checks the proposed patch in an isolated runner.' },
  { title: 'Review', description: 'Review the analysis, regression test and patch together. Open the GitHub pull request when one is available.' },
];

const statusLabels: Record<Incident['status'], string> = {
  RECEIVED: 'Received',
  INVESTIGATING: 'Investigating',
  REPRODUCING: 'Reproducing',
  FIXING: 'Fixing',
  AUDITING: 'Auditing',
  HEALED: 'Healed',
  PR_CREATED: 'PR created',
  FAILED: 'Failed',
};

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [feedState, setFeedState] = useState<'loading' | 'ready' | 'offline'>('loading');
  const [selectedId, setSelectedId] = useState<string>();
  const [simulating, setSimulating] = useState(false);
  const [simulationError, setSimulationError] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const feedRevision = useRef(0);
  const help = useRef<HTMLDialogElement>(null);
  const incidentsHeading = useRef<HTMLHeadingElement>(null);
  const selected = incidents.find(incident => incident.id === selectedId) ?? incidents[0];

  useEffect(() => {
    const controller = new AbortController();
    let timer: number;

    async function load() {
      const revision = feedRevision.current;
      try {
        const response = await fetch('/api/v1/incidents', { signal: controller.signal });
        if (!response.ok) throw new Error('Incident feed unavailable');
        const current: Incident[] = await response.json();
        if (controller.signal.aborted || revision !== feedRevision.current) return;
        setIncidents(current);
        setFeedState('ready');
      } catch {
        if (!controller.signal.aborted && revision === feedRevision.current) setFeedState('offline');
      } finally {
        if (!controller.signal.aborted) timer = window.setTimeout(load, 3000);
      }
    }

    void load();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  async function simulateCrash() {
    setSimulating(true);
    setSimulationError(false);
    const example = exampleIncidents[Math.floor(Math.random() * exampleIncidents.length)];

    try {
      const response = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...example, repo_url: repository, target_branch: 'main' }),
      });
      if (!response.ok) throw new Error('Simulation request failed');
      const incident: Incident = await response.json();
      feedRevision.current += 1;
      setIncidents(current => [incident, ...current.filter(item => item.id !== incident.id)]);
      setFeedState('ready');
      setSelectedId(incident.id);
      incidentsHeading.current?.focus({ preventScroll: true });
      if (window.location.hash === '#incidents') {
        incidentsHeading.current?.closest('section')?.scrollIntoView();
      } else {
        window.location.hash = 'incidents';
      }
    } catch {
      setSimulationError(true);
    } finally {
      setSimulating(false);
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="masthead">
        <a className="wordmark" href="#overview">
          <Activity aria-hidden="true" size={22} />
          IncidentZero
        </a>
        <nav className="navigation" aria-label="Main">
          <a href="#overview">Overview</a>
          <a href="#incidents">Incidents</a>
          <a href="#architecture">Architecture</a>
        </nav>
        <div className="masthead-actions">
          <button
            className="motion-control"
            aria-label={motionPaused ? 'Play motion' : 'Pause motion'}
            title={motionPaused ? 'Play motion' : 'Pause motion'}
            onClick={() => setMotionPaused(current => !current)}
          >
            {motionPaused ? <Play aria-hidden="true" size={16} /> : <Pause aria-hidden="true" size={16} />}
          </button>
          <a className="source-link" href={repository} target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" size={15} /></a>
        </div>
      </header>

      <main className="experience" id="main" data-paused={motionPaused}>
        <div className="experience-backdrop" aria-hidden="true">
          <SignalArtwork paused={motionPaused} />
        </div>
        <div className="experience-chapters">
          <section className="hero" id="overview" aria-labelledby="hero-title">
            <div className="hero-grid">
              <div className="hero-content">
                <h1 id="hero-title">From crash<br />to patch.</h1>
                <p>Trace application failures, validate fixes in a sandbox, and review the patch on GitHub.</p>
                <div className="hero-actions">
                  <button className="hero-action" disabled={simulating} onClick={simulateCrash}>
                    <Zap aria-hidden="true" size={15} /> {simulating ? 'Submitting…' : 'Simulate outage'}
                  </button>
                </div>
                {simulationError && <p className="action-error" role="alert">Couldn’t submit the outage. Check the API connection and try again.</p>}
              </div>
              <figure className="hero-trace">
                <figcaption>Example incident <span>billing-service</span></figcaption>
                <pre><code><span className="trace-file">billing/service.py:42</span>{'\n'}<span className="trace-error">ZeroDivisionError</span>{'\n'}division by zero</code></pre>
                <ol className="trace-stages" aria-label="Remediation stages">
                  {stages.map(stage => <li key={stage.title}>{stage.title}</li>)}
                </ol>
              </figure>
            </div>
            <div className="signal-strip">
              <div className="signal-status">
                <span className="status-dot" data-state={feedState} />
                <span>{feedState === 'ready' ? 'Incident feed connected' : feedState === 'loading' ? 'Connecting to incident feed' : 'Incident feed offline'}</span>
              </div>
              <a href="#incidents">View incidents <ArrowDown aria-hidden="true" size={14} /></a>
            </div>
          </section>

          <section className="workspace content-width" id="incidents" aria-labelledby="incidents-title" data-motion-scene>
            <div className="section-heading">
              <h2 id="incidents-title" ref={incidentsHeading} tabIndex={-1}>Incident feed</h2>
              {feedState === 'ready' && <span className="data-label">{incidents.length} recent {incidents.length === 1 ? 'incident' : 'incidents'}</span>}
            </div>
            {feedState === 'offline' && <p className="feed-notice" role="status">The incident API is unavailable. The feed reconnects automatically.</p>}
            {feedState === 'loading' && <p className="feed-notice" role="status">Loading incidents…</p>}
            {feedState === 'ready' && !incidents.length && <p className="feed-notice">No incidents recorded. Simulate an outage to add an example to the feed.</p>}
            {selected && (
              <div className="incident-workspace">
                <ul className="incident-list" aria-label="Recent incidents">
                  {incidents.map(incident => (
                    <li key={incident.id}>
                      <button aria-pressed={incident.id === selected.id} onClick={() => setSelectedId(incident.id)}>
                        <span className="data-label">{incident.service_name}</span>
                        <span>{incident.title}</span>
                        <span className="incident-status" data-status={incident.status}>{statusLabels[incident.status]}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <article className="incident-detail" aria-labelledby="incident-title">
                  <div className="incident-meta">
                    <span className="data-label">{selected.id}</span>
                    <span className="incident-status" data-status={selected.status}>{statusLabels[selected.status]}</span>
                  </div>
                  <h3 id="incident-title">{selected.title}</h3>
                  <p>{selected.error_message}</p>
                  {selected.pull_request_url && (
                    <a className="button button-quiet" href={selected.pull_request_url} target="_blank" rel="noreferrer">
                      <GitPullRequest aria-hidden="true" size={16} /> View pull request <ArrowUpRight aria-hidden="true" size={15} />
                    </a>
                  )}
                  {selected.root_cause_analysis && <p>{selected.root_cause_analysis}</p>}
                  {selected.patch_diff && (
                    <details open>
                      <summary>Patch diff</summary>
                      <pre className="patch"><code>{selected.patch_diff.split('\n').map((line, index) => (
                        <span key={index} data-change={line[0]}>{line}{'\n'}</span>
                      ))}</code></pre>
                    </details>
                  )}
                  {selected.reproduced_test_code && (
                    <details>
                      <summary>Regression test</summary>
                      <pre><code>{selected.reproduced_test_code}</code></pre>
                    </details>
                  )}
                </article>
              </div>
            )}
            <a className="chapter-link" href="#architecture">Explore the architecture <ArrowDown aria-hidden="true" size={15} /></a>
          </section>

          <section className="architecture content-width" id="architecture" aria-labelledby="architecture-title" data-motion-scene>
            <div className="section-heading"><h2 id="architecture-title">The remediation loop</h2></div>
            <ol className="stage-list">
              {stages.map((stage, index) => (
                <li key={stage.title}>
                  <span className="data-label stage-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{stage.title}</h3>
                  <p>{stage.description}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>

      <footer className="site-footer content-width">
        <a className="wordmark" href="#overview"><Activity aria-hidden="true" size={19} /> IncidentZero</a>
        <button className="button button-quiet" onClick={() => help.current?.showModal()}><CircleHelp aria-hidden="true" size={17} /> Help</button>
      </footer>

      <dialog ref={help} aria-labelledby="help-title">
        <div className="dialog-title">
          <h2 id="help-title">Using IncidentZero</h2>
          <form method="dialog"><button className="icon-button" aria-label="Close help"><X aria-hidden="true" size={20} /></button></form>
        </div>
        <p>Open Incidents to inspect a crash, its status, and any patch or test produced by the pipeline.</p>
        <p>Use Simulate outage to submit an example incident to the connected backend.</p>
      </dialog>
    </>
  );
}
