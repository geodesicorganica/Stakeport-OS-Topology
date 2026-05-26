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

    ### A. HIGH_RISK Pipeline (Brand / PR Campaign Checkpoints)
    1.  `growth_strategy` (Campaign Strategy Owner)
    2.  `workflow_orch_system` (COS Sprint Handler)
    3.  `fact_checker` (Technical Compliance Verification)
    4.  `brand_reviewer` (Identity / Logo Auditor)
    5.  `legal_reviewer` (Regulation Sentinel Check)
    6.  `executive_approver` (Owner Token Consensus Gate)
    7.  `web_publisher` (Production CDN Dispatch)

    ### B. LOW_RISK Pipeline (Standard Content Publication)
    1.  `content_strategist` (Strategic Planning & Outlining)
    2.  `workflow_orch_system` (COS Sprint Handler)
    3.  `content_writer` (AI Content Writer - BLOCKED in Crawl Phase)
    4.  `fact_checker` (Accuracy / Verity Audit Match)
    5.  `executive_approver` (Owner Token Consensus Gate)
    6.  `cms` (Static Site Store / Publisher Cache)

    ### C. LEARNING Pipeline (Feedback Telemetry Optimization)
    1.  `analytics_stack` (User-traffic Data Aggregator)
    2.  `feedback_director` (Observed Errors & Discrepancies Auditor)
    3.  `learning_log_compilers` (Memory Fine-tuning Delta Compiler)
    4.  `founder_agent` (Shared Context Model Registry Update)

*   **Staging Guardrails**: Upon tracing completion, parsed payloads do not default to automatic approval. They instead stage as `PENDING` or `STAGED_FOR_REVIEW` indexes, forcing safe administrative reviews.

---

## 3. Vector Latency Custom Calibration
Simulates heavy network traffic, network division delays, or degradation on primary paths:
*   **Registry controls**: Sliders located in bottom right grid of Panel 2.
*   **Configurable paths**:
    *   `growth_strategy ➔ workflow_orch_system` (Strategy-to-Orchestrator pipeline link)
    *   `workflow_orch_system ➔ content_strategist` (Orchestrator execution task allocation)
    *   `fact_checker ➔ executive_approver` (Accuracy audits-to-founder consensus bridge)
    *   `executive_approver ➔ web_publisher` (Founder release-to-production deployment)
*   **Dynamic UI Feedback**: Increasing any latency weight instantly slows down the animated flows on the SVG topology canvas.

---

## 4. Live Database Cache Moderation
Provides manual overrides over in-memory cache data blocks representing Notion table states:
*   **Table Wipe**: Completely clears current records buffer to reset simulated Notion schemas.
*   **Search**: Fully responsive lookup matching metadata terms.
*   **Intervention Acts**: Forces manual "Allow Pass" or "Reject & Purge" choices for `IN_REVIEW` database records. Resolving these items writes secure records directly to the database lists while logging success actions or threat purges dynamically into the core console log.
