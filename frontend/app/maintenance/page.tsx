'use client';

import { useState, useEffect } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, X, DollarSign } from 'lucide-react';
import { getMaintenanceRecords, createMaintenanceRecord, getRecommendations, approveRecommendation, MaintenanceRecord, Recommendation } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    machine_id: 'M-104',
    technician_name: 'Rahul Sharma',
    issue: 'Drive-side bearing inspection & replacement',
    action_taken: 'Replaced bearing set, lubricated housing, laser aligned shaft.',
    parts_replaced: 'SKF 6208-2RS Bearing',
    downtime_hours: 2.5,
    cost: 480.0,
    maintenance_type: 'Predictive'
  });
  const toast = useToast();

  const fetchData = async () => {
    try {
      const [recs, recsList] = await Promise.all([
        getMaintenanceRecords(),
        getRecommendations()
      ]);
      setRecords(recs);
      setRecommendations(recsList);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMaintenanceRecord(formData);
      setShowModal(false);
      toast.success(`Maintenance record logged for Machine ${formData.machine_id}.`, 'Record Saved');
      fetchData();
    } catch (err) {
      toast.error('Failed to create maintenance record.', 'Error');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveRecommendation(id);
      toast.success('Recommendation approved and work order issued.', 'Work Order Approved');
      fetchData();
    } catch (err) {
      toast.error('Failed to approve recommendation.', 'Error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maintenance Operations & Records</h1>
          <p className="text-xs text-slate-500">Preventive, Emergency, and Predictive Maintenance Management</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-all shadow-xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Log Maintenance Record</span>
        </button>
      </div>

      {/* AI Recommendations Queue */}
      {recommendations.length > 0 && (
        <div className="industrial-card p-4 sm:p-6 space-y-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Pending AI Maintenance Recommendations</h2>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              {recommendations.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec: any) => (
              <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 truncate">{rec.machine_id}: {rec.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      (rec.human_status || rec.status) === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rec.human_status || rec.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Avoided Downtime: <strong>{rec.estimated_avoided_downtime} hrs</strong> • Cost Saved: <strong>${rec.estimated_avoided_cost}</strong>
                  </p>
                  {rec.required_parts && (
                    <p className="text-[11px] text-slate-500 mt-1">Required: {rec.required_parts}</p>
                  )}
                </div>

                {(rec.human_status === 'Pending' || rec.status === 'Pending Review' || !rec.human_status) && (
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => handleApprove(rec.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-all shadow-2xs"
                    >
                      Approve Work Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Maintenance Logbook */}
      <div className="industrial-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Historical Maintenance Logbook</span>
          <span className="text-xs text-slate-400 font-normal">{records.length} records recorded</span>
        </div>

        {/* Mobile View (< md) */}
        <div className="divide-y divide-slate-100 md:hidden">
          {records.map((r) => (
            <div key={r.id} className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{r.machine_id}</span>
                <span className="text-slate-400 font-mono text-[11px]">{new Date(r.date).toLocaleDateString()}</span>
              </div>
              <p className="font-semibold text-slate-800">{r.issue}</p>
              <p className="text-slate-600 text-[11px]">{r.action_taken}</p>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span>Tech: <strong>{r.technician_name}</strong></span>
                <span>Downtime: <strong>{r.downtime_hours}h</strong></span>
                <span className="font-bold text-slate-900 font-mono">${r.cost}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="p-4">Date</th>
                <th className="p-4">Machine</th>
                <th className="p-4">Technician</th>
                <th className="p-4">Issue & Action</th>
                <th className="p-4">Parts Replaced</th>
                <th className="p-4 text-center">Downtime (hrs)</th>
                <th className="p-4 text-right">Cost ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-900">{r.machine_id}</td>
                  <td className="p-4">{r.technician_name}</td>
                  <td className="p-4 max-w-xs">
                    <span className="font-semibold text-slate-900 block">{r.issue}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{r.action_taken}</span>
                  </td>
                  <td className="p-4">{r.parts_replaced || 'N/A'}</td>
                  <td className="p-4 text-center font-mono font-semibold">{r.downtime_hours}</td>
                  <td className="p-4 text-right font-mono font-bold text-slate-900">${r.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Log Maintenance Record</h2>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Machine Target ID</label>
                <input
                  type="text"
                  required
                  value={formData.machine_id}
                  onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Issue Description</label>
                <input
                  type="text"
                  required
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Taken & Procedures</label>
                <textarea
                  required
                  value={formData.action_taken}
                  onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium h-20 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Downtime (hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.downtime_hours}
                    onChange={(e) => setFormData({ ...formData, downtime_hours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
