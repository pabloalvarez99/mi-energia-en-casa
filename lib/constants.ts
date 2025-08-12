import type { ApplianceDefinition } from './types'

export const REGIONS = {
  'XV': { name: 'Arica y Parinacota' },
  'I': { name: 'Tarapacá' },
  'II': { name: 'Antofagasta' },
  'III': { name: 'Atacama' },
  'IV': { name: 'Coquimbo' },
  'V': { name: 'Valparaíso' },
  'RM': { name: 'Metropolitana' },
  'VI': { name: 'O\'Higgins' },
  'VII': { name: 'Maule' },
  'VIII': { name: 'Biobío' },
  'IX': { name: 'La Araucanía' },
  'XIV': { name: 'Los Ríos' },
  'X': { name: 'Los Lagos' },
  'XI': { name: 'Aysén' },
  'XII': { name: 'Magallanes' },
} as const

// Estimaciones actualizadas basadas en tarifas 2024
export const electricityCostCLPPerKwhByRegion: Record<keyof typeof REGIONS, number> = {
  XV: 195,
  I: 190,
  II: 185,
  III: 180,
  IV: 185,
  V: 190,
  RM: 195,
  VI: 190,
  VII: 185,
  VIII: 180,
  IX: 175,
  XIV: 175,
  X: 170,
  XI: 165,
  XII: 165,
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
  // Refrigeración y preservación
  refrigerator: { name: '🧊 Refrigerador (2 puertas)', watts: 150 },
  refrigerator_small: { name: '🧊 Refrigerador pequeño', watts: 100 },
  freezer: { name: '❄️ Congelador horizontal', watts: 200 },
  wine_cooler: { name: '🍷 Cava de vinos', watts: 80 },
  
  // Cocina y preparación de alimentos
  microwave: { name: '📱 Microondas', watts: 1200 },
  oven_electric: { name: '🔥 Horno eléctrico', watts: 2500 },
  induction_cooktop: { name: '🔥 Anafe inducción', watts: 2000 },
  electric_cooktop: { name: '🔥 Anafe eléctrico', watts: 1800 },
  kettle: { name: '🫖 Hervidor eléctrico', watts: 2000 },
  coffee_maker: { name: '☕ Cafetera eléctrica', watts: 1000 },
  blender: { name: '🥤 Licuadora', watts: 400 },
  food_processor: { name: '🥕 Procesador de alimentos', watts: 600 },
  toaster: { name: '🍞 Tostador', watts: 800 },
  rice_cooker: { name: '🍚 Arrocera', watts: 300 },
  air_fryer: { name: '🍟 Freidora de aire', watts: 1400 },
  
  // Lavado y secado
  washing_machine: { name: '👕 Lavadora', watts: 500 },
  washing_machine_efficient: { name: '👕 Lavadora eficiente A+++', watts: 200 },
  dryer: { name: '🌪️ Secadora', watts: 2500 },
  dishwasher: { name: '🍽️ Lavavajillas', watts: 1800 },
  
  // Climatización
  ac_split: { name: '❄️ Aire acondicionado split', watts: 1200 },
  ac_portable: { name: '❄️ Aire acondicionado portátil', watts: 1000 },
  heater_resistance: { name: '🔥 Estufa eléctrica', watts: 2000 },
  heat_pump: { name: '🔥 Bomba de calor', watts: 800 },
  fan: { name: '💨 Ventilador', watts: 50 },
  ceiling_fan: { name: '💨 Ventilador de techo', watts: 75 },
  
  // Entretenimiento y electrónicos
  tv: { name: '📺 Televisor LED 32"', watts: 100 },
  tv_large: { name: '📺 Televisor LED 55"', watts: 150 },
  tv_oled: { name: '📺 Televisor OLED 55"', watts: 120 },
  sound_system: { name: '🔊 Equipo de sonido', watts: 200 },
  gaming_console: { name: '🎮 Consola de videojuegos', watts: 150 },
  
  // Computación
  computer: { name: '💻 Computador de escritorio', watts: 200 },
  laptop: { name: '💻 Notebook', watts: 60 },
  monitor: { name: '🖥️ Monitor LED 24"', watts: 25 },
  printer: { name: '🖨️ Impresora láser', watts: 400 },
  router: { name: '📡 Router WiFi', watts: 10 },
  
  // Iluminación
  incandescent_bulb: { name: '💡 Ampolleta incandescente 60W', watts: 60 },
  led_bulb: { name: '💡 Ampolleta LED 9W', watts: 9 },
  led_bulb_smart: { name: '💡 Ampolleta LED inteligente', watts: 10 },
  fluorescent_tube: { name: '💡 Tubo fluorescente', watts: 36 },
  
  // Cuidado personal
  hair_dryer: { name: '💇 Secador de pelo', watts: 1800 },
  hair_straightener: { name: '💇 Plancha de pelo', watts: 200 },
  electric_toothbrush: { name: '🦷 Cepillo eléctrico (carga)', watts: 2 },
  
  // Limpieza
  vacuum: { name: '🧹 Aspiradora', watts: 800 },
  vacuum_robot: { name: '🤖 Aspiradora robot', watts: 30 },
  iron: { name: '👔 Plancha', watts: 1200 },
  
  // Otros aparatos
  water_heater_electric: { name: '🚿 Calefón eléctrico', watts: 3000 },
  water_pump: { name: '💧 Bomba de agua', watts: 750 },
  garage_door: { name: '🚪 Portón automático', watts: 300 },
  security_system: { name: '🔒 Sistema de seguridad', watts: 50 },
  
  // Carga de dispositivos
  phone_charger: { name: '📱 Cargador de celular', watts: 5 },
  tablet_charger: { name: '📱 Cargador de tablet', watts: 10 },
  laptop_charger: { name: '💻 Cargador de notebook', watts: 65 },
} 