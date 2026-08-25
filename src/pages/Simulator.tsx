import { useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import { DEFAULT_SIMULATOR_PARAMS, runSimulation, generateSimChartData } from '@/data/simulatorData';
import type { SimulatorParams } from '@/types';
import { FlaskConical, Play, RotateCcw, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  inverted?: boolean;
}

function SliderRow({ label, value, min, max, step, unit, onChange, inverted }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const isHigh = pct > 66;
  const trackColor = inverted
    ? isHigh ? 'hsl(0 68% 48%)' : 'hsl(150 45% 38%)'
    : isHigh ? 'hsl(150 45% 38%)' : 'hsl(36 88% 48%)';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[hsl(var(--text-secondary))]">{label}</span>
        <span className="text-[11px] font-semibold tabular-nums text-[hsl(var(--text-primary))]">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{ background: `linear-gradient(to right, ${trackColor} ${pct}%, hsl(210 6% 20%) ${pct}%)` }}
      />
      <div className="flex justify-between text-[9px] text-[hsl(var(--text-dim))]">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function Simulator() {
  const [params, setParams] = useState<SimulatorParams>({ ...DEFAULT_SIMULATOR_PARAMS });
  const [result, setResult] = useState(runSimulation(DEFAULT_SIMULATOR_PARAMS));
  const [baseResult] = useState(runSimulation(DEFAULT_SIMULATOR_PARAMS));
  const [chartData, setChartData] = useState(generateSimChartData(DEFAULT_SIMULATOR_PARAMS));
  const [simulating, setSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const set = (key: keyof SimulatorParams) => (v: number) =>
    setParams(p => ({ ...p, [key]: v }));

  const runSim = () => {
    setSimulating(true);
    setTimeout(() => {
      const r = runSimulation(params);
      const c = generateSimChartData(params);
      setResult(r);
      setChartData(c);
      setSimulating(false);
      setHasRun(true);
      toast.success('Simulation complete', { description: `Projected production: ${r.productionPct.toFixed(1)}% of target` });
    }, 1400);
  };

  const reset = () => {
    setParams({ ...DEFAULT_SIMULATOR_PARAMS });
    setResult(runSimulation(DEFAULT_SIMULATOR_PARAMS));
    setChartData(generateSimChartData(DEFAULT_SIMULATOR_PARAMS));
    setHasRun(false);
  };

  const delta = result.productionPct - baseResult.productionPct;

  return (
    <div className="flex h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* ── Parameter controls (left) ───────────────────── */}
      <div className="w-64 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
        <div className="px-4 py-3 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <FlaskConical className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
            <h1 className="text-xs font-semibold text-[hsl(var(--text-primary))]">Simulation Parameters</h1>
          </div>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Adjust variables · Run deterministic model</p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          <SliderRow label="Rainfall (mm/month)" value={params.rainfall} min={0} max={150} step={5} unit="mm" onChange={set('rainfall')} inverted />
          <SliderRow label="Equipment Availability" value={params.equipmentAvailability} min={40} max={100} step={1} unit="%" onChange={set('equipmentAvailability')} />
          <SliderRow label="Equipment Downtime" value={params.equipmentDowntime} min={0} max={120} step={2} unit="h" onChange={set('equipmentDowntime')} inverted />
          <SliderRow label="Blasting Delay" value={params.blastingDelay} min={0} max={10} step={0.5} unit="d" onChange={set('blastingDelay')} inverted />
          <SliderRow label="Mining Rate" value={params.miningRate} min={600} max={1800} step={10} unit="t/d" onChange={set('miningRate')} />
          <SliderRow label="Workforce Avail." value={params.workforceAvailability} min={50} max={100} step={1} unit="%" onChange={set('workforceAvailability')} />
          <SliderRow label="Production Target" value={params.productionTarget} min={800} max={2000} step={20} unit="t/d" onChange={set('productionTarget')} />
        </div>

        <div className="px-4 py-3 border-t border-[hsl(var(--border))] flex gap-2">
          <button onClick={reset} className="btn-secondary flex-1 justify-center">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button onClick={runSim} disabled={simulating} className="btn-primary flex-1 justify-center">
            <Play className="w-3 h-3" />
            {simulating ? 'Running...' : 'Simulate'}
          </button>
        </div>
      </div>

      {/* ── Results area (right) ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Scenario comparison strip */}
        <div className="grid grid-cols-4 border-b border-[hsl(var(--border))] shrink-0">
          <div className="px-4 py-2.5 border-r border-[hsl(var(--border))]">
            <div className="section-label mb-0.5">Baseline Scenario</div>
            <div className="text-xl font-semibold tabular-nums text-[hsl(var(--amber))]">{baseResult.productionPct.toFixed(1)}%</div>
            <div className="text-[10px] text-[hsl(var(--text-dim))]">{(baseResult.production / 30).toFixed(0)} t/day</div>
          </div>
          <div className={`px-4 py-2.5 border-r border-[hsl(var(--border))] ${hasRun && result.productionPct >= 100 ? 'bg-[hsl(150_45%_38%/0.04)]' : hasRun && result.productionPct < 85 ? 'bg-[hsl(0_68%_48%/0.04)]' : ''}`}>
            <div className="section-label mb-0.5">Modified Scenario</div>
            <div className={`text-xl font-semibold tabular-nums ${result.productionPct >= 100 ? 'text-[hsl(var(--green))]' : result.productionPct >= 90 ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--red))]'}`}>
              {result.productionPct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[hsl(var(--text-dim))]">{(result.production / 30).toFixed(0)} t/day</div>
          </div>
          <div className="px-4 py-2.5 border-r border-[hsl(var(--border))]">
            <div className="section-label mb-0.5">Delta vs Baseline</div>
            <div className={`text-xl font-semibold tabular-nums flex items-center gap-1 ${delta >= 0 ? 'text-[hsl(var(--green))]' : 'text-[hsl(var(--red))]'}`}>
              {delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[hsl(var(--text-dim))]">{hasRun ? 'Updated' : 'Run simulation'}</div>
          </div>
          <div className="px-4 py-2.5">
            <div className="section-label mb-0.5">Shortfall Risk</div>
            <div className={`text-xl font-semibold tabular-nums ${result.shortfallProbability > 0.6 ? 'text-[hsl(var(--red))]' : result.shortfallProbability > 0.3 ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--green))]'}`}>
              {(result.shortfallProbability * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-[hsl(var(--text-dim))]">probability</div>
          </div>
        </div>

        {/* Main simulation chart */}
        <div className="flex-1 min-h-0 p-4 flex flex-col gap-4 overflow-y-auto">
          <div className="mangan-card p-4 flex-none">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">30-Day Production Simulation</span>
              <div className="flex items-center gap-3 text-[9px] text-[hsl(var(--text-tertiary))]">
                <div className="flex items-center gap-1"><div className="w-6 h-2 bg-[hsl(210_6%_18%)]" /><span>Baseline</span></div>
                <div className="flex items-center gap-1"><div className="w-6 h-px bg-[hsl(var(--amber))]" /><span>Simulated</span></div>
                {simulating && <div className="flex items-center gap-1 text-[hsl(var(--amber))]"><div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--amber))] animate-pulse" /><span>Computing...</span></div>}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="hsl(210 6% 13%)" strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false}
                  label={{ value: 'Day', position: 'insideBottom', offset: -2, fontSize: 9, fill: 'hsl(210 6% 36%)' }} />
                <YAxis domain={[600, 1800]} tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }} />
                <ReferenceLine y={params.productionTarget} stroke="hsl(210 6% 28%)" strokeDasharray="6 3" strokeWidth={1.5}
                  label={{ value: 'Target', position: 'right', fontSize: 9, fill: 'hsl(210 6% 46%)' }} />
                <Bar dataKey="baseline" fill="hsl(210 6% 18%)" name="Baseline" radius={[1, 1, 0, 0]} />
                <Line type="monotone" dataKey="simulated" stroke="hsl(36 88% 48%)" strokeWidth={1.5} dot={false} name="Simulated" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Additional metrics */}
          <div className="grid grid-cols-3 gap-3 flex-none">
            {[
              { label: 'Reserve Life', value: `${result.reserveConsumption}y`, color: 'text-[hsl(var(--text-primary))]' },
              { label: 'Op. Cost (₹L/month)', value: result.operationalCost.toLocaleString(), color: 'text-[hsl(var(--text-primary))]' },
              { label: 'Est. Mine Life End', value: result.estimatedCompletion, color: 'text-[hsl(var(--text-primary))]' },
            ].map(k => (
              <div key={k.label} className="mangan-card px-3 py-2.5">
                <div className="section-label">{k.label}</div>
                <div className={`text-base font-semibold tabular-nums mt-0.5 ${k.color}`}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* AI recommendations (shown after running) */}
          {hasRun && (
            <div className="mangan-card p-4 flex-none">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-[hsl(var(--amber))]" />
                <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">AI Recommended Plan</span>
                <span className="text-[9px] text-[hsl(var(--text-tertiary))]">— Based on simulation results</span>
                <span className="demo-badge ml-auto">SIMULATION</span>
              </div>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className={`flex items-start gap-2.5 p-2.5 rounded-sm ${rec.priority === 'high' ? 'bg-[hsl(36_88%_48%/0.06)] border border-[hsl(36_88%_48%/0.2)]' : 'bg-[hsl(var(--surface-2))]'}`}>
                    <div className={`mt-0.5 text-[10px] font-bold w-4 h-4 rounded-sm flex items-center justify-center shrink-0 ${rec.priority === 'high' ? 'bg-[hsl(var(--amber))] text-[hsl(210_8%_6%)]' : 'bg-[hsl(var(--surface-3))] text-[hsl(var(--text-tertiary))]'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-[hsl(var(--text-primary))] leading-tight mb-0.5">{rec.action}</div>
                      <div className="flex items-center gap-2">
                        {rec.zone && <span className="text-[9px] text-[hsl(var(--text-dim))]">{rec.zone}</span>}
                        <span className="text-[10px] font-semibold text-[hsl(var(--green))]">+{rec.impact.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
                <span className="text-[11px] text-[hsl(var(--text-secondary))]">
                  Expected combined improvement: <strong className="text-[hsl(var(--green))]">+{result.recommendations.reduce((s, r) => s + r.impact, 0).toFixed(1)}%</strong>
                </span>
                <span className="text-[9px] text-[hsl(var(--text-dim))]">Confidence: 87% · Recommendation Engine v1.8</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
