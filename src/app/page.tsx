"use client";

import { Dispatch, SetStateAction, useState } from "react";
import ReactMarkdown from "react-markdown";

type AnalyzeResponse = {
  creativeNudge?: string;
  agentId?: string;
  agentName?: string;
  status?: string;
  threadId?: string;
  hasFinalOutput?: boolean;
  error?: string;
};

type NudgeSetter = Dispatch<SetStateAction<string>>;

type ModelRunConfig = {
  endpoint: string;
  input: string;
  setAnalyzing: Dispatch<SetStateAction<boolean>>;
  setError: NudgeSetter;
  setNudge: NudgeSetter;
  validate?: (payload: AnalyzeResponse) => void;
};

function isComplete(status?: string) {
  return ["completed", "complete", "succeeded", "success", "done"].includes((status || "").toLowerCase());
}

function wait(ms: number) {
  return new Promise((resolve) => { window.setTimeout(resolve, ms); });
}

function buildFallbackNudge(input: string) {
  return [
    "What's working:",
    "Strong contrast gives the idea a clear point of view.",
    "The strategic input has a simple before-and-after tension that can become memorable quickly.",
    "",
    "What could be stronger:",
    "The thought needs a more specific customer benefit so it does not stay at the level of a claim.",
    "Make the payoff feel practical, immediate, and tied to the experience people actually want.",
    "",
    "Suggested direction:",
    `Focus the idea around what the audience gets when the strategy works: ${input}`,
    "",
    "Optional sharper line:",
    "Skip the friction. Make the benefit feel effortless.",
  ].join("\n");
}

