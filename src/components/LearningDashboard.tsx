import React from 'react';
import { Sparkles, CheckCircle2, TrendingUp, Compass, Database, Award, BarChart4, ArrowRight } from 'lucide-react';
import { LearningLogEntry } from '../types/os';

interface LearningDashboardProps {
  learningLog: LearningLogEntry[];
  setLearningLog: React.Dispatch<React.SetStateAction<LearningLogEntry[]>>;
  activePhase: string;
  addLog: (source: string, level: 'info' | 'warn' | 'success' | 'error', message: string) => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  learningLog,
  setLearningLog,
  activePhase,
  addLog,
}) => {
  const handleConsolidateGoal = (item: LearningLogEntry) => {
    // 1. Toggle status to STAGED (Proposed)
    setLearningLog(prev =>
      prev.map(goal => (goal.id === item.id ? { ...goal, approvalStatus: 'STAGED' } : goal))
    );

    // 2. Log proposal info
    addLog(
      'DB',
      'info',
      `MEM_UPDATE: Proposed memory update for insight [${item.observation.substring(0, 30)}...]. Staged in validation queue requiring subsequent evaluation.`
    );
  };

  // Simulated outliers / click trends engagement analytics
  const outlierSpikes = [
    { metric: 'Newsletter Spike duration outlier', stat: '4.8m read time duration', confidence: '98%', status: 'UNRESOLVED' },
    { metric: 'Discrepancy: High clicked links to unapproved draft', stat: '84 clicks on draft_onboarding.md', confidence: '92%', status: 'RESOLVED' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
      {/* HEADER BANNER */}
      <div className="bg-slate-800 border border-slate-700 border-l-4 border-vortex-blue rounded-xl p-4 flex justify-between items-center shrink-0">
        <div>
          <span className="text-[9px] font-black text-vortex-blue uppercase tracking-widest block font-mono">STAKEPORT OPERATIONAL HEURISTICS</span>
          <h2 className="text-sm font-black text-white uppercase tracking-tight font-sans">LEARNED INSIGHTS & REINFORCEMENTS</h2>
          <p className="text-[11px] text-slate-400">
            Reinforce system context on the fly by consolidating outlier traffic metrics and learnings back into the shared Source of Truth maps.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-vortex-blue/10 border border-vortex-blue/35 text-vortex-blue font-mono text-[10px] rounded flex items-center gap-1.5 font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          {learningLog.filter(g => g.approvalStatus === 'IMPLEMENTED').length} / {learningLog.length} SYNCD
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: INSIGHTS DATABASE (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-[520px] border border-slate-700 bg-midnight rounded-xl p-4 overflow-hidden">
          <div className="pb-2 border-b border-slate-700 mb-3 flex justify-between items-center shrink-0">
            <span className="text-xs font-black uppercase text-slate-200 flex items-center gap-1.5 font-sans">
              <Award className="w-4 h-4 text-vortex-blue" /> Learned Insights Registry
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Feedback telemetry buffers</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {learningLog.length === 0 ? (
              <div className="text-center py-10 text-slate-500 italic font-mono">No feedback entries.</div>
            ) : (
              learningLog.map(item => {
                const isComp = item.approvalStatus === 'APPROVED' || item.approvalStatus === 'IMPLEMENTED';
                const isImplemented = item.approvalStatus === 'IMPLEMENTED';

                return (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg flex flex-col justify-between min-h-[110px] transition-all bg-slate-950/40 border-slate-700 ${
                      isImplemented ? 'opacity-65 border-emerald-950/35 bg-slate-950/20' : 'hover:bg-slate-950/90'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-[10.5px] font-black uppercase text-white truncate max-w-[280px]">
                          {item.observation}
                        </h4>
                        <span className={`text-[7px] font-bold font-mono px-1 rounded uppercase shrink-0 ${
                          isImplemented ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20' : 'bg-vortex-blue/10 text-vortex-blue border border-vortex-blue/35'
                        }`}>
                          {item.approvalStatus}
                        </span>
                      </div>

                      <p className="text-[9.5px] text-slate-400 leading-snug tracking-tight my-1 select-text font-mono">
                        EVIDENCE: {item.evidence}
                      </p>
                      <p className="text-[10px] text-slate-300 leading-snug mt-1 select-text">
                        INTERPRETATION: {item.interpretation}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-700 flex items-center justify-between font-mono select-none">
                      <span className="text-[8px] text-slate-500 uppercase">
                        CRITERIA SOURCE: {item.source} (Match: {Math.round(item.confidence * 100)}%)
                      </span>

                      {!isImplemented && (
                        <button
                          type="button"
                          onClick={() => handleConsolidateGoal(item)}
                          className="px-2 py-0.5 rounded bg-vortex-blue hover:bg-vortex-blue/80 text-white border border-vortex-blue/30 text-[8px] uppercase font-bold flex items-center gap-0.5"
                        >
                          Propose Memory Update <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: OUTLIERS & HEURISTIC ENGINE (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col h-[520px] gap-4">
          <div className="flex-1 border border-slate-700 bg-midnight rounded-xl p-4 overflow-y-auto">
            <div className="pb-1.5 border-b border-slate-700 mb-3 flex items-center justify-between shrink-0">
              <span className="text-xs font-black uppercase text-slate-200 flex items-center gap-1.5 font-sans">
                <BarChart4 className="w-4 h-4 text-vortex-blue font-black shrink-0" /> Analytics Outliers Tracking
              </span>
              <span className="text-[8px] text-slate-500 font-mono">Live feeds</span>
            </div>

            <p className="text-[10px] text-slate-400 leading-snug mb-3">
              Google Analytics outlier spike engagement checks are automatically surfaced in real-time. Action is recommended to secure SOT consensus.
            </p>

            <div className="space-y-2.5">
              {outlierSpikes.map((spike, idx) => (
                <div key={idx} className="p-3 border border-slate-700 rounded-lg bg-slate-950/45">
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-[7.5px] font-bold text-vortex-blue font-mono uppercase font-black uppercase animate-pulse">
                      HEURISTICS DETECT SCAN
                    </span>
                    <span className={`text-[7px] font-bold font-mono px-1 rounded uppercase ${
                      spike.status === 'UNRESOLVED' ? 'bg-amber-955/20 text-amber-500 border border-amber-550/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {spike.status}
                    </span>
                  </div>

                  <h5 className="text-[10.5px] font-black text-white uppercase truncate">{spike.metric}</h5>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">{spike.stat}</p>

                  <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-mono mt-2 pt-1.5 border-t border-slate-700">
                    <span>Confidence Match: {spike.confidence}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-700 bg-midnight rounded-xl p-4 shrink-0 space-y-2.5 font-mono text-[9.5px]">
            <h4 className="text-[9px] tracking-widest text-slate-500 block uppercase font-bold">
              Founder Agent Memory SOT updates loop:
            </h4>
            <div className="bg-slate-950 p-2.5 rounded border border-slate-700 space-y-1 max-h-24 overflow-y-auto text-slate-400 text-[8.5px]">
              <div>1. Trace GA Click metrics for anomalous peaks.</div>
              <div>2. Detect content duration outlier retention metrics.</div>
              <div>3. Compile discrepancies index proposals.</div>
              <div>4. Authorize SOT updates back to Founder CEO memory.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
