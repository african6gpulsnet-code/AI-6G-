export interface SpectrumBand {
  id: string;
  name: string;
  range: string;
  nominalFreqGhz: number;
  bandwidthGhz: number;
  primaryUse: string;
  molecularAbsorption: string;
  color: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: 'gNB' | 'RIS' | 'UE_VEHICLE' | 'UE_HOLO' | 'UE_ROBOT' | 'HAPS_NTN';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  elevationM: number;
  status: 'active' | 'degraded' | 'standby';
  powerDbm: number;
  sinrDb: number;
  throughputGbps: number;
  latencyMs: number;
  beamAzimuth: number; // degrees
}

export interface RisElementConfig {
  rows: number;
  cols: number;
  phases: number[][]; // 0 to 2*PI in radians
  mode: 'constructive_focusing' | 'multi_target_split' | 'interference_nulling';
  beamGainDb: number;
  activeElements: number;
}

export interface NetworkSlice {
  id: string;
  name: string;
  sst: number;
  sd: string;
  category: 'URLLC-X' | 'eMBB+' | 'ISAC' | 'mMTC-X' | 'Tactile';
  targetLatencyMs: number;
  targetThroughputGbps: number;
  reliabilityNines: number; // e.g. 99.99999
  maxJitterUs: number;
  activeUsers: number;
  color: string;
}

export interface LinkBudgetParams {
  frequencyGhz: number;
  distanceMeters: number;
  bandwidthMhz: number;
  txPowerDbm: number;
  txAntennaGainDbi: number;
  rxAntennaGainDbi: number;
  rainRateMmHr: number;
  humidityPercent: number;
  temperatureC: number;
  noiseFigureDb: number;
  mimoLayers: number;
}

export interface NetworkAnomaly {
  id: string;
  name: string;
  type: 'rain_fade' | 'doppler_blur' | 'ris_misalignment' | 'rf_interference';
  severity: 'low' | 'medium' | 'critical';
  description: string;
  impactSnrDb: number;
  affectedBand: string;
}
