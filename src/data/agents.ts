import { Agent } from '../types/os';

export const seededAgents: Agent[] = [
  {
    id: 'agent-founder',
    name: 'Founder Agent',
    layer: 'Strategic Authority',
    status: 'LIVE',
    mandate: 'Guard the Founder\'s vision, evaluate recommendation packs, and prevent unauthorized actions or brand-violations.',
    allowedActions: [
      'Evaluate Recommendation Packets',
      'Generate Strategic Directives',
      'Check alignment with Principle 7 constraints'
    ],
    forbiddenActions: [
      'Publish content directly to CMS',
      'Authorize money transfers without CEO human multi-sig check'
    ],
    sourceFiles: ['founder_intent_manifesto.md', 'operating_charter_v2.md'],
    skills: ['Semantic Matching', 'Value Alignment Guard', 'Constraint Verification'],
    outputs: ['Mandate Directives', 'Evaluation Packets'],
    dashboardRole: 'CEO Persona AI Mirror'
  },
  {
    id: 'agent-cos',
    name: 'Chief of Staff / Planner',
    layer: 'Workflow Orchestration',
    status: 'LIVE',
    mandate: 'Orchestrate incoming founder initiatives. Break them into tickets, assign tasks, and query constraints.',
    allowedActions: [
      'Parse Strategic Initiatives',
      'Generate Workflow Plans',
      'Trigger Domain Agent Queues',
      'Flag missing agent dependencies'
    ],
    forbiddenActions: [
      'Direct draft writing',
      'Deploy code to live servers'
    ],
    sourceFiles: ['workflow_rules.json', 'system_roles_index.json'],
    skills: ['Task Decomposition', 'Gantt Chart Builder', 'Agent Dependency Solver'],
    outputs: ['Workflow Plans', 'Dispatch Briefs'],
    dashboardRole: 'Workflow Planner & Queue Dispatcher'
  },
  {
    id: 'agent-sprint',
    name: 'Sprint Manager / Pod Orchestrator',
    layer: 'Workflow Orchestration',
    status: 'QUEUED',
    mandate: 'Manage sprint loops, monitor agent progress, and automatically re-assign failed task items.',
    allowedActions: [
      'Monitor Active Task Lists',
      'Re-trigger Failed Processing Pipelines',
      'Compile Weekly Performance Summaries'
    ],
    forbiddenActions: [
      'Modify system constraints',
      'Reject Founder initiatives'
    ],
    sourceFiles: ['sprint_rules.md'],
    skills: ['State Coordination', 'Cron Scheduling Support'],
    outputs: ['Weekly Reports', 'Re-assignment Tokens'],
    dashboardRole: 'Pod Orchestrator (Walk Phase Locked)'
  },
  {
    id: 'agent-research',
    name: 'AI Research Agent',
    layer: 'Production',
    status: 'QUEUED',
    mandate: 'Extract, clean, and verify raw web information, structuring it into neat research briefings.',
    allowedActions: [
      'Crawl Authorized Web Outlets',
      'Summarize PDFs and PDF Indices',
      'Formulate Research Outlines'
    ],
    forbiddenActions: [
      'Write final publication copies',
      'Make public marketing assertions'
    ],
    sourceFiles: ['research_guidelines.md'],
    skills: ['Web Grabbing', 'Reference Linking', 'Abstract Formulation'],
    outputs: ['Research Briefing Packets'],
    dashboardRole: 'Information Harvester (Walk Phase Locked)'
  },
  {
    id: 'agent-drafting',
    name: 'AI Drafting Agent',
    layer: 'Production',
    status: 'PLANNED',
    mandate: 'Ingest research packs and produce clear, on-brand drafts aligned with styling guides.',
    allowedActions: [
      'Write Editorial Draft Content',
      'Revise Copy based on Feedback Logs'
    ],
    forbiddenActions: [
      'Publish Live',
      'Verify technical claims without Fact-Check agent'
    ],
    sourceFiles: ['tone_and_style_bible.md'],
    skills: ['On-Brand Synthesizer', 'Semantic Search', 'Markdown Formatter'],
    outputs: ['Markdown Draft Files'],
    dashboardRole: 'Drafting Engine (Run Phase Locked)'
  },
  {
    id: 'agent-seo',
    name: 'SEO & Search Optimization Agent',
    layer: 'Publishing / Distribution',
    status: 'PLANNED',
    mandate: 'Audit drafts for keyword densities, write SEO title tags, and review indexing status.',
    allowedActions: [
      'Analyze search intent databases',
      'Formulate title and meta-descriptions'
    ],
    forbiddenActions: [
      'Alter core editorial truths'
    ],
    sourceFiles: ['seo_playbook_2026.json'],
    skills: ['Keyword Map Resolver', 'Snippet Optimizer'],
    outputs: ['SEO Tags Metadata'],
    dashboardRole: 'Search Distribution Analyst (Run Phase Locked)'
  }
];
