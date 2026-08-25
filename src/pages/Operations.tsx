import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GEOLOGICAL_ZONES } from '@/data/geologicalData';
import { HISTORICAL_PRODUCTION } from '@/data/productionData';
import { Activity, Pickaxe, Truck, Wind, Users, Calendar, ChevronRight, Clock } from 'lucide-react';
import MineMapSVG from '@/components/features/MineMapSVG';

const SHIFT_DATA = [
  { shift: 'Day A', target: 460, actual: 398, crew: 48, status: 'active' },
  { shift: 'Day B', target: 460, actual: 421, crew: 46, status: 'active' },
  { shift: 'Night A', target: 460, actual: 367, crew: 42, status: 'standby' },
];

const BLAST_SCHEDULE = [
  { id: 'BLT-041', zone: 'Zone Alpha-North', date: '2026-08-24', time: '06:30', holes: 18, status: 'scheduled' },
  { id: 'BLT-042', zone: 'Zone Beta-Central', date: '2026-08-26', time: '07:00', holes: 24, status: 'pending-approval' },
  { id: 'BLT-043', zone: 'Zone Alpha-North', date: '2026-08-28', time: '06:30', holes: 15, status: 'scheduled' },
  { id: 'BLT-044', zone: 'Zone Beta-Central', date: '2026-09-02', time: '07:00', holes: 20, status: 'planned' },
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-[hsl(142_50%_42%/0.12)] text-[hsl(var(--green))] border-[hsl(142_50%_42%/0.3)]',
  'pending-approval': 'bg-[hsl(38_92%_50%/0.12)] text-[hsl(var(--amber))] border-[hsl(38_92%_50%/0.3)]',
  planned: 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
};

const last7 = HISTORICAL_PRODUCTION.slice(-7).map(r => ({
  date: new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  actual: r.actual,
  planned: r.planned,
}));

export default function Operations() {
  const [selectedZone, setSelectedZone] = useState(GEOLOGICAL_ZONES[0].id);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Mine Operations</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">Real-time operational dashboard · Balaghat Alpha · <span className="demo-badge">DEMO DATA</span></p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--green))] animate-pulse" />
            <span className="text-xs text-[hsl(var(--text-secondary))]">Mine Operational</span>
          </div>
          <div className="text-xs text-[hsl(var(--text-tertiary))] font-mono">Shift: Day A · 06:00–14:00</div>
        </div>
      </div>

      {/* Ops metrics */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { icon: Pickaxe, label: 'Benches Active', value: '6', sub: 'of 8 total' },
          { icon: Truck, label: "Today's Haulage", value: '1,186', sub: 't (86% of plan)' },
          { icon: Wind, label: 'Blast Status', value: '2 pending', sub: 'next: Aug 24 06:30' },
          { icon: Users, label: 'Workforce On-site', value: '136', sub: '88% of scheduled' },
          { icon: Clock, label: 'Avg Cycle Time', value: '42 min', sub: 'haul truck cycle' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="mangan-card p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
              <span className="section-label">{label}</span>
            </div>
            <div className="text-lg font-semibold text-[hsl(var(--text-primary))] tabular-nums">{value}</div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Map + Shift + Blast */}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        {/* Map */}
        <div className="mangan-card overflow-hidden" style={{ height: 380 }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))]">
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Operations Map</span>
            <div className="flex gap-2">
              {GEOLOGICAL_ZONES.filter(z => z.type === 'active').map(z => (
                <button
                  key={z.id}
                  onClick={() => setSelectedZone(z.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${selectedZone === z.id ? 'bg-[hsl(38_92%_50%/0.15)] border-[hsl(38_92%_50%/0.4)] text-[hsl(var(--amber))]' : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'}`}
                >
                  {z.name.replace('Zone ', '')}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 340 }}>
            <MineMapSVG />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">
          {/* Shift summary */}
          <div className="mangan-card p-3">
            <div className="section-label mb-2">Current Shift Performance</div>
            <div className="space-y-2">
              {SHIFT_DATA.map(s => (
                <div key={s.shift} className="flex items-center gap-2 py-1.5 border-b border-[hsl(var(--border))] last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${s.status === 'active' ? 'bg-[hsl(var(--green))]' : 'bg-[hsl(var(--text-tertiary))]'}`} />
                  <span className="text-xs font-medium text-[hsl(var(--text-primary))] w-16">{s.shift}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-[hsl(var(--text-tertiary))]">{s.actual}/{s.target}t</span>
                      <span className={`font-medium ${s.actual >= s.target ? 'text-[hsl(var(--green))]' : 'text-[hsl(var(--amber))]'}`}>{Math.round(s.actual / s.target * 100)}%</span>
                    </div>
                    <div className="h-1 bg-[hsl(var(--surface-3))] rounded-full">
                      <div className="h-full rounded-full bg-[hsl(var(--amber))]" style={{ width: `${Math.min(100, s.actual / s.target * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{s.crew} crew</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7-day chart */}
          <div className="mangan-card p-3">
            <div className="section-label mb-2">7-Day Production</div>
            <ResponsiveContainer width="100%" height={90}>
              <BarChart data={last7} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barSize={10}>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[800, 1500]} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }} />
                <Bar dataKey="planned" fill="hsl(215 14% 24%)" radius={[1, 1, 0, 0]} />
                <Bar dataKey="actual" fill="hsl(38 92% 50%)" fillOpacity={0.85} radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Blast schedule */}
          <div className="mangan-card p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="section-label">Blast Schedule</span>
              <Wind className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
            </div>
            <div className="space-y-1.5">
              {BLAST_SCHEDULE.map(b => (
                <div key={b.id} className="py-1.5 border-b border-[hsl(var(--border))] last:border-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-mono text-[hsl(var(--text-secondary))]">{b.id}</span>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${STATUS_COLORS[b.status]}`}>{b.status.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--text-tertiary))]">
                    <span>{b.zone.replace('Zone ', '')}</span>
                    <span>·</span>
                    <span>{new Date(b.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} {b.time}</span>
                    <span>·</span>
                    <span>{b.holes} holes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
