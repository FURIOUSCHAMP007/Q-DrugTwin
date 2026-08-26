import React from 'react';

interface RadialConfidenceMeterProps {
  score: number; // 0 - 100
  size?: number; // width/height in px
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  variant?: 'purple' | 'emerald' | 'amber' | 'rose' | 'blue';
  showDetails?: boolean;
  metrics?: {
    pathwayDisruption?: number;
    evidenceStrength?: number;
    kineticConcordance?: number;
  };
}

export const RadialConfidenceMeter: React.FC<RadialConfidenceMeterProps> = ({
  score,
  size = 90,
  strokeWidth = 7,
  label = 'Confidence',
  subLabel,
  variant = 'purple',
  showDetails = false,
  metrics
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Color schemes
  const colorMap = {
    purple: {
      gradientStart: '#9333ea', // purple-600
      gradientEnd: '#3b82f6',   // blue-500
      text: 'text-purple-700',
      track: '#EDE9FE',
      glow: 'rgba(147, 51, 234, 0.15)'
    },
    emerald: {
      gradientStart: '#10b981', // emerald-500
      gradientEnd: '#06b6d4',   // cyan-500
      text: 'text-emerald-700',
      track: '#D1FAE5',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    amber: {
      gradientStart: '#f59e0b', // amber-500
      gradientEnd: '#f97316',   // orange-500
      text: 'text-amber-700',
      track: '#FEF3C7',
      glow: 'rgba(245, 158, 11, 0.15)'
    },
    rose: {
      gradientStart: '#e11d48', // rose-600
      gradientEnd: '#be123c',   // rose-700
      text: 'text-rose-700',
      track: '#FFE4E6',
      glow: 'rgba(225, 29, 72, 0.15)'
    },
    blue: {
      gradientStart: '#2563eb', // blue-600
      gradientEnd: '#4f46e5',   // indigo-600
      text: 'text-blue-700',
      track: '#DBEAFE',
      glow: 'rgba(37, 99, 235, 0.15)'
    }
  };

  const scheme = colorMap[variant] || colorMap.purple;
  const gradientId = `radial-grad-${variant}-${Math.round(score)}-${size}`;

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(0 2px 6px ${scheme.glow})` }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={scheme.gradientStart} />
              <stop offset="100%" stopColor={scheme.gradientEnd} />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scheme.track}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />

          {/* Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none pointer-events-none">
          <span
            className="font-mono font-bold text-[#0F172A] tracking-tight"
            style={{ fontSize: size >= 90 ? '1.15rem' : '0.85rem' }}
          >
            {clampedScore}%
          </span>
          {label && (
            <span
              className="text-[9px] font-mono text-slate-500 uppercase font-semibold mt-0.5 tracking-wider"
              style={{ fontSize: size >= 90 ? '9px' : '7.5px' }}
            >
              {label}
            </span>
          )}
        </div>
      </div>

      {subLabel && (
        <span className="text-[10px] font-mono font-bold text-slate-600 mt-1">
          {subLabel}
        </span>
      )}

      {/* Optional Sub-metrics breakdown */}
      {showDetails && metrics && (
        <div className="w-full mt-2 pt-2 border-t border-slate-100 grid grid-cols-3 gap-1 text-center">
          {metrics.evidenceStrength !== undefined && (
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Evidence</span>
              <span className="text-[10px] font-mono font-bold text-purple-700">
                {metrics.evidenceStrength}%
              </span>
            </div>
          )}
          {metrics.pathwayDisruption !== undefined && (
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Disruption</span>
              <span className="text-[10px] font-mono font-bold text-rose-600">
                {metrics.pathwayDisruption}%
              </span>
            </div>
          )}
          {metrics.kineticConcordance !== undefined && (
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono text-slate-400 uppercase block">Concordance</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600">
                {metrics.kineticConcordance}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
