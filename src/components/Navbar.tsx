import { useState } from 'react';
import { 
  Laptop, 
  AppWindow, 
  Wifi, 
  HardDrive, 
  FilePlus2, 
  LayoutDashboard, 
  Mail, 
  Menu, 
  X,
  Sparkles,
  Ticket
} from 'lucide-react';
import { SafetyBanner } from './SafetyBanner';

export type ActiveTab = 
  | 'dashboard'
  | 'computer'
  | 'software'
  | 'internet'
  | 'hardware'
  | 'register'
  | 'email';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  ticketCount: number;
  openCount: number;
}

export function Navbar({ activeTab, setActiveTab, ticketCount, openCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'computer' as ActiveTab, label: 'Computer Assistant', icon: Laptop },
    { id: 'software' as ActiveTab, label: 'Software Analyzer', icon: AppWindow },
    { id: 'internet' as ActiveTab, label: 'Internet Troubleshooter', icon: Wifi },
    { id: 'hardware' as ActiveTab, label: 'Hardware Guidance', icon: HardDrive },
    { id: 'register' as ActiveTab, label: 'Register Issue', icon: FilePlus2, highlight: true },
    { id: 'email' as ActiveTab, label: 'Email Generator', icon: Mail },
  ];

  const handleSelectTab = (id: ActiveTab) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner with Brand and Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Tagline */}
          <div 
            onClick={() => handleSelectTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#0f224a] to-[#1e3a8a] text-white flex items-center justify-center shadow-md shadow-blue-900/10 transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0f224a]">
                  TechCare <span className="text-sky-500 font-extrabold">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  IT Support
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide">
                Technology Problems. Simple Solutions.
              </p>
            </div>
          </div>

          {/* Right Header Items: Safety Pill + Ticket Badge + Mobile Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <div className="hidden md:block">
              <SafetyBanner compact />
            </div>

            <button
              onClick={() => handleSelectTab('dashboard')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-semibold cursor-pointer border border-slate-200"
              title="View all tickets"
            >
              <Ticket className="w-4 h-4 text-[#1e3a8a]" />
              <span className="hidden sm:inline">Tickets:</span>
              <span className="bg-[#0f224a] text-white px-2 py-0.5 rounded-full text-[11px]">
                {ticketCount}
              </span>
              {openCount > 0 && (
                <span className="hidden lg:inline-block text-[11px] font-medium text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded">
                  {openCount} open
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <div className="hidden md:block border-t border-slate-100 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 lg:space-x-2 py-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0f224a] text-white shadow-xs'
                      : item.highlight
                      ? 'bg-sky-100/80 text-sky-900 hover:bg-sky-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : item.highlight ? 'text-sky-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg">
          <div className="pb-2">
            <SafetyBanner compact />
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#0f224a] text-white'
                    : item.highlight
                    ? 'bg-sky-50 text-sky-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
