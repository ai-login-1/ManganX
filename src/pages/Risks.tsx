import { useState } from 'react';
import { RISK_ITEMS, RISK_MATRIX_DATA } from '@/data/riskData';
import type { RiskItem } from '@/types';
import { AlertTriangle, Shield, ChevronDown, ChevronRight, Activity } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const SEV_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  critical: { bg: 'bg-[hsl(0_72%_51%/0.08)]', text: 'text-[hsl(var(--red))]', border: 'border-[hsl(0_72%_51%/0.4)]', dot: 'bg-[hsl(var(--red))]' },
  high: { bg: 'bg-[hsl(38_92%_50%/0.06)]', text: 'text-[hsl(var(--amber))]', border: 'border-[hsl(38_92%_50%/0.3)]', dot: 'bg-[hsl(var(--amber))]' },
  medium: { bg: 'bg-[hsl(45_96%_56%/0.06)]', text: 'text-yellow-400', border: 'border-yellow-400/30', dot: 'bg-yellow-400' },
  low: { bg: 'bg-[hsl(var(--surface-2))]', text: 'text-[hsl(var(--text-tertiary))]', border: 'border-[hsl(var(--border))]', dot: 'bg-[hsl(var(--text-tertiary))]' },
};

const CAT_COLORS: Record<string, string> = {
  production: 'text-[hsl(var(--red))]',
  equipment: 'text-[hsl(var(--amber))]',
  weather: 'text-blue-400',
  blasting: 'text-violet-400',
  exploration: 'text-[hsl(var(--green))]',
  operational: 'text-[hsl(var(--text-tertiary))]',
};

