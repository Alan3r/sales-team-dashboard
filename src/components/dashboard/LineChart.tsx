import { useState } from 'react';

interface DataPoint {
  x: string;
  y: number;
}

interface Series {
  name: string;
  data: DataPoint[];
  color: string;
}

interface LineChartProps {
  series: Series[];
  title: string;
}

export function LineChart({ series, title }: LineChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const width = 800;
  const height = 400;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const allData = series.flatMap(s => s.data);
  const maxY = Math.max(...allData.map(d => d.y), 1);
  const xLabels = [...new Set(allData.map(d => d.x))].sort();

  const getX = (index: number) => padding.left + (index / (xLabels.length - 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - (value / maxY) * chartHeight;

  return (
    <div className="card-surface p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => {
            const y = padding.top + (i / 4) * chartHeight;
            return (
              <line
                key={i}
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="hsl(var(--border))"
                strokeDasharray="4"
                strokeWidth="1"
              />
            );
          })}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = Math.round(maxY * (1 - i / 4));
            const y = padding.top + (i / 4) * chartHeight;
            return (
              <text
                key={i}
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                {value}
              </text>
            );
          })}

          {/* X-axis labels */}
          {xLabels.map((label, i) => (
            <text
              key={label}
              x={getX(i)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              {label}
            </text>
          ))}

          {/* Lines and points */}
          {series.map((s, seriesIndex) => {
            const points = s.data
              .map(d => {
                const xIndex = xLabels.indexOf(d.x);
                return { x: getX(xIndex), y: getY(d.y), value: d.y, label: d.x };
              })
              .filter(p => !isNaN(p.x) && !isNaN(p.y));

            const pathData = points.map((p, i) => 
              `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
            ).join(' ');

            return (
              <g key={seriesIndex}>
                <path
                  d={pathData}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill={s.color}
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top,
                        text: `${s.name}: ${p.value}`,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed bg-card border border-border rounded px-3 py-2 text-sm shadow-lg pointer-events-none z-50"
            style={{
              left: `${tooltip.x}px`,
              top: `${tooltip.y - 40}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-sm text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
