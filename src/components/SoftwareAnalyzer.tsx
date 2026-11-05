import { useState } from 'react';
import { 
  AppWindow, 
  Sparkles, 
  AlertCircle, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  XCircle, 
  Building2,
  RotateCcw,
  CheckSquare,
  Square
} from 'lucide-react';
import { SoftwareAnalysisResult } from '../types';

interface SoftwareAnalyzerProps {
  onConvertToTicket: (title: string, description: string, category: string, steps: any[]) => void;
  onDraftEmail: (title: string, description: string, category: string) => void;
}

const COMMON_SOFTWARE_EXAMPLES = [
  { app: 'Google Chrome', desc: 'Pages keep crashing with "Aw, Snap! Something went wrong" or tabs freeze when loading videos.' },
  { app: 'Microsoft Outlook / Mail', desc: 'Outlook will not open, hangs on "Loading Profile...", or asks for credentials repeatedly.' },
  { app: 'Zoom / Teams', desc: 'Microphone and webcam are not detected during a call, or audio cuts out every 30 seconds.' },
  { app: 'Microsoft Excel / Word', desc: 'File opened as Read-Only, crashed without auto-saving, or shows "Unlicensed Product" error.' },
  { app: 'App Installer (.exe / .pkg)', desc: 'Installer fails midway with error code 1603 or "Access is denied" despite running on admin account.' }
];

export function SoftwareAnalyzer({ onConvertToTicket, onDraftEmail }: SoftwareAnalyzerProps) {
  const [softwareName, setSoftwareName] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [os, setOs] = useState('Windows 11 / 10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SoftwareAnalysisResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleApplyExample = (app: string, desc: string) => {
    setSoftwareName(app);
    setIssueDescription(desc);
    setError(null);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!softwareName.trim() || !issueDescription.trim()) {
      setError('Please provide both the Software Name and what problem is happening.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedSteps({});

    try {
      const response = await fetch('/api/analyze-software', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          softwareName,
          errorCode,
          issueDescription,
          os,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze software issue.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to software analysis engine.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0f224a] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-3">
              <AppWindow className="w-3.5 h-3.5 text-sky-300" />
              <span>Feature 2: Software Analyzer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Software Problem Analyzer
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Identify crashes, installation failures, missing permissions, and error codes without confusing technical jargon.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0">
            <AppWindow className="w-10 h-10 text-sky-300" />
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <form onSubmit={handleAnalyze} className="space-y-6">
          
          {/* Quick examples */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Common Software Scenarios:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SOFTWARE_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyExample(ex.app, ex.desc)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200 hover:border-sky-300 transition cursor-pointer"
                >
                  {ex.app}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="softwareName" className="block text-sm font-semibold text-slate-900 mb-1.5">
                Software / Application Name: <span className="text-red-500">*</span>
              </label>
              <input
                id="softwareName"
                type="text"
                value={softwareName}
                onChange={(e) => {
                  setSoftwareName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="E.g., Google Chrome, Outlook, Zoom, Steam, QuickBooks"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 outline-hidden transition text-slate-900 text-sm"
              />
            </div>

            <div>
              <label htmlFor="errorCode" className="block text-sm font-semibold text-slate-900 mb-1.5">
                Error Code (Optional):
              </label>
              <input
                id="errorCode"
                type="text"
                value={errorCode}
                onChange={(e) => setErrorCode(e.target.value)}
                placeholder="E.g., 0x80070005, 404, Crash"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 outline-hidden transition text-slate-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="issueDesc" className="block text-sm font-semibold text-slate-900 mb-1.5">
              What happens when you use or open this software? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="issueDesc"
              rows={3}
              value={issueDescription}
              onChange={(e) => {
                setIssueDescription(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Describe symptoms: does it freeze on startup, give an alert dialog, run out of memory, or fail to save files?"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 outline-hidden transition text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed"
            />
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-600">Platform:</label>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 outline-hidden"
              >
                <option value="Windows 11 / 10">Windows</option>
                <option value="macOS">macOS</option>
                <option value="iOS / Android">Mobile</option>
                <option value="Linux">Linux</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSoftwareName('');
                  setErrorCode('');
                  setIssueDescription('');
                  setResult(null);
                  setError(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white font-semibold text-sm shadow-md shadow-blue-950/10 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Software...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Analyze Problem</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
                  {result.softwareName}
                </span>
                <span className="text-xs text-slate-500">
                  Verified Analysis
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {result.identifiedIssue}
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {result.explanation}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => onConvertToTicket(
                  `${result.softwareName}: ${result.identifiedIssue}`,
                  `Software: ${result.softwareName}\nError: ${errorCode || 'None specified'}\nDetails: ${issueDescription}\nAnalysis: ${result.explanation}`,
                  'Software',
                  result.steps
                )}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0f224a] text-xs font-semibold border border-sky-200 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Save as Ticket</span>
              </button>
              <button
                onClick={() => onDraftEmail(
                  `Software Issue: ${result.softwareName} (${result.identifiedIssue})`,
                  `Application: ${result.softwareName}\nError Code: ${errorCode || 'N/A'}\nDescription: ${issueDescription}`,
                  'Software'
                )}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <span>Draft Email to IT</span>
              </button>
            </div>
          </div>

          {/* Causes */}
          {result.causes && result.causes.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                Likely Reasons for This Software Behavior
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                {result.causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Troubleshooting Steps */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#1e3a8a]" />
              Recommended Resolution Steps
            </h3>
            <div className="space-y-3">
              {result.steps.map((step, idx) => {
                const isDone = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-4 rounded-xl border transition cursor-pointer ${
                      isDone
                        ? 'bg-slate-50/80 border-emerald-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                      >
                        {isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                            Step {idx + 1}
                          </span>
                          <h4 className={`text-sm font-semibold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {step.title}
                          </h4>
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What NOT to do Box */}
          {result.whatNotToDo && result.whatNotToDo.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50/80 border border-red-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 flex items-center gap-1.5 mb-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Critical: What NOT To Do (Avoid Common Scams & Traps)
              </h4>
              <ul className="space-y-1.5 text-xs text-red-950/90">
                {result.whatNotToDo.map((trap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-bold text-red-600">✕</span>
                    <span>{trap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to contact vendor */}
          {result.whenToContactVendor && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-950 leading-relaxed">
                <span className="font-bold">When to Escalate: </span>
                {result.whenToContactVendor}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
