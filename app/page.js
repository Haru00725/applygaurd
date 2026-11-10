"use client";
import { useState, useRef, useEffect } from "react";

const LEVELS = {
  high: {
    label: "High Concern",
    badgeBg: "bg-risk text-white",
    dot: "bg-risk",
    borderColor: "border-risk",
    note: "Multiple strong warning signs typical of recruitment fraud.",
  },
  medium: {
    label: "Some Concern",
    badgeBg: "bg-warn text-ink",
    dot: "bg-warn",
    borderColor: "border-warn",
    note: "Suspicious or atypical patterns found. Verify independently before proceeding.",
  },
  low: {
    label: "Few Warning Signs Found",
    badgeBg: "bg-lime text-ink",
    dot: "bg-lime",
    borderColor: "border-ink",
    note: "Follows standard patterns. Still independently confirm with official career portals.",
  },
  unclear: {
    label: "Not Enough Information",
    badgeBg: "bg-zinc-500 text-white",
    dot: "bg-zinc-400",
    borderColor: "border-zinc-400",
    note: "Add more details, recruiter email, or a document screenshot for a complete check.",
  },
};

const TABS = [
  { id: "url", label: "Job Link", icon: "🔗" },
  { id: "text", label: "Message or Email", icon: "💬" },
  { id: "file", label: "Screenshot or PDF", icon: "📄" },
];

const EXAMPLES = [
  {
    type: "message",
    label: "⚠️ Fake Offer with Training Fee",
    title: "Upfront Fee Scam",
    text: `Congratulations! You have been shortlisted for the Remote Data Entry & Documentation Assistant role at Infosys BPM.
Monthly Stipend: Rs. 42,000/- (Laptop and WiFi allowance provided).
To reserve your onboarding slot and process your employee ID badge and courier kit, please transfer a refundable verification deposit of Rs. 2,450 to our HR Accounts desk via UPI: hrdesk.verification@upi.
Send the transaction screenshot immediately to HR Director Dr. Rajesh Sharma on WhatsApp (+91-9876543210) to finalize your offer letter.`,
  },
  {
    type: "message",
    label: "⚠️ Telegram / Daily Task Scam",
    title: "Task & Crypto Scam",
    text: `Hello! I am Sarah from Global Talent HR. Your profile was recommended for a flexible part-time work from home vacancy.
Job description: Rate 15 hotel reviews and like YouTube videos daily. Earn 2,500 to 5,000 INR per day paid directly via USDT/Crypto or bank transfer.
No previous interview or resume required. Daily payout guaranteed.
Join our official Telegram channel @global_task_work to receive your first trial task. Limited slots available!`,
  },
  {
    type: "url",
    label: "✅ Standard Career Portal",
    title: "Official Job Posting Link",
    url: "https://careers.google.com/jobs/results/",
  },
];

