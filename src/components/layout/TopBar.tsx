import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Bot, RefreshCw, User } from 'lucide-react';
import { MINES } from '@/data/mineData';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/reserves': 'Reserve Intelligence',
  '/production': 'Production Forecast',
  '/operations': 'Mine Operations',
  '/equipment': 'Equipment Intelligence',
  '/risks': 'Risk Center',
  '/simulator': 'Mine Simulator',
  '/satellite': 'Satellite Intelligence',
  '/copilot': 'AI Copilot',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [selectedMine, setSelectedMine] = useState(MINES[0]);
  const [showMineSelector, setShowMineSelector] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const title = PAGE_TITLES[location.pathname] || 'MANGAN-X';

  return (
    <header className="h-12 shrink-0 flex items-center px-4 gap-4 bg-[hsl(220_18%_7%)] border-b border-[hsl(var(--border))]">
      {/* Page title */}
      <div className="flex-1">
        <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">{title}</span>
      </div>

      {/* Mine selector */}
      <div className="relative">
        <button
          onClick={() => setShowMineSelector(!showMineSelector)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--amber))] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))]" />
          {selectedMine.name}
          <ChevronDown className="w-3 h-3" />
        </button>
        {showMineSelector && (
          <div className="absolute top-full right-0 mt-1 w-56 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded shadow-xl z-50">
            {MINES.map(mine => (
              <button
                key={mine.id}
                onClick={() => { setSelectedMine(mine); setShowMineSelector(false); }}
                className={`w-full px-3 py-2 text-left text-xs hover:bg-[hsl(var(--accent))] flex items-center gap-2 ${mine.id === selectedMine.id ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-secondary))]'}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))]" />
                <div>
                  <div className="font-medium">{mine.name}</div>
                  <div className="text-[10px] text-[hsl(var(--text-tertiary))]">{mine.location}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Data freshness */}
      <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-tertiary))]">
        <RefreshCw className="w-3 h-3" />
        <span>Updated 2m ago</span>
      </div>

      {/* Time */}
      <div className="text-xs font-mono text-[hsl(var(--text-tertiary))] tabular-nums">
        {time.toLocaleTimeString('en-IN', { hour12: false })}
        <span className="ml-1 text-[10px]">IST</span>
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 rounded hover:bg-[hsl(var(--accent))] transition-colors">
        <Bell className="w-4 h-4 text-[hsl(var(--text-secondary))]" />
        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[hsl(var(--red))] rounded-full" />
      </button>

      {/* AI Copilot button */}
      <button
        onClick={() => navigate('/copilot')}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[hsl(38_92%_50%/0.12)] border border-[hsl(38_92%_50%/0.3)] text-xs text-[hsl(var(--amber))] hover:bg-[hsl(38_92%_50%/0.2)] transition-colors"
      >
        <Bot className="w-3.5 h-3.5" />
        <span>Copilot</span>
      </button>

      {/* User */}
      <button className="flex items-center gap-1.5 p-1 rounded hover:bg-[hsl(var(--accent))] transition-colors">
        <div className="w-6 h-6 rounded-full bg-[hsl(var(--amber))] flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-black" />
        </div>
      </button>
    </header>
  );
}
