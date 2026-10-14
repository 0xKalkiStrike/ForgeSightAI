interface StatusBadgeProps {
  status: 'Healthy' | 'Warning' | 'Critical' | 'Offline' | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStyle = () => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200Dot bg-emerald-500';
      case 'Warning':
        return 'bg-amber-50 text-amber-700 border-amber-200Dot bg-amber-500';
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200Dot bg-red-500';
      case 'Offline':
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200Dot bg-slate-400';
    }
  };

  const [bgClass, dotClass] = getStyle().split('Dot ');

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bgClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      <span>{status}</span>
    </span>
  );
}
