// review-agents.ts
// Run: npx tsx review-agents.ts  (from _review_Stakeport-OS-Topology/)
// Requires: ANTHROPIC_API_KEY environment variable

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { config as dotenvConfig } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env if present (ANTHROPIC_API_KEY)
dotenvConfig({ path: path.join(__dirname, '.env') });
const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'agents');
const REPORT_PATH = path.join(__dirname, 'agent-review-report.md');
const MODEL = 'claude-sonnet-4-6';

// ── Types ─────────────────────────────────────────────────────────────────

interface SkillFiles {
  skillName: string;
  skillMd: string | null;
  evaluatorMd: string | null;
  schemaJson: string | null;
  componentsMd: string | null;
  rulesMd: string | null;
  examplesMd: string | null;
}

interface AgentManifest {
  agentId: string;
  agentMdFile: string; // which file was used: AGENT.md or SYSTEM_PROMPT.md
  agentMd: string | null;
  skills: SkillFiles[];
}

interface DimensionResult {
  score: 'PASS' | 'FAIL' | 'PARTIAL' | 'N/A';
  findings: string[];
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'N/A';
}

interface AgentReviewResult {
  agentId: string;
  dimensions: {
    structuralCompleteness: DimensionResult;
    identityMandateClarity: DimensionResult;
    evaluatorGateCoverage: DimensionResult;
    crossAgentConsistency: DimensionResult;
    chainOfAuthorityAdherence: DimensionResult;
    constraintPropagation: DimensionResult;
    schemaAlignment: DimensionResult;
    phaseDiscipline: DimensionResult;
  };
  overallScore: 'PASS' | 'FAIL' | 'NEEDS_ATTENTION';
  criticalFindings: string[];
  recommendedFixes: string[];
  rawError?: string;
}

// ── System prompt (large — cached; reused across all per-agent calls) ────

