import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Play, Cpu, Activity, Mountain, TrendingDown,
  Wrench, FlaskConical, ChevronRight, Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import KPICard from '@/components/features/KPICard';
import MineMapSVG from '@/components/features/MineMapSVG';
import type { KPIMetric } from '@/types';
import { HISTORICAL_PRODUCTION, PRODUCTION_KPI } from '@/data/productionData';
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
    label: 'Current Production',
    value: '1,186',
    unit: 't/day',
    change: -14.2,
    changeLabel: 'vs target',
    status: 'critical',
    trend: [1360, 1280, 1320, 1240, 1200, 1186],
  },
  {
    label: 'Production Target',
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
    label: 'Active Risk Alerts',
    value: '7',
    change: 3,
    changeLabel: 'new today',
    status: 'critical',
    trend: [2, 3, 4, 4, 6, 7],
  },
];

const recentProduction = HISTORICAL_PRODUCTION.slice(-14).map(r => ({
  date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  actual: r.actual,
  planned: r.planned,
}));

const criticalRisks = RISK_ITEMS.filter(r => r.status === 'active').slice(0, 3);
const faultEquipment = EQUIPMENT_LIST.filter(e => e.status === 'fault' || e.status === 'maintenance').slice(0, 4);

export default function Dashboard() {
  const navigate = useNavigate();
  const [analysisRunning, setAnalysisRunning] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const runAnalysis = () => {
    setAnalysisRunning(true);
    setAnalysisComplete(false);
    setTimeout(() => {
      setAnalysisRunning(false);
      setAnalysisComplete(true);
    }, 2200);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Balaghat Alpha Mine</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">Madhya Pradesh, India · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runAnalysis}
            disabled={analysisRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[hsl(var(--amber))] text-black text-xs font-semibold hover:bg-[hsl(38_92%_44%)] transition-colors disabled:opacity-60"
          >
            <Play className="w-3 h-3" />
            {analysisRunning ? 'Running AI Analysis...' : analysisComplete ? 'Analysis Complete ✓' : 'Run AI Analysis'}
          </button>
          <button
            onClick={() => navigate('/simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--amber))] hover:text-[hsl(var(--text-primary))] transition-colors"
          >
            <FlaskConical className="w-3 h-3" />
            Run Simulation
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-6 gap-2">
        {KPI_METRICS.map(m => <KPICard key={m.label} metric={m} />)}
      </div>

      {/* Main content: Map + Right panel */}
      <div className="grid grid-cols-[1fr_300px] gap-4">
        {/* Mine Map */}
        <div className="mangan-card overflow-hidden" style={{ height: 440 }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))]">
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Interactive Mine Map — Balaghat Alpha</span>
            <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
              <div className="w-1.5 h-1.5 bg-[hsl(var(--green))] rounded-full animate-pulse" />
              Live
            </div>
          </div>
          <div style={{ height: 400 }}>
            <MineMapSVG />
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-3">
          {/* Production mini chart */}
          <div className="mangan-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">14-Day Production</span>
              <button onClick={() => navigate('/production')} className="text-[10px] text-[hsl(var(--amber))] hover:underline flex items-center gap-0.5">
                Full forecast <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={90}>
              <AreaChart data={recentProduction} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }}
                  labelStyle={{ color: 'hsl(215 14% 68%)' }}
                />
                <Area type="monotone" dataKey="planned" stroke="hsl(215 14% 36%)" strokeDasharray="3 3" strokeWidth={1} fill="none" />
                <Area type="monotone" dataKey="actual" stroke="hsl(38 92% 50%)" strokeWidth={2} fill="url(#prodGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Active risks */}
          <div className="mangan-card p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Active Risks</span>
              <button onClick={() => navigate('/risks')} className="text-[10px] text-[hsl(var(--amber))] hover:underline flex items-center gap-0.5">
                All risks <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {criticalRisks.map(risk => (
                <div key={risk.id} className={`p-2 rounded bg-[hsl(var(--surface-2))] ${risk.severity === 'critical' ? 'severity-critical' : 'severity-high'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-medium text-[hsl(var(--text-primary))] leading-tight">{risk.title}</span>
                    <span className={`text-[9px] font-semibold px-1 py-0.5 rounded uppercase ${risk.severity === 'critical' ? 'bg-[hsl(0_72%_51%/0.15)] text-[hsl(var(--red))]' : 'bg-[hsl(38_92%_50%/0.12)] text-[hsl(var(--amber))]'}`}>
                      {risk.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <AlertTriangle className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{Math.round(risk.probability * 100)}% probability · {risk.impact}% impact</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment faults */}
          <div className="mangan-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Equipment Issues</span>
              <button onClick={() => navigate('/equipment')} className="text-[10px] text-[hsl(var(--amber))] hover:underline flex items-center gap-0.5">
                All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5">
              {faultEquipment.map(eq => (
                <div key={eq.id} className="flex items-center gap-2 py-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${eq.status === 'fault' ? 'bg-[hsl(var(--red))]' : 'bg-[hsl(var(--amber))]'}`} />
                  <span className="text-xs text-[hsl(var(--text-secondary))] flex-1">{eq.name}</span>
                  <span className={`text-[10px] font-medium uppercase ${eq.status === 'fault' ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--amber))]'}`}>{eq.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom workflow bar */}
      <div className="mangan-card p-3">
        <div className="section-label mb-2">MANGAN-X Intelligence Workflow</div>
        <div className="flex items-center gap-0">
          {['OBSERVE', 'PREDICT', 'SIMULATE', 'RECOMMEND', 'ACT'].map((step, i, arr) => (
            <div key={step} className="flex items-center">
              <div
                className={`px-4 py-2 text-xs font-semibold rounded cursor-pointer transition-colors ${i === 1 ? 'bg-[hsl(var(--amber))] text-black' : 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'}`}
                onClick={() => {
                  const routes = ['/dashboard', '/production', '/simulator', '/copilot', '/reports'];
                  navigate(routes[i]);
                }}
              >
                {step}
              </div>
              {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-[hsl(var(--text-tertiary))] mx-1" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
