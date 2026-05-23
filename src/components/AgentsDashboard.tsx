import React, { useState } from 'react';
import { Bot, CheckCircle2, AlertTriangle, ShieldCheck, Power, RefreshCw, Cpu, Star, Server, Search } from 'lucide-react';
import { NodeMeta, NodeStatus } from '../types/os';

interface AgentsDashboardProps {
  nodes: NodeMeta[];
  customNodeStatuses: Record<string, NodeStatus>;
  setCustomNodeStatuses: React.Dispatch<React.SetStateAction<Record<string, NodeStatus>>>;
  activePhase: string;
  addLog: (source: string, level: 'info' | 'warn' | 'success' | 'error', message: string) => void;
}

export const AgentsDashboard: React.FC<AgentsDashboardProps> = ({
  nodes,
  customNodeStatuses,
  setCustomNodeStatuses,
  activePhase,
  addLog,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterLayer, setFilterLayer] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getNodeLayer = (node: NodeMeta): string => {
    const cat = node.category;
    if (cat === 'Strategic Authority' || cat === 'Operational Governance') return 'L1';
    if (cat === 'Workflow Orchestration' || cat === 'Intelligence / Learning') return 'L2';
    if (cat === 'Production' || cat === 'Review / Approval' || cat === 'AI Agent') return 'L3';
    return 'L4';
  };

  const handleProvision = (nodeId: string, label: string) => {
    setCustomNodeStatuses(prev => ({ ...prev, [nodeId]: 'LIVE' }));
    addLog(
      'SYS',
      'success',
      `AGENT PROVISIONING COMPLETE: Handled startup and memory injection for [${label}]. Context warmed up.`
    );
  };

  const handleHotReload = (nodeId: string, label: string) => {
    setCustomNodeStatuses(prev => ({ ...prev, [nodeId]: 'LIVE' }));
    addLog(
      'SYS',
      'info',
      `AGENT HOT RELOAD SIGNAL: Flushed system local cache buffers for [${label}]. Re-verifying dependent channels.`
    );
  };

  // Categories
  const categories = [
    { id: 'all', label: 'All Classes' },
    { id: 'founder', label: 'Founder Core' },
    { id: 'operations', label: 'Chief of Staff' },
    { id: 'writer', label: 'Domain Agents' },
    { id: 'publishing', label: 'Web/CMS' },
  ];

  // Layers
  const layers = [
    { id: 'all', label: 'All Layers' },
    { id: 'L1', label: 'L1 Core' },
    { id: 'L2', label: 'L2 Chiefs' },
    { id: 'L3', label: 'L3 Runtimes' },
    { id: 'L4', label: 'L4 Endpoints' },
  ];

  // Filter and search
  const filteredNodes = nodes.filter(node => {
    const status = customNodeStatuses[node.id] || node.status;
    const catMatch = filterCategory === 'all' || node.id.includes(filterCategory) || node.role.toLowerCase().includes(filterCategory);
    const layerMatch = filterLayer === 'all' || getNodeLayer(node) === filterLayer;
    const searchMatch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        node.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        node.id.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && layerMatch && searchMatch;
  });

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
      {/* HEADER BANNER */}
      <div className="bg-slate-800 border border-slate-700 border-l-4 border-vortex-blue rounded-xl p-4 flex justify-between items-center shrink-0">
        <div>
          <span className="text-[9px] font-black text-vortex-blue uppercase tracking-widest block font-mono">STAKEPORT DOMAIN AGENTS MATRIX</span>
          <h2 className="text-sm font-black text-white uppercase tracking-tight font-sans">DOMAIN AGENTS CONTROL BOARD</h2>
          <p className="text-[11px] text-slate-400">
            Provision, status report, and telemetry verify all 29 constituent agent microservices across all four operational layers.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-vortex-blue/10 border border-vortex-blue/35 text-vortex-blue font-mono text-[10px] rounded flex items-center gap-1.5 font-bold">
          <Bot className="w-3.5 h-3.5 text-vortex-blue animate-pulse" />
          {nodes.filter(n => (customNodeStatuses[n.id] || n.status) === 'LIVE').length} / {nodes.length} LIVE
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="border border-slate-700 bg-midnight rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {/* SEARCH BAR */}
          <div className="relative bg-slate-950 rounded border border-slate-700 w-52">
            <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-600" />
            <input
              type="text"
              placeholder="Search agent signature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent pl-8 pr-2 py-1.5 text-[10.5px] w-full focus:outline-none focus:ring-0 text-slate-350"
            />
          </div>

          {/* FILTER LAYERS */}
          <div className="flex border border-slate-700 bg-obsidian rounded p-0.5 text-[9px] font-black uppercase">
            {layers.map(lay => (
              <button
                key={lay.id}
                onClick={() => setFilterLayer(lay.id)}
                className={`px-2 py-1 rounded transition-all ${
                  filterLayer === lay.id ? 'bg-vortex-blue/20 text-vortex-blue' : 'text-slate-500'
                }`}
              >
                {lay.label}
              </button>
            ))}
          </div>
        </div>

        {/* BLOCKED AGENTS WARNING BANNER */}
        {nodes.some(n => (customNodeStatuses[n.id] || n.status) === 'BLOCKED') && (
          <div className="px-3 py-1.5 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-[9.5px] font-mono flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>DOMAIN AGENT MISSING BLOCKED: ACTION REQUIRED</span>
          </div>
        )}
      </div>

      {/* ALL 29 AGENTS MATRIX GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredNodes.map(node => {
          const status = customNodeStatuses[node.id] || node.status;
          
          let cardStyle = 'border-slate-700 bg-obsidian/30 text-slate-400 hover:border-slate-600';
          let statusLabel = 'OFFLINE';
          let indicatorCol = 'bg-slate-700';
          let statusPill = 'bg-slate-950 text-slate-600';

          if (status === 'LIVE' || status === 'UNLOCKED') {
            cardStyle = 'border-slate-700 bg-obsidian shadow-md text-slate-300 hover:border-slate-600';
            statusLabel = status === 'LIVE' ? 'LIVE' : 'UNLOCKED';
            indicatorCol = status === 'LIVE' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-vortex-blue shadow-[0_0_10px_#2d6fe8]';
            statusPill = status === 'LIVE' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/20';
          } else if (status === 'QUEUED') {
            cardStyle = 'border-indigo-900/50 bg-obsidian/50 text-indigo-200 hover:border-indigo-700';
            statusLabel = 'QUEUED';
            indicatorCol = 'bg-indigo-500 animate-pulse';
            statusPill = 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/20';
          } else if (status === 'BLOCKED') {
            cardStyle = 'border-red-900 bg-red-950/10 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
            statusLabel = 'BLOCKER';
            indicatorCol = 'bg-red-500 animate-pulse';
            statusPill = 'bg-red-950/40 text-red-500 border border-red-900/30';
          } else if (status === 'NOT_STARTED') {
            cardStyle = 'border-slate-800 bg-obsidian/10 text-slate-500';
            statusLabel = 'PLANNED';
            indicatorCol = 'bg-slate-800';
            statusPill = 'bg-slate-950 text-slate-605';
          }

          return (
            <div key={node.id} className={`p-3 border rounded-xl flex flex-col justify-between min-h-[135px] transition-all duration-300 ${cardStyle}`}>
              <div>
                <div className="flex justify-between items-center mb-1 select-none">
                  <span className="text-[7.5px] font-bold text-slate-500 font-mono uppercase tracking-widest">
                    {getNodeLayer(node)} LEVEL AGENT
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${indicatorCol}`}></span>
                    <span className={`text-[7.5px] font-bold font-mono px-1 rounded uppercase ${statusPill}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <h4 className="text-[11px] font-black uppercase text-white truncate max-w-[210px] font-sans" title={node.label}>
                  {node.label}
                </h4>
                <p className="text-[8.5px] text-vortex-blue font-mono uppercase select-none mb-2 leading-none">
                  {node.role}
                </p>

                <p className="text-[9.5px] text-slate-400 leading-snug tracking-tight">
                  {node.id === 'content_writer' && 'Automates rich drafts generation. Blocked under Crawl phase, requiring manual provisioning.'}
                  {node.id === 'fact_checker' && 'Technical verity compliance checking suite validating anti-bypass strict constraints checks.'}
                  {node.id === 'brand_reviewer' && 'Brand safety compliance auditor checking identities configurations across pages.'}
                  {node.id === 'legal_reviewer' && 'Strict policy sentinel validating copyright checks, licensing and public publishing locks.'}
                  {node.id === 'executive_approver' && 'Founder authorization key vault approving high-risk and low-risk pipelines.'}
                  {node.id === 'workflow_orch_system' && 'Chief of Staff scheduling director orchestrating file transport payloads.'}
                  {!(['content_writer', 'fact_checker', 'brand_reviewer', 'legal_reviewer', 'executive_approver', 'workflow_orch_system'].includes(node.id)) && `Constitutive micro-agent validating SOT maps schema integrations at layer ${getNodeLayer(node)}.`}
                </p>
              </div>

              {/* ACTION TRIGGER RIGS */}
              <div className="border-t border-slate-700 pt-2.5 mt-2.5 flex justify-between items-center font-mono select-none">
                <span className="text-[8px] text-slate-500 uppercase flex items-center gap-1 truncate max-w-[124px]">
                  <Server className="w-3 h-3 text-slate-550 shrink-0" /> {node.id}.node
                </span>
                
                <div className="flex items-center gap-1 z-10">
                  {status !== 'LIVE' && status !== 'UNLOCKED' ? (
                    <button
                      type="button"
                      onClick={() => handleProvision(node.id, node.label)}
                      className="px-1.5 py-0.5 rounded bg-vortex-blue text-white hover:bg-vortex-blue/80 transition-all text-[8px] font-bold uppercase flex items-center gap-0.5 shrink-0"
                    >
                      <Power className="w-2.5 h-2.5" /> Provision
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleHotReload(node.id, node.label)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 transition-all text-vortex-blue border border-slate-700 text-[8px] font-bold uppercase flex items-center gap-0.5 shrink-0 animate-none"
                    >
                      <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Reload
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
