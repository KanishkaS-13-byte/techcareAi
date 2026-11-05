import { useState } from 'react';
import { 
  Laptop, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  CheckSquare, 
  Square, 
  ShieldAlert, 
  FileText,
  RotateCcw,
  Zap
} from 'lucide-react';
import { TroubleshootingResult } from '../types';

interface ComputerTroubleshooterProps {
  onConvertToTicket: (title: string, description: string, category: string, steps: any[]) => void;
  onDraftEmail: (title: string, description: string, category: string) => void;
}

const COMMON_PRESETS = [
  { label: 'Computer running slowly', icon: '🐢', problem: 'My computer takes a long time to boot and freezes when opening common applications like web browsers and files.' },
  { label: 'Computer not starting', icon: '⚡', problem: 'My computer screen remains black, power lights blink or fans spin briefly and turn off, no startup logo appears.' },
  { label: 'Application not responding', icon: '⏳', problem: 'The application hangs with a spinning loading circle, shows (Not Responding) in the title bar, and cannot be closed normally.' },
  { label: 'Storage almost full', icon: '💾', problem: 'Windows/Mac is showing low disk space warning on the main drive, system is sluggish and cannot save new files or download updates.' },
  { label: 'Blue Screen / Sudden Crash', icon: '⚠️', problem: 'The computer suddenly crashed with a blue error screen (BSOD) or restarted while I was working.' },
  { label: 'Overheating & Loud Fan', icon: '🔥', problem: 'Laptop/desktop fan is running at maximum speed constantly, the bottom case feels very hot to touch.' },
];

export function ComputerTroubleshooter({ onConvertToTicket, onDraftEmail }: ComputerTroubleshooterProps) {
  const [problem, setProblem] = useState('');
  const [os, setOs] = useState('Windows 11 / 10');
  const [deviceType, setDeviceType] = useState('Laptop');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TroubleshootingResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handlePresetClick = (presetText: string) => {
    setProblem(presetText);
    setError(null);
  };

  const handleTroubleshoot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problem.trim()) {
      setError('Please describe what computer problem you are experiencing.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedSteps({});

    try {
      const response = await fetch('/api/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          category: 'Computer/OS',
          os,
          deviceType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach troubleshooting service.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to analyze issue right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-[#0f224a] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-3">
              <Laptop className="w-3.5 h-3.5 text-sky-300" />
              <span>Feature 1: Computer Diagnostic</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Computer Troubleshooting Assistant
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Describe your computer trouble in plain words or pick a common scenario. We provide simple, non-intimidating steps and warn you if physical hands-on support is required.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0">
            <Sparkles className="w-10 h-10 text-sky-300" />
          </div>
        </div>
      </div>

      {/* Main input card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <form onSubmit={handleTroubleshoot} className="space-y-6">
          
          {/* Quick presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Quick Pick Common Issues:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_PRESETS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(item.problem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Problem description */}
          <div>
            <label htmlFor="problemInput" className="block text-sm font-semibold text-slate-900 mb-1.5">
              Describe your computer problem: <span className="text-red-500">*</span>
            </label>
            <textarea
              id="problemInput"
              rows={4}
              value={problem}
              onChange={(e) => {
                setProblem(e.target.value);
                if (error) setError(null);
              }}
              placeholder="E.g., My computer is running very slowly today, takes minutes to open folders, and makes a grinding or spinning sound..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 outline-hidden transition text-slate-900 placeholder:text-slate-400 text-sm leading-relaxed"
            />
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Device & OS selections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Device Form Factor:
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-[#1e3a8a] outline-hidden"
              >
                <option value="Laptop">Laptop (Portable)</option>
                <option value="Desktop Tower">Desktop Tower / PC</option>
                <option value="All-in-One PC">All-in-One PC (e.g. iMac)</option>
                <option value="Workstation">Corporate Workstation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Operating System:
              </label>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 focus:border-[#1e3a8a] outline-hidden"
              >
                <option value="Windows 11 / 10">Windows 11 / 10</option>
                <option value="macOS (Apple Mac)">macOS (Apple Mac)</option>
                <option value="ChromeOS (Chromebook)">ChromeOS (Chromebook)</option>
                <option value="Linux / Other">Linux / Other</option>
              </select>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setProblem('');
                setResult(null);
                setError(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white font-semibold text-sm shadow-md shadow-blue-950/10 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Generate Simple Solutions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-300">
          
          {/* Result Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                  {result.category}
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                  result.recommendedPriority === 'Critical' ? 'bg-red-50 text-red-700 border border-red-200' :
                  result.recommendedPriority === 'High' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                  'bg-sky-50 text-sky-700 border border-sky-200'
                }`}>
                  Priority: {result.recommendedPriority || 'Medium'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                {result.issueTitle}
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {result.summary}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => onConvertToTicket(
                  result.issueTitle,
                  `${result.summary}\n\nOriginal problem: ${problem}`,
                  result.category,
                  result.troubleshootingSteps
                )}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0f224a] text-xs font-semibold border border-sky-200 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Save as Support Ticket</span>
              </button>
              <button
                onClick={() => onDraftEmail(
                  result.issueTitle,
                  `${problem}\n\nAI Diagnostic: ${result.summary}`,
                  result.category
                )}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <span>Draft Email to IT</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Safety Notice Warning if any */}
          {result.safetyNotice && (
            <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-3 text-amber-950">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-bold">Important Safety Notice: </span>
                {result.safetyNotice}
              </div>
            </div>
          )}

          {/* Possible Causes Card */}
          {result.possibleCauses && result.possibleCauses.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2.5">
                <HelpCircle className="w-4 h-4 text-sky-600" />
                Likely Underlying Causes
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                {result.possibleCauses.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-sky-500 font-bold">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step-by-Step Instructions with Interactive Checkbox */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1e3a8a]" />
                Step-by-Step Troubleshooting Instructions
              </h3>
              <span className="text-xs text-slate-500">
                Check off steps as you complete them
              </span>
            </div>

            <div className="space-y-3">
              {result.troubleshootingSteps.map((step, idx) => {
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
                        <p className={`text-xs mt-1.5 leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preventive tips */}
          {result.preventiveTips && result.preventiveTips.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Preventive Care Tips:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.preventiveTips.map((tip, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                    💡 {tip}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
