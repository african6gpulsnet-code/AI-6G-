import React from 'react';
import { NetworkAnomaly } from '../types/telecom';
import { AlertTriangle, ShieldCheck, RefreshCw, Zap, Wind, CloudRain } from 'lucide-react';

interface AnomalySimulatorProps {
  anomalies: NetworkAnomaly[];
  activeAnomaly: NetworkAnomaly | null;
  onSelectAnomaly: (anomaly: NetworkAnomaly | null) => void;
  onTriggerSelfHealing: () => void;
  isHealing: boolean;
}

export const AnomalySimulator: React.FC<AnomalySimulatorProps> = ({
  anomalies,
  activeAnomaly,
  onSelectAnomaly,
  onTriggerSelfHealing,
  isHealing,
}) => {
  return (
    <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl font-mono text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider">
              RF Stress & Degradation Injector
            </h3>
            <p className="text-[11px] text-slate-400">
              Test 6G+ network resilience against Sub-THz rain attenuation, Doppler shifts & RIS drifts
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSelfHealing}
          disabled={isHealing || !activeAnomaly}
          className={`px-3.5 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
            activeAnomaly
              ? 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/30 font-bold'
              : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
          <span>{isHealing ? 'AI SELF-HEALING IN PROGRESS...' : 'AI AUTONOMOUS SELF-HEAL'}</span>
        </button>
      </div>

      {/* Anomaly selector cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {anomalies.map((anom) => {
          const isSelected = activeAnomaly?.id === anom.id;
          return (
            <div
              key={anom.id}
              onClick={() => onSelectAnomaly(isSelected ? null : anom)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">{anom.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                    anom.severity === 'critical'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {anom.severity}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{anom.description}</p>
              <div className="mt-2 text-[10px] flex items-center justify-between text-slate-500 border-t border-slate-800/80 pt-1.5">
                <span>IMPACT: <strong className="text-red-400">{anom.impactSnrDb} dB</strong></span>
                <span className="text-cyan-400">{anom.affectedBand}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active state message */}
      {activeAnomaly ? (
        <div className="bg-red-950/20 border border-red-500/40 p-3 rounded-xl flex items-center justify-between text-red-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Active Degradation: <strong>{activeAnomaly.name}</strong> ({activeAnomaly.impactSnrDb} dB SNR margin drop)</span>
          </div>
          <span className="text-[10px] underline cursor-pointer hover:text-white" onClick={() => onSelectAnomaly(null)}>
            Dismiss Anomaly
          </span>
        </div>
      ) : (
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-xl flex items-center space-x-2 text-emerald-300 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Nominal RF Propagation: All Sub-THz radio channels operating at full Shannon efficiency.</span>
        </div>
      )}
    </div>
  );
};
