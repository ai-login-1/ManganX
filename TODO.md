# Tasks checklist: MANGAN-X

This document registers currently active code components and tracks the integration milestones for future enhancements.

## CURRENTLY WORKING
- [x] Command Center layout & routing hooks.
- [x] Mine map SVG overlays and mock interactive tooltip hover status.
- [x] Mathematical what-if equations inside the simulator page.
- [x] Local Canvas grid generator mimicking satellite bands (ASTER, NDVI, SAR).
- [x] Local mock catalog for Data Center uploads.
- [x] Type checks and Vite bundling routines passing cleanly.

## FRONTEND IMPROVEMENTS
- [ ] Correct `@import` placement order warning in `src/index.css` (move Google Font imports to the absolute top of the stylesheet).
- [ ] Implement robust error boundary wrapper around charting panels.
- [ ] Connect existing forms in settings/operations to volatile states so changes can be tracked in memory during live runs.

## BACKEND FUTURE
- [ ] Set up Python FastAPI core workspace structure.
- [ ] Integrate SQLAlchemy/SQLModel database connector.
- [ ] Draft database schema models for:
  - `Zones` (polygon spatial boundary, prospectivity, ore quality metrics)
  - `DrillHoles` (collar latitude, longitude, assay depth, Mn grade)
  - `Equipment` (telemetry location, fuel, status, maintenance dates)
  - `DowntimeEvents` (reason logs, timestamps, duration)
- [ ] Design simulator APIs to run what-if calculations on the server instead of client-side JS math.

## GIS FUTURE
- [ ] Initialize `react-leaflet` canvas viewport inside `Satellite.tsx`.
- [ ] Connect the Leaflet map layer to a local or remote XYZ raster tile server (e.g. TiTiler).
- [ ] Serve GeoJSON boundary polygons dynamically from PostGIS spatial tables.
- [ ] Map GSI occurrences and geological contacts directly as interactive vector layers.

## ML FUTURE
- [ ] Package prospectivity classification pipelines (XGBoost/scikit-learn) for Zone scoring.
- [ ] Draft production forecast models incorporating rainfall data, downtime variables, and geological bottlenecks.
- [ ] Implement telemetry anomaly detection algorithms to flag machinery fault signatures before outages occur.

## DATA INGESTION FUTURE
- [ ] Create file upload pipeline to direct datasets (TIF, GEOJSON, CSV) to S3/MinIO Object Storage.
- [ ] Create CSV parser parsing drill-hole collar coordinates and importing rows into PostGIS coordinates database.
- [ ] Create raster handler to register new GeoTIFF inputs and trigger TiTiler indexing.
