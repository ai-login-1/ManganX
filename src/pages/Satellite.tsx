import { useState, useCallback, useRef } from 'react';
import {
  Layers, ZoomIn, ZoomOut, Maximize2, Crosshair, BarChart2,
  Calendar, ArrowLeftRight, ChevronRight, Activity, Info,
  SlidersHorizontal, MapPin, Download, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ── Layer definitions ──────────────────────────────────────

interface SatLayer {
  id: string;
  label: string;
  group: string;
  enabled: boolean;
  opacity: number;
  unit: string;
  description: string;
  colorRamp: string[];
  min: number;
  max: number;
}

const INITIAL_LAYERS: SatLayer[] = [
  { id: 'aster',     label: 'ASTER (TIR)',         group: 'Optical',    enabled: true,  opacity: 100, unit: '°C',     min: 28, max: 58, colorRamp: ['#1a237e','#3949ab','#fdd835','#ef6c00','#b71c1c'], description: 'ASTER Thermal Infrared. Elevated temperatures can indicate subsurface ore deposits and geological contacts.' },
  { id: 'sentinel2', label: 'Sentinel-2 RGB',       group: 'Optical',    enabled: false, opacity: 100, unit: '',       min: 0,  max: 255, colorRamp: ['#1b2838','#3d5a4c','#c8a96a','#7a5b1e','#f0c040'], description: 'Sentinel-2 true color composite. 10m resolution. Used as base layer for visual interpretation.' },
  { id: 'sentinel1', label: 'Sentinel-1 SAR',       group: 'Radar',      enabled: false, opacity: 85,  unit: 'dB',     min: -25, max: 0, colorRamp: ['#0d0d0d','#2d4a3e','#4a7c59','#8bc34a','#e0e0e0'], description: 'Sentinel-1 C-band SAR backscatter. Useful for soil moisture, surface roughness, and structural lineaments.' },
  { id: 'dem',       label: 'DEM / Terrain',        group: 'Terrain',    enabled: false, opacity: 80,  unit: 'm',      min: 350, max: 680, colorRamp: ['#1a6b3c','#4caf50','#cddc39','#ff9800','#795548'], description: 'SRTM Digital Elevation Model at 30m resolution. Useful for topographic analysis and slope stability.' },
  { id: 'ndvi',      label: 'NDVI',                 group: 'Optical',    enabled: false, opacity: 90,  unit: 'index',  min: -0.2, max: 0.8, colorRamp: ['#8b4513','#d2b48c','#90ee90','#228b22','#006400'], description: 'NDVI from Sentinel-2. Low values over mine areas indicate exposed ore/soil. Anomalies may suggest hidden deposits.' },
  { id: 'rainfall',  label: 'Rainfall (INSAT)',     group: 'Weather',    enabled: false, opacity: 75,  unit: 'mm/d',   min: 0, max: 30, colorRamp: ['#f5f5f5','#81d4fa','#0288d1','#01579b','#002171'], description: 'Daily accumulated rainfall from INSAT-3DR. Critical for haul road safety and slope failure risk assessment.' },
  { id: 'soilmoist', label: 'Soil Moisture',        group: 'Derived',    enabled: false, opacity: 80,  unit: '%',      min: 5, max: 45, colorRamp: ['#f4a460','#deb887','#6495ed','#1e90ff','#00008b'], description: 'Soil moisture derived from SAR backscatter. High moisture values increase slope failure and haul road risk.' },
  { id: 'geomap',    label: 'Geological Map',       group: 'Geological', enabled: true,  opacity: 60,  unit: '',       min: 0, max: 1, colorRamp: ['#e91e63','#9c27b0','#3f51b5','#009688','#8bc34a'], description: 'Digitized geological map showing rock formations, contacts, and lithological units.' },
  { id: 'lineament', label: 'Lineaments',           group: 'Geological', enabled: true,  opacity: 100, unit: '',       min: 0, max: 1, colorRamp: ['#fff176','#fff176','#fff176','#fff176','#fff176'], description: 'Structural lineaments extracted from DEM and satellite data. Linear features often control ore localization.' },
  { id: 'occurrence',label: 'Mineral Occurrences',  group: 'Geological', enabled: true,  opacity: 100, unit: '',       min: 0, max: 1, colorRamp: ['#f06292','#f06292','#f06292','#f06292','#f06292'], description: 'Known mineral occurrence locations from GSI database. Used as training points for the prospectivity model.' },
  { id: 'prospec',   label: 'Prospectivity',        group: 'AI/ML',      enabled: true,  opacity: 70,  unit: 'score',  min: 0, max: 1, colorRamp: ['#1a237e','#283593','#ffa000','#e65100','#b71c1c'], description: 'AI-generated Mn prospectivity map using XGBoost. Combines spectral, structural, terrain, and geological inputs.' },
];

const LAYER_GROUPS = ['Optical', 'Radar', 'Terrain', 'Derived', 'Weather', 'Geological', 'AI/ML'];

// ── Demo raster grid generator ─────────────────────────────

function generateRasterGrid(layerId: string, cols = 28, rows = 18): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      const cx = c / cols, cy = r / rows;
      const isMine = r > 5 && r < 13 && c > 7 && c < 20;
      const isVeg = r < 4 || c < 3 || r > 15;
      const isProspect = Math.sqrt((cx - 0.35) ** 2 + (cy - 0.65) ** 2) < 0.14 || Math.sqrt((cx - 0.62) ** 2 + (cy - 0.45) ** 2) < 0.1;

      let v = 0;
      const noise = (Math.random() - 0.5) * 0.3;

      if (layerId === 'aster')      v = isMine ? 0.75 + noise * 0.2 : isProspect ? 0.6 + noise * 0.2 : 0.35 + noise * 0.3;
      else if (layerId === 'ndvi')  v = isMine ? 0.1 + noise * 0.3 : isVeg ? 0.7 + noise * 0.15 : 0.4 + noise * 0.2;
      else if (layerId === 'soilmoist') v = isMine ? 0.18 + noise * 0.2 : 0.55 + noise * 0.3;
      else if (layerId === 'rainfall')  v = 0.3 + cy * 0.4 + noise * 0.2;
      else if (layerId === 'prospec')   v = isProspect ? 0.75 + noise * 0.15 : isMine ? 0.5 + noise * 0.2 : 0.15 + noise * 0.3;
      else if (layerId === 'dem')       v = cy * 0.6 + cx * 0.2 + noise * 0.15 + (isMine ? 0.25 : 0);
      else if (layerId === 'sentinel1') v = isMine ? 0.65 + noise * 0.2 : 0.35 + noise * 0.3;
      else v = 0.4 + noise * 0.4;

      row.push(Math.max(0, Math.min(1, v)));
    }
    grid.push(row);
  }
  return grid;
}

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [0, 0, 0];
}

