'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  BookOpen, 
  Wrench, 
  Database, 
  BarChart3, 
  Zap, 
  FileText, 
  Settings,
  ShieldCheck,
  Activity,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSidebar } from '@/components/SidebarContext';

interface NavGroup {
  label: string;
  items: {
    name: string;
    href: string;
    icon: any;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Machines', href: '/machines', icon: Cpu },
      { name: 'Alert Center', href: '/alerts', icon: AlertTriangle, badge: 'Live' },
      { name: 'Predictive Risk', href: '/predictive', icon: TrendingUp },
    ],
  },
  {
    label: 'AI & Diagnostics',
    items: [
      { name: 'Quality Inspection', href: '/quality-inspection', icon: Eye },
      { name: 'Knowledge SOPs', href: '/knowledge', icon: BookOpen },
      { name: 'Maintenance Hub', href: '/maintenance', icon: Wrench },
    ],
  },
  {
    label: 'Infrastructure & Data',
    items: [
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'AMD Performance', href: '/amd-performance', icon: Zap },
      { name: 'Data Center', href: '/data-sources', icon: Database },
      { name: 'System Health', href: '/system-health', icon: Activity },
      { name: 'Audit Trail', href: '/audit-log', icon: FileText },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileOpen, closeMobile, isCollapsed, toggleCollapse } = useSidebar();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
        <Link 
          href="/" 
          onClick={closeMobile}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="bg-gradient-to-tr from-amber-500 to-red-600 p-2 rounded-xl text-white shadow-md shadow-amber-500/10 group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-extrabold text-base text-white tracking-tight leading-none">
                ForgeSight<span className="text-amber-500"> AI</span>
              </h1>
              <p className="text-[10px] text-amber-400/90 font-medium mt-1 uppercase tracking-wider truncate">
                Detect • Predict • Prevent
              </p>
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={closeMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close navigation menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!isCollapsed && (
              <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.label}
              </h2>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobile}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25 shadow-xs font-bold'
                        : 'hover:bg-slate-800/70 hover:text-slate-100 text-slate-400 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-2 py-2.5' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Hardware Acceleration & Collapse Footer */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {!isCollapsed ? (
          <div className="p-3 bg-slate-800/70 border border-slate-700/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 min-w-0">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="truncate">
                <span className="block text-[11px] font-bold text-white">AMD ROCm Engine</span>
                <span className="text-[10px] text-emerald-400 font-mono">Hardware Vectorized</span>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 live-pulse shrink-0"></div>
          </div>
        ) : (
          <div className="flex justify-center p-2 bg-slate-800/70 rounded-xl" title="AMD ROCm Engine Active">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex w-full items-center justify-center gap-2 py-1.5 px-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg text-[11px] font-medium transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out lg:hidden shadow-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