const SYSTEM_PROMPT = `You are a rigorous auditor reviewing agent definition files in a multi-agent operating system.

## How to Determine the Agent Hierarchy

The chain of authority is defined by the agents themselves — read the cross-agent manifest (FIRST user message) to identify:
- Which agent is the strategic/founding layer (sets direction, produces constraints)
- Which agent is the operational/orchestration layer (converts strategy into dispatch briefs)
- Which agents are domain execution layers (produce copy, builds, research, etc.)
- Which agents, if any, are advisory-only (no chain of authority position, no skills, no approval role)

Advisory-only agents are identifiable by: using SYSTEM_PROMPT.md instead of AGENT.md, having no skills directory, and describing a coaching or thinking-partner mandate.

## Governance Principles to Check For

1. No self-approval: every agent must stage outputs for founder/principal review — not auto-approve or auto-publish.
2. No sideways delegation: execution agents must receive tasks only through the orchestration layer, never directly from each other.
3. Constraint propagation: every agent's session start protocol must explicitly read the shared constraints file (active_constraints.md) before producing output.
4. Completeness principle: dispatch briefs must be self-contained — the receiving agent can execute from the brief alone without follow-up questions.
5. Phase discipline: agents must not claim capabilities that are not yet built or live as if they are currently available.
6. Staging discipline: all outputs must be staged (in-review/draft status) before any downstream execution begins.

## Your Task

Evaluate the agent provided in the SECOND user message across these 8 dimensions. Use the cross-agent manifest in the FIRST user message for dimensions 4 and 5.

---

### Dimension 1: Structural Completeness
Required files for every agent with an execution mandate:
- AGENT.md (preferred) or SYSTEM_PROMPT.md (valid for advisory-only agents)
- Per skill: SKILL.md (or SKILL_PROMPT.md), evaluator.md, schema.json

If the agent being reviewed has no skills directory and its definition file describes an advisory-only or coaching mandate, score this dimension PASS — that is architecturally intentional, not a deficiency.

Score FAIL if any required file is absent (marked null in the bundle) for an agent with skills.
Score PARTIAL if optional files (components.md, rules.md, examples.md) are absent from skills complex enough to need them.
Score PASS if all required files are present, or if the agent is advisory-only with a valid definition file.

### Dimension 2: Identity/Mandate Clarity
A complete agent definition must contain:
- Named role (who is this agent)
- Operating Mandate section (what is the single job)
- "What This Agent Is Not" section with specific boundary statements
- Chain of authority diagram or clear statement of reporting relationships
- Skill Registry table (for agents with skills; advisory agents may omit this)

Score FAIL if any of the above are absent (adjusted for advisory agents as noted).
Score PARTIAL if present but vague (e.g., boundaries described without specific examples of what is forbidden).
Score PASS if all elements are present and specific.

### Dimension 3: Evaluator Gate Coverage
For each skill's evaluator.md:
- Gates must be numbered and named
- Each gate must have: Purpose, Procedure, Fail conditions (specific, not "if it's bad"), Pass condition
- Content-producing agents need: fabrication guard (claims trace to named sources), voice/tone check, schema validation gate, staging gate
- Build/deploy agents need: input approval hardstop (cannot build against unapproved inputs), forbidden content check, no self-deployment gate
- Research agents need: statistical claim provenance gate, validation-language discipline gate

Score FAIL if gates lack explicit fail/pass conditions or if gates appropriate to the agent's mandate are absent.
Score PARTIAL if gates are present but some lack procedural specificity.
Score PASS if all gates are numbered, named, and have explicit fail + pass conditions.
Advisory agents with no skills: score N/A.

### Dimension 4: Cross-Agent Consistency
Using the cross-agent manifest, check:
- What one agent says it produces must match what downstream agents say they consume
- Shared state files (indexes, status trackers): identify which agent owns each file and verify downstream agents correctly identify that owner
- Dispatch brief format: what the orchestration agent says it produces must match what domain agents say they require at session start
- Gated resources (research indexes, approval status files): agents that cite from them must read them; agents that update them must document the update procedure

Score FAIL if a stated output format does not match a downstream agent's stated input requirement.
Score PARTIAL if there are minor naming or format ambiguities.
Score PASS if all handoffs are consistent.

### Dimension 5: Chain of Authority Adherence
Check the agent being reviewed:
- Does it receive tasks only from the correct layer above it (based on the hierarchy you derived from the manifest)?
- Does it claim any self-approval authority?
- Does it dispatch to agents at the same or higher level?
- Does it produce outputs that bypass the staging/approval gate?

Score FAIL if any of the above violations are present.
Score PASS if authority flows correctly and staging is enforced.

### Dimension 6: Constraint Propagation
Every agent's session start protocol (or equivalent mandatory first section) must explicitly reference reading the shared constraints file (active_constraints.md or equivalent) before producing output.

Score FAIL if the constraints file is not mentioned in the session start protocol.
Score PARTIAL if it is mentioned but as optional rather than mandatory.
Score PASS if it is a mandatory step in the session start protocol.

### Dimension 7: Schema Alignment
For each skill:
- Fields named in schema.json must match fields described in SKILL.md's output section
- Evaluator must include a schema validation gate that references the schema.json file

Score FAIL if schema.json fields are not reflected in SKILL.md output descriptions, or if the evaluator has no schema gate.
Score PARTIAL if alignment is mostly correct but minor fields differ.
Score PASS if schema.json fields, SKILL.md output descriptions, and evaluator schema gate are consistent.

### Dimension 8: Phase Discipline
Scan the agent definition and all skill files for capabilities described as currently live that are not yet built:
- Look for "Planned", "Phase 2+", "future", or equivalent labels — these are permitted if clearly labeled as not yet live
- Flag any capability described without a "not yet built" label that requires infrastructure not present in Phase 1 (execution layers, custody, SDK, securitization, developer platform)
- Permitted as live: Phase 1 modules explicitly described as built in the agent's own mandate

Score FAIL if any capability is claimed as currently live when it is labeled or described elsewhere as planned/future.
Score PASS if all phase references are accurate given the agent's stated build status.

---

## Output Format

After your analysis, output ONLY a single JSON object wrapped in \`\`\`json ... \`\`\` fences.

The JSON must conform to this exact schema:
{
  "agentId": "string — the agent directory name",
  "dimensions": {
    "structuralCompleteness": {
      "score": "PASS" | "FAIL" | "PARTIAL" | "N/A",
      "findings": ["array of specific findings — what was found, not just verdicts"],
      "severity": "HIGH" | "MEDIUM" | "LOW" | "N/A"
    },
    "identityMandateClarity": { "score": "...", "findings": [...], "severity": "..." },
    "evaluatorGateCoverage": { "score": "...", "findings": [...], "severity": "..." },
    "crossAgentConsistency": { "score": "...", "findings": [...], "severity": "..." },
    "chainOfAuthorityAdherence": { "score": "...", "findings": [...], "severity": "..." },
    "constraintPropagation": { "score": "...", "findings": [...], "severity": "..." },
    "schemaAlignment": { "score": "...", "findings": [...], "severity": "..." },
    "phaseDiscipline": { "score": "...", "findings": [...], "severity": "..." }
  },
  "overallScore": "PASS" | "FAIL" | "NEEDS_ATTENTION",
  "criticalFindings": ["array of HIGH severity findings only — be specific"],
  "recommendedFixes": ["array of actionable fixes — cite specific file and section"]
}

Rules for overallScore:
- PASS: all dimensions PASS or N/A
- FAIL: any dimension is FAIL with HIGH severity
- NEEDS_ATTENTION: any dimension is FAIL with MEDIUM/LOW severity, or any PARTIAL with HIGH severity

Severity mapping for dimensions:
- structuralCompleteness FAIL → HIGH
- identityMandateClarity FAIL → HIGH (PARTIAL → MEDIUM)
- evaluatorGateCoverage FAIL → HIGH (PARTIAL → MEDIUM)
- crossAgentConsistency FAIL → HIGH (PARTIAL → MEDIUM)
- chainOfAuthorityAdherence FAIL → HIGH
- constraintPropagation FAIL → HIGH (PARTIAL → MEDIUM)
- schemaAlignment FAIL → MEDIUM (PARTIAL → LOW)
- phaseDiscipline FAIL → HIGH

Be specific in findings. "Missing section" is not specific. "AGENT.md has no 'What This Agent Is Not' section — boundary between this agent and the Chief of Staff is undefined" is specific.`;

