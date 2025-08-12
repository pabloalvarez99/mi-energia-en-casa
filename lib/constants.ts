import type { ApplianceDefinition } from './types'

export const REGIONS = {
  'XV': { name: 'Arica y Parinacota' },
  'I': { name: 'Tarapacá' },
  'II': { name: 'Antofagasta' },
  'III': { name: 'Atacama' },
  'IV': { name: 'Coquimbo' },
  'V': { name: 'Valparaíso' },
  'RM': { name: 'Metropolitana' },
  'VI': { name: 'O’Higgins' },
  'VII': { name: 'Maule' },
  'VIII': { name: 'Biobío' },
  'IX': { name: 'La Araucanía' },
  'XIV': { name: 'Los Ríos' },
  'X': { name: 'Los Lagos' },
  'XI': { name: 'Aysén' },
  'XII': { name: 'Magallanes' },
} as const

// Estimaciones base, se pueden ajustar
export const electricityCostCLPPerKwhByRegion: Record<keyof typeof REGIONS, number> = {
  XV: 190,
  I: 185,
  II: 180,
  III: 175,
  IV: 180,
  V: 185,
  RM: 190,
  VI: 185,
  VII: 180,
  VIII: 175,
  IX: 170,
  XIV: 170,
  X: 165,
  XI: 160,
  XII: 160,
}

export const carbonFactorKgPerKwhByRegion: Record<keyof typeof REGIONS, number> = {
  XV: 0.32,
  I: 0.35,
  II: 0.38,
  III: 0.30,
  IV: 0.28,
  V: 0.27,
  RM: 0.25,
  VI: 0.26,
  VII: 0.27,
  VIII: 0.29,
  IX: 0.24,
  XIV: 0.23,
  X: 0.22,
  XI: 0.20,
  XII: 0.18,
}

export const APPLIANCES: Record<string, ApplianceDefinition> = {
  refrigerator: { name: 'Refrigerador', watts: 150 },
  tv: { name: 'Televisor', watts: 100 },
  kettle: { name: 'Hervidor', watts: 2000 },
  washing_machine: { name: 'Lavadora', watts: 500 },
  dryer: { name: 'Secadora', watts: 2500 },
  microwave: { name: 'Microondas', watts: 1200 },
  computer: { name: 'Computador', watts: 200 },
  laptop: { name: 'Notebook', watts: 60 },
  incandescent_bulb: { name: 'Ampolleta incandescente', watts: 60 },
  led_bulb: { name: 'Ampolleta LED', watts: 9 },
  fan: { name: 'Ventilador', watts: 50 },
  ac_split: { name: 'Aire acondicionado (split)', watts: 1200 },
  heater_resistance: { name: 'Estufa resistiva', watts: 2000 },
  vacuum: { name: 'Aspiradora', watts: 800 },
} 