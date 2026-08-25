import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { EQUIPMENT_LIST, EQUIPMENT_UTILIZATION_HISTORY } from '@/data/equipmentData';
import type { Equipment as EquipmentType } from '@/types';
import { Wrench, AlertTriangle, CheckCircle, Clock, Zap, TrendingDown } from 'lucide-react';

const TYPE_ICON: Record<string, string> = {
  excavator: '⛏', loader: '🔃', truck: '🚛', drill: '🔩', crusher: '⚙', conveyor: '➡',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  operational: { label: 'OPERATIONAL', color: 'text-[hsl(var(--green))]', bg: 'bg-[hsl(142_50%_42%/0.1)]' },
  maintenance: { label: 'MAINTENANCE', color: 'text-[hsl(var(--amber))]', bg: 'bg-[hsl(38_92%_50%/0.1)]' },
  idle: { label: 'IDLE', color: 'text-[hsl(var(--text-tertiary))]', bg: 'bg-[hsl(var(--surface-2))]' },
  fault: { label: 'FAULT', color: 'text-[hsl(var(--red))]', bg: 'bg-[hsl(0_72%_51%/0.1)]' },
};

function FailureBar({ prob }: { prob: number }) {
  const color = prob > 0.6 ? 'hsl(0 72% 51%)' : prob > 0.3 ? 'hsl(38 92% 50%)' : 'hsl(142 50% 42%)';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[hsl(var(--surface-3))] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${prob * 100}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold tabular-nums" style={{ color }}>{Math.round(prob * 100)}%</span>
    </div>
  );
}

