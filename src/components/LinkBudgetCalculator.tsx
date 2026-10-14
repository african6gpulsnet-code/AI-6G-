import React, { useState } from 'react';
import { LinkBudgetParams } from '../types/telecom';
import { computeLinkBudget } from '../utils/telecomMath';
import { Calculator, Gauge, CloudRain, Wind, Radio, Zap } from 'lucide-react';

export const LinkBudgetCalculator: React.FC = () => {
  const [params, setParams] = useState<LinkBudgetParams>({
    frequencyGhz: 140,
    distanceMeters: 250,
    bandwidthMhz: 10000, // 10 GHz
    txPowerDbm: 28,
    txAntennaGainDbi: 32,
    rxAntennaGainDbi: 32,
    rainRateMmHr: 0,
    humidityPercent: 60,
    temperatureC: 22,
    noiseFigureDb: 7,
    mimoLayers: 4,
  });

  const results = computeLinkBudget(params);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              TERAHERTZ (Sub-THz / THz) RF LINK BUDGET & CAPACITY
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-mono">
                SHANNON LIMIT ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Rigorous RF Link Budget accounting for Friis free space, molecular gas resonance, and rain fade
            </p>
          </div>
        </div>

        <div className="font-mono text-xs text-slate-400 flex items-center gap-2">
          <span>CAPACITY:</span>
          <span className="text-xl font-bold text-cyan-400">{results.capacityGbps} Gbps</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl font-mono text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            RF Channel Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frequency */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>FREQUENCY (GHz):</span>
                <span className="text-cyan-300 font-bold">{params.frequencyGhz} GHz</span>
              </div>
              <input
                type="range"
                min="60"
                max="320"
                step="5"
                value={params.frequencyGhz}
                onChange={(e) => setParams({ ...params, frequencyGhz: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Distance */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>DISTANCE (Meters):</span>
                <span className="text-emerald-300 font-bold">{params.distanceMeters} m</span>
              </div>
              <input
                type="range"
                min="10"
                max="2500"
                step="10"
                value={params.distanceMeters}
                onChange={(e) => setParams({ ...params, distanceMeters: Number(e.target.value) })}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Bandwidth */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>BANDWIDTH (MHz):</span>
                <span className="text-purple-300 font-bold">{(params.bandwidthMhz / 1000).toFixed(1)} GHz</span>
              </div>
              <input
                type="range"
                min="1000"
                max="30000"
                step="1000"
                value={params.bandwidthMhz}
                onChange={(e) => setParams({ ...params, bandwidthMhz: Number(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Tx Power */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>TRANSMIT POWER (dBm):</span>
                <span className="text-amber-300 font-bold">{params.txPowerDbm} dBm</span>
              </div>
              <input
                type="range"
                min="10"
                max="45"
                value={params.txPowerDbm}
                onChange={(e) => setParams({ ...params, txPowerDbm: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Antenna Gain Tx */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>TX ANTENNA GAIN (dBi):</span>
                <span className="text-cyan-300 font-bold">{params.txAntennaGainDbi} dBi</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={params.txAntennaGainDbi}
                onChange={(e) => setParams({ ...params, txAntennaGainDbi: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Antenna Gain Rx */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>RX ANTENNA GAIN (dBi):</span>
                <span className="text-cyan-300 font-bold">{params.rxAntennaGainDbi} dBi</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                value={params.rxAntennaGainDbi}
                onChange={(e) => setParams({ ...params, rxAntennaGainDbi: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* Rain Rate */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1 flex items-center">
                <span className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  RAIN RATE (mm/h):
                </span>
                <span className={params.rainRateMmHr > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                  {params.rainRateMmHr} mm/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.rainRateMmHr}
                onChange={(e) => setParams({ ...params, rainRateMmHr: Number(e.target.value) })}
                className="w-full accent-blue-400 cursor-pointer h-1.5 bg-slate-800 rounded"
              />
            </div>

            {/* MIMO Layers */}
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>MIMO SPATIAL LAYERS:</span>
                <span className="text-purple-300 font-bold">{params.mimoLayers} Layers</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[1, 2, 4, 8].map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setParams({ ...params, mimoLayers: layer })}
                    className={`py-1 rounded border text-center font-bold ${
                      params.mimoLayers === layer
                        ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {layer}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Matrix Column */}
        <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl font-mono text-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-emerald-400" />
              RF Budget Telemetry
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Free Space Loss (FSPL):</span>
                <span className="text-slate-200">{results.fspl} dB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Atmospheric Gas Loss:</span>
                <span className="text-purple-400 font-semibold">{results.atmLoss} dB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Rain Attenuation:</span>
                <span className={results.rainLoss > 0 ? 'text-red-400 font-semibold' : 'text-slate-500'}>
                  {results.rainLoss} dB
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-bold">Total Path Loss:</span>
                <span className="text-red-300 font-bold">{results.totalPathLoss} dB</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Tx EIRP:</span>
                <span className="text-cyan-400">{results.eirpDbm} dBm</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Received Power (Prx):</span>
                <span className="text-slate-200">{results.receivedPowerDbm} dBm</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-300 font-bold">Signal-to-Noise (SNR):</span>
                <span className={results.snrDb > 15 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {results.snrDb} dB
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Spectral Efficiency:</span>
                <span className="text-cyan-300">{results.spectralEfficiency} bps/Hz</span>
              </div>
            </div>
          </div>

          {/* Achievable Throughput banner */}
          <div className="bg-gradient-to-br from-cyan-950/60 to-purple-950/60 border border-cyan-500/40 p-4 rounded-xl text-center">
            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
              SHANNON THEORETICAL CAPACITY
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {results.capacityGbps} <span className="text-sm font-normal text-cyan-400">Gbps</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              C = {params.mimoLayers} × B × log₂(1 + SNR)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
