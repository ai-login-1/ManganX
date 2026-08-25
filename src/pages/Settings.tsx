import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Database, Satellite, Bot, Users, Shield, Save, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}
function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? 'bg-[hsl(var(--amber))]' : 'bg-[hsl(var(--surface-3))]'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
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
    darkMode: true,
    demoMode: true,
    language: 'en-IN',
    timezone: 'Asia/Kolkata',
    units: 'metric',
  });

  const set = (key: keyof typeof settings) => (v: boolean | number | string) =>
    setSettings(s => ({ ...s, [key]: v }));

  const save = () => toast.success('Settings saved', { description: 'Configuration updated successfully.' });

  return (
    <div className="p-4 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Settings</h1>
        <p className="text-xs text-[hsl(var(--text-tertiary))]">Application configuration · MANGAN-X v1.0</p>
      </div>

      {/* Notifications */}
      <div className="mangan-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Bell className="w-4 h-4 text-[hsl(var(--amber))]" />
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">Notifications</span>
        </div>
        {[
          { key: 'notifications' as const, label: 'In-app notifications', desc: 'Show toast alerts for operational events' },
          { key: 'criticalAlerts' as const, label: 'Critical risk alerts', desc: 'Immediate notification for critical severity risks' },
          { key: 'emailDigest' as const, label: 'Email digest', desc: 'Daily summary email to registered addresses' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
            <div>
              <div className="text-xs font-medium text-[hsl(var(--text-primary))]">{item.label}</div>
              <div className="text-[10px] text-[hsl(var(--text-tertiary))]">{item.desc}</div>
            </div>
            <Toggle enabled={settings[item.key] as boolean} onChange={set(item.key)} />
          </div>
        ))}
      </div>

      {/* Data & ML */}
      <div className="mangan-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-[hsl(var(--amber))]" />
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">Data & ML Models</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))]">
          <div>
            <div className="text-xs font-medium text-[hsl(var(--text-primary))]">Auto-refresh interval</div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))]">Dashboard data refresh frequency</div>
          </div>
          <select value={settings.refreshInterval} onChange={e => set('refreshInterval')(Number(e.target.value))}
            className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded px-2 py-1 text-xs text-[hsl(var(--text-secondary))]">
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>
        {[
          { key: 'autoRefresh' as const, label: 'Auto-refresh data', desc: 'Automatically refresh operational data' },
          { key: 'mlAutoRun' as const, label: 'Run ML forecasts automatically', desc: 'Schedule ML model runs on data update' },
          { key: 'satelliteUpdate' as const, label: 'Satellite data auto-update', desc: 'Fetch latest satellite imagery on load' },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
            <div>
              <div className="text-xs font-medium text-[hsl(var(--text-primary))]">{item.label}</div>
              <div className="text-[10px] text-[hsl(var(--text-tertiary))]">{item.desc}</div>
            </div>
            <Toggle enabled={settings[item.key] as boolean} onChange={set(item.key)} />
          </div>
        ))}
      </div>

      {/* Regional */}
      <div className="mangan-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-4 h-4 text-[hsl(var(--amber))]" />
          <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">Regional & Display</span>
        </div>
        {[
          { key: 'language' as const, label: 'Language', options: [{ v: 'en-IN', l: 'English (India)' }, { v: 'hi', l: 'Hindi' }] },
          { key: 'timezone' as const, label: 'Timezone', options: [{ v: 'Asia/Kolkata', l: 'IST (UTC+5:30)' }, { v: 'UTC', l: 'UTC' }] },
          { key: 'units' as const, label: 'Units', options: [{ v: 'metric', l: 'Metric (tonnes, km)' }, { v: 'imperial', l: 'Imperial' }] },
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
            <span className="text-xs font-medium text-[hsl(var(--text-primary))]">{item.label}</span>
            <select value={settings[item.key] as string} onChange={e => set(item.key)(e.target.value)}
              className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded px-2 py-1 text-xs text-[hsl(var(--text-secondary))]">
              {item.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
        ))}
        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-xs font-medium text-[hsl(var(--text-primary))]">Demo Mode</div>
            <div className="text-[10px] text-[hsl(var(--text-tertiary))]">Display demo data badge throughout application</div>
          </div>
          <Toggle enabled={settings.demoMode} onChange={set('demoMode')} />
        </div>
      </div>

      {/* Version info */}
      <div className="mangan-card p-4">
        <div className="section-label mb-3">System Information</div>
        <div className="grid grid-cols-2 gap-y-2 text-[11px]">
          {[
            ['Application', 'MANGAN-X v1.0'],
            ['Problem Statement', '26009'],
            ['ML Models', 'XGBoost v1.7 / scikit-learn 1.4'],
            ['Satellite Sources', 'Sentinel-2, INSAT-3DR, SAR'],
            ['Data Mode', 'Demo / Simulation'],
            ['Backend', 'API-ready (FastAPI interface)'],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-[hsl(var(--text-tertiary))]">{k}:</span>
              <span className="text-[hsl(var(--text-secondary))] font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save}
        className="flex items-center gap-2 px-4 py-2 rounded bg-[hsl(var(--amber))] text-black text-sm font-semibold hover:bg-[hsl(38_92%_44%)] transition-colors">
        <Save className="w-4 h-4" />
        Save Settings
      </button>
    </div>
  );
}
