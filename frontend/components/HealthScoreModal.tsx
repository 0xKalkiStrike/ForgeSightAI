'use client';

import { X, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
}

export default function HealthScoreModal({ isOpen, onClose, score }: HealthScoreModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Factory Health Index</h3>
              <p className="text-xs text-slate-500">Scoring Formula & Calculation Methodology</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Overall Score</span>
              <div className="text-3xl font-black text-slate-900 mt-0.5">{score} <span className="text-base font-normal text-slate-400">/ 100</span></div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                Optimal Operational Range
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Calculation Formula</h4>
            <div className="bg-slate-900 text-amber-400 p-3 rounded-lg font-mono text-[11px] leading-relaxed">
              Factory Health = ∑ (Machine_Health_Score_i) / Total_Machines
              <br />
              Machine Health = 100 - (Failure_Prob × 70) - (Active_Anomalies × 4)
            </div>

            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider pt-2">Key Weighted Factors</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Sensor Anomaly Deviations (40% Weight):</strong> Evaluates real-time vibration spikes, thermal drift, and hydraulic pressure drop against baseline standards.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Predictive Failure Risk (35% Weight):</strong> Multi-factor probability of equipment breakdown within the next operating window.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Maintenance Compliance (25% Weight):</strong> Hours elapsed since last preventive service relative to recommended OEM overhaul intervals.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 cursor-pointer transition-all"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}
