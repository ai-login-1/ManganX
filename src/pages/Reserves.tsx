import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { GEOLOGICAL_ZONES } from '@/data/geologicalData';
import { Mountain, Target, Info, ChevronRight } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  high:   'text-[hsl(var(--red))]',
  medium: 'text-[hsl(var(--amber))]',
  low:    'text-[hsl(var(--text-tertiary))]',
};

const TYPE_BADGE: Record<string, string> = {
  active:      'bg-[hsl(36_88%_48%/0.1)] text-[hsl(var(--amber))] border-[hsl(36_88%_48%/0.25)]',
  exploration: 'bg-[hsl(210_72%_52%/0.1)] text-[hsl(var(--blue))] border-[hsl(210_72%_52%/0.25)]',
  predicted:   'bg-[hsl(258_90%_66%/0.1)] text-violet-400 border-violet-400/25',
  depleted:    'bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
};

const TYPE_BAR: Record<string, string> = {
  active: '#f59e0b', exploration: '#3b82f6', predicted: '#8b5cf6', depleted: '#6b7280',
};

const WHY_INDICATORS: Record<string, string[][]> = {
  'Z-01': [['Strong spectral anomaly', 'hsl(var(--amber))'], ['Proven drill results', 'hsl(var(--green))'], ['Near structural contact', 'hsl(var(--amber))'], ['48.2% Mn grade confirmed', 'hsl(var(--green))']],
  'Z-02': [['High geophysical response', 'hsl(var(--amber))'], ['2 confirmed drill holes', 'hsl(var(--green))'], ['Active mining confirms ore', 'hsl(var(--green))']],
  'Z-03': [['NDVI suppression anomaly', 'hsl(var(--amber))'], ['Near lineament (< 300m)', 'hsl(var(--amber))'], ['Moderate geophysical signal', 'hsl(210 72% 52%)'], ['1 in-progress drill hole', 'hsl(210 72% 52%)']],
  'Z-04': [['Spectral ratio anomaly', 'hsl(var(--amber))'], ['Suitable terrain gradient', 'hsl(210 72% 52%)'], ['1 planned drill hole', 'hsl(var(--text-tertiary))'], ['Limited historical data', 'hsl(var(--text-tertiary))']],
  'Z-05': [['Weak satellite signal', 'hsl(var(--text-tertiary))'], ['No drill holes', 'hsl(var(--text-tertiary))'], ['Low structural complexity', 'hsl(var(--text-tertiary))']],
  'Z-06': [['Fully depleted — confirmed', 'hsl(var(--text-tertiary))'], ['Historical mine data', 'hsl(var(--text-tertiary))']],
};

