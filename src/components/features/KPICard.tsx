import type { KPIMetric } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  metric: KPIMetric;
}

const STATUS_COLORS: Record<string, string> = {
  normal: 'text-[hsl(var(--text-primary))]',
  good: 'text-[hsl(var(--green))]',
  warning: 'text-[hsl(var(--amber))]',
  critical: 'text-[hsl(var(--red))]',
};

const STATUS_BG: Record<string, string> = {
  normal: '',
  good: 'border-[hsl(142_50%_42%/0.3)]',
  warning: 'border-[hsl(38_92%_50%/0.3)]',
  critical: 'border-[hsl(0_72%_51%/0.4)]',
};

export default function KPICard({ metric }: Props) {
  const valColor = STATUS_COLORS[metric.status];
  const borderClass = STATUS_BG[metric.status];

  return (
    <div className={`mangan-card p-3.5 flex flex-col gap-1 ${borderClass}`}>
      <div className="section-label">{metric.label}</div>
      <div className="flex items-end gap-1.5">
        <span className={`text-xl font-semibold tabular-nums leading-none ${valColor}`}>
          {metric.value}
        </span>
        {metric.unit && (
          <span className="text-xs text-[hsl(var(--text-tertiary))] mb-0.5">{metric.unit}</span>
        )}
      </div>
      {metric.change !== undefined && (
        <div className={`flex items-center gap-1 text-[11px] ${metric.change > 0 ? 'text-[hsl(var(--green))]' : metric.change < 0 ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--text-tertiary))]'}`}>
          {metric.change > 0 ? <TrendingUp className="w-3 h-3" /> : metric.change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
          {metric.changeLabel && <span className="text-[hsl(var(--text-tertiary))]">{metric.changeLabel}</span>}
        </div>
      )}
      {/* Mini sparkline */}
      {metric.trend && (
        <svg height="20" className="w-full mt-1">
          {metric.trend.map((v, i, arr) => {
            if (i === 0) return null;
            const min = Math.min(...arr), max = Math.max(...arr);
            const range = max - min || 1;
            const x1 = ((i - 1) / (arr.length - 1)) * 100;
            const x2 = (i / (arr.length - 1)) * 100;
            const y1 = 20 - ((arr[i - 1] - min) / range) * 16;
            const y2 = 20 - ((v - min) / range) * 16;
            return (
              <line key={i}
                x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2}
                stroke={metric.status === 'critical' ? 'hsl(0 72% 51%)' : metric.status === 'good' ? 'hsl(142 50% 42%)' : 'hsl(38 92% 50%)'}
                strokeWidth={1.5}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
}
