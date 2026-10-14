/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { NetworkDigitalTwin } from './components/NetworkDigitalTwin';
import { SpectrumCanvas } from './components/SpectrumCanvas';
import { RisController } from './components/RisController';
import { NetworkSlicingPanel } from './components/NetworkSlicingPanel';
import { LinkBudgetCalculator } from './components/LinkBudgetCalculator';
import { AiCopilot } from './components/AiCopilot';
import { AnomalySimulator } from './components/AnomalySimulator';
import {
  PRESET_6G_BANDS,
  INITIAL_NETWORK_NODES,
  INITIAL_SLICES,
  PRESET_ANOMALIES,
} from './utils/mockData';
import { SpectrumBand, NetworkNode, NetworkSlice, NetworkAnomaly } from './types/telecom';
import { Sparkles, CheckCircle2, Shield, Activity, Radio, Cpu, Layers } from 'lucide-react';

export default function App() {
  const [activeBand, setActiveBand] = useState<SpectrumBand>(PRESET_6G_BANDS[0]);
  const [nodes, setNodes] = useState<NetworkNode[]>(INITIAL_NETWORK_NODES);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(INITIAL_NETWORK_NODES[0]);
  const [risActive, setRisActive] = useState<boolean>(true);
  const [rainObstacleActive, setRainObstacleActive] = useState<boolean>(false);
  const [slices, setSlices] = useState<NetworkSlice[]>(INITIAL_SLICES);
  const [activeTab, setActiveTab] = useState<string>('twin');
  const [activeAnomaly, setActiveAnomaly] = useState<NetworkAnomaly | null>(null);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [healingReport, setHealingReport] = useState<string | null>(null);

  // Compute dynamic aggregate metrics
  let throughputMultiplier = 1.0;
  let latencyMultiplier = 1.0;

  if (!risActive) {
    throughputMultiplier *= 0.65;
    latencyMultiplier *= 2.4;
  }
  if (rainObstacleActive) {
    throughputMultiplier *= 0.55;
    latencyMultiplier *= 1.8;
  }
  if (activeAnomaly) {
    throughputMultiplier *= 0.7;
    latencyMultiplier *= 1.6;
  }

  // Base throughput scales with frequency bandwidth
  const baseThroughput = (activeBand.bandwidthGhz / 10) * 114.2;
  const aggregateThroughputGbps = baseThroughput * throughputMultiplier;
  const averageLatencyMs = 0.082 * latencyMultiplier;

  // AI-driven self-healing trigger
  const handleTriggerSelfHealing = async () => {
    setIsHealing(true);
    setHealingReport(null);

    try {
      const res = await fetch('/api/ai/optimize-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentState: {
            carrierFreq: activeBand.nominalFreqGhz,
            risActive,
            rainActive: rainObstacleActive,
            anomaly: activeAnomaly?.name || 'Degraded Channel',
          },
          targetMetric: 'Maximum 6G Throughput, 0.08ms URLLC latency and RIS phase alignment',
        }),
      });

      const data = await res.json();

      // Apply self healing fixes
      setRisActive(true);
      setRainObstacleActive(false);
      setActiveAnomaly(null);
      setHealingReport(
        data.recommendationSummary ||
          'AI-RAN Optimizer recalibrated 16x16 RIS reflection matrix (+18.6 dB gain), stepped Subcarrier Spacing to 480 kHz, and engaged 4096-QAM dual-stream MIMO.'
      );
    } catch (e) {
      console.error(e);
      setRisActive(true);
      setRainObstacleActive(false);
      setActiveAnomaly(null);
      setHealingReport(
        'IS 6G+ Autonomous Self-Healing restored RIS reflection, re-routed NLOS pencil beams around obstruction, and re-established 114.2 Gbps SLA.'
      );
    } finally {
      setIsHealing(false);
    }
  };

  const handleUpdateNode = (updated: NetworkNode) => {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    if (selectedNode?.id === updated.id) {
      setSelectedNode(updated);
    }
  };

  const handleAddSlice = (newSlice: NetworkSlice) => {
    setSlices((prev) => [newSlice, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col">
      {/* Top Navigation & Status */}
      <Header
        activeBand={activeBand}
        onSelectBand={setActiveBand}
        allBands={PRESET_6G_BANDS}
        aggregateThroughputGbps={aggregateThroughputGbps}
        averageLatencyMs={averageLatencyMs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAiCopilot={() => setActiveTab('copilot')}
        isAiHealing={isHealing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Healing Success Banner */}
        {healingReport && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/50 rounded-2xl p-4 shadow-xl flex items-start justify-between gap-4 font-mono text-xs">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-300 uppercase tracking-wider">
                  IS 6G+ AI-RAN AUTONOMOUS SELF-HEAL COMPLETED:
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed">{healingReport}</p>
              </div>
            </div>
            <button
              onClick={() => setHealingReport(null)}
              className="text-slate-400 hover:text-white text-xs underline flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Digital Twin & RF Grid */}
        {activeTab === 'twin' && (
          <div className="space-y-6">
            <NetworkDigitalTwin
              nodes={nodes}
              onUpdateNode={handleUpdateNode}
              activeBand={activeBand}
              risActive={risActive}
              onToggleRis={() => setRisActive(!risActive)}
              onSelectNode={setSelectedNode}
              selectedNode={selectedNode}
              rainObstacleActive={rainObstacleActive}
              onToggleRainObstacle={() => setRainObstacleActive(!rainObstacleActive)}
              onTriggerSelfHealing={handleTriggerSelfHealing}
              isHealing={isHealing}
            />

            {/* Quick Anomaly Injection & Stress Testing Panel */}
            <AnomalySimulator
              anomalies={PRESET_ANOMALIES}
              activeAnomaly={activeAnomaly}
              onSelectAnomaly={setActiveAnomaly}
              onTriggerSelfHealing={handleTriggerSelfHealing}
              isHealing={isHealing}
            />
          </div>
        )}

        {/* Tab 2: Spectrum & ISAC Radar */}
        {activeTab === 'spectrum' && (
          <SpectrumCanvas
            activeBand={activeBand}
            onSelectBand={setActiveBand}
            allBands={PRESET_6G_BANDS}
          />
        )}

        {/* Tab 3: RIS Metasurface Controller */}
        {activeTab === 'ris' && (
          <RisController
            risActive={risActive}
            onToggleRis={() => setRisActive(!risActive)}
            onAiOptimizeRis={handleTriggerSelfHealing}
            isOptimizing={isHealing}
          />
        )}

        {/* Tab 4: 3GPP Rel-20 Network Slicing Orchestrator */}
        {activeTab === 'slicing' && (
          <NetworkSlicingPanel
            slices={slices}
            onAddSlice={handleAddSlice}
          />
        )}

        {/* Tab 5: Terahertz Link Budget & Capacity */}
        {activeTab === 'link_budget' && <LinkBudgetCalculator />}

        {/* Tab 6: AI Autonomous Telecom Intelligence Co-Pilot */}
        {activeTab === 'copilot' && (
          <AiCopilot
            activeBand={activeBand}
            nodes={nodes}
            risActive={risActive}
            rainObstacleActive={rainObstacleActive}
            activeAnomaly={activeAnomaly}
            onApplyAiOptimization={handleTriggerSelfHealing}
          />
        )}
      </main>

      {/* Cyber Telecom Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070912] py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-slate-300 font-bold">IS 6G+</span>
            <span>|</span>
            <span>Intelligent System for 6G+ Next-Gen Communications & AI-RAN</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400">3GPP Rel-20/21</span>
            <span>•</span>
            <span className="text-purple-400">ISAC Dual Waveform</span>
            <span>•</span>
            <span className="text-amber-400">PulsNet Stratosphere HAPS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
