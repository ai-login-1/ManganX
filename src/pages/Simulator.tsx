import { useState, useEffect } from 'react';
import {
  ComposedChart, Area, Line, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Legend
} from 'recharts';
import {
  DEFAULT_SIMULATOR_PARAMS, runSimulation, generateSimChartData
} from '@/data/simulatorData';
import type { SimulatorParams } from '@/types';
import { FlaskConical, Play, RotateCcw, TrendingUp, TrendingDown, Zap, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  inverted?: boolean; // lower is better
}

function SliderRow({ label, value, min, max, step, unit, onChange, inverted }: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const isHigh = pct > 66;
  const color = inverted
    ? isHigh ? 'bg-[hsl(var(--red))]' : 'bg-[hsl(var(--green))]'
    : isHigh ? 'bg-[hsl(var(--green))]' : 'bg-[hsl(var(--amber))]';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[hsl(var(--text-secondary))]">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-[hsl(var(--text-primary))]">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, hsl(38 92% 50%) ${pct}%, hsl(220 12% 22%) ${pct}%)` }}
      />
      <div className="flex justify-between text-[9px] text-[hsl(var(--text-tertiary))]">
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
    }, 1500);
  };

  const reset = () => {
    setParams({ ...DEFAULT_SIMULATOR_PARAMS });
    setResult(runSimulation(DEFAULT_SIMULATOR_PARAMS));
    setChartData(generateSimChartData(DEFAULT_SIMULATOR_PARAMS));
    setHasRun(false);
  };

  const delta = result.productionPct - baseResult.productionPct;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Mine Simulator — What-If Analysis</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">
            Adjust parameters · Run ML simulation · View AI recommendations · <span className="demo-badge">SIMULATION DATA</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--amber))] transition-colors">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button onClick={runSim} disabled={simulating}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[hsl(var(--amber))] text-black text-xs font-semibold hover:bg-[hsl(38_92%_44%)] disabled:opacity-60 transition-colors">
            <Play className="w-3 h-3" />
            {simulating ? 'Simulating...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-4">
        {/* Controls */}
        <div className="mangan-card p-4 space-y-4">
          <div className="section-label">Simulation Parameters</div>

          <SliderRow label="Rainfall (mm/month)" value={params.rainfall} min={0} max={150} step={5} unit="mm" onChange={set('rainfall')} inverted />
          <SliderRow label="Equipment Availability" value={params.equipmentAvailability} min={40} max={100} step={1} unit="%" onChange={set('equipmentAvailability')} />
          <SliderRow label="Equipment Downtime" value={params.equipmentDowntime} min={0} max={120} step={2} unit="h" onChange={set('equipmentDowntime')} inverted />
          <SliderRow label="Blasting Delay" value={params.blastingDelay} min={0} max={10} step={0.5} unit="d" onChange={set('blastingDelay')} inverted />
          <SliderRow label="Mining Rate" value={params.miningRate} min={600} max={1800} step={10} unit="t/d" onChange={set('miningRate')} />
          <SliderRow label="Workforce Availability" value={params.workforceAvailability} min={50} max={100} step={1} unit="%" onChange={set('workforceAvailability')} />
          <SliderRow label="Production Target" value={params.productionTarget} min={800} max={2000} step={20} unit="t/d" onChange={set('productionTarget')} />
        </div>

        {/* Results + Chart */}
        <div className="flex flex-col gap-4">
          {/* Scenario comparison */}
          <div className="grid grid-cols-3 gap-3">
            <div className="mangan-card p-3">
              <div className="section-label mb-1">Baseline Scenario</div>
              <div className="text-2xl font-semibold tabular-nums text-[hsl(var(--amber))]">{baseResult.productionPct.toFixed(1)}%</div>
              <div className="text-[10px] text-[hsl(var(--text-tertiary))]">of target · {(baseResult.production / 30).toFixed(0)} t/day</div>
            </div>
            <div className={`mangan-card p-3 ${hasRun ? (result.productionPct >= 100 ? 'border-[hsl(142_50%_42%/0.4)]' : result.productionPct >= 90 ? 'border-[hsl(38_92%_50%/0.4)]' : 'border-[hsl(0_72%_51%/0.4)]') : ''}`}>
              <div className="section-label mb-1">Modified Scenario</div>
              <div className={`text-2xl font-semibold tabular-nums ${result.productionPct >= 100 ? 'text-[hsl(var(--green))]' : result.productionPct >= 90 ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--red))]'}`}>
                {result.productionPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[hsl(var(--text-tertiary))]">of target · {(result.production / 30).toFixed(0)} t/day</div>
            </div>
            <div className="mangan-card p-3">
              <div className="section-label mb-1">Delta</div>
              <div className={`text-2xl font-semibold tabular-nums flex items-center gap-1 ${delta >= 0 ? 'text-[hsl(var(--green))]' : 'text-[hsl(var(--red))]'}`}>
                {delta >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
              </div>
              <div className="text-[10px] text-[hsl(var(--text-tertiary))]">vs baseline</div>
            </div>
          </div>

          {/* Sim chart */}
          <div className="mangan-card p-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">30-Day Production Simulation</span>
              {simulating && <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--amber))]"><div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--amber))] animate-pulse" />Running simulation...</div>}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="hsl(220 12% 14%)" strokeDasharray="4 4" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} label={{ value: 'Day', position: 'insideBottom', offset: -2, fontSize: 9, fill: 'hsl(215 14% 48%)' }} />
                <YAxis domain={[600, 1800]} tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }} />
                <ReferenceLine y={params.productionTarget} stroke="hsl(215 14% 36%)" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'Target', position: 'right', fontSize: 9, fill: 'hsl(215 14% 52%)' }} />
                <Bar dataKey="baseline" fill="hsl(215 14% 22%)" name="Baseline" radius={[1, 1, 0, 0]} />
                <Line type="monotone" dataKey="simulated" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} name="Simulated" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Additional metrics row */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Shortfall Prob.', value: `${(result.shortfallProbability * 100).toFixed(0)}%`, status: result.shortfallProbability > 0.6 ? 'critical' : result.shortfallProbability > 0.3 ? 'warning' : 'good' },
              { label: 'Reserve Life', value: `${result.reserveConsumption}y`, status: 'normal' },
              { label: 'Op. Cost (₹L)', value: result.operationalCost.toLocaleString(), status: 'normal' },
              { label: 'Est. Completion', value: result.estimatedCompletion, status: 'normal' },
            ].map(k => (
              <div key={k.label} className="mangan-card p-3">
                <div className="section-label">{k.label}</div>
                <div className={`text-lg font-semibold tabular-nums mt-1 ${k.status === 'critical' ? 'text-[hsl(var(--red))]' : k.status === 'good' ? 'text-[hsl(var(--green))]' : k.status === 'warning' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-primary))]'}`}>
                  {k.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {hasRun && (
        <div className="mangan-card p-4 border-[hsl(38_92%_50%/0.3)]">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[hsl(var(--amber))]" />
            <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">AI Recommended Plan</span>
            <span className="text-[10px] text-[hsl(var(--text-tertiary))]">— Based on simulation results and current mine state</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {result.recommendations.map((rec, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded bg-[hsl(var(--surface-2))] border ${rec.priority === 'high' ? 'border-[hsl(38_92%_50%/0.3)]' : 'border-[hsl(var(--border))]'}`}>
                <div className={`mt-0.5 text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${rec.priority === 'high' ? 'bg-[hsl(var(--amber))] text-black' : 'bg-[hsl(var(--surface-3))] text-[hsl(var(--text-tertiary))]'}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-[hsl(var(--text-primary))] leading-tight mb-1">{rec.action}</div>
                  <div className="flex items-center gap-2">
                    {rec.zone && <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{rec.zone}</span>}
                    <span className="text-[10px] font-semibold text-[hsl(var(--green))]">+{rec.impact.toFixed(1)}% production</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
            <div className="text-xs text-[hsl(var(--text-secondary))]">
              Expected combined improvement: <strong className="text-[hsl(var(--green))]">+{result.recommendations.reduce((s, r) => s + r.impact, 0).toFixed(1)}%</strong>
            </div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))]">Confidence: 87% · Model: Recommendation Engine v1.8</div>
          </div>
        </div>
      )}
    </div>
  );
}
