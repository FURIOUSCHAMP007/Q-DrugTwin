import React from 'react';

export interface RadarDataPoint {
  axis: string;
  value: number; // 0 to 100
  secondaryValue?: number; // 0 to 100 for comparison
}

interface RadarChartProps {
  data: RadarDataPoint[];
  size?: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  primaryColor?: string; // hex or rgb
  secondaryColor?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 280,
  primaryLabel = 'Candidate Regimen',
  secondaryLabel = 'Baseline State',
  primaryColor = '#2563EB', // electric blue
  secondaryColor = '#7C3AED' // primary purple
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.72;
  const totalAxes = data.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Helper to convert polar coordinates to cartesian
  const getCoordinates = (value: number, index: number) => {
    const normalizedValue = Math.max(0, Math.min(100, value)) / 100;
    const currentRadius = radius * normalizedValue;
    const angle = angleSlice * index - Math.PI / 2;
    return {
      x: center + currentRadius * Math.cos(angle),
      y: center + currentRadius * Math.sin(angle)
    };
  };

  // Build polygons
  const primaryPoints = data
    .map((d, i) => {
      const coord = getCoordinates(d.value, i);
      return `${coord.x},${coord.y}`;
    })
    .join(' ');

  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const secondaryPoints = hasSecondary
    ? data
        .map((d, i) => {
          const coord = getCoordinates(d.secondaryValue ?? 0, i);
          return `${coord.x},${coord.y}`;
        })
        .join(' ')
    : '';

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background Grid Rings */}
        {levels.map((level, lvlIdx) => {
          const r = radius * level;
          const points = data
            .map((_, i) => {
              const angle = angleSlice * i - Math.PI / 2;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            })
            .join(' ');

          return (
            <polygon
              key={`ring-${lvlIdx}`}
              points={points}
              className="fill-[#F8FAFF]/60 stroke-blue-200/70"
              strokeWidth="1"
            />
          );
        })}

        {/* Radial Axis Lines */}
        {data.map((_, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-blue-200/80"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          );
        })}

        {/* Secondary Polygon (e.g. Baseline) */}
        {hasSecondary && (
          <polygon
            points={secondaryPoints}
            fill={secondaryColor}
            fillOpacity="0.12"
            stroke={secondaryColor}
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="transition-all duration-500 ease-out"
          />
        )}

        {/* Primary Polygon (Candidate) */}
        <polygon
          points={primaryPoints}
          fill={primaryColor}
          fillOpacity="0.2"
          stroke={primaryColor}
          strokeWidth="2"
          className="transition-all duration-500 ease-out"
          style={{
            filter: 'drop-shadow(0 2px 6px rgba(37, 99, 235, 0.25))'
          }}
        />

        {/* Primary Data Points Nodes */}
        {data.map((d, i) => {
          const coord = getCoordinates(d.value, i);
          return (
            <circle
              key={`point-p-${i}`}
              cx={coord.x}
              cy={coord.y}
              r="4"
              fill={primaryColor}
              className="stroke-white stroke-2 shadow-xs"
            />
          );
        })}

        {/* Axis Labels */}
        {data.map((d, i) => {
          const angle = angleSlice * i - Math.PI / 2;
          const labelRadius = radius + 20;
          const lx = center + labelRadius * Math.cos(angle);
          const ly = center + labelRadius * Math.sin(angle);

          // Anchor alignment based on angle
          let textAnchor = 'middle';
          if (Math.cos(angle) > 0.3) textAnchor = 'start';
          if (Math.cos(angle) < -0.3) textAnchor = 'end';

          return (
            <text
              key={`label-${i}`}
              x={lx}
              y={ly}
              textAnchor={textAnchor}
              dominantBaseline="central"
              className="fill-slate-600 text-[10px] font-mono font-semibold tracking-tight"
            >
              {d.axis}
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center space-x-6 mt-3 text-xs font-mono">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: primaryColor }} />
          <span className="text-blue-700 font-bold">{primaryLabel}</span>
        </div>
        {hasSecondary && (
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: secondaryColor }} />
            <span className="text-purple-700 font-bold">{secondaryLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

