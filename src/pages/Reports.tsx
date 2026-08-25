import { useState } from 'react';
import { FileText, Download, ChevronRight, CheckCircle, Clock, BarChart2, Shield, Wrench, Mountain, Users } from 'lucide-react';
import { PRODUCTION_KPI } from '@/data/productionData';
import { toast } from 'sonner';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'production' | 'reserve' | 'risk' | 'equipment' | 'executive';
  lastGenerated: string;
  pages: number;
  icon: typeof FileText;
}

const REPORTS: Report[] = [
  { id: 'R1', title: 'Monthly Production Report', description: 'Detailed production vs target analysis, shift-wise breakdown, YTD performance and forecast for next 30 days.', type: 'production', lastGenerated: '2026-08-01', pages: 12, icon: BarChart2 },
  { id: 'R2', title: 'Reserve Assessment Report', description: 'Zone-wise reserve probability, ore grade analysis, drill hole data summary, and exploration recommendations.', type: 'reserve', lastGenerated: '2026-07-15', pages: 24, icon: Mountain },
  { id: 'R3', title: 'Risk & Compliance Report', description: 'AI-identified operational risks, severity matrix, compliance status, and mitigation action tracking.', type: 'risk', lastGenerated: '2026-08-15', pages: 18, icon: Shield },
  { id: 'R4', title: 'Equipment Health Report', description: 'Fleet status, maintenance compliance, predictive failure analysis, and downtime cost impact.', type: 'equipment', lastGenerated: '2026-08-10', pages: 16, icon: Wrench },
  { id: 'R5', title: 'Executive Summary', description: 'C-level overview: KPIs, production vs targets, critical risks, key recommendations, and strategic outlook.', type: 'executive', lastGenerated: '2026-08-20', pages: 6, icon: Users },
];

const TYPE_COLORS: Record<string, string> = {
  production: 'text-[hsl(var(--amber))]',
  reserve: 'text-blue-400',
  risk: 'text-[hsl(var(--red))]',
  equipment: 'text-violet-400',
  executive: 'text-[hsl(var(--green))]',
};

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<string[]>([]);

  const generate = (report: Report) => {
    setGenerating(report.id);
    setTimeout(() => {
      setGenerating(null);
      setGenerated(prev => [...prev, report.id]);
      toast.success(`${report.title} generated`, { description: `${report.pages} pages · Ready for download` });
    }, 2000);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Reports</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">Auto-generated intelligence reports · Export PDF / CSV</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'YTD Production', value: `${PRODUCTION_KPI.ytdProduction.toLocaleString()} t`, sub: `Target: ${PRODUCTION_KPI.ytdTarget.toLocaleString()} t` },
          { label: 'Plan Attainment', value: `${((PRODUCTION_KPI.ytdProduction / PRODUCTION_KPI.ytdTarget) * 100).toFixed(1)}%`, sub: 'YTD' },
          { label: 'Est. Reserves', value: `${PRODUCTION_KPI.estimatedReserves} Mt`, sub: 'Balaghat Alpha' },
          { label: 'Active Risk Items', value: PRODUCTION_KPI.activeAlerts.toString(), sub: '2 critical' },
        ].map(k => (
          <div key={k.label} className="mangan-card p-3">
            <div className="section-label">{k.label}</div>
            <div className="text-lg font-semibold text-[hsl(var(--text-primary))] tabular-nums mt-1">{k.value}</div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))]">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Reports grid */}
      <div className="grid grid-cols-2 gap-4">
        {REPORTS.map(report => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;
          const isGenerated = generated.includes(report.id);
          return (
            <div key={report.id} className="mangan-card p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${TYPE_COLORS[report.type]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[hsl(var(--text-primary))] leading-tight">{report.title}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[hsl(var(--text-tertiary))]">
                    <span className={`font-semibold uppercase ${TYPE_COLORS[report.type]}`}>{report.type}</span>
                    <span>·</span>
                    <span>{report.pages} pages</span>
                    <span>·</span>
                    <span>Last: {new Date(report.lastGenerated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">{report.description}</p>

              <div className="flex items-center gap-2 pt-1 border-t border-[hsl(var(--border))]">
                <button
                  onClick={() => generate(report)}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-[hsl(var(--amber))] text-black text-xs font-semibold hover:bg-[hsl(38_92%_44%)] disabled:opacity-60 transition-colors"
                >
                  {isGenerating ? (
                    <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />Generating...</>
                  ) : (
                    <><FileText className="w-3 h-3" />Generate Report</>
                  )}
                </button>

                {isGenerated && (
                  <>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded border border-[hsl(var(--green))] text-[hsl(var(--green))] text-xs font-medium hover:bg-[hsl(142_50%_42%/0.1)] transition-colors">
                      <Download className="w-3 h-3" />PDF
                    </button>
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded border border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] text-xs font-medium hover:border-[hsl(var(--amber))] transition-colors">
                      <Download className="w-3 h-3" />CSV
                    </button>
                  </>
                )}
              </div>

              {isGenerated && (
                <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--green))]">
                  <CheckCircle className="w-3 h-3" />
                  Report ready · Generated just now
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scheduled reports */}
      <div className="mangan-card p-4">
        <div className="section-label mb-3">Scheduled Reports</div>
        <div className="space-y-2">
          {[
            { name: 'Daily Production Summary', schedule: 'Every day at 18:00 IST', next: 'Today 18:00' },
            { name: 'Weekly Risk Digest', schedule: 'Every Monday 08:00 IST', next: '25 Aug 08:00' },
            { name: 'Monthly Executive Report', schedule: '1st of each month', next: '01 Sep 09:00' },
          ].map(s => (
            <div key={s.name} className="flex items-center gap-3 py-2 border-b border-[hsl(var(--border))] last:border-0">
              <Clock className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] shrink-0" />
              <span className="text-xs text-[hsl(var(--text-secondary))] flex-1">{s.name}</span>
              <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{s.schedule}</span>
              <span className="text-[10px] font-medium text-[hsl(var(--amber))]">Next: {s.next}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