function rampColor(pct: number, ramp: string[]): string {
  const n = ramp.length;
  const i = Math.min(n - 2, Math.floor(pct * (n - 1)));
  const t = pct * (n - 1) - i;
  const c1 = hexToRgb(ramp[i]), c2 = hexToRgb(ramp[i + 1]);
  return `rgb(${Math.round(c1[0] + t * (c2[0] - c1[0]))},${Math.round(c1[1] + t * (c2[1] - c1[1]))},${Math.round(c1[2] + t * (c2[2] - c1[2]))})`;
}

// ── Exploration zones for GIS overlay ─────────────────────

const GIS_ZONES = [
  { id: 'Z1', label: 'Alpha-N', cx: 0.625, cy: 0.35, r: 0.09, color: '#f59e0b', type: 'active', prob: 0.94 },
  { id: 'Z2', label: 'Beta-C',  cx: 0.32,  cy: 0.58, r: 0.075, color: '#f59e0b', type: 'active', prob: 0.87 },
  { id: 'Z3', label: 'Gamma-E', cx: 0.72,  cy: 0.56, r: 0.085, color: '#3b82f6', type: 'exploration', prob: 0.72 },
  { id: 'Z4', label: 'Delta-S', cx: 0.44,  cy: 0.74, r: 0.07,  color: '#8b5cf6', type: 'predicted', prob: 0.63 },
];

const OCCURRENCES = [
  { x: 0.62, y: 0.32, label: 'GSI Occurrence #A12' },
  { x: 0.71, y: 0.28, label: 'Historical Mine #7' },
  { x: 0.35, y: 0.55, label: 'GSI Occurrence #B04' },
  { x: 0.48, y: 0.71, label: 'Stream Sediment Anomaly' },
];

const LINEAMENTS = [
  [[0.15, 0.2], [0.55, 0.65]],
  [[0.3, 0.1], [0.8, 0.55]],
  [[0.05, 0.6], [0.45, 0.35]],
  [[0.6, 0.75], [0.95, 0.4]],
];