// ── File discovery ────────────────────────────────────────────────────────

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

async function discoverAgents(): Promise<AgentManifest[]> {
  const entries = await fs.readdir(AGENTS_DIR, { withFileTypes: true });
  const agentDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  const manifests: AgentManifest[] = [];

  for (const agentId of agentDirs) {
    const agentDir = path.join(AGENTS_DIR, agentId);

    // Try AGENT.md first, fall back to SYSTEM_PROMPT.md
    let agentMd = await readOptional(path.join(agentDir, 'AGENT.md'));
    let agentMdFile = 'AGENT.md';
    if (agentMd === null) {
      agentMd = await readOptional(path.join(agentDir, 'SYSTEM_PROMPT.md'));
      agentMdFile = 'SYSTEM_PROMPT.md';
    }

    const skills: SkillFiles[] = [];
    const skillsDir = path.join(agentDir, 'skills');

    try {
      const skillEntries = await fs.readdir(skillsDir, { withFileTypes: true });
      const skillDirs = skillEntries.filter(e => e.isDirectory()).map(e => e.name);

      for (const skillName of skillDirs) {
        const skillDir = path.join(skillsDir, skillName);
        let skillMd = await readOptional(path.join(skillDir, 'SKILL.md'));
        if (skillMd === null) {
          skillMd = await readOptional(path.join(skillDir, 'SKILL_PROMPT.md'));
        }

        skills.push({
          skillName,
          skillMd,
          evaluatorMd: await readOptional(path.join(skillDir, 'evaluator.md')),
          schemaJson: await readOptional(path.join(skillDir, 'schema.json')),
          componentsMd: await readOptional(path.join(skillDir, 'components.md')),
          rulesMd: await readOptional(path.join(skillDir, 'rules.md')),
          examplesMd: await readOptional(path.join(skillDir, 'examples.md')),
        });
      }
    } catch {
      // No skills/ directory — valid for advisory agents
    }

    manifests.push({ agentId, agentMdFile, agentMd, skills });
  }

  return manifests;
}

// ── Bundle builders ───────────────────────────────────────────────────────

function buildCrossAgentManifest(agents: AgentManifest[]): string {
  return agents.map(a => {
    const header = `=== AGENT: ${a.agentId} (${a.agentMdFile}) ===`;
    const body = a.agentMd ?? '[FILE ABSENT]';
    return `${header}\n\n${body}`;
  }).join('\n\n---\n\n');
}

