import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { HISTORICAL_PRODUCTION, generateForecast, CONTRIBUTING_FACTORS } from '@/data/productionData';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

type Range = '7d' | '30d' | '90d';

export default function Production() {
  const [range, setRange] = useState<Range>('30d');
  const [rainfallMod, setRainfallMod] = useState(0);

  const rangeDays: Record<Range, number> = { '7d': 7, '30d': 30, '90d': 90 };
  const forecast = generateForecast(rangeDays[range], rainfallMod);

  const chartData = forecast.map(p => ({
    date: new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    predicted: p.predicted,
    lower: [p.lower, p.upper],
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
    <div className="flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Production Forecast</h1>
            <span className="demo-badge">SIMULATION DATA</span>
          </div>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">ML forecast model · XGBoost ensemble · 95% confidence interval shown</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Range filter */}
          <div className="flex bg-[hsl(var(--surface-2))] rounded-sm p-0.5">
            {(['7d', '30d', '90d'] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`px-3 py-1 rounded-sm text-[10px] font-medium transition-colors ${range === r ? 'bg-[hsl(var(--surface-4))] text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 border-b border-[hsl(var(--border))] shrink-0">
        {[
          { label: 'Avg Actual (30d)', value: avgActual.toLocaleString(), unit: 't/day', status: 'warning' },
          { label: 'Avg Planned (30d)', value: avgPlanned.toLocaleString(), unit: 't/day', status: 'normal' },
          { label: 'Plan Attainment', value: `${attainment}%`, status: Number(attainment) >= 95 ? 'good' : Number(attainment) >= 85 ? 'warning' : 'critical' },
          { label: 'Forecast Shortfall Risk', value: `${shortfallRisk}%`, status: Number(shortfallRisk) > 10 ? 'critical' : Number(shortfallRisk) > 5 ? 'warning' : 'good' },
        ].map((k, i) => (
          <div key={k.label} className={`px-4 py-2.5 ${i < 3 ? 'border-r border-[hsl(var(--border))]' : ''}`}>
            <div className="section-label">{k.label}</div>
            <div className={`text-base font-semibold tabular-nums mt-0.5 ${k.status === 'critical' ? 'text-[hsl(var(--red))]' : k.status === 'good' ? 'text-[hsl(var(--green))]' : k.status === 'warning' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-primary))]'}`}>
              {k.value} {k.unit && <span className="text-[10px] font-normal text-[hsl(var(--text-dim))]">{k.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Charts (left) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-4 space-y-4 border-r border-[hsl(var(--border))]">

          {/* Main forecast */}
          <div className="mangan-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Historical → Forecast</span>
              <div className="flex items-center gap-4 text-[9px] text-[hsl(var(--text-tertiary))]">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-px bg-[hsl(var(--amber))]" />
                  <span>Actual / Predicted</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-px border-t border-dashed border-[hsl(var(--text-dim))]" />
                  <span>Target 1,380 t/d</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[hsl(36_88%_48%/0.1)] border border-[hsl(36_88%_48%/0.2)] rounded-sm" />
                  <span>95% Confidence</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(36 88% 48%)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(36 88% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(210 6% 13%)" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={[800, 1550]} tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }} />
                <ReferenceLine y={1380} stroke="hsl(210 6% 28%)" strokeDasharray="6 3" strokeWidth={1.5} />
                <Area type="monotone" dataKey="lower" stroke="none" fill="url(#confGrad)" />
                <Line type="monotone" dataKey="predicted" stroke="hsl(36 88% 48%)" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: 'hsl(36 88% 48%)' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Daily bar — actual vs planned */}
          <div className="mangan-card p-4">
            <div className="section-label mb-3">Daily Production vs Planned — Last 30 Days</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={dailyData} margin={{ top: 0, right: 8, left: -8, bottom: 0 }} barSize={6} barGap={1}>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis domain={[800, 1500]} tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} width={38} />
                <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }} />
                <ReferenceLine y={1380} stroke="hsl(210 6% 28%)" strokeDasharray="4 2" />
                <Bar dataKey="planned" fill="hsl(210 6% 18%)" radius={[1, 1, 0, 0]} name="Planned" />
                <Bar dataKey="actual" fill="hsl(36 88% 48%)" fillOpacity={0.8} radius={[1, 1, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right panel: contributing factors */}
        <div className="w-64 flex flex-col shrink-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[hsl(var(--border))] shrink-0">
            <div className="text-xs font-semibold text-[hsl(var(--text-primary))]">Contributing Factors</div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Production shortfall drivers</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {CONTRIBUTING_FACTORS.map(f => (
              <div key={f.factor}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[hsl(var(--text-secondary))]">{f.factor}</span>
                  <span className={`text-[11px] font-semibold tabular-nums ${f.impact < 0 ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--green))]'}`}>
                    {f.impact > 0 ? '+' : ''}{f.impact}%
                  </span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{
                    width: `${Math.abs(f.impact) * 5}%`,
                    background: f.impact < 0 ? 'hsl(0 68% 48%)' : 'hsl(150 45% 38%)',
                  }} />
                </div>
              </div>
            ))}

            <div className="border-t border-[hsl(var(--border))] pt-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3 h-3 text-[hsl(var(--amber))]" />
                <span className="text-[11px] font-medium text-[hsl(var(--amber))]">Net impact: -27%</span>
              </div>
              <p className="text-[10px] text-[hsl(var(--text-tertiary))] leading-relaxed">
                Combined effect of all negative factors. Shortfall probability 84% within 18 days.
              </p>
            </div>

            {/* Rainfall modifier */}
            <div className="border-t border-[hsl(var(--border))] pt-3">
              <div className="section-label mb-2">Rainfall Adjustment (What-if)</div>
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <span className="text-[hsl(var(--text-secondary))]">Rainfall modifier</span>
                <span className="font-semibold text-[hsl(var(--text-primary))] tabular-nums">{rainfallMod > 0 ? '+' : ''}{rainfallMod}mm</span>
              </div>
              <input type="range" min={-20} max={40} step={5} value={rainfallMod}
                onChange={e => setRainfallMod(Number(e.target.value))}
                className="w-full"
                style={{ background: `linear-gradient(to right, hsl(36 88% 48%) ${((rainfallMod + 20) / 60) * 100}%, hsl(210 6% 22%) ${((rainfallMod + 20) / 60) * 100}%)` }}
              />
              <div className="flex justify-between text-[9px] text-[hsl(var(--text-dim))] mt-0.5">
                <span>-20mm</span>
                <span>+40mm</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
