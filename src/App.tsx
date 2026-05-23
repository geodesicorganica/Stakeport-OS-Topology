/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  Database,
  Shield,
  Send,
  Workflow,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Terminal,
  Layers,
  Sliders,
  Sparkles,
  Search,
  Trash2,
  ArrowRight,
  Info,
  Zap,
  HelpCircle,
  Settings,
  ArrowUpRight,
  Compass,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Eye,
  User,
  Bot,
  FileText,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  TrendingUp,
  BarChart2,
  BookOpen,
  Briefcase,
  Layers3,
  LockKeyhole,
  FolderGit2,
  Network,
  History
} from 'lucide-react';

import {
  NodeMeta,
  VectorMeta,
  StrategicInitiative,
  Agent,
  Workflow as OsWorkflow,
  Task,
  ApprovalItem,
  ConstraintCheck,
  DispatchBrief,
  LearningLogEntry,
  NodeStatus
} from './types/os';

import { phaseNodeCoords, baseNodes, baseVectors } from './data/topology';
import { seededInitiatives } from './data/initiatives';
import { seededAgents } from './data/agents';
import { seededApprovals } from './data/approvals';
import { seededWorkflows } from './data/workflows';
import { seededLearningLog } from './data/learningLog';
import { seededDispatches } from './data/dispatches';
import { seededConstraints } from './data/constraints';

import { FounderDashboard } from './components/FounderDashboard';
import { WorkflowsDashboard } from './components/WorkflowsDashboard';
import { AgentsDashboard } from './components/AgentsDashboard';
import { LearningDashboard } from './components/LearningDashboard';