export default function Home() {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

  const topRef = useRef(null);
  const fileInputRef = useRef(null);

  function loadExample(ex) {
    setErr("");
    if (ex.type === "message") {
      setTab("text");
      setText(ex.text);
    } else if (ex.type === "url") {
      setTab("url");
      setUrl(ex.url);
    }
  }

  function handleFileDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (!/^(image\/|application\/pdf)/i.test(dropped.type)) {
        setErr("Please upload an image (PNG, JPG) or a PDF file.");
        return;
      }
      if (dropped.size > 6 * 1024 * 1024) {
        setErr("File is too large. Please upload files under 6 MB.");
        return;
      }
      setFile(dropped);
      setErr("");
    }
  }

  async function runAnalysis(e) {
    e.preventDefault();
    setErr("");

    // Input validation
    if (tab === "url") {
      let trimmed = url.trim();
      if (!trimmed) {
        setErr("Please paste or type a job posting or offer link to check.");
        return;
      }
      if (!/^https?:\/\//i.test(trimmed)) {
        trimmed = "https://" + trimmed;
        setUrl(trimmed);
      }
    } else if (tab === "text") {
      const trimmed = text.trim();
      if (!trimmed) {
        setErr("Please paste the message, WhatsApp chat, or email text you received.");
        return;
      }
      if (trimmed.length < 15) {
        setErr("Please paste a bit more text (at least 15 characters) so we can evaluate the offer.");
        return;
      }
    } else if (tab === "file") {
      if (!file && !text.trim()) {
        setErr("Please choose a screenshot or PDF document, or enter context notes below.");
        return;
      }
    }

    setBusy(true);
    const fd = new FormData();
    let normalizedUrl = url.trim();
    if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = "https://" + normalizedUrl;
    }

    if (tab === "url") fd.set("url", normalizedUrl);
    if (tab === "text") fd.set("text", text);
    if (tab === "file" && file) fd.set("file", file);
    if (tab === "file" && text) fd.set("text", text);

    try {
      const r = await fetch("/api/analyze", { method: "POST", body: fd });
      let j = null;
      const contentType = r.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          j = await r.json();
        } catch {
          // JSON parse failed
        }
      }

      if (!r.ok) {
        throw new Error(j?.error || `Analysis request failed with status ${r.status}.`);
      }

      if (!j || !j.report) {
        throw new Error("Invalid response format received from analysis service.");
      }

      setResult(j);
      setTimeout(() => {
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (x) {
      setErr(x.message || "An unexpected error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function copyReportSummary() {
    if (!result?.report) return;
    const r = result.report;
    const summaryText = `ApplyGuard Opportunity Safety Check
Status: ${LEVELS[r.level]?.label || r.level}
Summary: ${r.summary}

Warning Signs:
${r.redFlags.map((f, i) => `${i + 1}. ${f.title}: ${f.evidence}`).join("\n") || "None detected."}

Recommended Action:
${r.actions.map((a, i) => `• ${a}`).join("\n")}

Verify official offers at official company career portals.`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="flex-1 flex flex-col justify-between">
      <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 pb-20">
        {/* Navigation / Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-ink pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime font-black text-xl shadow-sm">
              A
            </span>
            <div>
              <span className="text-xl font-black tracking-tight text-ink block leading-tight">ApplyGuard</span>
              <span className="text-xs font-semibold text-zinc-600">Evidence-Based Job Scam Checker</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 bg-zinc-100 sm:bg-transparent px-3 py-1.5 rounded-full border sm:border-0 border-zinc-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>100% Private — Zero Data Stored</span>
          </div>
        </header>

        {/* Hero Section */}
        {!result && (
          <section className="pt-8 pb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-lime/30 px-3 py-1 text-xs font-bold text-ink mb-3">
              <span>🛡️ Protect Yourself Before Signing</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-[1.02] tracking-tight text-balance text-ink">
              Got an offer?<br />
              Check it before you pay, reply or sign.
            </h1>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-zinc-700 leading-relaxed">
              Paste a suspicious job link, recruiter WhatsApp message, offer letter or interview assignment.
              ApplyGuard detects upfront fees, impersonated domains, fake recruiters, and provides immediate verification steps.
            </p>
          </section>
        )}

        {/* Analysis Form Card */}
        <section className={`rounded-2xl border-2 border-ink bg-white shadow-[4px_4px_0px_0px_#111318] transition-all ${result ? "mt-4" : ""}`}>
          {/* Tab Selector */}
          <div role="tablist" aria-label="Input formats" className="flex border-b-2 border-ink bg-zinc-50 rounded-t-2xl overflow-hidden">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => {
                  setTab(t.id);
                  setErr("");
                }}
                className={`flex-1 py-3 px-2 text-center text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  tab === t.id
                    ? "bg-ink text-lime shadow-inner"
                    : "bg-white text-zinc-700 hover:bg-lime/20 hover:text-ink"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={runAnalysis} className="p-4 sm:p-6">
            {/* Tab 1: Job Link */}
            {tab === "url" && (
              <div>
                <label htmlFor="url-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                  Job or Offer Web Link
                </label>
                <div className="relative">
                  <input
                    id="url-input"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (err) setErr("");
                    }}
                    type="text"
                    inputMode="url"
                    placeholder="https://company.com/careers/software-intern"
                    aria-label="Job posting link"
                    className="w-full rounded-xl border-2 border-ink px-4 py-3.5 text-base bg-paper text-ink focus:ring-0 focus:outline-none placeholder:text-zinc-400 font-medium"
                  />
                  {url && (
                    <button
                      type="button"
                      onClick={() => setUrl("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 hover:text-ink bg-zinc-200 hover:bg-zinc-300 px-2 py-1 rounded cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Tip: Paste the career portal URL or invitation link sent by the recruiter.
                </p>
              </div>
            )}

            {/* Tab 2: Message or Email */}
            {tab === "text" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="text-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                    Recruiter Message, Email, or Offer Text
                  </label>
                  <span className="text-xs text-zinc-500 font-mono">
                    {text.length > 0 ? `${text.length} characters` : ""}
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    id="text-input"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (err) setErr("");
                    }}
                    rows={7}
                    aria-label="Recruiter message or email"
                    placeholder="Paste the WhatsApp chat, LinkedIn inmail, Telegram text, or offer letter contents here. Include sender contact information if available."
                    className="w-full rounded-xl border-2 border-ink p-4 text-base bg-paper text-ink focus:ring-0 focus:outline-none placeholder:text-zinc-400 font-medium leading-relaxed"
                  />
                  {text && (
                    <button
                      type="button"
                      onClick={() => setText("")}
                      className="absolute right-3 bottom-3 text-xs font-bold text-zinc-500 hover:text-ink bg-zinc-200 hover:bg-zinc-300 px-2.5 py-1 rounded cursor-pointer"
                    >
                      Clear text
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Screenshot or PDF */}
            {tab === "file" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                  Upload Offer Letter, Email Screenshot, or PDF
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                    dragOver
                      ? "border-ink bg-lime/20 scale-[0.99]"
                      : file
                      ? "border-ink bg-lime/10"
                      : "border-ink bg-paper hover:bg-zinc-100"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setFile(f);
                        if (err) setErr("");
                      }
                    }}
                  />
                  <div className="flex flex-col items-center">
                    <span className="text-3xl mb-2">{file ? "📄" : "📤"}</span>
                    <span className="font-bold text-base text-ink">
                      {file ? file.name : "Click to select or drag & drop file"}
                    </span>
                    <span className="text-xs text-zinc-600 mt-1">
                      {file
                        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace`
                        : "Supports screenshots (PNG, JPG) or offer documents (PDF) up to 6 MB"}
                    </span>
                  </div>
                </div>

                {file && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-xs text-risk font-bold hover:underline cursor-pointer"
                    >
                      ✕ Remove selected file
                    </button>
                  </div>
                )}

                <div className="mt-4">
                  <label htmlFor="context-input" className="block text-xs font-semibold text-zinc-600 mb-1">
                    Optional context (recruiter phone number, sender email, or platform):
                  </label>
                  <textarea
                    id="context-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={2}
                    placeholder="e.g. Received via WhatsApp from +91-98... claiming to be Amazon HR"
                    className="w-full rounded-xl border-2 border-ink px-4 py-2.5 text-sm bg-paper text-ink"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {err && (
              <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border-2 border-risk bg-rose-50 p-3.5 text-risk">
                <span className="text-lg">⚠️</span>
                <p className="text-sm font-semibold leading-snug flex-1">{err}</p>
                <button
                  type="button"
                  onClick={() => setErr("")}
                  className="text-xs font-black opacity-70 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={busy}
              className="relative mt-5 w-full overflow-hidden rounded-xl bg-lime px-6 py-4 text-base sm:text-lg font-black text-ink border-2 border-ink cursor-pointer hover:brightness-95 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_0px_#111318] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {busy ? "Analyzing Warning Signs & Evidence…" : "Check this opportunity"}
              {busy && <span className="scanline absolute left-0 right-0 h-[3px] bg-ink" />}
            </button>

            {/* Quick Test Samples */}
            <div className="mt-4 pt-4 border-t border-zinc-200">
              <span className="text-xs font-bold text-zinc-600 block mb-2">⚡ Or test with instant real-world samples:</span>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadExample(ex)}
                    className="text-xs font-semibold bg-zinc-100 hover:bg-lime/40 text-ink border border-ink/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-zinc-500">
              🔒 Completely private. Material is analyzed on the fly and discarded. Never submit bank passwords or OTPs.
            </p>
          </form>
        </section>

        {/* Anchor for Auto-Scroll */}
        <div ref={topRef} />

        {/* Result Report */}
        {result && (
          <Report
            data={result}
            onReset={() => {
              setResult(null);
              setUrl("");
              setText("");
              setFile(null);
              setErr("");
            }}
            onCopy={copyReportSummary}
            copied={copied}
          />
        )}

        {/* Educational Content: Scam Awareness Guide */}
        {!result && (
          <section className="mt-12 space-y-6">
            <div className="border-t-2 border-ink pt-8">
              <h2 className="text-2xl font-black tracking-tight text-ink">
                Common Signs of Recruitment Fraud
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Over 70% of job scams targeting freshers share these specific patterns:
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border-2 border-ink bg-white p-4 shadow-[2px_2px_0px_0px_#111318]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">💳</span>
                  <h3 className="font-extrabold text-base text-ink">Upfront Fee Demand</h3>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Legitimate employers never charge candidates for registration, uniform, training, or "refundable" laptop deposits.
                </p>
              </div>

              <div className="rounded-xl border-2 border-ink bg-white p-4 shadow-[2px_2px_0px_0px_#111318]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">📧</span>
                  <h3 className="font-extrabold text-base text-ink">Free Webmail Senders</h3>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Recruiters claiming to represent enterprise companies (Infosys, Google, Tata) using @gmail.com or @yahoo.com are almost always impersonators.
                </p>
              </div>

              <div className="rounded-xl border-2 border-ink bg-white p-4 shadow-[2px_2px_0px_0px_#111318]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">💬</span>
                  <h3 className="font-extrabold text-base text-ink">Chat-Only Interviews</h3>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Job interviews conducted exclusively through WhatsApp or Telegram text without verified corporate video/email calls are high-risk.
                </p>
              </div>

              <div className="rounded-xl border-2 border-ink bg-white p-4 shadow-[2px_2px_0px_0px_#111318]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">📈</span>
                  <h3 className="font-extrabold text-base text-ink">Too Good to Be True Pay</h3>
                </div>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  Promises of ₹3,000 to ₹10,000 daily for minimal effort (watching videos, reviewing products) are task-deposit traps.
                </p>
              </div>
            </div>

            {/* Helpline Section */}
            <div className="rounded-2xl border-2 border-ink bg-amber-50 p-5">
              <h3 className="font-extrabold text-base text-ink mb-1 flex items-center gap-2">
                <span>🚨</span>
                <span>Already sent money or shared sensitive documents?</span>
              </h3>
              <p className="text-xs text-zinc-800 leading-relaxed">
                If you have transferred funds:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-zinc-800 list-disc pl-5">
                <li><strong>India:</strong> Call national helpline <strong>1930</strong> immediately and register an incident at <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold">cybercrime.gov.in</a> to freeze bank transactions.</li>
                <li><strong>United States:</strong> File a report with the FTC at <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="underline font-bold">reportfraud.ftc.gov</a> and the FBI IC3 at <a href="https://ic3.gov" target="_blank" rel="noopener noreferrer" className="underline font-bold">ic3.gov</a>.</li>
                <li><strong>United Kingdom:</strong> Report to Action Fraud at <a href="https://actionfraud.police.uk" target="_blank" rel="noopener noreferrer" className="underline font-bold">actionfraud.police.uk</a> (0300 123 2040).</li>
                <li>Contact your bank immediately to reverse unauthorized UPI or credit card charges.</li>
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-ink bg-white py-8 px-4 text-center text-xs text-zinc-600">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-ink">ApplyGuard</span>
            <span>•</span>
            <span>Independent Job Safety Project</span>
          </div>
          <p className="text-zinc-500">
            ApplyGuard provides AI-assisted risk advisory, not legal verdicts. Always verify directly through verified company directories.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Report({ data, onReset, onCopy, copied }) {
  const r = data?.report || {};
  const L = LEVELS[r.level] || LEVELS.unclear;
  const redFlags = Array.isArray(r.redFlags) ? r.redFlags : [];
  const positives = Array.isArray(r.positives) ? r.positives : [];
  const company = r.company || { assessment: "", unverified: [] };
  const recruiter = r.recruiter || { assessment: "", unverified: [] };
  const actions = Array.isArray(r.actions) ? r.actions : [];
  const checklist = Array.isArray(r.checklist) ? r.checklist : [];

  return (
    <article className="mt-8 space-y-5 animate-in fade-in duration-300">
      {/* Primary Status Card */}
      <div className={`rounded-2xl border-2 ${L.borderColor} bg-ink p-6 text-paper shadow-[4px_4px_0px_0px_#111318]`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
            Opportunity Safety Assessment
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${L.badgeBg}`}>
            {L.label}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className={`h-4 w-4 rounded-full ${L.dot} shrink-0`} />
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{L.label}</h2>
        </div>
        <p className="mt-1 text-zinc-300 text-sm font-medium">{L.note}</p>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-zinc-100">{r.summary}</p>

        {data.checkedDomain && (
          <p className="mt-3 text-xs font-mono text-lime bg-ink/60 inline-block px-2.5 py-1 rounded border border-lime/30">
            {data.checkedDomain}
          </p>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 min-w-[140px] rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-ink hover:bg-zinc-100 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#111318]"
        >
          <span>{copied ? "✓" : "📋"}</span>
          <span>{copied ? "Copied to Clipboard!" : "Copy Report Summary"}</span>
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border-2 border-ink bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-ink hover:bg-zinc-100 transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#111318]"
        >
          <span>🖨️</span>
          <span>Print / PDF</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border-2 border-ink bg-lime px-4 py-2.5 text-xs sm:text-sm font-bold text-ink hover:brightness-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#111318]"
        >
          <span>🔄</span>
          <span>Check Another Offer</span>
        </button>
      </div>

      {/* Red Flags / Warning Signs */}
      {redFlags.length > 0 && (
        <section className="rounded-2xl border-2 border-risk bg-white p-5 shadow-[4px_4px_0px_0px_#D6453D]">
          <h3 className="mb-3 text-xl font-black tracking-tight text-risk flex items-center gap-2">
            <span>🚨</span>
            <span>Detected Warning Signs ({redFlags.length})</span>
          </h3>
          <ul className="space-y-3">
            {redFlags.map((f, i) => (
              <li key={i} className="rounded-xl border-2 border-ink bg-rose-50/50 p-4">
                <p className="font-extrabold text-base text-ink">{f.title}</p>
                <div className="mt-2 text-sm bg-white p-2.5 rounded-lg border border-zinc-200">
                  <span className="font-bold text-zinc-700">Evidence from content: </span>
                  <span className="font-mono text-xs bg-zinc-100 px-1 py-0.5 rounded text-rose-950 font-semibold break-words">
                    "{f.evidence}"
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
                  <span className="font-semibold text-ink">Why this is dangerous: </span>
                  {f.why}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Positive Observations */}
      {positives.length > 0 && (
        <section className="rounded-2xl border-2 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#111318]">
          <h3 className="mb-3 text-xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>✅</span>
            <span>Standard Legitimate Elements Found</span>
          </h3>
          <ul className="space-y-2.5">
            {positives.map((p, i) => (
              <li key={i} className="text-sm text-zinc-800 flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 font-bold shrink-0">✓</span>
                <div>
                  <span className="font-bold text-ink">{p.title}: </span>
                  <span>{p.evidence}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Company & Recruiter Verification Breakdown */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border-2 border-ink bg-white p-5 shadow-[3px_3px_0px_0px_#111318]">
          <h3 className="mb-2 text-lg font-black tracking-tight text-ink flex items-center gap-1.5">
            <span>🏢</span>
            <span>Company Verification</span>
          </h3>
          <div className="text-sm space-y-3">
            <p className="text-zinc-800 leading-relaxed">{company.assessment}</p>
            {Array.isArray(company.unverified) && company.unverified.length > 0 && (
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <p className="font-bold text-xs uppercase tracking-wider text-zinc-600 mb-1">
                  Could not confirm:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-700">
                  {company.unverified.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border-2 border-ink bg-white p-5 shadow-[3px_3px_0px_0px_#111318]">
          <h3 className="mb-2 text-lg font-black tracking-tight text-ink flex items-center gap-1.5">
            <span>👤</span>
            <span>Recruiter Identity</span>
          </h3>
          <div className="text-sm space-y-3">
            <p className="text-zinc-800 leading-relaxed">{recruiter.assessment}</p>
            {Array.isArray(recruiter.unverified) && recruiter.unverified.length > 0 && (
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <p className="font-bold text-xs uppercase tracking-wider text-zinc-600 mb-1">
                  Could not confirm:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs text-zinc-700">
                  {recruiter.unverified.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* What should you do? */}
      {actions.length > 0 && (
        <section className="rounded-2xl border-2 border-ink bg-lime p-5 shadow-[4px_4px_0px_0px_#111318]">
          <h3 className="mb-3 text-xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>🎯</span>
            <span>Recommended Action Plan</span>
          </h3>
          <ul className="space-y-2">
            {actions.map((act, i) => (
              <li key={i} className="text-sm font-semibold text-ink flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-ink/20">
                <span className="font-black text-ink">{i + 1}.</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Interactive Verification Checklist */}
      {checklist.length > 0 && (
        <section className="rounded-2xl border-2 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#111318]">
          <h3 className="mb-2 text-xl font-black tracking-tight text-ink flex items-center gap-2">
            <span>📋</span>
            <span>Self-Verification Checklist</span>
          </h3>
          <p className="text-xs text-zinc-600 mb-3">
            Tick each item off as you independently verify the opportunity:
          </p>
          <ul className="space-y-2">
            {checklist.map((check, i) => (
              <li key={i}>
                <label className="flex gap-3 items-start cursor-pointer hover:bg-zinc-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 accent-ink cursor-pointer rounded"
                  />
                  <span className="text-sm font-medium text-zinc-800 leading-snug">{check}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Advisory & Help Notice */}
      <div className="rounded-xl border border-zinc-300 bg-zinc-100 p-4 text-xs text-zinc-600 leading-relaxed">
        <p className="font-semibold text-zinc-700 mb-1">Important Advisory:</p>
        <p>{r.limits || "ApplyGuard provides AI-assisted risk advisory. Always independently confirm with official sources."}</p>
        <p className="mt-2">
          If you have transferred funds to an unverified party, immediately contact your bank to freeze transactions and report to your local law enforcement (National Cybercrime Portal at <strong>1930 / cybercrime.gov.in</strong> in India, or <strong>reportfraud.ftc.gov</strong> in the USA).
        </p>
      </div>

      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border-2 border-ink bg-lime px-6 py-3 font-black text-ink hover:brightness-95 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111318]"
        >
          Check Another Opportunity
        </button>
      </div>
    </article>
  );
}
