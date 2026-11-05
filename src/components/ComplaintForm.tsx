import { useState, useEffect } from 'react';
import { 
  FilePlus2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  Flag, 
  Laptop, 
  User, 
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SupportTicket, Priority, IssueCategory, TroubleshootingStep } from '../types';
import { generateTicketNumber, estimatePriority, estimateCategory } from '../utils/ticketAnalytics';
import { addTicket } from '../utils/storage';

interface ComplaintFormProps {
  initialData?: {
    title?: string;
    description?: string;
    category?: IssueCategory;
    priority?: Priority;
    steps?: TroubleshootingStep[];
  };
  onTicketCreated: (ticket: SupportTicket) => void;
  existingTickets: SupportTicket[];
}

export function ComplaintForm({ initialData, onTicketCreated, existingTickets }: ComplaintFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<IssueCategory>(initialData?.category || 'Computer/OS');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'Medium');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [reporterName, setReporterName] = useState('');
  const [deviceType, setDeviceType] = useState('Laptop');
  
  // Suggested steps
  const [steps, setSteps] = useState<TroubleshootingStep[]>(initialData?.steps || []);
  const [autoAttachSteps, setAutoAttachSteps] = useState(steps.length > 0);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Validation errors
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    date?: string;
  }>({});

  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Sync initialData if it changes
  useEffect(() => {
    if (initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.category) setCategory(initialData.category);
      if (initialData.priority) setPriority(initialData.priority);
      if (initialData.steps && initialData.steps.length > 0) {
        setSteps(initialData.steps);
        setAutoAttachSteps(true);
      }
    }
  }, [initialData]);

  // Smart heuristic auto-recommender when user types
  const handleAutoSuggest = () => {
    if (!description && !title) return;
    const combined = `${title} ${description}`;
    const suggestedCategory = estimateCategory(combined);
    const suggestedPriority = estimatePriority(combined);
    setCategory(suggestedCategory);
    setPriority(suggestedPriority);
  };

  const handleFetchAISteps = async () => {
    if (!title.trim() && !description.trim()) {
      setErrors(prev => ({ ...prev, description: 'Please enter an issue title or description first.' }));
      return;
    }

    setLoadingAI(true);
    try {
      const response = await fetch('/api/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: `${title}: ${description}`,
          category,
          deviceType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.troubleshootingSteps && data.troubleshootingSteps.length > 0) {
          setSteps(data.troubleshootingSteps);
          setAutoAttachSteps(true);
        }
      }
    } catch (err) {
      console.error('Failed to auto-fetch steps:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Issue title is required.';
    } else if (title.trim().length < 4) {
      newErrors.title = 'Issue title must be at least 4 characters long.';
    }

    if (!description.trim()) {
      newErrors.description = 'Problem description is required.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Please provide at least 10 characters describing the problem.';
    }

    if (!category) {
      newErrors.category = 'Please select an issue category.';
    }

    if (!priority) {
      newErrors.priority = 'Please select a priority level.';
    }

    if (!date) {
      newErrors.date = 'Date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const ticketNumber = generateTicketNumber(existingTickets);
    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ticketNumber,
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'Open',
      date,
      updatedAt: date,
      reporterName: reporterName.trim() || 'User',
      deviceType: deviceType.trim(),
      suggestedSteps: autoAttachSteps ? steps : [],
      resolutionNotes: '',
    };

    addTicket(newTicket);
    setSubmittedSuccess(true);

    setTimeout(() => {
      onTicketCreated(newTicket);
    }, 700);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0f224a] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-3">
              <FilePlus2 className="w-3.5 h-3.5 text-sky-300" />
              <span>Feature 5: IT Complaint Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Register Technical Issue
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Create an official, structured IT support ticket with clear priority and beginner-friendly troubleshooting steps attached.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0">
            <FilePlus2 className="w-10 h-10 text-sky-300" />
          </div>
        </div>
      </div>

      {submittedSuccess ? (
        <div className="bg-white rounded-2xl p-8 border border-emerald-200 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Support Ticket Registered Successfully!
          </h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto">
            Your ticket has been catalogued in your local system. Opening structured ticket view...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Top row: Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="issueTitle" className="block text-sm font-semibold text-slate-900">
                  User Issue Title <span className="text-red-500">*</span>
                </label>
                {(title.length > 5 || description.length > 10) && (
                  <button
                    type="button"
                    onClick={handleAutoSuggest}
                    className="text-xs text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    Auto-Suggest Category & Priority
                  </button>
                )}
              </div>
              <input
                id="issueTitle"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
                }}
                placeholder="E.g., Laptop display remains blank after Windows update"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition outline-hidden ${
                  errors.title
                    ? 'border-red-300 bg-red-50/30 text-red-900 focus:border-red-500'
                    : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 text-slate-900'
                }`}
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Problem Description */}
            <div>
              <label htmlFor="problemDesc" className="block text-sm font-semibold text-slate-900 mb-1.5">
                Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="problemDesc"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                }}
                placeholder="Provide detailed symptoms: when did this start? What error message appeared? What were you doing right before the problem occurred?"
                className={`w-full px-4 py-3 rounded-xl border text-sm transition outline-hidden leading-relaxed ${
                  errors.description
                    ? 'border-red-300 bg-red-50/30 text-red-900 focus:border-red-500'
                    : 'border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 text-slate-900'
                }`}
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  Issue Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:border-[#1e3a8a] outline-hidden"
                >
                  <option value="Computer/OS">Computer / Operating System</option>
                  <option value="Software">Software & Applications</option>
                  <option value="Internet/Network">Internet & Network</option>
                  <option value="Hardware">Hardware & Peripherals</option>
                  <option value="Account/Security">Account & Security</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-slate-500" />
                  Priority Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:border-[#1e3a8a] outline-hidden"
                >
                  <option value="Low">Low (Informational / Minor)</option>
                  <option value="Medium">Medium (Affects single task)</option>
                  <option value="High">High (Impairs normal work)</option>
                  <option value="Critical">Critical (System down / Data risk)</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="ticketDate" className="block text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Incident Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="ticketDate"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 focus:border-[#1e3a8a] outline-hidden"
                />
              </div>

            </div>

            {/* Optional User Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Reporter Name / Department (Optional):
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="E.g., Jane Doe / Operations"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-400" />
                  Device / Model Details (Optional):
                </label>
                <input
                  type="text"
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  placeholder="E.g., Dell Latitude 5420 / MacBook Pro M2"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 outline-hidden"
                />
              </div>
            </div>

            {/* AI Troubleshooting Steps Attachment Section */}
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                    Suggested Troubleshooting Steps on Ticket
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleFetchAISteps}
                  disabled={loadingAI}
                  className="text-xs font-semibold text-[#0f224a] hover:text-[#1e3a8a] underline inline-flex items-center gap-1 cursor-pointer"
                >
                  {loadingAI ? 'Generating steps...' : 'Fetch AI Steps Now'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoAttach"
                  checked={autoAttachSteps}
                  onChange={(e) => setAutoAttachSteps(e.target.checked)}
                  className="w-4 h-4 text-[#1e3a8a] rounded border-slate-300"
                />
                <label htmlFor="autoAttach" className="text-xs text-slate-700 font-medium">
                  Attach troubleshooting checklist to this support ticket ({steps.length} steps available)
                </label>
              </div>

              {steps.length > 0 && autoAttachSteps && (
                <div className="space-y-1.5 pt-1">
                  {steps.map((st, i) => (
                    <div key={i} className="text-xs text-slate-700 bg-white p-2 rounded-md border border-slate-200 flex items-start gap-2">
                      <span className="font-bold text-sky-600 shrink-0">{i + 1}.</span>
                      <div>
                        <span className="font-semibold">{st.title}: </span>
                        <span className="text-slate-600">{st.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setReporterName('');
                  setErrors({});
                  setSteps([]);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Form
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white font-semibold text-sm shadow-md shadow-blue-950/10 transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Register Support Ticket</span>
              </button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
}