interface LogEntry {
  id: string;
  timestamp: string;
  source: 'SYS' | 'POD' | 'SEC' | 'DB';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

interface DBRecord {
  id: string;
  key: string;
  type: string;
  phase: string;
  status: 'PENDING' | 'APPROVED' | 'IN_REVIEW' | 'ARCHIVED';
  latency: string;
}

interface TracerState {
  active: boolean;
  type: 'LOW_RISK' | 'HIGH_RISK' | 'LEARNING' | null;
  step: number;
  currentNodeId: string | null;
  packetName: string;
  payloadSize: string;
}

// Nested microservices for Detailed Diagram mode
interface SubService {
  name: string;
  icon: string;
  status: string;
  role: string;
}

const microservices: Record<string, SubService[]> = {
  Content: [
    { name: 'Ingress Webhook Router', icon: 'Cpu', status: 'ONLINE', role: 'Main Entry' },
    { name: 'SSL Payload Decryptor', icon: 'Shield', status: 'ONLINE', role: 'Security' },
    { name: 'JSON Parsing Engine', icon: 'Cpu', status: 'ONLINE', role: 'Compute' }
  ],
  NotionDB: [
    { name: 'Schema Sync Daemon', icon: 'RefreshCw', status: 'ONLINE', role: 'Notion Sync' },
    { name: 'Local Cache Mirror', icon: 'Database', status: 'ONLINE', role: 'Memory DB' },
    { name: 'Data Validator Core', icon: 'CheckCircle2', status: 'ONLINE', role: 'Compliance' }
  ],
  Governance: [
    { name: 'Consensus Signatures A1', icon: 'Shield', status: 'ONLINE', role: 'Crypt Sign' },
    { name: 'Quorum Multi-Sig A2', icon: 'Sliders', status: 'ONLINE', role: 'Audit Quorum' },
    { name: 'L3 Ultimate Escrow Signer', icon: 'Shield', status: 'ONLINE', role: 'Security' }
  ],
  RiskRouting: [
    { name: 'Anomaly Heuristic Scanner', icon: 'Search', status: 'ONLINE', role: 'Threat Scan' },
    { name: 'Audit Sandbox Controller', icon: 'Sliders', status: 'ONLINE', role: 'Environment' }
  ],
  Distribution: [
    { name: 'Edge CDN Caching Node', icon: 'Layers', status: 'ONLINE', role: 'Akamai Dev' },
    { name: 'Purge Gateway Router', icon: 'Send', status: 'ONLINE', role: 'Egress Point' }
  ]
};

const renderSubIcon = (icon: string, className?: string) => {
  switch (icon) {
    case 'Cpu': return <Cpu className={className} />;
    case 'Database': return <Database className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'RefreshCw': return <RefreshCw className={className} />;
    case 'CheckCircle2': return <CheckCircle2 className={className} />;
    case 'Sliders': return <Sliders className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Search': return <Search className={className} />;
    case 'AlertTriangle': return <AlertTriangle className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Send': return <Send className={className} />;
    default: return <Cpu className={className} />;
  }
};

export default function App() {
  // Global States
  const [activePhase, setActivePhase] = useState<'crawl' | 'walk' | 'run' | 'ops'>('crawl');
  const [activeTab, setActiveTab] = useState<'topology' | 'founder' | 'contentOs' | 'agents' | 'learning'>('topology');
  const [customNodeStatuses, setCustomNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('founder_ceo');
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLogLevel, setFilterLogLevel] = useState<'all' | 'info' | 'warn' | 'success'>('all');

  // Interactive Map Pan/Zoom & Diagram Mode States
  const [zoom, setZoom] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 10 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [diagramMode, setDiagramMode] = useState<'standard' | 'detailed'>('detailed');
  const [isTopologyFullscreen, setIsTopologyFullscreen] = useState<boolean>(false);

  // Zoom & Pan Handler Functions
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const zoomFactor = 0.08;
    const nextZoom = e.deltaY < 0 ? Math.min(zoom + zoomFactor, 2.5) : Math.max(zoom - zoomFactor, 0.4);
    setZoom(parseFloat(nextZoom.toFixed(2)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select')) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };
  
  // Custom Controls
  const [ingressRate, setIngressRate] = useState<number>(120);
  const [autoEscalateRisk, setAutoEscalateRisk] = useState<boolean>(true);
  const [manualPacketName, setManualPacketName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom interactive thresholds for nodes
  const [governanceStrictness, setGovernanceStrictness] = useState<'low' | 'medium' | 'strict'>('strict');
  const [cdnCaching, setCdnCaching] = useState<boolean>(true);
  const [vectorSpeeds, setVectorSpeeds] = useState<Record<string, number>>({});

  // Core Stakeport Dynamic State Registers
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>(seededInitiatives);
  const [agents, setAgents] = useState<Agent[]>(seededAgents);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(seededApprovals);
  const [workflows, setWorkflows] = useState<OsWorkflow[]>(seededWorkflows);
  const [learningLog, setLearningLog] = useState<LearningLogEntry[]>(seededLearningLog);
  const [dispatches, setDispatches] = useState<DispatchBrief[]>(seededDispatches);
  const [constraints, setConstraints] = useState<ConstraintCheck[]>(seededConstraints);

  // Step-by-Step Tracer engine state
  const [tracer, setTracer] = useState<TracerState>({
    active: false,
    type: null,
    step: -1,
    currentNodeId: null,
    packetName: '',
    payloadSize: '',
  });
  const [isTracerAutoplay, setIsTracerAutoplay] = useState<boolean>(false);

  // Seeded DB Store (simulating shared memory registries)
  const [dbRecords, setDbRecords] = useState<DBRecord[]>([
    { id: 'rec-101', key: 'shared/positioning.md', type: 'Markdown Source', phase: 'Crawl', status: 'APPROVED', latency: '4ms' },
    { id: 'rec-102', key: 'agents/founder/outputs/strategic_directives.md', type: 'Markdown Source', phase: 'Crawl', status: 'APPROVED', latency: '6ms' },
    { id: 'rec-103', key: 'agents/chief-of-staff/skills/workflow-planning/schema.json', type: 'Schema Mappings', phase: 'Crawl', status: 'IN_REVIEW', latency: '22ms' },
    { id: 'rec-104', key: 'shared/audiences.md', type: 'JSON Ruleset', phase: 'Walk', status: 'PENDING', latency: '40ms' },
  ]);

  // Phase compliance checklists
  const phaseGoals: Record<'crawl' | 'walk' | 'run' | 'ops', Array<{ id: string; text: string; completed: boolean }>> = {
    crawl: [
      { id: 'tc-1', text: 'Lock content pipeline: founder approval required for Recommendation Packets before execution.', completed: true },
      { id: 'tc-2', text: 'De-register and disable any direct-publish check rules.', completed: true },
      { id: 'tc-3', text: 'Verify live Status for Founder Agent & Chief of Staff Agent.', completed: true },
    ],
    walk: [
      { id: 'tw-1', text: 'Deploy Sprint Manager & AI Research Agent node credentials.', completed: false },
      { id: 'tw-2', text: 'Establish relational schema structures with active Notion database mappings.', completed: false },
      { id: 'tw-3', text: 'Validate human executive approval token verification loops over drafts.', completed: false },
    ],
    run: [
      { id: 'tr-1', text: 'Activate automated SEO keyword map crawlers and Drafting compilers.', completed: false },
      { id: 'tr-2', text: 'Deploy Legal & Brand review constraint audits on all queued logs.', completed: false },
      { id: 'tr-3', text: 'Route Google Analytics traffic data dynamically to the Feedback Director.', completed: false },
    ],
    ops: [
      { id: 'to-1', text: 'Achieve fully decentralized autonomous digital agent pipelines.', completed: false },
      { id: 'to-2', text: 'Enable self-healing memory updates using automated Vector storage overrides.', completed: false },
      { id: 'to-3', text: 'Verify cross-pod backup failsafes and human founder-in-the-loop signing controls.', completed: false },
    ],
  };

  const [checklist, setChecklist] = useState(phaseGoals);

  // Initialize kernel logs
  useEffect(() => {
    addLog('SYS', 'info', 'Stakeport OS Core Topology Engine starting operational crawl initialization...');
    addLog('SYS', 'success', 'Kernel v2.5 initialized. Zero-Bypass security enforcement enabled.');
    addLog('DB', 'info', `Shared memory registry mounted. Loaded ${dbRecords.length} system context references.`);
  }, []);

  // Handle auto playing tracer step intervals
  useEffect(() => {
    if (!tracer.active || !isTracerAutoplay) return;

    const timer = setTimeout(() => {
      handleTracerAdvance();
    }, 1800);

    return () => clearTimeout(timer);
  }, [tracer.active, tracer.step, isTracerAutoplay]);

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    if (!isTopologyFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTopologyFullscreen(false);
        setZoom(0.65);
        setPan({ x: 20, y: 10 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTopologyFullscreen]);

  const addLog = (source: 'SYS' | 'POD' | 'SEC' | 'DB', level: 'info' | 'warn' | 'error' | 'success', message: string) => {
    const timeStr = new Date().toISOString().slice(11, 19);
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      source,
      level,
      message,
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  };

  // Dynamically computed nodes list
  const nodes: NodeMeta[] = baseNodes.map((base) => {
    const coords = phaseNodeCoords[activePhase][base.id] || { x: 50, y: 50, status: 'NOT_STARTED' };
    
    // Calculate custom backlog metric
    let backlog = 0;
    if (base.id === 'executive_approver') {
      backlog = approvals.filter(a => a.status === 'PENDING').length;
    } else if (base.id === 'workflow_orch_system') {
      backlog = workflows.filter(w => w.status === 'ACTIVE').length;
    } else if (base.id === 'feedback_director') {
      backlog = learningLog.filter(l => l.approvalStatus === 'PENDING').length;
    }

    if (tracer.currentNodeId === base.id) {
      backlog += 1;
    }

    return {
      ...base,
      x: coords.x,
      y: coords.y,
      status: customNodeStatuses[base.id] || coords.status,
      backlog,
    } as NodeMeta;
  });

  // Dynamic vector filtering based on phase representation
  const vectors: VectorMeta[] = baseVectors;

  // Manual trace trigger
  const handleStartTracer = (type: 'LOW_RISK' | 'HIGH_RISK' | 'LEARNING') => {
    const defaultLowPrefixes = ['shared/messaging-pillars.md', 'agents/chief-of-staff/outputs/launch-marketing-website/initiative_brief.md', 'shared/voice-and-tone.md'];
    const defaultHighPrefixes = ['agents/chief-of-staff/outputs/launch-marketing-website/recommendation_packet.md', 'agents/chief-of-staff/outputs/launch-marketing-website/constraints_check.md', 'agents/chief-of-staff/outputs/launch-marketing-website/domain_dispatch.md'];
    const defaultLearnPrefixes = ['learn-001-observation_metrics', 'learn-002-observation_metrics'];
    
    const packetName = manualPacketName.trim() || (type === 'LOW_RISK' 
      ? defaultLowPrefixes[Math.floor(Math.random() * defaultLowPrefixes.length)]
      : type === 'HIGH_RISK'
        ? defaultHighPrefixes[Math.floor(Math.random() * defaultHighPrefixes.length)]
        : defaultLearnPrefixes[Math.floor(Math.random() * defaultLearnPrefixes.length)]
    );

    addLog('SYS', 'info', `MANUAL STAKEPORT OS TRACER DISPATCHED: Tracing ${type} operational flow for '${packetName}'.`);

    // Choose step 0 node
    const firstNode = type === 'LOW_RISK' 
      ? 'content_strategist' 
      : type === 'HIGH_RISK'
        ? 'growth_strategy'
        : 'analytics_stack';

    setTracer({
      active: true,
      type,
      step: 0,
      currentNodeId: firstNode,
      packetName,
      payloadSize: type === 'LOW_RISK' ? '14.2 KB' : type === 'HIGH_RISK' ? '128.5 KB' : '8.4 KB',
    });
    setManualPacketName('');
    setIsTracerAutoplay(false);
  };

  const getTracerPipelineSteps = () => {
    if (!tracer.active) return [];
    if (tracer.type === 'HIGH_RISK') {
      return [
        { id: 0, label: '01 Growth Strat', node: 'growth_strategy', role: 'Campaign Strategy Owner' },
        { id: 1, label: '02 Workflow Orch', node: 'workflow_orch_system', role: 'COS Sprint Handler' },
        { id: 2, label: '03 Fact Check', node: 'fact_checker', role: 'Technical Compliance' },
        { id: 3, label: '04 Brand Check', node: 'brand_reviewer', role: 'Identity Auditor' },
        { id: 4, label: '05 Legal Review', node: 'legal_reviewer', role: 'Regulation Sentinel' },
        { id: 5, label: '06 Executive Auth', node: 'executive_approver', role: 'Founder Approval Required' },
        { id: 6, label: '07 Web Release', node: 'web_publisher', role: 'CMS CDN Dispatch' },
      ];
    } else if (tracer.type === 'LOW_RISK') {
      return [
        { id: 0, label: '01 CoS Plan', node: 'content_strategist', role: 'Strategic Planning' },
        { id: 1, label: '02 Workflow Orch', node: 'workflow_orch_system', role: 'COS Sprint Handler' },
        { id: 2, label: '03 Draft Write', node: 'content_writer', role: 'Content Writer (BLOCKED in Crawl)' },
        { id: 3, label: '04 Fact Check', node: 'fact_checker', role: 'Verity Audit' },
        { id: 4, label: '05 Executive Auth', node: 'executive_approver', role: 'Founder Token Verification' },
        { id: 5, label: '06 CMS Deploy', node: 'cms', role: 'Static Site Publisher' },
      ];
    } else {
      // Learning Log Path
      return [
        { id: 0, label: '01 GA Traffic', node: 'analytics_stack', role: 'Telemetry Collector' },
        { id: 1, label: '02 Feed Audit', node: 'feedback_director', role: 'Discrepancy Auditor' },
        { id: 2, label: '03 Memory Proposal', node: 'learning_log_compilers', role: 'Memory Update Compiler' },
        { id: 3, label: '04 SOT Map Update', node: 'founder_agent', role: 'Shared Context Write' },
      ];
    }
  };

  const activePipelineSteps = getTracerPipelineSteps();

  const handleTracerAdvance = () => {
    if (!tracer.active) return;

    const currentStep = tracer.step;
    const type = tracer.type;
    const steps = activePipelineSteps;

    // High risk tracer flow must stop at executive_approver pending approval.
    if (type === 'HIGH_RISK' && steps[currentStep]?.node === 'executive_approver') {
      const matchingApproval = approvals.find(a => a.itemPath.includes(tracer.packetName));
      const isApproved = matchingApproval && matchingApproval.status === 'APPROVED';

      if (!isApproved) {
        setIsTracerAutoplay(false);
        addLog('SEC', 'warn', `Tracer high-risk flow stopped at [Executive Approver]. Pending human-in-the-loop Founder approval.`);
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      const nextNodeId = steps[nextStepIndex].node;
      setTracer(prev => ({ ...prev, step: nextStepIndex, currentNodeId: nextNodeId }));
      
      const sourceLogNode = steps[currentStep].node;
      addLog('SYS', 'success', `Tracer payload [${tracer.packetName}] advanced from [${sourceLogNode}] ➔ [${nextNodeId}].`);

      if (nextNodeId === 'executive_approver') {
        // Automatically inject an approval queue item!
        const match = approvals.some(a => a.itemPath.includes(tracer.packetName));
        if (!match) {
          const newItem: ApprovalItem = {
            id: `appr-${Date.now()}`,
            itemType: `Pipeline Release: ${tracer.packetName}`,
            itemPath: `/workflows/wf-tr/${tracer.packetName}`,
            initiativeId: 'init-02',
            approver: type === 'HIGH_RISK' ? 'Founder / CEO' : 'Chief of Staff',
            status: 'PENDING',
            decisionRequired: `Automatic tracing triggered verification review for content routing. Ensure bypass filters are locked.`,
            approvalMeans: type === 'HIGH_RISK' ? 'Founder OS Authentication Prompt' : 'CO_STAFF System Key Signature',
            riskLevel: type === 'HIGH_RISK' ? 'HIGH' : 'LOW',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setApprovals(prev => [newItem, ...prev]);
          addLog('SEC', 'warn', `Tracer entered [Executive Approver] - Generated PENDING Approval Item in queue.`);
        }
      }
    } else {
      handleTracerComplete();
    }
  };

  const handleTracerComplete = () => {
    addLog('SYS', 'success', `STAKEPORT OS OPERATIONAL WORKFLOW COMPLETED: Verified tracing run finished successfully for [${tracer.packetName}].`);
    
    // Auto insert an approved or pending review record into Notion DB simulation:
    const customId = `rec-gen-${Date.now()}`;
    const newDbEntry: DBRecord = {
      id: customId,
      key: tracer.packetName,
      type: tracer.type === 'LOW_RISK' 
        ? 'Verified Low-Risk Content' 
        : tracer.type === 'HIGH_RISK' 
          ? 'Staged Campaign Token' 
          : 'Memory Update Proposed',
      phase: activePhase.toUpperCase(),
      status: tracer.type === 'HIGH_RISK' 
        ? 'IN_REVIEW' 
        : tracer.type === 'LOW_RISK' 
          ? 'PENDING' 
          : 'IN_REVIEW',
      latency: '2ms',
    };
    setDbRecords(prev => [newDbEntry, ...prev]);

    // Clear tracer
    setTracer({
      active: false,
      type: null,
      step: -1,
      currentNodeId: null,
      packetName: '',
      payloadSize: '',
    });
    setIsTracerAutoplay(false);
  };

  const handleResetTracer = () => {
    setTracer({
      active: false,
      type: null,
      step: -1,
      currentNodeId: null,
      packetName: '',
      payloadSize: '',
    });
    setIsTracerAutoplay(false);
    addLog('SYS', 'warn', 'Stakeport OS interactive trace session cancelled by operator.');
  };

  // Checklist updates on the fly
  const handleToggleGoal = (id: string) => {
    setChecklist(prev => {
      const updatedGoals = prev[activePhase].map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      return {
        ...prev,
        [activePhase]: updatedGoals
      };
    });
    addLog('SYS', 'info', `State checkbox toggled on active checklist row: ${id}`);
  };

  // Phase selection controller
  const selectPhase = (phase: 'crawl' | 'walk' | 'run' | 'ops') => {
    setActivePhase(phase);
    addLog('SYS', 'warn', `OPERATING SCALE CRITERIA ALTERED ➔ CALIBRATING OVERLAYS FOR "${phase.toUpperCase()}" PHASE.`);
    
    if (phase === 'crawl') {
      setIngressRate(120);
      addLog('POD', 'info', 'Crawl configurations activated: Zero-Bypass security active, manual bottlenecks simulated.');
    } else if (phase === 'walk') {
      setIngressRate(480);
      addLog('POD', 'success', 'Walk configurations activated: Notion Core relational DB model sync online.');
    } else if (phase === 'run') {
      setIngressRate(1150);
      addLog('POD', 'success', 'Run configurations activated: background content automation pipelines online.');
    } else {
      setIngressRate(2420);
      addLog('POD', 'success', 'Autonomous OPS scales active: self-healing multi-node consensus online.');
    }
  };

  // Database filtering criteria
  const filteredRecords = dbRecords.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return rec.key.toLowerCase().includes(q) || rec.type.toLowerCase().includes(q) || rec.status.toLowerCase().includes(q);
  });

  // Helper properties to check highlighted active vector lines on map
  const isVectorHighlighted = (from: string, to: string) => {
    if (!tracer.active) return false;
    
    const stepIndex = tracer.step;
    if (stepIndex <= 0) return false;

    const currentTraceNodes = activePipelineSteps.map(s => s.node);
    const traceSource = currentTraceNodes[stepIndex - 1];
    const traceTarget = currentTraceNodes[stepIndex];

    return (traceSource === from && traceTarget === to);
  };

  return (
    <div id="stakeport-fluid-layout" className="w-full h-screen bg-obsidian text-slate-305 font-sans flex flex-col justify-between overflow-hidden text-[13px] select-none">
      
      {/* HUD OVERVIEW BAR */}
      <header id="hud-topline-header" className="h-16 shrink-0 border-b border-slate-700 bg-midnight px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="shrink-0 flex items-center justify-center">
            <svg width="34" height="34" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="26" fill="none" stroke="#2D6FE8" strokeWidth="2.5" opacity="0.8"/>
              <circle cx="28" cy="28" r="17" fill="#2D6FE8" opacity="0.15"/>
              <circle cx="28" cy="28" r="10" fill="#1B3B8A"/>
              <text x="28" y="32" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontSize="12" fontWeight="900" fill="#EBF0FF">SP</text>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold tracking-[0.16em] text-[15px] uppercase text-vortex-blue leading-none">STAKEPORT</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono tracking-tighter border border-slate-700">v1.0_PROD</span>
            </div>
            <p className="text-[10px] text-type-secondary font-sans font-medium tracking-wide">The institutional management platform for staked assets</p>
          </div>
        </div>

        {/* PHASE STATUS DISPLAYS */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>OPERATIONAL SCALING FACTOR: <strong className="text-white font-bold">{activePhase.toUpperCase()} PHASE</strong></span>
          </div>
          <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>NOTION REGISTRY: <strong className="text-white font-bold">{dbRecords.length} DEFINED KEYS</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-amber-500 font-bold" />
            <span>HEURISTIC AUDITING: <strong className="text-white font-bold">{autoEscalateRisk ? 'ENABLED' : 'DISABLED'}</strong></span>
          </div>
        </div>

        {/* CONTROLLER HEADER TRIGGERS */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] rounded uppercase font-bold tracking-widest font-mono anim-pulse">
            Active: System Live
          </div>
          <button
            onClick={() => {
              setDbRecords([
                { id: 'rec-101', key: 'shared/company-overview.md', type: 'Markdown Context', phase: 'Crawl', status: 'APPROVED', latency: '12ms' },
                { id: 'rec-102', key: 'agents/chief-of-staff/skills/workflow-planning/schema.json', type: 'Schema Mapping', phase: 'Crawl', status: 'APPROVED', latency: '14ms' },
                { id: 'rec-103', key: 'agents/chief-of-staff/outputs/launch-marketing-website/initiative_brief.md', type: 'Workflow Brief', phase: 'Walk', status: 'IN_REVIEW', latency: '22ms' },
              ]);
              setLogs([]);
              addLog('SYS', 'warn', 'Operating variables re-calibrated. Relational buffers flushed to core defaults.');
              handleResetTracer();
            }}
            className="px-2.5 py-1 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded uppercase font-bold tracking-wider flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Re-sync OS
          </button>
        </div>
      </header>

      {/* THREE PANELS CONTAINER */}
      <div id="central-rig-layout" className="flex-1 flex overflow-hidden w-full">
        
        {/* PANEL 1: LEFT SIDE NAV - GOAL SETTING & PHASE SELECTOR */}
        <aside id="phased-implementation-panel" className="w-72 shrink-0 border-r border-slate-700 bg-midnight p-4 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-[10px] font-bold text-type-secondary uppercase tracking-widest font-mono">01 / Phased Infrastructure</h2>
                <span className="w-2 h-2 rounded-full bg-vortex-blue animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mb-3">
                Transition through phases to open relational mapping and security routes.
              </p>

              {/* STAGES CONTAINER */}
              <div className="space-y-2">
                {[
                  { phase: 'crawl', label: '01 CRAWL', desc: 'Pod gate separation: manual approval gate enabled; no public publishing without founder approval.' },
                  { phase: 'walk', label: '02 WALK', desc: 'Establish human core reviews with Notion relational API sync.' },
                  { phase: 'run', label: '03 RUN', desc: 'Fully automated telemetry logs & automated dynamic threat scanning.' },
                  { phase: 'ops', label: '04 FULL OPS', desc: 'Complete decentralized autonomy & cross-pod redundant failsafes.' },
                ].map((item) => {
                  const p = item.phase as 'crawl' | 'walk' | 'run' | 'ops';
                  const active = activePhase === p;
                  let borderCol = 'border-slate-850 hover:bg-slate-900/40 text-slate-500';
                  let cardBg = 'bg-slate-950/40 text-slate-400';
                  let activeBadge = 'text-slate-600';

                  if (active) {
                    if (p === 'crawl') { borderCol = 'border-emerald-500/80 bg-emerald-950/10 text-slate-100 shadow-[0_0_10px_rgba(16,185,129,0.15)]'; activeBadge = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'; }
                    if (p === 'walk') { borderCol = 'border-amber-500/80 bg-amber-950/10 text-slate-100 shadow-[0_0_10px_rgba(245,158,11,0.15)]'; activeBadge = 'bg-amber-500/20 text-amber-400 border border-amber-500/40'; }
                    if (p === 'run') { borderCol = 'border-cyan-500/80 bg-cyan-950/10 text-slate-100 shadow-[0_0_10px_rgba(6,182,212,0.15)]'; activeBadge = 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'; }
                    if (p === 'ops') { borderCol = 'border-purple-500/80 bg-purple-950/10 text-slate-100 shadow-[0_0_10px_rgba(168,85,247,0.15)]'; activeBadge = 'bg-purple-500/20 text-purple-400 border border-purple-500/40'; }
                  }

                  return (
                    <button
                      key={p}
                      onClick={() => selectPhase(p)}
                      className={`w-full text-left p-2.5 rounded border transition-all ${borderCol} ${active ? '' : cardBg}`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[11px] font-black tracking-wider uppercase font-mono">{item.label}</span>
                        {active ? (
                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded uppercase font-mono ${activeBadge}`}>ACTIVE</span>
                        ) : (
                          <span className="text-[8px] text-slate-600 font-mono">STANDBY</span>
                        )}
                      </div>
                      <p className="text-[10px] leading-snug font-normal text-slate-400">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* CHECKLIST STEPS */}
            <div className="border-t border-slate-800 pt-3">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Phase Compliance Rules
              </h3>
              
              <div className="space-y-1.5">
                {checklist[activePhase].map((goal) => (
                  <div
                    key={goal.id}
                    onClick={() => handleToggleGoal(goal.id)}
                    className="flex items-start gap-2 p-2 rounded bg-slate-950/50 hover:bg-slate-900 border border-slate-850 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => {}} // Hooked into parent onClick action
                      className="mt-0.5 w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className={`text-[10.5px] leading-tight ${goal.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                      {goal.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* SIMULATED CONSTANTS SETTINGS */}
          <div className="border-t border-slate-800 pt-3 mt-4 space-y-3 font-mono text-[10.5px]">
            
            <div>
              <div className="flex justify-between items-center mb-1 text-[9.5px] uppercase text-slate-500">
                <span>Ingress Pressure Rate:</span>
                <span className="text-white font-bold font-mono">{ingressRate} files/m</span>
              </div>
              <input
                type="range"
                min="50"
                max="2500"
                step="50"
                value={ingressRate}
                onChange={(e) => {
                  setIngressRate(Number(e.target.value));
                  addLog('SYS', 'info', `Ingress frequency rate rescheduled to standard ${e.target.value} elements per minute.`);
                }}
                className="w-full accent-emerald-500 h-1 bg-slate-800 rounded cursor-ew-resize"
              />
            </div>

            <div className="space-y-1">
              <span className="text-slate-500 block text-[9.5px] uppercase">TOPOLOGY CONSTANTS:</span>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">BYPASS PLANK PREVENTED:</span>
                <span className="text-emerald-400 font-bold text-[8.5px] uppercase bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30 font-mono tracking-tight select-none">
                  LOCKED ENFORCED
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">EDGE CDN LOCAL PRE-CACHE:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCdnCaching(!cdnCaching);
                    addLog('POD', 'info', `Distribution parameters: edge caching model switched to ${!cdnCaching ? 'OPTIMISTIC' : 'SAFE-CHECK'}.`);
                  }}
                  className={`px-1 rounded text-[8px] tracking-widest font-bold underline ${cdnCaching ? 'text-cyan-400' : 'text-slate-500'}`}
                >
                  {cdnCaching ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

          </div>

        </aside>

        {/* PANEL 2: MIDDLE COMPONENT - INTERACTIVE TOPOLOGY GRAPH & DISPATCH TRACER */}
        <main id="topology-visualizer-and-tracer" className="flex-1 flex flex-col p-5 gap-4 overflow-hidden relative">
          
          {/* SUB-TABS SELECTOR HEADER BAR */}
          <div className="flex border-b border-slate-700 pb-1.5 shrink-0 select-none z-10 gap-1 flex-wrap">
            {[
              { id: 'topology', label: 'Topology Map', icon: Compass, color: 'text-vortex-blue border-vortex-blue' },
              { id: 'founder', label: 'Founder Governance', icon: Shield, color: 'text-vortex-blue border-vortex-blue' },
              { id: 'contentOs', label: 'Content OS Workflows', icon: Workflow, color: 'text-vortex-blue border-vortex-blue' },
              { id: 'agents', label: 'Domain Agents Control', icon: Bot, color: 'text-vortex-blue border-vortex-blue' },
              { id: 'learning', label: 'Learned Insights', icon: Sparkles, color: 'text-vortex-blue border-vortex-blue' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    addLog('SYS', 'info', `Navigated to dashboard sector: ${tab.label}`);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10.5px] font-black uppercase tracking-wider border-b-2 transition-all ${
                    active
                      ? `${tab.color} text-white bg-slate-800/40 rounded-t-lg`
                      : 'border-transparent text-slate-500 hover:text-slate-350 hover:bg-slate-800/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'topology' && (
            <>
              {isTopologyFullscreen && (
                <div
                  id="topology-backdrop"
                  onClick={() => {
                    setIsTopologyFullscreen(false);
                    setZoom(0.65);
                    setPan({ x: 20, y: 10 });
                  }}
                  className="fixed inset-0 bg-obsidian/90 [backdrop-filter:blur(8px)] z-[99]"
                />
              )}
              {/* VISUAL TOPOLOGY OVERLAY CANVAS CONTAINER */}
              <section
                id="interactive-topology-canvas"
                className={`flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${
                  isTopologyFullscreen
                    ? 'fixed inset-0 w-screen h-screen bg-obsidian border-0 rounded-none p-4 z-[100]'
                    : 'flex-1 border border-slate-700 bg-midnight rounded-xl px-6 py-4 shadow-[inset_0_0_35px_rgba(0,0,0,0.7)]'
                }`}
              >
                
                {/* Header label and key indicators */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-vortex-blue" />
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">STAKEPORT VORTEX MAP VIEW</span>
                    <div className="flex items-center gap-1.5 text-xs text-white uppercase font-black tracking-wider">
                      <span>ACTIVE ALLOCATION TOPOLOGY</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-vortex-blue animate-ping"></span>
                    </div>
                  </div>
                </div>
                
                <div className="absolute top-4 right-4 z-50 flex items-center gap-2 font-mono text-[9px] select-none">
                  <span className="px-2 py-0.5 bg-obsidian border border-slate-700 text-slate-400 rounded">
                    CALIBRATED LATENCY: {Object.keys(vectorSpeeds).reduce((acc, key) => acc + (vectorSpeeds[key] || 0), 0)}ms
                  </span>
                  <span className="px-2 py-0.5 bg-obsidian border border-vortex-blue/30 text-vortex-blue rounded block font-bold anim-pulse">
                    VORTEX RESOLVER OK
                  </span>
                  {isTopologyFullscreen && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsTopologyFullscreen(false);
                        setZoom(0.65);
                        setPan({ x: 20, y: 10 });
                      }}
                      className="px-2.5 py-1 bg-red-950/80 border border-red-500/40 text-red-400 hover:bg-red-950 hover:text-red-300 rounded font-bold font-sans text-[9px] flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    >
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <span>CLOSE</span>
                    </button>
                  )}
                </div>

            {/* HIGH DENSITY MAP GRAPH WITH FULL MICROSERVICE REGISTRIES & PAN/ZOOM CAPABILITIES */}
            
            {/* Mode selection floating pill */}
            <div className="absolute top-16 left-4 z-30 flex border border-slate-700 bg-obsidian/90 rounded-lg p-1 text-[9.5px] select-none shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setDiagramMode('standard')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all font-bold uppercase ${
                  diagramMode === 'standard'
                    ? 'bg-slate-800 border border-slate-700 text-vortex-blue shadow-inner'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Pods Overview
              </button>
              <button
                type="button"
                onClick={() => setDiagramMode('detailed')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all font-bold uppercase ${
                  diagramMode === 'detailed'
                    ? 'bg-slate-800 border border-slate-700 text-vortex-blue shadow-inner'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Full Stack Detailed
              </button>
            </div>

            {/* Floating zoom controls overlay panel */}
            <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2 bg-obsidian/95 border border-slate-700 rounded-lg p-2 select-none shadow-2xl backdrop-blur-md">
              {/* Pan Navigation direction fallbacks */}
              <div className="grid grid-cols-3 gap-0.5 mr-2 border-r border-slate-700 pr-2">
                <div />
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, y: p.y + 40 }))}
                  className="p-1 text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 font-bold"
                  title="Pan Up"
                >
                  ▲
                </button>
                <div />
                
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, x: p.x + 40 }))}
                  className="p-1 text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 font-bold"
                  title="Pan Left"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isTopologyFullscreen) {
                      setZoom(0.55);
                      setPan({ x: 0, y: 0 });
                    } else {
                      setZoom(0.65);
                      setPan({ x: 20, y: 10 });
                    }
                  }}
                  className="p-1 text-[8.5px] bg-slate-800 hover:bg-slate-700 text-vortex-blue hover:text-vortex-blue/80 rounded border border-slate-700 font-black"
                  title="Center Viewport (Reset)"
                >
                  ●
                </button>
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, x: p.x - 40 }))}
                  className="p-1 text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 font-bold"
                  title="Pan Right"
                >
                  ▶
                </button>
                
                <div />
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, y: p.y - 40 }))}
                  className="p-1 text-[8px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 font-bold"
                  title="Pan Down"
                >
                  ▼
                </button>
              </div>

