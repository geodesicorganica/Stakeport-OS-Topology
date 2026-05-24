# 🧪 Interactive Tracer & Simulators

Stakeport OS provides rich interactive controls to simulate standard cluster stress, trace logical data propagation steps, force connection degradation, and moderate memory tables.

---

## 1. The Ingress Simulator
Simulates the volume of incoming transaction files stream parsing into the cluster:
*   **Controls**: Slider on Panel 1 ranging from `50` to `2500` payloads per minute.
*   **Behavior**:
    *   Adjusting the slider generates instant system logs detailing the updated frequency.
    *   Directly models load pressure on the initial ingest gateway node (`Content`), tracking active backlog scales.

---

## 2. Step-by-Step Simulation Tracer
An interactive pipeline validator designed to visualize how metadata correlates from incoming files down to final distribution endpoints:
*   **Initialization**: Activated from the **Topology Map** controller card.
*   **Path Flow Checkpoints**:
    1.  `Content Gateway` – Ingestion receiver dividing metadata payloads.
    2.  `NotionDB` – Central in-memory relational core mappings.
    3.  `Governance` – Human founder verification protocol (L1 audit).
    4.  `RiskRouting` – Heuristic sandboxed threat checks.
    5.  `Distribution` – Edge Akamai/CDN delivery pipelines.
*   **Staging Guardrails**: Upon tracing completion, parsed payloads do not default to automatic approval. They instead stage as `PENDING` or `STAGED_FOR_REVIEW` indexes, forcing safe administrative reviews.

---

## 3. Vector Latency Custom Calibration
Simulates heavy network traffic, network division delays, or degradation on primary paths:
*   **Registry controls**: Sliders located in bottom right grid of Panel 2.
*   **Configurable paths**:
    *   `Content ➔ NotionDB` (Ingestion bridge)
    *   `NotionDB ➔ Governance` (Registry-to-strategic review pipeline)
    *   `Governance ➔ RiskRouting` (Strategic audit check sandbox)
    *   `RiskRouting ➔ Distribution` (Risk validation-to-delivery edge lines)
*   **Dynamic UI Feedback**: Increasing any latency weight instantly slows down the animated flows on the SVG topology canvas.

---

## 4. Live Database Cache Moderation
Provides manual overrides over in-memory cache data blocks representing Notion table states:
*   **Table Wipe**: Completely clears current records buffer to reset simulated Notion schemas.
*   **Search**: Fully responsive lookup matching metadata terms.
*   **Intervention Acts**: Forces manual "Allow Pass" or "Reject & Purge" choices for `IN_REVIEW` database records. Resolving these items writes secure records directly to the database lists while logging success actions or threat purges dynamically into the core console log.