function RiskCard({ risk, expanded, onToggle }: { risk: RiskItem; expanded: boolean; onToggle: () => void }) {
  const cfg = SEV_CONFIG[risk.severity];
  return (
    <div className={`mangan-card ${cfg.bg} border ${cfg.border} overflow-hidden`}>
      <button className="w-full px-4 py-3 text-left" onClick={onToggle}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${cfg.dot}`} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[hsl(var(--text-primary))] leading-tight mb-0.5">{risk.title}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-semibold uppercase ${cfg.text}`}>{risk.severity}</span>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))]">·</span>
                <span className={`text-[10px] capitalize font-medium ${CAT_COLORS[risk.category]}`}>{risk.category}</span>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))]">·</span>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{Math.round(risk.probability * 100)}% prob</span>
                <span className="text-[10px] text-[hsl(var(--text-tertiary))]">·</span>
                <span className="text-[10px] text-[hsl(var(--red))]">{risk.impact}% impact</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-semibold ${risk.status === 'active' ? 'border-[hsl(var(--red))] text-[hsl(var(--red))]' : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'}`}>
              {risk.status}
            </span>
            {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> : <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-[hsl(var(--border))]">
          <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed pt-3">{risk.description}</p>

          <div>
            <div className="section-label mb-2">Contributing Factors</div>
            <div className="space-y-1.5">
              {risk.factors.map(f => (
                <div key={f.label} className="flex items-center gap-2">
                  <span className="text-[11px] text-[hsl(var(--text-secondary))] flex-1">{f.label}</span>
                  <div className="w-24 h-1.5 bg-[hsl(var(--surface-3))] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[hsl(var(--red))]" style={{ width: `${Math.abs(f.impact) * 8}%` }} />
                  </div>
                  <span className="text-[10px] text-[hsl(var(--red))] font-semibold tabular-nums w-8 text-right">{f.impact}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-[hsl(var(--surface-2))] rounded p-2.5">
            <Shield className="w-3.5 h-3.5 text-[hsl(var(--green))] shrink-0 mt-0.5" />
            <div>
              <div className="text-[9px] font-semibold text-[hsl(var(--green))] uppercase mb-0.5">Recommended Action</div>
              <p className="text-[11px] text-[hsl(var(--text-secondary))]">{risk.recommendedAction}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-[hsl(var(--text-tertiary))]">
            <span>Affected: <span className="text-[hsl(var(--text-secondary))]">{risk.affectedZone}</span></span>
            <span>Predicted: <span className="text-[hsl(var(--text-secondary))]">{new Date(risk.predictedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Risks() {
  const [expandedId, setExpandedId] = useState<string | null>('R-001');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filtered = filterSeverity === 'all' ? RISK_ITEMS : RISK_ITEMS.filter(r => r.severity === filterSeverity);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Risk Center</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">AI-driven risk assessment · 6 categories monitored · <span className="demo-badge">SIMULATION DATA</span></p>
        </div>
        <div className="flex gap-2">
          {['all', 'critical', 'high', 'medium', 'low'].map(s => (
            <button key={s} onClick={() => setFilterSeverity(s)}
              className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase border transition-colors ${filterSeverity === s
                ? s === 'critical' ? 'bg-[hsl(0_72%_51%/0.15)] border-[hsl(var(--red))] text-[hsl(var(--red))]'
                : s === 'high' ? 'bg-[hsl(38_92%_50%/0.12)] border-[hsl(var(--amber))] text-[hsl(var(--amber))]'
                : 'bg-[hsl(38_92%_50%/0.12)] border-[hsl(var(--amber))] text-[hsl(var(--amber))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Risk list */}
        <div className="space-y-2">
          {filtered.map(risk => (
            <RiskCard
              key={risk.id}
              risk={risk}
              expanded={expandedId === risk.id}
              onToggle={() => setExpandedId(expandedId === risk.id ? null : risk.id)}
            />
          ))}
        </div>

        {/* Risk Matrix */}
        <div className="flex flex-col gap-4">
          <div className="mangan-card p-4">
            <div className="section-label mb-3">Risk Matrix — Probability vs Impact</div>
            <ResponsiveContainer width="100%" height={200}>
              <ScatterChart margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
                <CartesianGrid stroke="hsl(220 12% 14%)" strokeDasharray="4 4" />
                <XAxis type="number" dataKey="impact" name="Impact" domain={[0, 25]} tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} label={{ value: 'Impact (%)', position: 'insideBottom', offset: -4, fontSize: 9, fill: 'hsl(215 14% 42%)' }} unit="%" />
                <YAxis type="number" dataKey="probability" name="Probability" domain={[0, 1]} tick={{ fontSize: 9, fill: 'hsl(215 14% 48%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(220 16% 10%)', border: '1px solid hsl(220 12% 18%)', borderRadius: '4px', fontSize: '11px' }}
                  formatter={(v: number, name: string) => [name === 'probability' ? `${(v * 100).toFixed(0)}%` : `${v}%`, name === 'probability' ? 'Probability' : 'Impact']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
                />
                <Scatter data={RISK_MATRIX_DATA} fill="#f59e0b">
                  {RISK_MATRIX_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div className="mangan-card p-3">
            <div className="section-label mb-3">Risk Summary</div>
            <div className="space-y-2">
              {[
                { label: 'Critical', count: RISK_ITEMS.filter(r => r.severity === 'critical').length, color: 'text-[hsl(var(--red))]', bg: 'bg-[hsl(0_72%_51%)]' },
                { label: 'High', count: RISK_ITEMS.filter(r => r.severity === 'high').length, color: 'text-[hsl(var(--amber))]', bg: 'bg-[hsl(38_92%_50%)]' },
                { label: 'Medium', count: RISK_ITEMS.filter(r => r.severity === 'medium').length, color: 'text-yellow-400', bg: 'bg-yellow-400' },
                { label: 'Low', count: RISK_ITEMS.filter(r => r.severity === 'low').length, color: 'text-[hsl(var(--text-tertiary))]', bg: 'bg-[hsl(var(--text-tertiary))]' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${item.bg}`} />
                  <span className="text-xs text-[hsl(var(--text-secondary))] flex-1">{item.label}</span>
                  <span className={`text-sm font-semibold tabular-nums ${item.color}`}>{item.count}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[hsl(var(--border))]">
              <div className="text-[11px] text-[hsl(var(--text-secondary))]">
                <strong className="text-[hsl(var(--red))]">2 active critical risks</strong> require immediate intervention. Aggregate production impact: <strong className="text-[hsl(var(--amber))]">-23%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
