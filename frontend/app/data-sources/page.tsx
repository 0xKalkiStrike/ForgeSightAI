'use client';

import { useState } from 'react';
import { Database, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, Code, Download, Server } from 'lucide-react';
import { uploadCsvTelemetry, getWsUrl } from '@/lib/api';
import { useToast } from '@/components/ToastContext';

export default function DataSourcesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    toast.info(`Uploading '${file.name}' for SCADA schema validation...`, 'Ingestion Started');

    try {
      const data = await uploadCsvTelemetry(file);
      setUploadResult(data);
      toast.success(
        `Successfully ingested ${data.records_imported || 0} telemetry readings.`,
        'Dataset Ingested'
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to ingest CSV dataset.', 'Upload Error');
    } finally {
      setUploading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'timestamp,machine_id,temperature,vibration,pressure,rpm,load,energy\n' +
      '2026-10-14T10:00:00,M-104,68.5,4.8,102.0,1800,72.0,14.2\n' +
      '2026-10-14T10:05:00,M-104,74.2,6.5,98.5,1805,78.0,15.8\n' +
      '2026-10-14T10:10:00,M-104,81.0,8.4,96.0,1810,84.0,17.4\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'forgesight_telemetry_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Downloaded ForgeSight SCADA CSV template.', 'Template Downloaded');
  };

  const wsUrl = getWsUrl();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Industrial Data Center & Telemetry Ingestion</h1>
          <p className="text-xs text-slate-500">Production SCADA, CSV dataset ingestion, and IoT REST/WebSocket pipelines</p>
        </div>

        <button
          onClick={downloadCsvTemplate}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Download Telemetry CSV Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Upload Section */}
        <div className="industrial-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">SCADA & Sensor CSV Dataset Ingestion</h2>
          </div>

          <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 sm:p-8 text-center space-y-3 transition-all bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-800">Select plant sensor CSV dataset</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Required fields: timestamp, machine_id, temperature, vibration, pressure, rpm</p>
            </div>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-600 mx-auto cursor-pointer max-w-full"
            />
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {uploading ? 'Validating & Importing...' : `Upload & Ingest '${file.name}'`}
            </button>
          )}

          {uploadResult && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dataset Successfully Ingested</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2 text-emerald-800 font-semibold">
                <div className="p-2 bg-white/70 rounded-lg border border-emerald-100">
                  <span className="text-[10px] block uppercase text-emerald-600">Imported</span>
                  <span className="text-sm font-bold">{uploadResult.records_imported ?? 0}</span>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-emerald-100">
                  <span className="text-[10px] block uppercase text-emerald-600">Invalid</span>
                  <span className="text-sm font-bold">{uploadResult.invalid_records ?? 0}</span>
                </div>
                <div className="p-2 bg-white/70 rounded-lg border border-emerald-100">
                  <span className="text-[10px] block uppercase text-emerald-600">Missing Fields</span>
                  <span className="text-sm font-bold">{uploadResult.missing_fields ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* IoT Integration Schema */}
        <div className="industrial-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Code className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Live IoT Telemetry Gateway</h2>
          </div>

          <p className="text-xs text-slate-600">
            Connect industrial SCADA systems or OPC-UA IoT gateways directly to ForgeSight AI production endpoints.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-800 block text-[11px] uppercase mb-1">REST Sensor Ingestion API</span>
              <div className="bg-slate-900 text-amber-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                POST /api/data-sources/upload-csv
                <br />
                Headers: Authorization: Bearer &lt;JWT_TOKEN&gt;
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-800 block text-[11px] uppercase mb-1">WebSocket Live Telemetry Stream</span>
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto flex items-center justify-between">
                <span>{wsUrl}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
