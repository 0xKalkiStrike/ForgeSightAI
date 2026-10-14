'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  UserCheck, 
  Menu, 
  Activity, 
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { triggerSimulationFailure, resetSimulation } from '@/lib/api';
import { useSidebar } from '@/components/SidebarContext';
import { useToast } from '@/components/ToastContext';

export default function Header() {
  const [role, setRole] = useState<'Manager' | 'Admin' | 'Engineer' | 'Operator'>('Manager');
  const [simulating, setSimulating] = useState(false);
  const [time, setTime] = useState('');
  const { toggleMobileOpen } = useSidebar();
  const toast = useToast();

  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateFailure = async () => {
    setSimulating(true);
    toast.info('Triggering telemetry drift & thermal/vibration stress test on Machine M-104...', 'Stress Test Initiated');
    try {
      await triggerSimulationFailure('M-104');
      setTimeout(() => {
        toast.warning('Machine M-104 failure risk elevated. Anomaly detector flagged bearing degradation.', 'Telemetry Anomaly Detected');
        setSimulating(false);
      }, 800);
    } catch (err: any) {
      toast.error('Simulation trigger failed. Verify backend connection.', 'Simulation Error');
      setSimulating(false);
    }
  };

  const handleResetSimulation = async () => {
    setSimulating(true);
    toast.info('Restoring Machine M-104 to nominal baseline operating conditions...', 'Resetting Baseline');
    try {
      await resetSimulation('M-104');
      setTimeout(() => {
        toast.success('Machine M-104 telemetry, health score, and risk window restored to nominal baseline.', 'Baseline Restored');
        setSimulating(false);
      }, 800);
    } catch (err: any) {
      toast.error('Baseline reset failed.', 'Reset Error');
      setSimulating(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs z-30">
      {/* Left: Mobile Menu Toggle & System Telemetry Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={toggleMobileOpen}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* SCADA Telemetry Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse shrink-0"></span>
          <span className="hidden sm:inline">SCADA Telemetry Engine</span>
          <span className="sm:hidden font-mono text-[11px]">SCADA</span>
        </div>

        {/* Operational Stress Testing Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-l border-slate-200 pl-2 sm:pl-4">
          <button
            onClick={handleSimulateFailure}
            disabled={simulating}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[11px] sm:text-xs font-bold rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider whitespace-nowrap"
            title="Inject failure scenario into machine M-104"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            <span className="hidden md:inline">Simulate Failure (M-104)</span>
            <span className="md:hidden">Simulate</span>
          </button>

          <button
            onClick={handleResetSimulation}
            disabled={simulating}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-[11px] sm:text-xs font-semibold rounded-lg border border-slate-300 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
            title="Reset telemetry and machine health back to nominal baseline"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>

      {/* Right: User Role & Plant Status */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="text-right hidden xl:block">
          <p className="text-xs font-semibold text-slate-700">Factory Operations Control</p>
          <p className="text-[11px] text-slate-400 font-mono">{time}</p>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 sm:p-1.5 rounded-lg border border-slate-200">
          <UserCheck className="w-3.5 h-3.5 text-slate-500 ml-1 shrink-0 hidden sm:inline" />
          <select
            value={role}
            onChange={(e: any) => {
              setRole(e.target.value);
              toast.info(`Switched active view to ${e.target.value} perspective.`, 'Role Updated');
            }}
            className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-700 border-none focus:outline-none cursor-pointer pr-1"
          >
            <option value="Manager">Manager (Marcus V.)</option>
            <option value="Admin">Admin (Sarah C.)</option>
            <option value="Engineer">Engineer (Rahul S.)</option>
            <option value="Operator">Operator (Alex R.)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