              <button
                type="button"
                onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
                className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 transition-colors"
                title="Zoom Out (-15%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <span className="font-mono text-[9px] text-white bg-slate-800 px-2 py-1 rounded border border-slate-700 font-bold shrink-0 min-w-[42px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors"
                title="Zoom In (+15%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isTopologyFullscreen) {
                    setIsTopologyFullscreen(true);
                    setZoom(0.55);
                    setPan({ x: 0, y: 0 });
                    addLog('SYS', 'success', 'Expanded topology sector: standard compliance maps loaded fullscreen.');
                  } else {
                    setIsTopologyFullscreen(false);
                    setZoom(0.65);
                    setPan({ x: 20, y: 10 });
                  }
                }}
                className={`px-2 py-1.5 border rounded text-[9px] font-mono font-bold transition-all ${
                  isTopologyFullscreen
                    ? 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/30'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-vortex-blue hover:text-vortex-blue/80'
                }`}
                title="Toggle Fullscreen View"
              >
                {isTopologyFullscreen ? 'EXIT' : 'FULLSCREEN'}
              </button>
            </div>

            {/* INTERACTIVE SCROLLABLE CANVAS CONTAINER */}
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onDoubleClick={() => {
                if (isTopologyFullscreen) {
                  setZoom(0.55);
                  setPan({ x: 0, y: 0 });
                } else {
                  setZoom(0.65);
                  setPan({ x: 20, y: 10 });
                }
              }}
              className={`flex-1 relative w-full ${isTopologyFullscreen ? 'h-full min-h-0' : 'h-full min-h-[560px]'} border border-slate-700 bg-obsidian rounded-xl overflow-hidden select-none transition-shadow ${
                isDragging ? 'cursor-grabbing shadow-[inset_0_0_50px_rgba(0,0,0,0.95)]' : 'cursor-grab'
              }`}
            >
              {/* Instructions Prompt Overlay */}
              <div className="absolute bottom-3 left-4 z-20 font-mono text-[9px] text-slate-500 pointer-events-none flex items-center gap-1.5 bg-obsidian border border-slate-700 px-2.5 py-1 rounded">
                <Move className="w-3.5 h-3.5 text-slate-400" />
                <span>Drag background to pan • Scroll / gestures to zoom • Double click to center</span>
              </div>

              {/* Master transformation wrapper */}
              <div
                className="absolute top-0 left-0 origin-top-left select-none"
                style={{
                  width: '1600px',
                  height: '1000px',
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transition: isDragging ? 'none' : 'transform 0.1s cubic-bezier(0.1, 0.8, 0.2, 1.0)',
                }}
              >
              
              {/* VECTORS: DIRECTIONAL SVG PATHS AND PULSES */}
              <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Directional markers to make visual flow completely visible */}
                  <marker
                    id="map-arrow-active"
                    viewBox="0 0 10 10"
                    refX="48" /* Adjusted offset to fit precisely at node circumference */
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
                  </marker>
                  
                  <marker
                    id="map-arrow-inactive"
                    viewBox="0 0 10 10"
                    refX="48"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
                  </marker>

                  <marker
                    id="map-arrow-blocked"
                    viewBox="0 0 10 10"
                    refX="48"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                  </marker>

                  <marker
                    id="map-arrow-highlight"
                    viewBox="0 0 10 10"
                    refX="48"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                  </marker>

                  {/* Pulsing glow filter */}
                  <filter id="svg-neon-glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Render paths linking coordinates */}
                {vectors.filter(vec => vec.phases.includes(activePhase)).map((vec) => {
                  const fromNode = nodes.find((n) => n.id === vec.from);
                  const toNode = nodes.find((n) => n.id === vec.to);

                  if (!fromNode || !toNode) return null;

                  const x1 = fromNode.x * 10;
                  const y1 = fromNode.y * 10;
                  const x2 = toNode.x * 10;
                  const y2 = toNode.y * 10;

                  // Determine color based on active, inactive, blocked, or trace highlighted
                  const isTraceRoute = isVectorHighlighted(vec.from, vec.to);
                  const isVecTargeted = selectedVectorId === vec.id;
                  
                  let strokeCol = '#334155'; // Standby CJS/Node
                  let strokeWidth = '2';
                  let marker = 'url(#map-arrow-inactive)';
                  let strokeDash = '';
                  let filterGlow = '';

                  if (vec.status === 'BLOCKED') {
                    strokeCol = '#ef4444'; // Blocked
                    marker = 'url(#map-arrow-blocked)';
                    strokeDash = '3, 4';
                  } else if (isTraceRoute) {
                    strokeCol = '#38bdf8'; // Highlighted active tracing line
                    strokeWidth = '4.5';
                    marker = 'url(#map-arrow-highlight)';
                    filterGlow = 'url(#svg-neon-glow)';
                  } else if (isVecTargeted) {
                    strokeCol = '#10b981'; // Selection
                    strokeWidth = '3.5';
                    marker = 'url(#map-arrow-active)';
                    strokeDash = '1, 1';
                  } else if (vec.status === 'ACTIVE') {
                    strokeCol = '#10b981'; // Standard Active
                    strokeWidth = '2.5';
                    marker = 'url(#map-arrow-active)';
                  }

                  return (
                    <g key={vec.id}>
                      {/* Interactive background fat trigger line for easier hover */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="transparent"
                        strokeWidth="14"
                        className="cursor-pointer pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVectorId(vec.id);
                          setSelectedNodeId(null);
                        }}
                      />

                      {/* Actual rendered SVG connection line */}
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={strokeCol}
                        strokeWidth={strokeWidth}
                        markerEnd={marker}
                        strokeDasharray={strokeDash}
                        filter={filterGlow}
                        className="transition-all duration-300 pointer-events-none"
                      />

                      {/* Moving pulsing flow keyframe bubble inside ACTIVE ones */}
                      {vec.status === 'ACTIVE' && !tracer.active && (
                        <circle r="4" fill="#34d399" filter="url(#svg-neon-glow)">
                          <animateMotion
                            dur={`${(vec.latencyS / 8) + 1.2}s`}
                            repeatCount="indefinite"
                            path={`M ${fromNode.x * 10} ${fromNode.y * 10} L ${toNode.x * 10} ${toNode.y * 10}`} /* Simulated layout vector path */
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* TRACER ACTIVE IN-FLIGHT PULSING DOT OVERLAY */}
              {tracer.active && tracer.currentNodeId && (
                (() => {
                  const nodeObj = nodes.find(n => n.id === tracer.currentNodeId);
                  if (!nodeObj) return null;
                  
                  return (
                    <div
                      className="absolute z-30 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
                      style={{ left: `${nodeObj.x}%`, top: `${nodeObj.y}%` }}
                    >
                      <span className="absolute -inset-4 rounded-full bg-cyan-500/20 animate-ping border border-cyan-400"></span>
                      <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] flex items-center justify-center border-2 border-white">
                        <Zap className="w-3 h-3 text-slate-950 font-black animate-bounce" />
                      </div>
                    </div>
                  );
                })()
              )}

               {/* GRAPH NODES (WITH CONDITIONAL ENLARGEMENT CAPABILITY) */}
              {nodes.filter(n => phaseNodeCoords[activePhase][n.id] !== undefined).map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isCurrentTracerTarget = tracer.currentNodeId === node.id;
                
                let outlineColor = 'border-slate-700 bg-obsidian text-slate-300';
                let indicatorLight = 'bg-slate-600';
                let shadowGlow = '';

                if (node.status === 'LIVE') {
                  indicatorLight = 'bg-emerald-500 shadow-[0_0_10px_#10b981]';
                  outlineColor = 'border-slate-700 bg-obsidian text-slate-100';
                } else if (node.status === 'UNLOCKED') {
                  indicatorLight = 'bg-vortex-blue animate-pulse';
                  outlineColor = 'border-indigo-500 bg-obsidian text-slate-200';
                } else if (node.status === 'BLOCKED') {
                  indicatorLight = 'bg-red-500 animate-pulse';
                  outlineColor = 'border-red-900 bg-red-950/20 text-red-105';
                } else if (node.status === 'NOT_STARTED') {
                  indicatorLight = 'bg-slate-755';
                  outlineColor = 'border-slate-700 bg-obsidian/40 text-slate-505';
                }

                if (isCurrentTracerTarget) {
                  outlineColor = 'border-vortex-blue bg-slate-800/80 text-white';
                  shadowGlow = 'shadow-[0_0_25px_rgba(45,111,232,0.3)] ring-2 ring-vortex-blue/40';
                } else if (isSelected) {
                  outlineColor = node.status === 'BLOCKED' 
                    ? 'border-red-500 bg-red-950/30' 
                    : 'border-vortex-blue bg-slate-800';
                  shadowGlow = node.status === 'BLOCKED' 
                    ? 'shadow-[0_0_20px_rgba(239,68,68,0.35)] ring-1 ring-red-500/50'
                    : 'shadow-[0_0_20px_rgba(45,111,232,0.4)] ring-1 ring-vortex-blue/50';
                }

                const isDetailed = diagramMode === 'detailed';
                
                // Embedded getNodeIcon logic
                const getNodeIconMap = (id: string, className?: string) => {
                  if (id.includes('founder') || id.includes('ceo')) return <User className={className} />;
                  if (id.includes('agent') || id.includes('orchestrator') || id.includes('system') || id.includes('director')) return <Bot className={className} />;
                  if (id.includes('review') || id.includes('check') || id.includes('fact')) return <Shield className={className} />;
                  if (id.includes('cms') || id.includes('notion') || id.includes('publish') || id.includes('web')) return <Database className={className} />;
                  if (id.includes('planner') || id.includes('strategist') || id.includes('strategy')) return <TrendingUp className={className} />;
                  return <Cpu className={className} />;
                };

                return (
                  <div
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setSelectedVectorId(null);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl border p-2.5 flex flex-col justify-between transition-all duration-300 z-20 pointer-events-auto ${outlineColor} ${shadowGlow} ${
                      isDetailed ? 'w-[185px] min-h-[120px] h-auto shadow-lg' : 'w-[114px] min-h-[80px]'
                    }`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <div>
                      {/* Box header summary parameters */}
                      <div className="flex justify-between items-center mb-1 select-none">
                        <span className="text-[7px] font-bold text-slate-500 font-mono tracking-tighter uppercase font-mono">
                          {node.category.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1">
                          {node.backlog > 0 && (
                            <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[7px] px-1 rounded animate-pulse font-bold font-mono">
                              {node.backlog} OBJ
                            </span>
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full ${indicatorLight}`}></span>
                        </div>
                      </div>

                      <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight mb-0.5 truncate text-slate-100" title={node.label}>
                        {node.label}
                      </h4>
                      <p className="text-[8px] text-slate-500 font-mono uppercase mb-1 select-none truncate">
                        {node.role}
                      </p>

                      {/* SKILLS CHIPS IN ENLARGED FULL STACK DIRECTIVE */}
                      {isDetailed && (
                        <div className="space-y-1 border-t border-slate-900/60 pt-1 mt-1 select-none">
                          <div className="flex flex-wrap gap-0.5 max-h-[44px] overflow-hidden">
                            <span className="bg-slate-900 text-cyan-400 px-1 py-0.5 rounded text-[7px] font-mono whitespace-nowrap">
                              {node.isAi ? 'AI_AUTONOMOUS' : 'SYSTEM_ACTOR'}
                            </span>
                            <span className="bg-slate-900 text-slate-400 px-1 py-0.5 rounded text-[7px] font-mono whitespace-nowrap">
                              {node.category}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-900/60 pt-1 mt-1.5 flex justify-between items-center select-none text-[8px] text-slate-500 font-mono">
                      {getNodeIconMap(node.id, `w-3 h-3 ${isSelected ? 'text-emerald-400' : 'text-slate-400'} shrink-0`)}
                      <span className="truncate max-w-[120px] ml-1 text-slate-400 uppercase">
                        {node.status}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

            {/* LOWER PORTION: MANUAL PIPELINE COMPLIANCE TRACER CONSOLE */}
            <div id="interactive-manual-tracer-console" className="border-t border-slate-800 bg-slate-950/60 p-3 rounded-lg z-10">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    <h3 className="text-[11px] font-black uppercase text-white tracking-wider">
                      Interactive Schema Pipeline Tracer
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Follow the path step-by-step to visualize how metadata correlates from Pod B, records into Notion DB, and routes globally.
                  </p>
                </div>

                {/* TRACE HANDLERS RIG */}
                <div className="flex items-center gap-2">
                  {!tracer.active ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartTracer('LOW_RISK')}
                        className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10px] uppercase font-bold tracking-wider rounded transition-all flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3" /> Trace Low-Risk
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStartTracer('HIGH_RISK')}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] uppercase font-bold tracking-wider rounded transition-all flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3 h-3" /> Trace High-Risk Action
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-tighter shrink-0 animate-pulse bg-cyan-950/40 border border-cyan-800 px-2 py-1 rounded">
                        Tracing Packet: {tracer.packetName}
                      </span>
                      
                      {/* Autoplay toggling */}
                      <button
                        onClick={() => setIsTracerAutoplay(!isTracerAutoplay)}
                        className={`p-1.5 rounded transition-all text-white border text-[9px] font-mono uppercase tracking-widest ${
                          isTracerAutoplay ? 'bg-indigo-900 border-indigo-500' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {isTracerAutoplay ? 'Stop Auto' : 'Auto Play'}
                      </button>

                      <button
                        type="button"
                        onClick={handleTracerAdvance}
                        className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 text-[10px] uppercase font-bold tracking-wider rounded transition-all flex items-center gap-1"
                      >
                        Step Forward <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={handleResetTracer}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                        title="Cancel trace override"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* RENDER ACTIVE PIPELINE TRACE VISUAL STEPS AT TIME */}
              {tracer.active && (
                <div className="mt-2.5 pt-2 border-t border-slate-900 grid grid-cols-1 md:grid-cols-5 gap-2 select-none">
                  {activePipelineSteps.map((step) => {
                    const isPassed = step.id < tracer.step;
                    const isCurrent = step.id === tracer.step;
                    
                    let bgCol = 'bg-slate-950/40 border-slate-900 text-slate-650';
                    let spanCol = 'text-slate-600';

                    if (isPassed) {
                      bgCol = 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400';
                      spanCol = 'text-emerald-500';
                    } else if (isCurrent) {
                      bgCol = 'bg-cyan-900/40 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)] animate-pulse';
                      spanCol = 'text-cyan-400 font-bold';
                    }

                    return (
                      <div key={step.id} className={`p-1.5 rounded border flex flex-col text-[10px] ${bgCol} leading-tight`}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-[9px] uppercase font-mono tracking-tight font-black ${spanCol}`}>{step.label}</span>
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>
                        <p className="text-white text-[9.5px] uppercase font-mono tracking-tighter truncate">{step.node}</p>
                        <span className="text-[8.5px] text-slate-500">{step.role}</span>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </section>

          {/* LOWER TWO-COLUMN: LOGS CONSOLE & ACTIVE PATHWAY VECTOR REGISTRY */}
          <section id="logs-and-vector-table" className="h-56 shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* TERMINAL / LOGGER CONSOLE SECTION (7 Cols) */}
            <div id="terminal-logs-panel" className="lg:col-span-7 border border-slate-800 bg-slate-900/25 rounded-lg p-3.5 flex flex-col justify-between overflow-hidden relative">
              
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 font-mono">CORE TELEMETRY LOG BUFFERS</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-500 uppercase font-mono">Filter:</span>
                  <select
                    value={filterLogLevel}
                    onChange={(e) => setFilterLogLevel(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-slate-400 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                  >
                    <option value="all">ALL CHANNELS</option>
                    <option value="info">INFO</option>
                    <option value="warn">ALERTS</option>
                    <option value="success">SUCCESS SIGNALS</option>
                  </select>
                  <button
                    onClick={() => setLogs([])}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                    title="Flush Terminal Logs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* LOGS LIST SCROLLABLE GRID */}
              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10.5px] pr-1 text-slate-400 select-text">
                {logs.filter(l => filterLogLevel === 'all' || l.level === filterLogLevel).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-[10px]">
                    No telemetry records match target selector queries.
                  </div>
                ) : (
                  logs
                    .filter(l => filterLogLevel === 'all' || l.level === filterLogLevel)
                    .map((log) => {
                      let logColor = 'text-slate-400';
                      let bgPill = 'bg-slate-800 text-slate-300';
                      
                      if (log.level === 'warn') {
                        logColor = 'text-amber-300 font-medium';
                        bgPill = 'bg-amber-950/40 text-amber-500 border border-amber-800/30';
                      } else if (log.level === 'error') {
                        logColor = 'text-red-400 font-bold';
                        bgPill = 'bg-red-950/40 text-red-500 border border-red-800/30';
                      } else if (log.level === 'success') {
                        logColor = 'text-slate-200';
                        bgPill = 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30';
                      }

                      return (
                        <div key={log.id} className="flex items-start gap-1.5 py-0.5 whitespace-normal leading-relaxed hover:bg-slate-900/40 px-1 rounded">
                          <span className="text-slate-600 text-[9.5px] tracking-tighter shrink-0">{log.timestamp}</span>
                          <span className={`text-[8px] px-1 py-0.5 rounded font-bold shrink-0 uppercase tracking-tighter ${bgPill}`}>
                            {log.source}
                          </span>
                          <span className={`${logColor} font-mono break-all`}>{log.message}</span>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Console metadata indicator */}
              <div className="mt-2 pt-1 border-t border-slate-850 flex items-center justify-between text-[9px] text-slate-500 uppercase font-mono">
                <span>Kernel Frame Latency Buffer: OK</span>
                <span>Active Routing Nodes: 5 Fully Monitored</span>
              </div>

            </div>

            {/* EXPANDABLE VECTOR / PATHWAYS PARAMETER table (5 cols) */}
            <div id="vector-pipeline-registry" className="lg:col-span-5 border border-slate-800 bg-slate-900/25 rounded-lg p-3.5 flex flex-col justify-between overflow-hidden">
              
              <div>
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-850">
                  <span className="text-[11px] font-black uppercase text-white tracking-wider flex items-center gap-1 font-mono">
                    <Workflow className="w-3.5 h-3.5 text-emerald-400" /> Vector Latency Registry
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Path specs</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight mb-2">
                  Select and configure custom delay weights to simulate network degradation on active pipelines.
                </p>

                {/* SCROLLABLE LIST OF CHANNELS */}
                <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                  {vectors.map((v) => {
                    const isSelected = selectedVectorId === v.id;
                    const isActivePhase = v.phases.includes(activePhase);

                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVectorId(v.id);
                          setSelectedNodeId(null);
                        }}
                        className={`p-1.5 rounded border transition-all cursor-pointer text-[10px] flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-emerald-500 text-white'
                            : 'bg-slate-950/40 border-slate-850/80 text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-mono text-white text-[10px] truncate uppercase">
                            {v.from} ➔ {v.to}
                          </span>
                          <span className="text-[8.5px] text-slate-500 truncate lowercase">{v.label}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Speed Calibration Selector */}
                          <div className="flex items-center gap-1 font-mono">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVectorSpeeds(prev => {
                                  const newVal = Math.max(2, (prev[v.id] || 10) - 2);
                                  addLog('SYS', 'info', `Vector ${v.id} latency recalculated down to ${newVal}ms.`);
                                  return { ...prev, [v.id]: newVal };
                                });
                              }}
                              className="px-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-400"
                            >
                              -
                            </button>
                            <span className="text-emerald-400 text-[10px] font-bold tracking-tighter w-8 text-center bg-slate-950 px-1 rounded block">
                              {vectorSpeeds[v.id] || v.latencyS}ms
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setVectorSpeeds(prev => {
                                  const newVal = Math.min(120, (prev[v.id] || 10) + 2);
                                  addLog('SYS', 'warn', `Vector ${v.id} delay weight set higher to ${newVal}ms.`);
                                  return { ...prev, [v.id]: newVal };
                                });
                              }}
                              className="px-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-400"
                            >
                              +
                            </button>
                          </div>

                          <span className={`text-[8px] font-bold font-mono px-1 rounded ${
                            v.status === 'BLOCKED' ? 'bg-red-950/40 text-red-500 border border-red-900/30' :
                            v.status === 'STANDBY' ? 'bg-slate-850 text-slate-500' :
                            'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30'
                          }`}>
                            {v.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fastpass injection debug */}
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[9.5px]">
                <span className="text-slate-500 font-mono">HIGH-RISK ESCROW OVERRIDE:</span>
                <button
                  onClick={() => {
                    setAutoEscalateRisk(!autoEscalateRisk);
                    addLog('SEC', 'warn', `Audit parameters altered: Automated threat mitigation escalated bypass is now ${!autoEscalateRisk ? 'ON' : 'OFF'}.`);
                  }}
                  className={`px-2 py-0.5 rounded font-mono font-bold tracking-tighter border uppercase ${
                    autoEscalateRisk ? 'bg-emerald-950 border-emerald-500/40 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  {autoEscalateRisk ? 'AUDIT ESCROW ON' : 'AUDIT ESCROW OFF'}
                </button>
              </div>

            </div>

          </section>

            </>
          )}

          {activeTab === 'founder' && (
            <FounderDashboard
              approvals={approvals}
              setApprovals={setApprovals}
              dbRecords={dbRecords}
              setDbRecords={setDbRecords}
              activePhase={activePhase}
              addLog={addLog}
              initiatives={initiatives}
            />
          )}

          {activeTab === 'contentOs' && (
            <WorkflowsDashboard
              activePhase={activePhase}
              addLog={addLog}
            />
          )}

          {activeTab === 'agents' && (
            <AgentsDashboard
              nodes={nodes}
              customNodeStatuses={customNodeStatuses}
              setCustomNodeStatuses={setCustomNodeStatuses}
              activePhase={activePhase}
              addLog={addLog}
            />
          )}

          {activeTab === 'learning' && (
            <LearningDashboard
              learningLog={learningLog}
              setLearningLog={setLearningLog}
              activePhase={activePhase}
              addLog={addLog}
            />
          )}

        </main>

        {/* PANEL 3: RIGHT PANEL - PARAMETER INSPECTOR & NOTION DB REGISTRY */}
        <aside id="operating-model-inspector" className="w-[316px] shrink-0 border-l border-slate-700 bg-midnight p-4 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* ITEM 1: INSPECTOR DETAILS */}
            <div id="aside-inspector-box">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-700">
                <Sliders className="w-3.5 h-3.5 text-vortex-blue" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">VORTEX METADATA HUD</h3>
              </div>

              {selectedNodeId ? (
                (() => {
                  const node = nodes.find(n => n.id === selectedNodeId);
                  if (!node) return null;

                  return (
                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded space-y-3">
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-tight font-mono">{node.label}</h4>
                          <span className="text-[8.5px] text-slate-500 font-mono block uppercase">{node.category}</span>
                        </div>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded font-bold font-mono">
                          {node.status}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-400 leading-snug">
                        {node.id === 'Content' && 'Gateway receiver managing ingress file streams and dividing content blocks into validated schema elements.'}
                        {node.id === 'NotionDB' && 'Central in-memory Relational Core simulating attributes mappings, schema properties, and phase checklists connected with Notion API.'}
                        {node.id === 'Governance' && 'Strategic review panel requiring human founder verification on L1 before validating or routing outputs.'}
                        {node.id === 'RiskRouting' && 'Heuristic audit sandbox parsing anomalies through multi-tier rulesets to confirm security checkpoints are verified.'}
                        {node.id === 'Distribution' && 'Edge content delivery node finalizing archive synchronization weights over Akamai Edge CDN lines.'}
                      </p>

                      {/* Dynamic Parameters based on Node type */}
                      <div className="border-t border-slate-850 pt-2 space-y-2 text-[10.5px] font-mono">
                        
                        {node.id === 'Content' && (
                          <div className="space-y-1.5 text-slate-400">
                            <span className="text-slate-500 font-black block text-[9px] uppercase">GATEWAY SETTINGS:</span>
                            <div className="flex justify-between">
                              <span>INGRESS HARDWARE:</span>
                              <span className="text-white">GCP-E2_v2</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ACTIVE BACKLOG:</span>
                              <span className="text-emerald-400 font-bold">{node.backlog} PAYLOADS</span>
                            </div>
                          </div>
                        )}

                        {node.id === 'NotionDB' && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-500">RELATIONAL SCHEMA WEIGHT:</span>
                              <span className="text-white font-bold">14 TABLES</span>
                            </div>
                            <div className="space-y-1 bg-slate-900/60 p-1.5 rounded border border-slate-850">
                              <span className="text-slate-500 block text-[8px] uppercase">Active Schema Keys:</span>
                              <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                                <span className="p-1 font-bold text-center bg-slate-950 border border-cyan-500/30 text-cyan-400 rounded">Notion_API</span>
                                <span className="p-1 font-bold text-center bg-slate-950 border border-slate-850 text-slate-500 rounded">Local_Memory</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {node.id === 'Governance' && (
                          <div className="space-y-2 text-slate-400">
                            <span className="text-slate-500 block text-[9px] uppercase">Pod Approval Strictness:</span>
                            <div className="grid grid-cols-3 gap-1 text-[8px] text-center">
                              {['low', 'medium', 'strict'].map((level) => {
                                const isSel = governanceStrictness === level;
                                return (
                                  <button
                                    key={level}
                                    type="button"
                                    onClick={() => {
                                      setGovernanceStrictness(level as any);
                                      addLog('POD', 'warn', `Governance approval protocol altered to standard strictness level: ${level.toUpperCase()}`);
                                    }}
                                    className={`p-1 border rounded uppercase font-bold tracking-tight ${
                                      isSel ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/55' : 'bg-slate-950 border-slate-850 text-slate-500'
                                    }`}
                                  >
                                    {level}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {node.id === 'RiskRouting' && (
                          <div className="space-y-1 text-slate-400">
                            <div className="flex justify-between">
                              <span>AUDIT LATENCY WEIGHT:</span>
                              <span className="text-amber-500 font-black">{vectorSpeeds['NotionDB_RiskRouting']}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>ANOMALY SCAN TIER STATUS:</span>
                              <span className="text-emerald-400">ACTIVE L1 L2 L3</span>
                            </div>
                          </div>
                        )}

                        {node.id === 'Distribution' && (
                          <div className="space-y-2 text-slate-400">
                            <div className="flex justify-between">
                              <span>COMMITTED PACKETS OUT:</span>
                              <span className="text-white font-bold">{dbRecords.filter(r => r.status === 'APPROVED').length + 120}</span>
                            </div>
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })()
              ) : selectedVectorId ? (
                (() => {
                  const vec = vectors.find(v => v.id === selectedVectorId);
                  if (!vec) return null;

                  return (
                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[11px] font-black text-white uppercase tracking-tight font-mono">
                            {vec.from} ➔ {vec.to}
                          </h4>
                          <span className="text-[8.5px] text-slate-500 font-mono block uppercase">{vec.label}</span>
                        </div>
                        <span className="text-[8px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 py-0.5 rounded font-bold font-mono">
                          {vec.status}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-400 leading-snug">
                        {vec.description}
                      </p>

                      <div className="border-t border-slate-850 pt-2 space-y-1 text-[10.5px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">DELAY WEIGHT:</span>
                          <span className="text-emerald-400 font-bold">{vectorSpeeds[vec.id] || vec.latencyS}ms</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">ALLOWED PHASES:</span>
                          <span className="text-white font-bold tracking-tight lowercase">
                            {vec.phases.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-slate-950/50 p-4 border border-slate-850 rounded text-center text-slate-500 italic text-[10.5px]">
                  Select any Node or Vector highlighted path in the topology viewport to inspect localized parameters.
                </div>
              )}
            </div>

            {/* ITEM 2: NOTION SIM IN-MEMORY DB REGISTRY DISPLAY */}
            <div className="flex-1 flex flex-col min-h-[190px]">
              
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">Notion Sim DB Core</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDbRecords([]);
                    addLog('DB', 'warn', 'Manual override triggered: Cleared all Notion table attributes from memory cache.');
                  }}
                  className="text-[9px] hover:text-red-400 text-slate-500 uppercase tracking-tighter transition-colors"
                >
                  Wipe Table
                </button>
              </div>

              {/* SEARCH RIG */}
              <div className="relative bg-slate-950 rounded border border-slate-800 mb-2 shrink-0">
                <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-slate-600" />
                <input
                  type="text"
                  placeholder="Filter key attributes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-7 pr-2.5 py-1.5 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* MEMORY LIST */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-[11px]">
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-6 text-slate-600 italic">
                    No registry rows correlate inside the Notion Database mapping.
                  </div>
                ) : (
                  filteredRecords.map((rec) => {
                    let pillStyle = 'bg-slate-950 border-slate-805 text-slate-400';
                    if (rec.status === 'APPROVED') pillStyle = 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30';
                    if (rec.status === 'IN_REVIEW') pillStyle = 'bg-amber-950/30 text-amber-500 border border-amber-900/30';
                    if (rec.status === 'PENDING') pillStyle = 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/30';

                    return (
                      <div key={rec.id} className="p-2 border border-slate-850 rounded hover:border-slate-800 bg-slate-950/40 hover:bg-slate-950/85 transition-all text-slate-300">
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-mono text-white text-[10.5px] break-all truncate block max-w-[180px]">{rec.key}</span>
                          <span className={`text-[8px] font-bold font-mono px-1 py-0.2 rounded shrink-0 uppercase tracking-tight ${pillStyle}`}>
                            {rec.status}
                          </span>
                        </div>

                        <div className="flex justify-between mt-1 text-[9px] text-slate-500 font-mono">
                          <span>{rec.type}</span>
                          <span>Phase_{rec.phase}</span>
                        </div>

                        {/* Interactive operator approval action on high-risk escalation records */}
                        {rec.status === 'IN_REVIEW' && (
                          <div className="mt-2 pt-1.5 border-t border-slate-850 flex gap-1 justify-end font-mono">
                            <button
                              type="button"
                              onClick={() => {
                                setDbRecords(prev => prev.map(r => r.id === rec.id ? { ...r, status: 'APPROVED' } : r));
                                addLog('SEC', 'success', `Operator Audit: Schema path approved for file: '${rec.key}'`);
                              }}
                              className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[8px] uppercase font-bold hover:bg-emerald-500/30 transition-all"
                            >
                              Allow Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDbRecords(prev => prev.filter(r => r.id !== rec.id));
                                addLog('SEC', 'error', `Operator Purge: Deleted unsafe file target: '${rec.key}' from relational system memory buffer.`);
                              }}
                              className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/40 text-[8px] uppercase font-bold hover:bg-red-500/30 transition-all"
                            >
                              Reject & Purge
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

          {/* DENSE METRIC FOOTNOTES */}
          <div className="bg-slate-900/10 border border-slate-800 p-2 text-[10px] rounded space-y-1 uppercase font-mono mt-3 shrink-0">
            <h4 className="text-[9.5px] font-black text-slate-500 flex items-center gap-1 font-mono tracking-widest leading-none">
              <Zap className="w-3 h-3 text-amber-500" /> Operational Metrics
            </h4>
            <div className="grid grid-cols-2 text-slate-400 gap-1 text-[9px]">
              <div className="flex justify-between">
                <span>Ingressive load:</span>
                <span className="text-white">{(ingressRate / 60).toFixed(1)}Hz</span>
              </div>
              <div className="flex justify-between">
                <span>Security checks:</span>
                <span className="text-emerald-400">100% OK</span>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* CORE FOOTER MARGIN LINES */}
      <footer id="hud-bottom-status-line" className="h-8 shrink-0 bg-slate-900 border-t border-slate-700 flex items-center px-6 justify-between text-[9px] text-slate-500 uppercase font-mono z-10 select-none">
        <div className="flex items-center gap-4">
          <span>NETWORK INTEGRITY STATUS: <strong className="text-vortex-blue font-bold">SEC_SYNC_ESTABLISHED</strong></span>
          <span className="text-slate-800">|</span>
          <span>POD A CONSENSUS SIGNERS: <strong className="text-vortex-blue">ONLINE [2 OF 2]</strong></span>
          <span className="text-slate-800">|</span>
          <span className="hidden md:inline">Akamai CDN Edgelinks: <strong className="text-white">STANDBY_TUNNELED</strong></span>
        </div>
        <div className="hidden sm:inline">Active Project Mode: <strong className="text-white">Project Stakeport Operating Model</strong></div>
        <div>© 2026 STAKEPORT GLOBAL OS</div>
      </footer>

    </div>
  );
}
