import React, { useState } from 'react';
import { Shield, CheckCircle2, XCircle, FileText, Lock, ShieldCheck, HelpCircle, Terminal, Database } from 'lucide-react';
import { ApprovalItem, StrategicInitiative } from '../types/os';

export interface DBRecord {
  id: string;
  key: string;
  type: string;
  phase: string;
  status: 'PENDING' | 'APPROVED' | 'IN_REVIEW' | 'ARCHIVED';
  latency: string;
}

interface FounderDashboardProps {
  approvals: ApprovalItem[];
  setApprovals: React.Dispatch<React.SetStateAction<ApprovalItem[]>>;
  dbRecords: DBRecord[];
  setDbRecords: React.Dispatch<React.SetStateAction<DBRecord[]>>;
  activePhase: string;
  addLog: (source: string, level: 'info' | 'warn' | 'success' | 'error', message: string) => void;
  initiatives: StrategicInitiative[];
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  approvals,
  setApprovals,
  dbRecords,
  setDbRecords,
  activePhase,
  addLog,
  initiatives,
}) => {
  const [selectedApprId, setSelectedApprId] = useState<string | null>(null);

  const handleApprove = (item: ApprovalItem) => {
    // 1. Update approval status to APPROVED
    setApprovals(prev =>
      prev.map(appr => (appr.id === item.id ? { ...appr, status: 'APPROVED' } : appr))
    );

    // 2. Insert into Notion Sim DB Records
    const customId = `rec-gen-${Date.now()}`;
    const newDbEntry: DBRecord = {
      id: customId,
      key: item.itemPath,
      type: 'Authorized Phase 1 Discovery Token',
      phase: activePhase.toUpperCase(),
      status: 'APPROVED',
      latency: '1ms',
    };
    setDbRecords(prev => [newDbEntry, ...prev]);

    // 3. Log to telemetry console
    addLog(
      'SEC',
      'success',
      `FOUNDER APPROVAL COMPLETED: Authorized Phase 1 Discovery execution for [${item.itemType}]. Outbound and public/CMS publishing remains blocked until direct human-in-the-loop validation.`
    );
  };

  const handleDecline = (item: ApprovalItem) => {
    // 1. Update approval status to REJECTED
    setApprovals(prev =>
      prev.map(appr => (appr.id === item.id ? { ...appr, status: 'REJECTED' } : appr))
    );

    // 2. Add log
    addLog(
      'SEC',
      'warn',
      `FOUNDER REVIEW ACTION: REJECTED proposal packet for [${item.itemPath}]. Returned to draft sandbox.`
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
      {/* HEADER BANNER */}
      <div className="bg-slate-800 border border-slate-700 border-l-4 border-vortex-blue rounded-xl p-4 flex justify-between items-center shrink-0">
        <div>
          <span className="text-[9px] font-black text-vortex-blue uppercase tracking-widest block font-mono">STAKEPORT OS GOVERNANCE LEVEL-1</span>
          <h2 className="text-sm font-black text-white uppercase tracking-tight font-sans">FOUNDER DIRECTIVE & EXECUTIVE AUDITS</h2>
          <p className="text-[11px] text-slate-400">
            Founder and Operating Director approval signatures govern all production deployments. Direct-bypass publishing channel is strictly unavailable.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-vortex-blue/10 border border-vortex-blue/35 text-vortex-blue font-mono text-[10px] rounded flex items-center gap-1.5 font-bold">
            <Lock className="w-3.5 h-3.5" />
            SEC_MANDATORY SYSTEM
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* LEFT COLUMN - PENDING Inbox (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-[520px] border border-slate-700 bg-midnight rounded-xl p-4 overflow-hidden">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-700 mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-vortex-blue" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Pending Recommendation Packets</h3>
            </div>
            <span className="bg-vortex-blue/20 text-vortex-blue font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
              {approvals.filter(a => a.status === 'PENDING').length} INBOX
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {approvals.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 italic text-[11px] border border-dashed border-slate-700 rounded-lg p-6 font-mono">
                No active or pending recommendation packets require executive approval.
              </div>
            ) : (
              approvals.map(item => {
                const isSelected = selectedApprId === item.id;
                let statusBadge = 'bg-slate-700/30 text-slate-400 border border-slate-700';
                if (item.status === 'APPROVED') statusBadge = 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30';
                if (item.status === 'REJECTED') statusBadge = 'bg-red-950/40 text-red-400 border border-red-900/30';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedApprId(isSelected ? null : item.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-vortex-blue shadow-lg'
                        : 'bg-slate-950/40 border-slate-700 hover:bg-slate-950/90'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div>
                        <h4 className="text-[11px] font-black tracking-tight text-white uppercase truncate max-w-[280px]" title={item.itemType}>
                          {item.itemType}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono block">
                          PAYLOAD: {item.itemPath}
                        </span>
                      </div>
                      <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded shrink-0 uppercase tracking-tight ${statusBadge}`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-[10.5px] text-slate-400 leading-snug my-1.5">
                      {item.decisionRequired}
                    </p>

                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono mt-2 pt-1.5 border-t border-slate-700">
                      <span>RISK LEVEL: {item.riskLevel}</span>
                      <span>APPROVER ACTOR: {item.approver.toUpperCase()}</span>
                    </div>

                    {/* EXPANDED ACTIONS */}
                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700 space-y-3">
                        <div className="p-2 bg-slate-950 border border-slate-700 rounded-md">
                          <span className="text-[8px] font-black text-slate-500 block mb-1 uppercase tracking-wider font-mono">
                            Compliance Means & Constraints:
                          </span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Validation Channel: {item.approvalMeans}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Technical verification check completed successfully. Bypass channel offline.</span>
                            </div>
                          </div>
                        </div>

                        {item.status === 'PENDING' && (
                          <div className="flex gap-2 justify-end font-mono">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDecline(item);
                              }}
                              className="px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-505/20 text-red-400 border border-red-500/30 text-[9px] uppercase font-bold transition-all"
                            >
                              Decline Packet
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(item);
                              }}
                              className="px-2.5 py-1.5 rounded bg-vortex-blue text-white text-[9px] uppercase font-bold hover:bg-vortex-blue/90 transition-all shadow-[0_0_10px_rgba(45,111,232,0.25)]"
                            >
                              Approve & Release Token
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - STRATEGY PACKETS BOARD & COMPLIANCE HUD (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[520px] gap-4">
          <div className="flex-1 border border-slate-700 bg-midnight rounded-xl p-4 overflow-y-auto">
            <div className="pb-1.5 border-b border-slate-700 mb-3 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-black uppercase text-slate-200">Operating Initiatives & Campaigns</h3>
            </div>

            <div className="space-y-2.5">
              {initiatives.map(ini => (
                <div key={ini.id} className="p-3 bg-slate-950/60 border border-slate-700 rounded-lg">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[7.5px] font-bold text-vortex-blue font-mono uppercase">
                      Campaign OS Token
                    </span>
                    <span className="text-[7.5px] font-bold font-mono px-1 rounded uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      Phase_{ini.stage}
                    </span>
                  </div>

                  <h4 className="text-[10.5px] font-black text-white uppercase">{ini.name}</h4>
                  <p className="text-[9.5px] text-slate-400 leading-normal mt-1">
                    {ini.description}
                  </p>

                  <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-700">
                    <span>File: {ini.sourceFile}</span>
                    <span>Lead: {ini.owner}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-700 bg-midnight rounded-xl p-4 shrink-0 space-y-2.5 font-mono text-[10px]">
            <h4 className="text-[9px] tracking-widest text-slate-500 block uppercase font-bold">
              Founder Governance Security Audit Logs:
            </h4>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-700 space-y-1 max-h-24 overflow-y-auto font-mono text-slate-400 text-[9px]">
              <div>[SEC-01] ➔ Bypass routing is DISABLED globally.</div>
              <div>[SEC-02] ➔ Token verification audits online.</div>
              <div>[SEC-03] ➔ Verified 100% manual check strictness on L1.</div>
              <div>[SEC-04] ➔ Policy holds: All Draft actions require validation.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
