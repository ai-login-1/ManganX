import type { ProductionRecord, ForecastPoint } from '@/types';

// Generate 90 days of historical production data
function generateHistoricalData(): ProductionRecord[] {
  const records: ProductionRecord[] = [];
  const baseDate = new Date('2026-05-24');
  
  for (let i = 89; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    const rainfall = Math.max(0, 8 + Math.sin(i * 0.12) * 12 + (Math.random() - 0.5) * 8);
    const downtime = Math.max(0, 4 + Math.random() * 8 - rainfall * 0.3);
    const blastDelay = Math.random() > 0.8 ? Math.random() * 6 : 0;
    const planned = 1380 + Math.sin(i * 0.05) * 80;
    const efficiency = 0.88 - (downtime * 0.008) - (rainfall * 0.003) - (blastDelay * 0.02) + (Math.random() - 0.5) * 0.06;
    const actual = Math.max(0, planned * Math.min(1.05, Math.max(0.65, efficiency)));
    
    records.push({
      date: dateStr,
      planned: Math.round(planned),
      actual: Math.round(actual),
      equipmentDowntime: Math.round(downtime * 10) / 10,
      rainfall: Math.round(rainfall * 10) / 10,
      blastingDelay: Math.round(blastDelay * 10) / 10,
      workforcePct: 88 + (Math.random() - 0.5) * 12,
    });
  }
  return records;
}

export const HISTORICAL_PRODUCTION: ProductionRecord[] = generateHistoricalData();

// Generate 30-day forecast
export function generateForecast(daysAhead = 30, rainfallMod = 0, downtimeMod = 0): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const baseDate = new Date('2026-08-22');
  const target = 1380;
  
  // Last 14 days historical
  for (let i = 13; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const rec = HISTORICAL_PRODUCTION[HISTORICAL_PRODUCTION.length - 1 - i];
    if (rec) {
      points.push({
        date: rec.date,
        predicted: rec.actual,
        lower: rec.actual * 0.97,
        upper: rec.actual * 1.03,
        target,
        isHistorical: true,
      });
    }
  }
  
  // Forecast
  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    
    const trend = 0.992;
    const rainfallEffect = -0.004 * (rainfallMod / 10);
    const downtimeEffect = -0.006 * (downtimeMod / 2);
    const efficiency = Math.min(1.08, Math.max(0.60, 0.91 * Math.pow(trend, i) + rainfallEffect + downtimeEffect + (Math.random() - 0.5) * 0.02));
    const predicted = target * efficiency;
    const uncertainty = 0.03 + i * 0.002;
    
    points.push({
      date: dateStr,
      predicted: Math.round(predicted),
      lower: Math.round(predicted * (1 - uncertainty)),
      upper: Math.round(predicted * (1 + uncertainty)),
      target,
      isHistorical: false,
    });
  }
  
  return points;
}

export const PRODUCTION_FORECAST = generateForecast();

export const CONTRIBUTING_FACTORS = [
  { factor: 'Equipment Downtime', impact: -12, unit: '%' },
  { factor: 'Monsoon Rainfall', impact: -8, unit: '%' },
  { factor: 'Blasting Delays', impact: -6, unit: '%' },
  { factor: 'Mining Rate Optimization', impact: +4, unit: '%' },
  { factor: 'Workforce Availability', impact: -3, unit: '%' },
  { factor: 'Haul Road Conditions', impact: -2, unit: '%' },
];

export const PRODUCTION_KPI = {
  estimatedReserves: 12.4, // million tonnes
  currentProduction: 1186, // tonnes/day (today)
  productionTarget: 1380,
  shortfallRisk: 0.68, // probability
  equipmentAvailability: 0.82,
  activeAlerts: 7,
  ytdProduction: 284600, // tonnes
  ytdTarget: 310000,
};
