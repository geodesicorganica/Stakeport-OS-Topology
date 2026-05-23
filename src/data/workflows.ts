import { Workflow } from '../types/os';

export const seededWorkflows: Workflow[] = [
  {
    id: 'wf-01',
    initiativeId: 'init-01',
    ownerAgent: 'founder_agent',
    phase: 'publishing',
    outputFolder: '/assets/brand',
    recommendationPacket: {
      title: 'Brand Styling Guidelines Pack',
      description: 'Foundational font stack (Inter, JetBrains Mono) and theme palettes for Stakeport UI.',
      riskScore: 'LOW',
      createdAt: '2026-05-23T07:45:00Z',
      reviewStatus: 'APPROVED'
    },
    workflowPlan: [
      'Parse brand_manifesto_v1.0.md',
      'Generate CSS variable guidelines',
      'Submit guidelines to executive approver',
      'Commit guidelines to Knowledge Base memory'
    ],
    domainDispatch: 'Knowledge Base Input Pipeline',
    constraintsCheck: true,
    status: 'COMPLETED',
    nextAction: 'Ready in Shared Memory Layer.'
  },
  {
    id: 'wf-02',
    initiativeId: 'init-02',
    ownerAgent: 'chief_of_staff',
    phase: 'approval',
    outputFolder: '/workflows/wf-02',
    recommendationPacket: {
      title: 'Marketing Homepage Wireframe Packet',
      description: 'Proposed layout design specifications and copywriting outline for the Stakeport OS home folder.',
      riskScore: 'HIGH',
      createdAt: '2026-05-23T11:25:00Z',
      reviewStatus: 'PENDING'
    },
    workflowPlan: [
      'Extract layout specs from website_architecture_specs.json',
      'Generate copywriting brief for Homepage Hero',
      'Review layout with Chief of Staff planner agent',
      'Dispatch layout brief for Founder human approval'
    ],
    domainDispatch: 'Founder Approval Pending Queue',
    constraintsCheck: true,
    status: 'ACTIVE',
    nextAction: 'Waiting for Founder CEO approval on Homepage Layout.'
  },
  {
    id: 'wf-03',
    initiativeId: 'init-02',
    ownerAgent: 'chief_of_staff',
    phase: 'planning',
    outputFolder: '/workflows/wf-03',
    recommendationPacket: {
      title: 'Copy Draft Release Packet',
      description: 'First production post titled "Why Stakeport OS Rules Digital Operations".',
      riskScore: 'MEDIUM',
      createdAt: '2026-05-23T12:00:00Z',
      reviewStatus: 'STAGED'
    },
    workflowPlan: [
      'Outline copy drafting parameters',
      'Wait for Writing Agent allocation',
      'Submit draft to content strategist audit'
    ],
    domainDispatch: 'AI Writing Agent Dispatch Queue',
    constraintsCheck: false,
    status: 'BLOCKED',
    blockedBy: 'Missing Domain Agent (Content Writer Agent is NOT LIVE in Crawl Phase)',
    nextAction: 'Provision human editor backup or promote OS Phase to Walk.'
  }
];
