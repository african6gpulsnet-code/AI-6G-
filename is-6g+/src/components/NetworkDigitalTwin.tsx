import React, { useState } from 'react';
import { NetworkNode, SpectrumBand } from '../types/telecom';
import { Shield, Radio, RefreshCw, AlertTriangle, Eye, Activity, Sliders, Zap } from 'lucide-react';

interface NetworkDigitalTwinProps {
  nodes: NetworkNode[];
  onUpdateNode: (node: NetworkNode) => void;
  activeBand: SpectrumBand;
  risActive: boolean;
  onToggleRis: () => void;
  onSelectNode: (node: NetworkNode) => void;
  selectedNode: NetworkNode | null;
  rainObstacleActive: boolean;
  onToggleRainObstacle: () => void;
  onTriggerSelfHealing: () => void;
  isHealing: boolean;
}

export const NetworkDigitalTwin: React.FC<NetworkDigitalTwinProps> = ({
  nodes,
  activeBand,
  risActive,
  onToggleRis,
  onSelectNode,
  selectedNode,
  rainObstacleActive,
  onToggleRainObstacle,
  onTriggerSelfHealing,
  isHealing,
}) => {
  const [beamTrackingMode, setBeamTrackingMode] = useState<'autonomous' | 'manual'>('autonomous');
  const [manualAzimuth, setManualAzimuth] = useState<number>(52);
  const [txPowerDbm, setTxPowerDbm] = useState<number>(38);

  const gnbNode = nodes.find((n) => n.type === 'gNB') || nodes[0];
  const risNode = nodes.find((n) => n.type === 'RIS') || nodes[1];
  const holoNode = nodes.find((n) => n.type === 'UE_HOLO');
  const vehicleNode = nodes.find((n) => n.type === 'UE_VEHICLE');
  const hapsNode = nodes.find((n) => n.type === 'HAPS_NTN');

  // Calculate dynamic throughput of holoNode based on RIS and Rain
  let holoThroughput = holoNode ? holoNode.throughputGbps : 98;
  let holoLatency = holoNode ? holoNode.latencyMs : 0.08;
  let isBlocked = !risActive;

  if (isBlocked) {
    holoThroughput = 4.2; // degraded due to NLOS blockage
    holoLatency = 14.8;
  }
  if (rainObstacleActive) {
    holoThroughput = holoThroughput * 0.45;
    holoLatency = holoLatency * 1.8;
  }

  return (
    <div className="space-y-4">
      {/* Control bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              6G+ CELLULAR & SUB-THZ DIGITAL TWIN
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded">
                SIMULATION LIVE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive 2.5D Topology: Base Station (gNB), RIS Metasurface, NLOS Obstacle & UEs
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          <button
            onClick={onToggleRis}
            className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
              risActive
                ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${risActive ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>RIS REFLECTION: {risActive ? 'ENABLED (+18 dB)' : 'DISABLED (NLOS DROP)'}</span>
          </button>

          <button
            onClick={onToggleRainObstacle}
            className={`px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 transition-all ${
              rainObstacleActive
                ? 'bg-red-500/20 border-red-500/60 text-red-300 animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>RAIN FADE (50 mm/h): {rainObstacleActive ? 'ACTIVE (-14 dB)' : 'OFF'}</span>
          </button>

          <button
            onClick={onTriggerSelfHealing}
            disabled={isHealing}
            className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isHealing ? 'animate-spin' : ''}`} />
            <span>{isHealing ? 'OPTIMIZING RAN...' : 'AI SELF-HEAL'}</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Canvas */}
      <div className="relative w-full h-[520px] bg-[#070913] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Subtle coordinate grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient atmospheric haze overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#070913]/40 to-[#070913] pointer-events-none" />

        {/* SVG Visualization Layer for Beams and Waves */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="beamGradGnbToRis" x1="20%" y1="35%" x2="48%" y2="28%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
            </linearGradient>

            <linearGradient id="beamGradRisToHolo" x1="48%" y1="28%" x2="82%" y2="32%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="beamGradGnbToVehicle" x1="20%" y1="35%" x2="75%" y2="65%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="beamGradHapsToGnb" x1="52%" y1="8%" x2="20%" y2="35%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* HAPS Stratospheric Downlink */}
          <line
            x1="52%"
            y1="8%"
            x2="20%"
            y2="35%"
            stroke="url(#beamGradHapsToGnb)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />

          {/* Direct Beam: gNB to Vehicle (LOS) */}
          <line
            x1="20%"
            y1="35%"
            x2="75%"
            y2="65%"
            stroke="url(#beamGradGnbToVehicle)"
            strokeWidth="3"
            filter="url(#glowEffect)"
          />

          {/* gNB to RIS Beam (Incident Sub-THz wave) */}
          {risActive && (
            <line
              x1="20%"
              y1="35%"
              x2="48%"
              y2="28%"
              stroke="url(#beamGradGnbToRis)"
              strokeWidth="3.5"
              filter="url(#glowEffect)"
            />
          )}

          {/* RIS Reflected Beam to Holographic Terminal */}
          {risActive ? (
            <line
              x1="48%"
              y1="28%"
              x2="82%"
              y2="32%"
              stroke="url(#beamGradRisToHolo)"
              strokeWidth="4"
              strokeDasharray="8 4"
              filter="url(#glowEffect)"
            />
          ) : (
            /* Blocked NLOS direct line showing attenuation */
            <line
              x1="20%"
              y1="35%"
              x2="82%"
              y2="32%"
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              strokeOpacity="0.5"
            />
          )}

          {/* Radiation coverage lobes around gNB */}
          <circle
            cx="20%"
            cy="35%"
            r="120"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
            strokeOpacity="0.15"
            strokeDasharray="3 3"
          />
          <circle
            cx="20%"
            cy="35%"
            r="70"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.2"
            strokeOpacity="0.25"
          />

          {/* RIS Phase Concentrator Arc */}
          {risActive && (
            <circle
              cx="48%"
              cy="28%"
              r="40"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeOpacity="0.4"
              strokeDasharray="4 2"
              className="animate-spin"
              style={{ transformOrigin: '48% 28%', animationDuration: '10s' }}
            />
          )}
        </svg>

        {/* NLOS Obstacle Block (Concrete Architecture / Building) */}
        <div
          className="absolute top-[30%] left-[58%] -translate-x-1/2 -translate-y-1/2 w-28 h-40 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 shadow-2xl flex flex-col justify-between"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1">
            <span className="font-bold text-red-400">OBSTACLE</span>
            <span>NLOS</span>
          </div>
          <div className="text-[10px] text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold">High-Rise Structure</div>
            <div>Sub-THz Attenuation:</div>
            <div className="text-red-400 font-mono font-bold">-48 dB Loss</div>
            <div className="text-[9px] text-slate-500">Direct LOS Blocked</div>
          </div>
          <div className="text-[9px] bg-red-950/60 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded text-center">
            {risActive ? 'Bypassed via RIS' : 'Direct Signal Absorbed'}
          </div>
        </div>

        {/* Rain Obstacle Cloud if active */}
        {rainObstacleActive && (
          <div className="absolute top-[45%] left-[38%] -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-blue-950/30 border border-blue-500/40 rounded-3xl p-3 flex flex-col items-center justify-center animate-pulse pointer-events-none">
            <div className="text-blue-300 font-mono text-xs font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              TROPICAL RAIN CELL
            </div>
            <div className="text-[11px] text-blue-200 font-mono">Rate: 50.0 mm/h</div>
            <div className="text-[10px] text-red-400 font-mono">Absorption: -14.2 dB</div>
            <div className="text-[9px] text-slate-400 text-center mt-1">
              Water droplet Rayleigh scattering at {activeBand.nominalFreqGhz} GHz
            </div>
          </div>
        )}

        {/* NODE: Stratospheric HAPS (Africa PulsNet) */}
        <div
          onClick={() => hapsNode && onSelectNode(hapsNode)}
          className={`absolute top-[8%] left-[52%] -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-xl border cursor-pointer transition-all ${
            selectedNode?.id === hapsNode?.id
              ? 'bg-amber-950/70 border-amber-400 shadow-lg shadow-amber-500/30 scale-110 z-30'
              : 'bg-slate-900/80 border-amber-500/40 hover:border-amber-400 z-20'
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-amber-300">PulsNet HAPS (20km)</div>
              <div className="text-[9px] text-slate-400 font-mono">Stratosphere Non-Terrestrial</div>
            </div>
          </div>
        </div>

        {/* NODE: 6G gNodeB Tower */}
        <div
          onClick={() => onSelectNode(gnbNode)}
          className={`absolute top-[35%] left-[20%] -translate-x-1/2 -translate-y-1/2 p-3.5 rounded-2xl border cursor-pointer transition-all ${
            selectedNode?.id === gnbNode.id
              ? 'bg-cyan-950/80 border-cyan-400 shadow-xl shadow-cyan-500/40 scale-105 z-30'
              : 'bg-slate-900/90 border-cyan-500/50 hover:border-cyan-400 z-20'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black"></span>
            </div>
            <div>
              <div className="text-xs font-mono font-extrabold text-white flex items-center gap-1.5">
                {gnbNode.name}
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">
                {activeBand.name} | {activeBand.nominalFreqGhz} GHz
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                Power: {txPowerDbm} dBm | Azimuth: {manualAzimuth}°
              </div>
            </div>
          </div>
        </div>

        {/* NODE: RIS Metasurface Array */}
        <div
          onClick={() => onSelectNode(risNode)}
          className={`absolute top-[28%] left-[48%] -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border cursor-pointer transition-all ${
            risActive
              ? selectedNode?.id === risNode.id
                ? 'bg-sky-950/80 border-sky-400 shadow-xl shadow-sky-500/40 scale-105 z-30'
                : 'bg-slate-900/90 border-sky-400/70 hover:border-sky-300 z-20'
              : 'bg-slate-900/60 border-slate-700/60 opacity-60 z-20'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                risActive ? 'bg-sky-500/20 border-sky-400' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Zap className={`w-4 h-4 ${risActive ? 'text-sky-300 animate-pulse' : 'text-slate-500'}`} />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-sky-200">RIS Metasurface #01</div>
              <div className="text-[10px] font-mono text-slate-400">16x16 Meta-Atoms (256 el)</div>
              <div className="text-[10px] font-mono text-cyan-300 font-semibold">
                {risActive ? 'Beam Redirection Active (+18 dB)' : 'Array Inactive'}
              </div>
            </div>
          </div>
        </div>

        {/* NODE: Holographic Telepresence Pod */}
        <div
          onClick={() => holoNode && onSelectNode(holoNode)}
          className={`absolute top-[32%] left-[82%] -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border cursor-pointer transition-all ${
            isBlocked
              ? 'bg-red-950/40 border-red-500/60 z-20'
              : selectedNode?.id === holoNode?.id
              ? 'bg-purple-950/80 border-purple-400 shadow-xl shadow-purple-500/40 scale-105 z-30'
              : 'bg-slate-900/90 border-purple-500/50 hover:border-purple-400 z-20'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                isBlocked ? 'bg-red-500/20 border-red-500' : 'bg-purple-500/20 border-purple-400'
              }`}
            >
              <Eye className={`w-4 h-4 ${isBlocked ? 'text-red-400' : 'text-purple-300'}`} />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-purple-200">Holo-Telepresence Pod</div>
              <div className="text-[10px] font-mono text-slate-400">Tactile & 3D Video Stream</div>
              <div className="text-[10px] font-mono font-bold mt-0.5 flex items-center gap-1.5">
                <span className={isBlocked ? 'text-red-400' : 'text-emerald-400'}>
                  {holoThroughput.toFixed(1)} Gbps
                </span>
                <span className="text-slate-500">|</span>
                <span className={holoLatency > 5 ? 'text-red-400' : 'text-cyan-300'}>
                  {holoLatency.toFixed(2)} ms
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* NODE: Autonomous Connected EV */}
        <div
          onClick={() => vehicleNode && onSelectNode(vehicleNode)}
          className={`absolute top-[65%] left-[75%] -translate-x-1/2 -translate-y-1/2 p-3 rounded-xl border cursor-pointer transition-all ${
            selectedNode?.id === vehicleNode?.id
              ? 'bg-emerald-950/80 border-emerald-400 shadow-xl shadow-emerald-500/40 scale-105 z-30'
              : 'bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400 z-20'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-200">Autonomous Connected EV #09</div>
              <div className="text-[10px] font-mono text-slate-400">Speed: 120 km/h | V2X URLLC</div>
              <div className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                {vehicleNode ? vehicleNode.throughputGbps : 34.2} Gbps | {vehicleNode ? vehicleNode.latencyMs : 0.11} ms
              </div>
            </div>
          </div>
        </div>

        {/* Live Legend Watermark */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-[10px] font-mono text-slate-400 flex items-center space-x-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 inline-block"></span>
            <span>Sub-THz Link</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-purple-400 border-dashed border-t border-purple-400 inline-block"></span>
            <span>RIS Reflected Beam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
            <span>HAPS Non-Terrestrial</span>
          </div>
        </div>
      </div>

      {/* Node Inspector Bottom Bar */}
      {selectedNode && (
        <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">{selectedNode.name}</div>
              <div className="text-slate-400 text-[11px]">
                Type: {selectedNode.type} | Coordinates: X:{selectedNode.x}%, Y:{selectedNode.y}% | Elevation: {selectedNode.elevationM}m
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div>
              <div className="text-slate-500 text-[10px]">THROUGHPUT</div>
              <div className="text-cyan-400 font-bold text-sm">{selectedNode.throughputGbps.toFixed(1)} Gbps</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">LATENCY</div>
              <div className="text-emerald-400 font-bold text-sm">{selectedNode.latencyMs.toFixed(3)} ms</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">SINR</div>
              <div className="text-purple-400 font-bold text-sm">{selectedNode.sinrDb.toFixed(1)} dB</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">TX POWER</div>
              <div className="text-amber-400 font-bold text-sm">{selectedNode.powerDbm} dBm</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
