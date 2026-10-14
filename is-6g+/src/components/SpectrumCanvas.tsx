import React, { useState, useId } from 'react';
import { SpectrumBand } from '../types/telecom';
import { calculateAtmosphericLoss, computeIsacMetrics } from '../utils/telecomMath';
import { Radio, Target, Activity, Zap, Compass, RefreshCw } from 'lucide-react';

interface SpectrumCanvasProps {
  activeBand: SpectrumBand;
  onSelectBand: (band: SpectrumBand) => void;
  allBands: SpectrumBand[];
}

export const SpectrumCanvas: React.FC<SpectrumCanvasProps> = ({
  activeBand,
  onSelectBand,
  allBands,
}) => {
  const [selectedFreq, setSelectedFreq] = useState<number>(activeBand.nominalFreqGhz);
  const [bandwidthGhz, setBandwidthGhz] = useState<number>(activeBand.bandwidthGhz);
  const [targetSpeedKmh, setTargetSpeedKmh] = useState<number>(120);
  const [radarSweepTime, setRadarSweepTime] = useState<number>(1.2);
  const spectrumGraphGradId = useId();

  // Compute ISAC Radar metrics based on user bandwidth and frequency
  const isacMetrics = computeIsacMetrics(bandwidthGhz, selectedFreq, targetSpeedKmh);

  // Generate frequency curve points from 30 GHz to 350 GHz
  const freqPoints = [];
  for (let f = 30; f <= 350; f += 2) {
    const loss = calculateAtmosphericLoss(f, 1, 60); // 1 km at 60% humidity
    freqPoints.push({ f, loss });
  }

  // Find max loss to scale SVG graph
  const maxLoss = 50; // clamp for clean visualization
  const svgWidth = 800;
  const svgHeight = 220;

  const pointsString = freqPoints
    .map((p) => {
      const x = ((p.f - 30) / (350 - 30)) * svgWidth;
      const normalizedLoss = Math.min(p.loss, maxLoss);
      const y = svgHeight - (normalizedLoss / maxLoss) * (svgHeight - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  const currentLoss = calculateAtmosphericLoss(selectedFreq, 1, 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              SUB-TERAHERTZ (Sub-THz) SPECTRUM & ISAC DUAL RADAR SENSING
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700 px-2 py-0.5 rounded font-mono">
                ITU-R P.676 GROUNDING
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Atmospheric gas attenuation windows, molecular resonance ($H_2O, O_2$) & centimetric radar ranging
            </p>
          </div>
        </div>

        {/* Quick Band Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 border border-slate-800 rounded-lg">
          {allBands.map((band) => (
            <button
              key={band.id}
              onClick={() => {
                onSelectBand(band);
                setSelectedFreq(band.nominalFreqGhz);
                setBandwidthGhz(band.bandwidthGhz);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-all ${
                activeBand.id === band.id
                  ? 'bg-purple-600/30 border border-purple-500 text-purple-200 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {band.name.replace('Sub-THz ', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Atmospheric Absorption Curve Section */}
      <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">ATMOSPHERIC MOLECULAR ATTENUATION (dB/km):</span>
            <span className="text-purple-400 font-bold text-sm">{currentLoss.toFixed(2)} dB/km</span>
            <span className="text-slate-500">at</span>
            <span className="text-cyan-400 font-bold text-sm">{selectedFreq} GHz</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
              O₂ Spike: 60 GHz & 118.7 GHz
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
              H₂O Spike: 183.3 GHz & 325 GHz
            </span>
          </div>
        </div>

        {/* SVG Curve Canvas */}
        <div className="relative w-full h-[240px] bg-[#05070d] border border-slate-800/80 rounded-xl overflow-hidden p-2">
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-8 grid-rows-4" />

          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={spectrumGraphGradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Area under curve */}
            <polygon
              points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
              fill={`url(#${spectrumGraphGradId})`}
            />

            {/* Line curve */}
            <polyline
              fill="none"
              stroke="#a855f7"
              strokeWidth="2.5"
              points={pointsString}
            />

            {/* Molecular peak annotations */}
            <circle cx={((60 - 30) / 320) * svgWidth} cy={svgHeight - 120} r="4" fill="#ef4444" />
            <text
              x={((60 - 30) / 320) * svgWidth}
              y={svgHeight - 130}
              fill="#ef4444"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              O₂ (60 GHz)
            </text>

            <circle cx={((183.3 - 30) / 320) * svgWidth} cy={svgHeight - 160} r="4" fill="#06b6d4" />
            <text
              x={((183.3 - 30) / 320) * svgWidth}
              y={svgHeight - 170}
              fill="#06b6d4"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
            >
              H₂O (183.3 GHz)
            </text>

            {/* Active Frequency Marker Line */}
            <line
              x1={((selectedFreq - 30) / 320) * svgWidth}
              y1="0"
              x2={((selectedFreq - 30) / 320) * svgWidth}
              y2={svgHeight}
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          </svg>

          {/* Interactive frequency marker badge */}
          <div
            className="absolute top-2 -translate-x-1/2 bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded shadow pointer-events-none"
            style={{
              left: `${((selectedFreq - 30) / 320) * 100}%`,
            }}
          >
            {selectedFreq} GHz | {currentLoss.toFixed(1)} dB/km
          </div>
        </div>

        {/* Frequency Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>30 GHz (mmWave)</span>
            <span className="text-cyan-300 font-bold">CARRIER FREQUENCY: {selectedFreq} GHz</span>
            <span>350 GHz (Upper THz)</span>
          </div>
          <input
            type="range"
            min="30"
            max="350"
            value={selectedFreq}
            onChange={(e) => setSelectedFreq(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* ISAC (Integrated Sensing and Communication) Radar Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ISAC Radar Waveform and Telemetry */}
        <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  ISAC Dual-Function Waveform Radar
                </h3>
                <p className="text-[11px] text-slate-400">
                  Simultaneous 100 Gbps Data Transfer + Centimetric Target Radar Ranging
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-600 px-2 py-0.5 rounded font-mono">
              RADAR ACTIVE
            </span>
          </div>

          {/* Radar Radar Circular Scope Display */}
          <div className="relative w-full h-56 bg-[#04060b] border border-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
            {/* Concentric distance rings */}
            <div className="absolute w-44 h-44 rounded-full border border-emerald-500/20" />
            <div className="absolute w-32 h-32 rounded-full border border-emerald-500/30" />
            <div className="absolute w-20 h-20 rounded-full border border-emerald-500/40" />

            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-emerald-500/20" />
            <div className="absolute h-full w-[1px] bg-emerald-500/20" />

            {/* Rotating radar sweep */}
            <div
              className="absolute w-48 h-48 rounded-full pointer-events-none animate-radar"
              style={{
                background: 'conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.4) 0deg, transparent 60deg)',
              }}
            />

            {/* Target Echo Blips */}
            <div className="absolute top-[32%] left-[64%] w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <div className="absolute top-[32%] left-[64%] w-3 h-3 rounded-full bg-cyan-400 border border-white" />
            <div className="absolute top-[28%] left-[67%] text-[9px] font-mono text-cyan-300 whitespace-nowrap bg-black/70 px-1 rounded">
              EV Target (R: 42.4 m | v: {targetSpeedKmh} km/h)
            </div>

            <div className="absolute bottom-[28%] left-[30%] w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
            <div className="absolute bottom-[28%] left-[30%] w-2.5 h-2.5 rounded-full bg-purple-400" />
            <div className="absolute bottom-[32%] left-[32%] text-[9px] font-mono text-purple-300 whitespace-nowrap bg-black/70 px-1 rounded">
              UAV Drone (R: 78.1 m)
            </div>

            {/* Center gNB Sensor dot */}
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black z-10" />
          </div>

          {/* Interactive Sliders for Bandwidth & Target Velocity */}
          <div className="space-y-3 font-mono text-xs pt-1">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>RADAR BANDWIDTH (B):</span>
                <span className="text-cyan-300 font-bold">{bandwidthGhz} GHz</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={bandwidthGhz}
                onChange={(e) => setBandwidthGhz(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>TARGET VELOCITY (v):</span>
                <span className="text-emerald-300 font-bold">{targetSpeedKmh} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="350"
                value={targetSpeedKmh}
                onChange={(e) => setTargetSpeedKmh(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>
          </div>
        </div>

        {/* Calculated Radar Performance Matrix */}
        <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  ISAC Physical Resolution & Doppler Metrics
                </h3>
                <p className="text-[11px] text-slate-400">
                  Calculated from 3GPP Rel-20 Dual-Function Radar Formulas
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs mt-4">
              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">RANGE RESOLUTION (ΔR)</div>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {isacMetrics.rangeResolutionCm} cm
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  ΔR = c / (2B) = sub-decimetric precision
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">DOPPLER SHIFT (f_d)</div>
                <div className="text-xl font-bold text-cyan-400 mt-1">
                  {isacMetrics.dopplerShiftKhz} kHz
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  f_d = 2v / λ at {selectedFreq} GHz
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">CARRIER WAVELENGTH (λ)</div>
                <div className="text-xl font-bold text-purple-400 mt-1">
                  {isacMetrics.wavelengthMm} mm
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Sub-millimeter wave spatial resolution
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
                <div className="text-slate-500 text-[10px]">MAX UNAMBIGUOUS RANGE</div>
                <div className="text-xl font-bold text-amber-400 mt-1">
                  {isacMetrics.maxRangeKm} km
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  PRI = 10 μs Pulse Repetition Interval
                </div>
              </div>
            </div>
          </div>

          {/* 3GPP Technical Summary */}
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-[11px] font-mono text-slate-300 space-y-1.5">
            <div className="text-cyan-300 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              6G ISAC Synthesis:
            </div>
            <p className="text-slate-400 leading-relaxed">
              At {selectedFreq} GHz with {bandwidthGhz} GHz continuous bandwidth, ISAC achieves <strong>{isacMetrics.rangeResolutionCm} cm</strong> spatial depth resolution, allowing simultaneous high-definition 3D imaging, gesture recognition, and obstacle mapping over the shared cellular communications spectrum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
