// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Mine {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  totalArea: number; // hectares
  activeZones: number;
  estimatedReserves: number; // million tonnes
  annualCapacity: number; // thousand tonnes
  status: 'active' | 'maintenance' | 'standby';
}

export interface GeologicalZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'active' | 'exploration' | 'predicted' | 'depleted';
  manganeseProb: number; // 0-1
  oreGrade: number; // % Mn
  estimatedQuantity: number; // thousand tonnes
  confidence: number; // 0-1
  depth: number; // metres
  area: number; // hectares
  indicators: {
    geophysical: number;
    geochemical: number;
    satellite: number;
    historical: number;
  };
  priority: 'high' | 'medium' | 'low';
  drillHoles: DrillHole[];
}

export interface DrillHole {
  id: string;
  lat: number;
  lng: number;
  depth: number;
  mnGrade: number;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface ProductionRecord {
  date: string;
  planned: number; // tonnes
  actual: number; // tonnes
  equipmentDowntime: number; // hours
  rainfall: number; // mm
  blastingDelay: number; // hours
  workforcePct: number; // % of full capacity
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
  target: number;
  isHistorical: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  type: 'excavator' | 'loader' | 'truck' | 'drill' | 'crusher' | 'conveyor';
  lat: number;
  lng: number;
  status: 'operational' | 'maintenance' | 'idle' | 'fault';
  utilization: number; // %
  downtime: number; // hours last 30d
  maintenanceStatus: 'ok' | 'due' | 'overdue';
  failureProbability: number; // 0-1
  nextMaintenanceDate: string;
  operatingHours: number;
  fuelEfficiency: number; // %
  lastInspection: string;
  alerts: string[];
}

export interface RiskItem {
  id: string;
  category: 'production' | 'equipment' | 'weather' | 'blasting' | 'exploration' | 'operational';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  probability: number; // 0-1
  impact: number; // % production impact
  affectedZone: string;
  predictedDate: string;
  factors: { label: string; impact: number }[];
  recommendedAction: string;
  status: 'active' | 'monitoring' | 'mitigated';
}

export interface SatelliteLayer {
  id: string;
  name: string;
  date: string;
  min: number;
  max: number;
  unit: string;
  colorScale: string[];
}

export interface SatellitePixel {
  lat: number;
  lng: number;
  ndvi: number;
  soilMoisture: number;
  rainfall: number;
  landTemp: number;
  rgb: [number, number, number];
}

export interface SimulatorParams {
  rainfall: number; // mm/month
  equipmentAvailability: number; // %
  equipmentDowntime: number; // hours/month
  blastingDelay: number; // days
  miningRate: number; // tonnes/day
  workforceAvailability: number; // %
  productionTarget: number; // tonnes/month
}

export interface SimulatorResult {
  production: number; // tonnes
  shortfallProbability: number;
  reserveConsumption: number; // months remaining
  operationalCost: number; // ₹ lakhs
  estimatedCompletion: string;
  productionPct: number;
  recommendations: SimulatorRecommendation[];
}

export interface SimulatorRecommendation {
  action: string;
  impact: number; // % improvement
  priority: 'high' | 'medium' | 'low';
  zone?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  charts?: CopilotChart[];
  sources?: string[];
  confidence?: number;
  actions?: string[];
}

export interface CopilotChart {
  type: 'bar' | 'line' | 'area';
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  xKey: string;
}

export interface KPIMetric {
  label: string;
  value: string;
  unit?: string;
  change?: number;
  changeLabel?: string;
  status: 'normal' | 'warning' | 'critical' | 'good';
  trend?: number[];
}
