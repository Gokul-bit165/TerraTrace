# TerraTrace // ORBIT
### Evidence-First Earth Observation Intelligence Workstation

[![SIH-2024](https://img.shields.io/badge/SIH-2024-orange.svg)](https://sih.gov.in)
[![Problem-Statement](https://img.shields.io/badge/MoD%20%2F%20DGIS-SIH26227-blue.svg)](https://sih.gov.in)
[![Status](https://img.shields.io/badge/Prototype-Active-success.svg)]()
[![Stack](https://img.shields.io/badge/Frontend-ES6%20Modules%20%7C%20Vanilla%20CSS-green.svg)]()
[![Operation](https://img.shields.io/badge/Deployment-Air--Gapped%20%2F%20Offline-lightgrey.svg)]()

> **"Don't make the AI answer the analyst. Make the AI build the evidence chain."**  
> **ORBIT** is an evidence-first satellite intelligence workstation prototype built for **Smart India Hackathon (SIH 2024)** addressing Problem Statement **SIH26227** for the **Ministry of Defence (MoD) / Indian Army (DGIS)**.

---

## ⚡ How to Run

Because the application uses native **JavaScript ES6 Modules** (`<script type="module">`), browsers require it to be served over HTTP rather than opened as a local `file://` URL (to prevent CORS restrictions).

### Option 1: Using Python (Recommended — No installation needed if Python is present)

Open PowerShell / Terminal in the project root directory and run:

```bash
python -m http.server 8000
```

Now open your browser and go to:
👉 **[http://localhost:8000](http://localhost:8000)**

*(To stop the server, press `Ctrl + C` in the terminal).*

---

### Option 2: Using Node.js / `npx`

If you have Node.js installed, you can use any static server without installing packages globally:

```bash
npx serve .
```

or

```bash
npx http-server -p 8000
```

Then visit **`http://localhost:8000`** or the URL printed in your terminal.

---

### Option 3: VS Code / IDE Live Server Extension

1. Install the **Live Server** extension (by *Ritwick Dey*) in VS Code / Cursor / IDE.
2. Right-click [`index.html`](./index.html) in the file explorer.
3. Click **"Open with Live Server"** (or click the **"Go Live"** badge in the bottom status bar).

---

## 🎯 Problem Statement Overview (SIH26227)

- **ID**: 26227
- **Title**: *Semantic Retrieval and Multi-Temporal Change Analysis of Satellite Imagery*
- **Organization**: Ministry of Defence (MoD)
- **Department**: Indian Army (DGIS)
- **Category**: Software | **Theme**: Space Technology

### Core Mission
Earth-observation archives contain vast multi-temporal, multi-spectral, and multi-sensor imagery (Copernicus Sentinel-1/2, Landsat, ISRO Bhuvan). Analysts traditionally need to know *where* and *when* to search. ORBIT enables semantic natural language querying, image-to-image similarity matching, multi-temporal change detection, and false-alarm suppression with an auditable analyst evidence chain that operates fully **air-gapped and offline**.

---

## 🔑 Key Features & Capabilities

```
QUESTION ──► DISCOVERY ──► CHANGE TRAJECTORY ──► EVIDENCE ──► REVIEW ──► DECISION
```

1. **Semantic & Multimodal Retrieval**
   - Natural language search over imagery archives (e.g., *"newly built structures near water body"*, *"concentrations of vehicles on open terrain"*).
   - Image-to-image similarity matching and vector embedding search.
   - Spatial AOI, temporal window, and sensor/resolution filtering.

2. **Multi-Temporal Change Analysis**
   - Detects appearance, disappearance, expansion, and contraction of terrain features.
   - Multi-temporal trajectory inspection across Sentinel-1 SAR and Sentinel-2 optical imagery.
   - Automatic change classification (construction, water variation, clearance, road development).

3. **False-Alarm Suppression & Quality Masking**
   - Disregards seasonal variations, cloud/shadow cover, haze, snow, view-angle anomalies, and co-registration errors.
   - Rigorous confidence scoring prioritizing analyst precision over noisy recall.

4. **Discovery & Embedding Clustering**
   - Unsupervised grouping of analogous sites across vast geographic areas.
   - Enables one-click exploration of topologically similar anomalies without re-querying.

5. **Analyst Workflow & Audit Provenance**
   - Dual-view before/after comparison modes (Swipe, Opacity, Side-by-Side).
   - Clear evidence chains: acquisition timestamps, sensor metadata, processing history.
   - Analyst decision capture: **Confirm Change**, **Mark Uncertain**, or **Reject** with audit logging.

6. **Air-Gapped & Sovereign Deployment**
   - Built to operate in classified, high-security, air-gapped defense networks with zero external cloud dependencies.

---

## 📂 Project Architecture

```plaintext
TerraTrace/
├── index.html                 # Main workstation entry point & layout
├── README.md                  # Project documentation & run guide
├── plan.txt                   # Architectural blueprint & concept notes
├── ps.txt                     # SIH26227 problem statement details
├── HeisenBug-SIH26227.pptx    # Presentation deck
├── css/
│   ├── tokens.css             # Design tokens (colors, typography, spacing)
│   ├── layout.css             # Grid and shell layout structure
│   ├── components.css         # UI components (buttons, badges, cards, modals)
│   ├── discovery.css          # Semantic search & discovery grid styles
│   ├── change-studio.css      # Change trajectory & analyst workbench styles
│   └── animations.css         # Micro-interactions and state transitions
├── js/
│   ├── app.js                 # App initialization, routing & global listeners
│   ├── state.js               # Reactive client state management
│   ├── demo-data.js           # Mission presets, query intents & demo scenarios
│   ├── discovery.js           # Discovery view interaction and filtering logic
│   ├── discovery-data.js      # Satellite image metadata & search results
│   ├── change-studio.js       # Temporal slider, swipe viewer & decision logger
│   ├── change-data.js         # Multi-sensor change evidence records
│   └── ui-feedback.js         # Toast notifications & modal dialog handlers
└── assets/                    # Static image assets and icons
```

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5 with accessibility attributes (`aria-*`)
- **Styling**: Modern Vanilla CSS Design System with custom properties, glassmorphism, responsive flex/grid layouts, and dark military-grade theme
- **Logic**: Vanilla Modern JavaScript (ES6+ Modules, zero third-party runtime dependencies)
- **Design System**: Typography using *Inter* & *IBM Plex Mono*, high-contrast tactical dark-palette tokens

---

## 📄 License & Attribution

Developed by **Team HeisenBug** for **Smart India Hackathon 2024** under Problem Statement **SIH26227** (Ministry of Defence / Indian Army DGIS). All rights reserved.
