import { useState } from 'react';
import { GEOLOGICAL_ZONES } from '@/data/geologicalData';
import { EQUIPMENT_LIST } from '@/data/equipmentData';

interface Layer {
  id: string;
  label: string;
  enabled: boolean;
}

const ZONE_COLORS: Record<string, string> = {
  active:      '#f59e0b',
  exploration: '#3b82f6',
  predicted:   '#8b5cf6',
  depleted:    '#6b7280',
};

const EQUIPMENT_COLORS: Record<string, string> = {
  operational: '#34d399',
  maintenance: '#f97316',
  idle:        '#6b7280',
  fault:       '#ef4444',
};

function toSVG(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, W: number, H: number) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * W;
  const y = H - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * H;
  return { x, y };
}

const BOUNDS = { minLat: 21.80, maxLat: 21.87, minLng: 80.155, maxLng: 80.235 };
const W = 800, H = 500;

export default function MineMapSVG() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'zones',     label: 'Reserve Zones', enabled: true },
    { id: 'drills',    label: 'Drill Holes',   enabled: true },
    { id: 'equipment', label: 'Equipment',     enabled: true },
    { id: 'labels',    label: 'Labels',        enabled: true },
  ]);
  const [hoveredZone,  setHoveredZone]  = useState<string | null>(null);
  const [hoveredEquip, setHoveredEquip] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const toggleLayer = (id: string) =>
    setLayers(ls => ls.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));

  const getLayer = (id: string) => layers.find(l => l.id === id)?.enabled;

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">

      {/* Layer toggles */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        {layers.map(l => (
          <button key={l.id} onClick={() => toggleLayer(l.id)}
            className={`px-2 py-0.5 rounded-sm text-[9px] font-medium border transition-colors ${l.enabled
              ? 'bg-[hsl(36_88%_48%/0.1)] border-[hsl(36_88%_48%/0.3)] text-[hsl(36_88%_48%)]'
              : 'bg-[hsl(210_8%_9%/0.8)] border-[hsl(210_6%_18%)] text-[hsl(210_6%_36%)]'}`}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-10 bg-[hsl(210_8%_9%/0.92)] border border-[hsl(210_6%_16%)] rounded-sm px-2 py-2 space-y-1">
        <div className="text-[8px] font-semibold uppercase tracking-widest text-[hsl(210_6%_36%)] mb-1.5">Zone Type</div>
        {Object.entries(ZONE_COLORS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-[9px] text-[hsl(210_8%_56%)] capitalize">
            <div className="w-2 h-2 rounded-full" style={{ background: v, opacity: 0.85 }} />
            {k}
          </div>
        ))}
        <div className="text-[8px] font-semibold uppercase tracking-widest text-[hsl(210_6%_36%)] mt-2 mb-1">Equipment</div>
        {Object.entries(EQUIPMENT_COLORS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-[9px] text-[hsl(210_8%_56%)] capitalize">
            <div className="w-2 h-2 rounded-sm" style={{ background: v }} />
            {k}
          </div>
        ))}
      </div>

      {/* SVG */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        style={{ background: 'hsl(210, 10%, 7%)' }}
      >
        {/* Grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={H * i / 8} x2={W} y2={H * i / 8} stroke="hsl(210 6% 11%)" strokeWidth="0.8" />
        ))}
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={W * i / 12} y1={0} x2={W * i / 12} y2={H} stroke="hsl(210 6% 11%)" strokeWidth="0.8" />
        ))}

        {/* Terrain gradient */}
        <defs>
          <radialGradient id="terrain" cx="55%" cy="45%">
            <stop offset="0%" stopColor="hsl(30, 15%, 13%)" />
            <stop offset="100%" stopColor="hsl(210, 10%, 7%)" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#terrain)" opacity={0.6} />

        {/* Mine boundary */}
        <ellipse cx={W / 2} cy={H / 2} rx={340} ry={205}
          fill="none" stroke="hsl(36 88% 48% / 0.2)" strokeWidth={1.2} strokeDasharray="8 4" />

        {/* Roads */}
        <path d={`M ${W * 0.08} ${H * 0.5} Q ${W * 0.38} ${H * 0.28} ${W * 0.92} ${H * 0.42}`}
          fill="none" stroke="hsl(210 6% 22%)" strokeWidth={2.5} />
        <path d={`M ${W * 0.18} ${H * 0.82} Q ${W * 0.48} ${H * 0.62} ${W * 0.82} ${H * 0.56}`}
          fill="none" stroke="hsl(210 6% 19%)" strokeWidth={1.8} />

        {/* Reserve zones */}
        {getLayer('zones') && GEOLOGICAL_ZONES.map(zone => {
          const { x, y } = toSVG(zone.lat, zone.lng, BOUNDS, W, H);
          const r = Math.sqrt(zone.area) * 1.7;
          const color = ZONE_COLORS[zone.type];
          const isH = hoveredZone === zone.id;
          return (
            <g key={zone.id}>
              <circle cx={x} cy={y} r={r}
                fill={color} fillOpacity={isH ? 0.3 : 0.12}
                stroke={color} strokeWidth={isH ? 1.5 : 0.8} strokeOpacity={0.7}
                style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => {
                  setHoveredZone(zone.id);
                  const rect = (e.currentTarget.closest('svg') as SVGElement).getBoundingClientRect();
                  setTooltip({
                    x: (x / W) * rect.width + rect.left,
                    y: (y / H) * rect.height + rect.top,
                    content: `${zone.name}\nMn Prob: ${(zone.manganeseProb * 100).toFixed(0)}% · Grade: ${zone.oreGrade}% Mn\nEst: ${zone.estimatedQuantity.toLocaleString()} kt`
                  });
                }}
                onMouseLeave={() => { setHoveredZone(null); setTooltip(null); }}
              />
              <circle cx={x} cy={y} r={3.5} fill={color} opacity={0.9} />
            </g>
          );
        })}

        {/* Drill holes */}
        {getLayer('drills') && GEOLOGICAL_ZONES.flatMap(z => z.drillHoles).map(dh => {
          const { x, y } = toSVG(dh.lat, dh.lng, BOUNDS, W, H);
          const color = dh.status === 'completed' ? '#34d399' : dh.status === 'in-progress' ? '#f59e0b' : '#6b7280';
          return (
            <g key={dh.id}>
              <circle cx={x} cy={y} r={5} fill="none" stroke={color} strokeWidth={1.2} opacity={0.75} />
              <circle cx={x} cy={y} r={2} fill={color} opacity={0.85} />
            </g>
          );
        })}

        {/* Equipment */}
        {getLayer('equipment') && EQUIPMENT_LIST.map(eq => {
          const { x, y } = toSVG(eq.lat, eq.lng, BOUNDS, W, H);
          const color = EQUIPMENT_COLORS[eq.status];
          const isH = hoveredEquip === eq.id;
          return (
            <g key={eq.id}
              onMouseEnter={e => {
                setHoveredEquip(eq.id);
                const rect = (e.currentTarget.closest('svg') as SVGElement).getBoundingClientRect();
                setTooltip({
                  x: (x / W) * rect.width + rect.left,
                  y: (y / H) * rect.height + rect.top,
                  content: `${eq.name}\n${eq.status.toUpperCase()} · Util: ${eq.utilization}%`
                });
              }}
              onMouseLeave={() => { setHoveredEquip(null); setTooltip(null); }}
              style={{ cursor: 'pointer' }}
            >
              <rect x={x - 5.5} y={y - 5.5} width={11} height={11} rx={2}
                fill={color} fillOpacity={isH ? 0.9 : 0.65}
                stroke={color} strokeWidth={isH ? 1.5 : 0.8} />
            </g>
          );
        })}

        {/* Zone labels */}
        {getLayer('labels') && GEOLOGICAL_ZONES.map(zone => {
          const { x, y } = toSVG(zone.lat, zone.lng, BOUNDS, W, H);
          return (
            <text key={zone.id}
              x={x} y={y - Math.sqrt(zone.area) * 1.7 - 5}
              textAnchor="middle" fontSize="9" fill="hsl(210 8% 56%)"
              fontFamily="Inter, sans-serif">
              {zone.name.replace('Zone ', '')}
            </text>
          );
        })}

        {/* Compass */}
        <g transform={`translate(${W - 32}, 32)`}>
          <circle cx={0} cy={0} r={18} fill="hsl(210 8% 9% / 0.85)" stroke="hsl(210 6% 18%)" strokeWidth={0.8} />
          <polygon points="0,-12 3,0 0,5 -3,0" fill="hsl(36 88% 48%)" opacity={0.9} />
          <polygon points="0,12 3,0 0,-5 -3,0" fill="hsl(210 6% 38%)" opacity={0.7} />
          <text x={0} y={-4} textAnchor="middle" fontSize="7" fill="hsl(36 88% 48%)"
            fontFamily="Inter, sans-serif" fontWeight="600">N</text>
        </g>

        {/* Scale */}
        <g transform={`translate(${W * 0.62}, ${H - 12})`}>
          <line x1={0} y1={0} x2={56} y2={0} stroke="hsl(210 6% 36%)" strokeWidth={1.5} />
          <line x1={0} y1={-3} x2={0} y2={3} stroke="hsl(210 6% 36%)" strokeWidth={1.5} />
          <line x1={56} y1={-3} x2={56} y2={3} stroke="hsl(210 6% 36%)" strokeWidth={1.5} />
          <text x={28} y={-5} textAnchor="middle" fontSize="8" fill="hsl(210 6% 46%)">~1.2 km</text>
        </g>
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div className="map-tooltip" style={{ left: tooltip.x + 12, top: tooltip.y - 20 }}>
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
