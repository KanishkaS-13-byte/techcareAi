import { useState } from 'react';
import { AlertTriangle, ShieldCheck, X, ChevronRight, ZapOff, BatteryWarning, Wrench } from 'lucide-react';

interface SafetyBannerProps {
  compact?: boolean;
}

export function SafetyBanner({ compact = false }: SafetyBannerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Hardware Safety Standards</span>
          <ChevronRight className="w-3 h-3 text-amber-600" />
        </button>

        {isOpen && (
          <SafetyModal onClose={() => setIsOpen(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-4 text-slate-800 shadow-xs mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-amber-950">
                Safety First: TechCare AI Hardware & Electrical Safety Policy
              </h4>
              <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-medium text-amber-800 hover:text-amber-950 underline decoration-amber-400 cursor-pointer"
              >
                View Full Guidelines
              </button>
            </div>
            <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
              Never attempt dangerous hardware procedures: do not open power supplies, do not puncture swollen batteries, and do not perform unauthorized electrical soldering. If you detect burning smells, sparks, or battery bulging, disconnect the device safely and contact a certified professional immediately.
            </p>
          </div>
        </div>
      </div>

      {isOpen && (
        <SafetyModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

function SafetyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Hardware Safety & Compliance</h3>
              <p className="text-xs text-slate-500">Guidelines for safe troubleshooting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm text-slate-700">
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex gap-3">
            <ZapOff className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-red-900 text-sm">1. Power Supply Units (PSUs)</h5>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">
                NEVER open or disassemble a desktop computer power supply or laptop charger brick. These units house large capacitors that hold lethal high-voltage electrical charges even days after being disconnected from wall outlets.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <BatteryWarning className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-amber-950 text-sm">2. Swollen or Damaged Batteries</h5>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                If your laptop chassis is bending, the trackpad is lifting, or the device emits a chemical sweet smell, the lithium-ion battery has suffered gas build-up. Do not charge it. Do not press it. Turn off the device and bring it to an authorized e-waste disposal or repair center.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
            <Wrench className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-blue-950 text-sm">3. Safe Beginner Procedures Only</h5>
              <p className="text-xs text-blue-900 mt-1 leading-relaxed">
                TechCare AI only guides you through external, non-invasive procedures: cleaning ports gently with compressed air, reconnecting certified USB/HDMI cables, updating drivers, power cycling, and managing software settings.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <strong>Warranty Notice:</strong> Opening sealed devices or breaking manufacturer security stickers can void your hardware warranty. For in-warranty hardware, always contact official support first.
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
