import { DispatchBrief } from '../types/os';

export const seededDispatches: DispatchBrief[] = [
  {
    id: 'db-001',
    initiativeId: 'launch-phase-1-marketing-website',
    receivingAgent: 'Chief of Staff Agent',
    task: 'Formulate Launch Phase 1 Marketing Website Workflow Plan',
    context: 'Use positioning assets and brand directives to coordinate content compilation.',
    successCriteria: 'Comprehensive subtask mappings, constraint matching checks, and complete packet ready for founder triage.',
    relevantConstraints: ['Pillars validation', 'Proof-spine compliance'],
    principle7Verified: true,
    status: 'DISPATCHED'
  },
  {
    id: 'db-002',
    initiativeId: 'launch-phase-1-marketing-website',
    receivingAgent: 'Research Agent',
    task: 'Gather Proof-Point Claims Context',
    context: 'Harvest methodology-citations from product metrics and active staking validators logs.',
    successCriteria: 'Structured research briefing on actual operational yields and platform metrics.',
    relevantConstraints: ['Methodology citations matching real stats'],
    principle7Verified: true,
    status: 'QUEUED'
  }
];
