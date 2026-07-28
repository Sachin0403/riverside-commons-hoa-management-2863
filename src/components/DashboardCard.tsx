import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'navy' | 'amber' | 'emerald' | 'red';
}

const colorMap = {
  navy: 'bg-navy/10 text-navy dark:bg-navy-light/20 dark:text-blue-300',
  amber: 'bg-amber/10 text-amber-dark dark:bg-amber/20 dark:text-amber-light',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const DashboardCard = ({ title, value, subtitle, icon: Icon, color = 'navy' }: Props) => {
  return (
    <div className="glass-strong rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]} transition-transform duration-200 group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
