import React from 'react';
import { Radio, Cpu, Activity, Zap, Globe, Sparkles } from 'lucide-react';
import { SpectrumBand } from '../types/telecom';

interface HeaderProps {
  activeBand: SpectrumBand;
  onSelectBand: (band: SpectrumBand) => void;
  allBands: SpectrumBand[];
  aggregateThroughputGbps: number;
  averageLatencyMs: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiCopilot: () => void;
  isAiHealing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeBand,
  onSelectBand,
  allBands,
  aggregateThroughputGbps,
  averageLatencyMs,
  activeTab,
  setActiveTab,
  onOpenAiCopilot,
  isAiHealing,
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#070a13]/90 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/60 text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-cyan-400 font-semibold tracking-wider font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2 inline-block"></span>
            3GPP REL-20 / 6G+ ACTIVE
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center text-slate-300">
            <Globe className="w-3.5 h-3.5 mr-1 text-amber-400" />
            PulsNet Stratospheric HAPS Link: <strong className="text-emerald-400 ml-1">SYNCED</strong>
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="hidden md:flex items-center text-slate-300">
            <Cpu className="w-3.5 h-3.5 mr-1 text-purple-400" />
            AI-RAN Neural Core: <strong className="text-cyan-300 ml-1">Gemini 3.8 Engine</strong>
          </span>
        </div>

        <div className="flex items-center space-x-4 font-mono">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">AGG. THROUGHPUT:</span>
            <span className="text-cyan-400 font-bold">{aggregateThroughputGbps.toFixed(1)} Gbps</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">LATENCY:</span>
            <span className="text-emerald-400 font-bold">{averageLatencyMs.toFixed(2)} ms</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">JITTER:</span>
            <span className="text-purple-400 font-bold">&lt; 18 μs</span>
          </div>
        </div>
      </div>

      {/* Main Brand & Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#090d19] rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-[9px] font-black text-black">
              +
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white font-mono flex items-center">
                IS <span className="text-cyan-400 ml-1">6G+</span>
              </h1>
              <span className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                Autonomous Telecom AI
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sub-THz Spectrum, ISAC Dual Sensing & AI-RAN Digital Twin Studio
            </p>
          </div>
        </div>

        {/* Band Selector Dropdown / Pills */}
        <div className="flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg p-1">
          <span className="text-xs text-slate-400 font-mono px-2 hidden lg:inline">BAND:</span>
          {allBands.map((band) => (
            <button
              key={band.id}
              onClick={() => onSelectBand(band)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                activeBand.id === band.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {band.nominalFreqGhz} GHz
            </button>
          ))}
        </div>

        {/* AI Action button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAiCopilot}
            disabled={isAiHealing}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold font-mono tracking-wide transition-all shadow-md ${
              isAiHealing
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiHealing ? 'AI SELF-HEALING...' : 'AI 6G+ COPILOT'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 border-t border-slate-800/70 overflow-x-auto text-xs font-mono">
        {[
          { id: 'twin', label: '6G+ DIGITAL TWIN', icon: Activity },
          { id: 'spectrum', label: 'SUB-THZ & ISAC RADAR', icon: Radio },
          { id: 'ris', label: 'RIS METASURFACE', icon: Zap },
          { id: 'slicing', label: '3GPP SLICING ORCHESTRATOR', icon: Cpu },
          { id: 'link_budget', label: 'THZ LINK BUDGET', icon: Globe },
          { id: 'copilot', label: 'AI TELECOM INTELLIGENCE', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
