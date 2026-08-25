import type { CopilotMessage } from '@/types';

// Predefined Q&A responses for the MANGAN-X Copilot
interface CopilotResponse {
  patterns: string[];
  response: string;
  confidence: number;
  sources: string[];
  actions?: string[];
  chartData?: {
    type: 'bar' | 'line' | 'area';
    title: string;
    data: Record<string, unknown>[];
    dataKey: string;
    xKey: string;
  };
}

export const COPILOT_RESPONSES: CopilotResponse[] = [
  {
    patterns: ['production fall', 'production drop', 'shortfall', 'why production', 'next month'],
    response: `**Production shortfall analysis for next 30 days:**

The ML forecast model (XGBoost ensemble) identifies **3 primary risk drivers** contributing to a projected **-14.2% shortfall** against the monthly target:

1. **Crusher CR-01 offline** — eliminates ~9% of north circuit capacity. Emergency repair estimated at 6-8 days.
2. **Excavator EX-03 maintenance** — reduces bench loading capacity by 18% in Zone Alpha-North.
3. **Monsoon intensification** — IMD forecast for 35-45mm event (Aug 26-28) will halt haul operations for ~18 hours.

**Predicted outcome:** 38,840 tonnes vs. 41,400 tonne target.

**Shortfall probability: 84%** (high confidence, 3-factor convergence).

To recover: prioritize CR-01 repair + activate south circuit haul bypass. Expected recovery: +6.8% production.`,
    confidence: 0.89,
    sources: ['Production ML Model v2.4', 'Equipment SCADA Feed', 'IMD Weather API', 'Historical Production DB'],
    actions: ['View Risk Center', 'Run Simulator', 'View Equipment Status'],
    chartData: {
      type: 'area',
      title: '30-Day Production Forecast',
      data: Array.from({ length: 30 }, (_, i) => ({
        day: `D+${i + 1}`,
        predicted: Math.round(1380 * (0.86 + Math.sin(i * 0.2) * 0.04) + (Math.random() - 0.5) * 60),
        target: 1380,
      })),
      dataKey: 'predicted',
      xKey: 'day',
    },
  },
  {
    patterns: ['highest reserve', 'best zone', 'most manganese', 'reserve probability', 'which zone'],
    response: `**Reserve Intelligence Summary:**

Based on the integrated geological model (satellite + geophysical + geochemical + historical drilling):

| Zone | Mn Prob | Ore Grade | Est. Quantity |
|------|---------|-----------|---------------|
| **Zone Alpha-North** | **94%** | **48.2% Mn** | **2,840 kt** |
| Zone Beta-Central | 87% | 44.6% Mn | 1,960 kt |
| Zone Gamma-East | 72% | 38.4% Mn | 1,240 kt |
| Zone Delta-South | 63% | 35.8% Mn | 890 kt |

**Zone Alpha-North** has the highest confidence reserve, currently active with 3 drill holes confirming high-grade ore at 38-51m depth.

**Recommendation:** Zone Gamma-East shows elevated satellite NDVI anomaly suggesting unexplored subsurface potential. Additional 2 drill holes recommended.`,
    confidence: 0.94,
    sources: ['Geological Model v3.1', 'Satellite NDVI Layer', 'Drill Core Database', 'Geophysical Survey 2025'],
    actions: ['View Reserve Intelligence', 'View Satellite Imagery'],
    chartData: {
      type: 'bar',
      title: 'Zone Reserve Probability (%)',
      data: [
        { zone: 'Alpha-N', prob: 94, quantity: 2840 },
        { zone: 'Beta-C', prob: 87, quantity: 1960 },
        { zone: 'Gamma-E', prob: 72, quantity: 1240 },
        { zone: 'Delta-S', prob: 63, quantity: 890 },
        { zone: 'Epsilon-W', prob: 51, quantity: 620 },
      ],
      dataKey: 'prob',
      xKey: 'zone',
    },
  },
  {
    patterns: ['equipment downtime', 'causing downtime', 'most downtime', 'equipment problem'],
    response: `**Equipment Downtime Analysis — Last 30 Days:**

**Top contributors to production loss:**

1. **CR-01 (Primary Crusher)** — 36 hrs downtime, **CRITICAL fault** (jaw plate fracture). Estimated production loss: 9.2%.
2. **EX-03 (Excavator)** — 72 hrs in maintenance. Failure probability: 72%. Production impact: 4.8%.
3. **TR-03 (Haul Truck)** — 48 hrs idle/fault. Engine oil pressure issue. Impact: 2.1%.
4. **EX-02 (Excavator)** — 24 hrs. Hydraulic variance detected. Impact: 1.4%.

**Total downtime production loss: ~17.5%** above baseline.

**Predictive alert:** EX-03 at 72% failure probability — without intervention, secondary failure likely within 14 days. Estimated additional cost: ₹28 lakhs.

**Priority action:** CR-01 jaw plate replacement (estimated ₹8.4 lakhs), followed by EX-03 boom cylinder seal.`,
    confidence: 0.92,
    sources: ['Equipment SCADA System', 'Predictive Maintenance ML', 'Maintenance Work Order DB'],
    actions: ['View Equipment Page', 'Schedule Maintenance'],
    chartData: {
      type: 'bar',
      title: 'Equipment Downtime (hours, last 30 days)',
      data: [
        { id: 'EX-03', hours: 72 },
        { id: 'TR-03', hours: 48 },
        { id: 'CR-01', hours: 36 },
        { id: 'LD-02', hours: 31 },
        { id: 'EX-02', hours: 24 },
        { id: 'DR-01', hours: 22 },
      ],
      dataKey: 'hours',
      xKey: 'id',
    },
  },
  {
    patterns: ['100%', 'achieve target', 'meet target', 'what should', 'recommend', 'improve production'],
    response: `**Action Plan to Achieve 100% Production Target:**

The recommendation engine has analyzed current mine state and identified the following ranked interventions:

**Immediate (0-3 days):**
1. ✅ **Repair CR-01 crusher** → +9.0% production recovery (₹8.4L investment)
2. ✅ **Resume EX-03 operations** → +4.8% after boom seal replacement (₹3.2L)
3. ✅ **Increase LD-02 shift utilization +15%** → +2.4%

**Short-term (3-7 days):**
4. ✅ **Relocate DR-02 to Zone Beta-Central** → +1.8% blast efficiency
5. ✅ **Reschedule Blast-07 by 2 days** → +3.1% blasting throughput
6. ✅ **Deploy 2 additional dewatering pumps** → Prevent -4% monsoon impact

**Expected combined improvement: +21.1%** (from current 86% → 104% of target)

**Net cost of interventions: ₹19.8 lakhs | Revenue recovery: ₹142 lakhs**
**ROI: 617%**`,
    confidence: 0.87,
    sources: ['Recommendation Engine v1.8', 'Cost Model DB', 'Historical Intervention DB'],
    actions: ['Run Simulator', 'View Risk Center', 'Generate Report'],
  },
  {
    patterns: ['simulate rainfall', 'rainfall increase', '20% rainfall', 'weather impact'],
    response: `**Simulated: +20% Rainfall Scenario**

Running simulation with rainfall: **50.4mm/month** (current: 42mm, +20%):

**Production Impact:**
- Haul road degradation: -5.2% production
- Bench slope saturation risk: ELEVATED
- Drill operations: Partial halt (8 hrs/week)
- Blasting frequency: -18% (dewatering required)

**Revised Production Forecast:**
- Current scenario: 1,186 t/day
- Simulated scenario: **1,028 t/day (-13.3%)**
- Monthly target gap: **10,860 tonnes**

**Risk escalation:** Weather risk category upgrades from HIGH → CRITICAL.

**Mitigation recommendations:**
1. Pre-position 3 water tankers for road dust suppression
2. Reinforce Zone Alpha bench drainage (pre-monsoon investment)
3. Shift blasting to morning windows when rainfall likelihood is lowest

*Use the Mine Simulator for interactive parameter adjustment →*`,
    confidence: 0.83,
    sources: ['Production ML Model', 'IMD Historical Data', 'Geotechnical Slope Model'],
    actions: ['Open Mine Simulator', 'View Satellite Intelligence'],
  },
];

