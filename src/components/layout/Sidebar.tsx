import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Mountain, TrendingUp, Pickaxe, Wrench,
  AlertTriangle, FlaskConical, Satellite, Bot, FileText,
  Settings, Database, Map
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Geological',
    items: [
      { path: '/reserves', label: 'Prospectivity', icon: Mountain },
      { path: '/satellite', label: 'Satellite / GIS', icon: Satellite },
    ],
  },
  {
    label: 'Operations',
    items: [
      { path: '/production', label: 'Production Forecast', icon: TrendingUp },
      { path: '/operations', label: 'Mine Operations', icon: Pickaxe },
      { path: '/equipment', label: 'Equipment', icon: Wrench },
      { path: '/risks', label: 'Risk Center', icon: AlertTriangle },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { path: '/simulator', label: 'Mine Simulator', icon: FlaskConical, highlight: true },
      { path: '/copilot', label: 'AI Copilot', icon: Bot, highlight: true },
    ],
  },
  {
    label: 'Data & Reports',
    items: [
      { path: '/datacenter', label: 'Data Center', icon: Database },
      { path: '/reports', label: 'Reports', icon: FileText },
      { path: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-52 shrink-0 flex flex-col bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))] h-screen overflow-hidden">

      {/* Logo */}
      <div className="px-3 py-3.5 border-b border-[hsl(var(--sidebar-border))] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-[hsl(var(--amber))] flex items-center justify-center shrink-0">
            <Map className="w-3.5 h-3.5 text-[hsl(210_8%_6%)]" />
          </div>
          <div className="flex items-baseline gap-0.5">
            <span className="text-sm font-bold text-[hsl(var(--text-primary))] tracking-tight">MANGAN</span>
            <span className="text-sm font-bold text-[hsl(var(--amber))]">-X</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <div className="demo-badge">DEMO</div>
          <span className="text-[9px] text-[hsl(var(--text-dim))]">SIH 26009</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-1">
            <div className="nav-section">{group.label}</div>
            {group.items.map(({ path, label, icon: Icon, highlight }) => {
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  className={`nav-item mx-1.5 ${isActive ? 'nav-item-active' : ''} ${highlight && !isActive ? 'text-[hsl(var(--amber))] opacity-80' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span className="flex-1 text-[11px] font-medium">{label}</span>
                  {isActive && (
                    <div className="w-1 h-1 rounded-full bg-[hsl(var(--amber))] opacity-80" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Status footer */}
      <div className="px-3 py-2.5 border-t border-[hsl(var(--sidebar-border))] space-y-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--green))] animate-pulse shrink-0" />
          <span className="text-[10px] text-[hsl(var(--text-dim))]">ML Models Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--red))] shrink-0" />
          <span className="text-[10px] text-[hsl(var(--red))]">2 Critical Alerts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--text-dim))] shrink-0" />
          <span className="text-[10px] text-[hsl(var(--text-dim))]">v1.0 · Balaghat Alpha</span>
        </div>
      </div>
    </aside>
  );
}
