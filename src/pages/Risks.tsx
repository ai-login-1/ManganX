import { useState } from 'react';
import { RISK_ITEMS, RISK_MATRIX_DATA } from '@/data/riskData';
import type { RiskItem } from '@/types';
import { AlertTriangle, Shield, ChevronDown, ChevronRight } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const SEV_CONFIG: Record<string, {
  border: string; text: string; labelBg: string; dot: string;
}> = {
  critical: { border: 'border-l-2 border-l-[hsl(var(--red))]',   text: 'text-[hsl(var(--red))]',   labelBg: 'bg-[hsl(0_68%_48%/0.1)] text-[hsl(var(--red))]',   dot: 'bg-[hsl(var(--red))]' },
  high:     { border: 'border-l-2 border-l-[hsl(var(--amber))]', text: 'text-[hsl(var(--amber))]', labelBg: 'bg-[hsl(36_88%_48%/0.1)] text-[hsl(var(--amber))]', dot: 'bg-[hsl(var(--amber))]' },
  medium:   { border: 'border-l-2 border-l-yellow-500',          text: 'text-yellow-400',          labelBg: 'bg-yellow-400/10 text-yellow-400',                   dot: 'bg-yellow-400' },
  low:      { border: 'border-l-2 border-l-[hsl(var(--text-dim))]', text: 'text-[hsl(var(--text-tertiary))]', labelBg: 'bg-[hsl(var(--surface-2))] text-[hsl(var(--text-tertiary))]', dot: 'bg-[hsl(var(--text-dim))]' },
};

const CAT_COLORS: Record<string, string> = {
  production:  'text-[hsl(var(--red))]',
  equipment:   'text-[hsl(var(--amber))]',
  weather:     'text-[hsl(var(--blue))]',
  blasting:    'text-violet-400',
  exploration: 'text-[hsl(var(--green))]',
  operational: 'text-[hsl(var(--text-tertiary))]',
};

