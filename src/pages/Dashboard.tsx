import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Play, FlaskConical, ChevronRight,
  TrendingDown, TrendingUp, Cpu, Activity
} from 'lucide-react';
import {
  AreaChart, Area, ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import KPICard from '@/components/features/KPICard';
import MineMapSVG from '@/components/features/MineMapSVG';
import type { KPIMetric } from '@/types';
import { HISTORICAL_PRODUCTION, PRODUCTION_KPI, generateForecast } from '@/data/productionData';
import { RISK_ITEMS } from '@/data/riskData';
import { EQUIPMENT_LIST } from '@/data/equipmentData';

const KPI_METRICS: KPIMetric[] = [
  {
    label: 'Est. Reserves',
    value: '12.4',
    unit: 'Mt',
    change: -0.8,
    changeLabel: 'vs last model',
    status: 'warning',
    trend: [13.2, 13.0, 12.8, 12.6, 12.5, 12.4],
  },
  {
    label: 'Production Today',
    value: '1,186',
    unit: 't/day',
    change: -14.2,
    changeLabel: 'vs target',
    status: 'critical',
    trend: [1360, 1280, 1320, 1240, 1200, 1186],
  },
  {
    label: 'Target',
    value: '1,380',
    unit: 't/day',
    status: 'normal',
  },
  {
    label: 'Shortfall Risk',
    value: '84%',
    change: 12,
    changeLabel: 'vs last week',
    status: 'critical',
    trend: [40, 52, 60, 68, 72, 84],
  },
  {
    label: 'Equipment Avail.',
    value: '82%',
    change: -6,
    changeLabel: 'vs last month',
    status: 'warning',
    trend: [90, 89, 88, 86, 84, 82],
  },
  {
    label: 'Risk Alerts',
    value: '7',
    change: 3,
    changeLabel: 'new today',
    status: 'critical',
    trend: [2, 3, 4, 4, 6, 7],
  },
];

const recentProduction = HISTORICAL_PRODUCTION.slice(-21).map(r => ({
  date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  actual: r.actual,
  planned: r.planned,
}));

const forecastPoints = generateForecast(14).filter(p => !p.isHistorical).map(p => ({
  date: new Date(p.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  predicted: p.predicted,
  lower: p.lower,
  upper: p.upper,
  target: p.target,
}));

const criticalRisks = RISK_ITEMS.filter(r => r.status === 'active').slice(0, 4);
const faultEquipment = EQUIPMENT_LIST.filter(e => e.status === 'fault' || e.status === 'maintenance').slice(0, 5);

const WORKFLOW_STEPS = [
  { label: 'OBSERVE', route: '/dashboard', desc: 'KPIs & map' },
  { label: 'PREDICT', route: '/production', desc: 'Forecast' },
  { label: 'SIMULATE', route: '/simulator', desc: 'What-if' },
  { label: 'RECOMMEND', route: '/copilot', desc: 'AI Copilot' },
  { label: 'ACT', route: '/reports', desc: 'Reports' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(1);

  const runAnalysis = () => {
    setAnalysisRunning(true);
    setAnalysisComplete(false);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setActiveWorkflow(step % WORKFLOW_STEPS.length);
      if (step >= WORKFLOW_STEPS.length) {
        clearInterval(interval);
        setAnalysisRunning(false);
        setAnalysisComplete(true);
        setActiveWorkflow(4);
      }
    }, 440);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* ── Top action bar ──────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
        <div>
          <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">Balaghat Alpha Mine</div>
          <div className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">
            Balaghat, Madhya Pradesh · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runAnalysis}
            disabled={analysisRunning}
            className="btn-primary"
          >
            <Play className="w-3 h-3" />
            {analysisRunning ? 'Analyzing...' : analysisComplete ? 'Analysis Complete ✓' : 'Run AI Analysis'}
          </button>
          <button onClick={() => navigate('/simulator')} className="btn-secondary">
            <FlaskConical className="w-3 h-3" />
            Simulate
          </button>
        </div>
      </div>

      {/* ── KPI strip ───────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-0 border-b border-[hsl(var(--border))] shrink-0">
        {KPI_METRICS.map((m, i) => (
          <div key={m.label} className={`${i < 5 ? 'border-r border-[hsl(var(--border))]' : ''}`}>
            <KPICard metric={m} />
          </div>
        ))}
      </div>

      {/* ── Main body ───────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Map — primary focus */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[hsl(var(--border))]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Mine Map — Balaghat Alpha</span>
              <span className="live-badge">Live</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
              <Cpu className="w-3 h-3" />
              <span>ML Model Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))] animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <MineMapSVG />
          </div>
        </div>

        {/* Right panel: 3 stacked sections */}
        <div className="w-72 flex flex-col shrink-0 overflow-hidden">

          {/* Production chart — top 1/3 */}
          <div className="flex-1 border-b border-[hsl(var(--border))] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] shrink-0">
              <span className="text-[11px] font-semibold text-[hsl(var(--text-primary))]">Production vs Target</span>
              <button onClick={() => navigate('/production')} className="flex items-center gap-0.5 text-[10px] text-[hsl(var(--amber))] hover:underline">
                Forecast <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 px-2 py-2 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={recentProduction} margin={{ top: 2, right: 4, left: -18, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis domain={[900, 1500]} tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }} />
                  <ReferenceLine y={1380} stroke="hsl(210 6% 28%)" strokeDasharray="4 2" strokeWidth={1} />
                  <Bar dataKey="planned" fill="hsl(210 6% 18%)" radius={[1, 1, 0, 0]} barSize={6} />
                  <Line type="monotone" dataKey="actual" stroke="hsl(36 88% 48%)" strokeWidth={1.5} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active risks — middle */}
          <div className="flex-1 border-b border-[hsl(var(--border))] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] shrink-0">
              <span className="text-[11px] font-semibold text-[hsl(var(--text-primary))]">Active Risks</span>
              <button onClick={() => navigate('/risks')} className="flex items-center gap-0.5 text-[10px] text-[hsl(var(--amber))] hover:underline">
                All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {criticalRisks.map(risk => (
                <button
                  key={risk.id}
                  onClick={() => navigate('/risks')}
                  className={`w-full text-left px-3 py-2 border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors ${risk.severity === 'critical' ? 'border-l-2 border-l-[hsl(var(--red))]' : 'border-l-2 border-l-[hsl(var(--amber))]'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-medium text-[hsl(var(--text-primary))] leading-tight flex-1">{risk.title}</span>
                    <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-sm uppercase shrink-0 ${risk.severity === 'critical' ? 'bg-[hsl(0_68%_48%/0.12)] text-[hsl(var(--red))]' : 'bg-[hsl(36_88%_48%/0.1)] text-[hsl(var(--amber))]'}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-[hsl(var(--text-dim))]">{Math.round(risk.probability * 100)}% prob</span>
                    <span className="text-[9px] text-[hsl(var(--red))]">{risk.impact}% impact</span>
                    <span className="text-[9px] text-[hsl(var(--text-dim))]">
                      {new Date(risk.predictedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Equipment status — bottom */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] shrink-0">
              <span className="text-[11px] font-semibold text-[hsl(var(--text-primary))]">Equipment Issues</span>
              <button onClick={() => navigate('/equipment')} className="flex items-center gap-0.5 text-[10px] text-[hsl(var(--amber))] hover:underline">
                Fleet <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {faultEquipment.map(eq => (
                <div key={eq.id} className="flex items-center gap-2 px-3 py-2 border-b border-[hsl(var(--border)/0.6)]">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${eq.status === 'fault' ? 'bg-[hsl(var(--red))]' : 'bg-[hsl(var(--amber))]'}`} />
                  <span className="text-[11px] text-[hsl(var(--text-secondary))] flex-1 truncate">{eq.name}</span>
                  <span className={`text-[9px] font-semibold uppercase ${eq.status === 'fault' ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--amber))]'}`}>{eq.status}</span>
                  <span className="text-[9px] text-[hsl(var(--text-dim))] tabular-nums">{eq.downtime}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Workflow bar ─────────────────────────────────── */}
      <div className="flex items-center px-4 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
        <span className="section-label mr-3">Workflow</span>
        <div className="flex items-center gap-0 flex-1">
          {WORKFLOW_STEPS.map((step, i, arr) => (
            <div key={step.label} className="flex items-center">
              <button
                onClick={() => { setActiveWorkflow(i); navigate(step.route); }}
                className={`flex flex-col items-center px-3 py-1 rounded-sm transition-colors ${activeWorkflow === i
                  ? 'bg-[hsl(var(--amber))] text-[hsl(210_8%_6%)]'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-3))]'
                }`}
              >
                <span className="text-[10px] font-bold tracking-wide">{step.label}</span>
                <span className={`text-[8px] ${activeWorkflow === i ? 'opacity-70' : 'opacity-50'}`}>{step.desc}</span>
              </button>
              {i < arr.length - 1 && (
                <ChevronRight className={`w-3.5 h-3.5 mx-0.5 ${activeWorkflow > i ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-dim))]'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="demo-badge ml-3">DEMO MODE</div>
      </div>
    </div>
  );
}
