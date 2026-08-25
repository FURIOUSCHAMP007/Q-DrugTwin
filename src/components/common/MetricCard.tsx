import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: {
    text: string;
    type: 'positive' | 'negative' | 'neutral' | 'warning';
  };
  accentColor?: 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber' | 'sky';
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  accentColor = 'cyan',
  badge,
  onClick
}) => {
  const accentStyles = {
    cyan: {
      border: 'border-cyan-200 hover:border-cyan-400',
      iconBg: 'bg-cyan-50 text-cyan-600 border border-cyan-200 shadow-xs',
      glow: 'hover:shadow-cyan-100'
    },
    violet: {
      border: 'border-purple-200 hover:border-purple-400',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200 shadow-xs',
      glow: 'hover:shadow-purple-100'
    },
    emerald: {
      border: 'border-emerald-200 hover:border-emerald-400',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-xs',
      glow: 'hover:shadow-emerald-100'
    },
    rose: {
      border: 'border-rose-200 hover:border-rose-400',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs',
      glow: 'hover:shadow-rose-100'
    },
    amber: {
      border: 'border-amber-200 hover:border-amber-400',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200 shadow-xs',
      glow: 'hover:shadow-amber-100'
    },
    sky: {
      border: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs',
      glow: 'hover:shadow-blue-100'
    }
  };

  const style = accentStyles[accentColor] || accentStyles.sky;

  const trendColorMap = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    negative: 'text-rose-700 bg-rose-50 border-rose-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    neutral: 'text-slate-600 bg-slate-100 border-slate-200'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4.5 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-md ${style.border} flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex items-center justify-between z-10">
        <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} transition-transform group-hover:scale-110`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-2.5 z-10">
        <div>
          <span className="text-2xl font-extrabold font-mono text-[#0F172A] tracking-tight leading-none">
            {value}
          </span>
          {subValue && (
            <span className="text-[11px] text-slate-500 block mt-1 font-medium">
              {subValue}
            </span>
          )}
        </div>

        {trend && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${trendColorMap[trend.type]}`}>
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};

