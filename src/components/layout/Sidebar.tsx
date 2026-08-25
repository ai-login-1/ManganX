import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Mountain, TrendingUp, Pickaxe, Wrench,
  AlertTriangle, FlaskConical, Satellite, Bot, FileText,
  Settings, Zap, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/reserves', label: 'Reserve Intelligence', icon: Mountain },
  { path: '/production', label: 'Production Forecast', icon: TrendingUp },
  { path: '/operations', label: 'Mine Operations', icon: Pickaxe },
  { path: '/equipment', label: 'Equipment', icon: Wrench },
  { path: '/risks', label: 'Risk Center', icon: AlertTriangle },
  { path: '/simulator', label: 'Mine Simulator', icon: FlaskConical, highlight: true },
  { path: '/satellite', label: 'Satellite Intelligence', icon: Satellite },
  { path: '/copilot', label: 'AI Copilot', icon: Bot, highlight: true },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-[hsl(220_20%_6%)] border-r border-[hsl(var(--border))] h-screen">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-[hsl(var(--amber))] flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div>
            <span className="text-sm font-bold text-[hsl(var(--text-primary))] tracking-tight">MANGAN</span>
            <span className="text-sm font-bold text-[hsl(var(--amber))]">-X</span>
          </div>
        </div>
        <div className="mt-1.5 demo-badge">DEMO MODE</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon, highlight }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className={`nav-item ${isActive ? 'nav-item-active' : ''} ${highlight && !isActive ? 'text-[hsl(var(--amber))] opacity-90' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-xs font-medium">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Status */}
      <div className="px-3 py-3 border-t border-[hsl(var(--border))]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))] animate-pulse" />
          <span className="text-[10px] text-[hsl(var(--text-tertiary))]">ML Models Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--amber))]" />
          <span className="text-[10px] text-[hsl(var(--text-tertiary))]">2 Critical Alerts</span>
        </div>
      </div>
    </aside>
  );
}
