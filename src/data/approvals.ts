import { ApprovalItem } from '../types/os';

export const seededApprovals: ApprovalItem[] = [
  {
    id: 'app-001',
    itemType: 'Brand Logo & Typography Guidelines',
    itemPath: '/assets/brand/guidelines_draft.md',
    initiativeId: 'init-01',
    approver: 'Founder / CEO',
    status: 'APPROVED',
    decisionRequired: 'Approve brand styling rules & fonts',
    approvalMeans: 'Private Multi-Sig Key Signature S-21',
    riskLevel: 'MEDIUM',
    createdAt: '2026-05-23T08:00:00Z',
    updatedAt: '2026-05-23T09:15:00Z'
  },
  {
    id: 'app-002',
    itemType: 'Recommendation Packet: Home Layout Strategy',
    itemPath: '/workflows/wf-02/recommendation_pack.json',
    initiativeId: 'init-02',
    approver: 'Founder / CEO',
    status: 'PENDING',
    decisionRequired: 'Authorize execution of Website Homepage wireframes & copywriting briefs',
    approvalMeans: 'Founder OS Authentication Prompt',
    riskLevel: 'HIGH',
    createdAt: '2026-05-23T11:30:00Z',
    updatedAt: '2026-05-23T11:30:00Z'
  },
  {
    id: 'app-003',
    itemType: 'Copy Draft: "Why Stakeport OS Rules Digital Operations"',
    itemPath: '/workflows/wf-03/copy_draft_v1.md',
    initiativeId: 'init-02',
    approver: 'Founder / CEO',
    status: 'PENDING',
    decisionRequired: 'Review and unlock draft for CMS distribution pipeline',
    approvalMeans: 'CEO Secure SMS / HardKey Sign-off',
    riskLevel: 'HIGH',
    createdAt: '2026-05-23T12:05:00Z',
    updatedAt: '2026-05-23T12:05:00Z'
  },
  {
    id: 'app-004',
    itemType: 'Domain Agent Provisioning: AI Research Agent',
    itemPath: '/infrastructure/agent-research/provision_request.bin',
    initiativeId: 'init-03',
    approver: 'Operating Director',
    status: 'REJECTED',
    decisionRequired: 'Provision API access token to Google Search Endpoint for Research Agent',
    approvalMeans: 'Admins Escrow Multi-Sig check',
    riskLevel: 'MEDIUM',
    createdAt: '2026-05-22T14:20:00Z',
    updatedAt: '2026-05-22T16:00:00Z'
  }
];
