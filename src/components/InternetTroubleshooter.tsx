import { useState } from 'react';
import { 
  Wifi, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  ShieldAlert, 
  Activity, 
  RefreshCw,
  Router,
  Radio,
  CheckSquare,
  Square
} from 'lucide-react';
import { NetworkDiagnosisResult } from '../types';

interface InternetTroubleshooterProps {
  onConvertToTicket: (title: string, description: string, category: string, steps: any[]) => void;
  onDraftEmail: (title: string, description: string, category: string) => void;
}

const COMMON_NETWORK_PRESETS = [
  { label: 'Wi-Fi not connecting', desc: 'Computer finds the Wi-Fi network name, but shows "Can\'t connect to this network" or prompts endlessly for password.' },
  { label: 'Internet disconnecting frequently', desc: 'Connection drops every 10–15 minutes, requiring me to disconnect and reconnect Wi-Fi manually.' },
  { label: 'Connected, No Internet Access', desc: 'Wi-Fi icon has an exclamation point or globe icon with "No Internet Access". Local network connects but websites won\'t open.' },
  { label: 'Very slow internet / high ping', desc: 'Streaming video constantly buffers, downloads are crawling at a fraction of paid ISP speed, high latency in calls.' },
  { label: 'Certain websites won\'t load (DNS error)', desc: 'Error: DNS_PROBE_FINISHED_NXDOMAIN or Server IP address could not be found for specific popular domains.' }
];

export function InternetTroubleshooter({ onConvertToTicket, onDraftEmail }: InternetTroubleshooterProps) {
  const [symptom, setSymptom] = useState('');
  const [connectionType, setConnectionType] = useState<'wifi' | 'ethernet' | 'mobile-hotspot' | 'vpn'>('wifi');
  const [deviceType, setDeviceType] = useState('Laptop / PC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NetworkDiagnosisResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Quick live browser network health status
  const [browserOnline, setBrowserOnline] = useState<boolean>(navigator.onLine);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleRunHealthCheck = () => {
    setTestingConnection(true);
    setTestResult(null);

    setTimeout(() => {
      const isOnline = navigator.onLine;
      setBrowserOnline(isOnline);
      if (isOnline) {
        setTestResult('Browser reports active internet connectivity. If your apps cannot connect, it is likely a firewall, DNS, or proxy configuration issue.');
      } else {
        setTestResult('Browser reports your computer has NO active internet connection. Please verify physical router power and Wi-Fi adapter state.');
      }
      setTestingConnection(false);
    }, 900);
  };

  const handleTroubleshoot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!symptom.trim()) {
      setError('Please select or describe your internet connection symptom.');
      return;
    }

    setLoading(true);
    setError(null);
    setCompletedSteps({});

    try {
      const response = await fetch('/api/troubleshoot-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom,
          connectionType,
          deviceType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve network diagnostics.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to connect to network diagnostics engine.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0f224a] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-3">
              <Wifi className="w-3.5 h-3.5 text-sky-300" />
              <span>Feature 3: Network Diagnosis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Internet Connectivity Troubleshooter
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Fix Wi-Fi disconnects, slow loading speeds, DNS errors, and gateway timeouts with beginner-tested steps.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0">
            <Radio className="w-10 h-10 text-sky-300" />
          </div>
        </div>
      </div>

      {/* Browser Connection Quick Test Strip */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${browserOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Device Network Sensor:</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${browserOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {browserOnline ? 'Online Status Detected' : 'Offline State Detected'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {testResult || 'Click to run an instant browser-level socket check.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRunHealthCheck}
          disabled={testingConnection}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin text-[#1e3a8a]' : ''}`} />
          <span>{testingConnection ? 'Testing...' : 'Check Connection'}</span>
        </button>
      </div>

      {/* Troubleshooter Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <form onSubmit={handleTroubleshoot} className="space-y-6">
          
          {/* Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select or Click a Common Network Issue:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COMMON_NETWORK_PRESETS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSymptom(item.desc);
                    setError(null);
                  }}
                  className={`text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                    symptom === item.desc
                      ? 'border-[#0f224a] bg-sky-50/70 text-[#0f224a] font-semibold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-900">{item.label}</div>
                  <div className="text-slate-500 mt-0.5 line-clamp-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="networkSymptom" className="block text-sm font-semibold text-slate-900 mb-1.5">
              Describe your internet problem in detail: <span className="text-red-500">*</span>
            </label>
            <textarea
              id="networkSymptom"
              rows={3}
              value={symptom}
              onChange={(e) => {
                setSymptom(e.target.value);
                if (error) setError(null);
              }}
              placeholder="E.g., Wi-Fi keeps disconnecting every 10 minutes when I am in the bedroom, but phone works fine next to the router..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 outline-hidden transition text-slate-900 text-sm"
            />
            {error && (
              <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                How is your computer connected?
              </label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-hidden"
              >
                <option value="wifi">Wi-Fi (Wireless)</option>
                <option value="ethernet">Ethernet Cable (Wired LAN)</option>
                <option value="mobile-hotspot">Mobile Phone Hotspot</option>
                <option value="vpn">Corporate VPN / Proxy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Device Type:
              </label>
              <select
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-800 outline-hidden"
              >
                <option value="Laptop">Laptop (Windows / Mac)</option>
                <option value="Desktop PC">Desktop Tower PC</option>
                <option value="Smartphone / Tablet">Tablet or Smartphone</option>
                <option value="Smart TV / Streaming Device">Smart TV / Game Console</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white font-semibold text-sm shadow-md shadow-blue-950/10 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Diagnosing Network...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Generate Network Steps</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                  Internet / Network
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
                  {result.connectionType.toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2">
                Network Diagnosis Summary
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                {result.diagnosticSummary}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
              <button
                onClick={() => onConvertToTicket(
                  `Network Issue: ${result.symptom.slice(0, 50)}...`,
                  `Type: ${result.connectionType}\nSymptom: ${result.symptom}\nDiagnosis: ${result.diagnosticSummary}`,
                  'Internet/Network',
                  result.steps
                )}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0f224a] text-xs font-semibold border border-sky-200 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>Save as Ticket</span>
              </button>
              <button
                onClick={() => onDraftEmail(
                  `Internet Connectivity Problem (${result.connectionType.toUpperCase()})`,
                  `Symptom: ${result.symptom}\nDiagnostic summary: ${result.diagnosticSummary}`,
                  'Internet/Network'
                )}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                <span>Draft Email to IT</span>
              </button>
            </div>
          </div>

          {/* 10-Second Quick Checks */}
          {result.quickChecks && result.quickChecks.length > 0 && (
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1.5 mb-2.5">
                <Router className="w-4 h-4 text-sky-700" />
                60-Second Physical Quick Checks
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.quickChecks.map((qc, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-sky-100 text-xs shadow-2xs">
                    <div className="font-bold text-slate-900">{qc.check}</div>
                    <div className="text-slate-600 mt-1">{qc.tip}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#1e3a8a]" />
              Safe Step-by-Step Suggestions
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

          {/* Safety & ISP Advice */}
          {result.safetyAndIspAdvice && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 leading-relaxed">
                <span className="font-bold">Router & Safety Advice: </span>
                {result.safetyAndIspAdvice}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
