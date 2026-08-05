export function Badge({ children, variant = 'gray', className = '' }: { children: React.ReactNode, variant?: 'gray' | 'green' | 'blue' | 'amber' | 'red' | 'purple', className?: string }) {
  const variants = {
    gray: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    purple: 'bg-fuchsia-50 text-fuchsia-700',
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
