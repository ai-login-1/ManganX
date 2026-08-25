import { useState, useRef } from 'react';
import {
  Upload, Database, FileText, Activity, CheckCircle2,
  Clock, AlertCircle, Trash2, MoreHorizontal, Search,
  Filter, Download, RefreshCw, Table, Map, CloudUpload,
  FolderOpen, ChevronRight, Info
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────

type DatasetStatus = 'ready' | 'processing' | 'error' | 'queued';
type DatasetType = 'geotiff' | 'cog' | 'geojson' | 'csv' | 'shapefile';

interface Dataset {
  id: string;
  name: string;
  type: DatasetType;
  status: DatasetStatus;
  size: string;
  uploadedAt: string;
  rows?: number;
  crs?: string;
  bands?: number;
  resolution?: string;
  description: string;
  tags: string[];
  progress?: number;
}

// ── Mock dataset catalogue ─────────────────────────────────

const MOCK_DATASETS: Dataset[] = [
  {
    id: 'DS-001',
    name: 'balaghat_sentinel2_20260822.tif',
    type: 'geotiff',
    status: 'ready',
    size: '142 MB',
    uploadedAt: '2026-08-22',
    bands: 13,
    crs: 'WGS84 / UTM 44N',
    resolution: '10m',
    description: 'Sentinel-2 L2A multispectral image. Bands B2–B12 + SCL. Acquisition: 2026-08-22 05:14 UTC.',
    tags: ['optical', 'sentinel-2', 'multispectral'],
  },
  {
    id: 'DS-002',
    name: 'balaghat_sar_20260821.tif',
    type: 'geotiff',
    status: 'ready',
    size: '68 MB',
    uploadedAt: '2026-08-21',
    bands: 2,
    crs: 'WGS84 / UTM 44N',
    resolution: '10m',
    description: 'Sentinel-1 IW GRD dual-polarization SAR. VV + VH polarization. Used for soil moisture estimation.',
    tags: ['sar', 'sentinel-1', 'backscatter'],
  },
  {
    id: 'DS-003',
    name: 'exploration_zones_v3.geojson',
    type: 'geojson',
    status: 'ready',
    size: '24 KB',
    uploadedAt: '2026-08-15',
    rows: 6,
    crs: 'WGS84',
    description: 'Exploration zone polygons with attribute data. Includes prospectivity score, zone type, and estimated quantity.',
    tags: ['vector', 'exploration', 'zones'],
  },
  {
    id: 'DS-004',
    name: 'drill_holes_2026.csv',
    type: 'csv',
    status: 'ready',
    size: '18 KB',
    uploadedAt: '2026-08-10',
    rows: 148,
    description: 'Drill hole collar and assay data. Columns: hole_id, lat, lng, depth, mn_grade, fe_grade, si_grade, status.',
    tags: ['drilling', 'assay', 'geochemistry'],
  },
  {
    id: 'DS-005',
    name: 'production_history_2024_2026.csv',
    type: 'csv',
    status: 'ready',
    size: '89 KB',
    uploadedAt: '2026-08-01',
    rows: 730,
    description: 'Daily production records from 2024-01-01 to 2026-08-01. Includes planned, actual, downtime, rainfall, blast delays.',
    tags: ['production', 'historical', 'operational'],
  },
  {
    id: 'DS-006',
    name: 'dem_srtm_balaghat_30m.tif',
    type: 'geotiff',
    status: 'ready',
    size: '8 MB',
    uploadedAt: '2026-07-01',
    bands: 1,
    crs: 'WGS84',
    resolution: '30m',
    description: 'SRTM-derived Digital Elevation Model. Used for terrain analysis, slope calculation, and watershed delineation.',
    tags: ['terrain', 'dem', 'elevation'],
  },
  {
    id: 'DS-007',
    name: 'geological_map_mp.geojson',
    type: 'geojson',
    status: 'processing',
    size: '4.2 MB',
    uploadedAt: '2026-08-22',
    rows: 1240,
    progress: 68,
    description: 'GSI geological map digitized polygons. Rock types, formations, and geological contacts.',
    tags: ['geological', 'gsi', 'lithology'],
  },
  {
    id: 'DS-008',
    name: 'insat_rainfall_aug2026.tif',
    type: 'geotiff',
    status: 'error',
    size: '340 MB',
    uploadedAt: '2026-08-22',
    bands: 1,
    description: 'INSAT-3DR rainfall accumulation. Upload failed — file exceeds processing limit. Use COG format.',
    tags: ['weather', 'rainfall', 'insat'],
  },
];

// ── Upload type configurations ─────────────────────────────

const UPLOAD_TYPES = [
  {
    id: 'geotiff',
    label: 'GeoTIFF / COG',
    icon: Map,
    accept: '.tif,.tiff',
    description: 'Satellite imagery, raster analysis results, DEM',
    note: 'Max 500MB. Use COG format for large files.',
    color: 'text-[hsl(var(--blue))]',
    bg: 'bg-[hsl(210_72%_52%/0.08)] border-[hsl(210_72%_52%/0.2)]',
  },
  {
    id: 'vector',
    label: 'GeoJSON / Shapefile',
    icon: Database,
    accept: '.geojson,.json,.shp,.zip',
    description: 'Exploration zones, mine boundaries, lineaments',
    note: 'Shapefiles: zip all components before uploading.',
    color: 'text-[hsl(var(--green))]',
    bg: 'bg-[hsl(150_45%_38%/0.08)] border-[hsl(150_45%_38%/0.2)]',
  },
  {
    id: 'csv',
    label: 'CSV Data Table',
    icon: Table,
    accept: '.csv',
    description: 'Drill holes, production records, equipment logs',
    note: 'UTF-8 encoding required. First row = column headers.',
    color: 'text-[hsl(var(--amber))]',
    bg: 'bg-[hsl(36_88%_48%/0.08)] border-[hsl(36_88%_48%/0.2)]',
  },
];

const TYPE_ICONS: Record<DatasetType, string> = {
  geotiff: '🛰', cog: '🛰', geojson: '🗺', csv: '📊', shapefile: '🗺'
};

const STATUS_CONFIG: Record<DatasetStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  ready:      { label: 'Ready',      color: 'text-[hsl(var(--green))]',  bg: 'bg-[hsl(150_45%_38%/0.1)]',  icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'text-[hsl(var(--amber))]',  bg: 'bg-[hsl(36_88%_48%/0.1)]',   icon: Clock },
  error:      { label: 'Error',      color: 'text-[hsl(var(--red))]',    bg: 'bg-[hsl(0_68%_48%/0.1)]',    icon: AlertCircle },
  queued:     { label: 'Queued',     color: 'text-[hsl(var(--text-tertiary))]', bg: 'bg-[hsl(var(--surface-2))]', icon: Clock },
};

