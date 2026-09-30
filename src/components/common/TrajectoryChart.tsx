import React from 'react';
import { CheckInEntry } from '../../types';

interface TrajectoryChartProps {
  history: CheckInEntry[];
  baselineMean: number;
  showColorBands?: boolean;
  height?: number;
}

export const TrajectoryChart: React.FC<TrajectoryChartProps> = ({
  history,
  baselineMean,
  showColorBands = false,
  height = 230,
}) => {
  const width = 600;
  const paddingX = 32;
  const paddingTop = 20;
  const paddingBottom = 28;
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;
  const maxScore = 20;

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const getY = (val: number) =>
    paddingTop + innerHeight - (clamp(val, 0, maxScore) / maxScore) * innerHeight;

  const getX = (index: number) =>
    paddingX + (index / Math.max(1, history.length - 1)) * innerWidth;

  // Points on 20-scale
  const points = history.map((entry, i) => {
    const total = entry.mood + entry.sleep + entry.tension + entry.withdrawal + entry.intrusions;
    return {
      x: getX(i),
      y: getY(total),
      total,
      entry,
    };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const baselineY = getY(baselineMean);

  // Risk zone bands (0-5: Low green, 5-9: Moderate yellow, 9-13: Orange, 13-20: Red)
  const zones = [
    { from: 0, to: 5, color: '#3f9d78' },
    { from: 5, to: 9, color: '#d9a934' },
    { from: 9, to: 13, color: '#e07a3f' },
    { from: 13, to: 20, color: '#cf4b4b' },
  ];

  const lastPoint = points[points.length - 1];

  return (
    <div className="w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id="chartLineGradient" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#3f9d78" />
            <stop offset="30%" stopColor="#d9a934" />
            <stop offset="55%" stopColor="#e07a3f" />
            <stop offset="100%" stopColor="#cf4b4b" />
          </linearGradient>
        </defs>

        {/* Optional Risk Zones */}
        {showColorBands &&
          zones.map((z, idx) => {
            const yTop = getY(z.to);
            const yBottom = getY(z.from);
            const bandH = yBottom - yTop;
            return (
              <rect
                key={idx}
                x={paddingX}
                y={yTop}
                width={innerWidth}
                height={bandH}
                fill={z.color}
                opacity={0.12}
              />
            );
          })}

        {/* Shaded Personal Baseline Zone for Days 1-7 */}
        <rect
          x={paddingX}
          y={paddingTop}
          width={(6 / Math.max(1, history.length - 1)) * innerWidth}
          height={innerHeight}
          fill="currentColor"
          className="text-[#6fb59a]/10"
        />

        {/* Baseline Dashed Line */}
        <line
          x1={paddingX}
          x2={width - paddingX}
          y1={baselineY}
          y2={baselineY}
          stroke="#5a7580"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <text
          x={width - paddingX}
          y={baselineY - 5}
          textAnchor="end"
          fontSize="11"
          fontWeight="500"
          fill="#5a7580"
          className="font-mono"
        >
          own baseline ({baselineMean.toFixed(1)})
        </text>

        {/* Main Trajectory Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={showColorBands ? 'url(#chartLineGradient)' : '#2a7f8f'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current status pulse on the final day */}
        {lastPoint && (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="7"
              fill="#ffffff"
              stroke="#2a7f8f"
              strokeWidth="3"
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="2.5"
              fill="#2a7f8f"
            />
          </g>
        )}

        {/* X-axis Day ticks */}
        {[0, 6, 13, 20, Math.max(0, history.length - 1)].map((idx) => {
          if (!points[idx]) return null;
          return (
            <text
              key={idx}
              x={points[idx].x}
              y={height - 6}
              textAnchor="middle"
              fontSize="11"
              fill="#5a7580"
              fontWeight="500"
            >
              Day {idx + 1}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
