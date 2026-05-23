# Stakeport OS Topology/Dashboard Audit Fixes

The Stakeport OS dashboard prototype has been audited and hardened according to strict enterprise-grade operational standards. All fictional files, security-larp language, and governance leaks have been fully resolved.

---

## 1. Summary of What Was Fixed

1.  **Type Mismatches Resolved:**
    *   Aligned `NodeMeta` properties by utilizing the existing `node.category` instead of nonexistent layered states.
2.  **Status Model Normalized:**
    *   Unified agent and telemetry statuses around a single, clean `NodeStatus` enum (`'LIVE' | 'QUEUED' | 'BLOCKED' | 'NOT_STARTED' | 'UNLOCKED'`).
    *   Removed simulated states like `ONLINE` or `CRITICAL_BLOCKED` other than visual rendering markers.
3.  **Governance Leaks Blocked:**
    *   Hardened the **Founder Review & Approval** workflow. Approve action authorizes next workflow step but **does NOT** trigger direct CMS publishing, bypass channels, or generate release tokens unless the item explicitly requests public publishing.
    *   Tracer completions now yield logical states (`PENDING` or `STAGED_FOR_REVIEW`) rather than automatic approvals.
    *   **Learning Governance Secured:** Modified the SOT Map consolidation triggers to "Propose Memory Update." Memory updates require explicit manual human review and approval rather than auto-implementation.
4.  **Operational Terminology Restored:**
    *   Replaced larp/scenic cryptographic phrases (e.g., "escrow consensus signers", "SMS hardkeys", "automatic CDN publish", "decentralized autonomous vector overrides") with human-in-the-loop audit verification.
5.  **New State Domains Added:**
    *   Dynamically loaded real state domains (`seededDispatches` and `seededConstraints`) inside `src/types/os.ts` and passed them into the main dashboard state registers.

---

## 2. Removed Fictional Files vs. Canonical Stakeport OS Files

All fake source files, simulated binaries, and arbitrary XML mappings have been replaced with real canonical documents.

| Fictional File (Removed) | Canonical Stakeport OS File (Now Used) |
| :--- | :--- |
| `brand_manifesto_v1.0.md` | `shared/positioning.md` |
| `operating_charter_v2.md` | `agents/founder/outputs/strategic_directives.md` |
| `website_architecture_specs.json` | `agents/chief-of-staff/skills/workflow-planning/schema.json` |
| `seo_playbook_2026.json` | `shared/audiences.md` |
| `founder_intent_manifesto.md` | `agents/founder/AGENT.md` |
| `workflow_rules.json` | `agents/chief-of-staff/skills/workflow-planning-schema.json` (as mapped schema) |
| `sprint_rules.md` | `AGENTS.md` |
| `research_guidelines.md` | `shared/company-overview.md` |
| `tone_and_style_bible.md` | `shared/voice-and-tone.md` |
| `seo_campaign_mandate.md` | `shared/messaging-pillars.md` |
| `seo_playbook_2026.json` | `shared/positioning.md` |
| `Crawl_Foundational_Topology.asset` | `shared/company-overview.md` |
| `Governance_Consensus_Sigs.json` | `agents/chief-of-staff/skills/workflow-planning/schema.json` |
| `Relational_Core_Notion_Sync.yaml` | `agents/chief-of-staff/outputs/launch-marketing-website/initiative_brief.md` |

---

## 3. Added State Files

The following files were created in `src/data/` to track additional state domains:
*   `src/data/dispatches.ts` — Exports `seededDispatches: DispatchBrief[]`
*   `src/data/constraints.ts` — Exports `seededConstraints: ConstraintCheck[]`

---

## 4. How to Validate Locally

You can launch and verify the integrity of the updated codebase locally using standard Node commands:

```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript check (linter)
npm run lint

# 3. Compile the application
npm run build

# 4. Spin up the local development preview server on http://localhost:3000
npm run dev
```