export default function Equipment() {
  const [selected, setSelected] = useState<EquipmentType>(EQUIPMENT_LIST[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = filterStatus === 'all' ? EQUIPMENT_LIST : EQUIPMENT_LIST.filter(e => e.status === filterStatus);
  const faultCount = EQUIPMENT_LIST.filter(e => e.status === 'fault').length;
  const maintenanceCount = EQUIPMENT_LIST.filter(e => e.status === 'maintenance').length;
  const avgUtil = Math.round(EQUIPMENT_LIST.filter(e => e.status === 'operational').reduce((s, e) => s + e.utilization, 0) / EQUIPMENT_LIST.filter(e => e.status === 'operational').length);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Equipment Intelligence</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">Predictive maintenance · SCADA telemetry · <span className="demo-badge">DEMO DATA</span></p>
        </div>
        <div className="flex gap-2">
          {['all', 'fault', 'maintenance', 'operational', 'idle'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase border transition-colors ${filterStatus === s
                ? s === 'fault' ? 'bg-[hsl(0_72%_51%/0.15)] border-[hsl(var(--red))] text-[hsl(var(--red))]'
                : s === 'maintenance' ? 'bg-[hsl(38_92%_50%/0.12)] border-[hsl(var(--amber))] text-[hsl(var(--amber))]'
                : 'bg-[hsl(38_92%_50%/0.12)] border-[hsl(var(--amber))] text-[hsl(var(--amber))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'Total Units', value: EQUIPMENT_LIST.length.toString(), status: 'normal' },
          { label: 'Operational', value: EQUIPMENT_LIST.filter(e => e.status === 'operational').length.toString(), status: 'good' },
          { label: 'Fault / Offline', value: faultCount.toString(), status: 'critical' },
          { label: 'In Maintenance', value: maintenanceCount.toString(), status: 'warning' },
          { label: 'Avg Utilization', value: `${avgUtil}%`, status: avgUtil >= 85 ? 'good' : avgUtil >= 75 ? 'warning' : 'critical' },
        ].map(k => (
          <div key={k.label} className="mangan-card p-3">
            <div className="section-label">{k.label}</div>
            <div className={`text-2xl font-semibold tabular-nums mt-1 ${k.status === 'critical' ? 'text-[hsl(var(--red))]' : k.status === 'good' ? 'text-[hsl(var(--green))]' : k.status === 'warning' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-primary))]'}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[320px_1fr_300px] gap-4">
        {/* Equipment list */}
        <div className="mangan-card overflow-hidden flex flex-col" style={{ maxHeight: 520 }}>
          <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Fleet ({filtered.length})</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(eq => (
              <button
                key={eq.id}
                onClick={() => setSelected(eq)}
                className={`w-full px-3 py-2.5 text-left border-b border-[hsl(var(--border))] last:border-0 transition-colors hover:bg-[hsl(var(--accent))] ${selected.id === eq.id ? 'bg-[hsl(38_92%_50%/0.06)]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{TYPE_ICON[eq.type]}</span>
                    <span className="text-xs font-medium text-[hsl(var(--text-primary))]">{eq.name}</span>
                  </div>
                  <span className={`text-[9px] font-semibold ${STATUS_CONFIG[eq.status].color}`}>{STATUS_CONFIG[eq.status].label}</span>
                </div>
                <FailureBar prob={eq.failureProbability} />
                <div className="flex items-center justify-between mt-1 text-[10px] text-[hsl(var(--text-tertiary))]">
                  <span>Util: {eq.utilization}%</span>
                  <span>Downtime: {eq.downtime}h</span>
                  {eq.alerts.length > 0 && <span className="text-[hsl(var(--red))]">{eq.alerts.length} alert{eq.alerts.length > 1 ? 's' : ''}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Utilization chart */}
        <div className="flex flex-col gap-4">
          <div className="mangan-card p-4 flex-1">
            <div className="section-label mb-3">Fleet Utilization — Last 30 Days (%)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={EQUIPMENT_UTILIZATION_HISTORY} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={30} unit="%" />
                <Tooltip contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }} formatter={(v: number) => [`${v.toFixed(1)}%`]} />
                <Line type="monotone" dataKey="excavators" stroke="hsl(38 92% 50%)" strokeWidth={1.5} dot={false} name="Excavators" />
                <Line type="monotone" dataKey="loaders" stroke="hsl(142 50% 42%)" strokeWidth={1.5} dot={false} name="Loaders" />
                <Line type="monotone" dataKey="trucks" stroke="hsl(221 83% 53%)" strokeWidth={1.5} dot={false} name="Trucks" />
                <Line type="monotone" dataKey="drills" stroke="hsl(258 90% 66%)" strokeWidth={1.5} dot={false} name="Drills" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-3 mt-2">
              {[{ label: 'Excavators', color: 'hsl(38 92% 50%)' }, { label: 'Loaders', color: 'hsl(142 50% 42%)' }, { label: 'Trucks', color: 'hsl(221 83% 53%)' }, { label: 'Drills', color: 'hsl(258 90% 66%)' }].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
                  <div className="w-3 h-0.5 rounded" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Predictive maintenance alert */}
          {selected.failureProbability > 0.5 && (
            <div className="mangan-card p-3 border-[hsl(38_92%_50%/0.4)]">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-[hsl(var(--amber))] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-[hsl(var(--amber))] mb-1">Predictive Maintenance Alert</div>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))]">
                    <strong>{selected.name}</strong> has a <strong>{Math.round(selected.failureProbability * 100)}% probability</strong> of requiring maintenance within 14 days based on operational patterns and sensor data.
                  </p>
                  <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-1">Operating hours: {selected.operatingHours.toLocaleString()} · Last inspection: {selected.lastInspection}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Equipment detail */}
        <div className="mangan-card p-3 flex flex-col gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{selected.name}</span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${STATUS_CONFIG[selected.status].bg} ${STATUS_CONFIG[selected.status].color}`}>{STATUS_CONFIG[selected.status].label}</span>
            </div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))] capitalize">{selected.type}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Utilization', value: `${selected.utilization}%` },
              { label: 'Downtime (30d)', value: `${selected.downtime}h` },
              { label: 'Operating Hrs', value: selected.operatingHours.toLocaleString() },
              { label: 'Fuel Efficiency', value: `${selected.fuelEfficiency}%` },
              { label: 'Maintenance', value: selected.maintenanceStatus.toUpperCase(), color: selected.maintenanceStatus === 'ok' ? 'text-[hsl(var(--green))]' : selected.maintenanceStatus === 'due' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--red))]' },
              { label: 'Next Service', value: new Date(selected.nextMaintenanceDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="bg-[hsl(var(--surface-2))] rounded p-2">
                <div className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase tracking-wide">{item.label}</div>
                <div className={`text-xs font-semibold mt-0.5 ${'color' in item && item.color ? item.color : 'text-[hsl(var(--text-primary))]'}`}>{item.value}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="section-label mb-1.5">Failure Probability</div>
            <FailureBar prob={selected.failureProbability} />
          </div>

          {selected.alerts.length > 0 && (
            <div>
              <div className="section-label mb-1.5">Active Alerts ({selected.alerts.length})</div>
              <div className="space-y-1.5">
                {selected.alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-1.5 py-1 border-b border-[hsl(var(--border))] last:border-0">
                    <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${selected.status === 'fault' ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--amber))]'}`} />
                    <span className="text-[11px] text-[hsl(var(--text-secondary))]">{alert}</span>
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