// ── Analysis modes ─────────────────────────────────────────

const ANALYSIS_MODES = ['RGB', 'False Color', 'NDVI', 'Spectral Ratio', 'SAR', 'Terrain', 'Compare'];

const DATES = ['2026-08-22', '2026-07-15', '2026-06-01', '2026-03-10', '2025-11-20'];

// ── Spectral profile demo data ─────────────────────────────

const SPECTRAL_PROFILE = [
  { band: 'B2', nm: '490nm', val: 0.062 },
  { band: 'B3', nm: '560nm', val: 0.085 },
  { band: 'B4', nm: '665nm', val: 0.14  },
  { band: 'B5', nm: '705nm', val: 0.18  },
  { band: 'B6', nm: '740nm', val: 0.22  },
  { band: 'B7', nm: '783nm', val: 0.28  },
  { band: 'B8', nm: '842nm', val: 0.31  },
  { band: 'B11', nm: '1610nm', val: 0.19 },
  { band: 'B12', nm: '2190nm', val: 0.24 },
];

const TEMPORAL_NDVI = [
  { date: 'Nov 25', val: 0.42 }, { date: 'Mar 26', val: 0.28 },
  { date: 'Jun 26', val: 0.35 }, { date: 'Aug 26', val: 0.18 },
];

// ── Main component ─────────────────────────────────────────

