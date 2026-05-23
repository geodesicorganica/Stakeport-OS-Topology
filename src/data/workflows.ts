import { Workflow } from '../types/os';

export const seededWorkflows: Workflow[] = [
  {
    id: 'wf-marketing-website',
    initiativeId: 'launch-phase-1-marketing-website',
    ownerAgent: 'chief_of_staff',
    phase: 'planning',
    outputFolder: 'agents/chief-of-staff/outputs/launch-marketing-website/',
    recommendationPacket: {
      title: 'Launch Phase 1 Marketing Website Layout & Strategy Packet',
      description: 'Recommendation packet for marketing layout wireframes, proof-spine design, and primary CTA triggers.',
      riskScore: 'HIGH',
      createdAt: '2026-05-23T11:25:00Z',
      reviewStatus: 'PENDING'
    },
    workflowPlan: [
      'Ingest customer avatar segments from shared/audiences.md',
      'Parse value props and pillars from shared/value-propositions.md',
      'Extract proof metrics from shared/proof-points.md',
      'Formulate messaging hierarchy outline under agents/chief-of-staff/outputs/launch-marketing-website/',
      'Run constraints verification in agents/chief-of-staff/outputs/launch-marketing-website/constraints_check.md',
      'Submit completed recommendation packet to founder review queue'
    ],
    domainDispatch: 'Domain Agent Dispatch (Research, Copywriting, SEO)',
    constraintsCheck: true,
    status: 'ACTIVE',
    nextAction: 'Ready for founder evaluation and sign-off.'
  }
];
