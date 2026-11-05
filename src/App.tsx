/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  getStoredTickets, 
  saveStoredTickets, 
  updateTicketInStorage, 
  deleteTicketFromStorage 
} from './utils/storage';
import { SupportTicket, TicketStatus, IssueCategory, TroubleshootingStep } from './types';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ComputerTroubleshooter } from './components/ComputerTroubleshooter';
import { SoftwareAnalyzer } from './components/SoftwareAnalyzer';
import { InternetTroubleshooter } from './components/InternetTroubleshooter';
import { HardwareGuidance } from './components/HardwareGuidance';
import { ComplaintForm } from './components/ComplaintForm';
import { EmailGenerator } from './components/EmailGenerator';
import { TicketModal } from './components/TicketModal';
import { Sparkles, ShieldCheck, Heart, Laptop, ArrowUp } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [tickets, setTickets] = useState<SupportTicket[]>(() => getStoredTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // States for cross-module workflows
  const [prefillComplaint, setPrefillComplaint] = useState<{
    title?: string;
    description?: string;
    category?: IssueCategory;
    priority?: any;
    steps?: TroubleshootingStep[];
  } | null>(null);

  const [prefillEmailTicket, setPrefillEmailTicket] = useState<SupportTicket | null>(null);

  // Reload tickets whenever storage updates
  useEffect(() => {
    saveStoredTickets(tickets);
  }, [tickets]);

  // Keep selectedTicket synchronized if updated in modal
  const handleUpdateTicket = (id: string, updates: Partial<SupportTicket>) => {
    const updatedList = updateTicketInStorage(id, updates);
    setTickets(updatedList);
    if (selectedTicket && selectedTicket.id === id) {
      const found = updatedList.find(t => t.id === id);
      if (found) setSelectedTicket(found);
    }
  };

  const handleDeleteTicket = (id: string) => {
    const updatedList = deleteTicketFromStorage(id);
    setTickets(updatedList);
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(null);
    }
  };

  const handleUpdateTicketStatus = (id: string, newStatus: TicketStatus) => {
    handleUpdateTicket(id, { status: newStatus });
  };

  const handleTicketCreated = (newTicket: SupportTicket) => {
    setTickets(prev => [newTicket, ...prev.filter(t => t.id !== newTicket.id)]);
    setPrefillComplaint(null);
    setSelectedTicket(newTicket);
    setActiveTab('dashboard');
  };

  // 1-Click Convert from AI Troubleshooter to Ticket Form
  const handleConvertToTicket = (title: string, description: string, category: string, steps: any[]) => {
    setPrefillComplaint({
      title,
      description,
      category: (category as IssueCategory) || 'Computer/OS',
      steps: steps || [],
    });
    setActiveTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1-Click Convert from Troubleshooter to Email Generator
  const handleDraftEmailFromDiagnosis = (title: string, description: string, category: string) => {
    const tempTicket: SupportTicket = {
      id: `temp_${Date.now()}`,
      ticketNumber: `REF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      description,
      category: (category as IssueCategory) || 'Computer/OS',
      priority: 'Medium',
      status: 'Open',
      date: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      reporterName: 'User',
      deviceType: 'PC',
      suggestedSteps: [],
    };
    setPrefillEmailTicket(tempTicket);
    setActiveTab('email');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDraftEmailFromTicket = (ticket: SupportTicket) => {
    setPrefillEmailTicket(ticket);
    setActiveTab('email');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Optional Load Sample Ticket for instant evaluation
  const handleLoadSampleTicket = () => {
    const sampleTicket: SupportTicket = {
      id: `ticket_${Date.now()}_sample`,
      ticketNumber: `TC-${new Date().getFullYear()}-4021`,
      title: 'Computer running sluggishly and freezes on browser tabs',
      description: 'System takes several minutes to boot up and frequently hangs when opening more than 4 Google Chrome tabs. High RAM usage reported in Task Manager.',
      category: 'Computer/OS',
      priority: 'Medium',
      status: 'Open',
      date: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      reporterName: 'Alex Morgan',
      deviceType: 'HP Pavilion Laptop',
      suggestedSteps: [
        { title: 'Restart Device', detail: 'Perform a full reboot to release cached physical memory.', isCompleted: true },
        { title: 'Disable Startup Programs', detail: 'Open Task Manager > Startup Apps tab and disable heavy background updaters.', isCompleted: false },
        { title: 'Clear Browser Cache & Temp Files', detail: 'Clear temporary cache files and remove unused browser extensions.', isCompleted: false },
        { title: 'Run Malware Scan', detail: 'Perform a quick scan via Windows Defender.', isCompleted: false },
      ],
      resolutionNotes: '',
    };
    const updated = [sampleTicket, ...tickets];
    setTickets(updated);
    saveStoredTickets(updated);
  };

  const openTicketsCount = tickets.filter(t => t.status === 'Open').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-100 selection:text-[#0f224a]">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ticketCount={tickets.length}
        openCount={openTicketsCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            tickets={tickets}
            onSelectTicket={(t) => setSelectedTicket(t)}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onDeleteTicket={handleDeleteTicket}
            onNavigateToRegister={() => {
              setPrefillComplaint(null);
              setActiveTab('register');
            }}
            onNavigateToTroubleshoot={() => setActiveTab('computer')}
            onNavigateToEmail={handleDraftEmailFromTicket}
            onLoadSampleTicket={handleLoadSampleTicket}
          />
        )}

        {activeTab === 'computer' && (
          <ComputerTroubleshooter
            onConvertToTicket={handleConvertToTicket}
            onDraftEmail={handleDraftEmailFromDiagnosis}
          />
        )}

        {activeTab === 'software' && (
          <SoftwareAnalyzer
            onConvertToTicket={handleConvertToTicket}
            onDraftEmail={handleDraftEmailFromDiagnosis}
          />
        )}

        {activeTab === 'internet' && (
          <InternetTroubleshooter
            onConvertToTicket={handleConvertToTicket}
            onDraftEmail={handleDraftEmailFromDiagnosis}
          />
        )}

        {activeTab === 'hardware' && (
          <HardwareGuidance
            onConvertToTicket={handleConvertToTicket}
            onDraftEmail={handleDraftEmailFromDiagnosis}
          />
        )}

        {activeTab === 'register' && (
          <ComplaintForm
            initialData={prefillComplaint || undefined}
            onTicketCreated={handleTicketCreated}
            existingTickets={tickets}
          />
        )}

        {activeTab === 'email' && (
          <EmailGenerator
            existingTickets={tickets}
            initialTicket={prefillEmailTicket}
          />
        )}
      </main>

      {/* Structured Support Ticket Modal (View, Print, Edit, Delete) */}
      {selectedTicket && (
        <TicketModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={handleUpdateTicket}
          onDelete={handleDeleteTicket}
          onDraftEmail={handleDraftEmailFromTicket}
        />
      )}

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#0f224a] text-sky-400 flex items-center justify-center font-bold text-xs">
              TC
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm">TechCare AI</span>
              <p className="text-[11px] text-slate-500">Technology Problems. Simple Solutions.</p>
            </div>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-500 max-w-md leading-relaxed">
            <p>
              Dedicated beginner-friendly IT troubleshooting assistant and complaint tracking platform.
            </p>
            <p className="text-slate-400 mt-0.5">
              Local browser storage enabled • Strict hardware safety policy
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