export default function Satellite() {
  const [layers, setLayers] = useState<SatLayer[]>(INITIAL_LAYERS);
  const [activeMode, setActiveMode] = useState('NDVI');
  const [activeDate, setActiveDate] = useState(DATES[0]);
  const [compareDate, setCompareDate] = useState(DATES[1]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ x: number; y: number } | null>({ x: 0.63, y: 0.36 });
  const [activePanel, setActivePanel] = useState<'spectral' | 'temporal' | 'stats' | 'info'>('info');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const toggleLayer = (id: string) => {
    setLayers(ls => ls.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const setOpacity = (id: string, opacity: number) => {
    setLayers(ls => ls.map(l => l.id === id ? { ...l, opacity } : l));
  };

  // Determine the primary display layer
  const modeLayerMap: Record<string, string> = {
    'RGB': 'sentinel2', 'False Color': 'sentinel2', 'NDVI': 'ndvi',
    'Spectral Ratio': 'aster', 'SAR': 'sentinel1', 'Terrain': 'dem', 'Compare': 'prospec'
  };

  const primaryLayerId = modeLayerMap[activeMode] ?? 'ndvi';
  const primaryLayer = INITIAL_LAYERS.find(l => l.id === primaryLayerId)!;
  const raster = generateRasterGrid(primaryLayerId);
  const raster2 = generateRasterGrid('prospec');

  const COLS = raster[0]?.length ?? 28;
  const ROWS = raster.length;
  const VW = 560, VH = 360;
  const CW = VW / COLS, CH = VH / ROWS;

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setSelectedLocation({ x, y });
  }, []);

  // Location info from selected point
  const locLat = selectedLocation ? (21.87 - selectedLocation.y * 0.07).toFixed(4) : '—';
  const locLng = selectedLocation ? (80.155 + selectedLocation.x * 0.08).toFixed(4) : '—';
  const locProspScore = selectedLocation
    ? Math.round((0.3 + (1 - Math.abs(selectedLocation.x - 0.63)) * 0.4 + (1 - Math.abs(selectedLocation.y - 0.35)) * 0.3) * 100)
    : 0;

  const enabledLayers = layers.filter(l => l.enabled);

  return (
    <div className="flex h-[calc(100vh-2.75rem)] overflow-hidden bg-[hsl(var(--surface-0))]">

      {/* ── Left layer panel ────────────────────────────── */}
      <div className={`flex flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] transition-all duration-200 shrink-0 ${leftPanelOpen ? 'w-52' : 'w-10'}`}>

        {/* Panel header */}
        <div className="flex items-center justify-between px-2.5 py-2.5 border-b border-[hsl(var(--border))] shrink-0">
          {leftPanelOpen && (
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[hsl(var(--amber))]" />
              <span className="text-xs font-semibold text-[hsl(var(--text-primary))]">Layers</span>
            </div>
          )}
          <button
            onClick={() => setLeftPanelOpen(v => !v)}
            className="p-0.5 rounded-sm hover:bg-[hsl(var(--surface-3))] transition-colors ml-auto"
          >
            <ChevronRight className={`w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] transition-transform ${leftPanelOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {leftPanelOpen && (
          <div className="flex-1 overflow-y-auto py-1">
            {LAYER_GROUPS.map(group => {
              const groupLayers = layers.filter(l => l.group === group);
              if (!groupLayers.length) return null;
              return (
                <div key={group} className="mb-2">
                  <div className="px-2.5 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--text-dim))]">{group}</div>
                  {groupLayers.map(layer => (
                    <div key={layer.id} className="px-2 mb-0.5">
                      <div
                        onClick={() => toggleLayer(layer.id)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer transition-colors ${layer.enabled ? 'bg-[hsl(36_88%_48%/0.08)] border border-[hsl(36_88%_48%/0.2)]' : 'border border-transparent hover:bg-[hsl(var(--surface-3))]'}`}
                      >
                        {/* Color swatch */}
                        <div className="w-4 h-3 rounded-sm shrink-0 border border-[hsl(var(--border))]"
                          style={{ background: `linear-gradient(to right, ${layer.colorRamp.join(', ')})` }} />
                        <span className={`flex-1 text-[10px] font-medium truncate leading-tight ${layer.enabled ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))]'}`}>
                          {layer.label}
                        </span>
                        {/* Visibility dot */}
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${layer.enabled ? 'bg-[hsl(var(--amber))]' : 'bg-[hsl(var(--surface-4))]'}`} />
                      </div>
                      {/* Opacity slider (only when enabled) */}
                      {layer.enabled && (
                        <div className="px-2 pb-1.5 pt-0.5 flex items-center gap-1.5">
                          <span className="text-[9px] text-[hsl(var(--text-dim))] w-4">α</span>
                          <input
                            type="range" min={20} max={100} step={5} value={layer.opacity}
                            onChange={e => setOpacity(layer.id, Number(e.target.value))}
                            onClick={e => e.stopPropagation()}
                            className="flex-1 h-1"
                            style={{ background: `linear-gradient(to right, hsl(36 88% 48%) ${layer.opacity}%, hsl(210 6% 20%) ${layer.opacity}%)` }}
                          />
                          <span className="text-[9px] text-[hsl(var(--text-tertiary))] w-6 tabular-nums">{layer.opacity}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Data sources */}
            <div className="px-2.5 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-[hsl(var(--text-dim))]">Data Sources</div>
            {[
              { name: 'Sentinel-2', status: 'active', date: '2026-08-22' },
              { name: 'Sentinel-1',  status: 'active', date: '2026-08-21' },
              { name: 'ASTER',      status: 'active', date: '2026-08-20' },
              { name: 'INSAT-3DR',  status: 'delayed', date: '2026-08-18' },
              { name: 'SRTM DEM',   status: 'static', date: '2011-01-01' },
            ].map(s => (
              <div key={s.name} className="flex items-center gap-2 px-3 py-1">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.status === 'active' ? 'bg-[hsl(var(--green))]' : s.status === 'delayed' ? 'bg-[hsl(var(--amber))]' : 'bg-[hsl(var(--text-dim))]'}`} />
                <span className="text-[10px] text-[hsl(var(--text-secondary))] flex-1">{s.name}</span>
                <span className="text-[9px] text-[hsl(var(--text-dim))] font-mono">{s.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Map viewport ────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Map toolbar */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">

          {/* Analysis mode tabs */}
          <div className="flex items-center gap-1 bg-[hsl(var(--surface-2))] rounded-sm p-0.5">
            {ANALYSIS_MODES.map(mode => (
              <button
                key={mode}
                onClick={() => setActiveMode(mode)}
                className={`px-2 py-0.5 rounded-sm text-[10px] font-medium transition-colors ${activeMode === mode ? 'bg-[hsl(var(--surface-4))] text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Compare toggle */}
          {activeMode === 'Compare' && (
            <div className="flex items-center gap-1.5">
              <select value={compareDate} onChange={e => setCompareDate(e.target.value)} className="mangan-select text-[10px]">
                {DATES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ArrowLeftRight className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
            </div>
          )}

          {/* Date selector */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
            <select value={activeDate} onChange={e => setActiveDate(e.target.value)} className="mangan-select text-[10px]">
              {DATES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="w-px h-4 bg-[hsl(var(--border))]" />

          {/* Zoom */}
          <div className="flex items-center gap-1">
            <button onClick={() => setZoomLevel(z => Math.min(3, z + 0.25))} className="btn-ghost p-1"><ZoomIn className="w-3.5 h-3.5" /></button>
            <span className="text-[10px] text-[hsl(var(--text-dim))] tabular-nums w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.25))} className="btn-ghost p-1"><ZoomOut className="w-3.5 h-3.5" /></button>
          </div>

          <button className="btn-ghost p-1" title="Reset view" onClick={() => setZoomLevel(1)}>
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button className="btn-ghost p-1" title="Select location">
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <div className="demo-badge">SIMULATED DATA</div>
        </div>

        {/* SVG Map */}
        <div className="flex-1 relative overflow-hidden bg-[hsl(var(--map-bg))]">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VW} ${VH}`}
            className="w-full h-full cursor-crosshair"
            preserveAspectRatio="xMidYMid meet"
            onClick={handleSvgClick}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.2s' }}
          >
            {/* Background */}
            <rect width={VW} height={VH} fill="hsl(210, 10%, 7%)" />

            {/* Raster tiles */}
            {compareMode && activeMode === 'Compare' ? (
              <>
                {/* Left: primary */}
                <g clipPath="url(#leftHalf)">
                  <defs>
                    <clipPath id="leftHalf"><rect x={0} y={0} width={VW / 2} height={VH} /></clipPath>
                  </defs>
                  {raster.map((row, r) => row.map((v, c) => (
                    <rect key={`l${r}-${c}`} x={c * CW} y={r * CH} width={CW + 0.5} height={CH + 0.5}
                      fill={rampColor(v, primaryLayer.colorRamp)} opacity={0.9} />
                  )))}
                </g>
                {/* Right: prospec */}
                <g clipPath="url(#rightHalf)">
                  <defs>
                    <clipPath id="rightHalf"><rect x={VW / 2} y={0} width={VW / 2} height={VH} /></clipPath>
                  </defs>
                  {raster2.map((row, r) => row.map((v, c) => (
                    <rect key={`r${r}-${c}`} x={c * CW} y={r * CH} width={CW + 0.5} height={CH + 0.5}
                      fill={rampColor(v, INITIAL_LAYERS.find(l => l.id === 'prospec')!.colorRamp)} opacity={0.9} />
                  )))}
                </g>
                {/* Divider */}
                <line x1={VW / 2} y1={0} x2={VW / 2} y2={VH} stroke="white" strokeWidth={1} strokeDasharray="4 2" opacity={0.5} />
                <text x={VW / 4} y={14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.5)">{activeDate}</text>
                <text x={(VW * 3) / 4} y={14} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.5)">{compareDate}</text>
              </>
            ) : (
              raster.map((row, r) => row.map((v, c) => (
                <rect key={`${r}-${c}`} x={c * CW} y={r * CH} width={CW + 0.5} height={CH + 0.5}
                  fill={rampColor(v, primaryLayer.colorRamp)} opacity={0.88} />
              )))
            )}

            {/* Grid overlay */}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`hg${i}`} x1={0} y1={VH * i / 7} x2={VW} y2={VH * i / 7} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`vg${i}`} x1={VW * i / 11} y1={0} x2={VW * i / 11} y2={VH} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
            ))}

            {/* Geological lineaments */}
            {enabledLayers.some(l => l.id === 'lineament') && LINEAMENTS.map(([a, b], i) => (
              <line key={`lm${i}`}
                x1={a[0] * VW} y1={a[1] * VH} x2={b[0] * VW} y2={b[1] * VH}
                stroke="#fff176" strokeWidth={0.8} strokeDasharray="4 2" opacity={0.55} />
            ))}

            {/* Mine boundary */}
            <rect x={VW * 0.25} y={VH * 0.18} width={VW * 0.52} height={VH * 0.58}
              rx={4} fill="none" stroke="hsl(36 88% 48%)" strokeWidth={1} strokeDasharray="6 3" opacity={0.6} />

            {/* Exploration zone circles */}
            {enabledLayers.some(l => l.id === 'prospec') && GIS_ZONES.map(z => {
              const cx = z.cx * VW, cy = z.cy * VH;
              const r = z.r * Math.min(VW, VH);
              const isH = hoveredZone === z.id;
              return (
                <g key={z.id}
                  onMouseEnter={() => setHoveredZone(z.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <circle cx={cx} cy={cy} r={r} fill={z.color} fillOpacity={isH ? 0.25 : 0.1}
                    stroke={z.color} strokeWidth={isH ? 1.5 : 0.8} strokeOpacity={0.7} />
                  <circle cx={cx} cy={cy} r={3} fill={z.color} opacity={0.9} />
                  {isH && (
                    <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize={8} fill={z.color} fontFamily="Inter">
                      {z.label} · {Math.round(z.prob * 100)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Mineral occurrences */}
            {enabledLayers.some(l => l.id === 'occurrence') && OCCURRENCES.map((o, i) => (
              <g key={i}>
                <path d={`M${o.x * VW},${o.y * VH - 7} L${o.x * VW - 4},${o.y * VH} L${o.x * VW + 4},${o.y * VH} Z`}
                  fill="#f06292" opacity={0.9} />
              </g>
            ))}

            {/* Selected location crosshair */}
            {selectedLocation && (() => {
              const sx = selectedLocation.x * VW, sy = selectedLocation.y * VH;
              return (
                <g>
                  <line x1={sx - 10} y1={sy} x2={sx + 10} y2={sy} stroke="white" strokeWidth={0.8} opacity={0.8} />
                  <line x1={sx} y1={sy - 10} x2={sx} y2={sy + 10} stroke="white" strokeWidth={0.8} opacity={0.8} />
                  <circle cx={sx} cy={sy} r={4} fill="none" stroke="white" strokeWidth={0.8} opacity={0.8} />
                </g>
              );
            })()}

            {/* Compass */}
            <g transform={`translate(${VW - 24}, 24)`}>
              <circle cx={0} cy={0} r={14} fill="hsl(210 8% 9% / 0.85)" stroke="hsl(210 6% 20%)" strokeWidth={0.8} />
              <polygon points="0,-9 2,2 0,5 -2,2" fill="hsl(36 88% 48%)" opacity={0.9} />
              <polygon points="0,9 2,-2 0,-5 -2,-2" fill="hsl(210 6% 36%)" opacity={0.7} />
              <text x={0} y={-3} textAnchor="middle" fontSize={6} fill="hsl(36 88% 48%)" fontFamily="Inter" fontWeight="600">N</text>
            </g>

            {/* Coordinate display */}
            {selectedLocation && (
              <g>
                <rect x={4} y={VH - 18} width={140} height={14} rx={2} fill="hsl(210 8% 9% / 0.85)" />
                <text x={8} y={VH - 8} fontSize={8} fill="hsl(210 6% 60%)" fontFamily="JetBrains Mono, monospace">
                  {locLat}°N · {locLng}°E
                </text>
              </g>
            )}

            {/* Scale bar */}
            <g transform={`translate(${VW * 0.55}, ${VH - 12})`}>
              <line x1={0} y1={0} x2={50} y2={0} stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
              <line x1={0} y1={-3} x2={0} y2={3} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
              <line x1={50} y1={-3} x2={50} y2={3} stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
              <text x={25} y={-5} textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.5)">~1 km</text>
            </g>
          </svg>

          {/* Color scale overlay (bottom-left) */}
          <div className="absolute bottom-8 left-3 bg-[hsl(210_8%_9%/0.9)] border border-[hsl(var(--border))] rounded-sm px-2 py-1.5">
            <div className="section-label mb-1">{primaryLayer.label}</div>
            <div className="w-24 h-2 rounded-sm mb-0.5" style={{ background: `linear-gradient(to right, ${primaryLayer.colorRamp.join(', ')})` }} />
            <div className="flex justify-between text-[8px] text-[hsl(var(--text-dim))] font-mono">
              <span>{primaryLayer.min}{primaryLayer.unit}</span>
              <span>{primaryLayer.max}{primaryLayer.unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right analysis panel ─────────────────────────── */}
      <div className="w-64 flex flex-col border-l border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0 overflow-hidden">

        {/* Panel tabs */}
        <div className="flex border-b border-[hsl(var(--border))] shrink-0">
          {[
            { id: 'info' as const,    label: 'Location', icon: MapPin },
            { id: 'spectral' as const, label: 'Spectral', icon: BarChart2 },
            { id: 'temporal' as const, label: 'Temporal', icon: Activity },
            { id: 'stats' as const,   label: 'Stats',     icon: SlidersHorizontal },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActivePanel(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors border-b-2 ${activePanel === id ? 'border-[hsl(var(--amber))] text-[hsl(var(--amber))]' : 'border-transparent text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-secondary))]'}`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Location / selected point info */}
          {activePanel === 'info' && (
            <div className="p-3 space-y-3">
              <div>
                <div className="section-label mb-2">Selected Location</div>
                {selectedLocation ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[hsl(var(--text-tertiary))]">Latitude</span>
                      <span className="text-[hsl(var(--text-primary))] font-mono">{locLat}°N</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[hsl(var(--text-tertiary))]">Longitude</span>
                      <span className="text-[hsl(var(--text-primary))] font-mono">{locLng}°E</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[hsl(var(--text-tertiary))]">CRS</span>
                      <span className="text-[hsl(var(--text-secondary))]">WGS84 / UTM 44N</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[hsl(var(--text-tertiary))]">Zone</span>
                      <span className="text-[hsl(var(--text-secondary))]">Zone Alpha-North</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Click on map to select a location.</p>
                )}
              </div>

              {selectedLocation && (
                <>
                  <div className="border-t border-[hsl(var(--border))] pt-3">
                    <div className="section-label mb-2">Layer Values at Point</div>
                    <div className="space-y-1.5">
                      {enabledLayers.slice(0, 5).map(l => {
                        const pct = 0.3 + Math.random() * 0.5;
                        const val = l.min + pct * (l.max - l.min);
                        return (
                          <div key={l.id} className="flex justify-between items-center text-[10px]">
                            <span className="text-[hsl(var(--text-tertiary))] truncate flex-1 mr-2">{l.label}</span>
                            <span className="text-[hsl(var(--text-secondary))] font-mono shrink-0">{val.toFixed(1)}{l.unit}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-[hsl(var(--border))] pt-3">
                    <div className="section-label mb-2">Prospectivity Score</div>
                    <div className="flex items-end gap-2 mb-1.5">
                      <span className={`text-2xl font-semibold tabular-nums ${locProspScore > 70 ? 'text-[hsl(var(--red))]' : locProspScore > 50 ? 'text-[hsl(var(--amber))]' : 'text-[hsl(var(--text-secondary))]'}`}>
                        {locProspScore}
                      </span>
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))] mb-1">/ 100</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${locProspScore}%`, background: locProspScore > 70 ? 'hsl(var(--red))' : locProspScore > 50 ? 'hsl(var(--amber))' : 'hsl(var(--text-tertiary))' }} />
                    </div>
                    <div className="mt-2 space-y-1">
                      {[
                        { label: 'Spectral anomaly', value: 'Strong', color: 'text-[hsl(var(--amber))]' },
                        { label: 'Lineament proximity', value: '< 200m', color: 'text-[hsl(var(--amber))]' },
                        { label: 'Terrain suitability', value: 'Moderate', color: 'text-[hsl(var(--text-secondary))]' },
                        { label: 'Known occurrence', value: '650m away', color: 'text-[hsl(var(--text-secondary))]' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
                          <span className="text-[hsl(var(--amber))] shrink-0">›</span>
                          <span className="text-[hsl(var(--text-tertiary))] flex-1">{item.label}</span>
                          <span className={item.color}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Spectral profile */}
          {activePanel === 'spectral' && (
            <div className="p-3 space-y-3">
              <div className="section-label">Spectral Profile — Selected Point</div>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={SPECTRAL_PROFILE} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <XAxis dataKey="band" tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} domain={[0, 0.4]} />
                  <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }}
                    formatter={(v: number, _: string, props: { payload?: { nm?: string } }) => [`${(v as number).toFixed(3)}`, props?.payload?.nm ?? '']} />
                  <Line type="monotone" dataKey="val" stroke="hsl(36 88% 48%)" strokeWidth={1.5} dot={{ r: 2, fill: 'hsl(36 88% 48%)' }} name="Reflectance" />
                </LineChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-tertiary))]">Sensor</span>
                  <span className="text-[hsl(var(--text-secondary))]">Sentinel-2 MSI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-tertiary))]">Resolution</span>
                  <span className="text-[hsl(var(--text-secondary))]">10 – 20m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-tertiary))]">Acquisition</span>
                  <span className="text-[hsl(var(--text-secondary))]">{activeDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--text-tertiary))]">Correction</span>
                  <span className="text-[hsl(var(--text-secondary))]">L2A (BOA)</span>
                </div>
              </div>
              <div className="border-t border-[hsl(var(--border))] pt-2">
                <div className="section-label mb-1.5">Spectral Indices</div>
                {[
                  { name: 'NDVI', val: '-0.12', note: 'Bare/disturbed soil' },
                  { name: 'BSI', val: '0.38', note: 'High bare soil index' },
                  { name: 'FeMg Ratio', val: '1.24', note: 'Fe/Mg anomaly — prospective' },
                  { name: 'Clay Index', val: '0.64', note: 'Elevated — weathered laterite' },
                ].map(idx => (
                  <div key={idx.name} className="flex items-start gap-1.5 py-1 border-b border-[hsl(var(--border)/0.5)] last:border-0">
                    <span className="text-[10px] font-mono text-[hsl(var(--amber))] w-20 shrink-0">{idx.name}</span>
                    <span className="text-[10px] text-[hsl(var(--text-primary))] w-8 tabular-nums">{idx.val}</span>
                    <span className="text-[9px] text-[hsl(var(--text-tertiary))] leading-tight">{idx.note}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Temporal comparison */}
          {activePanel === 'temporal' && (
            <div className="p-3 space-y-3">
              <div className="section-label">NDVI Time Series — Zone Alpha-North</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={TEMPORAL_NDVI} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 8, fill: 'hsl(210 6% 42%)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} domain={[0, 0.7]} />
                  <Tooltip contentStyle={{ background: 'hsl(210 8% 9%)', border: '1px solid hsl(210 6% 14%)', borderRadius: '2px', fontSize: '10px' }} />
                  <Bar dataKey="val" fill="hsl(150 45% 38%)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="border-t border-[hsl(var(--border))] pt-2">
                <div className="section-label mb-2">Detected Changes</div>
                <div className="space-y-2">
                  {[
                    { period: 'Jun → Aug 2026', change: 'NDVI -0.17', severity: 'high', note: 'Active mining expansion' },
                    { period: 'Nov 25 → Mar 26', change: 'NDVI -0.14', severity: 'medium', note: 'Seasonal dry-season mining' },
                    { period: 'Thermal +4.2°C', change: 'Aug 2026', severity: 'high', note: 'Zone Alpha surface exposure' },
                  ].map(c => (
                    <div key={c.period} className={`p-2 rounded-sm bg-[hsl(var(--surface-2))] ${c.severity === 'high' ? 'border-l-2 border-[hsl(var(--amber))]' : 'border-l-2 border-[hsl(var(--text-dim))]'}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] font-medium text-[hsl(var(--text-primary))]">{c.change}</span>
                        <span className="text-[9px] text-[hsl(var(--text-tertiary))]">{c.period}</span>
                      </div>
                      <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{c.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Layer statistics */}
          {activePanel === 'stats' && (
            <div className="p-3 space-y-3">
              <div className="section-label">Layer Statistics — Mine Boundary AOI</div>
              {enabledLayers.map(l => (
                <div key={l.id} className="mangan-panel p-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-3 h-2 rounded-sm shrink-0" style={{ background: `linear-gradient(to right, ${l.colorRamp.join(', ')})` }} />
                    <span className="text-[10px] font-medium text-[hsl(var(--text-primary))] truncate">{l.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
                    {[
                      ['Min', `${(l.min + (l.max - l.min) * 0.05).toFixed(1)}${l.unit}`],
                      ['Max', `${(l.max - (l.max - l.min) * 0.05).toFixed(1)}${l.unit}`],
                      ['Mean', `${((l.min + l.max) / 2).toFixed(1)}${l.unit}`],
                      ['StdDev', `${((l.max - l.min) * 0.18).toFixed(1)}${l.unit}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-[hsl(var(--text-dim))]">{k}</span>
                        <span className="text-[hsl(var(--text-secondary))] font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[9px] text-[hsl(var(--text-dim))] mt-1.5 leading-relaxed">{l.description}</p>
                </div>
              ))}
              {enabledLayers.length === 0 && (
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">Enable layers to view statistics.</p>
              )}
            </div>
          )}
        </div>

        {/* Export footer */}
        <div className="px-3 py-2.5 border-t border-[hsl(var(--border))] shrink-0 flex gap-2">
          <button className="btn-secondary flex-1 text-[10px] py-1 justify-center">
            <Download className="w-3 h-3" />
            Export
          </button>
          <button className="btn-ghost px-2 py-1">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
