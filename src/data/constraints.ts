import { ConstraintCheck } from '../types/os';

export const seededConstraints: ConstraintCheck[] = [
  {
    id: 'cc-001',
    initiativeId: 'launch-phase-1-marketing-website',
    constraint: 'Three Core Messaging Pillars Enforcement',
    status: 'PASSED',
    note: 'Verified that the website layout draft incorporates and features all three brand positioning pillars.',
    sourceFile: 'shared/messaging-pillars.md',
    checkedAt: '2026-05-23T10:30:00Z'
  },
  {
    id: 'cc-002',
    initiativeId: 'launch-phase-1-marketing-website',
    constraint: 'Proof-Spine Integrity Audit',
    status: 'PASSED',
    note: 'Confirmed that proof-point spine elements are integrated on every primary page block.',
    sourceFile: 'shared/proof-points.md',
    checkedAt: '2026-05-23T11:00:00Z'
  },
  {
    id: 'cc-003',
    initiativeId: 'launch-phase-1-marketing-website',
    constraint: 'Regulatory Conformity Check',
    status: 'PASSED',
    note: 'CUIP non-discretionary structure references and equivalent risk warnings are verified in footer template.',
    sourceFile: 'agents/founder/outputs/active_constraints.md',
    checkedAt: '2026-05-23T11:15:00Z'
  }
];
