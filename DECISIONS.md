# Architectural Decisions: MANGAN-X

This document logs verified architectural decisions for the MANGAN-X project.

## Verified Decisions

### 1. SPA Client-Side Architecture
- **Decision**: Build the application using React 18, Vite, and TypeScript as a single-page application.
- **Rationale**: Enables low-latency transitions between dashboard sections (Operations, Satellite GIS, Reserves, Simulator) and supports high-frequency layout updates.

### 2. Client-Side Simulation Mode
- **Decision**: All charts, maps, and AI chatbot inputs are generated in the browser using static arrays (`src/data/`) and mathematical approximations.
- **Rationale**: The project is currently configured in demo mode ("v1.0 · Balaghat Alpha") for local UI testing and presentation, requiring no external server deployments to demonstrate functionality.

### 3. Component-Based SVG Mapping
- **Decision**: Use pure React-rendered SVG paths and coordinates for the interactive mine layout mapping page (`MineMapSVG.tsx`).
- **Rationale**: Allows custom styling of zone boundaries and equipment pins that perfectly align with local viewport parameters without needing to load or initialize heavy map projection layers.

### 4. Custom Canvas Sat-Layer Rendering
- **Decision**: Use HTML5 Canvas pixel manipulation grids driven by mathematical noise algorithms to generate simulated satellite images (NDVI, ASTER TIR, SAR soil moisture) dynamically.
- **Rationale**: Demonstrates how multi-spectral and raster data would display visually without needing real-world file decoders or active tile servers.
