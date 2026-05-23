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
  Eye
} from 'lucide-react';

// Node specs dictionary
interface NodeMeta {
  id: 'Content' | 'Governance' | 'NotionDB' | 'Distribution' | 'RiskRouting';
  label: string;
  podLabel: string;
  role: string;
  x: number; // visual percentage left
  y: number; // visual percentage top
  status: 'ONLINE' | 'STANDBY' | 'DEGRADED';
  hardware: string;
  backlog: number;
}

// Pathway vectors specs
interface VectorMeta {
  id: string;
  from: 'Content' | 'Governance' | 'NotionDB' | 'Distribution' | 'RiskRouting';
  to: 'Content' | 'Governance' | 'NotionDB' | 'Distribution' | 'RiskRouting';
  label: string;
  latencyS: number; // milliseconds
  status: 'ACTIVE' | 'STANDBY' | 'BLOCKED';
  phases: Array<'crawl' | 'walk' | 'run' | 'ops'>;
  description: string;
}

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
  type: 'LOW_RISK' | 'HIGH_RISK' | null;
  step: number; // 0 to 4
  currentNodeId: 'Content' | 'NotionDB' | 'RiskRouting' | 'Governance' | 'Distribution' | null;
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
  const [activePhase, setActivePhase] = useState<'crawl' | 'walk' | 'run' | 'ops'>('walk');
  const [selectedNodeId, setSelectedNodeId] = useState<'Content' | 'Governance' | 'NotionDB' | 'Distribution' | 'RiskRouting' | null>('NotionDB');
  const [selectedVectorId, setSelectedVectorId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLogLevel, setFilterLogLevel] = useState<'all' | 'info' | 'warn' | 'success'>('all');

  // Interactive Map Pan/Zoom & Diagram Mode States
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [diagramMode, setDiagramMode] = useState<'standard' | 'detailed'>('detailed');

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
  const [ingressRate, setIngressRate] = useState<number>(620);
  const [autoEscalateRisk, setAutoEscalateRisk] = useState<boolean>(true);
  const [manualPacketName, setManualPacketName] = useState<string>('');
  const [manualPacketRisk, setManualPacketRisk] = useState<'LOW' | 'HIGH'>('LOW');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom interactive thresholds for nodes
  const [governanceStrictness, setGovernanceStrictness] = useState<'low' | 'medium' | 'strict'>('medium');
  const [bypassRouting, setBypassRouting] = useState<boolean>(false);
  const [cdnCaching, setCdnCaching] = useState<boolean>(true);

  // Dynamic vector speeds which players can configure
  const [vectorSpeeds, setVectorSpeeds] = useState<Record<string, number>>({
    'Content_NotionDB': 12,
    'NotionDB_Governance': 18,
    'Governance_Distribution': 15,
    'NotionDB_Distribution': 8,
    'NotionDB_RiskRouting': 28,
    'RiskRouting_Governance': 22,
  });

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

  // Simulated DB Store
  const [dbRecords, setDbRecords] = useState<DBRecord[]>([
    { id: 'rec-101', key: 'Crawl_Foundational_Topology.asset', type: 'Static Graph', phase: 'Crawl', status: 'APPROVED', latency: '12ms' },
    { id: 'rec-102', key: 'Governance_Consensus_Sigs.json', type: 'JSON Crypt', phase: 'Crawl', status: 'APPROVED', latency: '14ms' },
    { id: 'rec-103', key: 'Relational_Core_Notion_Sync.yaml', type: 'Database Mapping', phase: 'Walk', status: 'IN_REVIEW', latency: '22ms' },
    { id: 'rec-104', key: 'Risk_Audit_Escrow_Guard.sh', type: 'Security Policy', phase: 'Run', status: 'PENDING', latency: '40ms' },
    { id: 'rec-105', key: 'Decentralized_State_Proof.bin', type: 'Binary Ledger', phase: 'Ops', status: 'ARCHIVED', latency: '62ms' },
    { id: 'rec-106', key: 'Edge_Router_Heartbeat_v2.log', type: 'System Telemetry', phase: 'Walk', status: 'APPROVED', latency: '6ms' },
  ]);

  // Phase checklist
  const phaseGoals: Record<'crawl' | 'walk' | 'run' | 'ops', Array<{ id: string; text: string; completed: boolean }>> = {
    crawl: [
      { id: 'tc-1', text: 'Separate Pod execution contexts & single local links', completed: true },
      { id: 'tc-2', text: 'Configure custom low-risk fastpass bypass to egress routing', completed: true },
      { id: 'tc-3', text: 'Set baseline manual ingress pressure mapping target', completed: true },
    ],
    walk: [
      { id: 'tw-1', text: 'Establish live Notion Database model schema synchronizer', completed: true },
      { id: 'tw-2', text: 'Deploy multi-tiered human approval resolvers (L1 L2 L3)', completed: false },
      { id: 'tw-3', text: 'Verify active consensus criteria over standard payloads', completed: false },
    ],
    run: [
      { id: 'tr-1', text: 'Automate content-object capture in background pipelines', completed: false },
      { id: 'tr-2', text: 'Enable threat inspection loops inside central Risk Routing', completed: false },
      { id: 'tr-3', text: 'Calibrate speed latencies of active routing channels', completed: false },
    ],
    ops: [
      { id: 'to-1', text: 'Surrender temporary cryptographic master-keys for peer nodes', completed: false },
      { id: 'to-2', text: 'Achieve fully decentralized autonomous pod consensus speeds', completed: false },
      { id: 'to-3', text: 'Self-healing state synchronizer failsafes verification', completed: false },
    ],
  };

  const [checklist, setChecklist] = useState(phaseGoals);

  // Initialize kernel logs
  useEffect(() => {
    addLog('SYS', 'info', 'Stakeport OS core topology engine initializing...');
    addLog('SYS', 'success', 'Kernel v2.4 initialized. Ready with High Density active parameters.');
    addLog('DB', 'info', `Notion DB Core initialized with ${dbRecords.length} synchronized registry keys.`);
  }, []);

  // Handle auto playing tracer step intervals
  useEffect(() => {
    if (!tracer.active || !isTracerAutoplay) return;

    const timer = setTimeout(() => {
      handleTracerAdvance();
    }, 1800);

    return () => clearTimeout(timer);
  }, [tracer.active, tracer.step, isTracerAutoplay]);

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

  // Dynamic Node Positions based on activePhase to prevent overlap
  const coordMap: Record<'crawl' | 'walk' | 'run' | 'ops', Record<string, { x: number; y: number }>> = {
    crawl: {
      Content: { x: 18, y: 50 },
      NotionDB: { x: 50, y: 50 },
      Distribution: { x: 82, y: 50 },
      Governance: { x: 50, y: 15 },
      RiskRouting: { x: 50, y: 85 },
    },
    walk: {
      Content: { x: 16, y: 50 },
      NotionDB: { x: 45, y: 72 },
      Governance: { x: 45, y: 28 },
      Distribution: { x: 84, y: 50 },
      RiskRouting: { x: 50, y: 85 },
    },
    run: {
      Content: { x: 15, y: 50 },
      NotionDB: { x: 38, y: 50 },
      Governance: { x: 64, y: 22 },
      RiskRouting: { x: 64, y: 78 },
      Distribution: { x: 88, y: 50 },
    },
    ops: {
      Content: { x: 12, y: 50 },
      NotionDB: { x: 40, y: 50 },
      Governance: { x: 66, y: 18 },
      RiskRouting: { x: 66, y: 82 },
      Distribution: { x: 88, y: 50 },
    },
  };

  const activeNodesForPhase: Record<'crawl' | 'walk' | 'run' | 'ops', string[]> = {
    crawl: ['Content', 'NotionDB', 'Distribution'],
    walk: ['Content', 'NotionDB', 'Governance', 'Distribution'],
    run: ['Content', 'NotionDB', 'Governance', 'RiskRouting', 'Distribution'],
    ops: ['Content', 'NotionDB', 'Governance', 'RiskRouting', 'Distribution'],
  };

  // Node Positions and Definitions (Dynamically calculated via activePhase)
  const nodes: NodeMeta[] = [
    {
      id: 'Content',
      label: 'Content Gateway',
      podLabel: 'POD B',
      role: 'Ingress Source',
      x: coordMap[activePhase].Content.x,
      y: coordMap[activePhase].Content.y,
      status: 'ONLINE',
      hardware: 'GCP-E2-Compact [Core 4]',
      backlog: tracer.currentNodeId === 'Content' ? 1 : 0,
    },
    {
      id: 'NotionDB',
      label: 'Notion Core',
      podLabel: 'RELATIONAL CORE',
      role: 'Database Synchronizer',
      x: coordMap[activePhase].NotionDB.x,
      y: coordMap[activePhase].NotionDB.y,
      status: 'ONLINE',
      hardware: 'Notion API Connector',
      backlog: dbRecords.filter(r => r.status === 'PENDING').length + (tracer.currentNodeId === 'NotionDB' ? 1 : 0),
    },
    {
      id: 'Governance',
      label: 'Governance Node',
      podLabel: 'POD A',
      role: 'Consensus Escrow',
      x: coordMap[activePhase].Governance.x,
      y: coordMap[activePhase].Governance.y,
      status: governanceStrictness === 'strict' ? 'ONLINE' : 'STANDBY',
      hardware: 'Consensus Signatures [Ed25519]',
      backlog: tracer.currentNodeId === 'Governance' ? 1 : 0,
    },
    {
      id: 'RiskRouting',
      label: 'Risk Routing Unit',
      podLabel: 'L1/L2 AUDIT',
      role: 'Heuristic Threat Scanner',
      x: coordMap[activePhase].RiskRouting.x,
      y: coordMap[activePhase].RiskRouting.y,
      status: activePhase === 'crawl' ? 'DEGRADED' : 'ONLINE',
      hardware: 'Anomaly Heuristics v1',
      backlog: dbRecords.filter(r => r.status === 'IN_REVIEW').length + (tracer.currentNodeId === 'RiskRouting' ? 1 : 0),
    },
    {
      id: 'Distribution',
      label: 'Distribution Outlet',
      podLabel: 'POD C',
      role: 'Edge Content Release',
      x: coordMap[activePhase].Distribution.x,
      y: coordMap[activePhase].Distribution.y,
      status: 'ONLINE',
      hardware: 'Akamai Edge Provider',
      backlog: tracer.currentNodeId === 'Distribution' ? 1 : 0,
    },
  ];

  // Vectors/Connections definition
  const vectors: VectorMeta[] = [
    {
      id: 'Content_NotionDB',
      from: 'Content',
      to: 'NotionDB',
      label: 'Ingress Mapping Webhook',
      latencyS: vectorSpeeds['Content_NotionDB'],
      status: 'ACTIVE',
      phases: ['crawl', 'walk', 'run', 'ops'],
      description: 'Ingests raw objects from Gateway and registers metadata state directly to Relational Core.',
    },
    {
      id: 'NotionDB_Distribution',
      from: 'NotionDB',
      to: 'Distribution',
      label: 'Crawl Bypass Fastpass Channel',
      latencyS: vectorSpeeds['NotionDB_Distribution'],
      status: activePhase === 'crawl' || bypassRouting ? 'ACTIVE' : 'STANDBY',
      phases: ['crawl', 'ops'],
      description: 'Allows direct publishing without multi-tier approval constraints. Ideal for low risk foundational phases.',
    },
    {
      id: 'NotionDB_Governance',
      from: 'NotionDB',
      to: 'Governance',
      label: 'Consensus Review Pipeline',
      latencyS: vectorSpeeds['NotionDB_Governance'],
      status: activePhase !== 'crawl' ? 'ACTIVE' : 'BLOCKED',
      phases: ['walk', 'run', 'ops'],
      description: 'Transmits registered Notion schema references to Pod A signers to verify manual token approval.',
    },
    {
      id: 'Governance_Distribution',
      from: 'Governance',
      to: 'Distribution',
      label: 'Authorized Egress Outlet',
      latencyS: vectorSpeeds['Governance_Distribution'],
      status: activePhase !== 'crawl' ? 'ACTIVE' : 'BLOCKED',
      phases: ['walk', 'run', 'ops'],
      description: 'Signs release tokens globally to cache validated objects into global distribution networks.',
    },
    {
      id: 'NotionDB_RiskRouting',
      from: 'NotionDB',
      to: 'RiskRouting',
      label: 'Heuristic Threat Diverter',
      latencyS: vectorSpeeds['NotionDB_RiskRouting'],
      status: activePhase === 'run' || activePhase === 'ops' ? 'ACTIVE' : 'STANDBY',
      phases: ['run', 'ops'],
      description: 'Diverts ambiguous schema attributes or files automatically to heuristic scanner sandbox.',
    },
    {
      id: 'RiskRouting_Governance',
      from: 'RiskRouting',
      to: 'Governance',
      label: 'Audited Escrow Pipeline',
      latencyS: vectorSpeeds['RiskRouting_Governance'],
      status: activePhase === 'run' || activePhase === 'ops' ? 'ACTIVE' : 'STANDBY',
      phases: ['run', 'ops'],
      description: 'Provides audit logproofs to global signers for consensus processing following heuristic inspection.',
    },
  ];

  // Manual trace trigger
  const handleStartTracer = (type: 'LOW_RISK' | 'HIGH_RISK') => {
    const defaultLowPrefixes = ['blog_post_draft.md', 'client_invoice_update.json', 'product_media_link.xml'];
    const defaultHighPrefixes = ['emergency_core_bypass.sh', 'suspected_buffer_injection.bin', 'unsigned_payload_manifest.hex'];
    
    const packetName = manualPacketName.trim() || (type === 'LOW_RISK' 
      ? defaultLowPrefixes[Math.floor(Math.random() * defaultLowPrefixes.length)]
      : defaultHighPrefixes[Math.floor(Math.random() * defaultHighPrefixes.length)]
    );

    addLog('SYS', 'info', `MANUAL TRACER DISPATCHED: Tracing ${type} flow schema for '${packetName}'.`);

    setTracer({
      active: true,
      type,
      step: 0,
      currentNodeId: 'Content',
      packetName,
      payloadSize: type === 'LOW_RISK' ? '12.4 KB' : '842.1 KB',
    });
    setManualPacketName('');
    setIsTracerAutoplay(false);
  };

  // Step the tracer engine forward
  const handleTracerAdvance = () => {
    if (!tracer.active) return;

    const currentStep = tracer.step;
    const isHigh = tracer.type === 'HIGH_RISK';

    // Flow sequence definitions
    // Low Risk: Content(0) -> NotionDB(1) -> Distribution(2) [If Crawl/Bypass active] or Content(0) -> NotionDB(1) -> Governance(2) -> Distribution(3)
    // High Risk: Content(0) -> NotionDB(1) -> RiskRouting(2) -> Governance(3) -> Distribution(4)

    if (isHigh) {
      if (currentStep === 0) {
        // Step 1: Advance Content -> NotionDB
        setTracer(prev => ({ ...prev, step: 1, currentNodeId: 'NotionDB' }));
        addLog('DB', 'info', `Packet [${prevStepIdLabel(0)}] loaded into Relational Core Notion context. Triggering metadata mapping schema.`);
      } else if (currentStep === 1) {
        // Step 2: NotionDB -> RiskRouting
        setTracer(prev => ({ ...prev, step: 2, currentNodeId: 'RiskRouting' }));
        addLog('SEC', 'warn', `Threat signature alert! Diverting high-risk packet payload '${tracer.packetName}' over inspection vector directly to Risk Routing Hub.`);
        
        // Push record into simulated DB showing validation phase
        const customId = `rec-gen-${Date.now()}`;
        const newDbEntry: DBRecord = {
          id: customId,
          key: tracer.packetName,
          type: 'Risk Escalation Probe',
          phase: activePhase.toUpperCase(),
          status: 'IN_REVIEW',
          latency: `${vectorSpeeds['NotionDB_RiskRouting']}ms`,
        };
        setDbRecords(prev => [newDbEntry, ...prev]);
      } else if (currentStep === 2) {
        // Step 3: RiskRouting -> Governance
        setTracer(prev => ({ ...prev, step: 3, currentNodeId: 'Governance' }));
        addLog('POD', 'info', `Risk Evaluation parameters approved by human Sandbox Audit. Escalating verified signatures block to Governance Pod A for consensus.`);
      } else if (currentStep === 3) {
        // Step 4: Governance -> Distribution
        setTracer(prev => ({ ...prev, step: 4, currentNodeId: 'Distribution' }));
        addLog('POD', 'success', `Consensus quorum resolved! Signature approved. Dispatching authorized distribution block to Edge Outlets.`);
      } else {
        // Complete
        handleTracerComplete(true);
      }
    } else {
      // Low Risk Flow
      const isCrawlOrBypass = activePhase === 'crawl' || bypassRouting;
      if (isCrawlOrBypass) {
        // Crawl Shortcut: Content(0) -> NotionDB(1) -> Distribution(2)
        if (currentStep === 0) {
          setTracer(prev => ({ ...prev, step: 1, currentNodeId: 'NotionDB' }));
          addLog('DB', 'success', `Metadata attribute mapped successfully in Notion Core database registry. Standard pass authorized.`);
        } else if (currentStep === 1) {
          setTracer(prev => ({ ...prev, step: 2, currentNodeId: 'Distribution' }));
          addLog('SYS', 'success', `Operating CRAWL-Bypass. Skipping intensive consensus stages. Transporting cached objects immediately to edge distribution outlets.`);
        } else {
          handleTracerComplete(false);
        }
      } else {
        // Standard Walk/Run Low-Risk flow: Content(0) -> NotionDB(1) -> Governance(2) -> Distribution(3)
        if (currentStep === 0) {
          setTracer(prev => ({ ...prev, step: 1, currentNodeId: 'NotionDB' }));
          addLog('DB', 'success', `Metadata mappings linked correctly inside Notion Core Relational buffers.`);
        } else if (currentStep === 1) {
          setTracer(prev => ({ ...prev, step: 2, currentNodeId: 'Governance' }));
          addLog('POD', 'info', `Ingress payload verified. Forwarding structural metadata to Pod A Consensus for security check signing.`);
        } else if (currentStep === 2) {
          setTracer(prev => ({ ...prev, step: 3, currentNodeId: 'Distribution' }));
          addLog('POD', 'success', `Consensus resolved instantly for low-risk object. Edge routing network distribution online.`);
        } else {
          handleTracerComplete(false);
        }
      }
    }
  };

  const prevStepIdLabel = (s: number) => {
    return `pkt-tx-${1000 + s}`;
  };

  const handleTracerComplete = (high: boolean) => {
    addLog('SYS', 'success', `TRANSMISSION TRACE COMPLETED SUCCESSFULLY: File '${tracer.packetName}' processed securely.`);
    // Turn in-review to approved
    if (high) {
      setDbRecords(recs => recs.map(r => r.key === tracer.packetName ? { ...r, status: 'APPROVED', latency: '4ms' } : r));
    } else {
      // Create a successful audit DB Entry
      const customId = `rec-gen-${Date.now()}`;
      const newDbEntry: DBRecord = {
        id: customId,
        key: tracer.packetName,
        type: 'Fastpass Content Sync',
        phase: activePhase.toUpperCase(),
        status: 'APPROVED',
        latency: '3ms',
      };
      setDbRecords(prev => [newDbEntry, ...prev]);
    }

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
    addLog('SYS', 'warn', 'Interactive pipeline trace aborted manually by operator command override.');
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
      setBypassRouting(true);
      addLog('POD', 'info', 'Crawl configurations activated: manual bypass channels forced ON, active pressure throttled to minimal debug levels.');
    } else if (phase === 'walk') {
      setIngressRate(480);
      setBypassRouting(false);
      addLog('POD', 'success', 'Walk configurations activated: Notion Core relational DB model sync online. Multi-tier checking pipelines ready.');
    } else if (phase === 'run') {
      setIngressRate(1150);
      setBypassRouting(false);
      addLog('POD', 'success', 'Run configurations activated: background content-object automation pipelines powered with heuristic anomaly filters.');
    } else {
      setIngressRate(2420);
      setBypassRouting(false);
      addLog('POD', 'success', 'Fully Autonomous OPS configurations loaded: self-healing network pods redundancy consensus active.');
    }
  };

  // Database filtering criteria
  const filteredRecords = dbRecords.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return rec.key.toLowerCase().includes(q) || rec.type.toLowerCase().includes(q) || rec.status.toLowerCase().includes(q);
  });

  const getTracerPipelineSteps = () => {
    if (!tracer.active) return [];
    if (tracer.type === 'HIGH_RISK') {
      return [
        { id: 0, label: '01 Capture', node: 'Content', role: 'Gateway Ingest' },
        { id: 1, label: '02 Map Schema', node: 'NotionDB', role: 'Relational Core Correlation' },
        { id: 2, label: '03 Core Inspect', node: 'RiskRouting', role: 'L1/L2 Sandbox Audit' },
        { id: 3, label: '04 Consenting', node: 'Governance', role: 'Pod A Quorum Signed' },
        { id: 4, label: '05 Edge Release', node: 'Distribution', role: 'POD C Archive Egress' },
      ];
    } else {
      // Low risk path
      if (activePhase === 'crawl' || bypassRouting) {
        return [
          { id: 0, label: '01 Capture', node: 'Content', role: 'Gateway Ingest' },
          { id: 1, label: '02 Fast Mapping', node: 'NotionDB', role: 'Instant Relational Link' },
          { id: 2, label: '03 Instant Bypass Release', node: 'Distribution', role: 'Edge Outlet Cache' },
        ];
      } else {
        return [
          { id: 0, label: '01 Capture', node: 'Content', role: 'Gateway Ingest' },
          { id: 1, label: '02 Map Schema', node: 'NotionDB', role: 'Relational Link' },
          { id: 2, label: '03 Consenting', node: 'Governance', role: 'Pod A Auto Quorum' },
          { id: 3, label: '04 Edge Release', node: 'Distribution', role: 'POD C Archive' },
        ];
      }
    }
  };

  const activePipelineSteps = getTracerPipelineSteps();

  // Helper properties to check highlighted active vector lines on map
  const isVectorHighlighted = (from: string, to: string) => {
    if (!tracer.active) return false;
    
    // Find index of previous node up to current step
    const stepIndex = tracer.step;
    if (stepIndex <= 0) return false;

    const currentTraceNodes = activePipelineSteps.map(s => s.node);
    const traceSource = currentTraceNodes[stepIndex - 1];
    const traceTarget = currentTraceNodes[stepIndex];

    return (traceSource === from && traceTarget === to);
  };

  return (
    <div id="stakeport-fluid-layout" className="w-full h-screen bg-slate-950 text-slate-300 font-sans flex flex-col justify-between overflow-hidden text-[13px] select-none">
      
      {/* HUD OVERVIEW BAR */}
      <header id="hud-topline-header" className="h-16 shrink-0 border-b border-slate-800 bg-slate-900/45 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-emerald-500 rounded flex items-center justify-center text-slate-950 font-black italic text-xl shadow-[0_0_15px_rgba(16,185,129,0.35)] shrink-0">S</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-black tracking-wider uppercase text-white font-mono">STAKEPORT OPERATING SYSTEM</h1>
              <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono tracking-tighter border border-slate-700">v2.4.1_PROD</span>
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Network Topology & Relational Schema Router</p>
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
                { id: 'rec-101', key: 'Crawl_Foundational_Topology.asset', type: 'Static Graph', phase: 'Crawl', status: 'APPROVED', latency: '12ms' },
                { id: 'rec-102', key: 'Governance_Consensus_Sigs.json', type: 'JSON Crypt', phase: 'Crawl', status: 'APPROVED', latency: '14ms' },
                { id: 'rec-103', key: 'Relational_Core_Notion_Sync.yaml', type: 'Database Mapping', phase: 'Walk', status: 'IN_REVIEW', latency: '22ms' },
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
        <aside id="phased-implementation-panel" className="w-72 shrink-0 border-r border-slate-800 bg-slate-900/25 p-4 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">01 / Phased Infrastructure</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mb-3">
                Transition through phases to open relational mapping and security routes.
              </p>

              {/* STAGES CONTAINER */}
              <div className="space-y-2">
                {[
                  { phase: 'crawl', label: '01 CRAWL', desc: 'Pod gate separation, basic low risk bypass pass channel enabled.' },
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
                <span className="text-slate-400">CRAWL BYPASS ACTIVE:</span>
                <button
                  type="button"
                  onClick={() => {
                    setBypassRouting(!bypassRouting);
                    addLog('POD', 'warn', `Operating override: Crawl-Bypass channel toggled ${!bypassRouting ? 'ON' : 'OFF'}.`);
                  }}
                  className={`px-1 rounded text-[8px] tracking-widest font-bold underline ${bypassRouting ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {bypassRouting ? 'FORCE OVERRIDE' : 'STANDARD'}
                </button>
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
          
          {/* VISUAL TOPOLOGY OVERLAY CANVAS CONTAINER */}
          <section id="interactive-topology-canvas" className="flex-1 border border-slate-800 bg-slate-900/15 rounded-xl px-6 py-4 flex flex-col justify-between overflow-hidden relative shadow-[inset_0_0_35px_rgba(0,0,0,0.7)]">
            
            {/* Header label and key indicators */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">THEME CORE MAP VIEW</span>
                <div className="flex items-center gap-1.5 text-xs text-white uppercase font-black tracking-wider">
                  <span>ACTIVE INTEGRATION TOPOLOGY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
              </div>
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2 font-mono text-[9px] select-none">
              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 rounded">
                CALIBRATED LATENCY: {Object.keys(vectorSpeeds).reduce((acc, key) => acc + (vectorSpeeds[key] || 0), 0)}ms
              </span>
              <span className="px-2 py-0.5 bg-slate-950 border border-emerald-500/30 text-emerald-400 rounded block font-bold anim-pulse">
                STATE RESOLVER OK
              </span>
            </div>

            {/* HIGH DENSITY MAP GRAPH WITH FULL MICROSERVICE REGISTRIES & PAN/ZOOM CAPABILITIES */}
            
            {/* Mode selection floating pill */}
            <div className="absolute top-16 left-4 z-30 flex border border-slate-800 bg-slate-950/85 rounded-lg p-1 text-[9.5px] select-none shadow-xl backdrop-blur-md">
              <button
                type="button"
                onClick={() => setDiagramMode('standard')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded transition-all font-bold uppercase ${
                  diagramMode === 'standard'
                    ? 'bg-slate-800 border border-slate-755 text-emerald-400 shadow-inner'
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
                    ? 'bg-slate-800 border border-slate-755 text-cyan-400 shadow-inner'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Full Stack Detailed
              </button>
            </div>

            {/* Floating zoom controls overlay panel */}
            <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2 bg-slate-950/90 border border-slate-800/80 rounded-lg p-2 select-none shadow-2xl backdrop-blur-md">
              {/* Pan Navigation direction fallbacks */}
              <div className="grid grid-cols-3 gap-0.5 mr-2 border-r border-slate-800 pr-2">
                <div />
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, y: p.y + 40 }))}
                  className="p-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-850 font-bold"
                  title="Pan Up"
                >
                  ▲
                </button>
                <div />
                
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, x: p.x + 40 }))}
                  className="p-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-850 font-bold"
                  title="Pan Left"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
                  className="p-1 text-[8.5px] bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 rounded border border-slate-850 font-black"
                  title="Center Viewport (Reset)"
                >
                  ●
                </button>
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, x: p.x - 40 }))}
                  className="p-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-850 font-bold"
                  title="Pan Right"
                >
                  ▶
                </button>
                
                <div />
                <button
                  type="button"
                  onClick={() => setPan(p => ({ ...p, y: p.y - 40 }))}
                  className="p-1 text-[8px] bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-850 font-bold"
                  title="Pan Down"
                >
                  ▼
                </button>
              </div>

              <button
                type="button"
                onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors"
                title="Zoom Out (-15%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              
              <span className="font-mono text-[9px] text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 font-bold shrink-0 min-w-[42px] text-center">
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
                onClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[9px] font-mono text-cyan-400 font-bold hover:text-cyan-300 transition-all"
                title="Reset Fit to Screen"
              >
                FIT
              </button>
            </div>

            {/* INTERACTIVE SCROLLABLE CANVAS CONTAINER */}
            <div
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onDoubleClick={() => { setZoom(1.0); setPan({ x: 0, y: 0 }); }}
              className={`flex-1 relative w-full h-full min-h-[560px] border border-slate-800/65 bg-slate-950/20 rounded-xl overflow-hidden select-none transition-shadow ${
                isDragging ? 'cursor-grabbing shadow-[inset_0_0_50px_rgba(0,0,0,0.95)]' : 'cursor-grab'
              }`}
            >
              {/* Instructions Prompt Overlay */}
              <div className="absolute bottom-3 left-4 z-20 font-mono text-[9px] text-slate-500 pointer-events-none flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1 rounded border border-slate-900">
                <Move className="w-3.5 h-3.5 text-slate-400" />
                <span>Drag background to pan • Scroll / gestures to zoom • Double click to center</span>
              </div>

              {/* Master transformation wrapper */}
              <div
                className="absolute inset-0 w-full h-full origin-center select-none"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.1s cubic-bezier(0.1, 0.8, 0.2, 1.0)',
                }}
              >
              
              {/* VECTORS: DIRECTIONAL SVG PATHS AND PULSES */}
              <svg viewBox="0 0 1000 1000" className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
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
              {nodes.filter(n => activeNodesForPhase[activePhase].includes(n.id)).map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isCurrentTracerTarget = tracer.currentNodeId === node.id;
                
                let outlineColor = 'border-slate-800 bg-slate-950';
                let indicatorLight = 'bg-slate-600';
                let shadowGlow = '';

                if (node.status === 'ONLINE') {
                  indicatorLight = 'bg-emerald-500';
                } else if (node.status === 'DEGRADED') {
                  indicatorLight = 'bg-red-500 animate-pulse';
                }

                if (isCurrentTracerTarget) {
                  outlineColor = 'border-cyan-400 bg-cyan-950/40';
                  shadowGlow = 'shadow-[0_0_25px_rgba(34,211,238,0.3)] ring-2 ring-cyan-500/40';
                } else if (isSelected) {
                  outlineColor = node.id === 'RiskRouting' ? 'border-amber-500 bg-slate-900' : 'border-emerald-500 bg-slate-900';
                  shadowGlow = node.id === 'RiskRouting' 
                    ? 'shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-500/50'
                    : 'shadow-[0_0_20px_rgba(16,185,129,0.4)] ring-1 ring-emerald-500/50';
                }

                // Render Diamond shape for center NotionDB ONLY in simple standard mode
                if (node.id === 'NotionDB' && diagramMode === 'standard') {
                  return (
                    <div
                      key={node.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(node.id);
                        setSelectedVectorId(null);
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 flex items-center justify-center transition-all duration-300 pointer-events-auto"
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <div className={`w-32 h-32 border rotate-45 flex items-center justify-center transition-all ${outlineColor} ${shadowGlow} rounded-lg`}>
                        <div className="-rotate-45 text-center px-1 flex flex-col items-center">
                          <Database className={`w-6 h-6 mb-1 ${isSelected ? 'text-emerald-400' : isCurrentTracerTarget ? 'text-cyan-400' : 'text-slate-400'}`} />
                          <span className="text-[10.5px] font-black text-white uppercase tracking-wider block leading-tight">{node.label}</span>
                          <span className="text-[7.5px] text-slate-500 font-mono block tracking-tighter mt-1">{node.podLabel}</span>
                          
                          <div className="mt-1 flex items-center gap-1 select-none font-mono">
                            <span className={`w-1.5 h-1.5 rounded-full ${indicatorLight}`}></span>
                            <span className="text-[8px] text-slate-300 font-bold">{dbRecords.length} LOG DEFINES</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Standard rect node or enlarged full service stack card
                const nodeMicroservices = microservices[node.id] || [];
                const isDetailed = diagramMode === 'detailed';

                return (
                  <div
                    key={node.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      setSelectedVectorId(null);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all duration-300 z-20 pointer-events-auto ${outlineColor} ${shadowGlow} ${
                      isDetailed ? 'w-[185px] min-h-[165px] h-auto shadow-lg' : 'w-[114px] min-h-[92px]'
                    }`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    <div>
                      {/* Box header summary parameters */}
                      <div className="flex justify-between items-center mb-1 select-none">
                        <span className="text-[7.5px] font-bold text-slate-500 font-mono tracking-tighter uppercase">{node.podLabel}</span>
                        <div className="flex items-center gap-1">
                          {node.backlog > 0 && (
                            <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[7px] px-1 rounded animate-pulse font-bold font-mono">
                              {node.backlog} OBJ
                            </span>
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full ${indicatorLight}`}></span>
                        </div>
                      </div>

                      <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-tight leading-tight mb-0.5">{node.label}</h4>
                      <p className="text-[8px] text-slate-500 font-mono uppercase mb-2 select-none">{node.role}</p>

                      {/* SUB MICROSERVICES NESTED LIST IN ENLARGED FULL STACK DIRECTIVE */}
                      {isDetailed && (
                        <div className="mt-2.5 space-y-1 border-t border-slate-900/60 pt-2 pb-1 bg-slate-950/40 p-1.5 rounded-lg border border-slate-900 select-none">
                          <span className="text-[7px] font-black tracking-widest text-slate-500 uppercase block font-mono mb-1">Constituent Services:</span>
                          <div className="space-y-1">
                            {nodeMicroservices.map((child, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-950 px-1.5 py-1 rounded border border-slate-900 text-[8px] font-mono leading-none">
                                <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                                  {renderSubIcon(child.icon, "w-2.5 h-2.5 text-cyan-400 shrink-0")}
                                  <span className="text-slate-300 truncate tracking-tight uppercase">{child.name}</span>
                                </div>
                                <span className={`w-1 h-1 rounded-full ${child.status === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-900/60 pt-1 mt-2 flex justify-between items-center select-none">
                      {node.id === 'Content' && <Cpu className="w-3 h-3 text-emerald-400 font-black shrink-0" />}
                      {node.id === 'NotionDB' && <Database className="w-3 h-3 text-emerald-400 font-black shrink-0" />}
                      {node.id === 'Governance' && <Shield className="w-3 h-3 text-emerald-400 font-black shrink-0" />}
                      {node.id === 'RiskRouting' && <AlertTriangle className="w-3.5 h-3.5 text-amber-550 font-black shrink-0" />}
                      {node.id === 'Distribution' && <Layers className="w-3 h-3 text-cyan-400 font-black shrink-0" />}
                      <span className="text-[7.5px] text-slate-400 font-mono truncate max-w-[100px]">{node.hardware.substring(0, 16)}</span>
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
                        <AlertTriangle className="w-3 h-3" /> Trace High-Risk Escrow
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

        </main>

        {/* PANEL 3: RIGHT PANEL - PARAMETER INSPECTOR & NOTION DB REGISTRY */}
        <aside id="operating-model-inspector" className="w-[316px] shrink-0 border-l border-slate-800 bg-slate-900/25 p-4 flex flex-col justify-between overflow-y-auto">
          
          <div className="space-y-4">
            
            {/* ITEM 1: INSPECTOR DETAILS */}
            <div id="aside-inspector-box">
              <div className="flex items-center gap-2 mb-2 pb-1 border-b border-slate-850">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 font-mono">Topology Metadata HUD</h3>
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
                          <span className="text-[8.5px] text-slate-500 font-mono block uppercase">{node.podLabel}</span>
                        </div>
                        <span className="text-[8px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.5 rounded font-bold font-mono">
                          {node.status}
                        </span>
                      </div>

                      <p className="text-[10.5px] text-slate-400 leading-snug">
                        {node.id === 'Content' && 'Gateway receiver managing ingress file streams and dividing content blocks into cryptographically mapped schema elements.'}
                        {node.id === 'NotionDB' && 'Central in-memory Relational Core simulating attributes mappings, schema properties, and phase checklists connected with Notion API.'}
                        {node.id === 'Governance' && 'Escrow review vault demanding consensus votes from active signers of Pod A before authorizing distribution cache releases.'}
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
      <footer id="hud-bottom-status-line" className="h-8 shrink-0 bg-slate-900 border-t border-slate-800 flex items-center px-6 justify-between text-[9px] text-slate-500 uppercase font-mono z-10 select-none">
        <div className="flex items-center gap-4">
          <span>NETWORK INTEGRITY STATUS: <strong className="text-emerald-400 font-bold">SEC_SYNC_ESTABLISHED</strong></span>
          <span className="text-slate-800">|</span>
          <span>POD A CONSENSUS SIGNERS: <strong className="text-emerald-400">ONLINE [2 OF 2]</strong></span>
          <span className="text-slate-800">|</span>
          <span className="hidden md:inline">Akamai CDN Edgelinks: <strong className="text-white">STANDBY_TUNNELED</strong></span>
        </div>
        <div className="hidden sm:inline">Active Project Mode: <strong className="text-white">Project Stakeport Operating Model</strong></div>
        <div>© 2026 STAKEPORT GLOBAL OS</div>
      </footer>

    </div>
  );
}
