import type { SimulatorParams, SimulatorResult } from '@/types';

export const DEFAULT_SIMULATOR_PARAMS: SimulatorParams = {
  rainfall: 42,
  equipmentAvailability: 82,
  equipmentDowntime: 36,
  blastingDelay: 1.5,
  miningRate: 1186,
  workforceAvailability: 88,
  productionTarget: 1380,
};

export function runSimulation(params: SimulatorParams): SimulatorResult {
  const {
    rainfall,
    equipmentAvailability,
    equipmentDowntime,
    blastingDelay,
    miningRate,
    workforceAvailability,
    productionTarget,
  } = params;

  // Simulate production based on parameters
  const rainfallEffect = 1 - Math.max(0, (rainfall - 20) * 0.0035);
  const equipAvailEffect = equipmentAvailability / 100;
  const downtimeEffect = 1 - Math.min(0.35, equipmentDowntime * 0.004);
  const blastEffect = 1 - Math.min(0.15, blastingDelay * 0.03);
  const workforceEffect = workforceAvailability / 100 * 0.25 + 0.75;

  const efficiency = rainfallEffect * equipAvailEffect * downtimeEffect * blastEffect * workforceEffect;
  const production = Math.round(miningRate * efficiency * 30); // monthly
  const targetMonthly = productionTarget * 30;
  const productionPct = (production / targetMonthly) * 100;
  const shortfall = Math.max(0, targetMonthly - production);
  const shortfallProb = shortfall > 0 ? Math.min(0.98, 0.3 + (shortfall / targetMonthly) * 1.5) : 0.05;

  const TOTAL_RESERVES = 12_400_000; // tonnes
  const reserveConsumption = Math.round(TOTAL_RESERVES / (production * 12));

  const baseCostPerTonne = 1850; // ₹
  const costMultiplier = 1 + (1 - efficiency) * 0.3;
  const operationalCost = Math.round((production * baseCostPerTonne * costMultiplier) / 100000); // ₹ lakhs

  const completionYears = TOTAL_RESERVES / (production * 12);
  const completionDate = new Date('2026-08-22');
  completionDate.setFullYear(completionDate.getFullYear() + Math.floor(completionYears));
  const estimatedCompletion = completionDate.getFullYear().toString();

  const recommendations: SimulatorResult['recommendations'] = [];

  if (rainfall > 35) {
    recommendations.push({ action: 'Deploy emergency drainage to Zone Alpha haul roads', impact: 4.2, priority: 'high', zone: 'Zone Alpha-North' });
  }
  if (equipmentAvailability < 85) {
    recommendations.push({ action: 'Fast-track CR-01 crusher repair; bring EX-02 into service', impact: 6.8, priority: 'high' });
    recommendations.push({ action: 'Increase Loader LD-02 shift utilization by +15%', impact: 2.4, priority: 'medium', zone: 'Zone Beta-Central' });
  }
  if (blastingDelay > 1) {
    recommendations.push({ action: 'Reschedule Blast-07 by 2 days to consolidate with Blast-08', impact: 3.1, priority: 'medium', zone: 'Zone Beta-Central' });
  }
  if (workforceAvailability < 90) {
    recommendations.push({ action: 'Activate contractor workforce for operator-critical roles', impact: 1.8, priority: 'low' });
  }
  if (recommendations.length === 0) {
    recommendations.push({ action: 'Maintain current operational tempo; continue preventive maintenance', impact: 1.2, priority: 'low' });
  }

  // Always add a strategic recommendation
  recommendations.push({ action: 'Relocate DR-01 drill rig to Zone Gamma for accelerated exploration', impact: 2.6, priority: 'medium', zone: 'Zone Gamma-East' });

  return {
    production,
    shortfallProbability: shortfallProb,
    reserveConsumption,
    operationalCost,
    estimatedCompletion,
    productionPct: Math.round(productionPct * 10) / 10,
    recommendations: recommendations.sort((a, b) => b.impact - a.impact),
  };
}

export function generateSimChartData(params: SimulatorParams) {
  const { productionTarget } = params;
  const result = runSimulation(params);
  const baseline = runSimulation({
    ...params,
    equipmentAvailability: DEFAULT_SIMULATOR_PARAMS.equipmentAvailability,
    equipmentDowntime: DEFAULT_SIMULATOR_PARAMS.equipmentDowntime,
  });

  return Array.from({ length: 30 }, (_, i) => {
    const noise = (Math.random() - 0.5) * 180;
    const trend = i < 15 ? 0 : (result.production / 30 - baseline.production / 30) * ((i - 14) / 16);
    return {
      day: i + 1,
      baseline: Math.round(baseline.production / 30 + noise),
      simulated: Math.round(result.production / 30 + trend + noise * 0.7),
      target: productionTarget,
    };
  });
}