// ── Main component ─────────────────────────────────────────

export default function DataCenter() {
  const [datasets, setDatasets] = useState<Dataset[]>(MOCK_DATASETS);
  const [selected, setSelected] = useState<Dataset | null>(MOCK_DATASETS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dragOver, setDragOver] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = datasets.filter(d => {
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.tags.some(t => t.includes(searchQuery.toLowerCase()));
    const matchType = filterType === 'all' || d.type === filterType || (filterType === 'vector' && (d.type === 'geojson' || d.type === 'shapefile'));
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleFileDrop = (e: React.DragEvent, typeId: string) => {
    e.preventDefault();
    setDragOver(null);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    simulateUpload(files[0], typeId);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    simulateUpload(files[0], 'csv');
    e.target.value = '';
  };

  const simulateUpload = (file: File, _typeId: string) => {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const typeMap: Record<string, DatasetType> = { tif: 'geotiff', tiff: 'geotiff', geojson: 'geojson', json: 'geojson', csv: 'csv', shp: 'shapefile', zip: 'shapefile' };
    const newDs: Dataset = {
      id: `DS-${Date.now()}`,
      name: file.name,
      type: typeMap[ext] ?? 'csv',
      status: 'queued',
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      description: 'Newly uploaded dataset — awaiting processing.',
      tags: [],
      progress: 0,
    };
    setDatasets(ds => [newDs, ...ds]);
    toast.success('Upload started', { description: file.name });

    // Simulate processing
    setTimeout(() => {
      setDatasets(ds => ds.map(d => d.id === newDs.id ? { ...d, status: 'processing', progress: 0 } : d));
    }, 600);

    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 20 + 5;
      if (prog >= 100) {
        clearInterval(interval);
        setDatasets(ds => ds.map(d => d.id === newDs.id ? { ...d, status: 'ready', progress: undefined } : d));
        toast.success('Dataset ready', { description: `${file.name} processed successfully.` });
      } else {
        setDatasets(ds => ds.map(d => d.id === newDs.id ? { ...d, progress: Math.round(prog) } : d));
      }
    }, 400);
  };

  const deleteDataset = (id: string) => {
    setDatasets(ds => ds.filter(d => d.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Dataset removed');
  };

  const stats = {
    total: datasets.length,
    ready: datasets.filter(d => d.status === 'ready').length,
    processing: datasets.filter(d => d.status === 'processing').length,
    error: datasets.filter(d => d.status === 'error').length,
    totalSize: '673 MB',
  };

  return (
    <div className="flex h-[calc(100vh-2.75rem)] overflow-hidden">

      {/* ── Main content area ────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="page-title">Data Center</h1>
              <span className="demo-badge">DEMO STATE</span>
            </div>
            <p className="text-[10px] text-[hsl(var(--text-tertiary))]">
              Dataset ingestion and management · FastAPI backend ready
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
              <CloudUpload className="w-3.5 h-3.5" />
              Upload Dataset
            </button>
            <button className="btn-secondary">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect}
            accept=".tif,.tiff,.geojson,.json,.csv,.shp,.zip" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 border-b border-[hsl(var(--border))] shrink-0">
          {[
            { label: 'Total Datasets', value: stats.total, color: 'text-[hsl(var(--text-primary))]' },
            { label: 'Ready', value: stats.ready, color: 'text-[hsl(var(--green))]' },
            { label: 'Processing', value: stats.processing, color: 'text-[hsl(var(--amber))]' },
            { label: 'Errors', value: stats.error, color: 'text-[hsl(var(--red))]' },
            { label: 'Total Size', value: stats.totalSize, color: 'text-[hsl(var(--text-primary))]' },
          ].map((s, i) => (
            <div key={s.label} className={`px-4 py-2.5 ${i < 4 ? 'border-r border-[hsl(var(--border))]' : ''}`}>
              <div className="section-label">{s.label}</div>
              <div className={`text-base font-semibold tabular-nums mt-0.5 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Upload drop zones */}
        <div className="grid grid-cols-3 gap-3 px-4 py-3 border-b border-[hsl(var(--border))] shrink-0">
          {UPLOAD_TYPES.map(ut => {
            const Icon = ut.icon;
            return (
              <div
                key={ut.id}
                onDragOver={e => { e.preventDefault(); setDragOver(ut.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => handleFileDrop(e, ut.id)}
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${dragOver === ut.id ? `${ut.bg} scale-[1.01]` : `border-[hsl(var(--border))] hover:border-[hsl(var(--surface-4))]`}`}
              >
                <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${ut.bg} border`}>
                  <Icon className={`w-4 h-4 ${ut.color}`} />
                </div>
                <div className="min-w-0">
                  <div className={`text-[11px] font-semibold ${ut.color}`}>{ut.label}</div>
                  <div className="text-[9px] text-[hsl(var(--text-tertiary))] truncate">{ut.note}</div>
                </div>
                <Upload className="w-3.5 h-3.5 text-[hsl(var(--text-dim))] shrink-0 ml-auto" />
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[hsl(var(--border))] shrink-0">
          <div className="flex items-center gap-1.5 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm px-2 py-1 flex-1 max-w-56">
            <Search className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search datasets..."
              className="flex-1 bg-transparent text-[11px] text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-dim))] outline-none"
            />
          </div>
          <div className="flex items-center gap-1">
            {['all', 'geotiff', 'vector', 'csv'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`filter-btn ${filterType === t ? 'filter-btn-active' : ''} uppercase`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {['all', 'ready', 'processing', 'error'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`filter-btn ${filterStatus === s ? 'filter-btn-active' : ''}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Dataset list */}
        <div className="flex-1 overflow-y-auto">
          <table className="data-table w-full">
            <thead className="sticky top-0 bg-[hsl(var(--surface-1))]">
              <tr>
                <th className="pl-4">Dataset</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Status</th>
                <th className="pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ds => {
                const sc = STATUS_CONFIG[ds.status];
                const StatusIcon = sc.icon;
                return (
                  <tr
                    key={ds.id}
                    onClick={() => setSelected(ds)}
                    className={`cursor-pointer ${selected?.id === ds.id ? 'bg-[hsl(36_88%_48%/0.05)]' : ''}`}
                  >
                    <td className="pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{TYPE_ICONS[ds.type]}</span>
                        <div>
                          <div className="text-[11px] font-medium text-[hsl(var(--text-primary))] font-mono">{ds.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {ds.tags.slice(0, 3).map(t => (
                              <span key={t} className="text-[9px] px-1 py-0.5 rounded-sm bg-[hsl(var(--surface-3))] text-[hsl(var(--text-dim))]">{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-[10px] uppercase font-medium text-[hsl(var(--text-tertiary))]">{ds.type}</span>
                    </td>
                    <td>
                      <span className="text-[11px] font-mono text-[hsl(var(--text-secondary))]">{ds.size}</span>
                    </td>
                    <td>
                      <span className="text-[10px] text-[hsl(var(--text-tertiary))]">{ds.uploadedAt}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon className={`w-3 h-3 ${sc.color}`} />
                        <span className={`text-[10px] font-medium ${sc.color}`}>{sc.label}</span>
                        {ds.status === 'processing' && ds.progress !== undefined && (
                          <div className="w-16 progress-track">
                            <div className="progress-fill bg-[hsl(var(--amber))]" style={{ width: `${ds.progress}%` }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="pr-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); toast.success('Download started', { description: ds.name }); }}
                          className="btn-ghost p-1"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); deleteDataset(ds.id); }}
                          className="btn-ghost p-1 text-[hsl(var(--red))] hover:bg-[hsl(0_68%_48%/0.1)]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[hsl(var(--text-tertiary))] text-sm">
                    No datasets match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail panel ─────────────────────────────────── */}
      {selected && (
        <div className="w-64 border-l border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] flex flex-col shrink-0 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[hsl(var(--border))] shrink-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{TYPE_ICONS[selected.type]}</span>
              <div className="section-label">Dataset Details</div>
            </div>
            <div className="text-[11px] font-medium text-[hsl(var(--text-primary))] font-mono break-all leading-tight mt-1">
              {selected.name}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Status */}
            <div>
              <div className="section-label mb-1.5">Status</div>
              <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-sm ${STATUS_CONFIG[selected.status].bg}`}>
                {(() => { const Ic = STATUS_CONFIG[selected.status].icon; return <Ic className={`w-3.5 h-3.5 ${STATUS_CONFIG[selected.status].color}`} />; })()}
                <span className={`text-[11px] font-medium ${STATUS_CONFIG[selected.status].color}`}>{STATUS_CONFIG[selected.status].label}</span>
              </div>
              {selected.status === 'processing' && selected.progress !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-[9px] text-[hsl(var(--text-tertiary))] mb-1">
                    <span>Processing</span>
                    <span>{selected.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill bg-[hsl(var(--amber))]" style={{ width: `${selected.progress}%` }} />
                  </div>
                </div>
              )}
              {selected.status === 'error' && (
                <p className="text-[10px] text-[hsl(var(--red))] mt-1.5 leading-relaxed">
                  Processing failed. Check file format and size limits.
                </p>
              )}
            </div>

            {/* Metadata */}
            <div>
              <div className="section-label mb-1.5">Metadata</div>
              <div className="space-y-1.5">
                {[
                  ['Type', selected.type.toUpperCase()],
                  ['Size', selected.size],
                  ['Uploaded', selected.uploadedAt],
                  selected.crs ? ['CRS', selected.crs] : null,
                  selected.bands ? ['Bands', String(selected.bands)] : null,
                  selected.resolution ? ['Resolution', selected.resolution] : null,
                  selected.rows ? ['Records', selected.rows.toLocaleString()] : null,
                ].filter(Boolean).map((item) => {
                  const [k, v] = item as [string, string];
                  return (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-[hsl(var(--text-tertiary))]">{k}</span>
                      <span className="text-[hsl(var(--text-secondary))] font-mono">{v}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="section-label mb-1.5">Description</div>
              <p className="text-[11px] text-[hsl(var(--text-secondary))] leading-relaxed">{selected.description}</p>
            </div>

            {/* Tags */}
            {selected.tags.length > 0 && (
              <div>
                <div className="section-label mb-1.5">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {selected.tags.map(t => (
                    <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[hsl(var(--surface-3))] border border-[hsl(var(--border))] text-[hsl(var(--text-tertiary))]">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* API connection note */}
            <div className="mangan-panel p-2 border-[hsl(36_88%_48%/0.15)]">
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-[hsl(var(--amber))] shrink-0 mt-0.5" />
                <div>
                  <div className="text-[9px] font-semibold text-[hsl(var(--amber))] uppercase mb-0.5">API Ready</div>
                  <p className="text-[9px] text-[hsl(var(--text-tertiary))] leading-relaxed">
                    Connect to FastAPI backend at <span className="font-mono text-[hsl(var(--text-secondary))">POST /api/datasets/upload</span> to enable real file processing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {selected.status === 'ready' && (
            <div className="px-3 py-2.5 border-t border-[hsl(var(--border))] space-y-1.5 shrink-0">
              <button className="btn-primary w-full justify-center text-[11px] py-1.5">
                <Activity className="w-3 h-3" />
                Run Analysis
              </button>
              <button className="btn-secondary w-full justify-center text-[11px] py-1.5">
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
