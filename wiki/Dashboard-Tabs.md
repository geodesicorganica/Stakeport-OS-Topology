# 🎛️ Primary Dashboard Tabs

The center of the Stakeport OS layout features a dynamic, sub-mounter context switcher supporting five administrative tabs. Each tab addresses an separate layer of network topology, task automation, agent configuration, or learning reinforcement.

---

## 1. Topology Map Tab (`topology`)

The primary visualization and interaction sector. It renders a clean, vector-based representation of the data ingestion pipelines and routing clusters.

*   **Interactive Viewport**: Scaled SVG with full dragging (mouse slide), customizable zooming sliders (`-` / `+`), and instant center/reset controls. Double-clicking any part of the canvas resets the viewport position.
*   **Fully Immersive Fullscreen Mode**: Clicking the `FULLSCREEN` command expands the graph canvas to occupy 100% of the browser's viewport. It can be minimized via the `EXIT` command, the escape key, or by clicking the blur backdrop overlay.
*   **Dynamic Flow Lines**: Connecting paths (vectors) feature moving dashed flows. The speed of these animations corresponds to the active latency rate configured in the latency registry.
*   **Node Selection**: Clicking any flow node registers its identifier to the global parameter inspector (Panel 3) to view technical attributes.

---

## 2. Founder Governance Tab (`founder`)

Governs strategic guidelines, reviews, and high-level campaign directives based on strict enterprise-grade standards.

*   **Pending Recommendation Packets**:
    *   Lists proposed data, operational campaigns, or infrastructure reviews awaiting human Verification.
    *   Allows operators to interactively **Approve** or **Reject** recommendations.
    *   *Hardened Operations Constraint*: Approving an action stages it in the relational databases and logs successful audit signals, but safely restricts direct automated distribution to avoid security leaks unless explicit public authorization is granted.
*   **Operating Initiatives & Campaigns**:
    *   Lists operational goals (e.g., brand-positioning alignment, landing pages, corporate brief audits) organized by active infrastructural stage metrics.
    *   Visualizes current completed milestones.

---

## 3. Content OS Workflows Tab (`contentOs`)

Supervises background automation, compilers, trackers, and content deployment lifecycles.

*   **Integration Task Pipelines**:
    *   Lists live automated pipelines, including RSS Trackers, Markdown Compilers, Notion Relational Bridges, Media Asset Builders, and Edge Synchronizers.
    *   Shows continuous polling status (e.g., `Queued`, `Running`, `Standby`, `Paused`).
*   **Actions & Sync Controls**:
    *   Provides manual triggers to pause or run individual tasks.
    *   Logs synchronization events in real-time to the telemetry console.

---

## 4. Domain Agents Control Tab (`agents`)

Details the statuses and custom parameters of the dedicated software agents managing separate cluster components.

*   **Domain Agents Control Board**:
    *   Displays cards for specialized agents: `founder_ceo`, `founder_agent`, `chief_of_staff_agent`, `sprint_manager`, `content_strategist`, `seo_agent`, `analytics_stack`, and `cms`.
    *   Exposes critical agent parameters such as their LLM backbone configurations (e.g., Gemini 2.5 Flash), temperature controls, system prompts, operational strictness bounds, and designated roles.
*   **Interactive Diagnostics**:
    *   Toggle agents status between `ACTIVE`, `PAUSED`, and `STANDBY`.
    *   Launches diagnostic routines that log connection checks and operational telemetry to verify agent performance.

---

## 5. Learned Insights Tab (`learning`)

Exposes metrics from reinforcement learning loops and custom fine-tuning modules embedded across operational pipelines.

*   **Reinforcement Learning Log**:
    *   Tracks fine-tuning weights, semantic category trends, training parameters, validation ratios, and learned feedback scores.
    *   Logs reward telemetry (such as alignment scores and compliance rating signals) and tracks convergence rates.
*   **Dynamic Metric Monitors**:
    *   Visualizes historical metrics such as adjustment training logs or delta loss variables, tracking improvement over consecutive runtime cycles.