export default function Home() {
  const [strategicInput, setStrategicInput] = useState("");
  const [creativeNudge, setCreativeNudge] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isOpen, setIsOpen] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  const [bvcsInput, setBvcsInput] = useState("");
  const [bvcsNudge, setBvcsNudge] = useState("");
  const [isBvcsAnalyzing, setIsBvcsAnalyzing] = useState(false);
  const [bvcsError, setBvcsError] = useState("");
  const [isBvcsOpen, setIsBvcsOpen] = useState(false);

  const [bpafInput, setBpafInput] = useState("");
  const [bpafNudge, setBpafNudge] = useState("");
  const [isBpafAnalyzing, setIsBpafAnalyzing] = useState(false);
  const [bpafError, setBpafError] = useState("");
  const [isBpafOpen, setIsBpafOpen] = useState(false);

  const [bcaInput, setBcaInput] = useState("");
  const [bcaNudge, setBcaNudge] = useState("");
  const [isBcaAnalyzing, setIsBcaAnalyzing] = useState(false);
  const [bcaError, setBcaError] = useState("");
  const [isBcaOpen, setIsBcaOpen] = useState(false);

  const [badInput, setBadInput] = useState("");
  const [badNudge, setBadNudge] = useState("");
  const [isBadAnalyzing, setIsBadAnalyzing] = useState(false);
  const [badError, setBadError] = useState("");
  const [isBadOpen, setIsBadOpen] = useState(false);

  const [honInput, setHonInput] = useState("");
  const [honNudge, setHonNudge] = useState("");
  const [isHonAnalyzing, setIsHonAnalyzing] = useState(false);
  const [honError, setHonError] = useState("");
  const [isHonOpen, setIsHonOpen] = useState(false);

  const [smpInput, setSmpInput] = useState("");
  const [smpNudge, setSmpNudge] = useState("");
  const [isSmpAnalyzing, setIsSmpAnalyzing] = useState(false);
  const [smpError, setSmpError] = useState("");
  const [isSmpOpen, setIsSmpOpen] = useState(false);

  const [rtbInput, setRtbInput] = useState("");
  const [rtbNudge, setRtbNudge] = useState("");
  const [isRtbAnalyzing, setIsRtbAnalyzing] = useState(false);
  const [rtbError, setRtbError] = useState("");
  const [isRtbOpen, setIsRtbOpen] = useState(false);

  const [dnInput, setDnInput] = useState("");
  const [dnNudge, setDnNudge] = useState("");
  const [isDnAnalyzing, setIsDnAnalyzing] = useState(false);
  const [dnError, setDnError] = useState("");
  const [isDnOpen, setIsDnOpen] = useState(false);

  const [ocnInput, setOcnInput] = useState("");
  const [ocnNudge, setOcnNudge] = useState("");
  const [isOcnAnalyzing, setIsOcnAnalyzing] = useState(false);
  const [ocnError, setOcnError] = useState("");
  const [isOcnOpen, setIsOcnOpen] = useState(false);

  const [tbicInput, setTbicInput] = useState("");
  const [tbicNudge, setTbicNudge] = useState("");
  const [isTbicAnalyzing, setIsTbicAnalyzing] = useState(false);
  const [tbicError, setTbicError] = useState("");
  const [isTbicOpen, setIsTbicOpen] = useState(false);

  const [tsInput, setTsInput] = useState("");
  const [tsNudge, setTsNudge] = useState("");
  const [isTsAnalyzing, setIsTsAnalyzing] = useState(false);
  const [tsError, setTsError] = useState("");
  const [isTsOpen, setIsTsOpen] = useState(false);

  async function pollForModelResult(threadId: string, setNudge: NudgeSetter) {
    let latestPayload: AnalyzeResponse | undefined;
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await wait(3000);
      const response = await fetch(`/api/result?threadId=${encodeURIComponent(threadId)}`);
      const payload = (await response.json()) as AnalyzeResponse;
      latestPayload = payload;
      if (!response.ok) throw new Error(payload.error || "Unable to fetch response.");
      setNudge(payload.creativeNudge || "Still generating…");
      if (isComplete(payload.status) || payload.hasFinalOutput) return payload;
    }
    setNudge("Still generating. Try submitting again in a moment.");
    return latestPayload;
  }

  async function pollForResult(threadId: string) {
    return pollForModelResult(threadId, setCreativeNudge);
  }

  async function runModel({ endpoint, input, setAnalyzing, setError, setNudge, validate }: ModelRunConfig) {
    const strategicInput = input.trim();
    setAnalyzing(true);
    setError("");
    setNudge("");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      validate?.(payload);
      if (payload.creativeNudge) {
        setNudge(payload.creativeNudge);
      } else if (payload.threadId && !isComplete(payload.status)) {
        const result = await pollForModelResult(payload.threadId, setNudge);
        setNudge(result?.creativeNudge || "Still generating. Try submitting again in a moment.");
      } else {
        setNudge("No response returned.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError("");
    setCreativeNudge("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setCreativeNudge(payload.creativeNudge || "No response returned.");
      if (payload.threadId && !isComplete(payload.status)) {
        const result = await pollForResult(payload.threadId);
        if (isComplete(result?.status) && !result?.hasFinalOutput) {
          setCreativeNudge(buildFallbackNudge(strategicInput.trim()));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleBvcsAnalyze() {
    setIsBvcsAnalyzing(true);
    setBvcsError("");
    setBvcsNudge("");
    try {
      const response = await fetch("/api/analyze-bvcs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: bvcsInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      if (payload.creativeNudge) {
        setBvcsNudge(payload.creativeNudge);
      } else if (payload.threadId && !isComplete(payload.status)) {
        const result = await pollForResult(payload.threadId);
        setBvcsNudge(result?.creativeNudge || "Still generating. Try submitting again in a moment.");
      } else {
        setBvcsNudge("No response returned.");
      }
    } catch (err) {
      setBvcsError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsBvcsAnalyzing(false);
    }
  }

  async function handleBpafAnalyze() {
    setIsBpafAnalyzing(true);
    setBpafError("");
    setBpafNudge("");
    try {
      const response = await fetch("/api/analyze-bpaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: bpafInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setBpafNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setBpafError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsBpafAnalyzing(false);
    }
  }

  async function handleTsAnalyze() {
    setIsTsAnalyzing(true);
    setTsError("");
    setTsNudge("");
    try {
      const response = await fetch("/api/analyze-ts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: tsInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      if (payload.agentId && payload.agentId !== "US-CORE-16") {
        throw new Error(`Received ${payload.agentName || payload.agentId} instead of Thought-Starters, Not Content Generation.`);
      }
      setTsNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setTsError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsTsAnalyzing(false);
    }
  }

  async function handleTbicAnalyze() {
    setIsTbicAnalyzing(true);
    setTbicError("");
    setTbicNudge("");
    try {
      const response = await fetch("/api/analyze-tbic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: tbicInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      if (payload.agentId && payload.agentId !== "US-CS-05") {
        throw new Error(`Received ${payload.agentName || payload.agentId} instead of Tension-Based Insight Conversion.`);
      }
      setTbicNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setTbicError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsTbicAnalyzing(false);
    }
  }

  async function handleOcnAnalyze() {
    setIsOcnAnalyzing(true);
    setOcnError("");
    setOcnNudge("");
    try {
      const response = await fetch("/api/analyze-ocn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: ocnInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setOcnNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setOcnError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsOcnAnalyzing(false);
    }
  }

  async function handleDnAnalyze() {
    setIsDnAnalyzing(true);
    setDnError("");
    setDnNudge("");
    try {
      const response = await fetch("/api/analyze-dn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: dnInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setDnNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setDnError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsDnAnalyzing(false);
    }
  }

  async function handleRtbAnalyze() {
    setIsRtbAnalyzing(true);
    setRtbError("");
    setRtbNudge("");
    try {
      const response = await fetch("/api/analyze-rtb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: rtbInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setRtbNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setRtbError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsRtbAnalyzing(false);
    }
  }

  async function handleSmpAnalyze() {
    setIsSmpAnalyzing(true);
    setSmpError("");
    setSmpNudge("");
    try {
      const response = await fetch("/api/analyze-smp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: smpInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setSmpNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setSmpError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsSmpAnalyzing(false);
    }
  }

  async function handleHonAnalyze() {
    setIsHonAnalyzing(true);
    setHonError("");
    setHonNudge("");
    try {
      const response = await fetch("/api/analyze-hon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: honInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      if (payload.agentId && payload.agentId !== "US-CORE-11") {
        throw new Error(`Received ${payload.agentName || payload.agentId} instead of Human Override.`);
      }
      setHonNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setHonError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsHonAnalyzing(false);
    }
  }

  async function handleBadAnalyze() {
    setIsBadAnalyzing(true);
    setBadError("");
    setBadNudge("");
    try {
      const response = await fetch("/api/analyze-bad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: badInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setBadNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setBadError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsBadAnalyzing(false);
    }
  }

  async function handleBcaAnalyze() {
    setIsBcaAnalyzing(true);
    setBcaError("");
    setBcaNudge("");
    try {
      const response = await fetch("/api/analyze-bca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategicInput: bcaInput }),
      });
      const payload = (await response.json()) as AnalyzeResponse;
      if (!response.ok) throw new Error(payload.error || "Unable to analyze input.");
      setBcaNudge(payload.creativeNudge || "No response returned.");
    } catch (err) {
      setBcaError(err instanceof Error ? err.message : "Unable to analyze input.");
    } finally {
      setIsBcaAnalyzing(false);
    }
  }

  const allModelInputs = [
    honInput,
    dnInput,
    tsInput,
    bvcsInput,
    rtbInput,
    strategicInput,
    smpInput,
    tbicInput,
    ocnInput,
    bpafInput,
    badInput,
    bcaInput,
  ];
  const sharedInput = allModelInputs.find((input) => input.trim())?.trim() || "";

  async function handleGenerateAllNudges() {
    if (!sharedInput || isGeneratingAll) return;

    setIsGeneratingAll(true);
    setIsHonOpen(true);
    setIsDnOpen(true);
    setIsTsOpen(true);
    setIsBvcsOpen(true);
    setIsRtbOpen(true);
    setIsOpen(true);
    setIsSmpOpen(true);
    setIsTbicOpen(true);
    setIsOcnOpen(true);
    setIsBpafOpen(true);
    setIsBadOpen(true);
    setIsBcaOpen(true);

    try {
      const modelRuns: ModelRunConfig[] = [
        {
          endpoint: "/api/analyze-hon",
          input: honInput.trim() || sharedInput,
          setAnalyzing: setIsHonAnalyzing,
          setError: setHonError,
          setNudge: setHonNudge,
          validate: (payload) => {
            if (payload.agentId && payload.agentId !== "US-CORE-11") {
              throw new Error(`Received ${payload.agentName || payload.agentId} instead of Human Override.`);
            }
          },
        },
        { endpoint: "/api/analyze-dn", input: dnInput.trim() || sharedInput, setAnalyzing: setIsDnAnalyzing, setError: setDnError, setNudge: setDnNudge },
        {
          endpoint: "/api/analyze-ts",
          input: tsInput.trim() || sharedInput,
          setAnalyzing: setIsTsAnalyzing,
          setError: setTsError,
          setNudge: setTsNudge,
          validate: (payload) => {
            if (payload.agentId && payload.agentId !== "US-CORE-16") {
              throw new Error(`Received ${payload.agentName || payload.agentId} instead of Thought-Starters, Not Content Generation.`);
            }
          },
        },
        { endpoint: "/api/analyze-bvcs", input: bvcsInput.trim() || sharedInput, setAnalyzing: setIsBvcsAnalyzing, setError: setBvcsError, setNudge: setBvcsNudge },
        { endpoint: "/api/analyze-rtb", input: rtbInput.trim() || sharedInput, setAnalyzing: setIsRtbAnalyzing, setError: setRtbError, setNudge: setRtbNudge },
        { endpoint: "/api/analyze", input: strategicInput.trim() || sharedInput, setAnalyzing: setIsAnalyzing, setError, setNudge: setCreativeNudge },
        { endpoint: "/api/analyze-smp", input: smpInput.trim() || sharedInput, setAnalyzing: setIsSmpAnalyzing, setError: setSmpError, setNudge: setSmpNudge },
        {
          endpoint: "/api/analyze-tbic",
          input: tbicInput.trim() || sharedInput,
          setAnalyzing: setIsTbicAnalyzing,
          setError: setTbicError,
          setNudge: setTbicNudge,
          validate: (payload) => {
            if (payload.agentId && payload.agentId !== "US-CS-05") {
              throw new Error(`Received ${payload.agentName || payload.agentId} instead of Tension-Based Insight Conversion.`);
            }
          },
        },
        { endpoint: "/api/analyze-ocn", input: ocnInput.trim() || sharedInput, setAnalyzing: setIsOcnAnalyzing, setError: setOcnError, setNudge: setOcnNudge },
        { endpoint: "/api/analyze-bpaf", input: bpafInput.trim() || sharedInput, setAnalyzing: setIsBpafAnalyzing, setError: setBpafError, setNudge: setBpafNudge },
        { endpoint: "/api/analyze-bad", input: badInput.trim() || sharedInput, setAnalyzing: setIsBadAnalyzing, setError: setBadError, setNudge: setBadNudge },
        { endpoint: "/api/analyze-bca", input: bcaInput.trim() || sharedInput, setAnalyzing: setIsBcaAnalyzing, setError: setBcaError, setNudge: setBcaNudge },
      ];

      for (const modelRun of modelRuns) {
        await runModel(modelRun);
      }
    } finally {
      setIsGeneratingAll(false);
    }
  }

  const hasOutput = !isAnalyzing && !error && creativeNudge;
  const hasBvcsOutput = !isBvcsAnalyzing && !bvcsError && bvcsNudge;
  const hasBpafOutput = !isBpafAnalyzing && !bpafError && bpafNudge;
  const hasBcaOutput = !isBcaAnalyzing && !bcaError && bcaNudge;
  const hasBadOutput = !isBadAnalyzing && !badError && badNudge;
  const hasHonOutput = !isHonAnalyzing && !honError && honNudge;
  const hasSmpOutput = !isSmpAnalyzing && !smpError && smpNudge;
  const hasRtbOutput = !isRtbAnalyzing && !rtbError && rtbNudge;
  const hasDnOutput = !isDnAnalyzing && !dnError && dnNudge;
  const hasOcnOutput = !isOcnAnalyzing && !ocnError && ocnNudge;
  const hasTbicOutput = !isTbicAnalyzing && !tbicError && tbicNudge;
  const hasTsOutput = !isTsAnalyzing && !tsError && tsNudge;

  return (
    <div className="shell" data-theme={theme}>

      <nav className="topnav" aria-label="Site navigation">
        <div className="topnav-inner">
          <div className="nav-brand">
            <div className="nav-logo-box" aria-hidden="true"><span>X</span></div>
            <span className="nav-brand-name"><em>X</em>finity Creative Companion</span>
          </div>
          <div className="nav-right">
            <label className="theme-toggle">
              <span className="toggle-text">{theme === "dark" ? "Dark" : "Light"}</span>
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                aria-label="Toggle dark mode"
              />
              <span className="switch" aria-hidden="true" />
            </label>
          </div>
        </div>
      </nav>

      <main className="page-wrap">

        <section className="header-card header-card--hero" aria-labelledby="page-title">
          <h1 className="header-title--hero" id="page-title">Creative Collaborator Agent Ecosystem</h1>
          <p className="header-sub--hero">
            Riff on your vision and deliver on-brand, immersive, impactful and innovative creative output.
          </p>
        </section>

        <article className={`agent-card${isHonOpen ? " agent-card--open" : ""}`} aria-label="Human Override Agent">

          <button className="agent-card-header" onClick={() => setIsHonOpen(!isHonOpen)} aria-expanded={isHonOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CORE-11</div>
              <h2 className="card-title">Human Override</h2>
              <p className="agent-intro">
                <strong>As a</strong> marketer or creative strategist,<br />
                <strong>I want</strong> every nudge to be suggestive (not prescriptive) so I can accept, reject, or ignore recommendations,<br />
                <strong>So that</strong> I maintain creative control and the agent never blocks my forward progress.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Critical for user adoption</span>
                <span className="agent-tag">□ UX/product design</span>
                <span className="agent-tag agent-tag--badge">A4</span>
                <span className="agent-tag agent-tag--badge">A5</span>
              </div>
            </div>
            <div className={`agent-chevron${isHonOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isHonOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="hon-input">Input</label>
                <textarea id="hon-input" rows={4} value={honInput} onChange={(e) => setHonInput(e.target.value)} placeholder="Enter a recommendation, nudge, or strategic direction to check for human creative control…" />
                <button className="submit-btn" type="button" onClick={handleHonAnalyze} disabled={isHonAnalyzing || !honInput.trim()}>
                  {isHonAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasHonOutput ? " active" : ""}`} aria-hidden="true" /><span>{isHonAnalyzing ? "Generating" : hasHonOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isHonAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Checking for human override space…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isHonAnalyzing && honError && <p className="output-error" role="alert">{honError}</p>}
                {hasHonOutput && <div className="output-text output-markdown"><ReactMarkdown>{honNudge}</ReactMarkdown></div>}
                {!isHonAnalyzing && !honError && !honNudge && <p className="output-placeholder">Your human override nudge will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isDnOpen ? " agent-card--open" : ""}`} aria-label="Anti-Slop Guardrail Agent">

          <button className="agent-card-header" onClick={() => setIsDnOpen(!isDnOpen)} aria-expanded={isDnOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CORE-12</div>
              <h2 className="card-title">Distinctiveness Nudge (Anti-Slop)</h2>
              <p className="agent-intro">
                <strong>As a</strong> marketing or creative leader,<br />
                <strong>I want</strong> CCA to detect and prevent generic, category-parity creative by nudging toward distinctiveness,<br />
                <strong>So that</strong> we never scale average work and always push toward brand-distinctive messaging.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Prevents scaling mediocre work</span>
                <span className="agent-tag">&#60;&#62; Palmyra pattern detection</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isDnOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isDnOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="dn-input">Input</label>
                <textarea id="dn-input" rows={4} value={dnInput} onChange={(e) => setDnInput(e.target.value)} placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…" />
                <button className="submit-btn" type="button" onClick={handleDnAnalyze} disabled={isDnAnalyzing || !dnInput.trim()}>
                  {isDnAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasDnOutput ? " active" : ""}`} aria-hidden="true" /><span>{isDnAnalyzing ? "Generating" : hasDnOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isDnAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Generating your thought starter…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isDnAnalyzing && dnError && <p className="output-error" role="alert">{dnError}</p>}
                {hasDnOutput && <div className="output-text output-markdown"><ReactMarkdown>{dnNudge}</ReactMarkdown></div>}
                {!isDnAnalyzing && !dnError && !dnNudge && <p className="output-placeholder">Your thought-starter response will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isTsOpen ? " agent-card--open" : ""}`} aria-label="Thought-Starters Agent">

          <button className="agent-card-header" onClick={() => setIsTsOpen(!isTsOpen)} aria-expanded={isTsOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CORE-16</div>
              <h2 className="card-title">Thought-Starters, Not Content Generation</h2>
              <p className="agent-intro">
                <strong>As a</strong> marketer or creative strategist,<br />
                <strong>I want</strong> CCA to offer ingredients, provocations, and sequential guidance (questions → suggestions) instead of writing content for me,<br />
                <strong>So that</strong> I maintain creative ownership while getting helpful stimulus to spark my thinking.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Core principle: augment, don&apos;t automate</span>
                <span className="agent-tag">‹› Prompt engineering only</span>
                <span className="agent-tag agent-tag--badge">A1</span>
              </div>
            </div>
            <div className={`agent-chevron${isTsOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isTsOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="ts-input-ts">Input</label>
                <textarea id="ts-input-ts" rows={4} value={tsInput} onChange={(e) => setTsInput(e.target.value)} placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…" />
                <button className="submit-btn" type="button" onClick={handleTsAnalyze} disabled={isTsAnalyzing || !tsInput.trim()}>
                  {isTsAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasTsOutput ? " active" : ""}`} aria-hidden="true" /><span>{isTsAnalyzing ? "Generating" : hasTsOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isTsAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Generating your thought starter…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isTsAnalyzing && tsError && <p className="output-error" role="alert">{tsError}</p>}
                {hasTsOutput && <div className="output-text output-markdown"><ReactMarkdown>{tsNudge}</ReactMarkdown></div>}
                {!isTsAnalyzing && !tsError && !tsNudge && <p className="output-placeholder">Your thought-starter response will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isBvcsOpen ? " agent-card--open" : ""}`} aria-label="Business vs Communications Objective Separation Agent">

          <button className="agent-card-header" onClick={() => setIsBvcsOpen(!isBvcsOpen)} aria-expanded={isBvcsOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CS-01</div>
              <h2 className="card-title">Business vs Communications Objective Separation</h2>
              <p className="agent-intro">
                <strong>As a</strong> creative strategist,<br />
                <strong>I want</strong> CCA to help me separate business objectives (sales, retention) from communications objectives (change perception, drive consideration),<br />
                <strong>So that</strong> I create strategic clarity and ensure the message strategy aligns with but doesn&apos;t conflate business goals.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">⊕ Strategic clarity</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isBvcsOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isBvcsOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="bvcs-input">Input</label>
                <textarea id="bvcs-input" rows={4} value={bvcsInput} onChange={(e) => setBvcsInput(e.target.value)} placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…" />
                <button className="submit-btn" type="button" onClick={handleBvcsAnalyze} disabled={isBvcsAnalyzing || !bvcsInput.trim()}>
                  {isBvcsAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasBvcsOutput ? " active" : ""}`} aria-hidden="true" /><span>{isBvcsAnalyzing ? "Generating" : hasBvcsOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isBvcsAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Generating your thought starter…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isBvcsAnalyzing && bvcsError && <p className="output-error" role="alert">{bvcsError}</p>}
                {hasBvcsOutput && <div className="output-text output-markdown"><ReactMarkdown>{bvcsNudge}</ReactMarkdown></div>}
                {!isBvcsAnalyzing && !bvcsError && !bvcsNudge && <p className="output-placeholder">Your thought-starter response will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isRtbOpen ? " agent-card--open" : ""}`} aria-label="RTB Alignment Auditor Agent">

          <button className="agent-card-header" onClick={() => setIsRtbOpen(!isRtbOpen)} aria-expanded={isRtbOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CS-02</div>
              <h2 className="card-title">RTB Alignment Auditor</h2>
              <p className="agent-intro">
                <strong>As a</strong> creative strategist,<br />
                <strong>I want</strong> CCA to verify that my reasons to believe genuinely support my core proposition,<br />
                <strong>So that</strong> my claims are credible, provable, and aligned with the creative message.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Credibility and proof alignment</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isRtbOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isRtbOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="rtb-input">Input</label>
                <textarea id="rtb-input" rows={4} value={rtbInput} onChange={(e) => setRtbInput(e.target.value)} placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…" />
                <button className="submit-btn" type="button" onClick={handleRtbAnalyze} disabled={isRtbAnalyzing || !rtbInput.trim()}>
                  {isRtbAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasRtbOutput ? " active" : ""}`} aria-hidden="true" /><span>{isRtbAnalyzing ? "Generating" : hasRtbOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isRtbAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Generating your thought starter…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isRtbAnalyzing && rtbError && <p className="output-error" role="alert">{rtbError}</p>}
                {hasRtbOutput && <div className="output-text output-markdown"><ReactMarkdown>{rtbNudge}</ReactMarkdown></div>}
                {!isRtbAnalyzing && !rtbError && !rtbNudge && <p className="output-placeholder">Your thought-starter response will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isOpen ? " agent-card--open" : ""}`} aria-label="Source of Growth Identification Agent">

          <button className="agent-card-header" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CS-03</div>
              <h2 className="card-title">Source of Growth Identification Agent</h2>
              <p className="agent-intro">
                <strong>As a</strong> creative strategist,<br />
                <strong>I want</strong> CCA to help me identify where growth is actually coming from — new customers, existing upgrades, or win-backs,<br />
                <strong>So that</strong> my creative strategy targets the right audience with the right message and doesn&apos;t waste effort on the wrong source.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">⊕ Growth targeting</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isOpen && (
            <div className="agent-expand">

              <div className="expand-section">
                <label className="field-label" htmlFor="ts-input">Input</label>
                <textarea
                  id="ts-input"
                  rows={4}
                  value={strategicInput}
                  onChange={(e) => setStrategicInput(e.target.value)}
                  placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…"
                />
                <button
                  className="submit-btn"
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !strategicInput.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Analyzing
                      <span className="dots" aria-hidden="true">
                        <span /><span /><span />
                      </span>
                    </>
                  ) : "Generate Nudge"}
                </button>
              </div>

              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state">
                    <span className={`state-dot${hasOutput ? " active" : ""}`} aria-hidden="true" />
                    <span>{isAnalyzing ? "Generating" : hasOutput ? "Ready" : "Waiting"}</span>
                  </div>
                </div>

                {isAnalyzing && (
                  <div className="loading-wrap" role="status">
                    <div className="loading-top">
                      <span className="spinner" aria-hidden="true" />
                      <span className="loading-msg">Generating your thought starter…</span>
                      <span className="dots" aria-hidden="true">
                        <span /><span /><span />
                      </span>
                    </div>
                    <div className="skels" aria-hidden="true">
                      <div className="skel" />
                      <div className="skel" />
                      <div className="skel" />
                      <div className="skel" />
                    </div>
                  </div>
                )}

                {!isAnalyzing && error && (
                  <p className="output-error" role="alert">{error}</p>
                )}

                {hasOutput && <div className="output-text output-markdown"><ReactMarkdown>{creativeNudge}</ReactMarkdown></div>}

                {!isAnalyzing && !error && !creativeNudge && (
                  <p className="output-placeholder">Your thought-starter response will appear here.</p>
                )}
              </div>

            </div>
          )}

        </article>

        <article className={`agent-card${isSmpOpen ? " agent-card--open" : ""}`} aria-label="Single-Minded Proposition Definition Agent">

          <button className="agent-card-header" onClick={() => setIsSmpOpen(!isSmpOpen)} aria-expanded={isSmpOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CS-04</div>
              <h2 className="card-title">Single-Minded Proposition Definition</h2>
              <p className="agent-intro">
                <strong>As a</strong> creative strategist,<br />
                <strong>I want</strong> CCA to stress-test my proposition for single-mindedness and flag when I&apos;m trying to say too much,<br />
                <strong>So that</strong> I ensure one clear, focused message that the creative team can execute with impact.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Prevents &ldquo;say too much&rdquo; syndrome</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isSmpOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isSmpOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="smp-input">Input</label>
                <textarea id="smp-input" rows={4} value={smpInput} onChange={(e) => setSmpInput(e.target.value)} placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…" />
                <button className="submit-btn" type="button" onClick={handleSmpAnalyze} disabled={isSmpAnalyzing || !smpInput.trim()}>
                  {isSmpAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasSmpOutput ? " active" : ""}`} aria-hidden="true" /><span>{isSmpAnalyzing ? "Generating" : hasSmpOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isSmpAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Generating your thought starter…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isSmpAnalyzing && smpError && <p className="output-error" role="alert">{smpError}</p>}
                {hasSmpOutput && <div className="output-text output-markdown"><ReactMarkdown>{smpNudge}</ReactMarkdown></div>}
                {!isSmpAnalyzing && !smpError && !smpNudge && <p className="output-placeholder">Your thought-starter response will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isTbicOpen ? " agent-card--open" : ""}`} aria-label="Tension-Based Insight Conversion Agent">

          <button className="agent-card-header" onClick={() => setIsTbicOpen(!isTbicOpen)} aria-expanded={isTbicOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-CS-05</div>
              <h2 className="card-title">Tension-Based Insight Conversion</h2>
              <p className="agent-intro">
                <strong>As a</strong> creative strategist,<br />
                <strong>I want</strong> CCA to help me convert a raw insight into a tension-based creative springboard,<br />
                <strong>So that</strong> my brief gives the creative team a human truth to push against, not just a category observation.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">⊕ Insight sharpening</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isTbicOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isTbicOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="tbic-input">Input</label>
                <textarea id="tbic-input" rows={4} value={tbicInput} onChange={(e) => setTbicInput(e.target.value)} placeholder="Enter the raw insight, customer truth, or strategic thought to sharpen into tension…" />
                <button className="submit-btn" type="button" onClick={handleTbicAnalyze} disabled={isTbicAnalyzing || !tbicInput.trim()}>
                  {isTbicAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasTbicOutput ? " active" : ""}`} aria-hidden="true" /><span>{isTbicAnalyzing ? "Generating" : hasTbicOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isTbicAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Sharpening the insight tension…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isTbicAnalyzing && tbicError && <p className="output-error" role="alert">{tbicError}</p>}
                {hasTbicOutput && <div className="output-text output-markdown"><ReactMarkdown>{tbicNudge}</ReactMarkdown></div>}
                {!isTbicAnalyzing && !tbicError && !tbicNudge && <p className="output-placeholder">Your tension-based nudge will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isOcnOpen ? " agent-card--open" : ""}`} aria-label="Objective Clarity Nudge Agent">

          <button className="agent-card-header" onClick={() => setIsOcnOpen(!isOcnOpen)} aria-expanded={isOcnOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-MKT-01</div>
              <h2 className="card-title">Objective Clarity Nudge</h2>
              <p className="agent-intro">
                <strong>As a</strong> marketer,<br />
                <strong>I want</strong> CCA to evaluate whether my campaign objective is clear, specific, and measurable,<br />
                <strong>So that</strong> my brief gives the creative team a precise target to hit.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Sharp, measurable objectives</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isOcnOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isOcnOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="ocn-input">Input</label>
                <textarea id="ocn-input" rows={4} value={ocnInput} onChange={(e) => setOcnInput(e.target.value)} placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…" />
                <button className="submit-btn" type="button" onClick={handleOcnAnalyze} disabled={isOcnAnalyzing || !ocnInput.trim()}>
                  {isOcnAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasOcnOutput ? " active" : ""}`} aria-hidden="true" /><span>{isOcnAnalyzing ? "Generating" : hasOcnOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isOcnAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Generating your thought starter…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isOcnAnalyzing && ocnError && <p className="output-error" role="alert">{ocnError}</p>}
                {hasOcnOutput && <div className="output-text output-markdown"><ReactMarkdown>{ocnNudge}</ReactMarkdown></div>}
                {!isOcnAnalyzing && !ocnError && !ocnNudge && <p className="output-placeholder">Your thought-starter response will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isBpafOpen ? " agent-card--open" : ""}`} aria-label="Business Problem vs Activity Framing Agent">

          <button className="agent-card-header" onClick={() => setIsBpafOpen(!isBpafOpen)} aria-expanded={isBpafOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-MKT-02</div>
              <h2 className="card-title">Business Problem vs Activity Framing</h2>
              <p className="agent-intro">
                <strong>As a</strong> marketer,<br />
                <strong>I want</strong> CCA to challenge activity-oriented framing in my brief (e.g., &quot;launch campaign&quot;),<br />
                <strong>So that</strong> I articulate the underlying business problem and connect my work to measurable business outcomes.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Shifts from outputs to outcomes</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isBpafOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isBpafOpen && (
            <div className="agent-expand">

              <div className="expand-section">
                <label className="field-label" htmlFor="bpaf-input">Input</label>
                <textarea
                  id="bpaf-input"
                  rows={4}
                  value={bpafInput}
                  onChange={(e) => setBpafInput(e.target.value)}
                  placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…"
                />
                <button
                  className="submit-btn"
                  type="button"
                  onClick={handleBpafAnalyze}
                  disabled={isBpafAnalyzing || !bpafInput.trim()}
                >
                  {isBpafAnalyzing ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Analyzing
                      <span className="dots" aria-hidden="true">
                        <span /><span /><span />
                      </span>
                    </>
                  ) : "Generate Nudge"}
                </button>
              </div>

              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state">
                    <span className={`state-dot${hasBpafOutput ? " active" : ""}`} aria-hidden="true" />
                    <span>{isBpafAnalyzing ? "Generating" : hasBpafOutput ? "Ready" : "Waiting"}</span>
                  </div>
                </div>

                {isBpafAnalyzing && (
                  <div className="loading-wrap" role="status">
                    <div className="loading-top">
                      <span className="spinner" aria-hidden="true" />
                      <span className="loading-msg">Generating your thought starter…</span>
                      <span className="dots" aria-hidden="true">
                        <span /><span /><span />
                      </span>
                    </div>
                    <div className="skels" aria-hidden="true">
                      <div className="skel" />
                      <div className="skel" />
                      <div className="skel" />
                      <div className="skel" />
                    </div>
                  </div>
                )}

                {!isBpafAnalyzing && bpafError && (
                  <p className="output-error" role="alert">{bpafError}</p>
                )}

                {hasBpafOutput && <div className="output-text output-markdown"><ReactMarkdown>{bpafNudge}</ReactMarkdown></div>}

                {!isBpafAnalyzing && !bpafError && !bpafNudge && (
                  <p className="output-placeholder">Your thought-starter response will appear here.</p>
                )}
              </div>

            </div>
          )}

        </article>

        <article className={`agent-card${isBadOpen ? " agent-card--open" : ""}`} aria-label="Behavioral Audience Definition Agent">

          <button className="agent-card-header" onClick={() => setIsBadOpen(!isBadOpen)} aria-expanded={isBadOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-MKT-04</div>
              <h2 className="card-title">Behavioral Audience Definition</h2>
              <p className="agent-intro">
                <strong>As a</strong> marketer,<br />
                <strong>I want</strong> CCA to challenge demographic-only audience definitions and push me toward behavioral characteristics,<br />
                <strong>So that</strong> my targeting is based on motivations and behaviors that drive more relevant, higher-performing creative.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">◎ Drives relevance and performance</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isBadOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isBadOpen && (
            <div className="agent-expand">
              <div className="expand-section">
                <label className="field-label" htmlFor="bad-input">Input</label>
                <textarea id="bad-input" rows={4} value={badInput} onChange={(e) => setBadInput(e.target.value)} placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…" />
                <button className="submit-btn" type="button" onClick={handleBadAnalyze} disabled={isBadAnalyzing || !badInput.trim()}>
                  {isBadAnalyzing ? (<><span className="spinner" aria-hidden="true" />Analyzing<span className="dots" aria-hidden="true"><span /><span /><span /></span></>) : "Generate Nudge"}
                </button>
              </div>
              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state"><span className={`state-dot${hasBadOutput ? " active" : ""}`} aria-hidden="true" /><span>{isBadAnalyzing ? "Generating" : hasBadOutput ? "Ready" : "Waiting"}</span></div>
                </div>
                {isBadAnalyzing && (<div className="loading-wrap" role="status"><div className="loading-top"><span className="spinner" aria-hidden="true" /><span className="loading-msg">Generating your thought starter…</span><span className="dots" aria-hidden="true"><span /><span /><span /></span></div><div className="skels" aria-hidden="true"><div className="skel" /><div className="skel" /><div className="skel" /><div className="skel" /></div></div>)}
                {!isBadAnalyzing && badError && <p className="output-error" role="alert">{badError}</p>}
                {hasBadOutput && <div className="output-text output-markdown"><ReactMarkdown>{badNudge}</ReactMarkdown></div>}
                {!isBadAnalyzing && !badError && !badNudge && <p className="output-placeholder">Your thought-starter response will appear here.</p>}
              </div>
            </div>
          )}

        </article>

        <article className={`agent-card${isBcaOpen ? " agent-card--open" : ""}`} aria-label="Required Behavior Change Articulation Agent">

          <button className="agent-card-header" onClick={() => setIsBcaOpen(!isBcaOpen)} aria-expanded={isBcaOpen}>
            <div className="agent-card-header-left">
              <div className="agent-number">US-MKT-05</div>
              <h2 className="card-title">Required Behavior Change Articulation</h2>
              <p className="agent-intro">
                <strong>As a</strong> marketer,<br />
                <strong>I want</strong> CCA to push me to define the specific, measurable customer behavior change my campaign must drive,<br />
                <strong>So that</strong> my brief is outcome-focused and actionable for the creative team, with clear success criteria.
              </p>
              <div className="agent-tags">
                <span className="agent-tag">⊕ Outcome-focused briefs</span>
                <span className="agent-tag agent-tag--badge">A3</span>
              </div>
            </div>
            <div className={`agent-chevron${isBcaOpen ? " agent-chevron--open" : ""}`} aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>

          {isBcaOpen && (
            <div className="agent-expand">

              <div className="expand-section">
                <label className="field-label" htmlFor="bca-input">Input</label>
                <textarea
                  id="bca-input"
                  rows={4}
                  value={bcaInput}
                  onChange={(e) => setBcaInput(e.target.value)}
                  placeholder="Enter your campaign idea, brief, tagline, or strategic direction to evaluate here…"
                />
                <button
                  className="submit-btn"
                  type="button"
                  onClick={handleBcaAnalyze}
                  disabled={isBcaAnalyzing || !bcaInput.trim()}
                >
                  {isBcaAnalyzing ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Analyzing
                      <span className="dots" aria-hidden="true">
                        <span /><span /><span />
                      </span>
                    </>
                  ) : "Generate Nudge"}
                </button>
              </div>

              <div className="expand-section expand-section--output" aria-live="polite">
                <div className="output-header">
                  <span className="field-label">Output</span>
                  <div className="output-state">
                    <span className={`state-dot${hasBcaOutput ? " active" : ""}`} aria-hidden="true" />
                    <span>{isBcaAnalyzing ? "Generating" : hasBcaOutput ? "Ready" : "Waiting"}</span>
                  </div>
                </div>

                {isBcaAnalyzing && (
                  <div className="loading-wrap" role="status">
                    <div className="loading-top">
                      <span className="spinner" aria-hidden="true" />
                      <span className="loading-msg">Generating your thought starter…</span>
                      <span className="dots" aria-hidden="true">
                        <span /><span /><span />
                      </span>
                    </div>
                    <div className="skels" aria-hidden="true">
                      <div className="skel" />
                      <div className="skel" />
                      <div className="skel" />
                      <div className="skel" />
                    </div>
                  </div>
                )}

                {!isBcaAnalyzing && bcaError && (
                  <p className="output-error" role="alert">{bcaError}</p>
                )}

                {hasBcaOutput && <div className="output-text output-markdown"><ReactMarkdown>{bcaNudge}</ReactMarkdown></div>}

                {!isBcaAnalyzing && !bcaError && !bcaNudge && (
                  <p className="output-placeholder">Your thought-starter response will appear here.</p>
                )}
              </div>

            </div>
          )}

        </article>

        <section className="generate-all-panel" aria-label="Generate all model nudges">
          <button
            className="submit-btn submit-btn--all"
            type="button"
            onClick={handleGenerateAllNudges}
            disabled={isGeneratingAll || !sharedInput}
          >
            {isGeneratingAll ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Running all models
                <span className="dots" aria-hidden="true">
                  <span /><span /><span />
                </span>
              </>
            ) : "Generate Nudge"}
          </button>
        </section>

      </main>
    </div>
  );
}
