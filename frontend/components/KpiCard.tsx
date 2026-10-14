import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBg?: string;
  onClick?: () => void;
}

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendType = 'positive',
  icon: Icon,
  iconBg = 'bg-amber-500/10 text-amber-600',
  onClick
}: KpiCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`industrial-card p-5 flex flex-col justify-between ${onClick ? 'cursor-pointer industrial-card-hover' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">{value}</div>
        {(subtitle || trend) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {trend && (
              <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-sm ${
                trendType === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                trendType === 'negative' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-slate-100 text-slate-600'
              }`}>
                {trend}
              </span>
            )}
            {subtitle && <span className="text-[11px] text-slate-500 truncate">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
