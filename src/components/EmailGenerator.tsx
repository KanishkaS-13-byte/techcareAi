import { useState, useEffect } from 'react';
import { 
  Mail, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  RotateCcw, 
  AlertCircle, 
  Send,
  Ticket,
  MessageSquare,
  ShieldAlert,
  Lightbulb
} from 'lucide-react';
import { SupportTicket, EmailGenerationResult } from '../types';

interface EmailGeneratorProps {
  existingTickets: SupportTicket[];
  initialTicket?: SupportTicket | null;
}

type EmailType = 'technical_issue_report' | 'it_support_request' | 'issue_follow_up' | 'resolution_confirmation';
type EmailTone = 'formal' | 'simple';

export function EmailGenerator({ existingTickets, initialTicket }: EmailGeneratorProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(initialTicket?.id || '');
  const [emailType, setEmailType] = useState<EmailType>('technical_issue_report');
  const [tone, setTone] = useState<EmailTone>('formal');

  const [issueTitle, setIssueTitle] = useState(initialTicket?.title || '');
  const [category, setCategory] = useState(initialTicket?.category || 'Computer/OS');
  const [description, setDescription] = useState(initialTicket?.description || '');
  const [stepsAttempted, setStepsAttempted] = useState('');
  const [impactLevel, setImpactLevel] = useState(initialTicket?.priority || 'Medium');
  const [ticketNumber, setTicketNumber] = useState(initialTicket?.ticketNumber || '');
  const [recipient, setRecipient] = useState('IT Helpdesk / Tech Support');
  const [userName, setUserName] = useState(initialTicket?.reporterName || 'User');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailGenerationResult | null>(null);

  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  // Sync when initialTicket is passed in from external tabs
  useEffect(() => {
    if (initialTicket) {
      setSelectedTicketId(initialTicket.id);
      setIssueTitle(initialTicket.title);
      setCategory(initialTicket.category);
      setDescription(initialTicket.description);
      setImpactLevel(initialTicket.priority);
      setTicketNumber(initialTicket.ticketNumber);
      if (initialTicket.reporterName) setUserName(initialTicket.reporterName);
      if (initialTicket.suggestedSteps && initialTicket.suggestedSteps.length > 0) {
        setStepsAttempted(initialTicket.suggestedSteps.map(s => s.title).join('; '));
      }
    }
  }, [initialTicket]);

  const handleSelectExistingTicket = (id: string) => {
    setSelectedTicketId(id);
    if (!id) return;
    const found = existingTickets.find(t => t.id === id);
    if (found) {
      setIssueTitle(found.title);
      setCategory(found.category);
      setDescription(found.description);
      setImpactLevel(found.priority);
      setTicketNumber(found.ticketNumber);
      if (found.reporterName) setUserName(found.reporterName);
      if (found.suggestedSteps && found.suggestedSteps.length > 0) {
        setStepsAttempted(found.suggestedSteps.map(s => s.title).join('; '));
      }
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!issueTitle.trim() || !description.trim()) {
      setError('Please provide an issue title and description to generate the email.');
      return;
    }

    setLoading(true);
    setError(null);
    setCopiedSubject(false);
    setCopiedBody(false);

    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailType,
          tone,
          issueTitle,
          category,
          description,
          stepsAttempted,
          impactLevel,
          ticketNumber,
          recipient,
          userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email template.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'subject') {
        setCopiedSubject(true);
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleOpenMailClient = () => {
    if (!result) return;
    const subjectEncoded = encodeURIComponent(result.subject);
    const bodyEncoded = encodeURIComponent(result.body);
    window.location.href = `mailto:?subject=${subjectEncoded}&body=${bodyEncoded}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0f224a] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-3">
              <Mail className="w-3.5 h-3.5 text-sky-300" />
              <span>Feature 8: Professional IT Email Generator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              IT Support Email Generator
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Create structured, polite, and effective emails for reporting technical problems, requesting support, following up, or confirming ticket resolutions.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0">
            <Send className="w-10 h-10 text-sky-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          
          {/* Quick populate from existing ticket */}
          {existingTickets.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-[#1e3a8a]" />
                Auto-fill details from an existing ticket:
              </label>
              <select
                value={selectedTicketId}
                onChange={(e) => handleSelectExistingTicket(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 outline-hidden"
              >
                <option value="">-- Choose a registered ticket or type manually --</option>
                {existingTickets.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.ticketNumber}] {t.title} ({t.priority})
                  </option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Email Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Purpose / Category:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'technical_issue_report', label: 'Issue Report' },
                  { id: 'it_support_request', label: 'Support Request' },
                  { id: 'issue_follow_up', label: 'Follow-up' },
                  { id: 'resolution_confirmation', label: 'Resolution Confirmed' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEmailType(item.id as EmailType)}
                    className={`px-3 py-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                      emailType === item.id
                        ? 'bg-[#0f224a] text-white border-[#0f224a]'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Communication Style:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTone('formal')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    tone === 'formal'
                      ? 'bg-sky-50 text-[#0f224a] border-sky-300 ring-1 ring-sky-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>👔 Formal Corporate Style</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTone('simple')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    tone === 'simple'
                      ? 'bg-sky-50 text-[#0f224a] border-sky-300 ring-1 ring-sky-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>💬 Simple & Beginner-Friendly</span>
                </button>
              </div>
            </div>

            {/* Title & Ref */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => {
                    setIssueTitle(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="E.g., Cannot connect to VPN server after password change"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Ticket # (Optional)
                </label>
                <input
                  type="text"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  placeholder="TC-2026-1042"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Briefly state what happens and how it impacts your workflow..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 outline-hidden"
              />
            </div>

            {/* Steps Tried & Impact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Steps Already Attempted:
                </label>
                <input
                  type="text"
                  value={stepsAttempted}
                  onChange={(e) => setStepsAttempted(e.target.value)}
                  placeholder="E.g., Restarted PC, cleared cache"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Impact / Priority:
                </label>
                <select
                  value={impactLevel}
                  onChange={(e) => setImpactLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 outline-hidden"
                >
                  <option value="Low">Low - Minor cosmetic issue</option>
                  <option value="Medium">Medium - Workaround available</option>
                  <option value="High">High - Impeding daily work</option>
                  <option value="Critical">Critical - Work blocked completely</option>
                </select>
              </div>
            </div>

            {/* Sender and Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Recipient Name / Team:
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="IT Helpdesk"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Your Name:
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 outline-hidden"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setIssueTitle('');
                  setDescription('');
                  setStepsAttempted('');
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white font-semibold text-xs shadow-md shadow-blue-950/10 transition disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Drafting Email...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Generate Support Email</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Output: Ready-to-Send Email Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1e3a8a]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Ready-to-Send Preview
                </h3>
              </div>
              {result && (
                <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {tone === 'formal' ? 'Formal' : 'Simple'}
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4 pt-4 flex-1 flex flex-col">
                {/* Subject Line */}
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Subject:</span>
                    <button
                      onClick={() => copyToClipboard(result.subject, 'subject')}
                      className="text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSubject ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900">
                    {result.subject}
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Email Body:</span>
                    <button
                      onClick={() => copyToClipboard(result.body, 'body')}
                      className="text-sky-700 hover:text-sky-900 inline-flex items-center gap-1 cursor-pointer"
                    >
                      {copiedBody ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedBody ? 'Copied' : 'Copy Full Email'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={12}
                    value={result.body}
                    onChange={(e) => setResult({ ...result, body: e.target.value })}
                    className="w-full flex-1 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans outline-hidden"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => copyToClipboard(result.body, 'body')}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBody ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                  </button>

                  <button
                    onClick={handleOpenMailClient}
                    className="flex-1 py-2 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white text-xs font-bold transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                    <span>Open in Mail Client</span>
                  </button>
                </div>

                {/* Tips */}
                {result.tips && result.tips.length > 0 && (
                  <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-lg text-xs text-sky-950">
                    <span className="font-bold flex items-center gap-1 mb-1">
                      <Lightbulb className="w-3 h-3 text-sky-600" />
                      IT Communication Pro-Tips:
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {result.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Mail className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No Email Drafted Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Fill in your problem details or select an existing ticket, then click "Generate Support Email".
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
