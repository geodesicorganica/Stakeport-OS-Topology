# 🏛️ System Panels & Layout Architecture

Stakeport OS is engineered with a high-density, horizontal tri-panel workspace design, enabling zero-flicker state monitoring and seamless navigation without persistent page reloads.

---

## 🎨 Layout Overview

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                                      STAKEPORT OS                                                       |
+--------------------------+--------------------------------------------------------------+-------------------------------+
|  PANEL 1: CONTROL SIDE   |  PANEL 2: MAIN SECTOR                                        |  PANEL 3: HUD & DATABASE     |
|                          |                                                              |                               |
|  - Phase SWITCH (01-04)  |  +--------------------------------------------------------+  |  - Parameter Inspector HUD    |
|  - Phase checklist       |  | Sub-Sector Selection Tabs (Topology, Founder, etc.)    |  |   (Interactive details of     |
|  - Ingress Rate slider   |  +--------------------------------------------------------+  |    selected Nodes & Pathways) |
|  - Constants (CDN edge)  |  | [Main Tab Display Sector: Canvas or Grid view]         |  |                               |
|                          |  +--------------------------------------------------------+  |  - Notion Relational DB Sim   |
|                          |  | LOG BUFFERS               | Vector Latency Registry     |  |   (In-memory records,        |
|                          |  |                           | (Degradation sliders)       |  |    manual allow/purge        |
|                          |  +---------------------------+-----------------------------+  |    escalations handler)       |
+--------------------------+--------------------------------------------------------------+-------------------------------+
```

---

## 1. Left Control Panel: Infrastructure & Constants
Located on the far left, this panel dictates the active operating profile of the system:
*   **Aqueous Phase Switcher**: A vertical checklist containing standard phases: `CRAWL` (Manual security gates), `WALK` (Relational Notion sync), `RUN` (Automated scans & telemetry logs), and `FULL OPS` (Decentralized redundancy). Pressing a phase issues a system-wide re-compilation, updating available pipelines, check constraints, and network routing allowances.
*   **Phase Compliance Rules Check**: A dynamic requirement list that updates reactively on phase changes. Users can directly tick compliance goals to mock audit milestones.
*   **Ingress rate Slider**: Custom-tune active payload frequency (`50` to `2500` elements/min). Updates are pushed immediately to the core logging stream.
*   **Local CDN Precache Toggle**: Manages edge caches (`OPTIMISTIC` or `SAFE-CHECK`) supporting dynamic payload delivery.

---

## 2. Central Workspace Panel: Visualizations & Telemetry Consoles
The primary workspace hosting active visualizer windows, tab containers, and telemetry monitors:
*   **Interactive Topology Canvas**:
    *   Constructed with SVG. Renders active nodes (`Content`, `NotionDB`, `Governance`, `RiskRouting`, `Distribution`).
    *   Features drag-panning, scroll-zooming, full-viewport mapping expansion, and detailed hover diagnostics.
*   **Step-by-step pipeline dispatch tracer**:
    *   Prominently positioned above the telemetry terminal when the `Topology Map` tab is active.
    *   Lets operators manually advance transaction packets step-by-step through the layout path.
    *   *Safe-State Guard*: Completed packet runs yield clean staging flags (`PENDING` or `STAGED_FOR_REVIEW`) awaiting formal auditing, blocking unverified autodeploys.
*   **Telemetry Logs Terminal**:
    *   A simulated scrolling CRT unix shell output at the bottom left of the middle panel.
    *   Allows choosing specific filters: `ALL CHANNELS`, `INFO`, `ALERTS`, or `SUCCESS SIGNALS`.
    *   Has an inline flush/clear override to clear terminal scroll memory.
*   **Vector Latency Registry**:
    *   A detailed layout mapping table with interactive sliders.
    *   Lets administrators inject custom degradation weight (delay lag in milliseconds) into connection pathways to model network load tolerances.

---

## 3. Right HUD Panel: Inspections & Relational Database Simulator
The diagnostics and data administration center:
*   **Vortex Metadata HUD (Parameter Inspector)**:
    *   Interrogates node states, backlog levels, audit latencies, caching status, and security compliance tiers.
    *   *Governance Strictness Selector*: Selectable strictness protocols on the `Governance` node (`low`, `medium`, `strict`), altering human verification bounds.
*   **Notion Sim DB Core (Database Core registry)**:
    *   A continuous live list showing loaded payloads, schemas, and media items.
    *   Features inline search, filter keys, and a "Wipe Table" memory-override option.
    *   *Escalation Intervention Hooks*: When incoming high-risk files enter an `IN_REVIEW` state, interactive actuators (**Allow Pass** and **Reject & Purge**) appear, allowing operators to manually audit or delete threat vectors instantly.
