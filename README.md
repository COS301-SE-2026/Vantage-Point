# Vantage Point

> **Spatial Intelligence Platform for Competitive Gamers**

Transform your gameplay through advanced positioning analysis. Move beyond K/D ratios and discover the data-driven insights that separate top-tier players from the rest.

---

## About

Vantage Point is a spatial intelligence platform designed for competitive gamers to move beyond traditional surface-level statistics like Kill/Death ratios. By transforming raw coordinate data from real-time matches into actionable insights, it identifies positioning errors and failing engagement patterns to help players visualize and correct their gameplay.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Spatial Tracking Engine** | Processes (x,y) coordinate data for player deaths and kills across match timelines |
| **Interactive 2D Map Overlays** | Renders dynamic game maps (e.g., Summoner's Rift) with plottable data points |
| **AI Positioning Coach** | Machine learning model that predicts optimal positions by comparing to professional win patterns |
| **Ghost Player Overlay** | D3.js visualization showing recommended position with vector arrows for suggested movement |
| **Clustering Pattern Recognition** | K-Means clustering identifies "recurrent mistake" clusters and categorizes playstyles |
| **Predictive Analytics** | Random Forest models predict probability of death at different map positions |

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | FastAPI (Python) | Data processing, vector calculations, API rate limiting, ML inference |
| **Frontend** | React | Interactive dashboard |
| | D3.js | Coordinate-accurate map overlays |
| **Database** | PostgreSQL | Match histories and spatial benchmarks |
| **Data Science** | Pandas | Data manipulation |
| | Scikit-learn | K-Nearest Neighbors for finding winning snapshots |
| | Random Forest | Risk prediction models |
| | K-Means | Map clustering and area identification |
| **Infrastructure** | AWS (S3, Lambda) | Serverless data fetching and storage |
