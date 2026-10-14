import React, { useState } from 'react';
import { NetworkSlice } from '../types/telecom';
import { Cpu, ShieldCheck, Sparkles, Plus, Clock, Zap, Activity } from 'lucide-react';

interface NetworkSlicingPanelProps {
  slices: NetworkSlice[];
  onAddSlice: (slice: NetworkSlice) => void;
}

export const NetworkSlicingPanel: React.FC<NetworkSlicingPanelProps> = ({
  slices,
  onAddSlice,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSlicePrompt, setNewSlicePrompt] = useState('Space-Air-Ground Non-Terrestrial Network (NTN) Disaster Recovery');
  const [showModal, setShowModal] = useState(false);

  const handleGenerateSlice = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-slice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sliceType: newSlicePrompt,
          requirements: 'Sub-millisecond latency with 99.9999% SLA reliability',
        }),
      });

      if (!res.ok) throw new Error('Failed to generate slice');
      const data = await res.json();

      const newSlice: NetworkSlice = {
        id: `slice-${Date.now()}`,
        name: data.sliceName || newSlicePrompt,
        sst: data.sst || 5,
        sd: data.sd || '0x006005',
        category: (data.sliceName?.includes('Tactile') ? 'Tactile' : 'URLLC-X') as any,
        targetLatencyMs: data.sla?.maxLatencyMs || 0.12,
        targetThroughputGbps: data.sla?.targetThroughputGbps || 65.0,
        reliabilityNines: data.sla?.availabilityPercent || 99.9999,
        maxJitterUs: data.sla?.maxJitterMicroseconds || 25,
        activeUsers: 120,
        color: '#f43f5e',
      };

      onAddSlice(newSlice);
      setShowModal(false);
    } catch (e) {
      console.error(e);
      // Fallback slice
      const fallback: NetworkSlice = {
        id: `slice-${Date.now()}`,
        name: newSlicePrompt,
        sst: 5,
        sd: '0x006005',
        category: 'URLLC-X',
        targetLatencyMs: 0.15,
        targetThroughputGbps: 55.0,
        reliabilityNines: 99.9999,
        maxJitterUs: 30,
        activeUsers: 80,
        color: '#f43f5e',
      };
      onAddSlice(fallback);
      setShowModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              3GPP REL-20 6G NETWORK SLICING ORCHESTRATOR
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono">
                5 ACTIVE SLICES
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic URLLC-X, Holographic eMBB+, ISAC Sensing-as-a-Service & PulsNet Rural Mesh
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>AI SYNTHESIZE 6G SLICE</span>
        </button>
      </div>

      {/* Slices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {slices.map((slice) => (
          <div
            key={slice.id}
            className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: slice.color }}
                  />
                  <h3 className="text-sm font-bold text-white font-mono">{slice.name}</h3>
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  SST: <strong className="text-slate-200">{slice.sst}</strong> | SD:{' '}
                  <strong className="text-slate-200">{slice.sd}</strong> | Tier:{' '}
                  <span className="text-cyan-300 font-semibold">{slice.category}</span>
                </div>
              </div>

              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono px-2 py-0.5 rounded">
                SLA COMPLIANT
              </span>
            </div>

            {/* SLA KPI Matrix */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  LATENCY
                </div>
                <div className="text-sm font-bold text-cyan-300 mt-1">
                  {slice.targetLatencyMs} ms
                </div>
                <div className="text-[9px] text-slate-400">Jitter: &lt; {slice.maxJitterUs} μs</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-slate-500 text-[10px] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" />
                  THROUGHPUT
                </div>
                <div className="text-sm font-bold text-purple-300 mt-1">
                  {slice.targetThroughputGbps} Gbps
                </div>
                <div className="text-[9px] text-slate-400">Dedicated Flow</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
                <div className="text-slate-500 text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  RELIABILITY
                </div>
                <div className="text-sm font-bold text-emerald-300 mt-1">
                  {slice.reliabilityNines}%
                </div>
                <div className="text-[9px] text-slate-400">Six 9s Protocol</div>
              </div>
            </div>

            {/* Allocated Resources bar */}
            <div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>RAN CU/DU POOL ALLOCATION</span>
                <span className="text-slate-300 font-semibold">{slice.activeUsers} Active UEs</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(25, slice.targetThroughputGbps * 0.65))}%`,
                    backgroundColor: slice.color,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for AI Slice Synthesis */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f1d] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-cyan-300 font-mono text-sm font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI 6G+ SLICE ARCHITECT</span>
            </div>

            <p className="text-xs text-slate-300">
              Describe the mission-critical telecommunications use-case (e.g., Tactile Remote Tele-Surgery, Urban Drone Swarm, High-Altitude PulsNet Rural Mesh).
            </p>

            <textarea
              value={newSlicePrompt}
              onChange={(e) => setNewSlicePrompt(e.target.value)}
              className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 resize-none"
              placeholder="e.g. Brain-Computer Interface (BCI) Sub-millisecond Neural Uplink..."
            />

            <div className="flex items-center justify-end space-x-3 pt-2 font-mono text-xs">
              <button
                onClick={() => setShowModal(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateSlice}
                disabled={isGenerating || !newSlicePrompt.trim()}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold flex items-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate 6G Slice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
