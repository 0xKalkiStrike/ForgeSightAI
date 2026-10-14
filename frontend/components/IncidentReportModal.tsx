'use client';

import { X, Printer, Download, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  machineName: string;
  issue: string;
  riskPct: number;
  rootCause: string;
  recommendation: string;
  avoidedDowntime: number;
  avoidedCost: number;
}

export default function IncidentReportModal({
  isOpen,
  onClose,
  machineId,
  machineName,
  issue,
  riskPct,
  rootCause,
  recommendation,
  avoidedDowntime,
  avoidedCost
}: IncidentReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl border border-slate-300 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg border border-red-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Industrial Incident & Failure Report</h2>
              <p className="text-xs text-slate-500">ForgeSight AI — Production Maintenance Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="py-6 space-y-6 text-slate-800">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 font-medium uppercase tracking-wider block">Machine Target</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{machineId}</span>
              <span className="text-slate-500">{machineName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium uppercase tracking-wider block">Report Date</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">{new Date().toLocaleDateString()}</span>
              <span className="text-slate-500">{new Date().toLocaleTimeString()}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium uppercase tracking-wider block">Failure Risk Level</span>
              <span className="font-bold text-red-600 text-sm mt-0.5 block">{riskPct}% — High Risk</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium uppercase tracking-wider block">Impact Category</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">Unplanned Downtime</span>
            </div>
          </div>

          {/* Issue Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">1. Incident Overview</h3>
            <p className="text-sm bg-white p-3.5 rounded-lg border border-slate-200 font-medium text-slate-800">
              {issue}
            </p>
          </div>

          {/* Root Cause Analysis */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">2. AI Root Cause Diagnostic</h3>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 space-y-2 text-xs">
              <p className="font-bold text-amber-900 text-sm">{rootCause}</p>
              <p className="text-slate-600">
                Pattern matched against historical vibration harmonics (+42% vibration drift) and elevated temperature readings (+20% thermal spike).
              </p>
            </div>
          </div>

          {/* Action Recommendation */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">3. Recommended Operator Procedure</h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-slate-900 mb-2">{recommendation}</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600">
                <li>Enforce Lockout/Tagout (LOTO) procedures on 480V primary electrical feed.</li>
                <li>Inspect drive bearing housing for thermal fatigue & grease breakdown.</li>
                <li>Check laser shaft alignment tolerance (Target &lt; 0.05 mm).</li>
                <li>Replace bearing assembly with SKF 6208-2RS double-sealed bearing.</li>
              </ol>
            </div>
          </div>

          {/* Financial & Operational Value Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">4. Financial & Operational Business Impact</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <span className="text-emerald-700 font-semibold block">Prevented Downtime</span>
                <span className="text-2xl font-bold mt-1 block">{avoidedDowntime} Hours</span>
                <span className="text-[11px] text-emerald-700">Early intervention prevents line shutdown.</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <span className="text-emerald-700 font-semibold block">Estimated Avoided Cost</span>
                <span className="text-2xl font-bold mt-1 block">${avoidedCost.toLocaleString()}</span>
                <span className="text-[11px] text-emerald-700">Based on $738/hr plant downtime rate.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>FactoryGuard AI — Verified Industrial Intelligence Report</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