export function getCopilotResponse(userInput: string): CopilotResponse {
  const lower = userInput.toLowerCase();
  
  for (const resp of COPILOT_RESPONSES) {
    if (resp.patterns.some(p => lower.includes(p))) {
      return resp;
    }
  }
  
  // Default response
  return {
    patterns: [],
    response: `I've analyzed your query against the MANGAN-X operational database.

**Available intelligence areas:**
- Production forecasts and shortfall analysis
- Reserve probability by zone
- Equipment health and predictive maintenance
- Risk assessment and mitigation recommendations
- What-if scenario simulation

**Try asking:**
- "Why is production expected to fall next month?"
- "Which zone has the highest reserve probability?"
- "Which equipment is causing the most downtime?"
- "What should we change to achieve 100% production target?"
- "Simulate a 20% rainfall increase"

I draw from the integrated mine data model, ML forecasts, satellite intelligence, and equipment SCADA feeds.`,
    confidence: 0.72,
    sources: ['MANGAN-X Knowledge Base'],
    actions: ['View Dashboard', 'Run Simulator'],
  };
}

export const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: `**MANGAN-X Copilot initialized.**

I have access to real-time mine operations data, satellite intelligence, geological models, equipment telemetry, and ML forecasts for Balaghat Alpha mine.

**Current critical alerts:**
- 🔴 CR-01 Crusher fault — production impact active
- 🔴 EX-03 offline — Zone Alpha loading reduced  
- 🟡 Monsoon event predicted Aug 26-28 (35-45mm)
- 🟡 Zone Beta blast schedule delayed 3 days

How can I assist you today?`,
    timestamp: new Date(),
    confidence: 1.0,
    sources: ['Live Operations Feed'],
  },
];
