export interface NodeMeta {
  id: string;
  label: string;
  category:
    | 'Strategic Authority'
    | 'Operational Governance'
    | 'Workflow Orchestration'
    | 'Production'
    | 'Review / Approval'
    | 'Publishing / Distribution'
    | 'Intelligence / Learning'
    | 'System Infrastructure'
    | 'AI Agent';
  role: string;
  status: 'LIVE' | 'QUEUED_BLOCKED' | 'NOT_STARTED' | 'UNLOCKED';
  hardware: string;
  backlog: number;
  isAi: boolean;
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
}

export interface VectorMeta {
  id: string;
  from: string;
  to: string;
  label: string;
  latencyS: number;
  status: 'ACTIVE' | 'STANDBY' | 'BLOCKED';
  phases: Array<'crawl' | 'walk' | 'run' | 'ops'>;
  description: string;
}

export interface StrategicInitiative {
  id: string;
  name: string;
  stage: 'crawl' | 'walk' | 'run' | 'ops';
  status: 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'COMPLETED';
  owner: string;
  successDefinition: string;
  sourceFile: string;
  downstreamWorkflows: string[];
  activeConstraints: string[];
  currentApprovalStatus: 'PENDING_FOUNDER' | 'APPROVED' | 'REJECTED' | 'STAGED';
  nextAction: string;
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  layer: string;
  status: 'LIVE' | 'QUEUED' | 'PLANNED';
  mandate: string;
  allowedActions: string[];
  forbiddenActions: string[];
  sourceFiles: string[];
  skills: string[];
  outputs: string[];
  dashboardRole: string;
}

export interface Workflow {
  id: string;
  initiativeId: string;
  ownerAgent: string;
  phase: 'planning' | 'approval' | 'production' | 'review' | 'publishing' | 'analytics' | 'learning';
  outputFolder: string;
  recommendationPacket: {
    title: string;
    description: string;
    riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'STAGED';
  };
  workflowPlan: string[];
  domainDispatch: string;
  constraintsCheck: boolean;
  status: 'ACTIVE' | 'BLOCKED' | 'COMPLETED' | 'QUEUED';
  blockedBy?: string;
  nextAction: string;
}

export interface Task {
  id: string;
  workflowId: string;
  task: string;
  owner: string;
  estimatedHours: number;
  dependsOn: string[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  statusNote: string;
  approvalRequired: boolean;
}

export interface ApprovalItem {
  id: string;
  itemType: string;
  itemPath: string;
  initiativeId: string;
  approver: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decisionRequired: string;
  approvalMeans: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export interface ConstraintCheck {
  id: string;
  initiativeId: string;
  constraint: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  note: string;
  sourceFile: string;
  checkedAt: string;
}

export interface DispatchBrief {
  id: string;
  initiativeId: string;
  receivingAgent: string;
  task: string;
  context: string;
  successCriteria: string;
  relevantConstraints: string[];
  principle7Verified: boolean;
  status: 'DISPATCHED' | 'QUEUED' | 'BLOCKED';
}

export interface LearningLogEntry {
  id: string;
  source: string;
  observation: string;
  evidence: string;
  interpretation: string;
  confidence: number; // e.g. 0.95
  recommendedAction: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'IMPLEMENTED';
  memoryUpdateRecommended: boolean;
}
