import { useState } from 'react';
import { Satellite as SatIcon, Layers, Calendar, ArrowLeftRight, Info } from 'lucide-react';

type LayerType = 'rgb' | 'ndvi' | 'soil_moisture' | 'rainfall' | 'land_temp';

interface LayerConfig {
  id: LayerType;
  label: string;
  unit: string;
  min: number;
  max: number;
  colors: string[];
  description: string;
}

const LAYERS: LayerConfig[] = [
  { id: 'rgb', label: 'True Color (RGB)', unit: '', min: 0, max: 255, colors: ['#1a1a2e', '#4a5568', '#c4a35a', '#8b6914', '#f5c842'], description: 'Optical satellite imagery showing natural surface colors.' },
  { id: 'ndvi', label: 'NDVI', unit: 'index', min: -0.2, max: 0.8, colors: ['#8B4513', '#D2B48C', '#90EE90', '#228B22', '#006400'], description: 'Normalized Difference Vegetation Index. Low values over mine areas suggest exposed ore.' },
  { id: 'soil_moisture', label: 'Soil Moisture', unit: '%', min: 5, max: 45, colors: ['#F4A460', '#DEB887', '#4682B4', '#1E90FF', '#00008B'], description: 'Surface soil moisture from SAR backscatter. High moisture increases slope failure risk.' },
  { id: 'rainfall', label: 'Rainfall', unit: 'mm/day', min: 0, max: 25, colors: ['#F5F5F5', '#87CEEB', '#4169E1', '#0000CD', '#00008B'], description: 'Daily accumulated rainfall from INSAT-3DR. Critical for haul road safety assessment.' },
  { id: 'land_temp', label: 'Land Surface Temperature', unit: '°C', min: 28, max: 56, colors: ['#313695', '#4575B4', '#FEE090', '#F46D43', '#A50026'], description: 'Thermal infrared surface temperature. Can indicate subsurface ore deposit signatures.' },
];

// Fake satellite raster grid (20x15 cells)
function generateGrid(layerId: LayerType): number[][] {
  const rows = 15, cols = 20;
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      // Mine pit area (center)
      const isMine = r > 4 && r < 10 && c > 6 && c < 15;
      const isVeg = r < 4 || c < 4 || r > 12;
      let v = 0;
      if (layerId === 'ndvi') v = isMine ? -0.1 + Math.random() * 0.2 : isVeg ? 0.5 + Math.random() * 0.3 : 0.2 + Math.random() * 0.2;
      else if (layerId === 'soil_moisture') v = isMine ? 8 + Math.random() * 12 : 20 + Math.random() * 20;
      else if (layerId === 'rainfall') v = 5 + Math.random() * 15 + (r > 7 ? 5 : 0);
      else if (layerId === 'land_temp') v = isMine ? 46 + Math.random() * 8 : 32 + Math.random() * 10;
      else v = isMine ? 60 + Math.random() * 80 : 140 + Math.random() * 80; // RGB proxy
      row.push(v);
    }
    grid.push(row);
  }
  return grid;
}

function getColor(value: number, layer: LayerConfig): string {
  const pct = Math.max(0, Math.min(1, (value - layer.min) / (layer.max - layer.min)));
  const n = layer.colors.length;
  const i = Math.min(n - 2, Math.floor(pct * (n - 1)));
  const t = pct * (n - 1) - i;
  const c1 = hexToRgb(layer.colors[i]);
  const c2 = hexToRgb(layer.colors[i + 1]);
  if (!c1 || !c2) return layer.colors[0];
  return `rgb(${Math.round(c1[0] + t * (c2[0] - c1[0]))},${Math.round(c1[1] + t * (c2[1] - c1[1]))},${Math.round(c1[2] + t * (c2[2] - c1[2]))})`;
}

function hexToRgb(hex: string): [number, number, number] | null {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : null;
}

const ANOMALIES = [
  { x: 9, y: 5, label: 'Thermal anomaly — possible subsurface ore', severity: 'high' },
  { x: 14, y: 3, label: 'NDVI suppression — exposed laterite', severity: 'medium' },
  { x: 4, y: 11, label: 'High soil moisture — slope risk zone', severity: 'medium' },
];

const DATES = ['2026-08-22', '2026-07-15', '2026-06-01', '2026-03-10'];

