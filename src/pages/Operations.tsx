import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GEOLOGICAL_ZONES } from '@/data/geologicalData';
import { HISTORICAL_PRODUCTION } from '@/data/productionData';
import { Pickaxe, Truck, Wind, Users, Clock } from 'lucide-react';
import MineMapSVG from '@/components/features/MineMapSVG';

const SHIFT_DATA = [
  { shift: 'Day A', target: 460, actual: 398, crew: 48, status: 'active' },
  { shift: 'Day B', target: 460, actual: 421, crew: 46, status: 'active' },
  { shift: 'Night A', target: 460, actual: 367, crew: 42, status: 'standby' },
];

const BLAST_SCHEDULE = [
  { id: 'BLT-041', zone: 'Zone Alpha-North',  date: '2026-08-24', time: '06:30', holes: 18, status: 'scheduled' },
  { id: 'BLT-042', zone: 'Zone Beta-Central', date: '2026-08-26', time: '07:00', holes: 24, status: 'pending-approval' },
  { id: 'BLT-043', zone: 'Zone Alpha-North',  date: '2026-08-28', time: '06:30', holes: 15, status: 'scheduled' },
  { id: 'BLT-044', zone: 'Zone Beta-Central', date: '2026-09-02', time: '07:00', holes: 20, status: 'planned' },
];

const STATUS_BADGE: Record<string, string> = {
  'scheduled':         'bg-[hsl(150_45%_38%/0.1)] text-[hsl(var(--green))] border-[hsl(150_45%_38%/0.25)]',
  'pending-approval':  'bg-[hsl(36_88%_48%/0.1)] text-[hsl(var(--amber))] border-[hsl(36_88%_48%/0.25)]',
  'planned':           'bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
};

const last7 = HISTORICAL_PRODUCTION.slice(-7).map(r => ({
  date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  actual: r.actual,
  planned: r.planned,
}));

export default function Operations() {
  const [selectedZone, setSelectedZone] = useState(GEOLOGICAL_ZONES[0].id);

  return (
    <div className="flex h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* ── Map (left primary) ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[hsl(var(--border))] overflow-hidden">

        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">Mine Operations</h1>
              <span className="live-badge">Active</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Balaghat Alpha · Shift: Day A · 06:00–14:00 IST · <span className="demo-badge">DEMO</span></p>
          </div>
          <div className="flex gap-1.5">
            {GEOLOGICAL_ZONES.filter(z => z.type === 'active').map(z => (
              <button key={z.id} onClick={() => setSelectedZone(z.id)}
                className={`filter-btn ${selectedZone === z.id ? 'filter-btn-active' : ''}`}>
                {z.name.replace('Zone ', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Ops KPIs */}
        <div className="grid grid-cols-5 border-b border-[hsl(var(--border))] shrink-0">
          {[
            { icon: Pickaxe, label: 'Benches Active', value: '6', sub: 'of 8' },
            { icon: Truck,   label: "Today's Haulage", value: '1,186t', sub: '86% of plan' },
            { icon: Wind,    label: 'Blast Pending', value: '2', sub: 'next: Aug 24' },
            { icon: Users,   label: 'On-site Workforce', value: '136', sub: '88% staffed' },
            { icon: Clock,   label: 'Avg Cycle Time', value: '42 min', sub: 'haul truck' },
          ].map(({ icon: Icon, label, value, sub }, i) => (
            <div key={label} className={`px-3 py-2.5 ${i < 4 ? 'border-r border-[hsl(var(--border))]' : ''}`}>
              <div className="flex items-center gap-1 mb-1">
                <Icon className="w-3 h-3 text-[hsl(var(--text-dim))]" />
                <span className="section-label">{label}</span>
              </div>
              <div className="text-sm font-semibold text-[hsl(var(--text-primary))] tabular-nums">{value}</div>
              <div className="text-[9px] text-[hsl(var(--text-tertiary))]">{sub}</div>
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0">
          <MineMapSVG />
        </div>
      </div>

      {/* ── Right panel ──────────────────────────────────── */}
      <div className="w-72 flex flex-col shrink-0 overflow-hidden bg-[hsl(var(--surface-1))]">

        {/* Shift performance */}
        <div className="p-3 border-b border-[hsl(var(--border))]">
          <div className="section-label mb-2.5">Shift Performance</div>
          <div className="space-y-2.5">
            {SHIFT_DATA.map(s => (
              <div key={s.shift} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.status === 'active' ? 'bg-[hsl(var(--green))]' : 'bg-[hsl(var(--text-dim))]'}`} />
                <span className="text-[11px] font-medium text-[hsl(var(--text-primary))] w-14 shrink-0">{s.shift}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-[hsl(var(--text-tertiary))]">{s.actual}/{s.target}t</span>
                    <span className={`font-semibold ${s.actual >= s.target ? 'text-[hsl(var(--green))]' : 'text-[hsl(var(--amber))]'}`}>{Math.round(s.actual / s.target * 100)}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-[hsl(var(--amber))]" style={{ width: `${Math.min(100, s.actual / s.target * 100)}%` }} />
                  </div>
                </div>
                <span className="text-[9px] text-[hsl(var(--text-dim))] shrink-0">{s.crew} crew</span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-day chart */}
        <div className="p-3 border-b border-[hsl(var(--border))]">
          <div className="section-label mb-2">7-Day Production</div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={last7} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={8} barGap={1}>
              <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[800, 1500]} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }} />
              <Bar dataKey="planned" fill="hsl(210 6% 18%)" radius={[1, 1, 0, 0]} />
              <Bar dataKey="actual"  fill="hsl(36 88% 48%)" fillOpacity={0.85} radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Blast schedule */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-[hsl(var(--border))]">
            <Wind className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
            <span className="section-label">Blast Schedule</span>
          </div>
          <div className="divide-y divide-[hsl(var(--border))]">
            {BLAST_SCHEDULE.map(b => (
              <div key={b.id} className="px-3 py-2.5 hover:bg-[hsl(var(--surface-2))] transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-[hsl(var(--text-secondary))]">{b.id}</span>
                  <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-sm border uppercase ${STATUS_BADGE[b.status]}`}>
                    {b.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="text-[9px] text-[hsl(var(--text-tertiary))] space-y-0.5">
                  <div>{b.zone.replace('Zone ', '')}</div>
                  <div className="flex items-center gap-2">
                    <span>{new Date(b.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {b.time}</span>
                    <span>{b.holes} holes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
