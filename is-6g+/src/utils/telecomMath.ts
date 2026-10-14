import { LinkBudgetParams } from '../types/telecom';

// Speed of light in m/s
export const SPEED_OF_LIGHT = 299792458;

// Molecular and atmospheric gas attenuation model (simplified ITU-R P.676 approximation)
export function calculateAtmosphericLoss(freqGhz: number, distanceKm: number, humidity = 60): number {
  // Resonance peaks: O2 at ~60 GHz and 118.75 GHz, H2O at 22.2 GHz, 183.3 GHz, 325 GHz
  let gammaGas = 0.05; // base attenuation dB/km

  if (freqGhz >= 55 && freqGhz <= 65) {
    gammaGas += 15 * Math.exp(-Math.pow((freqGhz - 60) / 3, 2)); // O2 spike
  } else if (freqGhz >= 115 && freqGhz <= 122) {
    gammaGas += 2.5 * Math.exp(-Math.pow((freqGhz - 118.7) / 2, 2)); // O2 secondary
  } else if (freqGhz >= 170 && freqGhz <= 195) {
    // Water vapor spike at 183.3 GHz
    const waterFactor = humidity / 50;
    gammaGas += 28 * waterFactor * Math.exp(-Math.pow((freqGhz - 183.3) / 5, 2));
  } else if (freqGhz >= 300 && freqGhz <= 340) {
    // 325 GHz H2O spike
    gammaGas += 45 * (humidity / 50) * Math.exp(-Math.pow((freqGhz - 325) / 8, 2));
  } else {
    // General THz baseline increase
    gammaGas += 0.003 * Math.pow(freqGhz, 1.4);
  }

  return gammaGas * distanceKm;
}

// Rain attenuation (ITU-R P.838 approximation for Sub-THz)
export function calculateRainLoss(freqGhz: number, rainRateMmHr: number, distanceKm: number): number {
  if (rainRateMmHr <= 0) return 0;
  // Coefficient scaling at 100-300 GHz
  const k = 0.0001 * Math.pow(freqGhz, 1.35);
  const alpha = 0.75 + 0.0008 * freqGhz;
  const specificAttenuationDbKm = k * Math.pow(rainRateMmHr, alpha);
  return specificAttenuationDbKm * distanceKm;
}

// Terahertz Friis Free Space Path Loss (dB)
export function calculateFSPL(freqGhz: number, distanceMeters: number): number {
  if (distanceMeters <= 0 || freqGhz <= 0) return 0;
  const distanceKm = distanceMeters / 1000;
  return 32.44 + 20 * Math.log10(freqGhz) + 20 * Math.log10(distanceKm);
}

// Full Link Budget Computation
export function computeLinkBudget(params: LinkBudgetParams) {
  const distanceKm = params.distanceMeters / 1000;
  const fspl = calculateFSPL(params.frequencyGhz, params.distanceMeters);
  const atmLoss = calculateAtmosphericLoss(params.frequencyGhz, distanceKm, params.humidityPercent);
  const rainLoss = calculateRainLoss(params.frequencyGhz, params.rainRateMmHr, distanceKm);
  const totalPathLoss = fspl + atmLoss + rainLoss;

  const eirpDbm = params.txPowerDbm + params.txAntennaGainDbi;
  const receivedPowerDbm = eirpDbm - totalPathLoss + params.rxAntennaGainDbi;

  // Thermal noise: N = -174 dBm/Hz + 10*log10(B) + NF
  const thermalNoiseDbm = -174 + 10 * Math.log10(params.bandwidthMhz * 1e6) + params.noiseFigureDb;
  const snrDb = receivedPowerDbm - thermalNoiseDbm;

  // Shannon capacity with MIMO layers: C = MIMO * B * log2(1 + 10^(SNR/10))
  const linearSnr = Math.max(0.0001, Math.pow(10, snrDb / 10));
  const spectralEfficiency = Math.log2(1 + linearSnr);
  const capacityGbps = (params.mimoLayers * (params.bandwidthMhz * 1e6) * spectralEfficiency) / 1e9;

  return {
    fspl: Number(fspl.toFixed(2)),
    atmLoss: Number(atmLoss.toFixed(2)),
    rainLoss: Number(rainLoss.toFixed(2)),
    totalPathLoss: Number(totalPathLoss.toFixed(2)),
    eirpDbm: Number(eirpDbm.toFixed(2)),
    receivedPowerDbm: Number(receivedPowerDbm.toFixed(2)),
    thermalNoiseDbm: Number(thermalNoiseDbm.toFixed(2)),
    snrDb: Number(snrDb.toFixed(2)),
    spectralEfficiency: Number(spectralEfficiency.toFixed(2)),
    capacityGbps: Number(capacityGbps.toFixed(2)),
  };
}

// ISAC (Integrated Sensing and Communication) Radar Metric Calculator
export function computeIsacMetrics(bandwidthGhz: number, carrierFreqGhz: number, targetVelocityKmh = 120) {
  const bandwidthHz = bandwidthGhz * 1e9;
  // Range Resolution: delta R = c / (2 * B)
  const rangeResolutionMeters = SPEED_OF_LIGHT / (2 * bandwidthHz);
  const rangeResolutionCm = rangeResolutionMeters * 100;

  // Doppler Shift: f_d = 2 * v / lambda
  const wavelengthMeters = SPEED_OF_LIGHT / (carrierFreqGhz * 1e9);
  const velocityMs = (targetVelocityKmh * 1000) / 3600;
  const dopplerShiftHz = (2 * velocityMs) / wavelengthMeters;

  // Max Unambiguous Range (assuming PRI = 10 us)
  const priSeconds = 10e-6;
  const maxRangeKm = (SPEED_OF_LIGHT * priSeconds) / 2 / 1000;

  return {
    rangeResolutionCm: Number(rangeResolutionCm.toFixed(2)),
    dopplerShiftKhz: Number((dopplerShiftHz / 1000).toFixed(2)),
    wavelengthMm: Number((wavelengthMeters * 1000).toFixed(3)),
    maxRangeKm: Number(maxRangeKm.toFixed(1)),
  };
}
