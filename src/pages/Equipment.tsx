import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { EQUIPMENT_LIST, EQUIPMENT_UTILIZATION_HISTORY } from '@/data/equipmentData';
import type { Equipment as EquipmentType } from '@/types';
import { Wrench, AlertTriangle, Zap } from 'lucide-react';

const TYPE_EMOJI: Record<string, string> = {
  excavator: '⛏', loader: '🔃', truck: '🚛', drill: '🔩', crusher: '⚙', conveyor: '➡',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  operational: { label: 'OPERATIONAL', color: 'text-[hsl(var(--green))]',   dot: 'bg-[hsl(var(--green))]' },
  maintenance: { label: 'MAINTENANCE', color: 'text-[hsl(var(--amber))]',   dot: 'bg-[hsl(var(--amber))]' },
  idle:        { label: 'IDLE',        color: 'text-[hsl(var(--text-tertiary))]', dot: 'bg-[hsl(var(--text-dim))]' },
  fault:       { label: 'FAULT',       color: 'text-[hsl(var(--red))]',     dot: 'bg-[hsl(var(--red))]' },
};

function FailureBar({ prob }: { prob: number }) {
  const color = prob > 0.6 ? 'hsl(0 68% 48%)' : prob > 0.3 ? 'hsl(36 88% 48%)' : 'hsl(150 45% 38%)';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 progress-track">
        <div className="progress-fill" style={{ width: `${prob * 100}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold tabular-nums w-7 text-right" style={{ color }}>{Math.round(prob * 100)}%</span>
    </div>
  );
}

export default function Equipment() {
  const [selected, setSelected] = useState<EquipmentType>(EQUIPMENT_LIST[0]);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = filterStatus === 'all' ? EQUIPMENT_LIST : EQUIPMENT_LIST.filter(e => e.status === filterStatus);
  const faultCount = EQUIPMENT_LIST.filter(e => e.status === 'fault').length;
  const maintenanceCount = EQUIPMENT_LIST.filter(e => e.status === 'maintenance').length;
  const opCount = EQUIPMENT_LIST.filter(e => e.status === 'operational').length;
  const avgUtil = Math.round(EQUIPMENT_LIST.filter(e => e.status === 'operational').reduce((s, e) => s + e.utilization, 0) / (opCount || 1));

  return (
    <div className="flex h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* ── Equipment list (left) ────────────────────────── */}
      <div className="w-72 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">

        {/* Header */}
        <div className="px-3 py-2.5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Wrench className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
            <h1 className="text-xs font-semibold text-[hsl(var(--text-primary))]">Equipment Intelligence</h1>
          </div>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Predictive maintenance · SCADA telemetry · <span className="demo-badge">DEMO</span></p>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 border-b border-[hsl(var(--border))]">
          {[
            { label: 'Fleet', value: EQUIPMENT_LIST.length.toString(), color: 'text-[hsl(var(--text-primary))]' },
            { label: 'Oper.', value: opCount.toString(), color: 'text-[hsl(var(--green))]' },
            { label: 'Fault', value: faultCount.toString(), color: 'text-[hsl(var(--red))]' },
            { label: 'Maint', value: maintenanceCount.toString(), color: 'text-[hsl(var(--amber))]' },
          ].map((k, i) => (
            <div key={k.label} className={`px-2 py-2 text-center ${i < 3 ? 'border-r border-[hsl(var(--border))]' : ''}`}>
              <div className={`text-base font-semibold tabular-nums ${k.color}`}>{k.value}</div>
              <div className="section-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="px-2 py-1.5 border-b border-[hsl(var(--border))] flex items-center gap-1 flex-wrap">
          {['all', 'operational', 'fault', 'maintenance', 'idle'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`filter-btn ${filterStatus === s ? 'filter-btn-active' : ''} text-[9px]`}>
              {s}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(eq => (
            <button
              key={eq.id}
              onClick={() => setSelected(eq)}
              className={`w-full px-3 py-2.5 text-left border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors ${selected.id === eq.id ? 'bg-[hsl(36_88%_48%/0.06)] border-l-2 border-l-[hsl(var(--amber))]' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{TYPE_EMOJI[eq.type]}</span>
                  <span className="text-[11px] font-medium text-[hsl(var(--text-primary))]">{eq.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[eq.status].dot}`} />
                  <span className={`text-[9px] font-semibold ${STATUS_CONFIG[eq.status].color}`}>{STATUS_CONFIG[eq.status].label}</span>
                </div>
              </div>
              <FailureBar prob={eq.failureProbability} />
              <div className="flex items-center justify-between mt-1 text-[9px] text-[hsl(var(--text-dim))]">
                <span>Util: {eq.utilization}%</span>
                <span>Downtime: {eq.downtime}h</span>
                {eq.alerts.length > 0 && <span className="text-[hsl(var(--red))]">{eq.alerts.length} alert{eq.alerts.length > 1 ? 's' : ''}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts (center) ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[hsl(var(--border))]">

        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
          <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Fleet Analytics</span>
          <span className="text-[10px] text-[hsl(var(--text-tertiary))]">Avg utilization: <strong className="text-[hsl(var(--text-secondary))]">{avgUtil}%</strong></span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Utilization history */}
          <div className="mangan-card p-4">
            <div className="section-label mb-3">Fleet Utilization — Last 30 Days (%)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={EQUIPMENT_UTILIZATION_HISTORY} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={30} unit="%" />
                <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }} />
                <Line type="monotone" dataKey="excavators" stroke="hsl(36 88% 48%)" strokeWidth={1.5} dot={false} name="Excavators" />
                <Line type="monotone" dataKey="loaders"    stroke="hsl(150 45% 38%)" strokeWidth={1.5} dot={false} name="Loaders" />
                <Line type="monotone" dataKey="trucks"     stroke="hsl(210 72% 52%)" strokeWidth={1.5} dot={false} name="Trucks" />
                <Line type="monotone" dataKey="drills"     stroke="hsl(258 90% 66%)" strokeWidth={1.5} dot={false} name="Drills" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              {[
                { label: 'Excavators', c: 'hsl(36 88% 48%)' },
                { label: 'Loaders',    c: 'hsl(150 45% 38%)' },
                { label: 'Trucks',     c: 'hsl(210 72% 52%)' },
                { label: 'Drills',     c: 'hsl(258 90% 66%)' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-[9px] text-[hsl(var(--text-tertiary))]">
                  <div className="w-4 h-0.5 rounded" style={{ background: l.c }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Failure probability chart */}
          <div className="mangan-card p-4">
            <div className="section-label mb-3">Failure Probability by Unit</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={EQUIPMENT_LIST.map(e => ({ id: e.id.split('-').join(''), prob: Math.round(e.failureProbability * 100), color: e.failureProbability > 0.6 ? '#ef4444' : e.failureProbability > 0.3 ? '#f59e0b' : '#34d399' }))}
                margin={{ top: 4, right: 8, left: -8, bottom: 0 }} barSize={14}
              >
                <XAxis dataKey="id" tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} unit="%" width={28} />
                <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }}
                  formatter={(v: number) => [`${v}%`, 'Failure Risk']} />
                <Bar dataKey="prob" radius={[2, 2, 0, 0]} fill="hsl(36 88% 48%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Predictive maintenance banner */}
          {selected.failureProbability > 0.5 && (
            <div className="mangan-card p-3 border-[hsl(36_88%_48%/0.3)]">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-[hsl(var(--amber))] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-semibold text-[hsl(var(--amber))] uppercase mb-1">Predictive Maintenance Alert</div>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                    <strong>{selected.name}</strong> has a <strong className="text-[hsl(var(--amber))]">{Math.round(selected.failureProbability * 100)}% probability</strong> of requiring maintenance within 14 days based on operational patterns and sensor data.
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[9px] text-[hsl(var(--text-dim))]">
                    <span>Operating hours: {selected.operatingHours.toLocaleString()}</span>
                    <span>Last inspection: {selected.lastInspection}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Equipment detail (right) ─────────────────────── */}
      <div className="w-60 flex flex-col bg-[hsl(var(--surface-1))] shrink-0 overflow-hidden">
        <div className="px-3 py-2.5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{selected.name}</span>
            <div className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[selected.status].dot}`} />
              <span className={`text-[9px] font-semibold ${STATUS_CONFIG[selected.status].color}`}>{STATUS_CONFIG[selected.status].label}</span>
            </div>
          </div>
          <div className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5 capitalize">{selected.type}</div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* Metrics grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Utilization', value: `${selected.utilization}%` },
              { label: 'Downtime (30d)', value: `${selected.downtime}h` },
              { label: 'Operating Hrs', value: selected.operatingHours.toLocaleString() },
              { label: 'Fuel Efficiency', value: `${selected.fuelEfficiency}%` },
              { label: 'Maintenance',    value: selected.maintenanceStatus.toUpperCase(), color: selected.maintenanceStatus === 'ok' ? 'text-[hsl(var(--green))]' : selected.maintenanceStatus === 'due' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--red))]' },
              { label: 'Next Service',   value: new Date(selected.nextMaintenanceDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="bg-[hsl(var(--surface-2))] rounded-sm p-2">
                <div className="section-label">{item.label}</div>
                <div className={`text-xs font-semibold mt-0.5 ${'color' in item && item.color ? item.color : 'text-[hsl(var(--text-primary))]'}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Failure probability */}
          <div>
            <div className="section-label mb-1.5">Failure Probability (14-day)</div>
            <FailureBar prob={selected.failureProbability} />
          </div>

          {/* Alerts */}
          {selected.alerts.length > 0 && (
            <div>
              <div className="section-label mb-1.5">Active Alerts ({selected.alerts.length})</div>
              <div className="space-y-1.5">
                {selected.alerts.map((alert, i) => (
                  <div key={i} className={`flex items-start gap-1.5 py-1.5 px-2 rounded-sm ${selected.status === 'fault' ? 'bg-[hsl(0_68%_48%/0.06)] border border-[hsl(0_68%_48%/0.2)]' : 'bg-[hsl(36_88%_48%/0.06)] border border-[hsl(36_88%_48%/0.2)]'}`}>
                    <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${selected.status === 'fault' ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--amber))]'}`} />
                    <span className="text-[10px] text-[hsl(var(--text-secondary))] leading-relaxed">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
