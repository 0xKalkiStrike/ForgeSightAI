'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, ShieldAlert, Cpu, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import { getPredictions, Prediction } from '@/lib/api';
import Link from 'next/link';

export default function PredictivePage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPredictions()
      .then(setPredictions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Predictive Maintenance Engine</h1>
          <p className="text-xs text-slate-500">AMD Multi-Factor Machine Breakdown Risk Forecasting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {predictions.map((pred) => (
          <div key={pred.id} className="industrial-card p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Machine: {pred.machine_id}</h3>
                  <p className="text-xs text-slate-400">Model: {pred.model_name}</p>
                </div>
              </div>

              <div className="flex items-center sm:text-right gap-3 sm:gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Failure Risk Score</span>
                  <span className={`text-xl font-black ${pred.failure_probability >= 0.5 ? 'text-red-600' : 'text-slate-800'}`}>
                    {Math.round(pred.failure_probability * 100)}% ({pred.risk_level})
                  </span>
                </div>
              </div>
            </div>

            {/* Factor breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Decomposed Risk Factors</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pred.contributing_factors?.map((f: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block">{f.factor}</span>
                    <span className="text-red-600 font-semibold text-[11px] mt-0.5 block">{f.impact}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href={`/machines/${pred.machine_id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <span>View Telemetry & Sensor Diagnostics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
