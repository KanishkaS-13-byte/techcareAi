import { useState } from 'react';
import { 
  X, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Tag, 
  Flag, 
  User, 
  Laptop, 
  Mail, 
  Save, 
  Plus, 
  Square, 
  CheckSquare, 
  FileText,
  AlertTriangle
} from 'lucide-react';
import { SupportTicket, Priority, TicketStatus, IssueCategory, TroubleshootingStep } from '../types';

interface TicketModalProps {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<SupportTicket>) => void;
  onDelete: (id: string) => void;
  onDraftEmail: (ticket: SupportTicket) => void;
}

export function TicketModal({ ticket, onClose, onUpdate, onDelete, onDraftEmail }: TicketModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Editable fields
  const [editTitle, setEditTitle] = useState(ticket.title);
  const [editDescription, setEditDescription] = useState(ticket.description);
  const [editCategory, setEditCategory] = useState<IssueCategory>(ticket.category);
  const [editPriority, setEditPriority] = useState<Priority>(ticket.priority);
  const [editStatus, setEditStatus] = useState<TicketStatus>(ticket.status);
  const [resolutionNotes, setResolutionNotes] = useState(ticket.resolutionNotes || '');
  const [editErrors, setEditErrors] = useState<{ title?: string; description?: string }>({});

  // Sync state whenever ticket changes or edit mode toggles
  const handleStartEditing = () => {
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditCategory(ticket.category);
    setEditPriority(ticket.priority);
    setEditStatus(ticket.status);
    setResolutionNotes(ticket.resolutionNotes || '');
    setEditErrors({});
    setIsEditing(true);
  };

  // Keyboard shortcut: close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, onClose]);
  
  // Custom step input
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDetail, setNewStepDetail] = useState('');
  const [showAddStep, setShowAddStep] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  // Toggle step completion in the ticket
  const handleToggleStep = (index: number) => {
    const currentSteps = ticket.suggestedSteps || [];
    const updated = currentSteps.map((st, i) => {
      if (i === index) {
        return { ...st, isCompleted: !st.isCompleted };
      }
      return st;
    });
    onUpdate(ticket.id, { suggestedSteps: updated });
  };

  const handleAddNewStep = () => {
    if (!newStepTitle.trim()) {
      setStepError('Please provide a step title.');
      return;
    }
    const currentSteps = ticket.suggestedSteps || [];
    const updated = [
      ...currentSteps,
      { title: newStepTitle.trim(), detail: newStepDetail.trim(), isCompleted: false }
    ];
    onUpdate(ticket.id, { suggestedSteps: updated });
    setNewStepTitle('');
    setNewStepDetail('');
    setStepError(null);
    setShowAddStep(false);
  };

  const handleSaveEdits = () => {
    const errors: { title?: string; description?: string } = {};
    if (!editTitle.trim() || editTitle.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters long.';
    }
    if (!editDescription.trim() || editDescription.trim().length < 5) {
      errors.description = 'Description must be at least 5 characters long.';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    onUpdate(ticket.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      category: editCategory,
      priority: editPriority,
      status: editStatus,
      resolutionNotes: resolutionNotes.trim(),
    });
    setEditErrors({});
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getPriorityBadgeClass = (p: Priority) => {
    switch (p) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Low': return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getStatusBadgeClass = (s: TicketStatus) => {
    switch (s) {
      case 'Resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Open': return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-w-none print:m-0 print:p-0">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded border border-sky-400/30">
              {ticket.ticketNumber}
            </span>
            <span className="text-sm font-semibold text-slate-300">
              TechCare AI Support Ticket
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
              title="Print official ticket"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Print Ticket</span>
            </button>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 print:p-8 print:space-y-4">
          
          {/* Printable Header with Official Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#0f224a]">TechCare AI</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                  IT HELPDESK
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Technology Problems. Simple Solutions. • Official Support Document
              </p>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-lg font-mono font-bold text-[#0f224a]">
                {ticket.ticketNumber}
              </div>
              <div className="text-xs text-slate-500">
                Created: {ticket.date} • Last Updated: {ticket.updatedAt}
              </div>
            </div>
          </div>

          {/* Edit Mode Form */}
          {isEditing ? (
            <div className="space-y-4 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
              <div className="font-bold text-amber-900 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Editing Support Ticket
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Issue Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as IssueCategory)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Computer/OS">Computer/OS</option>
                    <option value="Software">Software</option>
                    <option value="Internet/Network">Internet/Network</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Account/Security">Account/Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TicketStatus)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resolution Notes</label>
                <textarea
                  rows={2}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how the problem was resolved or pending vendor actions..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-1.5 rounded-lg bg-[#0f224a] text-white text-xs font-semibold hover:bg-[#1e3a8a] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Status and Attributes Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Status</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    {/* Quick status cycle button */}
                    <select
                      value={ticket.status}
                      onChange={(e) => onUpdate(ticket.id, { status: e.target.value as TicketStatus })}
                      className="text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5 print:hidden cursor-pointer"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Priority</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Category</span>
                  <div className="mt-1 text-xs font-semibold text-slate-800">
                    {ticket.category}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Reporter</span>
                  <div className="mt-1 text-xs font-semibold text-slate-800">
                    {ticket.reporterName || 'User'} {ticket.deviceType ? `(${ticket.deviceType})` : ''}
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-snug">
                  {ticket.title}
                </h3>
                <div className="mt-3 p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {ticket.description}
                </div>
              </div>
            </>
          )}

          {/* Troubleshooting Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1e3a8a]" />
                Suggested Troubleshooting Instructions ({ticket.suggestedSteps?.length || 0})
              </h4>
              <button
                onClick={() => setShowAddStep(!showAddStep)}
                className="text-xs text-sky-700 hover:text-sky-900 font-semibold inline-flex items-center gap-1 print:hidden cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Step
              </button>
            </div>

            {/* Inline add step form */}
            {showAddStep && (
              <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 print:hidden">
                <input
                  type="text"
                  placeholder="Step title (e.g. Restart Wi-Fi router)"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="Action detail instructions..."
                  value={newStepDetail}
                  onChange={(e) => setNewStepDetail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 bg-white"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddStep(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewStep}
                    className="px-3 py-1 text-xs bg-[#0f224a] text-white rounded font-semibold cursor-pointer"
                  >
                    Save Step
                  </button>
                </div>
              </div>
            )}

            {ticket.suggestedSteps && ticket.suggestedSteps.length > 0 ? (
              <div className="space-y-2.5">
                {ticket.suggestedSteps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleStep(idx)}
                    className={`p-3 rounded-lg border transition cursor-pointer flex items-start gap-3 ${
                      step.isCompleted
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <button type="button" className="mt-0.5 print:hidden">
                      {step.isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    {/* Print checkbox box */}
                    <div className="hidden print:inline-block w-4 h-4 border border-slate-600 mr-2 mt-0.5" />

                    <div className="flex-1 text-xs">
                      <span className={`font-bold ${step.isCompleted ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                        {idx + 1}. {step.title}
                      </span>
                      {step.detail && (
                        <p className={`mt-0.5 ${step.isCompleted ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-lg border border-slate-200">
                No specific troubleshooting steps attached yet. You can click "Add Step" above.
              </div>
            )}
          </div>

          {/* Resolution Notes Section */}
          {ticket.resolutionNotes && (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide mb-1">
                Resolution Summary & Notes
              </h4>
              <p className="text-xs text-emerald-900 whitespace-pre-line leading-relaxed">
                {ticket.resolutionNotes}
              </p>
            </div>
          )}

          {/* Printable Sign-off / IT Approval footer (Clean layout for paper printing) */}
          <div className="hidden print:block pt-8 border-t border-slate-300 text-xs">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="border-b border-slate-400 h-8 mb-1" />
                <p className="font-semibold text-slate-700">User / Requester Signature & Date</p>
              </div>
              <div>
                <div className="border-b border-slate-400 h-8 mb-1" />
                <p className="font-semibold text-slate-700">IT Technician / Support Sign-off</p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Bar (Hidden in Print) */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-red-700">Delete ticket?</span>
                <button
                  onClick={() => onDelete(ticket.id)}
                  className="px-2.5 py-1 text-xs bg-red-600 hover:bg-red-700 text-white font-semibold rounded cursor-pointer"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-red-600 hover:text-red-800 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Ticket</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onDraftEmail(ticket);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0f224a] text-xs font-bold border border-sky-200 inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-sky-600" />
              <span>Draft Email for Ticket</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
