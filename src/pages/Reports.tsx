import { useState } from 'react';
import { FileText, Download, CheckCircle, Clock, BarChart2, Shield, Wrench, Mountain, Users } from 'lucide-react';
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
  { id: 'R1', title: 'Monthly Production Report',  description: 'Production vs target analysis, shift breakdown, YTD performance, 30-day forecast.',  type: 'production', lastGenerated: '2026-08-01', pages: 12, icon: BarChart2 },
  { id: 'R2', title: 'Reserve Assessment Report',  description: 'Zone-wise prospectivity, ore grade analysis, drill hole summary, exploration plan.',     type: 'reserve',    lastGenerated: '2026-07-15', pages: 24, icon: Mountain },
  { id: 'R3', title: 'Risk & Compliance Report',   description: 'AI-identified operational risks, probability matrix, compliance status, mitigation log.', type: 'risk',       lastGenerated: '2026-08-15', pages: 18, icon: Shield },
  { id: 'R4', title: 'Equipment Health Report',    description: 'Fleet status, maintenance compliance, predictive failure analysis, downtime impact.',    type: 'equipment',  lastGenerated: '2026-08-10', pages: 16, icon: Wrench },
  { id: 'R5', title: 'Executive Summary',          description: 'C-level KPI overview, critical risks, key recommendations, strategic outlook.',          type: 'executive',  lastGenerated: '2026-08-20', pages:  6, icon: Users },
];

const TYPE_ACCENT: Record<string, string> = {
  production: 'text-[hsl(var(--amber))]',
  reserve:    'text-[hsl(var(--blue))]',
  risk:       'text-[hsl(var(--red))]',
  equipment:  'text-violet-400',
  executive:  'text-[hsl(var(--green))]',
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
    }, 1800);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">Auto-generated intelligence reports · Export PDF / CSV</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 border-b border-[hsl(var(--border))] shrink-0">
        {[
          { label: 'YTD Production', value: `${PRODUCTION_KPI.ytdProduction.toLocaleString()} t`, sub: `Target: ${PRODUCTION_KPI.ytdTarget.toLocaleString()} t` },
          { label: 'Plan Attainment', value: `${((PRODUCTION_KPI.ytdProduction / PRODUCTION_KPI.ytdTarget) * 100).toFixed(1)}%`, sub: 'Year to date' },
          { label: 'Est. Reserves',   value: `${PRODUCTION_KPI.estimatedReserves} Mt`, sub: 'Balaghat Alpha' },
          { label: 'Active Risks',    value: PRODUCTION_KPI.activeAlerts.toString(), sub: '2 critical' },
        ].map((k, i) => (
          <div key={k.label} className={`px-4 py-2.5 ${i < 3 ? 'border-r border-[hsl(var(--border))]' : ''}`}>
            <div className="section-label">{k.label}</div>
            <div className="text-base font-semibold text-[hsl(var(--text-primary))] tabular-nums mt-0.5">{k.value}</div>
            <div className="text-[9px] text-[hsl(var(--text-tertiary))]">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {/* Report cards */}
        <div className="grid grid-cols-2 gap-3">
          {REPORTS.map(report => {
            const Icon = report.icon;
            const isGenerating = generating === report.id;
            const isGenerated = generated.includes(report.id);
            return (
              <div key={report.id} className="mangan-card p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-sm bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${TYPE_ACCENT[report.type]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[hsl(var(--text-primary))] leading-tight">{report.title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-[hsl(var(--text-tertiary))]">
                      <span className={`font-semibold uppercase ${TYPE_ACCENT[report.type]}`}>{report.type}</span>
                      <span>·</span>
                      <span>{report.pages} pages</span>
                      <span>·</span>
                      <span>Last: {new Date(report.lastGenerated).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-[hsl(var(--text-tertiary))] leading-relaxed">{report.description}</p>

                <div className="flex items-center gap-2 pt-1 border-t border-[hsl(var(--border))]">
                  <button onClick={() => generate(report)} disabled={isGenerating}
                    className="btn-primary flex-1 justify-center py-1.5 text-[10px]">
                    {isGenerating ? (
                      <><div className="w-3 h-3 border-2 border-[hsl(210_8%_6%)] border-t-transparent rounded-full animate-spin" />Generating...</>
                    ) : (
                      <><FileText className="w-3 h-3" />Generate</>
                    )}
                  </button>
                  {isGenerated && (
                    <>
                      <button className="btn-secondary px-2 py-1.5 text-[10px]" onClick={() => toast.success('PDF download started')}>
                        <Download className="w-3 h-3" />PDF
                      </button>
                      <button className="btn-secondary px-2 py-1.5 text-[10px]" onClick={() => toast.success('CSV download started')}>
                        <Download className="w-3 h-3" />CSV
                      </button>
                    </>
                  )}
                </div>

                {isGenerated && (
                  <div className="flex items-center gap-1 text-[9px] text-[hsl(var(--green))]">
                    <CheckCircle className="w-2.5 h-2.5" />
                    Ready · Generated just now
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scheduled reports */}
        <div className="mangan-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-[hsl(var(--border))]">
            <span className="section-label">Scheduled Reports</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Report</th>
                <th>Schedule</th>
                <th>Next Run</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Daily Production Summary',  schedule: 'Every day at 18:00 IST',   next: 'Today 18:00' },
                { name: 'Weekly Risk Digest',         schedule: 'Every Monday 08:00 IST',  next: '25 Aug 08:00' },
                { name: 'Monthly Executive Report',   schedule: '1st of each month 09:00', next: '01 Sep 09:00' },
              ].map(s => (
                <tr key={s.name}>
                  <td className="font-medium text-[hsl(var(--text-primary))]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[hsl(var(--text-dim))]" />
                      {s.name}
                    </div>
                  </td>
                  <td>{s.schedule}</td>
                  <td className="font-medium text-[hsl(var(--amber))]">{s.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