function RiskRow({ risk, expanded, onToggle }: { risk: RiskItem; expanded: boolean; onToggle: () => void }) {
  const cfg = SEV_CONFIG[risk.severity];
  return (
    <div className={`bg-[hsl(var(--surface-1))] border-b border-[hsl(var(--border))] ${cfg.border} overflow-hidden`}>
      <button className="w-full px-4 py-2.5 text-left hover:bg-[hsl(var(--surface-2))] transition-colors" onClick={onToggle}>
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-[hsl(var(--text-primary))] leading-tight">{risk.title}</span>
              <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-sm uppercase ${cfg.labelBg}`}>{risk.severity}</span>
              <span className={`text-[9px] capitalize ${CAT_COLORS[risk.category]}`}>{risk.category}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[9px] text-[hsl(var(--text-tertiary))]">
              <span>{Math.round(risk.probability * 100)}% probability</span>
              <span className="text-[hsl(var(--red))]">{risk.impact}% production impact</span>
              <span>{new Date(risk.predictedDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
              <span className={`font-semibold uppercase ${risk.status === 'active' ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--text-dim))]'}`}>{risk.status}</span>
            </div>
          </div>
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] shrink-0" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 bg-[hsl(var(--surface-2))]">
          <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">{risk.description}</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Contributing factors */}
            <div>
              <div className="section-label mb-2">Contributing Factors</div>
              <div className="space-y-1.5">
                {risk.factors.map(f => (
                  <div key={f.label} className="flex items-center gap-2">
                    <span className="text-[10px] text-[hsl(var(--text-secondary))] flex-1 truncate">{f.label}</span>
                    <div className="w-20 progress-track">
                      <div className="progress-fill bg-[hsl(var(--red))]" style={{ width: `${Math.abs(f.impact) * 6}%` }} />
                    </div>
                    <span className="text-[10px] font-semibold text-[hsl(var(--red))] tabular-nums w-6 text-right">{f.impact}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended action */}
            <div>
              <div className="section-label mb-2">Recommended Action</div>
              <div className="bg-[hsl(var(--surface-1))] rounded-sm p-2.5 flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[hsl(var(--green))] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[hsl(var(--text-secondary))] leading-relaxed">{risk.recommendedAction}</p>
              </div>
              <div className="mt-2 text-[9px] text-[hsl(var(--text-dim))]">
                Affected zone: <span className="text-[hsl(var(--text-tertiary))]">{risk.affectedZone}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Risks() {
  const [expandedId, setExpandedId] = useState<string | null>('R-001');
  const [filterSeverity, setFilterSeverity] = useState('all');

  const filtered = filterSeverity === 'all' ? RISK_ITEMS : RISK_ITEMS.filter(r => r.severity === filterSeverity);

  return (
    <div className="flex h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* ── Risk list (main) ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-[hsl(var(--border))]">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title">Risk Center</h1>
              <span className="demo-badge">SIMULATION DATA</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">AI-driven risk assessment · 6 categories · Updated 2m ago</p>
          </div>
          <div className="flex items-center gap-1">
            {['all', 'critical', 'high', 'medium', 'low'].map(s => (
              <button key={s} onClick={() => setFilterSeverity(s)}
                className={`filter-btn ${filterSeverity === s ? 'filter-btn-active' : ''} uppercase`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Risk list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(risk => (
            <RiskRow
              key={risk.id}
              risk={risk}
              expanded={expandedId === risk.id}
              onToggle={() => setExpandedId(expandedId === risk.id ? null : risk.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-32 text-[hsl(var(--text-tertiary))] text-sm">
              No risks match the selected filter.
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel: matrix + summary ────────────────── */}
      <div className="w-72 flex flex-col shrink-0 overflow-hidden bg-[hsl(var(--surface-1))]">

        {/* Risk matrix */}
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="section-label mb-2">Risk Matrix — Probability vs Impact</div>
          <ResponsiveContainer width="100%" height={180}>
            <ScatterChart margin={{ top: 8, right: 8, left: -12, bottom: 12 }}>
              <CartesianGrid stroke="hsl(210 6% 13%)" strokeDasharray="4 4" />
              <XAxis type="number" dataKey="impact" name="Impact" domain={[0, 25]}
                tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false}
                label={{ value: 'Impact (%)', position: 'insideBottom', offset: -8, fontSize: 9, fill: 'hsl(210 6% 36%)' }} unit="%" />
              <YAxis type="number" dataKey="probability" name="Probability" domain={[0, 1]}
                tick={{ fontSize: 9, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
              <Tooltip
                contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }}
                formatter={(v: number, name: string) => [name === 'probability' ? `${(v * 100).toFixed(0)}%` : `${v}%`, name === 'probability' ? 'Probability' : 'Impact']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
              />
              <Scatter data={RISK_MATRIX_DATA} fill="#f59e0b">
                {RISK_MATRIX_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Summary */}
        <div className="p-4 border-b border-[hsl(var(--border))]">
          <div className="section-label mb-2.5">Risk Summary</div>
          <div className="space-y-2">
            {[
              { label: 'Critical', count: RISK_ITEMS.filter(r => r.severity === 'critical').length, color: 'text-[hsl(var(--red))]', dot: 'bg-[hsl(var(--red))]' },
              { label: 'High',     count: RISK_ITEMS.filter(r => r.severity === 'high').length,     color: 'text-[hsl(var(--amber))]', dot: 'bg-[hsl(var(--amber))]' },
              { label: 'Medium',   count: RISK_ITEMS.filter(r => r.severity === 'medium').length,   color: 'text-yellow-400', dot: 'bg-yellow-400' },
              { label: 'Low',      count: RISK_ITEMS.filter(r => r.severity === 'low').length,      color: 'text-[hsl(var(--text-tertiary))]', dot: 'bg-[hsl(var(--text-dim))]' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dot}`} />
                <span className="text-[11px] text-[hsl(var(--text-secondary))] flex-1">{item.label}</span>
                <span className={`text-sm font-semibold tabular-nums ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aggregate impact */}
        <div className="p-4 flex-1">
          <div className="section-label mb-2">Aggregate Impact</div>
          <div className="space-y-2 text-[11px] text-[hsl(var(--text-secondary))]">
            <div className="flex justify-between">
              <span>Total production impact</span>
              <span className="font-semibold text-[hsl(var(--red))]">-23%</span>
            </div>
            <div className="flex justify-between">
              <span>Active critical risks</span>
              <span className="font-semibold text-[hsl(var(--red))]">2</span>
            </div>
            <div className="flex justify-between">
              <span>Monitoring items</span>
              <span className="font-semibold text-[hsl(var(--amber))]">3</span>
            </div>
          </div>
          <div className="mt-3 p-2.5 bg-[hsl(var(--surface-2))] rounded-sm border border-[hsl(0_68%_48%/0.15)]">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--red))] shrink-0 mt-0.5" />
              <p className="text-[10px] text-[hsl(var(--text-secondary))] leading-relaxed">
                <strong className="text-[hsl(var(--red))]">2 critical risks</strong> require immediate intervention. Combined production shortfall risk: <strong className="text-[hsl(var(--amber))]">84%</strong> within 18 days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
