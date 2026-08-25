# MANGAN-X Development Rules

This document outlines the engineering and domain rules for developing on the MANGAN-X repository. All agents and developers must strictly adhere to these rules.

## Core Rules

1. **Do Not Rebuild**: Never rebuild the existing application or replace the frontend architecture.
2. **Inspect First**: Always inspect relevant existing code before making any changes.
3. **Component & Route Reuse**: Reuse existing components, layouts, and routes where possible. Do not create duplicate pages or layouts.
4. **No Duplication**: Never duplicate existing functionality. Extend or refactor existing code instead.
5. **No Inventions**: Never invent APIs, datasets, geological facts, satellite specifications, ML accuracy metrics, or backend functionality.
6. **Data Categorization**: Clearly distinguish real data, synthetic/demo data, and predictions in the UI and documentation.
7. **Geological Accuracy**: Prospectivity (predicted probability of mineral occurrence) must never be described as confirmed underground manganese reserves.
8. **Preserve Tech Stack**: Preserve the existing React + TypeScript + Vite + Tailwind + shadcn/ui architecture unless the user explicitly approves a migration.
9. **Target Backend Architecture**: The future backend architecture is defined as FastAPI + Python + PostgreSQL/PostGIS. Do not introduce other backend frameworks or databases.
10. **Geospatial Storage**: Large geospatial files (e.g., raw GeoTIFFs, COGs) must not be stored directly in PostgreSQL. Use Object Storage (e.g., S3/MinIO) and reference them via metadata/URLs.
11. **Metadata Preservation**: Always preserve dataset metadata including source, acquisition date, CRS (Coordinate Reference System), spatial resolution, and processing history.
12. **Secret Management**: Never expose secrets, API keys, or private credentials in frontend code or commit them to Git. Use environment variables and safe configuration templates.
13. **Pre-Implementation Protocol**: Before starting any significant implementation:
    - Inspect all relevant files.
    - Explain the current state of those files.
    - Propose the exact changes to be made.
    - Identify all affected files.
14. **Post-Implementation Protocol**: After making any changes:
    - Run relevant type checks (`tsc --noEmit`), tests, and builds (`npm run build`).
    - Inspect the `git diff`.
    - Report all changed files.
    - Report any errors or unresolved uncertainties.
15. **Scope Discipline**: Do not silently fix unrelated issues. Stick strictly to the task at hand.
16. **Reversibility**: Prefer small, incremental, and reversible changes over large refactors.
17. **Dependency Discipline**: Do not install new dependencies unless absolutely necessary. Explicitly explain the rationale and request approval.
18. **Integration Verification**: Do not connect to or use real external APIs or datasets until their source, licensing, and integration requirements have been verified and approved.