export default function Reserves() {
  const [selectedZone, setSelectedZone] = useState(GEOLOGICAL_ZONES[0]);

  const radarData = [
    { axis: 'Geophysical',  val: Math.round(selectedZone.indicators.geophysical * 100) },
    { axis: 'Geochemical',  val: Math.round(selectedZone.indicators.geochemical * 100) },
    { axis: 'Satellite',    val: Math.round(selectedZone.indicators.satellite * 100) },
    { axis: 'Historical',   val: Math.round(selectedZone.indicators.historical * 100) },
    { axis: 'Confidence',   val: Math.round(selectedZone.confidence * 100) },
  ];

  const barData = GEOLOGICAL_ZONES.map(z => ({
    name: z.name.replace('Zone ', '').replace('-', '\n'),
    probability: Math.round(z.manganeseProb * 100),
    quantity: z.estimatedQuantity,
    fill: TYPE_BAR[z.type],
  }));

  const totalReserves = GEOLOGICAL_ZONES.reduce((s, z) => s + z.estimatedQuantity, 0);
  const whyItems = WHY_INDICATORS[selectedZone.id] ?? [];

  return (
    <div className="flex h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* ── Zone list (left) ────────────────────────────── */}
      <div className="w-56 flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
        <div className="px-3 py-2.5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Mountain className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Exploration Zones</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
            <span>{(totalReserves / 1000).toFixed(1)} Mt total</span>
            <span>{GEOLOGICAL_ZONES.filter(z => z.type === 'active').length} active</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {GEOLOGICAL_ZONES.map(zone => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`w-full px-3 py-2.5 text-left border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))] transition-colors ${selectedZone.id === zone.id ? 'bg-[hsl(36_88%_48%/0.06)] border-l-2 border-l-[hsl(var(--amber))]' : ''}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-[hsl(var(--text-primary))] leading-tight">{zone.name}</span>
                <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-sm border uppercase ${TYPE_BADGE[zone.type]}`}>{zone.type}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-[hsl(var(--text-tertiary))]">Prospectivity</span>
                <span className="text-[10px] font-semibold text-[hsl(var(--text-secondary))] tabular-nums">{(zone.manganeseProb * 100).toFixed(0)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${zone.manganeseProb * 100}%`, background: TYPE_BAR[zone.type] }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[9px] text-[hsl(var(--text-tertiary))]">{zone.estimatedQuantity.toLocaleString()} kt</span>
                <span className={`text-[9px] font-semibold uppercase ${PRIORITY_COLORS[zone.priority]}`}>{zone.priority}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Charts area (center) ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[hsl(var(--border))]">

        {/* Page header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">Prospectivity Intelligence</h1>
              <span className="demo-badge">SIMULATION DATA</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">AI-based Mn reserve estimation · XGBoost + Satellite fusion model</p>
          </div>
          <div className="flex gap-5 text-center">
            <div>
              <div className="text-base font-semibold text-[hsl(var(--amber))] tabular-nums">{(totalReserves / 1000).toFixed(1)} Mt</div>
              <div className="section-label">Total Identified</div>
            </div>
            <div>
              <div className="text-base font-semibold text-[hsl(var(--green))] tabular-nums">{GEOLOGICAL_ZONES.filter(z => z.type === 'active').length}</div>
              <div className="section-label">Active Zones</div>
            </div>
            <div>
              <div className="text-base font-semibold text-[hsl(var(--blue))] tabular-nums">{GEOLOGICAL_ZONES.filter(z => z.type === 'exploration').length}</div>
              <div className="section-label">Exploration</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Prospectivity probability bar */}
          <div className="mangan-card p-4">
            <div className="section-label mb-3">Mn Prospectivity Score by Zone (%)</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} unit="%" width={32} />
                <Tooltip
                  contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }}
                  formatter={(v: number) => [`${v}%`, 'Prospectivity']}
                />
                <Bar dataKey="probability" radius={[2, 2, 0, 0]}
                  fill="hsl(36 88% 48%)"
                  label={{ position: 'top', fontSize: 9, fill: 'hsl(210 6% 52%)', formatter: (v: number) => `${v}%` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Estimated quantity */}
          <div className="mangan-card p-4">
            <div className="section-label mb-3">Estimated Ore Quantity (kt)</div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 52, left: 52, bottom: 0 }} barSize={12}>
                <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(210 6% 52%)' }} axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }}
                  formatter={(v: number) => [`${v.toLocaleString()} kt`, 'Estimated']}
                />
                <Bar dataKey="quantity" radius={[0, 2, 2, 0]} fill="hsl(210 72% 52% / 0.65)"
                  label={{ position: 'right', fontSize: 9, fill: 'hsl(210 6% 52%)', formatter: (v: number) => v.toLocaleString() }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Drill hole data */}
          {selectedZone.drillHoles.length > 0 && (
            <div className="mangan-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[hsl(var(--border))]">
                <span className="section-label">Drill Holes — {selectedZone.name} ({selectedZone.drillHoles.length})</span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Hole ID</th>
                    <th>Depth (m)</th>
                    <th>Mn Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedZone.drillHoles.map(dh => (
                    <tr key={dh.id}>
                      <td className="font-mono">{dh.id}</td>
                      <td className="tabular-nums">{dh.depth}</td>
                      <td className="font-semibold text-[hsl(var(--amber))] tabular-nums">{dh.mnGrade.toFixed(1)}% Mn</td>
                      <td>
                        <span className={`text-[9px] font-semibold uppercase ${dh.status === 'completed' ? 'text-[hsl(var(--green))]' : dh.status === 'in-progress' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-tertiary))]'}`}>
                          {dh.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Zone detail panel (right) ─────────────────────── */}
      <div className="w-64 flex flex-col shrink-0 overflow-hidden bg-[hsl(var(--surface-1))]">
        <div className="px-3 py-2.5 border-b border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{selectedZone.name}</span>
            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-sm border uppercase ${TYPE_BADGE[selectedZone.type]}`}>{selectedZone.type}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Mn Prospectivity', value: `${(selectedZone.manganeseProb * 100).toFixed(0)}%`, color: selectedZone.manganeseProb > 0.8 ? 'text-[hsl(var(--green))]' : selectedZone.manganeseProb > 0.6 ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-secondary))]' },
              { label: 'Ore Grade', value: `${selectedZone.oreGrade}%` },
              { label: 'Est. Quantity', value: `${selectedZone.estimatedQuantity.toLocaleString()} kt` },
              { label: 'Confidence', value: `${(selectedZone.confidence * 100).toFixed(0)}%` },
              { label: 'Avg Depth', value: `${selectedZone.depth}m` },
              { label: 'Area', value: `${selectedZone.area} ha` },
            ].map(item => (
              <div key={item.label} className="bg-[hsl(var(--surface-2))] rounded-sm p-2">
                <div className="section-label">{item.label}</div>
                <div className={`text-xs font-semibold mt-0.5 ${'color' in item && item.color ? item.color : 'text-[hsl(var(--text-primary))]'}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Geological indicators radar */}
          <div>
            <div className="section-label mb-2">Indicator Scores</div>
            <ResponsiveContainer width="100%" height={130}>
              <RadarChart data={radarData} margin={{ top: 4, right: 10, left: 10, bottom: 4 }}>
                <PolarGrid stroke="hsl(210 6% 18%)" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 8, fill: 'hsl(210 6% 46%)' }} />
                <Radar name="Score" dataKey="val" stroke="hsl(36 88% 48%)" fill="hsl(36 88% 48%)" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Why this area */}
          <div>
            <div className="section-label mb-2">Why This Area?</div>
            <div className="space-y-1">
              {whyItems.map(([text, color], i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <span className="shrink-0" style={{ color }}>›</span>
                  <span className="text-[hsl(var(--text-secondary))]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI exploration priority */}
          <div className={`mangan-panel p-2.5 ${selectedZone.priority === 'high' ? 'border-[hsl(36_88%_48%/0.3)]' : ''}`}>
            <div className="flex items-start gap-1.5">
              <Target className="w-3.5 h-3.5 text-[hsl(var(--amber))] shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] font-semibold text-[hsl(var(--amber))] uppercase mb-1">
                  Priority: {selectedZone.priority.toUpperCase()}
                </div>
                <p className="text-[10px] text-[hsl(var(--text-secondary))] leading-relaxed">
                  {selectedZone.priority === 'high'
                    ? `${selectedZone.name} is a priority target. ${selectedZone.type === 'active' ? 'Expand active mining boundary and deepen drill program.' : 'Begin systematic 500m-spaced drill grid immediately.'}`
                    : selectedZone.priority === 'medium'
                    ? `Conduct 2 additional confirmation drill holes before committing full resources. Geophysical survey recommended.`
                    : `Low current priority. Satellite anomaly monitoring sufficient until higher-priority zones are developed.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
