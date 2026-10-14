import React, { useState } from 'react';
import { Sparkles, Send, Bot, Terminal, Volume2, VolumeX, CheckCircle, RefreshCw, Cpu, Layers } from 'lucide-react';
import { SpectrumBand, NetworkNode, NetworkAnomaly } from '../types/telecom';

interface AiCopilotProps {
  activeBand: SpectrumBand;
  nodes: NetworkNode[];
  risActive: boolean;
  rainObstacleActive: boolean;
  activeAnomaly: NetworkAnomaly | null;
  onApplyAiOptimization: (opt: any) => void;
}

export const AiCopilot: React.FC<AiCopilotProps> = ({
  activeBand,
  nodes,
  risActive,
  rainObstacleActive,
  activeAnomaly,
  onApplyAiOptimization,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: string }>>([
    {
      role: 'assistant',
      content: `### IS 6G+ Neural Operations Center Initialized
Welcome to **IS 6G+ Autonomous Telecommunications AI**. 
Active Channel: **${activeBand.name} (${activeBand.nominalFreqGhz} GHz)**.
RIS Array: **${risActive ? 'Enabled (+18 dB Reflection)' : 'Disabled'}**.
Rain Scattering: **${rainObstacleActive ? '50 mm/h (-14.2 dB Fade)' : 'Clear Sky'}**.

Select a specialized 6G+ operational directive below or type an engineering query.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const quickPrompts = [
    {
      label: 'Atmospheric Gas & RIS Rerouting',
      query: `Analyze current molecular absorption at ${activeBand.nominalFreqGhz} GHz. How does the 16x16 RIS metasurface reconstruct phase coherence around NLOS building blockages?`,
    },
    {
      label: 'ISAC Radar Doppler Resolution',
      query: `Formulate the dual-function ISAC radar waveform parameters for simultaneous 100 Gbps communication and sub-centimetric radar ranging at ${activeBand.nominalFreqGhz} GHz.`,
    },
    {
      label: 'URLLC-X Tactile Internet Slicing',
      query: `Generate a 3GPP Rel-20 URLLC-X SLA slice configuration guaranteeing < 0.1 ms latency, < 20 μs jitter, and 99.99999% availability for autonomous drones and robotic surgery.`,
    },
    {
      label: 'African PulsNet HAPS Rural Mesh',
      query: `Architect a Stratospheric High-Altitude Platform Station (HAPS) non-terrestrial mesh deployment for African remote digital connectivity with solar-powered backhaul.`,
    },
    {
      label: 'Autonomous Anomaly Self-Healing',
      query: `Diagnose the active link degradation (${rainObstacleActive ? 'Tropical Rain Fade 50mm/h' : 'NLOS Shadowing'}). Formulate an AI-RAN mitigation plan with dynamic subcarrier spacing and beam steering.`,
    },
  ];

  const handleSend = async (userQuery?: string) => {
    const q = userQuery || prompt;
    if (!q.trim()) return;

    const userMsg = { role: 'user' as const, content: q, timestamp: new Date().toLocaleTimeString() };
    setMessages((prev) => [...prev, userMsg]);
    if (!userQuery) setPrompt('');
    setLoading(true);

    try {
      const gnb = nodes.find((n) => n.type === 'gNB');
      const telemetry = {
        carrierFreq: `${activeBand.nominalFreqGhz} GHz (${activeBand.name})`,
        bandwidth: `${activeBand.bandwidthGhz} GHz`,
        sinr: gnb ? `${gnb.sinrDb} dB` : '24.5 dB',
        risStatus: risActive ? 'Active (+18 dB Reflection)' : 'Offline (NLOS Loss)',
        rainCondition: rainObstacleActive ? 'Severe Rain 50 mm/h' : 'Clear',
        activeAnomaly: activeAnomaly ? activeAnomaly.name : 'None',
        aggregateThroughput: '114.2 Gbps',
      };

      const res = await fetch('/api/ai/telecom-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q, networkTelemetry: telemetry }),
      });

      if (!res.ok) throw new Error('Copilot response error');
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.text, timestamp: new Date().toLocaleTimeString() },
      ]);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `### Telemetry Analysis & Heuristic Recommendation
**Band**: ${activeBand.name} | **Frequency**: ${activeBand.nominalFreqGhz} GHz

#### 1. RF Channel Status
- Atmospheric loss: ${(activeBand.nominalFreqGhz > 150 ? 28.4 : 0.45).toFixed(2)} dB/km
- Direct line-of-sight status: ${risActive ? 'Coherent Reflected Link Active' : 'Severe NLOS Blockage'}

#### 2. AI-RAN Directives
- **Subcarrier Spacing**: Step to 480 kHz (combats Sub-THz phase noise).
- **Modulation**: 4096-QAM on LOS; fall back to 256-QAM for rain cell penetration.
- **RIS Metasurface**: Engage Constructive Beam Focusing mode for +18.2 dB array gain.`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown hashes for clean speech
    const cleanText = text.replace(/[*#$`]/g, '').slice(0, 350);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              IS 6G+ AI AUTONOMOUS TELECOM INTELLIGENCE
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-2 py-0.5 rounded font-mono">
                GEMINI 3.8 FLASH ENGINE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              3GPP Release 19/20/21, Sub-THz molecular channel synthesis, and real-time AI-RAN optimization
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-emerald-400 font-semibold">COGNITIVE RAN ONLINE</span>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>OPERATIONAL 6G+ DIRECTIVES:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.query)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/60 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-all disabled:opacity-50"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat / Diagnostic Terminal */}
      <div className="bg-[#080b15] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-[540px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 font-mono text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100 ml-8'
                  : 'bg-slate-900/70 border-slate-800 text-slate-200 mr-8'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 text-[10px] text-slate-400">
                <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                  {msg.role === 'user' ? <Terminal className="w-3 h-3" /> : <Bot className="w-3.5 h-3.5" />}
                  {msg.role === 'user' ? 'TELECOM CHIEF ENGINEER' : 'IS 6G+ NEURAL CORE'}
                </span>
                <div className="flex items-center space-x-2">
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => toggleSpeak(msg.content)}
                      title="Audio voice briefing"
                      className="p-1 hover:text-cyan-300 text-slate-400"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Render content with basic markdown handling */}
              <div className="whitespace-pre-wrap space-y-2">
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-cyan-300 font-mono text-xs flex items-center space-x-2 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>IS 6G+ Neural Engine synthesizing Sub-THz channel parameters...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-800 mt-3 flex items-center space-x-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Ask IS 6G+ AI (e.g. 'Optimize RIS phase profile for 183 GHz water vapor peak')..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-mono text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>EXECUTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