function buildAgentBundle(agent: AgentManifest): string {
  const lines: string[] = [];
  lines.push(`## Agent under review: ${agent.agentId}`);
  lines.push(`**Definition file used:** ${agent.agentMdFile}`);
  lines.push('');
  lines.push('### AGENT.md content:');
  lines.push(agent.agentMd ?? '[FILE ABSENT — null]');

  if (agent.skills.length === 0) {
    lines.push('');
    lines.push('### Skills: none (advisory agent — no skills directory)');
  } else {
    for (const skill of agent.skills) {
      lines.push('');
      lines.push(`### Skill: ${skill.skillName}`);
      lines.push('');
      lines.push('**SKILL.md:**');
      lines.push(skill.skillMd ?? '[FILE ABSENT — null]');
      lines.push('');
      lines.push('**evaluator.md:**');
      lines.push(skill.evaluatorMd ?? '[FILE ABSENT — null]');
      lines.push('');
      lines.push('**schema.json:**');
      lines.push(skill.schemaJson ?? '[FILE ABSENT — null]');
      lines.push('');
      lines.push('**components.md:**');
      lines.push(skill.componentsMd ?? '[FILE ABSENT — null]');
      lines.push('');
      lines.push('**rules.md:**');
      lines.push(skill.rulesMd ?? '[FILE ABSENT — null]');
      lines.push('');
      lines.push('**examples.md:**');
      lines.push(skill.examplesMd ?? '[FILE ABSENT — null]');
    }
  }

  return lines.join('\n');
}

// ── SDK calls ─────────────────────────────────────────────────────────────

function extractJson(text: string): AgentReviewResult | null {
  const match = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]) as AgentReviewResult;
  } catch {
    return null;
  }
}

async function reviewAgent(
  agent: AgentManifest,
  agents: AgentManifest[],
  crossAgentManifest: string,
  client: Anthropic
): Promise<AgentReviewResult> {
  const agentBundle = buildAgentBundle(agent);

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          // @ts-ignore — cache_control is valid in the API but may not be in older type defs
          cache_control: { type: 'ephemeral' },
        }
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `## Cross-Agent Manifest\n\nThis is the full agent definition content for all ${agents.length} agents in this system. Use it to derive the chain of authority and for dimensions 4 (cross-agent consistency) and 5 (chain of authority adherence).\n\n${crossAgentManifest}`,
              // @ts-ignore
              cache_control: { type: 'ephemeral' },
            },
            {
              type: 'text',
              text: agentBundle,
            }
          ]
        }
      ]
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return makeErrorResult(agent.agentId, msg);
  }

  const usage = response.usage as Anthropic.Usage & { cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
  console.log(
    `  tokens — input: ${usage.input_tokens}, cache_read: ${usage.cache_read_input_tokens ?? 0}, cache_write: ${usage.cache_creation_input_tokens ?? 0}, output: ${usage.output_tokens}`
  );

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const parsed = extractJson(text);

  if (!parsed) {
    return makeErrorResult(agent.agentId, `JSON parse failed. Raw response:\n${text.slice(0, 500)}`);
  }

  return parsed;
}

function makeErrorResult(agentId: string, error: string): AgentReviewResult {
  const errDim: DimensionResult = { score: 'N/A', findings: ['Review error — see rawError'], severity: 'N/A' };
  return {
    agentId,
    dimensions: {
      structuralCompleteness: errDim,
      identityMandateClarity: errDim,
      evaluatorGateCoverage: errDim,
      crossAgentConsistency: errDim,
      chainOfAuthorityAdherence: errDim,
      constraintPropagation: errDim,
      schemaAlignment: errDim,
      phaseDiscipline: errDim,
    },
    overallScore: 'FAIL',
    criticalFindings: ['Review could not be completed due to an error'],
    recommendedFixes: [],
    rawError: error,
  };
}

async function synthesizeSystemFindings(
  results: AgentReviewResult[],
  client: Anthropic
): Promise<string> {
  const summaryJson = JSON.stringify(results, null, 2);

  let response: Anthropic.Message;
  try {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are synthesizing cross-agent review results for the Stakeport OS.

Below are the per-agent review results (JSON) from a structured audit of 6 agents.

Identify cross-cutting system-level issues that cannot be detected from any single agent's files in isolation. Focus on:
1. Handoff format mismatches between producers and consumers
2. Authority chain gaps (missing links, ambiguous delegation)
3. Constraint propagation failures that span multiple agents
4. Phase discipline inconsistencies across the system
5. Any patterns where multiple agents have the same gap (systemic vs. isolated)

Output your findings as clean Markdown with no JSON, no headers — just a numbered list of specific cross-cutting findings. Be concise and specific. If no cross-cutting issues exist beyond what individual reviews captured, say so explicitly.

## Per-Agent Review Results

\`\`\`json
${summaryJson}
\`\`\``
        }
      ]
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `*Synthesis call failed: ${msg}*`;
  }

  return response.content[0].type === 'text' ? response.content[0].text : '*No synthesis output*';
}

