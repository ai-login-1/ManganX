import { useState } from 'react';
import { GEOLOGICAL_ZONES } from '@/data/geologicalData';
import { EQUIPMENT_LIST } from '@/data/equipmentData';

interface Layer {
  id: string;
  label: string;
  enabled: boolean;
}

const ZONE_COLORS: Record<string, string> = {
  active: '#f59e0b',
  exploration: '#3b82f6',
  predicted: '#8b5cf6',
  depleted: '#6b7280',
};

const EQUIPMENT_COLORS: Record<string, string> = {
  operational: '#22c55e',
  maintenance: '#f97316',
  idle: '#6b7280',
  fault: '#ef4444',
};

// Map coordinate to SVG space
function toSVG(lat: number, lng: number, bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, width: number, height: number) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
  const y = height - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
  return { x, y };
}

const BOUNDS = { minLat: 21.80, maxLat: 21.87, minLng: 80.155, maxLng: 80.235 };
const W = 800, H = 500;

export default function MineMapSVG() {
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'zones', label: 'Reserve Zones', enabled: true },
    { id: 'drills', label: 'Drill Holes', enabled: true },
    { id: 'equipment', label: 'Equipment', enabled: true },
    { id: 'labels', label: 'Labels', enabled: true },
  ]);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [hoveredEquip, setHoveredEquip] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const toggleLayer = (id: string) => {
    setLayers(l => l.map(lyr => lyr.id === id ? { ...lyr, enabled: !lyr.enabled } : lyr));
  };

  const getLayer = (id: string) => layers.find(l => l.id === id)?.enabled;

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Layer controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {layers.map(l => (
          <button
            key={l.id}
            onClick={() => toggleLayer(l.id)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${l.enabled
              ? 'bg-[hsl(38_92%_50%/0.15)] border-[hsl(38_92%_50%/0.4)] text-[hsl(var(--amber))]'
              : 'bg-[hsl(var(--surface-2))] border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-[hsl(220_16%_10%/0.92)] border border-[hsl(var(--border))] rounded p-2 space-y-1">
        <div className="section-label mb-1">Zone Type</div>
        {Object.entries(ZONE_COLORS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-secondary))] capitalize">
            <div className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ background: v, opacity: 0.8 }} />
            {k}
          </div>
        ))}
        <div className="section-label mt-2 mb-1">Equipment</div>
        {Object.entries(EQUIPMENT_COLORS).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--text-secondary))] capitalize">
            <div className="w-2 h-2 rounded-sm" style={{ background: v }} />
            {k}
          </div>
        ))}
      </div>

      {/* SVG Map */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
        style={{ background: 'hsl(220, 18%, 9%)' }}
      >
        {/* Grid */}
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={(H / 7) * i} x2={W} y2={(H / 7) * i} stroke="hsl(220 12% 14%)" strokeWidth="1" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`v${i}`} x1={(W / 10) * i} y1={0} x2={(W / 10) * i} y2={H} stroke="hsl(220 12% 14%)" strokeWidth="1" />
        ))}

        {/* Terrain texture suggestion */}
        <rect x={0} y={0} width={W} height={H} fill="url(#terrainGrad)" opacity={0.3} />
        <defs>
          <radialGradient id="terrainGrad" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(30, 20%, 15%)" />
            <stop offset="100%" stopColor="hsl(220, 18%, 9%)" />
          </radialGradient>
        </defs>

        {/* Mine boundary */}
        <ellipse cx={W / 2} cy={H / 2} rx={360} ry={220} fill="none" stroke="hsl(38 92% 50% / 0.2)" strokeWidth="1.5" strokeDasharray="8 4" />

        {/* Roads */}
        <path d={`M ${W * 0.1} ${H * 0.5} Q ${W * 0.4} ${H * 0.3} ${W * 0.9} ${H * 0.4}`} fill="none" stroke="hsl(215 14% 28%)" strokeWidth="3" />
        <path d={`M ${W * 0.2} ${H * 0.8} Q ${W * 0.5} ${H * 0.6} ${W * 0.8} ${H * 0.55}`} fill="none" stroke="hsl(215 14% 28%)" strokeWidth="2" />

        {/* Zone circles */}
        {getLayer('zones') && GEOLOGICAL_ZONES.map(zone => {
          const { x, y } = toSVG(zone.lat, zone.lng, BOUNDS, W, H);
          const r = Math.sqrt(zone.area) * 1.8;
          const color = ZONE_COLORS[zone.type];
          const isHovered = hoveredZone === zone.id;
          return (
            <g key={zone.id}>
              <circle
                cx={x} cy={y} r={r}
                fill={color} fillOpacity={isHovered ? 0.4 : 0.18}
                stroke={color} strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={0.8}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => {
                  setHoveredZone(zone.id);
                  const rect = (e.currentTarget.closest('svg') as SVGElement).getBoundingClientRect();
                  const svgX = (x / W) * rect.width + rect.left;
                  const svgY = (y / H) * rect.height + rect.top;
                  setTooltip({
                    x: svgX, y: svgY,
                    content: `${zone.name}\nMn Prob: ${(zone.manganeseProb * 100).toFixed(0)}% | Grade: ${zone.oreGrade}% Mn\nEst. Qty: ${zone.estimatedQuantity.toLocaleString()} kt`
                  });
                }}
                onMouseLeave={() => { setHoveredZone(null); setTooltip(null); }}
              />
              <circle cx={x} cy={y} r={4} fill={color} opacity={0.9} />
            </g>
          );
        })}

        {/* Drill holes */}
        {getLayer('drills') && GEOLOGICAL_ZONES.flatMap(z => z.drillHoles).map(dh => {
          const { x, y } = toSVG(dh.lat, dh.lng, BOUNDS, W, H);
          const color = dh.status === 'completed' ? '#22c55e' : dh.status === 'in-progress' ? '#f59e0b' : '#6b7280';
          return (
            <g key={dh.id}>
              <circle cx={x} cy={y} r={5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.8} />
              <circle cx={x} cy={y} r={2} fill={color} opacity={0.9} />
            </g>
          );
        })}

        {/* Equipment */}
        {getLayer('equipment') && EQUIPMENT_LIST.map(eq => {
          const { x, y } = toSVG(eq.lat, eq.lng, BOUNDS, W, H);
          const color = EQUIPMENT_COLORS[eq.status];
          const isHovered = hoveredEquip === eq.id;
          return (
            <g key={eq.id}
              onMouseEnter={(e) => {
                setHoveredEquip(eq.id);
                const rect = (e.currentTarget.closest('svg') as SVGElement).getBoundingClientRect();
                setTooltip({
                  x: (x / W) * rect.width + rect.left,
                  y: (y / H) * rect.height + rect.top,
                  content: `${eq.name}\nStatus: ${eq.status.toUpperCase()}\nUtilization: ${eq.utilization}%`
                });
              }}
              onMouseLeave={() => { setHoveredEquip(null); setTooltip(null); }}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x - 6} y={y - 6} width={12} height={12}
                rx={2}
                fill={color} fillOpacity={isHovered ? 0.9 : 0.7}
                stroke={color} strokeWidth={isHovered ? 2 : 1}
              />
            </g>
          );
        })}

        {/* Zone labels */}
        {getLayer('labels') && GEOLOGICAL_ZONES.map(zone => {
          const { x, y } = toSVG(zone.lat, zone.lng, BOUNDS, W, H);
          return (
            <text key={zone.id} x={x} y={y - Math.sqrt(zone.area) * 1.8 - 5} textAnchor="middle"
              fontSize="9" fill="hsl(215 14% 62%)" fontFamily="Inter, sans-serif">
              {zone.name.replace('Zone ', '')}
            </text>
          );
        })}

        {/* Compass */}
        <g transform={`translate(${W - 36}, 36)`}>
          <circle cx={0} cy={0} r={16} fill="hsl(220 16% 10%)" stroke="hsl(220 12% 22%)" strokeWidth={1} />
          <text x={0} y={-4} textAnchor="middle" fontSize="8" fill="hsl(38 92% 50%)" fontFamily="Inter">N</text>
          <polygon points="0,-12 3,0 0,4 -3,0" fill="hsl(38 92% 50%)" opacity={0.8} />
          <polygon points="0,12 3,0 0,-4 -3,0" fill="hsl(215 14% 42%)" opacity={0.6} />
        </g>

        {/* Scale */}
        <g transform={`translate(${W * 0.6}, ${H - 14})`}>
          <line x1={0} y1={0} x2={60} y2={0} stroke="hsl(215 14% 42%)" strokeWidth={1.5} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke="hsl(215 14% 42%)" strokeWidth={1.5} />
          <line x1={60} y1={-4} x2={60} y2={4} stroke="hsl(215 14% 42%)" strokeWidth={1.5} />
          <text x={30} y={-5} textAnchor="middle" fontSize="9" fill="hsl(215 14% 52%)">~1.2 km</text>
        </g>
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-[hsl(220_16%_10%)] border border-[hsl(var(--border))] rounded px-2.5 py-1.5 text-[11px] text-[hsl(var(--text-secondary))] shadow-xl whitespace-pre-line"
          style={{ left: tooltip.x + 12, top: tooltip.y - 20 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
