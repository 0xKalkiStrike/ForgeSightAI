'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, ShieldCheck, Activity, Award } from 'lucide-react';
import { getAnalyticsSummary, AnalyticsSummary } from '@/lib/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

const MONTHLY_SAVINGS_DATA = [
  { month: 'May', saved_cost: 11200, avoided_hrs: 18.0 },
  { month: 'Jun', saved_cost: 14500, avoided_hrs: 24.5 },
  { month: 'Jul', saved_cost: 13800, avoided_hrs: 22.0 },
  { month: 'Aug', saved_cost: 17200, avoided_hrs: 29.0 },
  { month: 'Sep', saved_cost: 16400, avoided_hrs: 27.5 },
  { month: 'Oct', saved_cost: 18450, avoided_hrs: 42.5 },
];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    getAnalyticsSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Operational & Financial Business Impact Analytics</h1>
        <p className="text-xs text-slate-500">Measurable downtime avoidance, cost savings, and predictive accuracy metrics</p>
      </div>

      {/* Primary Financial Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="industrial-card p-5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Downtime Avoided</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{summary?.prevented_downtime_hours ?? 42.5} hrs</div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">+18.5 hrs saved this month</p>
        </div>

        <div className="industrial-card p-5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Cost Avoided</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">${(summary?.estimated_cost_saved ?? 18450).toLocaleString()}</div>
          <p className="text-[11px] text-blue-700 font-semibold mt-1">Based on $738/hr plant rate</p>
        </div>

        <div className="industrial-card p-5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Early Failures Detected</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">17 Incidents</div>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">100% false positive filter</p>
        </div>

        <div className="industrial-card p-5 border-l-4 border-l-indigo-500 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Maintenance Efficiency</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">+{summary?.maintenance_efficiency_pct ?? 24.5}%</div>
          <p className="text-[11px] text-indigo-700 font-semibold mt-1">MTTR reduced to 2.4 hrs</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="industrial-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Cumulative Financial Value Generated ($)</h3>
          <p className="text-xs text-slate-500 mb-4">Direct savings from catastrophic downtime prevention</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_SAVINGS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Avoided Cost']} />
                <Area type="monotone" dataKey="saved_cost" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="industrial-card p-6">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Avoided Machine Downtime Hours</h3>
          <p className="text-xs text-slate-500 mb-4">Hours of lost production prevented via early predictive intervention</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SAVINGS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(val: any) => [`${val} hrs`, 'Avoided Downtime']} />
                <Bar dataKey="avoided_hrs" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Operational Reliability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="industrial-card p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Mean Time Between Failures (MTBF)</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.mtbf_hours ?? 1420} Hours</div>
          <p className="text-[11px] text-slate-500 mt-0.5">+14% improvement year-over-year</p>
        </div>

        <div className="industrial-card p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Mean Time To Repair (MTTR)</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{summary?.mttr_hours ?? 2.4} Hours</div>
          <p className="text-[11px] text-slate-500 mt-0.5">-38% reduction in repair window</p>
        </div>

        <div className="industrial-card p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Prediction Model Accuracy</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{summary?.prediction_accuracy_pct ?? 94.2}%</div>
          <p className="text-[11px] text-slate-500 mt-0.5">AMD Isolation Forest + Ensemble</p>
        </div>
      </div>
    </div>
  );
}
