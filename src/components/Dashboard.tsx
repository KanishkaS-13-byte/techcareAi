import { useState, useMemo } from 'react';
import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Printer, 
  Mail, 
  Trash2, 
  Eye, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Layers,
  Laptop
} from 'lucide-react';
import { SupportTicket, Priority, TicketStatus, IssueCategory } from '../types';
import { computeTicketStatistics, exportTicketsToCSV } from '../utils/ticketAnalytics';
import { SafetyBanner } from './SafetyBanner';

interface DashboardProps {
  tickets: SupportTicket[];
  onSelectTicket: (ticket: SupportTicket) => void;
  onUpdateTicketStatus: (id: string, newStatus: TicketStatus) => void;
  onDeleteTicket: (id: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToTroubleshoot: () => void;
  onNavigateToEmail: (ticket: SupportTicket) => void;
  onLoadSampleTicket: () => void;
}

export function Dashboard({
  tickets,
  onSelectTicket,
  onUpdateTicketStatus,
  onDeleteTicket,
  onNavigateToRegister,
  onNavigateToTroubleshoot,
  onNavigateToEmail,
  onLoadSampleTicket
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);

  const stats = useMemo(() => computeTicketStatistics(tickets), [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          ticket.title.toLowerCase().includes(q) ||
          ticket.ticketNumber.toLowerCase().includes(q) ||
          ticket.description.toLowerCase().includes(q) ||
          (ticket.reporterName && ticket.reporterName.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // Status
      if (statusFilter !== 'ALL' && ticket.status !== statusFilter) {
        return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && ticket.category !== categoryFilter) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'ALL' && ticket.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [tickets, searchQuery, statusFilter, categoryFilter, priorityFilter]);

  const handleExportCSV = () => {
    if (tickets.length === 0) return;
    const csvContent = exportTicketsToCSV(tickets);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TechCare_Tickets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">Critical</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Medium</span>;
      case 'Low':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">Low</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Welcome / Mission Card */}
      <div className="bg-gradient-to-r from-[#0f224a] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-300" />
              <span>Personal IT Support Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              TechCare AI Support Command Center
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
              Track, troubleshoot, and resolve computer, network, software, and hardware complaints with beginner-friendly AI clarity.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={onNavigateToRegister}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-[#0f224a] font-bold text-xs sm:text-sm shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Issue</span>
            </button>

            <button
              onClick={onNavigateToTroubleshoot}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs border border-white/20 transition cursor-pointer"
            >
              <Laptop className="w-4 h-4 text-sky-300" />
              <span>AI Diagnostic</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <SafetyBanner />

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Registered Issues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Issues
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#0f224a] mt-1">
              {stats.total}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Registered in TechCare
            </span>
          </div>
          <div className="p-3 bg-slate-100 rounded-xl text-[#0f224a]">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Open Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Open Tickets
            </span>
            <div className="text-2xl sm:text-3xl font-black text-sky-600 mt-1">
              {stats.open}
            </div>
            <span className="text-[11px] text-sky-700 font-medium">
              Awaiting action
            </span>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Resolved Tickets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resolved Tickets
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {stats.resolved}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {stats.resolutionRate}% resolution rate
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: High & Critical Priority Issues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              High / Critical
            </span>
            <div className="text-2xl sm:text-3xl font-black text-red-600 mt-1">
              {stats.highPriority}
            </div>
            <span className="text-[11px] text-red-700 font-medium">
              Needs urgent focus
            </span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Flame className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Search, Filter & Actions Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ticket #, issue title, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-[#1e3a8a] focus:ring-2 focus:ring-sky-200 outline-hidden text-slate-900 transition"
            />
          </div>

          {/* Quick Filter dropdowns */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 outline-hidden font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="Computer/OS">Computer / OS</option>
              <option value="Software">Software</option>
              <option value="Internet/Network">Internet & Network</option>
              <option value="Hardware">Hardware</option>
              <option value="Account/Security">Account & Security</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 outline-hidden font-medium"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Export CSV button */}
            {tickets.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="px-3 py-2 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold inline-flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap border border-slate-200"
                title="Export tickets to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Status:</span>
          {['ALL', 'Open', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0f224a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Tickets' : st}
            </button>
          ))}
        </div>

      </div>

      {/* Tickets List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Registered Support Tickets
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {filteredTickets.length} shown
            </span>
          </div>

          {tickets.length === 0 && (
            <button
              onClick={onLoadSampleTicket}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold underline cursor-pointer"
            >
              Load Example Ticket
            </button>
          )}
        </div>

        {/* Ticket Entries */}
        {filteredTickets.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                
                {/* Left Ticket Summary */}
                <div 
                  onClick={() => onSelectTicket(ticket)}
                  className="flex-1 cursor-pointer space-y-1.5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-sky-50 text-[#0f224a] px-2 py-0.5 rounded border border-sky-200">
                      {ticket.ticketNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {ticket.category}
                    </span>
                    {getPriorityBadge(ticket.priority)}
                    <span className="text-xs text-slate-400">
                      {ticket.date}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#1e3a8a] transition leading-snug">
                    {ticket.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl leading-relaxed">
                    {ticket.description}
                  </p>

                  {ticket.suggestedSteps && ticket.suggestedSteps.length > 0 && (
                    <div className="text-[11px] text-sky-700 font-semibold inline-flex items-center gap-1 pt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-sky-500" />
                      <span>{ticket.suggestedSteps.filter(s => s.isCompleted).length} of {ticket.suggestedSteps.length} troubleshooting steps completed</span>
                    </div>
                  )}
                </div>

                {/* Right Controls: Status Selector & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  
                  {/* Status Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">Status:</span>
                    <select
                      value={ticket.status}
                      onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                      className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-hidden cursor-pointer ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : ticket.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-sky-50 text-sky-800 border-sky-300'
                      }`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onSelectTicket(ticket)}
                      className="p-2 text-slate-600 hover:text-[#0f224a] hover:bg-slate-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                      title="View & Print Ticket"
                    >
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span className="hidden lg:inline">View / Print</span>
                    </button>

                    <button
                      onClick={() => onNavigateToEmail(ticket)}
                      className="p-2 text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                      title="Generate Email to IT Support"
                    >
                      <Mail className="w-4 h-4 text-sky-600" />
                      <span className="hidden lg:inline">Draft Email</span>
                    </button>

                    <button
                      onClick={() => setTicketToDelete(ticket.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">
                {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'No tickets match your filter criteria'
                  : 'No IT Support Tickets Registered Yet'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {searchQuery
                  ? 'Try clearing your search query or resetting filters.'
                  : 'Register a technical issue, or use one of our AI Troubleshooters to diagnose and convert problems into structured tickets.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onNavigateToRegister}
                className="px-4 py-2 rounded-xl bg-[#0f224a] hover:bg-[#1e3a8a] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Register IT Issue
              </button>
              <button
                onClick={onNavigateToTroubleshoot}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Run Computer Diagnostic
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Confirm Ticket Deletion
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this support ticket from your local records? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTicket(ticketToDelete);
                  setTicketToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl cursor-pointer shadow-xs"
              >
                Yes, Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
