import { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { HISTORICAL_PRODUCTION, generateForecast, CONTRIBUTING_FACTORS } from '@/data/productionData';
import { TrendingDown, TrendingUp, AlertTriangle, ChevronDown } from 'lucide-react';

type Range = '7d' | '30d' | '90d';

export default function Production() {
  const [range, setRange] = useState<Range>('30d');
  const [rainfallMod, setRainfallMod] = useState(0);

  const rangeDays: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const forecast = generateForecast(rangeDays[range], rainfallMod);

  const chartData = forecast.map(p => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    predicted: p.predicted,
    lower: p.lower,
    upper: p.upper,
    target: p.target,
    isHistorical: p.isHistorical,
  }));

  const last30 = HISTORICAL_PRODUCTION.slice(-30);
  const avgActual = Math.round(last30.reduce((s, r) => s + r.actual, 0) / last30.length);
  const avgPlanned = Math.round(last30.reduce((s, r) => s + r.planned, 0) / last30.length);
  const attainment = ((avgActual / avgPlanned) * 100).toFixed(1);

  const dailyData = last30.map(r => ({
    date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    actual: r.actual,
    planned: r.planned,
    rainfall: r.rainfall,
    downtime: r.equipmentDowntime,
  }));

  const forecastOnly = forecast.filter(p => !p.isHistorical);
  const avgForecast = Math.round(forecastOnly.reduce((s, p) => s + p.predicted, 0) / (forecastOnly.length || 1));
  const shortfallRisk = avgForecast < 1380 ? ((1 - avgForecast / 1380) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Production Forecast</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">ML forecast model · XGBoost ensemble · <span className="demo-badge">SIMULATION DATA</span></p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${range === r ? 'bg-[hsl(var(--amber))] text-black' : 'border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--amber))]'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Avg Actual (30d)', value: avgActual.toLocaleString(), unit: 't/day', status: 'warning' },
          { label: 'Avg Planned (30d)', value: avgPlanned.toLocaleString(), unit: 't/day', status: 'normal' },
          { label: 'Plan Attainment', value: `${attainment}%`, status: Number(attainment) >= 95 ? 'good' : Number(attainment) >= 85 ? 'warning' : 'critical' },
          { label: 'Forecast Shortfall Risk', value: `${shortfallRisk}%`, status: Number(shortfallRisk) > 10 ? 'critical' : Number(shortfallRisk) > 5 ? 'warning' : 'good' },
        ].map(k => (
          <div key={k.label} className="mangan-card p-3">
            <div className="section-label">{k.label}</div>
            <div className={`text-xl font-semibold tabular-nums mt-1 ${k.status === 'critical' ? 'text-[hsl(var(--red))]' : k.status === 'good' ? 'text-[hsl(var(--green))]' : k.status === 'warning' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-primary))]'}`}>
              {k.value} {k.unit && <span className="text-xs font-normal text-[hsl(var(--text-tertiary))]">{k.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main forecast chart */}
      <div className="mangan-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Historical → Forecast → Target</span>
            <span className="ml-2 text-[10px] text-[hsl(var(--text-tertiary))]">Shaded area = 95% confidence interval</span>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-[hsl(var(--amber))]" /><span className="text-[hsl(var(--text-tertiary))]">Actual/Predicted</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-0.5 border-t-2 border-dashed border-[hsl(var(--text-tertiary))]" /><span className="text-[hsl(var(--text-tertiary))]">Target (1,380 t/d)</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38 92% 50%)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(220 12% 14%)" strokeDasharray="4 4" />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[800, 1500]} tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }}
            />
            <ReferenceLine y={1380} stroke="hsl(215 14% 36%)" strokeDasharray="6 3" strokeWidth={1.5} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="url(#confGrad)" />
            <Area type="monotone" dataKey="lower" stroke="none" fill="hsl(220 18% 7%)" />
            <Line type="monotone" dataKey="predicted" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'hsl(38 92% 50%)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom: daily production + contributing factors */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Daily bar chart */}
        <div className="mangan-card p-4">
          <div className="section-label mb-3">Daily Production vs Planned — Last 30 Days</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dailyData} margin={{ top: 0, right: 8, left: -8, bottom: 0 }} barSize={8}>
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[800, 1500]} tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} width={38} />
              <Tooltip
                contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }}
              />
              <Bar dataKey="planned" fill="hsl(215 14% 28%)" radius={[1, 1, 0, 0]} />
              <Bar dataKey="actual" fill="hsl(38 92% 50%)" fillOpacity={0.85} radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Contributing factors */}
        <div className="mangan-card p-3">
          <div className="section-label mb-3">Contributing Factors to Shortfall</div>
          <div className="space-y-2.5">
            {CONTRIBUTING_FACTORS.map(f => (
              <div key={f.factor}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[hsl(var(--text-secondary))]">{f.factor}</span>
                  <span className={`font-semibold tabular-nums ${f.impact < 0 ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--green))]'}`}>
                    {f.impact > 0 ? '+' : ''}{f.impact}%
                  </span>
                </div>
                <div className="h-1.5 bg-[hsl(var(--surface-3))] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.abs(f.impact) * 4}%`,
                      background: f.impact < 0 ? 'hsl(0 72% 51%)' : 'hsl(142 50% 42%)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
            <div className="flex items-center gap-1.5 text-[11px] text-[hsl(var(--amber))]">
              <AlertTriangle className="w-3 h-3" />
              Net production impact: <span className="font-semibold">-27%</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Shortfall probability: 84% within 18 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}
