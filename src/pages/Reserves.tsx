import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { GEOLOGICAL_ZONES } from '@/data/geologicalData';
import { Mountain, Drill, Target, ChevronRight, Info } from 'lucide-react';

const PRIORITY_COLORS = { high: 'text-[hsl(var(--red))]', medium: 'text-[hsl(var(--amber))]', low: 'text-[hsl(var(--text-tertiary))]' };
const TYPE_COLORS = { active: '#f59e0b', exploration: '#3b82f6', predicted: '#8b5cf6', depleted: '#6b7280' };
const TYPE_BG = {
  active: 'bg-[hsl(38_92%_50%/0.1)] text-[hsl(var(--amber))] border-[hsl(38_92%_50%/0.3)]',
  exploration: 'bg-[hsl(221_83%_53%/0.1)] text-blue-400 border-blue-400/30',
  predicted: 'bg-[hsl(258_90%_66%/0.1)] text-violet-400 border-violet-400/30',
  depleted: 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))] border-[hsl(var(--border))]',
};

export default function Reserves() {
  const [selectedZone, setSelectedZone] = useState(GEOLOGICAL_ZONES[0]);

  const radarData = [
    { indicator: 'Geophysical', value: Math.round(selectedZone.indicators.geophysical * 100) },
    { indicator: 'Geochemical', value: Math.round(selectedZone.indicators.geochemical * 100) },
    { indicator: 'Satellite', value: Math.round(selectedZone.indicators.satellite * 100) },
    { indicator: 'Historical', value: Math.round(selectedZone.indicators.historical * 100) },
    { indicator: 'Confidence', value: Math.round(selectedZone.confidence * 100) },
  ];

  const barData = GEOLOGICAL_ZONES.map(z => ({
    name: z.name.replace('Zone ', ''),
    probability: Math.round(z.manganeseProb * 100),
    quantity: z.estimatedQuantity,
    color: TYPE_COLORS[z.type],
  }));

  const totalReserves = GEOLOGICAL_ZONES.reduce((s, z) => s + z.estimatedQuantity, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Reserve Intelligence</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">AI-based geological reserve estimation · XGBoost + Satellite fusion model · <span className="demo-badge">SIMULATION DATA</span></p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-[hsl(var(--amber))] tabular-nums">{(totalReserves / 1000).toFixed(1)} Mt</div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))]">Total Identified</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-[hsl(var(--green))] tabular-nums">{GEOLOGICAL_ZONES.filter(z => z.type === 'active').length}</div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))]">Active Zones</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-400 tabular-nums">{GEOLOGICAL_ZONES.filter(z => z.type === 'exploration').length}</div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))]">Exploration</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[280px_1fr_300px] gap-4">
        {/* Zone list */}
        <div className="mangan-card overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
            <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Exploration Zones</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {GEOLOGICAL_ZONES.map(zone => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`w-full px-3 py-2.5 text-left border-b border-[hsl(var(--border))] last:border-0 transition-colors hover:bg-[hsl(var(--accent))] ${selectedZone.id === zone.id ? 'bg-[hsl(38_92%_50%/0.08)]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[hsl(var(--text-primary))]">{zone.name}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${TYPE_BG[zone.type]}`}>{zone.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[10px] text-[hsl(var(--text-tertiary))] mb-0.5">
                      <span>Mn Prob</span>
                      <span className="font-medium text-[hsl(var(--text-secondary))]">{(zone.manganeseProb * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-[hsl(var(--surface-3))] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${zone.manganeseProb * 100}%`, background: TYPE_COLORS[zone.type] }} />
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium ${PRIORITY_COLORS[zone.priority]}`}>{zone.priority.toUpperCase()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reserve probability chart + map-like visualization */}
        <div className="flex flex-col gap-4">
          <div className="mangan-card p-4">
            <div className="section-label mb-3">Reserve Probability by Zone</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 0, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }}
                  formatter={(v: number) => [`${v}%`, 'Mn Probability']}
                />
                <Bar dataKey="probability" radius={[2, 2, 0, 0]}
                  fill="hsl(38 92% 50%)"
                  label={{ position: 'top', fontSize: 9, fill: 'hsl(215 14% 62%)' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mangan-card p-4 flex-1">
            <div className="section-label mb-3">Estimated Ore Quantity (thousand tonnes)</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 40, left: 40, bottom: 0 }}>
                <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: 'hsl(215 14% 62%)' }} axisLine={false} tickLine={false} width={52} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }}
                  formatter={(v: number) => [`${v.toLocaleString()} kt`, 'Est. Quantity']}
                />
                <Bar dataKey="quantity" radius={[0, 2, 2, 0]}
                  fill="hsl(221 83% 53% / 0.7)"
                  label={{ position: 'right', fontSize: 9, fill: 'hsl(215 14% 62%)', formatter: (v: number) => `${v.toLocaleString()}` }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone detail panel */}
        <div className="flex flex-col gap-3">
          <div className="mangan-card p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{selectedZone.name}</span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${TYPE_BG[selectedZone.type]}`}>{selectedZone.type}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { label: 'Mn Probability', value: `${(selectedZone.manganeseProb * 100).toFixed(0)}%`, status: selectedZone.manganeseProb > 0.8 ? 'good' : selectedZone.manganeseProb > 0.6 ? 'warning' : 'normal' },
                { label: 'Ore Grade', value: `${selectedZone.oreGrade}% Mn` },
                { label: 'Est. Quantity', value: `${selectedZone.estimatedQuantity.toLocaleString()} kt` },
                { label: 'Confidence', value: `${(selectedZone.confidence * 100).toFixed(0)}%` },
                { label: 'Avg Depth', value: `${selectedZone.depth}m` },
                { label: 'Area', value: `${selectedZone.area} ha` },
              ].map(item => (
                <div key={item.label} className="bg-[hsl(var(--surface-2))] rounded p-2">
                  <div className="text-[9px] text-[hsl(var(--text-tertiary))] uppercase tracking-wide">{item.label}</div>
                  <div className={`text-xs font-semibold mt-0.5 ${item.status === 'good' ? 'text-[hsl(var(--green))]' : item.status === 'warning' ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-primary))]'}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Radar chart for indicators */}
            <div className="section-label mb-2">Geological Indicators</div>
            <ResponsiveContainer width="100%" height={140}>
              <RadarChart data={radarData} margin={{ top: 0, right: 12, left: 12, bottom: 0 }}>
                <PolarGrid stroke="hsl(220 12% 18%)" />
                <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 8, fill: 'hsl(215 14% 52%)' }} />
                <Radar name="Score" dataKey="value" stroke="hsl(38 92% 50%)" fill="hsl(38 92% 50%)" fillOpacity={0.2} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Drill holes */}
          <div className="mangan-card p-3">
            <div className="section-label mb-2">Drill Holes ({selectedZone.drillHoles.length})</div>
            {selectedZone.drillHoles.length === 0 ? (
              <p className="text-[11px] text-[hsl(var(--text-tertiary))]">No drill holes yet — zone pending exploration.</p>
            ) : (
              <div className="space-y-1.5">
                {selectedZone.drillHoles.map(dh => (
                  <div key={dh.id} className="flex items-center gap-2 py-1 border-b border-[hsl(var(--border))] last:border-0">
                    <Drill className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                    <span className="text-[10px] font-mono text-[hsl(var(--text-secondary))] flex-1">{dh.id}</span>
                    <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{dh.depth}m</span>
                    <span className="text-[10px] font-semibold text-[hsl(var(--amber))]">{dh.mnGrade.toFixed(1)}%</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${dh.status === 'completed' ? 'bg-[hsl(var(--green))]' : dh.status === 'in-progress' ? 'bg-[hsl(var(--amber))]' : 'bg-[hsl(var(--text-tertiary))]'}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Priority recommendation */}
          <div className={`mangan-card p-3 ${selectedZone.priority === 'high' ? 'border-[hsl(38_92%_50%/0.4)]' : ''}`}>
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-[hsl(var(--amber))] shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-semibold text-[hsl(var(--amber))] uppercase mb-1">AI Exploration Priority: {selectedZone.priority.toUpperCase()}</div>
                <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">
                  {selectedZone.priority === 'high'
                    ? `${selectedZone.name} is a priority target. ${selectedZone.type === 'active' ? 'Current operations confirm high-grade ore. Expand active mining boundary.' : 'Commence systematic drill program with 3×3 grid at 500m spacing.'}`
                    : selectedZone.priority === 'medium'
                    ? `${selectedZone.name} shows moderate potential. ${selectedZone.manganeseProb > 0.65 ? 'Conduct 2 additional confirmation drill holes before committing resources.' : 'Perform detailed geophysical survey before drilling.'}`
                    : `${selectedZone.name} has low current priority. Satellite anomaly monitoring sufficient until Zone Alpha/Beta reserves decline.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
