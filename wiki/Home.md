# Stakeport OS Wiki - Home

Welcome to the official **Stakeport OS** technical documentation wiki. Stakeport OS is an enterprise-grade administrative prototype designed to supervise, trace, and audit autonomous schema routing flows.

Use this wiki to familiarize yourself with the features, code modularity, interactive simulation tools, and systems layout of the application.

---

## 🗺️ Documentation Map

To deep-dive into specific areas of the application, browse the following wiki articles:

### 1. [Primary Dashboard Tabs](./Dashboard-Tabs.md)
Comprehensive breakdown of the five dashboard sectors:
*   **Topology Map** - Drag/pan/zoom vector viewports.
*   **Founder Governance** - Pending approvals, executive directives, initiatives, and campaign audits.
*   **Content OS Workflows** - Autonomous cron-jobs, asset builders, and compiler pipelines.
*   **Domain Agents Control** - Interactive state configurations for agent structures.
*   **Learned Insights** - Machine reinforcement loops, training parameters, analytics, and feedback scores.

### 2. [System Panels & Layout Architecture](./System-Architecture-and-Panels.md)
Guide to the cohesive three-panel responsive workspace:
*   **Left Sidebar** - Phase Switcher, Compliance Checklist, Ingress Pressure, CDN pre-caching.
*   **Central Workspace** - Sub-tabs header, Interactive Topology SVG widget, Step-by-Step Dispatch Tracer, Core Telemetry Logger.
*   **Right Sidebar** - Vortex Metadata HUD (Interrogative Parameter Inspector) and the live Notion Sim DB registry.

### 3. [Interactive Tracers & Network Degradation Simulators](./Interactive-Tracer-and-Simulators.md)
Detailed walkthroughs of the operational simulations built into the OS:
*   **The Ingress Simulator** - Adjusting frequency rates and monitoring logged data blocks.
*   **Step-by-Step Pipeline Dispatching** - Tracking payloads dynamically through custom routing checkpoints.
*   **Vector Latency Custom Calibration** - Injecting custom delays into specific pipes to model congestion.
*   **Live Database Cache Moderation** - Searching, wiping tables, and resolving escalated review packages manually.

---

## 🏛️ Operating Principles & State Management

Unlike standard informational dashboards, Stakeport OS implements a fully interactive, reactive **Client-Side State Engine** that models complex network behaviors:
*   **Phase-Aware Constraints**: Toggling the overall phase in the Left Sidebar dynamically updates other panels. For example, specific pathways (vectors) are only active or allowed during certain phases, and the compliance checklist changes to enforce phase laws.
*   **Real-Time Log Buffering**: Actions taken anywhere in the application (such as approvals, parameter configuration, tab navigation, or viewport resets) are timestamped and fed directly into the core terminal panel.
*   **Human-In-The-Loop Enforcements**: In-review assets in the simulated Notion Database require manual override commands from the operator, keeping compliance completely audited.

---

## 🚀 Technical Requirements

*   **Front End**: React 19 (TypeScript), Vite 6, Tailwind CSS 4, Motion React
*   **State Containers**: Local React Context & States with seeded static domains
*   **Icons**: Lucide React
