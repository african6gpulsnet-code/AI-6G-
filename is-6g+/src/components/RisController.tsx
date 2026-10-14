import React, { useState } from 'react';
import { Zap, RefreshCw, Cpu, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

interface RisControllerProps {
  risActive: boolean;
  onToggleRis: () => void;
  onAiOptimizeRis: () => void;
  isOptimizing: boolean;
}

export const RisController: React.FC<RisControllerProps> = ({
  risActive,
  onToggleRis,
  onAiOptimizeRis,
  isOptimizing,
}) => {
  const rows = 16;
  const cols = 16;

  // Mode: constructive_focusing, multi_target_split, interference_nulling
  const [mode, setMode] = useState<'constructive_focusing' | 'multi_target_split' | 'interference_nulling'>('constructive_focusing');
  const [steerAngle, setSteerAngle] = useState<number>(45);

  // Generate 16x16 phase matrix values (0 to 1 representing 0 to 2*PI)
  const generatePhases = () => {
    const grid: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        let phase = 0;
        if (mode === 'constructive_focusing') {
          // Quadratic spherical phase profile focused at center
          const dist = Math.sqrt(Math.pow(r - 7.5, 2) + Math.pow(c - 7.5, 2));
          phase = (dist * 0.28 + (steerAngle / 90)) % 1;
        } else if (mode === 'multi_target_split') {
          // Dual split linear phase ramp
          phase = ((r * 0.12 + c * 0.18) + (steerAngle / 180)) % 1;
        } else {
          // Interference nulling notched pattern
          phase = (Math.sin(r * 0.8) * Math.cos(c * 0.8) + 1) / 2;
        }
        row.push(phase);
      }
      grid.push(row);
    }
    return grid;
  };

  const [phaseGrid, setPhaseGrid] = useState<number[][]>(generatePhases());

  // Update phases on mode or steer angle change
  React.useEffect(() => {
    setPhaseGrid(generatePhases());
  }, [mode, steerAngle]);

  const totalElements = rows * cols; // 256 elements
  const arrayGainDb = risActive ? 18.2 : 0;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              RECONFIGURABLE INTELLIGENT SURFACE (RIS) METASURFACE
              <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-700 px-2 py-0.5 rounded font-mono">
                16×16 META-ATOM ARRAY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Programmable electromagnetic phase-shifting matrix for Non-Line-Of-Sight (NLOS) beam rerouting
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={onToggleRis}
            className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
              risActive
                ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {risActive ? 'RIS STATE: ACTIVE' : 'RIS STATE: POWERED OFF'}
          </button>

          <button
            onClick={() => {
              onAiOptimizeRis();
              setPhaseGrid(generatePhases());
            }}
            disabled={isOptimizing}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isOptimizing ? 'SOLVING PHASES...' : 'AI OPTIMIZE PHASES'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 16x16 Phase Grid Visualization */}
        <div className="lg:col-span-2 bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">ELEMENT MATRIX:</span>
              <span className="text-sky-300 font-bold">{totalElements} Passive Varactor Units</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-blue-600 inline-block rounded-xs"></span>
                <span>0 rad</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-cyan-400 inline-block rounded-xs"></span>
                <span>π rad</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-purple-500 inline-block rounded-xs"></span>
                <span>2π rad</span>
              </div>
            </div>
          </div>

          {/* Grid Render */}
          <div className="bg-[#05070e] border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                maxWidth: '440px',
                width: '100%',
              }}
            >
              {phaseGrid.flatMap((row, rIdx) =>
                row.map((phase, cIdx) => {
                  // Interpolate color from 0 to 2PI: deep blue -> cyan -> purple
                  const hue = 190 + phase * 100;
                  const lightness = risActive ? 25 + phase * 35 : 15;
                  const opacity = risActive ? 1 : 0.3;

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      title={`Element [${rIdx},${cIdx}]: Phase = ${(phase * 2 * Math.PI).toFixed(2)} rad`}
                      className="aspect-square rounded-xs transition-colors cursor-pointer hover:scale-125 hover:z-20 border border-black/40"
                      style={{
                        backgroundColor: `hsl(${hue}, 85%, ${lightness}%)`,
                        opacity,
                        boxShadow: risActive && phase > 0.7 ? '0 0 6px rgba(56, 189, 248, 0.5)' : 'none',
                      }}
                      onClick={() => {
                        // Interactive phase tweak
                        const newGrid = [...phaseGrid.map((r) => [...r])];
                        newGrid[rIdx][cIdx] = (newGrid[rIdx][cIdx] + 0.25) % 1;
                        setPhaseGrid(newGrid);
                      }}
                    />
                  );
                })
              )}
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-3">
              Click any element cell to manually adjust local meta-atom phase delay
            </div>
          </div>

          {/* Steer Angle Slider */}
          <div className="space-y-2 pt-1 font-mono text-xs">
            <div className="flex justify-between text-slate-400">
              <span>DESIRED REFLECTION ANGLE (θ_r):</span>
              <span className="text-sky-300 font-bold">{steerAngle}° Azimuth</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={steerAngle}
              onChange={(e) => setSteerAngle(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Mode Selector & Physics Readout */}
        <div className="space-y-5">
          {/* Mode Selector */}
          <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Beamforming Mode
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {[
                {
                  id: 'constructive_focusing',
                  label: 'Constructive Beam Focusing',
                  desc: 'In-phase coherent superimposition toward single NLOS target (+18 dB gain)',
                },
                {
                  id: 'multi_target_split',
                  label: 'Multi-User Beam Split',
                  desc: 'Dual-pencil beams bifurcated for vehicle and holographic terminals',
                },
                {
                  id: 'interference_nulling',
                  label: 'Interference Nulling',
                  desc: 'Creates a spatial notch to cancel co-channel multi-user interference',
                },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMode(m.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    mode === m.id
                      ? 'bg-sky-950/60 border-sky-400 text-sky-200 shadow-md shadow-sky-500/20'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{m.label}</span>
                    {mode === m.id && <CheckCircle2 className="w-4 h-4 text-sky-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Array Physics Readout */}
          <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl font-mono text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Theoretical Array Gains
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Total Elements (N):</span>
                <span className="text-white font-bold">256 (16×16)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Theoretical N² Gain:</span>
                <span className="text-emerald-400 font-bold">+24.08 dB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Realized Reflection Gain:</span>
                <span className="text-cyan-400 font-bold">+{arrayGainDb} dB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Power Consumption:</span>
                <span className="text-amber-400 font-bold">&lt; 0.45 Watts (Passive)</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mt-2">
              RIS surfaces require zero high-power RF power amplifiers (PAs), operating via ultra-low-power PIN diode or varactor phase shifts.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
