import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Bot, RefreshCw, User, ChevronRight, Wifi } from 'lucide-react';
import { MINES } from '@/data/mineData';

const PAGE_META: Record<string, { title: string; breadcrumb: string[] }> = {
  '/dashboard':   { title: 'Command Center',    breadcrumb: ['Command Center'] },
  '/reserves':    { title: 'Prospectivity',     breadcrumb: ['Geological', 'Prospectivity'] },
  '/production':  { title: 'Production Forecast', breadcrumb: ['Operations', 'Production Forecast'] },
  '/operations':  { title: 'Mine Operations',   breadcrumb: ['Operations', 'Mine Operations'] },
  '/equipment':   { title: 'Equipment',         breadcrumb: ['Operations', 'Equipment'] },
  '/risks':       { title: 'Risk Center',       breadcrumb: ['Operations', 'Risk Center'] },
  '/simulator':   { title: 'Mine Simulator',    breadcrumb: ['Intelligence', 'Mine Simulator'] },
  '/satellite':   { title: 'Satellite / GIS',   breadcrumb: ['Geological', 'Satellite / GIS'] },
  '/copilot':     { title: 'AI Copilot',        breadcrumb: ['Intelligence', 'AI Copilot'] },
  '/datacenter':  { title: 'Data Center',       breadcrumb: ['Data', 'Data Center'] },
  '/reports':     { title: 'Reports',           breadcrumb: ['Data', 'Reports'] },
  '/settings':    { title: 'Settings',          breadcrumb: ['Settings'] },
};

const NOTIFICATIONS = [
  { id: 1, text: 'CR-01 Crusher fault — north circuit halted', severity: 'critical', time: '12m ago' },
  { id: 2, text: 'Monsoon alert: 35-45mm expected Aug 26-28', severity: 'high', time: '1h ago' },
  { id: 3, text: 'EX-03 maintenance completed', severity: 'info', time: '3h ago' },
];

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [selectedMine, setSelectedMine] = useState(MINES[0]);
  const [showMineSelector, setShowMineSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const meta = PAGE_META[location.pathname] ?? { title: 'MANGAN-X', breadcrumb: [] };

  return (
    <header className="h-11 shrink-0 flex items-center px-3 gap-3 bg-[hsl(var(--surface-0))] border-b border-[hsl(var(--border))]">

      {/* Breadcrumb */}
      <div className="flex-1 flex items-center gap-1.5 min-w-0">
        {meta.breadcrumb.length > 1 ? (
          <div className="flex items-center gap-1 text-xs overflow-hidden">
            {meta.breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1 whitespace-nowrap">
                {i > 0 && <ChevronRight className="w-3 h-3 text-[hsl(var(--text-dim))] shrink-0" />}
                <span className={i === meta.breadcrumb.length - 1
                  ? 'font-semibold text-[hsl(var(--text-primary))]'
                  : 'text-[hsl(var(--text-tertiary))]'
                }>{crumb}</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{meta.title}</span>
        )}
      </div>

      {/* Mine selector */}
      <div className="relative shrink-0">
        <button
          onClick={() => { setShowMineSelector(!showMineSelector); setShowNotifications(false); }}
          className="flex items-center gap-1.5 px-2 py-1 rounded-sm border border-[hsl(var(--border))] text-[11px] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--amber)/0.5)] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))] shrink-0" />
          <span className="font-medium">{selectedMine.name}</span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
        {showMineSelector && (
          <div className="absolute top-full left-0 mt-1 w-60 bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] rounded-sm shadow-2xl z-50">
            {MINES.map(mine => (
              <button
                key={mine.id}
                onClick={() => { setSelectedMine(mine); setShowMineSelector(false); }}
                className={`w-full px-3 py-2.5 text-left hover:bg-[hsl(var(--surface-3))] flex items-start gap-2.5 transition-colors ${mine.id === selectedMine.id ? 'bg-[hsl(36_88%_48%/0.06)]' : ''}`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${mine.status === 'active' ? 'bg-[hsl(var(--green))]' : 'bg-[hsl(var(--text-tertiary))]'}`} />
                <div>
                  <div className={`text-xs font-medium ${mine.id === selectedMine.id ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-primary))]'}`}>{mine.name}</div>
                  <div className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{mine.location}</div>
                  <div className="text-[9px] text-[hsl(var(--text-dim))] mt-0.5">{mine.estimatedReserves} Mt est. · {mine.totalArea} ha</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-[hsl(var(--border))] shrink-0" />

      {/* Data freshness */}
      <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-dim))] shrink-0">
        <Wifi className="w-3 h-3 text-[hsl(var(--green))]" />
        <span>2m ago</span>
      </div>

      {/* Clock */}
      <div className="text-[11px] font-mono text-[hsl(var(--text-tertiary))] tabular-nums shrink-0">
        {time.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        <span className="mx-1 text-[hsl(var(--text-dim))]">·</span>
        {time.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' })}
        <span className="ml-0.5 text-[9px] text-[hsl(var(--text-dim))]">IST</span>
      </div>

      {/* Notifications */}
      <div className="relative shrink-0">
        <button
          onClick={() => { setShowNotifications(!showNotifications); setShowMineSelector(false); }}
          className="relative p-1.5 rounded-sm hover:bg-[hsl(var(--surface-3))] transition-colors"
        >
          <Bell className="w-3.5 h-3.5 text-[hsl(var(--text-secondary))]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[hsl(var(--red))] rounded-full" />
        </button>
        {showNotifications && (
          <div className="absolute top-full right-0 mt-1 w-72 bg-[hsl(var(--surface-1))] border border-[hsl(var(--border))] rounded-sm shadow-2xl z-50">
            <div className="px-3 py-2 border-b border-[hsl(var(--border))]">
              <span className="text-[10px] font-semibold text-[hsl(var(--text-primary))] uppercase tracking-wider">Alerts</span>
            </div>
            {NOTIFICATIONS.map(n => (
              <div key={n.id} className={`px-3 py-2.5 border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--surface-2))] transition-colors ${n.severity === 'critical' ? 'border-l-2 border-l-[hsl(var(--red))]' : n.severity === 'high' ? 'border-l-2 border-l-[hsl(var(--amber))]' : ''}`}>
                <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">{n.text}</p>
                <span className="text-[9px] text-[hsl(var(--text-dim))]">{n.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Copilot shortcut */}
      <button
        onClick={() => navigate('/copilot')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-sm border border-[hsl(36_88%_48%/0.25)] bg-[hsl(36_88%_48%/0.06)] text-[11px] font-medium text-[hsl(var(--amber))] hover:border-[hsl(36_88%_48%/0.5)] hover:bg-[hsl(36_88%_48%/0.12)] transition-colors shrink-0"
      >
        <Bot className="w-3 h-3" />
        <span>Copilot</span>
      </button>

      {/* User */}
      <button className="flex items-center gap-1.5 p-0.5 rounded-sm hover:bg-[hsl(var(--surface-3))] transition-colors shrink-0">
        <div className="w-6 h-6 rounded-sm bg-[hsl(var(--amber))] flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-[hsl(210_8%_6%)]" />
        </div>
      </button>
    </header>
  );
}
