import { useState } from 'react';
import { 
  Keyboard, 
  Mouse, 
  Tv, 
  Printer, 
  BatteryCharging, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { SafetyBanner } from './SafetyBanner';

interface HardwareGuidanceProps {
  onConvertToTicket: (title: string, description: string, category: string, steps: any[]) => void;
  onDraftEmail: (title: string, description: string, category: string) => void;
}

type HardwareCategory = 'keyboard' | 'mouse' | 'monitor' | 'printer' | 'battery';

const HARDWARE_MODULES = [
  {
    id: 'keyboard' as HardwareCategory,
    name: 'Keyboard Problems',
    icon: Keyboard,
    badge: 'Peripherals',
    summary: 'Sticky keys, unresponsive typing, liquid spills, and wireless connection drops.',
    issues: [
      {
        title: 'Sticky or Repeated Keys',
        cause: 'Dust, crumbs, or dried residue trapped under keycaps.',
        safeSteps: [
          'Unplug keyboard or disconnect wireless Bluetooth power switch.',
          'Gently turn the keyboard upside down and tap lightly on the back to dislodge loose debris.',
          'Use a can of dry compressed air held upright at a 45-degree angle in short bursts between key rows.',
          'Clean keycap surfaces with a lightly dampened microfiber cloth (use isopropyl alcohol 70% or mild soapy water; cloth must NOT drip).'
        ],
        unsafeWarning: 'Do NOT pry off laptop scissor-switch keycaps with screwdrivers; the microscopic plastic clips snap easily and cannot be repaired.'
      },
      {
        title: 'Liquid Spill on Keyboard',
        cause: 'Beverage or water ingress into circuit membrane.',
        safeSteps: [
          'ACT IMMEDIATELY: Power down the computer immediately (hold power button 5 seconds if necessary).',
          'Disconnect the power cable and any USB devices instantly.',
          'Turn the laptop/keyboard upside down in an inverted "tent" shape over a clean towel.',
          'Leave in a warm, dry room for at least 48 hours before testing power.'
        ],
        unsafeWarning: 'CRITICAL: Do NOT use a hot hair dryer (melts plastic keycaps and blows liquid deeper) and NEVER plug it back in while still damp.'
      }
    ]
  },
  {
    id: 'mouse' as HardwareCategory,
    name: 'Mouse Problems',
    icon: Mouse,
    badge: 'Peripherals',
    summary: 'Cursor stuttering, unintentional double-clicking, and optical sensor tracking issues.',
    issues: [
      {
        title: 'Cursor Drifting or Lagging',
        cause: 'Hair or dust on optical sensor lens, glossy desk surface, or 2.4GHz wireless interference.',
        safeSteps: [
          'Flip the mouse over and blow away dust on the glass sensor opening with compressed air or a soft cotton swab.',
          'Test the mouse on a plain, non-reflective mouse pad or sheet of paper instead of glass or shiny wood.',
          'If using a 2.4GHz USB wireless dongle, plug it into a front port away from USB 3.0 hubs, which cause radio frequency interference.'
        ],
        unsafeWarning: 'Do NOT use sharp needles or metal pins to scrape the optical sensor glass.'
      },
      {
        title: 'Mouse Registering Double Clicks',
        cause: 'Micro-switch mechanical spring tension or Windows mouse speed setting.',
        safeSteps: [
          'In Windows Settings > Bluetooth & Devices > Mouse > Additional mouse settings, adjust the "Double-click speed" slider.',
          'Blow dry compressed air into the seam under the left/right click buttons to dislodge internal dust.',
          'Test the mouse on another computer to verify if the hardware switch itself is worn out.'
        ],
        unsafeWarning: 'Do NOT spray WD-40 or conducting lubricants into the mouse switches.'
      }
    ]
  },
  {
    id: 'monitor' as HardwareCategory,
    name: 'Monitor Problems',
    icon: Tv,
    badge: 'Display',
    summary: 'Flickering screens, black display, wrong resolution, or "No Signal" warnings.',
    issues: [
      {
        title: '"No Signal" or Black Screen',
        cause: 'Loose video cable, monitor set to wrong input channel, or sleep mode glitch.',
        safeSteps: [
          'Press the physical "Input" or "Source" button on the monitor bezel and verify it matches your connection (HDMI 1, HDMI 2, or DisplayPort).',
          'Unplug both ends of the HDMI/DisplayPort cable and firmly re-seat them until clicked.',
          'Press the shortcut Windows + Ctrl + Shift + B to restart your computer graphics driver (you will hear a beep and screen will flicker).',
          'Test with a known-working HDMI cable or connect your PC to a living room TV to isolate if the PC or monitor is at fault.'
        ],
        unsafeWarning: 'NEVER disassemble the plastic casing of a computer monitor or TV; high-voltage backlights can cause electric shock.'
      },
      {
        title: 'Screen Flickering or Stretched Image',
        cause: 'Refresh rate mismatch, loose cable pin, or pending display adapter driver.',
        safeSteps: [
          'Right click on desktop > Display Settings > Advanced Display. Verify the Refresh Rate matches your monitor rating (e.g. 60Hz).',
          'Ensure Display Resolution is set to the recommended native setting (e.g., 1920x1080 or 2560x1440).',
          'Ensure the monitor power cable is plugged into a grounded wall socket, as power surges or nearby refrigerators can induce line flicker.'
        ],
        unsafeWarning: 'Avoid pressing forcefully on the LCD/OLED panel with your fingers; liquid crystals can permanently crack.'
      }
    ]
  },
  {
    id: 'printer' as HardwareCategory,
    name: 'Printer Problems',
    icon: Printer,
    badge: 'Hardware',
    summary: 'Paper jams, printer offline, spooler errors, and streaky print outputs.',
    issues: [
      {
        title: 'Safe Paper Jam Removal',
        cause: 'Misaligned paper feed, wrinkled paper, or foreign objects in rollers.',
        safeSteps: [
          'Turn off the printer power switch and wait 10 seconds.',
          'Open the printer access doors gently according to the machine label diagram.',
          'Grasp the jammed paper firmly with BOTH hands and pull gently in the DIRECTION of the paper path. Avoid pulling backwards at an angle.',
          'Inspect the tray to verify no tiny torn paper fragments remain behind, then close all panels and turn on power.'
        ],
        unsafeWarning: 'DO NOT use scissors, knives, or screwdrivers to dig out paper. You will permanently scratch the sensitive rubber rollers or drum.'
      },
      {
        title: 'Printer Shows "Offline" Status',
        cause: 'Windows Print Spooler service stopped or IP address changed on local Wi-Fi.',
        safeSteps: [
          'Restart your printer and computer to re-establish the local Bonjour/mDNS connection.',
          'On Windows, press Win+R, type "services.msc", find "Print Spooler", right-click and select "Restart".',
          'In Settings > Printers & Scanners, click your printer and ensure "Use Printer Offline" is not checked.',
          'Print a network configuration test sheet directly from the printer menu to verify its Wi-Fi IP address.'
        ],
        unsafeWarning: 'Do not remove factory covers or attempt to service internal toner fusing units; laser fusers operate at over 200°C (400°F).'
      }
    ]
  },
  {
    id: 'battery' as HardwareCategory,
    name: 'Battery & Power Issues',
    icon: BatteryCharging,
    badge: 'Critical Power',
    summary: 'Battery draining fast, plugged in not charging, heat management, and battery swelling precautions.',
    issues: [
      {
        title: 'Battery Draining Quickly',
        cause: 'High brightness, background sync processes, or aged battery charge cycle count.',
        safeSteps: [
          'Open Task Manager or Activity Monitor and check which apps consume high CPU / Energy.',
          'Reduce screen brightness to 50-70% and set sleep timer to 5 minutes of inactivity.',
          'Generate an official battery health report (Windows: `powercfg /batteryreport` via Terminal; Mac: System Settings > Battery > Battery Health).',
          'Turn on built-in OS battery saver mode when working away from a wall outlet.'
        ],
        unsafeWarning: 'Do not leave laptops on soft bedding or blankets while gaming or charging; blocking ventilation accelerates battery thermal degradation.'
      },
      {
        title: 'CRITICAL: Swollen Lithium Battery Warning',
        cause: 'Lithium battery gas buildup due to age, overcharging defect, or extreme heat.',
        safeSteps: [
          'Look for physical warning signs: trackpad lifting, chassis seams parting, bottom lid bulging, or chemical sweet odor.',
          'IMMEDIATE ACTION: Safely shut down the computer immediately.',
          'Disconnect the AC charger. Do NOT plug it back into wall power.',
          'Do NOT attempt to open the laptop screws or press on the bulge.',
          'Take the unit to an authorized OEM repair center or certified computer technician for safe hazardous disposal.'
        ],
        unsafeWarning: 'HIGH HAZARD: NEVER puncture, bend, press, or attempt to pierce a swollen battery. Puncturing lithium-ion cells can cause an explosive thermal runaway fire.'
      }
    ]
  }
];

export function HardwareGuidance({ onConvertToTicket, onDraftEmail }: HardwareGuidanceProps) {
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory>('keyboard');

  const currentModule = HARDWARE_MODULES.find(m => m.id === selectedCategory) || HARDWARE_MODULES[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0f224a] to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-sky-300" />
              <span>Feature 4: Hardware Guidance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hardware Issue Guidance & Safety
            </h1>
            <p className="text-sky-100/90 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              Safe, non-destructive educational troubleshooting for keyboards, mice, monitors, printers, and batteries. We strictly prioritize your personal safety.
            </p>
          </div>
          <div className="hidden lg:flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 shrink-0">
            <Keyboard className="w-10 h-10 text-sky-300" />
          </div>
        </div>
      </div>

      {/* Safety Banner */}
      <SafetyBanner />

      {/* Hardware Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {HARDWARE_MODULES.map((mod) => {
          const Icon = mod.icon;
          const isSelected = selectedCategory === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setSelectedCategory(mod.id)}
              className={`flex flex-col items-center text-center p-3.5 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-[#0f224a] text-white border-[#0f224a] shadow-md shadow-blue-950/10'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
              <span className="text-xs font-bold leading-tight">{mod.name.replace(' Problems', '').replace(' Issues', '')}</span>
            </button>
          );
        })}
      </div>

      {/* Current Hardware Module Display */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 text-xs font-semibold border border-sky-100">
                {currentModule.badge}
              </span>
              <span className="text-xs text-slate-500">
                Safety Certified Guide
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {currentModule.name}
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              {currentModule.summary}
            </p>
          </div>

          <button
            onClick={() => onConvertToTicket(
              `Hardware Assistance: ${currentModule.name}`,
              `Hardware Component: ${currentModule.name}\nSummary: ${currentModule.summary}\nRequesting technical assistance or warranty review.`,
              'Hardware',
              currentModule.issues[0]?.safeSteps.map(s => ({ title: s.slice(0, 30) + '...', detail: s })) || []
            )}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0f224a] text-xs font-semibold border border-sky-200 transition cursor-pointer shrink-0"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Create Hardware Ticket</span>
          </button>
        </div>

        {/* Detailed Issues in this module */}
        <div className="space-y-6">
          {currentModule.issues.map((issue, idx) => (
            <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {issue.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>Probable Root Cause: </strong>{issue.cause}
                  </p>
                </div>
                <button
                  onClick={() => onDraftEmail(
                    `Hardware Assistance: ${issue.title}`,
                    `Issue: ${issue.title}\nComponent: ${currentModule.name}\nCause: ${issue.cause}`,
                    'Hardware'
                  )}
                  className="text-xs text-slate-600 hover:text-slate-900 underline font-medium cursor-pointer self-start"
                >
                  Draft IT Email
                </button>
              </div>

              {/* Safe Steps */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Safe Beginner Actions:
                </h4>
                <ul className="space-y-2">
                  {issue.safeSteps.map((step, sIdx) => (
                    <li key={sIdx} className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 flex items-start gap-2.5">
                      <span className="font-bold text-[#1e3a8a] bg-sky-50 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                        {sIdx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unsafe Warning Box */}
              <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-950 leading-relaxed">
                  <strong className="text-red-900">SAFETY RESTRICTION: </strong>
                  {issue.unsafeWarning}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Professional Assistance Callout */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-950 leading-relaxed">
            <span className="font-bold">When to use Professional Support: </span>
            If any hardware component produces burning odors, excessive heat, physical cracking, or requires opening the internal chassis, please consult certified repair specialists. TechCare AI advises against uncertified electrical repairs.
          </div>
        </div>

      </div>
    </div>
  );
}
