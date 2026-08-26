# Q-DrugTwin: Quantum & Generative AI Multi-Omic Digital Twin Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini 3.7 Flash](https://img.shields.io/badge/Google_Gemini-3.7_Flash-8E75B2.svg?logo=google)](https://ai.google.dev/)
[![Quantum QUBO](https://img.shields.io/badge/Quantum-QUBO_Optimization-0ea5e9.svg)](https://en.wikipedia.org/wiki/Quadratic_unconstrained_binary_optimization)
[![CPIC Guidelines](https://img.shields.io/badge/Pharmacogenomics-CPIC_Tier_1A-emerald.svg)](https://cpicpgx.org/)

**Q-DrugTwin** is a hybrid clinical pharmacogenomics and precision polypharmacy decision-support platform. By combining multi-omic **Patient Digital Twins**, deep learning response estimators (**ResponseNet**, **ADRNet**), biomedical knowledge graph algorithms (**PharmaGNN**), and **Quadratic Unconstrained Binary Optimization (QUBO)** quantum solvers, Q-DrugTwin enables clinicians and researchers to simulate, optimize, and safely de-risk complex pharmacotherapeutic regimens.

---

## 🔬 Key Architectural Pillars

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      Q-DrugTwin System Architecture                      │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [ Patient Multi-Omics ] ───► [ High-Dimensional State Vector Pt ]        │
│    • CYP Diplotypes             • eGFR / Organ Reserves                  │
│    • OATP1B1 / ABCB1            • Baseline Polypharmacy                  │
│                                                                          │
│                                  │                                       │
│                                  ▼                                       │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │              Hybrid AI & Quantum Optimization Pipeline             │  │
│  ├──────────────────────────────────┬─────────────────────────────────┤  │
│  │ 1. ResponseNet & ADRNet          │ 2. PharmaGNN Biomedical Graph   │  │
│  │    • Efficacy Prediction Head    │    • CYP450 Enzyme Overlap      │  │
│  │    • Toxicity / Adverse Risk     │    • Receptor Binding Conflicts │  │
│  ├──────────────────────────────────┼─────────────────────────────────┤  │
│  │ 3. Quantum QUBO Solver           │ 4. Gemini 3.7 Clinical Engine   │  │
│  │    • Combinatorial Hamiltonian   │    • Real-Time Voice Synthesis  │  │
│  │    • Simulated Annealing / QUBO  │    • Google Search Grounding    │  │
│  └──────────────────────────────────┴─────────────────────────────────┘  │
│                                  │                                       │
│                                  ▼                                       │
│  [ Calibrated Insights, Dosage Collision Map & What-If Simulations ]     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Capabilities

### 1. 🧬 Multi-Omic Patient Digital Twin Modeling
- **High-Dimensional Biomarker State Vectors**: Encapsulates renal clearance (`eGFR`), hepatic function (`ALT`, `AST`, `Bilirubin`), metabolic markers (`HbA1c`), electrolytes (`K+`, `Na+`), and cardiovascular metrics (`LVEF`, `SBP/DBP`).
- **Pharmacogenomics Engine (CPIC Tier 1A / PharmGKB)**: Evaluates loss-of-function/gain-of-function diplotypes (`CYP2C9`, `CYP2D6`, `CYP2C19`, `SLCO1B1`, `VKORC1`, `HLA-B*5701`) with actionable dose reduction or alternative recommendations.

### 2. ⚛️ Hybrid Quantum QUBO Polypharmacy Optimization
- **Mathematical Hamiltonian Formulation**: Formulates multi-drug candidate selection into an energy minimization problem:
  $$\mathcal{H}(x) = -\alpha \sum_{i} E_i x_i + \beta \sum_{i} T_i x_i + \gamma \sum_{i < j} J_{ij} x_i x_j + \lambda \left( \sum_i x_i - K \right)^2$$
  - $E_i$: Efficacy score of candidate therapy $i$
  - $T_i$: Adverse drug reaction (ADR) risk penalty
  - $J_{ij}$: Off-diagonal pairwise drug-drug interaction penalty matrix
  - $\lambda$: Exact target regimen cardinality constraint
- **Simulated Quantum Annealing & Classical Fallbacks**: Explores non-convex combinatorial energy landscapes to discover optimal, synergistic drug combinations with minimal metabolic collision.

### 3. 🕸️ Interactive Biomedical Knowledge Graph (PharmaGNN)
- Visualizes 120+ drug entities, target receptors, and metabolic pathways in an interactive, force-directed SVG graph.
- Filter by metabolic enzymes (`CYP3A4`, `CYP2C9`, `CYP2D6`), transporter pathways (`OATP1B1`, `P-gp`), and interaction severities (`Contraindicated`, `High`, `Moderate`).

### 4. 🕒 Automated Dose DDI Collision & Timing Analysis
- Analyzes daily medication schedules against dynamic pharmacokinetic half-lives and absorption windows.
- Automatically flags co-administration timing collisions (e.g., chelation, synergistic diuresis, dual RAAS hyperkalemic spikes) and generates suggested hourly time offsets.

### 5. 🤖 Grounded Generative AI with Google Gemini 3.7 Flash
- **Google Search Grounding**: Real-time retrieval of peer-reviewed clinical literature (PubMed, NEJM, KDIGO 2024, ADA 2025 guidelines) to justify recommendations with verifiable citations.
- **Gemini Live Voice & Multimodal Audio**: Low-latency conversational voice reasoning and audio transcription for clinical consultations.
- **Explainable AI (XAI) & Local SHAP Attribution**: Decomposes feature importance (e.g., `eGFR`, `HbA1c`, `CYP2C19 *2/*2`) with calibrated confidence intervals ($\pm 2.2\%$).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling & UI** | [Tailwind CSS 4.1](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), [Motion (Framer Motion)](https://motion.dev/) |
| **Data Visualization** | [Recharts](https://recharts.org/), Custom Interactive SVG Force-Directed Graphs, Multi-Axis Radars |
| **Backend & Runtime** | [Node.js](https://nodejs.org/), [Express 4.21](https://expressjs.com/), `esbuild` CJS bundler |
| **AI & LLM Services** | [@google/genai](https://www.npmjs.com/package/@google/genai) (`gemini-3.7-flash`, `gemini-3.1-flash-live-preview`, `gemini-3.1-flash-tts-preview`) |
| **Optimization Algorithms** | Quadratic Unconstrained Binary Optimization (QUBO), Simulated Annealing, Classical Bitwise State Enumeration |

---

## 📂 Project Structure

```
q-drugtwin/
├── server.ts                       # Express full-stack entry point & Gemini API proxy
├── vite.config.ts                  # Vite config with manual chunk optimization
├── package.json                    # Project dependencies & production scripts
├── metadata.json                   # Application metadata & permissions
├── src/
│   ├── main.tsx                    # React application entry point
│   ├── App.tsx                     # Main layout & lazy-loaded view router
│   ├── types.ts                    # Global TypeScript interfaces & clinical models
│   ├── index.css                   # Tailwind CSS global styles
│   ├── data/
│   │   └── mockDatabase.ts         # Clinical patients, candidate drugs, and DDI catalog
│   ├── services/
│   │   ├── apiService.ts           # REST API client with local simulation fallback
│   │   ├── quantumEngine.ts        # QUBO Hamiltonian generator & annealing solver
│   │   └── medicationScheduleService.ts # Local schedule persistence & timing engine
│   ├── utils/
│   │   ├── doseDdiConflictAnalyzer.ts   # Pharmacokinetic collision & schedule scanner
│   │   ├── dosageToleranceChecker.ts    # Organ-specific renal/hepatic dose safety
│   │   └── riskNotificationAnalyzer.ts # Proactive clinical risk & telemetry alerts
│   └── components/
│       ├── common/                 # Reusable badges, gauges, confidence indicators
│       ├── layout/                 # Branded navigation header, sidebar, footer
│       ├── views/                  # 12 specialized clinical workspace views
│       ├── graph/                  # Interactive biomedical knowledge graph
│       ├── simulation/             # Scenario comparison & execution history
│       └── modals/                 # Literature grounding & voice consult modals
```

---

## 🚀 Quickstart & Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Google Gemini API Key (optional for live AI grounding and voice dialogue; built-in simulation fallback is included)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/q-drugtwin.git
cd q-drugtwin
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://0.0.0.0:3000` with hot asset serving and backend endpoints.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📋 Comprehensive View Guide

| View | Description |
|---|---|
| **Home Portal** | High-level clinical command center with workflow quick actions and patient overview. |
| **Clinical Overview** | Digital Twin metrics, organ reserve indicators, and active biomarker trends. |
| **Patient Directory** | Multi-patient cohort browser with risk tiering and one-click twin switching. |
| **Digital Twin Lab** | Deep-dive multi-omic profile, CYP diplotypes, and lab trajectory graphs. |
| **Medication Workspace** | Regimen manager with dynamic dose schedules, collision badges, and tolerance safety. |
| **Simulation Lab** | Interactive candidate drug testbed with organ impact radars and multi-scenario what-if testing. |
| **Biomedical Graph** | 2D interactive node-link network of drug interactions, metabolic enzymes, and target receptors. |
| **Quantum Optimizer** | QUBO Hamiltonian tuner for algorithmic candidate therapy selection. |
| **AI Assistant** | Voice & text clinical reasoning orchestrator with Google Search grounded citations. |
| **Explainable AI (XAI)** | Local SHAP waterfall charts, counterfactual what-if sandbox, and confidence calibration. |
| **Scenario Matrix** | Side-by-side comparative table evaluating efficacy, ADR risk, and cost metrics. |
| **Model Performance** | Calibration curves, AUROC/AUPRC benchmarks, and conformal prediction coverage metrics. |

---

## ⚖️ Clinical Disclaimer

> **Research & Clinical Decision Support Notice**: Q-DrugTwin is intended strictly as an educational and research-grade clinical decision-support simulation tool. All pharmacokinetic models, QUBO optimization scores, and Gemini AI outputs must be evaluated and validated by licensed medical professionals before making any actual clinical or prescription decisions.

---

## 📄 License

This project is distributed under the **Apache-2.0 License**. See the `LICENSE` file for details.