// ── Report assembly ───────────────────────────────────────────────────────

const DIM_LABELS: Record<string, string> = {
  structuralCompleteness: 'Structural',
  identityMandateClarity: 'Identity',
  evaluatorGateCoverage: 'Gates',
  crossAgentConsistency: 'Cross-Agent',
  chainOfAuthorityAdherence: 'Auth Chain',
  constraintPropagation: 'Constraints',
  schemaAlignment: 'Schema',
  phaseDiscipline: 'Phase',
};

const DIM_KEYS = Object.keys(DIM_LABELS) as (keyof AgentReviewResult['dimensions'])[];

function scoreEmoji(score: string): string {
  if (score === 'PASS') return '✅';
  if (score === 'FAIL') return '❌';
  if (score === 'PARTIAL') return '⚠️';
  if (score === 'N/A') return '—';
  return score;
}

function overallEmoji(score: string): string {
  if (score === 'PASS') return '✅ PASS';
  if (score === 'FAIL') return '❌ FAIL';
  if (score === 'NEEDS_ATTENTION') return '⚠️ NEEDS ATTENTION';
  return score;
}

function assembleReport(results: AgentReviewResult[], systemFindings: string, date: string): string {
  const lines: string[] = [];

  lines.push('# Stakeport OS Agent Review Report');
  lines.push(`**Generated:** ${date}`);
  lines.push(`**Model:** ${MODEL}`);
  lines.push(`**Agents reviewed:** ${results.filter(r => !r.rawError).length} of ${results.length}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive summary table
  lines.push('## Executive Summary');
  lines.push('');
  const headerCols = ['Agent', 'Overall', ...Object.values(DIM_LABELS)];
  lines.push('| ' + headerCols.join(' | ') + ' |');
  lines.push('| ' + headerCols.map(() => '---').join(' | ') + ' |');

  for (const r of results) {
    if (r.rawError) {
      lines.push(`| **${r.agentId}** | ❌ ERROR | ${DIM_KEYS.map(() => '—').join(' | ')} |`);
      continue;
    }
    const dimCols = DIM_KEYS.map(k => scoreEmoji(r.dimensions[k].score));
    lines.push(`| **${r.agentId}** | ${overallEmoji(r.overallScore)} | ${dimCols.join(' | ')} |`);
  }

  lines.push('');

  // Critical findings across all agents
  const allCritical = results.flatMap(r =>
    (r.criticalFindings ?? []).map(f => `**${r.agentId}:** ${f}`)
  );
  if (allCritical.length > 0) {
    lines.push('## Critical Findings');
    lines.push('');
    for (const f of allCritical) {
      lines.push(`- ${f}`);
    }
    lines.push('');
  }

  // Per-agent detail sections
  lines.push('---');
  lines.push('');
  lines.push('## Per-Agent Reviews');

  for (const r of results) {
    lines.push('');
    lines.push(`### ${r.agentId}`);
    lines.push('');

    if (r.rawError) {
      lines.push(`**Review error:**`);
      lines.push('');
      lines.push('```');
      lines.push(r.rawError);
      lines.push('```');
      continue;
    }

    lines.push(`**Overall:** ${overallEmoji(r.overallScore)}`);
    lines.push('');

    for (const key of DIM_KEYS) {
      const dim = r.dimensions[key];
      const label = DIM_LABELS[key];
      lines.push(`#### ${label} — ${scoreEmoji(dim.score)} ${dim.score}${dim.severity !== 'N/A' ? ` (${dim.severity})` : ''}`);
      if (dim.findings.length > 0) {
        for (const f of dim.findings) {
          lines.push(`- ${f}`);
        }
      } else {
        lines.push('- No findings.');
      }
      lines.push('');
    }

    if (r.recommendedFixes.length > 0) {
      lines.push('**Recommended fixes:**');
      lines.push('');
      for (const fix of r.recommendedFixes) {
        lines.push(`- ${fix}`);
      }
      lines.push('');
    }
  }

  // System-level findings
  lines.push('---');
  lines.push('');
  lines.push('## System-Level Cross-Agent Findings');
  lines.push('');
  lines.push(systemFindings);
  lines.push('');

  // Priority fix list
  lines.push('---');
  lines.push('');
  lines.push('## Recommended Fixes by Priority');
  lines.push('');

  const highFixes: string[] = [];
  const medFixes: string[] = [];
  const lowFixes: string[] = [];

  for (const r of results) {
    if (r.rawError) continue;
    for (const key of DIM_KEYS) {
      const dim = r.dimensions[key];
      if ((dim.score === 'FAIL' || dim.score === 'PARTIAL') && r.recommendedFixes.length > 0) {
        const target = dim.severity === 'HIGH' ? highFixes : dim.severity === 'MEDIUM' ? medFixes : lowFixes;
        for (const fix of r.recommendedFixes) {
          if (!target.includes(`[${r.agentId}] ${fix}`)) {
            target.push(`[${r.agentId}] ${fix}`);
          }
        }
      }
    }
  }

  lines.push('### Priority 1 — HIGH');
  if (highFixes.length > 0) {
    for (const f of highFixes) lines.push(`- ${f}`);
  } else {
    lines.push('- None.');
  }
  lines.push('');
  lines.push('### Priority 2 — MEDIUM');
  if (medFixes.length > 0) {
    for (const f of medFixes) lines.push(`- ${f}`);
  } else {
    lines.push('- None.');
  }
  lines.push('');
  lines.push('### Priority 3 — LOW');
  if (lowFixes.length > 0) {
    for (const f of lowFixes) lines.push(`- ${f}`);
  } else {
    lines.push('- None.');
  }
  lines.push('');

  // Methodology
  lines.push('---');
  lines.push('');
  lines.push('## Review Methodology');
  lines.push('');
  lines.push(`- **SDK:** @anthropic-ai/sdk, model \`${MODEL}\``);
  lines.push(`- **API calls:** ${results.length + 1} total (${results.length} per-agent + 1 system-level synthesis)`);
  lines.push('- **Prompt caching:** System prompt + cross-agent manifest cached (ephemeral) across 6 per-agent calls');
  lines.push('- **Files read per agent:** AGENT.md (or SYSTEM_PROMPT.md), SKILL.md, evaluator.md, schema.json, components.md, rules.md, examples.md');
  lines.push('- **Review dimensions:** 8 (structural completeness, identity/mandate, evaluator gates, cross-agent consistency, chain of authority, constraint propagation, schema alignment, phase discipline)');

  return lines.join('\n');
}

