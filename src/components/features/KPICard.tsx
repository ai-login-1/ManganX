import type { KPIMetric } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  metric: KPIMetric;
  compact?: boolean;
}

const VALUE_COLORS: Record<string, string> = {
  normal:   'text-[hsl(var(--text-primary))]',
  good:     'text-[hsl(var(--green))]',
  warning:  'text-[hsl(var(--amber))]',
  critical: 'text-[hsl(var(--red))]',
};

const BORDER_COLORS: Record<string, string> = {
  normal:   '',
  good:     '',
  warning:  '',
  critical: 'border-t border-t-[hsl(0_68%_48%/0.5)]',
};

export default function KPICard({ metric }: Props) {
  const valColor = VALUE_COLORS[metric.status];
  const topBorder = BORDER_COLORS[metric.status];

  return (
    <div className={`bg-[hsl(var(--surface-1))] p-3 flex flex-col gap-1.5 ${topBorder}`}>
      <div className="section-label truncate">{metric.label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-lg font-semibold tabular-nums leading-none ${valColor}`}>
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-[10px] text-[hsl(var(--text-dim))]">{metric.unit}</span>
        )}
      </div>
      {metric.change !== undefined && (
        <div className={`flex items-center gap-0.5 text-[10px] ${metric.change > 0 ? 'text-[hsl(var(--green))]' : metric.change < 0 ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--text-tertiary))]'}`}>
          {metric.change > 0 ? <TrendingUp className="w-2.5 h-2.5" /> : metric.change < 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
          <span className="tabular-nums">{metric.change > 0 ? '+' : ''}{metric.change}%</span>
          {metric.changeLabel && <span className="text-[hsl(var(--text-dim))] ml-0.5">{metric.changeLabel}</span>}
        </div>
      )}
      {/* Compact sparkline */}
      {metric.trend && (
        <svg height="16" className="w-full">
          {metric.trend.map((v, i, arr) => {
            if (i === 0) return null;
            const min = Math.min(...arr), max = Math.max(...arr);
            const range = max - min || 1;
            const x1 = ((i - 1) / (arr.length - 1)) * 100;
            const x2 = (i / (arr.length - 1)) * 100;
            const y1 = 14 - ((arr[i - 1] - min) / range) * 12;
            const y2 = 14 - ((v - min) / range) * 12;
            return (
              <line key={i}
                x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2}
                stroke={metric.status === 'critical' ? 'hsl(0 68% 48%)' : metric.status === 'good' ? 'hsl(150 45% 38%)' : 'hsl(36 88% 48%)'}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