export default function Satellite() {
  const [activeLayer, setActiveLayer] = useState<LayerType>('ndvi');
  const [compareMode, setCompareMode] = useState(false);
  const [date1, setDate1] = useState(DATES[0]);
  const [date2, setDate2] = useState(DATES[1]);
  const [showAnomalies, setShowAnomalies] = useState(true);

  const layer = LAYERS.find(l => l.id === activeLayer)!;
  const grid = generateGrid(activeLayer);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-[hsl(var(--text-primary))]">Satellite Intelligence</h1>
          <p className="text-xs text-[hsl(var(--text-tertiary))]">INSAT-3DR · Sentinel-2 · SAR fusion · <span className="demo-badge">SIMULATED RASTER DATA</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase border transition-colors ${showAnomalies ? 'bg-[hsl(38_92%_50%/0.12)] border-[hsl(38_92%_50%/0.4)] text-[hsl(var(--amber))]' : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'}`}
          >
            Anomalies
          </button>
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-semibold uppercase border transition-colors ${compareMode ? 'bg-[hsl(38_92%_50%/0.12)] border-[hsl(38_92%_50%/0.4)] text-[hsl(var(--amber))]' : 'border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'}`}
          >
            <ArrowLeftRight className="w-3 h-3" />
            Compare
          </button>
        </div>
      </div>

      {/* Layer selector */}
      <div className="flex gap-2 flex-wrap">
        {LAYERS.map(l => (
          <button
            key={l.id}
            onClick={() => setActiveLayer(l.id)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${activeLayer === l.id
              ? 'bg-[hsl(38_92%_50%/0.15)] border-[hsl(38_92%_50%/0.4)] text-[hsl(var(--amber))]'
              : 'border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--amber))] hover:text-[hsl(var(--text-primary))]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Main map area */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="mangan-card overflow-hidden" style={{ height: 420 }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <SatIcon className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{layer.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {compareMode && (
                <>
                  <select value={date2} onChange={e => setDate2(e.target.value)}
                    className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-secondary))]">
                    {DATES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ArrowLeftRight className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                </>
              )}
              <select value={date1} onChange={e => setDate1(e.target.value)}
                className="bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-[10px] text-[hsl(var(--text-secondary))]">
                {DATES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className={`grid ${compareMode ? 'grid-cols-2 divide-x divide-[hsl(var(--border))]' : 'grid-cols-1'}`} style={{ height: 374 }}>
            {[compareMode ? date2 : null, date1].filter(Boolean).map((d, idx) => (
              <div key={idx} className="relative overflow-hidden">
                {compareMode && (
                  <div className="absolute top-2 left-2 z-10 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[hsl(220_16%_10%/0.8)] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">
                    {d}
                  </div>
                )}
                <svg viewBox="0 0 100 75" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                  {grid.map((row, r) =>
                    row.map((val, c) => (
                      <rect key={`${r}-${c}`}
                        x={c * 5} y={r * 5} width={5} height={5}
                        fill={getColor(val, layer)}
                      />
                    ))
                  )}
                  {/* Mine boundary */}
                  <rect x={30} y={20} width={45} height={30} fill="none" stroke="hsl(38 92% 50%)" strokeWidth="0.5" strokeDasharray="2 1" opacity={0.6} />
                  {/* Anomaly markers */}
                  {showAnomalies && ANOMALIES.map((a, i) => (
                    <g key={i}>
                      <circle cx={a.x * 5 + 2.5} cy={a.y * 5 + 2.5} r={3.5} fill="none"
                        stroke={a.severity === 'high' ? '#ef4444' : '#f59e0b'} strokeWidth="0.8" />
                      <circle cx={a.x * 5 + 2.5} cy={a.y * 5 + 2.5} r={1}
                        fill={a.severity === 'high' ? '#ef4444' : '#f59e0b'} />
                    </g>
                  ))}
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-3">
          {/* Layer info */}
          <div className="mangan-card p-3">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-3.5 h-3.5 text-[hsl(var(--amber))] shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">{layer.label}</span>
            </div>
            <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">{layer.description}</p>

            {/* Color scale */}
            <div className="mt-3">
              <div className="section-label mb-1.5">Color Scale</div>
              <div className="h-3 rounded overflow-hidden" style={{ background: `linear-gradient(to right, ${layer.colors.join(', ')})` }} />
              <div className="flex justify-between text-[9px] text-[hsl(var(--text-tertiary))] mt-0.5">
                <span>{layer.min}{layer.unit}</span>
                <span>{((layer.min + layer.max) / 2).toFixed(1)}{layer.unit}</span>
                <span>{layer.max}{layer.unit}</span>
              </div>
            </div>
          </div>

          {/* Detected anomalies */}
          <div className="mangan-card p-3 flex-1">
            <div className="section-label mb-2">Detected Anomalies ({ANOMALIES.length})</div>
            <div className="space-y-2">
              {ANOMALIES.map((a, i) => (
                <div key={i} className={`p-2 rounded bg-[hsl(var(--surface-2))] border-l-2 ${a.severity === 'high' ? 'border-[hsl(var(--red))]' : 'border-[hsl(var(--amber))]'}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[9px] font-semibold uppercase ${a.severity === 'high' ? 'text-[hsl(var(--red))]' : 'text-[hsl(var(--amber))]'}`}>{a.severity}</span>
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] font-mono">({a.x},{a.y})</span>
                  </div>
                  <p className="text-[11px] text-[hsl(var(--text-secondary))]">{a.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Satellite status */}
          <div className="mangan-card p-3">
            <div className="section-label mb-2">Data Sources</div>
            {[
              { name: 'Sentinel-2 (Optical)', status: 'active', lastUpdate: '2026-08-22' },
              { name: 'INSAT-3DR (Thermal)', status: 'active', lastUpdate: '2026-08-22' },
              { name: 'Sentinel-1 (SAR)', status: 'active', lastUpdate: '2026-08-21' },
              { name: 'MODIS (LST)', status: 'delayed', lastUpdate: '2026-08-20' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-2 py-1.5 border-b border-[hsl(var(--border))] last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.status === 'active' ? 'bg-[hsl(var(--green))]' : 'bg-[hsl(var(--amber))]'}`} />
                <div className="flex-1">
                  <div className="text-[11px] text-[hsl(var(--text-secondary))]">{s.name}</div>
                  <div className="text-[9px] text-[hsl(var(--text-tertiary))]">{s.lastUpdate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
