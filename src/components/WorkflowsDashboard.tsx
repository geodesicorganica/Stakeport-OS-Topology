import React from 'react';
import { Workflow, CheckCircle2, AlertOctagon, HelpCircle, FileText, Compass, ExternalLink, Calendar, Database } from 'lucide-react';

interface TaskItem {
  id: string;
  name: string;
  stage: string;
  risk: 'LOW' | 'HIGH';
  assignedTo: string;
  status: 'PENDING' | 'DRAFTING' | 'REVIEWING' | 'APPROVED' | 'PASSED_VALIDATION';
}

interface WorkflowsDashboardProps {
  activePhase: string;
  addLog: (source: string, level: 'info' | 'warn' | 'success' | 'error', message: string) => void;
}

export const WorkflowsDashboard: React.FC<WorkflowsDashboardProps> = ({
  activePhase,
  addLog,
}) => {
  // Constant Content OS Stages
  const stages = [
    { title: 'Planning', desc: 'Strategy briefs & briefs curation', badge: 'CoS Owner' },
    { title: 'Approval', desc: 'Campaign token validation', badge: 'CoS Level 1' },
    { title: 'Drafting/Production', desc: 'Heuristic drafts generated', badge: 'Domain Writer', requiresAgent: 'content_writer' },
    { title: 'Verity Audit', desc: 'Strict anti-bypass check limits', badge: 'Fact Checker' },
    { title: 'Review & Guard', desc: 'Acquiring human CEO validation', badge: 'Approval Dir' },
    { title: 'EMS Publish', desc: 'CMS CDN distribution deploy', badge: 'CDN Node' },
  ];

  // Canonical Source of Truth (SOT) files
  const sotFiles = [
    { name: 'shared/messaging-pillars.md', size: '1.8 KB', type: 'Brand Pillars Index', layer: 'Shared Identity Config' },
    { name: 'shared/value-propositions.md', size: '3.2 KB', type: 'Commercial Positioning Map', layer: 'Value Props Schema' },
    { name: 'shared/proof-points.md', size: '2.5 KB', type: 'Verified Empirical Claims', layer: 'Proof-Spine Heuristics' },
    { name: 'agents/chief-of-staff/outputs/launch-marketing-website/initiative_brief.md', size: '5.4 KB', type: 'Launch Initiative Directives', layer: 'Workflow Blueprints' },
  ];

  // Active Content checklist table
  const contentTasks: TaskItem[] = [
    { id: 'task-101', name: 'shared/audiences.md', stage: 'Planning', risk: 'LOW', assignedTo: 'chief_of_staff', status: 'APPROVED' },
    { id: 'task-102', name: 'shared/value-propositions.md', stage: 'Planning', risk: 'LOW', assignedTo: 'chief_of_staff', status: 'APPROVED' },
    { id: 'task-103', name: 'recommendation_packet.md', stage: 'Review & Guard', risk: 'HIGH', assignedTo: 'founder_ceo', status: 'PENDING' },
    { id: 'task-104', name: 'constraints_check.md', stage: 'Verity Audit', risk: 'HIGH', assignedTo: 'fact_checker', status: 'PASSED_VALIDATION' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
      {/* HEADER BANNER */}
      <div className="bg-slate-800 border border-slate-700 border-l-4 border-vortex-blue rounded-xl p-4 flex justify-between items-center shrink-0">
        <div>
          <span className="text-[9px] font-black text-vortex-blue uppercase tracking-widest block font-mono">CONTENT OS PIPELINE INTEGRATIONS</span>
          <h2 className="text-sm font-black text-white uppercase tracking-tight font-sans">WORKFLOW INTEGRATIONS & RUNTIMES</h2>
          <p className="text-[11px] text-slate-400">
            Monitor files movement, review task pipelines, and analyze blocker states across our content-delivery systems.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-vortex-blue/10 border border-vortex-blue/35 text-vortex-blue font-mono text-[10px] rounded flex items-center gap-1.5 font-bold animate-pulse">
          <Workflow className="w-3.5 h-3.5" />
          ACTIVE STAGE MONITOR
        </div>
      </div>

      {/* STAGE LANE VERTICAL GRID FLOW */}
      <div className="border border-slate-700 bg-midnight rounded-xl p-4">
        <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider mb-3 flex items-center gap-2 font-mono">
          <Workflow className="w-4 h-4 text-vortex-blue" /> Sequential Stage Lane Progress Map
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {stages.map((st, idx) => {
            // Check if step is blocked (If it requires content_writer and activePhase is crawl, it is blocked)
            const isBlocked = st.requiresAgent === 'content_writer' && activePhase === 'crawl';
            let borderStyle = 'border-slate-700 bg-obsidian text-slate-400';
            let iconBlock = <CheckCircle2 className="w-4 h-4 text-slate-600" />;

            if (isBlocked) {
              borderStyle = 'border-red-900/60 bg-red-950/10 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
              iconBlock = <AlertOctagon className="w-4.5 h-4.5 text-red-500 animate-pulse shrink-0" />;
            } else if (idx < 2) {
              borderStyle = 'border-emerald-900/45 bg-obsidian text-slate-300';
              iconBlock = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
            } else if (idx === 2) {
              borderStyle = 'border-vortex-blue bg-vortex-blue/10 text-white';
              iconBlock = <span className="w-2 h-2 rounded-full bg-vortex-blue animate-ping"></span>;
            }

            return (
              <div key={idx} className={`p-3 rounded-lg border flex flex-col justify-between min-h-[110px] ${borderStyle}`}>
                <div>
                  <div className="flex justify-between items-start select-none">
                    <span className="text-[9px] text-slate-500 font-mono font-black">{idx + 1} / 06</span>
                    {iconBlock}
                  </div>
                  <h4 className="text-[10.5px] font-black uppercase tracking-tight mt-1 text-white truncate">
                    {st.title}
                  </h4>
                  <p className="text-[9px] text-slate-400 leading-snug mt-0.5">
                    {st.desc}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[8.5px] mt-2 pt-1.5 border-t border-slate-700 leading-none">
                  <span className="text-slate-500 font-mono uppercase">{st.badge}</span>
                  {isBlocked && (
                    <span className="text-red-500 font-black font-mono tracking-widest text-[7px]" title="Fatal block: content_writer not alive">
                      BLOCKED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {activePhase === 'crawl' && (
          <div className="mt-3 p-2 bg-red-950/20 border border-red-900/30 text-red-400 rounded-lg text-[10.5px] flex items-center gap-2 font-mono">
            <AlertOctagon className="w-4.5 h-4.5 text-red-500 shrink-0 animate-bounce" />
            <span>
              <strong>CRITICAL WORKFLOW BLOCKER DETECTED (CRAWL SCALE):</strong> Drafting/Production stage is missing core 'content_writer' Domain Agent. Manual creation required, or advance to 'WALK' scale to deploy automated buffers.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT PANEL - TASKS CHECKLIST (7 Cols) */}
        <div className="lg:col-span-7 border border-slate-700 bg-midnight rounded-xl p-4 h-[300px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-700 mb-3">
              <span className="text-xs font-black uppercase text-slate-200">Active Content Items Tasks</span>
              <span className="text-[9px] text-slate-500 font-mono">4 items tracked</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {contentTasks.map(task => {
                const isTaskBlocked = task.assignedTo === 'content_writer' && activePhase === 'crawl';
                let statusBadge = 'bg-slate-900 text-slate-400 border border-slate-700';
                
                if (isTaskBlocked) {
                  statusBadge = 'bg-red-950/40 text-red-500 border border-red-900/30 animate-pulse';
                } else if (task.status === 'REVIEWING') {
                  statusBadge = 'bg-vortex-blue/20 text-vortex-blue border border-vortex-blue/35';
                } else if (task.status === 'PASSED_VALIDATION') {
                  statusBadge = 'bg-emerald-950/35 text-emerald-400 border border-emerald-900/20';
                } else if (task.status === 'APPROVED') {
                  statusBadge = 'bg-emerald-950/45 text-emerald-400 border border-emerald-800/40';
                }

                return (
                  <div
                    key={task.id}
                    className="p-2 border border-slate-705/60 rounded-lg hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10.5px] font-mono text-white tracking-tight leading-tight uppercase font-bold">{task.name}</span>
                        <span className={`text-[7px] font-bold font-mono px-1 rounded ${task.risk === 'HIGH' ? 'bg-red-950/20 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
                          {task.risk}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Stage: {task.stage} • Agent Assigned: <strong className="font-mono text-slate-400">{task.assignedTo}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 select-none">
                      <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded uppercase tracking-tight ${statusBadge}`}>
                        {isTaskBlocked ? 'AGNT_MISSING_BLOCK' : task.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[9px] text-slate-500 uppercase font-mono border-t border-slate-700 pt-2 flex justify-between">
            <span>Anti-bypass filters: STRICT</span>
            <span>Task tracker sync: STABLE_TUNNELED</span>
          </div>
        </div>

        {/* RIGHT PANEL - SOURCE OF TRUTH (5 Cols) */}
        <div className="lg:col-span-5 border border-slate-700 bg-midnight rounded-xl p-4 h-[300px] flex flex-col justify-between">
          <div>
            <div className="pb-1.5 border-b border-slate-700 mb-3 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-200">Source of Truth (SOT) Repositories</span>
              <Database className="w-4 h-4 text-slate-600" />
            </div>

            <div className="space-y-2">
              {sotFiles.map((file, idx) => (
                <div key={idx} className="p-2 bg-slate-950/60 border border-slate-700 rounded flex items-center justify-between font-mono text-[10px]">
                  <div>
                    <span className="text-white font-bold block select-text truncate max-w-[180px]">{file.name}</span>
                    <span className="text-[8px] text-slate-500 uppercase">{file.layer}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-vortex-blue font-bold block">{file.size}</span>
                    <span className="text-[7.5px] text-slate-600">{file.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[9px] text-slate-500 font-mono tracking-tight text-center leading-none">
            All files are synced using validated, read-only caches.
          </p>
        </div>
      </div>
    </div>
  );
};
