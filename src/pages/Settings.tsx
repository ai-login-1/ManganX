import { useState } from 'react';
import { Bell, Database, Settings as SettingsIcon, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleProps { enabled: boolean; onChange: (v: boolean) => void; }

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`relative w-8 h-4.5 rounded-full transition-colors flex items-center ${enabled ? 'bg-[hsl(var(--amber))]' : 'bg-[hsl(var(--surface-4))]'}`}
      style={{ height: '1.125rem' }}
    >
      <div className={`absolute w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-[14px]' : 'translate-x-[1px]'}`} />
    </button>
  );
}

interface SettingRowProps {
  label: string;
  desc: string;
  children: React.ReactNode;
}

function SettingRow({ label, desc, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[hsl(var(--border))] last:border-0">
      <div>
        <div className="text-xs font-medium text-[hsl(var(--text-primary))]">{label}</div>
        <div className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">{desc}</div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState({
    notifications: true,
    criticalAlerts: true,
    emailDigest: false,
    autoRefresh: true,
    refreshInterval: 30,
    mlAutoRun: true,
    satelliteUpdate: true,
    demoMode: true,
    language: 'en-IN',
    timezone: 'Asia/Kolkata',
    units: 'metric',
  });

  const set = (key: keyof typeof settings) => (v: boolean | number | string) =>
    setSettings(s => ({ ...s, [key]: v }));

  return (
    <div className="flex flex-col h-[calc(100vh-2.75rem)] overflow-hidden">

      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-[10px] text-[hsl(var(--text-tertiary))] mt-0.5">MANGAN-X v1.0 · Application configuration</p>
        </div>
        <button onClick={() => toast.success('Settings saved')} className="btn-primary">
          <Save className="w-3 h-3" />
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl space-y-4">

          {/* Notifications */}
          <div className="mangan-card p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[hsl(var(--border))]">
              <Bell className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Notifications</span>
            </div>
            <SettingRow label="In-app notifications" desc="Show toast alerts for operational events">
              <Toggle enabled={settings.notifications} onChange={set('notifications')} />
            </SettingRow>
            <SettingRow label="Critical risk alerts" desc="Immediate notification for critical severity risks">
              <Toggle enabled={settings.criticalAlerts} onChange={set('criticalAlerts')} />
            </SettingRow>
            <SettingRow label="Email digest" desc="Daily summary email to registered addresses">
              <Toggle enabled={settings.emailDigest} onChange={set('emailDigest')} />
            </SettingRow>
          </div>

          {/* Data & ML */}
          <div className="mangan-card p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[hsl(var(--border))]">
              <Database className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Data & ML Models</span>
            </div>
            <SettingRow label="Auto-refresh interval" desc="Dashboard data refresh frequency">
              <select value={settings.refreshInterval} onChange={e => set('refreshInterval')(Number(e.target.value))} className="mangan-select">
                {[15, 30, 60, 300].map(v => <option key={v} value={v}>{v < 60 ? `${v}s` : `${v / 60}m`}</option>)}
              </select>
            </SettingRow>
            <SettingRow label="Auto-refresh data" desc="Automatically refresh operational data">
              <Toggle enabled={settings.autoRefresh} onChange={set('autoRefresh')} />
            </SettingRow>
            <SettingRow label="Run ML forecasts automatically" desc="Schedule ML model runs on data update">
              <Toggle enabled={settings.mlAutoRun} onChange={set('mlAutoRun')} />
            </SettingRow>
            <SettingRow label="Satellite data auto-update" desc="Fetch latest satellite imagery on load">
              <Toggle enabled={settings.satelliteUpdate} onChange={set('satelliteUpdate')} />
            </SettingRow>
          </div>

          {/* Regional */}
          <div className="mangan-card p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[hsl(var(--border))]">
              <SettingsIcon className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Regional & Display</span>
            </div>
            <SettingRow label="Language" desc="Interface language">
              <select value={settings.language} onChange={e => set('language')(e.target.value)} className="mangan-select">
                <option value="en-IN">English (India)</option>
                <option value="hi">हिंदी</option>
              </select>
            </SettingRow>
            <SettingRow label="Timezone" desc="Time display and scheduling">
              <select value={settings.timezone} onChange={e => set('timezone')(e.target.value)} className="mangan-select">
                <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                <option value="UTC">UTC</option>
              </select>
            </SettingRow>
            <SettingRow label="Units" desc="Measurement system">
              <select value={settings.units} onChange={e => set('units')(e.target.value)} className="mangan-select">
                <option value="metric">Metric (tonnes, km)</option>
                <option value="imperial">Imperial</option>
              </select>
            </SettingRow>
            <SettingRow label="Demo Mode" desc="Display demo data badge throughout application">
              <Toggle enabled={settings.demoMode} onChange={set('demoMode')} />
            </SettingRow>
          </div>

          {/* System info */}
          <div className="mangan-card p-4">
            <div className="section-label mb-3">System Information</div>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-[11px]">
              {[
                ['Application', 'MANGAN-X v1.0'],
                ['Problem Statement', 'SIH 26009'],
                ['ML Models', 'XGBoost v1.7 · scikit-learn 1.4'],
                ['Satellite Sources', 'Sentinel-2 · INSAT-3DR · SAR'],
                ['Data Mode', 'Demo / Simulation'],
                ['Backend', 'FastAPI-ready interface'],
                ['Frontend', 'React 18 · Vite · TypeScript'],
                ['Styling', 'Tailwind CSS · shadcn/ui'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-[hsl(var(--text-tertiary))] shrink-0">{k}:</span>
                  <span className="text-[hsl(var(--text-secondary))]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
