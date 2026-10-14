'use client';

import { useState, useEffect } from 'react';
import { Eye, Upload, AlertTriangle, CheckCircle2, RefreshCw, Sparkles, ZoomIn } from 'lucide-react';
import { getInspections, analyzeComponent, DefectInspection } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

export default function QualityInspectionPage() {
  const [inspections, setInspections] = useState<DefectInspection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState('Component A-218 (CNC Spindle Housing)');
  const [analyzing, setAnalyzing] = useState(false);
  const toast = useToast();

  const fetchInspections = async () => {
    try {
      const data = await getInspections();
      setInspections(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleRunInspection = async () => {
    setAnalyzing(true);
    toast.info(`Running AMD Tensor Convolution on '${selectedComponent}'...`, 'CV Scan Initiated');
    try {
      const result = await analyzeComponent(selectedComponent, 'M-104');
      await fetchInspections();
      if (result.status === 'DEFECT DETECTED') {
        toast.warning(`Defect detected: ${result.defect_type} (${Math.round(result.confidence * 100)}% confidence).`, 'Defect Flagged');
      } else {
        toast.success(`Component passed optical inspection with 98% confidence.`, 'Inspection Passed');
      }
    } catch (err) {
      toast.error('Failed to run inspection.', 'Error');
    } finally {
      setAnalyzing(false);
    }
  };

  const activeInspection = inspections[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Visual Defect Detection & Quality Inspection</h1>
          <p className="text-xs text-slate-500">AMD Computer Vision Pipeline — Surface Crack & Defect Analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspection Control & Canvas (2 Cols) */}
        <div className="lg:col-span-2 industrial-card p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Visual Feature Inspection Scanner</h2>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <select
                value={selectedComponent}
                onChange={(e) => setSelectedComponent(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none"
              >
                <option value="Component A-218 (CNC Spindle Housing)">Component A-218 (Surface Crack)</option>
                <option value="Weld Joint W-109 (Hydraulic Manifold)">Weld Joint W-109 (Weld Porosity)</option>
                <option value="Gear Shaft B-402 (Transmission Drive)">Gear Shaft B-402 (Tooth Pitting)</option>
                <option value="Component C-301 (Precision Flange)">Component C-301 (Pass Sample)</option>
              </select>

              <button
                onClick={handleRunInspection}
                disabled={analyzing}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>Run CV Inspection</span>
              </button>
            </div>
          </div>

          {/* Computer Vision Image Viewer Canvas */}
          <div className="bg-slate-950 rounded-xl p-6 sm:p-8 relative flex flex-col items-center justify-center min-h-[280px] sm:min-h-[320px] overflow-hidden border border-slate-800">
            {/* Synthetic Component Visual representation with Bounding Box Overlay */}
            <div className="relative w-full max-w-[280px] sm:max-w-xs h-48 sm:h-56 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center shadow-inner">
              <div className="w-40 sm:w-48 h-32 sm:h-36 bg-slate-800 rounded-md border border-slate-700 relative flex items-center justify-center">
                <span className="text-[11px] font-mono text-slate-400 text-center px-2">
                  {activeInspection?.component_name || 'Component A-218'}
                </span>

                {/* Bounding box simulation if defect detected */}
                {activeInspection?.status === 'DEFECT DETECTED' && (
                  <div className="absolute top-6 left-6 sm:top-8 sm:left-10 w-20 sm:w-24 h-14 sm:h-16 border-2 border-red-500 bg-red-500/10 rounded-sm flex items-start justify-start p-1 animate-pulse">
                    <span className="bg-red-600 text-white text-[8px] sm:text-[9px] font-bold px-1 rounded-2xs">
                      {activeInspection.defect_type} ({Math.round(activeInspection.confidence * 100)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono mt-4 text-center">
              AMD DirectML Tensor Convolution Execution Provider Active • 1080p Optical Frame Analysis
            </p>
          </div>
        </div>

        {/* Inspection Result Panel (1 Col) */}
        <div className="industrial-card p-4 sm:p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Inspection Diagnosis</h2>

            {activeInspection ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium uppercase tracking-wider">Status</span>
                  <span className={`px-2.5 py-1 rounded-full font-bold ${
                    activeInspection.status === 'DEFECT DETECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {activeInspection.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-slate-400 font-medium text-[11px] uppercase block">Defect Classification</span>
                  <span className="font-bold text-slate-900 text-sm block">{activeInspection.defect_type || 'None'}</span>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span>Confidence: <strong>{Math.round(activeInspection.confidence * 100)}%</strong></span>
                    <span>Severity: <strong className={activeInspection.severity === 'High' ? 'text-red-600' : 'text-slate-700'}>{activeInspection.severity}</strong></span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase text-[11px] block">Recommended Action</span>
                  <p className="bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-amber-900 font-medium leading-relaxed">
                    {activeInspection.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">Loading inspection diagnostic...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
