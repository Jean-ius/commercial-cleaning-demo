# Commercial Cleaning Client Demo (CleanCommand Pro)

A high-converting, productized B2B sales and estimating platform built specifically for commercial cleaning & janitorial companies to demonstrate to potential clients.

This repository contains the complete **Client Demo** system, including:
- **Internal Sales Opportunities CRM Hub**: Centralized `LeadRecord` architecture, `+ New Lead` modal with progressive disclosure, executive 15-column table, and interactive pipeline stage controls (`NEW` → `QUALIFIED` → `WALKTHROUGH` → `PROPOSAL` → `WON` / `LOST`).
- **Instant B2B Rate Estimator**: Square-footage slider (1,000 – 100,000+ sq ft), 6 specialized facility sectors, 6 service frequencies, and periodic add-on services with active lead context.
- **ISSA 540 Workloading Engine**: Real-time production rates, labor hour calculations, crew sizing, and price-per-visit breakdown.
- **Internal Walkthrough Scheduler**: Dedicated scheduling modal updating walkthrough status independently of pipeline state.
- **4-Sheet Google Sheets CRM Backend**: In-place updates across `Leads` (15 executive columns), `Lead Details` (full LeadRecord persistence), `Settings`, and `Activity Log` (audit trail).
- **Commercial Proposal Generator**: Printable 1-page executive Scope of Work proposal with pre-generation completeness validation, editable signer info, and dual signature blocks.
- **Loom Sales Pitch Toolbar**: Live prospect personalization toolbar (business name, metro city, phone, email, and brand color presets for Dallas, Atlanta, Sydney, Chicago) for 60-second video audits.
- **Implementation Packages Showcase**: 4 productized implementation tiers ($1,200 to $5,200+) and zero-database architecture walkthrough.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🛠️ Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Executive Corporate High-Contrast Design)
- **Icons**: Lucide React
- **Data Layer**: Zero-database architecture with Google Apps Script Webhook integration

---

## 🎥 Loom Sales Pitch Mode
The top floating toolbar lets you personalize the demo live during prospect video audits:
1. Enter the target client's **Business Name**, **City/Metro**, **Phone**, **Email**, and **Brand Color**.
2. Or click one of the quick presets (*Dallas*, *Atlanta*, *Sydney*, *Chicago*).
3. The navbar, hero, rate estimator, and proposal generator update immediately.
4. Click **Hide for Video** to record a clean presentation without the toolbar.

---

## 📄 License
Commercial Client Demo — Private / Proprietary.
