# Project Context: MANGAN-X

This document establishes the current repository state and domain context for SIH Problem Statement 26009: **Using AI/ML and Space Technology to Identify Manganese Reserves and Overcome Production Shortfalls**.

## Current Project Purpose
MANGAN-X is a decision-support cockpit and predictive dashboard for manganese mining operations. It is designed to assist engineers and geologists in:
1. Identifying new manganese prospectivity zones using satellite and geophysical datasets.
2. Predicting operational shortfalls and production bottlenecks before they occur.
3. Simulating what-if operational scenarios (e.g., increased rain, equipment downtime) to generate recovery recommendations.

## Current Tech Stack
- **Framework & Build Tools**: Vite + React 18 (TypeScript) + npm
- **Routing**: `react-router-dom` (v6)
- **State Management / Async Queries**: `@tanstack/react-query` + standard React hooks (`useState`, `useRef`, etc.)
- **Styling**: Tailwind CSS + `tailwindcss-animate` + custom index.css utility classes
- **UI Components**: `shadcn-ui` primitives built on Radix UI, `lucide-react` for icons
- **Data Visualization**: `recharts` for charts, SVG/HTML5 Canvas for GIS/Mine Map visualizations

## Existing Pages & Routes
All routes are managed inside `src/App.tsx` and rendered inside `src/components/layout/AppLayout.tsx`:
- `/dashboard`: **Command Center** — high-level KPI cards, interactive mine SVG map, production forecast chart, and active risk alerts.
- `/reserves`: **Prospectivity / Reserves** — estimated quantities, mineral occurrence indicators, drill hole assay metrics, and radar charts of geological confidence variables.
- `/satellite`: **Satellite / GIS** — mock GIS layer controller toggling Sentinel-2, Sentinel-1 SAR, DEM, NDVI, structural lineaments, and prospectivity heatmap overlays over a simulated grid canvas.
- `/production`: **Production Forecast** — detailed production target vs. forecast charts, timeline of historical output, and factors contributing to production gaps.
- `/operations`: **Mine Operations** — real-time monitoring of haul road status, blast delay lists, weather conditions, and active drill collar progress logs.
- `/equipment`: **Equipment** — health/operational statuses (operational, maintenance, idle, fault) of mining assets (excavators, dump trucks, drill rigs).
- `/risks`: **Risk Center** — safety and productivity risk matrix, active weather alerts, and hazard levels.
- `/simulator`: **Mine Simulator** — interactive simulation sliders for rainfall, truck counts, excavator performance, and shift durations with a dynamic chart showing updated predicted shortfalls.
- `/copilot`: **AI Copilot** — interactive chat assistant with pre-programmed rule-based Q&A regarding shortfalls, downtime, and operational suggestions.
- `/datacenter`: **Data Center** — mock repository/catalogue of uploaded datasets (GeoTIFF, GeoJSON, CSV) with mock upload progress indicators.
- `/reports`: **Reports** — export dashboard outputs to PDF (using `jspdf`) or Excel format (using `xlsx`).
- `/settings`: **Settings** — configuration forms for warning thresholds and placeholders for API integration credentials.

## Important Components
- `AppLayout.tsx`: Structural shell enclosing navigation Sidebar and TopBar.
- `Sidebar.tsx`: Multi-grouped navigation panel with live indicators for ML models and critical alerts.
- `KPICard.tsx`: Multi-status KPI metric wrapper showing sparks and relative performance gains/losses.
- `MineMapSVG.tsx`: Custom interactive SVG-based map overlay showing zones, equipment, drill holes, and legends without external mapping library dependencies.

## Current Data Sources & Mock Data
All application data is served locally from mock static files inside `src/data/`:
- `copilotData.ts`: Responses, quick options, and charts returned by the simulated copilot.
- `equipmentData.ts`: Fixed array of 18 trucks, excavators, and drills with operational attributes.
- `geologicalData.ts`: Details on 6 zones (Alpha-North, Beta-Central, etc.) and their drill holes.
- `mineData.ts`: Constants for mining parameters and geological statistics.
- `productionData.ts`: Time-series arrays representing past and projected output.
- `riskData.ts`: Active and potential geological/operational risks.
- `simulatorData.ts`: Equations mapping operational variable inputs to predicted daily output.

## Current Integrations
- **None**: Supabase (`@supabase/supabase-js`), HTTP Client (`axios`), and Google Generative AI (`@google/generative-ai`) are listed in `package.json` but are not configured, imported, or utilized anywhere in the codebase.
- **Geospatial mapping**: `leaflet` and `react-leaflet` are listed in `package.json` but not used; all spatial layers are simulated via Canvas/SVG drawings.

## Known Limitations
- State is volatile (in-memory React state); page refreshes reset all configurations and chat history.
- Map visualizers use mock generated matrices (using noise functions) instead of parsing true geospatial datasets (GeoTIFF/Shapefile).
- Uploading files in the Data Center simulates a network transfer without executing any server-side storage or parsing.
- AI Copilot responses are mapped via static keyword string match lookups rather than connecting to an LLM provider.
