import React from 'react';

interface ConfidenceGaugeProps {
  score: number; // 0-100
  size?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet';
  showUncertainty?: boolean;
  uncertaintyMargin?: number; // e.g. ±3.5%
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  score,
  size = 140,
  label = 'Suitability Score',
  sublabel,
  colorScheme = 'cyan',
  showUncertainty = true,
  uncertaintyMargin = 3.8
}) => {
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const gradId = `gauge-gradient-${colorScheme}-${size}`;

  const gradientMap = {
    cyan: { start: '#2563EB', end: '#22D3EE', glow: 'rgba(34, 211, 238, 0.4)' },
    emerald: { start: '#059669', end: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    amber: { start: '#D97706', end: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
    rose: { start: '#DC2626', end: '#F43F5E', glow: 'rgba(244, 63, 94, 0.4)' },
    violet: { start: '#7C3AED', end: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' }
  };

  const scheme = gradientMap[colorScheme] || gradientMap.cyan;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={scheme.start} />
              <stop offset="100%" stopColor={scheme.end} />
            </linearGradient>
          </defs>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EEF4FF"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Value circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 2px 6px ${scheme.glow})`
            }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold font-mono text-[#0F172A] tracking-tight">
            {score}
          </span>
          <span className="text-[10px] text-blue-600 uppercase font-mono font-bold tracking-wider">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-2.5">
        <p className="text-xs font-bold text-slate-800">{label}</p>
        {sublabel && <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{sublabel}</p>}
        {showUncertainty && (
          <p className="text-[10px] text-purple-600 font-mono mt-1 font-medium">
            Calibration Confidence: ±{uncertaintyMargin}%
          </p>
        )}
      </div>
    </div>
  );
};