// ── Entry point ───────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const client = new Anthropic({ apiKey });
  const date = new Date().toISOString().split('T')[0];

  console.log('Discovering agents...');
  const agents = await discoverAgents();
  console.log(`Found ${agents.length} agents: ${agents.map(a => a.agentId).join(', ')}`);

  const crossAgentManifest = buildCrossAgentManifest(agents);
  console.log(`Cross-agent manifest: ${crossAgentManifest.length} chars`);

  const results: AgentReviewResult[] = [];

  for (const agent of agents) {
    console.log(`\nReviewing: ${agent.agentId} (${agent.skills.length} skills)...`);
    const result = await reviewAgent(agent, agents, crossAgentManifest, client);
    results.push(result);
    console.log(`  → ${result.overallScore}${result.rawError ? ' [ERROR]' : ''}`);
  }

  console.log('\nRunning system-level synthesis...');
  const systemFindings = await synthesizeSystemFindings(results, client);

  const report = assembleReport(results, systemFindings, date);
  await fs.writeFile(REPORT_PATH, report, 'utf-8');

  console.log(`\nReport written to: ${REPORT_PATH}`);

  const passed = results.filter(r => r.overallScore === 'PASS').length;
  const failed = results.filter(r => r.overallScore === 'FAIL').length;
  const attention = results.filter(r => r.overallScore === 'NEEDS_ATTENTION').length;
  console.log(`Summary: ${passed} PASS, ${attention} NEEDS ATTENTION, ${failed} FAIL`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
